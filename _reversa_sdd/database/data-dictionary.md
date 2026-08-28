# Dicionário de Dados

> Gerado por reversa-data-master em 27/08/2026.
> Nível de Confiança: 🟢 Alta (extraído diretamente dos Schemas JSON do Base44)

Este documento detalha a estrutura de todas as coleções/tabelas inferidas a partir do Backend as a Service.

## Módulo: Gestão de Pacientes

### `Patient`
Tabela central para gestão de dados dos pacientes, com forte adesão a dados LGPD.
- **full_name**: `string` (obrigatório) - Nome completo do paciente.
- **cpf**: `string` (obrigatório) - CPF do paciente (criptografado no banco).
- **birth_date**: `date` (obrigatório) - Data de nascimento.
- **gender**: `string` (enum: masculino, feminino, outro, prefiro_nao_informar) - Gênero.
- **phone**: `string` (obrigatório) - Telefone de contato principal.
- **email**: `string` - Email.
- **address**: `string` - Endereço completo.
- **lgpd_consent**: `boolean` (obrigatório) - Indica aceite da política LGPD.
- **lgpd_consent_date**: `datetime` - Data do consentimento.
- **status**: `string` (enum: ativo, inativo, default: ativo) - Situação do paciente.

## Módulo: Agendamentos

### `Appointment`
Gerencia a marcação de horários entre pacientes e médicos.
- **patient_id**: `string` (obrigatório, FK) - Referência ao paciente.
- **doctor_id**: `string` (obrigatório, FK) - Referência ao médico.
- **date**: `datetime` (obrigatório) - Data e hora do agendamento.
- **duration**: `number` (default: 30) - Duração em minutos.
- **type**: `string` (enum: primeira_consulta, retorno, exame, procedimento) - Tipo de visita.
- **status**: `string` (enum: agendado, confirmado, em_atendimento, concluido, cancelado, faltou) - Status do agendamento.
- **consultation_id**: `string` (FK) - Relacionado à consulta quando o status muda para concluído.

### `Doctor`
Gerencia os profissionais de saúde que prestam atendimento na clínica.
- **user_id**: `string` (obrigatório, FK) - ID do usuário autenticado correspondente (se aplicável).
- **full_name**: `string` (obrigatório) - Nome do médico.
- **crm**: `string` (obrigatório) - Conselho Regional de Medicina.
- **specialty**: `string` - Especialidade.
- **status**: `string` - Status de atividade.

## Módulo: Clínico (Prontuário Eletrônico)

### `Consultation`
Armazena a anamnese e os dados do atendimento presencial/telemedicina.
- **patient_id**: `string` (obrigatório, FK) - Referência ao paciente atendido.
- **date**: `datetime` (obrigatório) - Data efetiva do atendimento clínico.
- **chief_complaint**: `string` - Queixa principal.
- **history_present_illness**: `string` - História da doença atual.
- **vital_signs**: `object` - Sinais vitais (pressão, freq cardíaca, respiração, saturação, peso, altura).
- **physical_exam**: `string` - Exame físico.
- **diagnosis**: `string` - Diagnóstico clínico livre.
- **icd_code**: `string` - CID-10 associado.
- **treatment_plan**: `string` - Plano de tratamento prescrito.
- **status**: `string` (enum: agendada, em_andamento, concluida, cancelada).

### `Prescription`
Armazena todos os documentos emitidos em um atendimento.
- **patient_id**: `string` (obrigatório, FK) - Relacionado ao paciente.
- **consultation_id**: `string` (FK) - Relacionado à consulta de origem.
- **type**: `string` (obrigatório, enum: receita_simples, receita_controlada, atestado, solicitacao_exame, etc).
- **content**: `string` (obrigatório) - O texto completo do documento (geralmente gerado a partir de templates).
- **medications**: `array of objects` - Estrutura dos remédios prescritos (nome, dosagem, frequência, etc).

### `Exam`
Registro de solicitações e resultados de exames dos pacientes.
- **patient_id**: `string` (obrigatório, FK) - Relacionado ao paciente.
- **name**: `string` (obrigatório) - Nome do exame.
- **date**: `datetime` (obrigatório) - Data da solicitação ou realização.
- **results_summary**: `string` - Resumo dos laudos.

### `Template`
Modelos de documentos configuráveis da clínica (atestados, receituários padrão).
- **name**: `string` (obrigatório) - Nome do modelo.
- **type**: `string` (obrigatório, enum: receita_simples, atestado, anamnese, etc).
- **content**: `string` (obrigatório) - Texto base com variáveis em brackets (ex: {{nome_paciente}}).
- **variables**: `array of strings` - Lista de tags utilizadas.
- **is_active**: `boolean` (default: true) - Se o template está visível no sistema.

## Módulo: Sistema e Segurança

### `AccessLog`
Registro de trilha de auditoria para fins de compliance LGPD (registro de acessos a dados sensíveis).
- **user_id**: `string` (FK) - Usuário que realizou a ação.
- **action**: `string` - Ação realizada (ex: "Visualizou prontuário").
- **entity**: `string` - Entidade acessada (ex: "Patient").
- **accessed_at**: `datetime` - Timestamp.
