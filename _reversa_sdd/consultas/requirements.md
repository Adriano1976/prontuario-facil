# Especificação SDD — Módulo Consultas

## 1. Visão Geral
O módulo de **Consultas** (`Consultation`) gerencia o registro clínico do atendimento médico, englobando anamnese, sinais vitais, hipótese diagnóstica (CID-10), plano de tratamento e a emissão de documentos associados (prescrições e exames).

## 2. Regras de Negócio (BRs)
- **BR-C01**: Toda consulta deve estar obrigatoriamente vinculada a um `patient_id` válido. 🟢
- **BR-C02**: O status da consulta segue o ciclo: `agendada` → `em_andamento` → `concluida` (ou `cancelada`). 🟢
- **BR-C03**: O campo `medications` em prescrições vinculadas só deve ser preenchido se o tipo do documento for do tipo receita. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/Consultation.jsonc`:
- **Vínculo**: `patient_id` (string, required).
- **Datas**: `date` (datetime), `follow_up_date` (date).
- **Clínico**: `chief_complaint` (queixa principal), `history_present_illness` (história da doença atual).
- **Sinais Vitais (`vital_signs`)**: `blood_pressure`, `heart_rate`, `temperature`, `respiratory_rate`, `oxygen_saturation`, `weight`, `height`.
- **Conduta**: `physical_exam`, `diagnosis`, `icd_code` (CID-10), `treatment_plan`, `notes`.
- **Status**: `status` (enum: `agendada`, `em_andamento`, `concluida`, `cancelada`, default: `agendada`).

## 4. Permissões e Segurança (RLS)
- **Create**: Aberto para profissionais autenticados.
- **Read / Update / Delete**: Restrito ao criador do registro (`created_by_id == user.id`) OU a usuários com papel `admin`.

---
*Gerado pelo Reversa-Writer em 2026-08-26.*
