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

async function withTimeout(run) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),API_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  }
  finally {
    clearTimeout(timer);
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
