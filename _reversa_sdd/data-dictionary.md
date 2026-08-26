# Dicionário de Dados — Módulo `pacientes`

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Fonte: `base44/entities/Patient.jsonc` + código

---

## Entidade: `Patient`

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Validação no Frontend | Confiança |
|-------|------|--------|---------|----------------|-----------|----------------------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | — | 🟢 |
| `full_name` | string | ✓ | — | — | Nome completo do paciente | `required` no Input | 🟢 |
| `cpf` | string | ✓ | — | `000.000.000-00` (formatado) | CPF criptografado no storage | `required`, `maxLength=14`, formatação automática | 🟢 |
| `birth_date` | string | ✓ | — | `YYYY-MM-DD` (date) | Data de nascimento | `required`, `type="date"` | 🟢 |
| `gender` | string | | — | `masculino`, `feminino`, `outro`, `prefiro_nao_informar` | Gênero | Select com 4 opções | 🟢 |
| `phone` | string | ✓ | — | `(00) 00000-0000` ou `(00) 0000-0000` | Telefone de contato | `required`, `maxLength=15`, formatação automática | 🟢 |
| `email` | string | | — | email | Email do paciente | `type="email"` | 🟢 |
| `address` | string | | — | — | Endereço completo | — | 🟢 |
| `emergency_contact` | string | | — | — | Nome do contato de emergência | — | 🟢 |
| `emergency_phone` | string | | — | `(00) 00000-0000` | Telefone de emergência | `maxLength=15`, formatação automática | 🟢 |
| `health_insurance` | string | | — | — | Nome do convênio médico | — | 🟢 |
| `insurance_number` | string | | — | — | Número da carteirinha do convênio | — | 🟢 |
| `blood_type` | string | | `desconhecido` | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `desconhecido` | Tipo sanguíneo | Select com 9 opções | 🟢 |
| `allergies` | string | | — | — | Alergias conhecidas (texto livre) | Textarea | 🟢 |
| `chronic_conditions` | string | | — | — | Condições crônicas (texto livre) | Textarea | 🟢 |
| `medications_in_use` | string | | — | — | Medicamentos em uso contínuo (texto livre) | Textarea | 🟢 |
| `lgpd_consent` | boolean | ✓ | `false` | — | Consentimento LGPD aceito | Checkbox obrigatório (novo paciente) | 🟢 |
| `lgpd_consent_date` | string | | — | ISO 8601 date-time | Data/hora do consentimento | Preenchido automaticamente no aceite | 🟢 |
| `lgpd_consent_ip` | string | | `client-side` | — | IP do consentimento | Hardcoded (limitação) | 🟡 |
| `photo_url` | string | | — | URL (Base44 file_url) | Foto do paciente | Upload via Base44.integrations.Core.UploadFile | 🟢 |
| `notes` | string | | — | — | Observações gerais | Textarea | 🟢 |
| `status` | string | | `ativo` | `ativo`, `inativo` | Status do paciente | Badge visual, não editável diretamente | 🟢 |
| `created_by_id` | string | | — | UUID | ID do criador (para RLS) | Preenchido pelo Base44 | 🟢 |
| `created_date` | string | | — | ISO 8601 date-time | Data de criação | Usado para ordenação `-created_date` | 🟢 |

---

## Entidade: `AccessLog` (Inferida)

| Campo | Tipo | Obrig. | Descrição | Confiança |
|-------|------|--------|-----------|-----------|
| `user_email` | string | ✓ | Email do usuário que executou a ação | 🟡 |
| `action` | string | ✓ | Ação (valores de `ACCESS_ACTIONS`) | 🟡 |
| `entity_type` | string | | Tipo de entidade (ex: `Patient`, `Consultation`) | 🟡 |
| `entity_id` | string | | ID da entidade acessada | 🟡 |
| `patient_name` | string | | Nome do paciente associado | 🟡 |
| `ip_address` | string | | Endereço IP (sempre `client-side`) | 🟡 |
| `user_agent` | string | | User agent do navegador | 🟡 |
| `details` | object | | Detalhes adicionais (JSON) | 🟡 |

---

## Enum: `ACCESS_ACTIONS` (Constantes)

