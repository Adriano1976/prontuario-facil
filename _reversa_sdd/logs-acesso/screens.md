# Interface: Logs de Acesso — MedRecord

## Tela: Logs de Acesso
Tabela de auditoria e conformidade LGPD para rastreamento de acessos aos dados sensíveis de pacientes.

### Elementos de Interface
- **Tabela de Auditoria:**
  - **Data/Hora:** Timestamp legível com data e hora exata da ação (ex: `28/08/2026 02:34:08`).
  - **Usuário:** Identificação/E-mail do operador do sistema com ícone de perfil (ex: `adrianosantos.git@g...`).
  - **Ação:** Badge de identificação do evento:
    - `Login` (Badge azul com ícone de entrada `->]`)
    - `Visualizar Consulta` (Badge verde claro com ícone de olho)
    - `Visualizar Paciente` (Badge verde claro com ícone de olho)
  - **Paciente:** Nome do paciente associado ao registro de visualização (ex: `Adriano Santos`, `Neide Ferreira`), ou `-` quando não aplicável (ex: no Login).
  - **Detalhes:** Descrição complementar do evento (ex: "Acesso ao dashboard" ou `-`).
- **Paginação:** A implementação atual carrega até 500 registros e renderiza todos os filtrados no cliente; não há controles de paginação. A política desejada para volumes acima desse limite permanece pendente. 🔴

---
*Gerado pelo Reversa-Visor em 2026-08-27.*
