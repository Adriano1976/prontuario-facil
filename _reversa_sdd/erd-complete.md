# ERD Completo — prontuario-facil

> Artefato canônico do `reversa-architect`. Modelo de dados completo (todas as entidades com atributos, chaves, cardinalidades e relacionamentos), consolidado a partir de `database/erd.md`, `database/relationships.md`, `data-dictionary.md` e dos schemas `base44/entities/*.jsonc`.
> `doc_level: completo` | Escala: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## ERD — Diagrama Completo

```mermaid
erDiagram
    Patient ||--o{ Appointment : "agendado para"
    Doctor ||--o{ Appointment : "responsável por"
    Appointment ||--o| Consultation : "pode gerar (1:0..1)"
    Patient ||--o{ Consultation : "possui"
    Consultation ||--o{ Prescription : "gera"
    Consultation ||--o{ Exam : "solicita"
    Patient ||--o{ Prescription : "recebe"
    Patient ||--o{ Exam : "realiza"
    Template ||--o{ Prescription : "baseia (cópia de conteúdo)"
    Patient ||--o{ AccessLog : "auditado (referência sensível)"
    User_Account ||--o{ AccessLog : "registra (user_email)"

    Patient {
        string id PK
        string full_name
        string cpf "criptografado"
        date birth_date
        string gender "enum: masculino|feminino|outro|prefiro_nao_informar"
        string phone
        string email
        string address
        string emergency_contact
        string emergency_phone
        string health_insurance
        string insurance_number
        string blood_type "enum ABO/Rh ou desconhecido"
        string allergies
        string chronic_conditions
        string medications_in_use
        boolean lgpd_consent "obrigatório"
        datetime lgpd_consent_date
        string lgpd_consent_ip
        string photo_url
        string notes
        string status "ativo|inativo"
    }

    Doctor {
        string id PK
        string full_name
        string crm
        string specialty
        string email
        string phone
        array working_days "0=dom a 6=sáb"
        object working_hours "start/end HH:MM"
        int appointment_duration "minutos"
        boolean is_active
        string photo_url
    }

    Appointment {
        string id PK
        string patient_id FK
        string doctor_id FK
        string consultation_id FK "opcional"
        datetime date "required"
        int duration "default 30"
        string type "primeira_consulta|retorno|exame|procedimento"
        string status "agendado|confirmado|em_atendimento|concluido|cancelado|faltou"
        string notes
        boolean reminder_sent
        datetime reminder_sent_date
    }

    Consultation {
        string id PK
        string patient_id FK
        string appointment_id "opcional (vínculo retroativo)"
        datetime date "required"
        string chief_complaint
        string history_present_illness
        object vital_signs "bp,hr,temp,rr,spo2,weight,height"
        string physical_exam
        string diagnosis
        string icd_code "CID-10"
        string treatment_plan
        string notes
        date follow_up_date
        string status "agendada|em_andamento|concluida|cancelada"
    }

    Prescription {
        string id PK
        string patient_id FK
        string consultation_id FK
        string type "enum 6 tipos de documento"
        string content "required"
        array medications "nome,dosagem,frequencia,duracao,instrucoes"
        string template_name
        int valid_days "só atestado"
        string notes
    }

    Exam {
        string id PK
        string patient_id FK
        string consultation_id FK
        string name "required"
        datetime date "required"
        string type "enum 4"
        string file_url
        string file_type "pdf|image"
        string laboratory
        string results_summary
        string notes
    }

    Template {
        string id PK
        string name "required"
        string type "enum 7 tipos"
        string content "required"
        boolean is_active "default true"
        boolean is_default
    }

    AccessLog {
        string id PK
        string user_email
        string action "enum: create|read|update|delete|login|export_data|... + acesso a prontuário"
        string entity_type
        string entity_id
        string patient_name "para auditoria de acesso sensível"
        string ip_address
        string user_agent
        string details
        datetime accessed_at "data/hora do evento"
    }

    User_Account {
        string id PK "user.id (Base44 auth)"
        string email
        string full_name
        string role "user|admin"
        string created_by_id
    }
```

## Entidades e Atributos

