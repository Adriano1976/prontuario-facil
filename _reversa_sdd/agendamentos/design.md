# Agendamentos, Design Técnico

> Especificação derivada dos componentes legados de agendamento e do schema `Appointment`.

## Interface

### Dados persistidos

| Campo | Tipo | Regra |
|---|---|---|
| `patient_id` | `string` | Obrigatório; referencia um paciente ativo. 🟢 |
| `doctor_id` | `string` | Obrigatório; referencia um médico ativo na criação. 🟢 |
| `date` | `datetime` ISO | Obrigatório; data e hora escolhidas no formulário. 🟢 |
| `duration` | `number` | Minutos; recebe `doctor.appointment_duration` ou `30`. 🟢 |
| `type` | enum | `primeira_consulta`, `retorno`, `exame` ou `procedimento`; padrão `primeira_consulta`. 🟢 |
| `status` | enum | `agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado` ou `faltou`; padrão `agendado`. 🟢 |
| `notes` | `string` | Observações livres. 🟢 |
| `reminder_sent` / `reminder_sent_date` | `boolean` / `datetime` | Flags de lembrete previstas no schema; não são alteradas pelo fluxo de criação. 🟢 |
| `consultation_id` | `string` | Vínculo opcional com a consulta concluída. 🟢 |

### Operações usadas pela interface

| Operação | Assinatura | Retorno | Observação |
|---|---|---|---|
| Listar agendamentos | `Appointment.list('-date')` | `Appointment[]` | Alimenta calendário, lista e contador de próximos. 🟢 |
| Filtrar agendamentos do médico | `Appointment.filter({ doctor_id })` | `Appointment[]` | Usada para verificar disponibilidade da data selecionada. 🟢 |
| Criar agendamento | `Appointment.create(data)` | `Appointment` | Envia confirmação por e-mail quando o paciente possui e-mail. 🟢 |
| Atualizar status | `Appointment.update(id, { status })` | `Appointment` | Fecha o diálogo e invalida a consulta após sucesso. 🟢 |
| Enviar confirmação | `Core.SendEmail({ to, subject, body })` | `void`/resultado da integração | Executado somente se o paciente tiver e-mail. 🟢 |

## Fluxo Principal

1. `Appointments.jsx` consulta agendamentos, médicos e pacientes via React Query. 🟢
2. A página calcula os próximos agendamentos com `date > agora` e `status !== 'cancelado'`, exibindo a contagem e as vistas de calendário/lista. 🟢
3. `AppointmentCalendar.jsx` organiza a semana em sete dias e horários de 08:00 a 19:00; cada cartão resolve os nomes do paciente e do médico pelos IDs. 🟢
4. Ao selecionar um cartão da agenda ou da lista, a página abre um diálogo com os detalhes e o status atual. 🟢
5. A alteração pelo seletor, ou pelos botões Confirmar/Cancelar, chama `Appointment.update` e invalida a query de agendamentos. 🟢
6. `NewAppointment.jsx` carrega somente pacientes com `status: 'ativo'` e médicos com `is_active: true`. 🟢
7. Com médico e data selecionados, `TimeSlotPicker.jsx` gera slots a partir de `working_days`, `working_hours` e `appointment_duration`, removendo conflitos com agendamentos existentes. 🟢
8. No envio, o formulário cria o registro com duração derivada do médico, tenta enviar a confirmação ao paciente e navega para `Appointments` após sucesso. 🟢

## Fluxos Alternativos

- **Paciente pré-selecionado na URL:** `?patient_id=<id>` preenche `formData.patient_id` inicialmente. 🟢
- **Médico ou data ausente:** o seletor de horários não é renderizado. 🟢
- **Médico não atende no dia:** quando o dia da semana não está em `working_days`, o componente informa que não há atendimento. 🟢
- **Conflito de horário:** o botão do slot fica desabilitado quando o horário coincide com o intervalo de um agendamento existente, considerando sua duração ou 30 minutos. 🟢
- **Paciente sem e-mail:** a criação prossegue sem chamar `Core.SendEmail`. 🟢
- **Falha de consulta ou mutação:** o comportamento visual específico de erro não está documentado nos componentes analisados. 🔴

## Dependências

- `@tanstack/react-query`: cache, carregamento e invalidação de pacientes, médicos e agendamentos. 🟢
- `@/api/base44Client`: acesso às entidades `Appointment`, `Doctor`, `Patient` e à integração `Core.SendEmail`. 🟢
- `date-fns`: cálculo de semana, parsing/formatação ISO e geração de horários. 🟢
- `AppointmentCalendar` e `TimeSlotPicker`: componentes especializados de visualização semanal e seleção de disponibilidade. 🟢
- `base44/entities/Appointment.jsonc` e `Doctor.jsonc`: contratos de dados, defaults e regras RLS. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---|---|---|
| Separar listagem em calendário semanal e lista de próximos | `src/pages/Appointments.jsx:117-136`, `src/components/appointments/AppointmentCalendar.jsx:40-145` | 🟢 |
| Derivar disponibilidade no cliente a partir do expediente do médico e dos agendamentos carregados | `src/components/appointments/TimeSlotPicker.jsx:33-69` | 🟢 |
| Usar a duração configurada pelo médico, com fallback de 30 minutos | `src/pages/NewAppointment.jsx:96-101`, `base44/entities/Doctor.jsonc:48-52` | 🟢 |
| Permitir qualquer valor do enum de status pelo seletor, sem restringir transições na UI | `src/pages/Appointments.jsx:67-73`, `_reversa_sdd/flowcharts/agendamentos.md:170-173` | 🟢 |
| Restringir leitura, atualização e exclusão ao criador ou administrador | `base44/entities/Appointment.jsonc:69-106` | 🟢 |

## Estado Interno

- `Appointments`: `selectedAppointment` guarda o item aberto; `showDetails` controla o diálogo. 🟢
- `AppointmentCalendar`: `currentWeek` controla a semana exibida e pode avançar, retroceder ou retornar à semana atual. 🟢
- `NewAppointment`: `formData` mantém paciente, médico, data, tipo, observações e status; `selectedDate` controla a data usada pelo seletor de slots. 🟢
- O estado de disponibilidade é recalculado a partir das queries e não é persistido separadamente. 🟢

## Observabilidade

- Não foram identificados logs, métricas ou traces próprios do módulo nos componentes analisados. 🟢
- A invalidação da query `['appointments']` é o mecanismo de sincronização após criação ou atualização de status. 🟢

## Riscos e Lacunas

- 🔴 O tratamento de erros de carregamento, criação, atualização e envio de e-mail não está especificado na UI analisada.
- 🔴 Não há evidência de bloqueio de agendamento no passado, nem de validação server-side de sobreposição além do filtro client-side.
- 🟡 A descrição do e-mail afirma que o agendamento está “confirmado”, embora o registro seja criado com status `agendado`; a semântica pretendida da mensagem deve ser validada.
- 🟡 O calendário visualiza slots pela hora inteira (`getHours`) e não representa explicitamente minutos no grid, embora a criação permita horários em intervalos configuráveis.

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
