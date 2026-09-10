const fs = require('fs');
const path = require('path');

const DOCS = path.resolve('_reversa_docs');
const DATA = path.join(DOCS, 'assets', 'data');
const modules = JSON.parse(fs.readFileSync(path.join(DATA, 'modules.json'), 'utf8'));
const deps = JSON.parse(fs.readFileSync(path.join(DATA, 'deps.json'), 'utf8'));

const nodes = modules.nodes;
const byId = {};
nodes.forEach(n => byId[n.id] = n);

// in-degree (dependents)
const inDeg = {};
deps.edges.forEach(e => { inDeg[e.target] = (inDeg[e.target] || 0) + 1; });

// treemap LOC por pasta (group)
const folder = {};
nodes.forEach(n => {
  const g = n.group || 'root';
  folder[g] = folder[g] || { name: g, value: 0, modules: 0 };
  folder[g].value += n.loc;
  folder[g].modules += 1;
});
const treemap_loc_by_folder = Object.values(folder).sort((a, b) => b.value - a.value);

// top por dependentes (proxy de complexidade / hot path)
const top_complexity = nodes
  .map(n => ({ id: n.id, name: n.path.split('/').pop(), complexity: inDeg[n.id] || 0, loc: n.loc }))
  .sort((a, b) => b.complexity - a.complexity || b.loc - a.loc)
  .slice(0, 20);

// histograma LOC
const bins = [0, 50, 100, 200, 500, 1000, 5000];
const counts = new Array(bins.length - 1).fill(0);
nodes.forEach(n => {
  for (let i = 0; i < bins.length - 1; i++) {
    if (n.loc >= bins[i] && n.loc < bins[i + 1]) { counts[i]++; break; }
    if (i === bins.length - 2 && n.loc >= bins[i + 1]) counts[i]++;
  }
});
const loc_histogram = { bins, counts };

// sankey por grupo (pastas)
const gMap = {};
const sankeyNodes = Object.keys(folder).map((g, i) => { gMap[g] = i; return { id: g }; });
const linkMap = {};
deps.edges.forEach(e => {
  const s = byId[e.source], t = byId[e.target];
  if (!s || !t) return;
  const sg = s.group || 'root', tg = t.group || 'root';
  if (sg === tg) return; // sem loops
  const k = sg + '|' + tg;
  linkMap[k] = (linkMap[k] || 0) + 1;
});
const dependency_sankey = {
  nodes: sankeyNodes,
  links: Object.entries(linkMap).map(([k, v]) => {
    const [source, target] = k.split('|');
    return { source, target, value: v };
  })
};

// distribuição de linguagens
const langMap = {};
nodes.forEach(n => {
  langMap[n.language] = langMap[n.language] || { language: n.language, modules: 0, loc: 0 };
  langMap[n.language].modules += 1;
  langMap[n.language].loc += n.loc;
});
const language_distribution = Object.values(langMap).sort((a, b) => b.loc - a.loc);

// dependências externas top
const external_deps = (deps.externalDeps || []).slice(0, 15).map(e => ({ name: e.package, count: e.count }));

const metrics = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  treemap_loc_by_folder,
  top_complexity,
  loc_histogram,
  dependency_sankey,
  language_distribution,
  external_deps,
  summary: modules.summary
};

fs.writeFileSync(path.join(DATA, 'metrics.json'), JSON.stringify(metrics, null, 2), 'utf8');
console.log('metrics.json gerado | folders=' + treemap_loc_by_folder.length + ' sankey.links=' + dependency_sankey.links.length + ' external=' + external_deps.length);
