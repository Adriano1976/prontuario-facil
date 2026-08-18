import { base44 } from '@/api/base44Client';

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
