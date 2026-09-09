---
schemaVersion: 1
generatedAt: 2026-09-09T15:52:00-03:00
reversa:
  version: "1.3.2"
kind: target_screens
producedBy: screen-translator
mode: literal
sourcePlatform: react-hooks
targetPlatform: web-spa
adapter: same-platform-literal (react-hooks → web-spa React+TS; sem re-expressão visual)
screenCount: 16
hash: "sha256:a658ca2b0b05421cab3c992c0568d95d3d5b4207d3f3450880426f9ea8d99c16"
---

# Target Screens

> Especificação executável de cada tela do sistema novo, derivada do legado segundo o modo aprovado em `screen_modernization_decision.md`. Conteúdo textual preservado literalmente, salvo aprovação explícita de revisão linguística.
> Leitura primária para o codificador. Cada seção é um contrato.

> **Nota do modo literal (mesma plataforma)**: como origem ≡ alvo em plataforma (React → React + TS), o contrato de cada tela é: **converter o arquivo-fonte `.jsx` para `.tsx` preservando hierarquia, textos, tokens, componentes shadcn/Radix e comportamento**; a especificação abaixo fixa os invariantes de paridade (origem, componentes, interpolações, transições, divergências conhecidas) para o Inspector verificar. Não há re-expressão visual: o componente legado é o artefato-fonte.

## Resumo

- **Modo aplicado**: literal
- **Telas geradas**: 16
- **Adapter**: same-platform-literal (sem adapter de plataforma — mesmo runtime)
- **Tokens consumidos**: `_reversa_sdd/design-system/tokens.md` (inalterado); nenhum `tokens-derived.md` necessário
- **Golden files**: 0 capturados (oráculo = SPA offline executável; captura manual — manifest em `golden/manifest.yaml`, `present: false`)
- **Deviations registradas**: 0 em `screen_deviation_log.md` (modo literal não introduz divergências; itens pré-existentes do legado — ex.: paginação de logs, taxa 94% — já tratados em `target_business_rules.md`/`ambiguity_log.md`)

---

## Tela: Dashboard Principal

