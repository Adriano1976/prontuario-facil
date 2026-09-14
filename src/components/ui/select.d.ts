import type { ReactNode } from 'react';

/**
 * Tipos de `select`.
 *
 * Sombreia `select.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificação estrita (decisão D-01) sem impedir que o código do projeto
 * compile.
 *
 * As propriedades de valor têm tipagem real de TEXTO porque é assim que o componente
 * é usado no projeto: as opções são identificadores textuais (situações, tipos de
 * exame, tipos documentais). Sem isso, quem consome teria de adivinhar o tipo do valor
 * recebido e recorrer a uma asserção em cada uso.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Select: (props: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  children?: ReactNode;
}) => ReactNode;

export declare const SelectContent: Loose;
export declare const SelectGroup: Loose;
export declare const SelectItem: Loose;
export declare const SelectLabel: Loose;
export declare const SelectScrollDownButton: Loose;
export declare const SelectScrollUpButton: Loose;
export declare const SelectSeparator: Loose;
export declare const SelectTrigger: Loose;
export declare const SelectValue: Loose;
