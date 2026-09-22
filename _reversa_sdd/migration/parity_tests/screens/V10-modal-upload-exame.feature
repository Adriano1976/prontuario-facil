# language: pt
# spec-id: PT-V10
# rastreabilidade:
#   target_screens: "Modal: Upload de Exame"
#   target_architecture: BC-02 consultas (ExamUploader.tsx)
#   golden: screens/golden/manifest.yaml → modal-upload-exame.png (present: true)
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
    Quando a tela for comparada com o golden modal-upload-exame.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
