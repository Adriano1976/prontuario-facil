# Roadmap: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Requirements: `_reversa_forward/017-politica-de-leitura-dos-logs/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A tela passa a ler a trilha **por recortes de 500 registros, com deslocamento**, e a oferecer
navegação entre eles. O deslocamento não é uma capacidade nova a inventar: **o SDK do provedor já o
aceita** — a assinatura é `list(sort?, limit?, skip?, fields?)`, com `skip` documentado como
"Number of results to skip for pagination" e exemplo de terceira página. Quem descarta o parâmetro é
**o nosso adaptador**, que declara `list(sort?: string, limit?: number)`.

Isso muda a natureza do trabalho: não é acrescentar uma operação ao sistema, é **deixar de perder um
parâmetro no caminho**. O contrato de entidade ganha `skip` como terceiro posicional, nas duas
leituras (`list` e `filter`), espelhando o SDK; o adaptador passa a repassá-lo; o cliente de modo
offline passa a honrá-lo. A tela pede `recorte + 1` e exibe `recorte` — o excedente é o que diz que
há mais, sem recorrer a contagem, que o contrato não tem e esta feature não cria.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe**, embora `.reversa/setup.json` declare `principles.enabled: true`
com `auto-load-into-plan: true`. Não há princípio registrado para confrontar, e nenhum foi reescrito
ou atenuado aqui.

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| — (nenhum registrado) | `.reversa/principles.md` ausente; verificação de princípios não executável | n/a |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Paginar por **deslocamento** (`skip`), mantendo a ordenação `-created_date` | `RN-01`; é o mecanismo que o SDK já oferece e o único expressável — o filtro compara só com `===`, então cursor por data não existe | cursor por `created_date`; carregar tudo e paginar no cliente | 🟢 |
| D-02 | `skip` entra no contrato como **terceiro parâmetro posicional**: `list(sort?, limit?, skip?)` | Espelha a assinatura do SDK (`entities.types.d.ts:248`). O comentário de `contract.ts:61-63` diz que as assinaturas são "deliberadamente iguais às do legado" — acrescentar `skip` torna essa afirmação **mais** verdadeira, não menos | objeto de opções; parâmetro nomeado; `offset` em vez de `skip` | 🟢 |
| D-03 | Estender **as duas** leituras: `list` e `filter` | O SDK tem `skip` nas duas (`:248` e `:345`). Uma metade estendida é armadilha para a próxima feature, que encontraria `filter` sem deslocamento sem entender por quê | estender só `list`, que é o que esta feature usa | 🟢 |
| D-04 | O cliente de modo offline honra `skip` em `sortAndLimit` | Paridade entre as duas implementações é o que a suíte `PT-010` existe para garantir; meia extensão faria o modo offline divergir | ignorar `skip` no offline e declarar | 🟢 |
| D-05 | O recorte é de **500** registros | `RN-08`, decidido na segunda sessão de esclarecimentos. Preserva exatamente o pedido do legado, de modo que a renderização não muda e a busca mantém a capacidade que já tem | 50; 100; configurável | 🟢 |
| D-06 | Detectar "há mais" pelo **excedente**: pedir `recorte + 1`, exibir `recorte` | `RN-07`, `RF-02`. O contrato não tem contagem, e esta feature não a cria; a existência do excedente é condição suficiente e verificável | criar operação de contagem no contrato; assumir que página cheia é a última | 🟢 |
| D-07 | Navegação por **avançar e retroceder**, com a posição exibida como número da página, **nunca como "de N"** | Sem contagem não existe total de páginas; exibir "página 3 de 12" exigiria a operação que `D-06` recusa | paginação numerada; "carregar mais" acumulativo | 🟢 |
| D-08 | O indicador que se chamava "Total de Logs" passa a **"Logs neste recorte"** | `RN-02`, `RF-03`: ele sempre mediu o conjunto carregado, e o rótulo é que mentia. Os outros três rótulos não afirmam totalidade e permanecem | medir a trilha inteira (exigiria contagem); remover o cartão | 🟢 |
| D-09 | A tela **declara** que a busca alcança o recorte exibido | `RN-05`, `RF-08`, decidido na segunda sessão. Numa tela de auditoria, uma busca que não encontra sem dizer por quê faz concluir que o registro não existe | busca no servidor (exigiria operação nova, porque `filter` não expressa substring) | 🟢 |
| D-10 | A `queryKey` passa a incluir a página: `['access-logs', pagina]` | Sem isso, trocar de página devolveria a cache da anterior | uma chave única com `keepPreviousData`; estado local fora do cache | 🟢 |
| D-11 | A leitura continua num único ponto, agora parametrizado: `leituraDaTrilha(pagina)` | Manutenibilidade; a política tem um só lugar, como hoje | espalhar o cálculo do deslocamento pela tela | 🟢 |
| D-12 | `BR-L04` deixa de ser teto absoluto e passa a ser o tamanho do recorte | É a regra 🟢 do legado que esta feature substitui (o mesmo papel de `BR-D08` na feature `016`). O limite continua valendo 500 — o que muda é ser possível passar dele | manter `BR-L04` como está e conviver com a contradição | 🟢 |
| D-13 | A prova herdada que trava os argumentos exatos `('-created_date', 500)` muda **de propósito** | `AccessLogs.test.tsx:200`. É a asserção que hoje garante que não há paginação; ela passa a afirmar o contrário, e a razão fica no `legacy-impact.md` | manter a asserção e duplicar a leitura | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` não tem marcador de dúvida aberto — os cinco pontos passaram por duas
sessões de esclarecimento em 2026-09-25.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a | n/a | n/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Contrato de entidade | `_reversa_sdd/code-analysis.md#5.1 Entidades Consumidas` | `contrato-alterado` | `EntityRepository.list` e `.filter` ganham `skip` como terceiro parâmetro posicional |
| Adaptador do provedor | `_reversa_sdd/code-analysis.md#5.1` | `contrato-alterado` | `src/api/entities.ts` repassa `skip` ao SDK, que já o aceita |
| Cliente de modo offline | `_reversa_sdd/architecture.md#2. Variante de Deployment — Modo Offline` | `contrato-alterado` | `src/api/mockClient.ts` passa a honrar `skip` na ordenação e no recorte |
| `AccessLogs` (página) | `_reversa_sdd/code-analysis.md#Análise de Código — Módulo logs-acesso` | `regra-alterada` | Leitura paginada, navegação entre recortes, rótulo do indicador corrigido, declaração do alcance da busca |
| Regra `BR-L04` | `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | `regra-alterada` | Deixa de ser teto absoluto e passa a ser o tamanho do recorte |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo novo, removido ou migrado. A trilha é *append-only*
  e continua igual.
- Detalhe completo em: `_reversa_forward/017-politica-de-leitura-dos-logs/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato **externo** é tocado. O contrato de entidade é interno ao projeto, e a mudança nele é
uma **passagem**: o SDK já expõe `skip`, e o adaptador apenas deixa de descartá-lo. Nenhum payload,
endpoint ou schema muda. O diretório `interfaces/` é **omitido**.

