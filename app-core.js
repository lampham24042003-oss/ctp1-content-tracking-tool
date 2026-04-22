// ── CONSTANTS ─────────────────────────────────────────────────────
const THEMES = [
  { id:'dark-neon', name:'Dark Neon', bg:'#0a0a1a', accent:'#7c6efa', emoji:'🌌' },
  { id:'winter',    name:'Winter',    bg:'#081828', accent:'#64b5f6', emoji:'❄️' },
  { id:'autumn',    name:'Autumn',    bg:'#1a0a00', accent:'#ff8c00', emoji:'🍂' },
  { id:'cherry',    name:'Cherry',    bg:'#1a0818', accent:'#f48fb1', emoji:'🌸' },
  { id:'midnight',  name:'Midnight',  bg:'#050508', accent:'#ffd740', emoji:'🌙' },
  { id:'forest',    name:'Forest',    bg:'#040d08', accent:'#4caf50', emoji:'🌿' },
  { id:'ocean',     name:'Ocean',     bg:'#020c18', accent:'#26c6da', emoji:'🌊' },
  { id:'sunset',    name:'Sunset',    bg:'#1a0510', accent:'#ff6b6b', emoji:'🌅' },
  { id:'minimal',   name:'Minimal',   bg:'#f5f5f7', accent:'#0071e3', emoji:'☀️' },
  { id:'cyberpunk', name:'Cyberpunk', bg:'#000005', accent:'#ff0090', emoji:'⚡' },
];
const ANIM_CONFIGS = {
  winter:   { type:'snow',   count:60 },
  autumn:   { type:'leaves', count:30 },
  cherry:   { type:'petals', count:40 },
  midnight: { type:'stars',  count:80 },
  forest:   { type:'dust',   count:50 },
  ocean:    { type:'bubbles',count:40 },
  sunset:   { type:'sparks', count:30 },
  'dark-neon':{ type:'particles', count:40 },
  cyberpunk:{ type:'glitch', count:20 },
  minimal:  { type:'none',   count:0  },
};
const ANIM_EMOJIS = { snow:'❄', leaves:'🍂', petals:'🌸', stars:'✦', dust:'·', bubbles:'○', sparks:'✦', particles:'·', glitch:'█' };
const FORMAT_OPTS = ['Video – ASMR / Sound-led','Video – Cinematic / Phim Ngắn','Video – UGC / Slice of Life','Video – Animation / Stop Motion','Video – Parody / Format Giả','Video – Skit / Hài','Video – POV / Action','Banner / Static Image','Carousel','Playable Ad','Khác'];
const FORMAT_TAG = v => v.startsWith('Video')?'VIDEO':v.startsWith('Banner')?'BANNER':v==='Carousel'?'CAROUSEL':v==='Playable Ad'?'PLAYABLE':'OTHER';
const STATUS_OPTS = ['Draft','In Progress','Done','Cancelled'];
const AI_OPTS = ['Claude','ChatGPT','DeepSeek','Gemini','GPT-4o','Lama','Mistral','Khác'];

// ── STATE ─────────────────────────────────────────────────────────
let currentUser = null;
let editMode = false;
let tasks = {};      // { firebaseKey: taskObj }
let sortState = { col: null, dir: 'asc' };
let filterState = { search:'', format:'', status:'', pic:'' };
let animEnabled = false;
let pendingDeleteKey = null;
let linkTargetCell = null; // { key, selection }
let sortable = null;

// ── USER SELECT ───────────────────────────────────────────────────
function selectUser(name) {
  currentUser = name;
  sessionStorage.setItem('ct_user', name);
  document.getElementById('user-modal').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  const badge = document.getElementById('user-badge');
  badge.textContent = name;
  badge.className = 'user-badge ' + (name === 'Lam' ? 'lam' : 'bao');
  writeLog(name, 'joined', 'Đăng nhập vào tool');
  initApp();
}

// ── EDIT MODE ─────────────────────────────────────────────────────
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById('edit-toggle');
  document.getElementById('lock-icon').textContent = editMode ? '✏️' : '🔒';
  document.getElementById('lock-text').textContent = editMode ? 'Edit' : 'Khoá';
  btn.classList.toggle('active', editMode);
  document.getElementById('btn-add').classList.toggle('hidden', !editMode);
  renderTable();
  if (sortable) sortable.option('disabled', !editMode);
}

// ── FULL VIEW MODE ────────────────────────────────────────────────
let fullViewMode = false;
function toggleFullView() {
  fullViewMode = !fullViewMode;
  document.getElementById('main-table').classList.toggle('full-view', fullViewMode);
  document.getElementById('full-view-toggle').classList.toggle('active-full', fullViewMode);
}

