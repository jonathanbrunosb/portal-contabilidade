#!/usr/bin/env node
// Minimal live-data backend for the portal (Fase 2 do roadmap).
//
// Reads and writes the SAME JSON files the static frontend falls back to
// (js/data-service.js, data/*.json) — there is one source of truth on disk
// whether the portal is served with or without this backend running.
//
// Authentication: a single shared token (PORTAL_ADMIN_TOKEN), required on every
// write (POST/PUT/DELETE/_upload) when set. This is a shared-secret gate, not
// individual accounts — it stops an unauthenticated stranger on the network
// from writing, but does not tell two token-holders apart (both show up in
// the audit log as whatever X-Autor they send, self-reported, not verified).
// If the env var is left unset, writes stay open (matches the original Fase 2
// behavior) — set it before letting anyone but you reach this server. See the
// "Backend opcional" section of README.md for the full caveat.
'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const HOST = process.env.PORTAL_API_HOST || '127.0.0.1';
const PORT = Number(process.env.PORTAL_API_PORT) || 8787;
const DATA_DIR = process.env.PORTAL_DATA_DIR || path.join(__dirname, '..', 'data');
const ASSETS_USERS_DIR = process.env.PORTAL_ASSETS_USERS_DIR || path.join(__dirname, '..', 'assets', 'users');
const AUDIT_LOG = process.env.PORTAL_AUDIT_LOG || path.join(__dirname, 'audit.log');
const ALLOWED_ORIGIN = process.env.PORTAL_ALLOWED_ORIGIN || '*';
const ADMIN_TOKEN = process.env.PORTAL_ADMIN_TOKEN || '';
const MAX_BODY_BYTES = 2_000_000;
const MAX_UPLOAD_BYTES = 5_000_000;
const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

