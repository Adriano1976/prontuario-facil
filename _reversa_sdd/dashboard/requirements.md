# Dashboard

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Página do dashboard mostrando métricas-chave de saúde e atividade recente. Exibe estatísticas de pacientes, consultas, prescrições e agendamentos para acesso rápido do médico.

## Responsabilidades
- Fornecer métricas e KPIs consolidados ao usuário
- Exibir os agendamentos do dia atual e próximos
- Ofertar atalhos para ações frequentes (Novo Paciente, Agendar Consulta, etc.)

## Regras de Negócio
- [Pacientes Ativos] Total de pacientes cadastrados com o status igual a 'ativo'. 🟢
- [Agendamentos Hoje] Total de agendamentos onde a data coincide com o dia atual e o status é diferente de 'cancelado'. 🟢
- [Documentos Emitidos] Calculado com base no total retornado (até 100) das prescrições ordenadas por data de criação. 🟢
- [Taxa de Atendimento] Percentual de agendamentos **concluídos** sobre os que tiveram **desfecho** (`concluido + faltou`) nos últimos 12 meses. Cancelamento e estados sem desfecho ficam fora das duas contas. 🟢 *(decidida em 2026-09-25 — ver `_reversa_forward/016-taxa-de-atendimento/requirements.md#9`)*
- [Próximos Agendamentos] Exibe até 5 agendamentos onde a data é no futuro (maior que a data/hora atual) e o status é diferente de 'cancelado'. 🟢

> **Veredito de prova — convergência de 2026-09-24 (feature `009-prova-kpis-dashboard`).** As cinco
> regras deixaram de ser promessa: cada uma tem verificação de execução em
> `src/pages/__tests__/DashboardKpis.test.tsx`. **Nenhuma regra mudou de conteúdo** — o que passou a
> existir é a medição. Adendo: `_reversa_sdd/addenda/009-prova-kpis-dashboard.md`.

| Regra | Veredito | Verificação |
| :--- | :--- | :--- |
| Pacientes Ativos | 🟢 **Provada** | `PT-008.1` — o paciente inativo é ignorado |
| Agendamentos Hoje | 🟢 **Provada, com a borda explícita** | `PT-008.2` — exclui **apenas** `cancelado`, de modo que `faltou`, `concluido` e `confirmado` **contam**; e o agendamento de outra data não entra |
| Documentos Emitidos | 🟢 **Provada** | `BR-MIGRAR-029` — reflete o tamanho da leitura, inclusive quando ela vem vazia |
| Taxa de Atendimento | 🟢 **Provada e calculada** | `PT-008.4` — o cartão exibe `—` com o texto do estado sem base quando não há desfecho; a fórmula e a janela são provadas em `src/lib/__tests__/taxaAtendimento.test.ts`. **A lacuna `G-01` foi fechada** pela feature `016-taxa-de-atendimento` (2026-09-25) |
| Próximos Agendamentos | 🟢 **Provada** | `PT-008.5` — limita a cinco, ignora passado e cancelado, e exibe o estado vazio com o atalho |

> **Limites e escopo das quatro leituras.** `BR-MIGRAR-033` prova que cada leitura sai com a
> ordenação e o limite do legado (pacientes 100, consultas 50, prescrições 100, agendamentos 100) e
> que **o escopo da sessão é declarado**. É a verificação de `W006` e `W007` do watch da feature.
>
> **Um achado que o adendo registra e esta tabela não resolve:** `PT-008.3` é provado pela
> **ausência** — o critério divergente de `AMB-002` (o contador de Consultas de Hoje) está
> preservado em **código morto** (`Dashboard.tsx:83-92` calcula e descarta), e não há superfície
> onde medi-lo.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Exibir KPIs numéricos e percentuais | Must | Os valores refletem os dados no banco/API; a taxa é calculada sobre os desfechos dos últimos 12 meses |
| RF-02 | Exibir lista de "Próximos Agendamentos" | Must | Listar apenas consultas futuras não canceladas (limite de 5) |
| RF-03 | Disponibilizar botões de "Ações Rápidas" | Should | Os botões devem direcionar para os fluxos corretos (Novo Paciente, Nova Consulta, etc) |
| RF-04 | Disponibilizar barra de busca global de pacientes | Must | Permitir pesquisa por nome/CPF usando o componente `PatientSearch` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Log de acesso é gerado assim que o dashboard é carregado | `src/pages/Dashboard.jsx:90` | 🟢 |
| Performance | As consultas de pacientes, consultas e prescrições tem limite de 100 ou 50 registros via API para evitar payload enorme | `src/pages/Dashboard.jsx:45` | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado que o médico acessou a página do Dashboard
Quando os dados da API são carregados
Então o KPI "Pacientes Ativos" deve mostrar o total de pacientes com status "ativo"
E a lista de Próximos Agendamentos não deve conter consultas passadas ou canceladas
E um evento de auditoria de "Acesso ao dashboard" deve ser gravado via logAccess
```

### Taxa de Atendimento — decidida e implementada

> **Fechada em 2026-09-25 pela feature `016-taxa-de-atendimento`.** O que segue substitui a seção
> "decisão pendente", que valeu de 2026-08-31 a 2026-09-25. A lacuna `G-01` saiu de
> `_reversa_sdd/gaps.md#Lacunas abertas`.

- **Definição:** `concluido ÷ (concluido + faltou) × 100`, arredondado para inteiro. Cancelamento
  fica fora das duas contas; `agendado`, `confirmado` e `em_atendimento` também, por não terem
  desfecho. A fórmula sugerida em 2026-08-31 — `concluídos / (concluídos + cancelados + faltou)` —
  foi **recusada** em favor desta, que separa quem avisa que não vem de quem simplesmente falta.
- **Fonte:** `Appointment`, a agenda. `Consultation` foi descartada por não ter estado de falta.
  Limitação aceita: `Appointment.status` só muda por ação manual (`Appointments.tsx:86`), então o
  número mede **desfecho registrado**, não comparecimento real.
- **Período:** 12 meses, com borda estrita — exatamente na marca de 12 meses fica fora.
- **Sem base:** quando não há desfecho na janela, o cartão exibe `—` com o texto "sem agendamentos
  com desfecho no período", e **não** `0%`.
- **Superfície:** o cartão passa a exibir, sob o valor, o subtítulo "últimos 12 meses". É a única
  mudança de superfície, e é deliberada. O rótulo, a posição e a cor não mudam.
- ✅ **A divergência de `O002` está encerrada.** A decisão humana de 2026-09-09 (`AMB-001`) exigia
  "constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`)" e o código tinha o literal
  `value="94%"`. O literal deixou de existir: existe símbolo real em `src/lib/taxaAtendimento.ts`.

Decisão completa em `_reversa_forward/016-taxa-de-atendimento/requirements.md#9. Esclarecimentos`.

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Visualização de Agendamentos | Must | Médico precisa saber sua agenda imediata do dia |
| Visualização de KPIs | Must | Resumo da atividade clínica do médico |
| Ações Rápidas | Should | Facilita a navegação, embora os itens estejam no menu principal |
| Busca Global de Pacientes | Must | Caminho crítico para iniciar um atendimento direto |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/pages/Dashboard.jsx` | `Dashboard` | 🟢 |

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
