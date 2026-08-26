# Fluxogramas — Módulo `agendamentos`

> Gerado pelo Archaeologist em 2026-08-25 | Nível: **completo** | Mermaid.js
>
> Fonte: `src/pages/Appointments.jsx`, `src/pages/NewAppointment.jsx`,
> `src/components/appointments/AppointmentCalendar.jsx`,
> `src/components/appointments/TimeSlotPicker.jsx`, `base44/entities/Appointment.jsonc`

---

## 1. Fluxo Principal: Listagem com Vistas (Calendário + Lista)

```mermaid
flowchart TD
    A[Usuário acessa /Appointments] --> B[useQuery appointments list -date]
    B --> C[useQuery doctors list]
    C --> D[useQuery patients list]
    D --> E[upcomingAppointments<br/>date > agora E status != cancelado]
    E --> F[Render header com contagem + botão Novo Agendamento]
    F --> G{Tab ativa?}
    G -->|calendar| H[AppointmentCalendar: grid 7 dias x 12h]
    G -->|list| I[Card com lista upcoming]
    H --> J[Slot clicado]
    I --> J
    J --> K[handleAppointmentClick apt]
    K --> L[setSelectedAppointment + setShowDetails true]
    L --> M[Dialog: Detalhes do Agendamento]
    M --> N[Select status + botões Confirmar/Cancelar]
    N --> O[updateStatusMutation Appointment.update id, status]
    O --> P[onSuccess: invalidate appointments + fecha dialog]
```

---

## 2. Fluxo: Calendário Semanal (`AppointmentCalendar.jsx`)

```mermaid
flowchart TD
    A[currentWeek state] --> B[startOfWeek com locale ptBR]
    B --> C[weekDays: addDays 0..6]
    C --> D[hours: 8..19]
    D --> E[Render grid 8 colunas x 12 linhas]
    E --> F[Para cada day, hour]
    F --> G[getAppointmentsForSlot day, hour<br/>parseISO + isSameDay + getHours]
    G --> H{Há appointments?}
    H -->|Não| I[Slot vazio]
    H -->|Sim| J[Render motion.button com status color]
    J --> K[onClick onAppointmentClick apt]
    I --> K
    K --> L[Botão Próxima/Anterior: setCurrentWeek addWeeks -1 ou 1]
    L --> M[Botão Hoje: setCurrentWeek new Date]
```

---

## 3. Fluxo: Criação de Agendamento (`NewAppointment.jsx`)

```mermaid
flowchart TD
    A[Mount] --> B{URL tem patient_id?}
    B -->|Sim| C[preselectedPatientId]
    B -->|Não| D[formData inicial com patient_id vazio]
    C --> E
    D --> E[formData: patient_id, doctor_id, date vazio, type=primeira_consulta, status=agendado]
    E --> F[useQuery patients filter status=ativo]
    F --> G[useQuery doctors filter is_active=true]
    G --> H{doctor_id selecionado?}
    H -->|Não| I[Render apenas Paciente/Médico]
    H -->|Sim| J[useQuery appointments filter doctor_id<br/>enabled=doctor+date]
    J --> K[Render Card Data/Horário]
    K --> L[Calendar mode single com selectedDate]
    L --> M{selectedDate?}
    M -->|Não| N[Sem TimeSlotPicker]
    M -->|Sim| O[TimeSlotPicker doctor, date, appointments, formData.date]
    O --> P[Usuário clica slot disponível]
    P --> Q[onSelectTime: setFormData date = time.toISOString]
    Q --> R[Render Card Detalhes: type, notes]
    R --> S[Submit handleSubmit]
    S --> T[saveMutation: Appointment.create com duration = doctor.appointment_duration ou 30]
    T --> U{Paciente tem email?}
    U -->|Sim| V[SendEmail confirmação via Core.SendEmail]
    U -->|Não| W[Pula email]
    V --> X[invalidate appointments + navigate Appointments]
    W --> X
```

---

## 4. Fluxo: TimeSlotPicker — Geração e Verificação de Disponibilidade

```mermaid
flowchart TD
    A[Props: doctor, selectedDate, appointments] --> B{doctor OU selectedDate ausentes?}
    B -->|Sim| C[return null]
    B -->|Não| D[generateTimeSlots]
    D --> E[dayOfWeek = selectedDate.getDay]
    E --> F{doctor.working_days inclui dayOfWeek?}
    F -->|Não| G[return array vazio]
    F -->|Sim| H[startHour, startMin = working_hours.start split: 08:00]
    H --> I[endHour, endMin = working_hours.end split: 18:00]
    I --> J[duration = doctor.appointment_duration ou 30]
    J --> K[currentTime = setHours startHour, startMin]
    K --> L[endTime = setHours endHour, endMin]
    L --> M{isBefore currentTime, endTime?}
    M -->|Sim| N[push slot e addMinutes currentTime, duration]
    N --> M
    M -->|Não| O[slots array populado]
    O --> P{slots.length == 0?}
    P -->|Sim| Q[Render: Médico não atende neste dia]
    P -->|Não| R[Para cada slot: isSlotAvailable]
    R --> S[slotTime = slot.getTime]
    S --> T[Para cada appointment existente]
    T --> U[aptTime = parseISO apt.date.getTime]
    U --> V[aptEnd = aptTime + apt.duration ou 30 min]
    V --> W{slotTime >= aptTime E slotTime < aptEnd?}
    W -->|Sim| X[Slot indisponível]
    W -->|Não| Y[Continua verificando]
    Y --> Z{Nenhum conflito?}
    Z -->|Sim| AA[Slot disponível - botão habilitado]
    Z -->|Não| X
```

---

## 5. Fluxo: Atualização de Status no Dialog

```mermaid
flowchart TD
    A[Dialog aberto com selectedAppointment] --> B[Render dados: paciente, médico, data formatada]
    B --> C[Select status com STATUS_CONFIG]
    C --> D[onValueChange: updateStatusMutation id, status]
    D --> E[Appointment.update id, status]
    E --> F[onSuccess: invalidate appointments + setShowDetails false]
    B --> G[Botão Confirmar: updateStatusMutation status=confirmado]
    B --> H[Botão Cancelar: updateStatusMutation status=cancelado]
    G --> F
    H --> F
```

---

## 6. Máquina de Estados: Status do Agendamento

```mermaid
stateDiagram-v2
    [*] --> agendado: create<br/>(default)
    agendado --> confirmado: confirmar
    agendado --> cancelado: cancelar
    agendado --> faltou: não compareceu
    confirmado --> em_atendimento: iniciar consulta
    confirmado --> cancelado: cancelar
    confirmado --> faltou: não compareceu
    em_atendimento --> concluido: finalizar consulta
    em_atendimento --> cancelado: cancelar
    concluido --> [*]
    cancelado --> [*]
    faltou --> [*]

    note right of agendado
      Estado inicial após criar
      sem confirmação do paciente
    end note

    note right of concluido
      consultation_id vinculado
      (campo preenchido)
    end note
```

**Transições permitidas (mapeadas a partir do código):**
- `agendado` → `confirmado` (botão "Confirmar")
- `agendado` → `cancelado` (botão "Cancelar")
- Qualquer estado → qualquer outro via `Select` (a UI não restringe)

---

## 7. Legenda

| Símbolo | Significado |
|---------|-------------|
| `flowchart TD` | Top-Down |
| `A[Texto]` | Processo/Estado |
| `A --> B` | Transição |
| `A -->|Cond| B` | Transição condicional |
| `{Cond?}` | Decisão |
| `|Sim|` / `|Não|` | Ramificações |
| `stateDiagram-v2` | Máquina de estados |
