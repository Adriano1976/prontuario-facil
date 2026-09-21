/**
 * Guarda de encoding: acusa mojibake nos artefatos do Reversa e no código.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * Quatro arquivos do projeto foram entregues corrompidos pelo mesmo defeito: os bytes
 * UTF-8 foram lidos como cp1252/latin-1 e regravados como UTF-8. Nessa ida e volta cada
 * byte da sequência UTF-8 vira um caractere próprio, e o texto chega ao leitor assim:
 *
 *   execução  ->  execuÃ§Ã£o                                                 mojibake-guard:ignore
 *
 * Dois dos arquivos eram artefatos (`actions.md` das features 002 e 003) e dois eram
 * fontes (`src/api/registry.ts` e `src/components/medical/AccessLogger.ts`) — e três
 * deles já estavam versionados, isto é, o defeito chegou ao HEAD sem que nada acusasse.
 *
 * Esta guarda é a rede que faltava. Ela não corrige nada: só acusa, com arquivo, linha,
 * coluna e o texto que deveria estar ali. Corrigir é decisão de quem lê o relatório.
 *
 * COMO DETECTA
 * Mojibake é exatamente reversível, e é essa exatidão que a guarda explora. Uma sequência
 * de 2 a 4 caracteres cujos code points caem na faixa dos bytes (0x80 a 0xFF, mais os
 * caracteres que o cp1252 coloca em 0x80 a 0x9F) é remontada como bytes e decodificada
 * como UTF-8 em modo estrito. Se a remontagem produz um caractere não-ASCII válido, era
 * mojibake. Se não produz, o texto era legítimo e nada é acusado.
 *
 * A decodificação estrita é o que evita falso positivo: um "ç" correto é um único byte
 * 0xE7, que sozinho não forma sequência UTF-8 válida de 3 bytes, então passa batido. A
 * versão corrompida desse mesmo "ç" ocupa dois caracteres e remonta para os bytes C3 A7.
 * O acento legítimo nunca é confundido com ela.
 *
 * O QUE VERIFICA
 * `src/` e todas as pastas `_reversa_*`. Também acusa arquivo que não seja UTF-8 válido,
 * que é a forma mais grave do mesmo problema.
 *
 * ISENÇÃO
 * Uma linha que contenha o marcador `mojibake-guard:ignore` é pulada. Serve para o caso
 * legítimo de documentar o defeito citando-o literalmente.
 *
 * USO
 *   npm run prova:encoding                 varre as raízes padrão (src e _reversa_*)
 *   npm run prova:encoding -- <caminho>... varre só os caminhos indicados
 *
 * O argumento é opcional e aceita pasta (percorre tudo abaixo dela) ou arquivo (verifica
 * exatamente aquele arquivo).
 */

import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));

/** Raiz do projeto, resolvida a partir deste arquivo (independe do diretório de chamada). */
export const RAIZ = resolve(AQUI, '..', '..');

/** Linha que contenha este marcador é ignorada pela guarda. */
export const MARCADOR_DE_ISENCAO = 'mojibake-guard:ignore';

const EXTENSOES_DE_TEXTO = new Set([
  '.md',
  '.markdown',
  '.txt',
  '.json',
  '.jsonl',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.py',
  '.yml',
  '.yaml',
  '.toml',
  '.svg',
]);

const PASTAS_IGNORADAS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.vite',
  '.vitest',
  '__negative_checks__',
]);

/**
 * Os oito bytes que o cp1252 desenha com um caractere fora da faixa latina. O cp1252
 * deixa 0x81, 0x8D, 0x8F, 0x90 e 0x9D indefinidos; esses são tratados como latin-1 puro
 * (o code point é o próprio byte), que é como eles aparecem nos arquivos corrompidos.
 */
const ESPECIAIS_CP1252 = [
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
];

const BYTE_POR_CODEPOINT = new Map(ESPECIAIS_CP1252);
const CODEPOINT_POR_BYTE = new Map(ESPECIAIS_CP1252.map(([codePoint, byte]) => [byte, codePoint]));

const DECODIFICADOR_ESTRITO = new TextDecoder('utf-8', { fatal: true });

function byteDoCodepoint(codePoint) {
  if (codePoint <= 0xff) return codePoint;
  const byte = BYTE_POR_CODEPOINT.get(codePoint);
  return byte === undefined ? -1 : byte;
}

/** Quantos bytes a sequência UTF-8 iniciada por este byte-líder ocupa. */
function tamanhoDaSequencia(byteLider) {
  if (byteLider >= 0xc2 && byteLider <= 0xdf) return 2;
  if (byteLider >= 0xe0 && byteLider <= 0xef) return 3;
  if (byteLider >= 0xf0 && byteLider <= 0xf4) return 4;
  return 0;
}

