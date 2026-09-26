---
schemaVersion: 1
generatedAt: 2026-09-22T12:34:19-03:00
reversa:
  version: "1.3.2"
kind: target_screens
producedBy: screen-translator
mode: literal
sourcePlatform: react-hooks
targetPlatform: web-spa
adapter: same-platform-literal (react-hooks → web-spa React+TS; sem re-expressão visual)
screenCount: 21
goldenCount: 23
hash: "sha256:9885b52c2c4586cc97b9cc94bfa900eb3a86104df07da8b394fce831128312fc"
---

# Target Screens

> Especificação executável de cada tela do sistema novo, derivada do legado segundo o modo aprovado em `screen_modernization_decision.md`. Conteúdo textual preservado literalmente, salvo aprovação explícita de revisão linguística.
> Leitura primária para o codificador. Cada seção é um contrato.

> **Nota do modo literal (mesma plataforma)**: como origem ≡ alvo em plataforma (React → React + TS), o contrato de cada tela é: **converter o arquivo-fonte `.jsx` para `.tsx` preservando hierarquia, textos, tokens, componentes shadcn/Radix e comportamento**; a especificação abaixo fixa os invariantes de paridade (origem, componentes, interpolações, transições, divergências conhecidas) para o Inspector verificar. Não há re-expressão visual: o componente legado é o artefato-fonte.

> **Edição de 2026-09-22 (Fase 2 regenerada).** Duas mudanças em relação à edição de 2026-09-09:
> **(1)** as **23 capturas douradas passaram a existir** — todas as 16 telas com cenário de paridade (`PT-V01`…`PT-V16`) agora têm `present: true` no `manifest.yaml`, mais 6 capturas de telas sem cenário e 1 estado alternativo. Cada seção ganhou uma linha **Golden**.
> **(2)** o inventário passou de 16 para **21 telas**, com as 5 que as capturas revelaram: **Editar Paciente**, **Lista de Agendamentos**, **Modal: Detalhes do Agendamento**, **Editar Consulta** e **Modal: Editar Médico**.
> **Advertência de paridade (DEV-001/DEV-002)**: o conjunto de goldens é heterogêneo em viewport e formato (PNG, não snapshot de DOM). A paridade que ele sustenta é **construtiva/semântica** — tela existe, mesmos componentes, textos, hierarquia e estados — e **não** comparação pixel a pixel.

## Resumo

- **Modo aplicado**: literal
- **Telas geradas**: 21
- **Adapter**: same-platform-literal (sem adapter de plataforma — mesmo runtime)
- **Tokens consumidos**: `_reversa_sdd/design-system/tokens.md` (inalterado); nenhum `tokens-derived.md` necessário
- **Golden files**: **23 capturados e presentes** em `_reversa_sdd/screens/golden/` (manifest em `golden/manifest.yaml`) — era 0 de 16 em 2026-09-09
- **Cobertura de cenários**: **16 de 16** (`PT-V01`…`PT-V16`)
- **Deviations registradas**: **7** em `screen_deviation_log.md` — **7 aprovadas, 0 pendentes** (DEV-005 resolvido por leitura do código legado em 2026-09-22)

---

## Tela: Dashboard Principal

**Origem**: `src/pages/Dashboard.jsx` (Ver `_reversa_sdd/dashboard/screens.md`)
**Golden**: `screens/golden/dashboard-principal.png` — `PT-V01` (present: true; 1623×1008)
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
        - KpiGrid: StatsCard x4 (Pacientes Ativos; Agendamentos Hoje; Documentos Emitidos; Taxa de Atendimento — **calculada** desde 2026-09-25 pela feature `016-taxa-de-atendimento`, com subtítulo "últimos 12 meses")
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
  - confirmado na captura: 4 KPI cards com ícone à direita; busca global com botão "+ Novo Paciente"; card "Ações Rápidas" com 5 itens; card "LGPD Compliant"
  - confirmado na captura: faixa "Sistema em conformidade com a LGPD" abaixo do menu superior (elemento GLOBAL — presente em todas as telas capturadas)
spec.golden_notes: "Cabeçalho do app (marca MedRecord, 7 itens de menu, avatar 'Adriano Santos') visível — replicar em todas as telas. A captura é a única em 1623 px de largura."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002: golden heterogêneo; paridade construtiva, não pixel a pixel.

---

## Tela: Listagem de Pacientes

**Origem**: `src/pages/Patients.jsx` (Ver `_reversa_sdd/pacientes/screens.md`)
**Golden**: `screens/golden/pacientes-listagem.png` — `PT-V02` (present: true; 1443×1030)
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
spec.golden_notes: "6 pacientes; selo 'ativo' em minúsculas e badge de tipo sanguíneo à direita, antes do chevron. A massa desta captura divergencia da captura do detalhe do mesmo paciente — não usar as duas como oráculo cruzado."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Cadastro de Novo Paciente