| Constante | Valor | Contexto de Uso |
|-----------|-------|-----------------|
| `LOGIN` | `login` | Autenticação |
| `LOGOUT` | `logout` | Autenticação |
| `VIEW_PATIENT` | `view_patient` | PatientDetail mount |
| `EDIT_PATIENT` | `edit_patient` | PatientForm save (edição) |
| `CREATE_PATIENT` | `create_patient` | PatientForm save (criação) |
| `VIEW_CONSULTATION` | `view_consultation` | Consultation page |
| `CREATE_CONSULTATION` | `create_consultation` | NewConsultation save |
| `EDIT_CONSULTATION` | `edit_consultation` | Consultation edit |
| `CREATE_PRESCRIPTION` | `create_prescription` | PrescriptionEditor save |
| `UPLOAD_EXAM` | `upload_exam` | ExamUploader save |
| `DELETE_RECORD` | `delete_record` | PatientDetail delete |
| `EXPORT_DATA` | `export_data` | (Não usado no código analisado) |

---

## Entidades Relacionadas (Referenciadas)

### `Consultation` (em `base44/entities/Consultation.jsonc`)
Campos principais usados no módulo pacientes:
- `patient_id` (fk), `date`, `status` (`agendada`, `em_andamento`, `concluida`, `cancelada`), `chief_complaint`, `diagnosis`

### `Prescription` (em `base44/entities/Prescription.jsonc`)
- `patient_id`, `consultation_id`, `type`, `content`, `medications[]`, `valid_days`, `template_name`, `created_date`

### `Exam` (em `base44/entities/Exam.jsonc`)
- `patient_id`, `consultation_id`, `name`, `type`, `date`, `file_url`, `file_type`, `laboratory`, `results_summary`, `notes`

### `Appointment` (em `base44/entities/Appointment.jsonc`)
- `patient_id`, `date`, `status` (`confirmado`, `concluido`, `cancelado`, `pendente`)

### `Template` (em `base44/entities/Template.jsonc`)
- `type` (fk para Prescription.type), `name`, `content` (com placeholders), `is_active`

---

## Regras de Validação Implícitas

| Campo | Regra | Onde Aplicada |
|-------|-------|---------------|
| `cpf` | Formato `###.###.###-##` (14 chars) | `PatientForm.jsx:256-262` |
| `phone` | Formato `(##) #####-####` ou `(##) ####-####` (15 chars) | `PatientForm.jsx:318-324` |
| `birth_date` | Data passada (não validado no frontend) | `type="date"` |
| `email` | Formato email válido | `type="email"` |
| `lgpd_consent` | `true` obrigatório para criação | `PatientForm.jsx:157-162` |
| `status` | Apenas `ativo` ou `inativo` | Schema enum + badge visual |
| `blood_type` | Apenas valores do enum (9 opções) | Schema enum + Select |
| `gender` | Apenas 4 valores do enum | Schema enum + Select |

---

## Índices e Ordenação

| Entidade | Query Comum | Ordenação |
|----------|-------------|-----------|
| `Patient` | `list()` | `-created_date` (mais recentes primeiro) |
| `Consultation` | `filter({ patient_id })` | `-date` |
| `Prescription` | `filter({ patient_id })` | `-created_date` |
| `Exam` | `filter({ patient_id })` | `-date` |
| `Appointment` | `filter({ patient_id })` | `-date` |
| `Template` | `filter({ type, is_active: true })` | — |

---

## RLS (Row Level Security) — Patient

```json
{
  "create": null,
  "read": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "update": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "delete": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] }
}
```

- **Implicação**: Usuário comum só acessa próprios registros. Admin acessa todos.
- **Aplicado no Base44** — não há verificação no frontend.

---

## Transformações de Dados (Frontend → Backend)

| Origem | Transformação | Destino |
|--------|---------------|---------|
| `formData.cpf` (formatado) | `replace(/\D/g, '')` → apenas dígitos | `Patient.cpf` (armazenado criptografado) |
| `formData.phone` (formatado) | `replace(/\D/g, '')` → apenas dígitos | `Patient.phone` |
| `photoFile` (File) | `UploadFile` → `file_url` | `Patient.photo_url` |
| `lgpd_consent` + timestamp | `new Date().toISOString()` | `Patient.lgpd_consent_date` |
| `template.content` + variáveis | `replace(/\{VAR\}/g, valor)` | `Prescription.content` |

---

## Métricas

- **Total de campos (Patient)**: 24
- **Campos obrigatórios**: 5 (`full_name`, `cpf`, `birth_date`, `phone`, `lgpd_consent`)
- **Enums**: 3 (`gender`, `blood_type`, `status`)
- **Entidades relacionadas**: 5 (`Consultation`, `Prescription`, `Exam`, `Appointment`, `Template`)
- **Ações de auditoria**: 12 constantes definidas

---

# Dicionário de Dados — Módulo `consultas`

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Fonte: `base44/entities/*.jsonc` + código

---

