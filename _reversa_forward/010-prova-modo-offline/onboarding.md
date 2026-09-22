# Onboarding: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Para quem vai **executar e conferir** esta feature pela primeira vez.

## 1. Pré-requisitos

| Item | Versão / estado | Como conferir |
|------|-----------------|---------------|
| Node.js | o mesmo que roda a suíte hoje | `node --version` |
| Dependências instaladas | `node_modules` presente | `npm ls --depth=0` |
| Nenhuma credencial | **não** é preciso conta, token nem rede | — |
| O projeto compila antes de começar | linha de base íntegra | `npm run typecheck` → 0 erros |

> A prova do modo offline **não** liga o modo offline na aplicação. Ela substitui o ambiente dentro
> do processo de prova, e um processo por arquivo — a variável não vaza para a suíte.

## 2. Os comandos, em ordem

```bash
# 1. A suíte completa — é aqui que a prova desta feature vive
npm test

# 2. A guarda de codificação sobre o texto do projeto
npm run prova:encoding

# 3. Os gates que não podem regredir
npm run typecheck
npm run lint
```

> **Nota de ambiente.** `npm test` compila com o empacotador e precisa de acesso pleno ao processo
> filho; em ambiente confinado ele falha com erro de permissão ao criar o processo. Não é falha da
> feature — é a mesma condição registrada nas features 005 a 009.

## 3. Onde a prova vive

| Arquivo | Papel |
|---------|-------|
| `src/api/__tests__/offlineActivation.test.ts` | A ativação: qual cliente o módulo exporta, e sob qual condição |
| `src/api/__tests__/mockClientOffline.test.ts` | O adaptador: semeadura, persistência, filtro, ordenação, recusas |
| `src/api/__tests__/mockClient.test.ts` | Prova herdada da feature 001 — **não é tocada** |
| `src/lib/__tests__/AuthContext.test.tsx` | Prova herdada da sessão offline — **não é tocada** |
| `src/api/mockClient.ts`, `src/api/base44Client.ts`, `src/lib/AuthContext.tsx` | O objeto da prova — **não são tocados** |

## 4. Onde ler o resultado da feature

1. `roadmap.md` — o caminho técnico, as dezesseis decisões e os oito riscos.
2. `investigation.md` — por que dois arquivos, e o que foi descartado.
3. `data-delta.md` — a confirmação de que **nenhum dado** mudou.
4. `actions.md` — o que foi feito, ação por ação.
5. `progress.jsonl` — o registro cronológico, incluindo correções e desvios.
6. `regression-watch.md` — o que a feature observou e não consertou.

## 5. O que conferir com os próprios olhos

### 5.1 A tabela requisito × cenário

