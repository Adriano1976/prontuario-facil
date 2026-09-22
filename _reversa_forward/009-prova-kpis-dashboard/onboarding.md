# Onboarding: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Para quem vai **executar e conferir** esta feature pela primeira vez.

## 1. Pré-requisitos

| Item | Versão / estado | Como conferir |
|------|-----------------|---------------|
| Node.js | o mesmo que roda a suíte hoje | `node --version` |
| Dependências instaladas | `node_modules` presente | `npm ls --depth=0` |
| Nenhuma credencial | **não** é preciso conta, token nem rede | — |
| O projeto compila antes de começar | linha de base íntegra | `npm run typecheck` → 0 erros |

> Esta feature **não** alcança o provedor de dados. Toda a massa é sintética e vive no processo de
> teste; se algum comando tentar rede, algo saiu do trilho.

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
> feature — é a mesma condição registrada nas features 005 a 008.

## 3. Onde a prova vive

| Arquivo | Papel |
|---------|-------|
| `src/pages/__tests__/DashboardKpis.test.tsx` | As verificações dos KPIs |
| `src/test/dashboardFixtures.ts` | A massa das quatro entidades e os auxiliares de data |
| `src/pages/__tests__/Dashboard.test.tsx` | A prova herdada de `PT-007.3` — **não é tocada** |
| `src/pages/Dashboard.tsx` | O objeto da prova — **não é tocado** |

## 4. Onde ler o resultado da feature

1. `roadmap.md` — o caminho técnico, as treze decisões e os oito riscos.
2. `investigation.md` — por que este instrumento, e o que foi descartado.
3. `data-delta.md` — a confirmação de que **nenhum dado** mudou.
4. `actions.md` — o que foi feito, ação por ação.
5. `progress.jsonl` — o registro cronológico, incluindo correções e desvios.
6. `regression-watch.md` — o que a feature observou e não consertou.

## 5. O que conferir com os próprios olhos

### 5.1 A tabela requisito × cenário

Cada requisito e o instrumento que o prova. **Treze verificações novas** vivem em
`src/pages/__tests__/DashboardKpis.test.tsx`; a décima quarta é **herdada** da feature 006 e
permanece intocada.

| Requisito | Cenário / regra de origem | Verificações | Como é provado |
|-----------|---------------------------|:---:|----------------|
| `RF-01` | `PT-008.1` · `BR-MIGRAR-027` | 1 | **valor** — o cartão exibe 3 com massa de 3 ativos e 2 inativos |
| `RF-02` | `PT-008.2` · `BR-MIGRAR-028` | 3 | **valor** — exclui o cancelado de hoje e ignora outra data; `faltou`, `concluido` e `confirmado` **contam**; exibe zero sem agendamento hoje |
| `RF-03` | `PT-008.3` · `AMB-002` | 1 | **ausência** — o painel tem os quatro cartões do legado, exatamente eles, e nenhum é contador de consultas de hoje |
| `RF-04` | `PT-008.4` · `AMB-001` | 1 | **valor** — um único percentual em todo o painel, e é a constante; sem texto de tendência |
| `RF-05` | `PT-008.5` · `BR-MIGRAR-030` | 3 | **valor e pertinência** — corta em cinco, ignora passado e futuro cancelado, e o estado vazio traz o atalho |
| `RF-06` | `BR-MIGRAR-029` | 2 | **valor** — reflete o tamanho da leitura, e exibe zero quando a leitura vem vazia |
| `RF-07` | `BR-MIGRAR-033` | 1 | **transporte** — os quatro pares de ordenação e limite, mais **uma** chamada por leitura |
| `RF-08` | `BR-MIGRAR-033` | 1 | **transporte** — o escopo que a resolução **real** produz, sem dublê de sessão |
| `RF-09` | `AMB-001` | — | **inspeção** — a divergência está no cabeçalho do arquivo de prova e na §5.3. Não vira asserção: um teste que afirma o conteúdo do próprio arquivo mede a si mesmo |
| `RF-10` | `PT-007.3` | herdada: 1 | **inspeção e suíte** — `Dashboard.test.tsx` segue verde e sem alteração, e `CF-02` confere que o arquivo não foi tocado |

> **Por que três requisitos não têm verificação própria.** `RF-09` é uma afirmação sobre o
> conteúdo de um artefato, e não um comportamento — a distinção é a mesma que rebaixou o teto de
> duração e o perímetro de arquivos a critérios de fechamento (decisão `4a` do clarify). `RF-10` é
> satisfeito por uma verificação que **já existe**, em outro arquivo: reescrevê-la aqui criaria dois
> pontos de verdade para a mesma cláusula. E `RF-01` a `RF-08` cobrem os dez requisitos de
> comportamento com as treze verificações acima.

### 5.2 As três conferências de fechamento

Não são verificações da suíte — são medidas por comando, e precisam ser **registradas com a
condição de medição**:

