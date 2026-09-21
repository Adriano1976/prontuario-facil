# Actions: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Roadmap: `_reversa_forward/003-prova-agendamentos/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 11 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 6 elos |

> A infraestrutura de prova já existe desde a feature 002 — esta feature **não** cria
> caminho novo de execução. O que ela acrescenta é massa de prova compartilhada e três
> arquivos de verificação. Metade do trabalho está num componente que não consulta nada e
> não precisa de um único dublê.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar as fábricas compartilhadas de massa de prova do módulo — médico com jornada, dias de atendimento e duração parametrizáveis, agendamento existente e paciente — com datas explícitas e o auxiliar de controle de relógio, para que os três arquivos de verificação usem a mesma massa e o mesmo critério temporal | - | - | `src/test/appointmentsFixtures.ts` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Provar os três comportamentos distintos de disponibilidade — fora da jornada o horário não é gerado, dia fora dos dias de trabalho não gera horário e exibe a mensagem própria ao usuário, e horário que não cabe na duração não é gerado — mais os dois casos de borda silenciosos: médico sem jornada configurada e jornada invertida | T001 | [//] | `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` | 🟢 | [X] |
| T003 | Provar a detecção de conflito de horário: horário ocupado é **gerado e desabilitado**, horário livre é habilitado, e a sobreposição por duração maior **não** é detectada | T002 | - | `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Provar o ciclo de status pela tela de listagem: o agendamento nasce `agendado`, a transição para `confirmado` acontece pelo diálogo, e as transições de saída para `cancelado` e `faltou` são persistidas | T001 | [//] | `src/pages/__tests__/Appointments.test.tsx` | 🟢 | [ ] |
| T005 | Provar a ausência de gatilho automático — concluir a consulta vinculada **não** transiciona o agendamento, afirmando o **valor** do status depois e não a ausência de chamadas — e que as flags de lembrete não alteram o status | T004 | - | `src/pages/__tests__/Appointments.test.tsx` | 🟢 | [ ] |
| T006 | Provar a criação do agendamento, a **ausência de revalidação do horário no salvamento** — o botão de salvar exige apenas paciente, médico e data — e a ordem entre envio de e-mail de confirmação e confirmação de gravação, incluindo o desfecho quando o envio falha | T001 | [//] | `src/pages/__tests__/NewAppointment.test.tsx` | 🟢 | [ ] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Estender a matriz de rastreabilidade com o veredito de prova de cada promessa do módulo de Agendamentos, citando **todo identificador de regra com o artefato de origem qualificado**, por causa da colisão das famílias `BR-A0x` | T003, T005, T006 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [ ] |
| T008 | Registrar na matriz o destino dos 8 cenários de paridade do módulo e as dez lacunas declaradas, cada uma com a razão — em especial as duas de severidade Alta, que **não** ganham prova nesta feature | T007 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [ ] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Revalidar os quatro comandos de gate com o módulo provado e conferir que nenhum arquivo de aplicação do módulo nem schema de entidade foi tocado | T003, T005, T006 | [//] | `_reversa_forward/003-prova-agendamentos/onboarding.md` | 🟢 | [ ] |
| T010 | Medir o tempo da suíte completa com o módulo provado e registrar o valor no roteiro, verificando o teto de 90 segundos | T009 | - | `_reversa_forward/003-prova-agendamentos/onboarding.md` | 🟢 | [ ] |
| T011 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados | T008, T009 | - | `_reversa_forward/003-prova-agendamentos/regression-watch.md` | 🟢 | [ ] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** As ações mexem em arquivo de prova, na massa de prova compartilhada e em artefato da extração. Se alguma ação parecer exigir mudança em `src/pages/Appointments.tsx`, `src/pages/NewAppointment.tsx` ou nos componentes de agendamento, algo saiu do escopo — pare e revise.
2. **`base44/entities/` intocado.** Regra de ouro do diff.
3. **O componente de seleção de horário é puro.** Ele recebe tudo por prop, não consulta dados e não usa roteador: a verificação de T002 e T003 **não precisa de dublê nenhum**. Não montar arnês onde não há nada a substituir.
4. **O seletor de interface de status exige dublê de módulo (D-04).** Abrir o seletor real no DOM simulado já custou 66 segundos até estourar o limite, na feature 002. Reaproveitar o padrão de `PatientForm.test.tsx`.
5. **O relógio é controlado só onde o valor decide o resultado (D-03).** Filtro de próximos agendamentos e desabilitação de datas passadas. No resto, datas explícitas.
6. **Provar ausência exige asserção positiva (R-03).** Para T005, afirmar o **valor** do status depois de concluir a consulta. Uma asserção do tipo "nada foi chamado" passa mesmo quando a verificação não exercita o caminho certo — seria um placebo com aparência de prova.
7. **As dez lacunas declaram-se, não se provam (D-07).** T008 dá veredito e razão a cada uma; nenhuma vira arquivo de verificação.
8. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente já registrada na nota 8 do `actions.md` da feature 002.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-19` | Versão inicial gerada por `/reversa-to-do` | reversa |
