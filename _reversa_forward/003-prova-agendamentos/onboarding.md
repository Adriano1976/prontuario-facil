# Onboarding: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Para quem vai executar e conferir esta feature pela primeira vez.

## 1. Pré-requisitos

| Item | Observação |
|------|------------|
| Node.js e npm | Versões que o projeto já usa no dia a dia |
| Repositório clonado | Nenhum serviço de backend precisa estar de pé |
| Variáveis de ambiente | **Não são necessárias.** A prova substitui o backend e o envio de e-mail por dublês |

## 2. Os comandos, em ordem

```bash
npm test                  # a suíte completa
npm run typecheck         # gate de tipos estrito
npm run lint              # análise estática
npm run prova:negativos   # reprodução das verificações negativas do gate de tipos
```

O que esperar: tudo passa, os dois gates terminam sem saída e o comando de verificações
negativas reporta cada caso recusado sem deixar resíduo. O código de retorno é 0 quando
tudo passa.

> Os comandos são os mesmos da feature 002 — esta feature **não** cria caminho novo de
> prova. Se algum deles falhar, o problema é do módulo, não da infraestrutura.

## 3. Onde a prova do módulo vive

| Arquivo | Promessa que sustenta |
|---------|------------------------|
| `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` | Jornada do médico, duração, conflito de horário e os casos de borda |
| `src/pages/__tests__/Appointments.test.tsx` | Ciclo de status manual e ausência de gatilho automático |
| `src/pages/__tests__/NewAppointment.test.tsx` | Criação do agendamento e ordem entre envio de e-mail e confirmação de gravação |

## 4. Onde ler o resultado da feature

| Pergunta | Onde responder |
|----------|----------------|
| O que esta feature prometeu? | `_reversa_forward/003-prova-agendamentos/requirements.md` |
| Como foi decidido tecnicamente? | `_reversa_forward/003-prova-agendamentos/roadmap.md` |
| Qual promessa tem prova, e qual não tem? | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do módulo Agendamentos` |
| O que ficou sem prova, e por quê? | `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` e `requirements.md#10. Lacunas` |

## 5. O que conferir com os próprios olhos

1. **Três comportamentos distintos, não um.** Fora da jornada ou em dia sem atendimento, o
   horário **não existe** na lista. Horário ocupado **existe e está desabilitado**. Dia
   inteiro sem horário mostra a mensagem *"Médico não atende neste dia"*. Se a prova tratar
   os três como um só, ela está medindo menos do que promete.
2. **A transição é manual.** Concluir uma consulta vinculada **não** muda o status do
   agendamento. A verificação tem de afirmar o **valor** do status depois, não apenas que
   nada foi chamado — a segunda forma passa mesmo quando não exercita o caminho certo.
3. **Nada mudou no comportamento.** Nenhum arquivo de aplicação do módulo pode ter diff.
   Se você vir `Appointments.tsx`, `NewAppointment.tsx` ou os componentes de agendamento
   modificados, algo saiu do escopo.
4. **Nada mudou no backend.** Os schemas de entidade em `base44/entities/` não podem ter
   diff nenhum. É a regra de ouro.
5. **A matriz diz a verdade.** Escolha três promessas do módulo ao acaso: o arquivo de
   prova citado deve existir e conter a verificação correspondente.
6. **As lacunas estão nomeadas.** O módulo tem dez lacunas documentadas, **duas de
   severidade Alta**, que esta feature declara e não prova. Elas precisam aparecer na
   matriz com a razão — se não aparecerem, a ausência de prova está disfarçada de cobertura.

## 6. O que **não** está coberto

| Fora da prova | Por quê |
|---------------|---------|
| Concorrência na criação simultânea | Lacuna de severidade Alta, declarada e não provada — decisão de escopo de 2026-09-19 |
| Ausência de auto-vínculo da consulta | Lacuna de severidade Alta, declarada e não provada — mesma decisão |
| Demais oito lacunas do módulo | Declaradas com razão e destino |
| Divergência entre calendário e seleção de horário | Declarada; o calendário é visão de agenda, não de disponibilidade |
| Validação do horário no salvamento | **Não existe** no sistema, e a prova afirma essa ausência |
| Folgas, feriados e exceções | O sistema considera apenas os dias de trabalho do médico |
| Sobreposição por duração maior | O sistema não a detecta, e a prova afirma a ausência |
| Edição de agendamento | Não existe modo de edição, apenas criação |
| Paridade visual das telas | Depende de captura dourada inexistente |
| Cenários dos demais módulos | Pertencem a features próprias |

## 7. Registro de execução

| # | Item | Resultado |
|---|------|-----------|
| 1 | `npm test` passa por inteiro | |
| 2 | `npm run typecheck` sem saída | |
| 3 | `npm run lint` sem saída | |
| 4 | `npm run prova:negativos` reporta cada caso e não deixa resíduo | |
| 5 | Nenhum arquivo de aplicação do módulo modificado | |
| 6 | `base44/entities/` sem diff | |
| 7 | Os três comportamentos de disponibilidade estão distinguidos na prova | |
| 8 | A ausência de gatilho automático é afirmada pelo valor do status | |
| 9 | As dez lacunas aparecem na matriz com razão | |
| 10 | Suíte completa abaixo de 90 segundos | |