| Requisito | Cenário / regra de origem | Como é provado |
|-----------|---------------------------|----------------|
| `RF-01` | `PT-009.1` · `BR-OFF01` | **ativação** — com a variável ligada, o cliente exportado lê do armazenamento e a fábrica do provedor não é chamada |
| `RF-02` | `PT-009.1` · `BR-OFF02` | **ativação** — sem a variável, a fábrica do provedor **é chamada** |
| `RF-03` | `PT-009.2` · `BR-OFF03` | **citação** — a prova herdada da sessão já cobre, com ambiente substituído |
| `RF-04` | `PT-009.2` · `BR-MIGRAR-039` | **citação** — os casos de compilação da feature 008 recusam a extração do papel |
| `RF-05` | `PT-009.3` · `BR-OFF04` | **valor** — sem a chave, a primeira leitura grava o seed sob a chave prefixada |
| `RF-06` | `PT-009.3` · `BR-OFF04` | **valor** — criar, atualizar e excluir refletem na leitura seguinte, e sobrevivem a nova instância |
| `RF-07` | `BR-OFF04` | **valor** — conteúdo inválido na chave não lança e devolve o seed |
| `RF-08` | `PT-009.4` · `BR-OFF10` · `L1` | **valor** — registro com dono alheio é visível e editável |
| `RF-09` | `PT-009.5` · `BR-OFF06` | **valor** — criação preenche identificador e datas |
| `RF-10` | `PT-009.5` · `BR-OFF07` | **valor** — atualização preserva o identificador e mescla |
| `RF-11` | `PT-009.5` · `BR-OFF07` | **valor** — identificador desconhecido rejeita com a mensagem exata |
| `RF-12` | `PT-009.6` · `BR-OFF08` · `L4` | **valor** — só a igualdade exata casa |
| `RF-13` | `PT-009.6` · `BR-OFF09` · `L5` | **valor** — ascendente, descendente e corte após ordenar |
| `RF-14` | `#3.2` | **valor** — nome sem seed devolve repositório e conjunto vazio |
| `RF-15` | `BR-OFF11` · `BR-OFF12` | **valor** — os no-ops não mudam o armazenamento |
| `RF-16` | `L3` | **valor** — envio devolve dado embutido e não persiste |
| `RF-17` | `L6` | **ausência** — o repositório não expõe leitura por identificador |
| `RF-18` | `BR-OFF06` | **registro** — identificador informado sobrepõe o gerado |
| `RF-19` | `#6` | **valor** — o envio de e-mail rejeita com mensagem própria |
| `RF-20` | `BR-OFF07` | **registro** — excluir identificador inexistente resolve com sucesso |
| `RF-21` | decisão `1a` | **inspeção** — o veredito de `L1` a `L7` está na §5.3 |
| `RF-22` | `PT-007.3` | **suíte** — as quatro provas herdadas seguem verdes, sem reescrita |

> **Vinte e três verificações novas**, e a distribuição por arquivo é a decisão `D-01` em números:
> **21** no arquivo do adaptador, cobrindo `RF-05` a `RF-20`; e **2** no arquivo da ativação,
> cobrindo `RF-01` e `RF-02` — o ramo positivo e o negativo, e mais nada.
>
> **Dois requisitos não têm verificação, e é deliberado.** `RF-03` e `RF-04` são **citações**: a
> autenticação imediata já é provada por `src/lib/__tests__/AuthContext.test.tsx`, que substitui o
> ambiente e descarta o registro de módulos, e a ausência estrutural de papel é provada pelos casos
> de compilação da feature `008-prova-contrato-dados`. **`RF-21`** é **inspeção**: o veredito das
> limitações é documental, e um teste que afirmasse o conteúdo do próprio documento mediria a si
> mesmo.

### 5.2 As três conferências de fechamento

| Critério | Comando | O que se espera |
|----------|---------|-----------------|
| `CF-01` | `npm test` | Duração total abaixo de 90 s. Medido: **69,79 s** e **70,53 s** em duas execuções, com 168 verificações em 26 arquivos e 0 falhas |
| `CF-02` | `git status --short` sobre o adaptador, o seed, a ativação, a sessão, os tipos e as duas provas herdadas | vazio |
| `CF-03` | `npm run prova:encoding` | 0 sequências, com contagem **maior** que a da 009. Medido: **462** |

### 5.3 O veredito de cada limitação

Esta é a conferência que o `RF-21` promete. Ela é **documental**: nenhuma verificação a executa, e
por isso vive aqui, e não num teste que mediria a si mesmo.

| Limitação | Veredito | Onde |
|-----------|----------|------|
| `L1` sem regra de acesso | **Afirmada** | Verificação do `RF-08`, com registro de dono alheio |
| `L2` escritas concorrentes entre abas | **Declarada** | Não exercitável: o ambiente simulado tem uma aba |
| `L3` envio de arquivo não persiste | **Afirmada** | Verificação do `RF-16` |
| `L4` filtro estrito | **Afirmada** | Verificação do `RF-12` |
| `L5` ordenação de um campo | **Afirmada** | Verificação do `RF-13` |
| `L6` sem leitura direta por identificador | **Afirmada** | Verificação do `RF-17` |
| `L7` dados de pacientes no armazenamento | **Declarada** | Risco de privacidade, não comportamento |

## 6. O que **não** está coberto

- **`L2` e `L7`**, pelos motivos da §5.3.
- **A metade negativa da ativação, no que ela tem de real** — a prova afirma que a **fábrica do
  provedor foi chamada**, e não que o provedor real funciona.
