---
schemaVersion: 1
generatedAt: 2026-09-22T12:52:00-03:00
reversa:
  version: "1.3.2"
kind: parity_specs
producedBy: inspector
mode: literal
hash: "sha256:0dab46897e82d82b78ecaf13883b6a8b61d36ba6f7414765e11a74a22171fb67"
---

# Parity Specs

> Estratégia de validação de equivalência comportamental entre legado e sistema novo, adaptada ao paradigma escolhido em `paradigm_decision.md`.

> **Edição de 2026-09-22 (Inspector reexecutado).** Duas coisas mudaram desde a versão de 2026-09-09, e as duas estão refletidas abaixo: **(1)** o projeto passou a **ter suíte automatizada** — 132 verificações em 23 arquivos, com `typecheck`, `lint`, `prova:negativos` e `prova:encoding` como gates (construída pelas features forward `001` a `006`); **(2)** as **24 capturas douradas passaram a existir** (era 0 de 16), o que transforma a paridade visual de "validação manual até capturar" em **verificação construtiva contra golden**.

## Estratégia geral

- **Modos de validação aplicáveis** (marcar os usados):
  - [ ] Shadow mode (espelhamento de tráfego com comparação assíncrona) — não aplicável: sem runtime novo coexistente (Estratégia A incremental no mesmo repo; `migration_strategy.md`).
  - [x] Characterization tests (suíte derivada do comportamento atual do legado) — **primário**: cenários Gherkin derivados de `code-analysis.md`/`flowcharts` e das regras MIGRAR do Curator, **agora parcialmente traduzidos em prova executável** (as features forward 002 a 006 converteram 19 dos 34 cenários de fluxo).
  - [x] Contract tests (interfaces externas) — contrato `Base44Client` (SDK real × mock) e tipos contra schemas `base44/entities/*.jsonc`; provado em `parity_tests/10-contrato-base44-client.feature` + `src/api/__tests__/`.
  - [x] Data parity (snapshots e checksums) — limitado: paridade de **contrato de tipos** (`tsc --noEmit`) e de payloads entre SDK e mock; sem migração de dados (BaaS intocado).
  - [x] **Golden file comparison (telas)** — **novo em 2026-09-22**: 24 goldens capturados, `present: true` em 24 de 24, cobrindo os 16 cenários `PT-V01`…`PT-V16`. Ver §"Paridade visual".
  - [x] Outro: **type-level gate** — `tsc --noEmit` = 0 sobre `src/**` como métrica primária (brief), partindo do baseline de **677 erros / 43 arquivos** (medido em 2026-09-10); paridade visual **por construção** (mesma plataforma) **+ comparação construtiva contra golden**.

## Critérios de "paridade aceita"

- **Métrica primária**: `tsc --noEmit` retorna **0 erros** com `strict: true` e nenhum arquivo `.jsx`/`.js` de aplicação no programa; **suíte automatizada verde** — 132 verificações em 23 arquivos, 0 falhas (medido em 2026-09-22); `lint` 0 avisos; `prova:negativos` 9 de 9 sem resíduo; `prova:encoding` 412 arquivos íntegros; **zero** divergência funcional detectada nos characterization tests de fluxos críticos (45 BR-MIGRAR reproduzidos; nenhuma correção comportamental aplicada — AMB-001…006).
- **Honestidade da métrica**: a paridade funcional é hoje **parcialmente automatizada**. Do lado do comportamento, 19 dos 34 cenários de fluxo têm prova executável e os 15 restantes seguem transferidos a features próprias (§"Transferências"). Do lado dos tipos, o gate é total. Do lado **visual**, a verificação é **construtiva** (existe, mesma hierarquia, mesmos textos, mesmos tokens) e **não** pixel a pixel — ver `DEV-001`/`DEV-002`.
- **Janela de observação**: onda a onda (cada onda = verificação `typecheck` + smoke manual do módulo migrado) + janela pós-cutover de 3–5 dias úteis de uso real (`cutover_plan.md`).
- **Critério de bloqueio**: qualquer comportamento divergente no smoke/characterization (ex.: KPI com critério alterado; status com automação nova; paginação adicionada; badge novo) **bloqueia o merge/cutover** — a regra é "diff só de tipos", nenhuma correção de AMB-002/003/006 nem de BR-HUMANA-001…005. Desde 2026-09-22, **falha na suíte, no `typecheck` ou nos gates de prova também bloqueia**.

## Cobertura adaptada ao paradigma

> Esta seção muda conforme o paradigma alvo confirmado em `paradigm_decision.md`.

### Sem mudança de paradigma

- **Equivalência funcional padrão**: mesma entrada → mesma saída → mesmo efeito colateral observável. É a cobertura aplicada: paradigma inalterado (React funcional → React funcional + TS), gap nenhum (`paradigm_decision.md`).
- **Dimensão adicional própria desta migração (tipos)**: paridade não é só funcional — é também **de tipos**: campos LGPD obrigatórios, unions de status/estado, escopo `created_by_id`/`role` **exigido** pelos contratos internos (F-01/F-03). ⚠️ Atenção: exigir o campo no tipo **não detecta** a vulnerabilidade — o compilador valida forma, não autorização. Um componente que compilava com `any` e mudava de comportamento ao ser tipado é divergência.
- **Dimensão adicional de UI (modo literal)**: em plataforma idêntica, a cobertura de tela é **construtiva** — mesmo componente, mesmos textos literais, mesmos tokens, mesmos estados — e não re-expressão. Não há dimensão de contrato semântico de modernização porque nada foi modernizado.

