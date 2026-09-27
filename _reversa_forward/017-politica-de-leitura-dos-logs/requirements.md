# Requirements: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A tela de Logs de Acesso lê os **500 registros mais recentes** da trilha e renderiza todos os que
passam pelos filtros. Acima de 500, o efeito não é "a tabela fica longa": é que a trilha fica
**truncada em silêncio**, e a truncagem contamina tudo o que a tela deriva dela — os quatro
indicadores e os três filtros, inclusive o de data.

Numa tela de conformidade, isso produz três afirmações falsas: *"Total de Logs: 500"* quando o total
é maior, um recorte "Hoje" que pode estar incompleto, e a ausência de qualquer registro antigo sem
que nada avise que a lista é parcial.

Esta feature **passa a ler a trilha de forma paginada**: nenhum registro fica inalcançável, a tela
declara onde está no conjunto, e nenhum indicador se chama "Total" medindo um recorte. A busca
textual continua alcançando 500 registros por vez — **a mesma capacidade de hoje** —, mas passa a
declarar isso, e a navegação entre recortes abre caminho até o resto. O obstáculo não é a tela: é o
contrato. `EntityRepository` (`src/api/contract.ts:68-88`) oferece `list(sort?, limit?)`,
`filter(conditions, sort?, limit?)`, `create`, `update` e `delete` — **não há `offset`, não há
comparação por intervalo e não há contagem**. A extensão do contrato, nas duas implementações, é
parte da entrega.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Análise de Código — Módulo logs-acesso` | "tabela paginada implicitamente (limite 500 registros)" | 🟢 |
| `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | `BR-L04` — "Limite de 500 registros por consulta" | 🟢 |
| `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | `BR-L05` — "Ordenação sempre mais recente primeiro (`-created_date`)" | 🟢 |
| `_reversa_sdd/gaps.md#Lacunas abertas` | `G-02` 🟡 — "carrega 500 registros e renderiza todos os filtrados sem paginação; ainda falta decidir a política desejada acima desse limite" | 🟢 |
| `_reversa_sdd/migration/ambiguity_log.md#AMB-004` | A paridade exata congelou a leitura em até 500 sem paginação, com "política real em fase futura" | 🟢 |
| `_reversa_sdd/logs-acesso/requirements.md#4. Permissões e Segurança` | `Read` restrito a `role == 'admin'` — a leitura é administrativa | 🟢 |
| `_reversa_sdd/logs-acesso/requirements.md#2. Regras de Negócio` | `BR-L01` — trilha *append-only*, vedada edição ou exclusão | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | Os quatro indicadores **não somam o total** (8 de 12, por heurística de substring) | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | O recorte de data **não tem teto superior**: registro com data futura entra em "semana" e "mês" | 🟢 |
| `src/api/contract.ts:68-88` | `list`/`filter` aceitam `sort` e `limit`; **não** há `offset` nem contagem; `filter` compara só com `===` | 🟢 |
| `src/pages/AccessLogs.tsx:87-91` | `AccessLog.asAdmin(scope).list('-created_date', 500)` — o teto e a ordenação | 🟢 |
| `src/pages/__tests__/AccessLogs.test.tsx:200` | A prova afirma os argumentos **exatos** `('-created_date', 500)` | 🟢 |
| `.reversa/reversa-config.json` | `src/**` liberado para edição (`allowLegacyEdits: true`) | 🟢 |

### 2.1 Correção de leitura: o que "paginada implicitamente" esconde

`code-analysis.md` descreve a tabela como *"paginada implicitamente (limite 500 registros)"*. Não há
paginação: há um **teto no pedido**. Medido em 2026-09-25, em `src/pages/AccessLogs.tsx`:

- **A leitura é o teto.** `list('-created_date', 500)` traz os 500 mais recentes. Com 501 registros
  ou mais, o mais antigo **não é lido** — e nada na tela diz que o conjunto é parcial.
- **Os quatro indicadores contam o conjunto lido, não a trilha.** `Total de Logs` é `logs.length`
  (`:206`), e os outros três são filtros por substring sobre a mesma lista (`:211,217,223`).
- **Os filtros operam sobre o conjunto já truncado.** `filteredLogs` (`:102-129`) é derivado de
  `logs`. Escolher "Hoje" filtra **dentro dos 500 mais recentes** — se um dia movimentado gerar mais
  de 500 registros, o recorte "Hoje" também fica incompleto, e é o recorte que um auditor usaria
  primeiro.

Nenhuma das três é comportamento novo de uma feature: é o que o legado faz e o que `AMB-004` congelou.
O que muda é que `G-02` manda decidir o que fazer acima do teto — e a decisão de 2026-09-25 foi
**paginar de verdade**.

