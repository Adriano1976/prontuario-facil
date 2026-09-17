# Cross-Check: Migração de JavaScript para TypeScript

> Feature: `001-migracao-typescript`
> Data da auditoria: `2026-09-17`
> Revisão 5: `2026-09-17` — auditoria completa e independente, refeita **depois** de todo o
> Apêndice A da revisão 4 ter sido aplicado e dos 19 achados daquela revisão estarem
> fechados. Nada do relatório anterior foi presumido: cobertura, contagens, gate, enums e
> grafo de dependências foram re-medidos nesta rodada.
>
> **Numeração de IDs:** esta revisão **continua** a série (A020+), em vez de reiniciar em
> A001, porque os artefatos já citam os IDs da revisão 4 (`A003`, `A005`, `A009`,
> `A012/A013` em `actions.md`, `requirements.md`, `onboarding.md`, `legacy-impact.md` e
> `progress.jsonl`). A seção 6 preserva o **mapa da revisão 4 (A001–A019)** para que essas
> citações continuem resolvendo. O relatório da revisão 4 está no histórico do Git
> (`0b65f4d` para a revisão 1, `c7661a5` para o estado aplicado).
>
> Artefatos analisados:
> - `_reversa_forward/001-migracao-typescript/requirements.md`
> - `_reversa_forward/001-migracao-typescript/roadmap.md`
> - `_reversa_forward/001-migracao-typescript/actions.md`
>
> Referências cruzadas usadas na conferência: `data-delta.md`, `interfaces/` (3 fichas),
> `investigation.md`, `onboarding.md`, `questions.md`, `progress.jsonl`,
> `regression-watch.md`, `legacy-impact.md`, `_reversa_sdd/addenda/001-migracao-typescript.md`,
> `_reversa_sdd/domain.md`, `_reversa_sdd/state-machines.md`,
> `_reversa_sdd/migration/parity_tests/` (26 arquivos de cenário),
> `_reversa_sdd/migration/migration_brief.md`, `_reversa_sdd/migration/handoff.md` e o
> próprio código-fonte.
>
> Ganchos: `before-audit` e `after-audit` estão vazios em `.reversa/hooks.yml` — nada a executar.
>
> **Nenhum dos três artefatos foi alterado por esta auditoria.** A única escrita desta
> revisão é este arquivo.

## 1. Resumo

| Severidade | Ocorrências |
|------------|-------------|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 0 |
| LOW | 2 |
| **Total** | **3** |

Leitura do conjunto: os 19 achados da revisão 4 estão **fechados e conferidos por
medição** — inclusive os dois que exigiam trabalho de código (`A009`, conversão do ponto de
entrada; `A012`/`A013`, as duas verificações negativas). O que resta é de outra natureza:
uma decisão de configuração que ficou **sem registro no roadmap** e cujo efeito colateral é
um furo latente na promessa de "exclusão única" de RF-09 (A020), e duas imprecisões de
número no `roadmap.md` que sobreviveram à aplicação do Apêndice A (A021, A022). Nenhum
conflito com regra 🟢 do legado foi encontrado; por isso não há CRITICAL.

