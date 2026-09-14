import type { ReactNode } from 'react';

/**
 * Tipos de `dropdown-menu`.
 *
 * Sombreia `dropdown-menu.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const DropdownMenu: Loose;
export declare const DropdownMenuCheckboxItem: Loose;
export declare const DropdownMenuContent: Loose;
export declare const DropdownMenuGroup: Loose;
export declare const DropdownMenuItem: Loose;
export declare const DropdownMenuLabel: Loose;
export declare const DropdownMenuRadioGroup: Loose;
export declare const DropdownMenuRadioItem: Loose;
export declare const DropdownMenuSeparator: Loose;
export declare const DropdownMenuShortcut: Loose;
export declare const DropdownMenuSub: Loose;
export declare const DropdownMenuSubContent: Loose;
export declare const DropdownMenuSubTrigger: Loose;
export declare const DropdownMenuTrigger: Loose;

