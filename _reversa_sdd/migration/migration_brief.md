---
schemaVersion: 1
generatedAt: 2026-09-09T15:03:57-03:00
reversa:
  version: "1.3.2"
kind: migration_brief
producedBy: orchestrator
hash: "sha256:a183db6030c37d400863d08325673f6b18cee8d763a6204374f907343123c065"
---

# Migration Brief

> Documento de critério de migração coletado em entrevista no início do `/reversa-migrate`.
> Consumido pelos seis agentes do Time de Migração. Não pergunta paradigma (responsabilidade do Paradigm Advisor) nem apetite (derivado em `paradigm_decision.md`).

## Objetivo da migração

Migrar o **Prontuário Fácil** de JavaScript para **TypeScript** (100% de `.ts`/`.tsx`), adicionando type-safety em dados médicos sensíveis e tornando **explícitos nos contratos internos** os elementos ligados às 3 não conformidades de segurança Alta da auditoria (F-03 IDOR/ownership, F-02 token recebido por URL, F-01 RBAC): `role`, `created_by_id` e parâmetros de URL deixam de ser strings soltas e passam a ser campos obrigatórios/discriminados dos tipos. A migração **não corrige** essas não conformidades (ver Nota de escopo) e **não adiciona garantia de segurança em runtime**. A arquitetura **React + Vite + Base44 permanece 100% igual** — a migração é uma camada de tipos sobre o runtime atual, sem mudança de backend, banco ou infraestrutura. Sucesso em runtime: compilação segura, sem *runtime surprises*, principalmente em dados LGPD.

> Nota de escopo registrada: **o TypeScript não detecta vulnerabilidades.** A **correção lógica** das não conformidades F-01 (RBAC), F-02 (token recebido por URL) e F-03 (IDOR) está **fora** desta migração (requer mudanças de runtime/backend; fase de segurança posterior). O que esta migração entrega é a obrigatoriedade, nos tipos das APIs internas, dos campos e parâmetros que essas não conformidades exploram (`role`, `created_by_id`, `access_token`/params de URL) — isto é, a **intenção documentada no contrato, não uma garantia**. Fontes canônicas: `docs/security-audit/achados.json` (F-01/F-02/F-03 Alta; F-04 Média; F-05 Baixa) e `docs/security-audit/relatorio-auditoria-seguranca.md`.

## Métricas de sucesso

1. **Métrica principal (gate de aceite)** — `tsc --noEmit` retorna **0 erros** ao final da onda 7, sobre `src/**` (novo `tsconfig.json`, `strict: true`, `--noEmit` obrigatório). Baseline medido em 2026-09-10: **677 erros em 43 arquivos** (`npx tsc -p ./jsconfig.json --noEmit`). O gate é a redução desse baseline a zero, onda a onda.
2. **Cobertura** — 100% dos **87 arquivos `.js/.jsx`** de `src/` convertidos para `.ts`/`.tsx`, conforme a lista nominal do Escopo declarado. Arquivos de configuração de raiz **não** entram no gate.
3. **Segurança (reformulada)** — contratos internos com campos obrigatórios/discriminados: `role`, `created_by_id` e params de URL (`access_token`). **Sem alegação de detecção de vulnerabilidades** — a correção lógica de F-01/F-02/F-03 é da fase de segurança.
4. **LGPD** — tipos obrigatórios em campos sensíveis (`cpf`, `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip`). Criptografia no storage e RLS são invariantes do Base44, preservados — **não são entregues pela camada de tipos**.
5. **Paridade** — verificada por **checklist de smoke manual repetível**, derivado dos 26 specs de `parity_tests/*.feature`: autenticação, CRUD de paciente, consultas, logs de acesso, consentimento LGPD e alternância offline/online. O projeto não tem framework de testes: **não se declara "paridade 100% comprovada"**.
6. **Build (guardrail de regressão, não de type-safety)** — sem aumento superior a **5%** sobre o baseline medido (JS: 380.392 B gzip / 1.282.292 B raw; CSS: 12.968 B gzip / 76.534 B raw) e build < 4 s (a medir na onda 1). O alvo absoluto anterior (bundle < 185 KB) foi **removido**: não definia a medida (raw? gzip? entry?) e era inalcançável frente ao baseline.
7. **Manutenibilidade** — meta qualitativa, **sem** alvo percentual: o alvo anterior ("50% menos tempo de refatoração") não tinha baseline e era inverificável.

## Restrições

