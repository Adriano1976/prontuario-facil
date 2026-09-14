import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Tipos do botão.
 *
 * Este arquivo SOMBREIA `button.jsx` para o verificador de tipos: o JavaScript
 * continua sendo o que executa, e este arquivo é o que descreve as props. É o
 * mecanismo que permite manter a biblioteca de interface fora da verificação estrita
 * (decisão D-01) sem impedir que o código do projeto compile.
 */

declare const buttonVariants: (props?: {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) => string;

export declare const Button: (
  props: ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    },
) => ReactNode;

export { buttonVariants };
