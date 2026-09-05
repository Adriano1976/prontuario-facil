# Especificação SDD — Módulo Templates

## 1. Visão Geral
O módulo de **Templates** gerencia os modelos pré-definidos de texto para documentos médicos (como receitas simples, controladas, atestados, solicitações de exame), agilizando o atendimento clínico.

## 2. Regras de Negócio (BRs)
- **BR-T01**: Todo template exige preenchimento de `name`, `type` e `content`. 🟢
- **BR-T02**: O tipo do template deve pertencer ao enum de 7 valores permitidos (ex: `receita_simples`, `atestado`, `anamnese`, etc.). 🟢
- **BR-T03**: A criação e exclusão de templates são restritas a administradores (`role == 'admin'`). 🟢
- **BR-T04**: As variáveis do template são interpoladas no salvamento do documento. Variáveis contextuais como `{DIAS_AFASTAMENTO}` podem ser resolvidas pelo contexto ou exigir preenchimento manual do médico antes da finalização. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/Template.jsonc`:
- **Campos**: `name`, `type` (enum de 7 tipos), `content`, `is_active` (boolean, default true), `is_default` (boolean).

## 4. Permissões e Segurança (RLS)
- **Create / Update / Delete**: Restrito a `role == 'admin'`.
- **Read**: Leitura de templates ativos liberada para profissionais de saúde.

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
