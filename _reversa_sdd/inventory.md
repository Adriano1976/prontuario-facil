# Inventário — prontuario-facil

> Gerado pelo **Scout** — mapeamento de superfície do projeto legado.
> Data: 2026-08-20

---

## Visão geral

Aplicação **SPA (React + Vite)** de prontuário eletrônico para clínicas, com foco em **conformidade LGPD**. Backend é a plataforma **Base44 (BaaS)** — a app não tem servidor próprio; a persistência é feita via SDK `@base44/sdk` sobre entidades declaradas em `base44/entities/`.

**Obs.:** o README menciona "Supabase", mas não há dependência Supabase no `package.json` nem uso no código — trata-se de legado do template.

## Estrutura de pastas

```
prontuario-facil/
├── .github/
│   └── skills/git-naming-conventions/SKILL.md
├── base44/                    ← Configuração da plataforma Base44
│   ├── config.jsonc           ← nome do app, comandos de build/serve
│   └── entities/              ← Schemas das entidades (BaaS "banco de dados")
│       ├── AccessLog.jsonc
│       ├── Appointment.jsonc
│       ├── Consultation.jsonc
│       ├── Doctor.jsonc
│       ├── Exam.jsonc
│       ├── Patient.jsonc
│       ├── Prescription.jsonc
│       └── Template.jsonc
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── base44Client.js        ← instância única do cliente Base44
│   ├── components/
│   │   ├── appointments/          ← componentes de agendamento
│   │   │   ├── AppointmentCalendar.jsx
│   │   │   └── TimeSlotPicker.jsx
│   │   ├── medical/               ← componentes clínicos
│   │   │   ├── AccessLogger.jsx
│   │   │   ├── ConsultationTimeline.jsx
│   │   │   ├── ExamUploader.jsx
│   │   │   ├── LGPDConsent.jsx
│   │   │   ├── PatientSearch.jsx
│   │   │   ├── PrescriptionEditor.jsx
│   │   │   ├── ReportsView.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── VitalSignsForm.jsx
│   │   ├── ui/                    ← biblioteca shadcn/ui (Radix + Tailwind)
│   │   │   └── (≈60 componentes: button, card, dialog, form, ...)
│   │   └── UserNotRegisteredError.jsx
│   ├── hooks/
│   │   └── use-mobile.jsx
│   ├── lib/
│   │   ├── app-params.js          ← leitura de parâmetros (app_id, token)
│   │   ├── AuthContext.jsx        ← contexto de autenticação
│   │   ├── NavigationTracker.jsx
│   │   ├── PageNotFound.jsx
│   │   ├── query-client.js        ← cliente @tanstack/react-query
│   │   └── utils.js               ← shadcn cn()
│   ├── pages/                     ← telas da aplicação (domínios)
│   │   ├── AccessLogs.jsx
│   │   ├── Appointments.jsx
│   │   ├── Consultation.jsx
│   │   ├── Consultations.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Doctors.jsx
│   │   ├── NewAppointment.jsx
│   │   ├── NewConsultation.jsx
│   │   ├── PatientDetail.jsx
│   │   ├── PatientForm.jsx
│   │   ├── Patients.jsx
│   │   └── Templates.jsx
│   ├── utils/
│   │   └── index.ts               ← createPageUrl()
│   ├── App.jsx                    ← raiz com providers e rotas
│   ├── Layout.jsx                 ← layout com navegação
│   ├── index.css
│   ├── main.jsx                   ← bootstrap React
│   └── pages.config.js            ← mapa central de páginas/rotas
├── dist/                          ← build (ignorado)
├── node_modules/                  ← dependências (ignorado)
├── .env.local                     ← variáveis de ambiente (Base44)
├── components.json                ← config shadcn/ui
├── eslint.config.js
├── index.html
├── jsconfig.json                  ← alias @/* → src/*
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Módulos identificados

| Módulo | Páginas | Entidades | Componentes |
|--------|---------|-----------|-------------|
| **pacientes** | Patients, PatientForm, PatientDetail | Patient | PatientSearch, LGPDConsent |
| **consultas** | Consultations, Consultation, NewConsultation | Consultation, Exam, Prescription | ConsultationTimeline, VitalSignsForm, ExamUploader, PrescriptionEditor, ReportsView |
| **agendamentos** | Appointments, NewAppointment | Appointment, Doctor | AppointmentCalendar, TimeSlotPicker |
| **médicos** | Doctors | Doctor | — |
| **templates** | Templates | Template | PrescriptionEditor (uso) |
| **logs de acesso** | AccessLogs | AccessLog | AccessLogger |
| **dashboard** | Dashboard | Patient, Consultation, Prescription, Appointment | StatsCard, ReportsView |

## Pontos de entrada

- **HTML:** `index.html`
- **JS:** `src/main.jsx` → `src/App.jsx` (providers: Auth, Query, Theme, Router)
- **Roteamento:** `src/pages.config.js` (mapa `PAGES` + `pagesConfig`), consumido pelo `react-router-dom` no `App.jsx`
- **API:** `src/api/base44Client.js` (cliente único `@base44/sdk`)

## Configuração / ambiente

- `.env.local` — variáveis: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION` (ver README.md)
- Parâmetros também podem vir via **query string** (`app_id`, `access_token`, `from_url`, `functions_version`, `app_base_url`, `clear_access_token`) — ver `src/lib/app-params.js`
- `base44/config.jsonc` — `name: "Prontuário Fácil"`, comandos `npm install` / `npm run build` / `npm run dev`, output `./dist`

## CI/CD

- Nenhum pipeline encontrado (sem `.github/workflows/`, `Jenkinsfile` ou `.gitlab-ci.yml`).
- `.github/` contém apenas um skill de convenções de naming de commits.

## Docker

- Nenhum `Dockerfile` ou `docker-compose.yml`.

## Banco de dados

- **Não há banco local.** O armazenamento é via plataforma **Base44 (BaaS)**.
- Os schemas ficam em `base44/entities/*.jsonc` (8 entidades), com regras de segurança **RLS** por entidade:
  - Patient, Consultation, Appointment, Exam, Prescription: leitura/atualização/exclusão por `created_by_id` **ou** role `admin`
  - Doctor: criação/exclusão somente admin; leitura pública
  - Template: criação somente admin; leitura pública
  - AccessLog: **somente admin** (read/update/delete)
- Campos LGPD presentes em Patient: `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip`; CPF criptografado (`cpf`).

## Cobertura de testes

- **Nenhum teste encontrado** (sem arquivos `*.test.*` / `*.spec.*`, sem framework de teste configurado).
- Scripts disponíveis: `dev`, `build`, `lint`, `lint:fix`, `typecheck` (`tsc -p ./jsconfig.json`), `preview`.

## Histórico Git

- Repositório pequeno (9 commits). Feature recente: relatórios no dashboard.
- Últimos commits indicam iterações: identidade visual, navegação mobile, exclusão de conta, docstrings em pt-BR.