**Origem**: `src/pages/PatientForm.jsx` (Ver `_reversa_sdd/pacientes/screens.md`, `design.md`)
**Golden**: `screens/golden/pacientes-novo.png` — `PT-V03` (present: true; 1443×1788, página inteira)
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
    - HeaderRow: "← Voltar" + título "Novo Paciente" + subtítulo "Preencha a ficha completa do paciente"
    - FormSections:
        Dados Pessoais: Nome Completo*, CPF* (máscara), Data de Nascimento*, Gênero, Tipo Sanguíneo, Foto ("Clique para adicionar foto")
        Contato: Telefone*, Email, Endereço, Contato/Telefone de Emergência
        Convênio: Convênio Médico, Número da Carteirinha
        Informações Médicas: Alergias, Condições Crônicas, Medicamentos em Uso Contínuo, Observações Gerais
        LGPD: aviso "Consentimento LGPD pendente" + "O termo de consentimento será enviado ao salvar." + Button "Ver Termo" (Dialog)
    - Actions: Button "Cancelar" | Button "Salvar Paciente"
spec.states: preserva estados do legado (validação de campos; consentimento pendente bloqueia save)
spec.regras_tipadas_no_componente:
  - campos obrigatórios full_name/cpf/birth_date/phone/lgpd_consent (BR-MIGRAR-003)
  - no save: lgpd_consent_date + lgpd_consent_ip (BR-MIGRAR-004)
  - zod schema reflete Patient type (target_data_model)
spec.golden_notes: "Estado vazio, com Tipo Sanguíneo já em 'desconhecido'. Campos marcados com * na captura: Nome Completo, CPF, Data de Nascimento, Telefone."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Editar Paciente

**Origem**: `src/pages/PatientForm.jsx` — modo edição (Ver `_reversa_sdd/pacientes/screens.md`)
**Golden**: `screens/golden/pacientes-editar.png` — **sem cenário V** (present: true; 1443×1686, página inteira)
**Modo aplicado**: literal
**Componentes do design-system**: os mesmos do Cadastro (Form, Input, Select, DatePicker, Textarea, Button) — sem a caixa de aviso LGPD neste estado
**Pontos de interpolação**: `{{paciente}}` carregado
**Transições de saída**: → PatientDetail (voltar/salvar)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/PatientForm.jsx (mesmo componente, modo edição)"
spec.root:
  component: PatientFormPage (variant: edit)
  children:
    - HeaderRow: "← Voltar" + título "Editar Paciente" + subtítulo "Atualize os dados do paciente"
    - FormSections: idênticas ao cadastro, preenchidas com o paciente
    - Actions: Button "Cancelar" | Button "Salvar Paciente"
spec.invariants_de_paridade:
  - a caixa "Consentimento LGPD pendente" NÃO aparece neste estado (coerente com "será enviado ao salvar")
  - mesmos campos, mesmos rótulos e mesma ordem do cadastro
spec.golden_notes: "Massa de referência: Neide Ferreira / 01/01/1976 / Feminino / O+ / (79) 99917-9999 / neidefs@hotmail.com / Unimed 7546. Sem cenário de paridade — referência para feature futura."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Detalhe do Paciente (Informações + Histórico)

**Origem**: `src/pages/PatientDetail.jsx` (Ver `_reversa_sdd/pacientes/screens.md`; inventário interno SCR-0016)
**Golden**: `screens/golden/paciente-detalhe.png` — `PT-V14` (present: true; **saiu de `nonDeterministic`**; 1443×1044)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Tabs, Avatar, Button, Alert (alergias), modais (PrescriptionEditor, ExamUploader), ConsultationTimeline
**Pontos de interpolação**: `{{paciente}}`, timeline (consultations/prescriptions/exams/appointments)
**Transições de saída**: → PatientForm (editar), modal "Nova Receita"/"Atestado" (PrescriptionEditor), modal "Exame" (ExamUploader), agendar, nova consulta
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/PatientDetail.jsx"
spec.root:
  component: PatientDetailPage
  children:
    - PatientHeader: avatar, nome, selos "ativo" / tipo sanguíneo / "LGPD"; Buttons "Editar" + ícone de lixeira
    - PatientInfoCard: Idade (com data de nascimento), Telefone, Email, Endereço, Convênio + Carteirinha, Alergias, Condições Crônicas, Medicamentos em Uso
    - QuickDocs: "Agendar Consulta" | "Nova Consulta" | "Receita" | "Exame" (herda consultation_id/patient_id — Q-05)
    - Tabs: Todos | Agendamentos (N) | Consultas (N) | Documentos (N) | Exames (N) — timeline unificada (code-analysis §4.4)
