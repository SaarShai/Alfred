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
  const h1 = (txt.match(/^#\s+(.+)$/m) || [])[1];
  return {
    title: clean(title) || (h1 && h1.trim()) || null,
    nid: clean(nid),
    children: childLine ? childLine.split(',').map(s => s.trim()).filter(Boolean) : [],
  };
}
function clean(s) { return s == null ? null : s.trim().replace(/^["']|["']$/g, ''); }

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
  nodeCount++;
  const node = {
    name: fm.title || slug,
    id: ensureNid(r.file, fm.nid),
    url: path.relative(DASH, r.file),
  };
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
