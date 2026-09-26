# Cross-check: Taxa de Atendimento computada

> Identificador da feature: `016-taxa-de-atendimento`
> Data: `2026-09-25` — **segunda rodada**
> Artefatos analisados:
> - `_reversa_forward/016-taxa-de-atendimento/requirements.md` (287 linhas)
> - `_reversa_forward/016-taxa-de-atendimento/roadmap.md` (121 linhas)
> - `_reversa_forward/016-taxa-de-atendimento/actions.md` (79 linhas)
>
> Auditoria **leitora**. Nenhum dos três artefatos acima foi alterado por esta execução.
>
> **Nota de rodada.** Este arquivo é reescrito por completo a cada execução, jamais acrescentado. A
> primeira rodada (10 findings: 0 CRITICAL, 3 HIGH, 6 MEDIUM, 1 LOW) gerou uma revisão manual do
> `roadmap.md` e do `actions.md`; o resultado dessa revisão está medido em
> `#Resolução dos findings da primeira rodada`. O relatório anterior não é preservado literalmente —
> esta rodada o substitui, e é ela que vale.

## Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 1 |
| **Total** | **2** |

**Nenhum CRITICAL nem HIGH.** Os três HIGH da primeira rodada fecharam, e a verificação de que
fecharam está abaixo, item a item.

## Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A011 | MEDIUM | Consistência | **Carregado da rodada anterior, em aberto por decisão do humano.** As seis edições à mão em artefatos da extração (`T018`–`T023`) não são registradas em `_reversa_sdd/pendencias-de-convergencia.md`, que é onde o projeto guarda esse tipo de edição. O registro foi oferecido para a feature `015` e **recusado**; nenhuma ação desta feature o reabre. Fica reportado, não corrigido | `actions.md#Fase 5` |
| A012 | LOW | Clareza | **Introduzido pela revisão.** A frase "A quebra é sancionada e reversível na leitura" admite leitura errada: "reversível" pode ser lido como "a quebra pode ser desfeita", quando a intenção é "o leitor consegue reconstruir por que a quebra foi feita". Numa afirmação sobre quebra de regra confirmada, a ambiguidade é evitável | `roadmap.md#5`, linha da regra `BR-D08` |

### A011 — por que continua aberto

Não é um finding que a revisão deixou escapar: é um finding que a revisão **não tinha autorização para
fechar**. O registro das edições à mão em `pendencias-de-convergencia.md` foi oferecido durante a
feature `015` e recusado pelo humano. Reintroduzi-lo por conta própria seria reverter uma decisão, não
corrigir um defeito.

O impacto é conhecido e concreto: ao fim desta feature, a extração terá seis trechos editados à mão sem
rastro no lugar onde o projeto rastreia edições à mão. A "lacuna de rastreabilidade" que a feature `015`
deixou em uma instância passa a ter seis.

**Direção sugerida:** decisão humana — aceitar as seis edições sem registro, ou autorizar o registro.
Se autorizar, isso é emenda de escopo (`/reversa-add` depois do coding) ou edição manual do
`actions.md` agora.

### A012 — por que é LOW e não qualidade

O `/reversa-quality` julga escrita; a auditoria julga coerência. Registro aqui porque a frase ambígua
está **na afirmação que fecha o `A001`**, e um leitor que a interprete mal pode concluir que a quebra de
`BR-D08` é opcional ou reversível. É cosmético no texto e material na consequência.

**Direção sugerida:** edição manual de uma frase, ou emenda via `/reversa-add`.

## Resolução dos findings da primeira rodada

| ID anterior | Severidade | O que foi feito | Evidência medida |
|-------------|------------|-----------------|------------------|
| A001 | HIGH | O `roadmap.md#5` ganhou uma linha nomeando `BR-D08` como a regra 🟢 substituída, com a razão da quebra sancionada | `BR-D08` aparece **1** vez no `roadmap.md`, no delta arquitetural |
| A002 | HIGH | O passo 4 do `roadmap.md#8` nomeia `RF-06`; a ação `T005` passou a citá-lo | `RF-06` aparece **1** vez no `roadmap.md` e **1** vez no `actions.md` |
| A003 | HIGH | `T025`, `T026` e `T027` acrescentadas à Fase 4: as falsificações do subtítulo, da distinção `null` × `0` e do texto do estado sem base | As três linhas existem; a cadeia mais longa passou de 11 para **12**, terminando em `T027` |
| A004 | MEDIUM | `T006` passou a citar `RN-09` e a provar que o quarto cartão mantém título, posição e cor sem que os outros três ganhem subtítulo | `RN-09` aparece **1** vez no `actions.md` |
| A005 | MEDIUM | `T005` passou a **preservar explicitamente** a asserção `queryByText(/este mês/i)`, com o arquivo e a linha citados | A descrição de `T005` nomeia a asserção e a linha `DashboardKpis.test.tsx:302` |
| A006 | MEDIUM | `T009` passou a citar `D-02` | `D-02` aparece **1** vez no `actions.md` |
| A007 | MEDIUM | A justificativa de `D-08` passou a citar `RF-04` | `RF-04` aparece **1** vez no `roadmap.md` |
| A008 | MEDIUM | **Não corrigido — decisão humana.** Ver `A011` | — |
| A009 | MEDIUM | `T023` passou a declarar que a correção do cenário visual **não é verificável por execução** | A descrição de `T023` contém a declaração |
| A010 | LOW | `T001` deixou de ter a pasta da feature como alvo; passou a `-`, como as outras ações de leitura | O alvo de `T001` é `-` |

**8 dos 10 findings fecharam por edição.** Os dois que restam são `A008` (recusado por decisão) e o
`A012`, que a própria revisão criou.