spec.states: preserva estados do legado (isLoading, "não encontrado", tabs)
spec.golden_notes: "6 agendamentos na timeline (17/09 ×2, 12/01 ×2, 09/01 ×2, com selos 'agendado' e 'confirmado'). A aba 'Exames (0)' desta captura passa a (1) na captura do modal de upload — mesma sessão, massa viva."
spec.deviations: [DEV-001, DEV-002, DEV-004]
```

### Pontos de divergência aceitos

- DEV-004: timeline dependente de dados; a captura é a massa de referência.

---

## Tela: Calendário de Agendamentos

**Origem**: `src/pages/Appointments.jsx` + `src/components/appointments/AppointmentCalendar.jsx` (Ver `_reversa_sdd/agendamentos/screens.md`)
**Golden**: `screens/golden/agendamentos-calendario.png` — `PT-V04` (present: true; 1443×1560)
**Modo aplicado**: literal
**Componentes do design-system**: Tabs/segmented (Calendário|Lista), Button, Badge (status), calendário semanal custom
**Pontos de interpolação**: `{{semana}}`, `{{appointments[]}}`, `{{horários}}`
**Transições de saída**: → NewAppointment, → aba Lista, → modal de detalhes do agendamento
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Appointments.jsx + AppointmentCalendar.jsx"
spec.root:
  component: AppointmentsPage
  children:
    - ViewToggle: Calendário | Lista
    - WeeklyCalendar: colunas de dias, linha de horários 8:00–19:00, navegação (< Hoje >)
    - EventCard: nome do paciente, nome do profissional, duração (ex.: "45min")
    - StatusLegend: agendado/confirmado/em_atendimento/concluido/cancelado/faltou
    - HeaderRow: contador "N agendamentos próximos" + Button "+ Novo Agendamento"
spec.states: preserva estados do legado; interações de status manuais (BR-MIGRAR-012; sem automação — AMB-003)
spec.invariants_de_paridade:
  - CORREÇÃO DE LEITURA (captura 2026-09-22): Em Atendimento = verde; Concluído = cinza-esverdeado. A descrição anterior ("Em Atendimento roxo", "Concluído verde") veio de inferência e está errada — ver DEV-006
  - nenhum dia aparece destacado como "hoje" na captura de 22/09/2026 (terça-feira); o destaque de dia atual não foi observado
spec.golden_notes: "Semana de 20 a 26/09/2026. Contador '7 agendamentos próximos'."
spec.deviations: [DEV-001, DEV-002, DEV-006]
```

### Pontos de divergência aceitos

- DEV-006: cores da legenda conforme a captura (observação direta prevalece sobre inferência).

---

## Tela: Lista de Agendamentos

**Origem**: `src/pages/Appointments.jsx` — aba Lista (Ver `_reversa_sdd/agendamentos/screens.md`)
**Golden**: `screens/golden/agendamentos-lista.png` — **sem cenário V** (present: true; 1443×1106)
**Modo aplicado**: literal
**Componentes do design-system**: Card/List, Avatar, Badge, Tabs/segmented
**Pontos de interpolação**: `{{appointments[]}}`
**Transições de saída**: → aba Calendário, → modal de detalhes
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Appointments.jsx (aba Lista)"
spec.root:
  component: AppointmentsPage (variant: list)
  children:
    - ViewToggle: Calendário | Lista (aba ativa = Lista)
    - AppointmentRow: avatar/inicial, nome do paciente, profissional + especialidade, data e hora, selo de status à direita
spec.invariants_de_paridade:
  - mesmos filtros de status e mesma paleta de selos do calendário
  - a ordenação observada NÃO é cronológica (30/09, 30/09, 25/09, 25/09, 20/09, 25/09, 23/09) — preservar a ordem do legado, não "corrigir"
spec.golden_notes: "7 linhas. O horário exato da lista difere da faixa horária do calendário para os mesmos registros (13:45/14:30/15:15 × faixas de hora cheia) — não usar um como oráculo do outro."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Novo Agendamento

