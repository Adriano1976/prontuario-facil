# Interface: Médicos — MedRecord

## Tela: Gerenciamento de Médicos
Painel de visualização das equipes médicas, especialidades e horários de atendimento.

### Elementos de Interface
- **Cards de Médicos:**
  - Avatar / Inicial em destaque com ícone D.
  - Nome do Médico (ex: Dr. Thiago, Dr. João Silva, Dra. Maria Santos).
  - Especialidade (ex: Ultrassonografia, Clínico Geral, Cardiologista).
  - CRM com UF (ex: CRM: 1875, CRM: 12345-SP, CRM: 67890-SP).
  - Status em badge (ex: `Ativo` em verde).
  - Intervalo de Horário de Atendimento (ex: 14:00 - 18:00).
  - Badges com dias da semana em que atende (ex: Segunda, Quinta, Sexta).
  - Botões de ação por card: "Editar" (lápis) e "Excluir" (lixeira vermelha).
- **Header:** Botão "+ Novo Médico" destacado em roxo.

## Tela: Modal: Novo Médico
Modal para cadastro e edição de cadastro e escala de profissionais de saúde.

### Formulário
- **Dados Básicos:**
  - Nome Completo (Input text, obrigatório com `*`).
  - Especialidade (Input text, obrigatório com `*`).
  - CRM (Input text, obrigatório com `*`).
  - Email (Input email).
  - Telefone (Input tel).
- **Escala e Dias de Atendimento:**
  - Checkboxes para dias da semana: Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado.
  - Horário Início (Input time, ex: 08:00).
  - Horário Fim (Input time, ex: 18:00).
  - Duração (min) (Input number, tempo médio da consulta em minutos, ex: 30).
  - Switch Toggle: "Médico ativo" (ativado/desativado).
- **Ações:** Botão "Cancelar" e "Salvar" (em destaque roxo).

