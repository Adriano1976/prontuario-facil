# language: pt
# spec-id: PT-V01
# rastreabilidade:
#   target_screens: "Dashboard Principal"
#   target_architecture: BC-07 dashboard (Dashboard.tsx)
#   golden: screens/golden/manifest.yaml → dashboard-principal.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal (screen_modernization_decision.md)

Funcionalidade: Paridade visual — Dashboard Principal
  Como usuário
  Quero que o Dashboard mantenha a mesma UI do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Dashboard renderiza com a mesma hierarquia e textos
    Dado o Dashboard convertido para .tsx
    Quando a página é aberta
    Então exibe 4 KPI StatsCard (Pacientes Ativos, Agendamentos Hoje, Documentos Emitidos, Taxa de Atendimento "94%")
    E lista "Próximos Agendamentos" com estado vazio "Nenhum agendamento"
    E botões de Ações Rápidas (Novo Paciente, Agendar Consulta, Nova Consulta)
    E busca global via PatientSearch
    Quando houver golden capturado (dashboard-principal.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
