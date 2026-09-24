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

### Módulo Consultas

> Acrescentado em 2026-09-21 pela feature `004-prova-consultas` (RF-11).
>
> ⚠️ **A citação qualificada é obrigatória aqui (RN-09).** Este módulo tem **duas famílias
> de códigos `BR-C` com grafia quase idêntica**: `_reversa_sdd/consultas/requirements.md#2`
> escreve `BR-C01`, `BR-C02`, `BR-C03` (**sem** hífen), enquanto
> `_reversa_sdd/code-analysis.md#6` escreve `BR-C-01` a `BR-C-12` (**com** hífen). São
> conjuntos **diferentes** de regras sobre o mesmo módulo, e a diferença de um caractere
> não é visível numa leitura rápida. Toda linha abaixo nomeia o artefato de origem.
>
> ⚠️ **`_reversa_sdd/domain.md#2` não tem família `BR-C` nenhuma.** As regras do módulo
> vivem nos dois artefatos acima; o `domain.md` só o alcança por `#2.4 Segurança e
> Auditoria` (BR-S01, BR-S02) e por `#3 Lacunas e Inconsistências`.

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| **BR-C01** de `consultas/requirements.md#2` — a consulta é vinculada a um `patient_id` válido | `src/pages/NewConsultation.tsx` (seleção de paciente) | `src/pages/__tests__/NewConsultation.test.tsx` — a criação é afirmada com o `patient_id` escolhido no objeto gravado, e o portão do salvamento não libera sem paciente | 🟢 para o que o cliente grava · 🔴 para a obrigatoriedade no schema, que é do servidor (D-06) |
| **BR-C02** de `consultas/requirements.md#2` — ciclo `agendada` → `em_andamento` → `concluida` (ou `cancelada`) | `src/pages/NewConsultation.tsx` (seletor), `src/pages/Consultations.tsx` (filtro), `src/pages/Consultation.tsx` (legenda) | Os três arquivos de verificação da feature: situação inicial, troca persistida, as quatro situações oferecidas, filtro por situação e legenda no detalhe | 🟢 |
| **BR-C03** de `consultas/requirements.md#2` — `medications` só em prescrições do tipo receita | `src/components/medical/PrescriptionEditor.tsx` (`type.includes('receita')`) | **Nenhum.** Fora do escopo desta feature | 🔴 **Declarada, não provada** |
| **BR-C-02** de `code-analysis.md#6` — o status é enum fechado de quatro valores | `src/types/Consultation.ts` (`ConsultationStatus`) | `npm run prova:negativos`, caso `status-fora-do-conjunto` — recusa `'finalizada'` citando a violação. O caso **já existia** desde a feature 001 (D-05) e não foi duplicado | 🟢 |
| **BR-C-03** de `code-analysis.md#6` — a criação exige paciente selecionado | `src/pages/NewConsultation.tsx:442` (`disabled={!selectedPatient \|\| isPending}`) | `NewConsultation.test.tsx` — "o portão exige paciente, e o campo de data é obrigatório no próprio controle", percorrendo o portão do desabilitado ao habilitado | 🟢 |
| **BR-C-04** de `code-analysis.md#6` — pacientes elegíveis para consulta têm status `ativo` | `src/pages/NewConsultation.tsx:92-95` (consulta com `{ status: 'ativo' }`) | `src/pages/__tests__/ActivePatientSelection.test.tsx` — 4 verificações, uma delas a de novo agendamento; o inativo não aparece nem por nome nem por CPF | 🟢 |
| **RN-03** da feature 004 — a situação inicial depende do **caminho de criação** | `src/pages/NewConsultation.tsx:72` e `:127` | `NewConsultation.test.tsx` — os **dois caminhos observáveis no cliente**: o formulário grava `em_andamento`, e o modo edição cai em `em_andamento` quando o registro não tem situação | 🟢 **com a ressalva do schema** — ver a nota abaixo da tabela |
| **RN-04** da feature 004 — o seletor oferece as **quatro** situações sem guarda de transição | `src/pages/NewConsultation.tsx:305-313` | `NewConsultation.test.tsx` — com o registro em `cancelada`, as quatro situações são oferecidas e `concluida` consta entre elas; a verificação percorre valores **e** rótulos | 🟢 |
| **RN-05** da feature 004 — nenhuma transição de situação é **automática** | `src/pages/Consultation.tsx` (mutações de documento e exame) | `Consultation.test.tsx` — duas verificações afirmam o **valor** exibido depois de emitir documento e depois de anexar exame | 🟢 |
| **RN-06** da feature 004 — `ConsultationStatus` é união fechada, verificada em compilação | `src/types/Consultation.ts` | `npm run prova:negativos`, caso `status-fora-do-conjunto` | 🟢 |
| **RN-07** da feature 004 — o salvamento exige paciente; a data é obrigatória **no controle**, e não no portão | `src/pages/NewConsultation.tsx:296-301` e `:442` | `NewConsultation.test.tsx` — o portão olha só o paciente, e o campo de data carrega `required`. As duas afirmações convivem, e a prova registra as duas | 🟢 |
| A ausência do **defeito de envio acidental** no formulário de consulta | `src/pages/NewConsultation.tsx` — todos os botões dentro do `<form>` declaram `type` | `NewConsultation.test.tsx` — nenhum controle interno grava, e o salvamento deliberado grava **exatamente uma vez** | 🟢 |
| O filtro por situação da listagem e a tolerância ao registro **sem** situação | `src/pages/Consultations.tsx:88` e `:115-116` | `Consultations.test.tsx` — filtro por cada situação, o registro sem situação ausente em todos os filtros específicos, e o estado vazio | 🟢 |
| Os quatro recortes de intervalo de data da listagem | `src/pages/Consultations.tsx:90-109` | `Consultations.test.tsx` — `today`, `week`, `month` e `upcoming`, com o `Date` congelado (D-04) | 🟢 **com o achado do recorte "semana"** — ver a nota abaixo da tabela |
| **RN-10** da feature 004 — a emissão de documento **não** gera trilha de auditoria | `src/pages/Consultation.tsx:120-124` (mutação de prescrição, sem auditoria) contra `src/components/medical/ExamUploader.tsx:143-149` (auditoria interna) | `Consultation.test.tsx` — medido no **transporte** (`AccessLog`), com `AccessLogger` real: emitir documento não grava, anexar exame grava `upload_exam` | 🟢 |
| **BR-S01** de `domain.md#2.4` — todo acesso ou alteração de dado sensível gera log | ⚠️ **Nenhum código cumpre esta redação no fluxo de prescrição** | `Consultation.test.tsx` prova a assimetria; nenhum código liga a ação `create_prescription` ao fluxo | 🔴 **Divergência provada** — ver a nota abaixo da tabela |
| **BR-C-12** de `code-analysis.md#6` — ao salvar, redireciona para o detalhe do paciente | `src/pages/NewConsultation.tsx:162-169` | `NewConsultation.test.tsx` cobre a navegação no cancelamento; o **destino** do sucesso não é afirmado | 🟡 **Parcial** |

> **Ressalva da RN-03 — a metade que não é provável.** O default `agendada` é aplicado pelo
> servidor e **não é observável no cliente**. O que o cliente mostra é o oposto: o
> formulário grava `em_andamento` e o fallback para registro sem situação também é
> `em_andamento`. Provar o texto de `Consultation.jsonc` provaria o conteúdo de um arquivo,
> não o comportamento do sistema (decisão D-06). O cenário Gherkin *"Consulta sem situação
> informada cai no default do schema"* é, portanto, **declarado** — e marcá-lo 🟢 sem esta
> ressalva seria mentira.
>
> **Achado do recorte "última semana".** O recorte é `consultDate >= hoje - 7 dias`, **sem
> limite superior**. Ele não é "última semana" no sentido de passado: **inclui consultas
> futuras**. A prova registra isso como comportamento real, e a verificação afirma as quatro
> do conjunto — duas de hoje, uma de três dias atrás e uma de três dias à frente.
>
> **Divergência provada na BR-S01.** `ACCESS_ACTIONS` declara **doze** ações auditáveis
> (`src/components/medical/AccessLogger.ts:22-35`) e apenas **nove** são invocadas. As três
> órfãs são `create_prescription`, `logout` e `export_data`. A primeira é a que importa: o
> fluxo de emissão existe, a ação existe, e **nada liga os dois** — emitir uma receita, que
> é documento derivado de diagnóstico, não deixa rastro. O exame, em contraste, audita por
> dentro do componente. O comportamento está provado; o defeito **não** foi corrigido.

### Contrato de dados e sessão (transversal)

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| Verificações negativas do gate de tipos são reproduzíveis por comando | `src/test/verificacoes-negativas.mjs` | `npm run prova:negativos` — **18 casos** (17 negativos e 1 positivo), recusa conferida **pelo motivo** e sem resíduo | 🟢 |
| Cadastro de paciente no modo offline aparece na listagem escopada (defeito DIV-01, **W009 da feature `001-migracao-typescript`**) | `src/api/mockClient.ts`, `src/api/registry.ts`, `src/api/scopedRead.ts` | `src/api/__tests__/mockClient.test.ts` — cadastra pelo adaptador e relê por `listOwned` e `filterOwned` | 🟢 |
| Contrato único de acesso a dados, honrado tanto pelo modo online quanto pelo offline | `src/api/contract.ts`, `src/api/base44Client.ts`, `src/api/mockClient.ts`, `src/api/registry.ts` | `src/api/__tests__/mockClient.test.ts` (execução) + `npm run typecheck` (compilação) | 🟢 |
| Sessão autenticada convertida para o tipo de domínio; a ausência de papel no modo offline é explícita, não silenciosa | `src/lib/session.ts`, `src/lib/AuthContext.tsx`, `src/api/sessionScope.ts` | `src/lib/__tests__/AuthContext.test.tsx`, `src/api/__tests__/sessionScope.test.ts` | 🟢 |
| A árvore de prova não contém texto corrompido por codificação, e todo arquivo é UTF-8 válido | `src/test/mojibake.mjs`, `.github/workflows/guarda-encoding.yml` | `src/test/mojibake.test.mjs` — 8 verificações: autoteste do detector (acusa e reverte sem perda, não acusa texto correto, não confunde acento legítimo) e varredura de `src/` e `_reversa_*`. Fora da suíte: `npm run prova:encoding` | 🟢 |

