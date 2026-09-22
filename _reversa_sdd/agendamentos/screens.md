# Interface: Agendamentos — MedRecord

## Tela: Calendário de Agendamentos
Grade de visualização e controle semanal de horários médicos.

### Elementos de Interface
- **Seletor de Modo:** Alternador entre modo "Calendário" e "Lista".
- **Visualização Temporal (Calendário Semanal):**
  - Exibe a semana do mês (ex: "agosto de 2026").
  - Colunas para os dias da semana (Domingo 23 a Sábado 29).
  - O dia atual (quinta-feira 27) é destacado em azul.
  - Linhas de horários das 8:00 às 19:00.
  - Navegadores temporais (`<`, `Hoje`, `>`).
- **Legenda de Status (Rodapé):**
  - `Agendado` (Amarelo claro)
  - `Confirmado` (Azul claro)
  - `Em Atendimento` (Roxo claro)
  - `Concluido` (Verde claro)
  - `Cancelado` (Cinza claro)
  - `Faltou` (Vermelho claro)
- **Header:** Contador de "0 agendamentos próximos" e botão "+ Novo Agendamento".

## Tela: Novo Agendamento
Formulário para reservar um horário e vincular paciente e profissional de saúde.

### Formulário
- **Paciente e Médico:**
  - Paciente (Dropdown para seleção, obrigatório com `*`).
  - Médico (Dropdown para seleção, obrigatório com `*`).
- **Data e Horário:**
  - Widget de Calendário interativo (Date Picker embutido com navegação de mês/ano e grade de dias para escolha da data da consulta).
- **Detalhes:**
  - Tipo de Consulta (Dropdown com opções como "Primeira Consulta", etc.).
  - Observações (Textarea para texto livre com placeholder "Observações sobre o agendamento...").
- **Ações:**
  - Botão "Cancelar".
  - Botão "Confirmar Agendamento" (ícone de salvar/documento + texto).

