---
schemaVersion: 1
generatedAt: 2026-09-09T15:25:40-03:00
reversa:
  version: "1.3.2"
kind: risk_register
producedBy: strategist
hash: "sha256:140578ae762c1d84c20c45ce5a552c2774b02262943abe24f32bad5fc24048a1"
---

# Risk Register

> Registro de riscos da migração com probabilidade, impacto, mitigação e responsável.

## Riscos

### RISK-001 — Refatoração silenciosa: erros tipográficos/regressão sem testes automatizados
- **Descrição**: 87 arquivos JS/JSX convertidos à mão podem introduzir erros que passam despercebidos — o projeto tem 0 testes.
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: alto
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: comportamento divergente em smoke manual; erros de tipo "consertados" com `as`/`@ts-ignore` em vez de tipos corretos; PRs com mudanças além de renomear `.jsx`→`.tsx`.
- **Mitigação**: Estratégia A (ondas pequenas por camada/módulo); revisão de cada PR pelo PO/Dev; `strict: true` sem `any` silencioso; smoke manual dos fluxos de cada módulo na própria onda; remover `allowJs` ao final para forçar 100% tipado.
- **Plano de contingência**: se um módulo migrado divergir, reverter apenas o PR daquele módulo (< 5 min) e revisar tipos da fronteira.
- **Owner**: Product Owner/Developer (stakeholder único)
- **Status**: aberto

### RISK-002 — Incompatibilidade de tipos com o Base44 SDK
- **Descrição**: Se os tipos TypeScript declarados (ou os `@types` do SDK v0.8.43+) não casarem com o contrato real do BaaS, a build falha ou, pior, compila com tipos mentirosos.
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: crítico
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: erro de tipo em `base44.entities.*` após migração de `src/api/`; `@base44/sdk` sem declarações de tipos adequadas; necessidade de casts generalizados.
- **Mitigação**: tipar `src/types/*.ts` a partir dos schemas canônicos `base44/entities/*.jsonc` (fonte única — não mudam); envolver o SDK com uma interface própria (`Base44Client`) que o mock também implementa (BR-MIGRAR-038); validar `auth.me()` tipado contra contrato real.
- **Plano de contingência**: declarar tipos próprios alinhados ao JSONC e `@ts-expect-error` documentado apenas onde o SDK não expõe tipos; registrar no `ambiguity_log.md`.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-003 — Regressão LGPD (CPF, consentimento, auditoria, RLS espelhada)
- **Descrição**: Campos sensíveis (CPF, `lgpd_consent*`) precisam manter criptografia/auditoria; tipos que "esquecem" `created_by_id` ou consentimento quebram conformidade silenciosamente.
- **Categoria**: regulatório
- **Probabilidade**: baixa
- **Impacto**: crítico
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: tipos que deixam `lgpd_consent_date`/`lgpd_consent_ip` opcionais; assinaturas de query sem escopo `created_by_id`; log de auditoria removido na migração de uma page.
- **Mitigação**: tipos obrigatórios derivados (BR-MIGRAR-004); BR-MIGRAR-034/036 tornam filtros/role **exigidos por tipos** (F-03/F-01 — obrigatoriedade de contrato, não detecção de vulnerabilidade); manter chamadas de auditoria (BR-MIGRAR-026/032/035); revisão de paridade LGPD por módulo.
- **Plano de contingência**: auditoria específica do diff de tipos dos campos sensíveis antes do merge final (Inspector).
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-004 — Falta de CI/CD atrasa a descoberta de erros
- **Descrição**: Sem pipeline, `tsc --noEmit`, lint e build só rodam localmente; erros de integração aparecem tarde.
- **Categoria**: operacional
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: merge de PR que quebra build em outro ambiente; esquecimento de rodar typecheck.
- **Mitigação**: adicionar **scripts locais** (`npm run typecheck` = `tsc --noEmit`, já previsto no package.json) como gate obrigatório de cada PR; opcionalmente um GitHub Action mínimo de `typecheck + build` (sem mudar deploy — fora do escopo de infra do brief, decidir com o usuário).
- **Plano de contingência**: checklist manual de PR (typecheck, lint, build, smoke) documentado no repo migrado.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-005 — Desacoplamento entre mock offline e tipos novos
- **Descrição**: `mockClient.ts` pode divergir do contrato tipado do SDK real, quebrando o modo offline (`VITE_OFFLINE=true`) silenciosamente.
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: interface `Base44Client` não implementada integralmente pelo mock; operações do mock com tipos diferentes do SDK.
- **Mitigação**: BR-MIGRAR-038 (contrato único tipado implementado por SDK e mock); compilar o mock contra a mesma interface; smoke offline na onda do modo offline.
- **Plano de contingência**: testes manuais offline após cada onda que toque `src/api/`.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-006 — Dependências não utilizadas geram conflito de tipos
- **Descrição**: Stripe, react-leaflet, jsPDF/html2canvas, lodash estão no `package.json` sem uso em `src/`; tipos ausentes ou desatualizados podem travar a migração.
- **Categoria**: técnico
- **Probabilidade**: baixa
- **Impacto**: baixo
- **Severidade combinada**: baixa
- **Trigger / sinal de alerta**: `tsc` reclamando de módulo sem tipos em arquivo que não importa a lib (ex.: `allowJs` varrendo `node_modules` ou imports residuais).
- **Mitigação**: na onda 1, **remover** dependências mortas do `package.json` (Stripe, react-leaflet, jspdf, html2canvas, lodash) se confirmado que nada importa — confirmar com grep antes; ou tipar como resíduo isolado.
- **Plano de contingência**: se remoção afetar build, restaurar dependência e isolar com `@ts-expect-error` justificado.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-007 — Prazo apertado (6–10 dias / 50–70 h)
- **Descrição**: Pouca margem para bugs complexos ou incompatibilidade entre strict mode e libs externas (Radix/shadcn, react-quill, framer-motion).
- **Categoria**: financeiro (tempo/orçamento)
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: onda excede o tempo estimado; pendências acumulam entre ondas.
- **Mitigação**: Estratégia A com ondas priorizadas por risco (LGPD/API primeiro); buffer +2–3 dias previsto no brief; corte de escopo definido (ex.: libs sem tipos recebem declaração mínima `*.d.ts` em vez de tipagem profunda).
- **Plano de contingência**: reduzir profundidade de tipos em componentes de UI de baixo risco (deixar `Props` tipadas, internals menos rígidos) e registrar em `ambiguity_log.md`.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-008 — Erros de tipo de bibliotecas externas (Radix/shadcn, React Query, RHF)
- **Descrição**: strict mode pode expor incompatibilidades de tipos de libs que não declaram bem suas APIs (ex.: `@hello-pangea/dnd`, `react-quill`, `framer-motion`).
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: avalanche de erros de tipo restritos a um componente de UI após conversão.
- **Mitigação**: converter componentes de UI em ondas; usar tipos oficiais (`@types/*`); declarações `*.d.ts` locais mínimas quando a lib não tiver tipos; não usar `any` como escape padrão.
- **Plano de contingência**: registrar exceções tipadas no `ambiguity_log.md` e reavaliar.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-009 — Divergência acidental de comportamento por "correções" do tipador
- **Descrição**: Durante a tipagem, o agente/codificador pode "consertar" comportamentos do legado (critérios de KPI, sincronia de status, XSS de templates, ordem de filtros) por parecerem bugs — violando a paridade 100% decidida (AMB-002, AMB-003, AMB-006).
- **Categoria**: organizacional
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: commit que altera lógica junto com a conversão de tipos; diff de comportamento além de `.jsx`→`.tsx`.
- **Mitigação**: BR-HUMANA-002/003 e AMB-006 instruem **explicitamente** o codificador a não corrigir; revisão de PR com foco em "diff só de tipos"; listar comportamentos congelados no `handoff.md`.
- **Plano de contingência**: reverter PR e reaplicar conversão sem a correção.
- **Owner**: Product Owner/Developer
- **Status**: aberto

