# language: pt
# spec-id: PT-V07
# rastreabilidade:
#   target_screens: "Novo Atendimento (Anamnese)"
#   target_architecture: BC-02 consultas (NewConsultation.tsx, VitalSignsForm.tsx)
#   golden: screens/golden/manifest.yaml → consultas-novo.png (present: true)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Novo Atendimento (Anamnese)
  Como usuário
  Quero que o formulário de atendimento mantenha seções e textos do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Formulário mantém seções clínicas e ações
    Dado o formulário convertido para .tsx
    Quando abro o Novo Atendimento
    Então exibe busca de paciente, Data e Hora*, Status e Data de Retorno
    E Sinais Vitais (PA, FC, Temperatura, FR, SatO2, Peso, Altura)
    E seções de Anamnese (Queixa Principal, HDA, Exame Físico) e Diagnóstico (CID-10, Plano)
    E botões "Cancelar" e "Salvar Consulta"
    Quando a tela for comparada com o golden consultas-novo.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
