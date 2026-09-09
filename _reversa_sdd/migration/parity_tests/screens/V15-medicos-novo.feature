# language: pt
# spec-id: PT-V15
# rastreabilidade:
#   target_screens: "Modal: Novo Médico"
#   target_architecture: BC-04 medicos (Doctors.tsx — dialog)
#   golden: screens/golden/manifest.yaml (médicos: captura via Doctors.jsx)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Modal: Novo Médico
  Como usuário admin
  Quero que o modal de médico mantenha seções e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Modal mantém dados básicos, escala e ações
    Dado o dialog convertido para .tsx
    Quando abro o Modal de Novo Médico
    Então exibe Dados Básicos (Nome Completo*, Especialidade*, CRM*, Email, Telefone)
    E Escala com checkboxes de dias da semana, Horário Início/Fim e Duração (min)
    E switch "Médico ativo"
    E botões "Cancelar" e "Salvar"