// ── FILTERS ───────────────────────────────────────────────────────
function applyFilters() {
  filterState.search  = document.getElementById('search-input').value.toLowerCase();
  filterState.format  = document.getElementById('filter-format').value;
  filterState.status  = document.getElementById('filter-status').value;
  filterState.pic     = document.getElementById('filter-pic').value;
  renderTable();
}
function matchesFilter(t) {
  if (filterState.search) {
    const q = filterState.search;
    if (!((t.concept||'').toLowerCase().includes(q) ||
          (t.description||'').toLowerCase().includes(q) ||
          (t.note||'').toLowerCase().includes(q))) return false;
  }
  if (filterState.format && FORMAT_TAG(t.format||'') !== filterState.format) return false;
  if (filterState.status && t.status !== filterState.status) return false;
  if (filterState.pic && t.pic !== filterState.pic) return false;
  return true;
}

// ── SORT ──────────────────────────────────────────────────────────
function sortColumn(col) {
  if (sortState.col === col) {
    sortState.dir = sortState.dir === 'asc' ? 'desc' : sortState.dir === 'desc' ? null : 'asc';
    if (!sortState.dir) sortState.col = null;
  } else {
    sortState.col = col; sortState.dir = 'asc';
  }
  renderTable();
}
function getSortedKeys() {
  let keys = Object.keys(tasks);
  if (sortState.col && sortState.dir) {
    keys.sort((a, b) => {
      let va = tasks[a][sortState.col] ?? '';
      let vb = tasks[b][sortState.col] ?? '';
      if (typeof va === 'boolean') va = va ? 1 : 0;
      if (typeof vb === 'boolean') vb = vb ? 1 : 0;
      if (sortState.dir === 'asc') return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });
  } else {
    keys.sort((a, b) => (tasks[a].order ?? 0) - (tasks[b].order ?? 0));
  }
  return keys;
}

// ── CRUD ──────────────────────────────────────────────────────────
async function addRow() {
  const maxOrder = Object.values(tasks).reduce((m, t) => Math.max(m, t.order ?? 0), 0);
  const newTask = {
    stt: Object.keys(tasks).length + 1,
    nguon: 'Manual', aiNames: '',
    insight: 'Nostalgia',
    concept: '(Tên concept)',
    format: FORMAT_OPTS[0],
    description: '', status: 'Draft',
    ready: false, pic: '', linkBrief: '', linkBriefText: '', linkCreative: '', linkCreativeText: '', note: '',
    hidden: false, order: maxOrder + 1,
    createdAt: Date.now(), updatedAt: Date.now()
  };
  const key = await dbPush('tasks', newTask);
  window.newRowKey = key;
  await writeLog(currentUser, 'add', `Thêm task mới`);
}
async function updateField(key, field, value) {
  const old = tasks[key] ? tasks[key][field] : '';
  await dbPatch(`tasks/${key}`, { [field]: value, updatedAt: Date.now() });
  await writeLog(currentUser, 'edit', `"${tasks[key]?.concept||key}": ${field} → ${value}`);
}
async function deleteTask(key) {
  await dbDelete(`tasks/${key}`);
  await writeLog(currentUser, 'delete', `Xoá "${tasks[key]?.concept||key}"`);
}
async function hideTask(key, hidden) {
  await dbPatch(`tasks/${key}`, { hidden, updatedAt: Date.now() });
  await writeLog(currentUser, hidden?'hide':'show', `"${tasks[key]?.concept||key}"`);
}
async function toggleReady(key) {
  const val = !tasks[key].ready;
  await dbPatch(`tasks/${key}`, { ready: val, updatedAt: Date.now() });
  await writeLog(currentUser, 'ready', `"${tasks[key]?.concept||key}" → ${val ? '✓' : '✗'}`);
}

// Delete confirm
function promptDelete(key) {
  pendingDeleteKey = key;
  document.getElementById('confirm-modal').classList.remove('hidden');
}
function closeConfirm() {
  pendingDeleteKey = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}
async function confirmDelete() {
  if (pendingDeleteKey) { await deleteTask(pendingDeleteKey); pendingDeleteKey = null; }
  closeConfirm();
}

// ── HYPERLINK (Cmd+K) ─────────────────────────────────────────────
function openLinkModal(key, type) {
  linkTargetCell = { key, type };
  const modal = document.getElementById('link-modal');
  const input = document.getElementById('link-url');
  input.value = tasks[key]?.[type] || '';
  modal.classList.remove('hidden');
  setTimeout(() => input.focus(), 100);
}
function closeLinkModal() {
  linkTargetCell = null;
  document.getElementById('link-modal').classList.add('hidden');
}
async function applyLink() {
  if (!linkTargetCell) return;
  const url = document.getElementById('link-url').value.trim();
  const key = linkTargetCell.key;
  const type = linkTargetCell.type;
  const text = tasks[key]?.[type + 'Text'] || tasks[key]?.concept || url;
  await dbPatch(`tasks/${key}`, { [type]: url, [type + 'Text']: text, updatedAt: Date.now() });
  await writeLog(currentUser, 'link', `"${tasks[key]?.concept}" → ${url}`);
  closeLinkModal();
}

