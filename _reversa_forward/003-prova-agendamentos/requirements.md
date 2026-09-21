# Requirements: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo de Agendamentos é a maior superfície do sistema sem nenhuma prova de execução:
duas telas inteiras, a máquina de estados mais complexa do domínio, o cálculo de
disponibilidade que decide o que a clínica pode agendar, a detecção de conflito de horário
e o envio de e-mail de confirmação — tudo isso sem uma única verificação automatizada.
Esta feature converte em prova de execução os 8 cenários de paridade do módulo, cobre os
casos de borda do cálculo de disponibilidade e declara, com razão, o que permanece sem
prova. Entrega para o desenvolvedor único, que hoje não tem como saber que quebrou a
jornada do médico ou o ciclo de status antes de a clínica sentir, e para quem opera a
agenda, que depende de uma regra de horário que nunca foi verificada.

## 2. Contexto a partir do legado

> **Siglas.** **BR** é regra de negócio do domínio, **RF** é requisito funcional, **RNF**
> é requisito não funcional, **RLS** é a regra de acesso por linha do backend, **PT** é
> cenário de paridade da migração.
>
> ⚠️ **Colisão de identificadores na extração.** Existem **duas famílias distintas** de
> códigos `BR-A0x` convivendo em `_reversa_sdd/`:
>
> | Código | Em `domain.md#2.2` | Em `agendamentos/requirements.md#2` |
> |---|---|---|
> | BR-A01 | O agendamento nasce `agendado` e precisa ser `confirmado` antes do atendimento | `patient_id`, `doctor_id` e `date` são obrigatórios |
> | BR-A02 | Ao concluir a consulta, o agendamento deve ser marcado `concluido` (🟡, inferida) | O paciente selecionado deve estar `ativo` |
> | BR-A03 | O painel exclui agendamentos `cancelados` das contagens | O ciclo de status, com transição manual |
> | BR-A04 | — | O horário deve respeitar jornada e duração do médico |
>
> **Toda citação nesta feature qualifica o artefato de origem** (`domain.md#2.2` ou
> `agendamentos/requirements.md#2`), nunca o código nu. Ver RF-06.

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/agendamentos/requirements.md#2. Regras de Negócio (BRs)` | Quatro regras do módulo (BR-A01 a BR-A04), todas 🟢, e **nenhum cenário de aceitação** | 🟢 |
| `_reversa_sdd/state-machines.md#1. Status de Agendamento (Appointment)` | Seis status e o ciclo de vida mais complexo do sistema | 🟢 |
| `_reversa_sdd/state-machines.md#4. Matriz de Transições (Inferida)` | Apenas três transições mapeadas para seis status, e a matriz inteira é 🟡 | 🟡 |
| `_reversa_sdd/domain.md#2.2 Agendamentos e Consultas` | BR-A01, BR-A02 (🟡 inferida, afirmando sincronia automática que não existe) e BR-A03 | 🟢 |
| `_reversa_sdd/migration/parity_tests/03-agendamento-jornada-medico.feature` | PT-003: 4 cenários — três negativos de jornada e um positivo | 🟢 |
| `_reversa_sdd/migration/parity_tests/04-ciclo-status-agendamento.feature` | PT-004: 4 cenários — nascimento, ausência de gatilho automático, flags de lembrete e transições de saída | 🟢 |
| `_reversa_sdd/code-analysis.md#4.1 Cálculo de Slots Disponíveis` | O algoritmo que decide o que é agendável, com dois casos de borda **silenciosos** | 🟢 |
| `_reversa_sdd/code-analysis.md#4.2 Verificação de Conflito de Horário` | Detecção **pontual**: sobreposição por duração maior não é detectada | 🟢 |
| `_reversa_sdd/code-analysis.md#4.3 Filtro de Próximos Agendamentos` | Compara o instante completo, então agendamento de hoje já passado não aparece | 🟢 |
| `_reversa_sdd/code-analysis.md#4.5 Envio de E-mail de Confirmação` | Disparado **antes** da confirmação de sucesso; falha no envio deixa o registro gravado sem feedback | 🟢 |
| `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` | Dez lacunas do módulo, entre elas "sem testes" (Alta), concorrência na criação simultânea (Alta) e ausência de auto-vínculo da consulta (Alta) | 🟢 |
| `_reversa_sdd/confidence-report.md#Confiança por unit` | `agendamentos/` é a unit de **maior volume** da extração (57 marcadores 🟢) e confiança de 83% | 🟢 |
| `_reversa_sdd/inventory.md#Módulos identificados` | O módulo abrange as telas de listagem e criação mais dois componentes de calendário e horário | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | O destino deste módulo já está declarado: "Feature a criar — conversão dos cenários de fluxo de agendamentos" | 🟢 |
| `_reversa_sdd/addenda/002-prova-automatizada.md#Vigência` | Adendo vigente: o mecanismo de prova existe e é executável por comando, incluindo a reprodução das verificações negativas do gate de tipos | 🟢 |
| `_reversa_forward/002-prova-automatizada/regression-watch.md#Watch principal` | W001, W003, W004 e W005 vigiam invariantes que esta feature passa a exercitar também no módulo de Agendamentos | 🟢 |

