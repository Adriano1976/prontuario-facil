# Relatório de Confiança — prontuario-facil

> Regenerado pelo Reversa-Reviewer em 2026-09-02. `doc_level: completo`.

## Resumo geral

Contagem literal dos marcadores 🟢/🟡/🔴 nos arquivos das units.

| Nível | Quantidade | Percentual |
|---|---:|---:|
| 🟢 CONFIRMADO | 84 | 67,7% |
| 🟡 INFERIDO | 28 | 22,6% |
| 🔴 LACUNA | 12 | 9,7% |
| **Total** | **124** | **100%** |

**Confiança geral:** **79%** — `(84 + 27 × 0,5) / 124 × 100`.

## Confiança por unit

| Unit | 🟢 | 🟡 | 🔴 | Confiança |
|---|---:|---:|---:|---:|
| `dashboard/` | 37 | 3 | 6 | 79% |
| `consultas/` | 6 | 4 | 0 | 83% |
| `agendamentos/` | 4 | 0 | 0 | 100% |
| `pacientes/` | 6 | 3 | 0 | 83% |
| `medicos/` | 6 | 3 | 0 | 83% |
| `templates/` | 7 | 3 | 0 | 81% |
| `logs-acesso/` | 6 | 2 | 0 | 88% |
| `modo-offline/` | 12 | 10 | 6 | 61% |

## Presença dos artefatos canônicos

| Métrica | Resultado |
|---|---:|
| Units analisadas | 8 |
| `requirements.md` presentes | 8/8 |
| `design.md` presentes | 7/8 |
| `tasks.md` presentes | 7/8 |
| `screens.md` presentes | 8/8 |

## Lacunas 🔴 pendentes

- `dashboard/requirements.md`: fórmula/fonte da Taxa de Atendimento.
- `agendamentos/`: `design.md` e `tasks.md` ausentes.
- Marcadores 🔴 remanescentes em `dashboard/` e `modo-offline/` correspondem a comportamentos ainda não implementados ou dependentes de decisão técnica; ver `gaps.md`.

## Reclassificações e respostas processadas

- Q-01…Q-16: **16 respondidas** e marcadas como `✅ Respondida` em `questions.md`.
- Reclassificações principais: gatilho de confirmação, medicamentos, LGPD, horários médicos, interpolação, logs, matriz do Dashboard e status do modo offline.
- Revisão cruzada externa: não realizada.

## Próximos passos

- [ ] Definir a fórmula real da Taxa de Atendimento.
- [ ] Definir paginação/limite da tabela de Logs de Acesso.
- [ ] Solicitar ao Writer `agendamentos/design.md` e `agendamentos/tasks.md`.
- [ ] Implementar o badge/aviso visual do modo offline em etapa de código.
