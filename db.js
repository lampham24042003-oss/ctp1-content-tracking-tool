// ── FIREBASE REST API ─────────────────────────────────────────────
const DB = 'https://tracking-content-tool-default-rtdb.firebaseio.com';

async function dbGet(path) {
  const r = await fetch(`${DB}/${path}.json`);
  return r.ok ? r.json() : null;
}
async function dbSet(path, data) {
  return fetch(`${DB}/${path}.json`, { method: 'PUT', body: JSON.stringify(data) });
}
async function dbPush(path, data) {
  const r = await fetch(`${DB}/${path}.json`, { method: 'POST', body: JSON.stringify(data) });
  const j = await r.json();
  return j.name;
}
async function dbPatch(path, data) {
  return fetch(`${DB}/${path}.json`, { method: 'PATCH', body: JSON.stringify(data) });
}
async function dbDelete(path) {
  return fetch(`${DB}/${path}.json`, { method: 'DELETE' });
}

// Real-time listener using SSE
let esrc = null;
function listenTasks(callback) {
  if (esrc) esrc.close();
  esrc = new EventSource(`${DB}/tasks.json`);
  esrc.addEventListener('put', e => {
    const { path, data } = JSON.parse(e.data);
    callback('put', path, data);
  });
  esrc.addEventListener('patch', e => {
    const { path, data } = JSON.parse(e.data);
    callback('patch', path, data);
  });
  esrc.onerror = () => setTimeout(() => listenTasks(callback), 3000);
}
function listenLogs(callback) {
  const es = new EventSource(`${DB}/logs.json`);
  es.addEventListener('put', e => {
    const { path, data } = JSON.parse(e.data);
    callback('put', path, data);
  });
  es.addEventListener('patch', e => {
    const { path, data } = JSON.parse(e.data);
    callback('patch', path, data);
  });
}

// Action log
async function writeLog(user, action, detail) {
  const entry = { user, action, detail, ts: Date.now() };
  await dbPush('logs', entry);
}
