# Cross-Check — Auditoria leitora da feature `014-correcao-de-seguranca`

> Data: `2026-09-24`
> Feature: `014-correcao-de-seguranca`
> Artefatos analisados: `_reversa_forward/014-correcao-de-seguranca/requirements.md`,
> `roadmap.md` e `actions.md`
> Contexto consultado: `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`,
> `legacy-impact.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`,
> `_reversa_sdd/code-analysis.md`, `_reversa_sdd/permissions.md`,
> `_reversa_sdd/migration/target_business_rules.md`

> ⚠️ **Nenhum dos três artefatos analisados foi alterado.** Esta auditoria é estritamente leitora, e a
> única escrita que produziu é este arquivo.

## Resumo

| Severidade | Quantidade |
| :--- | ---: |
| CRITICAL | 0 |
| HIGH | 2 |
| MEDIUM | 4 |
| LOW | 1 |
| **Total** | **7** |

## Achados

| ID | Severidade | Eixo | Descrição | Onde está |
| :--- | :--- | :--- | :--- | :--- |
| A001 | **HIGH** | Consistência | Citação `code-analysis.md#3.1` **sem qualificar o módulo**, e o artefato tem **seis** seções com esse número (`pacientes`, `consultas`, `agendamentos`, `templates`, `logs-acesso`, `dashboard`). A citação não resolve a um alvo único — é a mesma família de defeito que as colisões `BR-T`, `BR-L` e `BR-A0x` já registradas no corpus | `roadmap.md`, seção `## 5. Delta arquitetural`, linha do componente "Leitura da sessão" |
| A002 | **HIGH** | Cobertura | `RF-13` (**Must**) — registrar o F-02 como não corrigível, com a evidência — **não tem decisão correspondente** no roadmap. Há cobertura **em prosa** no `## 1. Resumo da abordagem`, mas o eixo pede decisão, e uma leitura mecânica de `RF-13 → D-xx` não encontra nada | `requirements.md#5` (RF-13) × `roadmap.md#3` (D-01 a D-08) |
| A003 | MEDIUM | Cobertura | `actions.md` **não cita nenhum `RF-xx`, `D-xx` nem `R-xx`**. O rastro requisito → decisão → ação existe **semanticamente**, mas não é verificável mecanicamente — ao contrário do padrão das features `002` a `010`, cujo `actions.md` qualifica cada ação com os IDs que ela cumpre (a `010`, por exemplo, cita `RF-05`, `PT-009.3`, `D-06`, `R-04`) | `actions.md`, todas as 28 linhas de ação |
| A004 | MEDIUM | Cobertura | A decisão `D-06` ("a correção do F-05 não tem watch próprio") **não tem ação correspondente**. É uma decisão de omissão, e não há como executá-la — o que a torna não verificável pelo eixo 1.2 | `roadmap.md#3` (D-06) × `actions.md` |
| A005 | MEDIUM | Consistência | `D-06` e a nota do F-05 na matriz dizem que a correção "**não** tem watch", mas o watch consolidado desta mesma feature tem **`W013`** vigiando exatamente o componente de gráficos. A leitura pretendida é "não tem **arquivo** de watch próprio, como `011`/`012`/`013`"; o texto admite a leitura contrária | `roadmap.md#3` (D-06) × `regression-watch.md#W013` |
| A006 | MEDIUM | Sanidade do actions | A **ordem das fases contradiz o grafo de dependências**: `T008` (Fase 2) depende de `T015` (Fase 3), e `T009` (Fase 2) depende de `T018` (Fase 3). Não é ciclo — é ordem de execução impossível como está escrita | `actions.md`, Fases 2 e 3 |
| A007 | LOW | Consistência | Citação a `code-spec-matrix.md#Rastreabilidade` (a) **sem o prefixo** `_reversa_sdd/` e (b) com âncora que **não corresponde** ao cabeçalho real, que é `## Rastreabilidade Spec → Código → Teste` | `roadmap.md`, seção `## 5. Delta arquitetural`, linha do componente `App` |

## Impacto e direção de correção dos achados HIGH

### A001 — a citação que não resolve

O roadmap aponta três vezes para `code-analysis.md#3.1`. Duas delas **qualificam o módulo** —
"(logs-acesso)" —, e a terceira, na linha do componente "Leitura da sessão", **não**. Como o artefato
usa `### 3.1` em **seis** módulos diferentes, essa terceira citação é indistinguível de qualquer uma
delas: quem for conferir a origem da mudança não sabe para onde olhar.

