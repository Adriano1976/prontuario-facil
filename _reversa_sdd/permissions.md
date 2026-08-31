# Matriz de Permissões (RBAC) — prontuario-facil

O sistema utiliza um modelo híbrido de **Papéis (Roles)** e **Propriedade (Ownership)**.

## 1. Papéis Definidos

| Papel | Descrição |
| :--- | :--- |
| **User** | Médico ou profissional de saúde padrão. Acesso restrito aos próprios dados. |
| **Admin** | Gestor da clínica. Acesso total a todos os dados e configurações do sistema. |

## 2. Matriz de Acesso por Entidade

| Entidade | Criar | Ler | Editar | Excluir | Regra Especial |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Pacientes** | User | Own | Own | Own | Admin lê/edita tudo. |
| **Consultas** | User | Own | Own | Own | Histórico é imutável após `concluido` (UI). |
| **Agendamentos** | User | Own | Own | Own | — |
| **Templates** | Admin | All | Admin | Admin | Usuário comum apenas lê templates ativos. |
| **Médicos** | Admin | All | Admin | Admin | — |
| **AccessLogs** | System | Admin | Ninguém | Admin | Logs são *append-only* via sistema. |

**Legenda:**
- **All**: Qualquer usuário autenticado.
- **Own**: Apenas se `created_by_id == current_user.id` OU se for `Admin`.
- **Admin**: Apenas usuários com `role == 'admin'`.
- **System**: Criado automaticamente pelo código.

## 3. Implementação Técnica 🟢

As regras estão aplicadas via lógica de filtro no Frontend (em páginas como `Patients.jsx` e `Consultations.jsx`) e reforçadas nas definições de schema (JSONC) que sugerem políticas de RLS (*Row Level Security*).

```javascript
// Exemplo de lógica encontrada (Consultation.jsonc)
"read": { "$or": [{ "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } }] }
```

## 4. ⚠️ Limitações em Modo Offline (adicionado em 2026-08-28)

Quando `VITE_OFFLINE=true`:
- O mock client (`src/api/mockClient.js`) **não aplica RLS** — todo registro é visível/editável por qualquer sessão.
- Não há distinção de papel — `OFFLINE_USER` tem `id`, `email`, `full_name` apenas. Não carrega `role`, `created_by_id` ou campos derivados.
- Filtros aplicados no frontend (ex: `created_by_id == me`) continuarão filtrando, mas o conjunto visível é o mesmo para qualquer "usuário" (porque só há um).
- `AccessLog.user_email` será sempre `demo@medrecord.local`.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