> ⚠️ **Correção de premissa sobre a BR-A02 de `domain.md`.** Ela afirma que "ao concluir
> uma consulta, o agendamento correspondente deve ser marcado como `concluido`", marcada
> como 🟡 inferida. O cenário PT-004.2 afirma exatamente o **contrário** — que concluir a
> consulta **não** transiciona o agendamento — e a decisão D-12 da feature 001 congelou a
> transição manual. Esta feature **não** corrige a regra nem o artefato: ela prova o
> comportamento atual, que é o da transição manual. Confidência: 🟢.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor único (PO e Dev) | Alterar o cálculo de disponibilidade ou o ciclo de status sem quebrar a agenda da clínica | Mexe na regra de jornada e descobre por comando o que deixou de valer |
| Recepcionista ou médico (operação da clínica) | Confiar que só aparecem horários realmente agendáveis | Depende de uma regra de horário que nunca foi verificada por ninguém |
| Desenvolvedor único | Saber se o congelamento da transição manual continua de pé | Roda a suíte e vê a prova do cenário que afirma a ausência de gatilho automático |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Toda promessa registrada nas specs do módulo Agendamentos tem prova de execução, ou está declarada como lacuna com a razão em documento versionado. 🟢
   - Tipo: nova (estende ao módulo a regra que a feature 002 criou para Pacientes)
2. **RN-02:** O ciclo de status do agendamento permanece **manual**. Nenhuma prova desta feature pode introduzir, exigir ou pressupor automação de transição — em particular, concluir uma consulta não transiciona o agendamento. 🟢
   - Origem no legado: `_reversa_sdd/agendamentos/requirements.md#2. Regras de Negócio (BRs)` (BR-A03) e `_reversa_sdd/migration/parity_tests/04-ciclo-status-agendamento.feature` (PT-004.2)
   - Tipo: alterada (a BR-A02 de `_reversa_sdd/domain.md#2.2` é 🟡 e afirma o contrário; a divergência é deliberada e está declarada)
3. **RN-03:** O cálculo de disponibilidade distingue **três** comportamentos observáveis, todos deliberadamente preservados: horário fora da jornada, dia fora dos dias de trabalho e horário que não cabe na duração **não são gerados**; horário ocupado por outro agendamento **é gerado e desabilitado**; e um dia inteiro sem horário gerado exibe mensagem própria ao usuário. O salvamento **não revalida** o horário escolhido. Nada disso é defeito a corrigir. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#4.1 Cálculo de Slots Disponíveis`, `_reversa_sdd/code-analysis.md#3.4 TimeSlotPicker — Disponibilidade` e `_reversa_sdd/code-analysis.md#3.2 Criação de Agendamento`
   - Tipo: nova (formaliza comportamento existente, hoje silencioso)
