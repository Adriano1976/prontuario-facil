// Dados de demonstração para o modo offline (VITE_OFFLINE=true).
// Carregados no localStorage na primeira execução de cada entidade.

const ISO = (d) => new Date(d).toISOString();

export const mockSeed = {
  Doctor: [
    { id: 'doc-1', full_name: 'Dra. Maria Santos', crm: 'CRM-SP 12345', specialty: 'Clínico Geral', is_active: true, created_date: ISO('2026-08-01T08:00:00') },
    { id: 'doc-2', full_name: 'Dr. João Oliveira', crm: 'CRM-SP 67890', specialty: 'Cardiologia', is_active: true, created_date: ISO('2026-08-02T08:00:00') },
    { id: 'doc-3', full_name: 'Dra. Ana Lima', crm: 'CRM-SP 11223', specialty: 'Pediatria', is_active: false, created_date: ISO('2026-08-03T08:00:00') },
  ],
  Patient: [
    { id: 'pat-1', full_name: 'João Silva', cpf: '123.456.789-00', birth_date: '1980-05-12', gender: 'M', phone: '(11) 99999-0001', email: 'joao@example.com', status: 'ativo', created_date: ISO('2026-08-10T09:00:00') },
    { id: 'pat-2', full_name: 'Maria Oliveira', cpf: '987.654.321-00', birth_date: '1990-11-23', gender: 'F', phone: '(11) 98888-0002', email: 'maria@example.com', status: 'ativo', created_date: ISO('2026-08-11T09:00:00') },
    { id: 'pat-3', full_name: 'Pedro Souza', cpf: '111.222.333-44', birth_date: '1975-02-02', gender: 'M', phone: '(11) 97777-0003', email: 'pedro@example.com', status: 'ativo', created_date: ISO('2026-08-12T09:00:00') },
    { id: 'pat-4', full_name: 'Carla Mendes', cpf: '555.666.777-88', birth_date: '2000-07-19', gender: 'F', phone: '(11) 96666-0004', email: 'carla@example.com', status: 'inativo', created_date: ISO('2026-08-13T09:00:00') },
    { id: 'pat-5', full_name: 'Lucas Ferreira', cpf: '222.333.444-55', birth_date: '1988-03-30', gender: 'M', phone: '(11) 95555-0005', email: 'lucas@example.com', status: 'ativo', created_date: ISO('2026-08-14T09:00:00') },
  ],
  Appointment: [
    { id: 'apt-1', patient_id: 'pat-1', doctor_id: 'doc-1', date: '2026-08-28T10:00:00', status: 'agendado', notes: 'Consulta de rotina', created_date: ISO('2026-08-20T10:00:00') },
    { id: 'apt-2', patient_id: 'pat-2', doctor_id: 'doc-2', date: '2026-08-27T14:00:00', status: 'concluido', notes: '', created_date: ISO('2026-08-21T10:00:00') },
    { id: 'apt-3', patient_id: 'pat-3', doctor_id: 'doc-1', date: '2026-09-01T09:00:00', status: 'agendado', notes: '', created_date: ISO('2026-08-22T10:00:00') },
    { id: 'apt-4', patient_id: 'pat-5', doctor_id: 'doc-2', date: '2026-09-02T11:00:00', status: 'cancelado', notes: '', created_date: ISO('2026-08-23T10:00:00') },
  ],
  Consultation: [
    { id: 'con-1', patient_id: 'pat-2', doctor_id: 'doc-2', appointment_id: 'apt-2', date: '2026-08-27T14:00:00', chief_complaint: 'Dor no peito', anamnesis: 'Paciente relata dor há 3 dias.', diagnosis: 'Angina estável', created_date: ISO('2026-08-27T14:30:00') },
    { id: 'con-2', patient_id: 'pat-1', doctor_id: 'doc-1', appointment_id: null, date: '2026-08-20T10:00:00', chief_complaint: 'Checkup anual', anamnesis: 'Sem queixas.', diagnosis: 'Saudável', created_date: ISO('2026-08-20T10:30:00') },
  ],
  Prescription: [
    { id: 'prx-1', consultation_id: 'con-1', patient_id: 'pat-2', medication: 'AAS 100mg', dosage: '1 comprimido', frequency: '12/12h', instructions: 'Após as refeições', created_date: ISO('2026-08-27T14:45:00') },
    { id: 'prx-2', consultation_id: 'con-2', patient_id: 'pat-1', medication: 'Vitamina D', dosage: '1 cápsula', frequency: '1x ao dia', instructions: 'Manhã', created_date: ISO('2026-08-20T10:45:00') },
  ],
  Exam: [
    { id: 'exm-1', patient_id: 'pat-2', consultation_id: 'con-1', name: 'Hemograma Completo', type: 'laboratorial', date: '2026-08-27', file_url: '', file_type: 'image', laboratory: 'Lab Análises', results_summary: 'Dentro da normalidade', notes: '', created_date: ISO('2026-08-27T15:00:00') },
  ],
  Template: [
    { id: 'tpl-1', name: 'Receita Padrão', type: 'prescription', content: 'Medicamento: \nDose: \nInstruções: ', is_active: true, created_date: ISO('2026-08-05T09:00:00') },
    { id: 'tpl-2', name: 'Conduta Clínica', type: 'consultation', content: 'Conduta: \nRetorno: ', is_active: true, created_date: ISO('2026-08-06T09:00:00') },
  ],
  AccessLog: [
    { id: 'log-1', user_email: 'demo@medrecord.local', action: 'view_patient', entity_type: 'Paciente', entity_id: 'pat-1', patient_name: 'João Silva', ip_address: 'client-side', user_agent: '', details: null, created_date: ISO('2026-08-28T08:30:00') },
  ],
};
