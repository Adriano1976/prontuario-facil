# Actions: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Roadmap: `_reversa_forward/001-migracao-typescript/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 44 |
| Paralelizáveis (`[//]`) | 16 |
| Maior cadeia de dependência | 15 elos |

> **Estado inicial:** as ações `T001` a `T020` (preparação, núcleo e contrato de acesso a
> dados) e `T031` a `T036` (verificação negativa) já foram executadas e verificadas antes
> da abertura desta feature. Entram com status `[X]` porque o trabalho existe no código —
> marcá-las como pendentes faria o `/reversa-coding` refazer o que já passou por
> verificação.
>
> **Ordem dos IDs:** a numeração segue a **ordem de execução**, não a ordem das seções do
> template. O núcleo vem antes dos testes porque uma verificação negativa só faz sentido
> depois que o contrato que ela verifica existe. Nenhuma ação depende de um ID maior que o
> próprio.
>
> **Fase 3 (Testes):** o projeto não adota desenvolvimento guiado por testes e a decisão
> D-07 não autoriza arcabouço de teste nesta feature. A fase existe com outro conteúdo:
> **verificação negativa** — casos de uso propositalmente incorretos que precisam **não**
> compilar. Foi exatamente esse tipo de verificação que revelou os dois defeitos de
> contrato descritos em `investigation.md` (seções 7.1 e 7.2).

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar a configuração de verificação de tipos em modo estrito, cobrindo todo o código-fonte | - | `[//]` | `tsconfig.json` | 🟢 | `[X]` |
| T002 | Corrigir o comando de verificação do manifesto, que apontava para a configuração legada e emitia arquivos | T001 | - | `package.json` | 🟢 | `[X]` |
| T003 | Corrigir o erro de sintaxe que fazia a verificação abortar a análise de todo o projeto | T001 | `[//]` | `src/components/ui/chart.jsx` | 🟢 | `[X]` |
| T004 | Confirmar que a verificação cobre o número esperado de arquivos do código-fonte | T001 | - | `tsconfig.json` | 🟢 | `[X]` |
| T005 | Registrar no arquivo de configuração a exclusão do corpo .jsx da pasta de componentes de interface herdados (a justificativa por escrito fica no roadmap, D-01) | T001 | - | `tsconfig.json` | 🟢 | `[X]` |

## Fase 2, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Declarar os campos preenchidos pelo servidor em todo registro persistido | - | `[//]` | `src/types/base.ts` | 🟢 | `[X]` |
| T007 | Declarar os tipos primitivos e os conjuntos fechados compartilhados | - | `[//]` | `src/types/common.ts` | 🟢 | `[X]` |
| T008 | Declarar o contrato do paciente com o consentimento como tipo condicional | T006, T007 | - | `src/types/Patient.ts` | 🟢 | `[X]` |
| T009 | Declarar o contrato do agendamento com os conjuntos fechados de status e tipo | T006, T007 | `[//]` | `src/types/Appointment.ts` | 🟢 | `[X]` |
| T010 | Declarar o contrato da consulta com sinais vitais e conjunto fechado de status | T006, T007 | `[//]` | `src/types/Consultation.ts` | 🟢 | `[X]` |
| T011 | Declarar o contrato da prescrição com os itens de medicamento e os tipos documentais | T006, T007 | `[//]` | `src/types/Prescription.ts` | 🟢 | `[X]` |
| T012 | Declarar o contrato do exame com os conjuntos de tipo de exame e de arquivo | T006, T007 | `[//]` | `src/types/Exam.ts` | 🟢 | `[X]` |
| T013 | Declarar o contrato do médico com dias e janela de atendimento | T006, T007 | `[//]` | `src/types/Doctor.ts` | 🟢 | `[X]` |
| T014 | Declarar o contrato do modelo de documento com os 7 tipos | T006, T007 | `[//]` | `src/types/Template.ts` | 🟢 | `[X]` |
| T015 | Declarar o contrato do registro de acesso com as 12 ações auditadas | T006, T007 | `[//]` | `src/types/AccessLog.ts` | 🟢 | `[X]` |
| T016 | Declarar a sessão do usuário como união discriminada, com a variante offline sem papel nem dono | T007 | - | `src/types/User.ts` | 🟢 | `[X]` |
| T017 | Expor os contratos de domínio pelo ponto de entrada da camada de tipos | T008, T009, T010, T011, T012, T013, T014, T015, T016 | - | `src/types/index.ts` | 🟢 | `[X]` |
| T018 | Declarar o contrato de acesso a dados: repositório de entidade, escopos, gateways e forma crua | - | `[//]` | `src/api/contract.ts` | 🟢 | `[X]` |
| T019 | Implementar a leitura com escopo: leitura do dono, filtro do dono e leitura administrativa | T018 | - | `src/api/scopedRead.ts` | 🟢 | `[X]` |
| T020 | Declarar o registro fechado das 8 entidades, com verificação das implementações em tempo de compilação | T018, T019, T017 | - | `src/api/registry.ts` | 🟢 | `[X]` |
| T021 | Converter os componentes clínicos para a linguagem tipada (9 componentes) | T020 | - | `src/components/medical/` | 🟢 | `[X]` |
| T022 | Converter os componentes de agendamento para a linguagem tipada (2 componentes) | T020 | `[//]` | `src/components/appointments/` | 🟢 | `[X]` |
| T023 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo | T021, T020 | - | `src/pages/Patients.tsx`, `src/pages/PatientForm.tsx` | 🟢 | `[X]` |
| T024 | Converter a tela de detalhe do paciente e migrar suas leituras | T023 | - | `src/pages/PatientDetail.tsx` | 🟢 | `[X]` |
| T025 | Converter as telas de consulta e migrar suas leituras | T024, T021 | - | `src/pages/Consultations.tsx`, `src/pages/Consultation.tsx`, `src/pages/NewConsultation.tsx` | 🟢 | `[X]` |
| T026 | Converter as telas de agendamento e migrar suas leituras | T025, T022 | - | `src/pages/Appointments.tsx`, `src/pages/NewAppointment.tsx` | 🟢 | `[X]` |
| T027 | Converter a tela de médicos | T026 | - | `src/pages/Doctors.tsx` | 🟢 | `[X]` |
| T028 | Converter a tela de modelos de documento | T027 | - | `src/pages/Templates.tsx` | 🟢 | `[X]` |
| T029 | Converter a tela de registros de acesso | T028 | - | `src/pages/AccessLogs.tsx` | 🟢 | `[X]` |
| T030 | Converter a tela do painel e seus componentes de indicadores | T029 | - | `src/pages/Dashboard.tsx`, `src/components/medical/StatsCard.tsx`, `src/components/medical/ReportsView.tsx` | 🟢 | `[X]` |

