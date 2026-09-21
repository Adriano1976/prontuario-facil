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

Rodada de fechamento em **2026-09-21**, sobre a árvore de trabalho limpa (nenhum arquivo
modificado em relação ao commit `9b5dfdb`).

| # | Item | Resultado |
|---|------|-----------|
| 1 | `npm test` passa por inteiro | ✅ **14 arquivos, 66 verificações, 0 falhas** — código de retorno 0 |
| 2 | `npm run typecheck` sem saída | ✅ **0 erros** |
| 3 | `npm run lint` sem saída | ✅ **0 erros** (`eslint . --quiet`) |
| 4 | `npm run prova:negativos` reporta cada caso e não deixa resíduo | ✅ **9 casos, 9 recusados como esperado**, e `src/__negative_checks__/` **não** ficou no repositório |
| 5 | Nenhum arquivo de aplicação do módulo modificado | ✅ Conferido **por histórico**: o último commit que tocou `Appointments.tsx` e `NewAppointment.tsx` é `4c31d76`, de 2026-09-14 — cinco dias antes desta feature. O commit que trouxe as provas do módulo, `b6d2fce`, adiciona 4 arquivos e **todos** são de prova |
| 6 | `base44/entities/` sem diff | ✅ Último commit nesse caminho: `19ed662`, de 2026-08-18 |
| 7 | Os três comportamentos de disponibilidade estão distinguidos na prova | ✅ `TimeSlotPicker.test.tsx` — seis verificações separam "não gerado", "gerado e desabilitado" e "mensagem de dia sem atendimento" |
| 8 | A ausência de gatilho automático é afirmada pelo valor do status | ✅ `Appointments.test.tsx` afirma o **valor** depois, e não a ausência de chamadas — **com vacuidade declarada**: nada liga consulta a agendamento, então a verificação é guarda de regressão |
| 9 | As lacunas do módulo aparecem na matriz com razão | ✅ **Onze**, e não dez — a contagem do artefato diverge da do `requirements.md`, e a divergência está declarada na matriz em vez de silenciada |
| 10 | Suíte completa abaixo de 90 segundos | ✅ **57,9 s** medidos pelo vitest (60,9 s de relógio) — **32 s de folga** |

### 7.1 Medição de tempo (T010)

| Medição | Verificações | Arquivos | Tempo | Teto | Folga |
|---------|-------------:|---------:|------:|-----:|------:|
| 2026-09-19, antes desta feature | 36 | 10 | 32,5 s | 90 s | 57,5 s |
| 2026-09-21, após esta feature | 66 | 14 | 57,9 s | 90 s | **32,1 s** |

O acréscimo foi de **30 verificações em 4 arquivos** — 22 nas três provas do módulo de
Agendamentos e 8 na guarda de encoding. O teto de 90 segundos **não** foi atingido, e a
decisão de mantê-lo (sessão de 2026-09-19) segue válida.

### 7.2 Gates além dos quatro (T009)

Dois comandos foram executados por completude, e **nenhum** faz parte dos quatro gates
desta feature:

| Comando | Resultado |
|---------|-----------|
| `npm run prova:encoding` | ✅ **373 arquivos de texto** em `src/`, `_reversa_docs/`, `_reversa_forward/` e `_reversa_sdd/` — nenhum mojibake, todo texto UTF-8 íntegro |
| `git status --porcelain` | ✅ Vazio no início da rodada: nenhuma alteração pendente, e portanto nenhum diff acidental em arquivo de aplicação |

> **Ressalva de ambiente.** Os comandos de prova **não** sobem nos modos confinados de
> sandbox: o esbuild do vitest abre pipe nomeado e falha com `spawn EPERM`, e o
> `prova:negativos` falha ao criar `src/__negative_checks__/`. Exigem acesso ampliado —
> mesma restrição registrada no onboarding da feature 001, §7. Não é defeito do projeto.

---
*Gerado pelo Reversa-Plan em 2026-09-20.*
*Registro de execução preenchido pelo Reversa-Coding em 2026-09-21.*
