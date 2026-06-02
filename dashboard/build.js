#!/usr/bin/env node
// Build the forest data for the pursuits dashboard from the markdown source.
// Source of truth: dashboard/pursuits.md  ->  dashboard/data.js  (window.TREES = [...])
// Each "# Heading" = a separate tree. Static viewer: index.html + app.js (+ vendored d3).
// No deps. Offline. Run: node dashboard/build.js   (then open dashboard/index.html)
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'pursuits.md');
const OUT = path.join(DIR, 'data.js');

function parse(md) {
  const lines = md.split('\n');
  let inFront = false, root = null, stack = [];
  const trees = [];
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '---') { inFront = !inFront; continue; }
    if (inFront) continue;
    if (line.trim().startsWith('<!--')) continue;
    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) { root = { name: h1[1].trim(), children: [] }; trees.push(root); stack = [{ depth: -1, node: root }]; continue; }
    const m = line.match(/^(\s*)-\s+(.+)$/);
    if (!m || !root) continue;
    const depth = Math.floor(m[1].length / 2);
    const node = { name: m[2].trim(), children: [] };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    (stack.length ? stack[stack.length - 1].node : root).children.push(node);
    stack.push({ depth, node });
  }
  (function clean(n) { if (!n.children) return; if (n.children.length === 0) delete n.children; else n.children.forEach(clean); });
  trees.forEach(function walk(n) { if (!n.children) return; if (n.children.length === 0) delete n.children; else n.children.forEach(walk); });
  return trees;
}

const trees = parse(fs.readFileSync(SRC, 'utf8'));
fs.writeFileSync(OUT, 'window.TREES = ' + JSON.stringify(trees, null, 2) + ';\n');
const count = n => 1 + (n.children ? n.children.reduce((s, x) => s + count(x), 0) : 0);
const total = trees.reduce((s, t) => s + count(t), 0);
console.log('wrote ' + path.relative(process.cwd(), OUT) + '  (' + trees.length + ' trees, ' + total + ' nodes)');
