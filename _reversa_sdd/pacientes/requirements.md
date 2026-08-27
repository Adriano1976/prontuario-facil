# Especificação SDD — Módulo Pacientes

## 1. Visão Geral
O módulo de **Pacientes** é a entidade central do sistema `prontuario-facil`. Ele armazena dados cadastrais, informações de saúde (alergias, tipo sanguíneo, condições crônicas) e controle de consentimento LGPD de cada indivíduo atendido.

## 2. Regras de Negócio (BRs)
- **BR-P01**: Apenas pacientes com status `ativo` podem ser selecionados para novos agendamentos ou consultas. 🟢
- **BR-P02**: O campo `blood_type` deve ser estritamente um dos valores permitidos do enum ABO/Rh (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `desconhecido`). 🟢
- **BR-P03**: Os campos obrigatórios para cadastro são: `full_name`, `cpf`, `birth_date`, `phone` e `lgpd_consent`. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/Patient.jsonc`:
- **Identificação**: `id` (auto), `full_name` (string), `cpf` (string criptografado), `birth_date` (date), `gender` (enum: masculino, feminino, outro, prefiro_nao_informar).
- **Contato**: `phone`, `email`, `address`, `emergency_contact`, `emergency_phone`.
- **Convênio**: `health_insurance`, `insurance_number`.
- **Saúde**: `blood_type` (enum), `allergies` (string), `chronic_conditions` (string), `medications_in_use` (string).
- **LGPD**: `lgpd_consent` (boolean), `lgpd_consent_date` (datetime), `lgpd_consent_ip` (string).
- **Outros**: `photo_url`, `notes`, `status` (enum: `ativo`, `inativo`, default: `ativo`).

## 4. Permissões e Segurança (RLS)
- **Create**: Aberto para autenticados (`null`).
- **Read / Update / Delete**: Restrito ao criador do registro (`created_by_id == user.id`) OU a usuários com papel `admin`.
