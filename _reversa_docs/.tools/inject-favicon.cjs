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

const LINK = (rel) => '<link rel="icon" type="image/svg+xml" href="' + rel + 'assets/img/favicon.svg">';

let changed = 0, skipped = 0;
for (const p of pages) {
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('rel="icon"')) { skipped++; continue; }
  const depth = path.relative(ROOT, path.dirname(p)).split(path.sep).filter(Boolean).length;
  const rel = '../'.repeat(depth);
  const link = LINK(rel);
  // insere logo após o fechamento do <title>
  const idx = html.indexOf('</title>');
  if (idx < 0) { console.log('sem <title>: ' + p); continue; }
  html = html.slice(0, idx + '</title>'.length) + '\n  ' + link + html.slice(idx + '</title>'.length);
  fs.writeFileSync(p, html, 'utf8');
  changed++;
  console.log('ok: ' + path.relative(ROOT, p).split(path.sep).join('/') + ' -> ' + link);
}
console.log('alteradas=' + changed + ' puladas=' + skipped);
