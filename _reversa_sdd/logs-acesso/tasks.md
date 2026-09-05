# Tarefas de Implementação — Módulo Logs de Acesso

## Plano de Tarefas SDD

- [x] **LOG-01**: Criar estrutura de dados, regras de negócio e política de auditoria *append-only* para a entidade `AccessLog` (`requirements.md`). 🟢
- [x] **LOG-02**: Documentar interface da tabela de auditoria de acessos (`screens.md`). 🟢
- [x] **LOG-03**: Criar especificação de design (`design.md`) detalhando os gatilhos automáticos de eventos (Login, visualização de pacientes/consultas). 🟢
- [ ] **LOG-04**: Implementar interceptor de auditoria para gravação automática de eventos de login e acesso a dados sensíveis. 🟡
- [ ] **LOG-05**: Implementar listagem e visualização da trilha de auditoria restrita a administradores. 🟡
- [ ] **LOG-06**: Definir e implementar a política de paginação/limite da tabela de auditoria.
  - Origem no legado: `src/pages/AccessLogs.jsx:52` e renderização da tabela
  - Critério de pronto: Produto define tamanho da página e estratégia de carregamento; a UI e a consulta não perdem registros silenciosamente quando o volume excede o limite definido.
  - Confiança: 🔴

---
*Gerado pelo Reversa-Writer em 2026-09-02.*
