import type { AccessScope, AdminScope, UserScope } from './contract';
import type { User } from '@/types';

/**
 * Resolução do escopo de acesso a partir da sessão.
 *
 * DECISÃO REGISTRADA (opção C, escolhida pelo usuário): o escopo é resolvido pelo
 * PAPEL de quem está logado, e não fixado como usuário nem como administrador. É a
 * única das três opções que preserva o comportamento atual nos dois modos: a regra de
 * acesso do servidor já decide por papel (`created_by_id == user.id` OU
 * `role == 'admin'`), e aqui essa mesma decisão passa a ser declarada no cliente.
 *
 * POR QUE ISTO EXISTE SEPARADO DO CONTRATO: o contrato exige que o escopo seja
 * informado — é o que faz "esquecer o filtro de dono" não compilar. Mas exigir que
 * cada tela monte o escopo à mão espalharia a mesma regra por 12 arquivos. Aqui ela
 * vive num lugar só.
 *
 * ⚠️ O QUE ESTE MÓDULO **NÃO** FAZ: não verifica autorização. Ele lê o papel que o
 * servidor informou. Um usuário comum que se declarasse administrador continuaria
 * compilando e seria barrado pela regra de acesso do servidor, que permanece
 * intocada (achado F-03).
 */

/**
 * Extrai o escopo a partir do usuário da sessão.
 *
 * - Sessão ausente (ainda carregando, ou sem autenticação): escopo de dono com
 *   identificador vazio. As leituras devolvem conjunto vazio em vez de vazar dados,
 *   que é o comportamento seguro para o intervalo em que a sessão não está pronta.
 * - Papel `'admin'`: escopo administrativo, leitura sem filtro de dono.
 * - Qualquer outro caso, inclusive o modo offline: escopo de dono, usando o
 *   identificador da sessão.
 *
 * No modo offline o usuário de demonstração não possui dono nos dados gravados, então
 * o filtro por dono não encontra registros e o conjunto fica vazio — comportamento
 * legítimo, já que não há dado real no modo offline.
 */
export function resolveScope(user: User | null | undefined): AccessScope {
  if (!user) {
    return { kind: 'user', user_id: '' } satisfies UserScope;
  }
  if (user.role === 'admin') {
    return { kind: 'admin' } satisfies AdminScope;
  }
  return { kind: 'user', user_id: user.id } satisfies UserScope;
}

/**
 * Indica se o escopo é administrativo.
 *
 * Útil para telas que precisam decidir se mostram algo além do próprio dado — por
 * exemplo, a trilha de auditoria, cuja leitura é restrita a administrador.
 */
export function isAdminScope(scope: AccessScope): scope is AdminScope {
  return scope.kind === 'admin';
}
