# Design SDD — Módulo Templates

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Templates** gerencia os modelos de documentos textuais (receitas, atestados, exames e encaminhamentos) utilizados no atendimento clínico.

### Componentes Principais
- **Central de Templates**: Listagem de modelos agrupados por tipo, com visualização de trecho (preview), indicação de template padrão e botões de gerenciamento.
- **Modal de Criar / Editar Template**: Editor de conteúdo textual com painel auxiliar contendo tags de variáveis dinâmicas (`{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}`, `{DATA_EXTENSO}`, `{DIAS_AFASTAMENTO}`).

---

## 2. Substituição e Interpolação de Variáveis
- **Momento da Interpolação**: As variáveis dinâmicas são interpoladas no momento em que o documento é **salvo/gerado** a partir do modal na tela de Visualização de Consulta, substituindo as tags pelos dados reais do paciente, do médico e da consulta atual.
- **Inputs Manuais**: Variáveis contextuais específicas como `{DIAS_AFASTAMENTO}` requerem preenchimento manual por parte do médico no corpo do documento ou podem ser associadas ao tipo de documento correspondente (ex: atestados).

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
