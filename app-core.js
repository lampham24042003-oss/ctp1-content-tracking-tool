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
  { id:'dracula', name:'Dracula', bg:'#282a36', accent:'#bd93f9', emoji:'🦇' },
  { id:'hacker', name:'Hacker', bg:'#000000', accent:'#33ff33', emoji:'👾' },
  { id:'synthwave', name:'Synthwave', bg:'#2b213a', accent:'#84f4f6', emoji:'🎧' },
  { id:'nord', name:'Nord', bg:'#2e3440', accent:'#88c0d0', emoji:'🏔️' },
  { id:'solarized-dark', name:'Solarized Dark', bg:'#002b36', accent:'#b58900', emoji:'☀️' },
  { id:'monokai', name:'Monokai', bg:'#272822', accent:'#e6db74', emoji:'🎨' },
  { id:'tokyo-night', name:'Tokyo Night', bg:'#1a1b26', accent:'#7aa2f7', emoji:'🏮' },
  { id:'catppuccin', name:'Catppuccin', bg:'#1e1e2e', accent:'#f5c2e7', emoji:'🐱' },
  { id:'rose-pine', name:'Rose Pine', bg:'#191724', accent:'#ebbcba', emoji:'🌹' },
  { id:'gruvbox', name:'Gruvbox', bg:'#282828', accent:'#fe8019', emoji:'📦' },
  { id:'blood-moon', name:'Blood Moon', bg:'#1a0505', accent:'#ff0000', emoji:'🩸' },
  { id:'matrix', name:'Matrix', bg:'#000500', accent:'#00ff00', emoji:'🟩' },
  { id:'neon-city', name:'Neon City', bg:'#0d0221', accent:'#ff00e4', emoji:'🏙️' },
  { id:'galaxy', name:'Galaxy', bg:'#05001a', accent:'#8a2be2', emoji:'🛸' },
  { id:'volcano', name:'Volcano', bg:'#1a0d00', accent:'#ff6600', emoji:'🌋' },
  { id:'abyss', name:'Abyss', bg:'#00081a', accent:'#0066ff', emoji:'🦑' },
  { id:'toxic', name:'Toxic', bg:'#111a00', accent:'#99ff00', emoji:'☢️' },
  { id:'phantom', name:'Phantom', bg:'#1a1a1a', accent:'#cccccc', emoji:'👻' },
  { id:'gold-rush', name:'Gold Rush', bg:'#1a1300', accent:'#ffcc00', emoji:'🪙' },
  { id:'cotton-candy', name:'Cotton Candy', bg:'#1a0f14', accent:'#ff66cc', emoji:'🍭' },
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
  'dracula': { type:'particles', count:40 },
  'hacker': { type:'glitch', count:20 },
  'synthwave': { type:'stars', count:80 },
  'nord': { type:'snow', count:60 },
  'solarized-dark': { type:'none', count:0 },
  'monokai': { type:'dust', count:40 },
  'tokyo-night': { type:'particles', count:40 },
  'catppuccin': { type:'bubbles', count:40 },
  'rose-pine': { type:'leaves', count:30 },
  'gruvbox': { type:'dust', count:40 },
  'blood-moon': { type:'particles', count:40 },
  'matrix': { type:'glitch', count:20 },
  'neon-city': { type:'stars', count:80 },
  'galaxy': { type:'stars', count:80 },
  'volcano': { type:'sparks', count:30 },
  'abyss': { type:'bubbles', count:40 },
  'toxic': { type:'glitch', count:20 },
  'phantom': { type:'dust', count:40 },
  'gold-rush': { type:'sparks', count:30 },
  'cotton-candy': { type:'snow', count:60 },
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
  
  let attempts = 0;
  const checkAndScroll = () => {
    const tr = document.querySelector(`tr[data-key="${key}"]`);
    if (tr) {
      tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tr.classList.add('highlight-new');
      setTimeout(() => tr.classList.remove('highlight-new'), 1000);
    } else if (attempts < 20) {
      attempts++;
      setTimeout(checkAndScroll, 100);
    }
  };
  checkAndScroll();

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

// ── AI REPORT (GEMINI 1.5 FLASH VIA VERCEL SERVERLESS) ─────────────────
async function generateAIReport() {
  const contentDiv = document.getElementById('ai-report-content');
  contentDiv.innerHTML = '<div style="text-align:center; padding: 40px;"><span style="animation: spin 1s linear infinite; display:inline-block; font-size: 24px;">⏳</span><br><br>AI đang rà soát toàn bộ data và action log...</div>';

  try {
    const simpleTasks = Object.values(tasks).map(t => ({
      concept: t.concept,
      pic: t.pic,
      status: t.status,
      ready: t.ready,
      format: t.format,
      source: t.source
    }));
    
    // Attempt to read logs from window if available (passed from app.js)
    const logsData = window.logsStore || {};
    const sortedLogs = Object.values(logsData).sort((a,b)=>b.ts - a.ts).slice(0, 300).map(l => ({
      u: l.user, a: l.action, d: l.detail, t: new Date(l.ts).toLocaleString('vi-VN')
    }));

    const prompt = `Bạn là một chuyên gia quản lý dự án khó tính và hài hước, đang theo dõi tiến độ sản xuất content.
    Hãy phân tích kĩ càng performance của 2 nhân sự: Lam và Bảo dựa trên dữ liệu thật dưới đây.
    
    Dữ liệu Task:
    ${JSON.stringify(simpleTasks)}
    
    Dữ liệu Log (Lịch sử hành động gần nhất):
    ${JSON.stringify(sortedLogs)}
    
    Yêu cầu xuất báo cáo:
    1. 📊 Thống kê số liệu: Tổng số task, số task của mỗi người, bao nhiêu đã xong (ready = true), bao nhiêu chưa xong.
    2. 🕵️ Đánh giá chi tiết: Đánh giá thái độ, độ chăm chỉ và tiến độ của Lam và Bảo dựa trên lượng task, status và những gì họ làm trong log. Ai làm việc nhiều? Ai ít tương tác?
    3. ⚖️ Kết luận & Lời khuyên: Đưa ra nhận xét khách quan xem ai đang gánh team, ai đang lười, ai là 'báo thủ'. Lời khuyên để cải thiện.
    4. Format bằng Markdown gọn gàng, chia mục rõ ràng, dùng emoji cho sinh động. Giọng điệu thân thiện, có một chút thâm thúy/cà khịa vui vẻ.`;

    const res = await fetch(`/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let text = data.candidates[0].content.parts[0].text;
    
    // Add specific CSS classes for styling if needed, but marked.js will handle markdown
    contentDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : `<pre style="white-space:pre-wrap;font-family:inherit">${text}</pre>`;
  } catch (error) {
    contentDiv.innerHTML = `<div style="color:var(--accent); padding:10px; background:var(--surface2); border-radius:8px;">Lỗi: ${error.message}</div>`;
  }
}

// DOMContentLoaded removed

// ── STATUS BAR ────────────────────────────────────────────────────
function updateStatusBar() {
  const all = Object.values(tasks).filter(t => !t.hidden);
  const ready = all.filter(t => t.ready).length;
  const done = all.filter(t => t.status === 'Done').length;
  document.getElementById('stat-total').textContent = `${all.length} tasks`;
  document.getElementById('stat-ready').textContent = `${ready} ready`;
  document.getElementById('stat-done').textContent = `${done} done`;
}
