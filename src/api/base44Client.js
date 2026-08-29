import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createMockClient } from './mockClient';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

/**
 * Instância do cliente SDK Base44 para comunicação com o backend.
 * Em modo offline (VITE_OFFLINE=true) usa um mock local persistido em localStorage,
 * permitindo rodar a app sem o servidor Base44.
 *
 * @example
 * const pacientes = await base44.entities.Patient.list();
 * const usuario = await base44.auth.me();
 * await base44.auth.logout();
 */
export const base44 = OFFLINE
  ? createMockClient()
  : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    });
