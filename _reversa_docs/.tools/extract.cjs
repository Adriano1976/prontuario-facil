const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');
const SRC = path.join(ROOT, 'src');
const BASE44 = path.join(ROOT, 'base44');

const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const LANG = { '.js': 'js', '.jsx': 'jsx', '.ts': 'ts', '.tsx': 'tsx', '.css': 'css', '.jsonc': 'jsonc', '.json': 'json' };

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
}

function locOf(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/);
  let n = 0;
  for (const l of lines) if (l.trim().length > 0) n++;
  return n;
}

function relFromRoot(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function groupFor(rel) {
  // rel like "src/components/appointments/Foo.jsx"
  const parts = rel.split('/');
  const name = parts.pop(); // filename
  if (parts.length === 0) return 'root';
  if (parts[0] === 'src') {
    const rest = parts.slice(1);
    if (rest.length === 0) return 'root';
    if (rest[0] === 'components' && rest.length >= 2) {
      return 'components/' + rest[1];
    }
    return rest[0];
  }
  return parts[0]; // base44
}

function extractImports(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const rels = [];
  const re = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    rels.push(m[1]);
  }
  // dynamic require / import()
  const re2 = /(?:require\(|import\()\s*['"]([^'"]+)['"]/g;
  while ((m = re2.exec(txt)) !== null) {
    rels.push(m[1]);
  }
  return rels;
}

function resolveSpec(fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) {
    // Vite alias @ -> src
    base = path.resolve(ROOT, 'src', spec.slice(2));
  } else if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    return null;
  }
  const target = base;
  // try exact, then with extensions
  const cands = [target];
  for (const ext of ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.jsonc', '.css', '/index.js', '/index.jsx', '/index.ts']) {
    cands.push(target + ext);
  }
  for (const c of cands) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return path.relative(ROOT, c).split(path.sep).join('/');
    }
    // directory index
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      for (const ix of ['index.js', 'index.jsx', 'index.ts']) {
        const cand = path.join(c, ix);
        if (fs.existsSync(cand)) return path.relative(ROOT, cand).split(path.sep).join('/');
      }
    }
  }
  return null;
}

(async () => {
  const files = [];
  walk(SRC, files);
  walk(BASE44, files);

  const nodes = [];
  const byRel = new Map();
  const edges = [];
  const edgeSet = new Set();
  const external = new Map(); // pkg -> Set(files)

  for (const f of files) {
    const rel = relFromRoot(f);
    const ext = path.extname(f).toLowerCase();
    const language = LANG[ext] || ext.replace('.', '');
    const loc = locOf(f);
    const group = groupFor(rel);
    const node = {
      id: rel,
      name: path.basename(f),
      path: rel,
      group,
      language,
      loc,
      type: ext === '.jsonc' ? 'entity' : 'file'
    };
    nodes.push(node);
    byRel.set(rel, node);
  }

  nodes.sort((a, b) => b.loc - a.loc);

  // deps: only for code files
  for (const f of files) {
    const rel = relFromRoot(f);
    const ext = path.extname(f).toLowerCase();
    if (!CODE_EXT.has(ext)) continue;
    const imports = extractImports(f);
    for (const spec of imports) {
      if (spec.startsWith('.') || spec.startsWith('@/')) {
        const target = resolveSpec(f, spec);
        if (target && byRel.has(target) && target !== rel) {
          const key = rel + '->' + target;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ source: rel, target, kind: 'import' });
          }
        }
      } else {
        // bare import: external package
        const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (!external.has(pkgName)) external.set(pkgName, new Set());
        external.get(pkgName).add(rel);
      }
    }
  }

  // strongly connected components (Tarjan) for cycles among internal nodes
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    if (adj.has(e.source) && adj.has(e.target)) adj.get(e.source).push(e.target);
  }
  let index = 0;
  const stack = [], onStack = new Set(), idx = new Map(), low = new Map();
  const cycles = [];
  function strongconnect(v) {
    idx.set(v, index); low.set(v, index); index++;
    stack.push(v); onStack.add(v);
    for (const w of (adj.get(v) || [])) {
      if (!idx.has(w)) { strongconnect(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (onStack.has(w)) { low.set(v, Math.min(low.get(v), idx.get(w))); }
    }
    if (low.get(v) === idx.get(v)) {
      const comp = [];
      let w;
      do { w = stack.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
      if (comp.length > 1) cycles.push(comp);
    }
  }
  for (const n of nodes) if (!idx.has(n.id)) strongconnect(n.id);

  const languages = {};
  for (const n of nodes) languages[n.language] = (languages[n.language] || 0) + 1;
  const groups = {};
  for (const n of nodes) groups[n.group] = (groups[n.group] || 0) + 1;

  const externalArr = [...external.entries()].map(([pkg, s]) => ({ package: pkg, count: s.size, files: [...s] })).sort((a, b) => b.count - a.count);

  const modules = {
    schemaVersion: 1,
    nodes,
    summary: {
      totalFiles: nodes.length,
      totalLoc: nodes.reduce((a, n) => a + n.loc, 0),
      languages,
      groups
    }
  };

  const deps = {
    schemaVersion: 1,
    nodes: nodes.map(n => ({ id: n.id, group: n.group, language: n.language, loc: n.loc })),
    edges,
    externalDeps: externalArr,
    cycles: cycles.map(c => c.sort()),
    summary: { edges: edges.length, cycles: cycles.length, externalPackages: externalArr.length }
  };

  const outDir = path.join(ROOT, '_reversa_docs', 'assets', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'modules.json'), JSON.stringify(modules, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'deps.json'), JSON.stringify(deps, null, 2), 'utf8');

  console.log(JSON.stringify({
    files: nodes.length,
    totalLoc: modules.summary.totalLoc,
    edges: edges.length,
    cycles: cycles.length,
    externalPackages: externalArr.length,
    topExternal: externalArr.slice(0, 12).map(e => e.package + ':' + e.count)
  }, null, 2));
})();