---
*Gerado pelo Reversa-Visor em 2026-08-27.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `agendamentos/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **4** (calendário, lista, novo agendamento e detalhe em modal).

### Tela: Calendário de Agendamentos — `screenshots/tela_agendamentos_calendario.png`

- **Propósito**: visualizar a agenda semanal, identificar horários livres e abrir/confirmar agendamentos na grade. 🟢
- **Estado da tela**: `preenchido` — semana de 20 a 26 de setembro de 2026, com eventos em dois dias. 🟢
- **Contexto de uso**: item "Agendamentos" do menu (ativo na captura). 🟢
- **Captura**: 1443×1560 px. 🟢

**Cabeçalho da página**: seta **"←"**; ícone de calendário; título **"Agendamentos"**; subtítulo dinâmico **"7 agendamentos próximos"**; botão primário **"+ Novo Agendamento"**. 🟢

**Seletor de modo**: dois botões-aba — **"Calendário"** (ativo, com moldura) e **"Lista"** (inativo). 🟢

**Grade semanal**
- Cabeçalho do card: ícone de calendário + **"setembro de 2026"**; controles à direita: **"‹"** (semana anterior), **"Hoje"**, **"›"** (próxima semana). 🟢
- Coluna fixa de horários: **"Horário"** e linhas de hora cheia de **8:00 a 19:00** (12 linhas). 🟢
- Colunas de dia, na ordem: **domingo 20, segunda 21, terça 22, quarta 23, quinta 24, sexta 25, sábado 26**. 🟢
- **Eventos visíveis**:

  | Dia | Hora | Paciente | Profissional | Duração | Cor do cartão |
  |---|---|---|---|---|---|
  | quarta 23 | 8:00 | Adriano Santos | Dr. João Silva | 30min | âmbar |
  | sexta 25 | 13:00 | Neide Ferreira | Dra. Maria Santos | 45min | âmbar |
  | sexta 25 | 14:00 | Neide Ferreira | Dra. Maria Santos | 45min | azul |
  | sexta 25 | 15:00 | Neide Ferreira | Dra. Maria Santos | 45min | âmbar e azul *(dois cartões sobrepostos)* |
  | sexta 25 | 16:00 | Neide Ferreira | Dra. Maria Santos | 45min | azul |

  🟢 *(nomes, profissional, duração e horários)* / 🟡 *(a faixa de 15:00 tem dois cartões lado a lado — a ordem e a hora exata de cada um precisa de conferência; a linha de horário de cada cartão é pequena na captura)*
- Cada cartão traz três linhas: **nome do paciente**, **nome do profissional** e **duração** (com ícone de relógio). 🟢
- **Legenda no rodapé do card**, com marcador circular colorido: **Agendado** (âmbar), **Confirmado** (azul), **Em Atendimento** (verde), **Concluído** (cinza-esverdeado), **Cancelado** (cinza), **Faltou** (vermelho-rosado). 🟡 *(a cor de "Concluído" tem baixo contraste nesta captura)*
- ⚠️ **Nenhum dia aparece destacado como "hoje"** na imagem (a captura é de 22/09/2026, uma terça-feira) — o destaque de dia atual descrito na seção anterior **não é observável** aqui.

### Tela: Lista de Agendamentos — `screenshots/tela_agendamentos_lista.png`

- **Propósito**: mesma agenda do calendário, em formato de lista ordenada — leitura rápida de quem tem consulta e quando. 🟢
- **Estado da tela**: `preenchido` — 7 agendamentos. 🟢
- **Contexto de uso**: aba **"Lista"** do seletor de modo. 🟢
- **Captura**: 1443×1106 px. 🟢

**Estrutura das linhas**: avatar circular com inicial, **nome do paciente**, **profissional + especialidade**, **data e hora**, e selo de status à direita.

| # | Paciente | Profissional | Data e hora | Status |
|---|---|---|---|---|
| 1 | Ana Paula Ferreira | Dra. Maria Santos - Cardiologista | 30/09/2026 às 16:45 | Agendado |
| 2 | Ana Paula Ferreira | Dra. Maria Santos - Cardiologista | 30/09/2026 às 16:45 | Agendado |
| 3 | Neide Ferreira | Dra. Maria Santos - Cardiologista | 25/09/2026 às 15:15 | Agendado |
| 4 | Neide Ferreira | Dra. Maria Santos - Cardiologista | 25/09/2026 às 14:30 | Confirmado |
| 5 | Neide Ferreira | Dra. Maria Santos - Cardiologista | 20/09/2026 às 14:30 | Agendado |
| 6 | Neide Ferreira | Dra. Maria Santos - Cardiologista | 25/09/2026 às 13:45 | Agendado |
| 7 | Adriano Santos | Dr. João Silva - Clínico Geral | 23/09/2026 às 08:30 | Agendado |

🟢 *(todos os valores legíveis)*

- **Selo "Agendado"**: pílula âmbar-clara. **Selo "Confirmado"**: pílula azul-clara. 🟢
- **Lacunas**: 🔴 critério de ordenação da lista (não é cronológico crescente nem decrescente na captura: 30/09, 30/09, 25/09, 25/09, 20/09, 25/09, 23/09); 🔴 ação associada a cada linha (não há botão visível; presumir clique na linha, 🟡); 🔴 estado vazio.

### Tela: Novo Agendamento — `screenshots/tela_novo_agendamento.png`

- **Propósito**: vincular paciente e profissional, definir o tipo de consulta e registrar observações. 🟢
- **Estado da tela**: `vazio` — nenhum paciente/médico selecionado. 🟢
- **Contexto de uso**: botão **"+ Novo Agendamento"** das telas de agenda. 🟢
- **Captura**: 1443×746 px. 🟢

**Cabeçalho**: link **"← Voltar"**; ícone de calendário; título **"Novo Agendamento"**; subtítulo **"Agende uma consulta para o paciente"**. 🟢

**Seções do formulário**

1. **"Paciente e Médico"** (ícone de pessoa) — **Paciente** \* (select, "Selecione o paciente"), **Médico** \* (select, "Selecione o médico"). 🟢
2. **"Detalhes"** (ícone de estetoscópio) — **Tipo de Consulta** (select, valor atual **"Primeira Consulta"**), **Observações** (área de texto, placeholder **"Observações sobre o agendamento..."**). 🟢

**Ações**: **"Cancelar"** (secundário) e **"Confirmar Agendamento"** (primário com ícone; na captura está em tom claro, **compatível com estado desabilitado** — 🟡 a confirmar no código). 🟢 *(rótulos)*

- 🔴 **Ausência de campo de data/hora**: a imagem **não mostra** nenhum seletor de data ou horário, ao contrário do que a seção anterior deste arquivo descrevia (widget de calendário embutido). Ou o campo não existe nesta revisão da tela, ou a captura cortou a seção. **Requer validação humana** — é a divergência mais relevante desta unit, porque sem data/hora o agendamento não é determinável a partir desta tela.

### Tela: Detalhes do Agendamento (modal) — `screenshots/tela_detalhe_agendamento.png`

- **Propósito**: consultar e alterar o status de um agendamento já existente, sem sair da agenda. 🟢
- **Estado da tela**: `modal-aberto` sobre o calendário. 🟢
- **Contexto de uso**: clique em um cartão de evento da grade (🟡 inferido — não há indício visual do gatilho). 🟢 *(do modal)*
- **Captura**: 1460×1560 px. ⚠️ A imagem é uma **montagem com rolagem**: o cabeçalho do app aparece no meio da figura, com a página do calendário acima e abaixo. A leitura do modal é confiável; a posição relativa dos elementos, não. 🟡

**Conteúdo do modal** (título **"Detalhes do Agendamento"**, botão **"×"** de fechar no canto superior direito):
- **Paciente**: "Neide Ferreira" (rótulo pequeno + valor em negrito). 🟢
- **Médico**: "Dra. Maria Santos". 🟢
- **Data e Hora**: "25/09/2026 às 14:30". 🟢
- **Status**: select com o valor **"Confirmado"**. 🟢
- **Ações**: **"Confirmar"** (contorno, ícone de check) e **"Cancelar"** (contorno em vermelho, ícone de ×). 🟢
- **Fundo escurecido** cobrindo a agenda. 🟢

**Lacunas**: 🔴 se "Cancelar" fecha o modal ou cancela o agendamento (o rótulo é ambíguo e a cor vermelha sugere ação destrutiva); 🔴 todas as opções do select de Status (só "Confirmado" é visível); 🔴 se há confirmação antes de mudar o status.

### Divergências entre capturas e a documentação anterior (a validar com o humano)

| # | Divergência | Evidência | Veredito |
|---|---|---|---|
| D1 | A tela "Novo Agendamento" **não exibe campo de data/hora**, mas a seção anterior descreve um *date picker* embutido | `tela_novo_agendamento.png` × seção "Tela: Novo Agendamento" deste arquivo | 🔴 não resolvido — decide se o horário é escolhido na grade ou no formulário |
| D2 | Cores da legenda: a documentação anterior diz "Em Atendimento (roxo)" e "Concluído (verde)"; a captura mostra **Em Atendimento verde** e **Concluído cinza-esverdeado** | `tela_agendamentos_calendario.png` (rodapé) × seção "Legenda de Status" | 🟡 conferir os tokens no design system |
| D3 | Horários divergem entre calendário e lista para os mesmos registros de 25/09 (calendário em faixas de hora cheia 13:00–16:00; lista com 13:45, 14:30 e 15:15) | `tela_agendamentos_calendario.png` × `tela_agendamentos_lista.png` | 🟡 o calendário posiciona por faixa horária, a lista mostra o horário exato — **não** usar um como oráculo do outro |
| D4 | Contador do cabeçalho ("7 agendamentos próximos") é coerente nos dois modos, mas a grade mostra apenas 1 evento em 23/09 e 5 em 25/09 | ambas as capturas | 🟢 consistente |

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir das 4 capturas em `agendamentos/screenshots/`.*
