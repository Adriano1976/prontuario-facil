# Cross-Check — Auditoria leitora da feature `014-correcao-de-seguranca`

> Data: `2026-09-24` (reexecução após a correção dos achados `A001`, `A002` e `A007` do relatório anterior)
> Feature: `014-correcao-de-seguranca`
> Artefatos analisados: `_reversa_forward/014-correcao-de-seguranca/requirements.md`,
> `roadmap.md` e `actions.md`
> Contexto consultado: `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`,
> `legacy-impact.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`,
> `_reversa_sdd/code-analysis.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/permissions.md`,
> `_reversa_sdd/migration/target_business_rules.md`

> ⚠️ **Nenhum dos três artefatos analisados foi alterado por esta auditoria.** O relatório é
> reescrito por completo a cada execução, jamais acrescentado. As correções que aparecem como
> resolvidas foram feitas **por revisão humana**, entre as duas execuções.

## Resumo

| Severidade | Quantidade |
| :--- | ---: |
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 4 |
| LOW | 0 |
| **Total** | **4** |

## Achados

| ID | Severidade | Eixo | Descrição | Onde está |
| :--- | :--- | :--- | :--- | :--- |
| A001 | MEDIUM | Cobertura | `actions.md` **não cita nenhum `RF-xx`, `D-xx` nem `R-xx`**. O rastro requisito → decisão → ação existe **semanticamente**, mas não é verificável mecanicamente — ao contrário do padrão das features `002` a `010`, cujo `actions.md` qualifica cada ação com os IDs que ela cumpre (a `010`, por exemplo, cita `RF-05`, `PT-009.3`, `D-06`, `R-04`) | `actions.md`, todas as 28 linhas de ação |
| A002 | MEDIUM | Cobertura | A decisão `D-06` ("a correção do F-05 não tem watch próprio") **não tem ação correspondente**. É uma decisão de omissão, e não há como executá-la — o que a torna não verificável pelo eixo 1.2 | `roadmap.md#3` (D-06) × `actions.md` |
| A003 | MEDIUM | Consistência | `D-06` diz que a correção do F-05 "**não** tem watch", mas o watch consolidado desta mesma feature tem **`W013`** vigiando exatamente o componente de gráficos. A leitura pretendida é "não tem **arquivo** de watch próprio, como `011`/`012`/`013`"; o texto admite a leitura contrária | `roadmap.md#3` (D-06) × `regression-watch.md#W013` |
| A004 | MEDIUM | Sanidade do actions | A **ordem das fases contradiz o grafo de dependências**: `T008` (Fase 2) depende de `T015` (Fase 3), e `T009` (Fase 2) depende de `T018` (Fase 3). Não é ciclo — é ordem de execução impossível como está escrita | `actions.md`, Fases 2 e 3 |

> **Nenhum achado `HIGH` ou `CRITICAL`.** Os quatro remanescentes são de **rastreabilidade e de
> redação estrutural**, e nenhum deles põe em dúvida a entrega: as 28 ações estão concluídas, a suíte
> está verde e a falsificação da prova foi executada.

## Resolvidos desde o relatório anterior

| ID anterior | Severidade | O que era | Como foi resolvido |
| :--- | :--- | :--- | :--- |
| `A001` (anterior) | **HIGH** | Citação `code-analysis.md#3.1` **sem qualificar o módulo**, e o artefato tem seis seções com esse número | A linha do componente "Leitura da sessão" passou a apontar para `_reversa_sdd/c4-components.md#Componentes de Infraestrutura` — a seção que documenta o `AuthContext.jsx`, que é a origem que a nova leitura da sessão substitui na interface |
| `A002` (anterior) | **HIGH** | `RF-13` (Must) sem decisão correspondente no roadmap | Acrescentada a decisão **`D-09`**, com a justificativa medida no SDK do Base44 e **duas alternativas descartadas** — entre elas o remendo no `app-params.ts`, que era a escolha discutível que ficava invisível |
| `A007` (anterior) | LOW | Citação `code-spec-matrix.md#Rastreabilidade` sem o prefixo do artefato e com âncora inexistente | Corrigida para `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste`; e a linha passou a citar também a seção do `c4-components.md` |

