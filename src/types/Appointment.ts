import type { BaseEntity } from './base';
import type { ISODateTime, UUID } from './common';

/** Tipo do agendamento — conjunto fechado, default `'primeira_consulta'` (BR-MIGRAR-014). */
export type AppointmentType =
  | 'primeira_consulta'
  | 'retorno'
  | 'exame'
  | 'procedimento';

/**
 * Máquina de estados do agendamento (BR-MIGRAR-011).
 *
 * Fluxo: `agendado -> confirmado -> em_atendimento -> concluido`, com `cancelado`
 * e `faltou` como saídas. Default `'agendado'`.
 *
 * A transição é MANUAL no legado — congelada por decisão humana (AMB-003).
 */
export type AppointmentStatus =
  | 'agendado'
  | 'confirmado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'faltou';

/** Duração padrão de um agendamento, em minutos (BR-MIGRAR-014). */
export const DEFAULT_APPOINTMENT_DURATION = 30;

/**
 * Agendamento — espelho de `base44/entities/Appointment.jsonc`.
 *
 * Obrigatórios: `patient_id`, `doctor_id`, `date` (BR-MIGRAR-010).
 */
export type Appointment = BaseEntity & {
  /** FK -> `Patient.id` (BR-A01). */
  patient_id: UUID;
  /** FK -> `Doctor.id` (BR-A01). */
  doctor_id: UUID;
  date: ISODateTime;
  /** Default 30. */
  duration?: number;
  /** Default `'primeira_consulta'`. */
  type?: AppointmentType;
  /** Default `'agendado'`. */
  status?: AppointmentStatus;
  notes?: string;
  /** Apenas flag — não altera status (BR-MIGRAR-012). */
  reminder_sent?: boolean;
  reminder_sent_date?: ISODateTime;
  /** FK -> `Consultation.id`, quando o atendimento gera consulta. */
  consultation_id?: UUID;
};