### RISK-010 — Rollback lento ou deploy quebrado
- **Descrição**: Brief exige rollback < 5 min; sem CI/CD e com deploy via Base44/Vite, um merge ruim pode ficar no ar.
- **Categoria**: operacional
- **Probabilidade**: baixa
- **Impacto**: alto
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: build de preview falha; smoke pós-deploy detecta erro.
- **Mitigação**: deploys via PR com preview (Base44); gate `typecheck + build` antes do merge; cutover em horário de baixo uso; plano de rollback = reverter o PR (git revert + redeploy) — documento no `cutover_plan.md`.
- **Plano de contingência**: redeploy do último build JS estável conhecido.
- **Owner**: Product Owner/Developer
- **Status**: aberto

## Resumo por severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| Crítica | 0 | — |
| Alta | 3 | RISK-001, RISK-002, RISK-003 |
| Média | 6 | RISK-004, RISK-005, RISK-007, RISK-008, RISK-009, RISK-010 |
| Baixa | 1 | RISK-006 |

## Riscos relacionados ao paradigma alvo

> Subseção dedicada quando há mudança de paradigma. Listar apenas riscos cuja origem direta é o gap registrado em `paradigm_decision.md`.

- Nenhum. `paradigm_decision.md` registrou **gap nenhum** (mesma stack funcional/declarativa; TS como camada de tipos). Riscos de tipos (RISK-001/002/008) decorrem da **camada de tipos**, não de mudança de paradigma.
