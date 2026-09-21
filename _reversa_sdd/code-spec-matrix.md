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
| 2026-09-21, após a feature `004-prova-consultas` | 90 | 17 | 63,7 s | 0 |

O acréscimo da feature 004 foi de **24 verificações em 3 arquivos** — listagem, detalhe e
formulário do módulo de Consultas —, com o tempo ainda **26 segundos abaixo do teto**. O
teto foi revalidado e **não** renegociado (D-11).

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

### Destino dos cenários de paridade não cobertos nesta feature

Decisão da sessão de esclarecimentos de 2026-09-19: a conversão é **fatiada por módulo**.
Cada grupo abaixo vira feature própria; nenhum cenário fica sem destino.

| Grupo | Cenários | Destino |
| :--- | ---: | :--- |
| Agendamentos (`03`, `04`) | 8 | ✅ **Concluído** na feature `003-prova-agendamentos` — ver `#Cenários de paridade do módulo Agendamentos` |
| Modo offline (`09`) | 6 | Feature a criar — conversão dos cenários de fluxo do modo offline |
| Dashboard (`08`) | 5 | Feature a criar — depende de resolver a lacuna da Taxa de Atendimento (`confidence-report.md#Lacunas 🔴 pendentes`) |
| Templates (`06`) | 4 | ✅ **Concluído** na feature `005-prova-templates` — ver `#Cenários de paridade do grupo 06`. Prova a **emissão de documento com modelo**; a **administração** de modelos segue sem prova, com destino declarado |
| Logs de acesso (`07`) | 4 | Feature a criar — conversão dos cenários de fluxo da trilha de auditoria |
| Contrato de dados (`10`) | 4 | Feature a criar — contrato único honrado pelos dois modos |
| Consultas (`05`) | 3 | ✅ **Concluído** na feature `004-prova-consultas` — ver `#Cenários de paridade do módulo Consultas` |
| Paridade visual (`screens/V01` a `V16`) | 16 | **Lacuna declarada.** A captura dourada de referência não existe no repositório (`present: false`); produzi-la é trabalho de outra natureza |

> **Saldo após a feature `005-prova-templates` (2026-09-21).** Dos 50 cenários que a
> feature 002 transferiu, **15 estão concluídos** (8 de Agendamentos na feature 003, 3 de
> Consultas na 004 e 4 da emissão de documento com modelo na 005) e **19 permanecem
> transferidos** para features próprias: modo offline (6), Dashboard (5), Logs de acesso (4),
> Contrato de dados (4). Os 16 de paridade visual seguem declarados como lacuna, e não como
> trabalho transferido. Acrescenta-se a esses 19 um grupo que **nunca esteve na tabela de
> transferência**: a administração de modelos, que o rótulo do grupo `06` sugeria cobrir e
> que nenhum dos quatro cenários toca.

### Lacunas de prova

Registradas de propósito: uma matriz que só mostra 🟢 não é honesta. O que já foi fechado
está marcado como fechado, e o que permanece aberto tem razão declarada.

