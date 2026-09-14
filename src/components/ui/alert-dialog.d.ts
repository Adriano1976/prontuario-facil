import type { ReactNode } from 'react';

/**
 * Tipos de `alert-dialog`.
 *
 * Sombreia `alert-dialog.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const AlertDialog: Loose;
export declare const AlertDialogAction: Loose;
export declare const AlertDialogCancel: Loose;
export declare const AlertDialogContent: Loose;
export declare const AlertDialogDescription: Loose;
export declare const AlertDialogFooter: Loose;
export declare const AlertDialogHeader: Loose;
export declare const AlertDialogTitle: Loose;
export declare const AlertDialogTrigger: Loose;

