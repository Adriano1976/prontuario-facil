# language: pt
# spec-id: PT-V03
# rastreabilidade:
#   target_screens: "Cadastro de Novo Paciente"
#   target_architecture: BC-01 pacientes (PatientForm.tsx)
#   golden: screens/golden/manifest.yaml → pacientes-novo.png (present: false)
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
    Quando houver golden capturado (pacientes-novo.png)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
