# Telas — Módulo Modo Offline (Mock Local)

<!-- visor: 2026-08-28T00:00:00-03:00 -->

> Esta unit é **transversal** e não possui telas próprias. O modo offline é uma alternativa de runtime que mantém as mesmas telas das units de domínio (Pacientes, Consultas, Agendamentos, Médicos, Templates, Logs de Acesso, Dashboard) — o que muda é o backend de dados, não a interface.

## 1. Telas afetadas (lista de propagação)

Quando `VITE_OFFLINE=true`, **todas** as telas abaixo passam a ler/escrever no `localStorage` em vez do Base44, sem mudança visual:

| Tela | Unit de origem | Mudança observável |
|------|----------------|--------------------|
| Dashboard Principal | `dashboard` | KPIs populados com seed (5 pacientes, 4 agendamentos, 2 consultas, etc.) |
| Listagem de Pacientes | `pacientes` | 5 pacientes seed visíveis; CRUD funciona |
| Cadastro de Novo Paciente | `pacientes` | Após salvar, registro aparece na listagem |
| Calendário de Agendamentos | `agendamentos` | 4 agendamentos seed visíveis |
| Novo Agendamento | `agendamentos` | Lista de pacientes e médicos vem do seed |
| Listagem de Consultas | `consultas` | 2 consultas seed |
| Novo Atendimento (Anamnese) | `consultas` | Sem mudança comportamental |
| Visualização de Consulta | `consultas` | Sem mudança comportamental |
| Modal: Novo Documento | `consultas` | Templates seed disponíveis |
| Modal: Upload de Exame | `consultas` | Preview funciona (Data URL em memória, perdido no reload) |
| Gerenciamento de Médicos | `medicos` | 3 médicos seed |
| Modal: Novo Médico | `medicos` | CRUD funciona |
| Central de Templates | `templates` | 2 templates seed |
| Modal: Criar / Editar Template | `templates` | CRUD funciona |
| Logs de Acesso | `logs-acesso` | `user_email` de todos os logs = `demo@medrecord.local` |

## 2. Estado de Tela: Login

🟡 **Diferença em relação ao online:**

- **Online:** a tela de login é servida pelo Base44 (`UserNotRegisteredError.jsx` para usuário autenticado sem cadastro).
- **Offline:** o usuário entra direto, sem tela de login. O `checkAppState()` curto-circuita e seta `OFFLINE_USER`.

## 3. Elementos de UI adicionados (ou ausentes)

🟡 **Ausência proposital:** nenhum banner, badge ou indicador visual informa ao usuário que está em modo offline. Ver `tasks.md` T-09 (pendente, bloqueada por Q-13).

## 4. Fluxo de navegação (inalterado em offline)

O fluxo de navegação entre as units é o mesmo do modo online (ver `_reversa_sdd/ui/flow.md`). A única diferença é a ausência da etapa de login.

## 5. Escala de confiança

🟢 = observado / confirmado; 🟡 = inferido do código; 🔴 = incerto.

- 🟡 Todas as telas marcadas como afetadas são derivadas da inspeção de código (chamadas `base44.entities.*`), não de screenshots específicos do modo offline.
- 🔴 Não há screenshots fornecidos pelo usuário para confirmar o comportamento visual do modo offline.

## 6. Mapeamento tela → unit

Cada tela continua mapeada à sua unit de origem (não à `modo-offline/`). Esta unit aparece como **transversal** em `surface.json` → `organization_suggestion.features`.