// ── PANELS ────────────────────────────────────────────────────────
function togglePanel(id) {
  const el = document.getElementById(id);
  const ov = document.getElementById('overlay');
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  if (!isOpen) { el.classList.add('open'); ov.classList.remove('hidden'); }
  else ov.classList.add('hidden');
}
function closePanels() {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('overlay').classList.add('hidden');
}

// ── THEMES ────────────────────────────────────────────────────────
function buildThemeGrid() {
  const grid = document.getElementById('theme-grid');
  grid.innerHTML = THEMES.map(t => `
    <div class="theme-swatch" style="background:${t.bg};color:${t.accent};border-color:${t.bg}"
      onclick="applyTheme('${t.id}')" id="sw-${t.id}">
      <div style="font-size:20px">${t.emoji}</div>
      <div>${t.name}</div>
    </div>`).join('');
}
function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  localStorage.setItem('ct_theme', id);
  document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
  document.getElementById('sw-' + id)?.classList.add('active');
  if (animEnabled) startAnim(id);
  writeLog(currentUser, 'theme', `Chuyển theme → ${id}`);
}

// ── ANIMATIONS ────────────────────────────────────────────────────
function toggleAnim(on) {
  animEnabled = on;
  localStorage.setItem('ct_anim', on ? '1' : '0');
  const theme = document.documentElement.getAttribute('data-theme') || 'dark-neon';
  on ? startAnim(theme) : stopAnim();
  if (on) writeLog(currentUser, 'anim', 'Bật animation');
}
function stopAnim() {
  document.getElementById('anim-container').innerHTML = '';
}
function startAnim(theme) {
  const container = document.getElementById('anim-container');
  container.innerHTML = '';
  const cfg = ANIM_CONFIGS[theme] || { type:'none', count:0 };
  if (cfg.type === 'none') return;
  const emoji = ANIM_EMOJIS[cfg.type] || '·';
  for (let i = 0; i < cfg.count; i++) {
    const el = document.createElement('div');
    el.className = 'anim-particle';
    const x = Math.random() * 100;
    const dur = 4 + Math.random() * 8;
    const delay = Math.random() * 8;
    const size = 8 + Math.random() * 14;
    el.style.cssText = `left:${x}%;font-size:${size}px;animation-duration:${dur}s;animation-delay:-${delay}s;opacity:${0.3+Math.random()*0.6}`;
    if (['snow','leaves','petals','sparks'].includes(cfg.type)) {
      el.style.animationName = 'fall';
      el.style.top = '-20px';
    } else if (cfg.type === 'bubbles') {
      el.style.animationName = 'rise';
      el.style.bottom = '0';
    } else if (cfg.type === 'stars') {
      el.style.animationName = 'twinkle';
      el.style.top = Math.random() * 100 + '%';
    } else {
      el.style.animationName = 'fall';
      el.style.top = '-20px';
    }
    el.textContent = emoji;
    container.appendChild(el);
  }
}

// ── ACTION LOG ────────────────────────────────────────────────────
function renderLog(logsData) {
  if (!logsData) return;
  const list = document.getElementById('log-list');
  const entries = Object.values(logsData).sort((a, b) => b.ts - a.ts).slice(0, 100);
  list.innerHTML = entries.map(e => {
    const d = new Date(e.ts);
    const time = d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) + ' ' + d.toLocaleDateString('vi-VN');
    const ucls = e.user === 'Lam' ? 'log-user-lam' : 'log-user-bao';
    return `<div class="log-item">
      <div class="log-time">${time}</div>
      <span class="log-user ${ucls}">${e.user}</span>
      <span class="log-action"> ${e.action}: ${e.detail||''}</span>
    </div>`;
  }).join('');
}

// ── STATUS BAR ────────────────────────────────────────────────────
function updateStatusBar() {
  const all = Object.values(tasks).filter(t => !t.hidden);
  const ready = all.filter(t => t.ready).length;
  const done = all.filter(t => t.status === 'Done').length;
  document.getElementById('stat-total').textContent = `${all.length} tasks`;
  document.getElementById('stat-ready').textContent = `${ready} ready`;
  document.getElementById('stat-done').textContent = `${done} done`;
}
