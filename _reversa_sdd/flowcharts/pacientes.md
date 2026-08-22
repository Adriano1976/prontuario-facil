# Fluxogramas — Módulo `pacientes`

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Mermaid.js

---

## 1. Fluxo Principal: Listagem → Detalhe → Edição

```mermaid
flowchart TD
    A[Usuário acessa /patients] --> B{Carregando?}
    B -->|Sim| C[Exibe 4 Skeletons]
    B -->|Não| D{base44.entities.Patient.list}
    D --> E[Filtro client-side: search + status]
    E --> F{Pacientes filtrados > 0?}
    F -->|Não| G[Estado vazio + CTA 'Cadastrar Paciente']
    F -->|Sim| H[Grid de Cards com animação]
    H --> I[Card clicado]
    I --> J[Navega para /patient-detail?id=X]
    J --> K[PatientDetail Mount]
    K --> L{Carregando paciente?}
    L -->|Sim| M[Spinner centralizado]
    L -->|Não| N{Paciente existe?}
    N -->|Não| O[Card 'Não encontrado' + Voltar]
    N -->|Sim| P[logAccess VIEW_PATIENT]
    P --> Q[Render Header + Grid Info + Timeline]
    Q --> R[Ação: Editar]
    R --> S[Navega para /patient-form?id=X]
    S --> T[PatientForm Mount - Modo Edição]
    T --> U{Carregando paciente?}
    U -->|Sim| V[Loader]
    U -->|Não| W[Preenche formData + photoPreview + lgpdAccepted]
    W --> X[Usuário edita campos]
    X --> Y[handleChange / handlePhotoChange]
    Y --> Z[Submit]
    Z --> AA{LGPD aceito?}
    AA -->|Não + novo| AB[Abre Modal LGPD]
    AA -->|Sim| AC[Mutation: update Patient]
    AC --> AD{Sucesso?}
    AD -->|Sim| AE[invalidateQueries patients + navigate Patients]
    AD -->|Não| AF[Toast Erro]
    AB --> AG[Usuário aceita]
    AG --> AH[handleLGPDAccept]
    AH --> AC
```

---

## 2. Fluxo: Criação de Novo Paciente

```mermaid
flowchart TD
    A[Usuário clica 'Novo Paciente' em /patients] --> B[Navega para /patient-form]
    B --> C[PatientForm Mount - Modo Criação]
    C --> D[formData = defaults]
    D --> E[Usuário preenche campos obrigatórios]
    E --> F{CPF válido?}
    F -->|Não| G[Formatação automática apenas]
    F -->|Sim| H[handleChange atualiza formData]
    H --> I[Usuário clica Salvar]
    I --> J{lgpdAccepted?}
    J -->|Não| K[Abre Modal LGPDConsent]
    K --> L[Usuário lê termos + Checkbox]
    L --> M{Aceitou?}
    M -->|Não| N[Botão 'Aceitar' desabilitado]
    M -->|Sim| O[handleLGPDAccept: lgpd_consent=true + date + ip]
    O --> P[Mutation: create Patient]
    J -->|Sim| P
    P --> Q{Sucesso?}
    Q -->|Sim| R[invalidateQueries patients + navigate Patients]
    Q -->|Não| S[Toast Erro: 'Não foi possível salvar']
    R --> T[Patients.jsx recarrega lista]
```

---

## 3. Fluxo: Timeline Unificada (ConsultationTimeline)

```mermaid
flowchart TD
    A[PatientDetail carrega: consultations, prescriptions, exams, appointments] --> B[Combine arrays + eventType]
    B --> C{Total events > 0?}
    C -->|Não| D[Exibe 'Nenhum histórico encontrado']
    C -->|Sim| E[Sort por date DESC]
    E --> F[Map events → Cards com ícone por tipo]
    F --> G{eventType}
    G -->|consultation| H[Card azul: status badge + queixa + diagnóstico + link detalhe]
    G -->|prescription| I[Card roxo: tipo formatado + data + contagem medicamentos]
    G -->|exam| J[Card âmbar: nome + data + laboratório + link arquivo]
    G -->|appointment| K[Card verde: data/hora + status badge]
    H --> L[Render vertical com linha conectora]
    I --> L
    J --> L
    K --> L
    L --> M[Animação stagger por index]
```

