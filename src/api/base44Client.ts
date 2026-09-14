import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import type { UploadFileResult } from './contract';
import { bindAdapter, type AdapterGateways } from './entities';
import type { AppDataClient } from './registry';
import { createMockClient } from './mockClient';

/**
 * Cliente de acesso a dados da aplicação.
 *
 * Seleciona a implementação por modo de construção (BR-MIGRAR-038): em modo offline
 * usa o adaptador de armazenamento local; caso contrário usa o SDK do BaaS. Nos dois
 * casos o resultado passa por `bindAdapter`, que liga os repositórios ao MESMO
 * contrato tipado — é ali que se verifica, em tempo de compilação, que as duas
 * implementações honram as mesmas operações com as mesmas formas.
 *
 * PARIDADE: nenhuma regra mudou. As adaptações abaixo são estritamente de forma —
 * ver os comentários de cada gateway.
 */

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

/**
 * Parâmetros de inicialização.
 *
 * A anotação existe porque `appParams` vem de um módulo em JavaScript: sem ela, os
 * valores seriam inferidos como possivelmente nulos e a criação do cliente não
 * compilaria. O comportamento é o mesmo.
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
 * Três adaptações de forma, todas sem efeito observável:
 *
 * 1. **Saída da sessão** — o SDK devolve `void`; o contrato promete uma promessa. A
 *    promessa resolvida preserva a ordem de execução dos consumidores, que já
 *    aguardavam o retorno.
 * 2. **Redirecionamento para autenticação** — a URL de retorno vem do contrato; o SDK
 *    a exige. O contrato ganhou o parâmetro justamente porque o consumidor legado
 *    passa o endereço atual — mesmo valor, agora explícito.
 * 3. **Envio de arquivo** — o SDK tipa o parâmetro como registro genérico; a adaptação
 *    estreita o retorno para o formato do contrato.
 */
function createSdkAdapter(): AdapterGateways & { entities: Record<string, unknown> } {
  const sdk = createClient({
    appId,
    token: token ?? undefined,
    functionsVersion: functionsVersion ?? undefined,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl: appBaseUrl ?? undefined,
  });

  return {
    entities: sdk.entities as unknown as Record<string, unknown>,
    auth: {
      me: () => sdk.auth.me(),
      logout: async () => {
        sdk.auth.logout();
      },
      redirectToLogin: (nextUrl: string) => {
        sdk.auth.redirectToLogin(nextUrl);
      },
    },
    integrations: {
      Core: {
        UploadFile: ({ file }) =>
          sdk.integrations.Core.UploadFile({ file }) as Promise<UploadFileResult>,
      },
    },
    appLogs: {
      logUserInApp: async (pageName: string) => {
        sdk.appLogs.logUserInApp(pageName);
      },
    },
  };
}

/**
 * Cliente tipado da aplicação.
 *
 * É este o único ponto de acesso a dados usado pelas telas. O registro de entidades é
 * fechado: as 8 entidades do domínio têm repositório tipado; qualquer outro nome não
 * existe no tipo.
 *
 * A implementação é escolhida uma única vez, no carregamento do módulo, conforme o
 * modo de construção — mesmo comportamento do legado.
 */
function buildClient(): AppDataClient {
  if (OFFLINE) {
    const mock = createMockClient();
    return bindAdapter(mock.entities, mock);
  }
  const sdk = createSdkAdapter();
  return bindAdapter(sdk.entities, sdk);
}

export const base44: AppDataClient = buildClient();
