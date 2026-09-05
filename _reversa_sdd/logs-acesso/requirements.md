# Especificação SDD — Módulo Logs de Acesso

## 1. Visão Geral
O módulo de **Logs de Acesso** (`AccessLog`) registra as auditorias de segurança e rastreabilidade de ações executadas no sistema (ex: visualização, edição, exclusão de registros sensíveis).

## 2. Regras de Negócio (BRs)
- **BR-L01**: Os registros são de inserção exclusiva pelo sistema (*append-only*), vedada edição ou exclusão por usuários comuns. 🟢
- **BR-L02**: Ação registrada deve pertencer ao enum de ações suportadas (ex: `create`, `read`, `update`, `delete`, `export_data`, etc.). 🟢
- **BR-L03**: Logs são gerados por chamadas de serviço dedicadas ou interceptadores ligados a eventos específicos, incluindo autenticação bem-sucedida e visualização de prontuários/pacientes; não há logging automático de toda rota autenticada. 🟢

## 3. Estrutura de Dados (Schema)
Baseado em `base44/entities/AccessLog.jsonc`:
- **Campos**: `user_email`, `action` (enum), `entity_type`, `entity_id`, `patient_name`, `ip_address`, `user_agent`, `details`.

## 4. Permissões e Segurança (RLS)
- **Create**: Aberto ao sistema.
- **Read / Update / Delete**: Restrito exclusivamente a `role == 'admin'`.

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
