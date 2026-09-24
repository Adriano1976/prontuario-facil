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
| **modo offline** | — (transversal) | todas (mock) | — (client-side) |

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

- Nenhum pipeline encontrado (sem `.github/workflows/`, `Jenkinsfile` ou `.gitlab-ci.yml`). **Ressalva acrescentada em 2026-09-19 (ação T011):** existe `.github/workflows/deploy-pages.yml`, mas ele não é integração contínua da aplicação — publica o mini-site de documentação em GitHub Pages, sem instalar dependências nem construir o artefato. A conclusão desta seção continua válida na prática; a frase que a sustentava não.
- `.github/` contém skills de apoio (convenções de commit, documentação, auditoria de segurança) e o fluxo de publicação citado acima.

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

- ~~**Nenhum teste encontrado**~~ — **corrigido em 2026-09-19 pela feature `002-prova-automatizada` (ação T011), atualizado em 2026-09-21 pelas features `003`, `004` e `005` e corrigido em 2026-09-24.** Esta seção descrevia o legado e ficou defasada: há arcabouço de prova configurado e, na medição de 2026-09-24, **29 arquivos de verificação com 183 verificações**, executáveis por `npm test`. Somam-se `npm run prova:negativos`, que reproduz **18 casos** de verificação negativa do gate de tipos (17 negativos e 1 positivo), e `npm run prova:encoding`, a guarda de codificação, que verifica 499 arquivos de texto. Ver `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste`.
  - ⚠️ **A correção de 2026-09-24 conserta uma defasagem de três rodadas.** Esta linha registrava 18 arquivos e 109 verificações — a medição da feature `005` —, e os adendos das features `006` e `009` **declararam** tê-la atualizado para 132/23 e 145/24, mas as edições **nunca chegaram ao arquivo**. É o mesmo tipo de falha que a sessão de 2026-09-24 encontrou em outras contagens.
- Scripts disponíveis no legado: `dev`, `build`, `lint`, `lint:fix`, `typecheck`, `preview`. Aos quais se somam `test`, `test:watch`, `test:coverage`, `prova:negativos` e `prova:encoding`. O `typecheck` aponta para `tsconfig.json` desde a migração da feature 001 — a extração citava `jsconfig.json`, que era o arquivo do legado.

## Histórico Git

- Repositório pequeno (9 commits). Feature recente: relatórios no dashboard.
- Últimos commits indicam iterações: identidade visual, navegação mobile, exclusão de conta, docstrings em pt-BR.

---

## Mudanças recentes (delta 2026-08-28)

> Atualização incremental do inventário — apenas o que mudou desde o snapshot de 2026-08-20.

**Novos arquivos:**
- `src/api/mockClient.js` — cliente SDK falso com persistência em `localStorage`
- `src/api/mockSeed.js` — dados de demonstração (8 entidades) carregados na primeira execução de cada coleção

**Arquivos modificados:**
- `src/api/base44Client.js` — switch por `import.meta.env.VITE_OFFLINE` para escolher entre SDK real e mock
- `src/lib/AuthContext.jsx` — short-circuit em `checkAppState()` que autentica como `OFFLINE_USER` quando offline

**Nova unit documentada:**
- `_reversa_sdd/modo-offline/` — feature transversal ativada por env var

**Sem impacto em:** estrutura de pastas, dependências de `package.json`, rotas, schema de entidades Base44, build/deploy.

---
*Gerado pelo Reversa-Scout em 2026-08-22.*
