# Perguntas para Validação Humana — prontuario-facil

> Gerado pelo Reversa-Reviewer em 2026-08-28.
> `answer_mode: file` — preencha o campo **Resposta** de cada item e avise com `reversa` quando terminar.

---

## Q-01 — Dashboard: `design.md` e `tasks.md` ausentes

**Unit:** `dashboard/`
**Arquivo:** (ausente)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** A unit `dashboard/` possui apenas `screens.md` (gerado pelo Visor). Os arquivos canônicos `requirements.md`, `design.md` e `tasks.md` não foram gerados pelo Writer. Sem eles, não há especificação das regras de negócio dos KPIs (Pacientes Ativos, Agendamentos Hoje, Documentos Emitidos, Taxa de Atendimento), nem da lógica de cálculo de cada métrica.

**Pergunta:**
Os KPIs do Dashboard são calculados em tempo real via queries, ou são valores pré-computados/cacheados? Há alguma definição de período (ex: "Agendamentos Hoje" considera qual fuso horário? Usa a data do servidor ou do cliente)?

**Resposta:** Os arquivos que estavam faltando já foram devidamente criados.

---

## Q-02 — Dashboard: `screens.md` sem escala de confiança

**Unit:** `dashboard/`
**Arquivo:** `dashboard/screens.md`
**Severidade:** 🔴 Moderado
**Contexto:** O `screens.md` do Dashboard não usa o sistema de confiança 🟢/🟡/🔴 em nenhum elemento. Não é possível saber o que foi confirmado na imagem e o que foi inferido. Em especial, o "gráfico mini" de Taxa de Atendimento e o estado vazio dos "Próximos Agendamentos" merecem classificação.

**Pergunta:**
O gráfico mini na KPI card de "Taxa de Atendimento" é realmente um sparkline/mini chart ou apenas um indicador visual de cor (ex: barra de progresso)?

**Resposta:** Não há sparkline, mini chart nem barra de progresso.

---

## Q-03 — Agendamentos: formulário sem campos de data/hora

**Unit:** `agendamentos/`
**Arquivo:** `agendamentos/screens.md` (Tela: Novo Agendamento, linha 26–35)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** O formulário "Novo Agendamento" documentado no `screens.md` lista Paciente, Médico, Tipo de Consulta e Observações — mas **omite completamente os campos de data e hora**. Porém, a BR-A01 em `requirements.md` exige `date` como campo obrigatório. Há uma contradição direta: a UI não mostra como o usuário informa a data do agendamento.

**Pergunta:**
Como o usuário informa data e hora no formulário de Novo Agendamento? Há um campo de date/time picker? Ou o agendamento é criado a partir de um clique direto na grade de calendário (sem formulário separado para data)?

**Resposta:** O formulário de Novo Agendamento possui uma seção explícita chamada "Data e Horário" localizada entre a seção "Paciente e Médico" e a seção "Detalhes". Essa seção conta com um widget de calendário embutido (mini-calendar/date picker) que permite navegar entre meses/anos e selecionar diretamente o dia do agendamento.

---

## Q-04 — Agendamentos: status `confirmado` não tem gatilho documentado

**Unit:** `agendamentos/`
**Arquivo:** `agendamentos/requirements.md` (BR-A03)
**Severidade:** 🟡 Moderado
**Contexto:** O ciclo de status `agendado` → `confirmado` → `em_atendimento` → `concluido` está documentado, mas não há nenhuma spec de quem e como confirma o agendamento. A tela de calendário não mostra botão de confirmação. O campo `reminder_sent` sugere que pode haver confirmação automática por lembrete, mas isso não está especificado.

**Pergunta:**
A transição para `confirmado` é feita manualmente pelo médico/admin via interface, ou automaticamente pelo sistema após envio do lembrete? O campo `reminder_sent` tem relação com essa transição?

**Resposta:** A transição para `confirmado` é realizada manualmente pelo usuário (médico, recepcionista ou admin) ao alterar o status do agendamento na interface. Os campos `reminder_sent` e `reminder_sent_date` são flags de controle de notificação e não possuem gatilhos de automação de status.