### Como a prova é executada

```bash
npm test                  # a suíte completa
npm run typecheck         # gate de tipos estrito
npm run lint              # eslint --quiet
npm run prova:negativos   # 18 casos: 17 recusados pelo motivo certo e 1 positivo que deve compilar
npm run prova:encoding    # guarda de encoding, com dono desde a feature 008
```

Medições, sobre o código desta árvore de trabalho (teto declarado: **90 segundos**):

| Medição | Verificações | Arquivos | Tempo | Falhas |
| :--- | ---: | ---: | ---: | ---: |
| 2026-09-19, após a feature `002-prova-automatizada` | 36 | 10 | 32,5 s | 0 |
| 2026-09-21, após a feature `003-prova-agendamentos` | 66 | 14 | 57,9 s | 0 |
| 2026-09-21, após a feature `004-prova-consultas` | 90 | 17 | 63,7 s | 0 |
| 2026-09-21, após a feature `005-prova-templates` | 109 | 18 | 67,4 s | 0 |
| 2026-09-22, após a feature `006-prova-logs-acesso` | 132 | 23 | 75,8 s a 122,6 s | 0 |
| 2026-09-22, após a feature `009-prova-kpis-dashboard` | 145 | 24 | 85,9 s | 0 |
| 2026-09-22, após a feature `010-prova-modo-offline` | 168 | 26 | 69,8 s a 70,5 s | 0 |
| 2026-09-24, após a correção do F-01 (`011-rbac-frontend`) | 179 | 28 | 72,5 s a 101,5 s | 0 |

As três linhas de `005`/`006`/`009` foram acrescentadas por features posteriores — a tabela estava
parada na 004, e uma medição que não acompanha as features deixa de ser medição. A linha da `008`
**não existe de propósito**: aquela feature não acrescentou verificação de unidade nenhuma, e
repetir `132 / 23` só para preencher a linha criaria a impressão de que algo foi medido de novo.

> ⚠️ **A linha da `011` é a primeira do projeto que ultrapassou o teto declarado de 90 s nesta
> máquina**: 101,5 s na medição de fecho, contra **72,5 s da mesma suíte minutos antes**. Ela
> acrescenta 11 verificações e dois arquivos, o que não explica a diferença — a variação é da
> mesma natureza da registrada na rodada 006 (75,78 s calma / 122,57 s sob carga): o tempo mede o
> ambiente tanto quanto o código. Quem for conferir precisa medir duas vezes.

> ⚠️ **O tempo é uma propriedade CONDICIONAL, e a faixa da rodada 006 é o registro disso.** A
> mesma suíte, sem uma linha de diferença, mediu **75,78 s** em máquina calma e **122,57 s** sob
> carga — o teto foi cumprido numa e estourado na outra. O maior contribuinte individual é
> `PatientForm.test.tsx`, com 13,1 s, **pré-existente**. Quem for conferir precisa medir duas
> vezes antes de concluir qualquer coisa sobre o teto.

`typecheck` e `lint` são gates independentes (**RN-05 da feature `002-prova-automatizada`**):
o primeiro confere forma em tempo de compilação, o segundo **deveria** conferir estilo e imports
mortos.

> ⚠️ **Correção de 2026-09-24: o `lint` está VAZIO, e o "0 avisos" das medições não mede nada.**
> `eslint.config.js` casa apenas `src/components/**/*.{js,mjs,cjs,jsx}`,
> `src/pages/**/*.{js,mjs,cjs,jsx}` e `src/Layout.jsx`. Todos os `.jsx` que restam vivem em
> `src/components/ui/**`, que o **próprio config ignora**; e `src/Layout.jsx` deixou de existir na
> migração para `.tsx`. Nenhum arquivo do projeto é examinado. O gate de `typecheck` continua
> válido e é o que de fato cobre o código de aplicação — foi ele que sustentou a correção do F-01,
> e não o `lint`.
A suíte exige **acesso ampliado** para subir neste ambiente: o esbuild do vitest abre pipe
nomeado e falha com `spawn EPERM` em modo confinado (mesma restrição registrada no
onboarding da feature 001, §7).

**Paridade visual (16 cenários, prova por referência capturada).** A referência de tela existe
no repositório: **24 goldens** com `present: true` em 24 de 24 entradas, cobrindo **16 de 16**
cenários (`PT-V01`…`PT-V16`), mais 6 capturas de telas sem cenário V e 2 estados alternativos.
O `sha256` de cada tela está em `_reversa_sdd/screens/golden/manifest.yaml`, que é a **fonte
única** — esta matriz aponta para ele em vez de duplicar as 16 linhas. A conferência é
**construtiva** (mesma hierarquia, mesmos textos, mesmos tokens); comparação pixel a pixel
está fora de escopo (`DEV-001` em `migration/screen_deviation_log.md`), e a **execução**
automatizada depende do harness de paridade visual, ainda a criar.

> ⚠️ **Prova sem dono no ciclo forward — situação resolvida em 2026-09-22.** `src/test/mojibake.mjs`
> e `src/test/mojibake.test.mjs` nasceram no commit `ea87955` (`test(encoding): adiciona guarda de
> mojibake com portao no ci`) e **não pertenciam ao `actions.md` de feature nenhuma** — foram
> criados fora do ciclo forward. A feature `008-prova-contrato-dados` os **adotou por registro**
> (decisão `3a`): uma falha da guarda agora tem contrato dizendo qual promessa foi violada, e o
> mesmo vale para `.github/workflows/guarda-encoding.yml`. A adoção **não alterou** nenhum dos dois
> arquivos. A nota permanece aqui, no passado, porque foi esta lacuna que motivou a adoção — e
> porque apagá-la esconderia que a prova existiu sem dono por três features.

> ⚠️ **Correção de 2026-09-22 pela feature `009-prova-kpis-dashboard`.** Esta nota dizia, até esta
> rodada, que regularizar a guarda "é trabalho de feature própria, não desta" — redação que ficou
> **contraditória** quando a feature `008` fechou a lacuna. As duas afirmações conviviam no mesmo
> arquivo, a poucas linhas de distância. A redação foi corrigida; o registro histórico, preservado.

### Correção do F-01 — guarda de papel no frontend (2026-09-24)

Primeira mudança de **comportamento** registrada neste corpus depois do ciclo de provas. Ela não
nasceu de uma feature forward: nasceu de revisão de segurança, e é registrada aqui porque altera o
que a extração afirmava. O adendo é `_reversa_sdd/addenda/011-rbac-frontend.md`, e o watch vive em
`_reversa_forward/011-rbac-frontend/regression-watch.md`.

O que mudou, e a regra que autoriza cada parte:

| Mudança | Regra que autoriza |
| :--- | :--- |
| O item de navegação da trilha de auditoria passou a ser escondido de quem não é admin | BR-MIGRAR-024 — read/update/delete apenas `admin` |
| A rota `/AccessLogs` ganhou guarda de papel | BR-MIGRAR-024 |
| Criar, editar e excluir em **Médicos** passaram a ser escondidos de quem não é admin | BR-MIGRAR-015 — CRUD só admin |
| Criar, editar e excluir em **Templates**, incluindo o botão do estado vazio | BR-MIGRAR-020 — CRUD restrito a admin |
| **Médicos e Templates continuam visíveis e alcançáveis** por qualquer autenticado | BR-MIGRAR-017 e BR-MIGRAR-020 — **leitura livre** |

A última linha é o que separa a correção de um excesso, e é o ponto em que a primeira tentativa
errou: ela guardou as três rotas e promoveu o usuário offline a `admin` para a guarda passar. A
guarda de **rota** ficou onde a *leitura* é restrita; a guarda de **ação** ficou onde o restrito é
a *escrita*.

**Prova.** Três arquivos e 11 verificações novas — a suíte vai de 168/26 para **179/28**:

| Arquivo | O que prova |
| :--- | :--- |
| `src/__tests__/Layout.test.tsx` (reescrito) | O item de auditoria some para quem não é admin; Médicos e Templates **permanecem**; o admin vê o item, uma vez só |
| `src/__tests__/RbacRotas.test.tsx` (novo) | Não-admin em `/AccessLogs` é redirecionado **e** avisado; o admin entra; o não-admin **entra** em `/Doctors` e `/Templates` |
| `src/__tests__/GuardasDeAcao.test.tsx` (novo) | As três ações de escrita somem das duas telas para quem não é admin, e a leitura continua funcionando |

**A prova foi falsificada antes de ser aceita.** Desligada a guarda nas duas telas, **3 das 6**
verificações de ação falharam — exatamente as que medem o não-admin —, e os casos de admin
seguiram verdes. Revertida, sem resíduo.

> ⚠️ **O watch da feature `006` previu esta mudança, e a classificou como legítima.** O item
> `W008` dizia: "Surge uma guarda de papel no caminho até a tela. Isso **não** é defeito — é regra
> nova, e invalidaria a nota de que a tela é oferecida a todos". É exatamente o que aconteceu:
> `W008` fica **superado**, não violado — e o registro de que a tela já foi oferecida a todos
> permanece no adendo daquela feature.

