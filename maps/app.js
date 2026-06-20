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
  let wire = null;                                   // active drag-to-connect (drag from a node's right-edge port)
  let showLanes = false;
  let pendingMaps = null;                            // SSE queued during a gesture
  let clickTimer = null;                             // single-click debounced against dblclick
  let dragging = false;                              // node-move in progress (guards mid-drag SSE)
  const seen = new Set();                            // node ids already animated-in (so enter fires once)
  const EMBED = new URLSearchParams(location.search).has('embed');   // true when shown inside a floating sub-map window
  if (EMBED) document.body.classList.add('embed');

  const NS = 'http://www.w3.org/2000/svg';
  const TYPE_COLOR = { step: 'var(--step)', decision: 'var(--decision)', 'subprocess-link': 'var(--link)', reference: 'var(--ref)' };
  const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;   // [[nid|label]] — same syntax as the wiki
  const LANE_VARS = ['--l0', '--l1', '--l2', '--l3', '--l4', '--l5', '--l6'];
  const PAL_HEX = ['#0d9488', '#4f46e5', '#64748b', '#d97706', '#a855f7', '#0ea5e9', '#e11d48',   // matches --l0..--l6
    '#16a34a', '#111827', '#eab308', '#d946ef'];   // + green, black, yellow, magenta

  const svg = d3.select('svg');
  const svgN = svg.node();
  const canvas = svg.append('g');
  const gFrame = canvas.append('g');                  // background boxes (behind everything)
  const gLane = canvas.append('g');
  const gEdge = canvas.append('g');
  const gNode = canvas.append('g');
  const gWire = canvas.append('g');                   // NEVER cleared by render()
  const wirePath = gWire.append('path').attr('id', 'wire-preview').attr('d', '');
  const FRAME_PAL = ['--l0', '--l1', '--l2', '--l3', '--l4', '--l5', '--l6'];
  const zoom = d3.zoom().scaleExtent([0.2, 2.5]).filter(e => !e.target.closest('.node') && !e.target.closest('.frame-grab'))
    .on('zoom', e => {
      let t = e.transform;
      if (!isFinite(t.x) || !isFinite(t.y) || !isFinite(t.k)) {   // self-heal a corrupted (NaN) transform so pan never dies
        t = d3.zoomIdentity.translate(isFinite(t.x) ? t.x : 0, isFinite(t.y) ? t.y : 0).scale(isFinite(t.k) && t.k > 0 ? t.k : 1);
        svgN.__zoom = t;
      }
      canvas.attr('transform', t);
    });
  svg.call(zoom);
  const defs = svg.append('defs');
  const edgeCol = getComputedStyle(document.documentElement).getPropertyValue('--edge').trim();
  const mk = (id, fill) => '<marker id="' + id + '" markerWidth="13" markerHeight="13" refX="10" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 L3,5 Z" fill="' + fill + '"/></marker>';
  defs.html(mk('ah', edgeCol) + mk('ahref', '#6b7280') + PAL_HEX.map((h, i) => mk('ah' + i, h)).join('') +   // default + reference + per-palette colored arrowheads
    '<linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#10b981"/></linearGradient>' +
    '<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.08"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>');

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
  function baseHalf(n) {   // unscaled extents, used for DRAWING the shape
    if (isDiamond(n)) return { hw: Math.max(150, Math.min(300, (n.name || '').length * 8 + 70)) / 2, hh: 35 };
    return { hw: Math.max(120, Math.min(260, (n.name || '').length * 8 + 48)) / 2, hh: 23 };
  }
  function halfExt(n) {   // SCALED extents, used for edge/port canvas-coordinate math
    const b = baseHalf(n), s = n.scale || 1;
    return { hw: b.hw * s, hh: b.hh * s };
  }
  function edgePt(n, tx, ty) {
    const { hw, hh } = halfExt(n);
    const dx = tx - n.x, dy = ty - n.y;
    if (!dx && !dy) return { x: n.x, y: n.y };
    if (isDiamond(n)) { const s = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh); return { x: n.x + dx * s, y: n.y + dy * s }; }  // rhombus boundary, not AABB
    const s = Math.min(dx ? (hw + 2) / Math.abs(dx) : Infinity, dy ? (hh + 2) / Math.abs(dy) : Infinity);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }
  // edges leave the source's right side and enter the target's left side (n8n / React-Flow style)
  const rightPort = n => ({ x: n.x + halfExt(n).hw, y: n.y });
  const leftPort = n => ({ x: n.x - halfExt(n).hw, y: n.y });
  // smooth HORIZONTAL-tangent cubic bezier — big horizontal control handles = pronounced S-curve.
  // bow = vertical offset that separates a bidirectional A<->B pair.
  function edgePath(p1, p2, bow) {
    const k = Math.max(45, Math.abs(p2.x - p1.x) * 0.5);     // handle length scales with horizontal gap
    const c1 = { x: p1.x + k, y: p1.y + (bow || 0) };
    const c2 = { x: p2.x - k, y: p2.y + (bow || 0) };
    return { d: 'M' + p1.x + ',' + p1.y + ' C' + c1.x + ',' + c1.y + ' ' + c2.x + ',' + c2.y + ' ' + p2.x + ',' + p2.y, c1, c2 };
  }
  const cubicMid = (p1, c1, c2, p2) => ({ x: .125 * p1.x + .375 * c1.x + .375 * c2.x + .125 * p2.x, y: .125 * p1.y + .375 * c1.y + .375 * c2.y + .125 * p2.y });

  // lane → stable color (sorted distinct lanes in current map)
  function laneColorMap() {
    const lanes = [...new Set((map() ? map().nodes : []).map(n => n.lane).filter(Boolean))].sort();
    const m = {}; lanes.forEach((l, i) => m[l] = 'var(' + LANE_VARS[i % LANE_VARS.length] + ')'); return m;
  }
  let LANE_COLORS = {};
  const accent = n => (n.color != null ? PAL_HEX[n.color % PAL_HEX.length] : null) || (n.lane && LANE_COLORS[n.lane]) || TYPE_COLOR[n.type] || TYPE_COLOR.step;

  function render() {
    LANE_COLORS = laneColorMap();
    gFrame.selectAll('*').remove(); gLane.selectAll('*').remove(); gEdge.selectAll('*').remove(); gNode.selectAll('*').remove();
    if (!map()) { updateBreadcrumb(); return; }
    const nodes = map().nodes, edges = map().edges;
    const hasOut = new Set(edges.filter(e => e.from !== e.to).map(e => e.from));   // node ids that are a stage (have an outgoing edge) — used for gate-status badges

    // ---- background boxes (frames) — drawn first, behind everything; body is click-through ----
    (map().frames || []).forEach(f => {
      const col = 'var(' + FRAME_PAL[(f.color || 0) % FRAME_PAL.length] + ')';
      const g = gFrame.append('g').attr('class', 'frame').attr('transform', 'translate(' + f.x + ',' + f.y + ')').style('--fc', col);
      g.append('rect').attr('class', 'frame-bg').attr('width', f.w).attr('height', f.h).attr('rx', 18);
      const head = g.append('g').attr('class', 'frame-grab').attr('transform', 'translate(0,0)');
      head.append('rect').attr('class', 'frame-head').attr('width', f.w).attr('height', 26).attr('rx', 13);
      head.append('text').attr('class', 'frame-label').attr('x', 14).attr('y', 14).text(f.label);
      head.on('dblclick', (e) => { e.stopPropagation(); renameFrame(f); })
        .call(d3.drag().clickDistance(4).container(() => gFrame.node())   // gFrame persists across render(); the per-frame g does not
          .on('start', function (e) { e.sourceEvent.stopPropagation(); })
          .on('drag', function (e) { f.x += e.dx; f.y += e.dy; render(); })
          .on('end', function () { if (SERVER) api('/api/frame', { map: cur, op: 'geom', id: f.id, x: f.x, y: f.y, w: f.w, h: f.h }).then(flushPending); }));
      const cyc = g.append('g').attr('class', 'frame-cyc').attr('transform', 'translate(' + (f.w - 34) + ',13)').on('click', (e) => { e.stopPropagation(); cycleFrameColor(f); });
      cyc.append('circle').attr('r', 6).attr('fill', col);
      const del = g.append('g').attr('class', 'frame-del').attr('transform', 'translate(' + (f.w - 14) + ',13)').on('click', (e) => { e.stopPropagation(); delFrame(f); });
      del.append('circle').attr('r', 8).attr('fill', '#e11d48');
      del.append('path').attr('d', 'M-3,-3 L3,3 M3,-3 L-3,3').attr('stroke', '#fff').attr('stroke-width', 1.6).attr('stroke-linecap', 'round');
      const rz = g.append('g').attr('class', 'frame-grab frame-resize').attr('transform', 'translate(' + f.w + ',' + f.h + ')');
      rz.append('rect').attr('x', -18).attr('y', -18).attr('width', 18).attr('height', 18).attr('fill', 'transparent').style('cursor', 'nwse-resize');
      rz.append('path').attr('d', 'M-4,-13 L-13,-4 M-4,-8 L-8,-4').attr('stroke', col).attr('stroke-width', 1.8).attr('stroke-linecap', 'round').attr('opacity', .7);
      rz.call(d3.drag().container(() => gFrame.node())
        .on('start', function (e) { e.sourceEvent.stopPropagation(); })
        .on('drag', function (e) { f.w = Math.max(80, f.w + e.dx); f.h = Math.max(60, f.h + e.dy); render(); })
        .on('end', function () { if (SERVER) api('/api/frame', { map: cur, op: 'geom', id: f.id, x: f.x, y: f.y, w: f.w, h: f.h }).then(flushPending); }));
    });

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
      const p1 = rightPort(a), p2 = leftPort(b);
      const hasReverse = edges.some(o => o.from === e.to && o.to === e.from);
      const bow = e.bend ? e.bend : (hasReverse ? (e.from < e.to ? 22 : -22) : 0);   // manual bend overrides the auto bidirectional bow
      const { d, c1, c2 } = edgePath(p1, p2, bow);
      const stroke = e.color != null ? PAL_HEX[e.color % PAL_HEX.length] : null;
      const g = gEdge.append('g').attr('class', 'edgegrp');
      const vis = g.append('path').attr('class', 'edge').attr('d', d).attr('marker-end', e.color != null ? 'url(#ah' + (e.color % PAL_HEX.length) + ')' : 'url(#ah)');
      if (stroke) vis.style('stroke', stroke);
      if (!stroke) g.append('path').attr('class', 'edge flow').attr('d', d);   // gradient marching-ants only on default-color edges
      g.append('path').attr('class', 'edge hit').attr('d', d).on('dblclick', (ev) => { ev.stopPropagation(); editEdgeLabel(e, p1, c1, c2, p2); });
      const mid = cubicMid(p1, c1, c2, p2);
      if (e.label) {
        const t = g.append('text').attr('class', 'elabel').attr('x', mid.x).attr('y', mid.y).text(e.label);
        const bb = t.node().getBBox();
        g.insert('rect', 'text.elabel').attr('class', 'elabel-bg').attr('x', bb.x - 6).attr('y', bb.y - 3).attr('width', bb.width + 12).attr('height', bb.height + 6).attr('rx', 6);
      }
      // hover controls: bend grab (at midpoint), color cycle (above), delete (below)
      const ctrl = g.append('g').attr('class', 'edge-ctrl');
      ctrl.append('circle').attr('class', 'edge-bend').attr('cx', mid.x).attr('cy', mid.y).attr('r', 9)
        .call(d3.drag().container(() => canvas.node())     // canvas persists across render()
          .on('start', ev => ev.sourceEvent.stopPropagation())
          .on('drag', ev => { e.bend = (e.bend || 0) + ev.dy; render(); })
          .on('end', () => { if (SERVER) { const n = nidSlug(); api('/api/edge', { map: cur, from: n[e.from], to: n[e.to], bend: Math.round(e.bend || 0) }).then(flushPending); } }));
      const cyc = ctrl.append('g').attr('transform', 'translate(' + mid.x + ',' + (mid.y - 20) + ')').style('cursor', 'pointer').on('click', (ev) => { ev.stopPropagation(); cycleEdgeColor(e); });
      cyc.append('circle').attr('r', 7).attr('fill', stroke || 'var(--edge)').attr('stroke', '#fff').attr('stroke-opacity', .4);
      const del = ctrl.append('g').attr('transform', 'translate(' + mid.x + ',' + (mid.y + 20) + ')').style('cursor', 'pointer').on('click', (ev) => { ev.stopPropagation(); deleteEdge(e); });
      del.append('circle').attr('r', 7).attr('fill', '#e11d48');
      del.append('path').attr('d', 'M-2.5,-2.5 L2.5,2.5 M2.5,-2.5 L-2.5,2.5').attr('stroke', '#fff').attr('stroke-width', 1.5).attr('stroke-linecap', 'round');
    });

    // ---- nodes ----
    const sel = gNode.selectAll('g.node').data(nodes, d => d.id).enter().append('g')
      .attr('class', d => 'node' + (d.link_map ? ' linkable' : '') + (d.hl ? ' hl' : '') + ((!dragging && !seen.has(d.id)) ? ' enter' : ''))   // enter fires once per node
      .style('--accent', d => accent(d))
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ') scale(' + (d.scale || 1) + ')')
      .on('click', (e, d) => { clearTimeout(clickTimer); clickTimer = setTimeout(() => { clickTimer = null; onNodeClick(d); }, 220); })   // defer so dblclick can cancel
      .on('dblclick', (e, d) => { e.stopPropagation(); clearTimeout(clickTimer); clickTimer = null; closeEditor(); openRename(d); })
      .on('contextmenu', (e, d) => { e.preventDefault(); clearTimeout(clickTimer); clickTimer = null; openCtx(e, d); })
      .call(d3.drag().clickDistance(5)
        .on('start', function (e) { if (wire && wire.active) return; dragging = true; document.body.classList.add('dragging'); e.sourceEvent.stopPropagation(); })
        .on('drag', function (e, d) { if (wire && wire.active) return; d.x = e.x; d.y = e.y; render(); })
        .on('end', function (e, d) { if (wire && wire.active) return; dragging = false; document.body.classList.remove('dragging'); if (SERVER) api('/api/pos', { path: repoRel(d.url), x: d.x, y: d.y }).then(flushPending); else flushPending(); }));

    sel.each(function (d) {
      const g = d3.select(this), { hw, hh } = baseHalf(d), col = accent(d);   // draw at base size; the node g carries scale()
      const inner = g.append('g').attr('class', 'node-inner');   // hover lift/scale live here so they never fight d3.drag's transform on .node
      if (isDiamond(d)) {
        const pts = [[0, -hh], [hw, 0], [0, hh], [-hw, 0]].map(p => p.join(',')).join(' ');
        inner.append('polygon').attr('class', 'shape').attr('points', pts).attr('fill', 'var(--card-glass)').attr('stroke', col).attr('stroke-width', 2.2);
        inner.append('polygon').attr('class', 'sheen').attr('points', pts).attr('fill', 'url(#glass)');
      } else {
        inner.append('rect').attr('class', 'shape').attr('x', -hw).attr('y', -hh).attr('width', hw * 2).attr('height', hh * 2).attr('rx', 11).attr('fill', 'var(--card-glass)').attr('stroke', col).attr('stroke-width', 2.2);
        inner.append('rect').attr('class', 'sheen').attr('x', -hw).attr('y', -hh).attr('width', hw * 2).attr('height', hh * 2).attr('rx', 11).attr('fill', 'url(#glass)');
      }
      inner.append('text').attr('class', 'label').text(d.name);
      if (d.type === 'subprocess-link' || d.type === 'reference') {
        const bd = inner.append('g').attr('transform', 'translate(' + (-hw + 2) + ',' + (-hh + 2) + ')');
        bd.append('circle').attr('r', 9).attr('fill', col);
        bd.append('text').attr('class', 'typeglyph').text(d.type === 'reference' ? '§' : '▸');
      }
      // gate-status badge (top-right): ✓ = gated · ! = a stage with no gate (would FAIL the workflow export)
      // reference nodes are source-of-truth, not stages — never flag them for a missing gate
      const gated = d.gate && String(d.gate).trim();
      if (gated || (hasOut.has(d.id) && d.type !== 'reference')) {
        const gb = inner.append('g').attr('class', 'gatebadge').attr('transform', 'translate(' + (hw - 2) + ',' + (-hh + 2) + ')');
        gb.append('circle').attr('r', 8).attr('fill', gated ? 'var(--link)' : 'var(--decision)');
        gb.append('text').attr('class', 'typeglyph').attr('font-size', '11px').text(gated ? '✓' : '!');
        gb.append('title').text(gated ? 'gate: ' + gated : 'stage has no gate — add one (right-click → Gate) before the workflow can run');
      }
      // connection port (right edge) — on the outer group so the hover lift doesn't move the wire anchor
      g.append('circle').attr('class', 'port').attr('cx', hw).attr('cy', 0).attr('r', 5);
      g.append('circle').attr('class', 'port-hit').attr('cx', hw).attr('cy', 0).attr('r', 14)
        .on('pointerdown', (e) => beginWire(e, d))
        .on('click', (e) => e.stopPropagation());        // a stationary port tap must not bubble to the node
    });
    nodes.forEach(n => seen.add(n.id));   // mark animated so a re-render (drag/SSE) won't replay enter

    // ---- knowledge ghosts: mirrors of SoT nodes that live in another map ----
    // each stored ghost {ref,x,y} resolves (by nid, then slug/name) to a real node elsewhere
    const ghosts = (map().ghosts || []).map(g => { const hit = resolveRef(g.ref); return hit ? { ref: g.ref, _src: g, x: g.x, y: g.y, name: hit.node.name, type: hit.node.type, color: hit.node.color, homeTitle: (MAPS.maps[hit.map] || {}).title || hit.map, sameMap: hit.map === cur } : null; }).filter(Boolean);
    const ghostByKey = {}; ghosts.forEach(gh => { const hit = resolveRef(gh.ref); if (hit) ghostByKey[hit.node.id] = gh; ghostByKey[gh.ref] = gh; });

    // dashed reference edges: any node citing [[ref]] → the ghost of that ref in this map (drawn in gEdge, behind nodes)
    nodes.forEach(n => (n.refs || []).forEach(rf => {
      const hit = resolveRef(rf.target), gh = ghostByKey[hit ? hit.node.id : rf.target] || ghostByKey[rf.target];
      if (!gh) return;
      const p1 = rightPort(n), gb = baseHalf(gh), p2 = { x: gh.x - gb.hw - 2, y: gh.y };
      const { d } = edgePath(p1, p2, 0);
      gEdge.append('path').attr('class', 'edge ref').attr('d', d).attr('marker-end', 'url(#ahref)');
    }));

    // ghost shapes (dashed, grey, § badge, "↗ home-map" subtitle) — click jumps to the real node; drag repositions
    const gsel = gNode.selectAll('g.ghost').data(ghosts, d => d.ref).enter().append('g')
      .attr('class', 'ghost').attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      .on('click', (e, d) => { e.stopPropagation(); gotoRef(d.ref); })
      .on('contextmenu', (e, d) => { e.preventDefault(); openGhostCtx(e, d); })
      .call(d3.drag().clickDistance(5)
        .on('start', function (e) { dragging = true; document.body.classList.add('dragging'); e.sourceEvent.stopPropagation(); })
        .on('drag', function (e, d) { d._src.x = e.x; d._src.y = e.y; render(); })
        .on('end', function (e, d) { dragging = false; document.body.classList.remove('dragging'); if (SERVER) api('/api/ghost', { map: cur, op: 'move', ref: d.ref, x: Math.round(d._src.x), y: Math.round(d._src.y) }).then(flushPending); else flushPending(); }));
    gsel.each(function (d) {
      const g = d3.select(this), { hw, hh } = baseHalf(d);
      g.append('rect').attr('class', 'ghost-shape').attr('x', -hw).attr('y', -hh).attr('width', hw * 2).attr('height', hh * 2).attr('rx', 11);
      g.append('text').attr('class', 'ghost-label').text(d.name);
      g.append('text').attr('class', 'ghost-sub').attr('y', hh + 12).text('↗ ' + d.homeTitle);
      const bd = g.append('g').attr('transform', 'translate(' + (-hw + 2) + ',' + (-hh + 2) + ')');
      bd.append('circle').attr('r', 9).attr('fill', 'var(--ref)');
      bd.append('text').attr('class', 'typeglyph').text('§');
      g.append('title').text('Source of truth — lives in "' + d.homeTitle + '". Click to open · right-click to unpin.');
    });

    updateBreadcrumb();
    syncLibToggle();
  }

  function ripple(x, y) {   // transient pulse in the never-cleared gWire so render() can't kill it mid-animation
    const c = gWire.append('circle').attr('class', 'ripple').attr('cx', x).attr('cy', y).attr('r', 8);
    const node = c.node();
    node.addEventListener('animationend', () => c.remove());
    setTimeout(() => { try { c.remove(); } catch (_) {} }, 800);   // fallback so they never accumulate
  }

  function onNodeClick(d) {
    ripple(d.x, d.y);
    if (d.link_map) { if (EMBED) drillTo(d.link_map); else openPip(d.link_map); return; }   // top level: float a window; inside a window: drill in place
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
    wirePath.attr('d', edgePath(rightPort(src), { x: mx, y: my }, 0).d);
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
      if (fs && ts) { ripple(tgt.x, tgt.y); addEdge(fs, ts); } else flushPending();
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
  async function cycleEdgeColor(e) { if (!SERVER) return; const next = e.color == null ? 0 : (e.color + 1 >= PAL_HEX.length ? null : e.color + 1); const ns = nidSlug(); const j = await api('/api/edge', { map: cur, from: ns[e.from], to: ns[e.to], color: next }); if (j.ok) applyMaps(j.maps); }
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

  // ---- context menu (right-click): type · size · highlight · color · link · archive ----
  let ctxNode = null;
  function openCtx(e, d) {
    ctxNode = d; closeEditor();
    document.getElementById('ctx-title').textContent = d.name;
    document.querySelectorAll('#ctx-types button').forEach(b => b.classList.toggle('sel', b.dataset.t === d.type));
    document.getElementById('ctx-size').textContent = Math.round((d.scale || 1) * 100) + '%';
    document.getElementById('ctx-hl').classList.toggle('on', !!d.hl);
    fillSwatches(d);
    fillLinkSelect(); document.getElementById('ctx-linkmap').value = d.link_map || '';
    document.getElementById('ctx-gate').value = d.gate || '';
    const m = document.getElementById('ctx');
    m.style.left = Math.min(window.innerWidth - 214, e.clientX) + 'px';
    m.style.top = Math.min(window.innerHeight - 300, e.clientY) + 'px';
    m.hidden = false;
  }
  function closeCtx() { document.getElementById('ctx').hidden = true; ctxNode = null; }
  function fillSwatches(d) {
    const box = document.getElementById('ctx-colors'); box.innerHTML = '';
    const clear = document.createElement('div'); clear.className = 'sw clear' + (d.color == null ? ' sel' : ''); clear.textContent = '○'; clear.title = 'Default (lane/type)';
    clear.onclick = () => ctxColor(null); box.appendChild(clear);
    PAL_HEX.forEach((hex, i) => { const s = document.createElement('div'); s.className = 'sw' + (d.color === i ? ' sel' : ''); s.style.background = hex; s.onclick = () => ctxColor(i); box.appendChild(s); });
  }
  async function nodeStyle(patch) { if (!ctxNode || !SERVER) return; const j = await api('/api/node-style', Object.assign({ path: repoRel(ctxNode.url) }, patch)); if (j.ok) applyMaps(j.maps); else alert(j.error); }
  async function ctxType(t) { if (!ctxNode || !SERVER) return; const p = repoRel(ctxNode.url); closeCtx(); const j = await api('/api/type', { path: p, type: t }); if (j.ok) applyMaps(j.maps); else alert(j.error); }
  function ctxSize(dir) { if (!ctxNode) return; const s = Math.max(0.5, Math.min(2.5, (ctxNode.scale || 1) * (dir > 0 ? 1.15 : 1 / 1.15))); document.getElementById('ctx-size').textContent = Math.round(s * 100) + '%'; ctxNode.scale = s; nodeStyle({ scale: +s.toFixed(3) }); }
  function ctxHighlight() { if (!ctxNode) return; const hl = !ctxNode.hl; ctxNode.hl = hl; document.getElementById('ctx-hl').classList.toggle('on', hl); nodeStyle({ hl }); }
  function ctxColor(i) { if (!ctxNode) return; ctxNode.color = i; fillSwatches(ctxNode); nodeStyle({ color: i }); }
  async function ctxLink(slug) { if (!ctxNode || !SERVER) return; const p = repoRel(ctxNode.url); closeCtx(); const j = await api('/api/link', { path: p, link_map: slug }); if (j.ok) applyMaps(j.maps); else alert(j.error); }
  async function ctxArchive() { if (!ctxNode || !SERVER) return; const n = ctxNode; closeCtx(); if (!confirm('Archive "' + n.name + '"?\nMoves the file to maps-data/.archive/ and removes it + its edges from this map.')) return; const j = await api('/api/archive', { path: repoRel(n.url) }); if (j.ok) applyMaps(j.maps); else alert('Archive: ' + j.error); }
  async function doUndo() { if (!SERVER) return; const j = await api('/api/undo', {}); if (j.ok) applyMaps(j.maps); }

  // ---- map switching + breadcrumb + hash ----
  let suppressHash = false;
  function setHash(slug) { suppressHash = true; location.hash = 'map=' + slug; setTimeout(() => suppressHash = false, 0); }
  function switchMap(slug, noHash) { if (!MAPS.maps[slug]) return; cur = slug; seen.clear(); document.getElementById('mapsel').value = slug; if (!noHash) setHash(slug); render(); setTimeout(fit, 40); }
  function jumpMap(slug) { trail = []; switchMap(slug); }
  function drillTo(slug) { if (!MAPS.maps[slug]) { alert('Linked map "' + slug + '" not found.'); return; } trail.push(cur); switchMap(slug); }

  // ---- floating sub-map windows (picture-in-picture): a link node opens its map as a draggable/resizable iframe over the top map ----
  let pipZ = 0, pipCount = 0;
  const openPips = {};                                // slug -> window el (one window per map; re-focus if already open)
  function openPip(slug) {
    if (!MAPS.maps[slug]) { alert('Linked map "' + slug + '" not found.'); return; }
    if (openPips[slug]) { raisePip(openPips[slug]); return; }
    const host = document.getElementById('pips');
    const win = document.createElement('div'); win.className = 'pip';
    const off = (pipCount++ % 6) * 26, w = 480, h = 340;
    win.style.left = Math.max(16, (window.innerWidth - w) / 2 + off) + 'px';
    win.style.top = Math.max(64, (window.innerHeight - h) / 2 - 30 + off) + 'px';
    win.style.width = w + 'px'; win.style.height = h + 'px'; win.style.zIndex = ++pipZ;
    win.innerHTML =
      '<div class="pip-bar"><span class="pip-title"></span>' +
      '<button class="pip-max" title="Maximize — open this map full-screen">⤢</button>' +
      '<button class="pip-close" title="Close">✕</button></div>' +
      '<div class="pip-body"><iframe></iframe><div class="pip-cover"></div></div>' +
      '<div class="pip-resize"></div>';
    win.querySelector('.pip-title').textContent = (MAPS.maps[slug] || {}).title || slug;
    win.querySelector('iframe').src = '?embed=1#map=' + encodeURIComponent(slug);
    host.appendChild(win); openPips[slug] = win;
    win.addEventListener('pointerdown', () => raisePip(win), true);
    win.querySelector('.pip-close').onclick = () => closePip(slug);
    win.querySelector('.pip-max').onclick = () => { closePip(slug); drillTo(slug); };
    dragPip(win, win.querySelector('.pip-bar'), false);
    dragPip(win, win.querySelector('.pip-resize'), true);
  }
  function raisePip(win) { win.style.zIndex = ++pipZ; }
  function closePip(slug) { const w = openPips[slug]; if (w) { w.remove(); delete openPips[slug]; } }

  // ---- auto-tidy: lay nodes out left-to-right by flow order (longest-path layering) ----
  async function tidyLayout() {
    if (!SERVER) return;
    const m = map(); if (!m || !m.nodes.length) return;
    const nodes = m.nodes, edges = (m.edges || []).filter(e => e.from !== e.to);
    const byid = {}; nodes.forEach(n => byid[n.id] = n);
    const out = {}, indeg = {}; nodes.forEach(n => { out[n.id] = []; indeg[n.id] = 0; });
    edges.forEach(e => { if (byid[e.from] && byid[e.to]) { out[e.from].push(e.to); indeg[e.to]++; } });
    const q = nodes.filter(n => indeg[n.id] === 0).map(n => n.id), order = [], deg = Object.assign({}, indeg);
    while (q.length) { const id = q.shift(); order.push(id); out[id].forEach(t => { if (--deg[t] === 0) q.push(t); }); }
    const layer = {}; nodes.forEach(n => layer[n.id] = 0);
    order.forEach(id => out[id].forEach(t => { layer[t] = Math.max(layer[t], layer[id] + 1); }));
    let maxL = 0; Object.values(layer).forEach(l => maxL = Math.max(maxL, l));
    const placed = new Set(order); nodes.forEach(n => { if (!placed.has(n.id)) layer[n.id] = maxL + 1; });   // cyclic leftovers → trailing column
    const cols = {}; nodes.forEach(n => (cols[layer[n.id]] = cols[layer[n.id]] || []).push(n));
    const COLGAP = 280, ROWGAP = 150, X0 = 160, CY = 320;
    Object.keys(cols).map(Number).sort((a, b) => a - b).forEach(L => {
      cols[L].forEach((n, i) => { n.x = X0 + L * COLGAP; n.y = CY + (i - (cols[L].length - 1) / 2) * ROWGAP; });
    });
    render(); setTimeout(fit, 60);
    api('/api/poslist', { map: cur, positions: nodes.map(n => ({ path: repoRel(n.url), x: Math.round(n.x), y: Math.round(n.y) })) }).then(flushPending);
  }
  function dragPip(win, handle, resize) {
    handle.addEventListener('pointerdown', e => {
      if (!resize && e.target.closest('button')) return;
      e.preventDefault(); e.stopPropagation(); raisePip(win); win.classList.add('busy');
      const sx = e.clientX, sy = e.clientY, ox = win.offsetLeft, oy = win.offsetTop, ow = win.offsetWidth, oh = win.offsetHeight;
      const mv = ev => {
        if (resize) { win.style.width = Math.max(240, ow + ev.clientX - sx) + 'px'; win.style.height = Math.max(170, oh + ev.clientY - sy) + 'px'; }
        else { win.style.left = Math.max(0, ox + ev.clientX - sx) + 'px'; win.style.top = Math.max(0, oy + ev.clientY - sy) + 'px'; }
      };
      const up = () => { win.classList.remove('busy'); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
  }
  window.addEventListener('hashchange', () => { if (suppressHash) return; const m = (location.hash.match(/map=([^&]+)/) || [])[1]; if (m && MAPS.maps[m] && m !== cur) { trail = []; switchMap(m, true); } });
  function updateBreadcrumb() {
    const bc = document.getElementById('bcrumb');
    if (!trail.length) { bc.hidden = true; return; }
    bc.hidden = false; bc.innerHTML = '';
    trail.forEach((slug, i) => { const a = document.createElement('a'); a.textContent = (MAPS.maps[slug] || {}).title || slug; a.onclick = () => { const target = trail[i]; trail = trail.slice(0, i); switchMap(target); }; bc.appendChild(a); bc.appendChild(document.createTextNode(' › ')); });
    const span = document.createElement('span'); span.textContent = (map() || {}).title || cur; bc.appendChild(span);
  }
  // parent→child map relationships, derived from subprocess-link nodes (node.link_map points at a child map)
  function mapParents() {
    const parentOf = {};                                   // childSlug -> parentSlug (first referencing parent wins)
    MAPS.order.forEach(slug => {
      const m = MAPS.maps[slug]; if (!m) return;
      (m.nodes || []).forEach(n => { if (n.link_map && MAPS.maps[n.link_map] && n.link_map !== slug && !parentOf[n.link_map]) parentOf[n.link_map] = slug; });
    });
    return parentOf;
  }
  function fillMapSelect() {
    const s = document.getElementById('mapsel'); s.innerHTML = '';
    const parentOf = mapParents(), shown = new Set();
    const emit = (slug, depth) => {
      if (shown.has(slug) || !MAPS.maps[slug]) return; shown.add(slug);
      const o = document.createElement('option'); o.value = slug;
      o.textContent = (depth ? '  '.repeat(depth) + '└ ' : '') + ((MAPS.maps[slug] || {}).title || slug);
      s.appendChild(o);
      MAPS.order.forEach(c => { if (parentOf[c] === slug) emit(c, depth + 1); });   // children nest under parent, keep registry order
    };
    MAPS.order.forEach(slug => { if (!parentOf[slug]) emit(slug, 0); });   // top-level maps (not anyone's child)
    MAPS.order.forEach(slug => emit(slug, 0));                             // leftovers (cyclic link refs) — never drop a map
    if (cur) s.value = cur;
  }
  function fillLinkSelect() { const s = document.getElementById('ctx-linkmap'); s.innerHTML = ''; const o0 = document.createElement('option'); o0.value = ''; o0.textContent = 'Link to map…'; s.appendChild(o0); MAPS.order.filter(sl => sl !== cur).forEach(slug => { const o = document.createElement('option'); o.value = slug; o.textContent = '→ ' + ((MAPS.maps[slug] || {}).title || slug); s.appendChild(o); }); }

  function fit() {
    if (!map() || !map().nodes.length) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    map().nodes.forEach(n => { const { hw, hh } = halfExt(n); minX = Math.min(minX, n.x - hw); maxX = Math.max(maxX, n.x + hw); minY = Math.min(minY, n.y - hh); maxY = Math.max(maxY, n.y + hh); });
    const w = window.innerWidth, h = window.innerHeight, k = Math.min(1.6, Math.min(w / (maxX - minX + 200), h / (maxY - minY + 220)));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    if (!isFinite(k) || k <= 0 || !isFinite(cx) || !isFinite(cy)) return;   // never push a NaN/degenerate transform
    svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(w / 2 - k * cx, h / 2 - k * cy).scale(k));
  }
  function viewCenter() { const t = d3.zoomTransform(svgN); return { x: (window.innerWidth / 2 - t.x) / t.k, y: (window.innerHeight / 2 - t.y) / t.k }; }

  // ---- background boxes (frames) ----
  async function addFrame() {
    if (!SERVER || !cur) { alert('Create a map first.'); return; }
    const c = viewCenter();
    const j = await api('/api/frame', { map: cur, op: 'add', x: Math.round(c.x - 180), y: Math.round(c.y - 120), w: 360, h: 240, label: 'Group' });
    if (j.ok) applyMaps(j.maps); else alert('Box: ' + j.error);
  }
  function renameFrame(f) {
    if (!SERVER) return;
    const t = d3.zoomTransform(svgN), pt = t.apply([f.x + 80, f.y + 13]);
    showNameInput(pt[0], pt[1], f.label, async label => { const j = await api('/api/frame', { map: cur, op: 'set', id: f.id, label }); if (j.ok) applyMaps(j.maps); });
  }
  async function delFrame(f) {
    if (!SERVER) return;
    if (!confirm('Delete the box "' + f.label + '"?  (nodes inside are not affected)')) return;
    const j = await api('/api/frame', { map: cur, op: 'del', id: f.id }); if (j.ok) applyMaps(j.maps);
  }
  async function cycleFrameColor(f) {
    if (!SERVER) return;
    const j = await api('/api/frame', { map: cur, op: 'set', id: f.id, color: ((f.color || 0) + 1) % FRAME_PAL.length }); if (j.ok) applyMaps(j.maps);
  }

  // ---- notes drawer ----
  let edPath = null, edNode = null;
  // rename title+slug by double-clicking the title in the drawer
  function renameFromDrawer(d) {
    const r = document.getElementById('ed-title').getBoundingClientRect();
    showNameInput(r.left + r.width / 2, r.top + 12, d.name, async title => {
      if (!title || title === d.name) return;
      const j = await api('/api/rename', { path: repoRel(d.url), title });
      if (j.ok) { if (j.path) { edPath = j.path; if (edNode) edNode.url = '../' + j.path; } applyMaps(j.maps); document.getElementById('ed-title').textContent = title; }
      else alert('Rename: ' + j.error);
    });
  }
  async function openEditor(d) {
    document.getElementById('exportpanel').hidden = true;
    edPath = repoRel(d.url); edNode = d;
    document.getElementById('ed-title').textContent = d.name; document.getElementById('ed-path').textContent = edPath;
    document.getElementById('ed-msg').textContent = 'Loading…'; document.getElementById('ed-text').value = ''; document.getElementById('editor').hidden = false;
    try { const r = await fetch('/api/doc?path=' + encodeURIComponent(edPath)); const j = await r.json();
      if (!j.ok) { document.getElementById('ed-msg').textContent = 'Error: ' + j.error; return; }
      document.getElementById('ed-text').value = j.content; document.getElementById('ed-msg').textContent = ''; renderRefs(j.content);
    } catch (e) { document.getElementById('ed-msg').textContent = 'Error: ' + e.message; }
  }
  function closeEditor() { document.getElementById('editor').hidden = true; edPath = null; edNode = null; document.getElementById('ed-refs').hidden = true; }
  function revalidateEditor() {   // an SSE re-render may have archived/renamed the open node
    if (!edPath) return;
    const node = (map() ? map().nodes : []).find(n => repoRel(n.url) === edPath);
    if (node) document.getElementById('ed-title').textContent = node.name;
    else document.getElementById('ed-msg').textContent = 'This node was changed or removed elsewhere — reopen to edit.';
  }
  async function saveDoc() { const msg = document.getElementById('ed-msg'); msg.textContent = 'Saving…'; const j = await api('/api/save', { path: edPath, content: document.getElementById('ed-text').value }); if (!j.ok) { msg.textContent = 'Error: ' + j.error; return; } msg.textContent = 'Saved ✓'; if (j.maps) applyMaps(j.maps); }

  // ---- cross-map wiki references: a node body may cite [[nid|label]] (any map) — same syntax as the wiki ----
  function nidIndex() {   // nid -> {map, node} across ALL maps
    const ix = {};
    MAPS.order.forEach(slug => { const m = MAPS.maps[slug]; if (!m) return; (m.nodes || []).forEach(n => { if (n.id && !ix[n.id]) ix[n.id] = { map: slug, node: n }; }); });
    return ix;
  }
  function resolveRef(target) {   // by nid first (rename-safe), then fall back to slug/name
    const ix = nidIndex(); if (ix[target]) return ix[target];
    let hit = null; MAPS.order.some(slug => { const n = (MAPS.maps[slug].nodes || []).find(x => x.slug === target || x.name === target); if (n) { hit = { map: slug, node: n }; return true; } return false; });
    return hit;
  }
  function focusNode(n) {   // center the viewport on one node (supersedes fit's transition since it starts later)
    const w = window.innerWidth, h = window.innerHeight, k = Math.min(1.4, d3.zoomTransform(svgN).k || 1);
    svg.transition().duration(450).call(zoom.transform, d3.zoomIdentity.translate(w / 2 - k * n.x, h / 2 - k * n.y).scale(k));
  }
  function openGhostCtx(e, d) {   // right-click a ghost → unpin it from this map (citation + SoT node stay; Undo restores)
    if (!SERVER) return;
    api('/api/ghost', { map: cur, op: 'del', ref: d.ref }).then(j => { if (j.ok) applyMaps(j.maps); });
  }
  function gotoRef(target) {
    const hit = resolveRef(target); if (!hit) return false;
    const open = () => { const n = (MAPS.maps[hit.map].nodes || []).find(x => x.id === hit.node.id) || hit.node; focusNode(n); openEditor(n); };
    if (hit.map !== cur) { trail = []; switchMap(hit.map); setTimeout(open, 120); } else open();
    return true;
  }
  function renderRefs(text) {
    const box = document.getElementById('ed-refs'); box.innerHTML = '';
    const links = []; let m; WIKILINK_RE.lastIndex = 0;
    while ((m = WIKILINK_RE.exec(text || ''))) { const parts = m[1].split('|'); links.push({ target: (parts[0] || '').trim(), label: (parts[1] || parts[0] || '').trim() }); }
    if (!links.length) { box.hidden = true; return; }
    box.hidden = false;
    const lab = document.createElement('span'); lab.className = 'lbl'; lab.textContent = 'References'; box.appendChild(lab);
    links.forEach(l => {
      const stub = l.target.startsWith('?'), tgt = stub ? l.target.slice(1) : l.target;
      const hit = stub ? null : resolveRef(tgt);
      const chip = document.createElement('span');
      chip.className = 'refchip' + (hit || stub ? '' : ' broken');
      chip.innerHTML = '<span class="ic">§</span>' + (l.label || tgt);
      if (hit) { chip.title = '→ ' + (hit.node.name || tgt) + '  (' + hit.map + ')'; chip.onclick = () => gotoRef(tgt); }
      else if (stub) { chip.title = 'Not written yet (stub)'; chip.style.opacity = '.55'; chip.style.cursor = 'default'; }
      else { chip.title = 'Unresolved: ' + tgt; }
      box.appendChild(chip);
    });
  }

  // ---- knowledge picker: cite a SoT node from the right-clicked node + pin a ghost of it here ----
  let kpCiting = null, kpAll = [];
  function openKnowPick(d) {
    if (!SERVER) return; kpCiting = d; closeCtx();
    kpAll = [];
    MAPS.order.forEach(slug => { const m = MAPS.maps[slug]; if (!m) return; (m.nodes || []).forEach(n => { if (n.id === d.id) return; kpAll.push({ id: n.id, name: n.name, type: n.type, mapTitle: m.title || slug }); }); });
    kpAll.sort((a, b) => (a.type === 'reference' ? 0 : 1) - (b.type === 'reference' ? 0 : 1) || a.name.localeCompare(b.name));   // SoT nodes first
    document.getElementById('kp-search').value = ''; renderKpList('');
    document.getElementById('knowpick').hidden = false;
    setTimeout(() => document.getElementById('kp-search').focus(), 0);
  }
  function renderKpList(q) {
    const box = document.getElementById('kp-list'); box.innerHTML = '';
    const ql = q.trim().toLowerCase();
    const items = kpAll.filter(it => !ql || it.name.toLowerCase().includes(ql) || it.mapTitle.toLowerCase().includes(ql)).slice(0, 60);
    if (!items.length) { const e = document.createElement('div'); e.className = 'kp-foot'; e.textContent = 'No matches.'; box.appendChild(e); return; }
    items.forEach(it => {
      const row = document.createElement('div'); row.className = 'kp-item';
      const col = it.type === 'reference' ? 'var(--ref)' : (TYPE_COLOR[it.type] || TYPE_COLOR.step);
      const g = document.createElement('span'); g.className = 'kp-glyph'; g.style.background = col; g.textContent = it.type === 'reference' ? '§' : '•';
      const nm = document.createElement('span'); nm.className = 'kp-name'; nm.textContent = it.name;
      const mp = document.createElement('span'); mp.className = 'kp-map'; mp.textContent = it.mapTitle;
      row.append(g, nm, mp); row.onclick = () => pickKnow(it); box.appendChild(row);
    });
  }
  async function pickKnow(it) {
    if (!kpCiting || !SERVER) return;
    const d = kpCiting, x = Math.round(d.x + halfExt(d).hw + 150), y = Math.round(d.y + 90);
    closeKnowPick();
    const j = await api('/api/link-knowledge', { map: cur, path: repoRel(d.url), ref: it.id, label: it.name, x, y });
    if (j.ok) applyMaps(j.maps); else alert('Link: ' + j.error);
  }
  function closeKnowPick() { document.getElementById('knowpick').hidden = true; kpCiting = null; }
  // mark/unmark the current map as a SoT library (kind: reference)
  function syncLibToggle() { const m = map(), on = !!(m && m.kind === 'reference'); document.getElementById('libtoggle').classList.toggle('on', on); document.body.classList.toggle('libmap', on); }
  async function toggleLibrary() {
    if (!SERVER || !cur) return; const m = map();
    const j = await api('/api/map-kind', { map: cur, kind: (m && m.kind === 'reference') ? 'process' : 'reference' });
    if (j.ok) applyMaps(j.maps); else alert(j.error);
  }

  // inline (not prompt(): blocked in sandboxed preview iframes) — new top-level map, then switch to it
  function addMapPrompt() {
    if (!SERVER) return;
    showNameInput(window.innerWidth / 2, 70, '', async title => {
      if (!title) return;
      const j = await api('/api/map-add', { title });
      if (!j.ok) { alert('Map: ' + j.error); return; }
      trail = []; cur = j.slug; applyMaps(j.maps); setHash(j.slug);
    });
  }
  // turn a node into a sub-process: create a new map and link this node to it in one step
  function ctxNewSubmap() {
    if (!ctxNode || !SERVER) return;
    const d = ctxNode, t = d3.zoomTransform(svgN), [sx, sy] = t.apply([d.x, d.y]);
    closeCtx();
    showNameInput(sx, sy - 30, d.name, async title => {       // default the sub-map name to the node's name
      if (!title) return;
      const j = await api('/api/map-add', { title });
      if (!j.ok) { alert('Map: ' + j.error); return; }
      const j2 = await api('/api/link', { path: repoRel(d.url), link_map: j.slug });
      if (j2.ok) applyMaps(j2.maps); else alert('Link: ' + j2.error);
    });
  }

  // ---- workflow export (map → loop spec + agent Markdown, validated by loop_lint.py) ----
  async function openExport() {
    if (!SERVER || !cur) return;
    closeEditor(); closeCtx();
    const $ = id => document.getElementById(id);
    $('ex-map').textContent = (map() || {}).title || cur;
    const v = $('ex-verdict'); v.className = 'ex-verdict'; v.textContent = 'Generating…';
    $('ex-issues').innerHTML = ''; $('ex-spec').textContent = ''; $('ex-md').textContent = ''; $('ex-msg').textContent = '';
    $('exportpanel').hidden = false;
    try {
      const r = await fetch('/api/export?map=' + encodeURIComponent(cur)); const j = await r.json();
      if (!j.ok) { v.className = 'ex-verdict fail'; v.textContent = 'Error: ' + j.error; return; }
      $('ex-spec').textContent = j.spec; $('ex-md').textContent = j.markdown;
      const code = j.lint && j.lint.code;
      if (code === 0) { v.className = 'ex-verdict pass'; v.textContent = '✓ loop_lint: valid workflow — gate · stop · budget · separate verifier'; }
      else if (code === 1) { v.className = 'ex-verdict warn'; v.textContent = '⚠ loop_lint: valid, with warnings'; }
      else if (code === 2) { v.className = 'ex-verdict fail'; v.textContent = '✗ loop_lint: not a runnable workflow yet — fix the issues below'; }
      else { v.className = 'ex-verdict warn'; v.textContent = 'Spec generated — loop_lint did not run'; }
      const ul = $('ex-issues');
      (j.issues || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
      if (code && j.lint && j.lint.output) {
        const detail = j.lint.output.split('\n').filter(l => /\[(FAIL|WARN)\]/.test(l)).slice(0, 5).join(' · ');
        if (detail) { const li = document.createElement('li'); li.textContent = 'loop_lint → ' + detail; ul.appendChild(li); }
      }
    } catch (e) { v.className = 'ex-verdict fail'; v.textContent = 'Error: ' + e.message; }
  }
  async function copyText(t, what) { try { await navigator.clipboard.writeText(t); document.getElementById('ex-msg').textContent = 'Copied ' + what + ' ✓'; } catch (_) { document.getElementById('ex-msg').textContent = 'Copy failed — select the text manually'; } }

  // ---- wire UI ----
  document.getElementById('mapsel').onchange = e => jumpMap(e.target.value);
  document.getElementById('fit').onclick = fit;
  document.getElementById('tidy').onclick = tidyLayout;
  document.getElementById('addnode').onclick = () => { const c = viewCenter(); quickAdd(c.x, c.y, window.innerWidth / 2, window.innerHeight / 2); };
  document.getElementById('addmap').onclick = addMapPrompt;
  document.getElementById('addbox').onclick = addFrame;
  document.getElementById('lanes').onclick = () => { showLanes = !showLanes; document.getElementById('lanes').classList.toggle('on', showLanes); render(); };
  document.getElementById('undo').onclick = doUndo;
  document.getElementById('export').onclick = openExport;
  document.getElementById('ex-close').onclick = () => document.getElementById('exportpanel').hidden = true;
  document.getElementById('ex-copyspec').onclick = () => copyText(document.getElementById('ex-spec').textContent, 'spec');
  document.getElementById('ex-copymd').onclick = () => copyText(document.getElementById('ex-md').textContent, 'workflow');
  { const cg = document.getElementById('ctx-gate');
    cg.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); cg.blur(); } };
    cg.onblur = () => { if (ctxNode) nodeStyle({ gate: cg.value.trim() }); }; }
  document.getElementById('ed-close').onclick = closeEditor;
  document.getElementById('ed-save').onclick = saveDoc;
  document.getElementById('ed-text').addEventListener('input', e => renderRefs(e.target.value));   // live-update reference chips as you type [[…]]
  document.getElementById('libtoggle').onclick = toggleLibrary;
  document.getElementById('kp-x').onclick = closeKnowPick;
  document.getElementById('kp-search').addEventListener('input', e => renderKpList(e.target.value));
  document.getElementById('ctx-linkknow').onclick = () => { if (ctxNode) openKnowPick(ctxNode); };
  document.getElementById('ed-openext').onclick = () => { if (edPath) fetch('/api/open?path=' + encodeURIComponent(edPath)).catch(() => {}); };
  document.getElementById('ed-title').ondblclick = () => { if (edNode) renameFromDrawer(edNode); };   // rename title+slug from the side panel
  document.getElementById('ctx-smaller').onclick = () => ctxSize(-1);
  document.getElementById('ctx-bigger').onclick = () => ctxSize(1);
  document.getElementById('ctx-hl').onclick = ctxHighlight;
  document.getElementById('ctx-archive').onclick = ctxArchive;
  document.getElementById('ctx-newsub').onclick = ctxNewSubmap;
  document.getElementById('ctx-linkmap').onchange = e => ctxLink(e.target.value);
  document.querySelectorAll('#ctx-types button').forEach(b => b.onclick = () => ctxType(b.dataset.t));
  // double-click empty canvas → quick add
  svg.on('dblclick.add', e => { if (e.target.closest('.node') || e.target.closest('.edgegrp') || e.target.closest('.frame-grab')) return; const [mx, my] = d3.pointer(e, canvas.node()); quickAdd(mx, my, e.clientX, e.clientY); });
  svg.on('contextmenu.add', e => { if (e.target.closest('.node') || e.target.closest('.edgegrp') || e.target.closest('.frame-grab')) return; e.preventDefault(); closeCtx(); const [mx, my] = d3.pointer(e, canvas.node()); quickAdd(mx, my, e.clientX, e.clientY); });
  document.addEventListener('click', e => { const m = document.getElementById('ctx'); if (!m.hidden && !m.contains(e.target)) closeCtx(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeEditor(); closeCtx(); closeKnowPick(); document.getElementById('exportpanel').hidden = true; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && !document.getElementById('editor').hidden) { e.preventDefault(); saveDoc(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      const a = document.activeElement, typing = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
      if (!typing) { e.preventDefault(); doUndo(); }   // let the browser do native text-undo inside fields
    }
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