**Origem**: `src/pages/Dashboard.jsx` (Ver `_reversa_sdd/dashboard/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: KPI `StatsCard`, `PatientSearch`, `ReportsView`, botões shadcn, Tabs (Visão geral / Relatórios)
**Pontos de interpolação**: `{{activePatients}}`, `{{todayAppointments.length}}`, `{{prescriptions.length}}`, `94%` (constante mock — AMB-001), `{{upcomingAppointments[0..4]}}`
**Transições de saída**: → PatientForm (Novo Paciente), → NewAppointment (Agendar), → NewConsultation (Nova Consulta), → Patients, → Templates, → Appointments (Ver todos)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal — espelho do arquivo .jsx)
spec.legacy_origin: "src/pages/Dashboard.jsx"
spec.root:
  component: DashboardPage
  children:
    - component: Tabs (Visão geral | Relatórios)
      children:
        - KpiGrid: StatsCard x4 (Pacientes Ativos; Agendamentos Hoje; Documentos Emitidos; Taxa de Atendimento = "94%" constante mock tipada)
        - UpcomingList: até 5 agendamentos futuros != cancelado; estado vazio "Nenhum agendamento" + botão "Agendar consulta"; link "Ver todos"
        - QuickActions: Novo Paciente | Agendar Consulta | Nova Consulta | Lista de Pacientes | Templates | badge "LGPD Compliant"
        - GlobalSearch: PatientSearch (nome/CPF)
    - component: ReportsView (aba Relatórios)
spec.states: preserva estados do legado (loading spinners, estados vazios) — sem novos estados
spec.invariants_de_paridade:
  - textos literais preservados (incluindo "Nenhum agendamento", "94%")
  - nenhum sparkline/barra de progresso na Taxa (Q-02: não há mini chart)
  - logAccess(LOGIN…) no mount (BR-MIGRAR-032)
  - limites 100/50 nas queries (BR-MIGRAR-033)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum (modo literal).

---

## Tela: Listagem de Pacientes

**Origem**: `src/pages/Patients.jsx` (Ver `_reversa_sdd/pacientes/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Input (busca), Dropdown/Select (status), Cards, Avatar, Badge, Button
**Pontos de interpolação**: `{{busca}}`, `{{statusFilter}}`, `{{pacientes[]}}`
**Transições de saída**: → PatientForm (novo/editar), → PatientDetail (detalhe)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Patients.jsx"
spec.root:
  component: PatientsPage
  children:
    - HeaderRow: contador "N pacientes cadastrados" + Button "+ Novo Paciente"
    - SearchBar: Input placeholder "Buscar por nome, CPF, telefone ou email..." + Select status ("Todos") + ícone filtro
    - CardList: cards por paciente (avatar/inicial, nome, badge status Ativo, idade, telefone, email, convênio, tipo sanguíneo, seta ação)
spec.states: preserva estados do legado (isLoading spinner; lista vazia)
spec.regras_tipadas_no_componente:
  - filtro combinado busca/status (code-analysis §4.2) como função pura tipada
  - calculateAge extraído p/ módulo compartilhado tipado do domínio (deduplicação aprovada na topologia híbrida)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Cadastro de Novo Paciente

**Origem**: `src/pages/PatientForm.jsx` (Ver `_reversa_sdd/pacientes/screens.md`, `design.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Form, Input, Select, DatePicker, Textarea, Switch, Dialog (Ver Termo), Button
**Pontos de interpolação**: `{{paciente}}` (edição), seções do formulário
**Transições de saída**: → Patients (cancelar/salvar); modal LGPD "Ver Termo"
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/PatientForm.jsx"
spec.root:
  component: PatientFormPage
  children:
    - FormSections:
        Dados Pessoais: Nome Completo*, CPF* (máscara), Data de Nascimento*, Gênero, Tipo Sanguíneo, Foto
        Contato: Telefone*, Email, Endereço, Contato/Telefone de Emergência
        Convênio: Nome, Número da Carteirinha
        Informações Médicas: Alergias, Condições Crônicas, Medicamentos em Uso, Observações
        LGPD: aviso "Consentimento LGPD pendente" + Button "Ver Termo" (Dialog)
    - Actions: Button "Cancelar" | Button "Salvar Paciente"
spec.states: preserva estados do legado (validação de campos; consentimento pendente bloqueia save)
spec.regras_tipadas_no_componente:
  - campos obrigatórios full_name/cpf/birth_date/phone/lgpd_consent (BR-MIGRAR-003)
  - no save: lgpd_consent_date + lgpd_consent_ip (BR-MIGRAR-004)
  - zod schema reflete Patient type (target_data_model)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Detalhe do Paciente (timeline clínica)

**Origem**: `src/pages/PatientDetail.jsx` (não consta em `ui/inventory.md`; inventário interno SCR-0016)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Tabs, Avatar, Button, Alert (alergias), modais (PrescriptionEditor, ExamUploader), ConsultationTimeline
**Pontos de interpolação**: `{{paciente}}`, timeline (consultations/prescriptions/exams/appointments)
**Transições de saída**: → PatientForm (editar), modal "Nova Receita"/"Atestado" (PrescriptionEditor), modal "Exame" (ExamUploader), agendar
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/PatientDetail.jsx"
spec.root:
  component: PatientDetailPage
  children:
    - PatientHeader: dados do paciente, alerta de alergias
    - Tabs: appointments | consultations | prescriptions | exams (timeline unificada — code-analysis §4.4)
    - QuickDocs: botões de emissão (herda consultation_id/patient_id — Q-05)
spec.states: preserva estados do legado (isLoading, "não encontrado", tabs)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Calendário de Agendamentos

**Origem**: `src/pages/Appointments.jsx` + `src/components/appointments/AppointmentCalendar.jsx` (Ver `_reversa_sdd/agendamentos/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Tabs/segmented (Calendário|Lista), Button, Badge (status), calendário semanal custom
**Pontos de interpolação**: `{{semana}}`, `{{appointments[]}}`, `{{horários}}`
**Transições de saída**: → NewAppointment, → NewConsultation, edição de status (confirmar/concluir/cancelar)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Appointments.jsx + AppointmentCalendar.jsx"
spec.root:
  component: AppointmentsPage
  children:
    - ViewToggle: Calendário | Lista
    - WeeklyCalendar: colunas de dias, linha de horários 8:00–19:00, hoje destacado, navegação (< Hoje >)
    - StatusLegend: agendado/confirmado/em_atendimento/concluido/cancelado/faltou (cores do legado)
    - HeaderRow: contador "N agendamentos próximos" + Button "+ Novo Agendamento"
spec.states: preserva estados do legado; interações de status manuais (BR-MIGRAR-012; sem automação — AMB-003)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Novo Agendamento

**Origem**: `src/pages/NewAppointment.jsx` + `src/components/appointments/TimeSlotPicker.jsx` (Ver `_reversa_sdd/agendamentos/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Form, Select (paciente/médico/tipo), Calendar/DatePicker embutido, Textarea, Button
**Pontos de interpolação**: `{{pacientes ativos}}`, `{{medicos}}`, `{{data}}`, `{{tipo}}`
**Transições de saída**: → Appointments (cancelar/confirmar)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/NewAppointment.jsx"
spec.root:
  component: NewAppointmentPage
  children:
    - Form: Paciente* (dropdown), Médico* (dropdown), Tipo de Consulta, Observações
    - DateTimeSection: widget de calendário embutido p/ data/hora (Q-03) + grade de horários válidos
    - Actions: Button "Cancelar" | Button "Confirmar Agendamento"
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - somente pacientes ativos selecionáveis (BR-MIGRAR-001)
  - validação de slot contra working_days/hours/appointment_duration (BR-MIGRAR-013) — função pura tipada
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Listagem de Consultas

**Origem**: `src/pages/Consultations.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Input, Select, Badge, Card/List, Button
**Pontos de interpolação**: `{{busca}}`, `{{status}}`, `{{consultas[]}}`
**Transições de saída**: → NewConsultation, → Consultation (detalhe)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Consultations.jsx"
spec.root:
  component: ConsultationsPage
  children:
    - Filters: Input "Buscar por paciente, queixa ou diagnóstico...", Select status ("Todos Status"), Select datas ("Todas as datas")
    - List: por consulta — iniciais do paciente, nome, badge status, data/hora/queixa, data de retorno, seta de ação
    - HeaderRow: contador "N consultas encontradas" + Button "+ Nova Consulta"
spec.states: preserva estados do legado (loading, vazio)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Novo Atendimento (Anamnese)

**Origem**: `src/pages/NewConsultation.jsx` + `src/components/medical/VitalSignsForm.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Form, Input/Number (sinais vitais), Textarea, Select (status), DatePicker, Button
**Pontos de interpolação**: `{{paciente}}`, `{{data}}`, `{{status}}`
**Transições de saída**: → Consultations (salvar/cancelar), → Consultation
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/NewConsultation.jsx"
spec.root:
  component: NewConsultationPage
  children:
    - PatientField: busca/vinculação de paciente
    - MetaRow: Data e Hora*, Status (ex: "Em Andamento"), Data de Retorno (opcional)
    - VitalSignsForm: PA, FC, Temp, FR, SatO2, Peso, Altura
    - Anamnese: Queixa Principal, História da Doença Atual, Exame Físico
    - Diagnosis: Diagnóstico Principal, CID-10, Plano de Tratamento, Observações
    - Actions: "Cancelar" | "Salvar Consulta"
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - patient_id obrigatório (BR-MIGRAR-006)
  - status segue máquina de estados (BR-MIGRAR-007)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Visualização de Consulta

**Origem**: `src/pages/Consultation.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Badge, Button, Alert (alergias)
**Pontos de interpolação**: `{{consulta}}`, `{{sinais vitais}}`, `{{anamnese}}`
**Transições de saída**: → editar consulta, → PrescriptionEditor (Nova Receita/Atestado/Exame), imprimir
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Consultation.jsx"
spec.root:
  component: ConsultationDetailPage
  children:
    - Header: identificação, data/hora, badge status, Buttons "Imprimir" | "Editar"
    - PatientPanel (esquerda): nome, telefone, foto, alerta alergias, botões "Nova Receita" | "Atestado" | "Exame"
    - VitalSignsPanel: grid consolidado
    - AnamnesePanel: queixa, HDA, exame físico consolidados
spec.states: preserva estados do legado
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Modal: Novo Documento

**Origem**: `src/components/medical/PrescriptionEditor.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Select, Textarea, Button, ícones (impressora, disquete), lista de medicamentos
**Pontos de interpolação**: `{{type}}`, `{{template}}`, `{{content}}`, `{{medications[]}}`
**Transições de saída**: salvar → fecha modal; Imprimir (window.open); herda patient_id/consultation_id (Q-05)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/components/medical/PrescriptionEditor.jsx"
spec.root:
  component: PrescriptionEditorDialog
  children:
    - Form: Tipo de Documento (ex: "Receita Simples"), Template ("Selecionar template..."), Conteúdo (textarea)
    - MedicationsSection: exibida SOMENTE se type inclui "receita" (BR-MIGRAR-008; ocultar nos demais — Q-06)
      items: Nome, Dosagem, Frequência, Duração, Instruções + "+ Adicionar"/excluir
    - Notes: Observações (opcional)
    - Actions: "Imprimir" | "Salvar" (verde, disquete) | fechar X
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - interpolação de variáveis no save (BR-MIGRAR-021) — sem escape HTML, alerta XSS AMB-006 propagado (não corrigir)
  - template_name/valid_days conforme tipo (code-analysis BR-C-05/06)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum (AMB-006 é alerta referido à codificação, não divergência de tela).

---

## Tela: Modal: Upload de Exame

**Origem**: `src/components/medical/ExamUploader.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Dropzone/Drag&Drop, Input, Select, DatePicker, Textarea, Button
**Pontos de interpolação**: `{{exame}}`, `{{arquivo}}`
**Transições de saída**: salvar → fecha modal; preview do arquivo
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/components/medical/ExamUploader.jsx"
spec.root:
  component: ExamUploaderDialog
  children:
    - Dropzone: "PDF ou Imagem (máx. 10MB)" — UploadFile → file_url (BR-MIGRAR-041; offline: Data URL em memória)
    - Form: Nome do Exame*, Tipo (ex: "Laboratorial"), Data do Exame, Laboratório/Clínica, Resumo dos Resultados, Observações
    - Actions: "Cancelar" | "Salvar Exame"
spec.states: preserva estados do legado
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Gerenciamento de Médicos

**Origem**: `src/pages/Doctors.jsx` (Ver `_reversa_sdd/medicos/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Avatar, Badge, Button
**Pontos de interpolação**: `{{medicos[]}}`
**Transições de saída**: → modal Novo Médico (editar/excluir)
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Doctors.jsx"
spec.root:
  component: DoctorsPage
  children:
    - CardList: por médico — avatar/inicial D, nome, especialidade, CRM+UF, badge Ativo, horário (ex: 14:00 - 18:00), badges dias da semana, botões Editar/Excluir
    - HeaderRow: Button "+ Novo Médico" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: CRUD restrito a admin (BR-MIGRAR-015) — guarda tipada
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Modal: Novo Médico

**Origem**: `src/pages/Doctors.jsx` (Dialog interno) (Ver `_reversa_sdd/medicos/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Input, Checkbox, Switch, Button
**Pontos de interpolação**: `{{medico}}`
**Transições de saída**: salvar → fecha modal
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Doctors.jsx (dialog)"
spec.root:
  component: DoctorFormDialog
  children:
    - Dados Básicos: Nome Completo*, Especialidade*, CRM*, Email, Telefone
    - Escala: checkboxes dias da semana, Horário Início (time), Horário Fim (time), Duração (min, ex: 30), Switch "Médico ativo"
    - Actions: "Cancelar" | "Salvar" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: WorkingDays 0–6, WorkingHours start<end (BR-MIGRAR-016) — tipos no formulário
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Central de Templates

**Origem**: `src/pages/Templates.jsx` (Ver `_reversa_sdd/templates/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Badge, Button
**Pontos de interpolação**: `{{templates[]}}`
**Transições de saída**: → modal Criar/Editar Template (editar/excluir)
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Templates.jsx"
spec.root:
  component: TemplatesPage
  children:
    - CategoryCards: Receita Simples, Atestado Médico, Solicitação de Exame, Encaminhamento (badge "Padrão", preview, Editar/Excluir)
    - HeaderRow: Button "+ Novo Template" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: CRUD admin (BR-MIGRAR-020); tipo union (BR-MIGRAR-019)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Modal: Criar / Editar Template

**Origem**: `src/pages/Templates.jsx` (Dialog interno) (Ver `_reversa_sdd/templates/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Input, Select, Textarea, Switch, Button
**Pontos de interpolação**: `{{template}}`, painel de variáveis (copiáveis)
**Transições de saída**: salvar → fecha modal
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Templates.jsx (dialog)"
spec.root:
  component: TemplateFormDialog
  children:
    - Identificação: Nome do Template*, Tipo* (ex: "Receita Simples")
    - VariablesPanel: {PACIENTE_NOME} {PACIENTE_CPF} {DATA} {DATA_EXTENSO} {DIAS_AFASTAMENTO} (copiáveis)
    - ContentEditor: Conteúdo* (textarea, aceita interpolação)
    - Toggles: "Template padrão" (is_default), "Ativo" (is_active)
    - Actions: "Cancelar" | "Salvar" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: contrato de placeholders tipado (BR-MIGRAR-021); is_active/is_default (BR-MIGRAR-023)
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Tela: Logs de Acesso

**Origem**: `src/pages/AccessLogs.jsx` (Ver `_reversa_sdd/logs-acesso/screens.md`)
**Modo aplicado**: literal
**Componentes do design-system**: Table, Badge, Input (busca), Select (ação/período), Card (stats)
**Pontos de interpolação**: `{{logs[]}}`, `{{busca}}`, `{{ação}}`, `{{período}}`
**Transições de saída**: nenhuma (leitura)
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/AccessLogs.jsx"
spec.root:
  component: AccessLogsPage
  children:
    - Filters: busca (email/paciente), ação exata, período hoje/semana/mês
    - StatsPanel: estatísticas agregadas (como no legado)
    - AuditTable: Data/Hora, Usuário (email), Ação (badge colorida), Paciente, Detalhes — append-only, read admin
spec.states: preserva estados do legado
spec.invariants_de_paridade:
  - limite 500 registros, ordenação -created_date, renderização client-side SEM paginação (AMB-004 resolvido — paridade)
  - mapa ação → label/cor/ícone duplicado no legado (AccessLogs.jsx:30-43 vs AccessLogger) — tipar via enum único sem mudar visual
spec.deviations: []
```

### Pontos de divergência aceitos

- Nenhum.

---

## Apêndice: rastreabilidade ao inventário

| Tela do `target_screens.md` | Origem em `_reversa_sdd/ui/inventory.md` | Origem em `_reversa_sdd/screens/inventory.json` |
|---|---|---|
| Dashboard Principal | ui/inventory.md:7 | SCR-0001 |
| Listagem de Pacientes | ui/inventory.md:8 | SCR-0002 |
| Cadastro de Novo Paciente | ui/inventory.md:9 | SCR-0003 |
| Calendário de Agendamentos | ui/inventory.md:10 | SCR-0004 |
| Novo Agendamento | ui/inventory.md:11 | SCR-0005 |
| Listagem de Consultas | ui/inventory.md:12 | SCR-0006 |
| Novo Atendimento (Anamnese) | ui/inventory.md:13 | SCR-0007 |
| Visualização de Consulta | ui/inventory.md:14 | SCR-0008 |
| Modal: Novo Documento | ui/inventory.md:15 | SCR-0009 |
| Modal: Upload de Exame | ui/inventory.md:16 | SCR-0010 |
| Gerenciamento de Médicos | ui/inventory.md:17 | SCR-0011 |
| Modal: Novo Médico | ui/inventory.md:18 | SCR-0012 |
| Central de Templates | ui/inventory.md:19 | SCR-0013 |
| Modal: Criar / Editar Template | ui/inventory.md:20 | SCR-0014 |
| Logs de Acesso | ui/inventory.md:21 | SCR-0015 |
| Detalhe do Paciente (timeline clínica) | (ausente em ui/inventory.md — divergência 6,7%) | SCR-0016 |
