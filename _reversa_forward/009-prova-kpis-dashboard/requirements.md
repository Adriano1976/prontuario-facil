# Requirements: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Converter os 5 cenários de fluxo de `PT-008` em prova automatizada, e com eles as regras de
indicador-chave (KPI) que o Dashboard declara e ninguém mede. A feature **não altera comportamento de aplicação**: ela
transforma em asserção o que hoje é promessa, e mede o que a página já faz.

A feature também **corrige um bloqueio declarado**. A tabela de destino dos cenários registra o
grupo `08` como dependente da lacuna `G-01` (Taxa de Atendimento, 🔴 em `confidence-report.md`). A
inspeção do código mostra que o bloqueio é **de produto**, não de prova: `PT-008.4` já congela o
valor por decisão humana registrada e `src/pages/Dashboard.tsx:173` já entrega `"94%"`.

Beneficiário imediato: quem mantém a suíte. Beneficiário real: o médico, que depende de KPIs cuja
fidelidade ao legado hoje é apenas uma afirmação.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/migration/parity_tests/08-kpis-dashboard.feature` | Os 5 cenários de `PT-008` a converter, com os critérios de cada KPI | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-027` | Pacientes Ativos = `status == 'ativo'` | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-028` | Agendamentos Hoje = data de hoje E `status != 'cancelado'` | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-029` | Documentos Emitidos = total (até 100) de prescrições | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-030` | Próximos = até 5 futuros com `status != 'cancelado'` | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-033` | Limites de payload 100/50 nas quatro leituras | 🟢 |
| `_reversa_sdd/migration/ambiguity_log.md#AMB-001` | `94%` mantido por paridade exata, como "constante explícita e tipada" | 🟢 |
| `_reversa_sdd/migration/ambiguity_log.md#AMB-002` | Divergência entre "Consultas de Hoje" e "Agendamentos Hoje" **reproduzida**, não corrigida | 🟢 |
| `_reversa_sdd/migration/target_domain_model.md#AGG-Dashboard` | KPIs "com critérios do legado preservados inclusive divergências" | 🟢 |
| `_reversa_sdd/dashboard/requirements.md#Regras de Negócio` | As cinco regras da unit; a Taxa é 🔴 na origem | 🟢 / 🔴 |
| `_reversa_sdd/dashboard/requirements.md#Taxa de Atendimento — decisão pendente` | Fórmula sugerida é **hipótese para validação**, não requisito | 🔴 |
| `_reversa_sdd/flowcharts/dashboard.md#1` | Fluxo de carregamento — **contém uma divergência documental**, ver §10 | 🟡 |
| `_reversa_sdd/migration/target_screens.md` | Pontos de interpolação dos KPIs do alvo | 🟢 |
| `_reversa_sdd/addenda/006-prova-logs-acesso.md` | `PT-007.3` já provado; `Dashboard.tsx` já esteve no perímetro daquela feature | 🟢 |
| `src/pages/Dashboard.tsx` | O objeto da prova, **intocado** por esta feature | 🟢 |
| `src/pages/__tests__/Dashboard.test.tsx` | Harness existente, com 1 verificação | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor do projeto | Rimar a paridade dos KPIs sem rede nem credenciais | Alterar um critério de KPI e ver a suíte acusar |
| Médico (usuário do sistema) | Confiar que o número na tela é o mesmo do legado | Abrir o Dashboard e ler "Pacientes Ativos" |
| Auditor de paridade | Saber quais critérios divergentes foram **reproduzidos de propósito** | Encontrar a divergência de Consultas de Hoje congelada em teste, não em comentário |

## 4. Regras de negócio novas ou alteradas

Esta feature é de **prova**: nenhuma regra de negócio é criada ou alterada. As regras abaixo estão
listadas porque são o **objeto** da medição, e o tipo de cada uma é `preservada`.

