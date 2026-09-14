import type { BaseEntity } from './base';
import type { ISODate, UUID } from './common';

/** Tipo do exame — conjunto fechado (`Exam.jsonc`). */
export type ExamType = 'laboratorial' | 'imagem' | 'cardiologico' | 'outros';

/** Tipo do arquivo anexado. */
export type ExamFileType = 'pdf' | 'image';

/**
 * Exame — espelho de `base44/entities/Exam.jsonc`.
 *
 * Obrigatórios: `patient_id`, `name`, `date`.
 *
 * Contrato do seed (BR-MIGRAR-044): grava `file_url: ''` em vez de omitir, e ainda
 * não traz `file_type`. Ambos são tolerados — `''` é string válida e `file_type`
 * é opcional no schema.
 */
export type Exam = BaseEntity & {
  /** FK -> `Patient.id`. Obrigatório. */
  patient_id: UUID;
  /** FK -> `Consultation.id` (opcional). */
  consultation_id?: UUID;
  name: string;
  type?: ExamType;
  /** `format: date`, não datetime. */
  date: ISODate;
  /** `''` quando ainda não há anexo (contrato do seed). */
  file_url?: string;
  file_type?: ExamFileType;
  laboratory?: string;
  results_summary?: string;
  notes?: string;
};
