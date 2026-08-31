# ADR 002: Sistema de Templates de Documentos

## Status
🟢 CONFIRMADO (Extraído de `Templates.jsx` e `PrescriptionEditor.jsx`)

## Contexto
A emissão de documentos médicos (receitas, atestados) é uma tarefa repetitiva. O sistema precisava agilizar isso mantendo a flexibilidade para diferentes tipos de documentos.

## Decisão
Criar uma entidade `Template` desacoplada das consultas:
1. Templates possuem um `type` (ex: `receita_simples`, `atestado`).
2. Ao abrir o editor de prescrição dentro de uma consulta, o sistema filtra os templates disponíveis pelo tipo do documento selecionado.
3. Templates podem ter placeholders (embora a implementação atual pareça ser apenas inserção de texto bruto).

## Consequências
- **Positivas**: Alta produtividade para o médico; padronização dos documentos da clínica.
- **Negativas**: Se um médico precisar de um documento que foge dos tipos pré-definidos, ele fica limitado aos enums do sistema.

---
*Gerado pelo Reversa-Architect em 2026-08-31.*
