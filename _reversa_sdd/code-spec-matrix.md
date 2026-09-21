# Matriz de Código e Especificação (Code/Spec Matrix) — prontuario-facil

Esta matriz relaciona cada artefato de código-fonte e schema do projeto legado com a respectiva especificação SDD gerada pelo framework Reversa.

| Módulo / Funcionalidade | Arquivo(s) Legado(s) de Origem | Especificação SDD Correspondente | Status |
| :--- | :--- | :--- | :---: |
| **Dashboard** | `src/pages/Dashboard.jsx` | `_reversa_sdd/dashboard/` | 🟢 Completo |
| **Pacientes** | `src/pages/Patients.jsx`, `base44/entities/Patient.jsonc` | `_reversa_sdd/pacientes/requirements.md` | 🟢 Completo |
| **Consultas** | `src/pages/Consultations.jsx`, `base44/entities/Consultation.jsonc`, `Prescription.jsonc`, `Exam.jsonc` | `_reversa_sdd/consultas/requirements.md` | 🟢 Completo |
| **Agendamentos** | `src/pages/Appointments.jsx`, `base44/entities/Appointment.jsonc`, `AppointmentCalendar.jsx` | `_reversa_sdd/agendamentos/requirements.md` | 🟢 Completo |
| **Médicos** | `src/pages/Doctors.jsx`, `base44/entities/Doctor.jsonc` | `_reversa_sdd/medicos/requirements.md` | 🟢 Completo |
| **Templates** | `src/pages/Templates.jsx`, `base44/entities/Template.jsonc` | `_reversa_sdd/templates/requirements.md` | 🟢 Completo |
| **Logs de Acesso** | `src/pages/AccessLogs.jsx`, `base44/entities/AccessLog.jsonc` | `_reversa_sdd/logs-acesso/requirements.md` | 🟢 Completo |
| **Modo Offline (Mock Local)** | `src/api/mockClient.js`, `src/api/mockSeed.js`, switch em `base44Client.js` e `AuthContext.jsx` | `_reversa_sdd/modo-offline/` | 🟢 Completo |
| **Domínio e Regras** | Análise transversal | `_reversa_sdd/domain.md` | 🟢 Completo |
| **Arquitetura & ERD** | Análise estrutural | `_reversa_sdd/architecture.md`, `_reversa_sdd/c4-context.md`, `_reversa_sdd/c4-containers.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/erd-complete.md`, `_reversa_sdd/traceability/spec-impact-matrix.md` | 🟢 Completo |

---
*Gerado pelo Reversa-Writer em 2026-09-02.*

---

## Rastreabilidade Spec → Código → Teste

> Seção acrescentada em 2026-09-19 na sessão de prova automatizada do módulo Pacientes.
>
> A tabela acima é a matriz da **extração original** (legado → spec) e permanece como
> registro histórico. Duas ressalvas de leitura, para ela não enganar quem a consulta:
>
> 1. Os arquivos `.jsx` que ela cita **não existem mais**: foram convertidos para
>    `.tsx`/`.ts` pela feature `001-migracao-typescript`
>    (`_reversa_sdd/addenda/001-migracao-typescript.md`).
> 2. A prova automatizada **não nasceu dentro daquela feature**. A §6.1 do
>    `requirements.md` dela congelou, por decisão humana registrada, que "nenhum
>    arcabouço de teste automatizado é adicionado nesta feature". O arcabouço entrou
>    depois, fora do ciclo forward, e até agora não tinha registro na extração.
>
> Esta seção é o registro explícito do **terceiro pilar** — `spec promete → código
> cumpre → teste prova` — ligado pelo próprio documento. Ela não substitui
> `/reversa-sync`: a convergência formal da entrega na extração (adendo da feature
> responsável pelo arcabouço) continua sendo o caminho canônico.

