# Fluxogramas — Módulo `medicos`

> Gerado pelo Archaeologist em 2026-08-25 | Nível: **completo** | Mermaid.js
>
> Fonte: `src/pages/Doctors.jsx`, `base44/entities/Doctor.jsonc`

---

## 1. Fluxo Principal: Listagem de Médicos

```mermaid
flowchart TD
    A[Usuário acessa /Doctors] --> B[useQuery doctors -created_date]
    B --> C[Render header com botão Novo Médico]
    C --> D[Grid de cards: avatar inicial, nome, especialidade, CRM]
    D --> E{Badge is_active?}
    E -->|true| F[Badge verde: Ativo]
    E -->|false| G[Badge cinza: Inativo]
    F --> H[working_hours start - end]
    G --> H
    H --> I[working_days como Badges outline]
    I --> J{Botões do card}
    J --> K[Editar: handleEdit doctor]
    J --> L[Excluir: deleteMutation.mutate id]
    K --> M[setEditingDoctor + setFormData + setShowEditor true]
    M --> N[Dialog: Editor de Médico]
    L --> O[Doctor.delete id]
    O --> P[onSuccess: invalidate doctors]
```

---

## 2. Fluxo: Criação de Médico

```mermaid
flowchart TD
    A[Botão Novo Médico no header] --> B[resetForm + setEditingDoctor null]
    B --> C[setShowEditor true]
    C --> D[Dialog: Editor de Médico em modo criação]
    D --> E[formData inicial: defaults seg-sex 08:00-18:00 30min ativo]
    E --> F[Usuário preenche full_name, specialty, crm required]
    F --> G[Email, telefone opcionais]
    G --> H[working_days: 7 checkboxes com toggle aditivo]
    H --> I[toggleWorkingDay: remove se existe, add+sort se não]
    I --> J[working_hours.start/end via input time]
    J --> K[appointment_duration via input number parseInt]
    K --> L[is_active via Switch]
    L --> M[Submit handleSubmit e.preventDefault]
    M --> N[saveMutation.mutate formData]
    N --> O{saveMutation é edição?}
    O -->|não| P[Doctor.create data]
    O -->|sim| Q[Doctor.update editingDoctor.id, data]
    P --> R[onSuccess: invalidate doctors + resetForm + fechar dialog]
    Q --> R
```

---

## 3. Fluxo: Edição de Médico

```mermaid
flowchart TD
    A[handleEdit doctor] --> B[setEditingDoctor doctor]
    B --> C[setFormData doctor]
    C --> D[setShowEditor true]
    D --> E[Dialog título: Editar Médico]
    E --> F[Inputs preenchidos com dados do médico]
    F --> G[checkboxes pré-marcados nos working_days]
    G --> H[Switch pré-setado em is_active]
    H --> I[Usuário altera campos desejados]
    I --> J[Submit]
    J --> K[saveMutation detecta editingDoctor presente]
    K --> L[Doctor.update editingDoctor.id, data]
    L --> M[onSuccess: invalidate + resetForm + setEditingDoctor null]
```

---

## 4. Fluxo: Exclusão de Médico

```mermaid
flowchart TD
    A[Botão Trash2 no card] --> B[deleteMutation.mutate doctor.id]
    B --> C[Doctor.delete id via base44 SDK]
    C --> D{Sucesso?}
    D -->|Sim| E[onSuccess: invalidate doctors]
    D -->|Não| F[toast de erro]
    E --> G[Grid re-renderiza sem o médico]
    F --> H[Card permanece]
    %% Lacuna: sem confirmação (AlertDialog) antes de excluir
```

---

## 5. Máquina de Estados do Toggle `is_active`

```mermaid
stateDiagram-v2
    [*] --> Ativo: create (default)
    Ativo --> Inativo: Switch off em edição
    Inativo --> Ativo: Switch on em edição
    Ativo --> [*]: Doctor.delete
    Inativo --> [*]: Doctor.delete
    note right of Inativo
        Médico inativo NÃO aparece no
        Select de NewAppointment
        (filtro is_active=true)
    end note
```

---

## 6. Integração com TimeSlotPicker (consumidor)

```mermaid
flowchart LR
    A[Doctor salvo] --> B[base44.entities.Doctor.list]
    B --> C[NewAppointment filtra is_active=true]
    C --> D[Select de médicos]
    D --> E{Usuário escolhe médico?}
    E -->|Sim| F[TimeSlotPicker recebe doctor]
    F --> G[generateTimeSlots usando working_days + working_hours + appointment_duration]
    G --> H[isSlotAvailable cruza com appointments existentes]
```

---

## Lacunas Identificadas

1. **Sem confirmação de exclusão**: o botão `Trash2` chama `deleteMutation.mutate` direto — sem `AlertDialog` de confirmação. Risco de exclusão acidental.
2. **Sem upload de foto**: campo `photo_url` existe no schema mas não há controle de upload em `Doctors.jsx`. Avatar do card é gerado pela inicial do nome.
3. **Sem validação de CRM**: campo livre (sem regex de CRM/UF).
4. **Sem validação start < end**: `working_hours.start` e `end` são inputs independentes; nada impede `start > end`.
5. **Sem auditoria**: nenhuma chamada a `logAccess` ao criar/editar/excluir médicos.
6. **RLS apenas no backend**: como `create` exige admin, usuário comum recebe erro do Base44 (não tratado com mensagem amigável na UI).
