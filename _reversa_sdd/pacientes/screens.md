# Interface: Pacientes — MedRecord

## Tela: Listagem de Pacientes
Visualização e busca de pacientes cadastrados.

### Elementos de Interface
- **Busca e Filtros:**
  - Input: "Buscar por nome, CPF, telefone ou email...".
  - Dropdown: "Todos" (status).
  - Ícone de Filtro (funil).
- **Lista de Cards:**
  - Avatar do paciente (ou inicial).
  - Nome, Status (Ativo), Idade, Telefone e Email.
  - Convênio e Tipo Sanguíneo.
  - Botão de ação (seta) para ver detalhes.
- **Header:** Contador de "6 pacientes cadastrados" e botão "+ Novo Paciente".

## Tela: Cadastro de Novo Paciente
Formulário dividido em seções para novo prontuário.

### Formulário
- **Dados Pessoais:** Nome Completo, CPF, Data de Nascimento, Gênero, Tipo Sanguíneo, Foto.
- **Contato:** Telefone, Email, Endereço, Contato/Telefone de Emergência.
- **Convênio:** Nome do Convênio, Número da Carteirinha.
- **Informações Médicas:** Alergias, Condições Crônicas, Medicamentos em Uso Contínuo, Observações Gerais.
- **LGPD:** Aviso de "Consentimento LGPD pendente" com botão "Ver Termo".
- **Ações:** Botão "Cancelar" e "Salvar Paciente".

