# Interface: Consultas — MedRecord

## Tela: Listagem de Consultas
Visualização de atendimentos clínicos passados, presentes e futuros.

### Elementos de Interface
- **Filtros e Busca:**
  - Input: "Buscar por paciente, queixa ou diagnóstico...".
  - Dropdown: "Todos Status" (com ícone de filtro).
  - Dropdown: "Todas as datas" (com ícone de calendário).
- **Lista de Consultas:**
  - Iniciais do paciente em círculo azul/verde.
  - Nome do Paciente.
  - Status em badge (ex.: `Em Andamento` em azul, `Agendada` em amarelo).
  - Data, hora e queixa (se preenchida).
  - Data de Retorno recomendada.
  - Seta de ação para ver detalhes da consulta.
- **Header:** Contador "3 consultas encontradas" e botão "+ Nova Consulta".

## Tela: Novo Atendimento (Anamnese)
Formulário abrangente para preenchimento de prontuário eletrônico.

### Formulário de Atendimento
- **Paciente:** Campo de busca para vincular o paciente.
- **Data e Status:**
  - Data e Hora (obrigatório).
  - Status (Dropdown, ex: "Em Andamento").
  - Data de Retorno (opcional).
- **Sinais Vitais:** Pressão Arterial, Freq. Cardíaca, Temperatura, Freq. Respiratória, Saturação O₂, Peso, Altura.
- **Anamnese:** Textareas para Queixa Principal, História da Doença Atual, Exame Físico.
- **Diagnóstico e Conduta:** Diagnóstico Principal, CID-10, Plano de Tratamento, Observações.
- **Ações:** Botões "Cancelar" e "Salvar Consulta".

## Tela: Visualização de Consulta
Visão estática de uma consulta consolidada para leitura rápida e emissão de receitas.

### Elementos de Interface
- **Header:** Identificação da consulta, data, hora, badge de status (ex: `Em Andamento`), botões "Imprimir" e "Editar".
- **Painel Lateral Esquerdo (Paciente):**
  - Nome do Paciente, telefone, foto/iniciais.
  - Alerta de Alergias (Amarelo, ex: "Não tem").
  - Botões para emissão de documentos: "Nova Receita", "Atestado", "Exame".
- **Painel Central Superior (Sinais Vitais):** Grid consolidando Pressão Arterial, Freq. Cardíaca, Temperatura, Peso, Altura.
- **Painel Central Inferior (Anamnese):** Textos consolidados de Queixa Principal, História da Doença Atual, Exame Físico.

## Tela: Modal: Novo Documento
Modal flutuante para criação de documentos baseados em templates.

### Elementos de Interface
- **Campos:**
  - Tipo de Documento (Dropdown, ex: "Receita Simples").
  - Template (Dropdown para modelos pré-salvos, ex: "Selecionar template...").
  - Conteúdo (Textarea para o corpo do documento, placeholder "Digite o conteúdo do documento...").
  - Medicamentos (Seção condicional exibida para receitas, com botão "+ Adicionar").
  - Observações (Textarea opcional, placeholder "Observações adicionais...").
- **Ações:** 
  - Botão "Imprimir" (com ícone de impressora).
  - Botão "Salvar" (primário, verde, com ícone de disquete).
  - Botão de fechar (`X` no canto superior direito).

## Tela: Modal: Upload de Exame
Modal flutuante para arquivar exames de imagem ou laudos em PDF/imagem.

### Elementos de Interface
- **Área de Drag & Drop:** Área tracejada com ícone de upload, aceitando "PDF ou Imagem (máx. 10MB)".
- **Campos:**
  - Nome do Exame (obrigatório).
  - Tipo (Dropdown, ex: "Laboratorial").
  - Data do Exame (Data picker).
  - Laboratório/Clínica (Texto).
  - Resumo dos Resultados (Textarea).
  - Observações (Textarea).
- **Ações:** Botões "Cancelar" e "Salvar Exame".

