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
