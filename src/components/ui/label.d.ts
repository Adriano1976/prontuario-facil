import type { LabelHTMLAttributes } from 'react';

/**
 * Tipos de `label`.
 *
 * Sombreia `label.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Label: (
  props: LabelHTMLAttributes<HTMLLabelElement>,
) => JSX.Element;

