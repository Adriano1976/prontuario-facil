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
- **Detalhes:**
  - Tipo de Consulta (Dropdown com opções como "Primeira Consulta", etc.).
  - Observações (Textarea para texto livre).
- **Ações:**
  - Botão "Cancelar".
  - Botão "Confirmar Agendamento".

---
*Gerado pelo Reversa-Visor em 2026-08-27.*
