import type { ReactNode } from 'react';

/**
 * Tipos de `dialog`.
 *
 * Sombreia `dialog.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Dialog: Loose;
export declare const DialogContent: Loose;
export declare const DialogDescription: Loose;
export declare const DialogFooter: Loose;
export declare const DialogHeader: Loose;
export declare const DialogTitle: Loose;
export declare const DialogTrigger: Loose;
export declare const DialogClose: Loose;

