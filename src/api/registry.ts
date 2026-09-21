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
import type {
  AdminScope,
  DataClientBase,
  EntityRepository,
  RawEntities,
  UserScope,
} from './contract';
import { createOwnedEntity, type OwnedEntity } from './scopedRead';

/**
 * Registry FECHADO de entidades do domínio.
 *
 * DECISÃO DE DESIGN (Onda 3): `entities` é tipado com as entidades conhecidas, em
 * vez de um índice aberto que aceitaria qualquer nome. Motivo: com índice aberto,
 * um erro de digitação em `entities.Pacient.list()` continuaria compilando e só
 * falharia em runtime — exatamente o risco nº 5 do brief ("desacoplamento
 * silencioso"). O `Proxy` dinâmico do mock continua existindo, mas como detalhe de
 * implementação em runtime, não como contrato de tipo.
 */

/**
 * Campos injetados pelo servidor em todo registro (espelha `ServerEntityFields` do
 * SDK). A escrita não os exige: o `create` os preenche (BR-MIGRAR-042).
 */
export type ServerFields = 'id' | 'created_date' | 'updated_date' | 'created_by_id';

/**
 * `Omit` que DISTRIBUI sobre união.
 *
 * ⚠️ ARMADILHA REAL (encontrada por teste, Onda 3): o `Omit` nativo NÃO distribui
 * sobre união de tipos — ele colapsa as variantes numa única chave. Como
 * `Patient = BaseEntity & LGPDConsent` e `LGPDConsent` é uma união discriminada,
 * o `Omit` direto fazia o invariante do consentimento LGPD SUMIR: passava a
 * compilar `lgpd_consent: true` sem `lgpd_consent_date`/`lgpd_consent_ip`, que é
 * exatamente o que a BR-MIGRAR-004 existe para impedir.
 *
 * Este utilitário aplica o `Omit` variante a variante, preservando a discriminação.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * Payload de escrita de uma entidade.
 *
 * Os campos de servidor ficam de fora. Os demais seguem o schema — inclusive os
 * enums fechados e o tipo condicional de LGPD, que é o que faz os cenários
 * "enums não aceitam valores fora do conjunto" e "LGPD exige data e IP" valerem.
 */
export type WriteInput<T> = DistributiveOmit<T, ServerFields>;

/** Leitura crua de uma entidade (SEM escopo de ownership aplicado). */
export type EntityRead<T> = EntityRepository<T, WriteInput<T>>;

/**
 * Entidade de LEITURA ABERTA para autenticados: `Doctor` e `Template`
 * (BR-MIGRAR-017/020) e a trilha de auditoria `AccessLog`, cuja leitura é
 * restrita a admin pela RLS (BR-MIGRAR-024).
 *
 * As duas formas de acesso existem porque a regra de ESCRITA difere entre elas: a
 * inserção na trilha de auditoria é feita por qualquer usuário autenticado, e usar o
 * acesso administrativo para gravar seria declarar um escopo que não corresponde ao
 * de quem grava.
 */
export interface OpenReadEntity<T> extends EntityRead<T> {
  /** Acesso na condição do próprio usuário. */
  asUser(scope: UserScope): EntityRead<T>;
  /** Acesso administrativo explícito, para leitura sem filtro de dono. */
  asAdmin(scope: AdminScope): EntityRead<T>;
}

/** Visão administrativa do cliente: leitura sem escopo de dono. */
export interface AdminEntities {
  Patient: EntityRead<Patient>;
  Consultation: EntityRead<Consultation>;
  Appointment: EntityRead<Appointment>;
  Prescription: EntityRead<Prescription>;
  Exam: EntityRead<Exam>;
  Doctor: EntityRead<Doctor>;
  Template: EntityRead<Template>;
  AccessLog: EntityRead<AccessLog>;
  /** Entidade embutida do BaaS, usada apenas pela exclusão de conta (Layout). */
  User: EntityRead<AppUser>;
}

/**
 * Visão padrão do cliente: as 5 entidades sob RLS expõem leitura ESCOPADA
 * (`OwnedEntity`, que não tem `list`/`filter` crus) e as demais têm leitura livre.
 */
export interface AppEntities {
  Patient: OwnedEntity<Patient>;
  Consultation: OwnedEntity<Consultation>;
  Appointment: OwnedEntity<Appointment>;
  Prescription: OwnedEntity<Prescription>;
  Exam: OwnedEntity<Exam>;
  Doctor: OpenReadEntity<Doctor>;
  Template: OpenReadEntity<Template>;
  AccessLog: OpenReadEntity<AccessLog>;
  /**
   * Entidade embutida do BaaS. Leitura crua, sem escopo de dono: não há RLS de
   * entidade clínica aqui — o SDK aplica as regras próprias da entidade User.
   */
  User: EntityRead<AppUser>;
}

/** Contrato completo de acesso a dados, já com o registry fechado. */
export interface AppDataClient extends DataClientBase {
  entities: AppEntities;
}

/** Nomes das entidades conhecidas. */
export type EntityName = keyof AppEntities;

/** Acrescenta as duas formas de acesso a um repositório de leitura aberta. */
function withAccess<T>(repo: EntityRead<T>): OpenReadEntity<T> {
  return { ...repo, asUser: () => repo, asAdmin: () => repo };
}

/**
 * Liga os repositórios crus de um adaptador ao contrato tipado, verificando em
 * COMPILE-TIME que cada entidade implementa `EntityRepository` com os tipos certos.
 *
 * É esta função que materializa o cenário "SDK e mock implementam a mesma
 * interface (tsc sem erro)": se o adapter do SDK ou o mock divergirem do contrato,
 * a chamada não compila. O acesso administrativo e a leitura escopada são
 * acrescentados aqui, uma única vez, em vez de duplicá-los nos dois adaptadores.
 */
export function createAppDataClient(
  raw: RawEntities,
  gateways: DataClientBase,
): AppDataClient {
  return {
    ...gateways,
    entities: {
      Patient: createOwnedEntity(raw.Patient as EntityRead<Patient>),
      Consultation: createOwnedEntity(raw.Consultation as EntityRead<Consultation>),
      Appointment: createOwnedEntity(raw.Appointment as EntityRead<Appointment>),
      Prescription: createOwnedEntity(raw.Prescription as EntityRead<Prescription>),
      Exam: createOwnedEntity(raw.Exam as EntityRead<Exam>),
      Doctor: withAccess(raw.Doctor as EntityRead<Doctor>),
      Template: withAccess(raw.Template as EntityRead<Template>),
      AccessLog: withAccess(raw.AccessLog as EntityRead<AccessLog>),
      User: raw.User as EntityRead<AppUser>,
    },
  };
}