---
*Gerado pelo Reversa-Visor em 2026-08-27.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `consultas/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **5** (listagem, novo atendimento, edição, visualização e modal de novo documento).
> ⚠️ O **modal de upload de exame** (`tela_consulta_novo_documento.png` cobre o de documento) **não foi capturado** — a tela descrita como "Modal: Upload de Exame" segue documentada apenas pela seção anterior, sem imagem.

### Tela: Listagem de Consultas — `screenshots/tela_consultas.png`

- **Propósito**: localizar atendimentos por paciente, queixa ou diagnóstico e abrir cada consulta. 🟢
- **Estado da tela**: `preenchido` — 3 consultas. 🟢
- **Contexto de uso**: item "Consultas" do menu (ativo na captura). 🟢
- **Captura**: 1443×762 px. 🟢

**Cabeçalho**: seta **"←"**; ícone de estetoscópio; título **"Consultas"**; subtítulo dinâmico **"3 consultas encontradas"**; botão primário **"+ Nova Consulta"**. 🟢

**Filtros**
- Busca com lupa: **"Buscar por paciente, queixa ou diagnóstico..."**. 🟢
- Select **"Todos Status"** (com ícone de funil). 🟢
- Select **"Todas as datas"** (com ícone de calendário). 🟢

**Lista** (avatar com inicial, nome, selo de status, linha de metadados com data/hora e queixa, "Retorno: dd/mm" à direita e chevron):

| # | Paciente | Status | Data e hora | Queixa | Retorno |
|---|---|---|---|---|---|
| 1 | Adriano Santos | Em Andamento *(azul)* | 08/01/2026 às 02:34 | Dores no peito | 19/01 |
| 2 | Adriano Santos | Agendada *(âmbar)* | 08/01/2026 às 02:07 | — | 11/01 |
| 3 | Roberto Santos | Agendada *(âmbar)* | 07/01/2026 às 22:28 | — | 19/01 |

🟢 *(todos os valores legíveis; a linha 1 traz a queixa preenchida, as linhas 2 e 3 não)*
- **"Retorno: dd/mm"** aparece com ícone de relógio no canto direito, antes do chevron — dado sem ano visível. 🟡
- **Lacunas**: 🔴 opções reais dos dois filtros; 🔴 estado vazio; 🔴 ordenação (a lista mistura 08/01 com 07/01 em ordem decrescente, 🟡 aparente).

### Tela: Novo Atendimento (Anamnese) — `screenshots/tela_nova_consulta.png`

- **Propósito**: registrar o atendimento clínico completo — sinais vitais, anamnese, diagnóstico e conduta. 🟢
- **Estado da tela**: `vazio`, com **Data e Hora já preenchida** com o instante corrente ("22/09/2026 14:40") e **Status em "Em Andamento"**. 🟢
- **Contexto de uso**: botão **"+ Nova Consulta"** da listagem ou ação rápida do Dashboard. 🟢
- **Captura**: 1443×1768 px. 🟢

**Cabeçalho**: **"← Voltar"**; ícone de estetoscópio; título **"Nova Consulta"**; subtítulo **"Preencha a anamnese e dados do atendimento"**. 🟢

**Seções**
1. **"Paciente"** (ícone de pessoa) — campo de busca **"Buscar paciente por nome ou CPF..."**. 🟢
2. **"Data e Status"** (ícone de calendário) — **Data e Hora** \* (valor "22/09/2026 14:40", com ícone de calendário), **Status** (select, valor "Em Andamento"), **Data de Retorno** (placeholder "dd/mm/aaaa", com ícone de calendário). 🟢
3. **"Sinais Vitais"** (ícone de pulso) — sete campos numéricos com unidade no rótulo:

   | Rótulo | Valor de exemplo na captura | Unidade no próprio controle |
   |---|---|---|
   | Pressão Arterial | 120/80 | mmHg |
   | Freq. Cardíaca | 72 | bpm |
   | Temperatura | 36.5 | c |
   | Freq. Respiratória | 16 | irpm |
   | Saturação O₂ | 98 | % |
   | Peso | 70 | kg |
   | Altura | 1.70 | m |

   🟢 *(rótulos e unidades; a Temperatura exibe "36.5 c" com "c" minúsculo — 🟡 conferir se deveria ser "°C")*
4. **"Anamnese"** — três áreas de texto: **Queixa Principal** ("Descreva a queixa principal do paciente..."), **História da Doença Atual** ("Descreva a história da doença atual..."), **Exame Físico** ("Achados do exame físico..."). 🟢
5. **"Diagnóstico e Conduta"** — **Diagnóstico** ("Diagnóstico principal"), **CID-10** ("Ex.: J00" 🟡), **Plano de Tratamento** ("Descreva o plano de tratamento..."), **Observações** ("Observações adicionais..."). 🟢

**Ações**: **"Cancelar"** (secundário) e **"Salvar Consulta"** (primário com ícone; em tom claro na captura — 🟡 compatível com estado desabilitado). 🟢 *(rótulos)*

### Tela: Editar Consulta — `screenshots/tela_edita_consulta.png`

- **Propósito**: corrigir dados de um atendimento já registrado. 🟢
- **Estado da tela**: `preenchido` com o atendimento de 08/01/2026 do paciente Adriano Santos. 🟢
- **Contexto de uso**: botão **"Editar"** da tela de consulta. 🟢
- **Captura**: 1443×1815 px. 🟢

**Diferenças estruturais em relação ao Novo Atendimento** (o restante do formulário é idêntico):
- Título **"Editar Consulta"**, mantendo o mesmo subtítulo ("Preencha a anamnese e dados do atendimento"). 🟢
- A seção "Paciente" deixa de ser busca e passa a **cartão do paciente** — avatar, **"Adriano Santos"**, telefone "(79) 99896-0414" — com botão **"Trocar"** à direita. 🟢
- **Valores carregados**: Data e Hora "08/01/2026 02:34"; Status "Em Andamento"; Data de Retorno "20/01/2026"; Sinais Vitais 120/80, 72 bpm, 36.5 c, 16, 98%, 85, 1.75; Queixa Principal "Dores no peito"; História da Doença Atual "Não tem"; Exame Físico "Não tem"; Diagnóstico, CID-10, Plano de Tratamento e Observações em branco (placeholders). 🟢
- **Ações**: **"Cancelar"** e **"Salvar Consulta"** (primário, aparentemente habilitado). 🟢

- 🔴 **Divergência de massa**: o peso/altura registrados aqui (85 kg / 1,75 m) diferem dos valores de exemplo do formulário de criação (70 kg / 1,70 m) — esperado em formulário vazio, mas **fixa a massa** para qualquer teste de paridade desta tela.

### Tela: Visualização de Consulta — `screenshots/tela_consulta_paciente.png`

- **Propósito**: leitura consolidada do atendimento, com os sinais vitais, a anamnese e os documentos já emitidos; é o ponto de partida para emitir receita, atestado ou anexar exame. 🟢
- **Estado da tela**: `preenchido` — consulta "Em Andamento" com documento emitido. 🟢
- **Contexto de uso**: chevron de qualquer linha da listagem de Consultas. 🟢
- **Captura**: 1443×874 px. 🟢

**Cabeçalho**: seta **"←"**; ícone de estetoscópio; título **"Consulta"**; subtítulo com data e hora em texto longo — **"08 de janeiro de 2026 às 02:34"**; selo de status **"Em Andamento"** (azul) ao lado do título. À direita: botões **"Imprimir"** (ícone de impressora) e **"Editar"** (ícone de lápis). 🟢

**Card esquerdo — "Paciente"**: avatar com inicial "A", **"Adriano Santos"**, telefone **"(79) 99896-0414"**; caixa de alerta âmbar com triângulo: **"Alergias"** / **"Não tem"**. Ações: **"Nova Receita"** (primário, largura total, ícone de seringa), e abaixo, lado a lado, **"Atestado"** (ícone de documento) e **"Exame"** (ícone de upload). 🟢

**Card "Sinais Vitais"** (ícone de coração): **Pressão Arterial 120/80**, **Freq. Cardíaca 72 bpm**, **Temperatura 36.5 c**, **Peso 85**, **Altura 1.75** — cada valor em bloco cinza-claro sob o rótulo. 🟢

**Card "Anamnese"**: **Queixa Principal** "Dores no peito"; **História da Doença Atual** "Não tem"; **Exame Físico** "Não tem". 🟢

**Card "Documentos Emitidos"** (ícone de documento, 🟡 *elemento novo, não descrito na seção anterior*): um item — **"Encaminhamento"** com **"15/09/2026 12:30"** e ícone de documento. 🟢
- **Lacunas**: 🔴 ação do item de documento (abrir? imprimir? baixar?); 🔴 comportamento quando não há documentos emitidos.

### Tela: Modal "Novo Documento" — `screenshots/tela_consulta_novo_documento.png`

- **Propósito**: emitir receitas, atestados e outros documentos clínicos a partir de um template. 🟢
- **Estado da tela**: `modal-aberto` sobre a tela de Consulta (fundo escurecido). 🟢
- **Contexto de uso**: botão "Nova Receita" (ou equivalente) da tela de Consulta — 🟡 inferido. 🟢 *(do modal)*
- **Captura**: 1314×602 px; o modal tem **rolagem própria** (barra visível à direita). 🟢

**Conteúdo**
- Título **"Novo Documento"** com ícone de documento; botão **"×"** no canto superior direito. 🟢
- **"Tipo de Documento"**: select com valor **"Receita Simples"**. 🟢
- **"Template"**: select com placeholder **"Selecionar template..."**. 🟢
- **"Conteúdo"**: área de texto grande, placeholder **"Digite o conteúdo do documento..."**. 🟢
- **"Medicamentos"**: título de seção com ícone de clipe e botão **"+ Adicionar"** alinhado à direita (seção condicional, vazia na captura). 🟢
- **"Observações"**: área de texto, placeholder **"Observações adicionais..."**. 🟢
- **Ações no rodapé**: **"Imprimir"** (contorno, ícone de impressora) e **"Salvar"** (primário, verde-água, ícone de disquete). 🟢

- **Lacunas**: 🔴 opções do select "Tipo de Documento"; 🔴 efeito de escolher um Template (preenche o Conteúdo?); 🔴 campos que a linha de medicamento adicionada exibe; 🔴 se "Imprimir" salva antes de imprimir; 🔴 comportamento do modal quando "Tipo de Documento" não é uma receita (a seção Medicamentos desaparece?).

### Divergências e cobertura (a validar com o humano)

| # | Item | Evidência | Veredito |
|---|---|---|---|
| D1 | "Documentos Emitidos" existe na tela de consulta mas não constava da documentação anterior | `tela_consulta_paciente.png` × seção "Tela: Visualização de Consulta" | 🟢 elemento novo confirmado na imagem |
| D2 | Nenhuma captura do **modal de Upload de Exame** | pasta `consultas/screenshots/` (5 arquivos) × seção "Tela: Modal: Upload de Exame" | 🔴 lacuna de captura — a tela segue sem imagem |
| D3 | Peso/altura divergem entre o exemplo do formulário (70 kg / 1,70 m) e o registro real (85 / 1,75) | `tela_nova_consulta.png` × `tela_edita_consulta.png` | 🟡 massas distintas; fixar a massa antes de comparar |
| D4 | Unidades dos sinais vitais aparecem dentro do controle ("bpm", "irpm", "%", "kg", "m", "c") | `tela_nova_consulta.png` e `tela_edita_consulta.png` | 🟡 "c" minúsculo para temperatura — conferir no código |

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir das 5 capturas em `consultas/screenshots/`.*
