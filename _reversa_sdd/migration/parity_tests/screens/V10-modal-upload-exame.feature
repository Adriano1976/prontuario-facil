# language: pt
# spec-id: PT-V10
# rastreabilidade:
#   target_screens: "Modal: Upload de Exame"
#   target_architecture: BC-02 consultas (ExamUploader.tsx)
#   golden: screens/golden/manifest.yaml → modal-upload-exame.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Modal: Upload de Exame
  Como usuário
  Quero que o modal de exame mantenha dropzone, campos e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Modal mantém dropzone e campos
    Dado o modal convertido para .tsx
    Quando abro o Modal de Upload de Exame
    Então exibe área de drag & drop aceitando "PDF ou Imagem (máx. 10MB)"
    E campos Nome do Exame*, Tipo, Data do Exame, Laboratório/Clínica, Resumo e Observações
    E botões "Cancelar" e "Salvar Exame"
    Quando houver golden capturado (modal-upload-exame.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
