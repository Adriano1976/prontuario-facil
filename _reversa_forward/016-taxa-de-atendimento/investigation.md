# Investigation: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Requirements: `_reversa_forward/016-taxa-de-atendimento/requirements.md`

## 1. Pergunta de investigação

`G-01` afirma que a Taxa de Atendimento não tem fórmula, fonte nem período. Antes de escolher
qualquer uma das três, era preciso responder: **o que o projeto já tem pronto para sustentar esse
número, e o que ele obriga a fazer de um jeito específico?** O que segue é a medição, não a opinião.

## 2. O que já existe no projeto — medido em 2026-09-25

| Precedente | Onde | O que ele fixa |
|---|---|---|
| Cálculo percentual em tela | `src/components/medical/ReportsView.tsx:239` — `Math.round((item.count / totalConsultations) * 100)` | É o **único** cálculo percentual do projeto. Fixa o arredondamento: inteiro por `Math.round` |
| Janela de 12 meses | `src/components/medical/ReportsView.tsx:88-95`; `_reversa_sdd/code-analysis.md#4.2` | A janela é aplicada no **cliente**, com `isAfter(data, subMonths(agora, 12))`, e a borda é estrita |
| Leitura de `Appointment` filtrada por status | `src/components/medical/ReportsView.tsx:63-68` | `filterOwned(escopo, { status: 'concluido' }, '-date', 500)` — o padrão para ler desfecho |
| Leitura de `Appointment` **sem limite** | `src/pages/Appointments.tsx:65` — `listOwned(resolveScope(user), '-date')` | Um histórico inteiro de agendamentos já é lido sem teto nesta aplicação |
| Escopo resolvido por papel | `src/api/sessionScope.ts:38-46` (`resolveScope`) vs `:55-57` (`asUserScope`) | `resolveScope` devolve escopo administrativo para admin; o Dashboard usa essa forma nas quatro leituras |
| Contrato de filtro | `src/types/common.ts:52` — `FilterConditions<T> = Partial<{ [K in keyof T]: T[K] }>` | Aceita **um valor exato por campo**. Não há operador de intervalo nem lista de valores |
| Superfície do leitor escopado | `src/api/scopedRead.ts:41-71` | `listOwned(scope, sort?, limit?)` aceita escopo administrativo; `filterOwned` exige `UserScope` |
| Armadilha de cache | `_reversa_sdd/code-analysis.md:1467` | Chaves iguais com dados diferentes (`['patients']` com limites distintos em duas telas) — risco já registrado pelo Archaeologist |
| Cartão de KPI | `src/components/medical/StatsCard.tsx:14-27`, `:56-61` | Aceita `title`, `value`, `icon`, `color`, `trend?`, `delay?`. Já renderiza uma linha sob o valor quando `trend` é informado |

## 3. Alternativas avaliadas

### 3.1 Definição do indicador

| Candidata | Numerador ÷ denominador | O que mede | Problema |
|---|---|---|---|
| (a) | `concluido` ÷ (`concluido` + `cancelado` + `faltou`) | Comparecimento sobre desfecho | Mistura cancelamento com falta: quem avisa que não vem derruba a taxa igual a quem some |
| (b) | `concluido` ÷ todos os agendamentos da janela | Adesão à agenda | A taxa cai enquanto o dia não termina; um painel lido às 8h mostra quase zero por razão que não é comportamento de ninguém |
| **(c)** | `concluido` ÷ (`concluido` + `faltou`) | Comparecimento sobre desfecho, com cancelamento fora | **Escolhida.** Separa o que o paciente avisou do que ele simplesmente não fez |
| (d) | (`concluido` + `em_atendimento`) ÷ desfechos | Atendimento realizado | Conta como realizado um atendimento que ainda pode ser cancelado; o número muda sozinho durante a consulta |

