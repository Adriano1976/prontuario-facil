import type { FilterConditions, SortField, UUID } from '@/types';

/**
 * Contrato de acesso a dados da aplicação.
 *
 * POR QUE ESTE NOME: o SDK do Base44 já exporta um tipo chamado `Base44Client`
 * (`node_modules/@base44/sdk/dist/client.types.d.ts`) com a interface completa do
 * cliente deles. Declarar aqui outro `Base44Client` criaria ambiguidade em todo
 * arquivo que importasse os dois. Nosso contrato é o da APLICAÇÃO; o tipo do SDK
 * é importado como `SdkBase44Client` no adapter.
 *
 * ESCOPO (BR-MIGRAR-041 / BR-OFF05): apenas o subconjunto realmente usado pelo
 * legado — CRUD por entidade, `auth` e `integrations.Core.UploadFile`. Ficam FORA:
 * `entities.<X>.get(id)`, `bulkCreate`/`bulkUpdate`, `count`, `SendEmail`,
 * `InvokeLLM`, realtime e filtros avançados (BR-MIGRAR-043).
 *
 * ⚠️ PARIDADE: descreve o comportamento existente. NÃO altera runtime — é uma
 * camada de verificação em compile-time (regra de ouro do diff: só tipos).
 */

/** Prefixo da mensagem de erro de registro ausente (BR-MIGRAR-042). */
export const NOT_FOUND_MESSAGE_PREFIX = 'Not found: ';

/** Resultado de exclusão — espelha o `DeleteResult` do SDK. */
export interface DeleteResult {
  success: boolean;
}

/** Resultado do upload via `integrations.Core.UploadFile`. */
export interface UploadFileResult {
  /** Data URL do arquivo (o mock devolve `reader.result`). */
  file_url: string;
}

/** Parâmetros aceitos por `integrations.Core.UploadFile`. */
export interface UploadFileParams {
  file: File;
}

/**
 * Operações de um repositório de entidade.
 *
 * Assinaturas deliberadamente iguais às do legado: `sort` aceita 1 campo com
 * prefixo opcional `-` para descendente, e `filter` compara apenas com `===`
 * (BR-MIGRAR-043).
 *
 * `T` é o tipo do registro já com campos de servidor (`id`, `created_date`, …).
 * `TInput` é o que a escrita aceita — sem os campos que o servidor preenche.
 */
export interface EntityRepository<T, TInput> {
  /**
   * Lista registros.
   *
   * ⚠️ Leitura SEM escopo de ownership. Para entidades sob RLS use a camada com
   * escopo obrigatório (`src/api/scopedRead.ts`) — BR-MIGRAR-034.
   */
  list(sort?: SortField<T>, limit?: number): Promise<T[]>;

  /** Filtra por igualdade de campos, com ordenação e limite opcionais. */
  filter(conditions: FilterConditions<T>, sort?: SortField<T>, limit?: number): Promise<T[]>;

  /** Cria um registro; o servidor (ou o mock) preenche `id` e `created_date`. */
  create(data: TInput): Promise<T>;

  /** Atualiza um registro; `id` é preservado (BR-MIGRAR-042). */
  update(id: UUID, data: Partial<TInput>): Promise<T>;

  /** Exclui um registro. */
  delete(id: UUID): Promise<DeleteResult>;
}

/**
 * Forma crua de acesso às entidades: repositórios indexados por nome.
 *
 * ⚠️ POR QUE `never` E NÃO `unknown`: `unknown` seria o tipo "mais amplo" em
 * posição de valor, mas em posição de **parâmetro** ele é o mais restritivo — uma
 * implementação que aceite algo específico não é atribuível a uma que promete
 * aceitar `unknown`. Usar `unknown` aqui faria o tipo rejeitar qualquer
 * implementação concreta, o que anularia a verificação das duas implementações.
 * `EntityRepository<never, never>` inverte isso: aceita qualquer implementação cujos
 * parâmetros sejam compatíveis, que é exatamente o que se quer checar.
 *
 * Existe apenas para ligar os adaptadores ao registry tipado. NÃO consuma esta forma
 * no código de aplicação — use `AppDataClient`, obtido via `createAppDataClient`
 * (`src/api/registry.ts`).
 */
