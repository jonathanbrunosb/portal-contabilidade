// Importação de pacotes gerados pela Central de Publicações do AI Studio.
// Sem dependências: lê o ZIP no navegador, confere CRC32, SHA-256 e (quando
// configurada) a assinatura ECDSA P-256 do manifest.json com a chave PÚBLICA
// do AI Studio. Nada do pacote é executado: textos são tratados como dados e
// escapados na renderização (ui.js/escapeHTML); só PNG é aceito como imagem.
// O resultado é sempre um item "Em revisão" — publicar continua exigindo a
// aprovação no Painel Editorial.

export const PACKAGE_LIMITS = {
  zipBytes: 30 * 1024 * 1024,
  imageBytes: 20 * 1024 * 1024,
  manifestBytes: 256 * 1024,
  entries: 8
};
const ALLOWED_EXTRA = new Set(['README.txt', 'manifest.sig']);
const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CATEGORIES = ['internal_communication', 'accounting_newsletter', 'system_announcement', 'internal_campaign'];
const COLLECTIONS = ['newsletter', 'noticias'];

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador não descompacta arquivos ZIP compactados. Use o pacote original do AI Studio.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Lê o ZIP pelo diretório central, recusando nomes com caminhos, entradas extras e tamanhos acima do limite. */
export async function readZip(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length > PACKAGE_LIMITS.zipBytes) throw new Error('O pacote excede o limite de 30 MB.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Arquivo não é um pacote ZIP válido.');
  const count = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (count === 0 || count > PACKAGE_LIMITS.entries) throw new Error('Quantidade de arquivos incompatível com um pacote do AI Studio.');
  if (centralOffset + centralSize > eocd) throw new Error('Estrutura do ZIP inconsistente.');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const files = new Map();
  let pointer = centralOffset;
  for (let index = 0; index < count; index++) {
    if (view.getUint32(pointer, true) !== 0x02014b50) throw new Error('Diretório do ZIP corrompido.');
    const flags = view.getUint16(pointer + 8, true);
    const method = view.getUint16(pointer + 10, true);
    const crc = view.getUint32(pointer + 16, true);
    const compressed = view.getUint32(pointer + 20, true);
    const size = view.getUint32(pointer + 24, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));
    pointer += 46 + nameLength + extraLength + commentLength;
    if (flags & 0x1) throw new Error('Pacotes criptografados não são aceitos.');
    if (!SAFE_NAME.test(name) || name.includes('..')) throw new Error(`Nome de arquivo não permitido no pacote: "${name}".`);
    if (files.has(name)) throw new Error(`Arquivo duplicado no pacote: "${name}".`);
    if (![0, 8].includes(method)) throw new Error(`Método de compressão não suportado em "${name}".`);
    if (size > PACKAGE_LIMITS.imageBytes) throw new Error(`"${name}" excede o limite de tamanho.`);
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Cabeçalho local do ZIP inválido.');
    const localName = view.getUint16(localOffset + 26, true);
    const localExtra = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localName + localExtra;
    if (start + compressed > centralOffset) throw new Error('Conteúdo do ZIP fora dos limites.');
    const raw = bytes.slice(start, start + compressed);
    const data = method === 0 ? raw : await inflateRaw(raw);
    if (data.length !== size || crc32(data) !== crc) throw new Error(`Arquivo "${name}" corrompido (CRC).`);
    files.set(name, data);
  }
  return files;
}

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function pngInfo(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || signature.some((value, i) => bytes[i] !== value)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR') return null;
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function verifySignature(manifestBytes, sigBytes, publicKeySpki) {
  try {
    const sig = JSON.parse(new TextDecoder().decode(sigBytes));
    if (sig.algorithm !== 'ECDSA-P256-SHA256' || typeof sig.signature !== 'string') return false;
    const key = await crypto.subtle.importKey('spki', base64ToBytes(publicKeySpki), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, base64ToBytes(sig.signature), manifestBytes);
  }
  catch {
    return false;
  }
}

const str = (value, max, required = false) => {
  if (value === null || value === undefined || value === '') return required ? null : '';
  return typeof value === 'string' && value.length <= max ? value : null;
};
const isHttp = value => {
  if (value === null || value === undefined) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  }
  catch {
    return false;
  }
};
const isDate = value => value === null || value === undefined || /^\d{4}-\d{2}-\d{2}$/.test(value);

