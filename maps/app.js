/* Process-maps dashboard — multiple directed maps, free node placement, drill-down links.
   Data: window.MAPS = { order:[slug...], maps:{ slug:{id,title,url,nodes:[...],edges:[...]} } }
   Connections: chord-tangent bezier; drag from a node's right-edge port to connect;
   double-click a link to rename it; hover a link for ×. Positions are committed map content. */
'use strict';
(function () {
  let MAPS = window.MAPS || { order: [], maps: {} };
  let cur = MAPS.order[0] || null;
  let trail = [];
  let SERVER = false;
  let connect = { on: false, from: null };          // header "Edge" toggle fallback
  let wire = null;                                   // active drag-to-connect
  let showLanes = false;
  let pendingMaps = null;                            // SSE queued during a gesture
  let clickTimer = null;                             // single-click debounced against dblclick
  let dragging = false;                              // node-move in progress (guards mid-drag SSE)

  const NS = 'http://www.w3.org/2000/svg';
  const TYPE_COLOR = { step: 'var(--step)', decision: 'var(--decision)', 'subprocess-link': 'var(--link)' };
  const LANE_VARS = ['--l0', '--l1', '--l2', '--l3', '--l4', '--l5', '--l6'];

  const svg = d3.select('svg');
  const svgN = svg.node();
  const canvas = svg.append('g');
  const gLane = canvas.append('g');
  const gEdge = canvas.append('g');
  const gNode = canvas.append('g');
  const gWire = canvas.append('g');                   // NEVER cleared by render()
  const wirePath = gWire.append('path').attr('id', 'wire-preview').attr('d', '');
  const zoom = d3.zoom().scaleExtent([0.2, 2.5]).filter(e => !e.target.closest('.node'))
    .on('zoom', e => canvas.attr('transform', e.transform));
  svg.call(zoom);
  const defs = svg.append('defs');
  defs.html('<marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">' +
    '<path d="M0,0 L8,4 L0,8 Z" fill="' + getComputedStyle(document.documentElement).getPropertyValue('--edge').trim() + '"/></marker>');

  const map = () => MAPS.maps[cur];
  const nidSlug = () => { const m = {}; (map() ? map().nodes : []).forEach(n => m[n.id] = n.slug); return m; };
  const byId = id => (map() ? map().nodes : []).find(n => n.id === id);
  const repoRel = u => (u || '').replace(/^(\.\.\/)+/, '');
  const inputOpen = () => !document.getElementById('name-input').hidden || !document.getElementById('edge-label-input').hidden;

  async function api(path, b) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    return r.json();
  }
  function applyMaps(m) {
    if ((wire && wire.active) || dragging || inputOpen()) { pendingMaps = m; return; }  // don't tear down mid-gesture
    pendingMaps = null;                                  // applying authoritative state — drop any stale queued snapshot
    MAPS = m;
    if (!MAPS.maps[cur]) { cur = MAPS.order[0] || null; trail = []; }
    if (edPath) revalidateEditor();                      // open notes drawer: re-check the node still exists
    fillMapSelect(); render();
  }
  function flushPending() { if (pendingMaps && !(wire && wire.active) && !dragging && !inputOpen()) { const m = pendingMaps; pendingMaps = null; applyMaps(m); } }

  // ---- geometry ----
  const isDiamond = n => n.type === 'decision';
  function halfExt(n) {
    if (isDiamond(n)) return { hw: Math.max(150, Math.min(300, (n.name || '').length * 8 + 70)) / 2, hh: 35 };
    return { hw: Math.max(120, Math.min(260, (n.name || '').length * 8 + 48)) / 2, hh: 23 };
  }
  function edgePt(n, tx, ty) {
    const { hw, hh } = halfExt(n);
    const dx = tx - n.x, dy = ty - n.y;
    if (!dx && !dy) return { x: n.x, y: n.y };
    if (isDiamond(n)) { const s = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh); return { x: n.x + dx * s, y: n.y + dy * s }; }  // rhombus boundary, not AABB
    const s = Math.min(dx ? (hw + 2) / Math.abs(dx) : Infinity, dy ? (hh + 2) / Math.abs(dy) : Infinity);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }
  // chord-tangent cubic bezier; bow = signed perpendicular offset for bidirectional pairs
  function edgePath(p1, p2, bow) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1;
    const k = Math.min(140, Math.max(40, len * 0.35));
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const c1 = { x: p1.x + ux * k + nx * bow, y: p1.y + uy * k + ny * bow };
    const c2 = { x: p2.x - ux * k + nx * bow, y: p2.y - uy * k + ny * bow };
    return { d: 'M' + p1.x + ',' + p1.y + ' C' + c1.x + ',' + c1.y + ' ' + c2.x + ',' + c2.y + ' ' + p2.x + ',' + p2.y, c1, c2 };
  }
  const cubicMid = (p1, c1, c2, p2) => ({ x: .125 * p1.x + .375 * c1.x + .375 * c2.x + .125 * p2.x, y: .125 * p1.y + .375 * c1.y + .375 * c2.y + .125 * p2.y });

  // lane → stable color (sorted distinct lanes in current map)
  function laneColorMap() {
    const lanes = [...new Set((map() ? map().nodes : []).map(n => n.lane).filter(Boolean))].sort();
    const m = {}; lanes.forEach((l, i) => m[l] = 'var(' + LANE_VARS[i % LANE_VARS.length] + ')'); return m;
  }
  let LANE_COLORS = {};
  const accent = n => (n.lane && LANE_COLORS[n.lane]) || TYPE_COLOR[n.type] || TYPE_COLOR.step;

  function render() {
    LANE_COLORS = laneColorMap();
    gLane.selectAll('*').remove(); gEdge.selectAll('*').remove(); gNode.selectAll('*').remove();
    if (!map()) { updateBreadcrumb(); return; }
    const nodes = map().nodes, edges = map().edges;

    // ---- lane bands (optional) ----
    if (showLanes) {
      const lanes = {};
      nodes.forEach(n => { if (!n.lane) return; const { hw, hh } = halfExt(n); (lanes[n.lane] = lanes[n.lane] || []).push({ x0: n.x - hw, x1: n.x + hw, y0: n.y - hh, y1: n.y + hh }); });
      Object.keys(lanes).forEach(lane => {
        const b = lanes[lane], minX = Math.min(...b.map(o => o.x0)), maxX = Math.max(...b.map(o => o.x1)), minY = Math.min(...b.map(o => o.y0)), maxY = Math.max(...b.map(o => o.y1));
        gLane.append('rect').attr('class', 'laneband').attr('x', minX - 40).attr('y', minY - 18).attr('width', maxX - minX + 80).attr('height', maxY - minY + 36).attr('rx', 16).attr('fill', LANE_COLORS[lane]);
        gLane.append('text').attr('class', 'lanelabel').attr('x', minX - 30).attr('y', minY - 24).attr('fill', LANE_COLORS[lane]).text(lane);
      });
    }

    // ---- edges ----
    edges.forEach(e => {
      if (e.from === e.to) return;                       // skip degenerate self-loop (server also rejects these)
      const a = byId(e.from), b = byId(e.to); if (!a || !b) return;
      const p1 = edgePt(a, b.x, b.y), p2 = edgePt(b, a.x, a.y);
      const hasReverse = edges.some(o => o.from === e.to && o.to === e.from);
      const bow = hasReverse ? (e.from < e.to ? 18 : -18) : 0;
      const { d, c1, c2 } = edgePath(p1, p2, bow);
      const g = gEdge.append('g').attr('class', 'edgegrp');
      g.append('path').attr('class', 'edge').attr('d', d).attr('marker-end', 'url(#ah)');
      g.append('path').attr('class', 'edge hit').attr('d', d).on('dblclick', (ev) => { ev.stopPropagation(); editEdgeLabel(e, p1, c1, c2, p2); });
      const mid = cubicMid(p1, c1, c2, p2);
      if (e.label) {
        const t = g.append('text').attr('class', 'elabel').attr('x', mid.x).attr('y', mid.y).text(e.label);
        const bb = t.node().getBBox();
        g.insert('rect', 'text.elabel').attr('class', 'elabel-bg').attr('x', bb.x - 6).attr('y', bb.y - 3).attr('width', bb.width + 12).attr('height', bb.height + 6).attr('rx', 6);
      }
      // hover-× delete
      const del = g.append('g').attr('class', 'edge-del').attr('transform', 'translate(' + (mid.x + (e.label ? 26 : 0)) + ',' + mid.y + ')').on('click', (ev) => { ev.stopPropagation(); deleteEdge(e); });
      del.append('circle').attr('r', 8).attr('fill', '#e11d48');
      del.append('path').attr('d', 'M-3,-3 L3,3 M3,-3 L-3,3').attr('stroke', '#fff').attr('stroke-width', 1.6).attr('stroke-linecap', 'round');
    });

    // ---- nodes ----
    const sel = gNode.selectAll('g.node').data(nodes, d => d.id).enter().append('g')
      .attr('class', d => 'node' + (d.link_map ? ' linkable' : ''))
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      .on('click', (e, d) => { clearTimeout(clickTimer); clickTimer = setTimeout(() => { clickTimer = null; onNodeClick(d); }, 220); })   // defer so dblclick can cancel
      .on('dblclick', (e, d) => { e.stopPropagation(); clearTimeout(clickTimer); clickTimer = null; closeEditor(); openRename(d); })
      .on('contextmenu', (e, d) => { e.preventDefault(); clearTimeout(clickTimer); clickTimer = null; openCtx(e, d); })
      .call(d3.drag().clickDistance(5)
        .on('start', function (e) { if (wire && wire.active) return; dragging = true; e.sourceEvent.stopPropagation(); })
        .on('drag', function (e, d) { if (wire && wire.active) return; d.x = e.x; d.y = e.y; render(); })
        .on('end', function (e, d) { if (wire && wire.active) return; dragging = false; if (SERVER) api('/api/pos', { path: repoRel(d.url), x: d.x, y: d.y }).then(flushPending); else flushPending(); }));

    sel.each(function (d) {
      const g = d3.select(this), { hw, hh } = halfExt(d), col = accent(d);
      if (isDiamond(d)) {
        g.append('polygon').attr('class', 'shape').attr('points', [[0, -hh], [hw, 0], [0, hh], [-hw, 0]].map(p => p.join(',')).join(' '))
          .attr('fill', 'var(--card)').attr('stroke', col).attr('stroke-width', 2.2);
      } else {
        g.append('rect').attr('class', 'shape').attr('x', -hw).attr('y', -hh).attr('width', hw * 2).attr('height', hh * 2).attr('rx', 11)
          .attr('fill', 'var(--card)').attr('stroke', col).attr('stroke-width', 2.2);
      }
      g.append('text').attr('class', 'label').text(d.name);
      if (d.type === 'subprocess-link') {
        const bd = g.append('g').attr('transform', 'translate(' + (-hw + 2) + ',' + (-hh + 2) + ')');
        bd.append('circle').attr('r', 9).attr('fill', col);
        bd.append('text').attr('class', 'typeglyph').text('▸');
      }
      // connection port (right edge)
      g.append('circle').attr('class', 'port').attr('cx', hw).attr('cy', 0).attr('r', 5);
      g.append('circle').attr('class', 'port-hit').attr('cx', hw).attr('cy', 0).attr('r', 14)
        .on('pointerdown', (e) => beginWire(e, d))
        .on('click', (e) => e.stopPropagation());        // a stationary port tap must not bubble to the node
    });

    updateBreadcrumb();
  }

  function onNodeClick(d) {
    if (connect.on) {
      if (!connect.from) { connect.from = d.id; return; }
      if (connect.from === d.id) { connect.from = null; return; }
      const ns = nidSlug(), fs = ns[connect.from], ts = ns[d.id]; connect.from = null; setConnect(false);
      if (fs && ts) addEdge(fs, ts); else alert('That node no longer exists — it may have been changed by another editor.');
      return;
    }
    if (d.link_map) { drillTo(d.link_map); return; }
    openEditor(d);
  }

  // ---- drag-to-connect ----
  function beginWire(e, d) {
    if (!SERVER) return;
    e.stopPropagation(); e.preventDefault();
    try { svgN.setPointerCapture(e.pointerId); } catch (_) {}
    const { hw } = halfExt(d);
    wire = { fromId: d.id, x0: d.x + hw, y0: d.y, moved: false };
  }
  svgN.addEventListener('pointermove', e => {
    if (!wire || !wire.active && !wire.fromId) return;
    const [mx, my] = d3.pointer(e, canvas.node());
    if (!wire.moved && Math.hypot(mx - wire.x0, my - wire.y0) < 4) return;   // threshold
    wire.active = true; wire.moved = true;
    const src = byId(wire.fromId); if (!src) return;
    wirePath.attr('d', edgePath(edgePt(src, mx, my), { x: mx, y: my }, 0).d);
    const tgt = dropTarget(e); gNode.selectAll('g.node').classed('drop-ok', dd => tgt && tgt.id === dd.id && dd.id !== wire.fromId);
  });
  function endWire(e, cancelled) {
    if (!wire) return;
    const tgt = cancelled ? null : dropTarget(e);
    const fromId = wire.fromId, was = wire;
    wirePath.attr('d', ''); gNode.selectAll('g.node').classed('drop-ok', false);
    try { svgN.releasePointerCapture(e.pointerId); } catch (_) {}
    wire = null;                                          // clear BEFORE addEdge/flushPending so guards release
    if (!cancelled && was.active && tgt && tgt.id !== fromId) {
      const ns = nidSlug(), fs = ns[fromId], ts = ns[tgt.id];
      if (fs && ts) addEdge(fs, ts); else flushPending();
    } else flushPending();
  }
  svgN.addEventListener('pointerup', e => endWire(e, false));
  svgN.addEventListener('pointercancel', e => endWire(e, true));   // touch palm-reject / gesture takeover
  svgN.addEventListener('lostpointercapture', e => { if (wire) endWire(e, true); });
  function dropTarget(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const g = el && el.closest && el.closest('g.node');
    return g ? d3.select(g).datum() : null;
  }

  // ---- edge ops ----
  async function addEdge(fromSlug, toSlug) { if (!SERVER || !fromSlug || !toSlug) { flushPending(); return; } const j = await api('/api/edge', { map: cur, from: fromSlug, to: toSlug }); if (j.ok) applyMaps(j.maps); else alert('Edge: ' + j.error); flushPending(); }   // omit label → server keeps existing on reconnect
  async function deleteEdge(e) { if (!SERVER) return; if (!confirm('Delete this connection?')) return; const ns = nidSlug(); const j = await api('/api/edge', { map: cur, from: ns[e.from], to: ns[e.to], remove: true }); if (j.ok) applyMaps(j.maps); }
  function editEdgeLabel(e, p1, c1, c2, p2) {
    const inp = document.getElementById('edge-label-input');
    const mid = cubicMid(p1, c1, c2, p2), t = d3.zoomTransform(svgN), pt = t.apply([mid.x, mid.y]);
    const sx = Math.max(70, Math.min(window.innerWidth - 70, pt[0])), sy = Math.max(16, Math.min(window.innerHeight - 16, pt[1]));
    inp.style.left = sx + 'px'; inp.style.top = sy + 'px'; inp.value = e.label || ''; inp.hidden = false; inp.focus(); inp.select();
    const ns = nidSlug();
    const commit = async (save) => {
      inp.onkeydown = null; inp.onblur = null; inp.hidden = true;
      if (save && SERVER) { const j = await api('/api/edge', { map: cur, from: ns[e.from], to: ns[e.to], label: inp.value.trim() }); if (j.ok) applyMaps(j.maps); }
      flushPending();
    };
    inp.onkeydown = ev => { if (ev.key === 'Enter') commit(true); else if (ev.key === 'Escape') commit(false); };
    inp.onblur = () => commit(true);
  }

  // ---- node create / rename (inline) ----
  function showNameInput(sx, sy, value, onCommit) {
    const inp = document.getElementById('name-input');
    sx = Math.max(80, Math.min(window.innerWidth - 80, sx)); sy = Math.max(16, Math.min(window.innerHeight - 16, sy));   // keep on-screen
    inp.style.left = sx + 'px'; inp.style.top = sy + 'px'; inp.value = value || ''; inp.hidden = false; inp.focus(); inp.select();
    const done = (save) => { inp.onkeydown = null; inp.onblur = null; inp.hidden = true; if (save) onCommit(inp.value.trim()); flushPending(); };
    inp.onkeydown = ev => { if (ev.key === 'Enter') done(true); else if (ev.key === 'Escape') done(false); };
    inp.onblur = () => done(true);
  }
  function quickAdd(canvasX, canvasY, sx, sy) {
    if (!SERVER || !cur) return;
    showNameInput(sx, sy, '', async title => {
      if (!title) return;
      const j = await api('/api/add', { map: cur, title, type: 'step', x: canvasX, y: canvasY, note: '' });
      if (j.ok) applyMaps(j.maps); else alert('Add: ' + j.error);
    });
  }
  function openRename(d) {
    if (!SERVER) return; closeCtx();
    const t = d3.zoomTransform(svgN), [sx, sy] = t.apply([d.x, d.y]);
    showNameInput(sx, sy, d.name, async title => {
      if (!title || title === d.name) return;
      const j = await api('/api/rename', { path: repoRel(d.url), title }); if (j.ok) applyMaps(j.maps); else alert('Rename: ' + j.error);
    });
  }

  // ---- context menu (right-click) ----
  let ctxNode = null;
  function openCtx(e, d) {
    ctxNode = d; closeEditor();
    document.getElementById('ctx-title').textContent = d.name;
    document.querySelectorAll('#ctx-types button').forEach(b => b.classList.toggle('sel', b.dataset.t === d.type));
    fillLinkSelect(); document.getElementById('ctx-linkmap').value = d.link_map || '';
    const m = document.getElementById('ctx');
    m.style.left = Math.min(window.innerWidth - 214, e.clientX) + 'px';
    m.style.top = Math.min(window.innerHeight - 230, e.clientY) + 'px';
    m.hidden = false;
  }
  function closeCtx() { document.getElementById('ctx').hidden = true; ctxNode = null; }
  async function ctxType(t) { if (!ctxNode || !SERVER) return; const p = repoRel(ctxNode.url); closeCtx(); const j = await api('/api/type', { path: p, type: t }); if (j.ok) applyMaps(j.maps); else alert(j.error); }
  async function ctxLink(slug) { if (!ctxNode || !SERVER) return; const p = repoRel(ctxNode.url); closeCtx(); const j = await api('/api/link', { path: p, link_map: slug }); if (j.ok) applyMaps(j.maps); else alert(j.error); }
  async function ctxArchive() { if (!ctxNode || !SERVER) return; const n = ctxNode; closeCtx(); if (!confirm('Archive "' + n.name + '"?\nMoves the file to maps-data/.archive/ and removes it + its edges from this map.')) return; const j = await api('/api/archive', { path: repoRel(n.url) }); if (j.ok) applyMaps(j.maps); else alert('Archive: ' + j.error); }

  // ---- map switching + breadcrumb + hash ----
  let suppressHash = false;
  function setHash(slug) { suppressHash = true; location.hash = 'map=' + slug; setTimeout(() => suppressHash = false, 0); }
  function switchMap(slug, noHash) { if (!MAPS.maps[slug]) return; cur = slug; document.getElementById('mapsel').value = slug; if (!noHash) setHash(slug); render(); setTimeout(fit, 40); }
  function jumpMap(slug) { trail = []; switchMap(slug); }
  function drillTo(slug) { if (!MAPS.maps[slug]) { alert('Linked map "' + slug + '" not found.'); return; } trail.push(cur); switchMap(slug); }
  window.addEventListener('hashchange', () => { if (suppressHash) return; const m = (location.hash.match(/map=([^&]+)/) || [])[1]; if (m && MAPS.maps[m] && m !== cur) { trail = []; switchMap(m, true); } });
  function updateBreadcrumb() {
    const bc = document.getElementById('bcrumb');
    if (!trail.length) { bc.hidden = true; return; }
    bc.hidden = false; bc.innerHTML = '';
    trail.forEach((slug, i) => { const a = document.createElement('a'); a.textContent = (MAPS.maps[slug] || {}).title || slug; a.onclick = () => { const target = trail[i]; trail = trail.slice(0, i); switchMap(target); }; bc.appendChild(a); bc.appendChild(document.createTextNode(' › ')); });
    const span = document.createElement('span'); span.textContent = (map() || {}).title || cur; bc.appendChild(span);
  }
  function fillMapSelect() { const s = document.getElementById('mapsel'); s.innerHTML = ''; MAPS.order.forEach(slug => { const o = document.createElement('option'); o.value = slug; o.textContent = (MAPS.maps[slug] || {}).title || slug; s.appendChild(o); }); if (cur) s.value = cur; }
  function fillLinkSelect() { const s = document.getElementById('ctx-linkmap'); s.innerHTML = ''; const o0 = document.createElement('option'); o0.value = ''; o0.textContent = 'Link to map…'; s.appendChild(o0); MAPS.order.filter(sl => sl !== cur).forEach(slug => { const o = document.createElement('option'); o.value = slug; o.textContent = '→ ' + ((MAPS.maps[slug] || {}).title || slug); s.appendChild(o); }); }

  function fit() {
    if (!map() || !map().nodes.length) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    map().nodes.forEach(n => { const { hw, hh } = halfExt(n); minX = Math.min(minX, n.x - hw); maxX = Math.max(maxX, n.x + hw); minY = Math.min(minY, n.y - hh); maxY = Math.max(maxY, n.y + hh); });
    const w = window.innerWidth, h = window.innerHeight, k = Math.min(1.6, Math.min(w / (maxX - minX + 200), h / (maxY - minY + 220)));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(w / 2 - k * cx, h / 2 - k * cy).scale(k));
  }
  function viewCenter() { const t = d3.zoomTransform(svgN); return { x: (window.innerWidth / 2 - t.x) / t.k, y: (window.innerHeight / 2 - t.y) / t.k }; }

  // ---- notes drawer ----
  let edPath = null;
  async function openEditor(d) {
    edPath = repoRel(d.url);
    document.getElementById('ed-title').textContent = d.name; document.getElementById('ed-path').textContent = edPath;
    document.getElementById('ed-msg').textContent = 'Loading…'; document.getElementById('ed-text').value = ''; document.getElementById('editor').hidden = false;
    try { const r = await fetch('/api/doc?path=' + encodeURIComponent(edPath)); const j = await r.json();
      if (!j.ok) { document.getElementById('ed-msg').textContent = 'Error: ' + j.error; return; }
      document.getElementById('ed-text').value = j.content; document.getElementById('ed-msg').textContent = '';
    } catch (e) { document.getElementById('ed-msg').textContent = 'Error: ' + e.message; }
  }
  function closeEditor() { document.getElementById('editor').hidden = true; edPath = null; }
  function revalidateEditor() {   // an SSE re-render may have archived/renamed the open node
    if (!edPath) return;
    const node = (map() ? map().nodes : []).find(n => repoRel(n.url) === edPath);
    if (node) document.getElementById('ed-title').textContent = node.name;
    else document.getElementById('ed-msg').textContent = 'This node was changed or removed elsewhere — reopen to edit.';
  }
  async function saveDoc() { const msg = document.getElementById('ed-msg'); msg.textContent = 'Saving…'; const j = await api('/api/save', { path: edPath, content: document.getElementById('ed-text').value }); if (!j.ok) { msg.textContent = 'Error: ' + j.error; return; } msg.textContent = 'Saved ✓'; if (j.maps) applyMaps(j.maps); }

  async function addMapPrompt() { if (!SERVER) return; const t = prompt('New map name:'); if (t === null) return; const title = t.trim(); if (!title) return; const j = await api('/api/map-add', { title }); if (!j.ok) { alert('Map: ' + j.error); return; } trail = []; cur = j.slug; applyMaps(j.maps); setHash(j.slug); }
  function setConnect(on) { connect.on = on; if (!on) connect.from = null; document.getElementById('addedge').classList.toggle('on', on); document.getElementById('connbar').hidden = !on; }

  // ---- wire UI ----
  document.getElementById('mapsel').onchange = e => jumpMap(e.target.value);
  document.getElementById('fit').onclick = fit;
  document.getElementById('addnode').onclick = () => { const c = viewCenter(); quickAdd(c.x, c.y, window.innerWidth / 2, window.innerHeight / 2); };
  document.getElementById('addmap').onclick = addMapPrompt;
  document.getElementById('addedge').onclick = () => setConnect(!connect.on);
  document.getElementById('lanes').onclick = () => { showLanes = !showLanes; document.getElementById('lanes').classList.toggle('on', showLanes); render(); };
  document.getElementById('ed-close').onclick = closeEditor;
  document.getElementById('ed-save').onclick = saveDoc;
  document.getElementById('ed-openext').onclick = () => { if (edPath) fetch('/api/open?path=' + encodeURIComponent(edPath)).catch(() => {}); };
  document.getElementById('ctx-rename').onclick = () => { const d = ctxNode; closeCtx(); if (d) openRename(d); };
  document.getElementById('ctx-notes').onclick = () => { const d = ctxNode; closeCtx(); if (d) openEditor(d); };
  document.getElementById('ctx-archive').onclick = ctxArchive;
  document.getElementById('ctx-linkmap').onchange = e => ctxLink(e.target.value);
  document.querySelectorAll('#ctx-types button').forEach(b => b.onclick = () => ctxType(b.dataset.t));
  // double-click empty canvas → quick add
  svg.on('dblclick.add', e => { if (e.target.closest('.node') || e.target.closest('.edgegrp')) return; const [mx, my] = d3.pointer(e, canvas.node()); quickAdd(mx, my, e.clientX, e.clientY); });
  document.addEventListener('click', e => { const m = document.getElementById('ctx'); if (!m.hidden && !m.contains(e.target)) closeCtx(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeEditor(); closeCtx(); if (connect.on) setConnect(false); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && !document.getElementById('editor').hidden) { e.preventDefault(); saveDoc(); }
  });

  // ---- boot ----
  fetch('/api/ping').then(r => r.ok).then(ok => {
    SERVER = !!ok;
    if (SERVER) { const es = new EventSource('/api/events'); es.onmessage = ev => { try { applyMaps(JSON.parse(ev.data)); } catch (_) {} }; }
  }).catch(() => { SERVER = false; })
    .finally(() => { document.body.classList.toggle('server', SERVER); document.body.classList.add('checked'); });

  const boot = (location.hash.match(/map=([^&]+)/) || [])[1];
  if (boot && MAPS.maps[boot]) cur = boot;
  fillMapSelect(); fillLinkSelect(); render(); setTimeout(fit, 60);
})();
