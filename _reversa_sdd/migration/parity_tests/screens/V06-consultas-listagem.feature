# language: pt
# spec-id: PT-V06
# rastreabilidade:
#   target_screens: "Listagem de Consultas"
#   target_architecture: BC-02 consultas (Consultations.tsx)
#   golden: screens/golden/manifest.yaml → consultas-listagem.png (present: true)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Listagem de Consultas
  Como usuário
  Quero que a listagem de consultas mantenha filtros, badges e textos do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Listagem mantém filtros e apresentação por consulta
    Dado a página convertida para .tsx
    Quando abro a Listagem de Consultas
    Então exibe busca com placeholder "Buscar por paciente, queixa ou diagnóstico..."
    E dropdowns "Todos Status" e "Todas as datas"
    E itens com iniciais do paciente, nome, badge de status, data/hora/queixa e data de retorno
    E contador "N consultas encontradas" e botão "+ Nova Consulta"
    Quando a tela for comparada com o golden consultas-listagem.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
