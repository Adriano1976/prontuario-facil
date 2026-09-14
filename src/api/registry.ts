import type {
  AccessLog,
  Appointment,
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
 * Registry FECHADO de entidades do domÃ­nio.
 *
 * DECISÃƒO DE DESIGN (Onda 3): `entities` Ã© tipado com as entidades conhecidas, em
 * vez de um Ã­ndice aberto que aceitaria qualquer nome. Motivo: com Ã­ndice aberto,
 * um erro de digitaÃ§Ã£o em `entities.Pacient.list()` continuaria compilando e sÃ³
 * falharia em runtime â€” exatamente o risco nÂº 5 do brief ("desacoplamento
 * silencioso"). O `Proxy` dinÃ¢mico do mock continua existindo, mas como detalhe de
 * implementaÃ§Ã£o em runtime, nÃ£o como contrato de tipo.
 */

/**
 * Campos injetados pelo servidor em todo registro (espelha `ServerEntityFields` do
 * SDK). A escrita nÃ£o os exige: o `create` os preenche (BR-MIGRAR-042).
 */
export type ServerFields = 'id' | 'created_date' | 'updated_date' | 'created_by_id';

/**
 * `Omit` que DISTRIBUI sobre uniÃ£o.
 *
 * âš ï¸ ARMADILHA REAL (encontrada por teste, Onda 3): o `Omit` nativo NÃƒO distribui
 * sobre uniÃ£o de tipos â€” ele colapsa as variantes numa Ãºnica chave. Como
 * `Patient = BaseEntity & LGPDConsent` e `LGPDConsent` Ã© uma uniÃ£o discriminada,
 * o `Omit` direto fazia o invariante do consentimento LGPD SUMIR: passava a
 * compilar `lgpd_consent: true` sem `lgpd_consent_date`/`lgpd_consent_ip`, que Ã©
 * exatamente o que a BR-MIGRAR-004 existe para impedir.
 *
 * Este utilitÃ¡rio aplica o `Omit` variante a variante, preservando a discriminaÃ§Ã£o.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * Payload de escrita de uma entidade.
 *
 * Os campos de servidor ficam de fora. Os demais seguem o schema â€” inclusive os
 * enums fechados e o tipo condicional de LGPD, que Ã© o que faz os cenÃ¡rios
 * "enums nÃ£o aceitam valores fora do conjunto" e "LGPD exige data e IP" valerem.
 */
export type WriteInput<T> = DistributiveOmit<T, ServerFields>;

/** Leitura crua de uma entidade (SEM escopo de ownership aplicado). */
export type EntityRead<T> = EntityRepository<T, WriteInput<T>>;

/**
 * Entidade de LEITURA ABERTA para autenticados: `Doctor` e `Template`
 * (BR-MIGRAR-017/020) e a trilha de auditoria `AccessLog`, cuja leitura Ã©
 * restrita a admin pela RLS (BR-MIGRAR-024).
 *
 * As duas formas de acesso existem porque a regra de ESCRITA difere entre elas: a
 * inserÃ§Ã£o na trilha de auditoria Ã© feita por qualquer usuÃ¡rio autenticado, e usar o
 * acesso administrativo para gravar seria declarar um escopo que nÃ£o corresponde ao
 * de quem grava.
 */
export interface OpenReadEntity<T> extends EntityRead<T> {
  /** Acesso na condiÃ§Ã£o do prÃ³prio usuÃ¡rio. */
  asUser(scope: UserScope): EntityRead<T>;
  /** Acesso administrativo explÃ­cito, para leitura sem filtro de dono. */
  asAdmin(scope: AdminScope): EntityRead<T>;
}

/** VisÃ£o administrativa do cliente: leitura sem escopo de dono. */
export interface AdminEntities {
  Patient: EntityRead<Patient>;
  Consultation: EntityRead<Consultation>;
  Appointment: EntityRead<Appointment>;
  Prescription: EntityRead<Prescription>;
  Exam: EntityRead<Exam>;
  Doctor: EntityRead<Doctor>;
  Template: EntityRead<Template>;
  AccessLog: EntityRead<AccessLog>;
}

/**
 * VisÃ£o padrÃ£o do cliente: as 5 entidades sob RLS expÃµem leitura ESCOPADA
 * (`OwnedEntity`, que nÃ£o tem `list`/`filter` crus) e as demais tÃªm leitura livre.
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
}

/** Contrato completo de acesso a dados, jÃ¡ com o registry fechado. */
export interface AppDataClient extends DataClientBase {
  entities: AppEntities;
}

/** Nomes das entidades conhecidas. */
export type EntityName = keyof AppEntities;

/** Acrescenta as duas formas de acesso a um repositÃ³rio de leitura aberta. */
function withAccess<T>(repo: EntityRead<T>): OpenReadEntity<T> {
  return { ...repo, asUser: () => repo, asAdmin: () => repo };
}

/**
 * Liga os repositÃ³rios crus de um adaptador ao contrato tipado, verificando em
 * COMPILE-TIME que cada entidade implementa `EntityRepository` com os tipos certos.
 *
 * Ã‰ esta funÃ§Ã£o que materializa o cenÃ¡rio "SDK e mock implementam a mesma
 * interface (tsc sem erro)": se o adapter do SDK ou o mock divergirem do contrato,
 * a chamada nÃ£o compila. O acesso administrativo e a leitura escopada sÃ£o
 * acrescentados aqui, uma Ãºnica vez, em vez de duplicÃ¡-los nos dois adaptadores.
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
    },
  };
}