## Tipos de teste a aplicar

- **Funcionais**: characterization via `.feature` (`parity_tests/`) — **já parcialmente executáveis** em Vitest + Testing Library, que o projeto passou a ter (`npm test`). Os cenários ainda sem prova seguem como spec Gherkin até a feature correspondente.
- **Contrato**: `Base44Client` — SDK real e mock devem satisfazer a mesma interface tipada (BR-MIGRAR-038); validado em compile-time **e** por prova em `src/api/__tests__/`.
- **Carga / performance**: guardrail de regressão do brief — bundle sem aumento > 5% vs baseline medido (JS 380.392 B gzip; CSS 12.968 B gzip) e build < 4 s (`tsc`/Vite); sem teste de carga de servidor (SPA, BaaS). O teto de tempo da suíte é 90 s — propriedade **condicional** ao estado da máquina (medido em 75,78 s e em 122,57 s na mesma suíte; ver `_reversa_forward/006-prova-logs-acesso/onboarding.md#7.1`).
- **Resiliência** (se aplicável): modo offline (`VITE_OFFLINE=true`) — comportamento do mock idêntico ao contrato (BR-MIGRAR-037…045); sem filas/externalidades.
- **Visual**: comparação construtiva contra golden (§ abaixo). Não há teste de pixel — ver lacuna declarada.

## Reuso de characterization_specs do time de descoberta

- **Origem**: `_reversa_sdd/characterization_specs/` **não existe** no projeto; fluxos foram derivados de `_reversa_sdd/code-analysis.md` (regras BR-* com linha de código), `_reversa_sdd/flowcharts/*.md`, `_reversa_sdd/database/business-rules.md` e dos requirements por unit.
- **Adaptações necessárias para o sistema novo**: os cenários Gherkin codificam o comportamento **atual** do legado (paridade exata), incluindo as decisões BR-HUMANA-001…005 (94% mock, KPIs divergentes, transição manual, sem paginação, sem badge). A tradução para prova executável começou pelas features 002–006; o que resta está em §"Transferências".

## Saídas

- `parity_tests/*.feature`: 10 arquivos de fluxo crítico (Gherkin).
- `parity_tests/screens/*.feature`: 16 arquivos `@paridade-visual`, um por tela, **todos agora ancorados em golden capturado**.

## Paridade visual (modo literal — mesma plataforma)

- **Estratégia**: as telas do alvo são os arquivos `.jsx` convertidos a `.tsx` com os mesmos componentes shadcn/Radix, tokens e textos (`screen_modernization_decision.md` — literal). A paridade visual é, em parte, **por construção** (mesmo runtime); a validação observável é: (1) mesma tela existe e renderiza (smoke), (2) textos/hierarquia/componentes idênticos (revisão de diff), (3) **comparação construtiva contra o golden capturado**.
- **Golden files**: `_reversa_sdd/screens/golden/manifest.yaml` lista **24 goldens, `present: true` em 24 de 24** — era "0 capturados" em 2026-09-09. Cobertura: **16 de 16 cenários** (`PT-V01`…`PT-V16`), mais 6 capturas de telas sem cenário V e 2 estados alternativos (V10 com arquivo anexado; V05 estado inicial).
- **O que a comparação É**: verificação de que a tela existe, com a mesma hierarquia de componentes, os mesmos textos literais, os mesmos tokens e os mesmos estados — ancorada em `target_screens.md` e nos `<unit>/screens.md`.
- **O que a comparação NÃO É**: comparação **pixel a pixel**. O conjunto de goldens é heterogêneo em viewport (5 larguras, 15 alturas, 6 páginas inteiras, 1 montagem com rolagem) e as `normalizationRules` do manifest não normalizam largura, altura nem recorte de página. Ver `DEV-001`/`DEV-002` e §"Lacunas declaradas".
- **Como executar**: hoje, por conferência humana lado a lado (imagem × tela do alvo) e pela revisão de diff do `.jsx` → `.tsx`. A execução **automatizada** exige um harness de navegador que o projeto **não tem** (só `vitest` + `jsdom` + testing-library) — ver §"Lacunas declaradas".
- **Exceções (deviations propagadas)**: `screen_deviation_log.md` registra **7 deviations, todas aprovadas, 0 pendentes**. Todas propagam para este artefato (tabela abaixo).

### Exceções — deviations aprovadas

