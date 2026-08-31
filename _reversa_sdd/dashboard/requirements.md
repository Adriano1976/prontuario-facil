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
- [Taxa de Atendimento] O valor é atualmente exibido fixo/mockado em "94%". 🔴
- [Próximos Agendamentos] Exibe até 5 agendamentos onde a data é no futuro (maior que a data/hora atual) e o status é diferente de 'cancelado'. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Exibir KPIs numéricos e percentuais | Must | Os valores refletem os dados no banco/API e exibem 94% fixo na taxa |
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
