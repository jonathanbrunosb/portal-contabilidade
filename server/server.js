#!/usr/bin/env node
// Minimal live-data backend for the portal (Fase 2 do roadmap).
//
// Reads and writes the SAME JSON files the static frontend falls back to
// (js/data-service.js, data/*.json) — there is one source of truth on disk
// whether the portal is served with or without this backend running.
//
// No authentication. This is a UX/governance upgrade (an audit trail and a
// validated write path instead of hand-editing JSON), not a security
// boundary — do not expose this beyond localhost or a trusted internal
// network without adding real authentication and authorization first. See
// the "Backend opcional" section of README.md.
'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const HOST = process.env.PORTAL_API_HOST || '127.0.0.1';
const PORT = Number(process.env.PORTAL_API_PORT) || 8787;
const DATA_DIR = process.env.PORTAL_DATA_DIR || path.join(__dirname, '..', 'data');
const AUDIT_LOG = process.env.PORTAL_AUDIT_LOG || path.join(__dirname, 'audit.log');
const ALLOWED_ORIGIN = process.env.PORTAL_ALLOWED_ORIGIN || '*';
const MAX_BODY_BYTES = 2_000_000;

// Arrays of records, each with a unique "id" (matches js/data-service.js).
const LIST_COLLECTIONS = ['usuarios', 'newsletter', 'noticias', 'equipes', 'processos', 'sistemas', 'agenda', 'documentos', 'entregas'];
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
const EDITORIAL_STATUSES = ['Rascunho', 'Em revisão', 'Publicado', 'Recusado'];

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
    'Access-Control-Allow-Headers': 'Content-Type,X-Autor'
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
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      if (!body || typeof body.id !== 'string' || !body.id.trim()) {
        send(res, 400, { erro: 'Corpo inválido: informe um "id" (texto, sem ":").' });
        return;
      }
      if (body.id.includes(':')) { send(res, 400, { erro: 'O id não pode conter ":".' }); return; }
      if (items.some(i => i.id === body.id)) { send(res, 409, { erro: 'Já existe um registro com este id.' }); return; }
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
