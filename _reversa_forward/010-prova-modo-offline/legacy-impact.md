# Impacto no Legado: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Âncora de contexto: **legado** — `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`
> Extração de referência: `_reversa_sdd/`, `_reversa_sdd/migration/`

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido antes da primeira escrita fora das pastas do Reversa:

| Campo | Valor observado |
|-------|-----------------|
| `allowLegacyEdits` | `true` |
| `allowedPaths` | `["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]` |
| Caminhos que a feature precisou | `src/api/__tests__/mockClientOffline.test.ts` e `src/api/__tests__/offlineActivation.test.ts` |
| Resultado | **Liberados** — ambos casam com o glob `src/**` |

Nenhuma liberação irrestrita foi necessária, nenhum caminho fora da lista foi pedido, e a config
**não foi alterada** por esta feature.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/api/__tests__/mockClientOffline.test.ts` | Arnês de prova do adaptador (novo) | `componente-novo` | **LOW** | Arquivo de teste, fora do caminho de execução. **21 verificações** sobre semeadura, persistência, ciclo de vida do registro, filtro, ordenação, ausência de regra de acesso, acesso dinâmico, no-ops e integrações |
| `src/api/__tests__/offlineActivation.test.ts` | Arnês de prova da ativação (novo) | `componente-novo` | **LOW** | Arquivo de teste. **2 verificações** — as duas metades da ativação —, com a fábrica do provedor substituída e o registro de módulos descartado |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganha a seção de paridade do grupo `09`, seis linhas novas em lacunas de prova, o destino do grupo marcado como concluído, o saldo 22 → **16** (só visual) e a linha de medição da feature 010 |
| `_reversa_forward/010-prova-modo-offline/*` | Artefatos do ciclo forward | `componente-novo` | **LOW** | Requirements, roadmap, investigação, delta de dados, onboarding, ações, progresso, watch e este arquivo |

> **Nenhum arquivo de aplicação foi tocado.** É o critério `CF-02`, medido por comando:
> `src/api/mockClient.ts`, `src/api/mockSeed.ts`, `src/api/base44Client.ts`,
> `src/lib/AuthContext.tsx`, `src/types/User.ts` e as duas provas herdadas permanecem **byte a byte**
> como estavam.

## Diff conceitual por componente

### Arnês de prova do adaptador — `src/api/__tests__/mockClientOffline.test.ts` (novo)

Prova os seis cenários de `PT-009` que se medem **executando** o adaptador, mais as regras que a unit
declara e nenhum cenário nomeia. Três decisões dão forma ao arquivo:

1. **O estado de partida é afirmado, não suposto** (`R-04`). O `beforeEach` limpa o armazenamento **e
   confere** que ele está vazio — limpeza sem conferência é suposição, e suposição é o que faz uma
   verificação passar sem medir.
2. **A entidade de rascunho está fora do domínio** (`D-06`). O acesso é dinâmico e devolve
   repositório para qualquer nome; usar um nome sem seed dá ponto de partida vazio e determinístico,
   sem tocar nos dados de demonstração. As provas que dependem do seed usam uma entidade **semeada**,
   porque sem isso o desfecho não distinguiria tolerância de ausência (`D-08`).
3. **O identificador não é afirmado por formato** (`D-10`). O adaptador usa o gerador do navegador
   quando existe e cai para um identificador próprio quando não existe; o que a regra promete é o
   identificador, não a forma.

### Arnês de prova da ativação — `src/api/__tests__/offlineActivation.test.ts` (novo)

Duas verificações, e mais nada — porque a promessa é uma **decisão que acontece uma vez por
processo**. A variável é lida no carregamento do módulo, de modo que observar as duas metades exige
descartar o registro de módulos e importar de novo; essa intervenção é global, e é por isso que ela
mora sozinha aqui (`D-01`).

A metade negativa é a decisão de instrumento da rodada: **substitui-se a fábrica do provedor e
afirma-se que ela foi chamada**, em vez de carregar o provedor real — que constrói um cliente com os
parâmetros da aplicação e, sem configuração, poderia lançar por motivo **alheio à promessa**.

### Matriz de rastreabilidade — `_reversa_sdd/code-spec-matrix.md`

O que muda, e por quê:

- **A seção do grupo `09`** passa a existir, com o veredito dos seis cenários e a nota de que a prova
  ocupa **dois** arquivos.
- **O destino do grupo `09`** sai de "feature a criar" para concluído — o bloqueio declarado era de
  **escopo**, e foi resolvido pela decisão sobre `L1` a `L7`.
- **Seis linhas novas em lacunas de prova**, incluindo os quatro achados e o veredito das limitações
  declaradas.
- **O saldo** passa de 22 para **16 transferidos dos 50** — e os 16 são **todos** de paridade visual.
  Os **39 cenários de fluxo estão provados**, o que encerra a conversão começada pela feature 002.

## Preservadas

Regras 🟢 que **continuam intactas** — esta feature as prova, não as altera:

| Regra | Origem | Situação |
|-------|--------|----------|
| Ativação exclusiva por variável de construção | `BR-OFF01`, `BR-OFF02` | Preservada — e agora **provada** nas duas metades |
| Sessão imediata como usuário de demonstração | `BR-OFF03`; `questions.md#Q-16` | Preservada — **citada** da prova herdada |
| Semeadura na primeira leitura sob chave prefixada | `BR-OFF04` | Preservada — e agora **provada** contra o seed real |
| Operações expostas pelo adaptador | `BR-OFF05` | Preservada — exercitadas uma a uma |
| Criação popula identificador, data de criação e data do registro | `BR-OFF06` | Preservada — e agora **provada**, com a ressalva do identificador informado |
| Atualização preserva identificador e mescla; registro ausente rejeita | `BR-OFF07` | Preservada — e agora **provada**, com a mensagem exata |
| Filtro por igualdade estrita | `BR-OFF08` | Preservada — e agora **provada**, inclusive a ausência de operadores |
| Ordenação de um campo, com o corte depois de ordenar | `BR-OFF09` | Preservada — e agora **provada** |
| No-ops de sessão e telemetria | `BR-OFF11`, `BR-OFF12` | Preservada — e agora **provada** |
| Acesso dinâmico a entidades, sem lançar | `modo-offline/requirements.md#3.2` | Preservada — e agora **provada** |
| O adaptador não aplica regra de acesso | `BR-OFF10`; `L1` | Preservada — **intencional**, e agora provada na forma forte |
| Contrato único de leitura escopada | `addenda/001-migracao-typescript.md#Vigência` | Preservada — o cliente exportado em modo offline honra o mesmo contrato, e a prova o exercita por ele |

## Modificadas

**Nenhuma.** Esta feature não altera, remove nem rebaixa regra de negócio alguma: ela transforma em
medição o que era promessa. Os quatro achados que ela encontra — `OFFLINE_USER` duplicado, a
ativação lida em dois módulos, o discriminante `kind` sem consumidor e a criação que aceita
identificador do chamador — são **registrados**, e não corrigidos, por decisão das sessões de
esclarecimentos. Corrigi-los mudaria comportamento observável e sairia do perímetro de prova, que é
o que `CF-02` mede.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-coding` — nenhum arquivo de aplicação afetado | reversa |
