import type { BaseEntity } from './base';
import type { UUID } from './common';

/**
 * Papel do usuário autenticado (BR-MIGRAR-036).
 *
 * INFERIDO: apenas `'admin'` está documentado de forma literal no projeto
 * (`permissions.md`, ADR-001 e a RLS dos 8 JSONC usam `role == 'admin'`).
 * O literal do papel não-admin NÃO está documentado — `'user'` é a inferência
 * adotada, a partir do papel descrito em `permissions.md` §1.
 * Confirmar com o stakeholder antes do cutover.
 */
export type UserRole = 'admin' | 'user';

/**
 * Usuário autenticado, vindo de `auth.me()`.
 *
 * `role` é opcional porque o BaaS pode não devolvê-lo, mas EXISTE nesta variante —
 * diferente do usuário offline, onde é ausente por construção. Componentes que
 * dependem de `role` devem tratar a ausência explicitamente (BR-MIGRAR-036, F-01).
 */
export interface AuthenticatedUser {
  /** Discriminante da variante online. */
  kind: 'authenticated';
  id: UUID;
  email: string;
  full_name?: string;
  role?: UserRole;
  created_by_id?: UUID;
}

/**
 * Usuário do modo offline — variante SEM `role` e SEM `created_by_id`
 * (BR-MIGRAR-039 / AD-03).
 *
 * O DISCRIMINANTE é a presença de `role`, e ele é o campo que importa:
 * `role?: never` torna a ausência ESTRUTURAL, de modo que trecho de código que exija
 * papel não compila contra esta variante — é o que obriga o tratamento explícito do
 * caso offline em vez de compilar cego (achado F-01).
 *
 * O valor real é exatamente o do legado: `id`, `email` e `full_name`. Não há campo
 * `kind` no dado, e por isso o tipo também não o exige. A distinção entre as duas
 * variantes é feita por `role`: presente como `UserRole` no autenticado, `never`
 * aqui — o que permite estreitar com `if (user.role)`.
 *
 * O tipo garante a FORMA, não a autorização.
 */
export interface OfflineUser {
  id: UUID;
  email: string;
  full_name: string;
  /** Estruturalmente ausente — é este o discriminante da variante. */
  role?: never;
  /** Estruturalmente ausente. */
  created_by_id?: never;
}

/** União do usuário da sessão: online autenticado ou a variante offline. */
export type User = AuthenticatedUser | OfflineUser;

/**
 * Registro persistido do usuário da aplicação — a entidade embutida `User` do BaaS.
 *
 * Não é uma das 8 entidades clínicas do domínio, mas o legado a usa em um ponto:
 * a exclusão de conta no `Layout` (`entities.User.delete`). O SDK documenta a
 * entidade embutida `User` com regras de acesso próprias e imutáveis; este tipo é o
 * espelho mínimo dos campos que a aplicação consome.
 */
export interface AppUser extends BaseEntity {
  email: string;
  full_name?: string;
  role?: UserRole;
}

/**
 * Usuário fixo do modo offline (BR-MIGRAR-039).
 *
 * Espelha exatamente `src/api/mockClient.js`:
 * `{ id: 'demo-user-001', email: 'demo@medrecord.local', full_name: 'Dra. Demo' }`.
 */
export const OFFLINE_USER: OfflineUser = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};
