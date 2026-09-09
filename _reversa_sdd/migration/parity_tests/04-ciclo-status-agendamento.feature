# language: pt
# spec-id: PT-004
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/agendamentos.md; agendamentos/requirements.md BR-A03
#   target_architecture: BC-03 agendamentos (Appointments.tsx)
#   target_domain_model: AGG-Agendamento (BR-MIGRAR-011/012; AMB-003 resolvido)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Ciclo de status do agendamento (transição manual)
  Como médico, recepcionista ou admin
  Quero transicionar o status do agendamento manualmente
  Para controlar o atendimento sem automação de status

  @paridade @critico
  Cenário: Agendamento nasce como "agendado" e é confirmado manualmente
    Dado um agendamento recém-criado
    Então seu status é "agendado"
    Quando um usuário com permissão altera o status para "confirmado" na interface
    Então o status passa a ser "confirmado"

  @paridade @critico
  Cenário: Concluir consulta NÃO transiciona o agendamento automaticamente
    Dado um agendamento com status "em_atendimento" e uma consulta vinculada
    Quando a consulta é concluída
    Então o agendamento permanece com o status atual (sem gatilho automático)
    E o agendamento só muda para "concluido" se transicionado manualmente na UI

  @paridade
  Cenário: Flags de lembrete não alteram status
    Dado um agendamento com reminder_sent = true e reminder_sent_date preenchida
    Quando o lembrete é marcado como enviado
    Então o status do agendamento permanece inalterado

  @paridade @critico
  Cenário: Cancelar e marcar falta são transições válidas
    Dado um agendamento em status "agendado"
    Quando o usuário o transiciona para "cancelado" ou "faltou"
    Então o novo status é persistido
