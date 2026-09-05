# Plano de Exploração — prontuario-facil

> Criado pelo Reversa em 2026-08-20
> Marque cada tarefa com ✅ quando concluída.
> Você pode editar este plano antes de iniciar: adicione, remova ou reordene tarefas conforme necessário.

---

## Fase 1: Reconhecimento 🔍

- [x] **Scout** — Mapeamento de estrutura de pastas e tecnologias ✅ 2026-08-20
- [x] **Scout** — Análise de dependências e gerenciadores de pacotes ✅ 2026-08-20
- [x] **Scout** — Identificação de entry points, CI/CD e configurações ✅ 2026-08-20

## Decisão de organização das specs 🗂️

> Entre o Scout e o Arqueólogo, o Reversa pergunta como você quer organizar as specs (por módulo, caso de uso, endpoint, híbrida, por features ou customizada). A escolha fica persistida em `.reversa/config.toml` na seção `[specs]` e não será reperguntada em execuções futuras. Para reapresentar o menu, remova manualmente a seção.

## Fase 2: Escavação 🏗️

> Lista de módulos derivada de `.reversa/context/surface.json` (atualizada em 2026-08-25 após sync com `pages.config.js`).

- [x] **Arqueólogo** — Análise do módulo `pacientes` (→ `src/pages/Patients.jsx`) ✅ 2026-08-22
- [x] **Arqueólogo** — Análise do módulo `consultas` (→ `src/pages/Consultations.jsx` + Consultation/NewConsultation) ✅ 2026-08-22
- [x] **Arqueólogo** — Análise do módulo `agendamentos` (→ `src/pages/Appointments.jsx` + NewAppointment + components/appointments) ✅ 2026-08-25
- [x] **Arqueólogo** — Análise do módulo `medicos` (→ `src/pages/Doctors.jsx`) ✅ 2026-08-25
- [x] **Arqueólogo** — Análise do módulo `templates` (→ `src/pages/Templates.jsx`) ✅ 2026-08-26
- [x] **Arqueólogo** — Análise do módulo `logs-acesso` (→ `src/pages/AccessLogs.jsx`) ✅ 2026-08-26
- [x] **Arqueólogo** — Análise do módulo `dashboard` (→ `src/pages/Dashboard.jsx` + StatsCard, PatientSearch, ReportsView) ✅ 2026-08-26

## Fase 3: Interpretação 🧠

- [x] **Detetive** — Arqueologia Git e ADRs retroativos ✅ 2026-08-31
- [x] **Detetive** — Regras de negócio implícitas e máquinas de estado ✅ 2026-08-31
- [x] **Detetive** — Matriz de permissões (RBAC/ACL) ✅ 2026-08-31
- [x] **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes) ✅ 2026-08-31 → canônicos: `c4-context.md`, `c4-containers.md`, `c4-components.md`
- [x] **Arquiteto** — ERD completo e integrações externas ✅ 2026-08-31 → canônico: `erd-complete.md`
- [x] **Arquiteto** — Spec Impact Matrix ✅ 2026-08-31 → canônica: `traceability/spec-impact-matrix.md`

> Layout do Architect alinhado ao canônico do SKILL em 2026-09-05: os artefatos consolidados da raiz (`architecture.md`, `erd.md`, `impact-matrix.md`) viraram apontadores/espelhos dos arquivos canônicos separados.

## Fase 4: Geração 📝

- [x] **Redator** — Specs SDD por componente ✅ 2026-09-02
- [x] **Redator** — OpenAPI (se aplicável) ✅ 2026-09-02 — não aplicável
- [x] **Redator** — User Stories (se aplicável) ✅ 2026-09-02 — não aplicável
- [x] **Redator** — Code/Spec Matrix ✅ 2026-09-02

## Fase 5: Revisão ✅

- [x] **Revisor** — Revisão cruzada de specs ✅ 2026-08-31
- [x] **Revisor** — Resolução de lacunas com o usuário ✅ 2026-09-03
- [x] **Revisor** — Relatório de confiança final ✅ 2026-09-03

---

## Agentes Independentes

> Execute estes agentes quando os recursos estiverem disponíveis — podem rodar em qualquer fase.

- [x] **Visor** — Análise de interface via screenshots ✅ 2026-08-28
- [x] **Data Master** — Análise completa do banco de dados ✅ 2026-08-27
- [x] **Design System** — Extração de tokens de design ✅ 2026-08-27
- [ ] **Tracer** — Análise dinâmica (requer sistema acessível)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar um dos fluxos seguintes:

- `/reversa-migrate`: orquestrador do **Time de Migração** (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector). Gera as specs do sistema novo. Saída em `_reversa_sdd/migration/` e `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