## Entidade: `Consultation`

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Confiança |
|-------|------|--------|---------|----------------|-----------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | 🟢 |
| `patient_id` | string | ✓ | — | FK → Patient.id | Paciente da consulta | 🟢 |
| `date` | string | ✓ | — | `YYYY-MM-DDTHH:mm` (date-time) | Data e hora da consulta | 🟢 |
| `chief_complaint` | string | | — | texto | Queixa principal | 🟢 |
| `history_present_illness` | string | | — | texto longo | História da doença atual (HDA) | 🟢 |
| `vital_signs` | object | | `{}` | objeto aninhado (abaixo) | Sinais vitais | 🟢 |
| `physical_exam` | string | | — | texto longo | Exame físico | 🟢 |
| `diagnosis` | string | | — | texto | Diagnóstico | 🟢 |
| `icd_code` | string | | — | ex: `J00` | Código CID-10 | 🟢 |
| `treatment_plan` | string | | — | texto longo | Plano de tratamento | 🟢 |
| `notes` | string | | — | texto | Observações | 🟢 |
| `follow_up_date` | string | | — | `YYYY-MM-DD` (date) | Data de retorno | 🟢 |
| `status` | string | | `agendada` | `agendada`, `em_andamento`, `concluida`, `cancelada` | Status da consulta | 🟢 |
| `created_by_id` | string | | — | UUID | Criador (RLS) | 🟢 |
| `created_date` | string | | — | `date-time` | Data de criação | 🟢 |

### `Consultation.vital_signs` (objeto aninhado)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `blood_pressure` | string | Pressão arterial | `120/80` |
| `heart_rate` | string | Freq. cardíaca (bpm) | `72` |
| `temperature` | string | Temperatura (°C) | `36.5` |
| `respiratory_rate` | string | Freq. respiratória (irpm) | `16` |
| `oxygen_saturation` | string | Saturação SpO₂ (%) | `98` |
| `weight` | string | Peso (kg) | `70` |
| `height` | string | Altura (m) | `1.70` |

---

## Entidade: `Prescription`

| Campo | Tipo | Obrigatório | Enum / Formato | Descrição |
|-------|------|-------------|----------------|-----------|
| `id` | string | ✓ | UUID | Identificador único | 🟢 |
| `patient_id` | string | ✓ | → Patient.id | Paciente | 🟢 |
| `consultation_id` | string | | → Consultation.id | Consulta associada | 🟢 |
| `type` | string | ✓ | `receita_simples`, `receita_controlada`, `atestado`, `solicitacao_exame`, `encaminhamento`, `declaracao` | Tipo do documento | 🟢 |
| `content` | string | ✓ | texto longo (variáveis já resolvidas) | Conteúdo do documento | 🟢 |
| `medications` | array | | `[{ name, dosage, frequency, duration, instructions }]` | Medicamentos (só se type inclui 'receita') | 🟢 |
| `template_name` | string | | texto | Nome do template aplicado (auditoria) | 🟢 |
| `valid_days` | number | | inteiro | Dias de afastamento (só para 'atestado') | 🟢 |
| `notes` | string | | texto | Observações | 🟢 |
| `created_date` | string | | `date-time` | Ordenação `-created_date` | 🟢 |

---

## Entidade: `Exam`

| Campo | Tipo | Obrigatório | Enum / Formato | Descrição |
|--------|------|------------|----------------|-----------|
| `id` | string | ✓ | — | Identificador único | 🟢 |
| `patient_id` | string | ✓ | → Patient.id | Paciente | 🟢 |
| `consultation_id` | string | | → Consultation.id | Consulta associada (nullable) | 🟢 |
| `name` | string | ✓ | texto | Nome do exame | 🟢 |
| `type` | string | | `laboratorial`, `imagem`, `cardiologico`, `outros` | Tipo do exame | 🟢 |
| `date` | string | ✓ | `YYYY-MM-DD` | Data do exame | 🟢 |
| `file_url` | string | | URL (Base44 upload) | Link do anexo | 🟢 |
| `file_type` | string | | `pdf`, `image` | Tipo do arquivo | 🟢 |
| `laboratory` | string | | texto | Laboratório/clínica | 🟢 |
| `results_summary` | string | | texto | Resumo dos resultados | 🟢 |
| `notes` | string | | texto | Observações médicas | 🟢 |

---

## RLS (Row Level Security) — Consultation / Prescription / Exam

Todos os três seguem o padrão idêntico ao `Patient`:

```json
{
  "create": null,
  "read": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "update": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "delete": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] }
}
```

- **Template** difere: `create` restrito a `admin`; `read` liberado (null).

---

