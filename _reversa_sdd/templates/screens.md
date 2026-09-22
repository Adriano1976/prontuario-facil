# Interface: Templates — MedRecord

## Tela: Central de Templates
Modelos de documentos editáveis categorizados por tipo.

### Elementos de Interface
- **Categorias e Modelos:**
  - **Receita Simples:** Card do modelo com badge `Padrão`, trecho de preview e botões "Editar" e "Excluir".
  - **Atestado Médico:** Card do modelo com badge `Padrão`, trecho de preview com variáveis e botões "Editar" e "Excluir".
  - **Solicitação de Exame:** Card do modelo com badge `Padrão`, trecho de preview com checkbox visual e botões "Editar" e "Excluir".
  - **Encaminhamento:** Card do modelo com badge `Padrão`, trecho de preview e botões "Editar" e "Excluir".
- **Header:** Botão "+ Novo Template" destacado em roxo.

## Tela: Modal: Criar / Editar Template
Editor flutuante para criação e edição de templates com suporte a variáveis dinâmicas.

### Formulário
- **Campos de Identificação:**
  - Nome do Template (Input text, ex: "Receita Simples", obrigatório com `*`).
  - Tipo (Dropdown, ex: "Receita Simples", "Atestado Médico", etc., obrigatório com `*`).
- **Painel de Variáveis Disponíveis:**
  - `{PACIENTE_NOME}` (copiável)
  - `{PACIENTE_CPF}` (copiável)
  - `{DATA}` (copiável)
  - `{DATA_EXTENSO}` (copiável)
  - `{DIAS_AFASTAMENTO}` (copiável)
- **Editor de Conteúdo:**
  - Conteúdo do Template (Textarea grande, obrigatório com `*`, aceita interpolação das variáveis).
- **Opções e Toggles:**
  - Switch Toggle: "Template padrão" (define se é o modelo default para aquele tipo).
  - Switch Toggle: "Ativo" (define se está disponível para uso nas consultas).
- **Ações:** Botões "Cancelar" e "Salvar" (em destaque roxo).

---
*Gerado pelo Reversa-Visor em 2026-08-27.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre as imagens fornecidas pelo usuário em `templates/screenshots/`.
> As seções acima foram preservadas integralmente (diretiva non-destructive); o que segue é a leitura forense das imagens.
> Capturas nesta unit: **3** (central de templates, modal de criação e modal de edição).

### Tela: Central de Templates — `screenshots/tela_templates.png`

- **Propósito**: ver os modelos de documento disponíveis, agrupados por categoria, e editar/criar modelos. 🟢
- **Estado da tela**: `preenchido` — 4 categorias, 1 modelo em cada. 🟢
- **Contexto de uso**: item "Templates" do menu (ativo na captura) ou ação rápida do Dashboard. 🟢
- **Captura**: 1443×1190 px. 🟢

**Cabeçalho**: seta **"←"**; ícone de documento (roxo); título **"Templates"**; subtítulo **"Modelos de documentos editáveis"** — sem contador de registros. Botão primário **"+ Novo Template"** (roxo) à direita. 🟢

**Agrupamento por categoria**: cada categoria tem um cabeçalho em negrito e **um** card de modelo abaixo, com ícone de documento (roxo), título, selo **"Padrão"** (roxo-claro) no canto superior direito, trecho de pré-visualização em texto pequeno e dois botões — **"Editar"** (contorno, lápis) e **excluir** (contorno, lixeira vermelha). 🟢

| Categoria (cabeçalho) | Título do card | Pré-visualização (trecho legível) |
|---|---|---|
| **Receita Simples** | Receita Simples | "RECEITUÁRIO Paciente: {PACIENTE_NOME} CPF: {PACIENTE_CPF} Data: {DATA} Medicamentos: Observações: ____ Assinatura..." |
| **Atestado Médico** | Atestado Médico Padrão | "ATESTADO MÉDICO Atesto para os devidos fins que o(a) Sr(a). {PACIENTE_NOME}, portador(a) do CPF {PACIENTE_CPF}, esteve sob meus..." |
| **Solicitação de Exame** | Solicitação de Exames | "SOLICITAÇÃO DE EXAMES Paciente: {PACIENTE_NOME} CPF: {PACIENTE_CPF} Data: {DATA} Solicito a realização dos seguintes exames: [ ] Hemograma..." |
| **Encaminhamento** | Encaminhamento | "ENCAMINHAMENTO MÉDICO Data: {DATA} Ao colega especialista em ____ Encaminho o(a) paciente {PACIENTE_NOME}, CPF..." |