**Origem**: `src/pages/NewAppointment.jsx` + `src/components/appointments/TimeSlotPicker.jsx` (Ver `_reversa_sdd/agendamentos/screens.md`)
**Golden**: `screens/golden/agendamentos-novo-escolhido.png` — `PT-V05` (present: true; 1443×1152) + estado inicial em `agendamentos-novo.png` (12:47, recaptura pós-seleção)
**Modo aplicado**: literal
**Componentes do design-system**: Form, Select (paciente/médico/tipo), Textarea, Button (+ Calendar/DatePicker **em disputa** — ver DEV-005)
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
    - HeaderRow: "← Voltar" + título "Novo Agendamento" + subtítulo "Agende uma consulta para o paciente"
    - Section "Paciente e Médico": Paciente* (dropdown), Médico* (dropdown)
    - Section "Detalhes": Tipo de Consulta (default "Primeira Consulta"), Observações
    - DateTimeSection (Card "Data e Horário"): Calendar (mode single, datas passadas desabilitadas) + TimeSlotPicker
      CONDICIONAL: só renderiza quando há médico selecionado, e a grade de horários só aparece depois de escolher a data
      (DEV-005 resolvido por leitura do código: src/pages/NewAppointment.tsx:204-237)
    - Actions: Button "Cancelar" | Button "Confirmar Agendamento" (na captura, em tom claro — compatível com desabilitado)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - somente pacientes ativos selecionáveis (BR-MIGRAR-001)
  - validação de slot contra working_days/hours/appointment_duration (BR-MIGRAR-013) — função pura tipada
spec.invariants_de_paridade:
  - Tipo de Consulta tem QUATRO opções no código: Primeira Consulta | Retorno | Exame | Procedimento (a captura mostra apenas o default "Primeira Consulta")
  - o botão "Confirmar Agendamento" fica desabilitado enquanto faltar patient_id, doctor_id ou date (NewAppointment.tsx:283) — confirma o tom claro observado na captura
  - a seção "Data e Horário" e a lista de horários são condicionais (médico e data, respectivamente)
  - painel de horários tem título "Horários Disponíveis" e slots de 30 min; o slot escolhido fica destacado (14:30 na captura)
  - o calendário usa rótulos em inglês ("September 2026", "Su Mo Tu We Th Fr Sa") — preservar
  - com paciente, médico e data preenchidos, o botão "Confirmar Agendamento" fica HABILITADO (gradiente azul-verde), confirmando a regra de :283
spec.golden_notes: "Golden principal = estado pós-seleção (12:47): calendário com o dia 24 escolhido e painel Horários Disponíveis (14:00 a 17:30, 14:30 selecionado). O calendário exibe rótulos em INGLÊS — mês September 2026 e iniciais Su Mo Tu We Th Fr Sa —, característica do react-day-picker sem locale; preservar em modo literal. Estado inicial (sem médico) no golden alternativo."
spec.deviations: [DEV-001, DEV-002, DEV-005]
```

### Pontos de divergência aceitos

- **DEV-005 (`aprovado`)** — a seção "Data e Horário" existe e é **condicional ao médico selecionado**; a captura foi feita antes da seleção. Spec confirmada por leitura do código.

---

## Tela: Modal: Detalhes do Agendamento

**Origem**: `src/pages/Appointments.jsx` — dialog de status (Ver `_reversa_sdd/agendamentos/screens.md`)
**Golden**: `screens/golden/modal-detalhe-agendamento.png` — **sem cenário V** (present: true; 1460×1560, montagem com rolagem)
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Select (status), Button, campo de leitura
**Pontos de interpolação**: `{{agendamento}}`, `{{status}}`
**Transições de saída**: → Calendário (confirmar/cancelar)
**Tela crítica?**: sim (altera status de agendamento)

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Appointments.jsx (dialog)"
spec.root:
  component: AppointmentDetailsDialog
  children:
    - Header: título "Detalhes do Agendamento" + botão "×"
    - ReadOnlyFields: Paciente, Médico, Data e Hora
    - StatusSelect: select com o status atual (ex.: "Confirmado")
    - Actions: Button "Confirmar" (ícone de check) | Button "Cancelar" (contorno vermelho, ícone de ×)
spec.invariants_de_paridade:
  - "Cancelar" tem rótulo ambíguo e cor de ação destrutiva — preservar como está (modo literal); não reinterpretar
spec.golden_notes: "ATENÇÃO: a imagem é uma MONTAGEM COM ROLAGEM (cabeçalho do app no meio da figura). O conteúdo do modal é legível; a composição da página, não. Sem cenário de paridade."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001 (a montagem com rolagem está entre os casos citados).

---

## Tela: Listagem de Consultas

**Origem**: `src/pages/Consultations.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/consultas-listagem.png` — `PT-V06` (present: true; 1443×762)
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
spec.golden_notes: "3 consultas; a linha 1 traz a queixa preenchida ('Dores no peito'), as demais não. 'Retorno: dd/mm' exibido sem ano."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Novo Atendimento (Anamnese)

**Origem**: `src/pages/NewConsultation.jsx` + `src/components/medical/VitalSignsForm.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/consultas-novo.png` — `PT-V07` (present: true; 1443×1768, página inteira)
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
    - HeaderRow: "← Voltar" + título "Nova Consulta" + subtítulo "Preencha a anamnese e dados do atendimento"
    - PatientField: busca "Buscar paciente por nome ou CPF..."
    - MetaRow: Data e Hora*, Status (ex: "Em Andamento"), Data de Retorno (opcional)
    - VitalSignsForm: Pressão Arterial (mmHg), Freq. Cardíaca (bpm), Temperatura (c), Freq. Respiratória (irpm), Saturação O₂ (%), Peso (kg), Altura (m) — unidades exibidas no próprio controle
    - Anamnese: Queixa Principal, História da Doença Atual, Exame Físico
    - Diagnosis: Diagnóstico Principal, CID-10, Plano de Tratamento, Observações
    - Actions: "Cancelar" | "Salvar Consulta" (na captura, em tom claro)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - patient_id obrigatório (BR-MIGRAR-006)
  - status segue máquina de estados (BR-MIGRAR-007)
spec.golden_notes: "Data e Hora pré-preenchida com o instante da captura — valor volátil, não é contrato."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Editar Consulta

**Origem**: `src/pages/NewConsultation.jsx` — modo edição (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/consultas-editar.png` — **sem cenário V** (present: true; 1443×1815, página inteira)
**Modo aplicado**: literal
**Componentes do design-system**: os mesmos do Novo Atendimento + Cartão do paciente com botão "Trocar"
**Pontos de interpolação**: `{{consulta}}` carregada
**Transições de saída**: → Consultation (salvar/cancelar)
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/NewConsultation.jsx (mesmo componente, modo edição)"
spec.root:
  component: NewConsultationPage (variant: edit)
  children:
    - HeaderRow: "← Voltar" + título "Editar Consulta" + subtítulo "Preencha a anamnese e dados do atendimento"
    - PatientCard: avatar, nome, telefone + Button "Trocar"   # DIFERENÇA ESTRUTURAL: deixa de ser busca
    - MetaRow / VitalSignsForm / Anamnese / Diagnosis: idênticos ao Novo Atendimento, preenchidos
    - Actions: "Cancelar" | "Salvar Consulta" (aparentemente habilitado na captura)
