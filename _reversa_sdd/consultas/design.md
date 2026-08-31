# Design SDD — Módulo Consultas

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Consultas** (`Consultation`) é responsável por gerenciar o ciclo de atendimento clínico e a emissão de documentos associados (receitas, atestados e exames).

### Componentes Principais
- **Listagem de Consultas**: Filtros avançados, busca textual e paginação por status.
- **Formulário de Atendimento (Anamnese)**: Seções para Sinais Vitais, Queixa Principal, História da Doença Atual, Exame Físico, Diagnóstico, CID-10 e Plano de Conduta.
- **Visualização de Consulta**: Painel consolidador contendo dados do paciente, alertas de alergias e atalhos rápidos para emissão de documentos.
- **Modal de Novo Documento**: Emissão dinâmica de documentos clínicos com seleção de templates e suporte a blocos específicos de medicamentos.
- **Modal de Upload de Exame**: Armazenamento e tipificação de exames e laudos laboratoriais.

---

## 2. Integração de Templates e Emissão de Documentos
- **Preenchimento Automático**: Ao acionar a emissão de um documento (Receita, Atestado, Exame) a partir da tela de Visualização de Consulta, o modal herda automaticamente os metadados do paciente (`patient_id`) e o vínculo com o atendimento (`consultation_id`).
- **Templates Dinâmicos**: A seleção de um modelo pré-cadastrado no dropdown de templates injeta o texto padrão no corpo do documento (`conteúdo`), permitindo personalização pontual pelo médico.
- **Lógica Condicional (Medicamentos)**: 
  - O bloco de **Medicamentos** é exibido exclusivamente quando o tipo de documento é do tipo **Receita** (ex: "Receita Simples").
  - Para outros tipos de documentos (como atestados ou laudos), a seção de medicamentos é completamente ocultada.
  - Cada item na lista de medicamentos possui campos independentes para: Nome do medicamento, Dosagem, Frequência, Duração e Instruções Especiais.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
