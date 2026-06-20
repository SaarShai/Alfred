#!/usr/bin/env node
// Build the process-maps dashboard data by walking maps-data/ (source of truth).
//   maps-data/index.md            -> registry: `maps: [slug, ...]` (menu order)
//   maps-data/<map>/index.md      -> a map: `nodes: [slug,...]` + `edges:` list
//   maps-data/<map>/<node>.md     -> a node: title, type, x, y, lane?, link_map?
// Output: maps/data.js  (window.MAPS = { order:[...], maps:{ slug:{...} } })
// Node identity is a stable `nid:` (minted + written back), like the pursuits build.
// No deps. Offline. Run: node maps/build.js
'use strict';
const fs = require('fs');
const path = require('path');

const MAPS = __dirname;                       // maps/
const ROOT = path.resolve(MAPS, '..');        // repo root
const SRC = path.join(ROOT, 'maps-data');
const OUT = path.join(MAPS, 'data.js');

const warnings = [];
let nodeCount = 0;

// unquote a frontmatter scalar. JSON.stringify'd values (title:/gate:) decode via JSON.parse; bare values strip one quote pair.
function clean(s) { if (s == null) return null; s = String(s).trim(); if (/^".*"$/s.test(s)) { try { return JSON.parse(s); } catch (_) {} } return s.replace(/^["']|["']$/g, ''); }
// decode a label group captured WITH its surrounding quotes (JSON string); tolerates legacy/hand-edited values.
function jparse(s) { if (s == null) return ''; try { return JSON.parse(s); } catch (_) { return String(s).replace(/^"|"$/g, ''); } }
function fmBlock(txt) { const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/); return m ? m[1] : ''; }   // \r? tolerates CRLF: else the whole block fails to parse and nid/title/x/y all read null
function field(fm, key) { const m = fm.match(new RegExp('^' + key + ':\\s*(.+)$', 'm')); return m ? clean(m[1]) : null; }
function listField(fm, key) {
  const m = fm.match(new RegExp('^' + key + ':\\s*\\[(.*)\\]\\s*$', 'm'));
  return m ? m[1].split(',').map(s => s.trim()).filter(Boolean) : [];
}
// parse the `edges:` block: a sequence of `- {from: a, to: b, label: "..."}` lines
function edgesField(fm) {
  const out = [];
  const re = /\{\s*from:\s*([^,}]+?)\s*,\s*to:\s*([^,}]+?)\s*(?:,\s*label:\s*("(?:[^"\\]|\\.)*"))?\s*(?:,\s*bend:\s*(-?\d+))?\s*(?:,\s*color:\s*(\d+))?\s*(?:,\s*route:\s*([a-z]+))?\s*\}/g;
  let m;
  while ((m = re.exec(fm))) out.push({ from: clean(m[1]), to: clean(m[2]), label: jparse(m[3]), bend: m[4] != null ? +m[4] : 0, color: m[5] != null ? +m[5] : null, route: m[6] || 'bezier' });
  return out;
}
// citations in a node body: [[nid|label]] — same syntax as the wiki. Skips [[?stub]] (not-yet-written).
function refsOf(body) {
  const out = [], seen = new Set(), re = /\[\[([^\]]+)\]\]/g;
  let m; while ((m = re.exec(body))) {
    const parts = m[1].split('|'), tgt = (parts[0] || '').trim();
    if (!tgt || tgt.startsWith('?') || seen.has(tgt)) continue;
    seen.add(tgt); out.push({ target: tgt, label: (parts[1] || parts[0] || '').trim() });
  }
  return out;
}
// parse the `frames:` block: `- {id: f1, label: "..", x: N, y: N, w: N, h: N, color: N}` (background boxes)
function framesField(fm) {
  const out = [];
  const re = /\{\s*id:\s*([^,}]+?)\s*,\s*label:\s*("(?:[^"\\]|\\.)*")\s*,\s*x:\s*(-?\d+)\s*,\s*y:\s*(-?\d+)\s*,\s*w:\s*(\d+)\s*,\s*h:\s*(\d+)\s*(?:,\s*color:\s*(\d+))?\s*\}/g;
  let m;
  while ((m = re.exec(fm))) out.push({ id: clean(m[1]), label: jparse(m[2]), x: +m[3], y: +m[4], w: +m[5], h: +m[6], color: m[7] != null ? +m[7] : 0 });
  return out;
}

// stable per-node/map id, persists across renames; minted + written back into the file
const usedIds = new Set();
function genId(prefix) { let id; do { id = prefix + Math.random().toString(36).slice(2, 7); } while (usedIds.has(id)); usedIds.add(id); return id; }
function ensureNid(file, fm, prefix) {
  const existing = field(fm, 'nid');
  if (existing) { usedIds.add(existing); return existing; }
  const nid = genId(prefix);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^---\r?\n/, () => '---\nnid: ' + nid + '\n'));   // \r? so the write-back actually lands on CRLF files (else the nid churns every build)
  return nid;
}

