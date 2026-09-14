import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

/**
 * Tipos de `table`.
 *
 * Sombreia `table.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Table: (props: HTMLAttributes<HTMLTableElement>) => ReactNode;
export declare const TableBody: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableCaption: (props: HTMLAttributes<HTMLTableCaptionElement>) => ReactNode;
export declare const TableCell: (props: TdHTMLAttributes<HTMLTableCellElement>) => ReactNode;
export declare const TableFooter: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableHead: (props: ThHTMLAttributes<HTMLTableCellElement>) => ReactNode;
export declare const TableHeader: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableRow: (props: HTMLAttributes<HTMLTableRowElement>) => ReactNode;

