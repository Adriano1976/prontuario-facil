# Investigation: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Documento de fundo do `roadmap.md`. Registra o que foi pesquisado, o que foi avaliado e
> o que foi descartado — inclusive o que foi descartado por decisão, não por mérito.

## 1. Ponto de partida medido

| Métrica | Valor | Como foi medido |
|---------|-------|-----------------|
| Arquivos de prova antes desta feature | 10 | `src/**/*.test.ts(x)` |
| Verificações antes desta feature | 36 | contagem de `it`/`test` por arquivo |
| Duração da suíte | 32,54 s | execução de 2026-09-19 |
| Verificações do módulo de Agendamentos | **0** | nenhum arquivo de prova cobre as telas ou os componentes do módulo |
| Cenários de paridade do módulo | 8 (4 de jornada, 4 de ciclo de status) | `parity_tests/03-*.feature` e `04-*.feature` |
| Lacunas documentadas do módulo | 10, sendo 2 de severidade Alta | `_reversa_sdd/code-analysis.md#9` |

O módulo aparece em exatamente uma prova hoje — `ActivePatientSelection.test.tsx` — e
apenas pelo aspecto de seleção de paciente ativo, que pertence ao módulo Pacientes. O
fluxo próprio do módulo não tem nenhuma verificação.

## 2. Onde cada promessa de fato vive

Esta foi a descoberta que estruturou o plano. O módulo tem três superfícies com naturezas
muito diferentes, e provar no lugar errado custa caro:

| Superfície | Natureza | Custo de prova | O que prova |
|------------|----------|----------------|-------------|
| `TimeSlotPicker.tsx` | **Função pura** dentro de um componente: recebe médico, data e agendamentos por prop, não consulta nada, não usa roteador | **Baixo** | Jornada, duração, conflito e os casos de borda — 7 dos 20 cenários de aceite |
| `Appointments.tsx` | Tela com consultas, diálogo e seletor | Médio | O ciclo de status e a ausência de gatilho automático — 4 cenários |
| `NewAppointment.tsx` | Tela com consultas, calendário de terceiro e envio de e-mail | Alto | A criação e a ordem entre envio e gravação — 2 cenários |

Duas funções internas do componente de horário concentram a regra do módulo:
`generateTimeSlots` (o que existe) e `isSlotAvailable` (o que está livre). Nenhuma delas é
exportada, e extraí-las seria mudança de estrutura — proibida pela RN-06. Renderizar o
componente é o caminho que as alcança sem tocar no código.

## 3. Achados durante a investigação

### 3.1 O horário indisponível não é "rejeitado" — são três comportamentos

O cenário PT-003 afirma que o horário inválido "é rejeitado com indicação de horário
indisponível". O código faz três coisas diferentes, e nenhuma delas é recusar:

| Situação | O que o código faz |
|----------|--------------------|
| Fora da jornada, dia fora dos dias de trabalho, horário que não cabe na duração | O horário **não é gerado** — não chega a existir na lista |
| Horário ocupado por outro agendamento | O horário **é gerado e renderizado desabilitado**, com opacidade reduzida |
| Dia inteiro sem horário gerado | A tela exibe a mensagem **"Médico não atende neste dia"** |
| Qualquer caso, no salvamento | **Nada é validado**: o botão de salvar exige apenas paciente, médico e data |

A redação do cenário e o comportamento não são a mesma coisa. Provar a redação seria
provar algo falso. Decisão da sessão de 2026-09-19: provar o comportamento fiel e declarar
a imprecisão do cenário.

### 3.2 Duas noções de disponibilidade convivem no módulo

`AppointmentCalendar.tsx` monta a grade com `hours = [8..19]` — **fixa**, independente da
jornada do médico. `TimeSlotPicker.tsx` respeita a jornada. Um médico que atende das 14h
às 18h aparece no calendário em todas as horas de 8 a 19, e na seleção de horário apenas
das 14 às 18.

Não é defeito declarado na extração; é comportamento não documentado. O calendário é visão
de agenda, não de disponibilidade. Decisão da sessão de 2026-09-19: declarar como lacuna.

### 3.3 O seletor de interface é o ponto frágil conhecido

`Appointments.tsx` usa um seletor de interface de terceiro para a transição de status. A
feature 002 já pagou esse preço: abrir o seletor real no DOM simulado levou a verificação
a 66 segundos até estourar o limite de 5. A solução adotada lá — dublê do módulo de
seleção, transformando-o em um elemento nativo — está registrada em
`_reversa_forward/002-prova-automatizada/regression-watch.md#Observações` e é reaproveitada
aqui (D-04 do roadmap).

## 4. Alternativas avaliadas

### 4.1 Onde provar a disponibilidade