A distinção de (c) não é invenção local: em relatórios de serviço de saúde, quem avisa com
antecedência e quem não comparece são **indicadores separados** — ver `#6. Fontes externas`. `AMB-002`
já registrava que o legado mistura critérios entre KPIs do mesmo painel; (c) é a única candidata que
não repete esse erro dentro do próprio cartão.

### 3.2 Fonte

| Candidata | Vantagem | Problema medido |
|---|---|---|
| **(a) `Appointment`** | Tem os seis estados, inclusive `faltou`; é a agenda, que é o que "atendimento" significa aqui | Só muda por ação manual (`Appointments.tsx:86`) — mede marcação, não comparecimento |
| (b) `Consultation` | Acompanha o ato clínico | **Não tem estado de falta** (`ConsultationStatus` = `agendada`, `em_andamento`, `concluida`, `cancelada`). Não há como expressar ausência |
| (c) Híbrido | Presenças do prontuário, faltas da agenda | Duas leituras de entidades diferentes sob a mesma razão; numerador e denominador passariam a ter fontes distintas, e a divergência entre elas viraria erro silencioso |
| (d) `Appointment` + sincronia automática | Ataca a causa | Altera comportamento congelado por `AMB-003` e mexe em `NewConsultation.tsx`; escopo muito além de `G-01` |

O defeito de (a) é real e foi **aceito com os olhos abertos**: `NewConsultation.tsx` não referencia
`Appointment`, de modo que concluir uma consulta não marca o agendamento. A taxa mede, portanto,
desfecho **registrado**. Isso está declarado em `requirements.md#2.1`, no `roadmap.md#9` e no
`onboarding.md` — não é surpresa para quem operar o painel.

### 3.3 Período

Hoje foi descartado por instabilidade: de manhã o indicador mostraria um número sobre um dia que ainda
não aconteceu. "Desde sempre" foi descartado porque exige abandonar qualquer teto de leitura e porque
um percentual que nunca se move deixa de ser indicador. 30 dias foi descartado por não ter precedente
no projeto. **12 meses** foi escolhido por já ser a janela que os Relatórios usam — o mesmo painel, a
mesma entidade, a mesma borda.

### 3.4 Estratégia de leitura

| Candidata | Veredito |
|---|---|
| Uma `listOwned(resolveScope(user))` sem limite | **Escolhida** (`D-04`): uma viagem, escopo idêntico ao dos quatro cartões vizinhos, sem limite → janela íntegra |
| Duas `filterOwned` (`concluido` e `faltou`) | Descartada: `filterOwned` exige `UserScope`, então o cartão passaria a descrever a população do próprio usuário enquanto os vizinhos descrevem a do escopo resolvido — para um admin, cinco números no mesmo painel falariam de populações diferentes |
| Uma `filterOwned` com dois status | **Impossível hoje**: `FilterConditions<T>` aceita um valor exato por campo |
| Uma `filterOwned` com intervalo de datas | **Impossível hoje**: mesmo motivo. É por isso que `ReportsView` filtra a janela no cliente |

### 3.5 Onde o cálculo vive

Inline no `Dashboard` foi descartado: a fórmula precisa ser provada sem renderizar página, e `RN-08`
pede símbolo nomeado depois de `AMB-001` ter decidido exatamente isso e nunca ter sido implementado.

## 4. Armadilhas que a prova herda, e como cada uma é evitada