- **Prazo**: 6–10 dias úteis. Fase 1 (Setup): 1–2 d. Fase 2 (Migração): 3–5 d. Fase 3 (Testes): 2–3 d. Buffer: +2–3 d.
- **Orçamento**: ~US$ 3,1k–4,7k (50–70 h de dev). Desenvolvimento 40–56 h; Testes & QA 8–10 h; Documentação 2–4 h; Contingência 20%.
- **Técnicas (não mudam)**:
  - Base44 SDK v0.8.43+ (contrato de API fixa, imutável).
  - React v18.2+ (compatibilidade shadcn/ui + Radix UI).
  - Vite v6.1+ (build tool).
  - `base44.auth.me()` imutável.
  - Schemas Base44 em `base44/entities/` não mudam.
  - Modo offline (`mockClient.js`) compatível com os tipos novos.
- **Regulatórias (LGPD)**:
  - CPF criptografado **no storage pelo Base44** — invariante do BaaS, preservado (a camada de tipos não criptografa).
  - Campos `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip` obrigatórios e type-safe.
  - Auditoria `AccessLog` preservada.
  - Isolamento multi-tenant por médico/clínica — as APIs internas **exigem** `created_by_id`/escopo por tipo; o isolamento efetivo continua sendo RLS/Entity Policies no Base44 (fase de segurança).
- **Operacionais**:
  - Sem downtime (build local + deploy silencioso via PR).
  - Rollback < 5 min se necessário.
  - Modo offline (`VITE_OFFLINE=true`) funcionando igual.
  - Nenhuma janela de manutenção exigida.

## Fatores de risco conhecidos

1. **Refatoração silenciosa em escala**: 87 arquivos JS/JSX podem introduzir erros que passam despercebidos — projeto tem 0 testes automatizados.
2. **Dependência crítica do Base44 SDK**: incompatibilidade entre tipos TypeScript e a versão do SDK derruba a build inteira.
3. **Regressão LGPD**: campos sensíveis (CPF, `lgpd_consent`) precisam manter criptografia e auditoria durante a migração; qualquer erro quebra conformidade.
4. **Falta de CI/CD**: sem pipeline automatizado, erros só aparecem em testes manuais.
5. **Modo offline frágil**: `mockClient.js` precisa permanecer sincronizado com os tipos novos; risco de desacoplamento.
6. **Dependências declaradas e não usadas**: levantamento por grep em 2026-09-10 — **14 deps de runtime não aparecem em `src/`**: `@stripe/react-stripe-js`, `@stripe/stripe-js`, `react-leaflet`, `jspdf`, `html2canvas`, `lodash`, `react-quill`, `three`, `react-markdown`, `canvas-confetti`, `@hello-pangea/dnd`, `@radix-ui/react-toast`, **`zod`** e **`@hookform/resolvers`** (mais `@base44/vite-plugin` e `tailwindcss-animate`, que são de build). Podem gerar conflitos de tipo durante a migração. ⚠️ **Zod/`@hookform/resolvers` são o caso sensível**: a stack declarada os citava como "validação type-safe", mas o legado não os importa — não introduzi-los agora (mudança de comportamento). Remoção na onda 1 **condicionada** a nova confirmação por grep e à aprovação do usuário (RISK-006).
7. **Prazo apertado**: 6–10 dias para 50–70 h de trabalho; possível incompatibilidade entre TypeScript strict mode e bibliotecas externas (Radix UI / shadcn/ui).
8. **Baseline de tipos não-zero**: `npm run typecheck` (= `tsc -p ./jsconfig.json`) hoje **falha**, com 677 erros em 43 arquivos. Mitigação: registrar o baseline na onda 1, definir orçamento de erros por onda e reduzir a zero apenas no fim.
9. **Script e config de typecheck inadequados**: o script atual não usa `--noEmit` e o `jsconfig.json` exclui `src/api`, `src/lib` e `src/components/ui` (além de incluir `src/components/**/*.js`, não `.jsx`). Mitigação: criar `tsconfig.json` com `include: ["src"]` e script `tsc --noEmit` na onda 1; **não** executar `npm run typecheck` como está.
10. **Premissa de F-02 a revisar**: o achado F-02 afirma que o token permanece na URL, mas `src/lib/app-params.js:84` lê `access_token` com `removeFromUrl: true` (o parâmetro é removido da URL na leitura). Mitigação: tratar o risco residual real — token persistido em `localStorage` e janela de exposição via histórico/Referer — como item da fase de segurança; nesta migração, apenas tipar.

## Stakeholders

| Nome / papel | Responsabilidade na migração |
|---|---|
| Product Owner / Developer (único) | Aprovação de PRs, decisões arquiteturais e aceite final da migração |

## Stack alvo

