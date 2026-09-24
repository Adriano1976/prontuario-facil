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

  # ---------------------------------------------------------------------------
  # VEREDITO DE PROVA — convergência de 2026-09-24 (feature 009-prova-kpis-dashboard)
  #
  # Os cinco cenários abaixo foram convertidos em verificação de execução em
  # src/pages/__tests__/DashboardKpis.test.tsx. Os vereditos por cenário vivem em
  # _reversa_sdd/code-spec-matrix.md#Cenários de paridade do grupo 08, e o registro
  # completo da convergência em _reversa_sdd/addenda/009-prova-kpis-dashboard.md.
  #
  #   PT-008.1  PROVADO      Pacientes Ativos conta só "ativo"
  #   PT-008.2  PROVADO      Agendamentos Hoje exclui APENAS "cancelado" — a borda é explícita:
  #                          "faltou", "concluido" e "confirmado" contam
  #   PT-008.3  PROVADO PELA AUSÊNCIA — o critério divergente de AMB-002 está preservado em
  #                          código morto (Dashboard.tsx calcula e descarta), e não há
  #                          superfície onde medi-lo
  #   PT-008.4  PROVADO COM METADE FALSA — o comportamento (a constante "94%", sem fórmula) é
  #                          provado; a cláusula "vindo de constante tipada" NÃO é verdadeira
  #                          hoje: não existe símbolo com esse nome em src/
  #   PT-008.5  PROVADO      até 5 futuros não cancelados, com o estado vazio correto
  # ---------------------------------------------------------------------------

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

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
