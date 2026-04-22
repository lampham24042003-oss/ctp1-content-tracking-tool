// ── INIT ─────────────────────────────────────────────────────────
async function initApp() {
  buildThemeGrid();
  const savedTheme = localStorage.getItem('ct_theme') || 'dark-neon';
  applyTheme(savedTheme);
  const savedAnim = localStorage.getItem('ct_anim') === '1';
  document.getElementById('anim-chk').checked = savedAnim;
  if (savedAnim) { animEnabled = true; startAnim(savedTheme); }

  // Check if DB is empty → seed
  const existing = await dbGet('tasks');
  if (!existing) {
    document.getElementById('stat-total').textContent = 'Đang tải dữ liệu...';
    await seedData();
  }

  // Real-time sync
  listenTasks((type, path, data) => {
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'none';
    if (path === '/' || path === '') {
      tasks = data || {};
    } else {
      const key = path.replace('/', '');
      if (data === null) delete tasks[key];
      else if (key && !key.includes('/')) tasks[key] = { ...tasks[key], ...data };
      else if (key.includes('/')) {
        const [k, f] = key.split('/');
        if (tasks[k]) tasks[k][f] = data;
      }
    }
    renderTable();
  });

  let logsStore = {};
  listenLogs((type, path, data) => {
    if (path === '/' || path === '') {
      logsStore = data || {};
    } else {
      const key = path.replace('/', '');
      if (data === null) delete logsStore[key];
      else if (key && !key.includes('/')) logsStore[key] = { ...logsStore[key], ...data };
      else if (key.includes('/')) {
        const [k, f] = key.split('/');
        if (logsStore[k]) logsStore[k][f] = data;
      }
    }
    renderLog(logsStore);
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const sel = window.getSelection();
      const node = sel.anchorNode;
      const cell = node?.parentElement?.closest('.link-cell') || document.activeElement?.closest('.link-cell');
      if (cell && editMode) {
        const type = cell.dataset.type;
        const key = cell.closest('tr').dataset.key;
        openLinkModal(key, type);
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('ct_user');
  if (saved) selectUser(saved);
});