| Critério | Comando | O que se espera |
|----------|---------|-----------------|
| `CF-01` | `npm test` | Duração total abaixo de 90 s. Medido: **85,86 s** e **87,43 s** em duas execuções, com 145 verificações em 24 arquivos e 0 falhas |
| `CF-02` | `git status --short` sobre `src/pages/Dashboard.tsx`, `src/api`, `src/types`, `src/lib`, `base44/entities` | vazio |
| `CF-03` | `npm run prova:encoding` | 0 sequências, com a contagem de arquivos **maior** que a da 008 (443). Medido: **450** |

### 5.3 Os dois achados que a prova registra sem resolver

Confira se ambos estão declarados no **cabeçalho** de `src/pages/__tests__/DashboardKpis.test.tsx` e
aqui, e **não** transformados em verificação:

1. **O quarto cartão não é uma contagem de consultas.** Os dois agregados de consulta são calculados
   e descartados. O critério de `AMB-002` existe no código morto; a superfície, não.
2. **A constante de `AMB-001` nunca existiu.** A decisão pediu "constante explícita e tipada"; o
   código tem o literal `"94%"`. O valor está certo; a forma decidida não.

## 6. O que **não** está coberto

Declarado para que o verde não sugira mais do que existe:

- **O critério de `AMB-002` em si** — prova-se a ausência da superfície, não o critério.
- **A forma decidida de `AMB-001`** — prova-se o valor, não a constante nomeada.
- **O badge de tipo e o nome do paciente** na lista de Próximos Agendamentos — renderizados, mas
  nenhum cenário de `PT-008` os enuncia.
- **A aba de Relatórios** — fora do escopo por completo.
- **A ordenação da lista** — os cenários enunciam pertinência e cardinalidade, não ordem.
- **O modo offline** — os seis cenários de `PT-009` continuam sem dono.
- **A paridade visual** — os dezesseis cenários transferidos continuam à espera de um arnês próprio.

## 7. Registro de execução

> A preencher por `/reversa-coding`, com a medição real e a condição em que foi feita.

| Item | Valor |
|------|-------|
| Data da execução | 2026-09-22 |
| Verificações na suíte | **145** (132 herdadas + **13** desta feature) |
| Arquivos na suíte | **24** (23 herdados + 1) |
| `CF-01` duração | **85,86 s** na primeira medição e **87,43 s** na segunda — 0 falhas nas duas |
| `CF-01` condição de medição | Máquina sob carga de trabalho concorrente, com `collect` somando ~122 s entre os processos. A linha de base da feature 008 foi de 74,83 s na mesma árvore antes desta feature: o acréscimo de ~12 s **não** vem das verificações novas, que somam 1,4 s no arquivo, e sim da coleta sob concorrência. É a mesma variância condicional registrada na 006 (75,78 s calma × 122,57 s sob carga) |
| `CF-02` estado do repositório | **Vazio** para `src/pages/Dashboard.tsx`, `src/api`, `src/types`, `src/lib`, `base44/entities` e `src/pages/__tests__/Dashboard.test.tsx`. Só dois arquivos novos: `src/pages/__tests__/DashboardKpis.test.tsx` e `src/test/dashboardFixtures.ts` |
| `CF-03` arquivos verificados | **450** (447 antes desta feature + 3: os dois arquivos novos e o `actions.md`), 0 sequências |
| `typecheck` / `lint` | **0** e **0**, sem ocorrência nenhuma |
| `prova:negativos` | Não executado nesta rodada — a feature não toca o arnês de casos negativos. O comando segue com 16 casos desde a 008 |
| Desvios registrados | **Um.** A ordem planejada de `T015` era depois de `T012`–`T014`, mas a matriz precisa das medições: a suíte foi medida **antes** de a tabela da matriz ser escrita, em duas execuções, para que o número registrado fosse o medido e não o esperado. Nenhum requisito foi afetado |

### 7.1 A falsificação que antecedeu o verde

A primeira execução da suíte passou com **13 de 13** verificações. Verde de primeira não distingue
medição de stub, então duas asserções foram **deliberadamente quebradas** antes de o resultado ser
aceito:

| Asserção | Quebra aplicada | O que a suíte respondeu |
|----------|-----------------|-------------------------|
| `PT-008.4` — valor do cartão Taxa de Atendimento | esperado `95%` em vez de `94%` | `expected '94%' to be '95%'` — o valor lido vem do DOM renderizado |
| `PT-008.5` — limite da lista de Próximos Agendamentos | esperado 6 itens em vez de 5 | `expected [...] to have a length of 6 but got 5` — a lista realmente corta em cinco |

As duas quebras produziram exatamente as duas falhas esperadas, e nada mais. As alterações foram
revertidas em seguida, e as duas linhas de `progress.jsonl` (`status: corrected`) registram o
episódio. Sem esse passo, o verde da rodada não seria evidência de nada.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-09-22 | Tabela requisito × cenário preenchida com o instrumento de cada um; registro de execução com as medições; §7.1 com a falsificação que antecedeu o verde | reversa |