export type RawEntities = Record<string, EntityRepository<never, never>>;

/** Autenticação — subconjunto usado pelo legado. */
export interface AuthGateway {
  /**
   * Usuário da sessão.
   *
   * Devolve `unknown` de propósito: o contrato não pode prometer `role`, porque em
   * modo offline ele não existe (BR-MIGRAR-039). O estreitamento para `User`
   * acontece na camada de sessão, onde o modo é conhecido.
   */
  me(): Promise<unknown>;
  /**
   * Encerra a sessão.
   *
   * O parâmetro é o endereço para onde ir depois de sair. O consumidor legado
   * (`AuthContext.jsx`) o usa no caminho com redirecionamento e o omite no caminho
   * sem — por isso é opcional no contrato.
   */
  logout(redirectUrl?: string): Promise<void>;
  /**
   * Redireciona para a autenticação.
   *
   * O parâmetro é o endereço de retorno após autenticar. O consumidor legado passa o
   * endereço atual (`AuthContext.jsx`), e o SDK o exige — por isso ele é parte do
   * contrato, em vez de ser decidido internamente pelo adaptador.
   */
  redirectToLogin(nextUrl: string): void;
  /**
   * Lê as configurações públicas da aplicação.
   *
   * É o que informa se a aplicação exige autenticação e se o usuário está registrado.
   * Existe no contrato para que a camada de sessão não precise alcançar um caminho
   * interno do SDK — o que acoplaria o projeto a um detalhe de implementação de
   * terceiro.
   */
  getPublicSettings(): Promise<unknown>;
}

/** Logs de uso do app — sem efeito no legado e no mock (BR-MIGRAR-045). */
export interface AppLogsGateway {
  /**
   * Registra o uso de uma página.
   *
   * O parâmetro é o nome da página visitada — o consumidor legado
   * (`NavigationTracker.jsx`) o informa, e o SDK o exige.
   */
  logUserInApp(pageName: string): Promise<void>;
}

/** Integrações do SDK usadas pela aplicação. */
export interface IntegrationsGateway {
  Core: {
    UploadFile(params: UploadFileParams): Promise<UploadFileResult>;
  };
}

/**
 * Escopo de usuário comum: o dono dos dados. `user_id` é o `created_by_id`
 * aplicado às leituras escopadas.
 */
export interface UserScope {
  kind: 'user';
  user_id: UUID;
}

/**
 * Escopo administrativo.
 *
 * ⚠️ ATENÇÃO AO QUE ISTO **NÃO** É: `kind: 'admin'` é uma DECLARAÇÃO de quem
 * chama, não uma verificação. O compilador confere a forma, nunca a autorização —
 * código que passar `kind: 'admin'` indevidamente continua compilando. A defesa
 * real é a RLS do BaaS, que permanece intocada (BR-MIGRAR-034, achado F-03).
 */
export interface AdminScope {
  kind: 'admin';
}

/** Escopo de acesso às entidades sob RLS: dono ou admin. */
export type AccessScope = UserScope | AdminScope;

/**
 * Parte do contrato independente do registry de entidades.
 *
 * Os adaptadores (SDK real e mock) implementam esta forma. A verificação de que
 * ambos honram o contrato COMPLETO — incluindo o registry tipado — é feita em
 * compile-time por `createAppDataClient` (`src/api/registry.ts`), que é o cenário
 * "SDK e mock implementam a mesma interface" do teste de paridade PT-010.
 */
export interface DataClientBase {
  auth: AuthGateway;
  integrations: IntegrationsGateway;
  appLogs: AppLogsGateway;
}
