import type { ISODateTime, UUID } from './common';

/**
 * Campos injetados pelo BaaS Base44 em toda entidade persistida.
 *
 * `id` e `created_date` são garantidos no `create` — tanto pelo BaaS quanto pelo
 * mock (`src/api/mockClient.js`, BR-MIGRAR-042: "`create` popula `id` (uuid),
 * `created_date` (ISO agora) e, se ausente, `date`").
 *
 * `created_by_id` NÃO é injetado pelo mock (o seed offline não o contém) e é
 * ausente no `OFFLINE_USER` por decisão explícita (BR-MIGRAR-039). Por isso é
 * **opcional** aqui, com a obrigatoriedade de escopo imposta no contrato de query
 * do `Base44Client` (BR-MIGRAR-034 / AD-03) — não neste tipo de registro.
 *
 * ⚠️ O mock não aplica RLS (BR-MIGRAR-044): este campo documenta a origem, não
 * garante isolamento.
 */
export interface BaseEntity {
  /** Identificador único (UUID gerado pelo BaaS; `crypto.randomUUID()` no mock). */
  id: UUID;
  /** Data/hora de criação em ISO 8601, preenchida no `create`. */
  created_date: ISODateTime;
  /** Dono do registro — base da RLS `created_by_id == user.id || role == 'admin'`. */
  created_by_id?: UUID;
  /** Data/hora da última atualização, quando o BaaS a fornece. */
  updated_date?: ISODateTime;
}

/** Campos de auditoria temporal, úteis para `Omit`/`Pick` na camada de tipos. */
export interface Timestamped {
  created_date: ISODateTime;
  updated_date?: ISODateTime;
}