4. **RN-04:** A janela de conflito é **pontual**. O sistema não detecta sobreposição quando a duração do novo agendamento excede a duração do agendamento existente. O comportamento é preservado e provado como está. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#4.2 Verificação de Conflito de Horário`
   - Tipo: nova (a limitação passa de comentário no artefato a promessa verificada)
5. **RN-05:** O envio do e-mail de confirmação ocorre **antes** da confirmação de sucesso da gravação. Falha no envio deixa o agendamento gravado sem feedback de sucesso ao usuário. O comportamento é preservado e provado como está. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#4.5 Envio de E-mail de Confirmação`
   - Tipo: nova
6. **RN-06:** A prova observa; não altera. Nenhum arquivo de aplicação, contrato de dados ou schema de entidade é modificado para acomodar a suíte. 🟢
   - Origem no legado: `_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`
   - Tipo: nova (herdada da feature 002)
7. **RN-07:** Duas famílias de identificadores `BR-A0x` coexistem na extração. Toda citação desta feature qualifica o artefato de origem. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.2` e `_reversa_sdd/agendamentos/requirements.md#2`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Os 4 cenários de jornada do médico (PT-003) têm prova de execução, **fiel ao comportamento do código** e não à redação do cenário | Must | Fora da jornada e dia fora dos dias de trabalho **não geram horário algum**; horário que não cabe na duração **não é gerado**; horário válido é gerado, e o agendamento nasce `agendado` — cada caso com verificação executável | 🟢 |
| RF-02 | Os 4 cenários do ciclo de status (PT-004) têm prova de execução | Must | Nascimento como `agendado`, transição manual para `confirmado`, ausência de gatilho automático ao concluir consulta, flags de lembrete sem efeito sobre o status e transições de saída têm verificação executável | 🟢 |
| RF-03 | O cálculo de disponibilidade tem prova dos casos de borda | Must | Médico sem jornada configurada, jornada invertida e horário que não cabe na duração produzem ausência de horário oferecido, cada um com verificação | 🟢 |
| RF-04 | A detecção de conflito de horário tem prova, incluindo a limitação declarada | Must | Horário ocupado é **gerado e desabilitado** — não desaparece da lista —, e a sobreposição por duração maior é provada como **não detectada**, conforme RN-04 | 🟢 |
| RF-05 | A ordem entre envio de e-mail e confirmação de gravação tem prova | Must | O envio ocorre antes; falha no envio deixa o registro gravado e o usuário sem feedback de sucesso — conforme RN-05 | 🟢 |
| RF-06 | A matriz de rastreabilidade registra o veredito de cada promessa do módulo, com o identificador de regra qualificado pelo artefato de origem | Must | Cada linha da matriz cita `domain.md#2.2` ou `agendamentos/requirements.md#2`, nunca o código nu | 🟢 |
| RF-07 | As lacunas do módulo que não forem fechadas ficam declaradas com a razão e o destino | Must | Cada uma das dez lacunas de `_reversa_sdd/code-analysis.md#9` tem veredito: fechada, transferida ou declarada | 🟢 |
| RF-08 | A prova do módulo é executável pelos comandos únicos de prova já existentes | Must | A suíte passa por inteiro e o gate de tipos e a análise estática permanecem sem erro | 🟢 |
| RF-09 | A prova do módulo não depende do backend real, de rede nem do relógio do sistema para decidir resultado | Must | A suíte completa roda sem backend; o horário é controlado onde o **valor** decide o resultado | 🟢 |
| RF-10 | Nenhum arquivo de aplicação do módulo é alterado | Must | Não há diff em `src/pages/Appointments*`, `src/pages/NewAppointment*`, `src/components/appointments/*` nem em `base44/entities/` | 🟢 |
| RF-11 | O adendo da entrega converge o delta na extração | Must | Existe adendo vigente para a feature, produzido ao final do ciclo | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Reprodutibilidade | Toda evidência é reproduzível em máquina limpa, com instalação de dependências e um comando | RN-01; o mecanismo foi provado na feature 002 | 🟢 |
| Determinismo | Nenhuma verificação depende do **valor** do relógio real para decidir o resultado. Datas e horas usadas como entrada são fixadas pela prova | O cálculo de disponibilidade e o filtro de próximos agendamentos derivam de `new Date()`; sem controle, a verificação quebraria sozinha na virada do dia | 🟢 |
| Isolamento | A prova não fala com o backend real nem com a rede; o envio de e-mail é substituído por dublê | `_reversa_sdd/c4-context.md#Integrações Externas Detectadas` — o serviço de e-mail é sistema externo | 🟢 |
| Desempenho | O acréscimo da suíte mantém a execução completa abaixo de 90 segundos | Medição de 2026-09-19 antes desta feature: 36 verificações em 32,5 s. Teto **mantido** na sessão de esclarecimentos, com folga de mais de 50 segundos | 🟢 |
| Paridade | Nenhuma alteração de comportamento observável é introduzida pela feature | Regra de ouro herdada; `base44/entities/*.jsonc` permanece intocado | 🟢 |
| Privacidade | Dados de prova são fictícios; o e-mail do paciente usado na prova é inventado | O módulo manipula nome, e-mail e telefone de paciente | 🟢 |
| Manutenibilidade | Acrescentar verificação nova não exige editar configuração de infraestrutura de prova | A suíte se descobre por convenção de nome de arquivo | 🟢 |
| Observabilidade | A falha identifica a promessa violada, não apenas o arquivo | RN-01 e o padrão de mensagem estabelecido na feature 002 | 🟡 |

