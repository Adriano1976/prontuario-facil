# language: pt
# spec-id: PT-008
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/dashboard.md; dashboard/requirements.md
#   target_architecture: BC-07 dashboard (Dashboard.tsx, StatsCard.tsx)
#   target_domain_model: AGG-Dashboard (BR-MIGRAR-027…033; AMB-001/002 resolvidos)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: KPIs do Dashboard com critérios do legado (paridade)
  Como médico
  Quero ver KPIs com os mesmos critérios do sistema atual
  Para manter a paridade 100% de comportamento

  @paridade @critico
  Cenário: KPI Pacientes Ativos conta apenas status "ativo"
    Dado pacientes com status "ativo" e "inativo" no repositório
    Quando o Dashboard carrega
    Então o KPI "Pacientes Ativos" mostra o total de pacientes com status "ativo"

  @paridade @critico
  Cenário: Agendamentos Hoje exclui cancelados
    Dado agendamentos hoje incluindo um com status "cancelado"
    Quando o KPI "Agendamentos Hoje" é calculado
    Então o agendamento cancelado não é contado

  @paridade
  Cenário: Divergência Consultas de Hoje é preservada
    Dado consultas de hoje incluindo uma com status "cancelada"
    Quando o Dashboard carrega
    Então a contagem de consultas de hoje mantém o critério atual do legado (não corrigida — AMB-002)

  @paridade
  Cenário: Taxa de Atendimento permanece como constante mock "94%"
    Quando o KPI "Taxa de Atendimento" é renderizado
    Então o valor exibido é "94%" vindo de constante tipada (sem sparkline/barra — Q-02)
    E nenhuma fórmula nova é calculada (AMB-001 resolvido — paridade)

  @paridade
  Cenário: Próximos agendamentos lista até 5 futuros não cancelados
    Dado agendamentos futuros e passados, incluindo cancelados
    Quando a lista "Próximos Agendamentos" é montada
    Então exibe até 5 agendamentos com data futura e status diferente de "cancelado"
    E quando não há nenhum, exibe estado vazio "Nenhum agendamento" com botão "Agendar consulta"
