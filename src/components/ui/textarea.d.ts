import type { TextareaHTMLAttributes } from 'react';

/**
 * Tipos de `textarea`.
 *
 * Sombreia `textarea.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Textarea: (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) => JSX.Element;

