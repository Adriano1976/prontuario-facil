---
schemaVersion: 1
generatedAt: 2026-09-22T12:55:00-03:00
reversa:
  version: "1.3.2"
kind: handoff
producedBy: orchestrator
hash: "sha256:3f77bd58d493ef4bfebb5c343af278c309c20a09cb6828e02b555a16c19d5f38"
---

# Handoff para o Agente de Codificação

> Este documento é a porta de entrada para o agente de codificação (Claude Code, Codex, Cursor, Antigravity, etc.) que vai escrever o sistema novo a partir das specs.

> ⚠️ **Leitura de contexto desta edição (2026-09-22).** Diferente do handoff original de 2026-09-09, **a conversão de tipos já foi executada**: as features forward `001-migracao-typescript` (JS→TS completo, 46 ações) e `002` a `006` (prova automatizada por módulo) fecharam o ciclo. O que este documento entrega agora é o **estado real da paridade**: o que já está provado por execução, o que ainda é conferência humana, e as lacunas que sobraram. Onde o template fala em "criar o repositório novo", leia "o repositório é o mesmo; a migração é de tipos sobre a mesma stack" (`migration_strategy.md`, Estratégia A).

## ⚠️ Leitura obrigatória primeiro

1. **`paradigm_decision.md`**, leitura inegociável. O paradigma alvo molda como toda a codificação deve acontecer. **Neste projeto: gap nenhum** — React funcional → React funcional + TypeScript. Nenhuma transformação paradigmática deve ser aplicada.
2. **`topology_decision.md`**, leitura inegociável. A topologia escolhida define a árvore de pastas e a fronteira entre módulos.
3. **`screen_modernization_decision.md`**, leitura inegociável (o legado tem UI). **Modo: literal na mesma plataforma** — as telas do alvo são os `.jsx` convertidos a `.tsx`, sem re-expressão visual.

## Ordem de leitura recomendada

1. `paradigm_decision.md` (obrigatório, primeiro)
2. `topology_decision.md` (obrigatório, segundo)
3. `screen_modernization_decision.md` (obrigatório — há UI)
4. `migration_brief.md`
5. `target_business_rules.md`
6. `migration_strategy.md`
7. `target_architecture.md`
8. `target_domain_model.md`
9. `target_data_model.md`
10. `data_migration_plan.md`
11. `target_screens.md` (21 telas, cada uma com linha **Golden**)
12. `parity_specs.md` + `parity_tests/` (26 cenários)
13. `screen_deviation_log.md` (7 deviations, todas aprovadas)
14. `risk_register.md` + `cutover_plan.md`
15. `discard_log.md` (consultivo)
16. `ambiguity_log.md` (consultivo — 0 pendentes)

## Lista de artefatos produzidos

