# Fluxogramas — Módulo `dashboard`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Mermaid.js
>
> Fonte: `src/pages/Dashboard.jsx`, `src/components/medical/StatsCard.jsx`, `src/components/medical/PatientSearch.jsx`, `src/components/medical/ReportsView.jsx`

---

## 1. Fluxo Principal: Carregamento do Dashboard

```mermaid
flowchart TD
    A[Usuário acessa /Dashboard] --> B[useEffect: logAccess LOGIN - Acesso ao dashboard]
    B --> C[4 useQuery paralelos]
    C --> D[Patient.list -created_date 100]
    C --> E[Consultation.list -date 50]
    C --> F[Prescription.list -created_date 100]
    C --> G[Appointment.list -date 100]
    D --> H[Agregações client-side]
    E --> H
    F --> H
    G --> H
    H --> I[todayConsultations = date hoje - INCLUI canceladas]
    H --> J[upcomingConsultations = futuro E não cancelada, slice 5]
    H --> K[activePatients = count status ativo]
    H --> L[todayAppointments = hoje E não cancelado]
    H --> M[upcomingAppointments = futuro E não cancelado, slice 5]
    I --> N[Render header data pt-BR + PatientSearch + Novo Paciente]
    J --> N
    K --> O[4 StatsCards]
    L --> O
    M --> O
    O --> P[Tabs: visao-geral OU relatorios]
    P -->|visao-geral| Q[Próximos Agendamentos + Ações Rápidas + Badge LGPD]
    P -->|relatorios| R[ReportsView]
```

---

## 2. Fluxo: Busca de Paciente (PatientSearch)

```mermaid
flowchart TD
    A[Input recebe foco] --> B[Usuário digita query]
    B --> C{isFocused E query.length >= 2?}
    C -->|Não| D[Dropdown oculto]
    C -->|Sim| E[Filtro client-side sobre props.patients]
    E --> F[full_name contains case-insensitive OU cpf includes OU phone includes]
    F --> G[slice 0..5]
    G --> H{Resultados?}
    H -->|Sim| I[Lista animada AnimatePresence: avatar inicial + nome + telefone + badge Ativo/Inativo]
    H -->|Não| J[Nenhum paciente encontrado]
    H -->|isLoading| K[Buscando...]
    I --> L[Clique no item]
    L --> M[navigate PatientDetail?id=X]
    N[onBlur] --> O[setTimeout 200ms antes de fechar - hack anti-fechamento prematuro]
    O --> D
```

---

## 3. Fluxo: Relatórios (ReportsView)

```mermaid
flowchart TD
    A[Aba relatorios ativa] --> B[useQuery appointments-completed]
    B --> C[Appointment.filter status=concluido, -date, 500]
    A --> D[useQuery doctors-reports]
    D --> E[Doctor.list -created_date 200]
    C --> F{isDataLoading?}
    E --> F
    F -->|Sim| G[Spinner centralizado]
    F -->|Não| H[monthlyData useMemo]
    H --> I[Loop i=11..0: push mês format MMM/yy com consultas=0]
    I --> J[cutoff = now - 12 meses]
    J --> K[Para cada appointment: se date > cutoff incrementa mês correspondente via findIndex key]
    K --> L[Stats: total consultas, média mensal round total/12]
    E --> M[specialtyData useMemo]
    M --> N[Join manual O a×d: doctor_id → specialty ou Não especificada]
    N --> O[Agrupa por especialidade e ordena desc por count]
    O --> P[BarChart Recharts volume mensal]
    O --> Q[Ranking barras de progresso + badge Campeã para index 0]
```

---

## 4. Fluxo: Ações Rápidas (navegação)

```mermaid
flowchart LR
    A[Ações Rápidas card] --> B[Novo Paciente → PatientForm]
    A --> C[Agendar Consulta → NewAppointment]
    A --> D[Nova Consulta → NewConsultation]
    A --> E[Lista de Pacientes → Patients]
    A --> F[Templates → Templates]
    B --> G[módulo pacientes]
    C --> H[módulo agendamentos]
    D --> I[módulo consultas]
    E --> G
    F --> J[módulo templates]
```

---

## 5. Máquina de Estados da Busca (PatientSearch)

```mermaid
stateDiagram-v2
    [*] --> Oculta
    Oculta --> Aberta: focus && query.length >= 2
    Aberta --> Oculta: blur (após delay 200ms)
    Oculta --> Oculta: digitação < 2 chars
    Aberta --> Aberta: digitação continua
    note right of Aberta
        Estados internos: resultados,
        vazio ("Nenhum paciente
        encontrado") ou loading
    end note
```

---

## Lacunas Identificadas

1. **Taxa de Atendimento hardcoded**: `value="94%"` decorativo, sem cálculo real.
2. **"Documentos Emitidos" truncado**: conta apenas as últimas 100 prescrições retornadas.
3. **Inconsistência de canceladas**: `todayConsultations` inclui canceladas; `todayAppointments` exclui.
4. **LOGIN log a cada mount**: visita ao dashboard ≠ login real; infla auditoria.
5. **Join O(a×d)** em ReportsView: escala mal com volume; usar Map.
6. **Cache keys colidem**: Dashboard usa `['patients']` com limite 100; Patients.jsx mesma chave sem limite — ordem de mount define o cache.
7. **Sem teste** para nenhuma agregação.
