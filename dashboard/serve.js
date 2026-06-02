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
const PORT = Number(process.argv[2]) || 8777;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/plain' };
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
// turn a leaf "<slug>.md" into a branch "<slug>/index.md" so it can hold children
function leafToBranch(file) {
  const dir = file.replace(/\.md$/, '');
  fs.mkdirSync(dir, { recursive: true });
  const idx = path.join(dir, 'index.md');
  fs.writeFileSync(idx, fs.readFileSync(file, 'utf8'));
  fs.unlinkSync(file);
  return idx;
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
  let base = slugify(title) || 'note', slug = base, i = 2;
  while (fs.existsSync(path.join(parentDir, slug + '.md')) || fs.existsSync(path.join(parentDir, slug))) slug = base + '-' + (i++);
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
          json(res, { ok: true, created, trees: JSON.parse(raw) });
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
          json(res, { ok: true, title: titleOf(content), trees: JSON.parse(raw) });
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
}).listen(PORT, () => rebuild(() => console.log('dashboard app on http://localhost:' + PORT)));
