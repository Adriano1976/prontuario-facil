# language: pt
# spec-id: PT-V02
# rastreabilidade:
#   target_screens: "Listagem de Pacientes"
#   target_architecture: BC-01 pacientes (Patients.tsx)
#   golden: screens/golden/manifest.yaml → pacientes-listagem.png (present: true)
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
    Quando a tela for comparada com o golden pacientes-listagem.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
