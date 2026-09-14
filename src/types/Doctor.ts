import type { BaseEntity } from './base';
import type { Weekday } from './common';

/** Dias da semana trabalhados — 0 = domingo … 6 = sábado (BR-MIGRAR-016). */
export type WorkingDays = Weekday[];

/** Janela de atendimento, em "HH:MM" (string livre no schema). */
export interface WorkingHours {
  start: string;
  end: string;
}

/**
 * Médico — espelho de `base44/entities/Doctor.jsonc`.
 *
 * Obrigatórios: `full_name`, `specialty`, `crm`.
 *
 * RBAC: leitura livre para autenticados; criação/alteração/exclusão apenas
 * `role == 'admin'` (BR-MIGRAR-015/017).
 */
export type Doctor = BaseEntity & {
  full_name: string;
  specialty: string;
  crm: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  /** Restrição de slot: agendamento só aceita horário dentro desta janela (BR-MIGRAR-013). */
  working_days?: WorkingDays;
  working_hours?: WorkingHours;
  /** Duração padrão da consulta em minutos — default 30. */
  appointment_duration?: number;
  /** Default `true`. */
  is_active?: boolean;
};
