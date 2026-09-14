import { base44 } from '@/api/base44Client';
import { asUserScope } from '@/api/sessionScope';
import { toSessionUser } from '@/lib/session';
import type { AccessLogAction } from '@/types';

/**
 * Registro de acesso para auditoria.
 *
 * PARIDADE: comportamento idÃªntico ao anterior. A gravaÃ§Ã£o continua sendo disparada
 * sem bloquear quem chama, e qualquer falha continua sendo apenas registrada no
 * console â€” nunca propagada, para nÃ£o derrubar a operaÃ§Ã£o principal.
 *
 * Notas de contrato:
 * - O endereÃ§o de rede Ã© gravado como `'client-side'` porque o navegador nÃ£o tem
 *   acesso ao endereÃ§o real do cliente; Ã© o valor que o sistema jÃ¡ usava.
 * - `details` Ã© TEXTO. A documentaÃ§Ã£o anterior dizia "objeto", mas as duas chamadas
 *   existentes passam texto â€” o tipo agora reflete o uso real.
 * - A trilha Ã© somente inserÃ§Ã£o: este mÃ³dulo nunca lÃª nem altera registros.
 */

/** AÃ§Ãµes auditÃ¡veis, indexadas por nome legÃ­vel. */
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
 * @param action AÃ§Ã£o executada.
 * @param entityType Tipo da entidade acessada.
 * @param entityId Identificador da entidade acessada.
 * @param patientName Nome do paciente associado; Ã© cÃ³pia para auditoria, nÃ£o vÃ­nculo.
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

    // A trilha de auditoria recebe inserÃ§Ã£o de QUALQUER usuÃ¡rio autenticado; apenas a
    // LEITURA Ã© restrita a administrador (BR-MIGRAR-024). Por isso a gravaÃ§Ã£o usa o
    // escopo do prÃ³prio usuÃ¡rio, e nÃ£o o acesso administrativo.
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
