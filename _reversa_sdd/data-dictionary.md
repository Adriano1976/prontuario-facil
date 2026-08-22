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