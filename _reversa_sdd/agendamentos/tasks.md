# Agendamentos, Tarefas de Implementação

> Sequência para reimplementar o módulo a partir dos contratos documentados em `requirements.md`, `screens.md` e `design.md`.

## Pré-requisitos

- [ ] Disponibilizar os contratos das entidades `Appointment`, `Doctor` e `Patient`, incluindo defaults e enumerações.
- [ ] Disponibilizar o cliente Base44 (ou adaptador equivalente) para entidades e `Core.SendEmail`.
- [ ] Configurar React Query, roteamento, `date-fns` e os componentes de UI usados pelas telas.
- [ ] Definir a estratégia de apresentação de erros de queries e mutações, atualmente não evidenciada no legado. 🔴

## Tarefas

- [ ] **AGD-01**: Criar o modelo/contrato `Appointment` com vínculos obrigatórios, data ISO, duração, tipo, status, observações, flags de lembrete e `consultation_id`.
  - Origem no legado: `base44/entities/Appointment.jsonc:2-67`
  - Critério de pronto: o contrato rejeita ausência de `patient_id`, `doctor_id` ou `date`, aplica os defaults definidos e aceita somente os valores enumerados.
  - Confiança: 🟢

- [ ] **AGD-02**: Implementar as regras de acesso do agendamento.
  - Origem no legado: `base44/entities/Appointment.jsonc:69-106`
  - Critério de pronto: criação é permitida ao usuário autenticado conforme o backend; leitura, atualização e exclusão são permitidas ao criador ou a um administrador.
  - Confiança: 🟢

- [ ] **AGD-03**: Implementar a página de listagem `Appointments` com queries de agendamentos, médicos e pacientes.
  - Origem no legado: `src/pages/Appointments.jsx:47-65`
  - Critério de pronto: a página carrega os três conjuntos, ordena agendamentos por `-date` e resolve nomes pelos IDs sem quebrar quando uma lista ainda está carregando.
  - Confiança: 🟢

- [ ] **AGD-04**: Implementar o contador e a lista de próximos agendamentos.
  - Origem no legado: `src/pages/Appointments.jsx:83-85`, `src/pages/Appointments.jsx:138-163`
  - Critério de pronto: somente registros com data futura e status diferente de `cancelado` entram na contagem e na lista; cada item mostra paciente, médico, especialidade, data/hora e status.
  - Confiança: 🟢

- [ ] **AGD-05**: Implementar a visualização semanal em `AppointmentCalendar`.
  - Origem no legado: `src/components/appointments/AppointmentCalendar.jsx:40-145`
  - Critério de pronto: exibir sete dias, horários de 08:00 a 19:00, navegação anterior/hoje/próxima, cores por status e clique que devolve o agendamento selecionado.
  - Confiança: 🟢

- [ ] **AGD-06**: Implementar o diálogo de detalhes e atualização de status.
  - Origem no legado: `src/pages/Appointments.jsx:67-78` e seção de diálogo da mesma página
  - Critério de pronto: clicar em um item abre os detalhes; seletor e ações Confirmar/Cancelar chamam `Appointment.update`, invalidam `['appointments']` e fecham o diálogo após sucesso.
  - Confiança: 🟢

- [ ] **AGD-07**: Implementar o formulário `NewAppointment` com seleção de paciente ativo e médico ativo.
  - Origem no legado: `src/pages/NewAppointment.jsx:40-71`, `src/pages/NewAppointment.jsx:127-168`
  - Critério de pronto: listar somente pacientes com `status: 'ativo'` e médicos com `is_active: true`; aceitar `patient_id` pré-selecionado pela URL; exigir paciente e médico.
  - Confiança: 🟢

- [ ] **AGD-08**: Implementar o calendário de data e o `TimeSlotPicker`.
  - Origem no legado: `src/pages/NewAppointment.jsx:170-...`, `src/components/appointments/TimeSlotPicker.jsx:30-105`
  - Critério de pronto: gerar slots conforme `working_days`, `working_hours` e `appointment_duration`; desabilitar slots sobrepostos, considerar duração existente/default de 30 minutos e retornar a data/hora ISO selecionada.
  - Confiança: 🟢

