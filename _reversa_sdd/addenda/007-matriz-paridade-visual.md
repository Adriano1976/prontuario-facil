# Adendo: Correção da rastreabilidade da paridade visual na matriz

> Feature: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-22.

## Resumo da entrega

Corrigir o que a extração afirmava sobre a **paridade visual**. A matriz de código e especificação declarava, em três pontos, que os 16 cenários `PT-V01`…`PT-V16` eram uma **lacuna permanente** porque "a captura dourada de referência não existe no repositório". Isso deixou de ser verdade em 2026-09-22, quando 24 goldens passaram a existir com `present: true` (16 de 16 cenários). A feature reclassifica os 16 como **trabalho transferido**, com destino nomeado — o harness de paridade visual, ainda a criar —, corrige a aritmética de saldo para **19 concluídos / 31 transferidos dos 50** que a feature `002` transferiu, e registra o manifest como **fonte única** do `sha256` por tela, por apontador em vez de cópia.

**Ações concluídas: 10 de 10** (`actions.md`).

Nada de código foi tocado: `src/`, `package.json`, `tsconfig.json`, os schemas em `base44/entities/` e as configurações de build/teste estão **sem diff**. A alteração é de rastreabilidade documental — 6 hunks (18 inserções, 7 remoções) em um único arquivo da extração.

Gates medidos em 2026-09-22: `npm run prova:encoding` com **431 arquivos de texto íntegros** nas raízes `src`, `_reversa_docs`, `_reversa_forward` e `_reversa_sdd`; arquivo editado com **479 quebras LF, 0 CRLF e sem BOM**. A suíte `npm test` **não foi executada** neste ambiente — recusada com `spawn EPERM` no esbuild em modo confinado (mesma restrição da feature `001`) —, e não poderia ter mudado de resultado porque nenhum arquivo de `src/` foi tocado.

> **Nota de leitura sobre a feature `006`.** O saldo que a feature `006` publicou em seu adendo ("cai de 19 para 15 transferidos") **continua correto para os cenários de fluxo**. O que muda agora é que os 16 visuais deixam de ser contados fora do saldo: eles passam a integrar a conta, que fecha em **31 dos 50**.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | A linha do grupo `Paridade visual (screens/V01 a V16)` deixou de ser "Lacuna declarada (`present: false`)" e passou a **"Feature a criar — harness de paridade visual"**, citando os 24 goldens. A nota de saldo foi reancorada nesta feature e agora declara **19 concluídos / 31 transferidos**, com a razão da mudança |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | A linha `**Paridade visual** (16 cenários)` passou de `🔴 Declarada. Depende de captura dourada inexistente` para `🟡 Transferida`, nomeando a lacuna remanescente como **execução** (harness) e apontando o manifest. A linha `Paridade dos módulos restantes` preservou os 34 → 15 de fluxo e passou a explicitar os 16 visuais, fechando **31 dos 50** |
| `_reversa_sdd/code-spec-matrix.md` | `Como a prova é executada` | `regra-nova` | Parágrafo novo registra a paridade visual como **prova por referência capturada** — 24 goldens, `present: true` em 24 de 24, 16 de 16 cenários — e aponta `_reversa_sdd/screens/golden/manifest.yaml` como fonte única do `sha256` por tela. A matriz aponta para a evidência; não duplica as 16 linhas |
| `_reversa_sdd/addenda/002-prova-automatizada.md` | `Impacto por artefato da extração` | `regra-alterada` | **Leia como superado neste ponto específico.** O adendo registra a decisão `D-06` da feature `002` ("os 16 ficam declarados como lacuna porque a captura dourada não existe"). A premissa caiu em 2026-09-22. O texto do adendo **não é reescrito** — adendo é registro histórico; a leitura correta a partir de agora é a deste adendo |
| `_reversa_sdd/migration/parity_specs.md` | `Paridade visual (modo literal — mesma plataforma)` e `Lacunas declaradas` | `regra-alterada` | A **defasagem que o próprio artefato registrava** ("a linha da matriz ainda declara os 16 como lacuna; a correção é da próxima feature forward ou do próximo `/reversa-sync`") está **cumprida**. A matriz deixou de contradizer este artefato: os dois agora declaram 24 goldens e 16 de 16 cenários |
| `_reversa_sdd/migration/handoff.md` | `Próximos passos para o agente de codificação` | `regra-alterada` | O **item 8** (corrigir a linha defasada da matriz) está **cumprido** por esta feature. O **item 6** (construir o harness de paridade visual) segue **aberto** e é o destino declarado dos 16 cenários |

> O adendo **anota, não corrige**: nenhuma afirmação de nenhum artefato da extração foi editada por este sync. As correções foram aplicadas pelas ações T002 a T006 da própria feature, com a razão declarada no arquivo; o que este adendo faz é registrar **o que mudou**, para quem lê a extração sem passar pelo ciclo forward.
>
> **Sem delta de dados, contrato ou regra de negócio**: as 8 regras 🟢 de `_reversa_sdd/domain.md` (`BR-P01`, `BR-P02`, `BR-A01`, `BR-A03`, `BR-T01`, `BR-T02`, `BR-S01`, `BR-S02`) permanecem intactas, e a seção "Modificadas" do `legacy-impact.md` está vazia.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/007-matriz-paridade-visual/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008`

Como esta feature não alterou comportamento, os itens **não são regressões a evitar**: são **propriedades que precisam continuar verdadeiras** — que a matriz continue declarando a paridade visual como trabalho transferido com destino nomeado, que nenhuma entrada de tela do manifest fique sem golden, que o apontador para o manifest permaneça, que a conta siga em 19/31 com data-base, que nenhum identificador seja renumerado, que a lacuna remanescente seja a execução e não a captura, que o adendo `002` permaneça intocado e que o arquivo siga íntegro.

A seção de observações daquele arquivo registra **5 itens sem peso de regressão**, entre eles o cenário Gherkin negativo que hoje é vácuo (`A003`), a citação de IDs de outra feature sem qualificação (`A004`), a citação equivocada herdada da feature `006` (`A005`) e o fato de que **a paridade visual segue sendo conferência humana** até existir o harness.

## Fontes

- `_reversa_forward/007-matriz-paridade-visual/legacy-impact.md`
- `_reversa_forward/007-matriz-paridade-visual/regression-watch.md`
- `_reversa_forward/007-matriz-paridade-visual/requirements.md`
- `_reversa_forward/007-matriz-paridade-visual/roadmap.md`
- `_reversa_forward/007-matriz-paridade-visual/actions.md`
- `_reversa_forward/007-matriz-paridade-visual/progress.jsonl`
- `_reversa_forward/007-matriz-paridade-visual/onboarding.md`
- `_reversa_forward/007-matriz-paridade-visual/audit/cross-check.md`
- `_reversa_sdd/code-spec-matrix.md` (artefato corrigido)

---
*Gerado pelo Reversa-Sync em 2026-09-22.*
