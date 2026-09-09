# language: pt
# spec-id: PT-V09
# rastreabilidade:
#   target_screens: "Modal: Novo Documento"
#   target_architecture: BC-02 consultas (PrescriptionEditor.tsx)
#   golden: screens/golden/manifest.yaml → modal-novo-documento.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Modal: Novo Documento
  Como usuário
  Quero que o modal de documento mantenha campos, seção de medicamentos e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Modal mantém tipos, template e ações
    Dado o modal convertido para .tsx
    Quando abro o Modal de Novo Documento em uma consulta
    Então exibe Tipo de Documento (ex: "Receita Simples"), Template ("Selecionar template...") e Conteúdo
    E a seção de Medicamentos condicional (visível apenas para tipos de receita)
    E Observações com placeholder "Observações adicionais..."
    E botões "Imprimir" e "Salvar"
    Quando houver golden capturado (modal-novo-documento.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
