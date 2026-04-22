// ── TABLE HEADER ─────────────────────────────────────────────────
function renderHeader() {
  const cols = [
    { id:'drag', label:'', cls:'col-drag', sortable:false },
    { id:'stt',  label:'STT', cls:'col-stt', sortable:true },
    { id:'nguon',label:'Nguồn', cls:'col-nguon', sortable:true },
    { id:'insight',label:'Insight', cls:'col-insight', sortable:true },
    { id:'concept',label:'Tên Concept', cls:'col-concept', sortable:true },
    { id:'format',label:'Format', cls:'col-format', sortable:true },
    { id:'description',label:'Mô tả', cls:'col-desc', sortable:false },
    { id:'status',label:'Status', cls:'col-status', sortable:true },
    { id:'ready',label:'Ready', cls:'col-ready', sortable:true },
    { id:'pic',  label:'PIC', cls:'col-pic', sortable:true },
    { id:'linkBrief', label:'Link Brief', cls:'col-link', sortable:false },
    { id:'linkCreative', label:'Link Creatives', cls:'col-link', sortable:false },
    { id:'note', label:'Note', cls:'col-note', sortable:false },
    { id:'actions',label:'', cls:'col-actions', sortable:false },
  ];
  const tr = document.getElementById('thead-row');
  tr.innerHTML = cols.map(c => {
    const sc = c.sortable ? 'sortable' : '';
    const sd = sortState.col===c.id ? (sortState.dir==='asc'?'sort-asc':'sort-desc') : '';
    const si = c.sortable ? '<span class="sort-icon"></span>' : '';
    const onclick = c.sortable ? `onclick="sortColumn('${c.id}')"` : '';
    return `<th class="${c.cls} ${sc} ${sd}" ${onclick}>${c.label}${si}</th>`;
  }).join('');
}

// ── TABLE BODY ────────────────────────────────────────────────────
function renderTable() {
  renderHeader();
  const tbody = document.getElementById('tbody');
  const keys = getSortedKeys();
  let stt = 0;
  const rows = keys.map(key => {
    const t = tasks[key];
    if (t.hidden && !editMode) return '';
    stt++;
    return buildRow(key, t, stt);
  });
  tbody.innerHTML = rows.join('');
  initDragDrop();
  updateStatusBar();
  initColumnResizer();
}

