---
schemaVersion: 1
generatedAt: 2026-09-09T15:30:00-03:00
reversa:
  version: "1.3.2"
kind: target_domain_model
producedBy: designer
hash: "sha256:0d71f94566d0e0ca8cb0472cfa045e43e68dc482ad466ea7bcaf92f6ee422577"
---

# Target Domain Model

> Modelo de domínio do sistema novo. Rastreabilidade explícita para o legado (em `_reversa_sdd/domain.md` ou equivalente).

> Contexto: paradigma funcional (sem classes). "Aggregates" aqui são **agrupamentos lógicos de invariantes + tipos**, não objetos com métodos. O modelo vivo do domínio são os tipos em `src/types/` + funções puras de validação/regra por domínio (onde hoje vivem helpers nas pages).

## Aggregates

### AGG-Paciente
- **Aggregate root**: `Patient`
- **Invariantes**:
  - Só pacientes `ativo` são selecionáveis para agendamento/consulta (BR-MIGRAR-001).
  - `blood_type` ∈ enum ABO/Rh + `desconhecido` (BR-MIGRAR-002).
  - Cadastro exige `full_name`, `cpf`, `birth_date`, `phone`, `lgpd_consent` (BR-MIGRAR-003).
  - `lgpd_consent: true` ⇒ `lgpd_consent_date`/`lgpd_consent_ip` presentes (BR-MIGRAR-004) — tipo condicional.
  - `cpf` é dado sensível (sempre criptografado no BaaS; tratado como sensível no tipo).
- **Comandos aceitos**: criar/atualizar paciente (com consentimento); inativar; registrar consentimento.
- **Eventos publicados**: N/A (paradigma funcional; auditoria vai a AccessLog por chamada explícita — BR-MIGRAR-035).
- **Origem no legado**: `_reversa_sdd/domain.md` §2.1; `_reversa_sdd/pacientes/requirements.md` §2-3.

### AGG-Consulta (inclui documentos emitidos)
- **Aggregate root**: `Consultation`
- **Invariantes**:
  - Toda consulta exige `patient_id` (BR-MIGRAR-006).
  - `status` ∈ máquina `agendada → em_andamento → concluida | cancelada` (BR-MIGRAR-007) — discriminated union.
  - Prescription/Exam nascem **dentro** da consulta (BR-C03/BR-MIGRAR-008): a seção de medicamentos só existe para tipo de documento de receita.
  - `Prescription.type` ∈ enum fechado (BR-MIGRAR-009); `content` interpolado no save (BR-MIGRAR-021).
- **Comandos aceitos**: criar/atualizar consulta; iniciar; concluir; cancelar; emitir Prescription; anexar Exam.
- **Eventos publicados**: N/A (a conclusão de consulta **não** dispara automação no Appointment — AMB-003 resolvido: transição manual).
- **Origem no legado**: `_reversa_sdd/consultas/requirements.md` §2-3; `_reversa_sdd/domain.md` §2.2-2.3; `_reversa_sdd/consultas/design.md`.

### AGG-Agendamento
- **Aggregate root**: `Appointment`
- **Invariantes**:
  - Exige `patient_id`, `doctor_id`, `date` (BR-MIGRAR-010).
  - `status` ∈ {agendado, confirmado, em_atendimento, concluido, cancelado, faltou} (BR-MIGRAR-011).
  - Transição para `confirmado` é **manual**; `reminder_sent*` são flags sem automação (BR-MIGRAR-012).
  - Horário validado contra `working_days`/`working_hours`/`appointment_duration` do médico (BR-MIGRAR-013) — função pura de validação de slot.
  - `type` ∈ {primeira_consulta, retorno, exame, procedimento}; `duration` default 30 (BR-MIGRAR-014).
- **Comandos aceitos**: criar agendamento; confirmar; iniciar atendimento; concluir; cancelar; marcar falta.
- **Eventos publicados**: N/A.
- **Origem no legado**: `_reversa_sdd/agendamentos/requirements.md` §2-3; `_reversa_sdd/domain.md` §2.2.