---
*Gerado pelo Reversa-Writer em 2026-09-02.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `pacientes/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **4** (listagem, cadastro, edição e detalhe do paciente).

### Tela: Listagem de Pacientes — `screenshots/tela_pacientes.png`

- **Propósito**: localizar um paciente e abrir seu prontuário; ponto de partida do fluxo clínico. 🟢
- **Estado da tela**: `preenchido` — 6 pacientes listados, nenhum estado vazio visível. 🟢
- **Contexto de uso**: item "Pacientes" do menu superior (ativo na captura); também alcançável pela ação rápida "Lista de Pacientes" do Dashboard. 🟢
- **Captura**: 1443×1030 px. 🟢

**Cabeçalho da página**: seta **"←"** de voltar; título **"Pacientes"**; subtítulo dinâmico **"6 pacientes cadastrados"**; botão primário **"+ Novo Paciente"** à direita. 🟢

**Busca e filtro**
- Input de busca com lupa e placeholder **"Buscar por nome, CPF, telefone ou email..."**. 🟢
- Seletor à direita com ícone de funil e valor **"Todos"** (filtro de status). 🟢

**Lista de cards** (uma linha por paciente; avatar circular à esquerda, nome + selo de status, linha de metadados com ícones, dados do convênio à direita e chevron de navegação):

| # | Nome | Status | Idade | Telefone | Email | Convênio | Tipo sanguíneo |
|---|---|---|---|---|---|---|---|
| 1 | Neide Ferreira | ativo | 30 anos | (79) 99917-9068 | neide.ferreira@hotmail.com | Unimed | O+ |
| 2 | Adriano Santos | ativo | 49 anos | (79) 99896-0414 | adrianosantos.git@gmail.com | Particular | O+ |
| 3 | Roberto Santos | ativo | 49 anos | (79) 99896-1414 | aju@gmail.com | Unimed | A- |
| 4 | Ana Paula Ferreira | ativo | 33 anos | (11) 95432-1098 | ana.ferreira@email.com | SulAmérica | B+ |
| 5 | Carlos Eduardo Oliveira | ativo | 48 anos | (11) 97654-3210 | carlos.oliveira@email.com | Bradesco Saúde | O+ |
| 6 | Maria Silva Santos | ativo | 41 anos | (11) 99876-5432 | maria.santos@email.com | Unimed | A+ |

🟢 *(todos os valores acima são legíveis na imagem; o primeiro e o quinto avatar são fotos, os demais são iniciais em círculo colorido)*

- **Selo de status**: pílula verde-clara com o texto **"ativo"**, minúsculo. 🟢
- **Tipo sanguíneo**: badge retangular verde-água com o tipo (`O+`, `A-`, `B+`, `A+`). 🟢
- **Ação de linha**: chevron **">"** no extremo direito, levando ao detalhe do paciente. 🟢

**Lacunas desta tela**: 🔴 comportamento do filtro "Todos" (quais opções existem além dele); 🔴 estado vazio da listagem; 🔴 comportamento de ordenação das colunas (não há indício visual de coluna ordenável na captura).

### Tela: Cadastro de Novo Paciente — `screenshots/tela_novos_pacientes.png`

- **Propósito**: preencher a ficha completa do paciente e criar o prontuário. 🟢
- **Estado da tela**: `vazio` — formulário em branco, exceto o tipo sanguíneo, que já vem com o valor **"desconhecido"**. 🟢
- **Contexto de uso**: botão **"+ Novo Paciente"** da listagem ou do Dashboard. 🟢
- **Captura**: 1443×1788 px (página longa, rolada até o fim). 🟢

**Cabeçalho**: link **"← Voltar"**; título **"Novo Paciente"**; subtítulo **"Preencha a ficha completa do paciente"**. 🟢

**Formulário em quatro seções**, cada uma com ícone próprio no título:

1. **Dados Pessoais** (ícone de pessoa, azul) — avatar circular com ícone de câmera e legenda **"Clique para adicionar foto"**; campos: **Nome Completo** \* (placeholder "Nome completo do paciente"), **CPF** \* (placeholder "000.000.000-00"), **Data de Nascimento** \* (placeholder "dd/mm/aaaa", com ícone de calendário), **Gênero** (select, valor "Selecione..."), **Tipo Sanguíneo** (select, valor inicial "desconhecido"). 🟢
2. **Contato** (ícone de telefone, verde) — **Telefone** \* (placeholder "(00) 00000-0000"), **Email** (placeholder "email@exemplo.com"), **Endereço** (placeholder "Rua, número, bairro, cidade - UF"), **Contato de Emergência** (placeholder "Nome do contato"), **Telefone de Emergência** (placeholder "(00) 00000-0000"). 🟢
3. **Convênio** (ícone de escudo, azul) — **Convênio Médico** (placeholder "Nome do convênio"), **Número da Carteirinha** (placeholder "Número do plano"). 🟢
4. **Informações Médicas** (ícone de coração, rosa) — quatro áreas de texto: **Alergias** ("Liste todas as alergias conhecidas..."), **Condições Crônicas** ("Diabetes, hipertensão, etc..."), **Medicamentos em Uso Contínuo** ("Liste os medicamentos de uso contínuo..."), **Observações Gerais** ("Outras informações relevantes..."). 🟢

> **Asterisco (\*)** marca os campos obrigatórios: Nome Completo, CPF, Data de Nascimento, Telefone. 🟢

**Feedback e conformidade**
- Caixa de aviso âmbar-clara, com ícone de relógio: **"Consentimento LGPD pendente"** e, abaixo, **"O termo de consentimento será enviado ao salvar."**; botão de contorno **"Ver Termo"** à direita. 🟢
- **Ações**: **"Cancelar"** (secundário) e **"Salvar Paciente"** (primário, verde-água, com ícone de disquete). 🟢

**Lacunas desta tela**: 🔴 opções do select de Gênero; 🔴 opções do select de Tipo Sanguíneo; 🔴 validações inline (nenhuma mensagem de erro visível no estado em branco); 🔴 comportamento do botão "Ver Termo".

### Tela: Editar Paciente — `screenshots/tela_editar_paciente.png`

- **Propósito**: atualizar os dados cadastrais de um paciente existente. 🟢
- **Estado da tela**: `preenchido` — mesma estrutura do cadastro, com os dados de **Neide Ferreira** já carregados e a foto exibida no avatar. 🟢
- **Contexto de uso**: botão **"Editar"** do detalhe do paciente. 🟢
- **Captura**: 1443×1686 px. 🟢

**Cabeçalho**: **"← Voltar"**; título **"Editar Paciente"**; subtítulo **"Atualize os dados do paciente"**. 🟢

**Valores carregados na captura** (úteis como massa de teste de paridade):

| Campo | Valor |
|---|---|
| Nome Completo | Neide Ferreira |
| CPF | 853.497-555-55 🟡 *(máscara com agrupamento atípico na imagem — conferir na fonte)* |
| Data de Nascimento | 01/01/1976 |
| Gênero | Feminino |
| Tipo Sanguíneo | O+ |
| Telefone | (79) 99917-9999 |
| Email | neidefs@hotmail.com |
| Endereço | Rua Luiz Augusto Barroso da Silva Pereira |
| Contato de Emergência / Telefone | em branco (placeholders) |
| Convênio Médico | Unimed |
| Número da Carteirinha | 7546 |
| Alergias | Não |
| Condições Crônicas | Diabetes |
| Medicamentos em Uso Contínuo | Plazol |
| Observações Gerais | em branco (placeholder) |

**Divergência relevante**: a caixa **"Consentimento LGPD pendente"** **não aparece** na tela de edição — coerente com o texto do cadastro ("será enviado ao salvar"). 🟢
**Ações**: **"Cancelar"** e **"Salvar Paciente"** (primário, com ícone). 🟢

### Tela: Detalhe do Paciente (Informações + Histórico) — `screenshots/tela_informacoes_paciente.png`

- **Propósito**: visão consolidada do prontuário — dados cadastrais, alertas clínicos, histórico cronológico e atalhos para agendar/atender. É a tela de onde partem as ações clínicas. 🟢
- **Estado da tela**: `preenchido` — histórico com 6 agendamentos, aba "Agendamentos" ativa. 🟢
- **Contexto de uso**: chevron **">"** de qualquer linha da listagem de Pacientes. 🟢
- **Captura**: 1443×1044 px. 🟢
- **Observação de inventário**: esta tela é o `PatientDetail` — já registrado como a entrada extra do inventário do Screen Translator, **ausente** de `_reversa_sdd/ui/inventory.md`. 🟢

**Cabeçalho**: seta **"←"**; avatar com foto; nome **"Neide Ferreira"**; três selos abaixo do nome — **"ativo"** (verde), **"O+"** (contorno), **"LGPD"** (contorno, com ícone de check). À direita: botão **"Editar"** (contorno, com ícone de lápis) e botão de ícone de lixeira em vermelho. 🟢

**Card esquerdo — "Informações do Paciente"** (cada linha com ícone e rótulo):
- **Idade**: "50 anos (31/12/1975)"
- **Telefone**: "(79) 99917-9999"
- **Email**: "neidefs@hotmail.com"
- **Endereço**: "Rua Luiz Augusto Barroso da Silva Pereira"
- **Convênio**: "Unimed" / "Carteirinha: 7546"
- **Alergias**: "Não"
- **Condições Crônicas**: "Diabetes"
- **Medicamentos em Uso**: "Plazol"
🟢 *(todos os valores legíveis)*

**Ações do card esquerdo**, na ordem: **"Agendar Consulta"** (primário, largura total, ícone de calendário), **"Nova Consulta"** (contorno, largura total, ícone de estetoscópio), e dois botões lado a lado — **"Receita"** (ícone de documento) e **"Exame"** (ícone de upload). 🟢

**Card direito — "Histórico"** (ícone de relógio):
- Abas com contadores: **Todos**, **Agendamentos (6)** *(ativa)*, **Consultas (0)**, **Documentos (0)**, **Exames (0)**. 🟢
- Linha do tempo vertical com marcadores circulares; cada item traz ícone de calendário, título **"Agendamento"**, data e hora, e selo de status:

  | Data/hora | Selo |
  |---|---|
  | 17/09/2026 às 14:30 | agendado (âmbar) |
  | 17/09/2026 às 14:30 | agendado (âmbar) |
  | 12/01/2026 às 13:00 | agendado (âmbar) |
  | 12/01/2026 às 13:00 | agendado (âmbar) |
  | 09/01/2026 às 14:30 | confirmado (azul) |
  | 09/01/2026 às 14:30 | confirmado (azul) |

  🟢 *(datas, horas e selos legíveis)*

**Lacunas desta tela**: 🔴 efeito do botão de lixeira (exclusão? confirmação?); 🔴 conteúdo das abas "Consultas", "Documentos" e "Exames" nos respectivos estados vazios; 🔴 escopo das ações "Receita" e "Exame" (abrem modal ou navegam?).

### Divergências entre capturas (a validar com o humano)

| # | Divergência | Evidência | Veredito |
|---|---|---|---|
| D1 | Dados da mesma paciente divergem entre a listagem e o detalhe: idade **30 anos** × **50 anos**, telefone **(79) 99917-9068** × **(79) 99917-9999**, email **neide.ferreira@hotmail.com** × **neidefs@hotmail.com** | `tela_pacientes.png` × `tela_informacoes_paciente.png` | 🔴 as capturas não vêm do mesmo estado de dados — não usar as duas como oráculo cruzado sem antes fixar a massa |
| D2 | Data de nascimento no detalhe é **31/12/1975** e na edição é **01/01/1976**, ambas resultando em 50 anos | `tela_informacoes_paciente.png` × `tela_editar_paciente.png` | 🟡 divergência de massa, não de layout |
| D3 | A tela de detalhe não consta de `_reversa_sdd/ui/inventory.md` (15 telas catalogadas, sem `PatientDetail`) | `_reversa_sdd/ui/inventory.md` × arquivo de captura | 🟢 confirmado — o inventário global precisa desta entrada |
| D4 | CPF exibido como "853.497-555-55" (agrupamento 3-3-2-2) | `tela_editar_paciente.png` | 🟡 conferir máscara aplicada na fonte |

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir das 4 capturas em `pacientes/screenshots/`.*
