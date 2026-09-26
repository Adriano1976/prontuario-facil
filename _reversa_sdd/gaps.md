# Gaps de Especificação — prontuario-facil

> Regenerado pelo Reversa-Reviewer em 2026-09-03 após processar Q-01…Q-16.

## Lacunas abertas

| ID | Severidade | Unit/arquivo | Lacuna | Próxima ação |
|---|---|---|---|---|
| G-02 | 🟡 Moderado | `logs-acesso/screens.md` | O legado carrega 500 registros e renderiza todos os filtrados sem paginação; ainda falta decidir a política desejada acima desse limite. | Definir comportamento de paginação e estratégia de carregamento. |
| G-04 | 🟡 Moderado | `modo-offline/` | O badge/aviso visual recomendado para indicar “Modo Offline — dados fictícios/de teste” ainda não foi implementado no código. | Implementar em etapa própria, fora do escopo do Reviewer. |

> **Nota de convergência (2026-09-24, feature `010-prova-modo-offline`).** `G-04` permanece
> **aberta**, e **nenhuma prova a cobre**. É lacuna de **produto**, não de prova: implementar o
> aviso mudaria comportamento observável, e a suíte teria de mudar de propósito. Ver
> `_reversa_sdd/addenda/010-prova-modo-offline.md` e `_reversa_sdd/modo-offline/requirements.md#7`.
>
> ✅ **Nota de convergência (2026-09-25, feature `016-taxa-de-atendimento`).** `G-01` está
> **RESOLVIDA**. A validação com stakeholder que a lacuna pedia aconteceu na sessão de
> esclarecimentos de 2026-09-25: definição, fonte e período foram decididos
> (`_reversa_forward/016-taxa-de-atendimento/requirements.md#9`), implementados em
> `src/lib/taxaAtendimento.ts` e provados. O cartão deixou de exibir o literal `"94%"`. A linha da
> lacuna foi removida da tabela acima — está registrada em "Lacunas resolvidas" abaixo.
>
> **Nota de convergência (2026-09-24, feature `009-prova-kpis-dashboard`).** `G-01` permanecia
> **aberta** e pedia validação com stakeholder. O que caducou em 2026-09-24 foi o **bloqueio de
> prova** que dela derivava — a feature `009` provou o comportamento (a constante `94%`) sem
> resolver a fórmula. A lacuna era de **produto**, e foi fechada no dia seguinte.

## Lacunas resolvidas nesta revisão

| Item anterior | Resolução |
|---|---|
| `G-01` — Taxa de Atendimento fixa em `94%` (fechada em 2026-09-25, feature `016-taxa-de-atendimento`) | Fórmula, fonte e período decididos com o dono do produto: `concluido ÷ (concluido + faltou) × 100` sobre `Appointment`, nos últimos 12 meses, com cancelamento e estados sem desfecho fora das duas contas. Implementado em `src/lib/taxaAtendimento.ts` e provado em `src/lib/__tests__/taxaAtendimento.test.ts` e `src/pages/__tests__/DashboardKpis.test.tsx`. Spec atualizada em `dashboard/requirements.md`. |
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
