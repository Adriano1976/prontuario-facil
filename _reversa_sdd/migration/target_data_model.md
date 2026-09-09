---
schemaVersion: 1
generatedAt: 2026-09-09T15:30:00-03:00
reversa:
  version: "1.3.2"
kind: target_data_model
producedBy: designer
hash: "sha256:ac738ed15b7c8d931534f01907b736cdda89f9b0f8fae61b5b6984b7ef634d1d"
---

# Target Data Model

> Modelo de dados do sistema novo. Schema, relacionamentos e restrições.

## Visão geral

Os dados **continuam no Base44 (BaaS)** com os mesmos schemas imutáveis (`base44/entities/*.jsonc` — brief: "schemas não mudam", "backend imutável"). Não há banco novo, DDL ou migração de tabelas. O "modelo de dados alvo" é o **espelho tipado** desses schemas em `src/types/*.ts`, com as 9 interfaces do brief, unions de enum/status, marcação de campos sensíveis LGPD e contrato de leitura/escrita do `Base44Client`. Em modo offline, o "banco" é `localStorage` (`mock_db_*`) com o mesmo formato de entidade — os tipos são compartilhados.

## Entidades de dados

| Entidade | Tabela / coleção | Aggregate dono | PK | Bounded context |
|---|---|---|---|---|
| Patient | Base44 `Patient` (JSONC) / `localStorage mock_db_Patient` | AGG-Paciente | `id` | pacientes |
| Consultation | Base44 `Consultation` | AGG-Consulta | `id` | consultas |
| Prescription | Base44 `Prescription` | AGG-Consulta | `id` | consultas |
| Exam | Base44 `Exam` | AGG-Consulta | `id` | consultas |
| Appointment | Base44 `Appointment` | AGG-Agendamento | `id` | agendamentos |
| Doctor | Base44 `Doctor` | AGG-Medico | `id` | medicos |
| Template | Base44 `Template` | AGG-Template | `id` | templates |
| AccessLog | Base44 `AccessLog` | AGG-AccessLog | `id` | logs-acesso |
| User (auth) | Base44 auth (não é entidade CRUD) | (sessão) | — | transversal |

> Não há "tabelas" novas no banco. As entradas acima referem-se às coleções/entidades BaaS persistentes, cujo schema canônico está em `base44/entities/*.jsonc` (fonte imutável de verdade) e cujo reflexo em tipos estará em `src/types/*.ts`.

## Schema (DDL ou equivalente)

Sem DDL — o schema físico permanece no Base44. O equivalente tipado (contrato) em `src/types/`:

```ts
// src/types/Patient.ts (reflexo de base44/entities/Patient.jsonc — resumo)
export type PatientStatus = 'ativo' | 'inativo';
export type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconhecido';

export interface LGPDConsent {          // tipo condicional: lgpd_consent:true ⇒ preenchido
  lgpd_consent: true;
  lgpd_consent_date: string;            // ISO datetime (registrado no save)
  lgpd_consent_ip: string;              // registrado no save
}
export type Patient = LGPDConsent & {
  id: string;
  full_name: string;
  cpf: string;                          // 🔒 sensível — sempre criptografado no BaaS
  birth_date: string;                   // date
  gender: Gender;
  phone: string;
  email?: string;
  // ... address, emergency_contact, emergency_phone, health_insurance,
  // insurance_number, blood_type, allergies, chronic_conditions,
  // medications_in_use, photo_url, notes ...
  status: PatientStatus;                // default 'ativo'
  created_by_id: string;
  created_date: string;
};
```

> Tipos análogos para Doctor, Appointment, Consultation, Prescription, Exam, Template, AccessLog, User — sempre espelhando o JSONC correspondente e usando unions para enums. As interfaces completas por campo estão no data dictionary (Apêndices de cada entidade) e nos JSONC.

## Relacionamentos

