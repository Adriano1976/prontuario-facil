# language: pt
# spec-id: PT-V06
# rastreabilidade:
#   target_screens: "Listagem de Consultas"
#   target_architecture: BC-02 consultas (Consultations.tsx)
#   golden: screens/golden/manifest.yaml → consultas-listagem.png (present: false)
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
    Quando houver golden capturado (consultas-listagem.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
