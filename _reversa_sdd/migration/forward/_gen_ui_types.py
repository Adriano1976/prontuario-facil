# -*- coding: utf-8 -*-
"""Gera os arquivos de declaracao de tipo que sombreiam os componentes de interface.

MECANISMO: um arquivo `.d.ts` ao lado do `.jsx` de mesmo nome e usado pelo
verificador de tipos no lugar do JavaScript. O JavaScript continua sendo o que
executa; a declaracao e o que descreve as props.

POR QUE ASSIM: a tentativa anterior, com `declare module '@/components/ui/x'`, NAO
funciona sob resolucao de modulos do tipo bundler — o caminho real e resolvido e a
declaracao ambiente fica ignorada. Comprovado por medicao.

Escopo: apenas os componentes que o projeto realmente usa. Os demais permanecem fora
da verificacao, conforme a decisao D-01.
"""
import os

BASE = r"D:\Projetos\prontuario-facil\src\components\ui"

CABECALHO = """import type {{ {imports} }} from 'react';

/**
 * Tipos de `{modulo}`.
 *
 * Sombreia `{modulo}.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

{corpo}
"""

# modulo -> (imports de react, corpo)
MODULOS = {}

MODULOS["alert-dialog"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const AlertDialog: Loose;
export declare const AlertDialogAction: Loose;
export declare const AlertDialogCancel: Loose;
export declare const AlertDialogContent: Loose;
export declare const AlertDialogDescription: Loose;
export declare const AlertDialogFooter: Loose;
export declare const AlertDialogHeader: Loose;
export declare const AlertDialogTitle: Loose;
export declare const AlertDialogTrigger: Loose;
""")

MODULOS["badge"] = ("HTMLAttributes, ReactNode", """type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

export declare const Badge: (props: BadgeProps) => ReactNode;
export declare const badgeVariants: (props?: { variant?: string; className?: string }) => string;
""")

MODULOS["calendar"] = ("ReactNode", """export declare const Calendar: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
""")

MODULOS["card"] = ("HTMLAttributes, ReactNode", """export declare const Card: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardContent: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardDescription: (props: HTMLAttributes<HTMLParagraphElement>) => ReactNode;
export declare const CardFooter: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardHeader: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardTitle: (props: HTMLAttributes<HTMLHeadingElement>) => ReactNode;
""")

MODULOS["checkbox"] = ("ReactNode", """export declare const Checkbox: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
""")

MODULOS["dialog"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Dialog: Loose;
export declare const DialogContent: Loose;
export declare const DialogDescription: Loose;
export declare const DialogFooter: Loose;
export declare const DialogHeader: Loose;
export declare const DialogTitle: Loose;
export declare const DialogTrigger: Loose;
export declare const DialogClose: Loose;
""")

MODULOS["dropdown-menu"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

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
""")

MODULOS["input"] = ("InputHTMLAttributes", """export declare const Input: (props: InputHTMLAttributes<HTMLInputElement>) => JSX.Element;
""")

MODULOS["label"] = ("LabelHTMLAttributes", """export declare const Label: (
  props: LabelHTMLAttributes<HTMLLabelElement>,
) => JSX.Element;
""")

MODULOS["scroll-area"] = ("ReactNode", """export declare const ScrollArea: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
export declare const ScrollBar: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
""")

MODULOS["select"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

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
""")

MODULOS["switch"] = ("ReactNode", """export declare const Switch: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
""")

MODULOS["table"] = ("HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes", """export declare const Table: (props: HTMLAttributes<HTMLTableElement>) => ReactNode;
export declare const TableBody: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableCaption: (props: HTMLAttributes<HTMLTableCaptionElement>) => ReactNode;
export declare const TableCell: (props: TdHTMLAttributes<HTMLTableCellElement>) => ReactNode;
export declare const TableFooter: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableHead: (props: ThHTMLAttributes<HTMLTableCellElement>) => ReactNode;
export declare const TableHeader: (props: HTMLAttributes<HTMLTableSectionElement>) => ReactNode;
export declare const TableRow: (props: HTMLAttributes<HTMLTableRowElement>) => ReactNode;
""")

MODULOS["tabs"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Tabs: Loose;
export declare const TabsContent: Loose;
export declare const TabsList: Loose;
export declare const TabsTrigger: Loose;
""")

MODULOS["textarea"] = ("TextareaHTMLAttributes", """export declare const Textarea: (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) => JSX.Element;
""")

MODULOS["toaster"] = ("ReactNode", """export declare const Toaster: (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactNode;
""")

MODULOS["tooltip"] = ("ReactNode", """type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Tooltip: Loose;
export declare const TooltipContent: Loose;
export declare const TooltipProvider: Loose;
export declare const TooltipTrigger: Loose;
""")


def main():
    escritos = 0
    for modulo, (imports, corpo) in sorted(MODULOS.items()):
        caminho = os.path.join(BASE, modulo + ".d.ts")
        if os.path.exists(caminho):
            print("ja existe, preservado:", modulo + ".d.ts")
            continue
        conteudo = CABECALHO.format(imports=imports, modulo=modulo, corpo=corpo)
        with open(caminho, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(conteudo)
        escritos += 1
        print("escrito:", modulo + ".d.ts")
    print("TOTAL:", escritos)


if __name__ == "__main__":
    main()