### Módulo Pacientes

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| **BR-P01** — só paciente com status `ativo` pode ser selecionado para novo agendamento ou consulta | `src/pages/NewConsultation.tsx`, `src/pages/NewAppointment.tsx` — consulta enviada com `{ status: 'ativo' }` | `src/pages/__tests__/ActivePatientSelection.test.tsx` (4 testes: contrato da consulta nos dois fluxos + lista oferecida + ausência do inativo) | 🟢 |
| **BR-P02** — `blood_type` restrito ao enum ABO/Rh mais `desconhecido` | `src/pages/PatientForm.tsx` (`BLOOD_TYPES`), `src/types/Patient.ts` | `src/pages/__tests__/PatientForm.test.tsx` (execução) + `npm run prova:negativos`, caso `status-fora-do-conjunto` (compilação) | 🟢 |
| **BR-P03** (cadastro) — `full_name`, `cpf`, `birth_date`, `phone` e `lgpd_consent` obrigatórios; o cadastro é recusado sem aceite | `src/pages/PatientForm.tsx` (`handleSubmit`) | `src/pages/__tests__/PatientForm.test.tsx` | 🟢 |
| **BR-P03** (aceite) — no momento do aceite são gravados `lgpd_consent_date` e `lgpd_consent_ip` | `src/pages/PatientForm.tsx` (`handleLGPDAccept`) | `src/pages/__tests__/PatientForm.test.tsx` | 🟢 |
| **BR-P03** (alteração) — editar não reexige consentimento e preserva o aceite original | `src/pages/PatientForm.tsx` | `src/pages/__tests__/PatientForm.test.tsx` | 🟢 |
| **RN-06** da feature 001 — consentimento aceito exige data e endereço de rede | `src/pages/PatientForm.tsx`, `src/types/Patient.ts` | Em execução: `PatientForm.test.tsx`. Em compilação: `npm run typecheck` | 🟢 |
| Falha de gravação (cadastro **e** alteração) mantém o formulário preenchido, anuncia em toast destrutivo e **não** redireciona | `src/pages/PatientForm.tsx` (`onError`) | `src/pages/__tests__/PatientForm.test.tsx` (3 testes: falha no cadastro, falha na edição e recusa sem mensagem) | 🟢 |
| Foto do paciente — prévia local, envio **antes** de salvar, `photo_url` vinda do envio persistida, e falha do envio não salva nada | `src/pages/PatientForm.tsx` (`handlePhotoChange`, `mutationFn`) | `src/pages/__tests__/PatientForm.test.tsx` (2 testes: envio bem-sucedido e envio recusado) | 🟢 |
| **§4 RLS** — leitura e escrita restritas ao criador do registro ou a admin, com o escopo **declarado** na leitura | `src/api/scopedRead.ts`, `src/api/sessionScope.ts`, `src/pages/PatientDetail.tsx` (`readOwned`), `src/pages/Patients.tsx` | `src/api/__tests__/scopedRead.test.ts`, `src/api/__tests__/sessionScope.test.ts`, `src/pages/__tests__/PatientDetail.test.tsx` | 🟢 |
| Listagem com contador, busca por nome, CPF, telefone e email, e filtro por status | `src/pages/Patients.tsx` | `src/pages/__tests__/Patients.test.tsx` | 🟢 |
| Detalhe clínico — dados cadastrais, idade, convênio, carteirinha, alergias, condições crônicas e medicamentos em uso | `src/pages/PatientDetail.tsx` | `src/pages/__tests__/PatientDetail.test.tsx` | 🟢 |
| Abas do histórico — contador por tipo e **cada aba exibe apenas o seu tipo** de evento | `src/pages/PatientDetail.tsx` (repasse por aba), `src/components/medical/ConsultationTimeline.tsx` (desenho de cada tipo) | `src/pages/__tests__/PatientDetail.test.tsx` (repasse) e `src/components/medical/__tests__/ConsultationTimeline.test.tsx` (combinação e ordenação) | 🟢 |
| Estado "Paciente não encontrado" com retorno para a lista, **sem** registrar auditoria de visualização | `src/pages/PatientDetail.tsx` | `src/pages/__tests__/PatientDetail.test.tsx` | 🟢 |
| Exclusão exige confirmação explícita; **cancelar não exclui** | `src/pages/PatientDetail.tsx` | `src/pages/__tests__/PatientDetail.test.tsx` (2 testes: confirmar e cancelar) | 🟢 |
| Auditoria — visualização e exclusão gravadas na trilha de acesso | `src/components/medical/AccessLogger.ts`, `src/pages/PatientDetail.tsx` | `src/pages/__tests__/PatientDetail.test.tsx` | 🟢 |
| Linha do tempo clínica — combina os quatro tipos de evento e ordena do mais recente para o mais antigo | `src/components/medical/ConsultationTimeline.tsx` | `src/components/medical/__tests__/ConsultationTimeline.test.tsx` | 🟢 |
| Busca reutilizável de paciente por nome, CPF e telefone, com mínimo de caracteres | `src/components/medical/PatientSearch.tsx` | `src/components/medical/__tests__/PatientSearch.test.tsx` | 🟢 |

### Módulo Agendamentos