function isAuthorized(req) {
  return !ADMIN_TOKEN || req.headers['x-admin-token'] === ADMIN_TOKEN;
}
function safeAssetFilename(rawName, fallbackExt) {
  const noAccents = String(rawName || 'foto').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ext = (path.extname(noAccents).slice(1) || fallbackExt || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const stem = path.basename(noAccents, path.extname(noAccents)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'foto';
  return { filename: `${stem}.${ext}`, ext };
}

// Arrays of records, each with a unique "id" (matches js/data-service.js).
const LIST_COLLECTIONS = ['usuarios', 'newsletter', 'noticias', 'equipes', 'processos', 'sistemas', 'automacoes', 'agenda', 'documentos', 'entregas'];
// Singleton objects (KPIs, menu, links). Read-only for now: writing config
// safely needs schema validation per field, left for a later pass.
const SINGLETON_COLLECTIONS = ['config'];

// Fase 4 — governança editorial: newsletter e notícias seguem um fluxo
// Rascunho → Em revisão → Publicado (com desvio para Recusado). A única
// regra dura, porque é a que fecha o risco identificado na Fase 1 (conteúdo
// regulatório publicado sem trilha de aprovação): não se chega a "Publicado"
// sem um aprovador de registro. O restante do fluxo fica permissivo de
// propósito — isto não é uma máquina de estados completa, é o controle que
// mais importava para este caso de uso.
const EDITORIAL_COLLECTIONS = ['newsletter', 'noticias'];
const EDITORIAL_STATUSES = ['Rascunho', 'Em revisão', 'Publicado', 'Recusado', 'Substituído'];
// Imagens importadas do AI Studio: somente PNG, pasta própria, nome normalizado.
const ASSETS_CONTENT_DIR = process.env.PORTAL_ASSETS_CONTENT_DIR || path.join(__dirname, '..', 'assets', 'images', 'ai-studio');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_CONTENT_IMAGE_BYTES = 20_000_000;

function applyEditorialTransition(collection, current, incoming, autor) {
  if (!EDITORIAL_COLLECTIONS.includes(collection)) return null;
  const novoStatus = incoming.status;
  if (novoStatus === undefined) return null;
  if (!EDITORIAL_STATUSES.includes(novoStatus)) {
    return `Status inválido: "${novoStatus}". Use um de: ${EDITORIAL_STATUSES.join(', ')}.`;
  }
  // Validado sempre que "status" aparece no corpo, mesmo reafirmando o status
  // atual — do contrário, editar o conteúdo de um item já Publicado incluindo
  // status:"Publicado" no corpo passaria batido sem exigir aprovador.
  if (novoStatus === 'Publicado') {
    if (typeof incoming.aprovadoPor !== 'string' || !incoming.aprovadoPor.trim()) {
      return 'Publicar exige "aprovadoPor" (quem aprovou) no corpo da requisição.';
    }
    incoming.dataAprovacao = new Date().toISOString().slice(0, 10);
  }
  if (novoStatus === 'Recusado' && (typeof incoming.motivoRecusa !== 'string' || !incoming.motivoRecusa.trim())) {
    return 'Recusar exige "motivoRecusa" no corpo da requisição.';
  }
  if (novoStatus === current.status) return null;
  const historico = Array.isArray(current.historicoStatus) ? current.historicoStatus.slice() : [];
  historico.push({ de: current.status, para: novoStatus, autor, data: new Date().toISOString() });
  incoming.historicoStatus = historico;
  return null;
}

function filePathFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}
async function readCollection(collection) {
  return JSON.parse(await fs.readFile(filePathFor(collection), 'utf8'));
}
async function writeCollection(collection, data) {
  await fs.writeFile(filePathFor(collection), JSON.stringify(data, null, 2) + '\n', 'utf8');
}
async function appendAudit(entry) {
  try {
    await fs.appendFile(AUDIT_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', 'utf8');
  }
  catch {
    /* The audit trail is best-effort; a failure here must not block the API response. */
  }
}
function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Autor,X-Admin-Token'
  });
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new RangeError('Corpo da requisição excede o limite de 2MB.');
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const [root, collection, id] = url.pathname.split('/').filter(Boolean);
  const autor = req.headers['x-autor'] || 'Não informado';

  try {
    if (req.method === 'OPTIONS') {
      send(res, 204, null);
      return;
    }
    if (root !== 'api') {
      send(res, 404, { erro: 'Rota não encontrada.' });
      return;
    }
    if (collection === 'health') {
      send(res, 200, { status: 'ok', hora: new Date().toISOString() });
      return;
    }
    if (collection === '_audit') {
      if (req.method !== 'GET') { send(res, 405, { erro: 'Método não suportado.' }); return; }
      try {
        const raw = await fs.readFile(AUDIT_LOG, 'utf8');
        send(res, 200, raw.trim().split('\n').filter(Boolean).slice(-100).map(line => JSON.parse(line)));
      }
      catch {
        send(res, 200, []);
      }
      return;
    }
    if (collection === '_upload') {
      if (req.method !== 'POST') { send(res, 405, { erro: 'Método não suportado.' }); return; }
      if (!isAuthorized(req)) { send(res, 401, { erro: 'Token de administração ausente ou inválido.' }); return; }
      const { filename, ext } = safeAssetFilename(url.searchParams.get('filename'), (req.headers['content-type'] || '').split('/')[1]);
      if (url.searchParams.get('pasta') === 'conteudo') {
        if (ext !== 'png') { send(res, 400, { erro: 'Imagens de conteúdo importado aceitam somente PNG.' }); return; }
        const parts = [];
        let total = 0;
        for await (const chunk of req) {
          total += chunk.length;
          if (total > MAX_CONTENT_IMAGE_BYTES) { send(res, 413, { erro: 'Imagem excede o limite de 20MB.' }); return; }
          parts.push(chunk);
        }
        const buffer = Buffer.concat(parts);
        if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) { send(res, 400, { erro: 'O arquivo não é um PNG válido.' }); return; }
        await fs.mkdir(ASSETS_CONTENT_DIR, { recursive: true });
        await fs.writeFile(path.join(ASSETS_CONTENT_DIR, filename), buffer);
        await appendAudit({ acao: 'upload', colecao: 'assets/images/ai-studio', id: filename, autor });
        send(res, 201, { caminho: `assets/images/ai-studio/${filename}` });
        return;
      }
      if (!ALLOWED_IMAGE_EXT.includes(ext)) {
        send(res, 400, { erro: `Extensão de imagem não permitida. Use: ${ALLOWED_IMAGE_EXT.join(', ')}.` });
        return;
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_UPLOAD_BYTES) { send(res, 413, { erro: 'Arquivo excede o limite de 5MB.' }); return; }
        chunks.push(chunk);
      }
      await fs.mkdir(ASSETS_USERS_DIR, { recursive: true });
      await fs.writeFile(path.join(ASSETS_USERS_DIR, filename), Buffer.concat(chunks));
      await appendAudit({ acao: 'upload', colecao: 'assets/users', id: filename, autor });
      send(res, 201, { caminho: `assets/users/${filename}` });
      return;
    }
    if (SINGLETON_COLLECTIONS.includes(collection)) {
      if (req.method !== 'GET') { send(res, 405, { erro: 'Esta coleção é somente leitura nesta versão.' }); return; }
      send(res, 200, await readCollection(collection));
      return;
    }
    if (!LIST_COLLECTIONS.includes(collection)) {
      send(res, 404, { erro: `Coleção "${collection}" não existe.` });
      return;
    }

    const items = await readCollection(collection);

    if (req.method === 'GET' && !id) {
      send(res, 200, items);
      return;
    }
    if (req.method === 'GET' && id) {
      const item = items.find(i => String(i.id) === id);
      item ? send(res, 200, item) : send(res, 404, { erro: 'Registro não encontrado.' });
      return;
    }
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && !isAuthorized(req)) {
      send(res, 401, { erro: 'Token de administração ausente ou inválido.' });
      return;
    }
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      if (!body || typeof body.id !== 'string' || !body.id.trim()) {
        send(res, 400, { erro: 'Corpo inválido: informe um "id" (texto, sem ":").' });
        return;
      }
      if (body.id.includes(':')) { send(res, 400, { erro: 'O id não pode conter ":".' }); return; }
      if (items.some(i => i.id === body.id)) { send(res, 409, { erro: 'Já existe um registro com este id.' }); return; }
      // Idempotência da importação do AI Studio: uma versão aprovada entra uma única vez.
      if (body.aiStudio && items.some(i => i.aiStudio && i.aiStudio.versionId === body.aiStudio.versionId)) {
        send(res, 409, { erro: 'Esta versão do AI Studio já foi importada.' });
        return;
      }
      if (EDITORIAL_COLLECTIONS.includes(collection)) {
        // Criação sempre entra como Rascunho, mesmo que o corpo peça outro status:
        // sem isso, POST seria um atalho para publicar sem passar pela revisão.
        body.status = 'Rascunho';
        body.aprovadoPor = null;
        body.dataAprovacao = null;
        body.motivoRecusa = null;
        body.historicoStatus = [{ de: null, para: 'Rascunho', autor, data: new Date().toISOString() }];
      }
      items.push(body);
      await writeCollection(collection, items);
      await appendAudit({ acao: 'create', colecao: collection, id: body.id, autor });
      send(res, 201, body);
      return;
    }
    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      if (!body) { send(res, 400, { erro: 'Corpo inválido.' }); return; }
      const index = items.findIndex(i => String(i.id) === id);
      if (index === -1) { send(res, 404, { erro: 'Registro não encontrado.' }); return; }
      const erroTransicao = applyEditorialTransition(collection, items[index], body, autor);
      if (erroTransicao) { send(res, 400, { erro: erroTransicao }); return; }
      items[index] = { ...items[index], ...body, id: items[index].id };
      await writeCollection(collection, items);
      await appendAudit({ acao: 'update', colecao: collection, id, autor, ...(body.status ? { status: body.status } : {}) });
      send(res, 200, items[index]);
      return;
    }
    if (req.method === 'DELETE' && id) {
      const index = items.findIndex(i => String(i.id) === id);
      if (index === -1) { send(res, 404, { erro: 'Registro não encontrado.' }); return; }
      const [removed] = items.splice(index, 1);
      await writeCollection(collection, items);
      await appendAudit({ acao: 'delete', colecao: collection, id, autor });
      send(res, 200, removed);
      return;
    }
    send(res, 405, { erro: 'Método não suportado para esta rota.' });
  }
  catch (error) {
    if (error instanceof SyntaxError) { send(res, 400, { erro: 'JSON inválido no corpo da requisição.' }); return; }
    if (error instanceof RangeError) { send(res, 413, { erro: error.message }); return; }
    if (error.code === 'ENOENT') { send(res, 404, { erro: 'Coleção sem arquivo correspondente.' }); return; }
    send(res, 500, { erro: 'Falha ao processar a solicitação.', detalhe: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`API do portal em http://${HOST}:${PORT}/api (dados: ${DATA_DIR})`);
});