### 6.1 Limites explícitos de alcance

- A prova **não** valida autorização real. A regra de acesso permanece no servidor; a suíte verifica que o escopo foi declarado e aplicado. 🟢
- A prova **não** corrige nenhuma das dez lacunas de `_reversa_sdd/code-analysis.md#9`. Elas passam a ter veredito, não conserto — em particular a concorrência na criação simultânea e a ausência de auto-vínculo da consulta, ambas de severidade Alta. 🟢
- As **dez lacunas** do módulo entram nesta feature **apenas como veredito declarado**, por decisão da sessão de 2026-09-19. Nenhuma delas ganha prova de comportamento atual, nem mesmo as duas de severidade Alta. 🟢
- A **divergência entre as duas visões de disponibilidade** — o calendário semanal usa grade fixa de 8h às 19h, independente da jornada do médico, enquanto a seleção de horário respeita a jornada — fica declarada como lacuna, sem prova. Decisão da sessão de 2026-09-19. 🟡
- A **redação do cenário PT-003** ("o agendamento é rejeitado com indicação de horário indisponível") é imprecisa: o horário indisponível **não é recusado no salvamento** — ou nunca é gerado, ou é gerado e desabilitado. A prova segue o comportamento do código. Decisão da sessão de 2026-09-19. 🟢
- A prova **não** cobre folgas, feriados nem lista de exceções: o sistema considera apenas os dias de trabalho do médico. 🟢
- A prova **não** cobre conflito por sobreposição de durações diferentes, porque o sistema não o detecta (RN-04). O que se prova é a ausência. 🟢
- A prova **não** cobre edição de agendamento: não existe modo de edição, apenas criação. 🟢
- A **paridade visual** das telas do módulo permanece fora: a captura dourada de referência não existe no repositório. 🟢
- Os cenários de paridade dos **demais módulos** não pertencem a esta feature. 🟢
- Esta feature **não** altera as features 001 e 002 nem reabre o escopo delas. 🟢

## 7. Critérios de Aceitação