> Acrescentado em 2026-09-21 pela feature `003-prova-agendamentos` (RF-06).
>
> ⚠️ **A citação qualificada é obrigatória aqui (RN-07).** Este é o único módulo da
> extração com **duas famílias distintas** de códigos `BR-A0x` convivendo:
> `_reversa_sdd/domain.md#2.2` e `_reversa_sdd/agendamentos/requirements.md#2` usam os
> mesmos códigos para regras **diferentes**. `BR-A01` sozinho não identifica regra
> nenhuma, e é por isso que toda linha abaixo nomeia o artefato de origem.
>
> | Código | Em `domain.md#2.2` | Em `agendamentos/requirements.md#2` |
> |---|---|---|
> | BR-A01 | O agendamento nasce `agendado` e precisa ser `confirmado` antes do atendimento | `patient_id`, `doctor_id` e `date` são obrigatórios |
> | BR-A02 | Ao concluir a consulta, o agendamento deve ser marcado `concluido` (🟡, inferida) | O paciente selecionado deve estar `ativo` |
> | BR-A03 | O painel exclui agendamentos `cancelados` das contagens | O ciclo de status, com transição manual |
> | BR-A04 | — | O horário deve respeitar jornada e duração do médico |

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| **BR-A01** de `agendamentos/requirements.md#2` — um agendamento exige `patient_id`, `doctor_id` e `date` | `src/pages/NewAppointment.tsx` (portão do botão de salvamento) | `src/pages/__tests__/NewAppointment.test.tsx` — "libera o salvamento apenas com paciente, médico e data": percorre o portão passo a passo, do desabilitado ao habilitado, e afirma que chegar ao estado liberado **não** grava nada | 🟢 |
| **BR-A02** de `agendamentos/requirements.md#2` — o paciente do agendamento deve estar `ativo` | `src/pages/NewAppointment.tsx` (consulta enviada com `{ status: 'ativo' }`) | `src/pages/__tests__/ActivePatientSelection.test.tsx` — 4 verificações, uma delas o fluxo de novo agendamento; o inativo não aparece nem por nome nem por CPF | 🟢 |
| **BR-A01** de `domain.md#2.2` — o agendamento nasce `agendado` e é `confirmado` antes do atendimento | `src/pages/Appointments.tsx`, `src/pages/NewAppointment.tsx` | `src/pages/__tests__/Appointments.test.tsx` — "mostra o agendamento recém-criado com a situação agendado" e "grava a transição para confirmado pelo diálogo"; `NewAppointment.test.tsx` prova que a criação envia `status: 'agendado'` | 🟢 |
| **BR-A03** de `agendamentos/requirements.md#2` — o ciclo de status é manual; `reminder_sent` e `reminder_sent_date` são apenas flags | `src/pages/Appointments.tsx` (diálogo de detalhes) | `src/pages/__tests__/Appointments.test.tsx` — "não transiciona o agendamento quando a consulta vinculada já está concluída" e "as flags de lembrete não alteram a situação" | 🟢 |
| **BR-A03** de `domain.md#2.2` — o painel exclui agendamentos `cancelados` das contagens | `src/pages/Appointments.tsx` (`upcomingAppointments`) | `src/pages/__tests__/Appointments.test.tsx` — "persiste a saída para cancelado: o agendamento deixa a lista de próximos" (o contador volta a zero e o registro some) | 🟢 |
| **BR-A04** de `agendamentos/requirements.md#2` — o horário respeita `working_days`, `working_hours` e `appointment_duration` | `src/components/appointments/TimeSlotPicker.tsx` (`generateTimeSlots`) | `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` — 10 verificações, incluindo os dois casos de borda silenciosos | 🟢 **com ressalva** — ver a nota abaixo da tabela |
| **BR-A02** de `domain.md#2.2` — "ao concluir uma consulta, o agendamento correspondente deve ser marcado `concluido`" | ⚠️ **Nenhum código cumpre esta redação** | `src/pages/__tests__/Appointments.test.tsx` prova o **oposto**: a consulta concluída não move o agendamento | 🟢 para o comportamento provado · 🔴 para a regra como escrita |
| **RN-03** da feature 003 — a disponibilidade distingue **três** comportamentos, e não um | `src/components/appointments/TimeSlotPicker.tsx` | `TimeSlotPicker.test.tsx` — seis verificações cobrem a distinção: fora da jornada e dia fora dos dias de trabalho **não geram**; ocupado **é gerado e desabilitado**; dia inteiro vazio exibe mensagem própria | 🟢 |
| **RN-04** da feature 003 — a janela de conflito é **pontual**, e a sobreposição por duração maior **não** é detectada | `src/components/appointments/TimeSlotPicker.tsx` (`isSlotAvailable`) | `TimeSlotPicker.test.tsx` — "não detecta sobreposição quando o novo atendimento avança sobre o existente": existente 10:30–11:00, novo de 60 min, e 10:00 segue **habilitado** | 🟢 |
| **RN-05** da feature 003 — o e-mail sai **antes** da confirmação de sucesso, e a falha deixa o registro gravado sem feedback | `src/pages/NewAppointment.tsx` (`saveMutation`: `create` → `SendEmail` → `onSuccess`) | `NewAppointment.test.tsx` — "envia o e-mail antes de confirmar o sucesso da gravação" (afirma a ordem observada dos três efeitos) e "mantém o agendamento gravado e não confirma sucesso quando o e-mail falha" | 🟢 |
| **RN-02** da feature 003 — o ciclo de status permanece manual; nenhuma prova pressupõe automação | `src/pages/Appointments.tsx` | `Appointments.test.tsx` — a ausência de gatilho é afirmada pelo **valor** do status depois, e não pela ausência de chamadas | 🟢 **com vacuidade declarada** — ver a nota abaixo da tabela |
| O salvamento **não revalida** o horário escolhido — o portão exige apenas paciente, médico e data | `src/pages/NewAppointment.tsx` | `NewAppointment.test.tsx` — "não revalida a jornada ao salvar: grava o horário sob um dia sem atendimento" e "não revalida conflito ao salvar: grava o horário que a tela marca como ocupado" | 🟢 |
| A criação do agendamento grava o contrato completo: vínculos, data, duração, tipo e situação inicial | `src/pages/NewAppointment.tsx` | `NewAppointment.test.tsx` — "cria o agendamento a partir da tela e confirma o sucesso" (afirma os cinco campos e a confirmação) | 🟢 |

