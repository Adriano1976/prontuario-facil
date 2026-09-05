# Domínio e Regras de Negócio — prontuario-facil

## 1. Glossário de Termos

| Termo | Definição |
| :--- | :--- |
| **Paciente** | Indivíduo cadastrado que recebe atendimento médico. Pode estar `ativo` ou `inativo`. |
| **Agendamento** | Reserva de horário futuro para um encontro entre médico e paciente. |
| **Consulta** | O registro clínico do atendimento realizado (anamnese, exame físico, diagnóstico). |
| **Template** | Modelo pré-definido de texto para documentos (prescrições, atestados, etc). |
| **Prescrição** | Documento emitido durante a consulta (receitas, solicitações de exame). |
| **RBAC** | *Role-Based Access Control* - Controle de acesso baseado no papel do usuário (User vs Admin). |

## 2. Regras de Negócio de Ouro (Core Business Rules)

### 2.1 Gestão de Pacientes
- **BR-P01**: Apenas pacientes com status `ativo` podem ser selecionados para novos agendamentos ou consultas. 🟢
- **BR-P02**: O `blood_type` deve seguir rigorosamente o padrão ABO/Rh ou ser marcado como `desconhecido`. 🟢

### 2.2 Agendamentos e Consultas
- **BR-A01**: Um agendamento nasce como `agendado`. Ele deve ser `confirmado` antes de iniciar o atendimento. 🟢
- **BR-A02**: Ao concluir uma consulta, o agendamento correspondente deve ser marcado como `concluido`. 🟡 (Inferido, UI permite manual)
- **BR-A03**: O dashboard deve excluir agendamentos `cancelados` de todas as contagens de "hoje" e "próximos". 🟢

### 2.3 Documentos e Templates
- **BR-T01**: Templates de documentos são filtrados pelo `type`. Um template de `atestado` não aparece ao criar uma `receita`. 🟢
- **BR-T02**: O campo `medications` em uma prescrição só é obrigatório/visível se o tipo do documento incluir a palavra "receita". 🟢

### 2.4 Segurança e Auditoria
- **BR-S01**: Todo acesso ou alteração de dados sensíveis deve gerar um log em `AccessLogs`. 🟢
- **BR-S02**: Usuários não-admin só podem visualizar pacientes e consultas que eles mesmos criaram (`created_by_id`). 🟢

## 3. Lacunas e Inconsistências Detectadas 🔴
- **Divergência no Dashboard**: O contador de Consultas de hoje inclui as canceladas, enquanto o de Agendamentos as exclui.
- **Sincronia de Status**: Não há gatilho automático (trigger) que mude o status do Agendamento quando a Consulta é salva.

---
*Gerado pelo Reversa-Detective em 2026-08-31.*
