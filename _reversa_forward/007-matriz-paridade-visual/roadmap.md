# Roadmap: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/007-matriz-paridade-visual/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A mudança é **editorial e cirúrgica em um único artefato de rastreabilidade**: `_reversa_sdd/code-spec-matrix.md`. Nenhum código, nenhum componente, nenhum contrato e nenhum dado do sistema são tocados. O caminho escolhido é **editar as linhas afetadas no lugar**, preservando o formato das tabelas existentes, em vez de regenerar a matriz — regenerar destruiria a rastreabilidade acumulada pelas features `001` a `006`, que construíram esse artefato por ações próprias (`T009`, `T015`, `T016`). Depois da edição, a feature publica um **adendo próprio** via `/reversa-sync`, que reconcilia a leitura contra o adendo `002` (que permanece vigente e intocado) e registra o novo estado da paridade visual até a próxima re-extração.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi registrado, portanto não há princípio a respeitar nem conflito a declarar. Mesma constatação registrada no `roadmap.md` da feature `006-prova-logs-acesso`. Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio; esta feature não os cria nem os atenua.

Os compromissos que fazem as vezes de princípio vêm do legado e dos adendos vigentes:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Nenhuma afirmação da extração é apagada; correções são declaradas, não silenciadas (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | A linha antiga é **substituída por texto que declara o novo estado**, e o histórico fica no adendo — nada é apagado sem rastro | respeita |
| Adendo é registro histórico e não se reescreve (`reversa-sync`) | O adendo `002` fica **intocado**; a reconciliação vai para o adendo novo | respeita |
| A matriz é a espinha de rastreabilidade SPEC↔CODE↔TEST (`_reversa_sdd/code-spec-matrix.md`) | É exatamente o artefato corrigido; nenhuma outra seção é tocada (RF-06) | respeita |
| `prova:encoding` mantém a árvore de texto íntegra (`src/test/mojibake.mjs`) | A edição permanece UTF-8 sem BOM; a guarda cobre `src/` + toda pasta `_reversa_*`, logo cobre o arquivo | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | **Edição cirúrgica das linhas afetadas**, não regeneração da matriz | A matriz é produto acumulado de cinco features; regenerar apagaria vereditos, citações e lacunas declaradas que nenhum agente pode reproduzir | a) regenerar a matriz do zero; b) deixar para a próxima re-extração (mantém a contradição até lá) | 🟢 |
| D-02 | Os 16 cenários passam a **trabalho transferido**, entrando na aritmética: **19 concluídos / 31 transferidos** dos 50 da feature 002 | Decisão humana de 2026-09-22. A matriz já usa a categoria "Feature a criar" para trabalho planejável, e o harness é a feature que fará a verificação | a) quarta categoria "referência capturada, execução pendente" (inventa categoria num artefato mantido com três); b) continuarem "lacuna declarada" só com a razão corrigida | 🟢 |
| D-03 | Registro dos goldens por **apontador para o manifest** na seção "Como a prova é executada" | O `manifest.yaml` é a fonte única do `sha256` por tela; as 16 linhas já existem no manifest e no apêndice de `target_screens.md`. A matriz aponta para a evidência, não a duplica | a) tabela de 16 linhas na matriz (terceiro lugar a manter em sincronia); b) citar o caminho só na linha do destino | 🟢 |
| D-04 | Reconciliação por **adendo novo** desta feature; o adendo `002` fica vigente e intocado | É o mecanismo previsto: o adendo é a ponte até a próxima re-extração, e o sync só acrescenta — nunca reescreve | a) editar o adendo `002` com nota de superação parcial (fora do contrato do sync); b) não produzir adendo (deixa a contradição viva) | 🟢 |
| D-05 | Escopo de escrita: **apenas `_reversa_sdd/code-spec-matrix.md`** durante o coding, e `_reversa_sdd/addenda/007-matriz-paridade-visual.md` no sync | A feature é documental; `src/`, `package.json`, `tsconfig.json` e configurações ficam fora | a) aproveitar para "melhorar" outras seções da matriz (transbordo); b) tocar `confidence-report.md`/`gaps.md` (não declaram a lacuna visual) | 🟢 |
| D-06 | **Nenhum identificador novo** é criado; os existentes não são renumerados | As citações cruzam features `001` a `006`; renumerar invalidaria cadeias vivas (mesma razão registrada na feature `006` para as famílias `BR-L`) | a) renumerar para "arrumar" colisões antigas — explicitamente fora do escopo | 🟢 |
| D-07 | A edição **preserva o formato das tabelas** existentes (colunas, marcadores de confidência, estilo das linhas) | RF-06 exige diff mínimo e legível; reescrever a seção inteira amplia o diff e esconde o que mudou | a) reescrever a seção "Destino…" inteira; b) converter as tabelas para outro formato | 🟢 |
| D-08 | Verificação de não-regressão por **`git diff` restrito** + guarda `npm run prova:encoding` | A guarda varre `src/` e toda pasta `_reversa_*` (`src/test/mojibake.mjs:286-289`), logo valida o arquivo editado quanto a encoding e BOM | a) criar uma prova automatizada nova só para este diff (desproporcional para edição documental) | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano **sem marcadores `[DÚVIDA]`** — as duas dúvidas da versão inicial foram resolvidas na sessão de esclarecimentos de 2026-09-22 e estão registradas em `requirements.md#9. Esclarecimentos`.

