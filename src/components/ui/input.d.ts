import type { InputHTMLAttributes } from 'react';

/**
 * Tipos de `input`.
 *
 * Sombreia `input.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Input: (props: InputHTMLAttributes<HTMLInputElement>) => JSX.Element;