| DEV | Tela / escopo | Tipo | O que a exceção significa para a paridade | Aprovação |
|---|---|---|---|---|
| `DEV-001` | Todas as 23 (+1) capturas | `tecnica` | **Pixel a pixel está fora de escopo.** O conjunto é heterogêneo em viewport; a paridade é construtiva/semântica | aprovado (2026-09-22) |
| `DEV-002` | Todas as capturas | `tecnica` | Golden em **PNG**, não em snapshot `.html`+`.css`; não há diff estrutural automatizado de markup | aprovado (2026-09-22) |
| `DEV-003` | Logs de Acesso (`PT-V13`) | `tecnica` | O golden vale como referência **estrutural** (colunas, selos, KPIs, ausência de paginação); o conteúdo das 254 linhas **não é contrato** | aprovado (2026-09-22) |
| `DEV-004` | Detalhe do Paciente (`PT-V14`) | `tecnica` | A timeline tem massa específica na captura; o golden cobre header, selos, card de informações, ações e conjunto de abas — não o conteúdo da timeline | aprovado (2026-09-22) |
| `DEV-005` | Novo Agendamento (`PT-V05`) | `tecnica` | A seção **"Data e Horário" é condicional ao médico selecionado**; o golden principal é o estado pós-seleção (12:47) e o estado inicial fica como alternativo | aprovado (2026-09-22, por evidência de código — `NewAppointment.tsx:204-237`) |
| `DEV-006` | Calendário de Agendamentos (`PT-V04`) | `tecnica` | Cores da legenda de status conforme a **captura** (Em Atendimento verde, Concluído cinza-esverdeado), prevalecendo sobre a descrição anterior da extração | aprovado (2026-09-22, regra do modo literal) |
| `DEV-007` | Modal de Template (`PT-V16`) | `tecnica` | O golden do V16 é o modal de **edição** (único completo); a captura de criação é parcial | aprovado (2026-09-22) |

> As deviations `pendentes` bloqueariam o handoff; não há nenhuma. As demais decisões humanas do pipeline (AMB-001…005, todas por paridade exata) **não** são exceções de paridade visual e seguem registradas em `ambiguity_log.md`.

## Transferências — cenários de fluxo ainda sem prova

Saldo após a feature `006-prova-logs-acesso`: dos 50 cenários transferidos pela feature `002`, **19 concluídos** (Agendamentos 8, Consultas 3, emissão de documento 4, trilha de auditoria 4) e **15 transferidos** a features próprias:

| Grupo | Cenários | Destino |
|---|---:|---|
| Modo offline (`09`) | 6 | Feature a criar — conversão dos cenários de fluxo do modo offline |
| Dashboard (`08`) | 5 | Feature a criar — depende de resolver a lacuna da Taxa de Atendimento |
| Contrato de dados (`10`) | 4 | Feature a criar — contrato único honrado pelos dois modos |

> ⚠️ **Defasagem registrada**: `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` ainda declara os 16 cenários de **paridade visual** como "lacuna declarada, a captura dourada não existe". Isso **deixou de ser verdade em 2026-09-22**. O Inspector não edita artefatos da extração — a correção dessa linha é da próxima feature forward ou do próximo `/reversa-sync`.

## Lacunas declaradas

1. **Harness de paridade visual inexistente**: não há Playwright, Puppeteer nem biblioteca de diff de imagem no projeto. Instalar e escrever o harness é **feature forward**, não spec. Só depois disso os 16 cenários de tela deixam de ser conferência humana.
2. **Pixel a pixel exige recaptura padronizada**: viewport fixo e recorte de viewport (não página inteira). Oferecido e recusado em 2026-09-22 (`DEV-001`).
3. **Recapturas recomendadas** (não bloqueiam): `logs-acesso.png` (15029 px de altura), `modal-detalhe-agendamento.png` (montagem com rolagem) e `templates-novo.png` (truncada antes dos toggles).
4. **`characterization_specs/` ausente**: sem suíte herdada do time de descoberta; os cenários foram derivados de análise de código.
5. **RLS e comportamento de servidor não são prováveis no cliente**: entram como **declaração**, não como prova (regra aplicada pelos `PT-007.2` e `PT-007.4`).

## Notas

- Como não há mudança de paradigma nem troca de plataforma, **não** há dimensões de paridade de evento/ordem/idempotência nem contrato semântico de modernização de telas.
- Fluxos críticos cobertos em `.feature`: (1) cadastro de paciente com LGPD, (2) seleção de paciente ativo, (3) criação de agendamento validando jornada do médico, (4) ciclo de status manual do agendamento, (5) máquina de estados da consulta, (6) emissão de documento com interpolação de template (medicamentos só em receita), (7) auditoria de acesso (append-only), (8) KPIs do dashboard com critérios do legado (94% mock; divergência Consultas×Agendamentos preservada), (9) modo offline com usuário demo, (10) contrato Base44Client SDK×mock.
- **Histórico**: 2026-09-09 — emissão original, com 0 goldens e paridade visual declarada manual. 2026-09-22 — reexecução do Inspector após a regeneração da Fase 2 do Screen Translator (24 goldens) e após as features forward 002–006 terem construído a suíte automatizada (132 verificações).

---
*Gerado pelo Reversa-Inspector em 2026-09-09; reexecutado em 2026-09-22.*