### 2.2 O contrato não sustenta paginação, e isso é parte da entrega

| O que uma paginação costuma usar | Existe no contrato? |
|---|---|
| Deslocamento (`offset`/`skip`) | **Não.** `list(sort?, limit?)` — o limite é a única alavanca de recorte |
| Intervalo (`created_date >= X`) | **Não.** `filter` compara apenas com `===` (`BR-MIGRAR-043`) |
| Contagem no servidor | **Não.** Não há operação de contagem |

A entrega inclui **estender o contrato com deslocamento**, nas duas implementações (o adaptador do
provedor e o cliente de modo offline) e reconciliado com a suíte de paridade `PT-010`, que existe
justamente para garantir que as duas concordam. **A contagem continua ausente**, e por isso saber se
há mais registros não pode depender dela — ver `RN-07`.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Auditor / encarregado de dados (LGPD — Lei Geral de Proteção de Dados) | Encontrar **o registro** de um acesso, mesmo antigo, e poder afirmar que a trilha foi percorrida por inteiro | Percorre as páginas do mais recente ao mais antigo até achar o que procura |
| Administrador da clínica | Ver o volume recente de atividade e o que foi visualizado, editado ou excluído | Abre a tela e lê os quatro indicadores |
| Desenvolvedor / auditor de código | Confiar que o número exibido tem origem declarada, e não é o teto da consulta disfarçado de total | Confere na spec o que cada indicador mede |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A leitura da trilha passa a ser **paginada**: a tela pede um recorte por vez e permite
   avançar e voltar. **Nenhum registro da trilha fica inalcançável.** 🟢
   - Fundamento: é uma tela de conformidade; um registro que existe e não pode ser alcançado é uma
     trilha incompleta apresentada como completa.
   - Tipo: nova (substitui o teto herdado; decidida em 2026-09-25 — `#9. Esclarecimentos`, Q1)
2. **RN-02:** Um indicador que mede o conjunto exibido **não se chama "Total"**. O rótulo diz o que
   ele mede. 🟢
   - Origem no legado: `src/pages/AccessLogs.tsx:206` — `Total de Logs` é `logs.length`
   - Tipo: alterada (decidida em `#9. Esclarecimentos`, Q2)
3. **RN-03:** A ordenação é **sempre mais recente primeiro** (`-created_date`), em todas as páginas. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#6` (`BR-L05`)
   - Tipo: alterada (preservação explícita)
4. **RN-04:** A leitura continua **declarando escopo administrativo**, e a tela continua **somente
   leitura**. 🟢
   - Origem no legado: `_reversa_sdd/logs-acesso/requirements.md#4` (`Read` admin-only; correção do
     achado F-04 em 2026-09-24) e `BR-L01` (*append-only*)
   - Tipo: alterada (preservação explícita — não pode regredir com a mudança de leitura)
5. **RN-05:** Os três filtros existentes — busca textual, ação e intervalo de data — continuam
   existindo, com os mesmos rótulos, aplicados **no cliente sobre o recorte exibido**. 🟢
   - Tipo: alterada (preservação explícita de superfície; decidida em `#9. Esclarecimentos`, Q3)
   - **A tela declara o alcance da busca.** Como o recorte é de 500 registros (`RN-08`), a busca
     alcança esses 500 e nenhum outro; a tela diz isso, e a navegação entre recortes é o caminho
     para alcançar os mais antigos. Decidido na segunda sessão de esclarecimentos (Q1).
6. **RN-06:** O contrato de entidade passa a aceitar **deslocamento** na leitura, nas duas
   implementações, e a suíte `PT-010` cobre a paridade entre elas. 🟢
   - Origem no legado: `src/api/contract.ts:68-88`; `src/api/entities.ts:57`; decisão em
     `#9. Esclarecimentos`, Q1
   - Tipo: nova
7. **RN-07:** A tela sabe dizer se **há mais registros** sem recorrer a contagem no servidor — a
   operação de contagem não existe no contrato e não é criada por esta feature. 🟢
   - Tipo: nova
8. **RN-08:** `BR-L04` ("limite de 500 registros por consulta") deixa de ser **teto absoluto** e passa
   a ser o **tamanho do recorte por leitura**. O limite continua existindo — e continua valendo
   **500** —, e o que deixa de existir é a impossibilidade de passar dele. 🟢
   - O valor foi fixado na segunda sessão de esclarecimentos (Q2): manter 500 preserva exatamente o
     recorte do legado, de modo que a renderização não muda; o que muda é existir a página seguinte.
   - Origem no legado: `_reversa_sdd/code-analysis.md#6` (`BR-L04`)
   - Tipo: alterada — é a regra 🟢 que esta feature substitui
