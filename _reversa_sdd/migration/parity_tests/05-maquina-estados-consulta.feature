# language: pt
# spec-id: PT-005
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/consultas.md; consultas/requirements.md BR-C02
#   target_architecture: BC-02 consultas (Consultation.tsx etc.)
#   target_domain_model: AGG-Consulta (BR-MIGRAR-007)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Máquina de estados da consulta
  Como médico
  Quero que o status da consulta siga o ciclo agendada → em_andamento → concluida (ou cancelada)
  Para registrar corretamente o funil clínico

  @paridade @critico
  Cenário: Consulta nasce "agendada" e avança para "em_andamento"
    Dado uma consulta recém-criada com status default
    Então seu status é "agendada"
    Quando o médico inicia o atendimento
    Então o status passa a "em_andamento"

  @paridade @critico
  Cenário: Consulta concluída
    Dado uma consulta em status "em_andamento"
    Quando o médico finaliza o atendimento
    Então o status passa a "concluida"

  @paridade @critico
  Cenário: Transições inválidas não compilam / são impedidas (estados por tipo)
    Dado o tipo ConsultationStatus como union fechada
    Então o código do alvo não permite atribuir um valor fora de {agendada, em_andamento, concluida, cancelada}
    E a interface de UI não oferece transição de "cancelada" para "concluida"
