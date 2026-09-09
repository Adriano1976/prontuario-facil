# language: pt
# spec-id: PT-003
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/agendamentos.md; _reversa_sdd/medicos/requirements.md BR-M03
#   target_architecture: BC-03 agendamentos (NewAppointment.tsx, TimeSlotPicker.tsx)
#   target_domain_model: AGG-Agendamento (BR-MIGRAR-013)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Agendamento respeita a jornada do médico
  Como médico ou recepcionista
  Quero agendar somente em horários dentro da jornada do médico
  Para não criar agendamentos em dias/horários indisponíveis

  @paridade @critico
  Cenário: Horário fora do working_hours é rejeitado
    Dado um médico com working_days [1,2,3,4,5], working_hours 08:00–18:00 e appointment_duration 30
    Quando tento agendar às 19:00 em um dia de trabalho
    Então o agendamento é rejeitado com indicação de horário indisponível

  @paridade @critico
  Cenário: Dia fora do working_days é rejeitado
    Dado um médico com working_days [1,2,3,4,5]
    Quando tento agendar em um sábado (dia 6)
    Então o agendamento é rejeitado

  @paridade @critico
  Cenário: Slot que não cabe na duração é rejeitado
    Dado um médico com appointment_duration 30 e fim de expediente 18:00
    Quando tento agendar às 17:45
    Então o agendamento é rejeitado (slot não cabe na duração)

  @paridade
  Cenário: Horário válido é aceito
    Dado um médico com working_days [1,2,3,4,5], working_hours 08:00–18:00 e appointment_duration 30
    Quando agendo às 10:00 em um dia de trabalho
    Então o agendamento é criado com status "agendado"
