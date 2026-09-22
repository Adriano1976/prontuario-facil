# language: pt
# spec-id: PT-V14
# rastreabilidade:
#   target_screens: "Detalhe do Paciente (timeline clínica)"
#   target_architecture: BC-01 pacientes (PatientDetail.tsx)
#   golden: screens/golden/manifest.yaml → paciente-detalhe.png (present: true)
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
    Quando a tela for comparada com o golden paciente-detalhe.png (present: true)
    Então a verificação é construtiva: mesma hierarquia, mesmos textos literais e mesmos tokens
    E a comparação pixel a pixel está fora de escopo (DEV-001 — conjunto de goldens heterogêneo em viewport)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
# Revisado pelo Reversa-Inspector em 2026-09-22: golden capturado (present: true);
# paridade construtiva conforme DEV-001/DEV-002.