## 5. Delta arquitetural

**Nenhum componente do sistema muda.** `_reversa_sdd/architecture.md` (visão resumida, variante de deployment offline, diagramas) permanece válido: a feature não toca runtime, módulo, dependência ou fronteira.

O que muda são dois artefatos de rastreabilidade:

| Artefato | Tipo de mudança | Resumo |
|----------|-----------------|--------|
| `_reversa_sdd/code-spec-matrix.md` | `regra-alterada` | Três linhas e uma nota deixam de declarar os 16 cenários visuais como lacuna permanente e passam a trabalho transferido (19/31); a seção de prova ganha o apontador para o manifest |
| `_reversa_sdd/addenda/007-matriz-paridade-visual.md` | `componente-novo` | Adendo publicado pelo `/reversa-sync`, declarando o novo estado e reconciliando a leitura contra o adendo `002` |

## 6. Delta no modelo de dados

- **Resumo das mudanças**: nenhuma. A feature não toca entidades, schemas Base44, campos, índices nem migrações.
- Detalhe completo em: `_reversa_forward/007-matriz-paridade-visual/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo é afetado — sem HTTP, fila, gRPC, GraphQL ou arquivo trocado com terceiros. O diretório `interfaces/` é **omitido** conforme a regra do skill.

## 8. Plano de migração

**n/a** — não há migração de dados nem de runtime.

Plano de execução (o que o `/reversa-to-do` vai decompor em ações):

1. Retificar a linha da tabela de destino referente a "Paridade visual (`screens/V01` a `V16`)" (RF-01)
2. Retificar a nota de saldo da mesma seção, com data e razão, e a conta 19/31 (RF-02, RF-05)
3. Retificar a linha "Paridade visual (16 cenários)" em `### Lacunas de prova` (RF-03)
4. Acrescentar a linha de apontador para `screens/golden/manifest.yaml` em `### Como a prova é executada` (RF-04)
5. Conferir o diff restrito e rodar `npm run prova:encoding` (RF-06, D-08)
6. Publicar o adendo da feature via `/reversa-sync` (D-04)

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Transbordo do diff — tocar seções que não deveriam mudar | alto | média | RF-06 exige diff restrito; conferência linha a linha e nenhum ID novo (D-06) |
| Contradição residual com o adendo `002`, que segue vigente | médio | alta | Adendo `007` declara o novo estado e a precedência de leitura (D-04); o `002` não é editado |
| A conta "19 concluídos / 31 transferidos" envelhecer quando novas features concluírem cenários | baixo | alta | A nota carrega a **data-base 2026-09-22**, como as notas de saldo das features 003 a 006 já fazem |
| Perda de acentuação ou BOM na edição | médio | baixa | `npm run prova:encoding` cobre `src/` e toda pasta `_reversa_*`; escrever em UTF-8 sem BOM |
| Alguém ler a matriz e concluir que a paridade visual está **provada** | alto | baixa | O texto corrigido nomeia a lacuna remanescente (execução/harness) e aponta o golden como **referência capturada**, não como prova executada |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] RF-01 a RF-06 satisfeitos, com o diff restrito conferido
- [ ] `npm run prova:encoding` verde, incluindo o arquivo editado
- [ ] Nenhum identificador renumerado, removido ou reinterpretado
- [ ] Adendo da feature publicado em `_reversa_sdd/addenda/007-matriz-paridade-visual.md`
- [ ] `legacy-impact.md` e `regression-watch.md` gerados (pré-requisitos do `/reversa-sync`)
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