1. **RN-01:** Pacientes Ativos conta exclusivamente pacientes com `status == 'ativo'`. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-027`
   - Tipo: preservada
2. **RN-02:** Agendamentos Hoje conta agendamentos cuja data é o dia corrente **e** cujo
   `status != 'cancelado'`. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-028` e
     `_reversa_sdd/domain.md#2.2` (BR-A03)
   - Tipo: preservada
3. **RN-03:** Documentos Emitidos exibe o total de prescrições retornadas, com a leitura limitada a
   100 registros. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-029`
   - Tipo: preservada
4. **RN-04:** Taxa de Atendimento exibe a constante `"94%"`, sem fórmula, sem fonte agregada e sem
   período — paridade exata decidida por humano. 🟢
   - Origem no legado: `_reversa_sdd/migration/ambiguity_log.md#AMB-001`
   - Tipo: preservada — a lacuna de produto permanece aberta em `gaps.md#G-01`
5. **RN-05:** Próximos Agendamentos lista até 5 agendamentos com data futura e
   `status != 'cancelado'`; sem nenhum, exibe estado vazio com atalho de agendamento. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-030`
   - Tipo: preservada
6. **RN-06:** As quatro leituras do Dashboard declaram escopo e limite de payload (100/50/100/100). 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-033`
   - Tipo: preservada
7. **RN-07:** O contador de Consultas de Hoje **inclui** consultas canceladas, divergindo do
   critério de Agendamentos Hoje — divergência preservada por decisão humana. 🟡
   - Origem no legado: `_reversa_sdd/migration/ambiguity_log.md#AMB-002` e `_reversa_sdd/domain.md#3`
   - Tipo: preservada — **com achado**: o contador é calculado e descartado, ver §10

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Provar o KPI Pacientes Ativos | Must | Com massa mista (`ativo` × `inativo`), o cartão "Pacientes Ativos" exibe exatamente a contagem de `ativo` | 🟢 |
| RF-02 | Provar o KPI Agendamentos Hoje | Must | Com massa mista de datas e status, o cartão "Agendamentos Hoje" conta apenas hoje e exclui `cancelado` — e **inclui** `faltou` e `concluido` | 🟢 |
| RF-03 | Provar a divergência de Consultas de Hoje | Must | Com massa mista, a tela exibe exatamente os quatro cartões do legado — nenhum deles um contador de consultas de hoje — e o descarte dos dois agregados de consulta está registrado no artefato de prova | 🟢 |
| RF-04 | Provar a Taxa de Atendimento | Must | O cartão exibe `94%`, nenhuma fórmula é calculada sobre a massa, e nenhum sparkline ou barra é renderizado | 🟢 |
| RF-05 | Provar Próximos Agendamentos | Must | Lista até 5 futuros não cancelados, ignora passados, e exibe "Nenhum agendamento" com botão "Agendar consulta" quando vazia | 🟢 |
| RF-06 | Provar o KPI Documentos Emitidos | Must | Com N prescrições na leitura, o cartão "Documentos Emitidos" exibe N; com nenhuma, exibe zero — nunca vazio ou indefinido | 🟢 |
| RF-07 | Provar os limites de payload | Must | As quatro leituras são emitidas com os limites exatos 100/50/100/100, na ordem de argumentos do contrato | 🟢 |
| RF-08 | Provar a declaração de escopo | Must | As quatro leituras passam pelo método escopado com o escopo resolvido da sessão, não pela leitura crua | 🟢 |
| RF-09 | Registrar o achado da constante ausente | Must | A divergência entre a decisão `AMB-001` ("constante explícita e tipada") e o literal exibido está registrada no artefato de prova | 🟢 |
| RF-10 | Não regredir `PT-007.3` | Must | A verificação existente de auditoria de acesso continua verde, sem reescrita | 🟢 |