🟢 *(categorias e títulos dos cards)* / 🟡 *(o corpo da pré-visualização é truncado com reticências e usa corpo muito pequeno — as variáveis aparecem entre chaves na imagem, mas a fidelidade exata do texto só pode ser confirmada no código)*

⚠️ **Observação de nomenclatura**: o cabeçalho da categoria 3 é **"Solicitação de Exame"** (singular) e o título do card é **"Solicitação de Exames"** (plural). 🟢
- **Lacunas**: 🔴 opções do filtro de categorias (não há filtro visível na tela); 🔴 efeito da lixeira (confirmação?); 🔴 o que muda quando um modelo não é "Padrão"; 🔴 ordem das categorias é fixa ou alfabética.

### Tela: Modal "Novo Template" — `screenshots/tela_novo_templates.png`

- **Propósito**: criar um modelo de documento a partir de um tipo e de variáveis dinâmicas. 🟢
- **Estado da tela**: `modal-aberto` sobre a central (fundo escurecido), formulário em branco. 🟢
- **Contexto de uso**: botão **"+ Novo Template"**. 🟢
- **Captura**: 1314×602 px. ⚠️ A captura está **cortada na parte inferior**: os toggles e os botões de ação não aparecem (a barra de rolagem do modal indica mais conteúdo). 🟢

**Conteúdo visível**
- Título **"Novo Template"**; botão **"×"** de fechar. 🟢
- **Nome do Template** \* — input com placeholder **"Ex: Atestado Padrão"**. 🟢
- **Tipo** \* — select com valor **"Receita Simples"**. 🟢
- **"Variáveis disponíveis"** (ícone de informação) — cinco botões copiáveis: **{PACIENTE_NOME}**, **{PACIENTE_CPF}**, **{DATA}**, **{DATA_EXTENSO}**, **{DIAS_AFASTAMENTO}**. 🟢
- **Conteúdo do Template** \* — área de texto grande com placeholder **"Digite o conteúdo do template. Use as variáveis acima para campos dinâmicos."**. 🟢

🔴 **Não visíveis nesta captura** (mas presentes na de edição): os toggles **"Template padrão"** e **"Ativo"**, e os botões **"Cancelar"** / **"Salvar"**. Não é lacuna de implementação — é lacuna de captura.

### Tela: Modal "Editar Template" — `screenshots/tela_editar_template.png`

- **Propósito**: alterar nome, tipo, conteúdo e flags de um modelo existente. 🟢
- **Estado da tela**: `preenchido` com o modelo "Receita Simples". 🟢
- **Contexto de uso**: botão **"Editar"** do card. 🟢
- **Captura**: 1314×602 px (mostra a parte inferior que falta na captura anterior). 🟢

**Valores carregados**

| Campo | Valor |
|---|---|
| Nome do Template | Receita Simples |
| Tipo | Receita Simples |
| Conteúdo do Template | "RECEITUÁRIO" / "Paciente: {PACIENTE_NOME}" / "CPF: {PACIENTE_CPF}" / "Data: {DATA}" / "Medicamentos:" / "Observações:" (🟡 linhas exatas na fonte; a área tem rolagem própria e o texto aparece parcialmente) |
| Template padrão | ligado |
| Ativo | ligado |

- **Ações**: **"Cancelar"** (contorno) e **"Salvar"** (primário, **roxo**, ícone de disquete). 🟢
- **Interação das variáveis**: os cinco chips de variáveis aparecem **também** no modal de edição, na mesma ordem — 🟡 inferido que clicar em um chip insere a variável na posição do cursor no conteúdo (o rótulo é copiável, mas o efeito exato não é observável em imagem estática).

### Divergências (a validar com o humano)

| # | Divergência | Evidência | Veredito |
|---|---|---|---|
| D1 | Esta unit usa **roxo** como cor de destaque (ícone do título, selo "Padrão", botão primário, botão Salvar), enquanto Pacientes/Agendamentos/Consultas usam verde-água | `tela_templates.png`, `tela_editar_template.png` × capturas das outras units | 🟡 mesmo caso da unit `medicos` — conferir token no design system |
| D2 | A captura de criação está cortada antes dos toggles e das ações | `tela_novo_templates.png` | 🔴 lacuna de captura — pedir nova captura se a paridade visual dessa parte for exigida |
| D3 | Variáveis citadas na seção anterior como textos soltos aparecem, na imagem, como **chips copiáveis** agrupados em "Variáveis disponíveis" | `tela_novo_templates.png` × seção "Painel de Variáveis Disponíveis" | 🟢 confirma a seção anterior e acrescenta a forma visual |

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir das 3 capturas em `templates/screenshots/`.*