| Armadilha | Medida em | Como a prova desta feature evita |
|---|---|---|
| `new Date('2026-09-22')` é interpretado em **UTC** enquanto as comparações do Dashboard são locais | feature `003`; cabeçalho de `src/test/dashboardFixtures.ts` | Datas derivadas do relógio com deslocamento em **dias**, pelo mesmo módulo de massa |
| Folga em minutos torna "futuro" instável durante a execução | `src/test/dashboardFixtures.ts` | Folga em dias, herdada |
| Dublê de consulta conta renderizações em vez de pedidos | feature `006` — contagem 6× maior que o real | O dublê da suíte de KPIs já modela cache por chave |
| Dublar `resolveScope` faria a verificação de escopo comparar o dublê consigo mesmo | feature `005` | A suíte de KPIs não dubla `toSessionUser` nem `resolveScope` |
| **Novo:** o dublê de `Appointment.listOwned` é um só e serve às duas leituras | esta feature | A prova distingue **pelos argumentos** da chamada: a leitura nova é a que não tem terceiro argumento |
| **Novo:** uma leitura limitada a 100 produziria um percentual plausível e errado | esta feature | A massa de prova usa mais de 100 desfechos, de modo que o truncamento muda o valor exibido |
| **Novo:** o leitor estrutural do cartão ancora em `<p>título</p><p>valor</p>` | `DashboardKpis.test.tsx:66-68` | O subtítulo entra **depois** do valor, e o auxiliar de leitura continua ancorando no primeiro `<p>` de cada cartão |

## 5. Padrões aplicáveis

- **Função pura com sentinela explícita** (`number | null`) em vez de codificar a ausência num número.
  É o que permite `—` e `0%` significarem coisas diferentes sem `if` espalhado na JSX.
- **Escopo obrigatório na leitura** (`BR-MIGRAR-034`, camada de `scopedRead.ts`): a leitura nova nasce
  conforme a regra, não como exceção.
- **Chave de cache própria por forma de leitura**, conforme a armadilha registrada pelo Archaeologist.
- **Constante nomeada para o que era literal**: é a reparação de `O002`, e o mesmo movimento que a
  feature `015` fez ao nomear `CREDENCIAIS_DE_SESSAO`.

## 6. Fontes externas

Consultadas **apenas no nível do resumo de busca**, não lidas na íntegra — servem para confirmar que a
distinção de `RN-02` é terminologia corrente, e não uma invenção desta feature:

- Relatórios anuais do serviço de saúde da Irlanda do Norte separam explicitamente **CNA** ("could not
  attend, and gave advance warning") de **DNA** ("did not attend") como indicadores distintos —
  [mhld-annual-report-2012-13](https://www.health-ni.gov.uk/sites/default/files/publications/dhssps/mhld-annual-report-2012-13.pdf),
  [mhld-annual-report-2014-15](https://www.health-ni.gov.uk/sites/default/files/publications/dhssps/mhld-annual-report-2014-15.pdf).
- "No-show" é tratado como KPI de agenda em material de gestão de consultórios, com o denominador
  sendo os agendamentos que **deveriam** ter acontecido —
  [AAMC/Vizient no-show snapshot](https://www.clinicalpracticesolutionscenter.org/-/media/cpsc/documents/cpscsharepointdocuments/public/aamc_vizient_data_snapshot_no_shows_2022.pdf),
  [KPI dashboard para clínicas](https://help.booxi.com/en/articles/11879101-kpi-analytics-dashboard).

Nenhuma dessas fontes define a fórmula deste projeto: a fórmula foi decidida pelo dono do produto em
`requirements.md#9. Esclarecimentos`. As fontes só confirmam que separar cancelamento de falta é a
prática, e não um capricho.

## 7. O que a investigação **não** resolveu

- **Se o número será útil na prática.** Ele depende de alguém marcar `concluido`/`faltou` na tela de
  Agendamentos. Se a clínica não marcar, a taxa afunda sem que ninguém tenha faltado. Nenhuma decisão
  desta feature corrige isso — a correção seria a sincronia automática do fluxo 4, recusada em `D-02`.
- **Se um admin deveria ver a taxa da clínica inteira ou só a própria.** `D-04` alinha o cartão aos
  vizinhos (`resolveScope`), mas o `ReportsView`, na outra aba da mesma página, usa `asUserScope` —
  divergência **pré-existente**, não criada aqui. Se for indesejada, é assunto de outra feature.