function readNode(mapSlug, nodeSlug) {
  const file = path.join(SRC, mapSlug, nodeSlug + '.md');
  if (!fs.existsSync(file)) { warnings.push('missing node: ' + mapSlug + '/' + nodeSlug); return null; }
  const txt = fs.readFileSync(file, 'utf8');
  const fm = fmBlock(txt);
  const nid = ensureNid(file, fm, 'n');
  const h1 = (txt.match(/^#\s+(.+)$/m) || [])[1];
  const x = Number(field(fm, 'x')); const y = Number(field(fm, 'y'));
  const scale = Number(field(fm, 'scale')); const color = field(fm, 'color');
  const body = txt.replace(/^---\n[\s\S]*?\n---\n?/, '');   // body sans frontmatter — for [[wiki]] citations
  nodeCount++;
  return {
    id: nid,
    slug: nodeSlug,
    name: field(fm, 'title') || (h1 && h1.trim()) || nodeSlug,
    type: field(fm, 'type') || 'step',
    refs: refsOf(body),                          // [{target,label}] — knowledge this node cites (rendered as a tray below it)
    refsCollapsed: field(fm, 'refs_collapsed') === 'true',   // tray box collapsed?

    x: Number.isFinite(x) ? x : null,
    y: Number.isFinite(y) ? y : null,
    lane: field(fm, 'lane') || null,
    link_map: field(fm, 'link_map') || null,
    gate: field(fm, 'gate') || null,            // per-stage pass/fail check (for the loop-spec export)
    scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    hl: field(fm, 'hl') === 'true',
    color: color != null && color !== '' ? +color : null,   // palette-index override of lane/type accent
    url: path.relative(MAPS, file),
  };
}

function readMap(mapSlug) {
  const idx = path.join(SRC, mapSlug, 'index.md');
  if (!fs.existsSync(idx)) { warnings.push('missing map index: ' + mapSlug); return null; }
  const txt = fs.readFileSync(idx, 'utf8');
  const fm = fmBlock(txt);
  const mid = ensureNid(idx, fm, 'm');
  const nodeSlugs = listField(fm, 'nodes');
  const nodes = nodeSlugs.map(s => readNode(mapSlug, s)).filter(Boolean);
  const bySlug = {}; nodes.forEach(n => { bySlug[n.slug] = n.id; });
  // seed any node missing x/y onto a simple staggered grid so it's never stacked at origin
  let gi = 0;
  nodes.forEach(n => { if (n.x == null || n.y == null) { n.x = 120 + (gi % 5) * 240; n.y = 120 + Math.floor(gi / 5) * 160; gi++; } });
  const edges = edgesField(fm).map(e => {
    const from = bySlug[e.from], to = bySlug[e.to];
    if (!from) warnings.push('edge from unknown node: ' + mapSlug + '/' + e.from);
    if (!to) warnings.push('edge to unknown node: ' + mapSlug + '/' + e.to);
    return (from && to) ? { from, to, label: e.label || '', bend: e.bend || 0, color: e.color != null ? e.color : null, route: e.route || 'bezier' } : null;
  }).filter(Boolean);
  const frames = framesField(fm);
  const kind = field(fm, 'kind') || 'process';   // 'reference' = a SoT library map (no flow / workflow)
  return { slug: mapSlug, id: mid, title: field(fm, 'title') || mapSlug, kind, url: path.relative(MAPS, idx), nodes, edges, frames };
}

// Build maps/data.js from maps-data/. Callable in-process (serve.js) AND as a CLI.
// Returns the {order, maps} object so the server can broadcast it without re-reading data.js.
function build() {
  warnings.length = 0; nodeCount = 0; usedIds.clear();   // reset module state → repeated in-process builds are independent
  const registry = path.join(SRC, 'index.md');
  if (!fs.existsSync(registry)) throw new Error('missing maps-data/index.md');
  const order = listField(fmBlock(fs.readFileSync(registry, 'utf8')), 'maps');
  const maps = {};
  order.forEach(slug => { const m = readMap(slug); if (m) maps[slug] = m; });
  const out = { order: order.filter(s => maps[s]), maps };
  fs.writeFileSync(OUT, 'window.MAPS = ' + JSON.stringify(out, null, 2) + ';\n');
  return out;
}

module.exports = { build };

if (require.main === module) {   // CLI: node build.js
  const out = build();
  console.log('wrote ' + path.relative(process.cwd(), OUT) + '  (' + out.order.length + ' maps, ' + nodeCount + ' nodes)');
  if (warnings.length) { console.log('WARNINGS:'); warnings.forEach(w => console.log('  - ' + w)); }
}
