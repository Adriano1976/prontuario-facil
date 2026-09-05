# Arquitetura do Sistema — prontuario-facil

> Visão geral arquitetural. Os **diagramas C4 completos** vivem em arquivos canônicos separados:
> - Contexto (Nível 1) → `c4-context.md`
> - Containers (Nível 2) → `c4-containers.md`
> - Componentes (Nível 3) → `c4-components.md`
> - ERD completo → `erd-complete.md`

## 1. Visão Resumida

O **Prontuário Fácil** é uma SPA (React 18 + Vite) de prontuário eletrônico aderente à LGPD para clínicas médicas. Todo o backend (autenticação, CRUD de entidades e RLS) é provido pela plataforma **Base44** (BaaS), consumida via `@base44/sdk`. O estado de servidor é gerenciado pelo TanStack Query e a UI usa Radix UI (shadcn/ui) + Tailwind CSS.

Fluxo principal de dados:

1. **Agendamento**: Médico seleciona Paciente (Ativo) e Médico → Cria `Appointment`.
2. **Atendimento**: No horário, Médico muda `Appointment` para `em_atendimento` → Cria `Consultation`.
3. **Documentação**: Durante a `Consultation`, Médico usa `Templates` → Cria `Prescription` / `Exam`.
4. **Finalização**: Médico marca `Consultation` como `concluida` → `Appointment` atualizado para `concluido`.

## 2. Variante de Deployment — Modo Offline 🟢

Quando `VITE_OFFLINE=true`, o container `spa` substitui o uso do SDK Base44 por um mock client (`src/api/mockClient.js`) que persiste no `localStorage` do navegador. Mesmo container, mesma UI, repositório de dados diferente. Não há mudanças nos contratos consumidos pelas pages. Ver `c4-containers.md` (variante offline) e `modo-offline/requirements.md`.

## 3. Diagramas de Referência

Consulte os artefatos canônicos para os diagramas renderizáveis (Mermaid):

| Nível | Arquivo |
| :--- | :--- |
| C4 Contexto (Nível 1) | `_reversa_sdd/c4-context.md` |
| C4 Containers (Nível 2) | `_reversa_sdd/c4-containers.md` |
| C4 Componentes (Nível 3) | `_reversa_sdd/c4-components.md` |
| ERD completo | `_reversa_sdd/erd-complete.md` |
| Spec Impact Matrix | `_reversa_sdd/traceability/spec-impact-matrix.md` |

---
*Gerado pelo Reversa-Architect em 2026-08-31. Diagramas movidos para os arquivos canônicos no alinhamento de layout.*
