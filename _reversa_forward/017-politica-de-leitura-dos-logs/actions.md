# Actions: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Roadmap: `_reversa_forward/017-politica-de-leitura-dos-logs/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 31 |
| Paralelizáveis (`[//]`) | 19 |
| Maior cadeia de dependência | 14 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Ler o `roadmap.md`, o `investigation.md`, o `data-delta.md` e o `onboarding.md` e fixar as decisões `D-01`…`D-13` que a implementação precisa honrar, incluindo o que foi explicitamente recusado e o risco de deriva de deslocamento | - | `[//]` | - | 🟢 | [X] |
| T002 | Ler `.reversa/reversa-config.json` e confirmar que `src/**` está liberado antes da primeira escrita fora das pastas do Reversa | - | `[//]` | `.reversa/reversa-config.json` | 🟢 | [X] |
| T003 | Medir a linha de base dos quatro portões antes de tocar em código, para que a comparação de T016 tenha termo de partida | - | `[//]` | - | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Provar que o cliente de modo offline honra o deslocamento: com o mesmo conjunto, `skip` 0 e `skip` N devolvem janelas distintas, na mesma ordem, e sem repetir nem pular registro (D-04) | T001 | `[//]` | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T005 | Provar a paridade do deslocamento entre as duas implementações: o adaptador repassa `skip` ao SDK e devolve a mesma janela que o cliente offline para o mesmo par `limit`/`skip` (D-02, D-03, D-04) | T001 | `[//]` | `src/api/__tests__/leituraPaginada.test.ts` | 🟢 | [X] |
| T006 | Reescrever os pontos da prova herdada que travam os argumentos exatos `('-created_date', 500)` e provar que a leitura passa a ser emitida com **um registro a mais** do que se exibe (D-06, D-13) | T001 | `[//]` | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T007 | Acrescentar à massa de prova o conjunto paginado: mais de duas páginas de registros, com carimbos distintos e ordem determinística, para que a navegação seja observável (R-04) | T001 | `[//]` | `src/test/auditFixtures.ts` | 🟢 | [X] |
| T008 | Provar no nível da tela a navegação entre recortes: avançar alcança registros que **não** estavam na primeira página, retroceder volta ao recorte anterior, e o avanço fica indisponível quando não há mais (RF-01, RF-02) | T006, T007 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T009 | Provar no nível da tela os rótulos honestos e a declaração do alcance da busca: nenhum indicador afirma ser total, e a tela diz que a busca alcança o recorte (RN-02, RN-05, RF-03, RF-08) | T008 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Estender o contrato de entidade com `skip` como terceiro parâmetro posicional, nas **duas** leituras, espelhando a assinatura do SDK e preservando o comentário de fidelidade ao legado (D-02, D-03) | T001 | `[//]` | `src/api/contract.ts` | 🟢 | [X] |
| T011 | Repassar `skip` no adaptador do provedor, sem alterar o comportamento dos dois primeiros parâmetros (D-02) | T010 | `[//]` | `src/api/entities.ts` | 🟢 | [X] |
| T012 | Honrar `skip` no cliente de modo offline, recortando a janela depois da ordenação, com `skip` ausente valendo zero (D-04) | T010 | `[//]` | `src/api/mockClient.ts` | 🟢 | [X] |
| T013 | Paginar a leitura da tela: parametrizar por página, incluir a página na chave de cache, pedir `recorte + 1` e descartar o excedente (D-05, D-06, D-10, D-11) | T010, T011, T012 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T014 | Acrescentar a navegação entre recortes: avançar e retroceder, com a posição exibida como número da página e **nunca** como "de N" (D-07) | T013 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T015 | Corrigir o rótulo do indicador que se chamava "Total de Logs" e declarar, de forma visível, que a busca alcança o recorte exibido (D-08, D-09) | T014 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T016 | Rodar os quatro portões e conferir contra a linha de base de T003, com atenção às suítes de contrato e de modo offline | T009, T015 | - | - | 🟢 | [X] |
| T017 | Falsificar o deslocamento: zerar o `skip` na leitura da tela, conferir que a prova de avanço falha pelo sinal nomeado e reverter sem resíduo (RF-01) | T016 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T018 | Falsificar a detecção do excedente: pedir o recorte exato em vez de `recorte + 1`, conferir que a prova de "há mais" falha e reverter sem resíduo (RN-07, RF-02) | T017 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T019 | Falsificar a paridade: fazer o cliente de modo offline ignorar `skip`, conferir que a prova de paridade falha e reverter sem resíduo (D-04) | T018 | - | `src/api/mockClient.ts` | 🟢 | [X] |
| T020 | Falsificar o rótulo: devolver "Total de Logs" ao indicador, conferir que a prova falha e reverter sem resíduo (RN-02, RF-03) | T019 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T021 | Falsificar a declaração da busca: suprimir a declaração do alcance, conferir que a prova falha e reverter sem resíduo (RN-05, RF-08) | T020 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T022 | Escrever o `legacy-impact.md` declarando a regra 🟢 `BR-L04` substituída, a mudança de contrato nas duas implementações e o que permaneceu intocado (D-12, D-13) | T021 | `[//]` | `_reversa_forward/017-politica-de-leitura-dos-logs/legacy-impact.md` | 🟢 | [X] |
| T023 | Escrever o `regression-watch.md` com os itens vigiados — a paginação, o deslocamento honrado nas duas implementações, a detecção pelo excedente, os rótulos e a declaração da busca — declarando `AMB-004` superada (critério de pronto) | T021 | `[//]` | `_reversa_forward/017-politica-de-leitura-dos-logs/regression-watch.md` | 🟢 | [X] |
| T024 | Mover `G-02` de "Lacunas abertas" para "Lacunas resolvidas" em `gaps.md`, registrando a decisão, a data e a feature que a fechou | T021 | `[//]` | `_reversa_sdd/gaps.md` | 🟢 | [X] |
| T025 | Atualizar `logs-acesso/screens.md` para a tela paginada: navegação entre recortes, rótulo do indicador e declaração do alcance da busca | T021 | `[//]` | `_reversa_sdd/logs-acesso/screens.md` | 🟢 | [X] |
| T026 | Reclassificar `BR-L04` em `code-analysis.md` (de teto absoluto a tamanho do recorte), acrescentar o deslocamento em `#5.1 Entidades Consumidas` e corrigir a expressão "tabela paginada implicitamente" | T021 | `[//]` | `_reversa_sdd/code-analysis.md` | 🟢 | [X] |
| T027 | Atualizar a matriz: a linha da lacuna de paginação, a menção a `BR-L04` e a medição nova (critério de pronto) | T021 | `[//]` | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T028 | Registrar em `migration/ambiguity_log.md` que `AMB-004` está superada — a "política real" que ela adiava é esta feature | T021 | `[//]` | `_reversa_sdd/migration/ambiguity_log.md` | 🟢 | [X] |
| T029 | Registrar em `migration/target_business_rules.md` a regra nova da leitura da trilha, substituindo `BR-HUMANA-004` | T021 | `[//]` | `_reversa_sdd/migration/target_business_rules.md` | 🟢 | [X] |
| T030 | Acrescentar ao cenário de contrato `PT-010` a cláusula do deslocamento, para que a promessa de paridade entre as duas implementações passe a cobri-lo | T021 | `[//]` | `_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature` | 🟢 | [X] |
| T031 | Conferir por `git status --porcelain` que nenhum arquivo fora de `src/**` e das pastas do Reversa foi tocado (critério de pronto) | T030 | - | - | 🟢 | [X] |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- **O dublê de `useQuery` da prova de tela ignorava o retorno do transporte, e isso mascarava duas
  coisas.** Ele devolvia `armazem.logs` direto (`data: armazem.logs`, `isLoading: false`), sem usar o
  que a consulta respondera. Consequência: a paginação era **inobservável por construção** — a tela
  recebia os 501 registros em qualquer página, e nenhuma prova conseguiria distinguir o recorte 1 do
  recorte 2. O dublê passou a guardar o retorno por chave, como o da suíte de KPIs já fazia.
  **O efeito colateral foi revelador:** com o dublê fiel, uma prova herdada passou a falhar —
  *"não pergunta ao servidor quando a sessão não é de administrador"* esperava **ver** o registro,
  e via, porque o dublê o entregava independentemente do transporte. A asserção de transporte
  passava enquanto a de tela teria falhado. A verificação foi completada com a metade que faltava.
