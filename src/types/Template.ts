import type { BaseEntity } from './base';

/**
 * Tipo do template — conjunto fechado de 7 valores (BR-MIGRAR-019).
 *
 * Os 6 primeiros são os mesmos tipos documentais de `Prescription`; `'anamnese'`
 * é exclusivo de template (não gera documento).
 */
export type TemplateType =
  | 'receita_simples'
  | 'receita_controlada'
  | 'atestado'
  | 'solicitacao_exame'
  | 'encaminhamento'
  | 'declaracao'
  | 'anamnese';

/**
 * Template de documento — espelho de `base44/entities/Template.jsonc`.
 *
 * Obrigatórios: `name`, `type`, `content` (BR-MIGRAR-018).
 * RBAC: leitura livre; CRUD apenas `role == 'admin'` (BR-MIGRAR-020).
 *
 * AMB-006 (XSS, preservado): variáveis interpoladas sem escape no save
 * (BR-MIGRAR-021). NÃO adicionar escape nesta migração.
 */
export type Template = BaseEntity & {
  name: string;
  type: TemplateType;
  /** Conteúdo com variáveis no formato `{PACIENTE_NOME}`, `{DATA}`, etc. */
  content: string;
  /** Variáveis disponíveis para interpolação (BR-MIGRAR-021). */
  variables?: string[];
  /** Default `false`. */
  is_default?: boolean;
  /** Default `true`. */
  is_active?: boolean;
};
