import type { ReactNode } from 'react';

/**
 * Tipos de `select`.
 *
 * Sombreia `select.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Select: Loose;
export declare const SelectContent: Loose;
export declare const SelectGroup: Loose;
export declare const SelectItem: Loose;
export declare const SelectLabel: Loose;
export declare const SelectScrollDownButton: Loose;
export declare const SelectScrollUpButton: Loose;
export declare const SelectSeparator: Loose;
export declare const SelectTrigger: Loose;
export declare const SelectValue: Loose;