export function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['Manifesto não é um objeto JSON.'];
  if (manifest.schema_version !== '1.0') errors.push(`Versão de manifesto não suportada: ${String(manifest.schema_version)}.`);
  for (const key of ['publication_id', 'content_id', 'version_id']) if (!UUID.test(String(manifest[key] || ''))) errors.push(`Campo ${key} inválido.`);
  if (str(manifest.title, 200, true) === null) errors.push('Título ausente ou longo demais.');
  for (const [key, max] of [['subtitle', 300], ['summary', 600], ['description', 8000], ['source_name', 200], ['system_name', 200], ['functionality', 600], ['institutional_owner', 200], ['category_label', 80]]) {
    if (str(manifest[key], max) === null) errors.push(`Campo ${key} inválido.`);
  }
  if (!CATEGORIES.includes(manifest.category)) errors.push('Categoria desconhecida.');
  const destination = manifest.destination || {};
  if (!COLLECTIONS.includes(destination.portal_collection)) errors.push('Destino do portal inválido.');
  if (str(destination.portal_category, 80, true) === null || str(destination.label, 160, true) === null) errors.push('Categoria de destino inválida.');
  if (!isDate(manifest.reference_date)) errors.push('Data de referência inválida.');
  for (const key of ['source_url', 'access_url']) if (!isHttp(manifest[key])) errors.push(`${key} não é um endereço HTTP(S).`);
  const image = manifest.image || {};
  if (!SAFE_NAME.test(String(image.filename || '')) || !/\.png$/i.test(image.filename) || image.format !== 'png') errors.push('Imagem declarada inválida (somente PNG).');
  if (!/^[0-9a-f]{64}$/.test(String(image.sha256 || ''))) errors.push('Hash da imagem ausente.');
  const approval = manifest.approval || {};
  if (approval.version_id !== manifest.version_id || !Number.isInteger(approval.version_number) || !approval.approved_at) errors.push('Dados de aprovação inconsistentes.');
  return errors;
}

/**
 * Valida o pacote completo. `options.publicKeySpki` (base64 SPKI) vem de data/config.json → aiStudio.
 * Retorna { ok, errors, warnings, origin: 'verified'|'unsigned'|'invalid'|'unverifiable', manifest, image }.
 */
export async function validatePackage(files, options = {}) {
  const errors = [];
  const warnings = [];
  const manifestBytes = files.get('manifest.json');
  const checksumBytes = files.get('checksums.sha256');
  if (!manifestBytes) return { ok: false, errors: ['manifest.json ausente.'], warnings };
  if (manifestBytes.length > PACKAGE_LIMITS.manifestBytes) return { ok: false, errors: ['manifest.json excede o limite.'], warnings };
  let manifest;
  try {
    manifest = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(manifestBytes));
  }
  catch {
    return { ok: false, errors: ['manifest.json não é um JSON válido.'], warnings };
  }
  errors.push(...validateManifest(manifest));
  const imageName = manifest?.image?.filename;
  const expected = new Set(['manifest.json', 'checksums.sha256', imageName]);
  for (const name of files.keys()) if (!expected.has(name) && !ALLOWED_EXTRA.has(name)) errors.push(`Arquivo inesperado no pacote: "${name}".`);
  if (!checksumBytes) errors.push('checksums.sha256 ausente.');
  const image = imageName ? files.get(imageName) : null;
  if (!image) errors.push('Imagem declarada no manifesto não foi encontrada no pacote.');
  if (errors.length) return { ok: false, errors, warnings, manifest };

  const info = pngInfo(image);
  if (!info) errors.push('A imagem não é um PNG válido.');
  else if (info.width !== manifest.image.width || info.height !== manifest.image.height) errors.push('Dimensões da imagem diferem do manifesto.');
  if (image.length !== manifest.image.bytes) errors.push('Tamanho da imagem difere do manifesto.');
  const imageHash = await sha256Hex(image);
  const manifestHash = await sha256Hex(manifestBytes);
  if (imageHash !== manifest.image.sha256) errors.push('Hash SHA-256 da imagem não confere (arquivo alterado).');
  const lines = new TextDecoder().decode(checksumBytes).trim().split(/\r?\n/).map(line => line.trim().split(/\s+/));
  const listed = Object.fromEntries(lines.filter(parts => parts.length === 2).map(([hash, name]) => [name, hash]));
  if (listed['manifest.json'] !== manifestHash) errors.push('Hash SHA-256 do manifesto não confere (arquivo alterado).');
  if (listed[imageName] !== imageHash) errors.push('checksums.sha256 não corresponde à imagem.');

  let origin = 'unverifiable';
  const sig = files.get('manifest.sig');
  if (options.publicKeySpki) {
    if (!sig) origin = 'unsigned';
    else origin = await verifySignature(manifestBytes, sig, options.publicKeySpki) ? 'verified' : 'invalid';
    if (origin === 'invalid') errors.push('Assinatura inválida: o pacote não foi gerado pelo AI Studio configurado ou foi alterado.');
    if (origin === 'unsigned' && options.requireSignature) errors.push('Pacote sem assinatura; o portal exige pacotes assinados pelo AI Studio.');
  }
  if (origin === 'unverifiable') warnings.push('A chave pública do AI Studio não está configurada no portal: a origem precisa ser confirmada manualmente pelo administrador.');
  if (origin === 'unsigned' && !options.requireSignature) warnings.push('Pacote sem assinatura: confirme a origem manualmente.');
  return { ok: errors.length === 0, errors, warnings, origin, manifest, image, manifestHash, imageHash };
}

