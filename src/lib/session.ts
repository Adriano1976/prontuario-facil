import type { AuthenticatedUser, UserRole } from '@/types';

/**
 * Identidade da sessão.
 *
 * A camada de sessão devolve `unknown` de propósito, porque o contrato não pode
 * prometer `role` — em modo offline ele não existe (BR-MIGRAR-039). Este módulo é o
 * ponto único onde o valor do servidor vira o tipo de domínio, e onde essa conversão
 * fica explícita em vez de espalhada pelas telas.
 *
 * ⚠️ O QUE ELE **NÃO** FAZ: não valida autorização. Ele lê o papel que o servidor
 * informou e o representa. Um papel inesperado vindo do servidor é preservado como
 * veio; o que o tipo garante é que a AUSÊNCIA de papel seja explícita, não silenciosa.
 */

/** Papéis conhecidos do sistema. */
const PAPEIS_CONHECIDOS: readonly UserRole[] = ['admin', 'user'];

/**
 * Converte o usuário devolvido pela camada de dados para o tipo de domínio.
 *
 * Devolve `null` quando o valor não tem a forma mínima esperada (sem identificador ou
 * sem email), o que mantém o comportamento das telas: sessão incompleta é tratada como
 * sessão ausente, e não como um usuário com campos vazios.
 *
 * O papel é preservado apenas quando é um dos papéis conhecidos. Um papel
 * desconhecido vindo do servidor fica **ausente** em vez de ser adivinhado — o que
 * mantém a regra conservadora de "sem papel conhecido, sem acesso administrativo".
 */
export function toSessionUser(raw: unknown): AuthenticatedUser | null {
  if (!raw || typeof raw !== 'object') return null;

  const value = raw as Record<string, unknown>;
  const id = value.id;
  const email = value.email;

  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof email !== 'string' || email.length === 0) return null;

  const fullName = typeof value.full_name === 'string' ? value.full_name : undefined;
  const role = value.role;
  const roleConhecido =
    typeof role === 'string' && (PAPEIS_CONHECIDOS as readonly string[]).includes(role)
      ? (role as UserRole)
      : undefined;
  const createdById =
    typeof value.created_by_id === 'string' ? value.created_by_id : undefined;

  return {
    kind: 'authenticated',
    id,
    email,
    full_name: fullName,
    role: roleConhecido,
    created_by_id: createdById,
  };
}
