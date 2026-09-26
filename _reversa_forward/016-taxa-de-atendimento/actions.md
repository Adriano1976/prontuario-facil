# Actions: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Roadmap: `_reversa_forward/016-taxa-de-atendimento/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 27 |
| Paralelizáveis (`[//]`) | 16 |
| Maior cadeia de dependência | 12 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Ler o `roadmap.md`, o `data-delta.md` e o `investigation.md` e fixar as decisões `D-01`…`D-11` que a implementação precisa honrar, incluindo o que foi explicitamente recusado | - | `[//]` | - | 🟢 | [X] |
| T002 | Ler `.reversa/reversa-config.json` e confirmar que `src/**` está liberado antes da primeira escrita fora das pastas do Reversa | - | `[//]` | `.reversa/reversa-config.json` | 🟢 | [X] |
| T003 | Medir a linha de base dos quatro portões antes de tocar em código, para que a comparação de T011 tenha termo de partida | - | `[//]` | - | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Provar a função pura isoladamente: a fórmula, o cancelamento fora das duas contas, os estados sem desfecho fora das duas contas, o arredondamento inteiro, a borda estrita de 12 meses, e a distinção entre `null` (sem base) e `0` (RF-01, RF-02, RF-03, RF-07, RN-02, RN-03, RN-05, D-01, D-03) | T001 | `[//]` | `src/lib/__tests__/taxaAtendimento.test.ts` | 🟢 | [X] |
| T005 | Reescrever os pontos da prova herdada que travam o literal `"94%"` — a lista dos quatro valores, o `describe` de `PT-008.4` e as duas esperas do cartão — **preservando** a asserção de ausência de tendência (`queryByText(/este mês/i)`, hoje em `DashboardKpis.test.tsx:302`) e mantendo intactas as verificações dos outros três KPIs, que é `Must` (RF-01, RF-04, RF-06, D-10, R-06) | T001 | `[//]` | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T006 | Provar no nível da tela o que a função não alcança: o subtítulo da janela sob o valor, o estado sem base exibindo `—` com o texto, o `0%` com base e nenhum atendido, e — pelos **argumentos** da chamada — que a leitura nova não tem limite e declara escopo, com massa acima de 100 desfechos, e que o quarto cartão mantém título, posição e cor sem que os outros três ganhem subtítulo (RF-02, RF-03, RF-05, RNF de integridade, RN-04, RN-06, RN-07, RN-09, D-04, D-05, R-04, R-05) | T005 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Criar o módulo do cálculo: as constantes nomeadas da janela e do subtítulo, o texto do estado sem base, e a função pura que devolve `number \| null` aplicando status e janela no cliente (RN-01, RN-02, RN-03, RN-05, RN-06, RN-08, D-01, D-03, D-06, D-07) | T004 | `[//]` | `src/lib/taxaAtendimento.ts` | 🟢 | [X] |
| T008 | Acrescentar `subtitle?: string` ao cartão de KPI e renderizá-lo sob o valor, **depois** do `<p>` do valor, sem acionar a variação percentual que o componente já suporta (RN-07, RF-04, D-08, R-06) | T001 | `[//]` | `src/components/medical/StatsCard.tsx` | 🟢 | [X] |
| T009 | Substituir o literal do quarto cartão pela quinta leitura de `Appointment` — sem ordenação, **sem limite**, com o escopo resolvido e chave de cache própria — ligada à função pura, com o estado de carregamento exibindo o mesmo `—` do estado sem base (RN-01, RN-04, RF-01, RF-02, D-02, D-04, D-05, D-09) | T007, T008 | - | `src/pages/Dashboard.tsx` | 🟢 | [X] |
| T010 | Reescrever o comentário de PARIDADE do `Dashboard` para afirmar o que passa a valer — a paridade do quarto cartão foi rompida de propósito — e registrar por quê (RF-05, D-11) | T009 | - | `src/pages/Dashboard.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Rodar os quatro portões e conferir contra a linha de base de T003, com atenção especial à suíte de KPIs herdada e à de modo offline, que é a prova de que a quinta leitura não alcançou as chaves de dados | T006, T010 | - | - | 🟢 | [X] |
| T012 | Falsificar a fórmula: incluir `cancelado` no numerador, conferir que a prova falha pelo sinal nomeado e reverter sem resíduo (RN-02, RF-07) | T011 | - | `src/lib/taxaAtendimento.ts` | 🟢 | [X] |
| T013 | Falsificar a janela: alargar a janela para 24 meses, conferir que a prova da borda de 12 meses falha e reverter sem resíduo (RN-05, RF-02) | T012 | - | `src/lib/taxaAtendimento.ts` | 🟢 | [X] |
| T014 | Falsificar a ausência de limite: reintroduzir o teto de 100 na quinta leitura, conferir que a prova de truncamento falha e reverter sem resíduo (RNF de integridade, D-04) | T013 | - | `src/pages/Dashboard.tsx` | 🟢 | [X] |
| T025 | Falsificar o subtítulo: suprimir o subtítulo do quarto cartão, conferir que a prova do subtítulo falha pelo sinal nomeado e reverter sem resíduo (RN-07, RF-05) | T014 | - | `src/components/medical/StatsCard.tsx` | 🟢 | [X] |
| T026 | Falsificar a distinção entre sem base e zero: fazer o denominador zero devolver `0` em vez de `null`, conferir que as duas provas falham — a do `—` e a do `0%` com base — e reverter sem resíduo (RN-06, RF-03) | T025 | - | `src/lib/taxaAtendimento.ts` | 🟢 | [X] |
| T027 | Falsificar o texto do estado sem base: trocar o texto por literal vazio, conferir que a prova do texto falha e reverter sem resíduo (RN-06, RF-03) | T026 | - | `src/lib/taxaAtendimento.ts` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T015 | Escrever o `legacy-impact.md` declarando a paridade rompida de propósito, a superfície que ganhou o subtítulo, e o que permaneceu intocado (RF-05, D-10, D-11) | T014 | `[//]` | `_reversa_forward/016-taxa-de-atendimento/legacy-impact.md` | 🟢 | [X] |
| T016 | Escrever o `regression-watch.md` com os itens vigiados — a fórmula, a exclusão do cancelamento, a janela, a ausência de limite e o subtítulo — declarando `W003` da feature `009` superado **por decisão** (D-10, critério de pronto) | T014 | `[//]` | `_reversa_forward/016-taxa-de-atendimento/regression-watch.md` | 🟢 | [X] |
| T017 | Marcar `W003` como superado no watch da feature `009`, apontando para o watch desta feature e registrando a causa — `O004` previa exatamente esta mudança de propósito (D-10) | T016 | - | `_reversa_forward/009-prova-kpis-dashboard/regression-watch.md` | 🟢 | [X] |
| T018 | Atualizar a matriz: a linha de `PT-008.4`, as referências a `G-01` e a lacuna de prova da Taxa pendente num artefato e resolvida noutro, mais a medição nova (RF-01, RF-03, critério de pronto) | T011 | `[//]` | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T019 | Atualizar a regra do Dashboard na extração: a linha 🔴 da Taxa de Atendimento passa a declarar fórmula, fonte, janela e arredondamento decididos, e a regra `RF-01` da unit deixa de dizer que a taxa permanece mockada (RN-01…RN-05, RN-07) | T011 | `[//]` | `_reversa_sdd/dashboard/requirements.md` | 🟢 | [X] |
| T020 | Mover `G-01` de "Lacunas abertas" para "Lacunas resolvidas" em `gaps.md`, registrando a decisão, a data e a feature que a fechou | T011 | `[//]` | `_reversa_sdd/gaps.md` | 🟢 | [X] |
| T021 | Registrar em `migration/ambiguity_log.md` que `AMB-001` foi cumprida e superada — a "fase posterior" que a decisão de 2026-09-09 previa chegou, e a constante tipada nunca implementada dá lugar a símbolo real (D-10, RN-08) | T011 | `[//]` | `_reversa_sdd/migration/ambiguity_log.md` | 🟢 | [X] |
| T022 | Registrar em `migration/target_business_rules.md` a regra nova da Taxa de Atendimento, substituindo `BR-HUMANA-001` e movendo-a de "DECISÃO HUMANA" para regra vigente | T011 | `[//]` | `_reversa_sdd/migration/target_business_rules.md` | 🟢 | [X] |
| T023 | Corrigir os três artefatos que ainda afirmam `"94%"` literal: `migration/target_screens.md`, `dashboard/screens.md` e o cenário visual `V01-dashboard-principal.feature`, declarando em cada um que a correção do cenário visual **não é verificável por execução** — os 16 cenários `PT-V` não têm arnês, lacuna já registrada na extração | T011 | `[//]` | `_reversa_sdd/migration/target_screens.md`, `_reversa_sdd/dashboard/screens.md`, `_reversa_sdd/migration/parity_tests/screens/V01-dashboard-principal.feature` | 🟢 | [X] |
| T024 | Conferir por `git status --porcelain` que nenhum arquivo fora de `src/**` e das pastas do Reversa foi tocado (critério de pronto) | T023 | `[//]` | - | 🟢 | [X] |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- **A borda da janela de 12 meses estava contraditória no `requirements.md`, e a contradição veio da
  extração.** `code-analysis.md#4.2` afirma, no mesmo parêntese, que a comparação é "`isAfter` estrito
  > `cutoff`" **e** que "appointment exatamente há 12 meses entra" — as duas coisas não podem ser
  verdade ao mesmo tempo, porque `isAfter(d, cutoff)` é falso quando `d === cutoff`. O `RN-05` herdou
  a contradição: o texto operativo diz "estritamente posterior" e o parêntese dizia "entra". Valeu o
  texto operativo, que é o que o código executa (`ReportsView.tsx:88-91`), e as duas ocorrências
  contraditórias do `requirements.md` foram corrigidas — o parêntese de `RN-05` e a última linha do
  cenário Gherkin. A prova fixa a borda nos dois sentidos (exatamente 12 meses fica fora; um dia
  dentro entra).
- **A revisão manual pós-auditoria não foi registrada aqui por acaso:** as correções de `T005`,
  `T006`, `T009` e `T023` são anteriores a esta execução e já estavam no arquivo quando ele começou a
  ser executado.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-25 | Revisão pós-auditoria (`audit/cross-check.md`): `T025`–`T027` acrescentadas à Fase 4 como as falsificações que faltavam (subtítulo, `null` × `0`, texto do estado sem base); `T001`, `T005`, `T006`, `T009` e `T023` ajustadas. IDs novos foram **anexados**, nunca reciclados nem renumerados — por isso a Fase 4 vai até `T027` enquanto a Fase 5 começa em `T015` | reversa |