/** Evita duplicidade e identifica substituições (mesmo conteúdo, outra versão). */
export function findExisting(items, manifest) {
  const sameVersion = items.find(item => item.aiStudio?.versionId === manifest.version_id);
  if (sameVersion) return { kind: 'duplicate', item: sameVersion };
  const previous = items.filter(item => item.aiStudio?.contentId === manifest.content_id && item.status !== 'Substituído');
  return previous.length ? { kind: 'replaces', items: previous } : null;
}

export function portalItemId(manifest) {
  return `ais-${manifest.version_id.slice(0, 8)}-v${manifest.approval.version_number}`;
}

/** Converte o manifesto em um item da coleção newsletter/noticias do portal, sempre "Em revisão". */
export function toPortalItem(manifest, { imagePath, categoria, nivelImpacto, areaResponsavel, autor, origin, replaces }) {
  const now = new Date().toISOString();
  const paragraphs = [manifest.description, manifest.functionality ? `Funcionalidade: ${manifest.functionality}` : '', manifest.access_url ? `Acesso: ${manifest.access_url}` : ''].filter(Boolean);
  return {
    id: portalItemId(manifest),
    categoria: categoria || manifest.destination.portal_category,
    titulo: manifest.title,
    resumo: manifest.summary || manifest.subtitle || manifest.title,
    conteudoCompleto: paragraphs.join('\n') || manifest.summary || manifest.title,
    dataPublicacao: manifest.reference_date || now.slice(0, 10),
    dataVigencia: null,
    fonte: manifest.source_name || manifest.institutional_owner || 'Gerência de Contabilidade',
    link: manifest.source_url || manifest.access_url || null,
    documento: null,
    empresasImpactadas: [],
    areaResponsavel: areaResponsavel || manifest.institutional_owner || 'Gerência de Contabilidade',
    responsavel: manifest.institutional_owner || 'Gerência de Contabilidade',
    nivelImpacto: nivelImpacto || 'Baixo',
    imagem: imagePath,
    imagemAlt: manifest.title,
    status: 'Em revisão',
    aprovadoPor: null,
    dataAprovacao: null,
    motivoRecusa: null,
    historicoStatus: [{ de: null, para: 'Em revisão', autor: autor || 'Importação AI Studio', data: now }],
    aiStudio: {
      publicationId: manifest.publication_id,
      contentId: manifest.content_id,
      versionId: manifest.version_id,
      versionNumber: manifest.approval.version_number,
      approvedAt: manifest.approval.approved_at,
      imageSha256: manifest.image.sha256,
      origem: origin,
      importadoEm: now,
      substitui: replaces || []
    }
  };
}
