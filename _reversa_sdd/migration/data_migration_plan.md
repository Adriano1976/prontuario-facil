---
schemaVersion: 1
generatedAt: 2026-09-09T15:30:00-03:00
reversa:
  version: "1.3.2"
kind: data_migration_plan
producedBy: designer
hash: "sha256:a2ed12aa2fc8f9f6dd5b8e82eba0d2299ef1ca9b4a1daf007da7cc94e0ef8a1c"
---

# Data Migration Plan

> Plano de migração dos dados do legado para o sistema novo: mapeamento, transformações, ETL, cutover de dados e validação.

## Resumo

- **Volume estimado**: N/A para migração de dados — os dados **não se movem**. Persistência permanece no Base44 (BaaS) com schemas imutáveis; em modo offline, os dados de demonstração permanecem em `localStorage` (mock), sem migração entre releases (limitação P4 do legado: `modo-offline/requirements.md` §7).
- **Janela de migração**: N/A (não há corte de dados; ver `cutover_plan.md` para o corte de código/build).
- **Estratégia**: **sem backfill/delta/ETL** — a migração é de **tipos** sobre o mesmo contrato de dados (paradigma inalterado, backend imutável — `migration_brief.md`, `paradigm_decision.md`).

## Mapeamento legado → novo

| Origem | Destino | Tipo | Notas |
|---|---|---|---|
| `base44/entities/Patient.jsonc` | `src/types/Patient.ts` | espelho tipado | nenhuma mudança de schema; tipos derivados (union `status`, enum `blood_type`/`gender`) |
| `base44/entities/Consultation.jsonc` | `src/types/Consultation.ts` | espelho tipado | union `status` |
| `base44/entities/Prescription.jsonc` | `src/types/Prescription.ts` | espelho tipado | union `type`; `medications[]` condicional a tipo de receita |
| `base44/entities/Exam.jsonc` | `src/types/Exam.ts` | espelho tipado | union `type`/`file_type` |
| `base44/entities/Appointment.jsonc` | `src/types/Appointment.ts` | espelho tipado | unions `status`/`type`; `duration` default 30 |
| `base44/entities/Doctor.jsonc` | `src/types/Doctor.ts` | espelho tipado | `working_days`→`Weekday[]`; `working_hours`→`WorkingHours` |
| `base44/entities/Template.jsonc` | `src/types/Template.ts` | espelho tipado | union `type` |
| `base44/entities/AccessLog.jsonc` | `src/types/AccessLog.ts` | espelho tipado | union `action` |
| `auth.me()` + `OFFLINE_USER` | `src/types/User.ts` | fundido + variante | `User` (role) ∪ variante offline sem role/created_by_id |
| `src/api/mockSeed.js` dados | `src/api/mockSeed.ts` (mesmo formato) | renomeação de arquivo | conteúdo preservado; tipos compartilhados |

## Transformações

### Transformação T-01: Derivação de tipos a partir dos JSONC
- **Aplica em**: todas as 8 entidades BaaS (schemas em `base44/entities/*.jsonc`)
- **Regra**: cada campo do JSONC vira campo tipado na interface correspondente; `enum`/valores fechados viram union types; `required` vira campo obrigatório; campos LGPD marcados como sensíveis.
- **Tratamento de inválidos**: N/A (não há leitura de dados legados — os dados já nascem/continuam no formato Base44; tipos são contratos de leitura/escrita).
- **Origem da regra**: `target_business_rules.md` (BR-MIGRAR-002/005/007/009/011/014/019/025); `target_data_model.md`.

### Transformação T-02: Tipagem do contrato mock (offline) sob a mesma interface
- **Aplica em**: `src/api/mockClient.ts`, `mockSeed.ts`
- **Regra**: mock e SDK implementam o mesmo `Base44Client`; `OFFLINE_USER` é variante discriminada **sem** `role`/`created_by_id` (torna explícita a ausência de RLS/permissões offline).
- **Tratamento de inválidos**: N/A — comportamento offline preservado (BR-OFF, sem RLS — BR-MIGRAR-044); tipos apenas tornam explícito.
- **Origem da regra**: `target_business_rules.md` BR-MIGRAR-038/039/044; `modo-offline/requirements.md`.

### Transformação T-03: Cobertura de campos entre JSONC e código
- **Aplica em**: campos de entidade usados em código mas ausentes/pendentes nos JSONC (ex.: divergências seed `file_url: ''`, campos inferidos)
- **Regra**: tipar contra o JSONC como fonte canônica; onde o mock diverge (string vazia vs opcional), o tipo deve tolerar o contrato mock com nota; divergências registradas em `ambiguity_log.md`.
- **Tratamento de inválidos**: registrar LACUNA/divergência (não silenciar), validar no agente de codificação.
- **Origem da regra**: `target_data_model.md` Notas; `modo-offline/requirements.md` §7.

## Estratégia de ETL

- **Ferramenta**: N/A — **não há ETL**. Não há extração/transformação/carga de dados entre sistemas; o BaaS permanece a fonte única.
- **Fluxo**: N/A.
- **Idempotência**: N/A.
- **Throughput esperado**: N/A.

## Backfill e delta

- **Backfill**: N/A.
- **Captura de delta**: N/A — sem réplica de dados (o Base44 não é tocado; não há segunda base para sincronizar).
- **Reconciliação periódica**: N/A.

## Cutover de dados

> Ver também `cutover_plan.md`. Aqui apenas a parte específica de dados.

- **Janela**: N/A — não há corte de dados.
- **Sequência de corte**: N/A (o "corte" da migração é o do código/build na onda 7 do `cutover_plan.md`).
- **Verificação pós-corte**: os dados continuam no BaaS sem alteração; a validação é de **contrato de tipos** (`tsc --noEmit` = 0) + smoke online/offline, não de contagem/checksum de dados.

## Validação de qualidade

| Métrica | Alvo | Fonte de medição |
|---|---|---|
| Paridade de contrato de tipos (SDK ↔ mock) | 0 divergência de interface | `tsc --noEmit` + implementação do `Base44Client` |
| Campos LGPD tipados | CPF/consentimento obrigatórios conforme schema | revisão de tipos (Inspector) |
| Smoke online pós-migração | CRUD de 1 paciente/agendamento/consulta OK | `cutover_plan.md` passo 6 |
| Smoke offline pós-migração | CRUD no `localStorage` OK | `cutover_plan.md` passo 3 |
| Dados de produção intactos | nenhuma alteração (BaaS intocado) | comparativo de schemas git (JSONC unchanged) |

## Riscos específicos de dados

- RISK-002: incompatibilidade de tipos com contrato Base44 — ver `risk_register.md` (mitigação: tipos espelham JSONC; validação no codificador).
- RISK-005: desacoplamento mock offline — ver `risk_register.md` (mitigação: contrato único `Base44Client`).
- RISK-003: regressão LGPD durante tipagem — ver `risk_register.md`.

## Notas

- Este artefato é propositalmente **N/A em ETL/backfill/delta**: a natureza da migração (JS→TS na mesma stack com BaaS imutável) não move dados. O template clássico de migração de dados não se aplica; os campos foram preenchidos para documentar explicitamente o porquê, evitando que o agente de codificação invente uma migração de dados desnecessária.
- Único "dado" que muda de lugar: `src/api/mockSeed.js` → `mockSeed.ts` (mesmo formato), e nenhuma persistência existente em `localStorage` de quem usa offline é migrada (P4 do legado: mudanças de formato exigem `localStorage.clear()` manual).
