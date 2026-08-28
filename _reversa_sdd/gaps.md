# Gaps de Especificação — prontuario-facil

> Gerado pelo Reversa-Reviewer em 2026-08-28.
> Lacunas que permanecem abertas e requerem ação do Writer ou do usuário.

---

## Severidade: 🔴 Crítico

Lacunas que bloqueiam reimplementação fiel da funcionalidade.

| # | Unit | Lacuna | Ação Recomendada |
|---|------|--------|-----------------|
| G-01 | `dashboard/` | Arquivos canônicos ausentes: `requirements.md`, `design.md`, `tasks.md` | Writer deve gerar os 3 arquivos canônicos da unit dashboard |
| G-02 | `consultas/` | `design.md` e `tasks.md` ausentes — fluxo de emissão de documentos não especificado | Writer deve completar a unit consultas |
| G-03 | `pacientes/` | `design.md` e `tasks.md` ausentes — fluxo LGPD e validação de CPF não especificados | Writer deve completar a unit pacientes |
| G-04 | `medicos/` | `design.md` e `tasks.md` ausentes — lógica de bloqueio de horários não especificada | Writer deve completar a unit medicos |
| G-05 | `templates/` | `design.md` e `tasks.md` ausentes — lógica de interpolação de variáveis não especificada | Writer deve completar a unit templates |
| G-06 | `logs-acesso/` | `design.md` e `tasks.md` ausentes — gatilho de criação de logs não especificado | Writer deve completar a unit logs-acesso |
| G-07 | `agendamentos/` | `design.md` e `tasks.md` ausentes e contradição UI vs. BR-A01: formulário não mostra campo de data/hora | Writer deve completar a unit; Q-03 deve ser respondida antes |

## Severidade: 🟡 Moderado

Lacunas que impactam qualidade ou fidelidade, mas não bloqueiam completamente a reimplementação.

| # | Unit / Global | Lacuna | Ação Recomendada |
|---|------|--------|-----------------|
| G-08 | `dashboard/screens.md` | Ausência de escala de confiança 🟢/🟡/🔴 — nenhum elemento classificado | Visor deve reclassificar o arquivo |
| G-09 | `agendamentos/requirements.md` | Transição para status `confirmado` sem gatilho documentado (Q-04) | Atualizar BR-A03 com o gatilho após resposta do usuário |
| G-10 | `consultas/requirements.md` | Campo `medications` sem spec dos subcampos internos (Q-06) | Completar BR-C03 com estrutura de dados da lista de medicamentos |
| G-11 | `code-spec-matrix.md` | Módulo `dashboard` ausente da matrix | Adicionar linha para `dashboard/` após confirmar arquivo legado (Q-11) |
| G-12 | `pacientes/` vs. `consultas/` | Inconsistência de wording em permissões de Create (Q-12) | Padronizar após confirmar papéis do sistema |

## Severidade: 🟢 Cosmético

Lacunas menores que não afetam funcionalidade nem fidelidade.

| # | Arquivo | Lacuna | Ação Recomendada |
|---|---------|--------|-----------------|
| G-13 | Todos os `screens.md` | Rodapé `*Gerado pelo Reversa-Visor em 2026-08-27.*` não usa formato ISO 8601 | Padronizar para `<!-- visor: 2026-08-27T00:00:00-03:00 -->` em revisão futura |
| G-14 | `medicos/screens.md` | "Modal: Novo Médico" é descrito como modal, mas o título da tela diz "Tela: Modal: Novo Médico" — nomenclatura inconsistente com o padrão das outras units (que usam só "Tela:") | Padronizar naming de modais no `screens.md` |
| G-15 | `logs-acesso/screens.md` | Sem header de contagem de registros nem paginação documentada — não é possível saber se a tabela tem limite de linhas | Completar com info de paginação após Q-10 ser respondida |
