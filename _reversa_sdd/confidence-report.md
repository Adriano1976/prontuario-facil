# Relatório de Confiança — prontuario-facil

> Regenerado pelo Reversa-Reviewer em 2026-09-03. `doc_level: completo`.

## Resumo geral

Contagem literal dos marcadores 🟢/🟡/🔴 nos arquivos das units.

| Nível | Quantidade | Percentual |
|---|---:|---:|
| 🟢 CONFIRMADO | 141 | 70,9% |
| 🟡 INFERIDO | 36 | 18,1% |
| 🔴 LACUNA | 22 | 11,1% |
| **Total** | **199** | **100%** |

**Confiança geral:** **80%** — `(141 + 36 × 0,5) / 199 × 100`.

## Confiança por unit

| Unit | 🟢 | 🟡 | 🔴 | Confiança |
|---|---:|---:|---:|---:|
| `dashboard/` | 37 | 3 | 6 | 79% |
| `consultas/` | 6 | 4 | 0 | 83% |
| `agendamentos/` | 57 | 8 | 6 | 83% |
| `pacientes/` | 6 | 3 | 0 | 83% |
| `medicos/` | 6 | 3 | 0 | 83% |
| `templates/` | 7 | 3 | 0 | 81% |
| `logs-acesso/` | 8 | 2 | 3 | 79% |
| `modo-offline/` | 12 | 10 | 6 | 61% |

## Presença dos artefatos canônicos

| Métrica | Resultado |
|---|---:|
| Units analisadas | 8 |
| `requirements.md` presentes | 8/8 |
| `design.md` presentes | 8/8 |
| `tasks.md` presentes | 8/8 |
| `screens.md` presentes | 8/8 |

## Lacunas 🔴 pendentes

- `dashboard/requirements.md`: fórmula/fonte/período da Taxa de Atendimento.
- `logs-acesso/`: política de paginação e estratégia acima do limite de 500 registros.
- Marcadores 🔴 remanescentes em `dashboard/` e `modo-offline/` correspondem a comportamentos ainda não implementados ou dependentes de decisão técnica; ver `gaps.md`.

## Reclassificações e respostas processadas

- Q-01…Q-16: **16 respondidas** e marcadas como `✅ Respondida` em `questions.md`.
- Reclassificações principais: gatilho de confirmação, medicamentos, LGPD, horários médicos, interpolação, logs, matriz do Dashboard e status do modo offline.
- Revisão cruzada externa: não realizada.

## Próximos passos

- [ ] Definir a fórmula real da Taxa de Atendimento.
- [ ] Definir paginação/limite da tabela de Logs de Acesso.
- [x] Solicitar ao Writer `agendamentos/design.md` e `agendamentos/tasks.md`; ambos foram criados.
- [ ] Implementar o badge/aviso visual do modo offline em etapa de código.