## Relacionamentos (ERD textual)

```
Patient 1───n Consultation
Patient 1───n Prescription
Consultation 1───n Prescription
Patient 1───n Exam
Consultation 1───n Exam
Template 1───n Prescription    (via Template.type = Prescription.type)
```

---

## Transformações de Dados (Frontend → Backend)

| Origem | Transformação | Destino |
|--------|---------------|---------|
| `type` do documento | `medications` só incluído se `type.includes('receita')` | `Prescription.medications` |
| `validDays` (string) | `parseInt(validDays) \|\| null` (só 'atestado') | `Prescription.valid_days` |
| `file` (File) | `base44.integrations.Core.UploadFile({ file })` → `file_url` | `Exam.file_url`, `file_type` |
| `template.content` | `.replace(/{PACIENTE_NOME}/g, ...)` etc. | `Prescription.content` |

---

## Métricas

- **Entidades**: 3 confirmadas (`Consultation`, `Prescription`, `Exam`) + `Template` referenciada + `AccessLog` inferida
- **Enums**: 3 (`status`, `Prescription.type`, `Exam.type`) + 1 (`file_type`)
- **Chave estrangeira primária**: `patient_id` presente em Consultation, Prescription e Exam

---

# Dicionário de Dados — Módulo `agendamentos`

> Gerado pelo Archaeologist em 2026-08-25 | Nível: **completo** | Fonte: `base44/entities/Appointment.jsonc`, `base44/entities/Doctor.jsonc` + código

---

## Entidade: `Appointment`

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Confiança |
|-------|------|--------|---------|----------------|-----------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | 🟢 |
| `patient_id` | string | ✓ | — | FK → Patient.id | Paciente agendado | 🟢 |
| `doctor_id` | string | ✓ | — | FK → Doctor.id | Médico responsável | 🟢 |
| `date` | string | ✓ | — | ISO 8601 date-time | Data e hora do agendamento | 🟢 |
| `duration` | number | | `30` | minutos | Duração do slot | 🟢 |
| `type` | string | | `primeira_consulta` | `primeira_consulta`, `retorno`, `exame`, `procedimento` | Tipo da consulta | 🟢 |
| `status` | string | | `agendado` | `agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado`, `faltou` | Estado atual | 🟢 |
| `notes` | string | | — | texto livre | Observações | 🟢 |
| `reminder_sent` | boolean | | `false` | — | Flag de lembrete enviado | 🟡 (campo órfão, sem uso no código) |
| `reminder_sent_date` | string | | — | ISO 8601 date-time | Quando o lembrete foi enviado | 🟡 (campo órfão, sem uso no código) |
| `consultation_id` | string | | — | FK → Consultation.id | Vínculo com a consulta realizada | 🟡 (campo declarado, sem auto-vínculo no fluxo) |
| `created_by_id` | string | | — | UUID | Criador (RLS) | 🟢 |

### Máquina de estados (mapeada no código)

| Estado | Cor/Classe (Tailwind) | Label |
|--------|----------------------|-------|
| `agendado` | `bg-amber-100 text-amber-700` | Agendado |
| `confirmado` | `bg-sky-100 text-sky-700` | Confirmado |
| `em_atendimento` | `bg-violet-100 text-violet-700` | Em Atendimento |
| `concluido` | `bg-emerald-100 text-emerald-700` | Concluído |
| `cancelado` | `bg-slate-100 text-slate-700` | Cancelado |
| `faltou` | `bg-rose-100 text-rose-700` | Faltou |

**Transições explícitas na UI**: `agendado → confirmado` (botão), `qualquer → cancelado` (botão). O `Select` permite todas as combinações.

---

## Entidade: `Doctor` (Referenciada)

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Confiança |
|-------|------|--------|---------|----------------|-----------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | 🟢 |
| `full_name` | string | ✓ | — | — | Nome completo | 🟢 |
| `specialty` | string | ✓ | — | — | Especialidade médica | 🟢 |
| `crm` | string | ✓ | — | — | Número do CRM | 🟢 |
| `email` | string | | — | email | Email do médico | 🟢 |
| `phone` | string | | — | — | Telefone | 🟢 |
| `photo_url` | string | | — | URL (Base44 file_url) | Foto | 🟢 |
| `working_days` | array of number | | — | `[0..6]` (0=domingo) | Dias da semana que atende | 🟢 |
| `working_hours.start` | string | | — | `"HH:MM"` | Início do expediente | 🟢 |
| `working_hours.end` | string | | — | `"HH:MM"` | Fim do expediente | 🟢 |
| `appointment_duration` | number | | `30` | minutos | Duração padrão de cada consulta | 🟢 |
| `is_active` | boolean | | `true` | — | Médico ativo (filtrado no NewAppointment) | 🟢 |
| `created_by_id` | string | | — | UUID | Criador (RLS) | 🟢 |

