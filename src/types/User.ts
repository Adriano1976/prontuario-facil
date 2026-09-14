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
 * Usuário do modo offline — variante discriminada SEM `role` e SEM `created_by_id`
 * (BR-MIGRAR-039 / AD-03).
 *
 * A ausência é estrutural: `never` impede que a variante carregue papel algum, de
 * modo que componentes que dependem de `role` tratem o caso offline explicitamente
 * em vez de compilar cego (achado F-01).
 *
 * O tipo garante a FORMA, não a autorização.
 */
export interface OfflineUser {
  /** Discriminante da variante offline. */
  kind: 'offline';
  id: UUID;
  email: string;
  full_name: string;
  /** Estruturalmente ausente. */
  role?: never;
  /** Estruturalmente ausente. */
  created_by_id?: never;
}

/** União do usuário da sessão: online autenticado ou a variante offline. */
export type User = AuthenticatedUser | OfflineUser;

/**
 * Usuário fixo do modo offline (BR-MIGRAR-039).
 *
 * Espelha `src/api/mockClient.js`:
 * `{ id: 'demo-user-001', email: 'demo@medrecord.local', full_name: 'Dra. Demo' }`.
 */
export const OFFLINE_USER: OfflineUser = {
  kind: 'offline',
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};