spec.invariants_de_paridade:
  - o subtítulo do modo edição é o MESMO do cadastro (não há "Atualize os dados...") — preservar literalmente
spec.golden_notes: "Massa de referência: consulta de 08/01/2026 de Adriano Santos; vitais 120/80, 72 bpm, 36.5 c, 16, 98%, 85 kg, 1,75 m; queixa 'Dores no peito'. Sem cenário de paridade."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Visualização de Consulta

**Origem**: `src/pages/Consultation.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/consultas-visualizacao.png` — `PT-V08` (present: true; 1443×874)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Badge, Button, Alert (alergias)
**Pontos de interpolação**: `{{consulta}}`, `{{sinais vitais}}`, `{{anamnese}}`, `{{documentos[]}}`
**Transições de saída**: → Editar Consulta, → PrescriptionEditor (Nova Receita/Atestado/Exame), imprimir
**Tela crítica?**: sim

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Consultation.jsx"
spec.root:
  component: ConsultationDetailPage
  children:
    - Header: título "Consulta", subtítulo com data por extenso ("08 de janeiro de 2026 às 02:34"), badge status, Buttons "Imprimir" | "Editar"
    - PatientPanel (esquerda): nome, telefone, avatar, alerta alergias, botões "Nova Receita" | "Atestado" | "Exame"
    - VitalSignsPanel: grid consolidado (Pressão Arterial, Freq. Cardíaca, Temperatura, Peso, Altura)
    - AnamnesePanel: queixa, HDA, exame físico consolidados
    - EmittedDocumentsPanel: "Documentos Emitidos" — item com tipo, data e hora   # ACRÉSCIMO CONFIRMADO PELA CAPTURA
spec.states: preserva estados do legado
spec.golden_notes: "O card 'Documentos Emitidos' (Encaminhamento, 15/09/2026 12:30) não constava da extração anterior — existe e deve ser implementado."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Modal: Novo Documento

