---
schemaVersion: 1
generatedAt: 2026-09-09T15:25:40-03:00
reversa:
  version: "1.3.2"
kind: cutover_plan
producedBy: strategist
hash: "sha256:2cc5c3f0fe50a8d71213e58a3705f0c68b37819acb20e7ca257bb297aea0fc6b"
---

# Cutover Plan

> Plano de corte do legado para o sistema novo, alinhado à estratégia escolhida em `migration_strategy.md`.

## Estratégia base
- **Estratégia confirmada**: A — Migração incremental por camadas (Branch by Abstraction adaptado) — **recomendada pelo Strategist; aguardando decisão humana em `migration_strategy.md`**. Se o usuário escolher outra (B), este plano é substituído pela base correspondente.

> Natureza especial deste cutover: **não há troca de servidor, banco, dados ou deploy**. O "sistema novo" é a mesma SPA compilada com TypeScript. O cutover real é **o merge do último PR da onda 7** (remoção do `allowJs`, `strict` total, `tsc --noEmit` = 0) + deploy silencioso — cada onda anterior já foi para produção sem downtime.

## Pré-requisitos
- [ ] Onda 7 concluída: `allowJs` removido, `strict: true`, **100% dos 87 arquivos `.js/.jsx` de `src/`** em `.ts`/`.tsx` (arquivos de config de raiz ficam fora do gate)
- [ ] `tsc --noEmit` (script `typecheck` corrigido — o atual, `tsc -p ./jsconfig.json`, não usa `--noEmit`) retorna **0 erros** localmente, partindo do baseline de **677 erros / 43 arquivos** (medido em 2026-09-10)
- [ ] Build Vite OK: **sem aumento > 5%** no bundle vs baseline (JS 380.392 B gzip; CSS 12.968 B gzip) e **build < 4 s**
- [ ] Smoke manual dos **8 módulos** em modo **online** (Base44 real): pacientes, consultas, agendamentos, médicos, templates, logs de acesso e dashboard (Prescrições/Exames pertencem ao módulo consultas)
- [ ] Smoke manual em modo **offline** (`VITE_OFFLINE=true`): mesmos fluxos com `mockClient.ts`
- [ ] Revisão final de paridade LGPD/RLS: tipos obrigatórios em CPF/`lgpd_consent*`, filtros `created_by_id` presentes (Inspector)
- [ ] Git: branch de feature atualizada com a main; PR revisado e aprovado pelo PO/Dev

## Janela de cutover
- **Data alvo**: fim da janela de 6–10 dias úteis (Fase 3 — Testes: 2–3 dias antes do merge final)
- **Duração estimada**: 1–2 h (merge + deploy + smoke pós-deploy)
- **Ambiente afetado**: produção (SPA Vite + Base44 cloud) — **sem downtime** (build local + deploy silencioso via PR)
- **Comunicação prévia**: sem janela de manutenção exigida (brief); stakeholder único informado pelo próprio PR

## Passos do cutover

| # | Passo | Owner | Duração | Reversível? |
|---|---|---|---|---|
| 1 | Rodar `typecheck` + `build` finais na branch (0 erros, métricas OK) | PO/Dev | 15 min | Sim (antes do merge) |
| 2 | Smoke manual online dos 8 módulos em ambiente de preview do PR | PO/Dev | 30–45 min | Sim |
| 3 | Smoke manual offline (`VITE_OFFLINE=true`) dos fluxos principais | PO/Dev | 15–30 min | Sim |
| 4 | Revisão final do diff da onda 7 (só tipos; nenhuma correção comportamental — AMB-002/003/006) | PO/Dev | 15 min | Sim |
| 5 | Merge do PR (deploy silencioso) | PO/Dev | 5 min | Sim (git revert) |
| 6 | Smoke pós-deploy em produção (login, dashboard, 1 paciente, 1 agendamento) | PO/Dev | 15 min | Parcial (se falhar → rollback) |
| 7 | Verificação das métricas: bundle dentro do guardrail de 5% vs baseline, build < 4 s | PO/Dev | 5 min | Sim |

## Plano de rollback
- **Critérios de acionamento**: smoke pós-deploy falha; erro de runtime em produção atribuível à onda 7; bundle acima do guardrail de regressão (5% vs baseline) ou build acima de 4 s.
- **Passos**:
  1. `git revert <sha do merge>` da onda 7 (ou do último PR problemático)
  2. Redeploy do último build estável (pré-migração TS ou onda anterior)
  3. Smoke de verificação do ambiente restaurado
- **Tempo máximo aceitável até rollback**: < 5 min (exigência do brief)
- **Owner do rollback**: Product Owner/Developer (stakeholder único)

## Critérios de go / no-go
- **Go**:
  - `tsc --noEmit` com **0 erros** sobre `src/**` (métrica principal; baseline de partida: 677 erros / 43 arquivos)
  - Build OK: bundle dentro do guardrail de 5% vs baseline e build < 4 s
  - Smoke online e offline dos fluxos principais aprovados
  - Revisão confirma que o diff da onda é **somente de tipos** (nenhuma correção comportamental de AMB-002/003/006)
  - Tipos LGPD obrigatórios verificados (CPF, `lgpd_consent_date`, `lgpd_consent_ip`)
- **No-go**:
  - Qualquer erro de tipo pendente ou `any` não justificado
  - Comportamento divergente detectado no smoke (ex.: KPI mudou de critério; status mudou de manual para automático)
  - Modo offline quebrado após a onda do mock
  - Regressão de auditoria/logs de acesso

## Pós-cutover
- [ ] Monitoramento estendido por 3–5 dias úteis (uso real, sem janela dedicada)
- [ ] Validação de paridade conforme `parity_specs.md` (Inspector) — os 45 BR-MIGRAR e os 0 descartes do Curator
- [ ] Revisão pós-migração dos itens REFERIDOS À CODIFICAÇÃO no `ambiguity_log.md` (AMB-006 XSS; AMB-007 / F-01/F-02/F-03 — fonte canônica: `docs/security-audit/achados.json`) para fase posterior
- [ ] Decommission: **N/A** — não há sistema legado separado; o "antes" (JS) fica no histórico git acessível para diff

## Notas
- Como a migração é de tipos na mesma stack, este cutover **não** congela escritas, não faz ETL e não muda DNS — os passos de cutover clássicos do template não se aplicam.
- Cada onda anterior (1–6) já foi para produção incrementalmente; o "cutover" formal é a onda 7 + smoke.
- Se o usuário escolher a Estratégia B (Big Bang), o cutover passa a ser um PR único com rollback via `git revert` — os critérios go/no-go permanecem os mesmos, mas o risco concentrado é tratado no RISK-001/010.
