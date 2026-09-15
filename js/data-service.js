// Views never fetch data directly: they always go through loadData(). This is
// the only module that knows whether data came from the live backend
// (server/server.js, Fase 2) or from the static JSON files — both expose the
// same shape, so the rest of the app doesn't need to care which one answered.
const collections=['usuarios','newsletter','noticias','equipes','processos','sistemas','agenda','documentos','entregas','config'];
// Opt-in: without window.PORTAL_API_ENABLED=true (see README "Backend opcional"),
// the portal never attempts the live backend — same zero-config static behavior
// as before, with no extra request and no connection-refused noise in the
// console for the majority of deployments that only run the file server.
const API_ENABLED=Boolean(window.PORTAL_API_ENABLED);
const API_PORT=window.PORTAL_API_PORT||8787;
const API_BASE=`${location.protocol}//${location.hostname}:${API_PORT}/api`;
const API_TIMEOUT_MS=800;
let apiAvailable=null;

async function withTimeout(run,ms=API_TIMEOUT_MS) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),ms);
  try {
    return await run(controller.signal);
  }
  finally {
    clearTimeout(timer);
  }
}
// Shared write token (server/server.js PORTAL_ADMIN_TOKEN): one secret gates
// every write, stored per-browser. It tells "can write" from "can't", not who
// is writing — X-Autor stays self-reported, same as before this existed.
const ADMIN_TOKEN_KEY='portal-admin-token';
export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY)||'';
  }
  catch {
    return '';
  }
}
export function setAdminToken(token) {
  try {
    token?localStorage.setItem(ADMIN_TOKEN_KEY,token):localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  catch {
    /* Storage may be blocked by corporate browser policy. */
  }
}
async function fetchStatic(name) {
  const response=await fetch(`data/${name}.json`, {
    cache:'no-cache'
  }
  );
  if(!response.ok)throw new Error(`Não foi possível carregar ${name}.json (${response.status}).`);
  return response.json();
}
async function fetchFromAPI(name,signal) {
  const response=await fetch(`${API_BASE}/${name}`, {
    signal,cache:'no-cache'
  }
  );
  if(!response.ok)throw new Error(`API respondeu ${response.status} para ${name}.`);
  return response.json();
}
async function checkAPI() {
  if(!API_ENABLED)return false;
  if(apiAvailable!==null)return apiAvailable;
  try {
    await withTimeout(signal=>fetch(`${API_BASE}/health`, {
      signal
    }
    ));
    apiAvailable=true;
  }
  catch {
    apiAvailable=false;
  }
  return apiAvailable;
}
export function isLiveDataSource() {
  return apiAvailable===true;
}
// Writes (create/update) always target the live backend: there is nowhere
// else to persist them. Callers (js/app.js) must check isLiveDataSource()
// before offering an editing action, and surface the thrown message when
// the API rejects a request (e.g. a governance rule in server/server.js).
export async function apiWrite(collection, { id, method='POST', body, autor } = {}) {
  if(!isLiveDataSource())throw new Error('O backend opcional não está ativo — ver README, "Backend opcional".');
  const url=`${API_BASE}/${collection}${id?`/${encodeURIComponent(id)}`:''}`;
  const response=await withTimeout(signal=>fetch(url, {
    method,signal,cache:'no-cache',
    headers: {
      'Content-Type':'application/json',...(autor?{'X-Autor':autor}:{}),...(getAdminToken()?{'X-Admin-Token':getAdminToken()}:{})
    }
    ,body:JSON.stringify(body)
  }
  ));
  const payload=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(payload?.erro||`A API recusou a requisição (${response.status}).`);
  return payload;
}
// Uploads a photo to server/server.js (assets/users/), returning its relative
// path for use as a "foto" field. Raw bytes, no multipart — both ends are
// ours, so there is no reason for that extra complexity.
const UPLOAD_TIMEOUT_MS=15000;
export async function apiUploadPhoto(file,{autor}= {}) {
  if(!isLiveDataSource())throw new Error('O backend opcional não está ativo — ver README, "Backend opcional".');
  const url=`${API_BASE}/_upload?filename=${encodeURIComponent(file.name)}`;
  const response=await withTimeout(signal=>fetch(url, {
    method:'POST',signal,cache:'no-cache',
    headers: {
      'Content-Type':file.type||'application/octet-stream',...(autor?{'X-Autor':autor}:{}),...(getAdminToken()?{'X-Admin-Token':getAdminToken()}:{})
    }
    ,body:file
  }
  ),UPLOAD_TIMEOUT_MS);
  const payload=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(payload?.erro||`A API recusou o upload (${response.status}).`);
  return payload.caminho;
}
export async function loadData() {
  const live=await checkAPI();
  const pairs=await Promise.all(collections.map(async name=> {
    if(live) {
      try {
        return [name,await withTimeout(signal=>fetchFromAPI(name,signal))];
      }
      catch {
        /* This collection failed on the live backend; fall back to its static file. */
      }
    }
    return [name,await fetchStatic(name)];
  }
  ));
  return Object.fromEntries(pairs);
}