**Origem**: `src/components/medical/PrescriptionEditor.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/modal-novo-documento.png` — `PT-V09` (present: true; 1314×602)
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
    - Header: título "Novo Documento" + botão "×"
    - Form: Tipo de Documento (ex: "Receita Simples"), Template ("Selecionar template..."), Conteúdo (textarea "Digite o conteúdo do documento...")
    - MedicationsSection: exibida SOMENTE se type inclui "receita" (BR-MIGRAR-008; ocultar nos demais — Q-06)
      header com botão "+ Adicionar"; items: Nome, Dosagem, Frequência, Duração, Instruções
    - Notes: Observações ("Observações adicionais...")
    - Actions: "Imprimir" | "Salvar" (verde, disquete) | fechar X
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente:
  - interpolação de variáveis no save (BR-MIGRAR-021) — sem escape HTML, alerta XSS AMB-006 propagado (não corrigir)
  - template_name/valid_days conforme tipo (code-analysis BR-C-05/06)
spec.golden_notes: "O modal tem rolagem própria na captura; a seção Medicamentos aparece vazia com o botão '+ Adicionar'."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002. (AMB-006 é alerta referido à codificação, não divergência de tela.)

---

## Tela: Modal: Upload de Exame

**Origem**: `src/components/medical/ExamUploader.jsx` (Ver `_reversa_sdd/consultas/screens.md`)
**Golden**: `screens/golden/modal-upload-exame.png` — `PT-V10` (present: true; 1314×602) + estado alternativo `modal-upload-exame-anexado.png`
**Modo aplicado**: literal
**Componentes do design-system**: Dialog, Dropzone/Drag&Drop, Input, Select, DatePicker, Textarea, Button
**Pontos de interpolação**: `{{exame}}`, `{{arquivo}}`
**Transições de saída**: salvar → fecha modal; preview do arquivo; atualiza a aba "Exames" do detalhe do paciente
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/components/medical/ExamUploader.jsx"
spec.root:
  component: ExamUploaderDialog
  children:
    - Header: título "Upload de Exame" + botão "×"
    - Dropzone: "Clique para selecionar arquivo" / "PDF ou Imagem (máx. 10MB)" — UploadFile → file_url (BR-MIGRAR-041; offline: Data URL em memória)
      estado com arquivo: miniatura + nome do arquivo + link "× Remover"
    - Form: Nome do Exame* ("Ex.: Hemograma Completo"), Tipo (ex: "Laboratorial"), Data do Exame, Laboratório/Clínica ("Ec Lab Análises"), Resumo dos Resultados ("Principais achados do exame..."), Observações ("Observações adicionais...")
    - Actions: "Cancelar" | "Salvar Exame" (com ícone)
spec.states: preserva estados do legado
spec.invariants_de_paridade:
  - CORREÇÃO DE GATILHO (captura 2026-09-22): o modal abre sobre o DETALHE DO PACIENTE, pelo botão "Exame" — e não sobre a tela de Consulta, como a extração indicava. O botão homônimo existe nos dois lugares
spec.golden_notes: "Lacuna de captura fechada em 2026-09-22 às 12:30 — era a ÚLTIMA das 16. O golden principal tem o dropzone vazio; o estado alternativo mostra o arquivo anexado e a aba 'Exames' do fundo passando de (0) para (1)."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Gerenciamento de Médicos

**Origem**: `src/pages/Doctors.jsx` (Ver `_reversa_sdd/medicos/screens.md`)
**Golden**: `screens/golden/medicos-listagem.png` — `PT-V11` (present: true; 1443×762)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Avatar, Badge, Button
**Pontos de interpolação**: `{{medicos[]}}`
**Transições de saída**: → modal Novo Médico, → modal Editar Médico, exclusão
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Doctors.jsx"
spec.root:
  component: DoctorsPage
  children:
    - CardList: por médico — avatar/inicial, nome, especialidade, CRM+UF, badge Ativo, horário (ex: 14:00 - 18:00), chips de dias da semana, botões Editar/Excluir
    - HeaderRow: título "Médicos" + subtítulo "Gerencie médicos e agendas" + Button "+ Novo Médico" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: CRUD restrito a admin (BR-MIGRAR-015) — guarda tipada
spec.golden_notes: "3 médicos. Sem contador de registros no cabeçalho (diferente de Pacientes e Consultas). Acento ROXO nesta unit — conferir token no design-system antes de improvisar."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Modal: Novo Médico

**Origem**: `src/pages/Doctors.jsx` (Dialog interno, modo criação) (Ver `_reversa_sdd/medicos/screens.md`)
**Golden**: `screens/golden/medicos-novo.png` — `PT-V15` (present: true; 1314×602)
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
spec.golden_notes: "Escala pré-preenchida: Segunda a Sexta marcados, 08:00–18:00, duração 30, toggle ligado."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Modal: Editar Médico

