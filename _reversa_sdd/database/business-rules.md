# Regras de Negócio e Políticas no Banco (BaaS)

> Gerado por reversa-data-master em 27/08/2026.
> Nível de Confiança: 🟢 Alta (extraído diretamente do bloqueio `rls` nos Schemas JSON).

Nesta arquitetura BaaS (Base44/Supabase), as "Regras de Banco" são governadas fortemente através de **Row Level Security (RLS)** que atua diretamente nas queries do banco de dados, via definições JSON.

## 1. Segurança e Privacidade (RLS - Row Level Security)
Quase todas as entidades sensíveis do sistema (`Patient`, `Consultation`, `Appointment`, `Prescription`) possuem regras estritas que previnem acessos indevidos (importante para conformidade LGPD):

- **Regra Geral de Leitura (`read`), Atualização (`update`) e Deleção (`delete`)**:
  - Os dados só podem ser lidos/modificados pelo usuário que originalmente os criou (`created_by_id == user.id`), garantindo isolamento entre dados de diferentes usuários da mesma clínica, ou pelo dono (paciente/médico).
  - Acesso irrestrito apenas se o papel (role) do solicitante for administrador (`user_condition.role == admin`).

- **Criação Aberta (`create: null`)**:
  - A maior parte dos schemas (`Patient`, `Appointment`, `Consultation`) não impõe bloqueios estritos na etapa `create` no nível do banco, permitindo que as rotas da API recebam as criações e deleguem lógicas de permissão extras para os controladores do Backend as a Service.

## 2. Restrições na Entidade "Template"
- Templates são dados mestres/configuração global da clínica.
- A criação de templates (`create`) exige privilégios explícitos de administrador (`user_condition.role == admin`), prevenindo que usuários comuns modifiquem os modelos base de atestados, receituários, etc.

## 3. Comportamentos de Enumeração (Check Constraints Enforced)
A integridade de dados e máquina de estado depende estritamente das validações JSON que funcionam como Constraints:
- **`Appointment.status`**: Restringe para `agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado` ou `faltou`.
- **`Consultation.status`**: Limita o funil clínico para `agendada`, `em_andamento`, `concluida` e `cancelada`.
- **`Patient.blood_type` e `Patient.gender`**: Possuem dicionário fechado no banco.
- **`Prescription.type`**: Protege a integridade documental com valores fixos (simples, controlada, atestado, encaminhamento, solicitacao_exame, declaracao).

*Nota*: Não foram detectadas Stored Procedures puras (PL/pgSQL) ou Triggers customizados, pois lógicas reativas (ex: notificar via email quando marcar Appointment) são tratadas por hooks do próprio Base44.
