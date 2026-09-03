# Especificação SDD — Módulo Médicos

## 1. Visão Geral
O módulo de **Médicos** (`Doctor`) gerencia os profissionais de saúde cadastrados, suas jornadas de trabalho (dias e horários) e a duração padrão de suas consultas para cálculo de horários na agenda.

## 2. Regras de Negócio (BRs)
- **BR-M01**: Apenas usuários com papel `admin` podem criar, atualizar ou excluir registros de médicos. 🟢
- **BR-M02**: O campo `working_days` armazena os dias da semana ativos (0=domingo a 6=sábado). 🟢
- **BR-M03**: Agendamentos vinculados ao médico são validados contra `working_days`, o intervalo `working_hours` (`start`/`end`) e `appointment_duration`; horários fora desses limites são rejeitados. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/Doctor.jsonc`:
- **Identificação**: `full_name`, `crm`, `specialty`, `email`, `phone`.
- **Expediente**: `working_days` (array de números), `working_hours` (objeto com `start` e `end` em formato "HH:MM"), `appointment_duration` (duração em minutos).
- **Status/Outros**: `photo_url`, `is_active` (boolean).

## 4. Permissões e Segurança (RLS)
- **Create / Update / Delete**: Restrito estritamente a `role == 'admin'`.
- **Read**: Leitura livre para usuários autenticados da clínica.

---
*Gerado pelo Reversa-Writer em 2026-08-26.*
