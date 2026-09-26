# Roadmap: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Requirements: `_reversa_forward/016-taxa-de-atendimento/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

O quarto cartão do Dashboard deixa de receber o literal `"94%"` e passa a consumir uma **quinta
leitura** de `Appointment`, sem limite e com o escopo da sessão: a mesma que o Dashboard já faz para
os outros cartões, apenas sem o teto de 100. A decisão de status e a janela de 12 meses são aplicadas
**no cliente**, dentro de uma função pura nova, porque o contrato de filtro do projeto não expressa
intervalo de data nem aceita mais de um status — e é exatamente por isso que `ReportsView` já faz a
janela de 12 meses à mão.

A função pura devolve `number | null`, onde `null` significa "sem base" e vira `—` na tela; zero
significa zero e vira `0%`. Essa distinção é o que impede o cartão de afirmar um fato que a base vazia
não sustenta. O componente de cartão ganha uma prop opcional de subtítulo, usada por um único cartão,
que ora nomeia a janela, ora explica a ausência de desfecho.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe**, embora `.reversa/setup.json` declare `principles.enabled: true`
com `auto-load-into-plan: true`. Não há princípio registrado para confrontar, e nenhum princípio foi
reescrito ou atenuado aqui. Registrado também em `requirements.md#Pendências de Qualidade`.

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| — (nenhum registrado) | `.reversa/principles.md` ausente; verificação de princípios não executável | n/a |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Fórmula `Math.round(concluidos / (concluidos + faltas) * 100)`, percentual inteiro | `RN-02`/`RN-03`; único precedente percentual em tela é `ReportsView.tsx:239` | média móvel, decimal com uma casa, `toFixed` | 🟢 |
| D-02 | Fonte `Appointment` (a agenda) | `RN-04`; `Consultation` não tem estado `faltou` | `Consultation`; híbrido; implementar a sincronia do fluxo 4 | 🟢 |
| D-03 | A janela de 12 meses é aplicada **no cliente**, com `isAfter(date, subMonths(agora, 12))` | `FilterConditions<T>` é `Partial<{[K]: T[K]}>` (`src/types/common.ts:52`) — aceita valor exato, **não** intervalo. `code-analysis.md#4.2` documenta a mesma solução no legado | empurrar a janela para o filtro da consulta (impossível hoje) | 🟢 |
| D-04 | **Uma** leitura: `Appointment.listOwned(resolveScope(user))`, sem ordenação e **sem limite** | Mantém a semântica de escopo dos outros quatro cartões (`Dashboard.tsx:53,61,69,77` usam `resolveScope`) e uma única viagem. Sem limite, a janela não é truncada — precedente em `Appointments.tsx:65` | duas `filterOwned` (forçariam `asUserScope`, mudando a população do cartão em relação aos vizinhos); `filterAsAdmin` (ramo extra por papel); filtro por dois status (**impossível**: `FilterConditions` aceita um único valor) | 🟢 |
| D-05 | `queryKey` nova e distinta: `['appointments-desfecho']` | `code-analysis.md:1467` registra a armadilha de chaves iguais com dados diferentes (`['patients']` aparece com limites distintos em duas telas) | reusar `['appointments']`, que já carrega a leitura limitada a 100 | 🟢 |
| D-06 | Cálculo em `src/lib/taxaAtendimento.ts`, exportando constantes e `calcularTaxaAtendimento(agendamentos, agora): number \| null` | `RN-08`; função pura é o que torna a fórmula provável sem renderizar a página | calcular inline no `Dashboard`; utilitário dentro de `src/utils.ts` | 🟢 |
| D-07 | `null` = sem base → `—` + texto; `0` = `0%` | `RN-06`; é o que separa "não há desfecho" de "ninguém compareceu" | usar `0` para os dois; usar `NaN`; string vazia | 🟢 |
| D-08 | `StatsCard` ganha `subtitle?: string`, com **um único** slot contextual: com base exibe `"últimos 12 meses"`; sem base exibe o texto de `RN-06`. O subtítulo **não** aciona a variação percentual que o componente já suporta (`RF-04`) | `RN-06`+`RN-07` pedem dois textos no mesmo lugar (sob o valor); um slot evita superfície nova. `RF-04` proíbe a tendência, e ela continuará sem uso | dois props; um segundo cartão condicional; substituir o valor pelo texto; acionar `trend` | 🟢 |
| D-09 | Enquanto a leitura não responde, o cartão exibe o mesmo `—` + texto | Decorre de `RN-06`; evita o `0%` falso que o cartão "Documentos Emitidos" mostra durante o carregamento (`Dashboard.tsx:166`) | manter o valor anterior; esqueleto de carregamento | 🟢 |
| D-10 | `W003` da feature `009` é declarado **superado por decisão**, e a nova regra entra no watch desta feature | `O004` de `009` diz: "se um dia a fórmula real for definida, `W003` **deve** mudar de propósito, e não por acidente". É esse dia, com `RF-01`…`RF-03` como causa | deixar `W003` vigente e tratar a quebra como regressão | 🟢 |
| D-11 | O comentário de PARIDADE de `Dashboard.tsx:39-46` é reescrito para afirmar o que passa a valer | Já existe o precedente de reescrever o comentário quando o contrato muda (`015/T012` em `app-params.ts`); deixá-lo afirmando paridade congelada seria falso | remover o comentário; mantê-lo | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` não tem marcador de dúvida aberto — as três decisões de produto foram
tomadas em `requirements.md#9. Esclarecimentos`. Não há premissa a resolver em `/reversa-clarify`.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a | n/a | n/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Regra `BR-D08` — "Taxa de Atendimento fixa 94% (decorativa)" | `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | `regra-alterada` | **A regra 🟢 do legado é substituída por cálculo.** A quebra é sancionada e reversível na leitura: a própria extração marca a regra como a lacuna (`dashboard/requirements.md` a traz 🔴; `gaps.md` a lista como `G-01`), e `migration/ambiguity_log.md#AMB-001` previu a fórmula real para "fase posterior" — que é esta feature. Quem ler este delta precisa saber **qual** regra confirmada está sendo rompida, e não apenas que "o cartão deixa de receber literal" |
| `Dashboard` (página) | `_reversa_sdd/code-analysis.md#3.1 Carregamento do Dashboard` | `regra-alterada` | O quarto cartão deixa de receber literal e passa a consumir uma quinta leitura de `Appointment`, sem limite; o comentário de paridade é reescrito |
| `StatsCard` (componente) | `_reversa_sdd/c4-components.md` — `Component(stats, "StatsCard", "Card de KPI (valor/ícone/trend)")` | `contrato-alterado` | Ganha `subtitle?: string` opcional; nenhum consumidor existente além do Dashboard é afetado (`StatsCard` só é importado por `Dashboard.tsx`) |
| Módulo de cálculo | — (novo) | `componente-novo` | `src/lib/taxaAtendimento.ts`: constantes + função pura, sem dependência de React |
| Leitura de agendamentos | `_reversa_sdd/code-analysis.md#5.1 Entidades Consumidas` | `contrato-alterado` | Surge uma quinta consulta de `Appointment`, sem o limite de 100 da primeira, sob chave de cache própria |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo novo, removido ou migrado. O indicador é derivado de
  `Appointment.status` (união fechada de seis valores) e `Appointment.date`, ambos já existentes e já
  espelhados em `src/types/Appointment.ts`.