### AGG-Medico
- **Aggregate root**: `Doctor`
- **Invariantes**:
  - CRUD restrito a `admin` (BR-MIGRAR-015).
  - `working_days` ∈ 0–6 (BR-MIGRAR-016) — tipo `Weekday[]`.
  - Leitura livre para autenticados (BR-MIGRAR-017).
- **Comandos aceitos**: criar/atualizar/inativar médico (admin).
- **Eventos publicados**: N/A.
- **Origem no legado**: `_reversa_sdd/medicos/requirements.md` §2-3.

### AGG-Template
- **Aggregate root**: `Template`
- **Invariantes**:
  - Exige `name`, `type`, `content` (BR-MIGRAR-018); `type` ∈ enum 7 valores (BR-MIGRAR-019).
  - CRUD restrito a `admin`; leitura de ativos livre (BR-MIGRAR-020).
  - Placeholders interpolados no save do documento (BR-MIGRAR-021); template filtrado por tipo no momento da emissão (BR-MIGRAR-022).
  - `is_active`/`is_default` controlam disponibilidade (BR-MIGRAR-023).
- **Comandos aceitos**: criar/atualizar/excluir template (admin); ativar/desativar.
- **Eventos publicados**: N/A.
- **Origem no legado**: `_reversa_sdd/templates/requirements.md` §2-3; `_reversa_sdd/domain.md` §2.3.

### AGG-AccessLog
- **Aggregate root**: `AccessLog`
- **Invariantes**:
  - Append-only (BR-MIGRAR-024); `action` ∈ enum (BR-MIGRAR-025).
  - Gerado em eventos específicos (login, visualização, dashboard) (BR-MIGRAR-026).
- **Comandos aceitos**: criar log (sistema); ler logs (admin); **nunca** update/delete por usuário comum.
- **Eventos publicados**: N/A.
- **Origem no legado**: `_reversa_sdd/logs-acesso/requirements.md` §2-3.

### AGG-Dashboard (contexto de leitura)
- **Aggregate root**: nenhum (contexto de composição de leitura sobre os demais aggregates)
- **Invariantes**:
  - KPIs com critérios do legado **preservados inclusive divergências** (AMB-002): Pacientes Ativos (BR-MIGRAR-027), Agendamentos Hoje exclui cancelados (BR-MIGRAR-028), Documentos Emitidos ≤ 100 (BR-MIGRAR-029), Próximos ≤ 5 futuros não cancelados (BR-MIGRAR-030).
  - Taxa de Atendimento = constante mock `94%` tipada (AMB-001 resolvido).
  - Log de acesso ao carregar (BR-MIGRAR-032); limites de payload 100/50 (BR-MIGRAR-033).
- **Comandos aceitos**: leituras/consultas tipadas.
- **Eventos publicados**: N/A.
- **Origem no legado**: `_reversa_sdd/dashboard/requirements.md`; `_reversa_sdd/domain.md` §3.

## Entidades

| Entidade | Aggregate dono | Atributos principais | Origem no legado |
|---|---|---|---|
| Patient | AGG-Paciente | id, full_name, cpf 🔒, birth_date, gender, phone, email, address, emergency_contact, emergency_phone, health_insurance, insurance_number, blood_type, allergies, chronic_conditions, medications_in_use, lgpd_consent, lgpd_consent_date, lgpd_consent_ip, photo_url, notes, status, created_by_id | `pacientes/requirements.md` §3; `base44/entities/Patient.jsonc` |
| Consultation | AGG-Consulta | id, patient_id, date, follow_up_date, chief_complaint, history_present_illness, vital_signs, physical_exam, diagnosis, icd_code, treatment_plan, notes, status, created_by_id | `consultas/requirements.md` §3 |
| Prescription | AGG-Consulta | id, patient_id, consultation_id, type, content, medications[], template_name, valid_days, notes, created_date | `data-dictionary.md` Prescription |
| Exam | AGG-Consulta | id, patient_id, consultation_id, name, type, date, file_url, file_type, laboratory, results_summary, notes | `data-dictionary.md` Exam |
| Appointment | AGG-Agendamento | id, patient_id, doctor_id, consultation_id, date, duration, type, status, notes, reminder_sent, reminder_sent_date, created_by_id | `agendamentos/requirements.md` §3 |
| Doctor | AGG-Medico | id, full_name, crm, specialty, email, phone, working_days, working_hours{start,end}, appointment_duration, photo_url, is_active | `medicos/requirements.md` §3 |
| Template | AGG-Template | id, name, type, content, is_active, is_default | `templates/requirements.md` §3 |
| AccessLog | AGG-AccessLog | id, user_email, action, entity_type, entity_id, patient_name, ip_address, user_agent, details | `logs-acesso/requirements.md` §3; `data-dictionary.md` |
| User (auth) | (sessão) | id, email, full_name, role? (ausente em offline), created_by_id? (ausente em offline) | `permissions.md`; `modo-offline/requirements.md` OFFLINE_USER |

