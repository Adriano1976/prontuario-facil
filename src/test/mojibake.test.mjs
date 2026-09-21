/**
 * Guarda de encoding na suíte de testes.
 *
 * Duas responsabilidades, nesta ordem de importância:
 *
 * 1. PROVAR QUE O DETECTOR ESTÁ CERTO. Um detector de mojibake que não acusa nada é
 *    indistinguível de um detector quebrado, então o autoteste gera amostras corrompidas
 *    de forma determinística, confere que cada uma é acusada e confere que a correção
 *    reconstrói o texto original caractere por caractere. Também confere o contrário:
 *    texto correto em português não pode gerar acusação.
 *
 * 2. PROVAR QUE O REPOSITÓRIO ESTÁ LIMPO. Varre `src/` e as pastas `_reversa_*` e falha
 *    se encontrar qualquer sequência corrompida ou arquivo que não seja UTF-8 válido.
 *
 * O relatório também está disponível fora da suíte: `npm run prova:encoding`.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  corrigirTexto,
  encontrarMojibake,
  formatarRelatorio,
  MARCADOR_DE_ISENCAO,
  simularLeituraLegada,
  varrerArvore,
  varrerArquivo,
} from './mojibake.mjs';

// Exemplo literal do defeito, liberado pela isenção: "execução" virou "execuÃ§Ã£o".  mojibake-guard:ignore

/**
 * Amostras com tudo que já apareceu corrompido neste projeto: acentos comuns, acento
 * agudo isolado (`nº`), travessão, emoji de veredito e o seletor de variação do aviso.
 */
const AMOSTRAS = [
  '## Notas de execução',
  'Ações auditáveis, indexadas por nome legível.',
  'A infraestrutura já existe — esta feature não cria caminho novo.',
  'exatamente o risco nº 5 do brief',
  'veredito 🟢/🟡/🔴',
  '⚠️ ARMADILHA REAL: o `Omit` nativo NÃO distribui sobre união.',
  'consentimento aceito sem endereço de rede',
  'Visão administrativa: as 5 entidades sob RLS expõem leitura ESCOPADA.',
];

/** Texto correto que nunca pode ser acusado — a lista de falsos positivos plausíveis. */
const TEXTOS_LEGITIMOS = [
  ...AMOSTRAS,
  'NÃO é divergência (conferido contra o legado)',
  'DECISÃO DE DESIGN: índice fechado, não aberto',
  'A trilha é somente inserção: nunca lê nem altera registros.',
];

describe('detector de mojibake', () => {
  it('acusa a corrupção que motivou a guarda e reverte sem perda', () => {
    for (const original of AMOSTRAS) {
      const corrompido = simularLeituraLegada(original);

      expect(corrompido, `a amostra não foi corrompida: ${original}`).not.toBe(original);

      const achados = encontrarMojibake(corrompido);
      expect(achados.length, `não acusou a corrupção de: ${original}`).toBeGreaterThan(0);

      // A volta tem de ser exata: é isso que separa mojibake de texto apenas estranho.
      expect(corrigirTexto(corrompido), `correção não reconstruiu: ${original}`).toBe(original);
    }
  });

  it('não acusa texto correto em português', () => {
    for (const legitimo of TEXTOS_LEGITIMOS) {
      expect(encontrarMojibake(legitimo), `falso positivo em: ${legitimo}`).toEqual([]);
    }
  });

  it('não confunde um acento legítimo isolado com mojibake', () => {
    // Um "ç" correto é um único code point (0xE7). Sozinho ele não forma sequência
    // UTF-8 válida, então não pode ser confundido com a versão corrompida do mesmo "ç".
    expect(encontrarMojibake('çãõáéíóúâêôàüºª')).toEqual([]);
    expect(encontrarMojibake(simularLeituraLegada('çãõáéíóúâêôàüºª')).length).toBeGreaterThan(0);
  });

  it('informa a coluna exata do primeiro caractere corrompido', () => {
    const linha = `abc ${simularLeituraLegada('ção')} fim`;
    const [achado] = encontrarMojibake(linha);

    expect(achado.coluna).toBe(5);
    expect(achado.correcao).toBe('ç');
  });

  it('pula a linha que carrega o marcador de isenção', () => {
    const corrompido = simularLeituraLegada('execução');
    const comMarcador = `texto: ${corrompido}  ${MARCADOR_DE_ISENCAO}`;

    expect(encontrarMojibake(comMarcador).length).toBeGreaterThan(0);
    expect(corrigirTexto(comMarcador)).toBe(comMarcador);
  });
});

describe('varredura de arquivo', () => {
  it('acusa arquivo que não é UTF-8 válido', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'guarda-encoding-'));
    try {
      // "café" gravado em latin-1: o byte 0xE9 sozinho não é UTF-8 válido.
      const caminho = join(pasta, 'amostra-latin1.md');
      writeFileSync(caminho, Buffer.from([0x63, 0x61, 0x66, 0xe9]));

      const resultado = varrerArquivo(caminho);
      expect(resultado.naoEhUtf8).toBe(true);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('acusa mojibake com arquivo, linha e coluna', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'guarda-encoding-'));
    try {
      const caminho = join(pasta, 'amostra.md');
      const linhas = ['# Título', '', `## ${simularLeituraLegada('Notas de execução')}`];
      writeFileSync(caminho, linhas.join('\n'), 'utf8');

      const resultado = varrerArquivo(caminho);
      expect(resultado.naoEhUtf8).toBe(false);
      expect(resultado.achados.length).toBeGreaterThan(0);
      expect(resultado.achados[0].linha).toBe(3);
      // "## Notas de execu" são 17 caracteres: o primeiro corrompido abre a coluna 18.
      expect(resultado.achados[0].coluna).toBe(18);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

describe('guarda do repositório', () => {
  it('não encontra mojibake em src/ nem em _reversa_*', () => {
    const resultado = varrerArvore();

    // Sanidade: uma varredura que não percorreu nada passaria sem provar nada.
    expect(resultado.verificados.length, 'a varredura não percorreu arquivo nenhum').toBeGreaterThan(
      50,
    );
    expect(resultado.alvos).toContain('src');

    expect(resultado.problemas, formatarRelatorio(resultado)).toEqual([]);
  });
});
