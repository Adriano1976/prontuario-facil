---
schemaVersion: 1
generatedAt: 2026-09-09T15:55:32-03:00
reversa:
  version: "1.3.2"
kind: handoff
producedBy: orchestrator
hash: "sha256:db6bbc8997d010246f395187ddb4c5ed5a26149931690c47516015a459bb3605"
---

# Handoff para o Agente de Codificação

> Este documento é a porta de entrada para o agente de codificação (Claude Code, Codex, Cursor, Antigravity, etc.) que vai escrever o sistema novo a partir das specs.

## ⚠️ Leitura obrigatória primeiro

1. **`paradigm_decision.md`**, leitura inegociável. O paradigma alvo molda como toda a codificação deve acontecer.
2. **`topology_decision.md`**, leitura inegociável. A topologia escolhida (preservar / modernizar / híbrido) define a árvore de pastas e a fronteira entre módulos.
3. **`screen_modernization_decision.md`**, leitura inegociável quando o legado tem UI. O modo escolhido (literal / modernizado / híbrido) define como o codificador vai materializar as telas.

## Ordem de leitura recomendada

1. `paradigm_decision.md` (obrigatório, primeiro)
2. `topology_decision.md` (obrigatório, segundo)
3. `screen_modernization_decision.md` (obrigatório quando há UI; pular se Screen Translator rodou em modo skipped)
4. `migration_brief.md`
5. `target_business_rules.md`
6. `migration_strategy.md`
7. `target_architecture.md`
8. `target_domain_model.md`
9. `target_data_model.md`
10. `data_migration_plan.md`
11. `target_screens.md` (quando há UI)
12. `parity_specs.md` + `parity_tests/`
13. `screen_deviation_log.md` (consultivo, quando há UI)
14. `risk_register.md` + `cutover_plan.md`
15. `discard_log.md` (consultivo)
16. `ambiguity_log.md` (consultivo)

## Lista de artefatos produzidos

