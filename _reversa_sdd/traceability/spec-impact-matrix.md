# Spec Impact Matrix — prontuario-facil

> Artefato canônico do `reversa-architect`. Esta matriz indica **qual componente/módulo impacta qual** — ajuda a avaliar o risco de alterações em cada parte do sistema.
> `doc_level: completo` | Escala: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA
> Espelho na raiz: `_reversa_sdd/impact-matrix.md`.

## Matriz de Impacto entre Módulos

| Módulo Alterado | Impacta (spec/module) | Nível de Risco | Motivo | Confiança |
| :--- | :--- | :---: | :--- | :---: |
| **Pacientes** | Agendamentos, Consultas, Dashboard | **Alto** | Entidade central; mudar IDs/campos obrigatórios quebra todo o fluxo | 🟢 |
| **Médicos** | Agendamentos | **Médio** | Afeta disponibilidade na agenda e filtro de horários (`working_days`/`working_hours`) | 🟢 |
| **Templates** | Consultas (Prescrições/Exames) | **Baixo** | Afeta apenas a criação de novos documentos (cópia de conteúdo) | 🟢 |
| **Agendamentos** | Dashboard, Consultas | **Médio** | Mudanças no status impactam métricas do Dashboard e criação de prontuário | 🟢 |
| **Consultas** | Templates (uso), Prescriptions/Exams, Dashboard | **Médio** | Emissão de documentos e alimentação de relatórios | 🟢 |
| **AccessLogs** | Nenhum (módulo de auditoria independente) | **Mínimo** | Apenas consumo (append-only) | 🟢 |
| **Dashboard** | Nenhum downstream | **Médio (reverso)** | Consome Agendamentos, Pacientes, Consultas e Prescriptions | 🟢 |
| **Autenticação / AuthContext** | Todos os módulos | **Alto** | `user.role`, `created_by_id`, `OFFLINE_USER` afetam RLS e lógica de permissões | 🟢 |

## Impacto Reverso (quem depende de quê)

| Componente | Depende de | Tipo de dependência | Confiança |
| :--- | :--- | :--- | :---: |
| **Dashboard** | Patient, Appointment, Consultation, Prescription | queries de leitura (`list`) | 🟢 |
| **Patients** (PatientDetail) | Consultation, Prescription, Exam, Appointment, Template | timeline unificada + emissão de documentos | 🟢 |
| **Consultations** | Patient, Prescription, Exam, Template | criação de consulta + emissão de documentos | 🟢 |
| **Appointments** | Patient, Doctor | agendamento + validação de horário | 🟢 |
| **NewAppointment / AppointmentCalendar** | Doctor (`working_days`, `working_hours`, `appointment_duration`) | geração/validação de slots | 🟢 |

## Dependências de Código Compartilhadas 🛠️

- **Hooks/utilidades**: `useToast`, `useStorage`, `use-mobile`.
- **Componentes UI (Radix/Shadcn)**: usados em praticamente todos os módulos (dialog, select, calendar, etc.).
- **SDK Base44**: camada de persistência única — mudança em `config.jsonc` impacta todas as entidades.
- **Modo Offline (`mockClient`/`AuthContext`)**: toca a camada de infra de todos os módulos quando `VITE_OFFLINE=true`; não muda contratos consumidos pelas pages.

## Nota de Manutenção

Para cada nova spec/unit criada no ciclo forward, verificar se esta matriz precisa de nova linha — especialmente ao alterar a entidade **Patient**, o **SDK Base44** ou o **AuthContext**.

---
*Gerado pelo Reversa-Architect (alinhamento canônico) em 2026-08-31.*
