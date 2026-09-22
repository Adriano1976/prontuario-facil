# language: pt
# spec-id: PT-V16
# rastreabilidade:
#   target_screens: "Modal: Criar / Editar Template"
#   target_architecture: BC-05 templates (Templates.tsx — dialog)
#   golden: screens/golden/manifest.yaml → templates-modal.png (present: true)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Modal: Criar / Editar Template
  Como usuário admin
  Quero que o modal de template mantenha painel de variáveis e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Modal mantém identificação, variáveis e toggles
    Dado o dialog convertido para .tsx
    Quando abro o Modal de Criar/Editar Template
    Então exibe Nome do Template* e Tipo*
    E painel de variáveis copiáveis ({PACIENTE_NOME}, {PACIENTE_CPF}, {DATA}, {DATA_EXTENSO}, {DIAS_AFASTAMENTO})
    E editor de Conteúdo* e toggles "Template padrão" e "Ativo"
    E botões "Cancelar" e "Salvar"

  @paridade-visual
  Cenário: Conferência contra o golden capturado
    Dado o componente convertido para .tsx
    Quando a tela for comparada com o golden templates-modal.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
