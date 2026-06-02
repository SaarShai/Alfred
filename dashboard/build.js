#!/usr/bin/env node
// Build the tree data for the Wanderland dashboard from the markdown source.
// Source of truth: dashboard/wanderland.tree.md  ->  dashboard/data.js
// Static viewer: index.html + app.js (+ vendored d3). No deps. Offline.
// Run: node dashboard/build.js   (then open dashboard/index.html)
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'wanderland.tree.md');
const OUT = path.join(DIR, 'data.js');

function parse(md) {
  const lines = md.split('\n');
  let inFront = false, root = null;
  const stack = [];
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '---') { inFront = !inFront; continue; }
    if (inFront) continue;
    if (line.trim().startsWith('<!--')) continue;
    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) { root = { name: h1[1].trim(), children: [] }; stack.length = 0; stack.push({ depth: -1, node: root }); continue; }
    const m = line.match(/^(\s*)-\s+(.+)$/);
    if (!m || !root) continue;
    const depth = Math.floor(m[1].length / 2);
    const node = { name: m[2].trim(), children: [] };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    const parent = stack.length ? stack[stack.length - 1].node : root;
    parent.children.push(node);
    stack.push({ depth, node });
  }
  (function clean(n) { if (n.children.length === 0) delete n.children; else n.children.forEach(clean); })(root);
  return root;
}

const data = parse(fs.readFileSync(SRC, 'utf8'));
fs.writeFileSync(OUT, 'window.TREE = ' + JSON.stringify(data, null, 2) + ';\n');
const count = (function c(n){ return 1 + (n.children ? n.children.reduce((s,x)=>s+c(x),0) : 0); })(data);
console.log('wrote ' + path.relative(process.cwd(), OUT) + '  (' + count + ' nodes)');
