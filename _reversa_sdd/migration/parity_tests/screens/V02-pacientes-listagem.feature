# language: pt
# spec-id: PT-V02
# rastreabilidade:
#   target_screens: "Listagem de Pacientes"
#   target_architecture: BC-01 pacientes (Patients.tsx)
#   golden: screens/golden/manifest.yaml → pacientes-listagem.png (present: false)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Listagem de Pacientes
  Como usuário
  Quero que a listagem de pacientes mantenha a mesma UI do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Listagem renderiza cards e busca iguais ao legado
    Dado a página convertida para .tsx
    Quando abro a Listagem de Pacientes
    Então exibe contador "N pacientes cadastrados" e botão "+ Novo Paciente"
    E input de busca com placeholder "Buscar por nome, CPF, telefone ou email..."
    E cards com avatar/inicial, nome, badge status, idade, telefone, email, convênio e tipo sanguíneo
    Quando houver golden capturado (pacientes-listagem.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
