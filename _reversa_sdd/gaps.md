# Gaps de Especificação — prontuario-facil

> Regenerado pelo Reversa-Reviewer em 2026-09-02 após processar Q-01…Q-16.

## Lacunas abertas

| ID | Severidade | Unit/arquivo | Lacuna | Próxima ação |
|---|---|---|---|---|
| G-01 | 🔴 Crítico | `dashboard/requirements.md` | A Taxa de Atendimento permanece fixa em `94%`; fórmula, fonte e período não foram definidos. | Validar regra com stakeholder e atualizar a spec. |
| G-02 | 🟡 Moderado | `logs-acesso/screens.md` | Não foi informado se a tabela usa paginação/limite ou carrega todos os registros. | Definir comportamento de paginação e atualizar tela/design/tasks. |
| G-03 | 🔴 Crítico | `agendamentos/` | `design.md` e `tasks.md` não existem. | Writer deve gerar os dois artefatos canônicos. |
| G-04 | 🟡 Moderado | `modo-offline/` | O badge/aviso visual recomendado para indicar “Modo Offline — dados fictícios/de teste” ainda não foi implementado no código. | Implementar em etapa própria, fora do escopo do Reviewer. |

## Lacunas resolvidas nesta revisão

| Item anterior | Resolução |
|---|---|
| Dashboard incompleto e matriz sem Dashboard | Artefatos presentes; matriz aponta para `_reversa_sdd/dashboard/`. |
| Campos de data/hora em Agendamentos | `screens.md` documenta a seção “Data e Horário” com date picker. |
| Gatilho de `confirmado` | Transição manual; flags de lembrete não alteram status. |
| `medications` em Consultas | Subcampos, preenchimento livre e ocultação fora de receita documentados. |
| Consentimento LGPD de Pacientes | Modal de termo, aceite obrigatório e registro de data/IP documentados. |
| Restrição de horários de Médicos | `working_days`, `working_hours` e `appointment_duration` documentados. |
| Interpolação de Templates | Ocorre no salvamento, com possível preenchimento manual de `DIAS_AFASTAMENTO`. |
| Gatilhos de Logs | Serviço/interceptor em login bem-sucedido e visualização de dados sensíveis. |
| Modo Offline | Finalidade permanente, seed fictício, subset de operações e usuário fixo confirmados. |

## Observação

Os gaps resolvidos não foram removidos silenciosamente: permanecem relacionados na tabela de resolução para rastreabilidade. Nenhum arquivo fora de `_reversa_sdd/` foi alterado.
