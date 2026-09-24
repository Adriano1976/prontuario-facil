import type { FilterConditions, SortField } from '@/types';
import type {
  AccessScope,
  AdminScope,
  DeleteResult,
  UserScope,
} from './contract';
import type { EntityRead, WriteInput } from './registry';

/**
 * Camada de leitura com escopo de ownership (BR-MIGRAR-034 / AD-03).
 *
 * POR QUE ESTA CAMADA EXISTE
 * O cenário 1 do teste de paridade PT-010 exige que "código que esquece o filtro de
 * ownership não compile". Aplicar essa exigência direto em `list`/`filter` obrigaria
 * a tocar as 51 chamadas existentes e arriscaria mudar resultado de consulta — o que
 * violaria a regra de ouro do diff (só tipos, sem mudança de comportamento).
 *
 * A solução: as entidades sob RLS não expõem `list`/`filter` crus; expõem os métodos
 * abaixo, que recebem o escopo. Assim:
 *
 * - **usuário comum** → o filtro `created_by_id` é aplicado E obrigatório por tipo;
 * - **admin** → leitura sem filtro de dono.
 *
 * ⚠️ PARIDADE: para usuário comum isso NÃO muda o resultado. A RLS do BaaS já
 * restringe a leitura a `created_by_id == user.id` ou admin; o filtro explícito
 * espelha a mesma condição. O que muda é que a omissão deixa de ser possível em
 * silêncio.
 *
 * ⚠️ O QUE O TIPO **NÃO** FAZ: ele garante a FORMA (o escopo foi informado), nunca
 * a AUTORIZAÇÃO. Quem declara `kind: 'admin'` indevidamente continua compilando.
 * A defesa real permanece a RLS do backend, intocada (achado F-03).
 */

/** Registro que participa do isolamento por dono. */
interface OwnedRecord {
  created_by_id?: string;
}

/** Leitura escopada de uma entidade sob RLS. */
export interface ScopedReader<T extends OwnedRecord> {
  /**
   * Lista os registros do escopo.
   *
   * Com escopo de usuário, o filtro de dono é aplicado automaticamente.
   * Com escopo de admin, lista sem filtro de dono.
   */
  listOwned(scope: AccessScope, sort?: SortField<T>, limit?: number): Promise<T[]>;

  /**
   * Filtra os registros do escopo.
   *
   * Com escopo de usuário, o filtro de dono é aplicado POR CIMA das condições —
   * e uma condição `created_by_id` é rejeitada em compile-time, porque `Omit`
   * remove o campo das condições aceitas.
   */
  filterOwned(
    scope: UserScope,
    conditions: FilterConditions<Omit<T, 'created_by_id'>>,
    sort?: SortField<T>,
    limit?: number,
  ): Promise<T[]>;

  /** Filtra sem escopo de dono — exige a declaração explícita `kind: 'admin'`. */
  filterAsAdmin(
    scope: AdminScope,
    conditions: Partial<T>,
    sort?: SortField<T>,
    limit?: number,
  ): Promise<T[]>;
}

/**
 * Entidade sob RLS, vista pelo código de aplicação.
 *
 * ⚠️ PONTO CENTRAL DO DESIGN: esta interface NÃO expõe `list` nem `filter` crus.
 * É o que faz "código que esquece o filtro de ownership não compilar" ser verdade
 * (cenário 1 do PT-010). Os métodos de escrita seguem disponíveis; a leitura passa
 * obrigatoriamente pelo escopo.
 */
export interface OwnedEntity<T extends OwnedRecord> extends ScopedReader<T> {
  /** Cria um registro; o servidor (ou o mock) preenche `id`, `created_date` e o dono. */
  create(data: WriteInput<T>): Promise<T>;
  /**
   * Atualiza um registro.
   *
   * O ESCOPO É EXIGIDO (BR-MIGRAR-034): endereçar um registro existente por
   * identificador é operação sob isolamento de dono, e omitir o escopo não compila.
   * `id` é preservado (BR-MIGRAR-042).
   */
  update(scope: AccessScope, id: string, data: Partial<WriteInput<T>>): Promise<T>;
  /** Exclui um registro. O escopo é exigido pelo mesmo motivo de `update`. */
  delete(scope: AccessScope, id: string): Promise<DeleteResult>;
  /** Acesso administrativo explícito: leitura sem filtro de dono. */
  asAdmin(scope: AdminScope): EntityRead<T>;
}

/**
 * Monta a entidade sob RLS a partir do repositório cru do adaptador.
 *
 * Os métodos crus `list`/`filter` existem no objeto devolvido em runtime (vêm do
 * repositório), mas ficam FORA da interface — de propósito. O tipo é a barreira.
 */
export function createOwnedEntity<T extends OwnedRecord>(
  repo: EntityRead<T>,
): OwnedEntity<T> {
  const reader = createScopedReader<T>(repo);
  return {
    create: repo.create,
    // ⚠️ O escopo é EXIGIDO na assinatura e NÃO altera a chamada. `update`/`delete` do
    // contrato tomam apenas o identificador, e quem decide a posse é a regra de acesso do
    // servidor. O que esta camada entrega é a OBRIGATORIEDADE DE CONTRATO (BR-MIGRAR-034):
    // endereçar um registro existente sem declarar o escopo não compila. Verificar posse
    // AQUI seria duplicar a RLS no cliente — decisão recusada em `sessionScope.ts:18-21`,
    // e que não protegeria de um cliente adulterado.
    update: (_scope, id, data) => repo.update(id, data),
    delete: (_scope, id) => repo.delete(id),
    asAdmin: () => repo,
    ...reader,
  };
}

/**
 * Aplica o escopo de dono às condições de filtro.
 *
 * Para `kind: 'user'`, o `created_by_id` do usuário é imposto. Para admin, as
 * condições passam intactas. Em ambos os casos devolve o mapa de condições a ser
 * enviado ao repositório.
 */
function applyScope<T extends OwnedRecord>(
  scope: AccessScope,
  conditions: FilterConditions<T>,
): FilterConditions<T> {
  if (scope.kind === 'admin') {
    return conditions;
  }
  return { ...conditions, created_by_id: scope.user_id } as FilterConditions<T>;
}

/**
 * Cria a leitura escopada a partir do repositório cru da entidade.
 *
 * Usada por `createScopedRead` para montar os leitores das 5 entidades sob RLS.
 */
export function createScopedReader<T extends OwnedRecord>(repo: EntityRead<T>): ScopedReader<T> {
  return {
    async listOwned(scope, sort, limit) {
      if (scope.kind === 'admin') {
        return repo.list(sort, limit);
      }
      return repo.filter(
        { created_by_id: scope.user_id } as FilterConditions<T>,
        sort,
        limit,
      );
    },

    async filterOwned(scope, conditions, sort, limit) {
      return repo.filter(
        applyScope<T>(scope, conditions as FilterConditions<T>),
        sort,
        limit,
      );
    },

    async filterAsAdmin(scope, conditions, sort, limit) {
      return repo.filter(applyScope<T>(scope, conditions), sort, limit);
    },
  };
}
