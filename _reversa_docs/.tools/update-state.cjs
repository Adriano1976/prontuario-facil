#!/usr/bin/env node
/**
 * update-state.cjs — Recalcula os hashes das páginas do mini-site e atualiza
 * _reversa_docs/.state.json (pages, pagesGenerated, integridade e checkpoint).
 *
 * Uso:
 *   node _reversa_docs/.tools/update-state.cjs
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve('_reversa_docs');
const STATE = path.join(ROOT, '.state.json');

/** sha256 de um arquivo, no formato "sha256:<hex>". */
function hashOf(file) {
  return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));

// Percorre as páginas do state + qualquer .html novo na raiz e em features/
const known = new Set(Object.keys(state.pages));
for (const dir of [ROOT, path.join(ROOT, 'features')]) {
  if (!fs.existsSync(dir)) continue;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.html')) continue;
    const rel = path.relative(ROOT, path.join(dir, ent.name)).split(path.sep).join('/');
    known.add(rel);
  }
}

const pagesGenerated = [...known].sort();
const changed = [];
const created = [];

for (const rel of pagesGenerated) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const hash = hashOf(file);
  if (!state.pages[rel]) {
    state.pages[rel] = { status: 'created', agent: 'reversa-docs-storyteller', hash };
    created.push(rel);
  } else if (state.pages[rel].hash !== hash) {
    state.pages[rel].hash = hash;
    changed.push(rel);
  }
}

state.pagesGenerated = pagesGenerated;
state.pagesOmitted = state.pagesOmitted || [];
state.lastCheckpoint = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

// Reordena o objeto pages na ordem de pagesGenerated, para leitura estável
const ordered = {};
for (const rel of pagesGenerated) if (state.pages[rel]) ordered[rel] = state.pages[rel];
state.pages = ordered;

fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n', 'utf8');

const total = pagesGenerated.length;
const verified = pagesGenerated.filter((r) => state.pages[r] && state.pages[r].hash).length;
console.log(JSON.stringify({
  paginas: total,
  comHash: verified,
  novas: created,
  alteradas: changed,
  lastCheckpoint: state.lastCheckpoint
}, null, 2));
