// Local-only usage analytics: events stay in this browser (localStorage) until an
// API exists to aggregate them across the team (see the note in data-service.js).
// Nothing here is sent to a server. No matrícula, name or free text beyond the
// search term itself is stored.
const KEY = 'portal-analytics';
const MAX_EVENTS = 400;
let enabled = true;

function readLog() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }
  catch {
    return [];
  }
}
function writeLog(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }
  catch {
    /* Storage may be blocked by corporate browser policy. */
  }
}
export function setAnalyticsEnabled(value) {
  enabled = value;
}
export function track(type, detail = {}) {
  if (!enabled) return;
  const events = readLog();
  events.push({ ts: Date.now(), type, ...detail });
  writeLog(events);
}
function top(events, type, field, limit = 5) {
  const counts = new Map();
  events.filter(ev => ev.type === type && ev[field]).forEach(ev => {
    counts.set(ev[field], (counts.get(ev[field]) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}
export function summary() {
  const events = readLog();
  const byType = {};
  events.forEach(ev => { byType[ev.type] = (byType[ev.type] || 0) + 1; });
  return {
    total: events.length,
    sessoes: byType.session_start || 0,
    topAbas: top(events, 'tab_view', 'tab'),
    topSistemas: top(events, 'system_access', 'sistema'),
    topBuscas: top(events, 'search', 'query'),
    topDocumentos: top(events, 'document_download', 'documento'),
    topRegistros: top(events, 'record_view', 'label')
  };
}
export function exportAnalytics() {
  const blob = new Blob([JSON.stringify(readLog(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portal-uso-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export function clearAnalytics() {
  try {
    localStorage.removeItem(KEY);
  }
  catch {
    /* Storage may be blocked by corporate browser policy. */
  }
}