---

## Q-05 — Consultas: `design.md` e `tasks.md` ausentes

**Unit:** `consultas/`
**Arquivo:** `consultas/design.md` e `consultas/tasks.md` (criados)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** A unit `consultas/` possuía apenas `requirements.md` e `screens.md`, sem `design.md` nem `tasks.md`. Os artefatos canônicos agora foram gerados, detalhando a arquitetura de componentes, a integração de templates, a lógica condicional de medicamentos e o plano de tarefas.

**Pergunta:**
Quando o usuário clica em "Nova Receita" / "Atestado" / "Exame" na tela de Visualização de Consulta, o modal de Novo Documento preenche automaticamente algum campo com dados da consulta atual (paciente, data)? Ou o usuário preenche tudo manualmente?

**Resposta:** O modal de Novo Documento herda automaticamente o vínculo com a consulta atual e o paciente associado (`patient_id` e `consultation_id`). Além disso, ao selecionar um modelo no dropdown de "Template", o conteúdo pré-configurado do template (incluindo variáveis substituídas como nome do paciente e data) é injetado automaticamente no campo de texto do documento. Os arquivos `design.md` e `tasks.md` da unit `consultas/` foram criados para sanar esta pendência.

---

## Q-06 — Consultas: campo `medications` sem spec completa

**Unit:** `consultas/`
**Arquivo:** `consultas/requirements.md` (BR-C03) e `consultas/screens.md` (Modal: Novo Documento)
**Severidade:** 🟡 Moderado
**Contexto:** A BR-C03 menciona que `medications` só é preenchível se o tipo do documento for "receita". O `screens.md` mostra "Medicamentos (Seção com botão '+ Adicionar')" — mas não documenta os campos internos de cada medicamento (nome, dosagem, posologia, quantidade, etc.) nem como a seção é ocultada/exibida para outros tipos de documento.

**Pergunta:**
Quais são os campos internos de cada medicamento na receita? Há validação de nome contra alguma base (ANVISA, livre)? A seção de medicamentos some completamente no formulário quando o tipo não é receita, ou apenas fica desabilitada?

**Resposta:** Cada medicamento na receita possui os seguintes campos internos: **Nome do medicamento**, **Dosagem (ex: 500mg)**, **Frequência (ex: 8/8h)**, **Duração (ex: 7 dias)** e um campo de instruções especiais (`Instruções especiais...`), além de botões para adicionar novos itens e excluir individuais. Não há validação automatizada de nome contra bases externas (preenchimento livre). Quando o tipo de documento selecionado não é uma receita, a seção de medicamentos é **oculta completamente** do formulário.

---

## Q-07 — Pacientes: `design.md` e `tasks.md` ausentes

**Unit:** `pacientes/`
**Arquivo:** `pacientes/design.md` e `pacientes/tasks.md` (criados)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** A unit `pacientes/` possuía apenas `requirements.md` e `screens.md`, sem `design.md` (fluxo de cadastro, validação do CPF, consentimento LGPD) e sem `tasks.md`. Os arquivos canônicos agora foram gerados.

**Pergunta:**
O botão "Ver Termo" no bloco LGPD abre o termo completo para o usuário aceitar diretamente no sistema (e registra `lgpd_consent = true` + data + IP), ou apenas exibe o texto para download/leitura? O consentimento pode ser dado depois de salvar o paciente?

**Resposta:** O botão "Ver Termo" abre uma modal com o texto completo da política/termo de consentimento LGPD para leitura do usuário. O consentimento em si (`lgpd_consent`) é um campo obrigatório de aceite no formulário de cadastro, registrando automaticamente a data e o IP no momento em que o paciente é salvo. Não é permitido salvar o cadastro sem o aceite prévio.

---

## Q-08 — Médicos: `design.md` e `tasks.md` ausentes

