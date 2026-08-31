# Design SDD — Módulo Logs de Acesso

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Logs de Acesso** (`AccessLog`) provê trilha de auditoria e conformidade LGPD para monitorar o acesso a dados sensíveis de pacientes e operações críticas na plataforma.

### Componentes Principais
- **Tabela de Auditoria**: Interface tabular listando Data/Hora, Usuário, Ação executada (badges coloridos), Paciente associado e Detalhes contextuais.
- **Registro Automático (*Append-Only*)**: Mecanismo de gravação em segundo plano acionado por eventos do sistema e interações sensíveis (como Login e visualização de prontuários/pacientes).

---

## 2. Gatilhos de Auditoria e Eventos Registrados
- **Login**: Registrado automaticamente no momento da autenticação com sucesso na plataforma, gravando metadados de IP, user agent e o detalhe `"Acesso ao dashboard"`.
- **Visualização de Dados Sensíveis**: Ações de leitura de prontuários (`Visualizar Consulta`) ou cadastros (`Visualizar Paciente`) disparam a gravação do log vinculando o nome do paciente e o e-mail do operador responsável.
- **Segurança e RLS**: Somente usuários com privilégio de administrador (`admin`) possuem permissão para consultar os logs de auditoria.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