---
*Gerado pelo Reversa-Visor em 2026-08-27.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `medicos/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **3** (listagem, modal de novo médico e modal de edição).

### Tela: Gerenciamento de Médicos — `screenshots/tela_medicos.png`

- **Propósito**: ver a equipe, suas especialidades, escalas e horários; criar, editar ou excluir profissionais. 🟢
- **Estado da tela**: `preenchido` — 3 médicos, todos com selo "Ativo". 🟢
- **Contexto de uso**: item "Médicos" do menu (ativo na captura). 🟢
- **Captura**: 1443×762 px. 🟢

**Cabeçalho**: seta **"←"**; ícone de grupo de pessoas (roxo); título **"Médicos"**; subtítulo **"Gerencie médicos e agendas"** — ⚠️ **sem contador de registros**, ao contrário de Pacientes ("6 pacientes cadastrados") e Consultas ("3 consultas encontradas"). Botão primário **"+ Novo Médico"** à direita. 🟢

**Grade de cards** (duas colunas; o terceiro card ocupa a primeira coluna da segunda linha):

| # | Nome | Especialidade | CRM | Status | Horário | Dias de atendimento |
|---|---|---|---|---|---|---|
| 1 | Dr. Thiago | Ultrassonografia | CRM: 1875 | Ativo | 14:00 - 18:00 | Segunda, Quinta, Sexta |
| 2 | Dr. João Silva | Clínico Geral | CRM: 12345-SP | Ativo | 08:00 - 11:00 | Segunda, Terça, Quarta, Sexta |
| 3 | Dra. Maria Santos | Cardiologista | CRM: 67890-SP | Ativo | 13:00 - 17:00 | Segunda, Quarta, Sexta |

🟢 *(todos os valores legíveis)*

- **Anatomia do card**: avatar circular (roxo) com a inicial do nome; nome em destaque; especialidade; CRM em cinza; selo **"Ativo"** (verde-claro) no canto superior direito; linha de **horário** com ícone de relógio; **chips** dos dias da semana; e dois botões de ação — **"Editar"** (contorno, ícone de lápis) e **excluir** (contorno, ícone de lixeira em vermelho). 🟢
- **Lacunas**: 🔴 efeito da lixeira (há confirmação?); 🔴 estado vazio da lista; 🔴 o que acontece com a agenda de um médico inativado; 🔴 se a grade é paginada com muitos médicos.

### Tela: Modal "Novo Médico" — `screenshots/tela_novo_medico.png`

- **Propósito**: cadastrar um profissional e definir sua escala de atendimento. 🟢
- **Estado da tela**: `modal-aberto` sobre a listagem (fundo escurecido), formulário `vazio` exceto a escala, que já vem pré-preenchida. 🟢
- **Contexto de uso**: botão **"+ Novo Médico"**. 🟢
- **Captura**: 1314×602 px. 🟢

**Conteúdo**
- Título **"Novo Médico"**; botão **"×"** de fechar. 🟢
- **Nome Completo** \* — input de largura total. 🟢
- **Especialidade** \* e **CRM** \* — dois campos lado a lado. 🟢
- **Email** e **Telefone** — dois campos lado a lado. 🟢
- **"Dias de Atendimento"** — sete checkboxes: **Domingo** (desmarcado), **Segunda**, **Terça**, **Quarta**, **Quinta**, **Sexta** (marcados) e **Sábado** (desmarcado). 🟢
- **Horário Início** — campo de hora com valor **08:00** e ícone de relógio. **Horário Fim** — **18:00**, também com ícone. **Duração (min)** — campo numérico com valor **30**. 🟢
- **Toggle "Médico ativo"** — ligado (roxo). 🟢
- **Ações**: **"Cancelar"** (contorno) e **"Salvar"** (primário, **roxo**, ícone de disquete). 🟢

**Lacunas**: 🔴 valores possíveis de Especialidade (é texto livre? a listagem mostra três especialidades distintas); 🔴 formato aceito no CRM (na listagem aparece "1875" sem UF e "12345-SP" com UF); 🔴 validação de Horário Fim anterior ao Início.

### Tela: Modal "Editar Médico" — `screenshots/tela_editar_medico.png`

- **Propósito**: atualizar dados e escala de um profissional existente. 🟢
- **Estado da tela**: `preenchido` com os dados do **Dr. Thiago**. 🟢
- **Contexto de uso**: botão **"Editar"** do card. 🟢
- **Captura**: 1314×602 px. 🟢

**Valores carregados** (coerentes com o card correspondente da listagem):

| Campo | Valor |
|---|---|
| Nome Completo | Dr. Thiago |
| Especialidade | Ultrassonografia |
| CRM | 1875 |
| Email | tiago@gmail.com |
| Telefone | 79998962514 |
| Dias de Atendimento | Segunda, Quinta e Sexta **marcados**; Domingo, Terça, Quarta e Sábado desmarcados |
| Horário Início | 14:00 |
| Horário Fim | 18:00 |
| Duração (min) | 30 |
| Médico ativo | ligado |

🟢 *(todos os valores legíveis)*
**Ações**: **"Cancelar"** e **"Salvar"** (roxo). 🟢

### Divergências (a validar com o humano)

| # | Divergência | Evidência | Veredito |
|---|---|---|---|
| D1 | Esta unit usa **roxo** como cor de destaque (ícone do título, avatares, botão primário, botão Salvar, toggle), enquanto Pacientes/Agendamentos/Consultas usam verde-água | `tela_medicos.png`, `tela_novo_medico.png` × capturas das outras units | 🟡 conferir se existe token de "roxo" no design system — se não, é candidato a `tokens-derived.md` |
| D2 | CRM aparece sem UF em um registro ("1875") e com UF em dois ("12345-SP", "67890-SP") | `tela_medicos.png` | 🟢 inconsistência de massa/formato no legado — preservar em modo literal |
| D3 | Telefone exibido sem máscara ("79998962514"), ao contrário do padrão "(79) 99917-9068" usado em Pacientes | `tela_editar_medico.png` × `_reversa_sdd/pacientes/screenshots/tela_pacientes.png` | 🟢 divergência de formatação entre telas do mesmo sistema |
| D4 | A listagem de Médicos não exibe contador de registros, diferentemente das outras listagens | `tela_medicos.png` | 🟢 confirmado |

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir das 3 capturas em `medicos/screenshots/`.*
