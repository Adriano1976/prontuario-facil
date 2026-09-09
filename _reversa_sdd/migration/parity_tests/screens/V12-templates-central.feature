# language: pt
# spec-id: PT-V12
# rastreabilidade:
#   target_screens: "Central de Templates"
#   target_architecture: BC-05 templates (Templates.tsx)
#   golden: screens/golden/manifest.yaml → templates-central.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Central de Templates
  Como usuário
  Quero que a central de templates mantenha cards por categoria e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Central mantém categorias e ações
    Dado a página convertida para .tsx
    Quando abro a Central de Templates
    Então exibe cards por categoria (Receita Simples, Atestado Médico, Solicitação de Exame, Encaminhamento)
    E badge "Padrão" nos modelos e preview do conteúdo
    E botões "Editar" e "Excluir" por card
    E botão "+ Novo Template"
    Quando houver golden capturado (templates-central.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
