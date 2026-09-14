import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Tipos de `badge`.
 *
 * Sombreia `badge.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

export declare const Badge: (props: BadgeProps) => ReactNode;
export declare const badgeVariants: (props?: { variant?: string; className?: string }) => string;

