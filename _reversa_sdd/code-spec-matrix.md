# Matriz de Código e Especificação (Code/Spec Matrix) — prontuario-facil

Esta matriz relaciona cada artefato de código-fonte e schema do projeto legado com a respectiva especificação SDD gerada pelo framework Reversa.

| Módulo / Funcionalidade | Arquivo(s) Legado(s) de Origem | Especificação SDD Correspondente | Status |
| :--- | :--- | :--- | :---: |
| **Pacientes** | `src/pages/Patients.jsx`, `base44/entities/Patient.jsonc` | `_reversa_sdd/pacientes/requirements.md` | 🟢 Completo |
| **Consultas** | `src/pages/Consultations.jsx`, `base44/entities/Consultation.jsonc`, `Prescription.jsonc`, `Exam.jsonc` | `_reversa_sdd/consultas/requirements.md` | 🟢 Completo |
| **Agendamentos** | `src/pages/Appointments.jsx`, `base44/entities/Appointment.jsonc`, `AppointmentCalendar.jsx` | `_reversa_sdd/agendamentos/requirements.md` | 🟢 Completo |
| **Médicos** | `src/pages/Doctors.jsx`, `base44/entities/Doctor.jsonc` | `_reversa_sdd/medicos/requirements.md` | 🟢 Completo |
| **Templates** | `src/pages/Templates.jsx`, `base44/entities/Template.jsonc` | `_reversa_sdd/templates/requirements.md` | 🟢 Completo |
| **Logs de Acesso** | `src/pages/AccessLogs.jsx`, `base44/entities/AccessLog.jsonc` | `_reversa_sdd/logs-acesso/requirements.md` | 🟢 Completo |
| **Modo Offline (Mock Local)** | `src/api/mockClient.js`, `src/api/mockSeed.js`, switch em `base44Client.js` e `AuthContext.jsx` | `_reversa_sdd/modo-offline/requirements.md` | 🟡 Em geração |
| **Domínio e Regras** | Análise transversal | `_reversa_sdd/domain.md` | 🟢 Completo |
| **Arquitetura & ERD** | Análise estrutural | `_reversa_sdd/architecture.md`, `_reversa_sdd/erd.md` | 🟢 Completo |
