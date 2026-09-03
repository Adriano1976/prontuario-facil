# Especificação SDD — Módulo Agendamentos

## 1. Visão Geral
O módulo de **Agendamentos** (`Appointment`) gerencia a agenda da clínica, permitindo a marcação de horários entre pacientes e médicos, visualização em formato de calendário semanal ou lista, e o controle de presença/status.

## 2. Regras de Negócio (BRs)
- **BR-A01**: Um agendamento exige obrigatoriamente um `patient_id`, um `doctor_id` e uma `date`. 🟢
- **BR-A02**: Pacientes selecionados para agendamento devem possuir `status: 'ativo'`. 🟢
- **BR-A03**: O ciclo de status do agendamento é: `agendado` → `confirmado` → `em_atendimento` → `concluido` (ou `cancelado` / `faltou`). A transição para `confirmado` é manual, realizada por médico, recepcionista ou administrador na interface; `reminder_sent` e `reminder_sent_date` são apenas flags de notificação, sem automação de status. 🟢
- **BR-A04**: O horário de um agendamento deve respeitar os `working_days` e o intervalo `working_hours` (`start`/`end`) do médico, além de caber na duração definida por `appointment_duration`. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/Appointment.jsonc`:
- **Vínculos**: `patient_id` (required), `doctor_id` (required), `consultation_id` (opcional, ID da consulta gerada).
- **Agendamento**: `date` (datetime, required), `duration` (number, default: 30 min).
- **Tipos**: `type` (enum: `primeira_consulta`, `retorno`, `exame`, `procedimento`, default: `primeira_consulta`).
- **Status**: `status` (enum: `agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado`, `faltou`, default: `agendado`).
- **Outros**: `notes`, `reminder_sent` (boolean), `reminder_sent_date`.

## 4. Permissões e Segurança (RLS)
- **Create**: Aberto para autenticados (`null`); restrições de papel aplicam-se somente a cadastros administrativos.
- **Read / Update / Delete**: Restrito ao criador (`created_by_id == user.id`) OU papel `admin`.

---
*Gerado pelo Reversa-Writer em 2026-08-26.*
