# Fluxogramas — Módulo `consultas`

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Mermaid.js

---

## 1. Fluxo Principal: Listagem → Detalhe → Edição/Novos Documentos

```mermaid
flowchart TD
    A[Usuário acessa /consultations] --> B{Carregando?}
    B -->|Sim| C[Exibe 4 Skeletons]
    B -->|Não| D[base44.entities.Consultation.list -date]
    D --> E[base44.entities.Patient.list]
    E --> F[Filtro client-side: search + status + data]
    F --> G{Consultas filtradas > 0?}
    G -->|Não| H[Estado vazio + CTA 'Nova Consulta']
    G -->|Sim| I[Grid de Cards com animação stagger]
    I --> J[Card clicado]
    J --> K[Navega para /consultation?id=X]
    K --> L[Consultation.jsx Mount]
    L --> M{Carregando?}
    M -->|Sim| N[Spinner centralizado]
    M -->|Não| O{Consulta existe?}
    O -->|Não| P[Card 'Não encontrada' + Voltar Dashboard]
    O -->|Sim| Q[logAccess VIEW_CONSULTATION]
    Q --> R[Render Header + Grid Paciente/Detalhes]
    R --> S[Ações rápidas]
    S -->|Nova Receita| T[setShowPrescription true]
    S -->|Exame| U[setShowExamUploader true]
    S -->|Editar| V[Navega para /new-consultation?id=X]
    V --> W[NewConsultation Mount - Modo Edição]
```

---

## 2. Fluxo: Listagem com Filtros Combinados

```mermaid
flowchart TD
    A[consultations array] --> B{search vazio?}
    B -->|Não| C[Filtro por: patient.full_name, chief_complaint, diagnosis<br/>case-insensitive]
    B -->|Sim| D[Passa todos]
    C --> E{statusFilter != 'all'?}
    D --> E
    E -->|Sim| F[Filtro c.status === statusFilter]
    E -->|Não| G[Passa todos]
    F --> H{dateFilter != 'all'?}
    G --> H
    H -->|today| I[toDateString === hoje]
    H -->|week| J[date >= hoje - 7 dias]
    H -->|month| K[date >= hoje - 1 mês]
    H -->|upcoming| L[date > new Date]
    H -->|all| M[Passa todos]
    I --> N[Retorna filteredConsultations]
    J --> N
    K --> N
    L --> N
    M --> N
```

---

## 3. Fluxo: Detalhe da Consulta (Consultation.jsx)

```mermaid
flowchart TD
    A[Mount com ?id=consulta-123] --> B[useQuery consultation filter id]
    B --> C[useQuery patient filter consultation.patient_id]
    B --> D[useQuery prescriptions filter consultation_id, -created_date]
    B --> E[useQuery exams filter consultation_id, -date]
    C --> F{paciente carregado?}
    D --> G[prescriptions array]
    E --> H[exams array]
    F -->|Sim| I[useEffect: logAccess VIEW_CONSULTATION]
    I --> J[Render Header: status badge, imprimir, editar]
    J --> K[Grid 1 col: Paciente + Alergias + Ações]
    J --> L[Grid 2 col: Seções]
    L --> M{vital_signs não vazio?}
    M -->|Sim| N[Seção Sinais Vitais - grid 4 cols]
    M -->|Não| O[Pula seção]
    O --> P[Seção Anamnese: queixa, HDA, exame físico]
    N --> P
    P --> Q{diagnosis ou treatment_plan?}
    Q -->|Sim| R[Seção Diagnóstico: CID, plano, follow-up]
    Q -->|Não| S[Pula]
    R --> T{prescriptions.length > 0?}
    S --> T
    T -->|Sim| U[Seção Documentos: cards com tipo + data]
    T -->|Não| V[Pula]
    U --> W{exams.length > 0?}
    V --> W
    W -->|Sim| X[Seção Exames: nome + data + lab + link arquivo]
    W -->|Não| Y[Pula]
```

---

## 4. Fluxo: Criação/Edição de Consulta (NewConsultation.jsx)

```mermaid
flowchart TD
    A[Mount] --> B{Lê URL: ?id= ou ?patient_id=?}
    B -->|id| C[Modo Edição: useQuery consultation]
    B -->|patient_id| D[Pré-seleção paciente: setSelectedPatient]
    B -->|nenhum| E[Modo Novo: formData defaults]
    C --> F[useEffect: popula formData + setSelectedPatient]
    E --> G[useQuery patients filter status=ativo, -full_name]
    D --> G
    G --> H[Busca paciente: nome/CPF → top 5]
    H --> I[Usuário seleciona paciente]
    I --> J[setSelectedPatient + formData.patient_id]
    J --> K[Formulário em etapas animadas]
    K --> L[1. Data/hora* + Status + Retorno]
    K --> M[2. Sinais Vitais (VitalSignsForm)]
    K --> N[3. Anamnese: queixa, HDA, exame físico]
    K --> O[4. Diagnóstico: CID-10, plano, observações]
    O --> P[Submit - exige selectedPatient]
    P --> Q{consultationId?}
    Q -->|Sim| R[Mutation: Consultation.update + logAccess EDIT_CONSULTATION]
    Q -->|Não| S[Mutation: Consultation.create + logAccess CREATE_CONSULTATION]
    R --> T{Sucesso?}
    S --> T
    T -->|Sim| U[invalidateQueries consultations]
    U --> V[navigate PatientDetail do paciente]
    T -->|Não| W[Toast Erro]
```

