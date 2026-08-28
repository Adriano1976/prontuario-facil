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
