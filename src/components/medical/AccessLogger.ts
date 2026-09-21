import { base44 } from '@/api/base44Client';
import { asUserScope } from '@/api/sessionScope';
import { toSessionUser } from '@/lib/session';
import type { AccessLogAction } from '@/types';

/**
 * Registro de acesso para auditoria.
 *
 * PARIDADE: comportamento idêntico ao anterior. A gravação continua sendo disparada
 * sem bloquear quem chama, e qualquer falha continua sendo apenas registrada no
 * console — nunca propagada, para não derrubar a operação principal.
 *
 * Notas de contrato:
 * - O endereço de rede é gravado como `'client-side'` porque o navegador não tem
 *   acesso ao endereço real do cliente; é o valor que o sistema já usava.
 * - `details` é TEXTO. A documentação anterior dizia "objeto", mas as duas chamadas
 *   existentes passam texto — o tipo agora reflete o uso real.
 * - A trilha é somente inserção: este módulo nunca lê nem altera registros.
 */

/** Ações auditáveis, indexadas por nome legível. */
export const ACCESS_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW_PATIENT: 'view_patient',
  EDIT_PATIENT: 'edit_patient',
  CREATE_PATIENT: 'create_patient',
  VIEW_CONSULTATION: 'view_consultation',
  CREATE_CONSULTATION: 'create_consultation',
  EDIT_CONSULTATION: 'edit_consultation',
  CREATE_PRESCRIPTION: 'create_prescription',
  UPLOAD_EXAM: 'upload_exam',
  DELETE_RECORD: 'delete_record',
  EXPORT_DATA: 'export_data',
} as const satisfies Record<string, AccessLogAction>;

/**
 * Grava um registro de auditoria.
 *
 * @param action Ação executada.
 * @param entityType Tipo da entidade acessada.
 * @param entityId Identificador da entidade acessada.
 * @param patientName Nome do paciente associado; é cópia para auditoria, não vínculo.
 * @param details Texto livre com detalhes adicionais.
 */
export async function logAccess(
  action: AccessLogAction,
  entityType: string | null = null,
  entityId: string | null = null,
  patientName: string | null = null,
  details: string | null = null,
): Promise<void> {
  try {
    const user = toSessionUser(await base44.auth.me());
    if (!user) return;

    // A trilha de auditoria recebe inserção de QUALQUER usuário autenticado; apenas a
    // LEITURA é restrita a administrador (BR-MIGRAR-024). Por isso a gravação usa o
    // escopo do próprio usuário, e não o acesso administrativo.
    await base44.entities.AccessLog.asUser(asUserScope(user)).create({
      user_email: user.email,
      action,
      entity_type: entityType ?? undefined,
      entity_id: entityId ?? undefined,
      patient_name: patientName ?? undefined,
      ip_address: 'client-side',
      user_agent: navigator.userAgent,
      details,
    });
  } catch (error) {
    console.error('Error logging access:', error);
  }
}