**RLS**:
- `create`: apenas `admin`
- `read`: aberto (null)
- `update`: criador ou `admin`
- `delete`: apenas `admin`

---

## Relacionamentos (ERD textual)

```
Patient  1───n Appointment
Doctor   1───n Appointment
Appointment n───1 Consultation   (via consultation_id, sem auto-vínculo)
```

---

## Regras de Validação / Constraints

| Campo | Regra | Onde |
|-------|-------|------|
| `Appointment.patient_id` | Obrigatório; paciente deve estar com `status='ativo'` | `Appointment.jsonc`, `NewAppointment.jsx:59` |
| `Appointment.doctor_id` | Obrigatório; médico deve estar com `is_active=true` | `Appointment.jsonc`, `NewAppointment.jsx:64` |
| `Appointment.date` | Obrigatório; ISO 8601; UI bloqueia datas passadas via `<Calendar disabled>` | `NewAppointment.jsx:187` |
| `Appointment.duration` | Default 30 min; sobrescrito por `doctor.appointment_duration` | `NewAppointment.jsx:100` |
| `Doctor.working_days` | Se vazio, `TimeSlotPicker` não gera slots | `TimeSlotPicker.jsx:38-40` |
| `Doctor.working_hours` | Defaults 08:00-18:00 se ausentes | `TimeSlotPicker.jsx:42-43` |

---

## RLS (Row Level Security) — Appointment

```json
{
  "create": null,
  "read":   { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "update": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] },
  "delete": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] }
}
```

- **Implicação**: Usuário comum só vê/edita/exclui próprios agendamentos. Admin vê tudo.
- **Aplicado no Base44** — sem verificação client-side adicional.

---

## Transformações de Dados (Frontend → Backend)

| Origem | Transformação | Destino |
|--------|---------------|---------|
| `selectedDate` (Date) | `slot.toISOString()` | `Appointment.date` |
| `doctor.appointment_duration` | spread no payload com fallback 30 | `Appointment.duration` |
| `status` (do `STATUS_CONFIG` Select) | identidade | `Appointment.status` |
| `patient.email` + texto fixo | template literal + `format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })` | `SendEmail.body` |
| `formData.type` | identidade | `Appointment.type` |

---

## Métricas

- **Entidades**: 2 (`Appointment` confirmada, `Doctor` referenciada)
- **Enums principais**: 2 (`Appointment.status` com 6 valores, `Appointment.type` com 4 valores)
- **Campos obrigatórios (Appointment)**: 3 (`patient_id`, `doctor_id`, `date`)
- **Campos órfãos**: 2 (`reminder_sent`, `reminder_sent_date` — sem código de leitura/escrita)
- **Ações de auditoria relacionadas**: nenhuma chamada explícita a `logAccess` neste módulo (lacuna)

---

# Dicionário de Dados — Módulo `medicos`

> Gerado pelo Archaeologist em 2026-08-25 | Nível: **completo** | Fonte: `base44/entities/Doctor.jsonc` + `src/pages/Doctors.jsx`

---

## Entidade: `Doctor` (dono do módulo)

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Validação no Frontend | Confiança |
|-------|------|--------|---------|----------------|-----------|----------------------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | — | 🟢 |
| `full_name` | string | ✓ | — | — | Nome completo do médico | `required` no Input | 🟢 |
| `specialty` | string | ✓ | — | — | Especialidade médica | `required` no Input | 🟢 |
| `crm` | string | ✓ | — | — | Número do CRM | `required` no Input | 🟢 |
| `email` | string | | — | email | Email | `type="email"` | 🟢 |
| `phone` | string | | — | — | Telefone | sem máscara | 🟢 |
| `photo_url` | string | | — | URL (Base44 file_url) | Foto | **campo declarado, sem upload implementado na UI** | 🟡 |
| `working_days` | array of number | | `[1,2,3,4,5]` | `[0..6]` (0=domingo) | Dias da semana em que atende | 7 checkboxes (dom..sáb) com toggle aditivo | 🟢 |
| `working_hours.start` | string | | `08:00` | `"HH:MM"` | Início do expediente | `<input type="time">` | 🟢 |
| `working_hours.end` | string | | `18:00` | `"HH:MM"` | Fim do expediente | `<input type="time">` | 🟢 |
| `appointment_duration` | number | | `30` | minutos | Duração padrão de cada consulta | `<input type="number">` → `parseInt` | 🟢 |
| `is_active` | boolean | | `true` | — | Médico ativo (filtrado em NewAppointment) | `<Switch>` | 🟢 |
| `created_by_id` | string | | — | UUID | Criador (RLS) | Preenchido pelo Base44 | 🟢 |
| `created_date` | string | | — | ISO 8601 date-time | Data de criação (ordenação `-created_date`) | Preenchido pelo Base44 | 🟢 |