> **Ressalva da BR-A04 — o que a prova **não** afirma.** O laço de geração confere apenas
> se o horário **começa** antes do fim do expediente; ele **não** confere se o horário
> **cabe** na duração. Com `appointment_duration` de 45 minutos e expediente até as 18:00,
> a grade inclui 17:45, que terminaria às 18:30. A prova registra esse comportamento real
> em vez de afirmar a redação do cenário PT-003.3, que promete o contrário.
>
> **Vacuidade da RN-02 — o que a prova **vigia** sem exercitar.** `consultation_id` existe
> no schema, mas **nada no sistema o lê ou escreve**, e `Consultation` não tem
> `appointment_id`. Não há caminho de código que ligue consulta a agendamento, então a
> verificação que afirma "concluir a consulta não transiciona" **não percorre caminho
> nenhum**: ela é guarda de regressão para o dia em que o auto-vínculo existir, não prova
> de um fluxo exercitado. Está declarada como tal — ver `#Lacunas de prova`.

### Contrato de dados e sessão (transversal)

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| Verificações negativas do gate de tipos são reproduzíveis por comando | `src/test/verificacoes-negativas.mjs` | `npm run prova:negativos` — 9 casos, recusa conferida **pelo motivo** e sem resíduo | 🟢 |
| Cadastro de paciente no modo offline aparece na listagem escopada (defeito DIV-01, **W009 da feature `001-migracao-typescript`**) | `src/api/mockClient.ts`, `src/api/registry.ts`, `src/api/scopedRead.ts` | `src/api/__tests__/mockClient.test.ts` — cadastra pelo adaptador e relê por `listOwned` e `filterOwned` | 🟢 |
| Contrato único de acesso a dados, honrado tanto pelo modo online quanto pelo offline | `src/api/contract.ts`, `src/api/base44Client.ts`, `src/api/mockClient.ts`, `src/api/registry.ts` | `src/api/__tests__/mockClient.test.ts` (execução) + `npm run typecheck` (compilação) | 🟢 |
| Sessão autenticada convertida para o tipo de domínio; a ausência de papel no modo offline é explícita, não silenciosa | `src/lib/session.ts`, `src/lib/AuthContext.tsx`, `src/api/sessionScope.ts` | `src/lib/__tests__/AuthContext.test.tsx`, `src/api/__tests__/sessionScope.test.ts` | 🟢 |
| A árvore de prova não contém texto corrompido por codificação, e todo arquivo é UTF-8 válido | `src/test/mojibake.mjs`, `.github/workflows/guarda-encoding.yml` | `src/test/mojibake.test.mjs` — 8 verificações: autoteste do detector (acusa e reverte sem perda, não acusa texto correto, não confunde acento legítimo) e varredura de `src/` e `_reversa_*`. Fora da suíte: `npm run prova:encoding` | 🟢 |