9. **RN-09:** Comportamento acima do teto passa a ser decidido e documentado, e não herdado. 🟢
   - Origem no legado: `_reversa_sdd/migration/ambiguity_log.md#AMB-004`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Ler a trilha de forma **paginada** | Must | Com uma trilha maior que o recorte, é possível alcançar registros que **não** estão na primeira página | 🟢 |
| RF-02 | Permitir avançar e voltar entre recortes | Must | Existem controles de navegação; o avanço fica **indisponível** quando não há mais registros, e o retrocesso quando se está no primeiro | 🟢 |
| RF-03 | Nomear os indicadores pelo que eles medem | Must | Nenhum indicador se chama "Total" medindo um recorte | 🟢 |
| RF-04 | Preservar os três filtros e a ordenação | Must | Busca, ação e data continuam com os mesmos rótulos e operam sobre o recorte exibido; a lista continua do mais recente para o mais antigo, em todas as páginas | 🟢 |
| RF-05 | Preservar a leitura administrativa e a tela somente leitura | Must | A leitura declara escopo administrativo; nenhuma linha oferece editar ou excluir | 🟢 |
| RF-06 | Não regredir os estados de carregamento e de lista vazia | Must | Durante a leitura há esqueleto; sem resultado, "Nenhum log encontrado" | 🟢 |
| RF-07 | Estender o contrato de leitura com deslocamento | Must | As duas implementações aceitam e honram o deslocamento, e a suíte de paridade cobre a concordância entre elas | 🟢 |
| RF-08 | Declarar o alcance da busca | Must | A tela afirma, de forma visível, que a busca alcança o recorte exibido — e não a trilha inteira | 🟢 |

> **Nota sobre `RF-02`.** O critério é verificável sem contagem: a tela pede **um registro a mais** do
> que exibe, e a existência desse excedente é o que habilita o avanço. Uma página cheia só é a última
> quando o pedido devolve exatamente o recorte.

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | A leitura continua restrita a administrador, com o escopo declarado no contrato | `BR-MIGRAR-024`; `_reversa_sdd/logs-acesso/requirements.md#4`; correção do F-04 | 🟢 |
| Privacidade | A trilha contém `user_email`, `patient_name` e `ip_address`: é dado pessoal. Nenhuma política pode ampliar quem lê, apenas o quanto se lê | LGPD; `_reversa_sdd/logs-acesso/requirements.md#3` (campos do schema) | 🟢 |
| Integridade | Nenhum registro da trilha pode ficar inalcançável pela interface | `RN-01`; é o defeito que `G-02` nomeia | 🟢 |
| Contrato | A extensão vale para o adaptador do provedor **e** o cliente de modo offline, e a suíte `PT-010` passa a cobri-la | `src/api/contract.ts:68-88`; `src/api/entities.ts:40,57`; `src/api/mockClient.ts` | 🟢 |
| Desempenho | O recorte por leitura é limitado — a leitura **não** cresce com o histórico da clínica | `src/pages/AccessLogs.tsx:90`; `RN-08` | 🟢 |
| Manutenibilidade | A leitura continua num único ponto (`leituraDaTrilha`), para que a política tenha um só lugar | `src/pages/AccessLogs.tsx:87-91` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Trilha maior que um recorte
  Dado que a trilha tem mais registros do que o recorte exibido
  Quando um administrador abre a tela de Logs de Acesso
  Então o controle de avançar está disponível

Cenário: Avançar alcança os registros mais antigos
  Dado que a trilha tem mais registros do que um recorte
  Quando o administrador avança para o recorte seguinte
  Então aparecem registros mais antigos do que os do recorte anterior

Cenário: Último recorte
  Dado que o administrador chegou ao fim da trilha
  Então o controle de avançar fica indisponível

Cenário: Retornar ao primeiro recorte
  Dado que o administrador avançou pelo menos um recorte
  Quando ele retrocede
  Então os registros do recorte anterior voltam a aparecer

Cenário: Indicador nomeado pelo que mede
  Dado que a trilha tem mais registros do que o recorte exibido
  Quando o administrador lê os indicadores
  Então nenhum indicador afirma ser o total da trilha

Cenário: A ordem não regride
  Dado um conjunto de registros em datas distintas
  Quando a lista é exibida, em qualquer recorte
  Então o mais recente aparece primeiro

