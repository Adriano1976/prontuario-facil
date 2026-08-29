import { mockSeed } from './mockSeed';

// Usuário fixo usado no modo offline (auth "fake").
export const OFFLINE_USER = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};

const DB_PREFIX = 'mock_db_';

/**
 * @param {string} entity
 */
function load(entity) {
  const key = DB_PREFIX + entity;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore corrupted storage
    }
  } 
  const seeded = mockSeed[entity] || [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

/**
 * @param {string} entity
 * @param {any} arr
 */
function save(entity, arr) {
  localStorage.setItem(DB_PREFIX + entity, JSON.stringify(arr));
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

/**
 * @param {any} arr
 * @param {string} sort
 * @param {any} limit
 */
function sortAndLimit(arr, sort, limit) {
  let out = [...arr];
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    out.sort((a, b) => {
      const av = a[field] ?? '';
      const bv = b[field] ?? '';
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
 * @param {string} entity
 */
function makeRepo(entity) {
  return {
    list: (/** @type {any} */ sort, /** @type {any} */ limit) => Promise.resolve(sortAndLimit(load(entity), sort, limit)),
    filter: (conditions = {}, /** @type {any} */ sort, /** @type {any} */ limit) => {
      const all = load(entity).filter((/** @type {{ [x: string]: any; }} */ item) =>
        Object.entries(conditions).every(([k, v]) => item[k] === v)
      );
      return Promise.resolve(sortAndLimit(all, sort, limit));
    },
    create: (/** @type {any} */ data) => {
      const arr = load(entity);
      const now = new Date().toISOString();
      const record = { id: uid(), created_date: now, ...data };
      if (!record.date) record.date = now;
      arr.push(record);
      save(entity, arr);
      return Promise.resolve(record);
    },
    update: (/** @type {string} */ id, /** @type {any} */ data) => {
      const arr = load(entity);
      const idx = arr.findIndex((r) => r.id === id);
      if (idx === -1) {
        return Promise.reject(new Error('Not found: ' + entity + ' ' + id));
      }
      arr[idx] = { ...arr[idx], ...data, id };
      save(entity, arr);
      return Promise.resolve(arr[idx]);
    },
    delete: (/** @type {any} */ id) => {
      const arr = load(entity).filter((/** @type {{ id: any; }} */ r) => r.id !== id);
      save(entity, arr);
      return Promise.resolve({ success: true });
    },
  };
}

const entities = new Proxy(
  {},
  {
    get: (_, name) => makeRepo(String(name)),
  }
);

const integrations = {
  Core: {
    UploadFile: ({ file }) =>
      new Promise((resolve, reject) => {
        if (!file) return reject(new Error('Nenhum arquivo fornecido'));
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }),
  },
};

const auth = {
  me: () => Promise.resolve(OFFLINE_USER),
  logout: () => Promise.resolve(),
  redirectToLogin: () => {},
};

const appLogs = {
  logUserInApp: () => Promise.resolve(),
};

export function createMockClient() {
  return { entities, integrations, auth, appLogs };
}
