---
schemaVersion: 1
generatedAt: 2026-09-09T15:09:42-03:00
reversa:
  version: "1.3.2"
kind: target_business_rules
producedBy: curator
hash: "sha256:4287b4b6533569599ff6b76ebaeace3365db2dde878144c50cf494ee17fc0fef"
---

# Target Business Rules

> Catálogo das regras de negócio do legado com decisão de migração: MIGRAR, DESCARTAR ou DECISÃO HUMANA.
> Cada item rastreia para a origem em `_reversa_sdd/` e respeita o `paradigm_decision.md`.

## Resumo
- Total de regras analisadas: 50 (itens consolidados; duplicações entre `domain.md` e requirements de units foram fundidas)
- MIGRAR: 45 (detalhe em `discard_log.md`: 0 descartados)
- DESCARTAR: 0
- DECISÃO HUMANA: 5 (detalhe abaixo + `ambiguity_log.md`)

> Contexto da curadoria: `paradigm_decision.md` registrou **gap nenhum** (mesma stack React funcional, TS como camada de tipos). Portanto **nenhuma regra é descartada por mudança de paradigma**. As políticas RLS do Base44 e os schemas não mudam (brief: "schemas não mudam", "backend imutável"); o que migra é o **espelho frontend** (filtros, validações, tipos) e a tipagem estrita dos campos sensíveis.

## Regras MIGRAR

### Pacientes

#### BR-MIGRAR-001 — Seleção restrita a pacientes ativos
- **Origem**: `_reversa_sdd/domain.md` §2.1 (BR-P01); `_reversa_sdd/pacientes/requirements.md` §2 (BR-P01); `_reversa_sdd/agendamentos/requirements.md` §2 (BR-A02)
- **Confiança original**: 🟢
- **Descrição**: Apenas pacientes com `status: 'ativo'` podem ser selecionados para novos agendamentos ou consultas.
- **Justificativa de migração**: Regra de negócio pura; permanece intacta no alvo.
- **Compatibilidade com paradigma alvo**: Sem impacto de paradigma; no TS vira tipo derivado (`status` discriminado) + validação na seleção (UI/query).

