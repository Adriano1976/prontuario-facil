import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

/**
 * Instância do cliente SDK Base44 para comunicação com o backend.
 * Inicializado com configuração da app incluindo ID, token de autenticação e URL do servidor.
 * Usado em toda a app para executar operações CRUD em entidades.
 *
 * @example
 * const pacientes = await base44.entities.Patient.list();
 * const usuario = await base44.auth.me();
 * await base44.auth.logout();
 */
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
