---
schemaVersion: 1
generatedAt: 2026-09-09T16:00:00-03:00
reversa:
  version: "1.3.2"
kind: ambiguity_log
producedBy: orchestrator
hash: "sha256:49b14a6dba5e2dceaad3d0ca1f943f5d8d1ddf7dd922a70f3a99cab84ea904e0"
---

# Ambiguity Log

> Consolidação de todos os itens ⚠️ AMBÍGUOS ou pendentes detectados pelos agentes ao longo do pipeline.
> Status final esperado quando o pipeline conclui: nenhum item PENDENTE.

## Resumo
- Total de itens: 7
- PENDENTES: 0
- RESOLVIDOS COM DECISÃO HUMANA: 5
- REFERIDOS À CODIFICAÇÃO: 2

## Itens

### AMB-001 — Taxa de Atendimento do Dashboard (placeholder 94%)
- **Descrição**: KPI "Taxa de Atendimento" não tem fórmula/fonte/período definidos no legado; exibido fixo em `94%`. Migrar como paridade (constante tipada mock) ou definir fórmula?
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-001; `dashboard/requirements.md` (decisão pendente); `gaps.md` G-01
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — manter `94%` como constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`), sem inventar fórmula; correção/fórmula real em fase posterior.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: brief exige paridade 100% e exclui mudanças de comportamento nesta migração.

### AMB-002 — Divergência de critério entre KPIs "Consultas de Hoje" e "Agendamentos Hoje"
- **Descrição**: Contador de Consultas de hoje pode incluir `cancelada`; o de Agendamentos exclui. Unificar ou reproduzir a divergência no alvo?
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-002; `domain.md` §3; `review-report.md` §3
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — reproduzir o critério atual de cada KPI (inclusive a divergência); o codificador **não** deve "consertar" silenciosamente.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: unificação seria correção comportamental fora do escopo.

### AMB-003 — Sincronia automática Agendamento ↔ Consulta (regra inferida BR-A02)
- **Descrição**: A regra "concluir consulta → agendamento `concluido`" é inferida; legado não tem gatilho automático (marcação manual na UI).
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-003; `domain.md` §2.2 (BR-A02 🟡) e §3
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — migrar o comportamento real (transição manual); descartar a inferência de gatilho automático.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: o legado não implementa a regra inferida; automação seria mudança de comportamento fora do escopo de tipos.

### AMB-004 — Política de paginação dos Logs de Acesso
- **Descrição**: Legado carrega 500 registros e renderiza todos os filtrados, sem paginação; política acima de 500 indefinida.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-004; `logs-acesso/screens.md`; `gaps.md` G-02
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — manter carregamento de até 500 registros sem paginação (constante de limite tipada); política real em fase futura.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: implementar paginação seria mudança de comportamento/feature fora do escopo.

### AMB-005 — Aviso visual de "dados de teste" no Modo Offline
- **Descrição**: Badge/aviso "Modo Offline — dados fictícios" recomendado (Q-14/G-04) mas não implementado no legado.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-005; `modo-offline/requirements.md` §7 (P1); `gaps.md` G-04
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: não implementar nesta migração (paridade); registrar como melhoria futura sugerida ao codificador (item pós-cutover).
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: o legado não tem o badge; adicioná-lo seria nova feature.

### AMB-006 — Interpolação de templates sem escape de HTML (XSS potencial)
- **Descrição**: `code-analysis.md` §4.5 registra que a substituição de variáveis de template não escapa HTML (risco XSS). Paridade preserva o comportamento; risco deve ser conhecido pelo codificador.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-MIGRAR-021 (nota); `code-analysis.md` §4.5; propagado em `parity_tests/06-emissao-documento-template.feature`
- **Status**: REFERIDO À CODIFICAÇÃO
- **Decisão tomada**:
  - **Escolha**: propagar como alerta — manter paridade funcional, **não** corrigir nesta migração; tipar de forma que o risco fique visível (ex.: função de interpolação documentada).
  - **Decisor**: curator (recomendação) + revisão humana (paridade)
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: correções de segurança lógica são fase posterior (brief).

### AMB-007 — Vulnerabilidades F-01 (RBAC), F-02 (token em URL), F-03 (IDOR)
- **Descrição**: não conformidades conhecidas do legado que motivaram a migração para tipos; correção lógica fica em fase posterior, mas a camada de tipos deve **detectá-las em compile-time**.
- **Detectado por**: orchestrator (consolidação) — origem no `migration_brief.md` (objetivo/restrições) e nas regras BR-MIGRAR-034/036
- **Origem**: `migration_brief.md` (Objetivo); `target_business_rules.md` BR-MIGRAR-034/036; `target_architecture.md` AD-03; `parity_tests/10-contrato-base44-client.feature`
- **Status**: REFERIDO À CODIFICAÇÃO
- **Decisão tomada**:
  - **Escolha**: o código novo deve tipar RBAC (`role`), parâmetros de URL (token) e escopo de dados (`created_by_id`) de modo que F-01/F-02/F-03 falhem em compile-time onde hoje falham em runtime; a correção lógica fica para fase posterior.
  - **Decisor**: Product Owner/Developer (via brief) + Designer (AD-03)
  - **Quando**: 2026-09-09T16:00:00-03:00
  - **Justificativa**: brief define "detecção em compile-time" como entrega desta migração e "correção lógica" como fase posterior.

## Itens referidos à codificação
> Lista somente itens com status `REFERIDO À CODIFICAÇÃO`. Aparecem destacados em `handoff.md`.

- AMB-006: interpolação de templates sem escape HTML (XSS) — não corrigir; alerta para o codificador + cenário de paridade PT-06.
- AMB-007: F-01 RBAC / F-02 token em URL / F-03 IDOR — tipar para detecção em compile-time; correção lógica em fase posterior (PT-10).

## Notas

- **0 itens PENDENTES** ao final do pipeline (conforme esperado).
- AMB-001…005 resolvidos na pausa humana do Curator (2026-09-09T15:24:37-03:00) pela via da **paridade exata**; uma tentativa de expandir escopo com mudanças comportamentais foi apresentada e **revertida pelo usuário** para paridade.
- AMB-006/007 são referidos à codificação e estarão destacados no `handoff.md` para o agente de codificação.
- Nenhum item `auto-decidido` (modo interativo, sem `--auto`).
