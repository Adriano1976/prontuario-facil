# Design SDD — Módulo Logs de Acesso

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Logs de Acesso** (`AccessLog`) provê trilha de auditoria e conformidade LGPD para monitorar o acesso a dados sensíveis de pacientes e operações críticas na plataforma.

### Componentes Principais
- **Tabela de Auditoria**: Interface tabular listando Data/Hora, Usuário, Ação executada (badges coloridos), Paciente associado e Detalhes contextuais.
- **Registro Automático (*Append-Only*)**: Mecanismo de gravação em segundo plano acionado por eventos do sistema e interações sensíveis (como Login e visualização de prontuários/pacientes).
- **Carregamento da tabela**: A página busca até 500 registros ordenados por data e aplica busca, ação e data no cliente; não implementa paginação. 🟢

---

## 2. Gatilhos de Auditoria e Eventos Registrados
- **Login**: Registrado automaticamente no momento da autenticação com sucesso na plataforma, gravando metadados de IP, user agent e o detalhe `"Acesso ao dashboard"`.
- **Visualização de Dados Sensíveis**: Ações de leitura de prontuários (`Visualizar Consulta`) ou cadastros (`Visualizar Paciente`) disparam a gravação do log vinculando o nome do paciente e o e-mail do operador responsável.
- **Segurança e RLS**: Somente usuários com privilégio de administrador (`admin`) possuem permissão para consultar os logs de auditoria.

## 3. Paginação e Limite

- Comportamento confirmado no legado: `AccessLog.list('-created_date', 500)` e renderização de todos os registros filtrados localmente. 🟢
- A decisão sobre paginação da tabela e sobre buscar mais de 500 registros é de produto e permanece aberta. 🔴

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