```gherkin
Cenário: Fora da jornada o horário não chega a existir
  Dado um médico com jornada de 08:00 a 18:00 e duração de 30 minutos
  Quando a seleção de horário é aberta em um dia de trabalho
  Então o último horário gerado é anterior a 18:00
  E nenhum horário a partir de 18:00 é apresentado

Cenário: Dia fora dos dias de trabalho não gera horário algum
  Dado um médico com dias de trabalho de segunda a sexta
  Quando a seleção de horário é aberta em um sábado
  Então nenhum horário é gerado
  E a tela comunica que o médico não atende neste dia

Cenário: Horário que não cabe na duração não é gerado
  Dado um médico com fim de expediente às 18:00 e duração de 30 minutos
  Quando a seleção de horário é aberta
  Então o último horário gerado é anterior a 18:00
  E o horário que terminaria depois do expediente não é apresentado

Cenário: Horário válido é gerado e o agendamento nasce agendado
  Dado um médico com jornada de 08:00 a 18:00, duração de 30 minutos e um paciente ativo
  Quando um horário das 10:00 é escolhido e o agendamento é salvo
  Então o registro é criado com status agendado

Cenário: Médico sem jornada configurada não gera horário
  Dado um médico sem dias de trabalho e sem horário de expediente definidos
  Quando a seleção de horário é aberta
  Então nenhum horário é gerado

Cenário: Jornada invertida não gera horário
  Dado um médico com início de expediente posterior ao fim
  Quando a seleção de horário é aberta
  Então nenhum horário é gerado

Cenário: Horário ocupado é apresentado e fica indisponível
  Dado um agendamento existente do mesmo médico às 10:00 com duração de 30 minutos
  Quando a seleção de horário é aberta nesse dia
  Então o horário das 10:00 consta da lista e está desabilitado
  E o horário das 10:30 é apresentado como disponível

Cenário: O salvamento não revalida o horário escolhido
  Dado um agendamento preenchido na tela de criação
  Quando o horário escolhido deixa de ser válido entre a escolha e o salvamento
  Então o salvamento é aceito sem revalidação do horário

Cenário: Sobreposição por duração maior não é detectada
  Dado um agendamento existente do mesmo médico às 10:00 com duração de 30 minutos
  Quando a seleção de horário é aberta para um atendimento de 60 minutos
  Então o horário das 10:30 é apresentado como disponível

Cenário: Agendamento nasce agendado e é confirmado manualmente
  Dado um agendamento recém-criado
  Quando o status é consultado
  Então ele é agendado
  E após a confirmação manual na interface passa a confirmado

Cenário: Concluir a consulta não transiciona o agendamento
  Dado um agendamento em atendimento com uma consulta vinculada
  Quando a consulta é concluída
  Então o agendamento permanece em atendimento
  E só muda para concluído por transição manual na interface

Cenário: Flags de lembrete não alteram o status
  Dado um agendamento com lembrete marcado como enviado e a data do envio preenchida
  Quando o status é consultado
  Então ele permanece inalterado

Cenário: Cancelar e marcar falta são transições válidas
  Dado um agendamento com status agendado
  Quando ele é transicionado para cancelado
  Então o novo status é persistido
  E o mesmo vale para faltou

Cenário: Envio de e-mail ocorre antes da confirmação de gravação
  Dado um paciente com e-mail cadastrado e um agendamento sendo criado
  Quando a gravação é confirmada
  Então o e-mail de confirmação já foi solicitado

Cenário: Falha no envio deixa o agendamento gravado sem feedback de sucesso
  Dado um paciente com e-mail cadastrado
  Quando o envio do e-mail de confirmação falha
  Então o agendamento permanece gravado
  E o usuário não recebe confirmação de sucesso

Cenário: Prova do módulo é executada pelos comandos únicos já existentes
  Dado o projeto com as dependências instaladas
  Quando o comando único de prova é executado
  Então as verificações do módulo de Agendamentos são executadas junto com as demais
  E o código de retorno reflete o resultado

Cenário: Prova do módulo roda sem rede e sem depender do relógio real
  Dado o ambiente sem acesso ao backend real
  Quando a suíte completa é executada
  Então nenhuma verificação do módulo falha por ausência de rede
  E nenhuma decisão de resultado depende do valor do relógio do sistema

Cenário: Nenhum arquivo de aplicação do módulo é alterado
  Dado o estado final da feature
  Quando as alterações são conferidas
  Então nenhuma tela, componente de agendamento ou schema de entidade foi modificado

Cenário: A entrega é convergida na extração
  Dado o estado final da feature
  Quando a extração reversa é consultada
  Então existe adendo vigente descrevendo o delta da entrega

Cenário: Promessa sem prova é declarada
  Dado o módulo de Agendamentos
  Quando a matriz de rastreabilidade é consultada
  Então cada promessa do módulo tem veredito de provado por execução ou de lacuna com razão
  E cada regra é citada com o artefato de origem que a define
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | A jornada do médico é o que decide o que a clínica pode agendar; três dos quatro cenários são negativos e nenhum tem prova |
| RF-02 | Must | O ciclo de status é o comportamento mais complexo do sistema e o mais fácil de quebrar em silêncio |
| RF-03 | Must | Dois dos casos de borda são **silenciosos**: o médico simplesmente desaparece da agenda sem erro nenhum |
| RF-04 | Must | A limitação de conflito é Alta severidade na prática; provar a ausência é o que impede alguém de "corrigir" sem decisão |
| RF-05 | Must | A ordem entre envio e gravação é o que produz estado inconsistente hoje; provar é o pré-requisito para decidir mudar |
| RF-06 | Must | Sem o identificador qualificado, a matriz cita uma regra que pode ser a errada — a colisão `BR-A0x` é real |
| RF-07 | Must | Sem declaração, dez lacunas se disfarçam de cobertura |
| RF-08 | Must | A prova precisa ser executável pelos comandos que já existem, não por um caminho novo |
| RF-09 | Must | Prova dependente de rede ou do relógio real não é reprodutível |
| RF-10 | Must | É a regra de ouro: esta feature prova, não conserta |
| RF-11 | Must | Sem o adendo a extração volta a descrever um sistema sem prova |
| RNF Determinismo | Must | O módulo inteiro deriva de `new Date()`; sem controle, as verificações quebram sozinhas na virada do dia |
| RNF Desempenho | Should | 90 segundos é o teto para a suíte continuar sendo usada no dia a dia |
| RNF Observabilidade | Should | A falha deve apontar a promessa violada, não só o arquivo |

## 9. Esclarecimentos

### Sessão 2026-09-19

Sessão dedicada às três dúvidas do documento inicial e a dois pontos abertos encontrados
na varredura: o teto de desempenho da suíte e uma divergência entre as duas visões de
disponibilidade do módulo. As cinco respostas foram dadas de uma vez, com as cinco
recomendações aceitas.

- **Q:** Os cenários PT-003 dizem que o horário inválido "é rejeitado". O código tem três comportamentos diferentes e nenhuma validação no salvamento. Qual promessa provar?
  **R:** Provar o comportamento fiel ao código e declarar o cenário impreciso. Fora da jornada, dia fora dos dias de trabalho e horário que não cabe na duração **não são gerados**; horário ocupado **é gerado e desabilitado**; dia inteiro sem horário gerado exibe mensagem própria; e o salvamento **não revalida** o horário. Consequências: RF-01 e RF-04 reescritos; RN-03 passa a distinguir os três comportamentos; o cenário do conflito foi corrigido — ele afirmava que o horário não era oferecido, quando na verdade é oferecido e desabilitado —; e a imprecisão do PT-003 entra em §10 como pendência registrada.
- **Q:** As dez lacunas do módulo entram apenas como veredito declarado, ou alguma ganha prova de comportamento atual?
  **R:** Todas as dez entram apenas como veredito declarado, com razão e destino — inclusive as duas de severidade Alta (concorrência na criação simultânea e ausência de auto-vínculo da consulta). Consequências: RF-07 fixa o escopo em declarar, não em provar; §6.1 registra que a feature não as corrige nem as prova; e a relação completa vai para §10.
- **Q:** O calendário semanal mostra grade fixa de 8h às 19h, sem considerar a jornada do médico; a seleção de horário respeita a jornada. Como tratar essa convivência?
  **R:** Declarar a divergência como lacuna, sem provar. O calendário é visão de agenda, não de disponibilidade. Consequência: a divergência entra em §10 como pendência transferida — prová-la exigiria cenários fora dos 8 de paridade do módulo.
- **Q:** A colisão das duas famílias `BR-A0x` entre `_reversa_sdd/domain.md#2.2` e `_reversa_sdd/agendamentos/requirements.md#2` deve ser corrigida ou contornada?
  **R:** Contornada por citação qualificada, como o RF-06 propõe. Renumerar uma das famílias alteraria artefato da extração e poderia invalidar citações existentes, inclusive as da feature 001. Consequências: RF-06 mantido; a colisão em si fica registrada em §10 como defeito documental da extração, a resolver numa re-extração.
