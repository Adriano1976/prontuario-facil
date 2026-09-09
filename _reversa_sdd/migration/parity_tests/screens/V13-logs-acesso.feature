# language: pt
# spec-id: PT-V13
# rastreabilidade:
#   target_screens: "Logs de Acesso"
#   target_architecture: BC-06 logs-acesso (AccessLogs.tsx)
#   golden: screens/golden/manifest.yaml → logs-acesso.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Logs de Acesso
  Como usuário admin
  Quero que a tela de auditoria mantenha tabela, filtros e badges do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Tela mantém filtros, estatísticas e tabela
    Dado a página convertida para .tsx
    Quando abro os Logs de Acesso
    Então exibe busca (email/paciente), filtro de ação e de período (hoje/semana/mês)
    E painel de estatísticas agregadas
    E tabela com Data/Hora, Usuário, Ação (badge colorida), Paciente e Detalhes
    Quando houver golden capturado (logs-acesso.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
