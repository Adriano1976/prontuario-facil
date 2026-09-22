# Inventário de Telas — MedRecord

Mapeamento global de telas identificadas via screenshots e análise de código.

| Tela | Unit | Propósito | Status |
| :--- | :--- | :--- | :--- |
| Dashboard Principal | `dashboard` | Visão geral do consultório, KPIs e atalhos. | 🟢 Documentado |
| Listagem de Pacientes | `pacientes` | Lista de pacientes cadastrados com busca e filtros. | 🟢 Documentado |
| Cadastro de Novo Paciente | `pacientes` | Formulário completo de prontuário e dados pessoais. | 🟢 Documentado |
| Calendário de Agendamentos | `agendamentos` | Grade semanal de horários com controle de consultas. | 🟢 Documentado |
| Novo Agendamento | `agendamentos` | Agendamento de uma consulta vinculando paciente e médico. | 🟢 Documentado |
| Listagem de Consultas | `consultas` | Histórico e lista de consultas com seus respectivos status. | 🟢 Documentado |
| Novo Atendimento (Anamnese) | `consultas` | Registro clínico detalhado (sinais vitais, anamnese, conduta). | 🟢 Documentado |
| Visualização de Consulta | `consultas` | Detalhes consolidados de uma consulta já realizada ou em andamento. | 🟢 Documentado |
| Modal: Novo Documento | `consultas` | Emissão de Receitas, Atestados e outros documentos clínicos. | 🟢 Documentado |
| Modal: Upload de Exame | `consultas` | Anexação de exames laboratoriais ou de imagem ao prontuário. | 🟢 Documentado |
| Gerenciamento de Médicos | `medicos` | Painel de cadastro, especialidades e escalas dos profissionais. | 🟢 Documentado |
| Modal: Novo Médico | `medicos` | Cadastro de perfil médico com grade e tempo de consulta. | 🟢 Documentado |
| Central de Templates | `templates` | Modelos de documentos editáveis categorizados por tipo. | 🟢 Documentado |
| Modal: Criar / Editar Template | `templates` | Editor de modelo de documento com injeção de variáveis dinâmicas. | 🟢 Documentado |
| Logs de Acesso | `logs-acesso` | Trilha de auditoria e conformidade LGPD para acesso aos prontuários. | 🟢 Documentado |

---
*Gerado pelo Reversa-Visor em 2026-08-28.*

---

## Atualização de 2026-09-22 — inventário revisado sobre as capturas

> Segunda passada do Visor, agora com as **21 capturas** fornecidas pelo usuário em `<unit>/screenshots/`.
> A tabela acima foi preservada (non-destructive); esta é a versão revisada, com as telas que as imagens revelaram e a evidência de cada uma.
> Total: **22 telas distintas** (21 com captura + 1 sem captura).

| # | Tela | Unit | Propósito | Captura | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Dashboard Principal | `dashboard` | Visão geral do consultório, KPIs e atalhos. | `dashboard/screenshots/tela_dashboard.png` | 🟢 Documentado |
| 2 | Listagem de Pacientes | `pacientes` | Lista de pacientes cadastrados com busca e filtros. | `pacientes/screenshots/tela_pacientes.png` | 🟢 Documentado |
| 3 | Cadastro de Novo Paciente | `pacientes` | Formulário completo de prontuário e dados pessoais. | `pacientes/screenshots/tela_novos_pacientes.png` | 🟢 Documentado |
| 4 | **Editar Paciente** | `pacientes` | Atualização dos dados cadastrais de um paciente. | `pacientes/screenshots/tela_editar_paciente.png` | 🟢 Documentado *(novo)* |
| 5 | **Detalhe do Paciente (Informações + Histórico)** | `pacientes` | Prontuário consolidado: dados, alertas clínicos, histórico e atalhos de atendimento. | `pacientes/screenshots/tela_informacoes_paciente.png` | 🟢 Documentado *(novo — ausente da tabela anterior)* |
| 6 | Calendário de Agendamentos | `agendamentos` | Grade semanal de horários com controle de consultas. | `agendamentos/screenshots/tela_agendamentos_calendario.png` | 🟢 Documentado |
| 7 | **Lista de Agendamentos** | `agendamentos` | Mesma agenda em formato de lista ordenada. | `agendamentos/screenshots/tela_agendamentos_lista.png` | 🟢 Documentado *(novo)* |
| 8 | Novo Agendamento | `agendamentos` | Agendamento de uma consulta vinculando paciente e médico. | `agendamentos/screenshots/tela_novo_agendamento.png` | 🟡 Documentado com divergência (sem campo de data/hora) |
| 9 | **Detalhes do Agendamento (modal)** | `agendamentos` | Consulta e alteração de status de um agendamento na própria agenda. | `agendamentos/screenshots/tela_detalhe_agendamento.png` | 🟢 Documentado *(novo)* |
| 10 | Listagem de Consultas | `consultas` | Histórico e lista de consultas com seus respectivos status. | `consultas/screenshots/tela_consultas.png` | 🟢 Documentado |
| 11 | Novo Atendimento (Anamnese) | `consultas` | Registro clínico detalhado (sinais vitais, anamnese, conduta). | `consultas/screenshots/tela_nova_consulta.png` | 🟢 Documentado |
| 12 | **Editar Consulta** | `consultas` | Correção de um atendimento já registrado. | `consultas/screenshots/tela_edita_consulta.png` | 🟢 Documentado *(novo)* |
| 13 | Visualização de Consulta | `consultas` | Detalhes consolidados de uma consulta, com documentos emitidos. | `consultas/screenshots/tela_consulta_paciente.png` | 🟢 Documentado |
| 14 | Modal: Novo Documento | `consultas` | Emissão de Receitas, Atestados e outros documentos clínicos. | `consultas/screenshots/tela_consulta_novo_documento.png` | 🟢 Documentado |
| 15 | Modal: Upload de Exame | `consultas` | Anexação de exames laboratoriais ou de imagem ao prontuário. | **sem captura** | 🔴 Lacuna de captura |
| 16 | Gerenciamento de Médicos | `medicos` | Painel de cadastro, especialidades e escalas dos profissionais. | `medicos/screenshots/tela_medicos.png` | 🟢 Documentado |
| 17 | Modal: Novo Médico | `medicos` | Cadastro de perfil médico com grade e tempo de consulta. | `medicos/screenshots/tela_novo_medico.png` | 🟢 Documentado |
| 18 | **Modal: Editar Médico** | `medicos` | Edição de perfil, escala e horários do profissional. | `medicos/screenshots/tela_editar_medico.png` | 🟢 Documentado *(novo)* |
| 19 | Central de Templates | `templates` | Modelos de documentos editáveis categorizados por tipo. | `templates/screenshots/tela_templates.png` | 🟢 Documentado |
| 20 | Modal: Criar Template | `templates` | Criação de modelo com variáveis dinâmicas. | `templates/screenshots/tela_novo_templates.png` | 🟡 Captura parcial (cortada antes dos toggles e ações) |
| 21 | **Modal: Editar Template** | `templates` | Edição de modelo com variáveis dinâmicas. | `templates/screenshots/tela_editar_template.png` | 🟢 Documentado *(novo)* |
| 22 | Logs de Acesso | `logs-acesso` | Trilha de auditoria e conformidade LGPD para acesso aos prontuários. | `logs-acesso/screenshots/tela_logs_acesso.png` | 🟢 Documentado |

