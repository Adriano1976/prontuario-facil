# language: pt
# spec-id: PT-V03
# rastreabilidade:
#   target_screens: "Cadastro de Novo Paciente"
#   target_architecture: BC-01 pacientes (PatientForm.tsx)
#   golden: screens/golden/manifest.yaml → pacientes-novo.png (present: true)
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Cadastro de Novo Paciente
  Como usuário
  Quero que o formulário de paciente mantenha as seções e textos do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Formulário mantém seções, placeholders e ação LGPD
    Dado o formulário convertido para .tsx
    Quando abro o Cadastro de Novo Paciente
    Então exibe as seções Dados Pessoais, Contato, Convênio, Informações Médicas e LGPD
    E o aviso "Consentimento LGPD pendente" com botão "Ver Termo"
    E botões "Cancelar" e "Salvar Paciente"
    Quando a tela for comparada com o golden pacientes-novo.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
