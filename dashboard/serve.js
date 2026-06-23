// Local app server for the pursuits dashboard.
//  - serves dashboard/ (static)
//  - GET  /api/ping                      -> {ok}
//  - GET  /api/open?path=pursuits/..md   -> opens the doc in the default app (macOS `open`) for editing
//  - POST /api/add  {parent, title, note}-> creates a node doc, wires it as a child, rebuilds data.js
// The WIKI (pursuits/) stays the source of truth; build.js regenerates data.js after each add.
// Run: node dashboard/serve.js [port]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const DASH = __dirname;
const ROOT = path.resolve(DASH, '..');
const PURSUITS = path.join(ROOT, 'pursuits');
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 8777;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/plain' };

const sseClients = new Set();
function broadcast(trees) {
  const msg = 'data:' + JSON.stringify(trees) + '\n\n';
  sseClients.forEach(res => { try { res.write(msg); } catch (e) { sseClients.delete(res); } });
}
const today = () => new Date().toISOString().slice(0, 10);
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function json(res, o, code) { res.writeHead(code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); }
function rebuild(cb) { execFile('node', [path.join(DASH, 'build.js')], { cwd: ROOT }, cb); }

function safePursuits(rel) {
  if (!rel) return null;
  const abs = path.resolve(ROOT, rel);
  if (abs !== PURSUITS && !abs.startsWith(PURSUITS + path.sep)) return null;
  return abs;
}
function titleOf(txt) {
  const t = (txt.match(/^title:\s*(.+)$/m) || [])[1];
  if (t) return t.trim().replace(/^["']|["']$/g, '');
  const h = (txt.match(/^#\s+(.+)$/m) || [])[1];
  return h ? h.trim() : null;
}
function getChildren(txt) {
  const l = (txt.match(/^children:\s*\[(.*)\]\s*$/m) || [])[1];
  return l ? l.split(',').map(s => s.trim()).filter(Boolean) : [];
}
function setChildren(file, slugs) {
  let txt = fs.readFileSync(file, 'utf8');
  const line = 'children: [' + slugs.join(', ') + ']';
  if (/^children:\s*\[.*\]\s*$/m.test(txt)) txt = txt.replace(/^children:\s*\[.*\]\s*$/m, line);
  else txt = txt.replace(/^---\n([\s\S]*?)\n---/, (full, inner) => '---\n' + inner + '\n' + line + '\n---');
  fs.writeFileSync(file, txt);
}
// write node metadata (summary/status/tags) into the frontmatter block only, in one pass.
// frontmatter is the source of truth; a body line with the same key is never touched.
function setMeta(abs, d) {
  let txt = fs.readFileSync(abs, 'utf8');
  const m = txt.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!m) throw new Error('no frontmatter');
  let fm = m[2];
  const set = (key, val) => {
    const re = new RegExp('^' + key + ':[^\\n]*$', 'm');
    if (val == null || val === '') fm = fm.replace(new RegExp('^' + key + ':[^\\n]*\\n?', 'm'), '');   // clear
    else if (re.test(fm)) fm = fm.replace(re, () => key + ': ' + val);                                 // replace
    else fm = fm + '\n' + key + ': ' + val;                                                            // append within fm
  };
  if (d.summary !== undefined) set('summary', d.summary && String(d.summary).trim() ? JSON.stringify(String(d.summary).trim()) : '');
  if (d.status !== undefined) set('status', d.status && String(d.status).trim() ? String(d.status).trim().toLowerCase() : '');
  if (d.tags !== undefined) { const tg = (Array.isArray(d.tags) ? d.tags : []).map(t => String(t).trim().toLowerCase().replace(/,/g, '')).filter(Boolean); set('tags', tg.length ? '[' + tg.join(', ') + ']' : ''); }
  if (/^updated:/m.test(fm)) set('updated', today());   // bump updated only if the node already tracks it (pursuits convention)
  txt = txt.slice(0, m.index) + m[1] + fm + m[3] + txt.slice(m.index + m[0].length);
  fs.writeFileSync(abs, txt);
}
// turn a leaf "<slug>.md" into a branch "<slug>/index.md" so it can hold children
function leafToBranch(file) {
  const dir = file.replace(/\.md$/, '');
  fs.mkdirSync(dir, { recursive: true });
  const idx = path.join(dir, 'index.md');
  fs.writeFileSync(idx, fs.readFileSync(file, 'utf8'));
  fs.unlinkSync(file);
  return idx;
}

// all .md files under pursuits/, excluding the .archive graveyard
function walkMd(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.archive') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(abs, out);
    else if (e.name.endsWith('.md')) out.push(abs);
  }
  return out;
}
// path-stem used in wikilinks: repo-relative, forward slashes, no /index, no .md
function stemOf(abs) {
  return path.relative(ROOT, abs).replace(/\\/g, '/').replace(/\/index\.md$/, '').replace(/\.md$/, '');
}
// rewrite every [[oldStem]] and [[oldStem/...]] across the wiki → newStem (boundary-safe: won't touch old-slug-2)
function rewriteBacklinks(oldStem, newStem) {
  let changed = 0;
  for (const f of walkMd(PURSUITS)) {
    const txt = fs.readFileSync(f, 'utf8');
    const next = txt.split('[[' + oldStem + ']]').join('[[' + newStem + ']]')
                    .split('[[' + oldStem + '/').join('[[' + newStem + '/');
    if (next !== txt) { fs.writeFileSync(f, next); changed++; }
  }
  return changed;
}

function renameNode(rel, newTitle) {
  const abs = safePursuits(rel);
  if (!abs || !fs.existsSync(abs)) throw new Error('not found');
  const title = (newTitle || '').trim();
  if (!title) throw new Error('title required');
  const newSlug = slugify(title);
  if (!newSlug) throw new Error('title has no usable slug characters');

  const isIndex = path.basename(abs) === 'index.md';
  const nodeFsPath = isIndex ? path.dirname(abs) : abs;          // dir (branch) or file (leaf)
  if (isIndex && nodeFsPath === PURSUITS) throw new Error('cannot rename the root');
  const oldSlug = isIndex ? path.basename(nodeFsPath) : path.basename(abs, '.md');
  const parentDir = path.dirname(nodeFsPath);
  const parentIndex = path.join(parentDir, 'index.md');

  // always set the title; only move files when the slug actually changes
  const writeTitle = file => {
    let txt = fs.readFileSync(file, 'utf8');
    if (/^title:\s*.+$/m.test(txt)) txt = txt.replace(/^title:\s*.+$/m, 'title: ' + JSON.stringify(title));
    else txt = txt.replace(/^---\n/, '---\ntitle: ' + JSON.stringify(title) + '\n');
    fs.writeFileSync(file, txt);
  };

  if (newSlug === oldSlug) { writeTitle(abs); return rel; }

  // collision: a sibling leaf OR branch with the target slug already exists
  if (fs.existsSync(path.join(parentDir, newSlug + '.md')) || fs.existsSync(path.join(parentDir, newSlug)))
    throw new Error('a node named "' + newSlug + '" already exists here');

  const oldStem = stemOf(abs);
  writeTitle(abs);
  const dest = isIndex ? path.join(parentDir, newSlug) : path.join(parentDir, newSlug + '.md');
  fs.renameSync(nodeFsPath, dest);
  const newAbs = isIndex ? path.join(dest, 'index.md') : dest;
  const newStem = stemOf(newAbs);

  if (fs.existsSync(parentIndex)) {
    const kids = getChildren(fs.readFileSync(parentIndex, 'utf8')).map(k => k === oldSlug ? newSlug : k);
    setChildren(parentIndex, kids);
  }
  rewriteBacklinks(oldStem, newStem);
  return path.relative(ROOT, newAbs);
}

function addNote(parentRel, title, note) {
  let parentIndex, parentDir;
  if (!parentRel || parentRel === 'root') { parentIndex = path.join(PURSUITS, 'index.md'); parentDir = PURSUITS; }
  else {
    const abs = safePursuits(parentRel);
    if (!abs || !fs.existsSync(abs)) throw new Error('invalid parent');
    if (path.basename(abs) === 'index.md') { parentIndex = abs; parentDir = path.dirname(abs); }
    else { parentIndex = leafToBranch(abs); parentDir = path.dirname(parentIndex); }
  }
  const slug = slugify(title);
  if (!slug) throw new Error('title has no usable slug characters');
  if (fs.existsSync(path.join(parentDir, slug + '.md')) || fs.existsSync(path.join(parentDir, slug)))
    throw new Error('a node named "' + slug + '" already exists here');
  const childFile = path.join(parentDir, slug + '.md');
  const d = today();
  const fm = '---\ntitle: ' + JSON.stringify(title) + '\ntype: node\nstatus: note\ncreated: ' + d + '\nupdated: ' + d + '\ntags: [pursuit-tree, note]\n---\n\n';
  const body = '# ' + title + '\n\n' + (note && note.trim() ? note.trim() + '\n' : '_(empty note — edit me)_\n');
  fs.writeFileSync(childFile, fm + body);
  const kids = getChildren(fs.readFileSync(parentIndex, 'utf8')); kids.push(slug); setChildren(parentIndex, kids);
  return path.relative(ROOT, childFile);
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = decodeURIComponent(u.pathname);

  if (p === '/api/ping') return json(res, { ok: true });

  if (p === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(':\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (p === '/api/open') {
    const abs = safePursuits(u.searchParams.get('path'));
    if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
    execFile('open', [abs], () => {});
    return json(res, { ok: true });
  }

  if (p === '/api/add' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { parent, title, note } = JSON.parse(b || '{}');
        if (!title || !title.trim()) return json(res, { ok: false, error: 'title required' }, 400);
        const created = addNote(parent, title, note);
        rebuild(err => {
          if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
          const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
          const trees = JSON.parse(raw);
          broadcast(trees);
          json(res, { ok: true, created, trees });
        });
      } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); }
    });
    return;
  }

  if (p === '/api/rename' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { path: rel, title } = JSON.parse(b || '{}');
        const created = renameNode(rel, title);
        rebuild(err => {
          if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
          const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
          const trees = JSON.parse(raw);
          broadcast(trees);
          json(res, { ok: true, path: created, trees });
        });
      } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); }
    });
    return;
  }

  if (p === '/api/archive' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { path: rel } = JSON.parse(b || '{}');
        const abs = safePursuits(rel);
        if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
        const isIndex = path.basename(abs) === 'index.md';
        const nodeDir = isIndex ? path.dirname(abs) : null;
        if (isIndex && nodeDir === PURSUITS) return json(res, { ok: false, error: 'cannot archive the root' }, 400);
        const slug = isIndex ? path.basename(nodeDir) : path.basename(abs, '.md');
        const parentDir = isIndex ? path.dirname(nodeDir) : path.dirname(abs);
        const parentIndex = path.join(parentDir, 'index.md');
        const archiveDir = path.join(PURSUITS, '.archive');
        fs.mkdirSync(archiveDir, { recursive: true });
        // pick a non-colliding archive name
        const baseName = isIndex ? slug : slug + '.md';
        let dest = path.join(archiveDir, baseName), n = 2;
        while (fs.existsSync(dest)) dest = path.join(archiveDir, (isIndex ? slug + '-' + n : slug + '-' + n + '.md')), n++;
        fs.renameSync(isIndex ? nodeDir : abs, dest);
        if (fs.existsSync(parentIndex)) {
          const kids = getChildren(fs.readFileSync(parentIndex, 'utf8')).filter(k => k !== slug);
          setChildren(parentIndex, kids);
        }
        rebuild(err => {
          if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
          const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
          const trees = JSON.parse(raw);
          broadcast(trees);
          json(res, { ok: true, trees });
        });
      } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); }
    });
    return;
  }

  if (p === '/api/doc') {
    const abs = safePursuits(u.searchParams.get('path'));
    if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
    const content = fs.readFileSync(abs, 'utf8');
    return json(res, { ok: true, content, title: titleOf(content) });
  }

  if (p === '/api/save' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { path: rel, content } = JSON.parse(b || '{}');
        const abs = safePursuits(rel);
        if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
        if (typeof content !== 'string') return json(res, { ok: false, error: 'no content' }, 400);
        fs.writeFileSync(abs, content);
        rebuild(err => {
          if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
          const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
          const trees = JSON.parse(raw);
          broadcast(trees);
          json(res, { ok: true, title: titleOf(content), trees });
        });
      } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); }
    });
    return;
  }

  if (p === '/api/node-meta' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(b || '{}');
        const abs = safePursuits(d.path);
        if (!abs || !fs.existsSync(abs)) return json(res, { ok: false, error: 'not found' }, 404);
        setMeta(abs, d);
        rebuild(err => {
          if (err) return json(res, { ok: false, error: 'build failed: ' + err.message }, 500);
          const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
          const trees = JSON.parse(raw);
          broadcast(trees);
          json(res, { ok: true, trees });
        });
      } catch (e) { json(res, { ok: false, error: String(e.message || e) }, 400); }
    });
    return;
  }

  // static (dashboard root only)
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
  console.log('dashboard app on ' + url + '  (Ctrl-C to stop)');
  if (!process.env.NO_OPEN) { try { execFile('open', [url], () => {}); } catch (e) {} }
}));

let watchTimer = null;
fs.watch(PURSUITS, { recursive: true }, () => {
  clearTimeout(watchTimer);
  watchTimer = setTimeout(() => rebuild(err => {
    if (err) return;
    const raw = fs.readFileSync(path.join(DASH, 'data.js'), 'utf8').replace(/^window\.TREES = /, '').replace(/;\s*$/, '');
    try { broadcast(JSON.parse(raw)); } catch (_) {}
  }), 300);
});