**Telas novas reveladas pelas capturas** (não constavam do inventário de 2026-08-28): Editar Paciente, Detalhe do Paciente, Lista de Agendamentos, Detalhes do Agendamento (modal), Editar Consulta, Editar Médico, Editar Template — **7 entradas**.

**Cobertura do inventário**: 21 de 22 telas com imagem (95%). A única tela sem captura é o **Modal: Upload de Exame** (`consultas`), que permanece documentado apenas por análise de código.

**Lacunas de captura que afetam paridade visual**: `Modal: Upload de Exame` (ausente) e `Modal: Criar Template` (parcial). Se a paridade visual dessas duas for exigida, é preciso nova captura.

**Divergências relevantes registradas nas units** (detalhe em cada `<unit>/screens.md`): ausência de campo de data/hora no Novo Agendamento; cores de status divergentes na legenda do calendário; massas de dados diferentes entre capturas da mesma paciente; uso de **roxo** como cor de destaque em `medicos` e `templates`, contra verde-água nas demais units.

---
*Inventário revisado pelo Reversa-Visor em 2026-09-22 a partir de 21 capturas.*

---

## Atualização de 2026-09-22 (pós-captura) — as 22 telas têm imagem

> Correção factual da tabela revisada acima, após o usuário entregar as duas últimas capturas às 12:30 e 12:32.

- A linha **15 — Modal: Upload de Exame** deixa de ser `🔴 Lacuna de captura` e passa a **🟢 Documentado**, com **duas** imagens:
  - `consultas/screenshots/tela_consulta_upload_exame.png` (golden principal — dropzone vazio)
  - `consultas/screenshots/tela_consulta_upload_exame_imagem.png` (estado alternativo — arquivo anexado, link "× Remover")
- **Cobertura passa de 21 de 22 para 22 de 22 telas com imagem (100%)**, contando o estado alternativo como 23 arquivos.
- **Gatilho corrigido pela imagem**: o modal abre sobre o **Detalhe do Paciente**, pelo botão "Exame" — e não sobre a tela de Consulta, como o Visor havia registrado. O botão homônimo existe nos dois lugares.
- Resta como lacuna **parcial** apenas o **Modal: Criar Template** (`tela_novo_templates.png`), truncado antes dos toggles "Template padrão"/"Ativo" e dos botões. O dialog completo está em `tela_editar_template.png`.
- Consequência para a migração: os 16 cenários de paridade visual (`PT-V01`…`PT-V16`) passaram a ter **captura dourada de referência**, encerrando a lacuna declarada desde 2026-09-09 (`present: false` em todas as telas do manifest). Ver `_reversa_sdd/screens/golden/manifest.yaml` e `_reversa_sdd/migration/screen_deviation_log.md`.

---
*Correção registrada pelo Reversa-Visor em 2026-09-22, ao fim da regeneração da Fase 2 do Screen Translator.*
