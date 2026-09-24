import type { ReactNode } from 'react';

/**
 * Tipos de `chart`.
 *
 * Sombreia `chart.jsx` para o verificador: o JavaScript continua sendo o que executa, e este
 * arquivo descreve as exportações. Mesmo mecanismo dos demais componentes de interface
 * (decisão D-01).
 *
 * ⚠️ Este é o único `.d.ts` de `components/ui` que **não** nasceu da migração. Os outros 19
 * existem porque o projeto os consome; este ficou sem sombra porque `chart.jsx` **não tinha
 * consumidor nenhum** em `src/` — e a ausência do arquivo era, por si só, a evidência disso. Ele
 * foi escrito em 2026-09-24, junto com a prova da correção do achado F-05, que é o primeiro
 * código do projeto a importar o componente.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const ChartContainer: Loose;
export declare const ChartTooltip: Loose;
export declare const ChartTooltipContent: Loose;
export declare const ChartLegend: Loose;
export declare const ChartLegendContent: Loose;

/** Configuração de uma série: rótulo, cor e, opcionalmente, cor por tema. */
export interface ChartConfigEntry {
  label?: ReactNode;
  color?: string;
  theme?: Record<string, string>;
  icon?: (props: Record<string, unknown>) => ReactNode;
}

/**
 * Injeta as regras de cor do gráfico no documento.
 *
 * Entrega o CSS como **texto**, e não por `dangerouslySetInnerHTML` — era esse sink o achado F-05
 * das auditorias de segurança. Devolve `null` quando nenhuma entrada tem cor ou tema.
 */
export declare const ChartStyle: (props: {
  id: string;
  config: Record<string, ChartConfigEntry>;
}) => ReactNode;
