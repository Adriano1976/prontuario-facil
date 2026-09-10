---
schemaVersion: 1
generatedAt: 2026-09-09T15:55:00-03:00
reversa:
  version: "1.3.2"
kind: parity_specs
producedBy: inspector
hash: "sha256:74a75344c41a5dd285c3c6cd8e0a22966da0578b2bca3204c7c2dde2a2ca6e56"
---

# Parity Specs

> Estratégia de validação de equivalência comportamental entre legado e sistema novo, adaptada ao paradigma escolhido em `paradigm_decision.md`.

## Estratégia geral
- **Modos de validação aplicáveis** (marcar os usados):
  - [ ] Shadow mode (espelhamento de tráfego com comparação assíncrona) — não aplicável: sem runtime novo coexistente (Estratégia A incremental no mesmo repo; `migration_strategy.md`).
  - [x] Characterization tests (suíte derivada do comportamento atual do legado) — primário: cenários Gherkin derivados de `code-analysis.md`/`flowcharts` e das regras MIGRAR do Curator.
  - [x] Contract tests (interfaces externas) — contrato `Base44Client` (SDK real × mock) e tipos contra schemas `base44/entities/*.jsonc`.
  - [x] Data parity (snapshots e checksums) — limitado: paridade de **contrato de tipos** (`tsc --noEmit`) e de payloads entre SDK e mock; sem migração de dados (BaaS intocado).
  - [x] Outro: **type-level gate** — `tsc --noEmit` = 0 sobre `src/**` como métrica primária (brief), partindo do baseline de **677 erros / 43 arquivos** (medido em 2026-09-10); **paridade visual por construção** em modo literal (mesma plataforma) + golden manual quando capturado.

## Critérios de "paridade aceita"
- **Métrica primária**: `tsc --noEmit` retorna **0 erros** com `strict: true` e 100% dos **87 arquivos `.js/.jsx` de `src/`** em `.ts`/`.tsx` (gate de aceite do brief; configs de raiz fora do gate); **zero** divergência funcional detectada nos characterization tests de fluxos críticos (45 BR-MIGRAR reproduzidos; nenhuma correção comportamental aplicada — AMB-001…006).
- **Honestidade da métrica**: como o projeto não tem framework de testes, a paridade funcional **não é "100% comprovada"** — ela é atestada por **checklist de smoke manual repetível** derivado dos 26 `parity_tests/*.feature`. Só o gate de tipos é automatizável hoje.
- **Janela de observação**: onda a onda (cada onda = verificação `typecheck` + smoke manual do módulo migrado) + janela pós-cutover de 3–5 dias úteis de uso real (`cutover_plan.md`).
- **Critério de bloqueio**: qualquer comportamento divergente no smoke/characterization (ex.: KPI com critério alterado; status com automação nova; paginação adicionada; badge novo) **bloqueia o merge/cutover** — a regra é "diff só de tipos", nenhuma correção de AMB-002/003/006 nem de BR-HUMANA-001…005.

## Cobertura adaptada ao paradigma

> Esta seção muda conforme o paradigma alvo confirmado em `paradigm_decision.md`.

### Sem mudança de paradigma
- **Equivalência funcional padrão**: mesma entrada → mesma saída → mesmo efeito colateral observável. É a cobertura aplicada: paradigma inalterado (React funcional → React funcional + TS), gap nenhum (`paradigm_decision.md`).
- **Dimensão adicional própria desta migração (tipos)**: paridade não é só funcional — é também **de tipos**: campos LGPD obrigatórios, unions de status/estado, escopo `created_by_id`/`role` **exigido** pelos contratos internos (F-01/F-03). ⚠️ Atenção: exigir o campo no tipo **não detecta** a vulnerabilidade — o compilador valida forma, não autorização. Um componente que compilava com `any` e mudava de comportamento ao ser tipado é divergência.

