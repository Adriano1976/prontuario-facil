# language: pt
# spec-id: PT-002
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/pacientes.md; _reversa_sdd/agendamentos/requirements.md BR-A02
#   target_architecture: BC-01 pacientes / BC-03 agendamentos
#   target_domain_model: AGG-Paciente (BR-MIGRAR-001)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Seleção de pacientes ativos para agendamento e consulta
  Como usuário autenticado
  Quero selecionar apenas pacientes com status ativo
  Para não criar agendamentos/consultas para pacientes inativos

  @paridade @critico
  Cenário: Paciente inativo não aparece na seleção
    Dado um paciente com status "inativo" e um paciente com status "ativo"
    Quando abro o seletor de paciente no Novo Agendamento ou Novo Atendimento
    Então apenas o paciente com status "ativo" está disponível para seleção
    E o paciente inativo não pode ser vinculado

  @paridade
  Cenário: Paciente ativo é selecionável
    Dado um paciente com status "ativo"
    Quando abro o seletor de paciente
    Então o paciente aparece na lista de seleção
