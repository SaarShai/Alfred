// Local app server for the process-maps dashboard.
// Source of truth = maps-data/ (markdown). build.js regenerates maps/data.js after each write.
// API: ping, events(SSE), doc, save, add, rename, archive, pos, edge(add/del), map-add, link.
// Run: node maps/serve.js [port]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const DASH = __dirname;                         // maps/
const ROOT = path.resolve(DASH, '..');          // repo root
const SRC = path.join(ROOT, 'maps-data');       // markdown source
const ARCHIVE = path.join(SRC, '.archive');
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 8780;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/plain' };
const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function json(res, o, code) { res.writeHead(code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); }
function rebuild(cb) { execFile('node', [path.join(DASH, 'build.js')], { cwd: ROOT }, cb); }

const sseClients = new Set();
function broadcast(maps) {
  const msg = 'data:' + JSON.stringify(maps) + '\n\n';
  sseClients.forEach(res => { try { res.write(msg); } catch (e) { sseClients.delete(res); } });
}
// rebuild then push fresh window.MAPS to all clients; reply to the caller too
function rebuildAndReply(res, extra) {
  rebuild(err => {
    if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
    const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.MAPS = /, '').replace(/;\s*$/, '');
    const maps = JSON.parse(raw);
    broadcast(maps);
    json(res, Object.assign({ ok: true, maps }, extra || {}));
  });
}

// confine a repo-relative path to maps-data/
function safeSrc(rel) {
  if (!rel) return null;
  const abs = path.resolve(ROOT, rel);
  if (abs !== SRC && !abs.startsWith(SRC + path.sep)) return null;
  return abs;
}
const mapIndex = mapSlug => path.join(SRC, mapSlug, 'index.md');
const mapDirOf = absNode => path.dirname(absNode);
const mapSlugOf = absNode => path.basename(path.dirname(absNode));

