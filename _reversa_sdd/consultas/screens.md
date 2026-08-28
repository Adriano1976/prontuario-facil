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
  - Template (Dropdown para modelos pré-salvos).
  - Conteúdo (Campo de texto enriquecido/textarea).
  - Medicamentos (Seção com botão "+ Adicionar").
  - Observações (Textarea opcional).
- **Ações:** Botão "Imprimir" e "Salvar".

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