**Notas sobre defaults aplicados no frontend (não no schema)**:
- `working_days` default: `[1,2,3,4,5]` (seg-sex)
- `working_hours`: `{ start: '08:00', end: '18:00' }`
- `appointment_duration`: `30`
- `is_active`: `true`

---

## RLS (Row Level Security) — Doctor

```json
{
  "create": { "user_condition": { "role": "admin" } },
  "read":   null,
  "update": { "$or": [
              { "created_by_id": "{{user.id}}" },
              { "user_condition": { "role": "admin" } }
            ] },
  "delete": { "user_condition": { "role": "admin" } }
}
```

**Diferenças em relação aos outros módulos**:
- `create` e `delete` **exigem admin** (outros módulos são livres para o próprio criador).
- `read` é aberto (null) — qualquer usuário autenticado lê a lista (necessário para o `Select` em `NewAppointment`).
- Esta é a única entidade com permissões administrativas explícitas.

---

## Relacionamentos (ERD textual)

```
Doctor  1───n Appointment
            (working_days, working_hours, appointment_duration
             alimentam TimeSlotPicker; is_active filtra o Select)
```

---

## Regras de Validação / Constraints

| Campo | Regra | Onde |
|-------|-------|------|
| `Doctor.full_name` | Obrigatório | `Doctors.jsx:222-228` |
| `Doctor.specialty` | Obrigatório | `Doctors.jsx:229-236` |
| `Doctor.crm` | Obrigatório, sem validação de formato/UF | `Doctors.jsx:237-244` |
| `Doctor.email` | Formato email (navegador) | `Doctors.jsx:246-252` |
| `Doctor.phone` | Livre (sem máscara) | `Doctors.jsx:253-259` |
| `Doctor.working_days` | Array de inteiros 0-6; toggle aditivo via `toggleWorkingDay` | `Doctors.jsx:117-124` |
| `Doctor.working_hours.start/end` | `"HH:MM"`, sem validação cruzada (start < end) | `Doctors.jsx:281-296` |
| `Doctor.appointment_duration` | `parseInt(e.target.value)`; sem mínimo | `Doctors.jsx:302` |
| `Doctor.is_active` | Boolean via Switch | `Doctors.jsx:308-313` |

---

## Transformações de Dados (Frontend → Backend)

| Origem | Transformação | Destino |
|--------|---------------|---------|
| `appointment_duration` (string do input) | `parseInt(e.target.value)` | `Doctor.appointment_duration` (number) |
| `working_days` (checkbox toggle) | `days.filter(d => d !== day)` ou `[...days, day].sort()` | `Doctor.working_days` (array ordenado) |
| `working_hours` (dois inputs) | `{ ...formData.working_hours, start: e.target.value }` | `Doctor.working_hours` (objeto parcial substituído) |
| `formData` completo | identidade (sem sanitização) | `Doctor.create(data)` / `Doctor.update(id, data)` |

---

## Índices e Ordenação

| Entidade | Query Comum | Ordenação |
|----------|-------------|-----------|
| `Doctor` | `list()` | `-created_date` (mais recentes primeiro) |

---

## Métricas

- **Entidades**: 1 (`Doctor` confirmada)
- **Enums**: nenhum declarado no schema (status é `is_active` boolean)
- **Campos obrigatórios**: 3 (`full_name`, `specialty`, `crm`)
- **Campos declarados sem uso na UI**: 1 (`photo_url` — não há controle de upload)
- **Ações de auditoria relacionadas**: nenhuma chamada a `logAccess` no CRUD de médicos (lacuna)

---

# Dicionário de Dados — Módulo `templates`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Fonte: `base44/entities/Template.jsonc` + `src/pages/Templates.jsx`

---