- Detalhe completo em: `_reversa_forward/016-taxa-de-atendimento/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo é tocado: não há endpoint novo, mudança de payload, fila nem schema. A leitura
usa o contrato de entidade já existente. O diretório `interfaces/` é **omitido**.

## 8. Plano de migração

Não há migração de dados. A sequência de entrega:

1. Criar `src/lib/taxaAtendimento.ts` com as constantes e a função pura; provar a função isoladamente.
2. Acrescentar `subtitle?: string` a `StatsCard` e renderizá-lo sob o valor.
3. Substituir o literal no `Dashboard` pela quinta leitura, pelo cálculo e pelo subtítulo contextual.
4. Reescrever os pontos de asserção da prova herdada que travam `"94%"` (deliberadamente),
   **preservando intactas** as verificações dos outros três cartões — que é o `RF-06`, e é `Must`.
5. Convergir a extração: `gaps.md`, `dashboard/requirements.md`, `code-spec-matrix.md`,
   `migration/ambiguity_log.md`, `migration/target_business_rules.md`, `migration/target_screens.md`,
   `dashboard/screens.md`, e o watch da feature `009`.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| A leitura sem limite cresce com o histórico do consultório | médio | média | Precedente já vigente em `Appointments.tsx:65`; se virar problema, a correção é índice/intervalo no servidor — fora do escopo desta feature |
| O número mede **marcação manual**: concluir uma consulta não atualiza o agendamento (`NewConsultation.tsx` não referencia `Appointment`) | alto | alta | Declarado em `requirements.md#2.1` e no `onboarding.md`; é consequência aceita de `D-02`, não defeito da entrega |
| Fuso horário na borda da janela — `new Date('2026-09-22')` é UTC, e a comparação do Dashboard é local | alto | média | A massa de prova já resolve isso: datas derivadas do relógio com deslocamento em dias (`src/test/dashboardFixtures.ts`, cabeçalho) |
| A chave de cache colidir com `['appointments']` e o cartão acabar lendo a leitura limitada a 100 | alto | média | `D-05`; a prova usa massa **maior que 100** desfechos, de modo que uma leitura truncada produziria percentual diferente e visível |
| O dublê de `Appointment.listOwned` é **um só** e serve às duas leituras: a prova não distingue pelo valor devolvido | alto | alta | A prova discrimina pelos **argumentos** da chamada (a nova leitura é a que não tem terceiro argumento), como a suíte já faz para os limites em `DashboardKpis.test.tsx:37-38` |
| Reescrever a prova herdada pode mascarar uma regressão real dos outros três cartões | alto | média | Manter as verificações de `PT-008.1`, `PT-008.2`, `PT-008.5` intactas; só os pontos que travam `"94%"` mudam, e a razão fica no `legacy-impact.md` |
| O subtítulo vazar para os outros três cartões | baixo | baixa | Prop opcional + verificação de que apenas o quarto cartão a exibe |
| A extração fica defasada ao fim (inclui `V01-dashboard-principal.feature:18`, que afirma `"94%"`) | médio | alta | Passo 5 do plano de migração, mais `/reversa-sync` ao final |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Os quatro portões sem regressão contra a linha de base (`npm test` 198 verificações em 31 arquivos, `npm run typecheck`, `npm run prova:negativos`, `npm run prova:encoding`)
- [ ] A prova discrimina a leitura nova **pelos argumentos** da chamada, não pelo valor devolvido
- [ ] `G-01` movido para "Lacunas resolvidas" em `_reversa_sdd/gaps.md`
- [ ] `W003` da feature `009` declarado superado **por decisão**, com a nova regra vigiada no watch desta feature
- [ ] A extração convergida: `dashboard/requirements.md` deixa de ter a regra 🔴 e passa a ter a fórmula

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` | reversa |
