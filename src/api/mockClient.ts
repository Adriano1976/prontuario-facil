import type { UploadFileResult } from './contract';
import { mockSeed } from './mockSeed';

/**
 * Adaptador do modo offline: implementa o contrato único de acesso a dados sobre o
 * armazenamento local do navegador.
 *
 * PARIDADE: este arquivo preserva exatamente o comportamento do legado
 * (`src/api/mockClient.js`). A conversão é de linguagem e de tipos; nenhuma regra
 * mudou. Em particular continuam iguais: o prefixo das chaves, a gravação dos dados
 * de exemplo na primeira leitura, a comparação de filtro por igualdade, a ordenação
 * por um único campo e a mensagem de erro de registro ausente.
 *
 * ⚠️ O mock NÃO aplica regra de acesso: o armazenamento local não tem autorização
 * (BR-MIGRAR-044). Isso é intencional e está documentado em
 * `_reversa_sdd/migration/interfaces/mock-local-storage.md`.
 */

/**
 * Usuário fixo do modo offline (BR-MIGRAR-039).
 *
 * O valor é exatamente o do legado — `id`, `email` e `full_name`, sem papel e sem
 * dono. O campo discriminante `kind` pertence ao TIPO (`OfflineUser`), não ao dado
 * armazenado, por isso não aparece aqui.
 */
export const OFFLINE_USER = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};

const DB_PREFIX = 'mock_db_';

/** Registro genérico do armazenamento local. */
type StoredRecord = Record<string, unknown> & { id?: string };

function load(entity: string): StoredRecord[] {
  const key = DB_PREFIX + entity;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredRecord[];
    } catch {
      // Conteúdo corrompido é ignorado em silêncio — comportamento do legado.
    }
  }
  const seeded = ((mockSeed as Record<string, StoredRecord[]>)[entity] ?? []);
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

function save(entity: string, arr: StoredRecord[]): void {
  localStorage.setItem(DB_PREFIX + entity, JSON.stringify(arr));
}

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

function sortAndLimit(
  arr: StoredRecord[],
  sort?: string,
  limit?: number,
): StoredRecord[] {
  let out = [...arr];
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    out.sort((a, b) => {
      const av = (a[field] ?? '') as string;
      const bv = (b[field] ?? '') as string;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }
  if (limit && Number.isFinite(Number(limit))) {
    out = out.slice(0, Number(limit));
  }
  return out;
}

/**
 * Repositório de uma entidade sobre o armazenamento local.
 *
 * A forma do objeto é a mesma do legado; o que muda é a anotação de tipo, que faz a
 * verificação cobrir este arquivo quando o gate for ligado sobre ele.
 */
function makeRepo(entity: string) {
  return {
    list: (sort?: string, limit?: number): Promise<StoredRecord[]> =>
      Promise.resolve(sortAndLimit(load(entity), sort, limit)),

    filter: (
      conditions: Record<string, unknown> = {},
      sort?: string,
      limit?: number,
    ): Promise<StoredRecord[]> => {
      const all = load(entity).filter((item) =>
        Object.entries(conditions).every(([k, v]) => item[k] === v),
      );
      return Promise.resolve(sortAndLimit(all, sort, limit));
    },

    create: (data: Record<string, unknown>): Promise<StoredRecord> => {
      const arr = load(entity);
      const now = new Date().toISOString();
      const record = { id: uid(), created_date: now, ...data } as StoredRecord;
      if (!record.date) record.date = now;
      arr.push(record);
      save(entity, arr);
      return Promise.resolve(record);
    },

    update: (id: string, data: Record<string, unknown>): Promise<StoredRecord> => {
      const arr = load(entity);
      const idx = arr.findIndex((r) => r.id === id);
      if (idx === -1) {
        return Promise.reject(new Error('Not found: ' + entity + ' ' + id));
      }
      arr[idx] = { ...arr[idx], ...data, id };
      save(entity, arr);
      return Promise.resolve(arr[idx]);
    },

    delete: (id: string): Promise<{ success: boolean }> => {
      const arr = load(entity).filter((r) => r.id !== id);
      save(entity, arr);
      return Promise.resolve({ success: true });
    },
  };
}

/** Repositórios crus, indexados por nome de entidade. */
const entities = new Proxy(
  {} as Record<string, ReturnType<typeof makeRepo>>,
  {
    get: (_target, name) => makeRepo(String(name)),
  },
);

const integrations = {
  Core: {
    /** @param {{ file?: File }} params */
    UploadFile: ({ file }: { file?: File }) =>
      new Promise<UploadFileResult>((resolve, reject) => {
        if (!file) return reject(new Error('Nenhum arquivo fornecido'));
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result as string });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }),
  },
};

const auth = {
  me: () => Promise.resolve(OFFLINE_USER),
  logout: (_redirectUrl?: string) => Promise.resolve(),
  redirectToLogin: (_nextUrl: string) => {},
  /**
   * No modo offline não há servidor para consultar. O modo é decidido na construção
   * (variável de ambiente), então a verificação de sessão nem chega a usá-la — mas o
   * contrato a exige, e devolver vazio é a resposta correta: não há configuração
   * pública remota.
   */
  getPublicSettings: () => Promise.resolve({}),
};

const appLogs = {
  /** Sem efeito no modo offline, como no legado (BR-MIGRAR-045). */
  logUserInApp: (_pageName: string) => Promise.resolve(),
};

/**
 * Cria o cliente do modo offline.
 *
 * O retorno é a forma crua (repositórios indexados + gateways). A ligação ao
 * contrato tipado acontece em `base44Client`, por `bindAdapter`, que é o que verifica
 * em tempo de compilação que esta implementação honra o contrato.
 */
export function createMockClient() {
  return { entities, integrations, auth, appLogs };
}