### Como a prova é executada

```bash
npm test                  # a suíte completa
npm run typecheck         # gate de tipos estrito
npm run lint              # eslint --quiet
npm run prova:negativos   # casos negativos recusados, sem resíduo
npm run prova:encoding    # guarda de encoding fora da suíte
```

Medições, sobre o código desta árvore de trabalho (teto declarado: **90 segundos**):

| Medição | Verificações | Arquivos | Tempo | Falhas |
| :--- | ---: | ---: | ---: | ---: |
| 2026-09-19, após a feature `002-prova-automatizada` | 36 | 10 | 32,5 s | 0 |
| 2026-09-21, após a feature `003-prova-agendamentos` | 66 | 14 | 57,9 s | 0 |

O acréscimo da feature 003 foi de **30 verificações em 4 arquivos** — 22 nas três provas do
módulo de Agendamentos e 8 na guarda de encoding —, com o tempo ainda **32 segundos abaixo
do teto**.

`typecheck` e `lint` são gates independentes (**RN-05 da feature `002-prova-automatizada`**):
o primeiro confere forma em tempo de compilação, o segundo confere estilo e imports mortos.
A suíte exige **acesso ampliado** para subir neste ambiente: o esbuild do vitest abre pipe
nomeado e falha com `spawn EPERM` em modo confinado (mesma restrição registrada no
onboarding da feature 001, §7).

> ⚠️ **Prova sem dono no ciclo forward.** `src/test/mojibake.mjs` e
> `src/test/mojibake.test.mjs` nasceram no commit `ea87955` (`test(encoding): adiciona
> guarda de mojibake com portao no ci`) e **não pertencem ao `actions.md` de feature
> nenhuma** — foram criados fora do ciclo forward. Estão registrados aqui para que a matriz
> não omita uma prova que existe, mas a rastreabilidade deles é incompleta por construção:
> não há `requirements.md` que os prometa nem ação que os exija, e o mesmo vale para
> `.github/workflows/guarda-encoding.yml`. Regularizar isso é trabalho de feature própria,
> não desta.

### Cenários de paridade do módulo Pacientes

Os 5 cenários de paridade que pertencem a este módulo, com o destino de cada um
(feature `002-prova-automatizada`, RF-08):

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-001.1 — cadastro sem aceite LGPD é recusado | `parity_tests/01-cadastro-paciente-lgpd.feature` | 🟢 | `PatientForm.test.tsx` prova a recusa e a ausência de escrita. A metade "nenhum registro existe no repositório" é do servidor e **não** é provável no cliente |
| PT-001.2 — aceite registra data e IP no save | `parity_tests/01-cadastro-paciente-lgpd.feature` | 🟢 | `PatientForm.test.tsx` |
| PT-001.3 — CPF tratado como dado sensível | `parity_tests/01-cadastro-paciente-lgpd.feature` | 🔴 | **Desdobrado.** A marcação do campo sensível no contrato é provada pelo gate de tipos; a **criptografia em repouso acontece no backend** e não é provável no cliente — lacuna declarada |
| PT-002.1 — paciente inativo não aparece na seleção | `parity_tests/02-selecao-paciente-ativo.feature` | 🟢 | `ActivePatientSelection.test.tsx` — o inativo não aparece nem por nome nem por CPF |
| PT-002.2 — paciente ativo é selecionável | `parity_tests/02-selecao-paciente-ativo.feature` | 🟢 | `ActivePatientSelection.test.tsx` |

### Cenários de paridade do módulo Agendamentos

