import type { BaseEntity } from './base';
import type { ISODate, ISODateTime, UUID } from './common';

/**
 * Sinais vitais — objeto aninhado de `Consultation.jsonc`.
 *
 * No schema todos os campos são `string` (o médico digita livremente, inclusive
 * valores como "120/80"). Mantido fiel — NÃO converter para number.
 */
export interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: string;
  temperature?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  weight?: string;
  height?: string;
}

/**
 * Máquina de estados da consulta (BR-MIGRAR-007).
 *
 * Ciclo: `agendada -> em_andamento -> concluida`, ou `cancelada`. Default `'agendada'`.
 */
export type ConsultationStatus =
  | 'agendada'
  | 'em_andamento'
  | 'concluida'
  | 'cancelada';

/**
 * Consulta — espelho de `base44/entities/Consultation.jsonc`.
 *
 * Obrigatórios: `patient_id` (BR-MIGRAR-006) e `date`.
 */
export type Consultation = BaseEntity & {
  /** FK -> `Patient.id` (BR-C01). Obrigatório. */
  patient_id: UUID;
  date: ISODateTime;
  chief_complaint?: string;
  /** (O seed offline usa `anamnesis` — divergência registrada.) */
  history_present_illness?: string;
  vital_signs?: VitalSigns;
  physical_exam?: string;
  diagnosis?: string;
  /** CID-10. */
  icd_code?: string;
  treatment_plan?: string;
  notes?: string;
  /** Data de retorno (`format: date`). */
  follow_up_date?: ISODate;
  /** Default `'agendada'` (BR-MIGRAR-007). */
  status?: ConsultationStatus;
};