// ---- frontmatter helpers (regex, matches build.js) ----
function titleOf(txt) {
  const t = (txt.match(/^title:\s*(.+)$/m) || [])[1];
  if (t) return t.trim().replace(/^["']|["']$/g, '');
  const h = (txt.match(/^#\s+(.+)$/m) || [])[1];
  return h ? h.trim() : null;
}
function setField(txt, key, val) {
  const line = key + ': ' + val;
  const re = new RegExp('^' + key + ':.*$', 'm');
  if (re.test(txt)) return txt.replace(re, line);
  return txt.replace(/^---\n/, '---\n' + line + '\n');        // insert at top of frontmatter
}
function removeField(txt, key) { return txt.replace(new RegExp('^' + key + ':.*\\n', 'm'), ''); }
function getList(txt, key) {
  const l = (txt.match(new RegExp('^' + key + ':\\s*\\[(.*)\\]\\s*$', 'm')) || [])[1];
  return l ? l.split(',').map(s => s.trim()).filter(Boolean) : [];
}
function setList(txt, key, arr) {
  const line = key + ': [' + arr.join(', ') + ']';
  const re = new RegExp('^' + key + ':\\s*\\[.*\\]\\s*$', 'm');
  if (re.test(txt)) return txt.replace(re, line);
  return txt.replace(/^---\n/, '---\n' + line + '\n');
}
function getEdges(txt) {
  const out = [];
  const re = /\{\s*from:\s*([^,}]+?)\s*,\s*to:\s*([^,}]+?)\s*(?:,\s*label:\s*"([^"]*)")?\s*\}/g;
  let m; while ((m = re.exec(txt))) out.push({ from: m[1].trim(), to: m[2].trim(), label: m[3] || '' });
  return out;
}
function setEdges(txt, arr) {
  txt = txt.replace(/^edges:[^\n]*(?:\n[ \t]+[^\n]*)*\n?/m, '');   // strip old block
  const block = 'edges:\n' + arr.map(e => '  - {from: ' + e.from + ', to: ' + e.to + ', label: "' + (e.label || '') + '"}').join('\n') + '\n';
  const close = txt.indexOf('\n---', 3);                            // before closing fence
  if (close === -1) return txt;
  return txt.slice(0, close + 1) + (arr.length ? block : '') + txt.slice(close + 1);
}

// ---- node ops ----
function addNode(mapSlug, title, type, x, y, note, linkMap) {
  const idx = mapIndex(mapSlug);
  if (!fs.existsSync(idx)) throw new Error('unknown map');
  const dir = path.dirname(idx);
  const slug = slugify(title);
  if (!slug) throw new Error('title has no usable slug characters');
  if (fs.existsSync(path.join(dir, slug + '.md'))) throw new Error('a node named "' + slug + '" already exists in this map');
  let fm = '---\ntitle: ' + JSON.stringify(title) + '\ntype: ' + (type || 'step') +
    '\nx: ' + Math.round(x || 120) + '\ny: ' + Math.round(y || 120) + '\n';
  if (linkMap) fm += 'link_map: ' + linkMap + '\n';
  fm += '---\n\n# ' + title + '\n\n' + (note && note.trim() ? note.trim() + '\n' : '_(empty node — edit me)_\n');
  fs.writeFileSync(path.join(dir, slug + '.md'), fm);
  let it = fs.readFileSync(idx, 'utf8');
  const nodes = getList(it, 'nodes'); nodes.push(slug);
  fs.writeFileSync(idx, setList(it, 'nodes', nodes));
  return path.relative(ROOT, path.join(dir, slug + '.md'));
}
function renameNode(rel, title) {
  const abs = safeSrc(rel);
  if (!abs || !fs.existsSync(abs) || path.basename(abs) === 'index.md') throw new Error('not a node');
  const newTitle = (title || '').trim();
  if (!newTitle) throw new Error('title required');
  const newSlug = slugify(newTitle);
  if (!newSlug) throw new Error('title has no usable slug characters');
  const oldSlug = path.basename(abs, '.md');
  const dir = mapDirOf(abs), idx = path.join(dir, 'index.md');
  fs.writeFileSync(abs, setField(fs.readFileSync(abs, 'utf8'), 'title', JSON.stringify(newTitle)));
  if (newSlug === oldSlug) return rel;
  if (fs.existsSync(path.join(dir, newSlug + '.md'))) throw new Error('a node named "' + newSlug + '" already exists in this map');
  fs.renameSync(abs, path.join(dir, newSlug + '.md'));
  // update the map index: nodes list + any edges referencing the old slug
  let it = fs.readFileSync(idx, 'utf8');
  it = setList(it, 'nodes', getList(it, 'nodes').map(s => s === oldSlug ? newSlug : s));
  it = setEdges(it, getEdges(it).map(e => ({ from: e.from === oldSlug ? newSlug : e.from, to: e.to === oldSlug ? newSlug : e.to, label: e.label })));
  fs.writeFileSync(idx, it);
  return path.relative(ROOT, path.join(dir, newSlug + '.md'));
}
function archiveNode(rel) {
  const abs = safeSrc(rel);
  if (!abs || !fs.existsSync(abs) || path.basename(abs) === 'index.md') throw new Error('not a node');
  const slug = path.basename(abs, '.md'), dir = mapDirOf(abs), mapSlug = mapSlugOf(abs), idx = path.join(dir, 'index.md');
  fs.mkdirSync(ARCHIVE, { recursive: true });
  let dest = path.join(ARCHIVE, mapSlug + '__' + slug + '.md'), n = 2;
  while (fs.existsSync(dest)) dest = path.join(ARCHIVE, mapSlug + '__' + slug + '-' + (n++) + '.md');
  fs.renameSync(abs, dest);
  let it = fs.readFileSync(idx, 'utf8');
  it = setList(it, 'nodes', getList(it, 'nodes').filter(s => s !== slug));
  it = setEdges(it, getEdges(it).filter(e => e.from !== slug && e.to !== slug));
  fs.writeFileSync(idx, it);
}
function setPos(rel, x, y) {
  const abs = safeSrc(rel);
  if (!abs || !fs.existsSync(abs)) throw new Error('not found');
  let txt = setField(fs.readFileSync(abs, 'utf8'), 'x', Math.round(x));
  txt = setField(txt, 'y', Math.round(y));
  fs.writeFileSync(abs, txt);
}
function setLink(rel, linkMap) {
  const abs = safeSrc(rel);
  if (!abs || !fs.existsSync(abs) || path.basename(abs) === 'index.md') throw new Error('not a node');
  let txt = fs.readFileSync(abs, 'utf8');
  if (linkMap) { txt = setField(txt, 'link_map', linkMap); txt = setField(txt, 'type', 'subprocess-link'); }
  else { txt = removeField(txt, 'link_map'); txt = setField(txt, 'type', 'step'); }
  fs.writeFileSync(abs, txt);
}
function setType(rel, type) {
  const abs = safeSrc(rel);
  if (!abs || !fs.existsSync(abs) || path.basename(abs) === 'index.md') throw new Error('not a node');
  if (!['step', 'decision', 'subprocess-link'].includes(type)) throw new Error('bad type');
  let txt = setField(fs.readFileSync(abs, 'utf8'), 'type', type);
  if (type !== 'subprocess-link') txt = removeField(txt, 'link_map');   // a non-link node keeps no dangling link
  fs.writeFileSync(abs, txt);
}
// ---- edge ops (slugs, in the map index) ----
function editEdge(mapSlug, from, to, label, remove) {
  const idx = mapIndex(mapSlug);
  if (!fs.existsSync(idx)) throw new Error('unknown map');
  if (!remove && from === to) throw new Error('cannot connect a node to itself');
  let it = fs.readFileSync(idx, 'utf8');
  const all = getEdges(it);
  const existing = all.find(e => e.from === from && e.to === to);
  let edges = all.filter(e => !(e.from === from && e.to === to));   // drop any existing same pair
  // label provided (incl. explicit "") wins; if omitted (undefined/null), keep the existing label on reconnect
  if (!remove) edges.push({ from, to, label: (label !== undefined && label !== null) ? label : ((existing && existing.label) || '') });
  fs.writeFileSync(idx, setEdges(it, edges));
}
function addMap(title) {
  const slug = slugify(title);
  if (!slug) throw new Error('title has no usable slug characters');
  const dir = path.join(SRC, slug);
  if (fs.existsSync(dir)) throw new Error('a map named "' + slug + '" already exists');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.md'),
    '---\ntitle: ' + JSON.stringify(title) + '\ntype: map\nnodes: []\n---\n\n# ' + title + '\n');
  const reg = path.join(SRC, 'index.md');
  let r = fs.readFileSync(reg, 'utf8');
  const maps = getList(r, 'maps'); maps.push(slug);
  fs.writeFileSync(reg, setList(r, 'maps', maps));
  return slug;
}

function body(req, cb) { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { cb(JSON.parse(b || '{}')); } catch (e) { cb(null); } }); }

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = decodeURIComponent(u.pathname);

  if (p === '/api/ping') return json(res, { ok: true });
  if (p === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(':\n\n'); sseClients.add(res); req.on('close', () => sseClients.delete(res));
    return;
  }
  if (p === '/api/open') {
    const abs = safeSrc(u.searchParams.get('path'));
    if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
    execFile('open', [abs], () => {}); return json(res, { ok: true });
  }
  if (p === '/api/doc') {
    const abs = safeSrc(u.searchParams.get('path'));
    if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
    const content = fs.readFileSync(abs, 'utf8');
    return json(res, { ok: true, content, title: titleOf(content) });
  }

  const POST = (route, fn) => { if (p === route && req.method === 'POST') { body(req, d => { if (!d) return json(res, { ok: false, error: 'bad json' }, 400); try { fn(d); } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); } }); return true; } return false; };

  if (POST('/api/save', d => {
    const abs = safeSrc(d.path);
    if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
    if (typeof d.content !== 'string') return json(res, { ok: false, error: 'no content' }, 400);
    fs.writeFileSync(abs, d.content); rebuildAndReply(res, { title: titleOf(d.content) });
  })) return;
  if (POST('/api/add', d => { const created = addNode(d.map, d.title, d.type, d.x, d.y, d.note, d.link_map); rebuildAndReply(res, { created }); })) return;
  if (POST('/api/rename', d => { const np = renameNode(d.path, d.title); rebuildAndReply(res, { path: np }); })) return;
  if (POST('/api/archive', d => { archiveNode(d.path); rebuildAndReply(res); })) return;
  if (POST('/api/pos', d => { setPos(d.path, d.x, d.y); rebuildAndReply(res); })) return;
  if (POST('/api/link', d => { setLink(d.path, d.link_map || ''); rebuildAndReply(res); })) return;
  if (POST('/api/type', d => { setType(d.path, d.type); rebuildAndReply(res); })) return;
  if (POST('/api/edge', d => { editEdge(d.map, d.from, d.to, d.label, !!d.remove); rebuildAndReply(res); })) return;
  if (POST('/api/map-add', d => { const slug = addMap(d.title); rebuildAndReply(res, { slug }); })) return;

  // static (maps/ only)
  let f = (p === '/' || p === '') ? '/index.html' : p;
  const file = path.join(DASH, path.normalize(f).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(DASH)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => rebuild(() => {
  const url = 'http://localhost:' + PORT;
  console.log('maps dashboard on ' + url + '  (Ctrl-C to stop)');
  if (!process.env.NO_OPEN) { try { execFile('open', [url], () => {}); } catch (e) {} }
}));

let watchTimer = null;
try {
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(watchTimer);
    watchTimer = setTimeout(() => rebuild(err => {
      if (err) return;
      const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.MAPS = /, '').replace(/;\s*$/, '');
      try { broadcast(JSON.parse(raw)); } catch (_) {}
    }), 300);
  });
} catch (e) { /* maps-data/ may not exist yet on first boot */ }
