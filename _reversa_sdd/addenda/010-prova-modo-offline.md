# Adendo: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/010-prova-modo-offline/`

## Vigência

Vigente desde 2026-09-22.

## Resumo da entrega

Converter os seis cenários de fluxo de `PT-009` em prova automatizada — o **último grupo de fluxo
transferido** pela feature 002. Com ele, os **39 cenários de fluxo do projeto estão provados**, e o
que resta no mapa são apenas os 16 de paridade visual, cujo destino é um harness de comparação.

Entrega principal: `src/api/__tests__/mockClientOffline.test.ts`, com **21 verificações** sobre o
adaptador, e `src/api/__tests__/offlineActivation.test.ts`, com **2** — as duas metades da ativação.
A suíte passou de 145 verificações em 24 arquivos para **168 em 26**, com 0 falhas.

A promessa desta feature tem **duas naturezas**, e é isso que explica os dois arquivos: uma parte se
mede executando o adaptador, e outra se mede **no carregamento do módulo**, porque a variável de
ativação é lida uma vez por processo. A metade negativa é provada **substituindo a fábrica do
provedor** e afirmando que ela foi chamada, em vez de carregar o provedor real — que poderia lançar
por motivo alheio à promessa.

**20 de 20 ações concluídas**, sem execução parcial.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-spec-matrix.md` | `#Cenários de paridade do grupo 09` | `regra-nova` | A seção **nasce** com o veredito dos seis cenários de `PT-009`. **Leia como:** a prova ocupa **dois** arquivos, porque a promessa não vive numa tela |
| `_reversa_sdd/code-spec-matrix.md` | `#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo `09` sai de "feature a criar" e entra como concluído. **Leia como:** o bloqueio declarado era de **escopo** (`L1` a `L7`), não de produto, e foi resolvido. O saldo passa de 22 para **16 transferidos dos 50**, e os 16 são **todos de paridade visual** |
| `_reversa_sdd/code-spec-matrix.md` | `#Lacunas de prova` | `regra-alterada` | Seis linhas novas — `L1` provada na forma forte, `L2` e `L7` declaradas com veredito, a criação que aceita identificador do chamador, `OFFLINE_USER` duplicado, a ativação lida em dois módulos e o discriminante `kind` sem consumidor. **Leia como:** a linha dos módulos restantes passa a **✅ Fechada**, com zero cenários de fluxo pendentes |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` | `regra-alterada` | Entra a linha de medição da feature `010` (168 verificações, 26 arquivos, 69,8 s a 70,5 s). **Leia como:** o teto de 90 s foi cumprido **com folga maior** que na rodada anterior, com 24 verificações a mais — a duração mede o ambiente tanto quanto o código |
| `_reversa_sdd/modo-offline/requirements.md` | `#2. Regras de Negócio` | `regra-alterada` | As doze regras `BR-OFF01` a `BR-OFF12` passam de declaração a **veredito**: dez provadas por execução, uma citada da prova herdada, e `BR-OFF10` provada como comportamento **intencional**. **Leia como:** nenhuma regra mudou de conteúdo |
| `_reversa_sdd/modo-offline/requirements.md` | `#7. Pontos de Atenção` e `#8. Critérios de Aceite` | `regra-alterada` | Os pontos `P1` a `P5` ganham veredito, e os critérios de aceite da unit — que falam de **tela** — ficam registrados como **sem medição própria**: nenhum cenário de `PT-009` descreve tela, e a lista de pacientes é superfície já provada pela feature 002. **Leia como:** `P1` (aviso visual de dados fictícios) continua **não implementado** |
| `_reversa_sdd/code-analysis.md` | `#10.5 Limitações funcionais` | `regra-alterada` | As sete limitações `L1` a `L7` ganham veredito explícito: `L1`, `L3`, `L4`, `L5` e `L6` **afirmadas** por verificação; `L2` e `L7` **declaradas** — a primeira não é exercitável num ambiente de uma aba, e a segunda é risco de privacidade, não comportamento. **Leia como:** a tabela de limitações deixa de ser só um aviso e passa a dizer o que está medido |
| `_reversa_sdd/code-analysis.md` | `#10.4 Persistência` | `regra-alterada` | A semeadura na primeira leitura passa a ter prova contra o **seed real**, e a tolerância a conteúdo corrompido idem. **Leia como:** o que era descrição de comportamento é agora comportamento verificado |
| `_reversa_sdd/questions.md` | `#Q-13` a `#Q-16` | `regra-alterada` | As quatro respostas ganham medição. **Leia como:** `Q-14` recomendou um **aviso visual** para o modo offline, e ele **não foi implementado** — a recomendação segue aberta, e implementá-la mudaria comportamento observável, fazendo a prova mudar de propósito |
| `_reversa_sdd/gaps.md` | `#G-04` | `regra-alterada` | A lacuna do aviso visual permanece **aberta**, agora com a nota de que nenhuma prova a cobre. **Leia como:** é lacuna de **produto**, não de prova |
| `_reversa_sdd/migration/parity_tests/09-modo-offline.feature` | Todos os cenários de `PT-009` | `regra-alterada` | Os seis cenários ganham veredito. **Leia como:** `PT-009.1` é provado nas duas metades, com a **ressalva** de que a negativa afirma a chamada da fábrica e não o funcionamento do provedor real; e `PT-009.5` carrega o achado de que a criação aceita identificador do chamador |
| `_reversa_sdd/migration/target_architecture.md` | `#BC-08 modo offline` | `regra-alterada` | O contexto delimitado passa a ter **prova de adaptador e de carregamento**. **Leia como:** o contrato único é honrado pelo adaptador local, e isso é exercitado **através do cliente tipado**, não por chamada direta |
| `_reversa_sdd/migration/parity_specs.md` e `_reversa_sdd/migration/handoff.md` | Métrica primária e o que está provado hoje | `regra-alterada` | As duas citam "132 verificações em 23 arquivos". **Leia como:** 168 em 26, medidos em 2026-09-22 — e os **39 cenários de fluxo estão convertidos** |