- [ ] **AGD-09**: Implementar a criação do agendamento e a navegação de sucesso.
  - Origem no legado: `src/pages/NewAppointment.jsx:73-102`
  - Critério de pronto: criar com tipo/status iniciais do formulário e duração do médico ou 30; invalidar `['appointments']` e navegar para `Appointments` somente após criação e notificações concluírem com sucesso.
  - Confiança: 🟢

- [ ] **AGD-10**: Integrar o e-mail de confirmação condicional.
  - Origem no legado: `src/pages/NewAppointment.jsx:77-86`
  - Critério de pronto: quando o paciente tem e-mail, chamar `Core.SendEmail` com destinatário, médico e data formatada; sem e-mail, não chamar a integração e ainda concluir a criação.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01**: Testar o happy path de criação com paciente ativo, médico ativo, data e slot disponível.
  - Critério de pronto: o registro é criado com duração/status/tipo esperados e a navegação ocorre para `Appointments`.
  - Confiança: 🟡 (não há framework nem testes legados identificados)

- [ ] **TT-02**: Testar que pacientes inativos e médicos inativos não aparecem nas seleções.
  - Critério de pronto: as queries aplicam exatamente os filtros `status: 'ativo'` e `is_active: true`.
  - Confiança: 🟡

- [ ] **TT-03**: Testar slots fora do expediente, dias não trabalhados e conflitos de duração.
  - Critério de pronto: slots inválidos ficam ausentes ou desabilitados e slots livres permanecem selecionáveis.
  - Confiança: 🟡

- [ ] **TT-04**: Testar atualização de cada status permitido a partir do diálogo.
  - Critério de pronto: cada atualização usa o ID correto, invalida a query e fecha o diálogo após sucesso.
  - Confiança: 🟡

- [ ] **TT-05**: Testar criação para paciente com e sem e-mail.
  - Critério de pronto: o primeiro caso envia um e-mail; o segundo não chama `SendEmail` e não falha por ausência de endereço.
  - Confiança: 🟡

- [ ] **TT-06**: Testar falhas de query, criação, atualização e envio de e-mail.
  - Critério de pronto: cada falha apresenta o comportamento de erro definido pelo produto, decisão ainda ausente no legado.
  - Confiança: 🔴

## Tarefas de Migração de Dados

- [ ] **TM-01**: Validar registros legados de `Appointment` contra os campos obrigatórios, enums de status/tipo e referências de paciente/médico.
  - Origem no legado: `base44/entities/Appointment.jsonc:2-67`
  - Critério de pronto: registros inválidos são identificados antes da migração e nenhum vínculo obrigatório fica órfão.
  - Confiança: 🟡

## Ordem Sugerida

1. AGD-01 e AGD-02: estabelecer contrato e segurança antes de expor operações.
2. AGD-03 e AGD-04: disponibilizar carregamento e derivação dos dados da listagem.
3. AGD-05 e AGD-06: completar visualização e gerenciamento de status.
4. AGD-07 e AGD-08: implementar seleção de participantes, data e disponibilidade.
5. AGD-09 e AGD-10: concluir persistência, notificação e navegação.
6. TT-01 a TT-05: validar os fluxos com comportamento observável no legado.
7. TT-06: bloquear a conclusão até definir tratamento de erros.
8. TM-01: executar antes de importar dados para o novo contrato.

## Lacunas Pendentes (🔴)

- Definir mensagens, estados visuais e política de retry para falhas de carregamento e mutações.
- Definir se a validação de sobreposição deve existir também no backend; hoje a evidência mostra somente verificação client-side.
- Definir se datas passadas devem ser bloqueadas no formulário.
- Validar a redação “agendamento confirmado” do e-mail quando o status inicial permanece `agendado`.

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