## Fase 3, Testes

> Verificação negativa: cada ação confirma que uma garantia de tipo **recusa** o uso
> incorreto. Não são testes de comportamento.

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T031 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T008 | `[//]` | verificação negativa do consentimento | 🟢 | `[X]` |
| T032 | Verificar por caso negativo que valor fora dos conjuntos fechados de status e tipo não compila | T009, T010 | `[//]` | verificação negativa dos conjuntos fechados | 🟢 | `[X]` |
| T033 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T019 | - | verificação negativa do escopo de leitura | 🟢 | `[X]` |
| T034 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T019 | - | verificação negativa do filtro escopado | 🟢 | `[X]` |
| T035 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T019 | - | verificação de uso correto | 🟢 | `[X]` |
| T036 | Verificar por caso negativo que nome de entidade inexistente não compila | T020 | `[//]` | verificação negativa do registro de entidades | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T037 | Converter o cliente online para a linguagem tipada, satisfazendo o contrato | T020 | - | `src/api/base44Client.ts` | 🟢 | `[X]` |
| T038 | Converter o cliente offline para a linguagem tipada, satisfazendo o mesmo contrato | T020 | - | `src/api/mockClient.ts` | 🟢 | `[X]` |
| T039 | Verificar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T037, T038 | - | verificação negativa do contrato de dados | 🟢 | `[X]` |
| T040 | Alinhar os dados de exemplo do modo offline ao contrato das entidades | T038, T017 | - | `src/api/mockSeed.ts` | 🟢 | `[X]` |
| T041 | Converter os arquivos auxiliares restantes para a linguagem tipada, preservando o comportamento | T020, T037 | - | `src/App.tsx`, `src/Layout.tsx`, `src/lib/*`, `src/hooks/*` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T042 | Ligar a verificação sobre os arquivos convertidos e reduzir os erros de tipo a zero | T021, T022, T030, T039, T040, T041 | - | `tsconfig.json` | 🟢 | `[X]` |
| T043 | Executar a verificação completa e confirmar que ela cobre todo o código-fonte convertido | T042 | - | `tsconfig.json` | 🟢 | `[X]` |
| T044 | Executar o roteiro de fumaça de paridade e registrar o resultado por módulo | T030, T040 | - | `_reversa_forward/001-migracao-typescript/onboarding.md` | 🟢 | `[X]` |

## Notas de execução

> O modo de verificação estrita é controlado por uma única opção na configuração. A
> estratégia é ligá-la por grupo de arquivos convertidos, nunca sobre o projeto inteiro
> antes da conversão — a medição de 1.324 erros mostra o custo de fazer isso cedo demais.
>
> Pendência transferida para fora desta feature: remoção das 14 dependências declaradas
> e não utilizadas (ver `requirements.md`, seção 10).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-14` | Versão inicial gerada por `/reversa-to-do` | reversa |
