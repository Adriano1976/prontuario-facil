import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toSessionUser } from '@/lib/session';

/**
 * Sessão atual, já convertida para o tipo de domínio.
 *
 * POR QUE EXISTE: a navegação, a guarda de rota e as guardas de ação das telas
 * administrativas precisam do MESMO dado. Sem este ponto único, cada uma abriria a
 * própria consulta e decidiria por conta própria o que fazer com um papel ausente.
 * A chave é a mesma que a navegação já usava (`['current-user']`), então o cache não
 * muda: quem já consultava continua lendo o mesmo registro.
 *
 * ⚠️ O QUE ELE **NÃO** FAZ: não autoriza. Entrega o papel que existe; quem decide é a
 * guarda — `RoleGuard` para rota, `isAdmin` para ação. Papel ausente ou desconhecido
 * vira `undefined` (regra conservadora de `toSessionUser`), e `undefined` nunca é
 * igual a `'admin'`. A palavra final continua sendo a regra de acesso do servidor.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => toSessionUser(await base44.auth.me()),
  });
}
