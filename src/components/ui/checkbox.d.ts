import type { ReactNode } from 'react';

/**
 * Tipos da caixa de seleção.
 *
 * Sombreia `checkbox.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificação estrita (decisão D-01) sem impedir que o código do projeto
 * compile.
 *
 * A propriedade de mudança de estado tem tipagem real porque o valor pode ser
 * **indeterminado** — um terceiro estado além de marcado e desmarcado. Sem isso, quem
 * consome o componente trataria o valor sem saber do que se trata.
 */

/** Estado da caixa: marcada, desmarcada ou indeterminada. */
export type CheckedState = boolean | 'indeterminate';

export declare const Checkbox: (
  props: {
    id?: string;
    className?: string;
    checked?: CheckedState;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    onCheckedChange?: (checked: CheckedState) => void;
    children?: ReactNode;
  } & Record<string, unknown>,
) => ReactNode;