- **Linguagem**: TypeScript 5.8.2 (100% de cobertura em `.ts`/`.tsx`)
- **Framework**: React 18.2 + Vite 6.1 (tooling mantido)
- **Componentes & UI**: Radix UI + shadcn/ui + Tailwind CSS 3.4 (sem mudanças)
- **Estado & Data Fetching**: TanStack React Query 5.84 (usado nas páginas). React Hook Form 7.54 aparece **apenas** no wrapper shadcn (`src/components/ui/form.jsx`) — nenhuma página usa `useForm`. **Zod 3.24 e `@hookform/resolvers` não têm nenhum import em `src/`** (ver risco 6): a validação do legado é manual, e esta migração **tipa a validação existente sem introduzir Zod** (introduzi-lo seria mudança de comportamento).
- **Roteamento**: React Router DOM 7.18 (mantido)
- **Backend**: Base44 SDK v0.8.43+ (BaaS imutável — contrato de API preservado)
- **Banco**: em aberto — gerenciado pelo Base44; nenhuma mudança necessária para a migração de tipos
- **Mensageria**: em aberto — SPA sem fila/pub-sub
- **Infra**: em aberto — mantém deployment atual (Vite static export + Base44 cloud); sem mudanças para TypeScript
- **Observabilidade**: **fora do escopo desta migração** — nenhuma mudança de infraestrutura ou de monitoramento. A avaliar depois, como decisão separada: (1) APM (Datadog/New Relic); (2) logging centralizado (Sentry); (3) `strict mode` como visibilidade de type-safety (este sim, entregue aqui).

**Resumo da stack**: ~95% idêntica à atual — a migração adiciona TypeScript como camada de compile-time, sem alterações de runtime ou infraestrutura.

## Escopo declarado

- **Incluído**:
  - Os **8 módulos** de `_reversa_sdd/inventory.md` §Módulos identificados: pacientes, consultas, agendamentos, médicos, templates, logs de acesso, dashboard e modo offline. Prescrições e Exames **não** são módulos próprios: são entidades do módulo `consultas` (`PrescriptionEditor.jsx`, `ExamUploader.jsx`).
  - Autenticação Base44 tipada (`base44.auth.me()`).
  - **Lista nominal dos arquivos-alvo do gate** (87 arquivos `.js/.jsx` → `.ts`/`.tsx`): `src/pages/**` (12), `src/components/**` (61, incluindo `components/ui` com 49), `src/hooks/**` (1: `use-mobile.jsx`), `src/lib/**` (6: `app-params.js`, `utils.js`, `AuthContext.jsx`, `NavigationTracker.jsx`, `PageNotFound.jsx`, `query-client.js`), `src/api/**` (3: `base44Client.js`, `mockClient.js`, `mockSeed.js`), raiz de `src/` (4: `App.jsx`, `Layout.jsx`, `main.jsx`, `pages.config.js`).
  - `src/utils/**` (`index.ts`) **já é TypeScript** — entra na lista apenas para completude do inventário.
  - **Fora do gate de cobertura TS** (arquivos de configuração/tooling, contexto Node): `vite.config.js`, `eslint.config.js`, `postcss.config.js`, `tailwind.config.js` e `jsconfig.json` (substituído por `tsconfig.json`). Convertê-los é opcional e **não** faz parte do aceite.
  - Unit `modo-offline/` (transversal): `mockClient.ts` + `mockSeed.ts` preservando persistência em `localStorage`, com `OFFLINE_USER` tipado.
  - React Query com tipos; React Router tipado; wrapper `src/components/ui/form.jsx` tipado. **Zod não entra** nesta migração (introduzi-lo seria nova validação, fora da paridade).
  - Novo diretório `src/types/` com interfaces de entidades: `Patient.ts`, `Doctor.ts`, `Appointment.ts`, `Consultation.ts`, `Prescription.ts`, `Exam.ts`, `Template.ts`, `AccessLog.ts`, `User.ts`.
  - Remoção das dependências de runtime não usadas (14 identificadas por grep em 2026-09-10 — ver risco 6) na onda 1, **condicionada** a nova confirmação por grep e à aprovação do usuário (RISK-006).
- **Excluído**:
  - Backend Base44 (contrato de API imutável).
  - Entity Policies / RLS no Base44 (fora do frontend).
  - Infraestrutura e deploy (sem mudanças).
  - Banco de dados (gerenciado pelo Base44).
  - Novas features (escopo é migração, não desenvolvimento).
  - Correção lógica das não conformidades Alta — F-01 RBAC, F-02 token recebido por URL, F-03 IDOR (requerem mudanças de runtime/backend; fase de segurança posterior).
  - Correção das demais não conformidades da mesma auditoria — F-04 (listagens sem filtro de escopo/tenant, Média) e F-05 (`dangerouslySetInnerHTML` em `src/components/ui/chart.jsx`, Baixa).
  - Testes automatizados (projeto não tem framework; não se adiciona framework nesta migração).

## Notas livres

