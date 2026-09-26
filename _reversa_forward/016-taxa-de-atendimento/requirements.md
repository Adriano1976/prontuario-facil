# Requirements: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O quarto cartão do Dashboard exibe `94%`: um literal na JSX (`Dashboard.tsx:173`), sem fórmula, sem
fonte e sem período. A extração o classificou como métrica **decorativa**
(`_reversa_sdd/code-analysis.md#4.5`) e a decisão humana de 2026-09-09
(`_reversa_sdd/migration/ambiguity_log.md#AMB-001`) determinou preservá-lo como constante tipada
`TAXA_ATENDIMENTO_MOCK = 94` — símbolo que **nunca existiu no código**, divergência registrada como
`O002` no watch da feature `009`.

Esta feature fecha `G-01`: o indicador passa a ser **calculado** — comparecimento sobre desfechos
conhecidos, lido de `Appointment`, na janela de 12 meses — e o cartão passa a exibir sob o valor o
período a que o número se refere. É a primeira entrega do projeto que **rompe a paridade de
propósito** para atender uma lacuna declarada de produto, e a única forma de fechar `G-01`. As três
decisões de produto foram tomadas em 2026-09-25 e estão registradas em `#9. Esclarecimentos`.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#4.5 Valor Fixo de Taxa de Atendimento` | "`value="94%"` hardcoded — métrica decorativa sem cálculo real 🔴" | 🟢 |
| `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | `BR-D08` — "Taxa de Atendimento fixa 94% (decorativa)" | 🟢 |
| `_reversa_sdd/code-analysis.md#5.1 Entidades Consumidas` | `Appointment` já é lida pelo Dashboard (limite 100) e pelos Relatórios (limite 500) | 🟢 |
| `_reversa_sdd/code-analysis.md#4.2 Janela Móvel de 12 Meses` | Os Relatórios já operam numa janela de 12 meses sobre `Appointment`, com borda estrita | 🟢 |
| `_reversa_sdd/dashboard/requirements.md#Regras de Negócio` | A regra da taxa é a única 🔴 das cinco do Dashboard | 🟢 |
| `_reversa_sdd/dashboard/requirements.md#Taxa de Atendimento — decisão pendente` | Fórmula sugerida, entidade e período eram **hipóteses para validação**, não requisitos | 🟢 |
| `_reversa_sdd/gaps.md#Lacunas abertas` | `G-01` 🔴 — "fórmula, fonte e período não foram definidos" | 🟢 |
| `_reversa_sdd/migration/ambiguity_log.md#AMB-001` | Decisão de paridade + `TAXA_ATENDIMENTO_MOCK = 94`, com a fórmula real adiada para "fase posterior" | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-HUMANA-001` | A opção "definir fórmula" foi descartada **por escopo da migração**, não por ser indesejada | 🟢 |
| `_reversa_sdd/domain.md#2.2 Agendamentos e Consultas` | `BR-A03` — o Dashboard exclui `cancelados` das contagens de "hoje" e "próximos" | 🟢 |
| `_reversa_sdd/domain.md#2.2 Agendamentos e Consultas` | `BR-A02` 🟡 — "ao concluir uma consulta, o agendamento correspondente deve ser marcado `concluido`" (**inferida**, marcação manual) | 🟡 |
| `_reversa_sdd/architecture.md#1. Visão Resumida` | Fluxo 4 — "Médico marca `Consultation` como `concluida` → `Appointment` atualizado para `concluido`" | 🟡 |
| `_reversa_sdd/addenda/009-prova-kpis-dashboard.md#Regras sob vigilância` | `W003` congela `94%` e a ausência de tendência; `O004` manda `W003` mudar de propósito se a fórmula for definida | 🟢 |
| `.reversa/reversa-config.json` | `src/**` liberado para edição (`allowLegacyEdits: true`) | 🟢 |

### 2.1 Correção de leitura: o fluxo 4 da arquitetura não está implementado

`architecture.md` descreve que concluir a consulta atualiza o agendamento. **O código não faz isso.**
Medido em 2026-09-25:

- `src/pages/Appointments.tsx:86` — `base44.entities.Appointment.update(scope, id, { status })` é a
  **única** escrita de status de agendamento no projeto, e nasce de ação manual na tela de Agendamentos.
