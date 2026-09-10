const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('_reversa_docs');
const EXCLUDE_DIRS = new Set(['assets', '.tools', '.backup', '.logs']);

function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      walk(path.join(dir, ent.name), out);
    } else if (ent.name.endsWith('.html')) {
      out.push(path.join(dir, ent.name));
    }
  }
}

const pages = [];
walk(ROOT, pages);

const broken = [];
const cdnRefs = [];
const fetchCalls = [];
const missingScripts = [];

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const dir = path.dirname(p);
  const rel = path.relative(ROOT, p).split(path.sep).join('/');

  // CDN scripts
  const cdn = html.match(/<script[^>]+src=["']https?:\/\//g);
  if (cdn) cdn.forEach((c) => cdnRefs.push({ page: rel, ref: c }));

  // fetch calls
  const fetches = html.match(/fetch\s*\(/g);
  if (fetches) fetchCalls.push({ page: rel, count: fetches.length });

  // collect src/href
  const refs = [];
  const re = /(?:src|href)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html)) !== null) refs.push(m[1]);

  for (const r of refs) {
    if (!r || r.startsWith('http://') || r.startsWith('https://') || r.startsWith('#') || r.startsWith('mailto:') || r.startsWith('javascript:') || r.startsWith('data:')) continue;
    const clean = r.split('#')[0];
    if (!clean) continue;
    const target = path.resolve(dir, clean);
    if (!fs.existsSync(target)) {
      broken.push({ page: rel, href: r });
    }
  }
}

const out = {
  pagesChecked: pages.length,
  pages: pages.map((p) => path.relative(ROOT, p).split(path.sep).join('/')),
  brokenLinks: broken,
  cdnRefs,
  fetchCalls,
  missingScripts,
  ok: broken.length === 0 && cdnRefs.length === 0 && fetchCalls.length === 0
};
console.log(JSON.stringify(out, null, 2));
