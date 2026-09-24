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
- [Taxa de Atendimento] O valor é atualmente exibido fixo/mockado em "94%"; não há fórmula, fonte agregada ou período definidos no legado. 🔴
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
| Taxa de Atendimento | 🔴 **Provada como comportamento, pendente como produto** | `PT-008.4` — afirma a constante `"94%"`, sem fórmula e sem tendência. A lacuna remanescente é de **produto**, não de prova |
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
| RF-01 | Exibir KPIs numéricos e percentuais | Must | Os valores refletem os dados no banco/API; até a definição de produto, a taxa permanece explicitamente mockada em 94% |
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

### Taxa de Atendimento — decisão pendente

- A implementação atual confirma apenas o placeholder `94%`. 🟢 **Medido em 2026-09-24**: `PT-008.4` prova que o valor exibido é a constante, sem fórmula e sem tendência.
- A fórmula sugerida `concluídos / (concluídos + cancelados + faltou) × 100`, a entidade `Appointment` como fonte e o período de cálculo são hipóteses para validação, não requisitos confirmados. 🔴 **Lacuna de PRODUTO, aberta.** O que caducou foi o **bloqueio de prova** que dela derivava (`G-01`) — a feature `009` provou o comportamento sem resolver a fórmula. Ver `_reversa_sdd/gaps.md`.
- ⚠️ **Divergência registrada em 2026-09-24.** A decisão humana (`AMB-001`, `migration/ambiguity_log.md`) registrou "manter `94%` como **constante explícita e tipada** (`TAXA_ATENDIMENTO_MOCK = 94`)". **Não existe símbolo com esse nome em `src/`**: o valor é o literal `value="94%"` em `Dashboard.tsx`. O **comportamento** foi preservado; a **forma decidida** nunca foi implementada. A cláusula de `PT-008.4` que diz "vindo de constante tipada" é **falsa hoje**.

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