## Value objects

| Value object | Atributos | Validações | Origem |
|---|---|---|---|
| Cpf | string (mascarado/formatado) | formato `XXX.XXX.XXX-XX`; sensível 🔒 | `code-analysis.md` §4.3; `pacientes/design.md` |
| WorkingHours | { start: "HH:MM", end: "HH:MM" } | start < end; formato hora | `medicos/requirements.md` §3 |
| WorkingDays | Weekday[] (0–6) | valores 0–6 sem duplicata | `medicos/requirements.md` §3 (BR-M02) |
| VitalSigns | blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height | tipos numéricos/string conforme schema | `consultas/requirements.md` §3 |
| MedicationItem | name, dosage, frequency, duration, instructions | preenchimento livre (sem base externa) | BR-C03 / Q-06 |
| DocStatus (Appointment) | union 6 estados | transições válidas | BR-MIGRAR-011 |
| ConsultationStatus | union 4 estados | transições válidas | BR-MIGRAR-007 |
| DocumentType (Prescription/Template) | union 7 valores | enum fechado | BR-MIGRAR-009/019 |

## Eventos de domínio

> Seção obrigatória se o paradigma é event-driven ou híbrido. **Não se aplica**: paradigma funcional sem mensageria (gap nenhum — `paradigm_decision.md`). Transições de estado são chamadas diretas; auditoria via `AccessLogger` (BR-MIGRAR-026/032/035).

## Regras de domínio

> Mapeamento de regras vindas de `target_business_rules.md` (apenas as MIGRAR) para os aggregates / serviços onde elas vivem agora.

