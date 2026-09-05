# Matriz de Impacto — prontuario-facil

> ⚠️ **Alias/espelho.** A Spec Impact Matrix canônica está em **`traceability/spec-impact-matrix.md`**. Este arquivo é mantido na raiz como atalho de referência e não deve divergir do canônico.

## Resumo

| Módulo Alterado | Impacto em Outros Módulos | Nível de Risco | Motivo |
| :--- | :--- | :---: | :--- |
| **Pacientes** | Agendamentos, Consultas, Dashboard | **Alto** | É a entidade central. Mudar IDs ou campos obrigatórios quebra todo o fluxo. |
| **Médicos** | Agendamentos | **Médio** | Afeta a disponibilidade na agenda e o filtro de horários. |
| **Templates** | Consultas (Prescrições) | **Baixo** | Afeta apenas a criação de novos documentos. |
| **Agendamentos**| Dashboard, Consultas | **Médio** | Mudanças no status impactam as métricas do Dashboard e a criação de prontuários. |
| **AccessLogs** | Nenhum | **Mínimo** | Módulo de auditoria independente. |

## Dependências de Código 🛠️

- **Hooks Compartilhados**: `useToast`, `useStorage`.
- **Componentes UI (Radix/Shadcn)**: Utilizados em praticamente todos os módulos para diálogos e selects.
- **SDK Base44**: Camada de persistência única. Qualquer mudança no `config.jsonc` impacta todas as entidades.

> Para a matriz completa com impacto reverso, ver `traceability/spec-impact-matrix.md`.

---
*Gerado pelo Reversa-Architect em 2026-08-31. Conteúdo completo consolidado em `traceability/spec-impact-matrix.md`.*