## Regras sob vigilância

Onze itens no watch principal da feature — `W001` a `W011`, em
`_reversa_forward/010-prova-modo-offline/regression-watch.md`. Dez observações (`O001` a `O010`)
ficam registradas no mesmo arquivo, **sem peso de regressão**: são as regras que já eram 🟡 ou 🔴 na
origem, e entre elas estão as limitações declaradas.

- `W001` — ativação exclusiva por variável de construção, nas duas metades
- `W002` — sessão imediata como usuário de demonstração (herdado, **citado**)
- `W003` — semeadura na primeira leitura sob a chave prefixada, com queda para o seed
- `W004` — a criação popula identificador, data de criação e data do registro
- `W005` — a atualização preserva o identificador e mescla
- `W006` — registro ausente rejeita com a mensagem exata
- `W007` — o filtro casa apenas por igualdade estrita
- `W008` — ordenação de um campo, com o corte **depois** de ordenar
- `W009` — os no-ops de sessão
- `W010` — o no-op de telemetria
- `W011` — o acesso dinâmico a entidades, sem lançar

## Fontes

- `_reversa_forward/010-prova-modo-offline/legacy-impact.md`
- `_reversa_forward/010-prova-modo-offline/regression-watch.md`
- `_reversa_forward/010-prova-modo-offline/requirements.md`
- `_reversa_forward/010-prova-modo-offline/roadmap.md`
- `_reversa_forward/010-prova-modo-offline/investigation.md`
- `_reversa_forward/010-prova-modo-offline/onboarding.md`
- `_reversa_forward/010-prova-modo-offline/progress.jsonl`
- `_reversa_forward/010-prova-modo-offline/actions.md`