| Regra (ID) | Local no domínio novo | Origem (target_business_rules.md) |
|---|---|---|
| BR-MIGRAR-001 | AGG-Paciente invariante (status ativo) — validação na seleção | BR-MIGRAR-001 |
| BR-MIGRAR-002 | `Patient.bloodType` union type | BR-MIGRAR-002 |
| BR-MIGRAR-003 | `Patient` tipo requerido + schema Zod do form | BR-MIGRAR-003 |
| BR-MIGRAR-004 | Tipo condicional `LGPDConsent` em `Patient` | BR-MIGRAR-004 |
| BR-MIGRAR-005 | unions `Gender`, `PatientStatus` | BR-MIGRAR-005 |
| BR-MIGRAR-006 | `Consultation.patientId` requerido | BR-MIGRAR-006 |
| BR-MIGRAR-007 | `ConsultationStatus` + transições tipadas | BR-MIGRAR-007 |
| BR-MIGRAR-008 | Tipo condicional `medications` por tipo de documento | BR-MIGRAR-008 |
| BR-MIGRAR-009 | `PrescriptionType` union | BR-MIGRAR-009 |
| BR-MIGRAR-010 | `Appointment` campos requeridos | BR-MIGRAR-010 |
| BR-MIGRAR-011 | `AppointmentStatus` + transições tipadas | BR-MIGRAR-011 |
| BR-MIGRAR-012 | Sem automação: flags `reminderSent` boolean | BR-MIGRAR-012 |
| BR-MIGRAR-013 | Função pura `isSlotWithinSchedule(doctor, date)` | BR-MIGRAR-013 |
| BR-MIGRAR-014 | `AppointmentType` union + `DEFAULT_DURATION = 30` | BR-MIGRAR-014 |
| BR-MIGRAR-015 | Guarda `role === 'admin'` tipada em CRUD Doctor | BR-MIGRAR-015 |
| BR-MIGRAR-016 | `WorkingDays` (Weekday[]) | BR-MIGRAR-016 |
| BR-MIGRAR-017 | Permissão de leitura no contrato da API | BR-MIGRAR-017 |
| BR-MIGRAR-018 | `Template` campos requeridos | BR-MIGRAR-018 |
| BR-MIGRAR-019 | `TemplateType` union | BR-MIGRAR-019 |
| BR-MIGRAR-020 | Guarda admin em CRUD Template + filtro `is_active` | BR-MIGRAR-020 |
| BR-MIGRAR-021 | Função pura `interpolateTemplate(content, ctx)` + alerta XSS (AMB-006) | BR-MIGRAR-021 |
| BR-MIGRAR-022 | Filtro de templates por tipo na emissão | BR-MIGRAR-022 |
| BR-MIGRAR-023 | `isActive`/`isDefault` boolean no tipo | BR-MIGRAR-023 |
| BR-MIGRAR-024 | AGG-AccessLog append-only (sem update/delete) | BR-MIGRAR-024 |
| BR-MIGRAR-025 | `AccessLogAction` union | BR-MIGRAR-025 |
| BR-MIGRAR-026 | Pontos de chamada `logAccess(...)` tipados | BR-MIGRAR-026 |
| BR-MIGRAR-027…030 | Queries tipadas do AGG-Dashboard | BR-MIGRAR-027/028/029/030 |
| BR-MIGRAR-031 | Busca tipada `PatientSearch` | BR-MIGRAR-031 |
| BR-MIGRAR-032 | `logAccess(LOGIN…)` no mount do Dashboard | BR-MIGRAR-032 |
| BR-MIGRAR-033 | Constantes de limite (100/50) tipadas | BR-MIGRAR-033 |
| BR-MIGRAR-034 | Escopo `createdBy`/`admin` exigido por tipos nas queries | BR-MIGRAR-034 |
| BR-MIGRAR-035 | Chamadas de auditoria tipadas | BR-MIGRAR-035 |
| BR-MIGRAR-036 | Tipo `User.role` + variante offline sem role | BR-MIGRAR-036 |
| BR-MIGRAR-037…045 | Contrato `Base44Client` + variantes offline | BR-MIGRAR-037/038/039/040/041/042/043/044/045 |

## Rastreabilidade para o legado

| Elemento novo | Origem no legado | Tipo de mapeamento |
|---|---|---|
| AGG-Paciente | `domain.md` §2.1 + `pacientes/` | 1-para-1 |
| AGG-Consulta | `domain.md` §2.2/2.3 + `consultas/` + Prescription/Exam de `data-dictionary.md` | fundido (consulta + documentos) |
| AGG-Agendamento | `domain.md` §2.2 + `agendamentos/` | 1-para-1 |
| AGG-Medico | `medicos/` | 1-para-1 |
| AGG-Template | `templates/` + `domain.md` §2.3 | 1-para-1 |
| AGG-AccessLog | `logs-acesso/` + `domain.md` §2.4 | 1-para-1 |
| AGG-Dashboard (leitura) | `dashboard/` + `domain.md` §3 | 1-para-1 (contexto de leitura) |
| `src/types/` + contrato `Base44Client` | schemas `base44/entities/*.jsonc` + `src/api/` | novo (espelho tipado dos schemas) |
| `OFFLINE_USER` tipado | `modo-offline/` §3.4 | 1-para-1 + variante discriminada |

## Notas

- Nenhum aggregate novo de negócio: a migração não cria domínios; **tipa** os existentes.
- Máquinas de estado viram **discriminated unions** com funções de transição puras — estados inválidos não compilam (BR-MIGRAR-007/011).
- Campos LGPD (cpf, consentimento) são marcados como sensíveis no tipo e exigidos condicionalmente (BR-MIGRAR-003/004).
- Variações de regra duplicadas entre domínios (ex.: validação de horário citada em agendamentos e médicos) foram consolidadas em BR-MIGRAR-013 no AGG-Agendamento, consumindo dados do AGG-Medico.
