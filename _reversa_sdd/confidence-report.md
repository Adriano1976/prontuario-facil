# Relatório de Confiança — prontuario-facil

> Gerado pelo Reversa-Reviewer em 2026-08-28.
> `doc_level: completo` | Revisão cruzada via Codex: **não realizada** (Codex não disponível nesta sessão).

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Units revisadas | 7 (dashboard, pacientes, consultas, agendamentos, medicos, templates, logs-acesso) |
| Arquivos canônicos esperados | 21 (3 por unit × 7 units) |
| Arquivos canônicos presentes | **7 de 21** (33%) |
| `screens.md` presentes | 7 de 7 (100%) |
| `requirements.md` presentes | 6 de 7 (86%) — dashboard ausente |
| `design.md` presentes | **0 de 7** (0%) |
| `tasks.md` presentes | **0 de 7** (0%) |
| Globais verificados | `code-spec-matrix.md` ✅, `impact-matrix.md` ✅ |
| Lacunas 🔴 identificadas | **7 críticas** |
| Lacunas 🟡 identificadas | 5 moderadas |
| Lacunas 🟢 cosméticas | 3 |
| Perguntas geradas (`questions.md`) | 12 |

---

## Confiança por Unit

### `dashboard/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ❌ | — | Ausente |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟡 INFERIDO | Sem escala 🟢/🟡/🔴; KPIs sem lógica de cálculo |

**Confiança geral da unit:** 🔴 10% — apenas UI parcialmente documentada, sem nenhum canônico.

---

### `pacientes/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | BRs bem fundamentadas no schema |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟢 CONFIRMADO | UI completa e bem detalhada |

**Confiança geral da unit:** 🟡 55% — dados e UI cobertos; fluxo LGPD e validações sem spec.

---

### `consultas/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | BRs sólidas; subcampos de `medications` incompletos |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟢 CONFIRMADO | 5 telas documentadas; boa cobertura de modais |

**Confiança geral da unit:** 🟡 60% — UI mais completa do sistema, mas fluxo de emissão de documentos sem spec de design.

---

### `agendamentos/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | BRs bem definidas; gatilho de `confirmado` em lacuna |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟡 INFERIDO | **Contradição crítica**: formulário omite campo de data/hora (BR-A01 exige `date`) |

**Confiança geral da unit:** 🔴 40% — contradição UI vs. regra de negócio; campo de data não documentado.

---

### `medicos/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | Schema claro; falta BR sobre bloqueio de horários |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟢 CONFIRMADO | UI completa do cadastro e edição |

**Confiança geral da unit:** 🟡 55% — estrutura sólida; integração com Agendamentos não especificada.

---

### `templates/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | BRs bem fundamentadas; enum de 7 tipos não listado explicitamente |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟢 CONFIRMADO | UI completa; variáveis dinâmicas bem documentadas |

**Confiança geral da unit:** 🟡 60% — UI e dados cobertos; lógica de interpolação não especificada.

---

### `logs-acesso/`

| Artefato | Presente | Classificação dominante | Observação |
|----------|----------|------------------------|------------|
| `requirements.md` | ✅ | 🟢 CONFIRMADO | Append-only e enum de ações documentados |
| `design.md` | ❌ | — | Ausente |
| `tasks.md` | ❌ | — | Ausente |
| `screens.md` | ✅ | 🟢 CONFIRMADO | UI simples e bem documentada; sem info de paginação |

**Confiança geral da unit:** 🟡 55% — gatilho de criação de logs não especificado.

---

## Confiança Global do Projeto

| Indicador | Valor |
|-----------|-------|
| % de arquivos canônicos presentes | 33% |
| Arquivos com confiança 🟢 | `pacientes/requirements.md`, `consultas/requirements.md`, `agendamentos/requirements.md`, `medicos/requirements.md`, `templates/requirements.md`, `logs-acesso/requirements.md`, todos os `screens.md` (exceto dashboard) |
| Arquivos com 🟡 (inferências dominantes) | `dashboard/screens.md` (sem escala de confiança), `agendamentos/screens.md` (contradição) |
| Arquivos críticos ausentes | `design.md` (todas as 7 units), `tasks.md` (todas as 7 units), `dashboard/requirements.md` |
| **Confiança geral estimada** | **🟡 48%** |

---

## Próximos Passos Recomendados

1. **Preencher `_reversa_sdd/questions.md`** — 12 perguntas aguardam resposta do Adriano. Priorize Q-01, Q-03, Q-05 (críticas para reimplementação).
2. **Rodar o Writer** — após as respostas, o Writer deve gerar `design.md` e `tasks.md` para todas as 7 units e `requirements.md` para `dashboard/`.
3. **Corrigir `agendamentos/screens.md`** — adicionar campo de data/hora do formulário de Novo Agendamento (Q-03).
4. **Atualizar `code-spec-matrix.md`** — incluir linha do `dashboard/` após confirmar arquivo legado (Q-11).
5. **Reclassificar `dashboard/screens.md`** — aplicar escala 🟢/🟡/🔴 em todos os elementos.

---

## Revisão Cruzada

- Engine externa consultada: **não realizada**
- Motivo: Codex não disponível nesta sessão
- Recomendação: em `doc_level: completo`, a revisão cruzada é opcional. Execute com `/reversa-reviewer` em sessão com Codex ativo para segunda opinião.