## Tipos de teste a aplicar
- **Funcionais**: characterization via `.feature` (parity_tests/) — a serem traduzidos pelo agente de codificação para Vitest/Testing Library ou ferramenta equivalente. Projeto não tem framework de testes (brief exclui adicioná-lo nesta migração) → cenários ficam como specs Gherkin; smoke manual é a execução imediata.
- **Contrato**: `Base44Client` — SDK real e mock devem satisfazer a mesma interface tipada (BR-MIGRAR-038); validação em compile-time + revisão.
- **Carga / performance**: guardrail de regressão do brief — bundle sem aumento > 5% vs baseline medido (JS 380.392 B gzip; CSS 12.968 B gzip) e build < 4 s (`tsc`/Vite); sem teste de carga de servidor (SPA, BaaS). O alvo absoluto anterior (bundle < 185 KB) foi removido por não definir a medida e ser inalcançável.
- **Resiliência** (se aplicável): modo offline (`VITE_OFFLINE=true`) — comportamento do mock idêntico ao contrato (BR-MIGRAR-037…045); sem filas/externalidades.

## Reuso de characterization_specs do time de descoberta
- **Origem**: `_reversa_sdd/characterization_specs/` **não existe** no projeto; fluxos foram derivados de `_reversa_sdd/code-analysis.md` (regras BR-* com linha de código), `_reversa_sdd/flowcharts/*.md`, `_reversa_sdd/database/business-rules.md` e dos requirements por unit.
- **Adaptações necessárias para o sistema novo**: os cenários Gherkin abaixo codificam o comportamento **atual** do legado (paridade exata), incluindo as decisões BR-HUMANA-001…005 (94% mock, KPIs divergentes, transição manual, sem paginação, sem badge). O agente de codificação traduz para testes executáveis **se** framework for adicionado em fase futura; hoje a execução é via smoke manual + `tsc`.

## Saídas
- `parity_tests/*.feature`: cenários em Gherkin para os fluxos críticos (lista abaixo).
- `parity_tests/screens/*.feature`: cenários `@paridade-visual` por tela (modo literal).

## Paridade visual (modo literal — mesma plataforma)
- **Estratégia**: as telas do alvo são os arquivos `.jsx` convertidos a `.tsx` com os mesmos componentes shadcn/Radix, tokens e textos (`screen_modernization_decision.md` — literal). A paridade visual é **por construção** (mesmo runtime); a validação observável é: (1) mesma tela existe e renderiza (smoke), (2) textos/hierarquia/componentes idênticos (revisão de diff), (3) comparação com golden screenshots quando capturados.
- **Golden files**: `_reversa_sdd/screens/golden/manifest.yaml` lista 13 telas + 1 não-determinística com `present: false` — **nenhum golden capturado**. Cenários `@paridade-visual` são emitidos, mas a validação é **manual** (captura opcional pré-merge, conforme manifest) até a captura ser executada.
- **Exceções (deviations propagadas)**: `screen_deviation_log.md` registra **0 deviations** — nenhuma exceção a propagar. (AMB-006 XSS e as não conformidades F-01/F-02/F-03 — fonte: `docs/security-audit/achados.json` — são alertas referidos à codificação, não exceções de paridade visual.)

## Notas
- Como não há mudança de paradigma nem troca de plataforma, **não** há dimensões de paridade de evento/ordem/idempotência nem contrato semântico de modernização de telas.
- Fluxos críticos cobertos em `.feature`: (1) cadastro de paciente com LGPD, (2) seleção de paciente ativo, (3) criação de agendamento validando jornada do médico, (4) ciclo de status manual do agendamento, (5) máquina de estados da consulta, (6) emissão de documento com interpolação de template (medicamentos só em receita), (7) auditoria de acesso (append-only), (8) KPIs do dashboard com critérios do legado (94% mock; divergência Consultas×Agendamentos preservada), (9) modo offline com usuário demo, (10) contrato Base44Client SDK×mock.