#### BR-MIGRAR-002 — Enum de tipo sanguíneo
- **Origem**: `_reversa_sdd/domain.md` §2.1 (BR-P02); `_reversa_sdd/pacientes/requirements.md` §2 (BR-P02); `_reversa_sdd/database/business-rules.md` §3
- **Confiança original**: 🟢
- **Descrição**: `blood_type` ∈ {`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `desconhecido`}.
- **Justificativa de migração**: Enum fechado do domínio.
- **Compatibilidade com paradigma alvo**: Vira union type literal no TS.

#### BR-MIGRAR-003 — Obrigatoriedade do cadastro de paciente
- **Origem**: `_reversa_sdd/pacientes/requirements.md` §2 (BR-P03); `_reversa_sdd/questions.md` Q-07 (resposta humana ✅)
- **Confiança original**: 🟢
- **Descrição**: Cadastro exige `full_name`, `cpf`, `birth_date`, `phone`, `lgpd_consent`; sem aceite o save é recusado. Botão "Ver Termo" abre modal de leitura.
- **Justificativa de migração**: Regra regulatória/negócio pura.
- **Compatibilidade com paradigma alvo**: Campos obrigatórios viram tipos requeridos; recusa de save sem aceite vira validação type-safe (Zod).

#### BR-MIGRAR-004 — Registro de consentimento LGPD no save
- **Origem**: `_reversa_sdd/pacientes/requirements.md` §2 (BR-P03); `_reversa_sdd/pacientes/design.md` §2
- **Confiança original**: 🟢
- **Descrição**: No momento do save, registrar `lgpd_consent_date` (datetime) e `lgpd_consent_ip` (string) automaticamente.
- **Justificativa de migração**: Regra LGPD; permanece.
- **Compatibilidade com paradigma alvo**: Tipos obrigatórios derivados (`lgpd_consent: true` exige `lgpd_consent_date`/`lgpd_consent_ip` preenchidos — union discriminada ou tipo condicional).

#### BR-MIGRAR-005 — Enums de gênero e status de paciente
- **Origem**: `_reversa_sdd/pacientes/requirements.md` §3 (schema); `_reversa_sdd/database/business-rules.md` §3; `_reversa_sdd/data-dictionary.md`
- **Confiança original**: 🟢
- **Descrição**: `gender` ∈ {`masculino`, `feminino`, `outro`, `prefiro_nao_informar`}; `status` ∈ {`ativo`, `inativo`}, default `ativo`.
- **Justificativa de migração**: Dicionários fechados do domínio.
- **Compatibilidade com paradigma alvo**: Union types literais.

### Consultas

#### BR-MIGRAR-006 — Consulta exige paciente válido
- **Origem**: `_reversa_sdd/consultas/requirements.md` §2 (BR-C01)
- **Confiança original**: 🟢
- **Descrição**: Toda consulta deve estar vinculada a um `patient_id` válido.
- **Justificativa de migração**: Regra pura de integridade.
- **Compatibilidade com paradigma alvo**: `patient_id` requerido no tipo.

#### BR-MIGRAR-007 — Máquina de estados da Consulta
- **Origem**: `_reversa_sdd/consultas/requirements.md` §2 (BR-C02); `_reversa_sdd/database/business-rules.md` §3
- **Confiança original**: 🟢
- **Descrição**: `status` ∈ {`agendada`, `em_andamento`, `concluida`, `cancelada`}, default `agendada`; ciclo `agendada → em_andamento → concluida` (ou `cancelada`).
- **Justificativa de migração**: Máquina de estados do domínio.
- **Compatibilidade com paradigma alvo**: Discriminated union no TS; transições tipadas (estados inválidos em compile-time).

#### BR-MIGRAR-008 — Medicamentos restritos a receitas
- **Origem**: `_reversa_sdd/consultas/requirements.md` §2 (BR-C03); `_reversa_sdd/domain.md` §2.3 (BR-T02); `_reversa_sdd/consultas/design.md` §2; `_reversa_sdd/questions.md` Q-06 (✅)
- **Confiança original**: 🟢
- **Descrição**: A seção/lista de medicamentos só existe quando o tipo de documento inclui "receita"; para outros tipos, oculta. Itens: Nome, Dosagem, Frequência, Duração, Instruções — preenchimento livre, sem base externa.
- **Justificativa de migração**: Regra de UI/negócio pura.
- **Compatibilidade com paradigma alvo**: Tipo condicional por `type` do documento (ex.: union com variante `medications` apenas em tipos de receita).

#### BR-MIGRAR-009 — Enum de tipo de prescrição
- **Origem**: `_reversa_sdd/database/business-rules.md` §3; `_reversa_sdd/data-dictionary.md`
- **Confiança original**: 🟢
- **Descrição**: `Prescription.type` ∈ {`simples`, `controlada`, `atestado`, `encaminhamento`, `solicitacao_exame`, `declaracao`, …} — conjunto fechado.
- **Justificativa de migração**: Enum documental.
- **Compatibilidade com paradigma alvo**: Union type literal (base para BR-MIGRAR-008).

### Agendamentos

#### BR-MIGRAR-010 — Agendamento exige paciente, médico e data
- **Origem**: `_reversa_sdd/agendamentos/requirements.md` §2 (BR-A01)
- **Confiança original**: 🟢
- **Descrição**: `Appointment` exige `patient_id`, `doctor_id` e `date`.
- **Justificativa de migração**: Integridade pura.
- **Compatibilidade com paradigma alvo**: Campos requeridos no tipo.

#### BR-MIGRAR-011 — Máquina de estados do Agendamento
- **Origem**: `_reversa_sdd/agendamentos/requirements.md` §2 (BR-A03); `_reversa_sdd/domain.md` §2.2 (BR-A01); `_reversa_sdd/database/business-rules.md` §3
- **Confiança original**: 🟢
- **Descrição**: `status` ∈ {`agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado`, `faltou`}, default `agendado`; agendamento nasce `agendado` e deve ser `confirmado` antes do atendimento.
- **Justificativa de migração**: Máquina de estados central do módulo.
- **Compatibilidade com paradigma alvo**: Discriminated union + transições tipadas.

#### BR-MIGRAR-012 — Confirmação manual; flags de lembrete sem automação
- **Origem**: `_reversa_sdd/agendamentos/requirements.md` §2 (BR-A03); `_reversa_sdd/questions.md` Q-04 (✅)
- **Confiança original**: 🟢
- **Descrição**: Transição para `confirmado` é manual (médico/recepcionista/admin via UI). `reminder_sent`/`reminder_sent_date` são apenas flags de notificação; não alteram status.
- **Justificativa de migração**: Comportamento confirmado por decisão humana.
- **Compatibilidade com paradigma alvo**: Sem mudança; tipos de flags boolean/date opcionais.

#### BR-MIGRAR-013 — Agendamento respeita jornada do médico
- **Origem**: `_reversa_sdd/agendamentos/requirements.md` §2 (BR-A04); `_reversa_sdd/medicos/requirements.md` §2 (BR-M03); `_reversa_sdd/questions.md` Q-08 (✅)
- **Confiança original**: 🟢
- **Descrição**: Horário do agendamento deve respeitar `working_days`, intervalo `working_hours.start/end` e caber em `appointment_duration`; fora dos limites é rejeitado.
- **Justificativa de migração**: Regra de negócio crítica da agenda.
- **Compatibilidade com paradigma alvo**: Função pura tipada de validação de slot; tipos `WorkingHours`, `WorkingDays`.

#### BR-MIGRAR-014 — Enum de tipo de agendamento
- **Origem**: `_reversa_sdd/agendamentos/requirements.md` §3 (schema)
- **Confiança original**: 🟢
- **Descrição**: `type` ∈ {`primeira_consulta`, `retorno`, `exame`, `procedimento`}, default `primeira_consulta`; `duration` default 30 min.
- **Justificativa de migração**: Enum/constantes do domínio.
- **Compatibilidade com paradigma alvo**: Union type + constante tipada.

### Médicos

#### BR-MIGRAR-015 — CRUD de médicos só admin
- **Origem**: `_reversa_sdd/medicos/requirements.md` §2 (BR-M01); `_reversa_sdd/permissions.md` §2
- **Confiança original**: 🟢
- **Descrição**: Apenas `role == 'admin'` cria, atualiza ou exclui médicos.
- **Justificativa de migração**: Regra de autorização.
- **Compatibilidade com paradigma alvo**: RBAC tipado (vide BR-MIGRAR-036); guardas de role em compile-time/UI.

#### BR-MIGRAR-016 — Dias de trabalho 0–6
- **Origem**: `_reversa_sdd/medicos/requirements.md` §2 (BR-M02)
- **Confiança original**: 🟢
- **Descrição**: `working_days` armazena dias da semana ativos (0=domingo … 6=sábado).
- **Justificativa de migração**: Representação do domínio.
- **Compatibilidade com paradigma alvo**: Tipo `Weekday[]` (0–6) em vez de `number[]` genérico.

#### BR-MIGRAR-017 — Leitura de médicos livre para autenticados
- **Origem**: `_reversa_sdd/medicos/requirements.md` §4; `_reversa_sdd/permissions.md` §2; `_reversa_sdd/inventory.md` (RLS Doctor: leitura pública)
- **Confiança original**: 🟢
- **Descrição**: Qualquer usuário autenticado da clínica pode ler médicos; escrita restrita a admin.
- **Justificativa de migração**: Regra de autorização de leitura.
- **Compatibilidade com paradigma alvo**: Permanece; espelhada nos tipos de permissão.

### Templates

#### BR-MIGRAR-018 — Template exige nome, tipo e conteúdo
- **Origem**: `_reversa_sdd/templates/requirements.md` §2 (BR-T01)
- **Confiança original**: 🟢
- **Descrição**: Todo template exige `name`, `type` e `content`.
- **Justificativa de migração**: Regra pura.
- **Compatibilidade com paradigma alvo**: Campos requeridos.

#### BR-MIGRAR-019 — Enum de tipo de template
- **Origem**: `_reversa_sdd/templates/requirements.md` §2 (BR-T02); `_reversa_sdd/database/business-rules.md` §3
- **Confiança original**: 🟢
- **Descrição**: `Template.type` ∈ conjunto fechado de 7 valores (receita simples/controlada, atestado, encaminhamento, solicitação de exame, declaração etc.).
- **Justificativa de migração**: Enum documental.
- **Compatibilidade com paradigma alvo**: Union type literal.

#### BR-MIGRAR-020 — CRUD de templates restrito a admin; leitura de ativos livre
- **Origem**: `_reversa_sdd/templates/requirements.md` §2 (BR-T03) e §4; `_reversa_sdd/permissions.md` §2
- **Confiança original**: 🟢
- **Descrição**: Criação/exclusão de templates só `admin`; leitura de templates `is_active` liberada a profissionais de saúde.
- **Justificativa de migração**: Autorização + filtro de ativos.
- **Compatibilidade com paradigma alvo**: RBAC tipado; `is_active` no tipo de leitura.

#### BR-MIGRAR-021 — Interpolação de variáveis no salvamento
- **Origem**: `_reversa_sdd/templates/requirements.md` §2 (BR-T04); `_reversa_sdd/questions.md` Q-09 (✅); `_reversa_sdd/code-analysis.md` §4.5
- **Confiança original**: 🟢
- **Descrição**: Variáveis de template (ex.: `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}`, `{DATA_EXTENSO}`, `{DIAS_AFASTAMENTO}`) são interpoladas **no salvamento** do documento; variáveis contextuais podem exigir preenchimento manual antes da finalização.
- **Justificativa de migração**: Regra funcional do domínio (formatação/geração de documentos).
- **Compatibilidade com paradigma alvo**: Função pura de substituição com contrato tipado de placeholders; atenção ao XSS (nota em `code-analysis.md` §4.5 — ver AMB referido à codificação).

#### BR-MIGRAR-022 — Templates filtrados por tipo no momento do documento
- **Origem**: `_reversa_sdd/domain.md` §2.3 (BR-T01); `_reversa_sdd/consultas/design.md` §2
- **Confiança original**: 🟢
- **Descrição**: Ao emitir um documento, o dropdown de templates é filtrado pelo `type` — template de `atestado` não aparece ao criar `receita`.
- **Justificativa de migração**: Regra de UI/negócio.
- **Compatibilidade com paradigma alvo**: Filtro tipado por union de tipo de documento.

#### BR-MIGRAR-023 — Flags de ativação de template
- **Origem**: `_reversa_sdd/templates/requirements.md` §3 (schema); `_reversa_sdd/data-dictionary.md`
- **Confiança original**: 🟢
- **Descrição**: `is_active` (default true) e `is_default` (boolean) controlam disponibilidade e padrão.
- **Justificativa de migração**: Estado de configuração.
- **Compatibilidade com paradigma alvo**: Booleanos tipados.

### Logs de Acesso

#### BR-MIGRAR-024 — AccessLog append-only
- **Origem**: `_reversa_sdd/logs-acesso/requirements.md` §2 (BR-L01); `_reversa_sdd/permissions.md` §2
- **Confiança original**: 🟢
- **Descrição**: Registros de `AccessLog` são de inserção exclusiva do sistema (*append-only*); edição/exclusão vedada a usuários comuns; read/update/delete apenas `admin`.
- **Justificativa de migração**: Regra de auditoria LGPD.
- **Compatibilidade com paradigma alvo**: Sem mudança; espelho no frontend permanece (só admin vê logs).

#### BR-MIGRAR-025 — Enum de ações de log
- **Origem**: `_reversa_sdd/logs-acesso/requirements.md` §2 (BR-L02); `_reversa_sdd/data-dictionary.md`
- **Confiança original**: 🟢
- **Descrição**: `AccessLog.action` ∈ enum suportado (create, read, update, delete, export_data, login…).
- **Justificativa de migração**: Enum de auditoria.
- **Compatibilidade com paradigma alvo**: Union type literal.

#### BR-MIGRAR-026 — Eventos que geram log
- **Origem**: `_reversa_sdd/logs-acesso/requirements.md` §2 (BR-L03); `_reversa_sdd/questions.md` Q-10 (✅); `_reversa_sdd/dashboard/requirements.md` (NFR: log ao carregar dashboard)
- **Confiança original**: 🟢
- **Descrição**: Logs são gerados por chamadas de serviço/interceptadores em eventos específicos: autenticação bem-sucedida, visualização de prontuário/pacientes, acesso ao dashboard. Não há logging automático de toda rota.
- **Justificativa de migração**: Regra de auditoria por evento.
- **Compatibilidade com paradigma alvo**: Mesmos pontos de chamada, com assinaturas tipadas (`logAccess(action, {…})`).

### Dashboard

#### BR-MIGRAR-027 — KPI Pacientes Ativos
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (Regras de Negócio)
- **Confiança original**: 🟢
- **Descrição**: Total de pacientes com `status == 'ativo'`.
- **Justificativa de migração**: Métrica pura.
- **Compatibilidade com paradigma alvo**: Query tipada + contagem.

#### BR-MIGRAR-028 — KPI Agendamentos Hoje exclui cancelados
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (Regras de Negócio); `_reversa_sdd/domain.md` §2.2 (BR-A03)
- **Confiança original**: 🟢
- **Descrição**: Total de agendamentos com data = hoje e `status != 'cancelado'`.
- **Justificativa de migração**: Métrica definida.
- **Compatibilidade com paradigma alvo**: Filtro tipado por status.

#### BR-MIGRAR-029 — KPI Documentos Emitidos (limitado)
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (Regras de Negócio)
- **Confiança original**: 🟢
- **Descrição**: Total (até 100) de prescrições ordenadas por data de criação.
- **Justificativa de migração**: Métrica definida.
- **Compatibilidade com paradigma alvo**: Query com limite tipado.

#### BR-MIGRAR-030 — Lista Próximos Agendamentos
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (Regras de Negócio + RF-02)
- **Confiança original**: 🟢
- **Descrição**: Até 5 agendamentos futuros (`date > now`) com `status != 'cancelado'`.
- **Justificativa de migração**: Métrica definida.
- **Compatibilidade com paradigma alvo**: Filtro + limite tipados.

#### BR-MIGRAR-031 — Busca global de pacientes
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (RF-04); `_reversa_sdd/code-analysis.md` §4.2
- **Confiança original**: 🟢
- **Descrição**: Busca por nome/CPF/telefone/email via componente `PatientSearch`.
- **Justificativa de migração**: Funcionalidade definida.
- **Compatibilidade com paradigma alvo**: Filtro tipado; CPF tratado como dado sensível.

#### BR-MIGRAR-032 — Log de acesso ao carregar o dashboard
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (NFR Segurança)
- **Confiança original**: 🟢
- **Descrição**: Ao carregar o dashboard, gera evento de auditoria de acesso.
- **Justificativa de migração**: Auditoria LGPD.
- **Compatibilidade com paradigma alvo**: Mesmo comportamento com assinatura tipada.

#### BR-MIGRAR-033 — Limites de payload nas consultas do dashboard
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (NFR Performance)
- **Confiança original**: 🟢
- **Descrição**: Consultas de pacientes/consultas/prescrições com limite de 100 ou 50 registros via API.
- **Justificativa de migração**: Contrato de performance.
- **Compatibilidade com paradigma alvo**: Constantes de limite tipadas nos parâmetros de query.

### Segurança / RBAC transversal

#### BR-MIGRAR-034 — Isolamento por criador ou admin (ownership)
- **Origem**: `_reversa_sdd/permissions.md` §2; `_reversa_sdd/database/business-rules.md` §1; `_reversa_sdd/domain.md` §2.4 (BR-S02); `_reversa_sdd/pacientes|consultas|agendamentos/requirements.md` §4
- **Confiança original**: 🟢
- **Descrição**: Para Patient, Consultation, Appointment, Exam, Prescription: leitura/edição/exclusão por `created_by_id == user.id` **ou** `role == 'admin'`. No frontend, filtros por `created_by_id` espelham a RLS do BaaS (que não muda).
- **Justificativa de migração**: Núcleo de isolamento multi-tenant/LGPD — regra de negócio + segurança.
- **Compatibilidade com paradigma alvo**: **Tornar obrigatório por tipos**: assinaturas de query/mutation exigem `created_by_id`/escopo; a decisão `paradigm_decision.md` e o brief exigem que o TS **force** filtros `created_by_id` (F-03 IDOR detectável em compile-time).

#### BR-MIGRAR-035 — Auditoria de acesso a dados sensíveis
- **Origem**: `_reversa_sdd/domain.md` §2.4 (BR-S01)
- **Confiança original**: 🟢
- **Descrição**: Todo acesso ou alteração de dados sensíveis gera registro em `AccessLog`.
- **Justificativa de migração**: LGPD.
- **Compatibilidade com paradigma alvo**: Mesmo comportamento com API tipada.

#### BR-MIGRAR-036 — RBAC User vs Admin refletido em tipos
- **Origem**: `_reversa_sdd/permissions.md` §1-2; `_reversa_sdd/medicos/requirements.md` (BR-M01); `_reversa_sdd/templates/requirements.md` (BR-T03); `_reversa_sdd/questions.md` Q-12 (✅)
- **Confiança original**: 🟢
- **Descrição**: Papéis `User` (próprios dados) e `Admin` (tudo + configurações). Criação aberta para autenticados nos CRUDs de negócio; restrição estrita de papel apenas em cadastros administrativos (médicos, templates).
- **Justificativa de migração**: Modelo de autorização a preservar.
- **Compatibilidade com paradigma alvo**: Tipo `role` explícito no usuário. **Nota de segurança (F-01)**: o RBAC inadequado do legado (ex.: lógica de role frágil, ausência de checks consistentes) deve ser **tipado de forma que falte** (compile-time) onde hoje falha silenciosamente em runtime — correção lógica em fase posterior, fora do escopo.

### Modo Offline (transversal)

#### BR-MIGRAR-037 — Ativação por env var em build
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF01)
- **Confiança original**: 🟢
- **Descrição**: Modo offline ativado exclusivamente por `VITE_OFFLINE=true` em tempo de build; sem toggle runtime.
- **Justificativa de migração**: Comportamento de runtime a preservar.
- **Compatibilidade com paradigma alvo**: Mesmo mecanismo em TS (`import.meta.env` tipado).

#### BR-MIGRAR-038 — Troca do cliente SDK pelo mock
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF02); `_reversa_sdd/inventory.md` (delta)
- **Confiança original**: 🟢
- **Descrição**: Quando ativo, `src/api/base44Client` exporta `createMockClient()` em vez do `createClient()` do SDK.
- **Justificativa de migração**: Comportamento central do offline.
- **Compatibilidade com paradigma alvo**: **Contrato único tipado** (`Base44Client` interface) implementado por SDK real e mock — elimina desacoplamento silencioso (risco nº 5 do brief).

#### BR-MIGRAR-039 — Autenticação OFFLINE_USER
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF03); `_reversa_sdd/questions.md` Q-16 (✅)
- **Confiança original**: 🟢
- **Descrição**: Em offline, `AuthContext` não chama `auth.me()`; autentica imediatamente como `OFFLINE_USER` (`demo-user-001`, `demo@medrecord.local`, `Dra. Demo`) — sem `role`, `created_by_id`, `permissions`, `tenant_id`.
- **Justificativa de migração**: Comportamento confirmado.
- **Compatibilidade com paradigma alvo**: Tipo de usuário deve tornar **explícita** a ausência de `role`/`created_by_id` em offline (ex.: `OFFLINE_USER` como variante discriminada) — para que componentes que dependem de role/permissão não compilem cegos em offline (Q-16, P2).

#### BR-MIGRAR-040 — Persistência em localStorage + seed
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF04) e §3.1
- **Confiança original**: 🟢
- **Descrição**: Coleções por entidade sob chave `mock_db_<EntityName>`; semeadura na primeira leitura quando ausente/corrompida; encoding JSON; sem TTL.
- **Justificativa de migração**: Persistência do modo demo.
- **Compatibilidade com paradigma alvo**: Mesmo comportamento em TS, com chaves tipadas.

#### BR-MIGRAR-041 — Operações expostas pelo mock
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF05) e §6
- **Confiança original**: 🟢
- **Descrição**: Operações: `list(sort?, limit?)`, `filter(conds, sort?, limit?)`, `create`, `update`, `delete`, `integrations.Core.UploadFile`, `auth.me/logout/redirectToLogin`, `appLogs.logUserInApp`. Subset essencial (CRUD + auth) — cobertura completa fora de escopo (Q-15 ✅).
- **Justificativa de migração**: Contrato do mock.
- **Compatibilidade com paradigma alvo**: Interface tipada compartilhada com SDK real (BR-MIGRAR-038).

#### BR-MIGRAR-042 — Semântica de create/update no mock
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF06, BR-OFF07)
- **Confiança original**: 🟢
- **Descrição**: `create` popula `id` (uuid), `created_date` (ISO agora) e, se ausente, `date`; `update` mantém `id` e faz merge superficial, rejeitando com `Error('Not found: …')`.
- **Justificativa de migração**: Semântica do mock.
- **Compatibilidade com paradigma alvo**: Implementação tipada com mesmas garantias.

#### BR-MIGRAR-043 — Filtros e ordenação limitados do mock
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF08, BR-OFF09) e §6
- **Confiança original**: 🟢
- **Descrição**: `filter` com comparação estrita (`===`) por chave/valor, sem `in/contains/gte/lte/ne`; `sort` de 1 campo (`field` asc ou `-field` desc), sem tie-breaker. Sem `get(id)` direto.
- **Justificativa de migração**: Limitações intencionais confirmadas (Q-15).
- **Compatibilidade com paradigma alvo**: Tipos do filtro restringem operadores disponíveis (ex.: union de condições suportadas) — degradação consciente em compile-time em vez de quebra silenciosa (P3).

#### BR-MIGRAR-044 — Mock sem RLS (comportamento intencional)
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF10) e §4; `_reversa_sdd/questions.md` Q-16 (✅)
- **Confiança original**: 🟡 (INFERIDO) — comportamento documentado; validar no agente de codificação que o mock offline segue **sem** RLS (todos os registros visíveis/editáveis) e que isso permanece intencional para demo/QA.
- **Descrição**: Offline não aplica RLS; qualquer página que assuma restrição pode divergir (P2) — mitigado por BR-MIGRAR-039 (tipos explícitos do OFFLINE_USER).
- **Justificativa de migração**: Comportamento demo confirmado pelo stakeholder (Q-16).
- **Compatibilidade com paradigma alvo**: Manter; documentar no contrato tipado que o mock não garante isolamento.

#### BR-MIGRAR-045 — Logout/redirect/login no-op em offline
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §2 (BR-OFF11, BR-OFF12)
- **Confiança original**: 🟢
- **Descrição**: `auth.logout()` e `auth.redirectToLogin()` são no-op; `appLogs.logUserInApp()` é no-op; usuário permanece logado.
- **Justificativa de migração**: Comportamento confirmado.
- **Compatibilidade com paradigma alvo**: No-ops tipados (retorno explícito) na implementação mock.

## Regras DESCARTAR (resumo)

| ID | Origem | Motivo curto | Vínculo a paradigma? |
|---|---|---|---|
| — | — | Nenhuma regra descartada. Sem mudança de paradigma; sem regra incompatível com o brief (backend/RLS permanecem intactos no BaaS). | não |

> Detalhe completo em `discard_log.md`.

## Regras DECISÃO HUMANA

### BR-HUMANA-001 — Taxa de Atendimento (KPI do Dashboard)
- **Origem**: `_reversa_sdd/dashboard/requirements.md` (Regras de Negócio + "Taxa de Atendimento — decisão pendente"); `_reversa_sdd/gaps.md` (G-01)
- **Tipo de ambiguidade**: 🔴 GAP — fórmula, fonte e período indefinidos; hoje exibido fixo/mockado `94%` (`Dashboard.jsx:140-141`).
- **Descrição**: KPI "Taxa de Atendimento" não tem regra definida no legado; placeholder `94%`.
- **Opções**:
  1. Migrar **paridade exata**: manter o valor `94%` como constante explícita e tipada (documentada como mock), sem inventar fórmula. **Sem mudança de comportamento.**
  2. Definir fórmula nova durante a migração (ex.: `concluidos/(concluidos+cancelados+faltou)×100`) — **foge do escopo** (brief: "novas features" e correções ficam fora).
  3. Remover o KPI no alvo — **quebra paridade**.
- **Recomendação do Curator**: opção 1 — paridade exata, constante tipada `TAXA_ATENDIMENTO_MOCK = 94` com nota; fórmula real fica para decisão de produto em fase posterior.
- **Status**: RESOLVIDA (opção 1 — paridade exata, constante mock tipada; decisor: Product Owner/Developer; 2026-09-09T15:24:37-03:00)

### BR-HUMANA-002 — Divergência de critério entre KPIs "Consultas de Hoje" e "Agendamentos Hoje"
- **Origem**: `_reversa_sdd/domain.md` §3 (Lacunas); `_reversa_sdd/review-report.md` §3 (alerta 1); `_reversa_sdd/code-analysis.md` (consultas: filtro `upcoming`/`today` inclui canceladas? — divergência documentada)
- **Tipo de ambiguidade**: ⚠️ AMBÍGUA — regras conflitantes entre KPIs do mesmo dashboard.
- **Descrição**: O contador de Consultas de hoje pode incluir registros `cancelada`, enquanto Agendamentos de hoje os exclui (BR-MIGRAR-028). Qual critério vale?
- **Opções**:
  1. **Paridade exata**: reproduzir no alvo o mesmo comportamento atual de cada KPI (inclusive a divergência), tipando cada critério como está. (Recomendado — brief exige paridade 100%, sem correção de bugs nesta migração.)
  2. Unificar o critério (excluir canceladas também em Consultas) — correção comportamental, fora do escopo declarado.
- **Recomendação do Curator**: opção 1; registrar a divergência como `REFERIDO À CODIFICAÇÃO` para o codificador **não "consertar"** silenciosamente; correção em fase futura.
- **Status**: RESOLVIDA (opção 1 — paridade exata, reproduzir critério atual de cada KPI; decisor: Product Owner/Developer; 2026-09-09T15:24:37-03:00)

### BR-HUMANA-003 — Sincronia automática Agendamento ↔ Consulta (regra inferida BR-A02)
- **Origem**: `_reversa_sdd/domain.md` §2.2 (BR-A02, 🟡); §3 (Lacunas — "Sem gatilho automático"); `_reversa_sdd/review-report.md` §3 (alerta 2); `_reversa_sdd/agendamentos/requirements.md` (BR-A03 — transições manuais); Q-04 (✅)
- **Tipo de ambiguidade**: 🟡 INFERIDO + lacuna documentada.
- **Descrição**: A regra "ao concluir uma consulta, o agendamento correspondente vira `concluido`" foi **inferida**; o legado **não** tem gatilho automático — a marcação é manual na UI.
- **Opções**:
  1. Migrar o **comportamento real** (manual, via UI) e descartar a inferência de automação — paridade exata. (Recomendado.)
  2. Implementar gatilho automático no alvo — mudança de comportamento, fora do escopo.
- **Recomendação do Curator**: opção 1 — paridade; registrar em `ambiguity_log.md` como item resolvido com decisão humana.
- **Status**: RESOLVIDA (opção 1 — migrar comportamento real manual, descartar inferência de gatilho automático; decisor: Product Owner/Developer; 2026-09-09T15:24:37-03:00)

### BR-HUMANA-004 — Política de paginação dos Logs de Acesso
- **Origem**: `_reversa_sdd/logs-acesso/screens.md`; `_reversa_sdd/gaps.md` (G-02); `_reversa_sdd/questions.md` (R-02)
- **Tipo de ambiguidade**: 🔴 GAP — política acima do limite indefinida.
- **Descrição**: O legado carrega 500 registros e renderiza todos os filtrados, sem paginação; acima de 500, comportamento indefinido.
- **Opções**:
  1. Paridade: manter carregamento de até 500 + renderização dos filtrados sem paginação (comportamento atual), tipando a constante de limite. (Recomendado.)
  2. Definir/implementar paginação na migração — mudança de comportamento/feature, fora do escopo.
- **Recomendação do Curator**: opção 1 — paridade exata; política de paginação real fica para fase futura de produto.
- **Status**: RESOLVIDA (opção 1 — paridade, manter carregamento de até 500 sem paginação; decisor: Product Owner/Developer; 2026-09-09T15:24:37-03:00)

### BR-HUMANA-005 — Aviso visual de "dados de teste" no Modo Offline
- **Origem**: `_reversa_sdd/modo-offline/requirements.md` §7 (P1); `_reversa_sdd/gaps.md` (G-04); `_reversa_sdd/questions.md` Q-14 (✅ — recomendação registrada)
- **Tipo de ambiguidade**: dependência de produto (melhoria recomendada, não implementada no legado).
- **Descrição**: Recomenda-se um badge/aviso visual indicando "Modo Offline — dados fictícios/de teste"; não implementado no legado.
- **Opções**:
  1. **Não implementar nesta migração** (paridade; o legado não tem o badge) — registrar como melhoria futura referida à codificação. (Recomendado — brief exclui novas features.)
  2. Incluir o badge no alvo — pequena feature nova; quebra paridade estrita de UI.
- **Recomendação do Curator**: opção 1 — fora do escopo desta migração; registrar sugestão para o agente de codificação como item pós-cutover.
- **Status**: RESOLVIDA (opção 1 — não implementar nesta migração, registrar como melhoria futura; decisor: Product Owner/Developer; 2026-09-09T15:24:37-03:00)

## Notas

- **Vulnerabilidades F-01 (RBAC), F-02 (token em URL), F-03 (IDOR)**: declaradas no `migration_brief.md` como motivadoras da camada de tipos. Não são "regras de negócio a migrar" — são **não conformidades conhecidas** cuja correção lógica é fase posterior. As regras MIGRAR-034/036 e os tipos de `auth.me()`/parâmetros de URL devem **expor** esses problemas em compile-time (ver também `_reversa_sdd/questions.md` e gaps relacionados no código, citados no brief).
- **Interpolação de templates e XSS**: `code-analysis.md` §4.5 registra que a substituição não escapa HTML. Isso permanece no alvo (paridade), mas deve constar no `ambiguity_log.md` como referido à codificação (não silenciar).
- **CPF sensível**: `cpf` é armazenado criptografado no BaaS; no frontend é tratado como dado sensível (formatação/máscara). Tipos devem marcar campos sensíveis (CPF, dados LGPD) — ver `_reversa_sdd/data-dictionary.md` (coluna de sensibilidade).
- **Sem testes no legado**: nenhuma regra de teste migra (brief exclui framework de testes nesta migração); paridade será validada por `tsc --noEmit` + revisão (Inspector).
- Itens consolidados no `ambiguity_log.md` pelo orquestrador ao fim do agente.
