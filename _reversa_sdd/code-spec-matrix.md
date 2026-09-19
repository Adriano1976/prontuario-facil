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

### Contrato de dados e sessão (transversal)

| Promessa (spec) | Código que cumpre | Teste que prova | Veredito |
| :--- | :--- | :--- | :---: |
| Verificações negativas do gate de tipos são reproduzíveis por comando | `src/test/verificacoes-negativas.mjs` | `npm run prova:negativos` — 9 casos, recusa conferida **pelo motivo** e sem resíduo | 🟢 |
| Cadastro de paciente no modo offline aparece na listagem escopada (defeito DIV-01, watch W009) | `src/api/mockClient.ts`, `src/api/registry.ts`, `src/api/scopedRead.ts` | `src/api/__tests__/mockClient.test.ts` — cadastra pelo adaptador e relê por `listOwned` e `filterOwned` | 🟢 |
| Contrato único de acesso a dados, honrado tanto pelo modo online quanto pelo offline | `src/api/contract.ts`, `src/api/base44Client.ts`, `src/api/mockClient.ts`, `src/api/registry.ts` | `src/api/__tests__/mockClient.test.ts` (execução) + `npm run typecheck` (compilação) | 🟢 |
| Sessão autenticada convertida para o tipo de domínio; a ausência de papel no modo offline é explícita, não silenciosa | `src/lib/session.ts`, `src/lib/AuthContext.tsx`, `src/api/sessionScope.ts` | `src/lib/__tests__/AuthContext.test.tsx`, `src/api/__tests__/sessionScope.test.ts` | 🟢 |

### Como a prova é executada

```bash
npm test              # 36 verificações em 10 arquivos — 0 falhas, 32,5 s
npm run typecheck     # gate de tipos estrito — 0 erros
npm run lint          # eslint --quiet — 0 erros
npm run prova:negativos   # 9 casos negativos recusados, sem resíduo
```

Medição de 2026-09-19, sobre o código desta árvore de trabalho. Os dois últimos comandos
são gates independentes (RN-05): o segundo confere forma em tempo de compilação, o
primeiro confere comportamento em tempo de execução. A suíte exige acesso ampliado para
subir neste ambiente: o esbuild do vitest abre pipe nomeado e falha com `spawn EPERM` em
modo confinado (mesma restrição registrada no onboarding da feature 001, §7).

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

### Destino dos cenários de paridade não cobertos nesta feature

Decisão da sessão de esclarecimentos de 2026-09-19: a conversão é **fatiada por módulo**.
Cada grupo abaixo vira feature própria; nenhum cenário fica sem destino.

| Grupo | Cenários | Destino |
| :--- | ---: | :--- |
| Agendamentos (`03`, `04`) | 8 | Feature a criar — conversão dos cenários de fluxo de agendamentos |
| Modo offline (`09`) | 6 | Feature a criar — conversão dos cenários de fluxo do modo offline |
| Dashboard (`08`) | 5 | Feature a criar — depende de resolver a lacuna da Taxa de Atendimento (`confidence-report.md#Lacunas 🔴 pendentes`) |
| Templates (`06`) | 4 | Feature a criar — conversão dos cenários de fluxo de documentos e modelos |
| Logs de acesso (`07`) | 4 | Feature a criar — conversão dos cenários de fluxo da trilha de auditoria |
| Contrato de dados (`10`) | 4 | Feature a criar — contrato único honrado pelos dois modos |
| Consultas (`05`) | 3 | Feature a criar — máquina de estados da consulta |
| Paridade visual (`screens/V01` a `V16`) | 16 | **Lacuna declarada.** A captura dourada de referência não existe no repositório (`present: false`); produzi-la é trabalho de outra natureza |

### Lacunas de prova

Registradas de propósito: uma matriz que só mostra 🟢 não é honesta. O que esta feature
fechou está marcado como fechado, e o que permanece aberto tem razão declarada.

| Lacuna | Situação após a feature `002-prova-automatizada` |
| :--- | :--- |
| **BR-P02** (enum de tipo sanguíneo) | ✅ **Fechada.** Prova de execução em `PatientForm.test.tsx` (o formulário oferece exatamente os 9 valores) e caso negativo `status-fora-do-conjunto` em `npm run prova:negativos` |
| **Verificações negativas do gate de tipos** (T031–T036, T039, T045, T046) | ✅ **Fechada.** `npm run prova:negativos` reproduz 9 casos por comando, confere a recusa pelo motivo certo e não deixa resíduo |
| **Paridade do módulo Pacientes** (5 cenários) | ✅ **Fechada**, com o desdobramento do PT-001.3 declarado |
| **Paridade dos sete módulos restantes** (34 cenários) | 🟡 **Transferida**, com destino declarado por grupo na seção acima |
| **Modo offline de ponta a ponta** (recorte DIV-01) | ✅ **Fechada** para o paciente: `mockClient.test.ts` cadastra pelo adaptador e relê pela leitura escopada. As limitações L1 a L7 do adaptador permanecem declaradas e não são provadas |
| **Paridade visual** (16 cenários) | 🔴 **Declarada.** Depende de captura dourada inexistente |
| **Criptografia do CPF em repouso** | 🔴 **Declarada.** Acontece no backend; o cliente prova apenas a marcação de campo sensível |
| **Build de produção** | 🟡 **Declarada.** `npm run build` passou na máquina do responsável em 2026-09-17; nenhuma prova automatizada cobre o empacotamento |
| **Concorrência entre abas no modo offline** | 🟡 **Declarada.** Limitação L2 herdada, registrada em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` |