> Os critérios de **teto de suíte** e de **perímetro de arquivos** saíram da tabela de requisitos
> funcionais e passaram a **critérios de fechamento**, verificados por comando — ver o fim da §7.
> Eles não são asserções que a suíte executa, e mantê-los como cenários de aceitação criaria
> critérios que nenhum teste mede.

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A suíte completa permanece abaixo do teto de 90 s | Fechamento da feature 008: 74,83 s em 23 arquivos. Esta feature acrescenta verificações a um arquivo que já existe, com dublês — o custo marginal é de milissegundos | 🟢 |
| Manutenibilidade | Nenhuma dependência nova | O arcabouço já existente em `Dashboard.test.tsx` substitui as quatro fontes de dados, o roteamento e o transporte de auditoria | 🟢 |
| Determinismo | Datas de massa derivadas localmente, nunca por construtor de fuso universal | Armadilha medida na feature 003: uma data no formato `AAAA-MM-DD` é interpretada em fuso universal, enquanto os leitores de data são locais. A massa de "hoje" deriva do relógio local com deslocamento explícito | 🟢 |
| Determinismo | O dublê de consulta de dados modela a **cache**, não a renderização | Armadilha medida na feature 006: um dublê que executa a função de consulta a cada renderização conta renderizações, não pedidos, e produz contagem inflada | 🟢 |
| Não-regressão | `Dashboard.test.tsx` mantém suas verificações sem reescrita | Decisão de instrumento da feature 008 (`2a`): citar o que já cobre, criar casos só para as metades descobertas | 🟢 |
| Segurança | A prova não alcança a rede nem grava no provedor | O transporte é substituído; nenhuma credencial é usada | 🟢 |
| Higiene | A guarda de encoding permanece limpa | 442 arquivos íntegros no fechamento da 008; arquivos novos entram no perímetro | 🟢 |
| Rastreabilidade | Cada verificação nomeia o cenário `PT-008.x` ou a regra `BR-MIGRAR-0xx` que prova | Convenção das features 002 a 006 | 🟢 |
| Isolamento | Nenhum arquivo de aplicação é modificado | Mesma disciplina da 008: o perímetro é `src/pages/__tests__/` e, se necessário, `src/test/`. `git status` sobre `src/pages/Dashboard.tsx`, `src/api`, `src/types` e `src/lib` deve ficar vazio | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Pacientes Ativos ignora inativos
  Dado pacientes com status "ativo" e "inativo" no repositório
  Quando o Dashboard carrega
  Então o cartão "Pacientes Ativos" exibe a contagem apenas dos "ativo"

Cenário: Agendamentos Hoje exclui cancelados
  Dado agendamentos de hoje, um deles com status "cancelado"
  Quando o Dashboard carrega
  Então o agendamento cancelado não entra na contagem

Cenário: Agendamentos Hoje não exclui o que não é cancelado
  Dado agendamentos de hoje com status "faltou" e "concluido"
  Quando o Dashboard carrega
  Então ambos entram na contagem — o critério exclui apenas "cancelado"

Cenário: Agendamentos Hoje ignora outra data
  Dado um agendamento de ontem e um de amanhã, ambos não cancelados
  Quando o Dashboard carrega
  Então nenhum dos dois entra na contagem

Cenário: A divergência de Consultas de Hoje não tem superfície
  Dado consultas de hoje, uma delas com status "cancelada"
  Quando o Dashboard carrega
  Então a tela exibe exatamente os quatro cartões do legado
  E nenhum deles é um contador de consultas de hoje
  E o descarte dos agregados de consulta fica registrado no artefato de prova

Cenário: A Taxa de Atendimento é constante
  Dado qualquer massa de pacientes, consultas e agendamentos
  Quando o Dashboard carrega
  Então o cartão "Taxa de Atendimento" exibe "94%"

Cenário: A Taxa de Atendimento não tem fórmula
  Dado uma massa em que uma fórmula plausível daria outro valor
  Quando o Dashboard carrega
  Então o valor exibido continua "94%" — nenhuma agregação é feita

Cenário: Próximos Agendamentos limita a cinco
  Dado seis agendamentos futuros não cancelados
  Quando a lista "Próximos Agendamentos" é montada
  Então exibe exatamente cinco

