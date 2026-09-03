# Dashboard, Design Técnico

> Template do arquivo `design.md`. Foca no **COMO** a unit é construída, baseado no código legado.

## Interface

- **Entradas:** Nenhuma entrada direta; a página depende de dados carregados via API (`base44`) para pacientes, consultas, prescrições e agendamentos.
- **Saídas:** Renderização de UI contendo:
  - Cards de métricas (KPIs) via componente `StatsCard`.
  - Lista de próximos agendamentos.
  - Área de ações rápidas (links/buttons).
  - Busca de pacientes (`PatientSearch`).
  - Visão de relatórios (`ReportsView`).
- **Tipos de Dados:** Objetos retornados pelas chamadas de API (`Patient`, `Consultation`, `Prescription`, `Appointment`).

## Fluxo Principal

1. **Carregamento de Dados** – Ao montar o componente, quatro chamadas `useQuery` são disparadas simultaneamente:
   - `patients` → `base44.entities.Patient.list('-created_date', 100)`
   - `consultations` → `base44.entities.Consultation.list('-date', 50)`
   - `prescriptions` → `base44.entities.Prescription.list('-created_date', 100)`
   - `appointments` → `base44.entities.Appointment.list('-date', 100)`
2. **Cálculos Derivados** – A partir dos resultados são derivados:
   - `activePatients` (pacientes com `status === 'ativo'`).
   - `todayAppointments` (agendamentos de hoje, não cancelados).
   - `upcomingAppointments` (próximos 5 agendamentos futuros, não cancelados).
3. **Log de Auditoria** – `useEffect` registra acesso via `logAccess(ACCESS_ACTIONS.LOGIN, …, 'Acesso ao dashboard')`.
4. **Renderização** – UI estruturada em três áreas principais:
   - **Header** com título, data formatada e campo de busca.
   - **KPIs** – quatro `StatsCard` exibindo pacientes ativos, agendamentos hoje, documentos emitidos (prescrições) e taxa fixa de atendimento.
   - **Tabs** – Visão geral (lista de próximos agendamentos) e Relatórios (`ReportsView`).
   - **Ações Rápidas** – botões que encaminham para formulários de paciente, consulta, agendamento, etc.
5. **Comportamento de Falha** – Se as consultas retornarem erro ou vazias, os componentes mostram estados de carregamento (`loading*`) ou mensagens de “Nenhum agendamento”.

## Fluxos Alternativos

- **Falha ao Carregar Dados** – Cada `useQuery` tem estado `isLoading`. Enquanto `loading*` é `true`, placeholders de animação (`animate-pulse`) são exibidos.
- **Sem Agendamentos Futuramente** – Quando `upcomingAppointments.length === 0`, renderiza mensagem “Nenhum agendamento” com botão de criar nova consulta.
- **Erro de Auditoria** – Falha ao gravar log não interrompe a UI; erro é silencioso (conforme `logAccess` implementação).

## Dependências

- `@tanstack/react-query` – gerenciamento de queries assíncronas.
- `lucide-react` – ícones.
- Componentes internos (`StatsCard`, `PatientSearch`, `AccessLogger`, `ReportsView`).
- `date-fns` (formatação de datas) e `framer-motion` (animações).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Log de acesso ao abrir o dashboard | `useEffect(() => logAccess(...))` em `Dashboard.jsx` linha 89 | 🟢 |
| Taxa de Atendimento fixa (94%) | Valor hard-coded em `Dashboard.jsx:140-141` | 🟢 |
| Limite de 100 pacientes e 50 consultas | Argumentos `list('-created_date', 100)` e `list('-date', 50)` nas queries | 🟢 |
| Uso de animações `framer-motion` para entradas da UI | Componentes `motion.div` nas linhas 104‑108, 168‑172, 242‑246 | 🟢 |

## Estado Interno

Nenhum estado interno complexo além dos dados derivados (`activePatients`, `todayAppointments`, `upcomingAppointments`). Não há armazenamento persistente local.

## Observabilidade

- **Log de Acesso:** `logAccess` grava evento `ACCESS_ACTIONS.LOGIN` ao montar a página (linha 89‑91). 
- **Métricas de Dados:** As queries são instrumentadas pelo `react-query` devtools (não explícito no código, mas padrão da biblioteca).

## Riscos e Lacunas

- **Taxa de Atendimento:** Valor mockado (`"94%"`) sem fórmula, fonte ou período de cálculo; a fórmula sugerida pelo responsável é apenas hipótese. 🔴
- **Limites de Lista:** Dependência de limites fixos (100/50) pode causar inconsistência se o volume de dados crescer. 🟡

> Este design foi inferido a partir do código existente. Validar com a equipe de produto para confirmar a lógica da taxa de atendimento e os limites de paginação.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