## Entidade: `Template`

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Validação no Frontend | Confiança |
|-------|------|--------|---------|----------------|-----------|----------------------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | — | 🟢 |
| `name` | string | ✓ | — | texto | Nome do template | `required` no Input | 🟢 |
| `type` | string | ✓ | `receita_simples` (form) | 7 valores (abaixo) | Tipo do documento | Select obrigatório | 🟢 |
| `content` | string | ✓ | — | texto com variáveis `{VAR}` | Conteúdo do template | Textarea `required`, 12 rows | 🟢 |
| `variables` | array of string | | — | lista de nomes de variáveis | Variáveis disponíveis | **campo órfão — nunca escrito pela UI** | 🟡 |
| `is_default` | boolean | | `false` | — | Template padrão do tipo | Switch | 🟢 |
| `is_active` | boolean | | `true` | — | Template ativo (filtro do PrescriptionEditor) | Switch | 🟢 |
| `created_by_id` | string | | — | UUID | Criador (RLS) | Preenchido pelo Base44 | 🟢 |

### Enum `type` (7 valores)

| Valor | Label pt-BR |
|-------|-------------|
| `receita_simples` | Receita Simples |
| `receita_controlada` | Receita Controlada |
| `atestado` | Atestado Médico |
| `solicitacao_exame` | Solicitação de Exame |
| `encaminhamento` | Encaminhamento |
| `declaracao` | Declaração |
| `anamnese` | Anamnese |

### Variáveis documentadas na UI (`AVAILABLE_VARIABLES`)

| Variável | Descrição | Substituída no PrescriptionEditor? |
|----------|-----------|------------------------------------|
| `{PACIENTE_NOME}` | Nome completo do paciente | Sim |
| `{PACIENTE_CPF}` | CPF do paciente | Sim |
| `{DATA}` | Data atual DD/MM/YYYY | Sim |
| `{DATA_EXTENSO}` | Data por extenso | Sim |
| `{DIAS_AFASTAMENTO}` | Dias de afastamento (atestados) | **Não encontrado substituidor** 🔴 |

---

## RLS (Row Level Security) — Template

```json
{
  "create": { "user_condition": { "role": "admin" } },
  "read":   null,
  "update": { "$or": [
              { "created_by_id": "{{user.id}}" },
              { "user_condition": { "role": "admin" } }
            ] },
  "delete": { "$or": [
              { "created_by_id": "{{user.id}}" },
              { "user_condition": { "role": "admin" } }
            ] }
}
```

- Criação restrita a admin; leitura aberta; edição/exclusão do criador ou admin.

---

## Transformações de Dados (Frontend → Backend)

| Origem | Transformação | Destino |
|--------|---------------|---------|
| `formData` completo | identidade | `Template.create/update` |
| `template.is_active` na edição | `!== false` (undefined vira true) | form state |
| `template.is_default` na edição | `\|\| false` | form state |
| variável clicada | concatenação ao final de content | `formData.content` |

---

## Métricas

- **Campos**: 7 (+ id)
- **Obrigatórios**: 3 (`name`, `type`, `content`)
- **Enums**: 1 (`type`, 7 valores)
- **Campos órfãos**: 1 (`variables`)
- **RLS distinto**: create admin-only (como Doctor)

---

# Dicionário de Dados — Módulo `logs-acesso`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Fonte: `base44/entities/AccessLog.jsonc` + `src/pages/AccessLogs.jsx`

> **Nota**: Nas extrações anteriores este schema estava 🟡 INFERIDO. Agora CONFIRMADO pelo arquivo `AccessLog.jsonc`.

---

## Entidade: `AccessLog`

| Campo | Tipo | Obrig. | Default | Enum / Formato | Descrição | Confiança |
|-------|------|--------|---------|----------------|-----------|-----------|
| `id` | string | ✓ | — | UUID (Base44) | Identificador único | 🟢 |
| `user_email` | string | ✓ | — | email | Email do usuário da ação | 🟢 |
| `action` | string | ✓ | — | enum 12 valores | Ação realizada | 🟢 |
| `entity_type` | string | | — | texto (`Patient`, `Consultation`...) | Tipo da entidade acessada | 🟢 |
| `entity_id` | string | | — | UUID | ID da entidade acessada | 🟢 |
| `patient_name` | string | | — | texto | Nome do paciente (auditoria LGPD) | 🟢 |
| `ip_address` | string | | — | texto | IP (na prática sempre `'client-side'`) | 🟢 |
| `user_agent` | string | | — | texto | navigator.userAgent | 🟢 |
| `details` | string (schema) | | — | texto | Detalhes adicionais (**logger envia object/null** → inconsistência) | 🟡 |
| `created_date` | string | | — | date-time | Timestamp (ordenação `-created_date`) | 🟢 |

### Enum `action` (12 valores)