Os 8 cenários de paridade que pertencem a este módulo, com o destino de cada um.
Acrescentado em 2026-09-21 pela feature `003-prova-agendamentos` (RF-01, RF-02 e RF-07).

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-003.1 — horário fora do `working_hours` é rejeitado | `parity_tests/03-agendamento-jornada-medico.feature` | 🟢 **com redação imprecisa** | `TimeSlotPicker.test.tsx` prova o que de fato acontece: com jornada até 18:00, nada a partir de 18:00 é gerado. A redação do cenário — *"rejeitado com indicação de horário indisponível"* — **não** corresponde ao sistema: não há recusa nem indicação, porque o horário nunca chega a existir. A imprecisão fica declarada; corrigir o `.feature` é trabalho da extração |
| PT-003.2 — dia fora do `working_days` é rejeitado | `parity_tests/03-agendamento-jornada-medico.feature` | 🟢 | `TimeSlotPicker.test.tsx` — em sábado nenhum horário é gerado **e** a tela exibe a mensagem própria ao usuário |
| PT-003.3 — slot que não cabe na duração é rejeitado | `parity_tests/03-agendamento-jornada-medico.feature` | 🟢 **só no exemplo** | O caso do cenário confere: 17:45 não é oferecido com duração de 30 e fim às 18:00. Mas confere por **coincidência da grade** — 17:45 não é um passo da grade de 30 minutos —, não por validação de duração. A regra geral que o cenário enuncia é **falsa**: com duração de 45 minutos, 17:45 **é** gerado e terminaria às 18:30. Provado em `TimeSlotPicker.test.tsx` |
| PT-003.4 — horário válido é aceito e o agendamento nasce `agendado` | `parity_tests/03-agendamento-jornada-medico.feature` | 🟢 | `NewAppointment.test.tsx` — a criação grava `status: 'agendado'` com a data escolhida e a tela confirma o sucesso |
| PT-004.1 — o agendamento nasce `agendado` e é confirmado manualmente | `parity_tests/04-ciclo-status-agendamento.feature` | 🟢 | `Appointments.test.tsx` — duas verificações: o valor inicial na lista e a transição pelo diálogo, com releitura do armazém numa segunda renderização (o que se afirma é o valor persistido, não a chamada) |
| PT-004.2 — concluir a consulta **não** transiciona o agendamento automaticamente | `parity_tests/04-ciclo-status-agendamento.feature` | 🟢 **com vacuidade declarada** | `Appointments.test.tsx` afirma o **valor** do status depois, e não a ausência de chamadas. Mas o cenário é **inexercitável hoje**: nada no sistema liga consulta a agendamento — `consultation_id` é código morto e `Consultation` não tem `appointment_id`. Vale como guarda de regressão para o dia em que o auto-vínculo existir, não como prova de fluxo exercitado |
| PT-004.3 — as flags de lembrete não alteram o status | `parity_tests/04-ciclo-status-agendamento.feature` | 🟢 | `Appointments.test.tsx` — com `reminder_sent = true` e `reminder_sent_date` preenchida, a lista segue mostrando "Agendado" e o seletor do diálogo vale `agendado` |
| PT-004.4 — cancelar e marcar falta são transições válidas | `parity_tests/04-ciclo-status-agendamento.feature` | 🟢 | `Appointments.test.tsx` — duas verificações: `cancelado` é persistido e o registro **sai** da lista de próximos; `faltou` é persistido pelo seletor e o registro **permanece** na lista, com a situação nova escrita na tela |

### Destino dos cenários de paridade não cobertos nesta feature

Decisão da sessão de esclarecimentos de 2026-09-19: a conversão é **fatiada por módulo**.
Cada grupo abaixo vira feature própria; nenhum cenário fica sem destino.

| Grupo | Cenários | Destino |
| :--- | ---: | :--- |
| Agendamentos (`03`, `04`) | 8 | ✅ **Concluído** na feature `003-prova-agendamentos` — ver `#Cenários de paridade do módulo Agendamentos` |
| Modo offline (`09`) | 6 | Feature a criar — conversão dos cenários de fluxo do modo offline |
| Dashboard (`08`) | 5 | Feature a criar — depende de resolver a lacuna da Taxa de Atendimento (`confidence-report.md#Lacunas 🔴 pendentes`) |
| Templates (`06`) | 4 | Feature a criar — conversão dos cenários de fluxo de documentos e modelos |
| Logs de acesso (`07`) | 4 | Feature a criar — conversão dos cenários de fluxo da trilha de auditoria |
| Contrato de dados (`10`) | 4 | Feature a criar — contrato único honrado pelos dois modos |
| Consultas (`05`) | 3 | Feature a criar — máquina de estados da consulta |
| Paridade visual (`screens/V01` a `V16`) | 16 | **Lacuna declarada.** A captura dourada de referência não existe no repositório (`present: false`); produzi-la é trabalho de outra natureza |

> **Saldo após a feature `003-prova-agendamentos` (2026-09-21).** Dos 50 cenários que a
> feature 002 transferiu, **8 estão concluídos** (Agendamentos) e **26 permanecem
> transferidos** para features próprias. Os 16 de paridade visual seguem declarados como
> lacuna, e não como trabalho transferido.

### Lacunas de prova

Registradas de propósito: uma matriz que só mostra 🟢 não é honesta. O que já foi fechado
está marcado como fechado, e o que permanece aberto tem razão declarada.