Cenário: Próximos Agendamentos ignora passado e cancelado
  Dado agendamentos passados e futuros, um futuro cancelado
  Quando a lista é montada
  Então só os futuros não cancelados aparecem

Cenário: Próximos Agendamentos vazio
  Dado nenhum agendamento futuro
  Quando a lista é montada
  Então exibe "Nenhum agendamento" e o atalho "Agendar consulta"

Cenário: As quatro leituras declaram escopo e limite
  Dado o Dashboard carregado
  Quando as leituras são emitidas
  Então cada uma usa o método escopado com o escopo da sessão, e os limites são 100, 50, 100 e 100

Cenário: O acesso ao painel continua auditado
  Dado o Dashboard carregado
  Quando o efeito de montagem roda
  Então exatamente um registro de acesso é gravado — verificação herdada, sem reescrita

Cenário: Documentos Emitidos reflete a leitura de prescrições
  Dado um conjunto de prescrições retornado pela leitura
  Quando o Dashboard carrega
  Então o cartão "Documentos Emitidos" exibe o tamanho do conjunto

Cenário: Documentos Emitidos vazio
  Dado nenhuma prescrição retornada
  Quando o Dashboard carrega
  Então o cartão "Documentos Emitidos" exibe zero, e nunca vazio ou indefinido

Cenário: A divergência entre o decidido e o implementado fica registrada
  Dado que a decisão humana exigiu uma constante nomeada para a Taxa de Atendimento
  Quando a prova de "Taxa de Atendimento" é escrita
  Então a divergência entre o decidido e o implementado está registrada no artefato de prova
