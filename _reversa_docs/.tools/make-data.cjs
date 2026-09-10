const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');
const DOCS = path.join(ROOT, '_reversa_docs');
const DATA = path.join(DOCS, 'assets', 'data');

function readJSON(rel) {
  const p = path.join(DATA, rel);
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
  }
  return null;
}

const modules = readJSON('modules.json') || {};
const deps = readJSON('deps.json') || {};
const metrics = readJSON('metrics.json') || {};
const timeline = readJSON('timeline.json') || {};
const glossary = readJSON('glossary.json') || {};
const featuresIndex = readJSON('features-index.json') || {};

const seedShort = '89000d65'; // primeiros 8 chars do seed.hash

// Selo generativo (crystal-lattice, derivado do seed). Lê dos arquivos gerados pelo make-seal.cjs.
function readText(rel) {
  const p = path.join(DOCS, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}
const sealSvg = readText('assets/img/seal.svg') || '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#6366f1"/></svg>';
const sealMiniSvg = readText('assets/img/seal-mini.svg') || sealSvg;

const nav = [
  { id: 'index', href: 'index.html', label: 'Visão geral' },
  { id: 'arquitetura', href: 'arquitetura.html', label: 'Arquitetura 3D' },
  { id: 'modulos', href: 'modulos.html', label: 'Módulos' },
  { id: 'topologia', href: 'topologia.html', label: 'Topologia' },
  { id: 'metricas', href: 'metricas.html', label: 'Métricas' },
  { id: 'timeline', href: 'timeline.html', label: 'Timeline' },
  { id: 'glossario', href: 'glossario.html', label: 'Glossário' },
  { id: 'deck', href: 'deck.html', label: 'Deck' }
];

const rv = {
  modules,
  deps,
  metrics,
  timeline,
  glossary,
  featuresIndex,
  sealSvg,
  sealMiniSvg,
  seedShort,
  nav,
  config: {
    visualStyle: 'premium',
    readerProfile: 'auditor',
    depth: 'full'
  },
  projectName: 'Prontuário Fácil'
};

const out = '/* Gerado pelo Reversa Docs. Fonte única de dados via window.RV_DATA. */\nwindow.RV_DATA = ' + JSON.stringify(rv) + ';\n';
const dest = path.join(DOCS, 'assets', 'js', 'data.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out, 'utf8');
console.log('data.js gerado: ' + (out.length) + ' bytes | modules.nodes=' + (modules.nodes ? modules.nodes.length : 0) + ' deps.edges=' + (deps.edges ? deps.edges.length : 0));
