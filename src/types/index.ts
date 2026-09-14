/**
 * Entidades e enums de domínio do Prontuário Fácil.
 *
 * Fonte canônica: `base44/entities/*.jsonc` (schemas imutáveis do BaaS).
 * Estes tipos são um ESPELHO fiel desses schemas — ver
 * `_reversa_sdd/migration/target_data_model.md`.
 *
 * Escopo desta camada: apenas tipos e constantes de domínio. O contrato de acesso
 * a dados (`Base44Client`) pertence a `src/api/` e é construído na Onda 3.
 */

export type {
  BloodType,
  EntityStatus,
  FilterConditions,
  Gender,
  ISODate,
  ISODateTime,
  Nullable,
  SortField,
  UUID,
  Weekday,
} from './common';

export type { BaseEntity, Timestamped } from './base';

export type { AccessLog, AccessLogAction } from './AccessLog';
export type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from './Appointment';
export { DEFAULT_APPOINTMENT_DURATION } from './Appointment';
export type { Consultation, ConsultationStatus, VitalSigns } from './Consultation';
export type { Doctor, WorkingDays, WorkingHours } from './Doctor';
export type { Exam, ExamFileType, ExamType } from './Exam';
export type { LGPDConsent, Patient } from './Patient';
export type { Medication, Prescription, PrescriptionType } from './Prescription';
export type { Template, TemplateType } from './Template';

export type { AuthenticatedUser, OfflineUser, User, UserRole } from './User';
export { OFFLINE_USER } from './User';
