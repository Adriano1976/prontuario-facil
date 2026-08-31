# Interface: Dashboard — MedRecord

## Tela: Dashboard Principal
Visão geral e centro de controle do médico.

### Elementos de Interface

- **KPI Cards** 🟢 *(confirmado no código — `Dashboard.jsx:129-158`, componente `StatsCard`)*
  - **Pacientes Ativos** — valor numérico (`activePatients`), filtrado por `status === 'ativo'`. 🟢
  - **Agendamentos Hoje** — valor numérico (`todayAppointments.length`), agendamentos do dia corrente com status ≠ `'cancelado'`. 🟢
  - **Documentos Emitidos** — valor numérico (`prescriptions?.length || 0`), total de prescrições retornadas pela API. 🟢
  - **Taxa de Atendimento** — exibe `"94%"` hard-coded. **Não há sparkline, mini chart nem barra de progresso**; o componente `StatsCard` só suporta ícone, valor e indicador de tendência textual (prop `trend`), que não é passado aqui. O "gráfico mini" mencionado anteriormente era uma inferência incorreta da imagem. 🔴 *(valor mockado, cálculo real desconhecido)*

- **Área de Agendamentos** 🟢
  - Lista "Próximos Agendamentos" — exibe até 5 agendamentos futuros não cancelados (`upcomingAppointments`). 🟢
  - **Estado vazio** — quando `upcomingAppointments.length === 0`, exibe ícone de calendário, texto "Nenhum agendamento" e botão "Agendar consulta". 🟢 *(confirmado no código — `Dashboard.jsx:227-237`)*
  - Botão "Ver todos" — link para a página `Appointments`. 🟢

- **Ações Rápidas** 🟢 *(confirmado no código — `Dashboard.jsx:254-314`)*
  - Novo Paciente → `PatientForm` 🟢
  - Agendar Consulta → `NewAppointment` 🟢
  - Nova Consulta → `NewConsultation` 🟢
  - Lista de Pacientes → `Patients` 🟢
  - Templates → `Templates` 🟢
  - Badge LGPD Compliant (visual, sem interação) 🟢

- **Busca Global de Pacientes** — campo de busca por nome/CPF via componente `PatientSearch`. 🟢 *(confirmado — `Dashboard.jsx:118`)*

- **Navegação** — menu superior fixo com ícones e labels inferido do `Layout.jsx`. 🟡 *(não implementado diretamente no Dashboard; provém do layout global)*

- **Tabs "Visão geral" / "Relatórios"** — aba "Relat órios" renderiza `<ReportsView />`. 🟢 *(confirmado — `Dashboard.jsx:160-333`)*

---
*Gerado pelo Reversa-Visor em 2026-08-27. Anotações de confiança adicionadas pelo Writer em 2026-08-31.*
