import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartStyle } from '@/components/ui/chart';

/**
 * Prova da correção do achado F-05 (2026-09-24).
 *
 * O QUE SE MEDE AQUI: que as regras de cor do gráfico chegam ao documento **sem** passar pelo
 * sink perigoso. O `ChartStyle` de `src/components/ui/chart.jsx` injetava o CSS com
 * `dangerouslySetInnerHTML` e passou a entregá-lo como **texto**.
 *
 * COMO A PROVA FUNCIONA: a cor entra pela configuração do gráfico. Com uma cor que **tenta
 * fechar a tag de estilo e abrir um `<script>`**, o caminho seguro grava a string como texto —
 * nenhum elemento executável aparece no DOM. Se alguém devolver o `dangerouslySetInnerHTML`, o
 * script volta a existir e esta verificação falha.
 *
 * ⚠️ O componente **não tem consumidor** em `src/` hoje. É por isso que a prova existe em vez de
 * uma conferência visual: sem consumidor, uma troca de comportamento aqui passaria despercebida.
 */

/** Cor que tenta encerrar a tag de estilo e abrir um script executável. */
const COR_HOSTIL = '#0ea5e9; } </style><script>window.__injetado = true</script>';

describe('ChartStyle — o CSS é texto, não marcação', () => {
  it('grava as regras no documento sem criar elemento executável', () => {
    const { container } = render(
      <ChartStyle id="chart-1" config={{ pacientes: { label: 'Pacientes', color: COR_HOSTIL } }} />,
    );

    const estilo = container.querySelector('style');
    expect(estilo).not.toBeNull();

    // O CSS chegou: a variável da cor está declarada para o gráfico.
    expect(estilo?.textContent).toContain('--color-pacientes');

    // E a cor hostil ficou como TEXTO: nenhum script nasceu, nada foi executado.
    expect(estilo?.textContent).toContain('</style><script>');
    expect(document.querySelector('script')).toBeNull();
    expect((window as unknown as { __injetado?: boolean }).__injetado).toBeUndefined();
  });

  it('mantém as duas variantes de tema', () => {
    const { container } = render(
      <ChartStyle
        id="chart-2"
        config={{ consultas: { label: 'Consultas', color: '#10b981' } }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';

    // A variante clara não tem prefixo; a escura é ancorada em `.dark`. É esta segunda que a
    // recomendação literal da auditoria — propriedade inline — não conseguiria expressar.
    expect(css).toContain('[data-chart=chart-2]');
    expect(css).toContain('.dark [data-chart=chart-2]');
    expect(css).toContain('--color-consultas: #10b981;');
  });

  it('não renderiza nada quando nenhuma entrada tem tema ou cor', () => {
    const { container } = render(
      <ChartStyle id="chart-3" config={{ vazio: { label: 'Vazio' } }} />,
    );

    expect(container.querySelector('style')).toBeNull();
  });
});
