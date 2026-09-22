# Legacy Impact: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Cenário: **legado** (`_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`)
> Política de edição do legado no momento da execução: `allowLegacyEdits: true`, `allowedPaths: ["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]`
> **Nenhum caminho de `allowedPaths` foi necessário**: a única escrita fora da pasta da feature aconteceu em `_reversa_sdd/`, que é pasta própria do Reversa e sempre gravável, independentemente da política.

> **Nota de governança — aceite do finding A002 da auditoria.** A publicação do adendo `007` **não** é ação de `actions.md`: ela pertence ao estágio `/reversa-sync`, e transformá-la em ação manteria o estágio físico em `coding-em-progresso` para sempre, fazendo o `/reversa-forward` rotear de volta ao coding e o `/reversa-sync` apresentar o menu de sincronização parcial a cada execução. A garantia mecânica existe por outro caminho: este arquivo é **pré-requisito do sync** (o skill aborta sem ele), e a matriz de roteamento do `/reversa-forward` sugere `/reversa-sync` quando o estágio é `done` e não há adendo. **Próximo passo obrigatório desta entrega: publicar o adendo `_reversa_sdd/addenda/007-matriz-paridade-visual.md` via `/reversa-sync`**, que é o veículo da reconciliação contra o adendo `002`.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `_reversa_sdd/code-spec-matrix.md` | Matriz de código e especificação — artefato transversal de rastreabilidade (não é componente de runtime) | `regra-alterada` | **MEDIUM** | Corrige uma afirmação que induzia a erro de escopo no planejamento: os 16 cenários de paridade visual deixam de ser "lacuna permanente por ausência de captura" e passam a trabalho transferido, com a captura registrada como prova por referência. Não altera runtime, contrato nem dado — por isso não é HIGH; tem peso de decisão porque a matriz é lida para dimensionar features |

### Artefatos da própria feature (fora da tabela do legado)

| Artefato | Tipo | Observação |
|---|---|---|
| `_reversa_forward/007-matriz-paridade-visual/legacy-impact.md` | artefato da feature | este arquivo |
| `_reversa_forward/007-matriz-paridade-visual/regression-watch.md` | artefato da feature | itens de vigilância da correção |
| `_reversa_forward/007-matriz-paridade-visual/progress.jsonl` | rastro de execução | append-only |
| `_reversa_forward/007-matriz-paridade-visual/onboarding.md` | artefato da feature | recebeu o resultado medido da conferência (T010) |

## Diff conceitual por componente

**Matriz de código e especificação (`_reversa_sdd/code-spec-matrix.md`)** — quatro pontos corrigidos e um acréscimo, em 6 hunks de diff (18 inserções, 7 remoções):

1. **Tabela "Destino dos cenários de paridade não cobertos nesta feature"** — a linha do grupo `Paridade visual (screens/V01 a V16)` dizia *"Lacuna declarada. A captura dourada não existe (`present: false`); produzi-la é trabalho de outra natureza"*. Passa a apontar **"Feature a criar — harness de paridade visual"**, registrando que a captura passou a existir em 2026-09-22 (24 goldens, `present: true`, 16 de 16 cenários).
2. **Nota de saldo da mesma seção** — estava ancorada na feature `006` e declarava *"15 permanecem transferidos... os 16 de paridade visual seguem declarados como lacuna"*. Passa a estar ancorada nesta feature, com a conta **19 concluídos / 31 transferidos dos 50** (15 de fluxo + 16 visuais) e a razão explícita: a captura, que fundamentava a lacuna, existe.
3. **Tabela "Lacunas de prova"** — a linha `**Paridade visual** (16 cenários)` era `🔴 Declarada. Depende de captura dourada inexistente`. Passa a `🟡 Transferida`, nomeando a lacuna remanescente (**execução**, que depende do harness) e apontando o manifest.
4. **Tabela "Lacunas de prova"** — a linha `Paridade dos módulos restantes (34 → 15 cenários)` preserva a contagem de fluxo e passa a explicitar os 16 visuais, fechando o saldo em **31 dos 50**.
5. **Seção "Como a prova é executada"** — ganhou um parágrafo (T006) registrando a paridade visual como **prova por referência capturada**: 24 goldens, `present: true` em 24 de 24, 16 de 16 cenários, com `_reversa_sdd/screens/golden/manifest.yaml` como **fonte única** do `sha256` por tela. A matriz **aponta** para a evidência; não duplica as 16 linhas (decisão D-03).

**Escopo da edição**: nenhuma outra seção foi tocada, nenhum identificador foi criado, renumerado ou removido (verificado por varredura nas linhas removidas do diff), a acentuação permanece íntegra e o arquivo segue UTF-8 sem BOM e com quebras LF uniformes (479 LF, 0 CRLF).

## Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam **intactas** — a feature não toca nenhuma delas:

| Regra | Seção | Situação |
|---|---|---|
| `BR-P01` (apenas pacientes `ativo` em novos agendamentos/consultas) | §2.1 | intacta |
| `BR-P02` (`blood_type` no padrão ABO/Rh ou `desconhecido`) | §2.1 | intacta |
| `BR-A01` (agendamento nasce `agendado`, confirma antes do atendimento) | §2.2 | intacta |
| `BR-A03` (dashboard exclui `cancelados` das contagens) | §2.2 | intacta |
| `BR-T01` (templates filtrados por `type`) | §2.3 | intacta |
| `BR-T02` (`medications` só em documento que inclui "receita") | §2.3 | intacta |
| `BR-S01` (todo acesso a dado sensível gera log) | §2.4 | intacta |
| `BR-S02` (não-admin só vê o que criou) | §2.4 | intacta |

Também intactos: `_reversa_sdd/architecture.md` (nenhum componente muda), os schemas em `base44/entities/` (8 arquivos, nenhum diff), `src/` inteiro, `package.json`, `tsconfig.json` e as configurações de build/teste.

## Modificadas

**Nenhuma regra de negócio foi alterada, removida ou rebaixada de confidência.** A única regra com confidência diferente de 🟢 no domínio é `BR-A02` (🟡, inferida), e ela também não foi tocada.

A alteração desta feature é de **rastreabilidade documental**: o que mudou foi o que a matriz *afirma sobre a cobertura de provas*, não o comportamento do sistema.
