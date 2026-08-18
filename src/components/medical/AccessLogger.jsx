import { base44 } from '@/api/base44Client';

/**
 * Registra acesso de usuário no sistema para conformidade LGPD e auditoria.
 * Grava quem acessou o quê, quando e de onde para fins de segurança e conformidade regulatória.
 *
 * @async
 * @param {string} acao - A ação executada (ex: 'visualizar_paciente', 'editar_consulta').
 * @param {string|null} [tipoEntidade=null] - O tipo de entidade acessada (ex: 'Paciente', 'Consulta').
 * @param {string|null} [idEntidade=null] - O ID da entidade acessada.
 * @param {string|null} [nomePaciente=null] - O nome do paciente associado à ação.
 * @param {Object|null} [detalhes=null] - Detalhes adicionais sobre a ação.
 * @returns {Promise<void>}
 *
 * @example
 * await logAccess(
 *   ACCESS_ACTIONS.VIEW_PATIENT,
 *   'Paciente',
 *   'paciente-123',
 *   'João Silva',
 *   { motivo: 'Consulta de rotina' }
 * );
 */
export async function logAccess(action, entityType = null, entityId = null, patientName = null, details = null) {
    try {
        const user = await base44.auth.me();
        
        await base44.entities.AccessLog.create({
            user_email: user.email,
            action,
            entity_type: entityType,
            entity_id: entityId,
            patient_name: patientName,
            ip_address: 'client-side',
            user_agent: navigator.userAgent,
            details
        });
    } catch (error) {
        console.error('Error logging access:', error);
    }
}

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
    EXPORT_DATA: 'export_data'
};