```

### Critérios de fechamento

Não são cenários de aceitação: nenhuma verificação da suíte os executa. São medidos **por comando**,
no fechamento da feature, como nas features 002 a 008.

| ID | Critério | Como é medido |
|----|----------|---------------|
| CF-01 | A suíte completa permanece abaixo do teto de 90 s | A duração reportada pela execução completa. Linha de base: 74,83 s no fechamento da feature 008 |
| CF-02 | Nenhum arquivo de aplicação é alterado | Estado do repositório sobre a página do Dashboard e os módulos de contrato, que deve ficar vazio |
| CF-03 | A guarda de encoding permanece limpa | Execução da guarda sobre as raízes de texto, com contagem de arquivos maior que a anterior e zero sequências |

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-05 | Must | São os 5 cenários de fluxo de `PT-008`; a feature existe para eles |
| RF-06 a RF-09 | Must | Escopo confirmado na sessão de esclarecimentos de 2026-09-22: são regras declaradas da mesma superfície, provadas pelo mesmo arcabouço |
| RF-10 | Must | Reescrever a prova de auditoria da 006 destruiria uma decisão de instrumento já tomada |
| CF-01 a CF-03 | Must | Critérios de fechamento, medidos por comando; não entram no custo da suíte |
| RNF de desempenho | Should | O teto já é respeitado hoje; a feature não deve consumi-lo |

## 9. Esclarecimentos

### Sessão 2026-09-22

- **Q:** `PT-008.3` prova uma contagem que a tela não renderiza — os agregados de consulta são
  calculados e descartados. Qual é o instrumento?
  **R:** Provar a **ausência** e registrar o achado (opção `a`). A asserção mede o que existe de
  fato: a tela exibe exatamente os quatro cartões do legado, e nenhum deles é um contador de
  consultas de hoje. O descarte dos dois agregados entra no artefato de prova como achado, não como
  verificação — não há superfície para medir o critério em si.
- **Q:** O quarto KPI ("Documentos Emitidos") e os limites de payload 100/50 declaram regras
  (`BR-MIGRAR-029` e `BR-MIGRAR-033`) que nenhum cenário de `PT-008` nomeia. Entram nesta feature?
  **R:** Sim, os dois (opção `a`). São regras declaradas da mesma superfície, provadas pelo mesmo
  arcabouço. Deixá-las de fora reproduziria exatamente o padrão que este esforço existe para
  eliminar: regra declarada, vigente e não medida. Promovidas a `Must`.
- **Q:** A decisão `AMB-001` exigiu uma constante nomeada e o código tem o literal. O alvo da prova
  é o comportamento ou a forma decidida?
  **R:** O **comportamento** (opção `a`). A prova afirma o valor exibido e registra a divergência
  entre o decidido e o implementado. Exigir a constante aqui converteria uma feature de prova em
  feature de correção, mudando o perímetro para a página do Dashboard — o que contraria a disciplina
  do projeto. O achado fica registrado, com destino na próxima re-extração.
- **Q:** O teto de duração da suíte e a intocabilidade dos arquivos de aplicação são critérios
  medidos por comando, não asserções da suíte. Qual estatuto?
  **R:** Rebaixados a **critérios de fechamento** (opção `a`). Saem da tabela de requisitos
  funcionais e do Gherkin e passam a `CF-01` a `CF-03`, medidos no fechamento como nas features 002
  a 008. Manter cenários de aceitação que nenhum teste executa seria teatro de rastreabilidade.

## 10. Lacunas

Nenhuma dúvida aberta após a sessão de esclarecimentos de 2026-09-22. Permanecem registrados, como
**achados** que a prova mede sem resolver, os pontos abaixo.

**Achados registrados pela prova:**

- 🟡 **O quarto cartão não é uma contagem de consultas — e é visível.** `Dashboard.tsx:164-170`
  renderiza "Documentos Emitidos" com o tamanho da leitura de prescrições, enquanto
  `todayConsultations` e `upcomingConsultations` (`Dashboard.tsx:83-92`) são calculados e
  descartados. A divergência de `AMB-002` está preservada em **código morto**: o critério existe, a
  superfície não. A prova mede a ausência e registra o descarte.
- 🟡 **A constante de `AMB-001` não existe.** A decisão humana registra "manter `94%` como
  **constante explícita e tipada** (`TAXA_ATENDIMENTO_MOCK = 94`)" (`ambiguity_log.md#AMB-001`), mas
  não há nenhum símbolo com esse nome em `src/`: o valor é o literal `value="94%"` em
  `Dashboard.tsx:173`. `PT-008.4` afirma "vindo de constante tipada", e essa metade é **falsa hoje**.
  O alvo da prova é o comportamento; a divergência fica registrada, não corrigida.

Divergências documentais encontradas na coleta de contexto, registradas aqui para não se perderem.
Nenhuma delas é corrigida por esta feature, e todas devem ser resolvidas em `/reversa`:

- `_reversa_sdd/flowcharts/dashboard.md#1` afirma que `todayConsultations` e
  `upcomingConsultations` alimentam a renderização (`I --> N`, `J --> N`) e que os "4 StatsCards"
  recebem `K`, `L` e `M`. As duas primeiras afirmações são **falsas** no código, e a terceira é
  incompleta: o quarto cartão consome prescrições, que não é nó do fluxograma.
- `_reversa_sdd/code-spec-matrix.md#Destino dos cenários` registra o grupo `08` como dependente de
  `G-01`. A dependência é de **produto** (`gaps.md#G-01` pede validação com stakeholder), não de
  prova: `PT-008.4` congela o valor e o código o entrega. O bloqueio está vencido.
- `_reversa_sdd/dashboard/requirements.md:17` marca a Taxa de Atendimento como 🔴, enquanto
  `target_domain_model.md:88` a trata como resolvida (`AMB-001 resolvido`). As duas leituras
  convivem no mesmo corpus sem nota de reconciliação.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-22 | Sessão de esclarecimentos: 4 dúvidas resolvidas; `RF-06` a `RF-09` promovidos a `Must`; `RF-11` e `RF-12` rebaixados a critérios de fechamento `CF-01` a `CF-03`; `PT-008.3` passa a ser provado pela ausência | reversa |
