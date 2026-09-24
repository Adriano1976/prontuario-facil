# Cross-Check — Auditoria leitora da feature `014-correcao-de-seguranca`

> Data: `2026-09-24` (terceira execução, após a correção de `A001`, `A003` e `A004` do relatório anterior)
> Feature: `014-correcao-de-seguranca`
> Artefatos analisados: `_reversa_forward/014-correcao-de-seguranca/requirements.md`,
> `roadmap.md` e `actions.md`
> Contexto consultado: `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`,
> `legacy-impact.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`,
> `_reversa_sdd/code-analysis.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/permissions.md`,
> `_reversa_sdd/migration/target_business_rules.md`

> ⚠️ **Nenhum dos três artefatos analisados foi alterado por esta auditoria.** O relatório é
> reescrito por completo a cada execução, jamais acrescentado. As correções que aparecem como
> resolvidas foram feitas **por revisão humana**, entre as execuções.

## Resumo

| Severidade | Quantidade |
| :--- | ---: |
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 0 |
| **Total** | **1** |

## Achados

| ID | Severidade | Eixo | Descrição | Onde está |
| :--- | :--- | :--- | :--- | :--- |
| A001 | MEDIUM | Cobertura | A decisão `D-06` ("a correção do F-05 **não** tem **arquivo** de watch próprio") **não tem ação correspondente**. É uma decisão de **omissão** — o que ela decide é *não criar* um arquivo —, e por isso não há como executá-la nem verificá-la pelo eixo 1.2. O item de vigilância existe (`W013`) e a redação já o declara; o que não existe é uma ação para a decisão | `roadmap.md#3` (D-06) × `actions.md` |

> **Único achado remanescente, e ele é de natureza, não de defeito.** Nenhum `CRITICAL` nem `HIGH`:
> a entrega está íntegra — 28 ações concluídas, suíte verde, falsificação executada, adendo vigente.
> O `A001` fica registrado para que a próxima auditoria não o redescubra como novidade: uma decisão
> de omissão nunca terá ação, e o eixo 1.2 deveria prevê-la.

## Resolvidos desde o relatório anterior

| ID anterior | Severidade | O que era | Como foi resolvido |
| :--- | :--- | :--- | :--- |
| `A001` (anterior) | MEDIUM | O `actions.md` não citava **nenhum** `RF-xx`, `D-xx` ou `R-xx` — rastro só semântico, ao contrário do padrão das features `002` a `010` | **27 das 28 ações** passaram a declarar os IDs que cumprem. A 28ª, `T002`, cita o conjunto `BR-MIGRAR-015/017/020/024/034`, que é o **objeto** dela — mapear achado em regra. Agora o eixo 1.2 é verificável por leitura mecânica |
| `A003` (anterior) | MEDIUM | `D-06` dizia que o F-05 "não tem watch", enquanto `W013` vigia justamente o componente de gráficos | `D-06` passou a dizer "**não** tem **arquivo** de watch próprio — a guarda dela vive como `W013` no watch consolidado desta feature". A leitura contrária deixou de ser possível |
| `A004` (anterior) | MEDIUM | `T008` e `T009` (Fase 2) dependiam de `T015` e `T018` (Fase 3) — ordem de execução impossível | As duas desceram para a Fase 3, imediatamente **após as suas dependências**, com a razão declarada na própria descrição. A Fase 2 passou a conter só o que independe do núcleo |

> **Erro corrigido na mesma passada, que a auditoria não havia apontado.** O resumo do `actions.md`
> declarava **5** elos para a maior cadeia de dependência. A cadeia real tem **8**: `T001` → `T002` →
> `T003` → `T015` → `T008` → `T023` → `T025` → `T026`. O eixo de sanidade não o pegou porque verifica
> **ciclos**, não profundidade — e é a segunda vez nesta sessão que um número do resumo estava errado
> e só apareceu quando alguém o conferiu contra o conteúdo.

## Itens verificados que passaram

**Eixo 1 — Cobertura**
- `RF-01` a `RF-13` têm decisão: `RF-01`–`RF-05` → `D-01`; `RF-06` → `D-03`; `RF-07`/`RF-08` → `D-04`; `RF-09` → `D-02`; `RF-10` → `D-05`; `RF-11` → `D-07`; `RF-12` → `D-08`; `RF-13` → `D-09`.
- **Todas as decisões têm ação, exceto `D-06`** (achado `A001`): `D-01` → `T011`–`T014`; `D-02` → `T020`; `D-03` → `T008`, `T015`, `T016`; `D-04` → `T017`; `D-05` → `T009`, `T018`, `T019`; `D-07` → `T023`, `T024`; `D-08` → `T025`–`T028`; `D-09` → `T025`.
- **Os quatro cenários Gherkin** têm cobertura: os dois primeiros por `T005`/`T006`/`T007`, o terceiro por `T008` e o quarto por `T009`.
- O rastro é agora **verificável mecanicamente**: 27 das 28 linhas de ação citam `RF-xx` e `D-xx` entre crases.

**Eixo 2 — Consistência**
- Todo identificador citado **existe**: `RF-01`…`RF-13`; `D-01`…`D-09`; `BR-MIGRAR-015`, `017`, `020`, `024`, `034` e `039`; `BR-OFF10`; `BR-L01`, `BR-L04`, `BR-L05`; `L1`…`L7`; `PT-007.4`; `PT-009.3`; `AMB-004`; `W013`; `W008` da feature `006`.
- **Toda seção citada resolve a um alvo único**, inclusive as três citações a `code-analysis.md`, todas qualificadas pelo módulo.
- Eixo 2.3: **n/a** — a feature não tem `interfaces/` e não altera contrato externo (o roadmap declara isso em `## 7`).
- Os termos `OwnedEntity`, `AccessScope`, `resolveScope`, `asAdmin` e `asUser` são usados com o mesmo sentido nos três documentos.

**Eixo 3 — Coerência com o legado**
- Nenhuma decisão contradiz regra 🟢 de `_reversa_sdd/domain.md`: `BR-S01`, `BR-S02` e `BR-A03` seguem respeitadas — a `D-03` recusa verificação em runtime **em favor** da RLS, que é o que sustenta a `BR-S02`.
- Componentes citados do legado existem: `_reversa_sdd/c4-components.md` (nas seções `Visão de Componentes (Container SPA)` e `Componentes de Infraestrutura`), `_reversa_sdd/architecture.md#1. Visão Resumida` e todos os arquivos de `src/` referenciados nas ações.
- A decisão `D-01` é **derivada** de regras 🟢 do legado (`BR-MIGRAR-017`/`020` liberam a leitura), e não uma restrição nova.

**Eixo 4 — Sanidade do actions**
- **4.1:** todas as dependências apontam para IDs existentes dentro de `T001`…`T028`.
- **4.2:** as **nove** tarefas marcadas `[//]` (`T001`, `T004`, `T005`, `T006`, `T007`, `T009`, `T010`, `T013`, `T014`) têm arquivos alvo **distintos entre si**.
- **4.3:** **não há ciclo de dependência**, e agora **cada dependência aponta para uma ação que aparece antes dela** na ordem de leitura — o que o achado `A004` exigia.

---

*Auditoria leitora gerada por `/reversa-audit` em 2026-09-24, terceira execução. Este relatório não
corrige nada: o achado `A001` depende de decisão humana.*
