/**
 * Tipos primitivos e enums compartilhados do domínio.
 *
 * Fonte canônica: `base44/entities/*.jsonc` + `_reversa_sdd/migration/target_data_model.md`.
 */

/** Identificador único (UUID gerado pelo BaaS; `crypto.randomUUID()` no mock). */
export type UUID = string;

/** Data no formato `YYYY-MM-DD` (JSON Schema `format: date`). */
export type ISODate = string;

/** Data e hora no formato ISO 8601 (JSON Schema `format: date-time`). */
export type ISODateTime = string;

/** Valor que o BaaS pode entregar como nulo (o seed offline usa `null` em `details`). */
export type Nullable<T> = T | null;

/**
 * Gênero do paciente — enum canônico (`Patient.jsonc`).
 *
 * DIVERGÊNCIA CONHECIDA: o seed offline (`src/api/mockSeed.js`) grava as formas
 * legadas `'M'` / `'F'`. Essas formas NÃO pertencem ao contrato e por isso estão
 * deliberadamente fora da union — o seed deve ser alinhado na Onda 6.
 */
export type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';

/** Tipo sanguíneo — enum canônico com 9 valores (BR-MIGRAR-002). */
export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'desconhecido';

/** Status cadastral do paciente — default `'ativo'` (BR-MIGRAR-005). */
export type EntityStatus = 'ativo' | 'inativo';

/** Dia da semana: 0 = domingo … 6 = sábado (BR-MIGRAR-016). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Condições aceitas por `filter(conditions)` no contrato Base44Client.
 *
 * BR-MIGRAR-043: o `filter` compara apenas com `===` — sem `in`, `contains`,
 * `gte`, `lte` ou `ne`.
 */
export type FilterConditions<T> = Partial<{ [K in keyof T]: T[K] }>;

/** Ordenação: 1 campo, `'campo'` (asc) ou `'-campo'` (desc) — BR-MIGRAR-043. */
export type SortField<T> = keyof T | `-${string & keyof T}`;