| Entidade | Descrição | Atributos principais | Chave | Confiança |
| :--- | :--- | :--- | :---: | :---: |
| **Patient** | Paciente da clínica com consentimento LGPD | `full_name`, `cpf`, `birth_date`, `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip`, `status` | `id` | 🟢 |
| **Doctor** | Profissional de saúde e jornada de trabalho | `full_name`, `crm`, `specialty`, `working_days`, `working_hours`, `appointment_duration`, `is_active` | `id` | 🟢 |
| **Appointment** | Reserva de horário entre paciente e médico | `patient_id`, `doctor_id`, `date`, `duration`, `type`, `status`, `reminder_sent` | `id` | 🟢 |
| **Consultation** | Registro clínico do atendimento | `patient_id`, `date`, `chief_complaint`, `vital_signs`, `diagnosis`, `icd_code`, `status` | `id` | 🟢 |
| **Prescription** | Documento emitido (receita/atestado/exame) | `patient_id`, `consultation_id`, `type`, `content`, `medications`, `valid_days` | `id` | 🟢 |
| **Exam** | Exame solicitado/resultado | `patient_id`, `consultation_id`, `name`, `date`, `type`, `file_url` | `id` | 🟢 |
| **Template** | Modelo de documento clínico | `name`, `type`, `content`, `is_active`, `is_default` | `id` | 🟢 |
| **AccessLog** | Trilha de auditoria (append-only) | `user_email`, `action`, `entity_type`, `entity_id`, `patient_name`, `ip_address`, `user_agent`, `accessed_at` | `id` | 🟢 |
| **User_Account** | Conta do operador (Base44 auth) | `email`, `full_name`, `role`, `created_by_id` | `id` | 🟡 |

## Relacionamentos

| Relação | Cardinalidade | Chave(s) | Semântica | Confiança |
| :--- | :---: | :--- | :--- | :---: |
| Patient → Appointment | 1 : N | `Appointment.patient_id` | Um paciente tem vários agendamentos | 🟢 |
| Doctor → Appointment | 1 : N | `Appointment.doctor_id` | Um médico atende vários agendamentos | 🟢 |
| Appointment → Consultation | 1 : 0..1 | `Appointment.consultation_id` | Agendamento concluído pode gerar consulta (link retroativo) | 🟢 |
| Patient → Consultation | 1 : N | `Consultation.patient_id` | Histórico clínico do paciente | 🟢 |
| Consultation → Prescription | 1 : N | `Prescription.consultation_id` | Consulta emite vários documentos | 🟢 |
| Consultation → Exam | 1 : N | `Exam.consultation_id` | Consulta solicita exames | 🟢 |
| Patient → Prescription | 1 : N | `Prescription.patient_id` | Paciente recebe prescrições | 🟢 |
| Patient → Exam | 1 : N | `Exam.patient_id` | Paciente possui exames | 🟢 |
| Template → Prescription | 1 : N (fraco) | cópia de `content` | Template é copiado; alterar não afeta prescrições emitidas | 🟢 |
| Patient → AccessLog | referência | `patient_name` / `entity_id` | Auditoria de acesso a dados sensíveis | 🟢 |
| User_Account → AccessLog | 1 : N | `AccessLog.user_email` | Operador que executou a ação | 🟡 |

## Notas e Observações

- **Exclusão de paciente** requer tratamento de registros órfãos (Appointment/Consultation/Prescription/Exam) — relacionamento forte. 🟢
- **Appointment ↔ Consultation** é 1:1 opcional: nem todo agendamento gera consulta (cancelados/faltas), e o vínculo é gravado retroativamente. 🟢
- **AccessLog** é *append-only*: leitura apenas por `admin`; escrita apenas pelo sistema. 🟢
- **User_Account** deriva da auth Base44; `id`/`role`/`created_by_id` **não** existem no `OFFLINE_USER` do modo offline. 🟡

> Fonte: `database/erd.md`, `database/relationships.md`, `database/data-dictionary.md`, `code-analysis.md` (§5 de cada módulo) e schemas `base44/entities/*.jsonc`.

---
*Gerado pelo Reversa-Architect (alinhamento canônico) em 2026-08-31.*
