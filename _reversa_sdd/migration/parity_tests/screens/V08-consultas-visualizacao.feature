# language: pt
# spec-id: PT-V08
# rastreabilidade:
#   target_screens: "Visualização de Consulta"
#   target_architecture: BC-02 consultas (Consultation.tsx)
#   golden: screens/golden/manifest.yaml → consultas-visualizacao.png (present: true)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Visualização de Consulta
  Como usuário
  Quero que a visualização de consulta mantenha painéis e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Visualização mantém painel de paciente, sinais vitais e anamnese
    Dado a página convertida para .tsx
    Quando abro a Visualização de Consulta
    Então exibe header com data/hora, badge de status e botões "Imprimir" e "Editar"
    E painel do paciente com alerta de alergias
    E botões "Nova Receita", "Atestado" e "Exame"
    E painéis de Sinais Vitais e Anamnese consolidados
    Quando a tela for comparada com o golden consultas-visualizacao.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
