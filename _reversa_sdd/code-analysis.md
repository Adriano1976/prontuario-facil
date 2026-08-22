# Análise de Código — Consolidado

> Gerado pelo Archaeologist em 2026-08-22 | Nível: **completo** | Confiança: 🟢🟡🔴
>
> **Módulos cobertos**: [`pacientes`](#análise-de-código--módulo-pacientes) · [`consultas`](#análise-de-código--módulo-consultas)

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