## 2. Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A020 | HIGH | Cobertura / Consistência | `tsconfig.json` mantém `allowJs: true` com `checkJs: false`, mas **nenhum arquivo `.js`/`.jsx` entra mais no programa** (medido: 0 em 77 arquivos de `src/`), de modo que as duas opções são inertes. A decisão de mantê-las (3A1, da revisão 4) não existe como decisão do roadmap — está apenas em `requirements.md` §9, na seção 6.1 de um relatório de auditoria e em `progress.jsonl`. Consequência mecânica: um `.js`/`.jsx` novo fora de `ui/` entraria no programa **sem verificação** e o gate continuaria verde — exatamente a classe de exceção silenciosa que `A009` mandou fechar. O `handoff.md` (Onda 7) previa remover `allowJs` no endurecimento final, e essa intenção foi abandonada sem registro | `tsconfig.json` (linhas 22-23) × `requirements.md` RF-09 (linha 99) e §9 (linhas 230-234) × `roadmap.md` §3 (D-01 a D-12, nenhuma menciona `allowJs`) × `_reversa_sdd/migration/handoff.md` |
| A021 | LOW | Consistência | `roadmap.md` §8 fecha com "Estado em 2026-09-15: 44 de 44 ações `[X]`" enquanto o `actions.md` define **46** ações e declara as 46 concluídas. A linha é datada, então **não é contradição** — é o retrato daquele dia, e o `actions.md` registra a mesma data no histórico. Falta apenas o estado posterior, e quem lê só o roadmap sai com o número antigo | `roadmap.md` §8 (linha 123) × `actions.md` §Resumo (linha 11), cabeçalho (linha 15) e histórico (linhas 122-123) |
| A022 | LOW | Consistência | A linha "Demais `src/` (~87 arquivos) — conversão de linguagem" reproduz a lista de alvos do brief de migração, que **inclui os 49 `.jsx` de `src/components/ui/`** que D-01 exclui e que permaneceram intocados. O número, portanto, não descreve o delta: medido hoje, a conversão alcançou os 77 arquivos do programa (58 de aplicação + 19 declarações) e 0 `.jsx` de aplicação restou. Depois das quatro linhas acrescentadas em §5 na revisão anterior, a linha ficou como um resíduo agregado que confunde mais do que informa | `roadmap.md` §5 (linha 83) × `_reversa_sdd/migration/migration_brief.md` (linha 93) × `tsconfig.json` (linha 31) × medição de disco (49 `.jsx` em `ui/`, 0 fora) |

## 3. Findings HIGH — impacto e direção de correção

### A020 — Configuração inerte e decisão sem registro tornam a "exclusão única" de RF-09 não fiscalizada

RF-09 promete verificação estrita de todo o código-fonte com **uma única** exclusão — o corpo
`.jsx` da pasta herdada — e o critério de pronto do roadmap repete a promessa. Hoje isso é
verdade por medição: `tsc --listFiles` lista 77 arquivos sob `src/` (58 de aplicação + 19
declarações `*.d.ts`), com **zero** `.js`/`.jsx`. O problema não é o presente, é o que a
configuração permite amanhã:

- `allowJs: true` com `checkJs: false` significa que um `.js`/`.jsx` novo sob `src/` entra no
  programa e **não** é verificado. O gate continuaria retornando 0 e nenhum artefato
  precisaria mudar — a segunda exceção voltaria sem deixar rastro, que foi o achado `A009`
  da revisão 4.
