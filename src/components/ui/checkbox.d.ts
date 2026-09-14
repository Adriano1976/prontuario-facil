import type { ReactNode } from 'react';

/**
 * Tipos de `checkbox`.
 *
 * Sombreia `checkbox.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Checkbox: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;

