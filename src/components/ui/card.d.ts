import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Tipos de `card`.
 *
 * Sombreia `card.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

export declare const Card: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardContent: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardDescription: (props: HTMLAttributes<HTMLParagraphElement>) => ReactNode;
export declare const CardFooter: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardHeader: (props: HTMLAttributes<HTMLDivElement>) => ReactNode;
export declare const CardTitle: (props: HTMLAttributes<HTMLHeadingElement>) => ReactNode;

