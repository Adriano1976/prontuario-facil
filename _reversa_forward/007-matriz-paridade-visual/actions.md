# Actions: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Roadmap: `_reversa_forward/007-matriz-paridade-visual/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 5 (T001 → T002 → T007 → T008 → T010) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Registrar a linha-base da edição: transcrever o texto atual das quatro linhas afetadas da matriz (l. 297, 303, 318 e 341) e confirmar a contagem do manifest (`^    present: true` = 24 entradas), para permitir a conferência do diff restrito em T007 | - | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 2, Testes

**n/a — feature documental, sem TDD aplicável.** Não há código a testar antes do núcleo: a verificação da feature é o diff restrito, a varredura de identificadores e a guarda de encoding, agrupadas em T007 (Integração). Registrar aqui um teste automatizado novo seria desproporcional e criaria um gate sem objeto — a matriz é texto, não runtime.

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Corrigir a linha `Paridade visual (screens/V01 a V16)` da tabela de destino (RF-01): remover "Lacuna declarada" e a menção a `present: false`; declarar trabalho transferido com o destino nomeado (feature do harness de paridade visual) e citar os 24 goldens capturados | T001 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T003 | Corrigir a nota de saldo da mesma seção (RF-02, RF-05): registrar a data-base 2026-09-22, a razão (a captura dourada passou a existir) e a conta **19 concluídos / 31 transferidos** dos 50 da feature 002, com a decomposição 15 de fluxo + 16 visuais | T001 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T004 | Corrigir a linha `**Paridade visual** (16 cenários)` da seção `Lacunas de prova` (RF-03): deixar de declarar dependência de captura inexistente; registrar que a referência existe e que a lacuna remanescente é a **execução** (harness de paridade visual) | T001 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T005 | Corrigir a linha `Paridade dos módulos restantes (34 → 15 cenários)` da seção `Lacunas de prova` (RF-05, segunda parte): explicitar que os 16 visuais entram como transferidos, preservando a contagem de fluxo (34 → 15) | T001 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T006 | Acrescentar uma linha na seção `Como a prova é executada` (RF-04) apontando `_reversa_sdd/screens/golden/manifest.yaml` como fonte única do `sha256` por tela e a cobertura de **16 de 16** cenários visuais — sem criar tabela de 16 linhas na matriz | T001 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Conferir o diff restrito (RF-06): verificar que só as linhas dos RF-01 a RF-05 mudaram, varrer as linhas removidas por identificadores (`PT-`, `BR-`, `W0`, `AMB-`, `DEV-`) e rodar `npm run prova:encoding` | T002, T003, T004, T005, T006 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T008 | Gerar `legacy-impact.md` da feature: política de edição aplicada, artefatos afetados, diff conceitual e a declaração de que nenhuma regra de negócio, contrato ou dado mudou | T007 | `[//]` | `_reversa_forward/007-matriz-paridade-visual/legacy-impact.md` | 🟢 | [X] |
| T009 | Gerar `regression-watch.md` da feature: itens de vigilância sobre o que precisa **continuar verdadeiro** na matriz (os 16 declarados como transferidos; nenhum `present: false` em entrada de tela; nenhum identificador renumerado) | T007 | `[//]` | `_reversa_forward/007-matriz-paridade-visual/regression-watch.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Registrar no `onboarding.md` o resultado da conferência — linhas conferidas, resultado da guarda de encoding e da varredura de identificadores —, fechando o roteiro de conferência com os valores medidos | T007, T008, T009 | - | `_reversa_forward/007-matriz-paridade-visual/onboarding.md` | 🟢 | [X] |

## Notas de execução

**1. A publicação do adendo NÃO é ação desta feature.** `_reversa_sdd/addenda/007-matriz-paridade-visual.md` é produzido pelo `/reversa-sync`, que é o **estágio seguinte** do pipeline. Transformá-lo em ação criaria um impasse de roteamento: enquanto a ação estivesse aberta, o estágio físico de `actions.md` seria `coding-em-progresso` e o `/reversa-forward` mandaria de volta ao `/reversa-coding` em vez de seguir ao `/reversa-sync`. O requisito aparece no critério de pronto do `roadmap.md` (aceite), não na tabela.

**2. Nenhuma ação é paralelizável dentro do núcleo.** T002 a T006 tocam **o mesmo arquivo**; o critério do skill exige que tarefas `[//]` não compartilhem arquivo alvo. Só T008 e T009 são `[//]`, porque escrevem em arquivos distintos e não dependem uma da outra.

**3. Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002 a 006.

**4. Nenhum identificador novo é criado nesta feature** (D-06): as ações corrigem texto existente e não introduzem `PT-`, `BR-`, `W0`, `AMB-` ou `DEV-` inéditos.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-to-do` | reversa |