**Origem**: `src/pages/Doctors.jsx` (Dialog interno, modo edição) (Ver `_reversa_sdd/medicos/screens.md`)
**Golden**: `screens/golden/medicos-editar.png` — **sem cenário V** (present: true; 1314×602)
**Modo aplicado**: literal
**Componentes do design-system**: os mesmos do Modal: Novo Médico
**Pontos de interpolação**: `{{medico}}` carregado
**Transições de saída**: salvar → fecha modal
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Doctors.jsx (dialog, modo edição)"
spec.root:
  component: DoctorFormDialog (variant: edit)
  children:
    - Header: título "Editar Médico" + botão "×"
    - Dados Básicos / Escala / Actions: idênticos ao modal de criação, preenchidos
spec.golden_notes: "Massa de referência: Dr. Thiago / Ultrassonografia / CRM 1875 / tiago@gmail.com / 79998962514 / Segunda, Quinta e Sexta / 14:00–18:00 / 30 min. Sem cenário de paridade."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Central de Templates

**Origem**: `src/pages/Templates.jsx` (Ver `_reversa_sdd/templates/screens.md`)
**Golden**: `screens/golden/templates-central.png` — `PT-V12` (present: true; 1443×1190)
**Modo aplicado**: literal
**Componentes do design-system**: Card, Badge, Button
**Pontos de interpolação**: `{{templates[]}}`
**Transições de saída**: → modal Criar/Editar Template, exclusão
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/Templates.jsx"
spec.root:
  component: TemplatesPage
  children:
    - CategorySections: Receita Simples, Atestado Médico, Solicitação de Exame, Encaminhamento — cada um com um card (badge "Padrão", preview, Editar/Excluir)
    - HeaderRow: título "Templates" + subtítulo "Modelos de documentos editáveis" + Button "+ Novo Template" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: CRUD admin (BR-MIGRAR-020); tipo union (BR-MIGRAR-019)
spec.invariants_de_paridade:
  - o cabeçalho da 3ª categoria é "Solicitação de Exame" (singular) e o título do card é "Solicitação de Exames" (plural) — preservar a divergência (modo literal)
spec.golden_notes: "4 categorias, 1 modelo cada, todos com selo 'Padrão'. Sem contador de registros."
spec.deviations: [DEV-001, DEV-002]
```

### Pontos de divergência aceitos

- DEV-001, DEV-002.

---

## Tela: Modal: Criar / Editar Template

**Origem**: `src/pages/Templates.jsx` (Dialog interno) (Ver `_reversa_sdd/templates/screens.md`)
**Golden**: `screens/golden/templates-modal.png` — `PT-V16` (present: true; 1314×602) — modal de **edição**; a captura de criação (`templates-novo.png`) está truncada
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
    - Identificação: Nome do Template* (ex: "Ex.: Atestado Padrão"), Tipo* (ex: "Receita Simples")
    - VariablesPanel: {PACIENTE_NOME} {PACIENTE_CPF} {DATA} {DATA_EXTENSO} {DIAS_AFASTAMENTO} (chips copiáveis)
    - ContentEditor: Conteúdo* (textarea, aceita interpolação)
    - Toggles: "Template padrão" (is_default), "Ativo" (is_active)
    - Actions: "Cancelar" | "Salvar" (roxo)
spec.states: preserva estados do legado
spec.regras_tipadas_no_componente: contrato de placeholders tipado (BR-MIGRAR-021); is_active/is_default (BR-MIGRAR-023)
spec.golden_notes: "O V16 cobre criar E editar. Usar o modal de EDIÇÃO como referência visual (único completo); o de criação está truncado antes dos toggles e botões (DEV-007)."
spec.deviations: [DEV-001, DEV-002, DEV-007]
```

### Pontos de divergência aceitos

- DEV-007: golden do V16 é a captura de edição; a de criação é parcial.

---

## Tela: Logs de Acesso

**Origem**: `src/pages/AccessLogs.jsx` (Ver `_reversa_sdd/logs-acesso/screens.md`)
**Golden**: `screens/golden/logs-acesso.png` — `PT-V13` (present: true; **1732×15029**, página inteira)
**Modo aplicado**: literal
**Componentes do design-system**: Table, Badge, Input (busca), Select (ação/período), Card (stats)
**Pontos de interpolação**: `{{logs[]}}`, `{{busca}}`, `{{ação}}`, `{{período}}`, `{{stats}}`
**Transições de saída**: nenhuma (leitura) — confirmado na captura: a tela é folha do fluxo
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: component-tree (literal)
spec.legacy_origin: "src/pages/AccessLogs.jsx"
spec.root:
  component: AccessLogsPage
  children:
    - Filters: Input "Buscar por paciente, usuário ou ação...", Select ação ("Todas as Ações"), Select período ("Todas as datas")
    - StatsPanel: 4 KPIs (Total de logs, Visualizações, Logins, Exclusões)   # CONFIRMADO PELA CAPTURA
    - AuditTable: Data/Hora | Usuário (email truncado) | Ação (badge colorida) | Paciente | Detalhes — append-only, read admin