| Lacuna | Situação após a feature `005-prova-templates` |
| :--- | :--- |
| **BR-P02** (enum de tipo sanguíneo) | ✅ **Fechada.** Prova de execução em `PatientForm.test.tsx` (o formulário oferece exatamente os 9 valores) e caso negativo `status-fora-do-conjunto` em `npm run prova:negativos` |
| **Verificações negativas do gate de tipos** (T031–T036, T039, T045, T046) | ✅ **Fechada.** `npm run prova:negativos` reproduz 9 casos por comando, confere a recusa pelo motivo certo e não deixa resíduo |
| **Paridade do módulo Pacientes** (5 cenários) | ✅ **Fechada**, com o desdobramento do PT-001.3 declarado |
| **Paridade do módulo Agendamentos** (8 cenários) | ✅ **Fechada**, com três ressalvas declaradas: a redação imprecisa de PT-003.1 e PT-003.3 e a vacuidade de PT-004.2 |
| **Paridade do módulo Consultas** (3 cenários) | ✅ **Fechada**, com duas ressalvas declaradas: a redação imprecisa de PT-005.1 e a metade de interface de PT-005.3, que é **falsa** |
| **Paridade dos módulos restantes** (34 → 19 cenários) | 🟡 **Parcialmente concluída.** Agendamentos (8) saiu na feature 003, Consultas (3) na 004 e a emissão de documento com modelo (4) na 005; **19 permanecem transferidos**, com destino declarado por grupo na seção acima |
| **As lacunas do módulo de Consultas** (`code-analysis.md#9`) | 🟡 **Quase todas declaradas, não provadas** — decisão de 2026-09-21. **Duas das três de severidade Alta deixaram de ser só declaração**: `applyTemplate` sem escape e a injeção na impressão ganharam evidência na feature 005 e continuam **abertas**. Detalhe linha a linha na seção abaixo |
| **As três lacunas de severidade Alta de AMB-006** | 🟢 **Provadas e declaradas.** Substituição sem escape no payload, `{DIAS_AFASTAMENTO}` nunca resolvida e injeção sem escape na impressão — as três com evidência em `PrescriptionEditor.test.tsx`, e as três **abertas**, porque a decisão foi provar e declarar. Corrigir exige alterar a prova de propósito (decisão D-08 do roadmap da feature 005) |
| **A colisão das famílias `BR-T`** | 🟡 **Contornada por citação qualificada.** `domain.md#2.3` usa `BR-T01`/`BR-T02` para *filtro por tipo* e *gate de medicamentos*; `code-analysis.md#6` (módulo templates) e `templates/requirements.md#2` usam os **mesmos IDs** para *campos obrigatórios* e *enum de 7 valores*. É o **mesmo identificador** com significados disjuntos — forma pior que a divergência de grafia de `BR-C`, porque qualificar só pelo ID não resolve |
| **A RLS de `templates/requirements.md#4`** | 🔴 **Declarada imprecisa.** O documento diz que `Create/Update/Delete` são restritos a admin e que a leitura alcança apenas templates **ativos**. O schema diz outra coisa: `create` exige admin, mas `update` e `delete` são **criador ou** admin, e `read` é `null` — aberto a qualquer autenticado, sem filtro de atividade. É RLS de servidor: não é provável no cliente |
| **A administração de modelos (`Templates.tsx`)** | 🔴 **Declarada, sem prova.** CRUD, agrupamento por tipo, `is_default` sem exclusividade por tipo, `insertVariable` no fim do texto e o campo `variables` órfão (`BR-T08`). Fora do escopo da feature 005 por decisão `1a`; vira feature própria |
| **Trilha de auditoria da emissão de documento** | 🟢 **Provada e declarada.** Emitir documento não grava `AccessLog` e anexar exame grava; o defeito **permanece**, porque corrigir exige ligar a ação `create_prescription` ao fluxo |
| **As três ações órfãs do catálogo de auditoria** | 🟡 **Declarada.** `create_prescription`, `logout` e `export_data` estão declaradas em `AccessLogger.ts:22-35` e nunca são invocadas |
| **O recorte "última semana" inclui o futuro** | 🟢 **Provada e declarada.** O recorte é `>= hoje - 7 dias`, sem limite superior. A prova afirma as quatro do conjunto, futura inclusive |
| **O default do formulário divergente do schema** | 🟡 **Provada e declarada.** O formulário grava `em_andamento` e o schema documenta `agendada`; alinhar os dois é decisão de produto |
| **A matriz de transições da consulta não existe na extração** | 🟡 **Declarada.** `state-machines.md#4` é 🟡 e cobre apenas o agendamento; a máquina da consulta está descrita só como diagrama |
| **As duas grafias de `BR-C`** | 🟡 **Contornada por citação qualificada.** `consultas/requirements.md#2` usa `BR-C01` e `code-analysis.md#6` usa `BR-C-01` para regras diferentes. A raiz é defeito documental da extração |
| **A metade de schema do status inicial** | 🔴 **Declarada.** O default `agendada` é do servidor e não é observável no cliente (D-06) |
| **A obrigatoriedade de `date` no schema** | 🟡 **Parcial.** O formulário marca o campo como `required` no controle, mas o portão em JavaScript não confere a data; a validação do navegador não é exercitável no DOM simulado |
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

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
*Seção de rastreabilidade acrescentada em 2026-09-19; módulos de Agendamentos e Consultas e suas lacunas em 2026-09-21; cenários e registros do grupo 06 (emissão de documento com modelo) em 2026-09-21.*