## Itens verificados que passaram

**Eixo 1 — Cobertura**
- `RF-01` a `RF-05` têm decisão (`D-01`) e ações (`T011` a `T014`).
- `RF-06` tem decisão (`D-03`) e ações (`T008`, `T015`, `T016`).
- `RF-07` e `RF-08` têm decisão (`D-04`) e ação (`T017`).
- `RF-09` tem decisão (`D-02`) e ação (`T020`).
- `RF-10` tem decisão (`D-05`) e ações (`T009`, `T018`, `T019`).
- `RF-11` tem decisão (`D-07`) e ações (`T023`, `T024`).
- `RF-12` tem decisão (`D-08`) e ações (`T025` a `T028`).
- `RF-13` tem decisão (**`D-09`**) e ação (`T025`, que executa o registro do achado na matriz).
- **Os quatro cenários Gherkin** têm cobertura: os dois primeiros por `T005`/`T006`/`T007`, o terceiro por `T008` e o quarto por `T009`.
- `D-01` a `D-05` e `D-07` a `D-09` têm ao menos uma ação (exceto `D-06`, achado `A002`).

**Eixo 2 — Consistência**
- Todo identificador citado **existe**: `RF-01`…`RF-13`; `BR-MIGRAR-015`, `017`, `020`, `024`, `034` e `039`; `BR-OFF10`; `BR-L01`, `BR-L04`, `BR-L05`; `L1`…`L7`; `PT-007.4`; `PT-009.3`; `AMB-004`; `W008` da feature `006`.
- **Toda seção citada resolve a um alvo único** — inclusive as três citações a `code-analysis.md`, agora todas qualificadas pelo módulo. Nenhuma citação ambígua resta.
- Eixo 2.3: **n/a** — a feature não tem `interfaces/`, e não altera contrato externo (o roadmap declara isso em `## 7`).
- Os termos `OwnedEntity`, `AccessScope`, `resolveScope`, `asAdmin` e `asUser` são usados com o mesmo sentido nos três documentos.

**Eixo 3 — Coerência com o legado**
- Nenhuma decisão contradiz regra 🟢 de `_reversa_sdd/domain.md`: `BR-S01`, `BR-S02` e `BR-A03` seguem respeitadas — a `D-03` recusa verificação em runtime **em favor** da RLS, que é o que sustenta a `BR-S02`.
- Componentes citados do legado existem: `_reversa_sdd/c4-components.md` (nas seções `Visão de Componentes (Container SPA)` e `Componentes de Infraestrutura`), `_reversa_sdd/architecture.md#1. Visão Resumida` e todos os arquivos de `src/` referenciados nas ações.
- A decisão `D-01` é **derivada** de regras 🟢 do legado (`BR-MIGRAR-017`/`020` liberam a leitura), e não uma restrição nova — é o ponto em que a primeira tentativa errou e foi recusada com registro.

**Eixo 4 — Sanidade do actions**
- **4.1:** todas as dependências apontam para IDs existentes dentro de `T001`…`T028`.
- **4.2:** as **nove** tarefas marcadas `[//]` (`T001`, `T004`, `T005`, `T006`, `T007`, `T009`, `T010`, `T013`, `T014`) têm arquivos alvo **distintos entre si**.
- **4.3:** **não há ciclo de dependência** — o grafo é acíclico, e o maior caminho tem cinco elos.

---

*Auditoria leitora gerada por `/reversa-audit` em 2026-09-24, reexecutada após revisão humana. Este
relatório não corrige nada: os achados `A001` a `A004` dependem de decisão humana.*