| Valor | Categoria (stats UI) | Badge |
|-------|---------------------|-------|
| `login` | — (fora das stats) | sky |
| `logout` | — | slate |
| `view_patient` | Visualizações | emerald |
| `view_consultation` | Visualizações | emerald |
| `edit_patient` | Edições* | amber |
| `edit_consultation` | Edições* | amber |
| `create_patient` | Edições* | violet |
| `create_consultation` | Edições* | violet |
| `create_prescription` | Edições* | violet |
| `upload_exam` | — | sky |
| `delete_record` | Exclusões | rose |
| `export_data` | — (nunca logado) | amber |

\* Categoria "Edições" usa heurística substring: `includes('edit') || includes('create')`.

---

## RLS (Row Level Security) — AccessLog

```json
{
  "create": null,
  "read":   { "user_condition": { "role": "admin" } },
  "update": { "user_condition": { "role": "admin" } },
  "delete": { "user_condition": { "role": "admin" } }
}
```

- Padrão invertido em relação às demais entidades: escrita livre (para o logger transversal), leitura admin-only.
- Logs são imutáveis para usuários comuns (append-only).

---

## Regras de Validação / Constraints

| Campo | Regra | Onde |
|-------|-------|------|
| `action` | Restrito ao enum de 12 valores | schema + ACTION_CONFIG keys |
| Consulta UI | Limite fixo de 500 registros, `-created_date` | AccessLogs.jsx:64 |
| Filtros | search (email/paciente), action exato, data today/week/month | AccessLogs.jsx:67-94 |

---

## Métricas

- **Campos**: 9 (+ id)
- **Obrigatórios**: 2 (`user_email`, `action`)
- **Enums**: 1 (`action`, 12 valores)
- **Inconsistência de tipo**: 1 (`details` string vs object enviado)
- **Padrão RLS único**: create aberto + read/update/delete admin-only

---

# Dicionário de Dados — Módulo `dashboard`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Fonte: queries de `Dashboard.jsx`, `PatientSearch.jsx`, `ReportsView.jsx`

---

## Entidades Consumidas (somente leitura)

| Entidade | Query | Limite | Ordenação | Uso no módulo |
|----------|-------|--------|-----------|---------------|
| Patient | `list()` | 100 | `-created_date` | Stats ativos, PatientSearch, nomes nos próximos agendamentos |
| Consultation | `list()` | 50 | `-date` | today/upcoming consultas |
| Prescription | `list()` | 100 | `-created_date` | Card "Documentos Emitidos" (contagem ≤100) |
| Appointment | `list()` | 100 | `-date` | today/upcoming + ReportsView |
| Appointment (reports) | `filter({status:'concluido'})` | 500 | `-date` | Volume mensal e ranking |
| Doctor | `list()` | 200 | `-created_date` | Join especialidades em ReportsView |

---

## Estruturas Derivadas (client-side)

### `monthlyData` (ReportsView)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `month` | string | `MMM/yy` pt-BR (ex: `ago/26`) |
| `key` | string | `${year}-${monthIndex}` (0-based) |
| `consultas` | number | Contagem de appointments concluídos no mês |

Janela: 12 meses retroativos a partir de agora (`subMonths(now, i)` para i=11..0).

### `specialtyData` (ReportsView)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Especialidade ou `'Não especificada'` |
| `count` | number | Appointments concluídos da especialidade |

Ordenado desc por count. Join O(a×d) via find.

### Filtros derivados (Dashboard.jsx)

| Derivado | Filtro | Nota |
|----------|--------|------|
| `todayConsultations` | `toDateString() == hoje` | **inclui canceladas** |
| `upcomingConsultations` | `date > now && status != 'cancelada'`, slice 5 | |
| `activePatients` | `count(status == 'ativo')` | |
| `todayAppointments` | hoje && `!= 'cancelado'` | exclui cancelados |
| `upcomingAppointments` | `date > now && status != 'cancelado'`, slice 5 | |

---

## Transformações de Dados

| Origem | Transformação | Destino |
|--------|---------------|---------|
| mount do Dashboard | `logAccess(LOGIN, null, null, null, 'Acesso ao dashboard')` | `AccessLog.create` |
| query do usuário | `base44.auth.me().email` | `AccessLog.user_email` |
| `appointment.type` | `.replace(/_/g, ' ')` | badge de exibição |
| datas | `format(date, ...ptBR)` | exibição dd/MM HH:mm |

---

## Métricas

- **Entidades consumidas**: 6 queries sobre 5 entidades (todas leitura)
- **Escritas**: apenas indireta (logAccess LOGIN)
- **Métrica hardcoded**: 1 ("Taxa de Atendimento" = 94%)
- **Contagem truncada**: 1 ("Documentos Emitidos" limitado à lista de 100)