| Artefato | Produzido por | Status |
|---|---|---|
| migration_brief.md | orchestrator | criado |
| paradigm_decision.md | paradigm_advisor | criado |
| target_business_rules.md | curator | criado |
| discard_log.md | curator | criado (0 descartes — paradigma inalterado) |
| migration_strategy.md | strategist | criado (Estratégia A confirmada pelo usuário) |
| risk_register.md | strategist | criado |
| cutover_plan.md | strategist | criado |
| topology_decision.md | designer (Fase 1) | criado (opção 3 — híbrido, aprovada) |
| target_architecture.md | designer | criado |
| target_domain_model.md | designer | criado |
| target_data_model.md | designer | criado |
| data_migration_plan.md | designer | criado (N/A em ETL — BaaS intocado) |
| screen_modernization_decision.md | screen_translator (Fase 1) | criado (modo literal, aprovado) |
| target_screens.md | screen_translator | criado (16 telas) |
| screen_deviation_log.md | screen_translator | criado / vazio (0 deviations) |
| _reversa_sdd/screens/inventory.json | screen_translator | criado (16 telas) |
| _reversa_sdd/screens/golden/manifest.yaml | screen_translator | criado (goldens `present: false` — captura manual opcional) |
| parity_specs.md | inspector | criado |
| parity_tests/*.feature | inspector | 26 arquivos (10 fluxos + 16 telas `@paridade-visual`) |
| ambiguity_log.md | orchestrator | consolidado (0 pendentes) |

## Bloqueadores para começar a implementação
> Itens que precisam de decisão humana antes do agente de codificação começar.

- Nenhum bloqueador. Todas as decisões humanas foram tomadas (paradigma: gap nenhum; estratégia: A; topologia: híbrido; modo de telas: literal; BR-HUMANA-001…005: paridade exata). Prosseguir.

## Próximos passos para o agente de codificação

> ⚠️ **Esta migração é de tipos na MESMA stack** (React 18 + Vite + Base44, JS → TS). Não é reescrita em outra plataforma. A árvore física atual é preservada (topologia híbrido); os arquivos `.js/.jsx` são convertidos a `.ts/.tsx` com **paridade comportamental total** — nenhuma correção de comportamento é permitida nesta migração (ver § Notas finais e `ambiguity_log.md` AMB-001…007).

1. **Ler `paradigm_decision.md` e internalizar**: o paradigma alvo é **funcional/declarativo React — sem mudança** (gap nenhum). Toda escolha de código deve honrar esse paradigma; **proibido** reescrever em OO/classes ou "modernizar" padrões.
2. **Ler `topology_decision.md` e internalizar**: a topologia escolhida é **híbrido (opção 3)**. Preservar `src/pages/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/utils/`; criar **`src/types/`** (novo) e refatorar `src/api/` para o contrato `Base44Client` (SDK real + mock sob interface única). Extrair helpers duplicados (ex.: `calculateAge`) para módulo tipado compartilhado sem mudar comportamento.
3. **Ler `screen_modernization_decision.md` e internalizar**: o modo de tradução de telas é **literal** — telas do alvo são as do legado convertidas a `.tsx` com os mesmos componentes shadcn/Radix, tokens, textos e estados. Zero mudança visual. Golden files opcionais (manifest com `present: false`); se capturar, comparar dentro das `normalizationRules`.
4. **Configurar**: manter a stack do `migration_brief.md` (TypeScript 5.8.2, React 18.2, Vite 6.1, Base44 SDK v0.8.43+ etc.). Script de typecheck: `tsc --noEmit`. Onda 1: setup TS + **remover dependências mortas** (Stripe, react-leaflet, jsPDF, html2canvas, lodash — confirmar com grep antes; RISK-006).
5. **Implementar bottom-up** na ordem das ondas da estratégia A (`migration_strategy.md`): (1) setup TS → (2) `src/types/` → (3) `src/api/` + `lib/` + hooks → (4) componentes → (5) pages por módulo (pacientes → consultas → agendamentos → médicos → templates → logs → dashboard) → (6) modo offline (`mockClient.ts`/`mockSeed.ts`) → (7) hardening strict 100% (`allowJs` removido, `tsc --noEmit` = 0).
6. **Implementar as telas** consumindo `target_screens.md` como contrato literal: converter cada tela com hierarquia/textos/tokens idênticos.
7. **Escrever os testes/specs** a partir de `parity_specs.md` e `parity_tests/*.feature` desde o início (26 arquivos). O projeto não tem framework de testes (brief não adiciona nesta migração): os `.feature` são **specs de paridade** — executar como smoke manual + gate `tsc --noEmit`; o codificador pode traduzir para framework se o usuário autorizar em fase futura.
8. **Para cada componente**, validar que respeita o paradigma (funcional) e a topologia híbrida — seções "Honra ao paradigma/topologia" em `target_architecture.md`.
9. **Para a migração de dados**: seguir `data_migration_plan.md` — **não há ETL/backfill/delta**; dados permanecem no BaaS; tipos espelham os schemas `base44/entities/*.jsonc`.
10. **Para o cutover**: seguir `cutover_plan.md` (merge da onda 7 + smoke online/offline; rollback via git revert < 5 min) e os critérios go/no-go.

## Itens referidos à codificação (destaque)
> Do `ambiguity_log.md` — itens que o codificador deve **conhecer**, sem corrigir nesta migração.

- **AMB-006 — XSS na interpolação de templates**: a função de interpolação (`PrescriptionEditor`) não escapa HTML no legado. **Preservar** o comportamento; documentar o risco no código/função tipada. Não adicionar escape nesta migração.
- **AMB-007 — F-01 RBAC / F-02 token em URL / F-03 IDOR**: tipar RBAC (`role`), parâmetros de URL (token) e escopo de dados (`created_by_id`) de forma que as falhas apareçam **em compile-time**. Exigências concretas: BR-MIGRAR-034/036, `target_architecture.md` AD-03, `parity_tests/10-contrato-base44-client.feature`. A **correção lógica** é fase posterior — não alterar lógica de permissões/token/IDOR nesta migração, apenas tipá-las.

## Itens auto-decididos (apenas se executado em --auto)
> Listar aqui itens cujo default foi aplicado sem confirmação humana. Recomenda-se revisar antes do cutover.

- Pipeline executado em **modo interativo** — nenhum item auto-decidido. Todas as decisões passaram por pausa humana.

## Notas finais

- **Regra de ouro do diff**: o diff de cada onda/PR deve ser **somente de tipos/conversão** (`jsx`→`tsx`, anotações, `src/types/`, contrato da API). Qualquer mudança de comportamento visível (critério de KPI, status automático, paginação nova, badge novo, escape HTML novo, textos alterados) viola a paridade 100% decidida e deve ser **recusada/revertida**.
- Comportamentos "congelados" por decisão humana (não corrigir): Taxa de Atendimento `94%` mock (AMB-001); divergência KPIs Consultas×Agendamentos (AMB-002); transição manual de status de agendamento (AMB-003); logs sem paginação até 500 (AMB-004); sem badge offline (AMB-005).
- Campos LGPD obrigatórios no tipo: `cpf` (sensível), `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip` — usar tipo condicional (BR-MIGRAR-004, `target_data_model.md`).
- Modo offline: `OFFLINE_USER` deve ser **variante discriminada sem `role`/`created_by_id`** — componentes que dependem de role não podem compilar cegos em offline (BR-MIGRAR-039).
- Sem framework de testes nesta migração; sem mudanças em `base44/entities/*.jsonc`; sem mudanças de infra/deploy.
- Este handoff assume a **Estratégia A** (incremental por camadas, 7 ondas). Trabalhar em PRs pequenos; o gate de cada onda é `tsc --noEmit` sem erros + smoke do módulo migrado.