O corpus já trata essa família como defeito de verdade — foi por ela que a feature `004` passou a
qualificar todo identificador pelo artefato de origem, e que a `005` registrou a colisão `BR-T` como
"a forma pior". **Direção:** qualificar a citação com o módulo, como as duas linhas vizinhas já fazem.
Edição manual do `roadmap.md` — o `/reversa-clarify` trata de dúvida, não de precisão de citação.

### A002 — o requisito que ficou sem decisão

`RF-13` é **Must**: registrar o F-02 como não corrigível neste repositório, com a evidência medida no
SDK. O roadmap **conta** o resultado no `## 1`, e a ação `T025` **executa** o registro — mas não há
**decisão** que o humano possa contestar, e é justamente aí que estava a escolha discutível: *não*
remendar o `app-params.ts`.

Sem a decisão registrada, a alternativa descartada ("alinhar o `app-params.ts` com o utilitário do SDK
e chamar isso de correção") fica invisível, e alguém pode reabri-la como se nunca tivesse sido
avaliada. **Direção:** acrescentar uma decisão (`D-09`) com a justificativa e a alternativa recusada —
edição manual do `roadmap.md`, ou `/reversa-clarify` se o humano preferir tratar como ponto em aberto.

## Itens verificados que passaram

**Eixo 1 — Cobertura**
- `RF-01` a `RF-05` têm decisão (`D-01`) e ações (`T011` a `T014`).
- `RF-06` tem decisão (`D-03`) e ações (`T008`, `T015`, `T016`).
- `RF-07` e `RF-08` têm decisão (`D-04`) e ação (`T017`).
- `RF-09` tem decisão (`D-02`) e ação (`T020`).
- `RF-10` tem decisão (`D-05`) e ações (`T009`, `T018`, `T019`).
- `RF-11` tem decisão (`D-07`) e ações (`T023`, `T024`).
- `RF-12` tem decisão (`D-08`) e ações (`T025` a `T028`).
- **Os quatro cenários Gherkin** têm cobertura: os dois primeiros por `T005`/`T006`/`T007`, o terceiro por `T008` e o quarto por `T009`.
- `D-01` a `D-05`, `D-07` e `D-08` têm ao menos uma ação (exceto `D-06`, achado `A004`).

**Eixo 2 — Consistência**
- Todo identificador citado **existe**: `RF-01`…`RF-13`; `BR-MIGRAR-015`, `017`, `020`, `024`, `034` e `039`; `BR-OFF10`; `BR-L01`, `BR-L04`, `BR-L05`; `L1`…`L7`; `PT-007.4`; `PT-009.3`; `AMB-004`; `W008` da feature `006`.
- Toda seção citada de `_reversa_sdd/` existe no artefato de destino — inclusive `permissions.md#3` e `#4`, `code-analysis.md#5.1` (logs-acesso), `modo-offline/requirements.md#2` e `code-spec-matrix.md#Achados de segurança — estado da correção`.
- Eixo 2.3: **n/a** — a feature não tem `interfaces/`, e não altera contrato externo (o roadmap declara isso em `## 7`).
- Os termos `OwnedEntity`, `AccessScope`, `resolveScope`, `asAdmin` e `asUser` são usados com o mesmo sentido nos três documentos.

**Eixo 3 — Coerência com o legado**
- Nenhuma decisão contradiz regra 🟢 de `_reversa_sdd/domain.md`: `BR-S01` (todo acesso a dado sensível gera log), `BR-S02` (não-admin só vê o que criou) e `BR-A03` (regra dos agendamentos) seguem respeitadas — a `D-03` recusa verificação em runtime **em favor** da RLS, que é o que sustenta a `BR-S02`.
- Componentes citados do legado existem: `_reversa_sdd/c4-components.md`, `_reversa_sdd/architecture.md#1. Visão Resumida` e todos os arquivos de `src/` referenciados nas ações.
- A decisão `D-01` é **derivada** das regras 🟢 do legado (`BR-MIGRAR-017`/`020` liberam a leitura), e não uma restrição nova — é o ponto em que a primeira tentativa errou e foi recusada com registro.

**Eixo 4 — Sanidade do actions**
- **4.1:** todas as dependências apontam para IDs existentes dentro de `T001`…`T028`.
- **4.2:** as **nove** tarefas marcadas `[//]` (`T001`, `T004`, `T005`, `T006`, `T007`, `T009`, `T010`, `T013`, `T014`) têm arquivos alvo **distintos entre si**.
- **4.3:** **não há ciclo de dependência** — o grafo é acíclico, e o maior caminho tem cinco elos.

---

*Auditoria leitora gerada por `/reversa-audit` em 2026-09-24. Este relatório não corrige nada: os
achados `A001` a `A007` dependem de decisão humana.*
