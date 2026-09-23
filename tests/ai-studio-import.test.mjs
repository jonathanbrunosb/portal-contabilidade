// Testes da importação de pacotes do AI Studio. Executar: node --test tests/
// O pacote em fixtures/ foi gerado pelo próprio AI Studio (tests/publication-package.test.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, writeFile, mkdir, readFile as read } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readZip, validatePackage, findExisting, toPortalItem, validateManifest } from '../js/ai-studio-import.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const zip = new Uint8Array(await readFile(path.join(here, 'fixtures', 'pacote-exemplo.zip')));
const publicKey = (await readFile(path.join(here, 'fixtures', 'chave-publica.txt'), 'utf8')).trim();

test('pacote válido do AI Studio é aceito com origem verificada', async () => {
  const files = await readZip(zip);
  const result = await validatePackage(files, { publicKeySpki: publicKey, requireSignature: true });
  assert.deepEqual(result.errors, []);
  assert.equal(result.origin, 'verified');
  const item = toPortalItem(result.manifest, { imagePath: 'assets/images/ai-studio/x.png', origin: result.origin });
  assert.equal(item.status, 'Em revisão');
  assert.equal(item.aprovadoPor, null);
  assert.equal(item.aiStudio.versionId, result.manifest.version_id);
});

test('sem chave pública a origem fica não verificável (confirmação manual)', async () => {
  const result = await validatePackage(await readZip(zip), {});
  assert.equal(result.ok, true);
  assert.equal(result.origin, 'unverifiable');
  assert.ok(result.warnings.length > 0);
});

test('pacote alterado é bloqueado', async () => {
  const tampered = zip.slice();
  const index = Buffer.from(tampered).indexOf('"title"');
  tampered[index + 10] ^= 0x01;
  await assert.rejects(readZip(tampered), /CRC|corrompido|JSON/);
});

test('arquivo que não é ZIP e nomes com caminho são recusados', async () => {
  await assert.rejects(readZip(new TextEncoder().encode('não é zip')), /ZIP/);
  const bad = zip.slice();
  const name = Buffer.from(bad).lastIndexOf('manifest.json');
  bad.set(new TextEncoder().encode('../anifest.js'), name);
  await assert.rejects(readZip(bad), /não permitido|corrompido/);
});

test('manifesto com URL executável e categoria inválida é rejeitado', () => {
  const errors = validateManifest({ schema_version: '1.0', publication_id: 'x', content_id: 'x', version_id: 'x', title: 'T', category: 'hack', destination: {}, source_url: 'javascript:alert(1)', image: {}, approval: {} });
  assert.ok(errors.some(error => error.includes('source_url')));
  assert.ok(errors.some(error => error.includes('Categoria')));
});

test('importação duplicada e substituição são identificadas', async () => {
  const { manifest } = await validatePackage(await readZip(zip), {});
  const item = toPortalItem(manifest, { imagePath: 'x.png' });
  assert.equal(findExisting([item], manifest).kind, 'duplicate');
  const older = { ...item, id: 'ais-antigo-v1', aiStudio: { ...item.aiStudio, versionId: 'outra-versao' } };
  assert.equal(findExisting([older], manifest).kind, 'replaces');
});

test('backend opcional: aceita PNG, recusa não-PNG e impede importar a mesma versão duas vezes', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'portal-'));
  const dataDir = path.join(dir, 'data');
  await mkdir(dataDir);
  await writeFile(path.join(dataDir, 'newsletter.json'), '[]');
  const port = 18000 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, [path.join(here, '..', 'server', 'server.js')], {
    env: { ...process.env, PORTAL_API_PORT: String(port), PORTAL_DATA_DIR: dataDir, PORTAL_ASSETS_CONTENT_DIR: path.join(dir, 'img'), PORTAL_AUDIT_LOG: path.join(dir, 'audit.log'), PORTAL_ADMIN_TOKEN: 'segredo-teste' },
    stdio: 'ignore'
  });
  try {
    const base = `http://127.0.0.1:${port}/api`;
    for (let i = 0; i < 50; i++) { try { await fetch(`${base}/health`); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
    const headers = { 'X-Admin-Token': 'segredo-teste' };
    const files = await readZip(zip);
    const { manifest, image } = await validatePackage(files, {});
    const noToken = await fetch(`${base}/_upload?pasta=conteudo&filename=a.png`, { method: 'POST', body: image });
    assert.equal(noToken.status, 401);
    const notPng = await fetch(`${base}/_upload?pasta=conteudo&filename=a.png`, { method: 'POST', headers, body: '<svg onload=alert(1)>' });
    assert.equal(notPng.status, 400);
    const ok = await fetch(`${base}/_upload?pasta=conteudo&filename=../../evil.png`, { method: 'POST', headers, body: image });
    assert.equal(ok.status, 201);
    assert.match((await ok.json()).caminho, /^assets\/images\/ai-studio\/evil\.png$/);
    const item = toPortalItem(manifest, { imagePath: 'assets/images/ai-studio/evil.png' });
    const post = body => fetch(`${base}/newsletter`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await post(item)).status, 201);
    assert.equal((await post({ ...item, id: 'outro-id' })).status, 409);
    const stored = JSON.parse(await read(path.join(dataDir, 'newsletter.json'), 'utf8'));
    assert.equal(stored.length, 1);
    assert.equal(stored[0].status, 'Rascunho');
  }
  finally {
    server.kill();
    await rm(dir, { recursive: true, force: true });
  }
});
