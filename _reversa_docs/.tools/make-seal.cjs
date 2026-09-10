const fs = require('fs');
const path = require('path');

// Logo flat "registro médico" (prancheta + coração + pulso), cores da referência:
//   teal claro #b0e0e6 · ardósia #3e6482 · azul vivo #26adef · coral #fd5574
function buildSeal() {
  const parts = [];
  parts.push('<rect x="38" y="8" width="24" height="17" rx="5" fill="#26adef"/>');                       // prendedor
  parts.push('<rect x="44" y="12" width="12" height="2.6" rx="1.3" fill="#ffffff" opacity="0.55"/>');    // brilho do prendedor
  parts.push('<rect x="15" y="22" width="70" height="62" rx="11" fill="#b0e0e6"/>');                     // prancheta
  parts.push('<rect x="15" y="22" width="70" height="62" rx="11" fill="none" stroke="#3e6482" stroke-width="3"/>'); // contorno
  // coração
  parts.push('<path d="M50 58 C38 48 31 43 31 35.5 C31 30 35 26.5 40 26.5 C45 26.5 48 29.5 50 33.5 C52 29.5 55 26.5 60 26.5 C65 26.5 69 30 69 35.5 C69 43 62 48 50 58 Z" fill="#fd5574"/>');
  // linhas de pulso (ECG)
  parts.push('<path d="M25 71 H34 L39 64 L44 78 L49 71 H75" fill="none" stroke="#fd5574" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>');
  parts.push('<path d="M29 80 H37 L41 74 L46 82 L50 80 H71" fill="none" stroke="#fd5574" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="Prontuário Fácil">' + parts.join('') + '</svg>';
}

const svg = buildSeal();
const imgDir = path.resolve('_reversa_docs/assets/img');
fs.mkdirSync(imgDir, { recursive: true });
fs.writeFileSync(path.join(imgDir, 'seal.svg'), svg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'seal-mini.svg'), svg, 'utf8');
// favicon: mesma logo com dimensões explícitas (melhor para a aba do navegador)
const favicon = svg.replace('width="100%" height="100%"', 'width="64" height="64"');
fs.writeFileSync(path.join(imgDir, 'favicon.svg'), favicon, 'utf8');
console.log('logo registro medico gerado | bytes=' + svg.length + ' | favicon.svg gerado');
