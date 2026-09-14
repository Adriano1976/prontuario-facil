import type { BaseEntity } from './base';
import type { UUID } from './common';

/**
 * Tipo do documento clínico — conjunto fechado de 6 valores (`Prescription.jsonc`,
 * BR-MIGRAR-009).
 */
export type PrescriptionType =
  | 'receita_simples'
  | 'receita_controlada'
  | 'atestado'
  | 'solicitacao_exame'
  | 'encaminhamento'
  | 'declaracao';

/** Item de medicamento — preenchimento livre, sem base externa (BR-MIGRAR-008). */
export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

/**
 * Documento clínico emitido na consulta — espelho de `Prescription.jsonc`.
 *
 * Obrigatórios: `patient_id`, `type`, `content`.
 *
 * AMB-006 (XSS, preservado): o conteúdo interpolado NÃO é escapado no legado.
 * Esta migração NÃO deve adicionar escape — o risco é apenas documentado.
 *
 * BR-MIGRAR-008: a lista `medications` só existe quando `type` é de receita.
 * Mantida opcional aqui; a restrição por variante depende de decisão de design
 * (o componente legado `PrescriptionEditor.jsx` consome `.medications`).
 *
 * O schema NÃO tem FK para `Template`: o conteúdo é COPIADO no save, então alterar
 * um template não afeta prescrições já emitidas.
 */
export type Prescription = BaseEntity & {
  /** FK -> `Patient.id`. Obrigatório. */
  patient_id: UUID;
  /** FK -> `Consultation.id` (opcional). */
  consultation_id?: UUID;
  type: PrescriptionType;
  /** Conteúdo já interpolado. Sensível por natureza clínica. */
  content: string;
  medications?: Medication[];
  /** Nome do template usado — cópia, não referência. */
  template_name?: string;
  /** Dias de afastamento (atestados). */
  valid_days?: number;
  notes?: string;
};
