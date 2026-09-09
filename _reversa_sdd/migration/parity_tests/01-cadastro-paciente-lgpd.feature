# language: pt
# spec-id: PT-001
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/pacientes.md (cadastro e consentimento LGPD)
#   target_architecture: BC-01 pacientes (src/pages/PatientForm.tsx)
#   target_domain_model: AGG-Paciente (BR-MIGRAR-003/004)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Cadastro de paciente com consentimento LGPD
  Como médico ou recepcionista
  Quero cadastrar um paciente somente com consentimento LGPD aceito
  Para manter conformidade LGPD e registro de data/IP do aceite

  @paridade @critico @regulatorio
  Cenário: Cadastro sem aceite LGPD é recusado
    Dado um usuário autenticado
    E o formulário "Cadastro de Novo Paciente" aberto
    Quando preencho full_name, cpf, birth_date e phone sem marcar o consentimento LGPD
    E aciono "Salvar Paciente"
    Então o cadastro é recusado (não persiste)
    E nenhum registro com aquele cpf existe no repositório

  @paridade @critico @regulatorio
  Cenário: Cadastro com aceite LGPD registra data e IP no save
    Dado um usuário autenticado
    E o formulário "Cadastro de Novo Paciente" aberto
    Quando abro o termo via "Ver Termo"
    E marco o consentimento LGPD
    E preencho os campos obrigatórios (full_name, cpf, birth_date, phone)
    E aciono "Salvar Paciente"
    Então o paciente é persistido com lgpd_consent = true
    E lgpd_consent_date e lgpd_consent_ip estão preenchidos no momento do save

  @paridade @critico
  Cenário: Campo cpf é tratado como dado sensível
    Dado um cadastro de paciente com cpf preenchido
    Quando o registro é persistido no Base44
    Então o cpf permanece criptografado no armazenamento (BaaS)
    E o tipo do campo cpf é marcado como sensível no contrato tipado
