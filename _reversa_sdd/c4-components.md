# C4 — Diagrama de Componentes (Nível 3) — prontuario-facil

> Artefato canônico do `reversa-architect`. Visão de **componentes** (Nível 3 do C4) para o container mais relevante: a **SPA** (Prontuário Fácil).
> `doc_level: completo` | Escala: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## Visão de Componentes (Container SPA)

A SPA agrupa **pages** (rotas), **componentes de negócio** (médicos/de agendamentos) e **serviços de infraestrutura** (auth, mock client, query client), consumindo a API Base44. Segue abaixo a decomposição por área de domínio.

```mermaid
C4Component
    title Componentes da SPA - Prontuário Fácil
    Person(user, "Profissional de Saúde", "Médico/Enfermeiro/Admin")

    Container_Boundary(spa, "SPA (React/Vite)") {

        Container_Boundary(pages, "Pages (Rotas)") {
            Component(dash, "Dashboard.jsx", "KPIs, próximos agendamentos, ações rápidas, busca, relatórios")
            Component(patients, "Patients/PatientForm/PatientDetail", "Lista, cadastro e detalhe de pacientes (timeline, LGPD)")
            Component(consultations, "Consultations/Consultation/NewConsultation", "Lista, visualização e anamnese de consultas")
            Component(appointments, "Appointments/NewAppointment", "Agenda (calendário/lista) e criação de agendamentos")
            Component(doctors, "Doctors.jsx", "Gestão de médicos e jornadas de trabalho")
            Component(templates, "Templates.jsx", "CRUD de templates de documentos")
            Component(accesslogs, "AccessLogs.jsx", "Auditoria/visualização de logs de acesso")
        }

        Container_Boundary(biz, "Componentes de Negócio") {
            Component(stats, "StatsCard", "Card de KPI (valor/ícone/trend)")
            Component(search, "PatientSearch", "Busca client-side de pacientes (nome/CPF/telefone)")
            Component(ts, "ConsultationTimeline", "Timeline unificada de eventos médicos")
            Component(vs, "VitalSignsForm", "Formulário de 7 sinais vitais")
            Component(pe, "PrescriptionEditor", "Editor de prescrições/documentos com templates e medicações")
            Component(eu, "ExamUploader", "Upload de exames (PDF/imagem) com preview")
            Component(cc, "LGPDConsent", "Diálogo de consentimento LGPD")
            Component(al, "AccessLogger", "Auditoria de acesso (logAccess + ACCESS_ACTIONS)")
            Component(rv, "ReportsView", "Relatórios: volume mensal + ranking de especialidades")
            Component(ac, "AppointmentCalendar", "Grid semanal 7×12 com badges de status")
            Component(tsp, "TimeSlotPicker", "Geração/validação de slots por working_hours/duration")
        }

        Container_Boundary(infra, "Infraestrutura") {
            Component(auth, "AuthContext.jsx", "Autenticação; bypass offline (OFFLINE_USER)")
            Component(api, "base44Client.js", "Exporta SDK real ou mock (por VITE_OFFLINE)")
            Component(mock, "mockClient.js + mockSeed.js", "Mock de entities + persistência localStorage")
            Component(qc, "query-client.js", "Configuração do TanStack Query")
            Component(layout, "Layout.jsx", "Shell/header/navegação da aplicação")
            Component(router, "pages.config.js", "Mapa central de rotas")
        }
    }

    System_Ext(base44, "Base44 (API)", "Auth + CRUD + RLS")

    Rel(user, layout, "Navega")
    Rel(dash, stats, "usar KPIs")
    Rel(dash, search, "usar busca")
    Rel(dash, rv, "usar relatórios")
    Rel(consultations, pe, "emite documentos")
    Rel(consultations, eu, "envia exames")
    Rel(patients, cc, "coleta consentimento")
    Rel(patients, ts, "exibe timeline")
    Rel(appointments, ac, "renderiza agenda")
    Rel(appointments, tsp, "valida slots")

    Rel(pages, api, "Chama entidades via base44", "JSON over HTTPS")
    Rel(auth, api, "auth.me/login/logout")
    Rel(al, api, "appLogs.logUserInApp")
    Rel(api, base44, "SDK real", "HTTPS")
    Rel(api, mock, "se VITE_OFFLINE=true", "localStorage")
```

## Mapeamento por Módulo (Pages e Componentes)

| Módulo | Pages principais | Componentes de negócio | Infra usada |
| :--- | :--- | :--- | :--- |
| **pacientes** | `Patients`, `PatientForm`, `PatientDetail` | `LGPDConsent`, `ConsultationTimeline`, `ExamUploader`, `PrescriptionEditor`, `PatientSearch` | `base44`, `AccessLogger` |
| **consultas** | `Consultations`, `Consultation`, `NewConsultation` | `VitalSignsForm`, `PrescriptionEditor`, `ExamUploader`, `AccessLogger` | `base44`, `AuthContext` |
| **agendamentos** | `Appointments`, `NewAppointment` | `AppointmentCalendar`, `TimeSlotPicker` | `base44` |
| **medicos** | `Doctors` | — (CRUD admin) | `base44` |
| **templates** | `Templates` | — (editor em dialog) | `base44` |
| **logs-acesso** | `AccessLogs` | `AccessLogger` (produtor) | `base44` |
| **dashboard** | `Dashboard` | `StatsCard`, `PatientSearch`, `ReportsView`, `AccessLogger` | `base44` |

## Componentes de Infraestrutura

| Componente | Responsabilidade | Confiança |
| :--- | :--- | :---: |
| `AuthContext.jsx` | Autenticação; curto-circuito offline (`OFFLINE_USER`) | 🟢 |
| `base44Client.js` | Único ponto de exportação do cliente; ternário real/mock por `VITE_OFFLINE` | 🟢 |
| `mockClient.js` + `mockSeed.js` | Mock de entities em `localStorage` (proxy dinâmico) | 🟢 |
| `query-client.js` | Configuração do TanStack Query | 🟢 |
| `Layout.jsx` | Shell/header/navegação global | 🟡 |
| `pages.config.js` | Mapa central de rotas | 🟢 |

> Fonte: `code-analysis.md` (Archaeologist), spec de units (`requirements/design/tasks`), `.reversa/context/surface.json` e `src/pages.config.js`.

---
*Gerado pelo Reversa-Architect (alinhamento canônico) em 2026-08-31.*
