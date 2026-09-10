const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('_reversa_docs');
const EXCLUDE = new Set(['assets', '.tools', '.backup', '.logs']);

function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (!EXCLUDE.has(ent.name)) walk(full, out); }
    else if (ent.name.endsWith('.html')) out.push(full);
  }
}

const pages = [];
walk(ROOT, pages);

const MARKER = 'data-theme="light"';
const BOOT = '<script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("rv-theme")==="light"?"light":"dark");}catch(e){}</script>';

let changed = 0, skipped = 0;
for (const p of pages) {
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('localStorage.getItem("rv-theme")')) { skipped++; continue; }
  const anchor = '<meta charset="UTF-8">';
  const idx = html.indexOf(anchor);
  if (idx < 0) { console.log('sem <meta charset>: ' + p); continue; }
  html = html.slice(0, idx + anchor.length) + '\n  ' + BOOT + html.slice(idx + anchor.length);
  fs.writeFileSync(p, html, 'utf8');
  changed++;
}
console.log('bootstrap de tema injetado em ' + changed + ' páginas (' + skipped + ' já tinham)');