Cenário: Os filtros continuam funcionando sobre o recorte
  Dado um conjunto de registros com ações e datas distintas
  Quando o administrador filtra por ação e por data
  Então só os registros do recorte exibido que casam com os dois critérios aparecem

Cenário: O alcance da busca é declarado
  Dado que o administrador abriu a tela de Logs de Acesso
  Então a tela afirma que a busca alcança o recorte exibido, e não a trilha inteira

Cenário: Não-admin não lê a trilha
  Dado um usuário autenticado sem papel de administrador
  Quando ele abre a tela de Logs de Acesso
  Então nenhum registro da trilha é exibido

Cenário: Lista vazia
  Dado que nenhum registro casa com o filtro
  Quando a lista é renderizada
  Então a tela exibe "Nenhum log encontrado"

Cenário: As duas implementações concordam sobre o deslocamento
  Dado o mesmo conjunto de registros nas duas implementações do contrato
  Quando ambas são lidas com o mesmo deslocamento e o mesmo limite
  Então as duas devolvem os mesmos registros, na mesma ordem
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É a entrega; sem ela `G-02` não fecha |
| RF-07 | Must | Sem o deslocamento no contrato, `RF-01` não é implementável |
| RF-02 | Must | É o que torna a paginação utilizável, e o que declara que há mais |
| RF-03 | Must | Um "Total" que é teto é a afirmação falsa mais direta da tela |
| RF-08 | Must | Uma busca que não encontra sem dizer por quê faz o auditor concluir que o registro não existe |
| RF-05 | Must | Privacidade e imutabilidade da trilha não podem regredir |
| RF-04 | Must | Superfície preservada |
| RF-06 | Should | Estados já provados; regressão é inaceitável, mas não é o alvo |
| RNF de contrato | Must | É o custo real da política escolhida |

## 9. Esclarecimentos

### Sessão 2026-09-25

Cinco perguntas, respondidas antes do plano. A primeira resolve os três marcadores de dúvida da versão
inicial; as demais decidem indicadores, filtro e dois defeitos herdados.

- **Q:** O que a tela faz quando a trilha passa de 500 registros?
  **R:** Alternativa **(b)** — **paginar de fato**, incluindo a extensão do contrato de entidade com
  deslocamento. As alternativas de menor custo (declarar a parcialidade, remover o teto) foram
  recusadas: declarar mantém o registro antigo inalcançável, e remover o teto troca a truncagem por um
  payload que cresce sem limite. → `RN-01`, `RN-06`, `RN-07`, `RF-01`, `RF-02`, `RF-07`
- **Q:** O que os quatro indicadores passam a medir?
  **R:** Alternativa **(a)** — continuam medindo o **conjunto exibido**, e o rótulo passa a dizer
  isso. A contagem no servidor (alternativa b) foi recusada. → `RN-02`, `RF-03`
- **Q:** O filtro de data continua no cliente, ou vai para o servidor?
  **R:** Alternativa **(a)** — permanece **no cliente**, sobre o conjunto que a política define.
  → `RN-05`
- **Q:** A heurística que classifica as ações entra no escopo?
  **R:** Alternativa **(a)** — **fica fora**. A classificação por substring (onde "Edições" soma
  `edit` **e** `create`, e `login`, `logout`, `upload_exam` e `export_data` não entram em categoria
  nenhuma) permanece como a lacuna declarada e provada que já é.
- **Q:** O recorte "Última semana" e "Último mês" ganha teto superior?
  **R:** Alternativa **(a)** — **permanece como está**. Os dois continuam comparando apenas o piso, e
  um registro com data futura continua entrando nos dois. É paridade provada, e corrigir quebraria a
  verificação de propósito.

#### Decisões derivadas — não perguntadas, e por quê

- **A contagem no servidor não é criada.** `RN-07` decorre de `RF-02` + contrato: sem operação de
  contagem, saber se há mais registros exige pedir **um a mais** do que se exibe. A verificação é
  aritmética, não decisão de produto.
- **`BR-L04` deixa de ser teto absoluto.** Decorre de Q1.b. O limite continua existindo como tamanho
  do recorte — o que a decisão remove é a impossibilidade de passar dele. → `RN-08`
- **As duas implementações andam juntas.** Decorre de `RN-06` + `PT-010`: meia extensão faria o modo
  offline divergir do adaptador, que é exatamente o que a suíte de paridade existe para impedir.

#### Consequência que a primeira sessão não cobriu