spec.states: preserva estados do legado
spec.invariants_de_paridade:
  - limite 500 registros, ordenação -created_date, renderização client-side SEM paginação (AMB-004 resolvido — paridade). CONFIRMADO na captura: não há paginação, rodapé de total nem "carregar mais"
  - mapa ação → label/cor/ícone duplicado no legado (AccessLogs.jsx:30-43 vs AccessLogger) — tipar via enum único sem mudar visual
  - selos observados na captura: Login (azul), Visualizar Consulta (verde), Visualizar Paciente (verde), Criar Consulta (azul), Editar Paciente (âmbar)
  - os KPIs do topo derivam dos registros e NÃO fecham com o total (na captura: 65 + 9 + 0 = 74 contra 254) — é o mesmo desencontro que a feature 006 provou em teste (8 contra 12). Preservar
spec.golden_notes: "Captura de página inteira com 254 registros dinâmicos — vale como referência ESTRUTURAL, não de conteúdo (DEV-003)."
spec.deviations: [DEV-001, DEV-002, DEV-003]
```

### Pontos de divergência aceitos

- DEV-003: conteúdo das linhas não é contrato; estrutura e ausência de paginação são.

---

## Apêndice: rastreabilidade ao inventário

| Tela do `target_screens.md` | Cenário | Golden | Origem em `_reversa_sdd/ui/inventory.md` | Origem em `_reversa_sdd/screens/inventory.json` |
|---|---|---|---|---|
| Dashboard Principal | PT-V01 | dashboard-principal.png | ui/inventory.md:36 | SCR-0001 |
| Listagem de Pacientes | PT-V02 | pacientes-listagem.png | ui/inventory.md:37 | SCR-0002 |
| Cadastro de Novo Paciente | PT-V03 | pacientes-novo.png | ui/inventory.md:38 | SCR-0003 |
| Editar Paciente | — | pacientes-editar.png | ui/inventory.md:39 | SCR-0017 |
| Detalhe do Paciente (Informações + Histórico) | PT-V14 | paciente-detalhe.png | ui/inventory.md:40 | SCR-0016 |
| Calendário de Agendamentos | PT-V04 | agendamentos-calendario.png | ui/inventory.md:41 | SCR-0004 |
| Lista de Agendamentos | — | agendamentos-lista.png | ui/inventory.md:42 | SCR-0018 |
| Novo Agendamento | PT-V05 | agendamentos-novo-escolhido.png (+ estado inicial) | ui/inventory.md:43 | SCR-0005 |
| Modal: Detalhes do Agendamento | — | modal-detalhe-agendamento.png | ui/inventory.md:44 | SCR-0019 |
| Listagem de Consultas | PT-V06 | consultas-listagem.png | ui/inventory.md:45 | SCR-0006 |
| Novo Atendimento (Anamnese) | PT-V07 | consultas-novo.png | ui/inventory.md:46 | SCR-0007 |
| Editar Consulta | — | consultas-editar.png | ui/inventory.md:47 | SCR-0020 |
| Visualização de Consulta | PT-V08 | consultas-visualizacao.png | ui/inventory.md:48 | SCR-0008 |
| Modal: Novo Documento | PT-V09 | modal-novo-documento.png | ui/inventory.md:49 | SCR-0009 |
| Modal: Upload de Exame | PT-V10 | modal-upload-exame.png (+ estado alternativo) | ui/inventory.md:50 | SCR-0010 |
| Gerenciamento de Médicos | PT-V11 | medicos-listagem.png | ui/inventory.md:51 | SCR-0011 |
| Modal: Novo Médico | PT-V15 | medicos-novo.png | ui/inventory.md:52 | SCR-0012 |
| Modal: Editar Médico | — | medicos-editar.png | ui/inventory.md:53 | SCR-0021 |
| Central de Templates | PT-V12 | templates-central.png | ui/inventory.md:54 | SCR-0013 |
| Modal: Criar / Editar Template | PT-V16 | templates-modal.png | ui/inventory.md:55-56 | SCR-0014 |
| Logs de Acesso | PT-V13 | logs-acesso.png | ui/inventory.md:57 | SCR-0015 |

**Cobertura**: 16 de 16 cenários de paridade visual com golden presente. 21 telas no inventário interno, das quais 5 sem cenário V — as capturas extras existem para elas.

---
*Gerado pelo Reversa-Screen-Translator em 2026-09-09; Fase 2 regenerada em 2026-09-22 por `/reversa-migrate --regenerate=screen_translator:generation`.*
