# language: pt
# spec-id: PT-V01
# rastreabilidade:
#   target_screens: "Dashboard Principal"
#   target_architecture: BC-07 dashboard (Dashboard.tsx)
#   golden: screens/golden/manifest.yaml → dashboard-principal.png (present: true)
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
    Quando a tela for comparada com o golden dashboard-principal.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