A combinação de Q1.b com Q3.a produziu um efeito que nenhuma das duas respostas antecipava: com
paginação real, "o conjunto carregado" passa a ser **uma página**, e a busca textual — que é do
cliente — deixa de encontrar registros que estejam em outra página. Procurar por um usuário que só
aparece na página 4 não devolveria nada na página 1. Isso ficou registrado como lacuna aberta, e foi
**fechado na segunda sessão**, abaixo.

### Sessão 2026-09-25 — segunda rodada

Duas perguntas: a lacuna que a primeira sessão deixou, e um parâmetro que ela não fixou.

- **Q:** Como a busca textual alcança os registros que não estão no recorte exibido?
  **R:** Alternativa **(a)** — **declarar na tela** que a busca alcança apenas o recorte exibido. A
  operação de busca no servidor foi recusada porque `filter` compara só com `===` e não expressa
  substring: ela custaria uma operação **nova** no contrato, nas duas implementações. A busca sob
  demanda por todas as páginas foi recusada por transformar cada busca numa sequência de N leituras.
  → `RN-05`, `RF-08`
- **Q:** Quantos registros por recorte?
  **R:** Alternativa **(a)** — **500**, o mesmo valor do legado. → `RN-08`

#### Por que as duas respostas juntas fecham a lacuna sem regressão

Vale registrar, porque o resultado é melhor do que a pergunta sugeria. A busca alcança 500 registros
por vez — **exatamente o que ela alcança hoje**, quando o teto de 500 é o conjunto inteiro. Nada
regride na capacidade de busca.

O que muda é que os registros fora desses 500 deixam de ser **inalcançáveis**: o auditor chega até
eles pela navegação entre recortes, e a busca volta a alcançá-los quando a página muda.

Antes: 500 registros acessíveis e o resto invisível para sempre. Depois: 500 por vez, e **todos**
acessíveis. A limitação declarada é a mesma que já existia — o que muda é ela ser dita, e passar a
existir caminho até o resto.

## 10. Lacunas

**Nenhuma lacuna aberta.** Os cinco pontos que passaram por esclarecimento estão resolvidos, e as
duas lacunas herdadas que ficaram fora do escopo continuam declaradas na extração — não aqui.

| Ponto esclarecido | Resposta | Regra |
|-------------------|----------|-------|
| Política acima do teto | Paginar de fato, estendendo o contrato com deslocamento | `RN-01`, `RN-06`, `RN-09` |
| Recorte por página | 500, o mesmo valor do legado | `RN-08` |
| O que os indicadores medem | O conjunto exibido, com rótulo que diz isso | `RN-02`, `RF-03` |
| Filtro de data | Permanece no cliente, sobre o recorte exibido | `RN-05` |
| Alcance da busca | Declarado na tela: alcança o recorte, não a trilha | `RN-05`, `RF-08` |
| Heurística que classifica as ações | Fora do escopo — permanece lacuna declarada e provada | — |
| Teto superior dos recortes de data | Fora do escopo — permanece paridade provada | — |

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-25 | Sessão de esclarecimentos: Q1–Q5 respondidas, 3 marcadores resolvidos, `RN-01`…`RN-09` fixadas, contrato passa a ser parte da entrega; **nova lacuna aberta** sobre o alcance da busca | reversa |
| 2026-09-25 | Segunda sessão: alcance da busca declarado na tela e recorte fixado em 500 registros — a lacuna fecha **sem regressão** de capacidade de busca. `RF-08` acrescentado, `RN-05` e `RN-08` completadas. **Zero marcadores abertos** | reversa |

## Pendências de Qualidade

Ressalvas da auto-validação contra `.reversa/templates/quality-template.md`:

- **Q-005 (Completude) — resolvido nesta sessão.** Na versão inicial o critério de `RF-01` não era
  verificável, porque a política era o objeto da dúvida. Com Q1 respondida, o critério passou a ser
  concreto ("é possível alcançar registros que não estão na primeira página").
- **Q-019 / Q-020 (Princípios) — não avaliáveis.** O checklist manda confrontar cada Regra de Negócio
  com os princípios ativos em `.reversa/principles.md`, mas **esse arquivo não existe** no projeto,
  embora `.reversa/setup.json` declare `principles.enabled: true` com `auto-load-into-plan: true`.
  As nove regras desta feature **não** foram confrontadas com princípio algum, porque não há princípio
  registrado a confrontar.
- **Q-018 (SoluçãoImplícita) — reavaliar.** O nome do produto do provedor foi retirado na geração
  inicial. A referência ao "adaptador do provedor" e ao "cliente de modo offline" descreve as duas
  implementações do contrato sem nomear biblioteca ou produto comercial.

---
*Gerado pelo Reversa-Requirements em 2026-09-27.*
