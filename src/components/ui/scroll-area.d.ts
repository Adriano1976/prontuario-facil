import type { ReactNode } from 'react';

/**
 * Tipos de `scroll-area`.
 *
 * Sombreia `scroll-area.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const ScrollArea: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
export declare const ScrollBar: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;