## 8. Plano de migração

Não há migração de dados. A sequência de entrega:

1. Estender `EntityRepository` em `src/api/contract.ts` com `skip` nas duas leituras.
2. Repassar `skip` no adaptador (`src/api/entities.ts`) e no cliente offline (`src/api/mockClient.ts`).
3. Parametrizar a leitura da tela por página e ligar a navegação.
4. Corrigir os rótulos e declarar o alcance da busca.
5. Reescrever a prova herdada que trava os argumentos exatos, deliberadamente.
6. Convergir a extração: `gaps.md`, `logs-acesso/screens.md`, `code-analysis.md`, `code-spec-matrix.md`,
   `migration/ambiguity_log.md#AMB-004` e `migration/target_business_rules.md`.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **Deriva de deslocamento**: a trilha é *append-only*, e registros novos entram **entre** duas leituras de página. Ordenando do mais recente para o mais antigo, um registro inserido enquanto o auditor navega **empurra** os demais, e o primeiro item da página 2 repete o último da página 1 | alto | **alta** | É limitação inerente ao deslocamento sobre tabela que cresce, não defeito da implementação. Declarar na spec e no `onboarding.md`; a alternativa (cursor por data) não é expressável no filtro e ficaria para uma feature que estenda o contrato com intervalo |
| **Empate de `created_date`**: a ordenação usa um único campo. Registros com o mesmo carimbo podem ordenar de forma diferente entre duas requisições, pulando ou repetindo itens | alto | média | Declarar. `BR-L05` fixa um campo só; ordenação por dois campos não é expressável hoje |
| `limit = 0` é falso em `mockClient.ts:80` (`if (limit && ...)`), então hoje significa "sem limite" em vez de "nenhum" | médio | média | Não mudar o comportamento herdado nesta feature, mas **fixá-lo em prova** para que a extensão com `skip` não o altere sem querer |
| O modo offline tem **um** registro de trilha no seed (`log-1`, `mockSeed.ts:87`) — não há massa para exercitar paginação à mão. Pior: a tela é admin-only e o usuário offline **não tem papel**, de modo que no modo offline ela fica vazia por decisão | médio | alta | O `onboarding.md` traz o procedimento de semear massa e diz com todas as letras que o roteiro exige sessão de administrador — conceder o papel ao usuário offline é **recusado pelo portão de tipos** (caso `papel-atribuido-ao-usuario-offline`). A verificação de fato acontece pela prova automatizada, que monta a sessão com papel |
| A prova herdada trava os argumentos exatos e precisa mudar de propósito | médio | alta | `D-13`; a razão vai para o `legacy-impact.md`, e as demais verificações da suíte ficam intactas |
| Estender só uma das implementações faria o modo offline divergir do adaptador | alto | média | `D-03` e `D-04`; a suíte `PT-010` passa a cobrir o deslocamento nas duas |
| A página continua renderizando 500 linhas | baixo | alta | É a decisão (`D-05`, `RN-08`): preserva a aparência do legado. O que a feature entrega é o caminho até o resto, não a redução da página |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Os quatro portões sem regressão contra a linha de base (`npm test` 218 verificações em 32 arquivos, `npm run typecheck`, `npm run prova:negativos`, `npm run prova:encoding`)
- [ ] As duas implementações do contrato concordam sobre o deslocamento, e a suíte de paridade cobre isso
- [ ] A prova demonstra que o avanço alcança registros que **não** estavam na primeira página
- [ ] `G-02` movido para "Lacunas resolvidas" em `_reversa_sdd/gaps.md`
- [ ] `AMB-004` declarada superada — a "política real" que ela adiava é esta feature

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` | reversa |
