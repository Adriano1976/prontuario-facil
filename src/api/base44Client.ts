import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import type { SendEmailParams, UploadFileResult } from './contract';
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

/** Endereço público das configurações da aplicação no BaaS. */
const PUBLIC_SETTINGS_PATH = '/api/apps/public';

/**
 * Parâmetros de inicialização.
 *
 * A anotação existe porque `appParams` vem de um módulo em JavaScript: sem ela, os
 * valores seriam inferidos como objeto vazio e a criação do cliente não compilaria. O
 * comportamento é o mesmo.
 */
const { appId, token, functionsVersion, appBaseUrl } = appParams as {
  appId: string;
  token: string | null;
  functionsVersion: string | null;
  appBaseUrl: string | null;
};

/**
 * Indica se há token de sessão.
 *
 * A verificação da sessão só é feita quando existe token — é a condição do legado, e a
 * camada de sessão precisa dela. Fica aqui para que a leitura dos parâmetros de
 * inicialização continue num lugar só.
 */
export const hasSessionToken = Boolean(token);

/**
 * Lê as configurações públicas da aplicação.
 *
 * POR QUE AQUI: o consumidor legado (`AuthContext.jsx`) criava o cliente de requisição
 * diretamente, importando um caminho INTERNO do SDK. Isso acopla o projeto a um
 * detalhe de implementação de terceiro, que pode mudar sem aviso. Trazendo para cá, o
 * resto do projeto fala apenas com o contrato.
 *
 * A importação é sob demanda para que o módulo do SDK só seja carregado quando esta
 * função for realmente usada — mesmo comportamento do arquivo original, que a
 * importava no topo mas só a executava dentro da verificação de sessão.
 */
export async function fetchPublicSettings(): Promise<unknown> {
  const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
  const client = createAxiosClient({
    baseURL: PUBLIC_SETTINGS_PATH,
    headers: { 'X-App-Id': appId },
    token: token ?? undefined,
    interceptResponses: true,
  });
  return client.get(`/prod/public-settings/by-id/${appId}`);
}

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
      getPublicSettings: () => fetchPublicSettings(),
    },
    integrations: {
      Core: {
        UploadFile: ({ file }) =>
          sdk.integrations.Core.UploadFile({ file }) as Promise<UploadFileResult>,
        SendEmail: (params: SendEmailParams) => sdk.integrations.Core.SendEmail(params),
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
