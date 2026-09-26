# Regression Watch: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Este arquivo é preenchido pelo `/reversa-coding` e lido pelo `/reversa-sync` e por futuras
> re-extrações. Os itens abaixo precisam continuar verdadeiros.

## Watch principal

Regras 🟢 do legado que passam a ser **vigiadas** por esta feature. Uma violação de qualquer uma
delas é uma regressão de paridade, e a suíte acusa.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `parity_tests/08-kpis-dashboard.feature` `PT-008.1`; `target_business_rules.md#BR-MIGRAR-027` | O KPI "Pacientes Ativos" conta exclusivamente pacientes com `status == 'ativo'` | presença | O cartão exibe o total de pacientes, ou conta `inativo` junto |
| W002 | `parity_tests/08-kpis-dashboard.feature` `PT-008.2`; `target_business_rules.md#BR-MIGRAR-028` | O KPI "Agendamentos Hoje" conta agendamentos cuja data é hoje **e** cujo `status != 'cancelado'` | presença | O cancelado passa a contar, ou `faltou`/`concluido` deixam de contar, ou agendamento de outra data entra |
| W003 ⛔ **SUPERADO** | `parity_tests/08-kpis-dashboard.feature` `PT-008.4`; `ambiguity_log.md#AMB-001` | ~~O cartão "Taxa de Atendimento" exibe a constante `"94%"`, sem fórmula, sem fonte agregada e sem indicador de tendência~~ — **superado em 2026-09-25** pela feature `016-taxa-de-atendimento` | presença e redação | ~~O valor deixa de ser `94%`, ou passa a variar com a massa, ou ganha sparkline, barra ou texto de tendência~~ — a violação agora é o inverso: o cartão voltar a exibir valor fixo |
| W004 | `parity_tests/08-kpis-dashboard.feature` `PT-008.5`; `target_business_rules.md#BR-MIGRAR-030` | A lista "Próximos Agendamentos" traz até 5 agendamentos com data futura e `status != 'cancelado'`, e exibe estado vazio com atalho quando não há nenhum | presença | O limite de 5 muda, um cancelado ou um passado aparece, ou o estado vazio deixa de oferecer "Agendar consulta" |
| W005 | `target_business_rules.md#BR-MIGRAR-029` | O KPI "Documentos Emitidos" exibe o tamanho da leitura de prescrições, e zero quando a leitura vem vazia | presença | O cartão passa a contar outra entidade, ou fica em branco com conjunto vazio |
| W006 | `target_business_rules.md#BR-MIGRAR-033` | As quatro leituras declaram o escopo da sessão e são emitidas com os pares de ordenação e limite do legado: `-created_date`/100, `-date`/50, `-created_date`/100, `-date`/100 | presença | Qualquer limite ou ordenação muda, ou uma leitura deixa de declarar escopo |
| W007 | `addenda/006-prova-logs-acesso.md#Vigência`; `parity_tests/07-auditoria-acesso.feature` `PT-007.3` | A montagem do Dashboard grava **exatamente um** registro de auditoria, com `action: 'login'` e `details: 'Acesso ao dashboard'` | presença | A contagem muda, ou a ação muda de `login` para outra — o que exigiria uma ação de painel no enum |

> **W007 é herdado, e continua vigiado por outro arquivo.** A verificação vive em
> `src/pages/__tests__/Dashboard.test.tsx`, criada pela feature 006, e esta feature **não a
> reescreveu** (decisão `2a` da 008, aplicada aqui): reafirmar a cláusula criaria dois pontos de
> verdade para a mesma promessa. O item entra neste watch porque a página é a mesma, e uma quebra
> dele precisa poder ser rastreada até a promessa.
>
> ⛔ **`W003` está superado, por decisão.** A feature `016-taxa-de-atendimento` fechou `G-01` em
> 2026-09-25: a Taxa de Atendimento passou a ser **calculada** sobre os agendamentos com desfecho nos
> últimos 12 meses, e o cenário `PT-008.4` mudou de propósito junto. Isto é o que o `O004` abaixo
> previa — *"se um dia a fórmula real for definida, `W003` deve mudar de propósito, e não por
> acidente"*. Os itens que substituem `W003` estão em
> `_reversa_forward/016-taxa-de-atendimento/regression-watch.md` (`W001` a `W005`). A linha fica aqui,
> riscada, para que a mudança seja rastreável até quem a autorizou.

## Observações

Regras que eram 🟡 ou 🔴 na origem **não entram no watch principal** — elas não têm peso de
regressão. Ficam registradas para que a próxima re-extração saiba onde olhar.

| ID | Origem | O que é | Por que não vigia |
|----|--------|---------|-------------------|
| O001 | `ambiguity_log.md#AMB-002`; `domain.md#3` | O contador de Consultas de Hoje **inclui** consultas canceladas, divergindo do critério de Agendamentos Hoje | A regra é 🟡 na origem, e — mais importante — **não tem superfície**: `Dashboard.tsx:83-92` calcula os dois agregados de consulta e descarta os dois. Não há comportamento observável a regredir |
| O002 | `ambiguity_log.md#AMB-001` | A decisão humana exigiu "constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`)" e o código tem o literal `"94%"` | É uma divergência entre o **decidido** e o **implementado**, não uma regra de negócio. O que a prova trava é o comportamento (W003); a forma decidida nunca existiu |
| O003 | `flowcharts/dashboard.md#1` | O fluxograma afirma que `todayConsultations` e `upcomingConsultations` alimentam a renderização, e atribui os quatro cartões a três nós | Divergência **documental** da extração. Deve ser corrigida numa re-extração, não vigiada aqui |
| O004 | `dashboard/requirements.md#Taxa de Atendimento — decisão pendente`; `gaps.md#G-01` | A fórmula, a fonte e o período da Taxa de Atendimento nunca foram definidos — é lacuna de **produto** | A lacuna segue aberta por decisão humana: a paridade congela `94%`. Se um dia a fórmula real for definida, W003 **deve** mudar de propósito, e não por acidente |
| O005 | `parity_tests/08-kpis-dashboard.feature` `PT-008.5` | A ordenação da lista de Próximos Agendamentos não é enunciada por nenhum cenário | Não é promessa declarada. A prova mede pertinência e cardinalidade; o truncamento em `slice(0,5)` é client-side sobre a ordem que o servidor devolve |
| O006 | `dashboard/requirements.md#NFR` | A aba "Relatórios" (`ReportsView`) não tem prova nenhuma | Fora do escopo desta feature e de todos os cenários de `PT-008`. Permanece sem dono |

## Histórico de re-extrações

| Data | Re-extração | Resultado |
|------|-------------|-----------|
| — | — | Ainda não houve re-extração após esta feature |

## Arquivadas

| ID | Motivo do arquivamento | Data |
|----|------------------------|------|
| — | — | — |

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial — 7 itens no watch principal e 6 observações | reversa |