**Unit:** `medicos/`
**Arquivo:** (ausente)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** A unit `medicos/` possui `requirements.md` e `screens.md`, mas sem `design.md` e `tasks.md`. Falta especificar como os horários de atendimento do médico são usados pelo módulo Agendamentos para filtrar slots disponíveis.

**Pergunta:**
O sistema bloqueia automaticamente agendamentos fora do `working_hours` e dos `working_days` do médico, ou apenas exibe a informação sem validação?

**Resposta:** _(preencha aqui)_

---

## Q-09 — Templates: `design.md` e `tasks.md` ausentes

**Unit:** `templates/`
**Arquivo:** (ausente)
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** A unit `templates/` possui `requirements.md` e `screens.md`, mas sem `design.md` e `tasks.md`. As variáveis dinâmicas (`{PACIENTE_NOME}`, `{DATA}`, `{DIAS_AFASTAMENTO}`, etc.) estão listadas no `screens.md`, mas não há spec de como são substituídas na geração do documento.

**Pergunta:**
As variáveis do template são substituídas no momento em que o documento é **salvo** ou somente no momento em que é **impresso**? Há alguma variável que depende de input manual no momento da emissão (ex: `{DIAS_AFASTAMENTO}` precisa ser digitado pelo médico)?

**Resposta:** _(preencha aqui)_

---

## Q-10 — Logs de Acesso: `design.md` e `tasks.md` ausentes + lacuna de gatilho

**Unit:** `logs-acesso/`
**Arquivo:** (ausente) e `logs-acesso/requirements.md`
**Severidade:** 🔴 Crítico — bloqueia reimplementação
**Contexto:** Além dos canônicos ausentes, não há spec de **quem dispara** a criação de um log. A BR-L02 lista os tipos de ação, mas não documenta em quais eventos do sistema cada tipo é registrado (ex: Login → quando? ao carregar o dashboard? ao autenticar?). O `screens.md` mostra "Acesso ao dashboard" como Detalhe de um Login, sugerindo que o login registra a rota inicial — mas isso é inferência.

**Pergunta:**
Os logs são gravados por middleware automático (toda rota autenticada gera um log), ou são eventos manuais chamados explicitamente no código de cada módulo? Existe paginação na tela de logs, ou a tabela carrega todos os registros de uma vez?

**Resposta:** _(preencha aqui)_

---

## Q-11 — code-spec-matrix.md: dashboard não mapeado

**Arquivo:** `_reversa_sdd/code-spec-matrix.md`
**Severidade:** 🟡 Moderado
**Contexto:** A `code-spec-matrix.md` lista os módulos Pacientes, Consultas, Agendamentos, Médicos, Templates e Logs de Acesso — mas **não inclui o Dashboard**. Pelo `state.json`, o Archaeologist analisou o módulo `dashboard` e existe a pasta `_reversa_sdd/dashboard/`. A matrix está incompleta.

**Pergunta:**
Qual arquivo do legado corresponde ao Dashboard? (Provável: `src/pages/Dashboard.jsx` ou similar). Confirme para que a matrix possa ser atualizada.

**Resposta:** _(preencha aqui)_

---

## Q-12 — Permissões: contradição em Consultas vs. Pacientes

**Arquivo:** `consultas/requirements.md` (seção 4) e `pacientes/requirements.md` (seção 4)
**Severidade:** 🟡 Moderado
**Contexto:** Em Pacientes, Create é descrito como "Aberto para autenticados (`null`)" — enquanto em Consultas, Create é "Aberto para profissionais autenticados". A diferença de wording sugere que pode haver uma distinção de papel (`role`) para criação de consultas que não existe para pacientes, ou pode ser apenas inconsistência de texto.

**Pergunta:**
Qualquer usuário autenticado pode criar um paciente? Ou é necessário ser um "profissional de saúde" (papel específico)? O sistema distingue papel de "recepcionista" vs. "médico" além do papel `admin`?

**Resposta:** _(preencha aqui)_

---

## Q-13 — Modo Offline: intenção e plano de vida