---

## 5. Fluxo: Editor de Prescrição/Documentos (PrescriptionEditor)

```mermaid
flowchart TD
    A[PatientDetail: Botão 'Nova Receita'/'Atestado'] --> B[setShowPrescription true]
    B --> C[Dialog Abre]
    C --> D{initialData?}
    D -->|Sim| E[Preenche type, content, medications, validDays, notes]
    D -->|Não| F[resetForm defaults]
    E --> G[Usuário seleciona Tipo Documento]
    F --> G
    G --> H{Tipo == 'atestado'?}
    H -->|Sim| I[Exibe 'Dias de Afastamento']
    H -->|Não| J[Oculta]
    G --> K[Carrega Templates: filter type + is_active=true]
    K --> L[Usuário seleciona Template]
    L --> M[applyTemplate: substitui {PACIENTE_NOME}, {PACIENTE_CPF}, {DATA}, {DATA_EXTENSO}]
    M --> N[Usuário edita Conteúdo]
    N --> O{Tipo inclui 'receita'?}
    O -->|Sim| P[Seção Medicamentos: add/update/remove]
    O -->|Não| Q[Pula]
    P --> R[Medicamento: nome, dosagem, frequência, duração, instruções]
    R --> S[Clica Salvar]
    Q --> S
    S --> T[handleSave: monta payload]
    T --> U{type inclui 'receita'?}
    U -->|Sim| V[medications array]
    U -->|Não| W[medications: []]
    V --> X[validDays só se 'atestado']
    W --> X
    X --> Y[onSave data + onOpenChange false]
    Y --> Z[Parent: invalidateQueries prescriptions]
```

---

## 6. Fluxo: Upload de Exame (ExamUploader)

```mermaid
flowchart TD
    A[PatientDetail: Botão 'Exame'] --> B[setShowExamUploader true]
    B --> C[Dialog Abre]
    C --> D[Usuário clica Drop Zone]
    D --> E{Arquivo selecionado?}
    E -->|Sim| F[handleFileChange: setFile + preview se image]
    E -->|Não| G[Permanece inicial]
    F --> H[Preenche: nome*, tipo, data, laboratório, resumo, obs]
    H --> I[Clica 'Salvar Exame']
    I --> J{file + name?}
    J -->|Não| K[Botão desabilitado]
    J -->|Sim| L[setIsUploading true]
    L --> M[base44.integrations.Core.UploadFile {file}]
    M --> N{Upload OK?}
    N -->|Não| O[console.error + isUploading false]
    N -->|Sim| P[file_url + file_type]
    P --> Q[Monta examData: patient_id, consultation_id, file_url...]
    Q --> R[onSave examData]
    R --> S[logAccess UPLOAD_EXAM]
    S --> T[resetForm + onOpenChange false]
    T --> U[Dialog Fecha]
    U --> V[Parent: invalidateQueries exams]
```

---

## 7. Fluxo: Gerenciamento de Medicações (PrescriptionEditor)

```mermaid
flowchart TD
    A[Tipo inclui 'receita'] --> B[Seção Medicamentos visível]
    B --> C[Botão 'Adicionar']
    C --> D[addMedication: push {name,dosage,frequency,duration,instructions}]
    D --> E[Lista de Cards - cada medicamento]
    E --> F{updateMedication index, field, value}
    E --> G{removeMedication index}
    F --> H[Imutável: spread + campo atualizado]
    G --> I[filter index !== alvo]
    H --> J[Re-render lista]
    I --> J
    J --> K[handleSave: medications incluído no payload]
```

---

## 8. Fluxo: Auditoria de Acesso (AccessLogger)

```mermaid
flowchart TD
    A[Ação monitorada] --> B[logAccess action, entityType?, entityId?, patientName?, details?]
    B --> C[base44.auth.me()]
    C --> D{Usuário autenticado?}
    D -->|Não| E[console.error - silencioso]
    D -->|Sim| F[Payload AccessLog]
    F --> G[base44.entities.AccessLog.create]
    G --> H{Sucesso?}
    H -->|Sim| I[Log gravado]
    H -->|Não| J[console.error 'Error logging access']
    I --> K[Base44 RLS: user vê próprios logs / admin vê todos]
```

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| `flowchart TD` | Top-Down |
| `A[Texto]` | Processo/Estado |
| `A --> B` | Transição |
| `A -->|Cond| B` | Transição condicional |
| `{Cond?}` | Decisão |
| `|Sim|` / `|Não|` | Ramificações |