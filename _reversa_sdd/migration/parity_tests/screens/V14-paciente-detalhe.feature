# language: pt
# spec-id: PT-V14
# rastreabilidade:
#   target_screens: "Detalhe do Paciente (timeline clínica)"
#   target_architecture: BC-01 pacientes (PatientDetail.tsx)
#   golden: manifest.yaml nonDeterministic → captura manual com seed
#   paradigma_alvo: funcional — sem mudança; modo literal

Funcionalidade: Paridade visual — Detalhe do Paciente
  Como usuário
  Quero que o detalhe do paciente mantenha header, alertas, timeline e ações do legado
  Para que a migração de tipos não altere a interface

  @paridade-visual @critico
  Cenário: Detalhe mantém header, timeline e ações de documento
    Dado a página convertida para .tsx
    Quando abro o Detalhe do Paciente
    Então exibe dados do paciente e alerta de alergias
    E tabs da timeline (appointments/consultations/prescriptions/exams) com merge ordenado por data
    E botões de emissão de documento (Receita/Atestado/Exame)
    Quando houver golden capturado (captura manual com dados do mockSeed)
    Então a renderização coincide com o golden dentro das normalizationRules do manifest
