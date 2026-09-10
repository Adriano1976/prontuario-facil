---
schemaVersion: 1
generatedAt: 2026-09-09T15:09:42-03:00
reversa:
  version: "1.3.2"
kind: discard_log
producedBy: curator
hash: "sha256:54375a036ffc76c07bb96b151a018156142982dcbe2e55e9ec0b02849fb22bb6"
---

# Discard Log

> Registro completo do que foi descartado da migração e por quê. Cada item tem rastreabilidade para a origem no legado.

## Itens descartados

Nenhum item foi descartado nesta migração.

**Justificativa agregada**:
- `paradigm_decision.md` registrou **gap nenhum** — o alvo é a mesma stack (React funcional) com TypeScript como camada de tipos. Não há mecanismos do paradigma legado que o paradigma alvo absorva por construção (não houve mudança de paradigma).
- O `migration_brief.md` não exclui nenhuma regra de negócio do escopo: os 8 módulos migram; o que fica "fora" (backend Base44, RLS no BaaS, infra, banco, novas features, correção lógica de F-01/F-02/F-03 — fonte: `docs/security-audit/achados.json` —, framework de testes) **não são regras de negócio do frontend** — são camadas/entregas que permanecem como estão ou em fase posterior.
- As divergências e lacunas encontradas (Taxa de Atendimento `94%`, critério de KPIs, sincronia manual de status, paginação de logs, badge offline) foram tratadas como **DECISÃO HUMANA** (BR-HUMANA-001…005 em `target_business_rules.md`), não como descarte.

## Itens descartados por mudança de paradigma (subseção dedicada)

> Lista apenas dos itens cujo `Vinculado a paradigma = sim`. Auditoria explícita para o agente de codificação.

| ID | Origem | Paradigma legado | Substituto no paradigma alvo |
|---|---|---|---|
| — | — | — | Nenhum. Paradigma inalterado (React funcional → React funcional + tipos). |

## Notas

- **RLS / schemas Base44**: não são "descartados". Permanecem **intactos no BaaS** (brief: "schemas não mudam", "backend imutável"). O frontend migra apenas o **espelho** (filtros `created_by_id`, validações) — ver BR-MIGRAR-034/036 em `target_business_rules.md`.
- **Correção lógica F-01/F-02/F-03** (fonte: `docs/security-audit/achados.json`): fica para fase posterior (brief). A camada de tipos deve **exigir** os campos/parâmetros que essas não conformidades exploram (`role`, `created_by_id`, params de URL) — o que **não** é detectá-las em compile-time — e não reproduzi-las cegamente como comportamento desejado.
- **Mudanças de comportamento sugeridas durante a curadoria** (unificar critérios de KPI, automatizar status, paginar logs, adicionar badge offline) foram **recusadas** por violarem a paridade 100% exigida no brief — registradas como DECISÃO HUMANA e/ou itens referidos à codificação.
