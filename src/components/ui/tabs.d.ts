import type { ReactNode } from 'react';

/**
 * Tipos de `tabs`.
 *
 * Sombreia `tabs.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props. Permite manter a biblioteca de interface
 * fora da verificacao estrita (decisao D-01) sem impedir que o codigo do projeto
 * compile.
 */

type Loose = (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode;

export declare const Tabs: Loose;
export declare const TabsContent: Loose;
export declare const TabsList: Loose;
export declare const TabsTrigger: Loose;