| Artefato | Produzido por | Status |
|---|---|---|
| migration_brief.md | orchestrator | criado |
| paradigm_decision.md | paradigm_advisor | criado |
| target_business_rules.md | curator | criado |
| discard_log.md | curator | criado |
| migration_strategy.md | strategist | criado |
| risk_register.md | strategist | criado |
| cutover_plan.md | strategist | criado |
| topology_decision.md | designer (Fase 1) | criado |
| target_architecture.md | designer | criado |
| target_domain_model.md | designer | criado |
| target_data_model.md | designer | criado |
| data_migration_plan.md | designer | criado |
| screen_modernization_decision.md | screen_translator (Fase 1) | criado — modo **literal** |
| target_screens.md | screen_translator | **regenerado em 2026-09-22** — 21 telas, 24 goldens |
| screen_deviation_log.md | screen_translator | **7 deviations** (6 técnicas do conjunto + 1 de seção condicional), todas aprovadas |
| _reversa_sdd/screens/inventory.json | screen_translator | **21 telas** (era 16) |
| _reversa_sdd/screens/golden/ | screen_translator | **24 goldens, `present: true` em 24 de 24** (era 0) |
| parity_specs.md | inspector | **reexecutado em 2026-09-22** — exceções propagadas |
| parity_tests/*.feature | inspector | **26 arquivos** — 10 de fluxo + 16 de tela |
| ambiguity_log.md | orchestrator | consolidado — 0 pendentes |

## Bloqueadores para começar a implementação

- **Nenhum.** O gate de deviations foi fechado com 0 pendentes: `DEV-005` (a seção "Data e Horário" do Novo Agendamento) foi resolvido por **evidência de código** — a seção existe e é **condicional ao médico selecionado** (`src/pages/NewAppointment.tsx:204-237`). Nada a decidir antes de codificar.

## Próximos passos para o agente de codificação

> Ordem sugerida para o que **resta** — a conversão de tipos já está feita e provada.

1. **Internalizar o paradigma**: sem mudança. Se qualquer sugestão de reescrita em estilo diferente do React funcional aparecer, **recuse** (`paradigm_decision.md`).
2. **Internalizar a topologia**: híbrida, preservando os módulos (`topology_decision.md`).
3. **Internalizar o modo de telas**: **literal**. Materialize o que está em `target_screens.md` preservando hierarquia, textos literais e tokens. O calendário do Novo Agendamento exibe rótulos **em inglês** ("September 2026", "Su Mo Tu We Th Fr Sa") — isso é do legado, **preserve**.
4. **Implementar a seção condicional do Novo Agendamento**: "Data e Horário" só renderiza com `doctor_id`, e os horários só após a data — não transforme em campo sempre visível (`DEV-005`).
5. **Provar os 15 cenários de fluxo que faltam**, um grupo por feature forward: **modo offline (6)**, **Dashboard (5)**, **contrato de dados (4)**. A matriz declara o destino de cada grupo.
6. **Construir o harness de paridade visual** — é a maior lacuna aberta. O projeto tem `vitest` + `jsdom` e **não tem** Playwright/Puppeteer/diff de imagem. Sem ele, os 16 cenários `PT-V01`…`PT-V16` permanecem **conferência humana** contra os goldens (`parity_specs.md#Lacunas declaradas`).
7. **Se quiser pixel a pixel**, antes exija **recaptura padronizada** (viewport fixo, recorte de viewport, não página inteira) — oferecida e recusada em 2026-09-22, registrada em `DEV-001`.
8. **Corrigir a linha defasada da matriz**: `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` ainda diz que a captura dourada não existe. Deixou de ser verdade em 2026-09-22. O Inspector não edita artefatos da extração — a correção é da próxima feature forward ou do próximo `/reversa-sync`.
9. **Para o cutover**, seguir `cutover_plan.md` e os critérios go/no-go.

## Itens auto-decididos (apenas se executado em --auto)

- Pipeline executado em **modo interativo**, nenhum item auto-decidido. As decisões de 2026-09-22 (política de golden, capturas extras, invalidação do Inspector, recaptura do V05) foram todas humanas e estão registradas em `ambiguity_log.md#Revisão 2026-09-22`.

## Notas finais

- **O que está provado hoje**: `tsc --noEmit` 0 erros · suíte com **132 verificações em 23 arquivos**, 0 falhas · `lint` 0 avisos · `prova:negativos` 9 de 9 sem resíduo · `prova:encoding` 412 arquivos íntegros · **19 dos 34 cenários de fluxo** convertidos em prova executável (features 002–006) · **16 de 16 cenários de tela** com golden capturado.
- **O que ainda é conferência humana**: os 15 cenários de fluxo transferidos, os 16 cenários de tela (enquanto não houver harness) e a paridade **pixel a pixel**, que está declarada fora de escopo.
- **O teto de 90 s da suíte é condicional**: medido em 75,78 s e em 122,57 s na mesma suíte, dependendo da carga da máquina. O maior contribuinte individual é `PatientForm.test.tsx` (13,11 s), pré-existente e alheio às features de prova.
- **As capturas originais** em `_reversa_sdd/<unit>/screenshots/` (24 arquivos, incluindo o estado pós-seleção do V05) **não foram movidas nem alteradas**; os goldens em `screens/golden/` são cópias com nomes canônicos e `sha256` registrado por arquivo no manifest.

---
*Gerado pelo Reversa-Orchestrator em 2026-09-09; regenerado em 2026-09-22 após a Fase 2 do Screen Translator e a reexecução do Inspector.*
