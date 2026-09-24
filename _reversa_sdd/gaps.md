# Gaps de Especificação — prontuario-facil

> Regenerado pelo Reversa-Reviewer em 2026-09-03 após processar Q-01…Q-16.

## Lacunas abertas

| ID | Severidade | Unit/arquivo | Lacuna | Próxima ação |
|---|---|---|---|---|
| G-01 | 🔴 Crítico | `dashboard/requirements.md` | A Taxa de Atendimento permanece fixa em `94%`; fórmula, fonte e período não foram definidos. | Validar regra com stakeholder e atualizar a spec. |
| G-02 | 🟡 Moderado | `logs-acesso/screens.md` | O legado carrega 500 registros e renderiza todos os filtrados sem paginação; ainda falta decidir a política desejada acima desse limite. | Definir comportamento de paginação e estratégia de carregamento. |
| G-04 | 🟡 Moderado | `modo-offline/` | O badge/aviso visual recomendado para indicar “Modo Offline — dados fictícios/de teste” ainda não foi implementado no código. | Implementar em etapa própria, fora do escopo do Reviewer. |

> **Nota de convergência (2026-09-24, feature `010-prova-modo-offline`).** `G-04` permanece
> **aberta**, e **nenhuma prova a cobre**. É lacuna de **produto**, não de prova: implementar o
> aviso mudaria comportamento observável, e a suíte teria de mudar de propósito. Ver
> `_reversa_sdd/addenda/010-prova-modo-offline.md` e `_reversa_sdd/modo-offline/requirements.md#7`.
>
> **Nota de convergência (2026-09-24, feature `009-prova-kpis-dashboard`).** `G-01` também
> **permanece aberta** e segue pedindo validação com stakeholder. O que caducou foi o **bloqueio de
> prova** que dela derivava — a feature `009` provou o comportamento (a constante `94%`) sem
> resolver a fórmula. A lacuna é de **produto**. Ver `dashboard/requirements.md`.

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
| R-03 / G-03 | Artefatos canônicos de Agendamentos | `agendamentos/design.md` e `agendamentos/tasks.md` criados e verificados pelo Writer em 2026-09-02. |

## Observação

Os gaps resolvidos não foram removidos silenciosamente: permanecem relacionados na tabela de resolução para rastreabilidade. Nenhum arquivo fora de `_reversa_sdd/` foi alterado.

---
*Gerado pelo Reversa-Reviewer em 2026-09-03.*
