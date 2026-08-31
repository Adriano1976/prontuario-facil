# Design SDD — Módulo Médicos

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Médicos** (`Doctor`) gerencia a equipe de profissionais de saúde, suas especialidades, CRMs e jornadas de atendimento.

### Componentes Principais
- **Cards de Médicos**: Exibem informações resumidas (nome, CRM, especialidade, status ativo, horário e dias da semana atendidos) com botões rápidos para edição e exclusão.
- **Modal de Cadastro / Edição (`Novo Médico`)**: Formulário completo contemplando dados cadastrais, seleção de dias de atendimento (segunda a domingo), horários de expediente (`working_hours`), duração média da consulta (`appointment_duration`) e status de atividade.

---

## 2. Integração de Horários e Agendamentos
- **Jornada de Trabalho (`working_days` e `working_hours`)**: Os dias e horários cadastrados para o médico servem de base para que o módulo de Agendamentos filtre e valide os slots de horários disponíveis.
- **Duração da Consulta (`appointment_duration`)**: Define o intervalo padrão em minutos por atendimento (ex: 30 minutos), utilizado pelo calendário para o dimensionamento da grade horária.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