- **Q:** O RNF de desempenho fixa teto de 90 segundos para a suíte completa, e faltam cinco módulos depois deste. Mantém o teto?
  **R:** Mantém. Há folga de mais de 50 segundos sobre a medição de 36 verificações em 32,5 s, e o teto é o que mantém a suíte usável no dia a dia. Consequência: o RNF passa de 🟡 para 🟢, com a decisão registrada.

## 10. Lacunas

Nenhuma lacuna em aberto nesta feature. As três dúvidas do documento inicial foram
resolvidas na sessão de esclarecimentos de 2026-09-19, e os dois pontos abertos
encontrados na varredura foram decididos na mesma sessão.

### Pendências transferidas para fora desta feature

- 🟢 **As dez lacunas do módulo** — `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas`: dois mapas de status paralelos, conflito entre envio de e-mail e confirmação de gravação, campos de lembrete órfãos, ausência de auto-vínculo da consulta (Alta), calendário que permite selecionar o dia de hoje, ausência de fallback de jornada, ausência de validação de feriados, concorrência na criação simultânea (Alta) e filtro de próximos agendamentos por instante completo. Decisão de 2026-09-19: **veredito declarado, sem prova**. O RF-07 obriga a matriz a dar destino a cada uma.
- 🟡 **Divergência entre as duas visões de disponibilidade** — o calendário semanal usa grade fixa de 8h às 19h, independente da jornada do médico, enquanto a seleção de horário respeita a jornada. Decisão de 2026-09-19: declarada, sem prova. O calendário é visão de agenda, não de disponibilidade.
- 🟡 **Ausência de validação do horário no salvamento** — o botão de salvar exige paciente, médico e data, mas não revalida jornada nem conflito. Decisão de 2026-09-19: provada como comportamento atual; corrigir muda comportamento observável e sai do escopo desta feature.
- 🟡 **Imprecisão do cenário PT-003** — a redação "o agendamento é rejeitado com indicação de horário indisponível" não corresponde ao comportamento observado. Corrigir o cenário é trabalho da extração, não desta feature.
- 🟡 **Colisão das famílias `BR-A0x`** — `_reversa_sdd/domain.md#2.2` e `_reversa_sdd/agendamentos/requirements.md#2` usam os mesmos códigos para regras diferentes. Decisão de 2026-09-19: contornada por citação qualificada nesta feature; a raiz é defeito documental da extração, a resolver numa re-extração.
- 🟡 **Edição de agendamento** — não existe modo de edição, apenas criação. Permanece fora do escopo.
- 🔴 **Paridade visual das telas do módulo** — os cenários de tela do módulo em `_reversa_sdd/migration/parity_tests/screens/` permanecem sem prova enquanto a captura dourada de referência não existir no repositório.
- 🟡 **Cenários de paridade dos demais módulos** — pertencem a features próprias, com destino já declarado na matriz de rastreabilidade.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-19 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-19 | Sessão de esclarecimentos: 5 respostas. A prova segue o comportamento do código e o cenário PT-003 fica declarado impreciso (RF-01 e RF-04 reescritos, RN-03 distinguindo os três comportamentos, cenário do conflito corrigido); as dez lacunas do módulo entram só como veredito declarado; a divergência entre calendário e seleção de horário fica declarada; a colisão `BR-A0x` é contornada por citação qualificada; e o teto de 90 segundos é mantido, com o RNF passando a 🟢 | reversa-clarify |

---
*Gerado pelo Reversa-Requirements em 2026-09-19.*
