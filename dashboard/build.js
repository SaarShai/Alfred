#!/usr/bin/env node
// Build the pursuits dashboard data by WALKING THE WIKI (source of truth).
// Roots: pursuits/index.md `children:`. Each node is a wiki page:
//   branch -> <slug>/index.md (its own `children:` list)   leaf -> <slug>.md
// Output: dashboard/data.js  (window.TREES = [{name, url, children?}, ...])
// Node `url` is relative to dashboard/, so dashboard nodes can open the doc.
// No deps. Offline. Run: node dashboard/build.js
'use strict';
const fs = require('fs');
const path = require('path');

const DASH = __dirname;
const ROOT = path.resolve(DASH, '..');
const PURSUITS = path.join(ROOT, 'pursuits');
const OUT = path.join(DASH, 'data.js');

const warnings = [];
let nodeCount = 0;

function frontmatter(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  const fm = m ? m[1] : '';
  const title = (fm.match(/^title:\s*(.+)$/m) || [])[1];
  const childLine = (fm.match(/^children:\s*\[(.*)\]\s*$/m) || [])[1];
  const nid = (fm.match(/^nid:\s*(.+)$/m) || [])[1];
  const summary = (fm.match(/^summary:\s*(.+)$/m) || [])[1];
  const status = (fm.match(/^status:\s*(.+)$/m) || [])[1];
  const tagLine = (fm.match(/^tags:\s*\[(.*)\]\s*$/m) || [])[1];
  const h1 = (txt.match(/^#\s+(.+)$/m) || [])[1];
  const st = clean(status);
  return {
    title: clean(title) || (h1 && h1.trim()) || null,
    nid: clean(nid),
    children: childLine ? childLine.split(',').map(s => s.trim()).filter(Boolean) : [],
    summary: clean(summary) || null,                                    // 1-line purpose (NodeInfo panel)
    status: st ? st.toLowerCase() : null,                               // tolerant: lowercased; null when absent
    tags: tagLine ? tagLine.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [],
  };
}
function clean(s) { return s == null ? null : s.trim().replace(/^["']|["']$/g, ''); }

// --- self-healing normalization -------------------------------------------
// Keep a node doc's BODY consistent with its frontmatter/tree position, so a
// title edit (frontmatter `title:`) made in the dashboard or by hand can't
// leave a stale H1 / `## Children` list / `## Parent` link behind.
// Conservative: frontmatter is the source of truth; only rewrites sections
// that already exist; writes only when something actually changed.
function selfWiki(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/').replace(/\/index\.md$/, '').replace(/\.md$/, '');
}
function replaceSection(txt, heading, bullets) {
  const m = txt.match(new RegExp('^## ' + heading + '[ \\t]*$', 'm'));
  if (!m) return txt;                                   // section absent -> leave structure alone
  const bodyStart = txt.indexOf('\n', m.index) + 1;
  const rest = txt.slice(bodyStart);
  const rel = rest.search(/\n## |\n<!-- pursuit-rollup/);
  const end = rel === -1 ? txt.length : bodyStart + rel;
  const trail = (txt.slice(bodyStart, end).match(/\n*$/) || [''])[0]; // preserve trailing blank lines
  return txt.slice(0, bodyStart) + bullets.join('\n') + trail + txt.slice(end);
}
function normalize(file, fm, parentWiki) {
  let txt = fs.readFileSync(file, 'utf8');
  const orig = txt;
  if (fm.title) txt = txt.replace(/^#[ \t]+.+$/m, () => '# ' + fm.title);            // H1 mirrors title
  if (fm.children.length) {                                                          // ## Children mirrors frontmatter
    const base = selfWiki(file);
    txt = replaceSection(txt, 'Children', fm.children.map(c => '- [[' + base + '/' + c + ']]'));
  }
  if (parentWiki) txt = replaceSection(txt, 'Parent', ['- [[' + parentWiki + ']]']);  // ## Parent mirrors tree
  if (txt !== orig) fs.writeFileSync(file, txt);
}

// stable per-node id: persists across renames/leaf→branch conversions, so view-state (size, position) survives
const usedIds = new Set();
function genId() { let id; do { id = 'n' + Math.random().toString(36).slice(2, 8); } while (usedIds.has(id)); usedIds.add(id); return id; }
function ensureNid(file, existing) {
  if (existing) { usedIds.add(existing); return existing; }
  const nid = genId();
  const txt = fs.readFileSync(file, 'utf8').replace(/^---\n/, '---\nnid: ' + nid + '\n');
  fs.writeFileSync(file, txt);
  return nid;
}

// resolve a child slug living in baseDir; return {file, dir(if branch)}
function resolve(baseDir, slug) {
  const branchIndex = path.join(baseDir, slug, 'index.md');
  if (fs.existsSync(branchIndex)) return { file: branchIndex, dir: path.join(baseDir, slug) };
  const leaf = path.join(baseDir, slug + '.md');
  if (fs.existsSync(leaf)) return { file: leaf, dir: null };
  return null;
}

function build(baseDir, slug, trail) {
  const r = resolve(baseDir, slug);
  if (!r) { warnings.push('missing node: ' + path.join(baseDir, slug) + ' (referenced by ' + trail + ')'); return null; }
  const fm = frontmatter(r.file);
  normalize(r.file, fm, path.relative(ROOT, baseDir).replace(/\\/g, '/'));
  nodeCount++;
  const node = {
    name: fm.title || slug,
    id: ensureNid(r.file, fm.nid),
    url: path.relative(DASH, r.file),
  };
  if (fm.summary) node.summary = fm.summary;                 // surfaced in the NodeInfo panel
  if (fm.status) node.status = fm.status;
  if (fm.tags && fm.tags.length) node.tags = fm.tags;
  if (r.dir && fm.children.length) {
    node.children = fm.children.map(c => build(r.dir, c, slug)).filter(Boolean);
    if (!node.children.length) delete node.children;
  }
  return node;
}

const rootIndex = path.join(PURSUITS, 'index.md');
if (!fs.existsSync(rootIndex)) { console.error('missing pursuits/index.md'); process.exit(1); }
const roots = frontmatter(rootIndex).children;
const trees = roots.map(slug => build(PURSUITS, slug, 'pursuits/index.md')).filter(Boolean);

fs.writeFileSync(OUT, 'window.TREES = ' + JSON.stringify(trees, null, 2) + ';\n');
console.log('wrote ' + path.relative(process.cwd(), OUT) + '  (' + trees.length + ' trees, ' + nodeCount + ' nodes)');
if (warnings.length) { console.log('WARNINGS:'); warnings.forEach(w => console.log('  - ' + w)); }