- `src/pages/NewConsultation.tsx` **não referencia `Appointment`** em nenhum ponto.
- `src/components/medical/ReportsView.tsx:63` apenas **lê** `status: 'concluido'`.

Consequência para esta feature: `Appointment.status === 'concluido'` depende de alguém marcar a agenda
à mão. O fluxo 4 é a intenção do domínio, não o comportamento medido — que é exatamente o que
`BR-A02` (🟡) e `AMB-003` já registravam.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico (dono dos dados) | Saber, de relance no painel, que fração dos atendimentos agendados se concretizou | Abre o Dashboard e lê o cartão "Taxa de Atendimento" |
| Gestor da clínica | Acompanhar adesão à agenda (faltas e cancelamentos) sem abrir relatório | Compara a taxa entre duas visitas ao painel |
| Desenvolvedor / auditor | Confiar que o número exibido tem origem rastreável, e não é um literal | Confere a fórmula e a janela na spec e na prova |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O valor exibido no cartão "Taxa de Atendimento" passa a ser **calculado** a partir dos
   dados do próprio usuário. A constante `94%` deixa de existir em qualquer forma — inclusive como
   fallback. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#4.5` (`BR-D08`, métrica decorativa)
   - Tipo: nova (substitui a regra 🔴 de `dashboard/requirements.md#Regras de Negócio`)
2. **RN-02:** **Definição do indicador.** Numerador = agendamentos com `status = 'concluido'`.
   Denominador = `concluido + faltou`. `cancelado` fica **fora das duas contas** — um cancelamento não
   é presença nem falta. Os estados sem desfecho (`agendado`, `confirmado`, `em_atendimento`) também
   ficam fora das duas contas, de modo que a taxa mede **comparecimento sobre desfecho conhecido**. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.2 Agendamentos e Consultas` — `AppointmentStatus` é
     conjunto fechado de seis valores
   - Tipo: nova (decidida em 2026-09-25 — `#9. Esclarecimentos`, Q1)
3. **RN-03:** O percentual é **inteiro**, arredondado por `Math.round`, e exibido com o sufixo `%`. 🟢
   - Precedente medido: `src/components/medical/ReportsView.tsx:239` —
     `Math.round((item.count / totalConsultations) * 100)`, o único cálculo percentual em tela no projeto
   - Tipo: nova
4. **RN-04:** A fonte é a entidade **`Appointment`** (a agenda), e não `Consultation`. A leitura
   **declara o escopo da sessão** (`filterOwned`/`listOwned` com o escopo resolvido), como todas as
   leituras do Dashboard já fazem. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-034`; decisão em
     `#9. Esclarecimentos`, Q2
   - Tipo: nova
5. **RN-05:** **Janela de 12 meses**, aplicada igualmente ao numerador e ao denominador: entra o
   agendamento cujo `date` é estritamente posterior a `subMonths(agora, 12)`. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#4.2 Janela Móvel de 12 Meses` — a mesma
     semântica dos Relatórios, inclusive a borda: um agendamento **exatamente na marca de 12 meses
     fica fora**, porque a comparação é estrita. (`code-analysis.md#4.2` diz "entra" no mesmo
     parêntese em que descreve "`isAfter` estrito > `cutoff`" — as duas afirmações se contradizem, e
     vale a comparação, que é a que o código executa.)
   - Tipo: nova (decidida em 2026-09-25 — `#9. Esclarecimentos`, Q3)
6. **RN-06:** Quando o **denominador é zero** — nenhum agendamento com desfecho na janela —, o cartão
   exibe `—` acompanhado do texto **"sem agendamentos com desfecho no período"**, e não `0%`. 🟢
   - Fundamento: `0%` afirmaria o fato "nenhum atendimento se concretizou", que uma base vazia não
     sustenta. O texto descreve o **denominador** (`concluido + faltou`), e não "agendamentos" em
     geral: uma janela pode ter agendamentos e ainda assim nenhum desfecho, e nesse caso dizer "sem
     agendamentos no período" seria falso.
   - Tipo: nova (decidida em 2026-09-25 — `#9. Esclarecimentos`, Q4, com a redação ajustada)