- Migração de tipos apenas: a árvore de arquivos, dependências de runtime e o contrato Base44 não mudam; o único delta de build é a camada TypeScript.
- Não conformidades de segurança tratadas nesta migração **apenas como obrigatoriedade de tipos**: F-01 (RBAC), F-02 (token recebido por URL), F-03 (IDOR). **Fontes canônicas**: `docs/security-audit/achados.json` (IDs F-01…F-05) e `docs/security-audit/relatorio-auditoria-seguranca.md`.
- **Atenção à trilha de IDs**: os IDs **G-01/G-02/G-04** pertencem a `_reversa_sdd/gaps.md` e tratam de outra lacuna (Taxa de Atendimento 94%, paginação dos logs, badge offline) — **não** são as não conformidades F-*. Âncoras úteis na descoberta: `_reversa_sdd/permissions.md` §3 (matriz RBAC) e §4 (offline sem RLS e sem `role`); `_reversa_sdd/inventory.md` (parâmetros via query string, incl. `access_token`); `_reversa_sdd/code-analysis.md` §9 (Pontos de Atenção — não usa IDs F-*).
- Preferência do stakeholder único (PO/Dev): decisões arquiteturais e aceite final concentrados na mesma pessoa; manter artefatos enxutos e objetivos.

### Revisão 2026-09-10 — resposta ao `_reversa_sdd/feedback.md`

Revisão do brief após 4 pareceres externos (Cursor/Grok 4.6, Copilot SDK no VS Code, OpenCode/MiMo v2.5 Free, Antigravity/Gemini 3.6 Flash). **Nenhuma decisão aprovada foi reaberta** (paridade exata, Estratégia A/7 ondas, topologia híbrida, telas literais, AMB-001…005).

**Aceito e aplicado:**
1. Métrica 2 reescrita — "detectar 3 vulnerabilidades em compile-time" era promessa que o compilador não entrega; substituída por obrigatoriedade de campos/parâmetros nos contratos internos. A nota de escopo agora afirma explicitamente que **o TypeScript não detecta vulnerabilidades** (antes se contradizia com a métrica).
2. Trilha corrigida — F-01/F-02/F-03 vinham apontados para `gaps.md` e `code-analysis.md`, que **não contêm esses IDs nem os termos RBAC/IDOR/token**: a fonte canônica é `docs/security-audit/achados.json`.
3. Escopo verificável — "9 módulos" (mistura de páginas e entidades) substituído pelos **8 módulos** do inventário + lista nominal dos 87 arquivos do gate + exclusão explícita dos configs de raiz.
4. Gate definido — baseline medido (677 erros / 43 arquivos), escopo `src/**`, `--noEmit` obrigatório e correção do script/config inadequados (riscos 8 e 9).
5. Paridade — "100%" substituído por checklist de smoke repetível derivado dos 26 `.feature`; reconhecida a ausência de framework de testes.
6. Métricas inválidas removidas/convertidas — bundle < 185 KB (inalcançável: baseline é 380 KB gzip) virou guardrail de regressão de 5%; "50% menos tempo de refatoração" removido por não ter baseline.
7. LGPD/infra — criptografia de CPF e isolamento multi-tenant reclassificados como invariantes do Base44/RLS (não entregues por tipos); Observabilidade movida para **fora do escopo**, eliminando a contradição com "sem mudança de infra".
8. Risco do SDK — referência cruzada às mitigações já existentes (`target_architecture.md` AD-01/AD-02, `risk_register.md` RISK-005/007).

**Rejeitado, com justificativa:**
- Criar `src/types/base44.d.ts` com `any` incremental para o SDK (sugestão de 2 revisores): **desnecessário** — `@base44/sdk@0.8.43` publica tipos (`"types": "dist/index.d.ts"` + `dist/modules/*.types.d.ts`); declarar `any` mascararia o gate que a migração entrega.
- Adicionar risco próprio para dessincronização mock↔tipos: já coberto (risco 5 do brief, BR-MIGRAR-038/039, AD-02).
- "Não listar explicitamente os arquivos-raiz e a unit offline": lido como lapso do parecer — os outros três revisores pedem o contrário, e a lista foi **adicionada**.

**Achados novos desta revisão (não apontados no feedback):** baseline de tipos de 677 erros; `npm run typecheck` sem `--noEmit` e `jsconfig.json` com `include`/`exclude` que deixam `src/api`, `src/lib` e `src/components/ui` fora do gate; premissa do achado F-02 desatualizada (`app-params.js:84` remove o token da URL); `react-quill` citada como lib viva em `target_architecture.md` sem qualquer import em `src/`; **14 deps de runtime sem import em `src/`** (não 6) e **Zod/`@hookform/resolvers` declarados como "validação type-safe" na stack alvo sem uso no legado**.

**Escopo desta revisão:** somente `_reversa_sdd/`. Nenhum arquivo do legado, de `_reversa_sdd/` de descoberta, de `docs/security-audit/` ou de `.reversa/` foi alterado.