/**
 * Acusa mojibake em uma única linha.
 *
 * Devolve uma lista de `{ coluna, sequencia, correcao }`, com coluna contada em
 * caracteres a partir de 1. Sequência UTF-8 nunca contém byte de quebra de linha, então
 * a varredura linha a linha é exata e não perde caso na fronteira.
 */
export function encontrarMojibake(linha) {
  const pontos = [];
  for (const caractere of linha) pontos.push(caractere.codePointAt(0));

  const achados = [];
  let i = 0;

  while (i < pontos.length) {
    const byteLider = byteDoCodepoint(pontos[i]);
    if (pontos[i] < 0x80 || byteLider < 0) {
      i += 1;
      continue;
    }

    const tamanho = tamanhoDaSequencia(byteLider);
    if (tamanho === 0) {
      i += 1;
      continue;
    }

    const bytes = [byteLider];
    let completa = true;
    for (let k = 1; k < tamanho; k += 1) {
      const byte = i + k < pontos.length ? byteDoCodepoint(pontos[i + k]) : -1;
      if (byte < 0x80 || byte > 0xbf) {
        completa = false;
        break;
      }
      bytes.push(byte);
    }

    if (!completa) {
      i += 1;
      continue;
    }

    let correcao = null;
    try {
      correcao = DECODIFICADOR_ESTRITO.decode(Uint8Array.from(bytes));
    } catch {
      correcao = null;
    }

    if (correcao !== null && /[^\u0000-\u007f]/.test(correcao)) {
      achados.push({
        coluna: i + 1,
        sequencia: pontos
          .slice(i, i + tamanho)
          .map((codePoint) => String.fromCodePoint(codePoint))
          .join(''),
        correcao,
      });
      i += tamanho;
    } else {
      i += 1;
    }
  }

  return achados;
}

/**
 * Aplica as correções acusadas por `encontrarMojibake`, linha a linha.
 *
 * A guarda não grava arquivo: esta função existe para que o autoteste prove que o
 * detector é exato — o texto corrigido tem de ser idêntico ao original. Ela normaliza
 * as quebras de linha para LF, então não serve para reescrever arquivo CRLF no lugar.
 */
export function corrigirTexto(texto) {
  const linhas = texto.split(/\r?\n/).map((linha) => {
    if (linha.includes(MARCADOR_DE_ISENCAO)) return linha;

    const achados = encontrarMojibake(linha);
    if (achados.length === 0) return linha;

    const pontos = [...linha];
    let saida = '';
    let cursor = 0;
    for (const achado of achados) {
      saida += pontos.slice(cursor, achado.coluna - 1).join('') + achado.correcao;
      cursor = achado.coluna - 1 + [...achado.sequencia].length;
    }
    return saida + pontos.slice(cursor).join('');
  });

  return linhas.join('\n');
}

/**
 * Refaz a ida e volta que produz o defeito: lê o texto como se ele fosse cp1252/latin-1.
 *
 * É o inverso de `corrigirTexto` e existe para alimentar o autoteste com amostras
 * corrompidas de forma determinística, sem gravar mojibake literal no código.
 */
export function simularLeituraLegada(texto) {
  const bytes = Buffer.from(texto, 'utf8');
  let saida = '';
  for (const byte of bytes) {
    const codePoint = CODEPOINT_POR_BYTE.get(byte);
    saida += String.fromCodePoint(codePoint === undefined ? byte : codePoint);
  }
  return saida;
}

/**
 * Coleta os arquivos a verificar sob um caminho.
 *
 * Aceita pasta (percorre recursivamente, respeitando as exclusões) e arquivo (verifica
 * exatamente aquele arquivo). Um caminho nomeado na linha de comando tem precedência: o
 * arquivo apontado é verificado mesmo que a extensão não esteja na lista de texto, porque
 * foi ele que o usuário pediu — já na varredura de pasta a lista de extensões é o que
 * separa texto de binário.
 */
function listarArquivosDeTexto(caminho, acumulado = []) {
  const informacao = statSync(caminho);

  if (informacao.isFile()) {
    acumulado.push(caminho);
    return acumulado;
  }

  if (!informacao.isDirectory()) return acumulado;

  for (const entrada of readdirSync(caminho, { withFileTypes: true })) {
    if (PASTAS_IGNORADAS.has(entrada.name)) continue;

    const filho = join(caminho, entrada.name);
    if (entrada.isDirectory()) {
      listarArquivosDeTexto(filho, acumulado);
    } else if (entrada.isFile() && EXTENSOES_DE_TEXTO.has(extname(entrada.name).toLowerCase())) {
      acumulado.push(filho);
    }
  }
  return acumulado;
}

