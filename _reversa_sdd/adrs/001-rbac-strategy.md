# ADR 001: Estratégia de Controle de Acesso (RBAC)

## Status
🟢 CONFIRMADO (Extraído de `Consultation.jsonc`, `Patient.jsonc` e `Doctors.jsx`)

## Contexto
O sistema precisava de uma forma de isolar os dados entre diferentes médicos que utilizam a mesma plataforma, mas permitindo que administradores tenham uma visão macro da clínica.

## Decisão
Implementar um modelo de **Ownership + Admin Override**:
1. Todo registro possui um `created_by_id`.
2. A filtragem padrão sempre inclui `WHERE created_by_id = current_user.id`.
3. Usuários com a propriedade `role: 'admin'` no perfil ignoram essa restrição de filtro.

## Consequências
- **Positivas**: Isolamento simples de implementar; escalável para múltiplos médicos.
- **Negativas**: Difícil de implementar "compartilhamento" de pacientes entre médicos sem mudar a lógica para uma matriz de permissões mais complexa (ACL).

---
*Gerado pelo Reversa-Architect em 2026-08-26.*