7. **RN-07:** O cartão passa a exibir, **sob o valor**, o subtítulo **"últimos 12 meses"**, que nomeia
   a janela de RN-05. 🟢
   - Fundamento: um percentual sem janela é ambíguo para quem lê, e o valor passou a depender do
     período — a tela precisa dizer qual.
   - Tipo: nova (decidida em 2026-09-25 — `#9. Esclarecimentos`, Q5). **Altera a superfície de
     propósito** — ver RN-09.
8. **RN-08:** O indicador é produzido por **símbolos nomeados e testáveis** — a função pura de cálculo
   e a constante do subtítulo — e não por literal na JSX. 🟢
   - Origem no legado: `_reversa_sdd/migration/ambiguity_log.md#AMB-001` (forma decidida e nunca
     implementada; `O002`)
   - Tipo: alterada (repara a divergência entre o decidido e o implementado)
9. **RN-09:** O rótulo "Taxa de Atendimento", a posição do cartão (quarto) e a cor `amber` **não
   mudam**. A única alteração de superfície é o subtítulo de RN-07, e ela é deliberada. 🟢
   - Tipo: alterada (preservação explícita de superfície, com a exceção declarada)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Exibir a Taxa de Atendimento **calculada** | Must | Com massa conhecida, o valor é `Math.round(concluidos / (concluidos + faltas) * 100)` com o sufixo `%` | 🟢 |
| RF-02 | Aplicar a **mesma janela** a numerador e denominador | Must | Nenhum agendamento com `date` anterior ou igual a `subMonths(agora, 12)` influencia qualquer das duas contas | 🟢 |
| RF-03 | Distinguir "sem base" de "zero por cento" | Should | Denominador zero exibe `—` e "sem agendamentos com desfecho no período"; denominador não-zero com nenhum concluído exibe `0%` | 🟢 |
| RF-04 | **Não** introduzir tendência nem indicador de variação | Must | Nenhum dos quatro cartões exibe variação percentual ("+N% este mês"), antes ou depois desta feature | 🟢 |
| RF-05 | Manter rótulo e posição, e acrescentar o subtítulo da janela | Must | O quarto cartão continua "Taxa de Atendimento", cor `amber`, e exibe "últimos 12 meses" sob o valor | 🟢 |
| RF-06 | Não quebrar os outros três KPIs | Must | Pacientes Ativos, Agendamentos Hoje e Documentos Emitidos exibem os mesmos valores de antes | 🟢 |
| RF-07 | Excluir cancelamentos das duas contas | Must | Acrescentar agendamentos `cancelado` dentro da janela não altera o valor exibido | 🟢 |

> **Ancoragem de RF-04:** o cartão de estatística aceita uma variação percentual opcional
> (`trend?: number` em `src/components/medical/StatsCard.tsx:24`, renderizada como "+N% este mês").
> Nenhum dos quatro cartões do Dashboard a utiliza hoje, e esta feature não introduz o primeiro uso:
> o mecanismo existe, a decisão é não acioná-lo. O subtítulo de RN-07 é texto próprio, não a variação.

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | A leitura declara o escopo da sessão; nenhuma leitura global | `BR-MIGRAR-034`; padrão "PARIDADE DE LEITURA" das features `011`–`015` | 🟢 |
| Privacidade | O indicador é **agregado**: nenhum dado identificável de paciente entra na tela nem no cálculo | LGPD (Lei Geral de Proteção de Dados); o cartão exibe apenas um percentual | 🟢 |
| Desempenho | A janela de 12 meses é considerada **integralmente**: nenhum registro dela pode ser descartado por limite de leitura. Os limites existentes (100 no Dashboard, 500 nos Relatórios) são insuficientes e truncariam o número em silêncio | Precedente de leitura sem limite fixo já existe no projeto: `src/pages/Appointments.tsx:65` — `listOwned(resolveScope(user), '-date')` | 🟢 |
| Integridade | O indicador nunca é apresentado como exato sobre uma janela truncada; se a leitura for limitada, o limite é declarado na prova | `BR-D09` registra o mesmo defeito em "Documentos Emitidos" (contagem das últimas 100 prescrições, não o total) | 🟢 |
| Manutenibilidade | O cálculo é função pura, exportada e exercitada por prova própria | `AMB-001`/`O002`; evita reincidir em literal solto | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Taxa calculada sobre desfechos conhecidos
  Dado um usuário com 7 agendamentos concluídos e 3 com falta nos últimos 12 meses
  Quando ele abre o Dashboard
  Então o cartão "Taxa de Atendimento" exibe "70%"

