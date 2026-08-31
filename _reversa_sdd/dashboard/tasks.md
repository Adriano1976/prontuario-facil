# Dashboard, Tarefas de Implementação

> Template do arquivo `tasks.md`. Lista de tarefas necessárias para implementar a unidade Dashboard a partir do código legado.

## Pré-requisitos
- [ ] Dependências listadas em `design.md` disponíveis:
  - `@tanstack/react-query`
  - `lucide-react`
  - `date-fns`, `date-fns/locale/pt-BR`
  - `framer-motion`
  - Componentes internos (`StatsCard`, `PatientSearch`, `AccessLogger`, `ReportsView`)
- [ ] Configuração de API `base44` operando e credenciais corretas.
- [ ] Variáveis de ambiente necessárias (ex.: URL da API, chave de acesso) documentadas em `.env`.

## Tarefas
- [ ] **T-01**: Implementar chamada à API de pacientes (`base44.entities.Patient.list`) limitando a 100 registros.
  - Origem no legado: `src/pages/Dashboard.jsx:45`
  - Critério de pronto: Dados carregados e exibidos no cartão "Pacientes Ativos".
  - Confiança: 🟢
- [ ] **T-02**: Implementar chamada à API de consultas (`base44.entities.Consultation.list`) limitando a 50 registros.
  - Origem no legado: `src/pages/Dashboard.jsx:50`
  - Critério de pronto: Lista de próximos agendamentos populada corretamente.
  - Confiança: 🟢
- [ ] **T-03**: Implementar chamada à API de prescrições (`base44.entities.Prescription.list`).
  - Origem no legado: `src/pages/Dashboard.jsx:55`
  - Critério de pronto: Valor do KPI "Documentos Emitidos" reflete o número de prescrições.
  - Confiança: 🟢
- [ ] **T-04**: Implementar chamada à API de agendamentos (`base44.entities.Appointment.list`).
  - Origem no legado: `src/pages/Dashboard.jsx:60`
  - Critério de pronto: KPIs de "Agendamentos Hoje" e lista de "Próximos Agendamentos" corretos.
  - Confiança: 🟢
- [ ] **T-05**: Calcular `activePatients` filtrando pacientes com `status === 'ativo'`.
  - Origem no legado: `src/pages/Dashboard.jsx:74`
  - Critério de pronto: Valor exibido no card corresponde ao filtro.
  - Confiança: 🟢
- [ ] **T-06**: Calcular `todayAppointments` filtrando agendamentos de hoje não cancelados.
  - Origem no legado: `src/pages/Dashboard.jsx:79‑82`
  - Critério de pronto: Valor exibido no KPI "Agendamentos Hoje".
  - Confiança: 🟢
- [ ] **T-07**: Calcular `upcomingAppointments` limitando a 5 itens futuros não cancelados.
  - Origem no legado: `src/pages/Dashboard.jsx:84‑87`
  - Critério de pronto: Lista de próximos agendamentos exibe até 5 itens.
  - Confiança: 🟢
- [ ] **T-08**: Garantir registro de auditoria ao abrir o dashboard.
  - Origem no legado: `src/pages/Dashboard.jsx:89‑91`
  - Critério de pronto: Log `Acesso ao dashboard` presente em logs de auditoria.
  - Confiança: 🟢
- [ ] **T-09**: Implementar animações de entrada com `framer-motion` conforme componentes `motion.div` existentes.
  - Origem no legado: linhas 104‑108, 168‑172, 242‑246.
  - Critério de pronto: Animações visíveis ao carregar a página.
  - Confiança: 🟢
- [ ] **T-10**: Substituir valor hard‑coded da "Taxa de Atendimento" por cálculo real ou confirmar que o mock está adequado.
  - Origem no legado: `src/pages/Dashboard.jsx:152‑154` (valor "94%")
  - Critério de pronto: Valor proveniente de lógica de negócio ou verificado com produto.
  - Confiança: 🔴
- [ ] **T-11**: Implementar tratamento de erro para cada query (exibir mensagens de falha ao usuário).
  - Origem no legado: não explicitado – necessidade inferida.
  - Critério de pronto: UI exibe erro amigável quando a API falha.
  - Confiança: 🟡
- [ ] **T-12**: Testes unitários e de integração:
  - Verificar que os KPIs exibem valores corretos com dados mockados.
  - Cobertura mínima 80% das funções de cálculo.
  - Critério de pronto: Testes passam e cobertura reportada.

## Tarefas de Teste
- [ ] **TT-01**: Happy path – Todos os KPIs exibem valores corretos quando a API retorna dados válidos.
- [ ] **TT-02**: Falha de rede – Cada query falha isoladamente e a UI mostra mensagens de erro apropriadas.
- [ ] **TT-03**: Estado vazio – Quando não há pacientes/consultas/agendamentos, a UI mostra mensagens de "Nenhum agendamento"/"Nenhum paciente".
- [ ] **TT-04**: Verificar que o log de acesso é registrado (mock de `logAccess`).

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/pages/Dashboard.jsx` | `Dashboard` component | 🟢 |

## Ordem Sugerida
1. T-01 a T-04 (Configuração base das consultas à API).
2. T-05 a T-07 (Lógica de filtragem derivada dos dados carregados).
3. T-09 e T-08 (Implementações visuais e de auditoria isoladas).
4. T-10 (Após validar com Produto o cálculo).
5. T-11 e TT-* (Polimento, UI de fallback e Testes).

## Lacunas Pendentes (🔴)
- **T-10 (Taxa de Atendimento):** A taxa de atendimento está exibida com um valor fixo de 94%. Precisamos validar com o Produto/Negócios qual é o cálculo correto (ex: `(consultas concluidas / consultas agendadas) * 100` num dado período) ou se de fato será removida.
