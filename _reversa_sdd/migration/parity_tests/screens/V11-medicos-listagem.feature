# language: pt
# spec-id: PT-V11
# rastreabilidade:
#   target_screens: "Gerenciamento de Médicos"
#   target_architecture: BC-04 medicos (Doctors.tsx)
#   golden: screens/golden/manifest.yaml → medicos-listagem.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Gerenciamento de Médicos
  Como usuário
  Quero que o painel de médicos mantenha cards, badges e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual
  Cenário: Painel mantém cards de médicos e ações
    Dado a página convertida para .tsx
    Quando abro o Gerenciamento de Médicos
    Então exibe cards com avatar/inicial, nome, especialidade, CRM+UF, badge Ativo
    E intervalo de horário e badges dos dias da semana
    E botões "Editar" e "Excluir" por card
    E botão "+ Novo Médico"
    Quando houver golden capturado (medicos-listagem.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