Cenário: Cancelamento fica fora das duas contas
  Dado o mesmo usuário, com 5 agendamentos cancelados acrescentados à massa
  Quando ele abre o Dashboard
  Então o cartão continua exibindo "70%"

Cenário: Estados sem desfecho ficam fora das duas contas
  Dado um usuário com 1 concluído, 1 falta e 8 agendamentos ainda agendados ou confirmados
  Quando ele abre o Dashboard
  Então o cartão exibe "50%"

Cenário: Mesma janela no numerador e no denominador
  Dado um usuário com desfechos dentro e fora dos últimos 12 meses
  Quando a taxa é calculada
  Então os agendamentos fora da janela não influenciam nem o numerador nem o denominador
  E um agendamento exatamente na marca de 12 meses fica fora da janela

Cenário: Denominador zero
  Dado um usuário sem nenhum agendamento concluído ou com falta na janela, mas com agendamentos futuros
  Quando ele abre o Dashboard
  Então o cartão exibe "—" e "sem agendamentos com desfecho no período"
  E não exibe "0%"

Cenário: Denominador não-zero e nenhum atendido
  Dado um usuário com 3 faltas e nenhum concluído na janela
  Quando ele abre o Dashboard
  Então o cartão exibe "0%"

Cenário: Subtítulo nomeia a janela
  Dado que o Dashboard foi aberto
  Então o cartão "Taxa de Atendimento" exibe "últimos 12 meses" sob o valor

Cenário: Sem tendência
  Dado que o Dashboard foi aberto
  Quando os cartões são renderizados
  Então nenhum cartão exibe o texto "este mês"

Cenário: Rótulo e posição preservados
  Dado que o Dashboard foi aberto
  Quando os quatro cartões de KPI são renderizados
  Então o quarto cartão tem o título "Taxa de Atendimento"

Cenário: Os outros três KPIs não mudam
  Dado um usuário com pacientes, agendamentos e prescrições de valores conhecidos
  Quando ele abre o Dashboard
  Então "Pacientes Ativos", "Agendamentos Hoje" e "Documentos Emitidos" exibem os mesmos valores de antes desta feature

Cenário: Escopo declarado na leitura
  Dado um usuário autenticado não-admin
  Quando o indicador é calculado
  Então a leitura foi feita com o escopo do próprio usuário
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É a entrega; sem ela a lacuna não fecha |
| RF-02 | Must | Janela inconsistente produz um número errado sem sintoma visível |
| RF-06 | Must | O cartão é um dos quatro; regressão nos outros três é inaceitável |
| RF-07 | Must | Sem excluir cancelamento, o número contradiz a definição decidida em Q1 |
| RF-05 | Must | Superfície preservada, com a única exceção declarada (o subtítulo) |
| RF-04 | Must | Impede o escopo de crescer para "indicador com tendência" sem decisão |
| RF-03 | Should | Melhora a honestidade do número, mas não bloqueia a entrega |
| RNF de integridade | Must | Um número truncado em silêncio é pior que o `94%` decorativo |

## 9. Esclarecimentos

### Sessão 2026-09-25

Cinco perguntas, respondidas antes do plano. As três primeiras resolvem os marcadores de dúvida da
versão inicial; as duas últimas decidem estado vazio e superfície.

- **Q:** O que o indicador mede — quem entra no numerador e no denominador?
  **R:** Alternativa **(c)** — `concluido` ÷ (`concluido` + `faltou`). Cancelamento sai das duas contas
  por não ser falta de ninguém; os estados sem desfecho (`agendado`, `confirmado`, `em_atendimento`)
  também saem, de modo que a taxa mede comparecimento sobre desfecho conhecido. → `RN-02`