/** As raízes padrão: `src` mais toda pasta `_reversa_*` que existir na raiz do projeto. */
export function raizesPadrao(base = RAIZ) {
  const pastasReversa = readdirSync(base, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory() && entrada.name.startsWith('_reversa'))
    .map((entrada) => entrada.name)
    .sort();

  return ['src', ...pastasReversa].filter((nome) => {
    try {
      return statSync(join(base, nome)).isDirectory();
    } catch {
      return false;
    }
  });
}

/** Verifica um arquivo. Devolve `{ caminho, naoEhUtf8, achados }`. */
export function varrerArquivo(caminho) {
  const conteudo = readFileSync(caminho);

  let texto;
  try {
    texto = DECODIFICADOR_ESTRITO.decode(conteudo);
  } catch {
    return { caminho, naoEhUtf8: true, achados: [] };
  }

  const achados = [];
  texto.split(/\r?\n/).forEach((linha, indice) => {
    if (linha.includes(MARCADOR_DE_ISENCAO)) return;
    for (const achado of encontrarMojibake(linha)) {
      achados.push({ ...achado, linha: indice + 1 });
    }
  });

  return { caminho, naoEhUtf8: false, achados };
}

/** Varre as raízes indicadas. Devolve `{ alvos, verificados, problemas }`. */
export function varrerArvore({ base = RAIZ, raizes } = {}) {
  const alvos = raizes ?? raizesPadrao(base);
  const verificados = [];
  const problemas = [];

  for (const alvo of alvos) {
    for (const caminho of listarArquivosDeTexto(resolve(base, alvo))) {
      verificados.push(caminho);
      const resultado = varrerArquivo(caminho);
      if (resultado.naoEhUtf8 || resultado.achados.length > 0) problemas.push(resultado);
    }
  }

  return { alvos, verificados, problemas };
}

export function formatarRelatorio({ alvos, verificados, problemas }, base = RAIZ) {
  const linhas = [''];
  linhas.push('Guarda de encoding (mojibake)');
  linhas.push('='.repeat(72));
  linhas.push(`raízes verificadas: ${alvos.join(', ')}`);
  linhas.push(`arquivos de texto verificados: ${verificados.length}`);

  const sequencias = problemas.reduce((total, problema) => total + problema.achados.length, 0);

  if (problemas.length > 0) {
    linhas.push('-'.repeat(72));
    for (const problema of problemas) {
      const relativo = relative(base, problema.caminho).split(sep).join('/');

      if (problema.naoEhUtf8) {
        linhas.push(`NÃO É UTF-8  ${relativo}`);
        continue;
      }

      for (const achado of problema.achados) {
        linhas.push(`MOJIBAKE  ${relativo}:${achado.linha}:${achado.coluna}`);
        linhas.push(`          veio: "${achado.sequencia}"   deveria ser: "${achado.correcao}"`);
      }
    }
  }

  linhas.push('-'.repeat(72));
  linhas.push(
    problemas.length === 0
      ? 'nenhum mojibake — todo texto verificado é UTF-8 íntegro'
      : `${problemas.length} arquivo(s) e ${sequencias} sequência(s) corrompida(s)`,
  );
  linhas.push('='.repeat(72));
  linhas.push('');

  return linhas.join('\n');
}

function main() {
  const argumentos = process.argv.slice(2).filter((argumento) => !argumento.startsWith('--'));
  const raizes = argumentos.length > 0 ? argumentos : undefined;

  // Caminho digitado errado tem de virar mensagem, não stack trace: um erro de digitação
  // não pode ser confundido com "a guarda rodou e passou".
  const inexistentes = (raizes ?? []).filter((alvo) => !existsSync(resolve(RAIZ, alvo)));
  if (inexistentes.length > 0) {
    console.error(`falha: caminho não encontrado: ${inexistentes.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const resultado = varrerArvore({ raizes });

  console.log(formatarRelatorio(resultado));

  if (resultado.problemas.length > 0) {
    console.error('falha: há texto corrompido por leitura em encoding legado.');
    console.error('       o defeito é revertido lendo o arquivo como UTF-8 e regravando como UTF-8.');
    process.exitCode = 1;
  }
}

/**
 * Só roda o CLI quando este arquivo é o ponto de entrada.
 *
 * Sem isso, importar o módulo no teste executaria a varredura como efeito colateral:
 * imprimiria o relatório e — pior — marcaria `process.exitCode` a partir dela, o que
 * derrubaria a suíte por um motivo que não é um teste falhando.
 */
function executadoDiretamente() {
  const alvo = process.argv[1];
  if (!alvo) return false;
  try {
    return realpathSync(alvo) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (executadoDiretamente()) main();
