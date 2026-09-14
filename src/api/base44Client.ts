import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import type { DataClientBase, RawEntities, UploadFileResult } from './contract';
import { createAppDataClient, type AppDataClient } from './registry';
import { createMockClient } from './mockClient';

/**
 * Cliente de acesso a dados da aplicação.
 *
 * Seleciona a implementação por modo de construção (BR-MIGRAR-038): em modo offline
 * usa o adaptador de armazenamento local; caso contrário usa o SDK do BaaS. Nos dois
 * casos o resultado é ligado ao MESMO contrato tipado por `createAppDataClient`, que
 * é o que verifica em tempo de compilação que as duas implementações honram as mesmas
 * operações com as mesmas formas.
 *
 * PARIDADE: nenhuma regra mudou. As adaptações abaixo são estritamente de forma —
 * ver os comentários de cada gateway.
 */

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

/**
 * Parâmetros de inicialização.
 *
 * A anotação existe porque `appParams` vem de um módulo em JavaScript: sem ela, os
 * valores seriam inferidos como possivelmente nulos e a chamada de criação do cliente
 * não compilaria. O comportamento é o mesmo.
 */
const { appId, token, functionsVersion, appBaseUrl } = appParams as {
  appId: string;
  token: string | null;
  functionsVersion: string | null;
  appBaseUrl: string | null;
};

/**
 * Adaptador do SDK real.
 *
 * As três adaptações de forma, todas sem efeito em runtime:
 *
 * 1. **Saída da sessão** — o SDK devolve `void`; o contrato promete uma promessa. A
 *    promessa resolvida preserva a ordem de execução dos consumidores, que já
 *    aguardavam o retorno.
 * 2. **Redirecionamento para autenticação** — o SDK exige a URL de retorno; o
 *    contrato não a recebe, então usamos o endereço atual, que é o comportamento
 *    esperado pelos consumidores.
 * 3. **Envio de arquivo** — o SDK tipa o parâmetro como registro genérico; a
 *    adaptação estreita para o formato do contrato.
 */
function createSdkClient(): DataClientBase & { entities: RawEntities } {
  const sdk = createClient({
    appId,
    token: token ?? undefined,
    functionsVersion: functionsVersion ?? undefined,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl: appBaseUrl ?? undefined,
  });

  const gateways: DataClientBase = {
    auth: {
      me: () => sdk.auth.me(),
      logout: async () => {
        sdk.auth.logout();
      },
      redirectToLogin: () => {
        sdk.auth.redirectToLogin(window.location.href);
      },
    },
    integrations: {
      Core: {
        UploadFile: ({ file }) =>
          sdk.integrations.Core.UploadFile({ file }) as Promise<UploadFileResult>,
      },
    },
    appLogs: {
      logUserInApp: async () => {
        sdk.appLogs.logUserInApp();
      },
    },
  };

  return {
    ...gateways,
    entities: sdk.entities as unknown as RawEntities,
  };
}

/**
 * Cliente tipado da aplicação.
 *
 * É este o único ponto de acesso a dados usado pelas telas. O registro de entidades
 * é fechado: as 8 entidades do domínio têm repositório tipado; qualquer outro nome
 * não existe no tipo.
 */
export const base44: AppDataClient = createAppDataClient(
  OFFLINE ? (createMockClient().entities as RawEntities) : createSdkClient().entities,
  OFFLINE ? createMockClient() : createSdkClient(),
);