- **Q:** De onde o número é lido?
  **R:** Alternativa **(a)** — `Appointment`, a agenda. `Consultation` foi descartada por não ter
  estado `faltou`: sem falta não há como separar comparecimento de ausência. A alternativa que
  implementava junto a sincronia automática do fluxo 4 foi recusada, preservando o congelamento de
  `AMB-003`. → `RN-04`
- **Q:** Qual janela de tempo?
  **R:** Alternativa **(c)** — últimos **12 meses**, a mesma janela que os Relatórios já usam, com a
  mesma borda estrita de `code-analysis.md#4.2`. → `RN-05`
- **Q:** Janela sem nenhum agendamento decidido — o cartão mostra o quê?
  **R:** Alternativa **(d)** — `—` acompanhado de texto explicativo. **A redação foi ajustada** de
  "sem agendamentos no período" para **"sem agendamentos com desfecho no período"**: com a definição
  de Q1, o denominador são os desfechos, não os agendamentos — uma janela pode ter agendamentos e
  nenhum desfecho, e a redação original afirmaria um fato falso nesse caso. A intenção da resposta
  (não mostrar `0%`, e explicar por quê) está preservada. → `RN-06`
- **Q:** O cartão passa a dizer sobre que período a taxa foi calculada?
  **R:** Alternativa **(b)** — subtítulo discreto sob o valor: "últimos 12 meses". → `RN-07`

#### Decisões derivadas — não perguntadas, e por quê

- **Arredondamento:** `Math.round`, percentual inteiro. Não foi perguntado porque o projeto tem um
  único cálculo percentual em tela (`ReportsView.tsx:239`) e a consistência com ele é a resposta.
  → `RN-03`
- **Leitura sem limite fixo:** a janela de 12 meses não cabe com garantia nos limites existentes
  (100 no Dashboard, 500 nos Relatórios), e truncá-la produziria um número errado sem sintoma. O
  projeto já lê agendamentos sem limite em `Appointments.tsx:65`. Não foi perguntado porque decorre do
  RNF de integridade já declarado. → `#6. Requisitos Não Funcionais`
- **Estado durante o carregamento:** enquanto a leitura não responde, o cartão exibe o mesmo `—` de
  `RN-06`, e não `0%`. Decorre de `RN-06`; não é decisão nova.

## 10. Lacunas

Nenhuma lacuna aberta. Os três marcadores de dúvida da versão inicial foram resolvidos na sessão de
2026-09-25:

| Marcador resolvido | Resposta | Regra |
|--------------------|----------|-------|
| Definição do indicador | `concluido` ÷ (`concluido` + `faltou`); `cancelado` e estados sem desfecho fora das duas contas | `RN-02` |
| Fonte | `Appointment` (a agenda), com escopo de sessão declarado | `RN-04` |
| Período | 12 meses, borda estrita (`date > subMonths(agora, 12)`) | `RN-05` |

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-25 | Sessão de esclarecimentos: Q1–Q5 respondidas, 3 marcadores de dúvida resolvidos, `RN-01`…`RN-09` fixadas, superfície ganha subtítulo por decisão | reversa |

## Pendências de Qualidade

Ressalvas da auto-validação contra `.reversa/templates/quality-template.md`, após as três iterações
previstas pelo `/reversa-requirements`:

- **Q-019 / Q-020 (Princípios) — não avaliáveis.** O checklist manda confrontar cada Regra de Negócio
  com os princípios ativos em `.reversa/principles.md`, mas **esse arquivo não existe** no projeto,
  embora `.reversa/setup.json` declare `principles.enabled: true` com `auto-load-into-plan: true`.
  As nove regras desta feature **não** foram confrontadas com princípio algum, porque não há princípio
  registrado a confrontar. Registrado aqui para que o `/reversa-plan` não tropece na ausência em
  silêncio.
- **Reprovações corrigidas na geração inicial** (registradas para não se perderem): `Q-010` — `RF-05` e
  `RF-06` não tinham cenário Gherkin; `Q-016` — `LGPD` aparecia sem expansão na primeira ocorrência;
  `Q-017` — o critério de `RF-04` prescrevia o mecanismo em vez do observável.