- **A troca de modo em execução** — não existe: a variável é lida na construção.
- **O conteúdo visual da aplicação em modo offline** — os 16 cenários de paridade visual continuam
  transferidos para um harness próprio.
- **O provedor real** — nenhuma verificação fala com o servidor.

## 7. Registro de execução

> A preencher por `/reversa-coding`, com a medição real e a condição em que foi feita.

| Item | Valor |
|------|-------|
| Data da execução | 2026-09-22 |
| Verificações na suíte | **168** (145 herdadas + **23** desta feature: 21 do adaptador e 2 da ativação) |
| Arquivos na suíte | **26** (24 herdados + 2) |
| `CF-01` duração | **69,79 s** na primeira medição e **70,53 s** na segunda — 0 falhas nas duas |
| `CF-01` condição de medição | Máquina mais calma que no fechamento da 009, onde a mesma suíte (menor) mediu 85,86 s e 87,43 s. **O teto não foi o problema desta vez, e a razão é a carga, não a feature** — a 006 já registrou 122,57 s sob carga para código que rodava em 75,78 s calmo. O risco `R-01` era o mais provável da rodada e **não se materializou** |
| `CF-02` estado do repositório | **Vazio** para `src/api/mockClient.ts`, `src/api/mockSeed.ts`, `src/api/base44Client.ts`, `src/lib/AuthContext.tsx`, `src/types/User.ts`, `src/api/__tests__/mockClient.test.ts` e `src/lib/__tests__/AuthContext.test.tsx`. Só dois arquivos novos |
| `CF-03` arquivos verificados | **462**, 0 sequências |
| `typecheck` / `lint` | **0** e **0**, sem ocorrência nenhuma |
| `prova:negativos` | Não executado nesta rodada — a feature não toca o arnês de casos negativos. O comando segue com 16 casos desde a 008 |
| Desvios registrados | **Três.** (1) Um bloco que eu havia acrescentado além do plano — o carimbo de dono na criação — foi **removido** ao perceber que **duplica** uma verificação herdada da feature 001, contra a decisão `D-12`. (2) `T010` a `T014` foram reapontadas do arquivo de ativação para o do adaptador ainda no `/reversa-to-do`, por eu ter distribuído por fase em vez de por arquivo. (3) A ordem de `T018` foi antecipada em relação à documentação, porque a §5.2 do onboarding precisa dos **números medidos**, e não dos esperados — o que me fez escrever por antecipação um valor de contagem que **estava errado**, e corrigi-lo depois da medição |

### 7.1 A falsificação que antecedeu o verde

As duas primeiras execuções passaram com **23 de 23** verificações. Verde de primeira não distingue
medição de stub, então **três** asserções foram deliberadamente quebradas antes de o resultado ser
aceito:

| Asserção | Quebra aplicada | O que a suíte respondeu |
|----------|-----------------|-------------------------|
| `RF-02` — a fábrica do provedor é chamada sem a variável | esperado que **não** fosse chamada | `expected "spy" to not be called at all, but actually been called 1 times` — a metade negativa mede o ramo real |
| `RF-13` — o limite corta **depois** de ordenar | esperado `['Carlos', 'Ana']`, a ordem pré-ordenação | `expected [ 'Ana', 'Bruno' ] to deeply equal [ 'Carlos', 'Ana' ]` — a ordenação realmente acontece antes do corte |
| `RF-12` — o filtro casa por igualdade exata | esperado 3 registros com valor 10 em vez de 2 | `expected [...] to have a length of 3 but got 2` — a contagem por igualdade estrita é real |

As três quebras produziram exatamente as três falhas esperadas, e nada mais. As alterações foram
revertidas em seguida. A primeira é a que importa: ela prova que a decisão de instrumento `3a` do
clarify — **substituir a fábrica em vez de carregar o provedor real** — mede de fato o ramo, e não a
ausência de chamada por acidente de arranjo.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-09-22 | Tabela requisito × cenário com a distribuição por arquivo; registro de execução com as duas medições; §7.1 com as três falsificações que antecederam o verde | reversa |