**Unit:** `modo-offline/` (nova)
**Arquivos:** `src/api/mockClient.js`, `src/api/mockSeed.js`, diffs em `src/api/base44Client.js` e `src/lib/AuthContext.jsx`
**Severidade:** 🟡 Moderado
**Contexto:** Foi adicionado um modo offline (`VITE_OFFLINE=true`) que substitui o SDK Base44 real por um mock persistido em `localStorage`, com usuário fixo `demo@medrecord.local`. Não há documentação sobre o porquê desta adição, qual o público-alvo (demo, dev, QA, offline-real-de-pobre?) nem qual o plano de evolução.

**Pergunta:**
Qual é a finalidade do modo offline? Demos para stakeholders? Ambiente de dev sem credenciais Base44? Suporte a cenários sem internet? Plano de remover no futuro ou feature permanente?

**Resposta:** _(preencha aqui)_

---

## Q-14 — Modo Offline: postura LGPD no seed

**Unit:** `modo-offline/`
**Arquivos:** `src/api/mockSeed.js`
**Severidade:** 🔴 Crítico
**Contexto:** O seed inclui 5 pacientes com CPF, data de nascimento, telefone, email e status. Esses dados ficam gravados em `localStorage` no navegador de quem rodar `npm run dev` com `VITE_OFFLINE=true`. Não há termo de consentimento, não há anonimização, e os CPFs não são marcados como "fictícios". Em um dispositivo compartilhado, isso constitui vazamento de dados pessoais (mesmo que fictícios).

**Pergunta:**
Os CPFs e dados dos pacientes no seed são fictícios/claramente inventados, ou foram copiados de base real? Deve haver um aviso na UI quando o modo offline está ativo indicando que os dados ficam apenas locais? O seed deve ser anonimizado?

**Resposta:** _(preencha aqui)_

---

## Q-15 — Modo Offline: cobertura de operações

**Unit:** `modo-offline/`
**Arquivos:** `src/api/mockClient.js`
**Severidade:** 🟡 Moderado
**Contexto:** O mock implementa `list`, `filter`, `create`, `update`, `delete`, `UploadFile`, `auth.me/logout/redirectToLogin`, `appLogs.logUserInApp`. Faltam operações comuns do SDK Base44 que podem existir em alguma page e quebrar offline: `entities.<X>.get(id)`, `entities.<X>.bulkCreate/update`, `entities.<X>.count`, `integrations.Core.SendEmail`, `integrations.Core.InvokeLLM`, ou queries customizadas. Também não há suporte a filtros avançados (apenas `===`).

**Pergunta:**
O modo offline deve cobrir 100% das operações usadas pela app, ou apenas um subset é aceitável (com degradação consciente)? Há expectativa de cobrir upload de arquivos persistido?

**Resposta:** _(preencha aqui)_

---

## Q-16 — Autenticação: impacto do short-circuit

**Unit:** `autenticação/` (transversal; sem unit dedicada)
**Arquivos:** `src/lib/AuthContext.jsx`
**Severidade:** 🟡 Moderado
**Contexto:** Quando `VITE_OFFLINE=true`, o `checkAppState()` pula o fetch de `publicSettings` e a chamada `base44.auth.me()` — seta `OFFLINE_USER` direto e marca como autenticado. Isso significa que qualquer navegação/componente que dependa de `user.email`, `user.role`, `user.created_by_id` ou de `publicSettings` pode apresentar comportamento divergente do modo online. Hoje o `AccessLogger.jsx` faz `logAccess(LOGIN, ...)` com o email do usuário — em offline, todos os logs terão `user_email: 'demo@medrecord.local'`.

**Pergunta:**
Em offline, o `user_email` de todos os logs será `demo@medrecord.local`. Isso é aceitável para o uso pretendido, ou deve haver um modo de identificar a "sessão" (ex: user_id variável)? Algum componente depende de papéis (admin/medico/recepcionista) que podem quebrar offline?

**Resposta:** _(preencha aqui)_