- A decisão de manter as duas opções foi tomada (3A1) e citada em `requirements.md` §9, mas
  **não** virou decisão do roadmap: nem `D-01` nem nenhuma outra a registra. Pela mesma régua
  com que a revisão 4 classificou `A006` como HIGH ("congelamento sem decisão correspondente
  no roadmap"), este achado é HIGH — não pela gravidade imediata, que é baixa, mas pela
  rastreabilidade de uma escolha que hoje só existe em documento de auditoria e log de
  execução. O `handoff.md` da extração previa remover `allowJs` no endurecimento final, e a
  intenção foi abandonada em silêncio.

Direção de correção (a escolha é humana; esta auditoria não aplica nada):

1. Registrar a decisão no `roadmap.md` — uma decisão nova (D-13), com justificativa e
   confidência — dizendo se `allowJs`/`checkJs` permanecem e por quê, ou
2. desligar `allowJs` agora. **Medição desta auditoria, sem gravar nada:** executado
   `tsc -p tsconfig.json --noEmit --allowJs false --listFiles`, o programa continua com os
   mesmos 77 arquivos e o gate continua com **0 erros** (saída 0). A sonda é confiável porque
   opções de linha de comando são de fato aplicadas junto de `-p` — confirmado com uma opção
   inexistente, que produz `TS5023`.
3. Em qualquer dos casos, `requirements.md` §9 deixa de precisar citar IDs internos da seção
   6.1 de um relatório de auditoria, que é um ponteiro frágil (relatórios são reescritos).

Aplicação sugerida: `/reversa-plan` (decisão D-13) ou edição manual do `roadmap.md`; a
alteração do `tsconfig.json`, se for a via 2, é edição humana de uma linha.

## 4. Verificações que passaram

### Cobertura

- **Requisitos → planejamento:** os 13 requisitos funcionais existem (RF-01 a RF-13) e todos
  aparecem no `roadmap.md`; a seção 3.1 (criada na revisão anterior) mapeia cada RF para
  decisão/etapa, e o mapa confere com o `actions.md`: RF-09 → D-01/T005/T042/T043, RF-10 →
  D-01, RF-12 → D-08/T040, RF-13 → fora de escopo (D-09). Zero identificador fantasma:
  os 27 IDs de ação citados no roadmap existem no actions; os 13 RF citados existem no
  requirements; D-01 a D-12 estão todos definidos.
- **Decisões → materialização:** D-01 a D-11 têm ação correspondente (D-11 → T016, D-08 →
  T040, D-05 → T039, D-04 → T018, D-02 → T020/T036, D-03 → T019/T033/T034, D-07 → T044) ou
  são deliberadamente sem ação (D-09 fora de escopo, D-10 apenas documentado). D-12 é
  congelamento deliberado e não pede ação — a ausência de ação é o próprio conteúdo da decisão.
- **Cenários Gherkin:** os 12 cenários de `requirements.md` §7 têm cobertura rastreável —
  verificação integral → T042/T043; nome de campo inexistente → **T045**; status fora do
  conjunto → T032; consentimento incompleto → T031; leitura sem escopo → T033; escopo
  informado → T035; contrato único nos dois modos → T039; usuário offline sem papel → T016;
  entidade inexistente com sugestão → T036 + **T046**; verificação isolada sem emissão →
  T002; comportamento preservado → T021-T030/T041; paridade manual → T044. Os dois cenários
  que a revisão 4 apontou como sem cobertura (`A012`, `A013`) agora têm ação `[X]` e
  evidência em `progress.jsonl`.
- **Contratos em `interfaces/`:** as três fichas citadas no roadmap §7 existem em disco
  (`app-data-client.md`, `base44-sdk.md`, `mock-local-storage.md`).

### Consistência

- **Cobertura do gate, medida:** `tsc -p tsconfig.json --noEmit` termina com código 0 e
  `--listFiles` lista **77 arquivos** sob `src/`, sendo **19** `src/components/ui/*.d.ts` —
  exatamente o que RF-09, o critério de §10 do roadmap e `onboarding.md` §4.2 declaram
  (58 de aplicação + 19 declarações). Em disco há 48 `.ts` + 29 `.tsx` = 77, e **0** `.jsx`
  de aplicação; os 49 `.jsx` de `ui/` continuam lá, intocados. Nenhum `.js`/`.jsx` entra no
  programa (0 de 77).
- **Evidência de paridade, medida:** `_reversa_sdd/migration/parity_tests/` tem **26 arquivos**
  (10 de fluxo + 16 de tela) com **55 cenários** (39 de fluxo + 16 de tela). É o número que
  `requirements.md` (NFR Paridade, §6.1 e §9), `roadmap.md` (D-07 e §9), `investigation.md` §5
  e `onboarding.md` §4 registram depois da correção de `A011`.
- **Terminologia:** estáveis entre os três artefatos os termos "verificação/gate de tipos",
  "escopo de leitura", "registro fechado de entidades", "consentimento" e "dados de exemplo
  do modo offline".
- **RF-10 confere com o disco:** `src/components/medical` tem 9 arquivos (8 `.tsx` +
  `AccessLogger.ts`) e `src/components/appointments` tem 2 `.tsx`; nenhum `.jsx` em nenhum dos
  dois. A redação estreitada de RF-10 corresponde ao que existe.
- **Enums do código batem com as regras:** `ConsultationStatus` =
  `agendada | em_andamento | concluida | cancelada` (RN-02) e `AppointmentStatus` =
  `agendado | confirmado | em_atendimento | concluido | cancelado | faltou` (RN-03).
- **Contagens internas:** `src/types/AccessLog.ts` traz as 12 ações auditadas de T015;
  `src/types/Template.ts`, os 7 tipos de T014; o registro fechado tem 9 chaves (8 entidades de
  domínio + `User`), como D-02 passou a declarar.
- **Pendências de `requirements.md` §10:** as duas pendências transferidas
  (`{DIAS_AFASTAMENTO}` e as 14 dependências não utilizadas) conferem com `questions.md`
  DIV-05 e com `RISK-006` do handoff, e são coerentes com o RF-13 retirado do escopo.
- **Nada obsoleto sobre o ponto de entrada:** a busca por `main.jsx` nos três artefatos
  retorna zero; a única menção a `main` é o "ponto de entrada da camada de tipos" de T017.

### Coerência com o legado

- Nenhuma decisão do roadmap contradiz regra 🟢 do `_reversa_sdd/domain.md`. A única inversão
  de confiança conhecida — BR-A02, 🟡 e contrária à transição manual — está declarada em RN-03
  e congelada em D-12; BR-S02 sustenta D-03; BR-P02 e BR-T01 sustentam os conjuntos fechados.
- Os conjuntos de status de Consulta e de Agendamento conferem com `state-machines.md`, e o
  código confere com eles (medido acima).
- O delta é real e versionado: o histórico do Git mostra o crescimento de `.ts`/`.tsx` sob
  `src/` (45 → 77 ao longo da conversão) e o número de `.jsx` em `ui/` constante em 49 em
  todos os commits, inclusive antes da migração.
- A promessa de RF-09 tem hoje exatamente uma exclusão registrada — o corpo `.jsx` da pasta
  herdada — que é o que o `tsconfig.json` declara (`exclude: node_modules, dist,
  src/components/ui`). O que falta é a proteção *mecânica* dessa promessa (A020), não a
  conformidade atual.
- O `requirements.md` mantém a correção de premissa sobre o ponto de partida (1.324 erros em
  81 arquivos, não 677 em 43), coerente com `roadmap.md` §1 e `investigation.md` §2.

### Sanidade do actions

- **46** ações, **17** marcadas `[//]`, **0** pendentes (todas `[X]`).
- Toda dependência aponta para ID existente e para um ID **anterior** ao próprio (verificado
  ação por ação: 0 violações) — logo, não há ciclo de dependência possível.
- Nenhum par de ações `[//]` compartilha arquivo alvo (verificado par a par sobre os alvos
  normalizados: 0 conflitos), inclusive depois dos alvos corrigidos de T021 e T041.
- `progress.jsonl`: 69 linhas, todas com JSON válido (verificado por parse linha a linha).

## 5. Nota de método

- Auditoria estritamente leitora. As medições foram feitas com: contagem e listagem de
  arquivos em disco; `tsc -p tsconfig.json --noEmit` e `--listFiles` (sem emissão);
  `tsc ... --allowJs false` e `--checkJs true` **somente como sonda de linha de comando**
  (nenhum arquivo de configuração foi tocado), com verificação de que as opções de CLI são
  aplicadas junto de `-p`; `git ls-tree`/`git log` para o estado versionado; contagem de
  cenários por arquivo `.feature`; e o parse das tabelas de `actions.md` para checar
  dependências, paralelismo e status.
- A única escrita desta auditoria é este arquivo, `audit/cross-check.md`, gravado por
  reescrita completa (revisão 5), conforme o skill.
- Os IDs `A001`–`A019` pertencem às revisões anteriores e não foram reutilizados; os IDs
  desta revisão começam em `A020`.

## 6. Mapa da revisão 4 (A001–A019) — para as citações existentes continuarem resolvendo

| ID (rev. 4) | Assunto | Estado em 2026-09-17 |
|-------------|---------|----------------------|
| A001 | Roadmap defasado em relação à entrega | **resolvido** — `roadmap.md` §8 e §10 |
| A002 | T005 marcada `[X]` sem o entregável exigido | **resolvido** — RF-09, §9, T005, D-01 |
| A003 | Evidência de cobertura declarava 58 em vez de 77 | **resolvido** — RF-09, `onboarding.md` §4.2 |
| A004 | Módulos e declarações novos fora do roadmap | **resolvido** — `roadmap.md` §5 |
| A005 | RF-10 sem cobertura e em conflito com RF-09/D-01 | **resolvido** — RF-10, §8, `roadmap.md` §3.1 |
| A006 | RN-03 elevava a 🟢 regra que o legado marca como inferida | **resolvido** — RN-03, D-12 |
| A007 | "Nenhuma lacuna em aberto" com lacuna registrada fora do documento | **resolvido** — `requirements.md` §10 |
| A008 | Ficha do armazenamento offline contradizia o comportamento entregue | **resolvido** — `interfaces/mock-local-storage.md` |
| A009 | `src/main.jsx` era a segunda exceção não registrada | **resolvido** — `src/main.tsx` + `index.html` (commit `b93e208`); ver A020 para o resíduo de configuração |
| A010 | Registro com 9 chaves descrito como 8 | **resolvido** — D-02 e `interfaces/app-data-client.md` §2.2 |
| A011 | "26 cenários" em vez de 26 arquivos / 55 cenários | **resolvido** — três pontos do `requirements.md` (+ D-07 e §9 do roadmap e `investigation.md` §5) |
| A012 | Cenário de nome de campo sem verificação negativa | **resolvido** — T045 executada (`progress.jsonl`) |
| A013 | Cenário de entidade inexistente exigia sugestão do nome correto | **resolvido** — T046 executada (`progress.jsonl`) |
| A014 | Alvos de T021/T041 divergentes do executado | **resolvido** — `actions.md` |
| A015 | Nomes `.js` no roadmap e `SendEmail` fora do §7 | **resolvido** — `roadmap.md` §5/§7, ficha §2.4 |
| A016 | Comportamentos congelados sem decisão no roadmap | **resolvido** — D-12 |
| A017 | Cabeçalho do `actions.md` descrevia o estado inicial | **resolvido** — cabeçalho, resumo e histórico |
| A018 | `allowedPaths` do `legacy-impact.md` incompleto | **resolvido** — `docs/**` |
| A019 | RF-13 permanecia na numeração sem razão declarada | **resolvido** — `requirements.md` RF-13 |

## 7. Disposição e próximo passo

| ID | Severidade | Disposição | Aplicação sugerida |
|----|------------|------------|--------------------|
| A020 | HIGH | aberto — aguarda decisão humana | `/reversa-plan` (registrar D-13 no `roadmap.md`) **ou** edição manual: desligar `allowJs` no `tsconfig.json` (medido seguro: 77 arquivos, 0 erros) |
| A021 | LOW | aberto | edição manual em `roadmap.md` §8: acrescentar o estado de 17/09 (46 de 46) |
| A022 | LOW | aberto | edição manual em `roadmap.md` §5: corrigir ou desdobrar a linha "Demais `src/` (~87 arquivos)" |

Consequência para o critério de pronto: o item "`cross-check.md` sem CRITICAL nem HIGH" do
`roadmap.md` §10 **permanece desmarcado** — esta revisão tem um HIGH (A020). Marcá-lo é ato do
dono do roadmap, não desta auditoria. O outro item em aberto segue sendo a re-extração
reversa, opcional por decisão registrada.

Próximo passo sugerido: resolver A020 (uma decisão no roadmap ou uma linha no `tsconfig.json`)
e, se quiser, as duas imprecisões de número; em seguida, uma nova revisão de auditoria — ou
`/reversa-coding`, se o humano aceitar A020 como risco assumido e registrado.
