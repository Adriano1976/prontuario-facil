# Análise de Código — Consolidado

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Confiança: 🟢🟡🔴
>
> **Módulos cobertos**: [`pacientes`](#análise-de-código--módulo-pacientes) · [`consultas`](#análise-de-código--módulo-consultas) · [`agendamentos`](#análise-de-código--módulo-agendamentos) · [`medicos`](#análise-de-código--módulo-medicos) · [`templates`](#análise-de-código--módulo-templates) · [`logs-acesso`](#análise-de-código--módulo-logs-acesso) · [`dashboard`](#análise-de-código--módulo-dashboard)

---

# Análise de Código — Módulo `pacientes`

> Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **pacientes** implementa a gestão completa de pacientes do prontuário eletrônico, cobrindo o ciclo de vida completo: listagem com busca/filtro, criação, edição, visualização detalhada com histórico médico unificado (consultas, prescrições, exames, agendamentos), upload de exames, geração de documentos médicos (receitas, atestados, solicitações) e conformidade LGPD com auditoria de acessos.

**Arquitetura**: Frontend React 18 + Vite, consumindo Base44 (BaaS) via SDK. Estado de servidor gerenciado por TanStack Query. Roteamento via react-router-dom v7. UI com Radix UI (shadcn/ui) + Tailwind CSS.

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/Patients.jsx` | Page | 230 | Listagem, busca, filtro, navegação |
| `src/pages/PatientForm.jsx` | Page | 520 | Formulário criar/editar, validação, LGPD, upload foto |
| `src/pages/PatientDetail.jsx` | Page | 460 | Visualização detalhada, timeline, ações rápidas |
| `src/components/medical/ConsultationTimeline.jsx` | Component | 208 | Timeline unificada de eventos médicos |
| `src/components/medical/ExamUploader.jsx` | Component | 270 | Upload de exames com anexos |
| `src/components/medical/PrescriptionEditor.jsx` | Component | 336 | Editor de prescrições/documentos com templates |
| `src/components/medical/AccessLogger.jsx` | Utility | 56 | Auditoria de acessos (LGPD) |
| `src/components/medical/LGPDConsent.jsx` | Component | 147 | Diálogo de consentimento LGPD |
| `base44/entities/Patient.jsonc` | Schema | 159 | Definição da entidade + RLS |

**Total**: 9 arquivos, ~2.089 linhas

---

## 3. Fluxos de Controle Principais

### 3.1 Listagem de Pacientes (`Patients.jsx`)

```
Carregamento inicial
    ↓
useQuery(['patients']) → base44.entities.Patient.list('-created_date')
    ↓
Filtro client-side (search + statusFilter)
    ↓
Render: Skeleton loading → Grid de cards → Estado vazio
    ↓
Ações: Navegar para PatientDetail | Link para PatientForm (novo)
```

**Pontos de decisão**:
- `isLoading`: exibe skeletons (4 cards)
- `filteredPatients.length === 0`: estado vazio com CTA contextual
- `statusFilter`: 'all' | 'ativo' | 'inativo'

### 3.2 Formulário de Paciente (`PatientForm.jsx`)

```
Mount / Navegação com ?id=
    ↓
Se patientId: useQuery(['patient', id]) → carrega dados + foto + LGPD
    ↓
Form state inicializado com defaults ou dados do paciente
    ↓
Interação: handleChange | handlePhotoChange | handleLGPDAccept
    ↓
Submit → Valida LGPD (novo paciente) → Mutation create/update
    ↓
Sucesso: invalidateQueries(['patients']) → navigate('Patients')
Erro: toast destructivo
```

**Pontos de decisão**:
- `patientId` presente? → Edição (LGPD não obrigatório) vs Criação (LGPD obrigatório)
- `photoFile` selecionado? → Upload prévio → `file_url` incluído no save
- `lgpdAccepted` false + novo paciente? → Abre modal LGPD → Bloqueia submit

### 3.3 Detalhe do Paciente (`PatientDetail.jsx`)

```
Mount com ?id=
    ↓
Paralelo: useQuery patient + consultations + prescriptions + exams + appointments
    ↓
Effect: logAccess(VIEW_PATIENT)
    ↓
Render: Header (foto, nome, badges, ações) + Grid 1/3 (info) + 2/3 (timeline tabs)
    ↓
Ações rápidas: Editar | Excluir (confirm) | Agendar | Nova Consulta | Receita | Exame
    ↓
Modais: ExamUploader | PrescriptionEditor | AlertDialog (excluir)
```

**Pontos de decisão**:
- `isLoading`: spinner centralizado
- `!patient`: Card "não encontrado" + link voltar
- Tabs: 'all' | 'appointments' | 'consultations' | 'prescriptions' | 'exams'

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Cálculo de Idade 🟢 CONFIRMADO
**Local**: `Patients.jsx:59-69`, `PatientDetail.jsx:124-134` (duplicado)
```javascript
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
```
- **Complexidade**: O(1)
- **Edge cases**: birthDate null/undefined → null; datas futuras → idade negativa (não validado)

### 4.2 Filtro Combinado de Busca 🟢 CONFIRMADO
**Local**: `Patients.jsx:47-57`
```javascript
const filteredPatients = patients?.filter(p => {
  const matchesSearch = 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search) ||
    p.phone?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
  return matchesSearch && matchesStatus;
}) || [];
```
- **Complexidade**: O(n) onde n = total de pacientes
- **Otimização**: Filtro client-side (dataset pequeno). Para datasets grandes, mover para query no backend.

### 4.3 Formatação CPF/Telefone 🟢 CONFIRMADO
**Local**: `PatientForm.jsx:166-177`
- **CPF**: Remove não-dígitos → aplica regex `(\d{3})(\d{3})(\d{3})(\d{2})` → `$1.$2.$3-$4`
- **Telefone**: Remove não-dígitos → ≤10 dígitos: `(XX) XXXX-XXXX` | 11 dígitos: `(XX) XXXXX-XXXX`

### 4.4 Timeline Merge & Sort 🟢 CONFIRMADO
**Local**: `ConsultationTimeline.jsx:54-59`
```javascript
const events = [
  ...consultations?.map(c => ({ ...c, eventType: 'consultation' })) || [],
  ...prescriptions?.map(p => ({ ...p, eventType: 'prescription', date: p.created_date })) || [],
  ...exams?.map(e => ({ ...e, eventType: 'exam' })) || [],
  ...appointments?.map(a => ({ ...a, eventType: 'appointment' })) || [],
].sort((a, b) => new Date(b.date) - new Date(a.date));
```
- **Complexidade**: O(n log n) pelo sort
- **Nota**: `prescription` usa `created_date` (não `date`)

### 4.5 Template Variable Substitution 🟢 CONFIRMADO
**Local**: `PrescriptionEditor.jsx:95-101`
```javascript
processedContent = processedContent
  .replace(/\{PACIENTE_NOME\}/g, patient?.full_name || '')
  .replace(/\{PACIENTE_CPF\}/g, patient?.cpf || '')
  .replace(/\{DATA\}/g, new Date().toLocaleDateString('pt-BR'))
  .replace(/\{DATA_EXTENSO\}/g, new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
```
- **Variáveis suportadas**: 4 placeholders
- **Limitação**: Não escapa HTML → risco XSS se template vier de fonte não confiável

---

## 5. Estruturas de Dados

### 5.1 Entidade `Patient` (Base44 Schema) 🟢 CONFIRMADO
Ver `base44/entities/Patient.jsonc` — 24 campos, 4 required (`full_name`, `cpf`, `birth_date`, `phone`, `lgpd_consent`)

**Enums**:
- `gender`: masculino | feminino | outro | prefiro_nao_informar
- `blood_type`: A+, A-, B+, B-, AB+, AB-, O+, O-, desconhecido
- `status`: ativo | inativo (default: ativo)

**RLS (Row Level Security)**:
- `create`: null (público? ou via auth)
- `read/update/delete`: `created_by_id == user.id` OR `user.role == admin`

### 5.2 Entidade `AccessLog` (Inferida) 🟡 INFERIDO
Campos deduzidos do `AccessLogger.jsx`: user_email, action, entity_type, entity_id, patient_name, ip_address, user_agent, details

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-01 | CPF obrigatório e formatado no input | PatientForm.jsx:256-262 | 🟡 |
| BR-02 | LGPD obrigatório para novos pacientes | PatientForm.jsx:157-162 | 🟢 |
| BR-03 | Idade calculada dinamicamente (não armazenada) | Patients.jsx:59-69 | 🟢 |
| BR-04 | Formatação automática CPF/telefone no input | PatientForm.jsx:166-177 | 🟢 |
| BR-05 | RLS: usuário vê só seus pacientes (ou admin) | Patient.jsonc:120-158 | 🟢 |
| BR-06 | Foto via upload Base44 → file_url armazenado | PatientForm.jsx:105-108 | 🟢 |
| BR-07 | Auditoria automática: VIEW/EDIT/CREATE/DELETE_PATIENT | AccessLogger.jsx + Pages | 🟢 |
| BR-08 | Status: ativo/inativo (default ativo) | Patient.jsonc:104-111 | 🟢 |
| BR-09 | Tipo sanguíneo restrito a enum ABO/Rh + desconhecido | Patient.jsonc:56-70 | 🟢 |
| BR-10 | Gênero restrito a 4 opções | Patient.jsonc:18-26 | 🟢 |

---

## 7. Dependências Entre Módulos

```
pacientes
  ├── consultas (ConsultationTimeline, PatientDetail carrega consultations)
  ├── agendamentos (PatientDetail carrega appointments, link NewAppointment)
  ├── medicos (PatientDetail → NewConsultation precisa médico)
  └── templates (PrescriptionEditor carrega templates por tipo)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK | CRUD entidades, auth, upload arquivo | base44Client.js, todas pages |
| TanStack Query | Cache, invalidação, mutations | Todas pages |
| date-fns + ptBR | Formatação de datas | Patients, PatientDetail, ConsultationTimeline |
| framer-motion | Animações de entrada | Patients, PatientForm, PatientDetail, ConsultationTimeline |
| lucide-react | Ícones | Todos |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| `calculateAge` duplicado | Mesmo código em Patients.jsx e PatientDetail.jsx | Média |
| Validação CPF inexistente | Só formata, não valida dígito verificador | Alta |
| XSS em templates | `applyTemplate` não escapa HTML antes de renderizar | Alta |
| `lgpd_consent_ip` hardcoded | Sempre `'client-side'` — não captura IP real | Média |
| Filtro client-side | Não escala para >1000 pacientes | Baixa |
| Tratamento de erro genérico | `console.error` + toast genérico | Média |
| Sem testes | Zero arquivos de teste no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 9 |
| Linhas de código | ~2.089 |
| Entidades | 2 (1 confirmada, 1 inferida) |
| Funções/componentes principais | 14 |
| Regras de negócio | 10 |
| Algoritmos não-triviais | 4 |
| Complexidade ciclomática estimada | Alta (formulário com 20+ campos, múltiplos modais, timeline) |

---

## 11. Próximos Passos

1. **Mover `calculateAge` para `src/utils/date.js`** — eliminar duplicação
2. **Adicionar validação de CPF (dígito verificador)** — `PatientForm.jsx`
3. **Sanitizar saída em `applyTemplate`** — `PrescriptionEditor.jsx`
4. **Capturar IP real no consentimento LGPD** — requer backend ou serviço externo
5. **Migrar filtro para query backend** — quando volume justificar
6. **Criar testes unitários** — `calculateAge`, `formatCPF`, `formatPhone`, `applyTemplate`

---

# Análise de Código — Módulo `consultas`

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **consultas** implementa o ciclo de atendimento clínico do prontuário: listagem de consultas com busca e filtros, formulário de criação/edição (anamnese, sinais vitais, diagnóstico, CID-10, conduta), visualização detalhada, emissão de documentos médicos (receitas, atestados, solicitações, declarações) com templates, e upload de exames com anexos. Todo o acesso é auditado via `AccessLog` para conformidade LGPD.

**Arquitetura**: Frontend React 18 + Vite, consumindo Base44 (BaaS) via SDK (`base44.entities.Consultation|Prescription|Exam|Template` + `base44.integrations.Core.UploadFile`). Estado de servidor gerenciado por TanStack Query. Roteamento via react-router-dom v7.

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/Consultations.jsx` | Page | 264 | Listagem, busca (paciente/queixa/diagnóstico), filtros status e data |
| `src/pages/Consultation.jsx` | Page | 447 | Detalhe da consulta, emite prescrições/exames, impressão |
| `src/pages/NewConsultation.jsx` | Page | 418 | Formulário criar/editar consulta (anamnese + sinais vitais + diagnóstico) |
| `src/components/medical/VitalSignsForm.jsx` | Component | 63 | Form de 7 sinais vitais (PA, FC, temp, FR, SpO2, peso, altura) |
| `src/components/medical/PrescriptionEditor.jsx` | Component | 336 | Editor de documentos com 6 tipos, medicações e templates |
| `src/components/medical/ExamUploader.jsx` | Component | 270 | Upload de exame (PDF/imagem), preview e metadados |
| `src/components/medical/AccessLogger.jsx` | Utility | 56 | Auditoria de acessos (LGPD) |
| `src/api/base44Client.js` | Client | 23 | Instância do SDK Base44 |
| `base44/entities/Consultation.jsonc` | Schema | 128 | Entidade Consultation + RLS |
| `base44/entities/Prescription.jsonc` | Schema | 110 | Entidade Prescription + RLS |
| `base44/entities/Exam.jsonc` | Schema | 101 | Entidade Exam + RLS |

**Total**: 11 arquivos, ~2.158 linhas (código) + schemas

---

## 3. Fluxos de Controle Principais

### 3.1 Listagem de Consultas (`Consultations.jsx`)

```
Mount → useQuery(['consultations']) → base44.entities.Consultation.list('-date')
     → useQuery(['patients']) → base44.entities.Patient.list()
    ↓
Filtro client-side combinado (search + status + data)
    ↓
Render: Skeleton (4 cards) → Lista de cards → Estado vazio (com CTA)
    ↓
Card → navigate(Consultation?id=...) | Botão → NewConsultation
```

**Pontos de decisão**:
- `statusFilter`: 'all' | 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
- `dateFilter`: 'all' | 'today' | 'week' | 'month' | 'upcoming' (ver 4.2)
- `loadingConsultations`: skeletons
- lista vazia: mensagem contextual conforme existência de busca/filtro

### 3.2 Detalhe da Consulta (`Consultation.jsx`)

```
Mount com ?id=consulta-123
    ↓
useQuery (paralelos): consultation (filter id) + patient (filter id)
+ prescriptions (filter consultation_id, -created_date) + exams (filter consultation_id, -date)
    ↓
Effect: logAccess(VIEW_CONSULTATION) ← quando consultation e patient carregados
    ↓
Render: header (status badge, imprimir, editar) + grid 1 col paciente (alergias, ações) / 2 col detalhes
    ↓
Modais: PrescriptionEditor (Nova Receita / Atestado) | ExamUploader (Exame)
    ↓
Mutations: createPrescription → invalida ['prescriptions'] · createExam → invalida ['exams']
```

**Pontos de decisão**:
- `isLoading`: spinner centralizado
- `!consultation`: Card "Consulta não encontrada" + link Dashboard
- Exibe seção de sinais vitais apenas se `vital_signs` tiver ao menos 1 campo preenchido
- Exibe "Documentos Emitidos" só se `prescriptions.length > 0`; icon depende de `type.includes('receita')`

### 3.3 Criar/Editar Consulta (`NewConsultation.jsx`)

```
Mount → lê URL: ?id= (modo edição) ou ?patient_id= (pré-seleção)
    ↓
useQuery patients (filter status=ativo, -full_name)
if id: useQuery consultation → useEffect popula formData
    ↓
1. Seleção do paciente (busca por nome/CPF, top 5)
2. Data/hora + Status + Data de retorno
3. Sinais Vitais (VitalSignsForm)
4. Anamnesb cs (queixa, história HDA, exame físico)
5. Diagnóstico e Conduta (CID-10, plano, observações)
    ↓
Submit (exige selectedPatient) → mutation:
    edição → Consultation.update(id) → logAccess(EDIT_CONSULTATION)
    novo   → Consultation.create()    → logAccess(CREATE_CONSULTATION)
    ↓
Sucesso → invalidateQueries(['consultations']) → navigate(PatientDetail do paciente)
```

**Pontos de decisão**:
- `consultationId` presente → título "Editar Consulta"; senão "Nova Consulta"
- `preselectedPatientId` → paciente pre-selecionado e bloqueado (botão "Trocar" oculto)
- Submit desabilitado sem `selectedPatient` ou durante `isPending`

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Filtro Combinado de Consultas 🟢 CONFIRMADO
**Local**: `Consultations.jsx:61-92`
```javascript
const matchesSearch = !search
  || patient?.full_name?.toLowerCase().includes(search.toLowerCase())
  || c.chief_complaint?.toLowerCase().includes(search.toLowerCase())
  || c.diagnosis?.toLowerCase().includes(search.toLowerCase());
const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
// matchesDate: today | week (>= 7 dias atrás) | month (>= 1 mês) | upcoming (> agora)
```
- **Complexidade**: O(n) por lista

### 4.2 Filtro de Intervalo de Data 🟢 CONFIRMADO
**Local**: `Consultations.tsx:70-88`
| Filtro | Lógica |
|--------|--------|
| `today` | `toDateString() === today.toDateString()` |
| `week` | `date >= today - 7 dias` |
| `month` | `date >= today - 1 mês` |
| `upcoming` | `date > new Date() (hora atual) - não exclui hoje passado` |
- **Nota**: `upcoming` compara contra `new Date()` integral — consultas de hoje ainda por vir são incluídas, consultas passadas do dia de hoje também (duplicidade possível com `today`)

### 4.3 Gerenciamento de Medicações 🟢 CONFIRMADO
**Local**: `PrescriptionEditor.tsx:106-124`
- `addMedication`: adiciona objeto `{ name, dosage, frequency, duration, instructions }` vazio
- `updateMedication(index, field, value)`: atualiza campo imutavelmente
- `removeMedication(index)`: filtra por posição

### 4.4 Substitution de Variáveis de Template 🟢 CONFIRMADO
**Local**: `PrescriptionEditor.tsx:92-104` (compartilhada com módulo pacientes)
```js
template.content
  .replace(/{PACIENTE_NOME}/g, patient.full_name)
  .replace(/{PACIENTE_CPF}/g, patient.cpf)
  .replace(/{DATA}/g, data atual pt-BR)
  .replace(/{DATA_EXTENSO}/g, data por extenso pt-BR)
```

### 4.5 Preview de Arquivo de Exame 🟢 CONFIRMADO
**Local**: `ExamUploader.tsx:62-75`
- imagem → `FileReader.readAsDataURL` → `preview`
- não-imagem (PDF) → `preview = null`
- limitação: preview só para images (PDF sem preview)

### 4.6 Montagem do Payload de Prescrição 🟢 CONFIRMADO
**Local**: `PrescriptionEditor.tsx:126-139`
```js
medications: type.includes('receita') ? medications : [],
valid_days: type === 'atestado' ? parseInt(validDias) || null : null,
```

---

## 5. Estruturas de Dados

### 5.1 `Consultation` (Base44 Schema) 🟢 CONFIRMADO — `base44/entities/Consultation.jsonc`
Campos: `patient_id` (req), `date` (req), `chief_complaint`, `history_present_illness`, `vital_signs` (objeto 7 sinais), `physical_exam`, `diagnosis`, `icd_code`, `treatment_plan`, `notes`, `follow_up_date`, `status` (enum 4, default `agendada`)
RLS: `create: null`; `read/update/delete`: `created_by_id == user.id` OR `role == admin`

### 5.2 `Prescription` — `base44/entities/Prescription.jsonc`
`patient_id` (req), `type` (req, enum 6), `content` (req), `consultation_id`, `medications[]`, `template_name`, `valid_days`, `notes`

### 5.3 `Exam` — `base44/entities/Exam.jsonc`
`patient_id` (req), `name` (req), `date` (req), `type` (enum 4), `consultation_id`, `file_url`, `file_type` (enum pdf/image), `laboratory`, `results_summary`, `notes`

### 5.4 DTO interno `formData` (NewConsultation)
Objeto controlado com 11 campos (ver 3.3) — status default `em_andamento` no form, `agendada` no schema.

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-C-01 | Consulta exige `patient_id` e `date` (schema) | Consultation.jsonc:85-88 | 🟢 |
| BR-C-02 | Status da consulta: `agendada`/`em_andamento`/`concluida`/`cancelada` | Consultation.jsonc:74-83 + STATUS_CONFIG | 🟢 |
| BR-C-03 | Criação de consulta exige paciente selecionado no form | NewConsultation.jsx:398 | 🟢 |
| BR-C-04 | Pacientes elegíveis para consulta: status `ativo` | NewConsultation.jsx:63-66 | 🟢 |
| BR-C-05 | Prescrição exige `patient_id`/`type`/`content`; `medications` só para tipos de receita | Prescription.jsonc:66-70; PrescriptionEditor.jsx:132 | 🟢 |
| BR-C-06 | `valid_days` (afas, afastamento) só para tipo `atestado` | PrescriptionEditor.jsx:133 | 🟢 |
| BR-C-07 | Exame exige `patient_id`/`name`/`date`; anexo via `UploadFile` → `file_url` | ExamUploader.jsx:77-106 | 🟢 |
| BR-C-08 | Templates de cada `type` filtrados por `is_active: true` | PrescriptionEditor.jsx:65-69 | 🟢 |
| BR-C-09 | Auditoria: VIEW/CREATE/EDIT_CONSULTATION + UPLOAD_EXAM | AccessLogger.jsx + pages | 🟢 |
| BR-C-10 | RLS idêntico ao `Patient` (criador ou admin) | Consultation/Prescription/Exam.jsonc | 🟢 |
| BR-C-11 | `follow_up_date` = data de retorno exibida no detalhe | Consultation.jsx:343-350 | 🟢 |
| BR-C-12 | Ao salvar consulta, redireciona para PatientDetail do paciente | NewConsultation.jsx:121-128 | 🟢 |

---

## 7. Dependências Entre Módulos

```
consultas
  ├── pacientes (carrega Patient; redireciona para PatientDetail; busca paciente ativo)
  ├── templates (PrescriptionEditor filtra templates por tipo)
  └── logs-acesso (AccessLogger registra todas as ações)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK `entities.*` | CRUD Consultation/Prescription/Exam/Template | todas pages/components |
| Base44 `integrations.Core.UploadFile` | Upload de anexo de exame | ExamUploader.jsx:82 |
| Base44 `auth.me()` | Obter usuário para auditoria | AccessLogger.jsx:26 |
| TanStack Query | Cache, invalidação, mutations | Pages |
| date-fns + ptBR | Formatação de datas | Consultations, ConsultationDetail |
| framer-motion | Animações de entrada | Consultations, ConsultationDetail, NewConsultation |
| lucide-react | Ícones | Todos |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| `STATUS_CONFIG` duplicado | Definido em Consultations.jsx:25-30 e ConsultationDetail.jsx:30-35 | Baixa |
| `applyTemplate` sem escape HTML | Risco XSS se template tiver conteúdo não confiável (inclusive URL impressa) | Alta |
| `handlePrint` (PrescriptionEditor) | Injeção de conteúdo via template literal em `window.open` | Alta |
| Filtro `upcoming` comparado com `new Date()` integral | Consultas hoje pela manhã não aparecem em "Próximas" | Baixa |
| Impressão da página (`window.print()`) | Sem CSS de impressão dedicado | Média |
| Upload sem validação de tamanho/tipo | Aceita qualquer arquivo até o limite do browser; sem validação de 10MB no cliente | Média |
| Busca de paciente limitada (slice 5) | Retorna só os 5 primeiros resultados | Baixa |
| Sem testes | Zero testes no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 11 |
| Linhas de código | ~2.158 (Pages + Components + Client) |
| Entidades | 5 (Consultation, Prescription, Exam, Template + AccessLog inferida) |
| Funções/componentes principais | 17 |
| Regras de negócio | 12 |
| Algoritmos não-triviais | 4 |
| Complexidade ciclomática estimada | Alta (3 páginas densas, formulário 30+ campos, múltiplos modais) |

---

## 11. Próximos Passos

1. **Extrair `STATUS_CONFIG` para `src/utils/`** — eliminar duplicação
2. **Sanitizar conteúdo em templates e na impressão** — `PrescriptionEditor.jsx`
3. **Revisar filtro `upcoming`** — tratar data de hoje com hora
4. **CSS de impressão dedicado** (`@media print`)
5. **Criar testes unitários** — filtros, `applyTemplate`, montagem de payload

---

# Análise de Código — Módulo `agendamentos`

> Gerado pelo Archaeologist em 2026-08-25 | Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **agendamentos** implementa a marcação de consultas de pacientes com médicos, oferecendo uma vista de calendário semanal, vista em lista e fluxo de criação com seleção de horários baseada na agenda e duração configuradas por médico. Inclui gerenciamento de status (agendado → confirmado → em_atendimento → concluido / cancelado / faltou) e envio automático de e-mail de confirmação ao paciente.

**Arquitetura**: Mantém o mesmo stack do projeto (React 18 + Vite + TanStack Query + Base44 + Radix UI/Tailwind). Sem persistência de `consultation_id` automática (somente quando uma consulta é criada manualmente referenciando o appointment).

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/Appointments.jsx` | Page | 238 | Listagem com Tabs (calendário/lista) + Dialog de detalhes/status |
| `src/pages/NewAppointment.jsx` | Page | 270 | Formulário de criação com seleção de paciente/médico/data/horário |
| `src/components/appointments/AppointmentCalendar.jsx` | Component | 146 | Grid semanal 7×12 (08:00–19:00) com badges por status |
| `src/components/appointments/TimeSlotPicker.jsx` | Component | 107 | Geração de slots disponíveis baseado em `working_days`/`working_hours`/`appointment_duration` |
| `base44/entities/Appointment.jsonc` | Schema | 108 | Definição da entidade + RLS |

**Total**: 5 arquivos, ~869 linhas

---

## 3. Fluxos de Controle Principais

### 3.1 Listagem com Vistas (`Appointments.jsx`)

```
Carregamento
    ↓
useQuery(['appointments']) → base44.entities.Appointment.list('-date')
useQuery(['doctors']) → Doctor.list()
useQuery(['patients']) → Patient.list()
    ↓
upcomingAppointments = filter(date > now && status != 'cancelado')
    ↓
Render: Header + Tabs
  ├── Tab 'calendar' → <AppointmentCalendar> (grid 7×12)
  └── Tab 'list'     → Card com lista upcoming
    ↓
Clique em appointment → handleAppointmentClick
    ↓
Dialog com Select de status + botões Confirmar/Cancelar
    ↓
updateStatusMutation → Appointment.update(id, { status })
    ↓
onSuccess → invalidate(['appointments']) + setShowDetails(false)
```

**Pontos de decisão**:
- `upcomingAppointments` considera apenas `date > new Date()` integral — appointments de hoje no futuro aparecem; hoje no passado não.
- O Dialog abre via `setShowDetails(true)` e fecha via `onOpenChange` ou `setShowDetails(false)` no onSuccess.

### 3.2 Criação de Agendamento (`NewAppointment.jsx`)

```
Mount
    ↓
Lê URL: ?patient_id=X → preseleciona paciente
    ↓
useQuery(['patients']) → filter({ status: 'ativo' })
useQuery(['doctors'])  → filter({ is_active: true })
    ↓
SE doctor_id E selectedDate:
    useQuery(['appointments', doctor_id, selectedDate]) → filter({ doctor_id })
    (enabled=!!doctor_id && !!selectedDate)
    ↓
Render: 3 cards
  1. Paciente + Médico (selects)
  2. Data + Horário (Calendar + TimeSlotPicker, condicional ao doctor_id)
  3. Detalhes (type + notes)
    ↓
Submit → saveMutation
    ↓
Appointment.create({ ...formData, duration: doctor.appointment_duration || 30 })
    ↓
SE patient.email: base44.integrations.Core.SendEmail (confirmação)
    ↓
onSuccess → invalidate(['appointments']) + navigate(Appointments)
```

**Pontos de decisão**:
- Sem doctor_id → não renderiza o card Data/Horário (calendário fica oculto).
- Sem selectedDate → `TimeSlotPicker` não é renderizado.
- Submit exige `patient_id + doctor_id + date`; botão desabilitado caso algum falte.

### 3.3 Calendário Semanal (`AppointmentCalendar.jsx`)

```
currentWeek state → startOfWeek com locale ptBR
    ↓
weekDays = [addDays(weekStart, 0..6)]
hours    = [8..19]
    ↓
Render grid 8 colunas (label horário + 7 dias)
    ↓
Para cada (day, hour):
    getAppointmentsForSlot(day, hour) → filter parseISO + isSameDay + getHours()
    ↓
Render motion.button com cor por status + onClick onAppointmentClick
    ↓
Navegação: ChevronLeft/Right → addWeeks(currentWeek, ±1) | Hoje → new Date()
```

### 3.4 TimeSlotPicker — Disponibilidade (`TimeSlotPicker.jsx`)

```
Props: doctor, selectedDate, appointments
    ↓
SE !doctor OU !selectedDate → return null
    ↓
generateTimeSlots():
    dayOfWeek = new Date(selectedDate).getDay()
    SE !doctor.working_days?.includes(dayOfWeek) → return []
    start = parse working_hours.start (default 08:00)
    end   = parse working_hours.end   (default 18:00)
    duration = doctor.appointment_duration || 30
    while (isBefore(currentTime, endTime)):
        push slot; addMinutes(currentTime, duration)
    ↓
isSlotAvailable(slot):
    slotTime = slot.getTime()
    algum appointment com aptTime<=slotTime<aptEnd? → indisponível
    aptEnd = parseISO(apt.date) + apt.duration (default 30min)
    ↓
Render: grid de botões (variant=default se selecionado / outline caso contrário)
         disabled=!available, onClick → onSelectTime(slot.toISOString())
    ↓
SE slots.length == 0: render "Médico não atende neste dia"
```

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Cálculo de Slots Disponíveis 🟢 CONFIRMADO
**Local**: `TimeSlotPicker.jsx:33-59`
```javascript
const generateTimeSlots = () => {
    const slots = [];
    const dayOfWeek = new Date(selectedDate).getDay();
    if (!doctor.working_days?.includes(dayOfWeek)) return [];

    const [startHour, startMin] = doctor.working_hours?.start?.split(':').map(Number) || [8, 0];
    const [endHour, endMin]     = doctor.working_hours?.end?.split(':').map(Number)   || [18, 0];
    const duration = doctor.appointment_duration || 30;

    let currentTime = new Date(selectedDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (isBefore(currentTime, endTime)) {
        slots.push(new Date(currentTime));
        currentTime = addMinutes(currentTime, duration);
    }
    return slots;
};
```
- **Complexidade**: O(s) onde s = slots por dia
- **Edge cases**:
  - Médico sem `working_days`/`working_hours` → fallback `[8, 0]`/`[18, 0]` e `[]` em `working_days` ⇒ **nenhum slot renderizado** (silencioso).
  - `working_hours.start >= end` → loop não executa, retorna `[]`.

### 4.2 Verificação de Conflito de Horário 🟢 CONFIRMADO
**Local**: `TimeSlotPicker.jsx:61-69`
```javascript
const isSlotAvailable = (slot) => {
    const slotTime = slot.getTime();
    return !appointments?.some(apt => {
        const aptTime = parseISO(apt.date).getTime();
        const aptDuration = apt.duration || 30;
        const aptEnd = aptTime + (aptDuration * 60 * 1000);
        return slotTime >= aptTime && slotTime < aptEnd;
    });
};
```
- **Complexidade**: O(a) onde a = appointments existentes do médico
- **Limitação**: Detecta apenas conflito pontual — se o `appointment_duration` do novo agendamento for maior que o `duration` registrado no appointment existente, pode haver sobreposição sem detecção (falsa disponibilidade). Como a UI usa o mesmo `duration` do médico selecionado, o risco é baixo na prática.

### 4.3 Filtro de Próximos Agendamentos 🟢 CONFIRMADO
**Local**: `Appointments.jsx:83-85`
```javascript
const upcomingAppointments = appointments?.filter(a =>
    new Date(a.date) > new Date() && a.status !== 'cancelado'
) || [];
```
- **Complexidade**: O(n)
- **Limitação**: Compara timestamp completo — agendamentos do dia atual com horário passado não aparecem.

### 4.4 Filtro do Calendário por Slot 🟢 CONFIRMADO
**Local**: `AppointmentCalendar.jsx:47-52`
```javascript
const getAppointmentsForSlot = (day, hour) => {
    return appointments?.filter(apt => {
        const aptDate = parseISO(apt.date);
        return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    }) || [];
};
```
- **Granularidade**: Hora cheia — agendamentos das 14:30 caem no slot "14:00".
- **Complexidade**: O(n) por slot → O(n × 84) por render (84 = 7 dias × 12 horas).

### 4.5 Envio de E-mail de Confirmação 🟢 CONFIRMADO
**Local**: `NewAppointment.jsx:80-86`
```javascript
if (patient?.email) {
    await base44.integrations.Core.SendEmail({
        to: patient.email,
        subject: 'Confirmação de Agendamento',
        body: `Olá ${patient.full_name},\n\nSeu agendamento foi confirmado!\n\nMédico: ${doctor?.full_name}\nData: ${format(new Date(data.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\nAté breve!`
    });
}
```
- **Comportamento**: Disparado **antes** do `onSuccess` (await inline na `mutationFn`).
- **Limitação**: Sem tratamento de erro do envio — se `SendEmail` falhar, o agendamento já foi criado mas o `onSuccess` não é chamado, gerando estado inconsistente (UX mostra erro mas o registro existe).

---

## 5. Estruturas de Dados

### 5.1 Entidade `Appointment` (Base44 Schema) 🟢 CONFIRMADO
Ver `base44/entities/Appointment.jsonc` — 11 propriedades, 3 required (`patient_id`, `doctor_id`, `date`)

**Enums**:
- `type`: `primeira_consulta` (default) | `retorno` | `exame` | `procedimento`
- `status`: `agendado` (default) | `confirmado` | `em_atendimento` | `concluido` | `cancelado` | `faltou`

**Campos notáveis**:
- `duration` (number, default 30) — duração em minutos
- `reminder_sent` (boolean, default false) — flag de envio de lembrete
- `reminder_sent_date` (date-time) — timestamp do lembrete
- `consultation_id` (string) — link para `Consultation` quando o atendimento é registrado

**RLS**: idêntico ao Patient — criador ou admin. `create: null` (presumivelmente autenticado via Base44).

### 5.2 Entidade `Doctor` (Referenciada) 🟢 CONFIRMADO
Ver `base44/entities/Doctor.jsonc` — 11 propriedades, 3 required (`full_name`, `specialty`, `crm`)

**Campos críticos para o módulo**:
- `working_days` (array of number) — 0=domingo, 1=segunda, …, 6=sábado
- `working_hours` (object `{ start, end }`) — strings "HH:MM"
- `appointment_duration` (number, default 30) — em minutos
- `is_active` (boolean, default true) — usado em `Doctor.filter({ is_active: true })` no NewAppointment

**RLS**: `create` restrito a admin; `read` aberto; `update` criador ou admin; `delete` admin.

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-A01 | Apenas médicos `is_active: true` aparecem no Select de NewAppointment | `NewAppointment.jsx:64` | 🟢 |
| BR-A02 | Apenas pacientes `status: 'ativo'` aparecem no Select | `NewAppointment.jsx:59` | 🟢 |
| BR-A03 | `duration` do agendamento = `doctor.appointment_duration` ou 30 (fallback) | `NewAppointment.jsx:100` | 🟢 |
| BR-A04 | TimeSlotPicker retorna `[]` se `working_days` não inclui `dayOfWeek` | `TimeSlotPicker.jsx:38-40` | 🟢 |
| BR-A05 | TimeSlotPicker usa `working_hours` do médico (fallback 08:00-18:00) | `TimeSlotPicker.jsx:42-43` | 🟢 |
| BR-A06 | Slot indisponível se conflita com appointment existente (intervalo fechado-aberto) | `TimeSlotPicker.jsx:61-69` | 🟢 |
| BR-A07 | Calendar desabilita datas passadas (`disabled: date < new Date()`) | `NewAppointment.jsx:187` | 🟢 |
| BR-A08 | E-mail de confirmação enviado apenas se paciente tem email | `NewAppointment.jsx:80` | 🟢 |
| BR-A09 | `upcomingAppointments` exclui status `cancelado` e datas passadas | `Appointments.jsx:83-85` | 🟢 |
| BR-A10 | RLS: agendamentos visíveis apenas ao criador ou admin | `Appointment.jsonc:69-106` | 🟢 |
| BR-A11 | Status pode ser alterado por qualquer Select sem restrição de transição | `Appointments.jsx:200-212` | 🟡 (UI não impede `concluido → agendado`) |
| BR-A12 | `consultation_id` preenchido manualmente (não há auto-link ao iniciar atendimento) | Inferido (campo nunca escrito no código analisado) | 🟡 |
| BR-A13 | `reminder_sent` e `reminder_sent_date` nunca escritos no código analisado | Inferido (campos órfãos no schema) | 🟡 |

---

## 7. Dependências Entre Módulos

```
agendamentos
  ├── pacientes (Patient.filter, leitura de patient.full_name para exibição)
  ├── medicos   (Doctor.filter, leitura de working_hours/working_days/appointment_duration)
  ├── consultas (campo consultation_id — sem auto-vínculo)
  ├── logs-acesso (campos reminder_sent/reminder_sent_date — sem uso)
  └── Base44.integrations.Core.SendEmail (confirmação de agendamento)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK | CRUD Appointment/Patient/Doctor, SendEmail | base44Client.js, Appointments, NewAppointment |
| TanStack Query | Cache, invalidação por chave | Todas as pages |
| date-fns + ptBR | Formatação de datas (`format`, `parseISO`, `addDays`, `addWeeks`, `addMinutes`, `isBefore`, `isSameDay`, `startOfWeek`) | AppointmentCalendar, TimeSlotPicker, Appointments, NewAppointment |
| framer-motion | Animações em botões e entrada de cards | AppointmentCalendar, Appointments, NewAppointment |
| lucide-react | Ícones (Calendar, Clock, ChevronLeft/Right, CheckCircle2, XCircle) | Todos |
| Radix UI (shadcn) | Tabs, Dialog, Select, Calendar, Button, Card, Badge, Input, Label, Textarea | Todos |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| `STATUS_CONFIG` (Appointments.jsx) vs `STATUS_COLORS` (AppointmentCalendar.jsx) | Dois mapas de status paralelos com labels/cores — risco de divergência | Média |
| Conflito de e-mail e `onSuccess` | Falha em `SendEmail` deixa agendamento criado sem feedback de sucesso | Média |
| Sem dedupe contra o próprio appointment em edição | `NewAppointment` não tem modo edição (apenas criação) | Baixa |
| `reminder_sent` / `reminder_sent_date` órfãos | Campos no schema sem nenhum código de envio de lembrete | Média |
| `consultation_id` sem auto-link | Ao marcar `em_atendimento`/`concluido`, o `consultation_id` não é preenchido automaticamente | Alta |
| Calendar desabilita só datas passadas inteiras | Permite selecionar hoje (e o TimeSlotPicker gera slots passados) | Baixa |
| `working_days`/`working_hours` sem fallback se ausentes | Médico sem config fica invisível no TimeSlotPicker (cai no `length === 0`) | Média |
| Sem validação de fim-de-semana/feriado | Considera apenas `working_days`; não há lista de feriados | Baixa |
| Concorrência em criação simultânea | Dois usuários podem criar agendamento no mesmo slot — sem lock otimista | Alta |
| `upcomingAppointments` considera timestamp completo | Reclamações de UX esperadas para "hoje cedo" | Baixa |
| Sem testes | Zero testes no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 5 |
| Linhas de código | ~869 |
| Entidades | 2 (`Appointment` confirmada, `Doctor` referenciada) |
| Funções/componentes principais | 12 |
| Regras de negócio | 13 |
| Algoritmos não-triviais | 5 (geração de slots, detecção de conflito, filtro upcoming, filtro do calendar, envio de e-mail) |
| Complexidade ciclomática estimada | Média (forms com 5 campos, calendário com grid, sem lógica de negócio pesada) |

---

## 11. Próximos Passos

1. **Consolidar `STATUS_CONFIG`/`STATUS_COLORS` em `src/utils/appointmentStatus.js`** — eliminar duplicação Appointments.jsx × AppointmentCalendar.jsx
2. **Mover `SendEmail` para `onSuccess`** — ou usar try/catch para rollback do `Appointment.create` em caso de falha
3. **Implementar auto-link `consultation_id`** — ao iniciar atendimento, criar `Consultation` e setar `Appointment.consultation_id`
4. **Implementar job/cron de lembretes** — preencher `reminder_sent`/`reminder_sent_date` antes do horário
5. **Adicionar lock otimista ou validação server-side de conflito** — evitar double-booking
6. **Criar testes unitários** — `generateTimeSlots`, `isSlotAvailable`, máquinas de estado de status
7. **Suporte a edição de agendamento** — fluxo inverso de `NewAppointment` com `?id=`
8. **Mover mapa de status para um único arquivo compartilhado entre modules `consultas` e `agendamentos`** — hoje os dois definem mapas próprios

---

# Análise de Código — Módulo `templates`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **templates** implementa o gerenciamento de modelos de documentos médicos (receitas simples/controladas, atestados, solicitações de exame, encaminhamentos, declarações e anamnese). Permite criar, editar e excluir templates com sistema de variáveis substituíveis (`{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}`, `{DATA_EXTENSO}`, `{DIAS_AFASTAMENTO}`), marcação como template padrão e ativação/desativação. É o fornecedor de conteúdo-base do `PrescriptionEditor` (módulos `pacientes` e `consultas`).

**Arquitetura**: Página única React + Dialog de editor. CRUD via Base44 SDK com TanStack Query.

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/Templates.jsx` | Page | 422 | Listagem agrupada por tipo, CRUD completo com editor modal |
| `base44/entities/Template.jsonc` | Schema | 80 | Definição da entidade + RLS |

**Total**: 2 arquivos, ~502 linhas

---

## 3. Fluxos de Controle Principais

### 3.1 Listagem Agrupada por Tipo (`Templates.jsx`)

```
Mount → useQuery(['templates']) → base44.entities.Template.list('-created_date')
    ↓
groupedTemplates = templates.reduce(acc => agrupa por t.type) 
    ↓
Render: Para cada TEMPLATE_TYPES (ordem fixa dos 7 tipos):
    typeTemplates = groupedTemplates[type.value] || []
    SE vazio → return null (tipo oculto)
    SENÃO → seção <h2> + grid md:2 colunas de cards
    ↓
Card: nome + badges (Padrão/Inativo) + preview 150 chars + Editar/Excluir
```

**Pontos de decisão**:
- `isLoading`: skeleton de 3 cards
- `templates?.length === 0`: estado vazio com CTA "Criar Primeiro Template"
- Tipos sem templates são ocultados (render condicional)

### 3.2 Editor de Template (Dialog)

```
Novo: botão → resetForm() + editingTemplate=null + setShowEditor(true)
Editar: handleEdit(template) → popula formData do template + abre Dialog
    ↓
Form: nome* + tipo* (Select 7 opções) + variáveis clicáveis (insertVariable)
      + conteúdo* (Textarea mono 12 rows) + switches is_default/is_active
    ↓
Submit → saveMutation.mutate(formData)
    ↓
editingTemplate? Template.update(id, data) : Template.create(data)
    ↓
onSuccess: invalidate(['templates']) + fecha dialog + resetForm()
```

### 3.3 Exclusão com Confirmação

```
handleDelete(template) → guarda templateToDelete + abre AlertDialog
    ↓
Confirmação explícita ("Esta ação não pode ser desfeita")
    ↓
deleteMutation.mutate(id) → Template.delete(id)
    ↓
onSuccess: invalidate(['templates']) + fecha AlertDialog
```

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Agrupamento por Tipo 🟢 CONFIRMADO
**Local**: `Templates.jsx:158-162`
```javascript
const groupedTemplates = templates?.reduce((acc, t) => {
    if (!acc[t.type]) acc[t.type] = [];
    acc[t.type].push(t);
    return acc;
}, {}) || {};
```
- **Complexidade**: O(n)
- **Nota**: A ordem de exibição segue `TEMPLATE_TYPES` (array fixo), não a ordem do objeto agrupado

### 4.2 Inserção de Variável no Cursor 🟢 CONFIRMADO
**Local**: `Templates.jsx:146-151`
```javascript
const insertVariable = (variable) => {
    setFormData(prev => ({ ...prev, content: prev.content + variable }));
};
```
- **Limitação**: Sempre concatena no FINAL do conteúdo, não na posição do cursor (UX limitada)

### 4.3 Normalização de Booleanos na Edição 🟢 CONFIRMADO
**Local**: `Templates.jsx:129-139`
```javascript
is_default: template.is_default || false,
is_active: template.is_active !== false
```
- **Nota**: `is_active` usa `!== false` (trata undefined/null como ativo); `is_default` usa `|| false`. Assimetria deliberada ou acidental?

---

## 5. Estruturas de Dados

### 5.1 Entidade `Template` (Base44 Schema) 🟢 CONFIRMADO
Ver `base44/entities/Template.jsonc` — 6 propriedades, 3 required (`name`, `type`, `content`)

**Enums**:
- `type`: `receita_simples` | `receita_controlada` | `atestado` | `solicitacao_exame` | `encaminhamento` | `declaracao` | `anamnese` (7 valores)

**Campos notáveis**:
- `variables` (array of string) — declarado no schema mas **nunca escrito pela UI** (campo órfão)
- `is_default` (boolean, default false)
- `is_active` (boolean, default true)

**RLS (Row Level Security)**:
- `create`: apenas `role == admin`
- `read`: null (aberto a autenticados)
- `update/delete`: criador OR admin

### 5.2 Constante `TEMPLATE_TYPES` 🟢 CONFIRMADO
Espelho exato do enum do schema — definida em código (`Templates.jsx:44-52`) com labels pt-BR.

### 5.3 Constante `AVAILABLE_VARIABLES` 🟢 CONFIRMADO
5 variáveis documentadas na UI: `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}`, `{DATA_EXTENSO}`, `{DIAS_AFASTAMENTO}`.
- **Nota**: `{DIAS_AFASTAMENTO}` é substituída pelo PrescriptionEditor? Não confirmado no código analisado (PrescriptionEditor só substitui as outras 4). 🔴 LACUNA

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-T01 | Template exige name/type/content (schema required) | Template.jsonc:43-47 | 🟢 |
| BR-T02 | Tipo restrito ao enum de 7 valores | Template.jsonc:9-21 + TEMPLATE_TYPES | 🟢 |
| BR-T03 | Criação de template exige role admin (RLS) | Template.jsonc:48-53 | 🟢 |
| BR-T04 | Leitura aberta a todos usuários autenticados | Template.jsonc:54 | 🟢 |
| BR-T05 | Edição/exclusão: criador ou admin | Template.jsonc:55-78 | 🟢 |
| BR-T06 | Exclusão sempre com confirmação explícita (AlertDialog) | Templates.jsx:401-419 | 🟢 |
| BR-T07 | is_active=false esconde template do PrescriptionEditor (filtro lá) | PrescriptionEditor.jsx:65-69 | 🟢 |
| BR-T08 | Campo variables nunca populado pela UI (órfão) | ausência em Templates.jsx | 🟡 |

---

## 7. Dependências Entre Módulos

```
templates
   └── consumido por: pacientes (PrescriptionEditor filtra por tipo+ativo)
       consumido por: consultas (idem)
   └── dashboard (link "Templates" nas ações rápidas)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK | CRUD Template | Templates.jsx |
| TanStack Query | Cache ['templates'], invalidação | Templates.jsx |
| Radix UI (shadcn) | Dialog, Select, Switch, AlertDialog, Tooltip, Badge | Templates.jsx |
| framer-motion / lucide-react | Animações e ícones | Templates.jsx |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| Campo `variables` órfão | Declarado no schema, nunca escrito/lido na UI | Média |
| `{DIAS_AFASTAMENTO}` sem substituidor | Variável anunciada na UI; PrescriptionEditor não a substitui | Alta |
| Inserção de variável no final | `insertVariable` ignora posição do cursor no Textarea | Baixa |
| Preview truncado sem indicador | `substring(0, 150)` + "..." mesmo se conteúdo menor | Baixa |
| Múltiplos templates padrão possíveis | `is_default` sem exclusividade garantida por tipo | Média |
| Sem testes | Zero testes no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 2 |
| Linhas de código | ~502 |
| Entidades | 1 (Template) |
| Funções/componentes principais | 8 |
| Regras de negócio | 8 |
| Algoritmos não-triviais | 3 |
| Complexidade ciclomática estimada | Baixa (CRUD padrão com um Dialog) |

---

## 11. Próximos Passos

1. **Implementar substituição de `{DIAS_AFASTAMENTO}`** no PrescriptionEditor ou remover da UI
2. **Popular campo `variables` automaticamente** ao salvar (parse do content)
3. **Garantir unicidade de template padrão por tipo** (server-side ou lógica no save)
4. **Inserir variável na posição do cursor** usando ref do Textarea
5. **Criar testes unitários** — groupedTemplates, insertVariable

---

# Análise de Código — Módulo `logs-acesso`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **logs-acesso** implementa a tela de auditoria LGPD: visualização read-only dos registros `AccessLog` gerados pelo `AccessLogger` (usado transversalmente pelos demais módulos). Oferece busca textual, filtro por ação (12 tipos) e por período (hoje/semana/mês), painel de estatísticas agregadas e tabela paginada implicitamente (limite 500 registros).

**Arquitetura**: Página única read-only. Única query Base44 + filtros client-side. Sem mutations.

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/AccessLogs.jsx` | Page | 278 | Tabela de auditoria com busca, 2 filtros e stats |
| `src/components/medical/AccessLogger.jsx` | Utility | 56 | Produtor dos logs (logAccess + ACCESS_ACTIONS) — compartilhado |
| `base44/entities/AccessLog.jsonc` | Schema | 74 | Definição da entidade + RLS |

**Total**: 3 arquivos, ~408 linhas

---

## 3. Fluxos de Controle Principais

### 3.1 Carregamento e Filtragem (`AccessLogs.jsx`)

```
Mount → useQuery(['access-logs'])
        → base44.entities.AccessLog.list('-created_date', 500)
    ↓
filteredLogs = logs.filter(log =>
    matchesSearch  (user_email OU patient_name contém search)
    && matchesAction (actionFilter === 'all' || log.action === actionFilter)
    && matchesDate   (today | week | month | all)
)
    ↓
Stats: total | views (action includes 'view')
       | edições (includes 'edit' || 'create') | exclusões (includes 'delete')
    ↓
Tabela: Data/Hora | Usuário | Ação (badge+ícone) | Paciente | Detalhes
```

**Pontos de decisão**:
- `isLoading`: 5 rows skeleton
- `filteredLogs.length === 0`: linha vazia com ícone Shield
- Ação desconhecida: fallback `{ label: log.action, color: slate, icon: Eye }`

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Filtro Triplo Combinado 🟢 CONFIRMADO
**Local**: `AccessLogs.jsx:67-94`
- Busca: case-insensitive em `user_email` e `patient_name`
- Ação: igualdade exata contra ACTION_CONFIG keys
- Data: `today` (compara `toDateString()`), `week` (`>= hoje - 7d`), `month` (`>= hoje - 1 mês`)
- **Complexidade**: O(n)

### 4.2 Classificação Heurística de Ação para Stats 🟢 CONFIRMADO
**Local**: `AccessLogs.jsx:174-188`
```javascript
views:  logs?.filter(l => l.action?.includes('view')).length
edits:  logs?.filter(l => l.action?.includes('edit') || l.action?.includes('create')).length
deletes: logs?.filter(l => l.action?.includes('delete')).length
```
- **Nota**: Heurística por substring — `create_prescription` conta como "Edição" junto com edits reais. Login/logout/upload/export não entram em nenhuma categoria (soma ≠ total).

---

## 5. Estruturas de Dados

### 5.1 Entidade `AccessLog` (Base44 Schema) 🟢 CONFIRMADO
Ver `base44/entities/AccessLog.jsonc` — 8 propriedades, 2 required (`user_email`, `action`)

**Enum `action`** (12 valores): `login`, `logout`, `view_patient`, `edit_patient`, `create_patient`, `view_consultation`, `create_consultation`, `edit_consultation`, `create_prescription`, `upload_exam`, `delete_record`, `export_data`

**RLS (Row Level Security)**:
- `create`: null (qualquer usuário pode criar log — necessário para o logger transversal)
- `read/update/delete`: apenas `role == admin`
- **Implicação**: Somente admins veem a tela de auditoria; tentativa de usuário comum retornará vazio/negado

### 5.2 Constante `ACTION_CONFIG` 🟢 CONFIRMADO
Mapa ação → { label, cor Tailwind, ícone } espelhando o enum do schema (`AccessLogs.jsx:30-43`). Duplica conceito de `ACCESS_ACTIONS` do AccessLogger (chaves iguais).

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-L01 | Log exige user_email + action | AccessLog.jsonc:52-55 | 🟢 |
| BR-L02 | Qualquer usuário autenticado cria log; leitura só admin | AccessLog.jsonc:56-72 | 🟢 |
| BR-L03 | Logs imutáveis na prática (update RLS admin-only, sem UI de edição) | schema + página read-only | 🟢 |
| BR-L04 | Limite de 500 registros por consulta | AccessLogs.jsx:64 | 🟢 |
| BR-L05 | Ordenação sempre mais recente primeiro (-created_date) | AccessLogs.jsx:64 | 🟢 |
| BR-L06 | ip_address gravado como 'client-side' (não é IP real) | AccessLogger.jsx:34 | 🟢 |
| BR-L07 | details aceita qualquer valor (string/object) apesar do schema dizer string | AccessLogger.jsx:36 vs schema | 🟡 |

---

## 7. Dependências Entre Módulos

```
logs-acesso (leitor)
   └── alimentado por: AccessLogger.jsx usado em
       pacientes (view/edit/create/delete patient)
       consultas (view/create/edit consultation, upload exam, prescription)
       dashboard (login ao acessar)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK | AccessLog.list (única operação) | AccessLogs.jsx |
| TanStack Query | Cache ['access-logs'] | AccessLogs.jsx |
| date-fns + ptBR | format dd/MM/yyyy HH:mm:ss | AccessLogs.jsx |
| Radix UI (shadcn) | Table, Select, Card, Badge, Input | AccessLogs.jsx |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| Limite rígido 500 | Sem paginação — histórico além de 500 logs inacessível na UI | Alta |
| Stats por substring | `create_prescription` contabilizado como edição; login/logout fora das categorias | Média |
| Filtro client-side | Busca não escala (mas RLS admin-only mitiga volume) | Baixa |
| `details` tipagem inconsistente | Schema string, logger envia object/null | Baixa |
| Sem exportação real | Ícone Download existe na UI decorativa; `export_data` nunca logado | Média |
| Sem testes | Zero testes no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 3 |
| Linhas de código | ~408 |
| Entidades | 1 (AccessLog) |
| Funções/componentes principais | 3 |
| Regras de negócio | 7 |
| Algoritmos não-triviais | 2 |
| Complexidade ciclomática estimada | Baixa (read-only, filtros simples) |

---

## 11. Próximos Passos

1. **Paginação server-side ou scroll infinito** — remover teto de 500
2. **Classificar stats por prefixo exato** (view_/edit_/create_/delete_) em vez de substring solta
3. **Corrigir tipo de `details`** (object no schema ou JSON.stringify no logger)
4. **Implementar exportação CSV** (ação `export_data` já prevista no enum)
5. **Capturar IP real** — requer endpoint server-side
6. **Criar testes** — filtro triplo, heurística de stats

---

# Análise de Código — Módulo `dashboard`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Confiança: 🟢🟡🔴

---

## 1. Visão Geral

O módulo **dashboard** é o hub central do prontuário: consolida métricas de 4 entidades (Patient, Consultation, Prescription, Appointment), oferece busca global de pacientes (PatientSearch), ações rápidas para os principais fluxos, aba de relatórios analíticos (ReportsView com gráficos Recharts) e registra evento de login na auditoria. É também o principal orquestrador de navegação entre módulos.

**Arquitetura**: Página única com 4 queries paralelas + Tabs (Visão geral / Relatórios). Componentes compartilhados: StatsCard, PatientSearch, ReportsView, AccessLogger.

---

## 2. Estrutura de Arquivos

| Arquivo | Tipo | Linhas | Responsabilidade |
|---------|------|--------|------------------|
| `src/pages/Dashboard.jsx` | Page | 337 | Hub central: stats, próximos agendamentos, ações rápidas, tabs |
| `src/components/medical/StatsCard.jsx` | Component | 61 | Card de métrica animado (title/value/icon/color/trend) |
| `src/components/medical/PatientSearch.jsx` | Component | 106 | Busca client-side nome/CPF/telefone com dropdown top-5 |
| `src/components/medical/ReportsView.jsx` | Component | 203 | Relatórios: volume mensal (bar chart) + ranking especialidades |
| `base44/entities/*.jsonc` | Schemas | — | Patient, Consultation, Prescription, Appointment, Doctor (leitura) |

**Total**: 4 arquivos próprios, ~707 linhas (+ schemas referenciados)

---

## 3. Fluxos de Controle Principais

### 3.1 Carregamento do Dashboard (`Dashboard.jsx`)

```
Mount
    ↓
useEffect: logAccess(LOGIN, ..., 'Acesso ao dashboard')  ← dispara uma vez
    ↓
4 useQuery em paralelo:
    patients       list('-created_date', 100)
    consultations  list('-date', 50)
    prescriptions  list('-created_date', 100)
    appointments   list('-date', 100)
    ↓
Derivados (client-side):
    todayConsultations     filter(date == hoje)
    upcomingConsultations  filter(date > now && status != cancelada).slice(0,5)
    activePatients         count(status == ativo)
    todayAppointments      filter(date == hoje && status != cancelado)
    upcomingAppointments   filter(date > now && status != cancelado).slice(0,5)
    ↓
Render: Header (data pt-BR) + PatientSearch + botão Novo Paciente
        + 4 StatsCards + Tabs [visao-geral | relatorios]
```

**Pontos de decisão**:
- `loadingConsultations`: skeletons nos próximos agendamentos
- `upcomingAppointments.length === 0`: estado vazio com CTA "Agendar consulta"
- Aba relatorios renderiza `<ReportsView />` (queries próprias)

### 3.2 Busca de Pacientes (`PatientSearch.jsx`)

```
Input controlado (query)
    ↓
showResults = isFocused && query.length >= 2
    ↓
filteredPatients = patients.filter(
    full_name contains query (case-insensitive)
    || cpf includes query
    || phone includes query
).slice(0, 5)
    ↓
Dropdown animado (AnimatePresence): avatar inicial + nome + telefone + badge Ativo/Inativo
    ↓
Click → navigate(PatientDetail?id=...)
    ↓
onBlur com setTimeout(200ms) para permitir click no item antes de fechar
```

**Pontos de decisão**:
- Mínimo 2 caracteres para abrir dropdown
- Lista vem do pai (props) — componente puro de UI
- Badge status: `ativo` verde / senão cinza

### 3.3 Relatórios (`ReportsView.jsx`)

```
Mount → useQuery(['appointments-completed'])
        → Appointment.filter({ status: 'concluido' }, '-date', 500)
        useQuery(['doctors-reports']) → Doctor.list('-created_date', 200)
    ↓
monthlyData (useMemo): 12 últimos meses (subMonths), zera consultas,
    incrementa por appointment dentro do cutoff
    ↓
specialtyData (useMemo): join appointments × doctors (doctor_id),
    agrupa por specialty ('Não especificada' fallback), ordena desc
    ↓
Stats: total consultas | especialidade campeã | média mensal (total/12 arredondado)
    ↓
Charts: BarChart (Recharts) volume/mês + barras de progresso ranking especialidades
```

**Pontos de decisão**:
- `isDataLoading`: spinner único centralizado
- `totalConsultations === 0`: empty state no gráfico
- Campeã = specialtyData[0] com badge Trophy

---

## 4. Algoritmos e Lógica de Negócio

### 4.1 Agregações Client-Side do Dashboard 🟢 CONFIRMADO
**Local**: `Dashboard.jsx:63-87`
- `todayConsultations`: compara `toDateString()` — inclui canceladas (diferente de appointments que exclui)
- `upcomingConsultations/Appointments`: `date > new Date()` integral + exclui cancelados + slice 5
- **Inconsistência detectada**: consultations filtram `status !== 'cancelada'` apenas em upcoming; `todayConsultations` NÃO exclui canceladas. Appointments excluem em ambos.

### 4.2 Janela Móvel de 12 Meses 🟢 CONFIRMADO
**Local**: `ReportsView.jsx:23-44`
```javascript
for (let i = 11; i >= 0; i--) months.push({ month: format(subMonths(now, i), 'MMM/yy'), ... })
const cutoff = subMonths(now, 12);
appointments.forEach(a => { if (isAfter(d, cutoff)) months[key]?.consultas++ })
```
- **Complexidade**: O(12 + a)
- **Edge**: appointment exatamente há 12 meses entra (isAfter estrito > cutoff)

### 4.3 Ranking de Especialidades 🟢 CONFIRMADO
**Local**: `ReportsView.jsx:46-57`
- Join manual O(a × d) por appointment (find linear em doctors)
- Fallback `'Não especificada'` quando doctor_id não resolve
- Sort desc por count

### 4.4 Debounce Implícito no Blur 🟢 CONFIRMADO
**Local**: `PatientSearch.jsx:47`
```javascript
onBlur={() => setTimeout(() => setIsFocused(false), 200)}
```
- Hack clássico para permitir clique no item do dropdown antes do fechamento

### 4.5 Valor Fixo de Taxa de Atendimento 🟢 CONFIRMADO
**Local**: `Dashboard.jsx:151-157`
- `value="94%"` hardcoded — métrica decorativa sem cálculo real 🔴

---

## 5. Estruturas de Dados

### 5.1 Entidades Consumidas 🟢 CONFIRMADO
| Entidade | Query | Limite | Uso |
|----------|-------|--------|-----|
| Patient | list -created_date | 100 | stats ativos + PatientSearch + nomes dos próximos |
| Consultation | list -date | 50 | today/upcoming |
| Prescription | list -created_date | 100 | card "Documentos Emitidos" (contagem bruta) |
| Appointment | list -date | 100 | today/upcoming + ReportsView |
| Doctor | list -created_date | 200 | ReportsView (join specialty) |

### 5.2 DTO interno `monthlyData` 🟢 CONFIRMADO
`{ month: 'Jan/26', key: '2026-0', consultas: number }[]` — key = `${year}-${monthIndex}` para lookup O(1)... na prática usa findIndex O(12).

---

## 6. Regras de Negócio Extraídas

| # | Regra | Local | Confiança |
|---|-------|-------|-----------|
| BR-D01 | Acesso ao dashboard registra LOGIN na auditoria | Dashboard.jsx:89-91 | 🟢 |
| BR-D02 | Paciente ativo = status 'ativo' | Dashboard.jsx:74 | 🢢 |
| BR-D03 | Próximos = data futura E não cancelado, top 5 | Dashboard.jsx:68-72, 84-87 | 🟢 |
| BR-D04 | Busca exige ≥2 caracteres | PatientSearch.jsx:36 | 🟢 |
| BR-D05 | Busca cobre nome, CPF e telefone | PatientSearch.jsx:30-34 | 🟢 |
| BR-D06 | Relatórios consideram apenas appointments concluídos | ReportsView.jsx:15 | 🟢 |
| BR-D07 | Especialidade sem médico resolvido = 'Não especificada' | ReportsView.jsx:51 | 🟢 |
| BR-D08 | Taxa de Atendimento fixa 94% (decorativa) | Dashboard.jsx:153 | 🟢 |
| BR-D09 | Documentos Emitidos = contagem das últimas 100 prescrições (não total) | Dashboard.jsx:146 | 🟡 |

---

## 7. Dependências Entre Módulos

```
dashboard
   ├── pacientes (queries Patient, links Patients/PatientForm/PatientDetail)
   ├── consultas (queries Consultation, link NewConsultation)
   ├── agendamentos (queries Appointment, links Appointments/NewAppointment)
   ├── medicos (query Doctor em ReportsView)
   ├── templates (link rápido)
   └── logs-acesso (produz LOGIN log)
```

---

## 8. Integrações Externas

| Integração | Uso | Arquivo |
|------------|-----|---------|
| Base44 SDK | 5 entidades (list/filter) + auth.me() via logger | Dashboard, ReportsView, AccessLogger |
| TanStack Query | 6 chaves de cache distintas | Dashboard, ReportsView |
| Recharts | BarChart/Bar/XAxis/YAxis/Tooltip/ResponsiveContainer | ReportsView |
| date-fns + ptBR | format, subMonths, isAfter, startOfWeek | Dashboard, ReportsView |
| framer-motion | AnimatePresence (dropdown), entradas | PatientSearch, Dashboard |
| lucide-react | Ícones | Todos |

---

## 9. Pontos de Atenção / Lacunas 🔴

| Item | Descrição | Severidade |
|------|-----------|------------|
| Taxa de Atendimento hardcoded 94% | Métrica falsa exibida como real | Alta |
| "Documentos Emitidos" limitado a 100 | Contagem errada acima de 100 prescrições | Média |
| Inconsistência todayConsultations | Inclui canceladas (consultations) enquanto appointments exclui | Média |
| Join O(a×d) em ReportsView | Escala mal; usar Map de doctors | Baixa |
| Queries sem dedupe de cache | Dashboard lista 100 pacientes; Patients.jsx lista sem limite — chaves iguais ['patients'], dados diferentes conforme ordem de mount | Média |
| logAccess(LOGIN) em todo mount do dashboard | Cada visita à home gera log 'login' (sem logout real) | Média |
| Sem testes | Zero testes no projeto | Alta |

---

## 10. Métricas de Complexidade

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 4 |
| Linhas de código | ~707 |
| Entidades consumidas | 5 |
| Funções/componentes principais | 10 |
| Regras de negócio | 9 |
| Algoritmos não-triviais | 5 |
| Complexidade ciclomática estimada | Média (agregações múltiplas + tabs + dropdown) |

---

## 11. Próximos Passos

1. **Calcular Taxa de Atendimento real** (concluídos ÷ total do período) ou remover o card
2. **Contar prescrições com query de agregação** (ou listar sem limite para o contador)
3. **Unificar tratamento de canceladas** entre consultations e appointments
4. **Substituir logAccess(LOGIN) por evento de auth real**
5. **Otimizar join de especialidades** com Map<id, doctor>
6. **Criar testes** — agregações do dashboard, janela móvel, filtro PatientSearch