- **A asserção de `getByRole` com nome acessível é caríssima sobre DOM grande.** Medido: no arquivo de
  tela com 1.200 linhas, cada consulta por papel **com nome** levava cerca de 90 s. O arquivo levava
  206 s. Trocadas as consultas de botão por consulta textual (que não computa nome acessível), o
  arquivo caiu para ~30 s. A asserção continua sobre o mesmo elemento — o `<button>` que contém o
  rótulo.
- **A suíte ficou mais lenta, e o custo é declarado.** Linha de base 218 verificações em 32 arquivos
  a 72,45 s; depois desta feature, 229 em 33 a ~112-125 s. A causa não é a paginação em si: é a
  primeira página do conjunto de prova, que tem 500 linhas porque **é o recorte que está sendo
  medido**. O bloco da feature tem teto de tempo explícito de 30 s por verificação, porque sob carga
  paralela o tempo padrão de 5 s estourava — o arquivo passava isolado e falhava na suíte completa.
- **O conjunto de prova usa 501 registros, e não mais.** Duas páginas já provam o que a navegação
  precisa provar, e a segunda fica com um registro só, o que mantém barato o DOM das verificações que
  clicam.
- **Divergência herdada, registrada e NÃO corrigida:** o SDK documenta `limit` com default **50**
  quando omitido; o cliente de modo offline trata `limit` ausente como **sem teto**, devolvendo tudo.
  Não é desta feature — antecede a paginação — e não foi tocada aqui. Fica registrada porque a
  extensão com `skip` passou ao lado dela, e porque `list(sort, undefined, skip)` significa coisas
  diferentes nos dois lados.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-to-do` | reversa |

---
*Gerado pelo Reversa-To-Do em 2026-09-27.*