---

## 4. Fluxo: Upload de Exame (ExamUploader)

```mermaid
flowchart TD
    A[PatientDetail: Botão 'Exame'] --> B[setShowExamUploader true]
    B --> C[Dialog Abre]
    C --> D[Usuário clica Drop Zone]
    D --> E{Arquivo selecionado?}
    E -->|Sim| F[handleFileChange: setFile + preview se imagem]
    E -->|Não| G[Permanece no estado inicial]
    F --> H[Usuário preenche: nome*, tipo, data, laboratório, resumo, obs]
    H --> I[Clica 'Salvar Exame']
    I --> J{file + name preenchidos?}
    J -->|Não| K[Botão desabilitado]
    J -->|Sim| L[setIsUploading true]
    L --> M[base44.integrations.Core.UploadFile]
    M --> N{Upload OK?}
    N -->|Não| O[Erro console + isUploading false]
    N -->|Sim| P[Cria Exam com file_url + patient_id + consultation_id]
    P --> Q[onSave examData]
    Q --> R[logAccess UPLOAD_EXAM]
    R --> S[resetForm + onOpenChange false]
    S --> T[Dialog Fecha]
    T --> U[PatientDetail: invalidateQueries exams]
```

---

## 5. Fluxo: Editor de Prescrição (PrescriptionEditor)

```mermaid
flowchart TD
    A[PatientDetail: Botão 'Receita'] --> B[setShowPrescription true]
    B --> C[Dialog Abre]
    C --> D{initialData?}
    D -->|Sim| E[Preenche type, content, medications, validDays, notes]
    D -->|Não| F[resetForm: defaults]
    E --> G[Usuário seleciona Tipo Documento]
    G --> H{Tipo == 'atestado'?}
    H -->|Sim| I[Exibe campo 'Dias de Afastamento']
    H -->|Não| J[Oculta campo]
    G --> K[Carrega Templates ativos por tipo]
    K --> L[Usuário seleciona Template]
    L --> M[applyTemplate: substitui {PACIENTE_NOME}, {PACIENTE_CPF}, {DATA}, {DATA_EXTENSO}]
    M --> N[Usuário edita Conteúdo]
    N --> O{Tipo inclui 'receita'?}
    O -->|Sim| P[Seção Medicamentos: add/update/remove]
    O -->|Não| Q[Pula medicamentos]
    P --> R[Usuário preenche: nome, dosagem, frequência, duração, instruções]
    R --> S[Clica Salvar]
    Q --> S
    S --> T[handleSave: monta data + onSave + onOpenChange false]
    T --> U[PatientDetail: invalidateQueries prescriptions]
```

---

## 6. Fluxo: Auditoria de Acesso (AccessLogger)

```mermaid
flowchart TD
    A[Qualquer ação monitorada] --> B[logAccess action, entityType, entityId, patientName, details]
    B --> C[base44.auth.me()]
    C --> D{Usuário autenticado?}
    D -->|Não| E[Erro silencioso: console.error]
    D -->|Sim| F[Monta payload AccessLog]
    F --> G[base44.entities.AccessLog.create]
    G --> H{Sucesso?}
    H -->|Sim| I[Log gravado]
    H -->|Não| J[console.error 'Error logging access']
    I --> K[Base44 RLS: user vê próprios logs ou admin vê todos]
```

---

## 7. Fluxo: Consentimento LGPD (LGPDConsent)

```mermaid
flowchart TD
    A[PatientForm: Submit sem lgpdAccepted + novo paciente] --> B[setShowLGPDConsent true]
    B --> C[Dialog Abre com ScrollArea termos]
    C --> D[Usuário rola + lê 7 seções]
    D --> E[Checkbox 'Declaro que li...']
    E --> F{Aceitou?}
    F -->|Não| G[Botão 'Aceitar e Continuar' disabled]
    F -->|Sim| H[setAccepted true]
    H --> I[handleAccept: onAccept + onOpenChange false]
    I --> J[PatientForm: handleLGPDAccept]
    J --> K[formData: lgpd_consent=true, lgpd_consent_date=now, lgpd_consent_ip='client-side']
    K --> L[Mutation create Patient prossegue]
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