| Forma | Como funciona | Veredito |
|-------|----------------|----------|
| **Renderizar o componente de horário** | Passa médico, data e agendamentos como prop e lê os botões oferecidos | **Adotada** (D-01). Regra concentrada, sem consulta, sem roteador, sem rede |
| Provar pela tela de criação inteira | Monta `NewAppointment`, preenche paciente e médico, abre o calendário e escolhe o dia | Descartada para a disponibilidade: acrescenta o calendário de terceiro e o relógio a cada verificação, sem provar nada além do que o componente já prova. A tela continua sendo provada, mas pela ordem do e-mail (D-05) |
| Extrair as funções para um módulo próprio | Move `generateTimeSlots` e `isSlotAvailable` para fora do componente e prova em isolamento | Descartada: é mudança de estrutura, proibida pela RN-06. A prova observa, não altera |

### 4.2 Como tratar o relógio

| Forma | Como funciona | Veredito |
|-------|----------------|----------|
| **Controlar onde o valor decide o resultado** | Congela o tempo apenas nas verificações que comparam com "agora" — o filtro de próximos agendamentos e a desabilitação de datas passadas — e usa datas explícitas nas demais | **Adotada** (D-03). É a decisão de determinismo da feature 002 aplicada com critério |
| Usar datas distantes no futuro | Escolhe anos como 2099 para o que precisa ser "futuro" | Descartada: funciona hoje e vira bomba-relógio; a verificação quebra sozinha quando a data chegar |
| Congelar o tempo em toda a suíte | Controle global de tempo em todas as verificações | Descartada: conflita com as esperas assíncronas das interações de interface, como já registrado na feature 002 |

### 4.3 Onde provar o ciclo de status

| Forma | Como funciona | Veredito |
|-------|----------------|----------|
| **Pela tela, abrindo o diálogo** | Monta a listagem, clica no agendamento, aciona a transição e confere a gravação | **Adotada** (D-02). É o único caminho que prova a promessa do PT-004: a transição é **manual na interface**. O RF-02 fala de verificação executável na interface |
| Só pela chamada de atualização | Verifica que a atualização de status grava o novo valor | Descartada: prova que a gravação funciona, não que a transição é manual — e é justamente a manualidade que os cenários afirmam |
| Pelo calendário semanal | Aciona o agendamento pelo botão da grade | Descartada: chega ao mesmo diálogo por um caminho mais frágil, dependente do posicionamento na grade |

### 4.4 Provar a ausência de gatilho automático

O cenário PT-004.2 afirma que concluir a consulta **não** transiciona o agendamento. É uma
promessa negativa, e promessas negativas são as mais fáceis de escrever mal: uma asserção
do tipo "nada foi chamado" passa mesmo quando a verificação não exercita o caminho certo.

O caminho adotado: **afirmar o valor observável do status depois de concluir a consulta**,
e não a ausência de chamadas. A verificação precisa mostrar o agendamento ainda no status
anterior na tela, que é o que um usuário veria. Risco **R-03** do roadmap.

## 5. Fontes internas consultadas

| Artefato | Uso |
|----------|-----|
| `_reversa_sdd/agendamentos/requirements.md` | As quatro regras do módulo e o schema da entidade |
| `_reversa_sdd/state-machines.md` | O ciclo de status e a matriz de transições (🟡) |
| `_reversa_sdd/code-analysis.md#3.1` a `#3.4` | Os quatro fluxos de controle do módulo |
| `_reversa_sdd/code-analysis.md#4.1` a `#4.5` | Os quatro algoritmos e o envio de e-mail |
| `_reversa_sdd/code-analysis.md#9` | As dez lacunas do módulo |
| `_reversa_sdd/domain.md#2.2` | A família de identificadores `BR-A0x` que colide com a do módulo |
| `_reversa_sdd/c4-context.md` | O serviço de e-mail como sistema externo |
| `_reversa_sdd/migration/parity_tests/03-*.feature` e `04-*.feature` | Os 8 cenários, lidos um a um |
| `_reversa_sdd/code-spec-matrix.md` | O destino declarado deste módulo e o formato da rastreabilidade |
| `_reversa_sdd/addenda/002-prova-automatizada.md` | O mecanismo de prova e as convenções da feature anterior |
| `_reversa_forward/002-prova-automatizada/regression-watch.md` | O aprendizado sobre o seletor de interface e os invariantes sob vigilância |
| `src/components/appointments/TimeSlotPicker.tsx` | A API real do componente que concentra a regra |
| `src/pages/NewAppointment.tsx` | A ordem entre criação e envio de e-mail, e a ausência de validação no salvamento |
| `src/pages/Appointments.tsx` | O diálogo de transição de status e o filtro de próximos agendamentos |
