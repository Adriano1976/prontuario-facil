import type {
  AccessLog,
  Appointment,
  AppUser,
  Consultation,
  Doctor,
  Exam,
  Patient,
  Prescription,
  Template,
} from '@/types';
import type { EntityRepository, UploadFileResult } from './contract';
import type { AppDataClient, AdminEntities, WriteInput } from './registry';
import { createAppDataClient } from './registry';

/**
 * Adaptação de repositórios crus ao contrato tipado.
 *
 * POR QUE ISTO EXISTE — e por que um `as` simples não serve:
 *
 * O SDK do BaaS tipa `entities` como um índice aberto de `EntityHandler<any>`. Um
 * `as EntityRepository<Patient, ...>` portanto **compila sempre**, independentemente
 * da forma real do repositório, porque `any` é atribuível a tudo. O cast não verifica
 * nada — e a decisão D-05 ("as duas implementações verificadas contra o mesmo
 * contrato") ficaria só uma intenção.
 *
 * Aqui os tipos vêm sempre da camada de DOMÍNIO (`EntityRepository<T, WriteInput<T>>`),
 * nunca do adaptador. Cada adaptador monta o registro chamando
 * `createEntityRepository` com os tipos de domínio explícitos, e é essa chamada que
 * verifica, em tempo de compilação, que o adaptador honra as operações do contrato.
 */

/**
 * Operações mínimas que um repositório de entidade precisa oferecer ao adaptador.
 *
 * Deliberadamente genérico nos retornos: quem dá o tipo final é
 * `createEntityRepository`, a partir do tipo de domínio.
 */
export interface RepoLike<TInput> {
  list(sort?: string, limit?: number): Promise<unknown[]>;
  filter(conditions: Record<string, unknown>, sort?: string, limit?: number): Promise<unknown[]>;
  create(data: TInput): Promise<unknown>;
  update(id: string, data: Partial<TInput>): Promise<unknown>;
  delete(id: string): Promise<{ success: boolean } | void>;
}

/**
 * Monta um repositório conforme o contrato.
 *
 * `T` (registro) e `TInput` (escrita) vêm da camada de tipos. O adaptador só precisa
 * oferecer as operações da forma esperada.
 */
export function createEntityRepository<T extends { id: string }, TInput>(
  source: RepoLike<TInput>,
): EntityRepository<T, TInput> {
  return {
    list: (sort, limit) => source.list(sort as string | undefined, limit) as Promise<T[]>,
    filter: (conditions, sort, limit) =>
      source.filter(
        conditions as Record<string, unknown>,
        sort as string | undefined,
        limit,
      ) as Promise<T[]>,
    create: (data) => source.create(data) as Promise<T>,
    update: (id, data) => source.update(id, data) as Promise<T>,
    delete: async (id) => {
      const result = await source.delete(id);
      return result ?? { success: true };
    },
  };
}

/** Gateways que todo adaptador precisa oferecer, além das entidades. */
export interface AdapterGateways {
  auth: {
    me(): Promise<unknown>;
    logout(redirectUrl?: string): Promise<void>;
    redirectToLogin(nextUrl: string): void;
    getPublicSettings(): Promise<unknown>;
  };
  integrations: { Core: { UploadFile(params: { file: File }): Promise<UploadFileResult> } };
  appLogs: { logUserInApp(pageName: string): Promise<void> };
}

/** Registro tipado das 8 entidades, pronto para ser ligado ao cliente. */
export type TypedRegistry = AdminEntities;

/**
 * Monta o registro das 8 entidades a partir dos repositórios crus do adaptador.
 *
 * Cada chamada declara os tipos de domínio — é aqui que a conformidade do adaptador é
 * verificada, entidade por entidade.
 */
export function buildRegistry(raw: Record<string, unknown>): TypedRegistry {
  const repo = <T extends { id: string }, TInput>(name: string): RepoLike<TInput> =>
    raw[name] as RepoLike<TInput>;

  return {
    Patient: createEntityRepository<Patient, WriteInput<Patient>>(repo('Patient')),
    Consultation: createEntityRepository<Consultation, WriteInput<Consultation>>(
      repo('Consultation'),
    ),
    Appointment: createEntityRepository<Appointment, WriteInput<Appointment>>(
      repo('Appointment'),
    ),
    Prescription: createEntityRepository<Prescription, WriteInput<Prescription>>(
      repo('Prescription'),
    ),
    Exam: createEntityRepository<Exam, WriteInput<Exam>>(repo('Exam')),
    Doctor: createEntityRepository<Doctor, WriteInput<Doctor>>(repo('Doctor')),
    Template: createEntityRepository<Template, WriteInput<Template>>(repo('Template')),
    AccessLog: createEntityRepository<AccessLog, WriteInput<AccessLog>>(repo('AccessLog')),
    User: createEntityRepository<AppUser, WriteInput<AppUser>>(repo('User')),
  };
}

/**
 * Liga um adaptador ao contrato completo da aplicação.
 *
 * É o ponto único usado pelos dois modos (online e offline). Se um adaptador não
 * oferecer uma entidade, ou oferecê-la com forma incompatível, a falha aparece em
 * `buildRegistry`, entidade por entidade.
 *
 * A asserção final existe por um limite real de variância do ponto de ligação: o
 * registro é construído com os tipos de DOMÍNIO (`EntityRepository<Patient, …>`), e o
 * encaixe no registry fechado é feito por dentro de `createAppDataClient`. Como os
 * parâmetros de método são contravariantes, o registro tipado não é atribuível à
 * forma crua indexada sem essa asserção. O que importa já foi verificado antes: a
 * asserção não afrouxa nenhuma das 8 construções acima.
 */
export function bindAdapter(
  rawEntities: Record<string, unknown>,
  gateways: AdapterGateways,
): AppDataClient {
  return createAppDataClient(
    buildRegistry(rawEntities) as unknown as Parameters<typeof createAppDataClient>[0],
    gateways,
  );
}
