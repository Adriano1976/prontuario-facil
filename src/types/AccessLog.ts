import type { BaseEntity } from './base';
import type { Nullable } from './common';

/** Ação auditada — enum de 12 valores (`AccessLog.jsonc`, BR-MIGRAR-025). */
export type AccessLogAction =
  | 'login'
  | 'logout'
  | 'view_patient'
  | 'edit_patient'
  | 'create_patient'
  | 'view_consultation'
  | 'create_consultation'
  | 'edit_consultation'
  | 'create_prescription'
  | 'upload_exam'
  | 'delete_record'
  | 'export_data';

/**
 * Registro de auditoria — espelho de `base44/entities/AccessLog.jsonc`.
 *
 * Obrigatórios: `user_email`, `action`.
 *
 * A trilha é append-only e a leitura é restrita a `role == 'admin'` (BR-MIGRAR-024).
 * Todo acesso ou alteração de dado sensível gera log (BR-MIGRAR-035) —
 * `patient_name` é dado COPIADO no momento do log, não FK.
 *
 * Sensíveis: `patient_name` (dado clínico copiado) e `user_email`.
 */
export type AccessLog = BaseEntity & {
  user_email: string;
  action: AccessLogAction;
  entity_type?: string;
  entity_id?: string;
  /** Nome do paciente — cópia para auditoria, sem FK. */
  patient_name?: string;
  ip_address?: string;
  user_agent?: string;
  /** O seed offline grava `null` aqui. */
  details?: Nullable<string>;
};