| Origem | Destino | Cardinalidade | Integridade | Notas |
|---|---|---|---|---|
| Consultation.patient_id | Patient.id | N:1 | via Base44 (referencial por campo; RLS por created_by_id/admin) | BR-C01 |
| Prescription.patient_id | Patient.id | N:1 | idem | `data-dictionary.md` |
| Prescription.consultation_id | Consultation.id | N:1 (opcional) | idem | emitida na consulta |
| Exam.patient_id | Patient.id | N:1 | idem | — |
| Exam.consultation_id | Consultation.id | N:1 (opcional) | idem | — |
| Appointment.patient_id | Patient.id | N:1 | idem | BR-A01 |
| Appointment.doctor_id | Doctor.id | N:1 | idem | BR-A01 |
| Appointment.consultation_id | Consultation.id | 1:1 (opcional) | idem | criada ao gerar consulta |
| Prescription (content) | Template (conteúdo copiado) | relação fraca | **sem FK** — cópia de conteúdo no save | `erd.md` §3: alterar template não afeta prescrições emitidas |
| AccessLog.patient_name / entity_id | Patient | referência (auditoria) | sem FK — dado copiado no log | `erd-complete.md` |
| AccessLog.user_email | User | referência | sem FK | `erd-complete.md` (🟡) |

## Restrições

- **Unicidade**: `id` (UUID) por entidade — garantido pelo Base44/mock (`uuid` no create — BR-OFF06).
- **Integridade referencial**: desativada como mecanismo de banco (BaaS não usa FK físicas); a consistência é garantida por regras de negócio no domínio (ex.: consulta exige `patient_id` válido — BR-MIGRAR-006) e pelo RLS.
- **Particionamento / sharding**: N/A (BaaS gerencia; volume baixo — SPA de clínica).
- **Índices críticos**: N/A para o frontend; ordenações usadas: `-created_date` (Prescription, AccessLog), `-date` (Exam), `date` (Appointment/Consultation) — o BaaS indexa os campos de filtro/ordenação usados pelas queries (listar sempre com sort — BR-OFF09 limita a 1 campo no mock).

## Considerações específicas do paradigma alvo

> Seção dedicada quando o paradigma alvo é event-driven, funcional ou outro com implicação direta no modelo de dados.

- **Paradigma funcional (tipos)** — implicações diretas:
  - **Discriminated unions para estado**: `Appointment.status` e `Consultation.status` deixam de ser `string` e viram unions fechadas — registros com status inválido **não compilam** na camada de tipos (BR-MIGRAR-007/011).
  - **Tipos condicionais para LGPD**: `lgpd_consent: true` exige `lgpd_consent_date`/`lgpd_consent_ip` no tipo — o "schema" alvo força o invariante regulatório em compile-time (BR-MIGRAR-004).
  - **Imutabilidade no frontend**: os objetos de entidade são tratados como imutáveis (React); updates criam novos objetos (merge do mock preserva `id` — BR-OFF07).
  - **Contrato de escrita único**: `Base44Client` define os tipos de `create/update/delete` compartilhados por SDK e mock — garante que o formato em `localStorage` (offline) seja idêntico ao do BaaS (BR-MIGRAR-038/042).
- **Sem event sourcing/outbox**: paradigma não é event-driven; não há store de eventos.

## Origem no legado

| Tabela / coleção nova | Origem no legado | Transformação |
|---|---|---|
| `src/types/Patient.ts` | `base44/entities/Patient.jsonc` + `data-dictionary.md` Patient | espelho tipado (nenhuma mudança de schema) |
| `src/types/Consultation.ts` | `Consultation.jsonc` | espelho tipado |
| `src/types/Prescription.ts` | `Prescription.jsonc` | espelho tipado + union `type` |
| `src/types/Exam.ts` | `Exam.jsonc` | espelho tipado |
| `src/types/Appointment.ts` | `Appointment.jsonc` | espelho tipado + union `status`/`type` |
| `src/types/Doctor.ts` | `Doctor.jsonc` | espelho tipado + `WorkingHours`/`WorkingDays` |
| `src/types/Template.ts` | `Template.jsonc` | espelho tipado + union `type` |
| `src/types/AccessLog.ts` | `AccessLog.jsonc` | espelho tipado + union `action` |
| `src/types/User.ts` | `auth.me()` + `OFFLINE_USER` | união: `User` (com role) + variante offline sem role/created_by_id |

## Notas

- **Não há migração de dados**: ver `data_migration_plan.md` — volume, ETL e cutover de dados são **N/A** (BaaS intocado).
- Divergência seed offline conhecida: `Exam.file_url: ''` (string vazia vs opcional) e `AccessLog` offline sem `user_email` real — `modo-offline/requirements.md` e `data-dictionary.md` registram; os tipos devem tolerar o contrato mock (BR-MIGRAR-044).
- Campos sensíveis LGPD a marcar no tipo: `cpf`, `lgpd_consent*`, `birth_date`, `patient_name` em AccessLog (dado copiado) — ver coluna de sensibilidade do `data-dictionary.md`.
