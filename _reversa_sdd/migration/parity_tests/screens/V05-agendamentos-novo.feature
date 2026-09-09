# language: pt
# spec-id: PT-V05
# rastreabilidade:
#   target_screens: "Novo Agendamento"
#   target_architecture: BC-03 agendamentos (NewAppointment.tsx, TimeSlotPicker.tsx)
#   golden: screens/golden/manifest.yaml → agendamentos-novo.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Novo Agendamento
  Como usuário
  Quero que o formulário de agendamento mantenha a seção "Data e Horário" e textos do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Formulário mantém campos e ações
    Dado o formulário convertido para .tsx
    Quando abro o Novo Agendamento
    Então exibe Paciente* e Médico* (dropdowns)
    E a seção "Data e Horário" com widget de calendário embutido
    E Tipo de Consulta e Observações com placeholder "Observações sobre o agendamento..."
    E botões "Cancelar" e "Confirmar Agendamento"
    Quando houver golden capturado (agendamentos-novo.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