// ── COLUMN RESIZER ────────────────────────────────────────────────
function initColumnResizer() {
  if (!editMode) return;
  const ths = document.querySelectorAll('#thead-row th');
  ths.forEach(th => {
    if (th.querySelector('.col-resizer') || !th.classList.contains('sortable') && th.classList.contains('col-drag')) return;
    const resizer = document.createElement('div');
    resizer.className = 'col-resizer';
    th.appendChild(resizer);
    
    let startX, startWidth;
    resizer.addEventListener('mousedown', e => {
      e.stopPropagation();
      startX = e.pageX;
      startWidth = th.offsetWidth;
      document.body.classList.add('resizing');
      
      function onMouseMove(e) {
        const newWidth = Math.max(30, startWidth + (e.pageX - startX));
        th.style.width = newWidth + 'px';
        th.style.minWidth = newWidth + 'px';
      }
      function onMouseUp() {
        document.body.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

// ── BUILD ONE ROW ─────────────────────────────────────────────────
function buildRow(key, t, stt) {
  const hidden = t.hidden ? 'hidden-row' : '';
  const ftag = FORMAT_TAG(t.format || '');
  const statusCls = 'st-' + (t.status||'Draft').replace(/\s+/g,'-');
  const picCls = t.pic === 'Lam' ? 'pic-lam' : t.pic === 'Bảo' ? 'pic-bao' : '';

  // Nguồn cell
  const nguonBadge = t.nguon === 'AI'
    ? `<div class="badge-nguon badge-ai">🤖 AI<span class="ai-name">${t.aiNames||''}</span></div>`
    : `<div class="badge-nguon badge-manual">✍️ Manual</div>`;

  // Format cell
  const fmtBadge = `<span class="badge-format fmt-${ftag}">${ftag}</span>`;
  const fmtSub = `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">${(t.format||'').replace(/Video – |Banner \/ /g,'').substring(0,24)}</div>`;

  // Status badge
  const stBadge = `<span class="badge-status ${statusCls}">${t.status||'Draft'}</span>`;

  // Ready checkbox
  const readyCls = t.ready ? 'ready-box checked' : 'ready-box';
  const ready = `<div class="${readyCls}" onclick="toggleReady('${key}')"></div>`;

  // Link cells
  const linkBriefCell = t.linkBrief
    ? `<a href="${t.linkBrief}" target="_blank" rel="noopener">${t.linkBriefText||t.linkBrief}</a>`
    : `<span style="color:var(--text-muted);font-size:11px">—</span>`;
    
  const linkCreativeCell = t.linkCreative
    ? `<a href="${t.linkCreative}" target="_blank" rel="noopener">${t.linkCreativeText||t.linkCreative}</a>`
    : `<span style="color:var(--text-muted);font-size:11px">—</span>`;

  // Actions
  const eyeIcon = t.hidden ? '👁‍🗨' : '🙈';
  const actions = editMode ? `
    <div class="row-actions">
      <button class="row-btn" onclick="hideTask('${key}',${!t.hidden})" title="${t.hidden?'Hiện':'Ẩn'}">${eyeIcon}</button>
      <button class="row-btn danger" onclick="promptDelete('${key}')" title="Xoá">🗑</button>
    </div>` : '';

  // Drag handle
  const drag = editMode ? `<div class="drag-handle" data-key="${key}">⠿</div>` : '';

  // Edit or view mode cells
  const E = editMode;
  const concept = E
    ? `<input class="cell-edit" value="${esc(t.concept||'')}" onchange="updateField('${key}','concept',this.value)" style="width:100%">`
    : `<div class="cell-text" style="font-weight:600">${t.concept||''}</div>`;

  const insight = E
    ? `<input class="cell-edit" value="${esc(t.insight||'Nostalgia')}" onchange="updateField('${key}','insight',this.value)">`
    : `<div class="cell-text">${t.insight||'Nostalgia'}</div>`;

  const desc = E
    ? `<textarea class="cell-edit" rows="2" onchange="updateField('${key}','description',this.value)">${esc(t.description||'')}</textarea>`
    : `<div class="cell-desc">${t.description||''}</div>`;

  const note = E
    ? `<input class="cell-edit" value="${esc(t.note||'')}" onchange="updateField('${key}','note',this.value)">`
    : `<div class="cell-text" style="font-size:11px;color:var(--text-muted)">${t.note||''}</div>`;

  const nguon = E ? buildNguonEdit(key, t) : nguonBadge;
  const format = E ? buildFormatEdit(key, t) : fmtBadge + fmtSub;
  const status = E ? buildStatusEdit(key, t) : stBadge;
  const pic = E ? buildPicEdit(key, t) : `<div class="${picCls}">${t.pic||'—'}</div>`;
  const linkBrief = E
    ? `<div class="link-cell" data-type="linkBrief" onclick="openLinkModal('${key}', 'linkBrief')" title="Click hoặc Cmd+K">
        ${t.linkBrief ? `<a href="${t.linkBrief}" target="_blank" onclick="event.stopPropagation()">${t.linkBriefText||t.linkBrief}</a>` : '<span style="color:var(--text-muted);font-size:11px">+ Link Brief</span>'}
       </div>`
    : `<div class="link-cell">${linkBriefCell}</div>`;

  const linkCreative = E
    ? `<div class="link-cell" data-type="linkCreative" onclick="openLinkModal('${key}', 'linkCreative')" title="Click hoặc Cmd+K">
        ${t.linkCreative ? `<a href="${t.linkCreative}" target="_blank" onclick="event.stopPropagation()">${t.linkCreativeText||t.linkCreative}</a>` : '<span style="color:var(--text-muted);font-size:11px">+ Link Creative</span>'}
       </div>`
    : `<div class="link-cell">${linkCreativeCell}</div>`;

  return `<tr data-key="${key}" class="${hidden}">
    <td class="col-drag">${drag}</td>
    <td class="col-stt" style="font-weight:700;color:var(--text-muted)">${stt}</td>
    <td class="col-nguon">${nguon}</td>
    <td class="col-insight">${insight}</td>
    <td class="col-concept">${concept}</td>
    <td class="col-format">${format}</td>
    <td class="col-desc">${desc}</td>
    <td class="col-status">${status}</td>
    <td class="col-ready" style="text-align:center">${ready}</td>
    <td class="col-pic">${pic}</td>
    <td class="col-link">${linkBrief}</td>
    <td class="col-link">${linkCreative}</td>
    <td class="col-note">${note}</td>
    <td class="col-actions">${actions}</td>
  </tr>`;
}

// ── INLINE SELECT BUILDERS ────────────────────────────────────────
function buildNguonEdit(key, t) {
  const aiSel = t.nguon === 'AI'
    ? `<select class="cell-select" onchange="updateField('${key}','aiNames',this.value)" style="font-size:10px;margin-top:4px">
        ${AI_OPTS.map(a => `<option${t.aiNames&&t.aiNames.includes(a)?' selected':''}>${a}</option>`).join('')}
       </select>` : '';
  return `<select class="cell-select" onchange="updateNguon('${key}',this.value)">
    <option${t.nguon==='AI'?' selected':''}>AI</option>
    <option${t.nguon==='Manual'?' selected':''}>Manual</option>
  </select>${aiSel}`;
}
function buildFormatEdit(key, t) {
  return `<select class="cell-select" onchange="updateField('${key}','format',this.value)">
    ${FORMAT_OPTS.map(f => `<option${t.format===f?' selected':''}>${f}</option>`).join('')}
  </select>`;
}
function buildStatusEdit(key, t) {
  return `<select class="cell-select" onchange="updateField('${key}','status',this.value)">
    ${STATUS_OPTS.map(s => `<option${t.status===s?' selected':''}>${s}</option>`).join('')}
  </select>`;
}
function buildPicEdit(key, t) {
  return `<select class="cell-select" onchange="updateField('${key}','pic',this.value)">
    <option value="">—</option>
    <option${t.pic==='Lam'?' selected':''}>Lam</option>
    <option${t.pic==='Bảo'?' selected':''}>Bảo</option>
  </select>`;
}

async function updateNguon(key, val) {
  const updates = { nguon: val, updatedAt: Date.now() };
  if (val === 'Manual') updates.aiNames = '';
  await dbPatch(`tasks/${key}`, updates);
  await writeLog(currentUser, 'edit', `"${tasks[key]?.concept}": nguồn → ${val}`);
}

// ── DRAG-DROP ─────────────────────────────────────────────────────
function initDragDrop() {
  const tbody = document.getElementById('tbody');
  if (sortable) sortable.destroy();
  sortable = Sortable.create(tbody, {
    handle: '.drag-handle',
    animation: 150,
    disabled: !editMode,
    onEnd: async ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return;
      const rows = [...tbody.querySelectorAll('tr[data-key]')];
      const updates = {};
      rows.forEach((r, i) => { updates[r.dataset.key] = { order: i }; });
      for (const [k, v] of Object.entries(updates)) {
        await dbPatch(`tasks/${k}`, v);
      }
      await writeLog(currentUser, 'reorder', `Di chuyển task`);
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