## Itens verificados que passaram

### Sanidade do actions — reverificada após a revisão

- **27 ações**, todas com ID único no formato `T###`, e **zero** marcadas `[X]`.
- **Nenhuma dependência fantasma**: toda dependência citada aponta para um ID existente.
- **Nenhum ciclo de dependência**, verificado por percurso com marcação de cor.
- **Todas as 27 linhas de ação têm exatamente sete colunas** — a revisão não quebrou nenhuma tabela.
- **Nenhum arquivo real compartilhado entre ações `[//]`.** O único alvo repetido é `-`, agora em
  `T001`, `T003` e `T024` — todas de leitura ou medição, nenhuma escrevendo arquivo. A regra fala de
  arquivo alvo, e `-` não é arquivo: não há conflito.
- Os números do resumo do `actions.md` **conferem com a medição**: 27 ações, 16 `[//]`, cadeia 12.
- Os IDs novos foram **anexados**, e o histórico do arquivo explica por que a Fase 4 vai até `T027`
  enquanto a Fase 5 começa em `T015`. Nenhum ID foi reciclado nem renumerado.

### Cobertura

- **Os 11 cenários Gherkin do `requirements.md` têm agora cobertura nomeada**, incluindo os dois que
  estavam órfãos na primeira rodada: "Rótulo e posição preservados" (`T006`) e "Sem tendência"
  (`T005` e `T008`).
- `RF-01` a `RF-07` têm decisão no roadmap e ação correspondente — `RF-06` deixou de ser órfão.
- As 11 decisões `D-01`…`D-11` têm pelo menos uma ação, e agora **cada uma é citada por ID** em alguma
  ação — `D-02` deixou de depender de leitura semântica.
- `interfaces/` ausente e a ausência declarada em `roadmap.md#7`.

### Consistência

- "desfecho", "janela", "sem base" e "Taxa de Atendimento" com a mesma grafia nos quatro artefatos.
- A redação rejeitada "sem agendamentos no período" continua aparecendo **apenas** onde é citada como o
  que foi corrigido (`requirements.md:237`).
- Todos os identificadores citados existem: `RF-01`…`RF-07`, `RN-01`…`RN-09`, `D-01`…`D-11`,
  `R-04`/`R-05`/`R-06`, `T001`…`T027`, `AMB-001`, `AMB-003`, `O002`, `O004`, `W003`, `BR-D08`,
  `BR-D09`, `BR-MIGRAR-010/011/034`, `G-01`, `PT-008.4`.
- Os números de medição citados conferem: 198 verificações em 31 arquivos, 519 arquivos no portão de
  encoding, 18 casos negativos.

### Coerência com o legado

- `BR-A03` (🟢: excluir cancelados das contagens) é **reforçada** por `RN-02`, não contrariada.
- `BR-A01` e `state-machines.md#1` sustentam os estados usados: `concluido` e `faltou` são terminais.
- `BR-A02` (🟡, transição manual) é respeitada e **declarada**, não contornada em silêncio.
- A quebra de `BR-D08` está agora **nomeada e justificada**, com a extração citada nos três pontos que
  a sancionam (`dashboard/requirements.md`, `gaps.md`, `migration/ambiguity_log.md#AMB-001`) — e
  confirmei que cada uma dessas três fontes diz o que o roadmap afirma que diz.
- **As referências de código seguem conferindo linha a linha**: `Dashboard.tsx:53,61,69,77,166,173`;
  `StatsCard.tsx:14-27,56-61`; `ReportsView.tsx:63-68,88-95,239`; `Appointments.tsx:65,86`;
  `sessionScope.ts:38-46,55-57`; `scopedRead.ts:41-71`; `types/common.ts:52`. `NewConsultation.tsx`
  continua **sem** referenciar `Appointment`.
- `T019` afirma que o `RF-01` da unit diz que "a taxa permanece explicitamente mockada" — conferido em
  `_reversa_sdd/dashboard/requirements.md:46`, e a afirmação está correta.

### Efeitos colaterais da revisão, procurados e não encontrados

- O `requirements.md` **não foi tocado** pela revisão (carimbo de 15:49:59, anterior à auditoria das
  16:08 e à revisão das 16:09). Nada foi corrigido onde a auditoria não apontou.
- A linha nova do `roadmap.md#5` não contradiz nenhuma outra linha do mesmo delta.
- `T025`, `T026` e `T027` são alcançadas transitivamente por `T008` (o subtítulo) e `T007` (a função),
  na ordem certa: as falsificações não podem rodar antes do que elas falsificam.
- Nenhum `[//]` foi atribuído às falsificações — cada uma precisa de linha de base limpa, e
  `T026`/`T027` mutam o mesmo arquivo.

## Itens fora do escopo desta auditoria

- **Qualidade de escrita**, salvo quando a ambiguidade tem consequência de coerência (`A012`). O
  julgamento de escrita é `/reversa-quality`.
- **Se a fórmula decidida é a certa.** Decisão de produto, tomada em `requirements.md#9`.
- **`data-delta.md`, `investigation.md` e `onboarding.md`**, lidos para conferir o que o roadmap e o
  actions afirmam sobre eles, mas sem veredito próprio.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Primeira rodada — 0 CRITICAL, 3 HIGH, 6 MEDIUM, 1 LOW. Reescrita pela rodada seguinte | reversa |
| 2026-09-25 | Segunda rodada, após a revisão manual do plano — 0 CRITICAL, 0 HIGH, 1 MEDIUM (carregado por decisão), 1 LOW (introduzido pela revisão). 8 dos 10 findings anteriores fechados por edição | reversa |