| Lacuna | Situação após a feature `003-prova-agendamentos` |
| :--- | :--- |
| **BR-P02** (enum de tipo sanguíneo) | ✅ **Fechada.** Prova de execução em `PatientForm.test.tsx` (o formulário oferece exatamente os 9 valores) e caso negativo `status-fora-do-conjunto` em `npm run prova:negativos` |
| **Verificações negativas do gate de tipos** (T031–T036, T039, T045, T046) | ✅ **Fechada.** `npm run prova:negativos` reproduz 9 casos por comando, confere a recusa pelo motivo certo e não deixa resíduo |
| **Paridade do módulo Pacientes** (5 cenários) | ✅ **Fechada**, com o desdobramento do PT-001.3 declarado |
| **Paridade do módulo Agendamentos** (8 cenários) | ✅ **Fechada**, com três ressalvas declaradas: a redação imprecisa de PT-003.1 e PT-003.3 e a vacuidade de PT-004.2 |
| **Paridade dos módulos restantes** (34 → 26 cenários) | 🟡 **Parcialmente concluída.** Agendamentos (8) saiu do grupo nesta feature; **26 permanecem transferidos**, com destino declarado por grupo na seção acima |
| **Modo offline de ponta a ponta** (recorte DIV-01) | ✅ **Fechada** para o paciente: `mockClient.test.ts` cadastra pelo adaptador e relê pela leitura escopada. As limitações L1 a L7 do adaptador permanecem declaradas e não são provadas |
| **Paridade visual** (16 cenários) | 🔴 **Declarada.** Depende de captura dourada inexistente |
| **Criptografia do CPF em repouso** | 🔴 **Declarada.** Acontece no backend; o cliente prova apenas a marcação de campo sensível |
| **Build de produção** | 🟡 **Declarada.** `npm run build` passou na máquina do responsável em 2026-09-17; nenhuma prova automatizada cobre o empacotamento |
| **Concorrência entre abas no modo offline** | 🟡 **Declarada.** Limitação L2 herdada, registrada em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` |
| **As lacunas do módulo de Agendamentos** (`code-analysis.md#9`) | ⚠️ **Declaradas, não provadas** — decisão D-07 do `roadmap.md` da feature 003. Detalhe linha a linha na seção abaixo |
| **Divergência entre as duas visões de disponibilidade** | 🔴 **Declarada, sem prova.** O calendário semanal usa grade fixa de 8h às 19h, independente da jornada do médico, enquanto a seleção de horário respeita a jornada. O calendário é visão de agenda, não de disponibilidade — decidido em 2026-09-19 |
| **Ausência de validação do horário no salvamento** | ✅ **Provada como comportamento atual.** O portão exige apenas paciente, médico e data; jornada e conflito não são revalidados. É promessa provada com prova, e não lacuna — está aqui porque corrigir mudaria comportamento observável |
| **Colisão das famílias `BR-A0x`** | 🟡 **Contornada por citação qualificada.** A raiz é defeito documental da extração: dois artefatos usam os mesmos códigos para regras diferentes. Renumerar invalidaria citações existentes, inclusive da feature 001 — a resolver numa re-extração |
| **Citação `W009` sem qualificação de feature** | ✅ **Corrigida nesta feature.** A matriz citava `W009` nu na linha do defeito DIV-01, mas esse identificador só existe no watch da feature `001-migracao-typescript` — o watch da 002 vai até `W008`. Como os IDs `W00x` reiniciam a cada feature, a citação nua simplesmente não resolvia |
| **Prova de encoding sem dono no ciclo forward** | 🟡 **Declarada.** `src/test/mojibake.{mjs,test.mjs}` e `.github/workflows/guarda-encoding.yml` existem e passam, mas nasceram fora do `actions.md` de qualquer feature. Ver a nota em `#Como a prova é executada` |
| **Contagem das lacunas do módulo de Agendamentos** | 🔴 **Divergência declarada.** O artefato tem 11 linhas e o `requirements.md` da feature fala em 10 — detalhe na seção abaixo |

> A tabela anterior a 2026-09-21 trazia o rótulo "Situação após a feature
> `002-prova-automatizada`". O instantâneo daquele momento está preservado, congelado, em
> `_reversa_sdd/addenda/002-prova-automatizada.md`; esta seção é a leitura **viva** e passa
> a refletir a feature 003.

### Lacunas declaradas do módulo de Agendamentos

