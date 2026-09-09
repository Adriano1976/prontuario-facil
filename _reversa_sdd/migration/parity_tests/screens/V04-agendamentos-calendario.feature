# language: pt
# spec-id: PT-V04
# rastreabilidade:
#   target_screens: "Calendário de Agendamentos"
#   target_architecture: BC-03 agendamentos (Appointments.tsx, AppointmentCalendar.tsx)
#   golden: screens/golden/manifest.yaml → agendamentos-calendario.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Calendário de Agendamentos
  Como usuário
  Quero que o calendário semanal mantenha visual e legendas do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Calendário mantém modo, grade horária e legenda de status
    Dado a página convertida para .tsx
    Quando abro o Calendário de Agendamentos
    Então exibe alternador Calendário/Lista e grade semanal 8:00–19:00 com dia atual destacado
    E navegadores temporais (<, Hoje, >)
    E legenda com os 6 status (Agendado, Confirmado, Em Atendimento, Concluido, Cancelado, Faltou)
    E botão "+ Novo Agendamento"
    Quando houver golden capturado (agendamentos-calendario.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
