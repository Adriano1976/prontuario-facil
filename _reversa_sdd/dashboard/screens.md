# Interface: Dashboard — MedRecord

## Tela: Dashboard Principal
Visão geral e centro de controle do médico.

### Elementos de Interface

- **KPI Cards** 🟢 *(confirmado no código — `Dashboard.jsx:129-158`, componente `StatsCard`)*
  - **Pacientes Ativos** — valor numérico (`activePatients`), filtrado por `status === 'ativo'`. 🟢
  - **Agendamentos Hoje** — valor numérico (`todayAppointments.length`), agendamentos do dia corrente com status ≠ `'cancelado'`. 🟢
  - **Documentos Emitidos** — valor numérico (`prescriptions?.length || 0`), total de prescrições retornadas pela API. 🟢
  - **Taxa de Atendimento** — exibe `"94%"` hard-coded. **Não há sparkline, mini chart nem barra de progresso**; o componente `StatsCard` só suporta ícone, valor e indicador de tendência textual (prop `trend`), que não é passado aqui. O "gráfico mini" mencionado anteriormente era uma inferência incorreta da imagem. 🔴 *(valor mockado, cálculo real desconhecido)*

- **Área de Agendamentos** 🟢
  - Lista "Próximos Agendamentos" — exibe até 5 agendamentos futuros não cancelados (`upcomingAppointments`). 🟢
  - **Estado vazio** — quando `upcomingAppointments.length === 0`, exibe ícone de calendário, texto "Nenhum agendamento" e botão "Agendar consulta". 🟢 *(confirmado no código — `Dashboard.jsx:227-237`)*
  - Botão "Ver todos" — link para a página `Appointments`. 🟢

- **Ações Rápidas** 🟢 *(confirmado no código — `Dashboard.jsx:254-314`)*
  - Novo Paciente → `PatientForm` 🟢
  - Agendar Consulta → `NewAppointment` 🟢
  - Nova Consulta → `NewConsultation` 🟢
  - Lista de Pacientes → `Patients` 🟢
  - Templates → `Templates` 🟢
  - Badge LGPD Compliant (visual, sem interação) 🟢

- **Busca Global de Pacientes** — campo de busca por nome/CPF via componente `PatientSearch`. 🟢 *(confirmado — `Dashboard.jsx:118`)*

- **Navegação** — menu superior fixo com ícones e labels inferido do `Layout.jsx`. 🟡 *(não implementado diretamente no Dashboard; provém do layout global)*

- **Tabs "Visão geral" / "Relatórios"** — aba "Relat órios" renderiza `<ReportsView />`. 🟢 *(confirmado — `Dashboard.jsx:160-333`)*

---
*Gerado pelo Reversa-Visor em 2026-08-27. Anotações de confiança adicionadas pelo Writer em 2026-08-31.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `dashboard/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **1**.

### Tela: Dashboard Principal — `screenshots/tela_dashboard.png`

- **Propósito**: centro de controle do consultório — KPIs do dia, próximos agendamentos e atalhos para as ações mais frequentes. 🟢
- **Estado da tela**: `preenchido` nos KPIs e `vazio` no bloco de agendamentos ("Nenhum agendamento"). 🟢
- **Contexto de uso**: rota raiz, alcançada pelo item "Dashboard" do menu superior (item ativo marcado com pílula). 🟢
- **Captura**: 1623×1008 px. 🟢

#### Cabeçalho e navegação global (herdados do layout)

- Marca **"MedRecord"** com ícone circular verde-água contendo "M". 🟢
- Menu superior, na ordem: **Dashboard** (ativo, pílula destacada), **Pacientes**, **Agendamentos**, **Consultas**, **Médicos**, **Templates**, **Logs de Acesso** — cada item com ícone próprio. 🟢
- À direita: avatar circular com inicial **"A"**, nome **"Adriano Santos"** e chevron de menu. 🟢
- Faixa horizontal verde-clara logo abaixo do menu: ícone de escudo com check + texto **"Sistema em conformidade com a LGPD - Lei Geral de Proteção de Dados"**. Elemento global, presente em todas as telas capturadas. 🟢

#### Conteúdo principal

- Título **"Prontuário Eletrônico"**; subtítulo com a data corrente por extenso — na captura, **"terça-feira, 22 de setembro de 2026"** (valor dinâmico). 🟢
- **Busca global**: input com lupa e placeholder **"Buscar paciente (nome, C…)"** (texto truncado na captura — a leitura completa não é possível pela imagem). 🟡
- Botão primário à direita da busca: **"+ Novo Paciente"** (verde-água, cantos arredondados). 🟢
- **Quatro KPI cards**, cada um com rótulo, valor em destaque e ícone colorido à direita:

  | Rótulo | Valor na captura | Ícone |
  |---|---|---|
  | Pacientes Ativos | **6** | pessoas, azul |
  | Agendamentos Hoje | **0** | calendário, verde |
  | Documentos Emitidos | **6** | documento, roxo |
  | Taxa de Atendimento | **94%** | gráfico ascendente, laranja |

  🟢 *(rótulos, valores e cores)*
- 🔴 **Linha de tendência nos cards**: as imagens sugerem um traço fino sob o valor, mas o código confirma que `StatsCard` só renderiza tendência quando a prop `trend` é passada, e no Dashboard ela não é (`Dashboard.jsx:129-158`). Divergência imagem × código **não resolvida** — requer validação humana (a anotação de 2026-08-31 já havia registrado essa mesma dúvida).
- **Card "Próximos Agendamentos"**: título com ícone de calendário e link **"Ver todos →"** no canto superior direito. Corpo em **estado vazio**, com moldura tracejada: ícone de calendário, texto **"Nenhum agendamento"** e botão de contorno **"+ Agendar consulta"**. 🟢
- **Card "Ações Rápidas"**: título com ícone de raio; cinco itens empilhados, cada um com ícone em quadrado colorido, título e subtítulo:

  | Título | Subtítulo | Cor do ícone |
  |---|---|---|
  | Novo Paciente | Cadastro rápido completo 🟡 | azul |
  | Agendar Consulta | Marcar horário 🟡 | azul |
  | Nova Consulta | Iniciar atendimento 🟡 | verde |
  | Lista de Pacientes | Ver todos os prontuários 🟡 | roxo |
  | Templates | Gerenciar modelos 🟡 | âmbar |

  🟢 *(títulos)* / 🟡 *(subtítulos: corpo pequeno, legibilidade reduzida na captura)*
- **Card "LGPD Compliant"**: ícone de escudo com check, título **"LGPD Compliant"** e subtítulo de apoio. 🟡 *(subtítulo ilegível nesta resolução)*
- **Tabs "Visão geral" / "Relatórios"**: 🟡 **não aparecem na captura** — foram documentadas a partir do código (`Dashboard.jsx:160-333`, `<ReportsView />`). A imagem mostra apenas a visão geral; registrado como divergência a esclarecer.

#### Lacunas desta tela

- 🔴 Texto de apoio do card LGPD Compliant ilegível.
- 🔴 Texto completo do placeholder da busca global.
- 🔴 Traço sob os valores dos KPIs: componente real ou artefato de renderização.

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir de `dashboard/screenshots/tela_dashboard.png`.*