> ⚠️ **O que esta correção NÃO fechou.** `AccessLogs.tsx` continua lendo com os argumentos exatos
> `('-created_date', 500)` e **sem escopo declarado** (watch `W006`, ainda vigente, e o achado
> F-04); a autorização de escrita continua sendo, em última instância, a regra do servidor; e o
> `RoleGuard` é guarda de **interface** — ele não substitui a RLS nem torna seguro um cliente
> adulterado. F-02, F-03 e F-04 seguem abertos — o estado de cada um é o da seção
> `#Achados de segurança — estado da correção`.

### Correção do F-03 — obrigatoriedade de escopo nas mutações (2026-09-24)

O achado F-03 diz que "mutações de exclusão e atualização são feitas por ID direto sem validação
de posse no cliente". O contrato do projeto **já prometia** o conserto, e o que faltava era a
metade da escrita. **BR-MIGRAR-034**: "*Tornar obrigatório por tipos: assinaturas de
query/**mutation** exigem `created_by_id`/escopo... (o compilador **não** valida autorização em
runtime, e a RLS do BaaS permanece intocada)*".

Até aqui, `scopedRead.ts` entregava só a leitura: as 5 entidades sob RLS não expõem `list`/`filter`
crus, e omitir o escopo não compila. `update` e `delete` seguiam endereçando o registro por
identificador **sem exigir nada**.

| O que mudou | Onde |
| :--- | :--- |
| `OwnedEntity.update(scope, id, data)` e `delete(scope, id)` passam a **exigir o escopo** | `src/api/scopedRead.ts` |
| As 4 chamadas das telas passaram a declarar o escopo, resolvido por `resolveScope` como as leituras já faziam | `PatientForm.tsx`, `NewConsultation.tsx`, `Appointments.tsx`, `PatientDetail.tsx` |
| O `create` **continua sem exigir escopo**, de propósito: criação é aberta a autenticados (BR-MIGRAR-036) e não há filtro de posse a omitir | — |

**Prova.** Dois casos negativos novos no arnês de compilação — `mutacao-sem-escopo` e
`atualizacao-sem-escopo` —, ambos recusados com `TS2554` ("Expected 2/3 arguments"), e o arnês
passa de 16 para **18 casos**, com resíduo nenhum. As 6 verificações existentes das quatro telas
passaram a afirmar o escopo como primeiro argumento, e a suíte segue em **179 verificações em 28
arquivos**, com `typecheck` em 0 erros.

> ⚠️ **O que esta correção NÃO é, e é preciso dizê-lo com todas as letras.** Ela **não** verifica
> posse em runtime: a implementação recebe o escopo e **não altera a chamada** — `update`/`delete`
> do contrato tomam apenas o identificador, e quem decide a posse é a regra de acesso do servidor.
> O que ela entrega é **obrigatoriedade de contrato**: endereçar um registro existente sem
> declarar o escopo **não compila**. Verificar posse no cliente duplicaria a RLS e não protegeria
> de um cliente adulterado — decisão recusada e registrada em `sessionScope.ts:18-21`.
>
> Por isso o F-03 fica **parcialmente** endereçado: a metade de contrato está feita, e a metade de
> runtime continua sendo — deliberadamente — a RLS. Quem ler o achado da auditoria sem esta nota
> vai procurar no cliente uma verificação que o projeto decidiu não ter.

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

### Cenários de paridade do módulo Consultas

Os 3 cenários de PT-005, com o destino de cada um. Acrescentado em 2026-09-21 pela feature
`004-prova-consultas` (RF-01 a RF-04).

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-005.1 — a consulta nasce `agendada` e avança para `em_andamento` | `parity_tests/05-maquina-estados-consulta.feature` | 🟢 **com redação imprecisa** | `NewConsultation.test.tsx` prova o que de fato acontece: criada pelo **formulário**, a consulta nasce `em_andamento` — o schema diz `agendada`, e essa metade é declarada (D-06). O avanço para `em_andamento` é o estado inicial, não uma transição |
| PT-005.2 — a consulta em `em_andamento` é concluída | `parity_tests/05-maquina-estados-consulta.feature` | 🟢 | `NewConsultation.test.tsx` — escolher `concluida` e salvar grava o novo valor, afirmado no objeto da atualização |
| PT-005.3 — transições inválidas não compilam e a interface não as oferece | `parity_tests/05-maquina-estados-consulta.feature` | 🟢 **metade** · 🔴 **metade** | A metade de **compilação** é verdadeira e provada por `npm run prova:negativos` (caso `status-fora-do-conjunto`). A metade de **interface** é **falsa**: o seletor oferece as quatro situações de qualquer situação atual, inclusive `cancelada` → `concluida`, e não há guarda nenhuma. Provado em `NewConsultation.test.tsx`; o `.feature` fica declarado impreciso |

### Cenários de paridade do grupo 06

Os 4 cenários de `PT-006`, com o destino de cada um. Acrescentado em 2026-09-21 pela feature
`005-prova-templates` (RF-01 a RF-10).

> **Nota de escopo, e ela importa.** O grupo se chama `Templates`, mas os quatro cenários
> provam a **emissão de documento com modelo**, cujo componente (`PrescriptionEditor.tsx`) a
> extração analisa dentro do módulo **consultas** (`code-analysis.md#4.4` e `#4.6`). A página
> de administração de modelos (`Templates.tsx`) **não é tocada por nenhum dos quatro** e
> segue sem prova — ver `#Registros declarados do grupo 06`.

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-006.1 — medicamentos só aparecem em documentos do tipo receita | `parity_tests/06-emissao-documento-template.feature` | 🟢 | `PrescriptionEditor.test.tsx` — a seção aparece nos **dois** tipos que contêm "receita" e em **nenhum** dos quatro restantes, com os cinco campos do cenário. A metade que o cenário **não** enuncia também está provada: o portão de `medications` é a montagem do payload, e não a visibilidade da seção |
| PT-006.2 — o template é filtrado pelo tipo do documento | `parity_tests/06-emissao-documento-template.feature` | 🟢 **com ressalva** | O **pedido** é provado nos argumentos exatos (`{ type, is_active: true }`), e a reemissão na troca de tipo também. O filtro em si é **predicado do servidor**: o cliente não re-filtra o resultado, e isso está provado em `#Registros declarados do grupo 06`. Sem a ressalva, o verde sugeriria cobertura que não existe |
| PT-006.3 — as variáveis do template são interpoladas no save | `parity_tests/06-emissao-documento-template.feature` | 🟢 **com redação imprecisa** | A substituição acontece na **escolha do modelo**, e não no salvamento: provado que as quatro variáveis são resolvidas na aplicação e que o texto editado depois é o que se persiste. O `.feature` fica declarado impreciso (RN-02), na mesma família da `PT-005.1` |
| PT-006.4 — template inativo não é oferecido | `parity_tests/06-emissao-documento-template.feature` | 🟢 **com ressalva** | `is_active: true` é parte do **mesmo** pedido de `PT-006.2`, provado nos argumentos exatos. Vale a mesma ressalva: o cliente pede certo e confia inteiramente no servidor |

### Cenários de paridade do grupo 07

Os 4 cenários de `PT-007`, com o destino de cada um. Acrescentado em 2026-09-22 pela feature
`006-prova-logs-acesso` (RF-01 a RF-13).

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-007.1 — visualização de prontuário gera `AccessLog` | `parity_tests/07-auditoria-acesso.feature` | 🟢 | `PatientDetailAudit.test.tsx` e `Consultation.test.tsx`, medidos **no transporte**: a visualização grava `view_patient` e `view_consultation` com a entidade, o identificador e o nome do paciente. O endereço literal `'client-side'` e o agente do navegador são provados em `AccessLogger.test.ts` |
| PT-007.2 — o log é append-only e só admin lê | `parity_tests/07-auditoria-acesso.feature` | 🟢 **metade** · 🔴 **metade** | A metade do **cliente** é provada: `AccessLogger.test.ts` conta a inserção **antes** de negar leitura, alteração e exclusão, e `AccessLogs.test.tsx` prova que nenhuma linha oferece controle de editar ou excluir. A metade do **servidor** — a imutabilidade e a leitura restrita — é **RLS** e fica **declarada**, no mesmo critério do default `agendada` da feature 004. A tela deixou de ser oferecida a quem **não** é admin em 2026-09-24 (correção do F-01), o que **restaura** a precisão da nota de `code-analysis.md#5.1` |
| PT-007.3 — o Dashboard gera log ao carregar | `parity_tests/07-auditoria-acesso.feature` | 🟢 | `Dashboard.test.tsx` — a montagem grava **exatamente um** registro, com `action: 'login'` e `details: 'Acesso ao dashboard'`, e os campos de entidade chegam ausentes. A ação é `login` porque o enum não tem ação de painel: toda visita ao Dashboard entra na contagem de logins |
| PT-007.4 — a listagem carrega até 500 sem paginação | `parity_tests/07-auditoria-acesso.feature` | 🟢 **com ressalva** | `AccessLogs.test.tsx` — o pedido é emitido com os argumentos **exatos** `('-created_date', 500)`, nenhum controle de paginação existe, e mudar qualquer filtro **não** reconsulta o servidor. O teto de 500 é paridade **congelada por decisão humana** (AMB-004), e a ressalva é essa: é promessa provada, não lacuna a fechar aqui |

### Cenários de paridade do grupo 10

Os 4 cenários de `PT-010`, com o destino de cada um. Acrescentado em 2026-09-22 pela feature
`008-prova-contrato-dados` (RF-01 a RF-06).

> **Nota de instrumento.** Este é o único grupo cuja prova é de **compilação**. Quatro dos
> cinquenta cenários não se provam renderizando tela nem medindo transporte: provam-se
> **recusando compilação**, pelo comando `npm run prova:negativos`. A cláusula positiva de
> `PT-010.3` é coberta por **citação** do `typecheck`, que roda sobre o projeto inteiro.

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-010.1 — acesso a dados exige escopo de ownership | `parity_tests/10-contrato-base44-client.feature` | 🟢 **com ressalva** | **Citados:** `leitura-sem-escopo`, `escopo-admin-em-metodo-de-dono` e `dono-manual-em-leitura-escopada` já o cobriam desde a feature 001, e **nenhum foi reescrito** (decisão `2a`). **Novo:** `leitura-crua-em-entidade-escopada` prova que a entidade sob RLS não expõe a leitura crua. **Ressalva:** o tipo garante que o escopo foi **informado**, nunca que ele é legítimo |
| PT-010.2 — o papel é explícito no tipo | `parity_tests/10-contrato-base44-client.feature` | 🟢 | **Novos:** `papel-atribuido-ao-usuario-offline` e `papel-extraido-do-usuario-offline`. O segundo **substituiu** uma tentativa de provar por **comparação** de papel: o TypeScript permite comparar `undefined` com string, e o caso não era recusado. O que o tipo recusa é **extrair** o papel — a ausência é estrutural (achado F-01) |
| PT-010.3 — SDK e mock implementam a mesma interface | `parity_tests/10-contrato-base44-client.feature` | 🟢 **com duas ressalvas** | **Positivo, por citação:** o `typecheck` sobre o projeto inteiro verifica os dois adaptadores reais. **Novo:** `adaptador-incompleto` prova que omitir um gateway é recusado — o contrato tem dentes. **Ressalva 1:** os **retornos** dos adaptadores são convertidos por `as` em `createEntityRepository`, então "os mesmos tipos de retorno" **não** é verificado. **Ressalva 2:** o encaixe no registry é uma asserção em `bindAdapter` |
| PT-010.4 — enums não aceitam valores fora do conjunto | `parity_tests/10-contrato-base44-client.feature` | 🟢 | **Citado:** `status-fora-do-conjunto` cobre `ConsultationStatus`. **Novos:** `situacao-de-agendamento-fora-do-conjunto` e `tipo-documental-fora-do-conjunto` — exatamente os dois conjuntos que o cenário nomeia e ninguém provava (decisão `4a`) |

### Cenários de paridade do grupo 08

Os 5 cenários de `PT-008`, com o destino de cada um. Acrescentado em 2026-09-22 pela feature
`009-prova-kpis-dashboard`.

> **Nota de instrumento.** Este grupo prova-se por **tela**, e nem todos os cinco se provam por
> valor de cartão: `PT-008.3` prova-se pela **ausência** da superfície, e `PT-008.4` tem uma
> **divergência registrada** entre a decisão humana e o código. A prova vive em
> `src/pages/__tests__/DashboardKpis.test.tsx`, com massa em `src/test/dashboardFixtures.ts`.

> **O bloqueio declarado estava vencido.** Esta matriz registrava o grupo `08` como dependente da
> lacuna `G-01` (`confidence-report.md#Lacunas 🔴 pendentes`). A dependência é de **produto** —
> `gaps.md#G-01` pede validação com stakeholder —, e não de prova: `PT-008.4` já congela o valor
> por decisão humana registrada (`AMB-001`) e `Dashboard.tsx:173` já entrega `"94%"`. A lacuna de
> produto **continua aberta**; o que caducou foi o bloqueio da prova.

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-008.1 — KPI Pacientes Ativos conta apenas status "ativo" | `parity_tests/08-kpis-dashboard.feature` | 🟢 | `DashboardKpis.test.tsx` — com massa de 3 ativos e 2 inativos, o cartão exibe **3**. Uma massa só de ativos não distinguiria "conta os ativos" de "conta todo mundo" |
| PT-008.2 — Agendamentos Hoje exclui cancelados | `parity_tests/08-kpis-dashboard.feature` | 🟢 | `DashboardKpis.test.tsx` — **três** verificações: o cancelado de hoje e os de outra data não contam; `faltou`, `concluido` e `confirmado` **contam**, porque o critério exclui **apenas** `cancelado`; e sem agendamento hoje o cartão exibe zero |
| PT-008.3 — Divergência Consultas de Hoje é preservada | `parity_tests/08-kpis-dashboard.feature` | 🟡 **com achado** | **Provado pela AUSÊNCIA.** O cenário enuncia o critério da contagem de consultas de hoje, e **não há superfície onde medi-lo**: `Dashboard.tsx:83-92` calcula `todayConsultations` e `upcomingConsultations` e **descarta os dois** — nenhum cartão os consome. O que é medível, e o que a verificação trava, é o conjunto de cartões: exatamente os quatro do legado, nenhum deles um contador de consultas. O critério divergente de `AMB-002` está preservado em **código morto**, e o achado fica registrado em vez de escondido atrás de um verde |
| PT-008.4 — Taxa de Atendimento permanece como constante mock "94%" | `parity_tests/08-kpis-dashboard.feature` | 🟡 **com ressalva** | `DashboardKpis.test.tsx` — o cartão exibe `94%`, é o **único** percentual do painel, e nenhuma tendência é renderizada. **Ressalva:** o cenário diz "vindo de **constante tipada**", e essa metade é **falsa hoje**. A decisão `AMB-001` registrou "constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`)"; não há símbolo com esse nome em `src/` — o valor é o literal em `Dashboard.tsx:173`. Fica provado o **comportamento**; a divergência entre o decidido e o implementado fica registrada, não corrigida |
| PT-008.5 — Próximos agendamentos lista até 5 futuros não cancelados | `parity_tests/08-kpis-dashboard.feature` | 🟢 | `DashboardKpis.test.tsx` — com seis futuros válidos a lista mostra **cinco**; o futuro cancelado e o passado, que têm nome próprio na massa, **não** aparecem; e sem nenhum futuro a tela exibe "Nenhum agendamento" com o atalho "Agendar consulta" |

> **Além dos cinco cenários.** Por decisão `2a` da sessão de esclarecimentos, a feature provou
> também o **quarto KPI** — "Documentos Emitidos", regra declarada em `BR-MIGRAR-029` e que nenhum
> cenário de `PT-008` nomeia — e os **limites e o escopo** das quatro leituras (`BR-MIGRAR-033`),
> medidos no transporte com os pares exatos de ordenação e limite. Sem isso, as três regras
> seguiriam declaradas, vigentes e não medidas.

### Cenários de paridade do grupo 09

Os 6 cenários de `PT-009`, com o destino de cada um. Acrescentado em 2026-09-22 pela feature
`010-prova-modo-offline`.

> **Nota de instrumento.** Este é o único grupo cuja promessa **não vive numa tela**: ela vive num
> adaptador de dados e numa decisão de **carregamento de módulo**. Por isso a prova ocupa **dois**
> arquivos — `src/api/__tests__/mockClientOffline.test.ts`, que exercita o adaptador com o
> armazenamento local limpo, e `src/api/__tests__/offlineActivation.test.ts`, que troca o ambiente e
> **descarta o registro de módulos** para observar as duas metades da ativação.

> **O bloqueio declarado era de escopo, e foi resolvido.** Esta matriz registrava o grupo `09` como
> "feature a criar", com a decisão pendente sobre as limitações `L1` a `L7` do adaptador. A decisão
> de 2026-09-22 provou o **observável** e declarou o resto: `L1`, `L3`, `L4`, `L5` e `L6` têm
> verificação; `L2` e `L7` ficam **declaradas** com veredito — a primeira não é exercitável num
> ambiente de uma aba, e a segunda é risco de **privacidade**, não comportamento.

| Cenário | Arquivo | Veredito | Prova ou razão |
| :--- | :--- | :---: | :--- |
| PT-009.1 — Ativação exclusiva por env var em build | `parity_tests/09-modo-offline.feature` | 🟢 **com ressalva** | `offlineActivation.test.ts` — **as duas metades**: com a variável ligada, o cliente exportado lê o seed do armazenamento local e a **fábrica do provedor não é chamada**; sem ela, a fábrica **é chamada** e nada é semeado. **Ressalva:** a metade negativa afirma que a fábrica foi chamada, e **não** que o provedor real funciona — carregá-lo exigiria configuração de aplicação e a verificação poderia falhar por motivo alheio à promessa |
| PT-009.2 — Autenticação imediata como OFFLINE_USER | `parity_tests/09-modo-offline.feature` | 🟢 | **Citado, sem reescrita** (decisão `2a` da 008). A autenticação imediata é provada por `src/lib/__tests__/AuthContext.test.tsx`, que já substitui o ambiente e descarta o registro de módulos; e a **ausência estrutural de papel** é provada pelos casos de compilação da feature 008 (`papel-atribuido-ao-usuario-offline`, `papel-extraido-do-usuario-offline`) |
| PT-009.3 — Persistência local com seed na primeira leitura | `parity_tests/09-modo-offline.feature` | 🟢 | `mockClientOffline.test.ts` — sem a chave, a primeira leitura semeia a coleção a partir do **seed real** e a grava sob `mock_db_<Entidade>`; criar, atualizar e excluir refletem na leitura seguinte, e o conjunto sobrevive a uma **nova instância** do cliente. Conteúdo inválido na chave não lança e devolve o seed |
| PT-009.4 — Mock não aplica RLS (comportamento intencional) | `parity_tests/09-modo-offline.feature` | 🟢 | `mockClientOffline.test.ts`, na forma **forte**: um registro com **dono alheio**, gravado direto no armazenamento, é visível e **editável** por quem não é o dono. Não basta o próprio registro ser visível — o de outra origem também é, o que é o que `L1` significa |
| PT-009.5 — create popula id/created_date e update preserva id com merge | `parity_tests/09-modo-offline.feature` | 🟢 **com achado** | `mockClientOffline.test.ts` — a criação preenche identificador, data de criação e a data do registro quando ausente; identificadores de duas criações são distintos; a atualização preserva o identificador e mescla, mantendo o campo não informado; e identificador desconhecido rejeita com a mensagem **exata**. **Achado:** o identificador é afirmado como não vazio e distinto, e **não** por formato, porque o adaptador cai para um gerador próprio quando o do navegador não existe |
| PT-009.6 — filter usa comparação estrita e sort de 1 campo | `parity_tests/09-modo-offline.feature` | 🟢 | `mockClientOffline.test.ts` — valores próximos e de caixa diferente não casam entre si, e objetos de operador de intervalo ou de conteúdo não têm efeito algum; a ordenação funciona ascendente e descendente por **um** campo, e o limite corta **depois** de ordenar |

> **Além dos seis cenários.** Por decisão `2a` da sessão de esclarecimentos, a feature provou também
> o que a unit declara e nenhum cenário nomeia: o acesso dinâmico que devolve repositório para
> **qualquer** nome de entidade, os no-ops de sessão e telemetria, o envio de arquivo como dado
> embutido que **não** persiste, a recusa explícita do envio de e-mail, a ausência de leitura direta
> por identificador (`L6`) e a tolerância da exclusão a identificador inexistente. E fixou em caso o
> achado de que um identificador informado pelo chamador **sobrepõe** o gerado — contra a redação da
> regra, que promete que a criação "sempre popula" o identificador.

### Destino dos cenários de paridade não cobertos nesta feature

Decisão da sessão de esclarecimentos de 2026-09-19: a conversão é **fatiada por módulo**.
Cada grupo abaixo vira feature própria; nenhum cenário fica sem destino.

| Grupo | Cenários | Destino |
| :--- | ---: | :--- |
| Agendamentos (`03`, `04`) | 8 | ✅ **Concluído** na feature `003-prova-agendamentos` — ver `#Cenários de paridade do módulo Agendamentos` |
| Modo offline (`09`) | 6 | ✅ **Concluído** na feature `010-prova-modo-offline` — ver `#Cenários de paridade do grupo 09`. Prova de **adaptador e carregamento**, com `L2` e `L7` declaradas e uma metade da ativação provada por substituição da fábrica do provedor |
| Dashboard (`08`) | 5 | ✅ **Concluído** na feature `009-prova-kpis-dashboard` — ver `#Cenários de paridade do grupo 08`. Prova de **tela**, com um cenário provado pela **ausência** e uma cláusula de `PT-008.4` declarada **falsa hoje** |
| Templates (`06`) | 4 | ✅ **Concluído** na feature `005-prova-templates` — ver `#Cenários de paridade do grupo 06`. Prova a **emissão de documento com modelo**; a **administração** de modelos segue sem prova, com destino declarado |
| Logs de acesso (`07`) | 4 | ✅ **Concluído** na feature `006-prova-logs-acesso` — ver `#Cenários de paridade do grupo 07` |
| Contrato de dados (`10`) | 4 | ✅ **Concluído** na feature `008-prova-contrato-dados` — ver `#Cenários de paridade do grupo 10`. Prova de **compilação**, com duas cláusulas de `PT-010.3` declaradas como **não verificadas** |
| Consultas (`05`) | 3 | ✅ **Concluído** na feature `004-prova-consultas` — ver `#Cenários de paridade do módulo Consultas` |
| Paridade visual (`screens/V01` a `V16`) | 16 | **Feature a criar** — harness de paridade visual. A captura dourada de referência **passou a existir em 2026-09-22**: 24 goldens com `present: true` (16 de 16 cenários) em `_reversa_sdd/screens/golden/manifest.yaml` |

> **Saldo após a feature `010-prova-modo-offline` (2026-09-22).** Dos 50 cenários que a feature 002
> transferiu, **34 estão concluídos** (8 de Agendamentos na feature 003, 3 de Consultas na 004, 4 da
> emissão de documento com modelo na 005, 4 da trilha de auditoria na 006, 4 do contrato de dados na
> 008, 5 dos KPIs do Dashboard na 009 e **6 do Modo offline na 010**) e **16 permanecem
> transferidos** — **todos de paridade visual**, cujo destino é o harness. A captura dourada de
> referência **existe**: 24 goldens com `present: true` (16 de 16 cenários), em
> `_reversa_sdd/screens/golden/manifest.yaml`.
>
> **Os 39 cenários de fluxo estão provados.** Termina aqui a conversão que a feature 002 começou em
> 2026-09-19: nenhum grupo de fluxo segue transferido. O que resta no mapa **nunca foi trabalho de
> prova** — a paridade visual precisa de um harness de comparação, e a administração de modelos
> (`Templates.tsx`) nunca teve dono.

### Lacunas de prova

Registradas de propósito: uma matriz que só mostra 🟢 não é honesta. O que já foi fechado
está marcado como fechado, e o que permanece aberto tem razão declarada.

| Lacuna | Situação após a feature `009-prova-kpis-dashboard` |
| :--- | :--- |
| **BR-P02** (enum de tipo sanguíneo) | ✅ **Fechada.** Prova de execução em `PatientForm.test.tsx` (o formulário oferece exatamente os 9 valores) e caso negativo `status-fora-do-conjunto` em `npm run prova:negativos` |
| **Verificações negativas do gate de tipos** (T031–T036, T039, T045, T046) | ✅ **Fechada, e ampliada.** `npm run prova:negativos` reproduz **18 casos** por comando — 17 negativos e **1 positivo** —, confere a recusa pelo motivo certo, confere que o caso positivo **compila** e não deixa resíduo. Os 9 casos originais continuam passando sem alteração; 7 entraram na feature 008, e os **2 últimos** são da correção do F-03 (`mutacao-sem-escopo` e `atualizacao-sem-escopo`) |
| **Paridade do módulo Pacientes** (5 cenários) | ✅ **Fechada**, com o desdobramento do PT-001.3 declarado |
| **Paridade do módulo Agendamentos** (8 cenários) | ✅ **Fechada**, com três ressalvas declaradas: a redação imprecisa de PT-003.1 e PT-003.3 e a vacuidade de PT-004.2 |
| **Paridade do módulo Consultas** (3 cenários) | ✅ **Fechada**, com duas ressalvas declaradas: a redação imprecisa de PT-005.1 e a metade de interface de PT-005.3, que é **falsa** |
| **Paridade dos módulos restantes** (34 → **0** cenários de fluxo) | ✅ **Fechada.** Agendamentos (8) saiu na feature 003, Consultas (3) na 004, a emissão de documento com modelo (4) na 005, a trilha de auditoria (4) na 006, o contrato de dados (4) na 008, os KPIs do Dashboard (5) na 009 e o Modo offline (6) na 010. **Nenhum cenário de fluxo segue transferido.** Restam os **16 de paridade visual**, cujo destino é o harness — e que nunca foram trabalho de prova |
| **As lacunas do módulo de Consultas** (`code-analysis.md#9`) | 🟡 **Quase todas declaradas, não provadas** — decisão de 2026-09-21. **Duas das três de severidade Alta deixaram de ser só declaração**: `applyTemplate` sem escape e a injeção na impressão ganharam evidência na feature 005 e continuam **abertas**. Detalhe linha a linha na seção abaixo |
| **As três lacunas de severidade Alta de AMB-006** | 🟢 **Provadas e declaradas.** Substituição sem escape no payload, `{DIAS_AFASTAMENTO}` nunca resolvida e injeção sem escape na impressão — as três com evidência em `PrescriptionEditor.test.tsx`, e as três **abertas**, porque a decisão foi provar e declarar. Corrigir exige alterar a prova de propósito (decisão D-08 do roadmap da feature 005) |
| **A colisão das famílias `BR-T`** | 🟡 **Contornada por citação qualificada.** `domain.md#2.3` usa `BR-T01`/`BR-T02` para *filtro por tipo* e *gate de medicamentos*; `code-analysis.md#6` (módulo templates) e `templates/requirements.md#2` usam os **mesmos IDs** para *campos obrigatórios* e *enum de 7 valores*. É o **mesmo identificador** com significados disjuntos — forma pior que a divergência de grafia de `BR-C`, porque qualificar só pelo ID não resolve |
| **A RLS de `templates/requirements.md#4`** | 🔴 **Declarada imprecisa.** O documento diz que `Create/Update/Delete` são restritos a admin e que a leitura alcança apenas templates **ativos**. O schema diz outra coisa: `create` exige admin, mas `update` e `delete` são **criador ou** admin, e `read` é `null` — aberto a qualquer autenticado, sem filtro de atividade. É RLS de servidor: não é provável no cliente |
| **A administração de modelos (`Templates.tsx`)** | 🔴 **Declarada, sem prova.** CRUD, agrupamento por tipo, `is_default` sem exclusividade por tipo, `insertVariable` no fim do texto e o campo `variables` órfão (`BR-T08`). Fora do escopo da feature 005 por decisão `1a`; vira feature própria |
| **Trilha de auditoria da emissão de documento** | 🟢 **Provada e declarada.** Emitir documento não grava `AccessLog` e anexar exame grava; o defeito **permanece**, porque corrigir exige ligar a ação `create_prescription` ao fluxo |
| **As três ações órfãs do catálogo de auditoria** | 🟡 **Declarada.** `create_prescription`, `logout` e `export_data` estão declaradas em `AccessLogger.ts:22-35` e nunca são invocadas. A feature 006 reafirma a declaração por decisão `1a` e **prova o contrato** do enum (doze entradas iguais às do schema); a orfandade continua sem prova, porque é propriedade estática do código |
| **Os três modos de perda silenciosa da trilha** | 🟢 **Provados dois e declarado o terceiro.** Identificação **recusada** e identificação **vazia** não gravam nada e não propagam erro — a segunda nem imprime no console (`AccessLogger.test.ts`). A gravação **não aguardada** antes da navegação fica declarada por leitura. Os três **permanecem**: a decisão `3a` preservou a paridade |
| **A classificação de `AccessLog` no contrato do cliente** | 🔴 **Declarada imprecisa.** `registry.ts:65-67` agrupa a trilha como entidade de **leitura aberta**, ao lado de `Doctor` e `Template` — mas a leitura é **admin-only** na RLS. E `withAccess` faz `asUser` e `asAdmin` devolverem o **mesmo** repositório, de modo que os dois acessos são indistinguíveis para esta entidade. Provado em `AccessLogs.test.tsx`: a página lê pelo repositório cru e **não declara escopo** |
| **A tela de auditoria é oferecida a quem não é admin** | ✅ **Fechada** em 2026-09-24 pela correção do F-01 (`011-rbac-frontend`). O item de navegação passou a `adminOnly` e é filtrado por `user?.role === 'admin'` (`Layout.tsx`), e a rota `/AccessLogs` ganhou guarda de papel (`App.tsx`). A nota de `code-analysis.md#5.1` ("somente admins veem a tela") **volta a ser verdadeira** — era exatamente ela que a extração não podia sustentar. Prova em `Layout.test.tsx` (reescrito) e `RbacRotas.test.tsx` (novo). O texto original desta linha está preservado no adendo `006` e no watch `W008` daquela feature |
| **Os indicadores da tela de auditoria não somam o total** | 🟢 **Provada e declarada.** A heurística é por substring: `create_prescription` entra como "Edição", e `login`, `logout`, `upload_exam` e `export_data` não entram em categoria nenhuma. Com um conjunto de doze registros, os três indicadores somam **8** e o total é **12** (`AccessLogs.test.tsx`) |
| **O recorte de data dos logs não tem teto superior** | 🟢 **Provada e declarada.** Semana e mês comparam apenas o piso (`>= hoje − N`), então um registro com data **futura** entra nos dois. É a mesma forma do defeito que a feature 004 provou em consultas (`AccessLogs.test.tsx`) |
| **A colisão das famílias `BR-L`** | 🟡 **Contornada por citação qualificada.** `logs-acesso/requirements.md#2` usa `BR-L01`/`BR-L02`/`BR-L03` para *append-only*, *enum de ações* e *chamadas dedicadas*; `code-analysis.md#6` usa os **mesmos IDs** para *campos obrigatórios*, *quem cria e quem lê* e *imutabilidade*. É a **quarta** família com esse defeito no projeto e a **única em que os dois artefatos descrevem o mesmo módulo** |
| **A exportação de dados não existe** | 🔴 **Declarada.** O ícone de download em `ACTION_CONFIG` é apresentação da ação `export_data`, e não há exportação implementada. A lacuna de `code-analysis.md#9` permanece correta |
| **`PatientDetail.test.tsx` mede a chamada, não o transporte** | 🟡 **Contornada por arquivo próprio.** Aquele arquivo **dubla o módulo `AccessLogger`**, então prova que a tela chama `logAccess` — e não o que chega ao transporte. A prova de transporte da visualização de paciente vive em `PatientDetailAudit.test.tsx`, criado por esta feature |
| **O recorte "última semana" inclui o futuro** | 🟢 **Provada e declarada.** O recorte é `>= hoje - 7 dias`, sem limite superior. A prova afirma as quatro do conjunto, futura inclusive |
| **O default do formulário divergente do schema** | 🟡 **Provada e declarada.** O formulário grava `em_andamento` e o schema documenta `agendada`; alinhar os dois é decisão de produto |
| **A matriz de transições da consulta não existe na extração** | 🟡 **Declarada.** `state-machines.md#4` é 🟡 e cobre apenas o agendamento; a máquina da consulta está descrita só como diagrama |
| **As duas grafias de `BR-C`** | 🟡 **Contornada por citação qualificada.** `consultas/requirements.md#2` usa `BR-C01` e `code-analysis.md#6` usa `BR-C-01` para regras diferentes. A raiz é defeito documental da extração |
| **A metade de schema do status inicial** | 🔴 **Declarada.** O default `agendada` é do servidor e não é observável no cliente (D-06) |
| **A obrigatoriedade de `date` no schema** | 🟡 **Parcial.** O formulário marca o campo como `required` no controle, mas o portão em JavaScript não confere a data; a validação do navegador não é exercitável no DOM simulado |
| **Modo offline de ponta a ponta** (recorte DIV-01) | ✅ **Fechada** para o paciente: `mockClient.test.ts` cadastra pelo adaptador e relê pela leitura escopada. As limitações L1 a L7 do adaptador permanecem declaradas e não são provadas |
| **Paridade visual** (16 cenários) | 🟡 **Transferida.** A referência existe — 24 goldens, `present: true` em 24 de 24, 16 de 16 cenários (`_reversa_sdd/screens/golden/manifest.yaml`); a lacuna remanescente é a **execução**, que depende do harness de paridade visual |
| **Criptografia do CPF em repouso** | 🔴 **Declarada.** Acontece no backend; o cliente prova apenas a marcação de campo sensível |
| **Build de produção** | 🟡 **Declarada.** `npm run build` passou na máquina do responsável em 2026-09-17; nenhuma prova automatizada cobre o empacotamento |
| **Concorrência entre abas no modo offline** | 🟡 **Declarada.** Limitação L2 herdada, registrada em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` |
| **As lacunas do módulo de Agendamentos** (`code-analysis.md#9`) | ⚠️ **Declaradas, não provadas** — decisão D-07 do `roadmap.md` da feature 003. Detalhe linha a linha na seção abaixo |
| **Divergência entre as duas visões de disponibilidade** | 🔴 **Declarada, sem prova.** O calendário semanal usa grade fixa de 8h às 19h, independente da jornada do médico, enquanto a seleção de horário respeita a jornada. O calendário é visão de agenda, não de disponibilidade — decidido em 2026-09-19 |
| **Ausência de validação do horário no salvamento** | ✅ **Provada como comportamento atual.** O portão exige apenas paciente, médico e data; jornada e conflito não são revalidados. É promessa provada com prova, e não lacuna — está aqui porque corrigir mudaria comportamento observável |
| **Colisão das famílias `BR-A0x`** | 🟡 **Contornada por citação qualificada.** A raiz é defeito documental da extração: dois artefatos usam os mesmos códigos para regras diferentes. Renumerar invalidaria citações existentes, inclusive da feature 001 — a resolver numa re-extração |
| **Citação `W009` sem qualificação de feature** | ✅ **Corrigida nesta feature.** A matriz citava `W009` nu na linha do defeito DIV-01, mas esse identificador só existe no watch da feature `001-migracao-typescript` — o watch da 002 vai até `W008`. Como os IDs `W00x` reiniciam a cada feature, a citação nua simplesmente não resolvia |
| **Prova de encoding sem dono no ciclo forward** | ✅ **Fechada pela feature `008-prova-contrato-dados`** (decisão `3a`). `src/test/mojibake.{mjs,test.mjs}` e `.github/workflows/guarda-encoding.yml` passam a ser reivindicados por um `actions.md`: uma falha da guarda agora tem contrato dizendo qual promessa foi violada. A adoção foi de **registro** — os dois arquivos **não** foram alterados. Ver a nota em `#Como a prova é executada` |
| **O contrato garante forma, e não autorização** | 🟢 **Provada e declarada — e agora MEDIDA.** `contract.ts` e `scopedRead.ts` já registravam a ressalva (achado **F-03**); o que faltava era medir. O caso **positivo** `escopo-administrativo-declarado-por-qualquer-um` prova que qualquer código declara `{ kind: 'admin' }` e **compila**. O par negativo `escopo-admin-em-metodo-de-dono` entrega o **mesmo** objeto a `filterOwned` e é recusado — a diferença entre os dois é o método, e não quem chama |
| **Os retornos dos adaptadores não são verificados** | 🔴 **Declarada.** `createEntityRepository` converte cada retorno com `as`, de modo que a cláusula de `PT-010.3` "o mock tem os mesmos tipos de retorno que o SDK" **não** é verificada pelo tipo. É a cláusula mais fácil de ler como coberta |
| **O ponto de ligação dos adaptadores é uma asserção** | 🔴 **Declarada.** `bindAdapter` faz `as unknown as Parameters<...>` no encaixe com o registry, com justificativa de contravariância registrada no próprio código. O `PT-010.3` vale **entidade por entidade**, e não no ponto de ligação |
| **O ramo administrativo de `applyScope` é inalcançável pelo tipo** | 🟡 **Declarada.** `filterOwned` só aceita `UserScope`, mas `applyScope` ramifica em `scope.kind === 'admin'`. O caso `escopo-admin-em-metodo-de-dono` prova que o **tipo** faz o trabalho; o ramo permanece como defesa de runtime, alcançável apenas por dentro |
| **A inferência de `UserRole`** | 🔴 **Declarada.** Apenas `'admin'` está documentado de forma literal no projeto; `'user'` é inferência, com a pendência de confirmação registrada em `src/types/User.ts:9-11`. A feature 008 provou que o papel é **explícito no tipo**, e não qual é o seu segundo valor |
| **O contador de Consultas de Hoje não tem superfície** | 🟢 **Provada e declarada.** `Dashboard.tsx:83-92` calcula `todayConsultations` e `upcomingConsultations` e **descarta os dois** — nenhum cartão os consome. O critério divergente de `AMB-002` está preservado em **código morto**: existe o critério, não a superfície. A prova mede a ausência (os quatro cartões do legado, nenhum deles contador de consultas) e registra o descarte. Fechada por decisão `1a` do clarify da feature 009 |
| **A constante decidida de `AMB-001` nunca existiu** | 🔴 **Declarada.** A decisão humana de 2026-09-09 registrou "manter `94%` como **constante explícita e tipada** (`TAXA_ATENDIMENTO_MOCK = 94`)" em `ambiguity_log.md#AMB-001`. Não há símbolo com esse nome em `src/`: o valor é o literal `value="94%"` em `Dashboard.tsx:173`. `PT-008.4` afirma "vindo de constante tipada", e essa metade é **falsa hoje**. A feature 009 provou o **comportamento** e registrou a divergência (decisão `3a`) |
| **O fluxograma do Dashboard descreve um render que não acontece** | 🔴 **Declarada — divergência documental.** `flowcharts/dashboard.md#1` afirma que `todayConsultations` e `upcomingConsultations` alimentam a renderização (`I --> N`, `J --> N`), e atribui os "4 StatsCards" a três nós, deixando o quarto cartão sem origem no diagrama. As duas primeiras afirmações são **falsas** no código, e a terceira é incompleta: o quarto cartão consome prescrições, que não é nó do fluxograma |
| **A Taxa de Atendimento está resolvida num artefato e pendente noutro** | 🔴 **Declarada — divergência documental.** `dashboard/requirements.md:17` marca a Taxa de Atendimento como 🔴, enquanto `migration/target_domain_model.md:88` a trata como resolvida (`AMB-001 resolvido`). As duas leituras convivem no mesmo corpus sem nota de reconciliação — a pendência é de **produto** (a fórmula real nunca foi definida), e não de prova |
| **O modo offline não aplica regra de acesso** | 🟢 **Provada e declarada — e é intencional.** `L1` é comportamento pretendido, não defeito: o armazenamento local não tem autorização (`BR-MIGRAR-044`). A prova usa a forma forte — um registro com **dono alheio**, gravado direto no armazenamento, é visível e **editável**. O que isso significa na prática é que toda página que **assume** restrição de dono se comporta de forma divergente em modo offline, e nenhuma prova cobre essa divergência |
| **As limitações `L2` e `L7` do adaptador** | 🟡 **Declaradas com veredito.** Decisão `1a` do clarify da feature 010: `L2` (escritas concorrentes entre abas) **não é exercitável** num ambiente de uma aba — um teste que fingisse duas mediria o fingimento; e `L7` (**dados de pacientes no armazenamento local do navegador**, risco em dispositivo compartilhado) é risco de **privacidade**, não comportamento, e afirmá-lo em asserção diria que expor dados de pacientes é o pretendido. O seed é fictício (`Q-14`), e a recomendação de aviso visual foi registrada e **não implementada** |
| **A criação do adaptador aceita identificador do chamador** | 🟡 **Provada e declarada.** `BR-OFF06` promete que a criação **sempre** popula o identificador, mas `mockClient.ts:116-121` espalha os dados do chamador **depois** do identificador gerado: um `id` informado **sobrepõe** o gerado, e o mesmo vale para a data de criação. É comportamento do legado, preservado — e a redação da regra é mais forte do que o código. A feature 010 fixou o comportamento real em caso, de modo que "consertá-lo" exija decisão explícita |
| **`OFFLINE_USER` existe duas vezes em `src/`** | 🔴 **Declarada.** `src/api/mockClient.ts:26` define a constante sem tipo, e é ela que a sessão offline importa e usa. `src/types/User.ts:81` define **outra**, tipada como a variante offline, reexportada por `src/types/index.ts:42` — e **nenhum arquivo a consome**. Duas fontes para o mesmo valor, uma delas morta; mudar o valor num lugar não muda o outro |
| **A ativação é lida em dois módulos, com tempos diferentes** | 🟡 **Declarada.** `src/api/base44Client.ts:21` lê a variável **no carregamento do módulo**, e `src/lib/AuthContext.tsx:130` lê **a cada verificação de estado**. São duas leituras independentes da mesma decisão, sem ponto único — e a nota de `modo-offline/requirements.md#5. Configuração` descreve uma só. A feature 010 teve de separar as provas por causa disso: só a frente de ativação precisa descartar o registro de módulos |
| **O discriminante `kind` do usuário autenticado não tem consumidor** | 🟡 **Declarada.** `toSessionUser` produz `kind: 'authenticated'`, e nenhum ponto do código estreita por `user.kind` — o que o projeto estreita é `role`. O caminho **offline não passa** por `toSessionUser` e põe o objeto cru na sessão, de modo que as duas variantes circulam com formas diferentes |
| **Contagem das lacunas do módulo de Agendamentos** | 🔴 **Divergência declarada.** O artefato tem 11 linhas e o `requirements.md` da feature fala em 10 — detalhe na seção abaixo |

> A tabela anterior a 2026-09-21 trazia o rótulo "Situação após a feature
> `002-prova-automatizada`". O instantâneo daquele momento está preservado, congelado, em
> `_reversa_sdd/addenda/002-prova-automatizada.md`; esta seção é a leitura **viva** e passa
> a refletir a feature `010-prova-modo-offline`. Os rótulos intermediários (`003` a `009`) foram
> sobrescritos a cada rodada, e o instantâneo de cada uma vive no adendo respectivo — é para isso
> que os adendos existem.

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

### Lacunas declaradas do módulo de Consultas

`_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` traz **oito** linhas para
este módulo, e o `requirements.md` da feature 004 confirma a contagem. Duas são de
severidade **Alta** e, por decisão da sessão de 2026-09-21, **nenhuma ganha prova de
comportamento atual** — nem mesmo elas.

| # | Lacuna em `code-analysis.md#9` | Severidade | Veredito após a feature 004 |
| ---: | :--- | :---: | :--- |
| 1 | `STATUS_CONFIG` duplicado entre `Consultations.tsx:28` e `Consultation.tsx:36` | Baixa | 🔴 **Declarada, não provada.** São as **terceira e quarta** cópias do mapa de situação no projeto: somadas às duas do módulo de agendamentos, há **quatro** mapas paralelos. Unificá-los é trabalho de `/reversa-refactor` |
| 2 | `applyTemplate` sem escape de marcação | **Alta** | 🟢 **Provada e declarada** na feature `005-prova-templates` (`RF-11`): a marcação do modelo chega **literal** ao campo de conteúdo e ao payload, e a forma escapada não aparece. O defeito **permanece** — é preservação deliberada do legado (AMB-006), e corrigir muda comportamento observável |
| 3 | `handlePrint` do editor por injeção em `window.open` | **Alta** | 🟢 **Provada e declarada** na feature `005-prova-templates` (`RF-18`): com duplo de `window.open`, o HTML escrito recebe a marcação do modelo **sem escape**, e a verificação negativa do arranjo demonstra que sem o duplo nada seria escrito. O `handlePrint` do **detalhe** (`Consultation.tsx:132`) é `window.print()` simples e não tem o problema — são dois métodos distintos, e só o do editor injeta. O defeito **permanece** |
| 4 | Filtro `upcoming` comparado com o instante completo | Baixa | 🟢 **Provada e declarada.** `Consultations.test.tsx` afirma que a consulta de hoje pela manhã **não** aparece em "próximas". O defeito permanece; a prova é o pré-requisito para decidir mudá-lo |
| 5 | Impressão da página sem CSS dedicado | Média | 🔴 **Declarada, não provada** |
| 6 | Upload sem validação de tamanho ou tipo | Média | 🔴 **Declarada, não provada.** O diálogo anuncia "máx. 10MB" no texto, e não há verificação — a prova do `RF-17` exercita o caminho de upload, mas não afirma o limite |
| 7 | Busca de paciente limitada a cinco resultados | Baixa | 🔴 **Declarada, não provada** nesta feature — a mesma busca já é coberta por `PatientSearch.test.tsx` no módulo de pacientes, que prova o limite de cinco |
| 8 | Sem testes | **Alta** | ✅ **Fechada para este módulo.** O módulo tinha prova de componentes auxiliares e **nenhuma** da máquina de estados; hoje tem 24 verificações em 3 arquivos. Permanece aberta como afirmação sobre o projeto inteiro — cinco módulos seguem sem prova |

> **Achado que não estava em `code-analysis.md#9`, e que esta feature acrescenta.** O
> catálogo `ACCESS_ACTIONS` declara doze ações auditáveis e **três nunca são invocadas** —
> `create_prescription`, `logout` e `export_data`. O fluxo de emissão de documento existe e
> a ação existe, mas **nada liga os dois**: emitir uma receita não deixa rastro na trilha,
> enquanto anexar um exame deixa. A assimetria confronta a **BR-S01** de `domain.md#2.4`,
> que é 🟢. Está **provada** (`RF-17`, medida no transporte) e **declarada**; o defeito não
> foi corrigido.

### Registros declarados do grupo 06

Seis registros que a feature `005-prova-templates` acrescenta. Nenhum deles é conserto: são
leituras que passam a ter veredito.

| # | Registro | Situação |
| ---: | :--- | :--- |
| 1 | **O filtro de modelos é predicado do SERVIDOR** | 🟢 **Provado o pedido, com ressalva declarada.** `PT-006.2` e `PT-006.4` resolvem-se no mesmo pedido: o cliente envia `{ type, is_active: true }` nos argumentos exatos e reemite com o tipo novo. A verificação que prova o **cliente sem re-filtro** — o dublê devolve um modelo de tipo errado e um inativo, e os dois aparecem no seletor — é o que torna a ressalva obrigatória. Uma segunda linha de defesa no cliente seria **regra nova**, não prova |
| 2 | **A substituição acontece na escolha do modelo, não no salvamento** | 🟢 **Provada.** `PT-006.3` diz "quando salvo o documento"; o código resolve as quatro variáveis na aplicação e persiste o campo como ele estiver, edição inclusive. Corrigida a redação do cenário, não o comportamento (`RN-02`) |
| 3 | **`{DIAS_AFASTAMENTO}` nunca é resolvida** | 🟢 **Provada — e a lacuna 🔴 de `code-analysis.md#5.3` está fechada.** A extração registrava "não confirmado no código analisado"; o marcador chega **literal** ao payload. Com um agravante que a extração não tinha: o editor **coleta** os dias de afastamento e os envia em `valid_days`, e mesmo assim deixa o marcador no texto |
| 4 | **Ausência de CPF resolve a variável para vazio, em silêncio** | 🟢 **Provada.** Sem erro, sem marcação e sem aviso ao médico — e as outras três variáveis seguem resolvidas, provando que a substituição não aborta. Achado que não constava de `code-analysis.md#9` |
| 5 | **Trocar o tipo depois de aplicar um modelo deixa conteúdo obsoleto com procedência nula** | 🟢 **Provada.** O texto do modelo antigo permanece no campo e vai para o documento do tipo novo, enquanto `template_name` fica nulo. O schema **copia** o conteúdo em vez de referenciar o modelo, então o documento de atestado sai com texto de receita. Achado que não constava de `code-analysis.md#9` |
| 6 | **A procedência não sobrevive a uma reedição** | 🟢 **Provada.** Não há campo de modelo nos dados iniciais do editor, então reabrir um documento perde o vínculo com o modelo que o originou |

> **Duas notas de leitura para quem for usar os vereditos do grupo `06`.**
>
> A primeira: eles valem para o **componente** `PrescriptionEditor`. A prova ancora ali
> (decisão D-01), e não nas telas que o montam — o encanamento a partir de
> `PatientDetail.tsx` **não** está coberto. O caminho a partir de `Consultation.tsx` tem
> prova parcial na feature 004.
>
> A segunda: as três asserções de marcação literal **travam a paridade** de AMB-006. No dia em
> que alguém corrigir a substituição ou a impressão, estas verificações falham — por desenho.
> Quem corrigir precisa alterar a prova **de propósito** (decisão D-08), e a decisão fica
> visível no diff em vez de escorregar.

### Registros declarados do grupo 07

Dez registros que a feature `006-prova-logs-acesso` acrescenta. Nenhum deles é conserto: são
leituras que passam a ter veredito.

| # | Registro | Situação |
| ---: | :--- | :--- |
| 1 | **A trilha perde eventos em silêncio, de três modos** | 🟢 **Dois provados, um declarado.** Identificação **recusada** cai no `catch` e imprime no console; identificação **vazia** sai por um `return` antecipado e **nem isso** — os dois sem gravar e sem propagar erro (`AccessLogger.test.ts`). A gravação **não aguardada** antes da navegação fica declarada por leitura. Consequência que importa: **uma trilha incompleta e uma completa são indistinguíveis** para quem só olha a tela, e o sistema anuncia conformidade com a LGPD no cabeçalho |
| 2 | **A tela de auditoria era oferecida a quem não é admin** | ✅ **Fechada** em 2026-09-24 pela correção do F-01. O item de navegação passou a ser filtrado por papel, e `Layout.test.tsx` foi **reescrito** para provar o contrário do que provava: o item some para quem não tem papel e permanece para o admin. O texto original deste registro está preservado no adendo `006` |
| 3 | **`AccessLog` é classificada como entidade de leitura aberta** | 🔴 **Declarada imprecisa.** `registry.ts:65-67` a agrupa com `Doctor` e `Template`, mas a leitura da trilha é admin-only na RLS. `AccessLogs.test.tsx` prova que a página lê pelo repositório **cru** e não usa `asUser` nem `asAdmin` — que, para esta entidade, são o mesmo repositório |
| 4 | **O Dashboard grava `login` como procuração de acesso ao painel** | 🟢 **Provada.** O enum não tem ação de painel, então toda visita ao Dashboard é contabilizada como um login, e o detalhe fixo é a única distinção |
| 5 | **A mesma visualização grava duas vezes quando o objeto muda de identidade** | 🟢 **Provada nas DUAS telas.** O detalhe do paciente declara `[patient, patientId]` e o da consulta declara `[consultation, patient, consultationId]` — dois objetos nas dependências. É defeito **sistêmico**, e não de uma tela (`PatientDetailAudit.test.tsx` e `Consultation.test.tsx`) |
| 6 | **Os quatro indicadores não somam o total** | 🟢 **Provada.** Com doze registros, um de cada ação: visualizações 2, edições 5, exclusões 1 — soma **8** contra total **12**. `create_prescription` entra como edição, e quatro ações não entram em categoria nenhuma |
| 7 | **O recorte de data dos logs não tem teto** | 🟢 **Provada.** Um registro com data **futura** entra em "última semana" e em "último mês", pela mesma forma que a feature 004 provou em consultas |
| 8 | **O trio de ações órfãs** | 🟡 **Declarado, não provado** (decisão `1a`). `logout`, `create_prescription` e `export_data` nunca são invocados, e a orfandade é propriedade **estática** do código. O que **é** provado é o contrato do enum: doze entradas iguais às do schema |
| 9 | **A colisão das famílias `BR-L`** | 🟡 **Contornada por citação qualificada.** Os mesmos identificadores denotam regras disjuntas em `logs-acesso/requirements.md#2` e `code-analysis.md#6` — e, ao contrário das colisões anteriores, os dois artefatos descrevem o **mesmo módulo** |
| 10 | **O `PatientDetail.test.tsx` mede a chamada, não o transporte** | 🟡 **Contornada por arquivo próprio.** Aquele arquivo dubla o módulo `AccessLogger`, o que é incompatível com a prova no transporte exigida pela decisão D-02. A visualização auditada do paciente ganhou `PatientDetailAudit.test.tsx`, e o desvio está registrado no `progress.jsonl` da feature |

> **Uma nota de leitura, e ela é a mais importante deste grupo.** As asserções dos modos de
> perda silenciosa **travam o comportamento atual**: no dia em que alguém fizer a gravação
> propagar o erro, ou gravar com marcador de usuário desconhecido, as verificações falham —
> **por desenho** (decisão `3a`). Quem decidir corrigir precisa alterar a prova de propósito,
> e a decisão fica visível no diff em vez de escorregar.

### Achados de segurança — estado da correção (2026-09-24)

Registro **vivo** dos cinco achados das auditorias de `docs/security-audit/`. Os relatórios de
2026-09-09 e de 2026-09-16 são **históricos** e não são reescritos: o estado de cada achado é o
desta tabela.

| Achado | Severidade | Estado em 2026-09-24 | Onde |
| :--- | :---: | :--- | :--- |
| **F-01** — RBAC inexistente no frontend | Alta | ✅ **Corrigido** | Menu, rota da trilha e ações de Médicos e Templates — ver `#Correção do F-01 — guarda de papel no frontend` |
| **F-02** — `access_token` por query string e em `LocalStorage` | Alta | ⛔ **Não corrigível neste repositório** | Nota abaixo |
| **F-03** — IDOR nas mutações por identificador | Alta | 🟡 **Contrato feito; a metade de runtime é da RLS, por decisão** | Ver `#Correção do F-03 — obrigatoriedade de escopo nas mutações` |
| **F-04** — leitura ampla da trilha, sem isolamento no cliente | Média | 🔴 **Aberto** | `AccessLogs.tsx:75-78`; watch `W006` da feature `006`, ainda vigente |
| **F-05** — `dangerouslySetInnerHTML` no componente de gráficos | Baixa | 🔴 **Aberto** | `src/components/ui/chart.jsx:74` |

> ⚠️ **F-02 não se fecha neste repositório, e a razão é verificável no SDK.** O
> `src/lib/app-params.ts` lê o token da query string e o grava em `localStorage` — mas quem
> constrói o cliente faz **o mesmo sozinho**: em `@base44/sdk/dist/client.js:123` o `createClient`
> executa `token || getAccessToken()`, e `getAccessToken()` tem por default `saveToStorage: true`
> e `paramName: 'access_token'` (`dist/utils/auth-utils.js:38`). Apagar o tratamento do
> `app-params.ts` **não removeria a exposição** — o SDK colheria e persistiria o token do mesmo
> modo. E `CreateClientConfig` não expõe opção para desligar isso (`dist/client.types.d.ts:15-64`).
>
> **O que fecharia o achado:** deixar de receber sessão por `?access_token=`, apoiando-se na sessão
> por cookie `httpOnly` que o próprio SDK referencia (`dist/modules/auth.js:170`). É decisão de
> **plataforma/deployment**, não deste repositório. Qualquer alteração que se limite ao
> `app-params.ts` deve ser registrada como **cosmética**, nunca como correção do achado — a
> recomendação da auditoria ("eliminar o envio do token via URL e o armazenamento") não é
> alcançável no cliente.

---

*Gerado pelo Reversa-Writer em 2026-09-02.*
*Seção de rastreabilidade acrescentada em 2026-09-19; módulos de Agendamentos e Consultas e suas lacunas em 2026-09-21; cenários e registros dos grupos 06 (emissão de documento com modelo), 07 (trilha de auditoria) e 10 (contrato de dados) em 2026-09-21 e 2026-09-22; medições das features 005 e 006 e adoção da guarda de encoding em 2026-09-22.*
*Correção do F-01 e registro vivo dos achados de segurança em 2026-09-24.*