`_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` traz — conforme a contagem
desta matriz — **onze** linhas, e não dez. A contagem do artefato e a do `requirements.md`
da feature 003 divergem, e a divergência é registrada em vez de silenciada:

- o artefato `code-analysis.md#9` tem **11 linhas de tabela**;
- o `requirements.md` da feature 003 fala em **dez lacunas** (RF-07, §6.1 e §10) e enumera
  **nove** delas em §10, omitindo "sem dedupe / sem modo de edição" e a própria linha
  "sem testes".

Decisão desta rodada: a matriz dá veredito às **onze**, porque omitir uma linha por
divergência de contagem seria esconder uma lacuna atrás de um erro aritmético.

| # | Lacuna em `code-analysis.md#9` | Severidade | Veredito após a feature 003 |
| ---: | :--- | :---: | :--- |
| 1 | `STATUS_CONFIG` (Appointments) vs `STATUS_COLORS` (AppointmentCalendar) | Média | 🔴 **Declarada, não provada.** Dois mapas paralelos de rótulo e cor. Comparar os dois módulos é prova de outra natureza, e a decisão D-07 fixou que nenhuma lacuna do módulo ganha prova nesta feature. Destino: `/reversa-refactor` (`code-analysis.md#11`, item 1) |
| 2 | Conflito entre envio de e-mail e confirmação de gravação | Média | 🟢 **Comportamento provado** em `NewAppointment.test.tsx` · 🔴 **o defeito permanece.** A prova documenta a ordem e o silêncio da falha; não corrige. Destino: feature própria — mover `SendEmail` para `onSuccess` ou tratar o erro |
| 3 | Sem dedupe contra o próprio agendamento em edição | Baixa | 🔴 **Declarada.** Não existe modo de edição, apenas criação. É consequência da ausência de funcionalidade, não defeito de código existente |
| 4 | `reminder_sent` / `reminder_sent_date` órfãos | Média | 🟢 **Comportamento provado** em `Appointments.test.tsx` · 🔴 **a orfandade permanece.** Está provado que as flags **não** alteram o status; nada está provado sobre quem as escreveria, porque nenhum código de envio de lembrete existe |
| 5 | `consultation_id` sem auto-link | **Alta** | 🔴 **Declarada, não provada** — decisão explícita de 2026-09-19. É a razão pela qual o cenário PT-004.2 é **vazio**: sem auto-vínculo, não há caminho de código que ligue consulta a agendamento. Destino: `code-analysis.md#11`, item 3 |
| 6 | O calendário desabilita só datas passadas inteiras | Baixa | 🔴 **Declarada.** Irmã da divergência calendário × seleção de horário, também declarada. Prová-la exigiria cenários fora dos 8 de paridade do módulo |
| 7 | `working_days`/`working_hours` sem fallback se ausentes | Média | 🟢 **Provado — e a redação da lacuna está imprecisa.** O código **tem** fallback para `working_hours`: sem janela configurada, usa 08:00–18:00 (`TimeSlotPicker.test.tsx`). O que de fato não tem fallback é `working_days`: sem dias informados, nenhum horário é gerado e o médico desaparece da agenda — como a lacuna descreve. A lacuna vale para metade do que enuncia |
| 8 | Sem validação de fim de semana / feriado | Baixa | 🔴 **Declarada.** Fora do escopo por §6.1: o sistema considera apenas os dias de trabalho do médico |
| 9 | Concorrência em criação simultânea | **Alta** | 🔴 **Declarada, não provada** — decisão explícita de 2026-09-19, e uma das **duas de severidade Alta que não ganham prova** nesta feature. Não é provável no cliente: exigiria dois criadores concorrentes contra o mesmo backend |
| 10 | `upcomingAppointments` considera o timestamp completo | Baixa | 🔴 **Declarada.** Não é provável pelo `TimeSlotPicker`; a massa de prova contorna a consequência usando sempre datas futuras derivadas (`W008` da feature 003) |
| 11 | Sem testes | **Alta** | ✅ **Fechada para este módulo.** Era "a maior superfície do sistema sem prova de execução": hoje tem 22 verificações em 3 arquivos. Permanece aberta como afirmação sobre o projeto inteiro — seis módulos seguem sem prova |

> São **três** linhas de severidade Alta, e não duas: além das duas acima — auto-vínculo
> (#5) e concorrência (#9) —, a própria linha "sem testes" (#11) também é Alta. Ela é a
> única das três que esta feature fecha, e apenas para este módulo.

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
*Seção de rastreabilidade acrescentada em 2026-09-19; módulo de Agendamentos e lacunas em 2026-09-21.*
