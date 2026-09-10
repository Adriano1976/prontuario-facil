---
schemaVersion: 1
generatedAt: 2026-09-09T15:25:40-03:00
reversa:
  version: "1.3.2"
kind: migration_strategy
producedBy: strategist
hash: "sha256:e10d2717edb48b423dce1a3ea1de2a31c98b59252610206a2b5148cdaf32e284"
---

# Migration Strategy

> Estratégias de migração avaliadas com trade-offs explícitos. A estratégia recomendada é a sugestão do Strategist; a decisão final é humana.

## Contexto sintetizado

- **Tamanho do legado**: SPA React pequena/média — 12 pages em `src/pages/`, 61 componentes (49 deles em `components/ui`, shadcn/ui + Radix), 8 entidades via Base44, **87 arquivos JS/JSX** no total (contagem de 2026-09-10). Sem servidor próprio; frontend puro no navegador.
- **Integrações externas vivas**: apenas **Base44** (BaaS — auth + CRUD). Stripe, react-leaflet, jsPDF/html2canvas e lodash são **resíduos sem uso** (`dependencies.md`), candidatos a remoção ou `@ts-ignore` pontual.
- **Apetite derivado** (`paradigm_decision.md`): `balanced`.
- **Gap de paradigma**: nenhum (mesma stack React funcional; TS é camada de tipos).
- **Restrições do brief**: 6–10 dias úteis; ~50–70 h; **sem downtime**; **rollback < 5 min**; deploy silencioso via PR; sem janela de manutenção; LGPD (CPF criptografado, consentimento, RLS espelhada); Base44 e schemas imutáveis; modo offline compatível.
- **Natureza da migração**: JS→TS na **mesma stack, mesmo runtime, mesmos dados (BaaS intocado), mesmo deploy**. Não há migração de dados nem segundo ambiente executável. O "gate de paridade" é `tsc --noEmit` + validação de tipos + revisão, não execução paralela de dois sistemas.
- **Regras críticas** (Curator): LGPD/consentimento, RLS espelhada (`created_by_id`), máquinas de estado de Appointment/Consultation, enums de domínio.

## Estratégias avaliadas

### Estratégia A: Migração incremental por camadas (Branch by Abstraction adaptado)
- **Descrição**: Converter o código para TS **em ondas por camada/módulo**, mantendo o build Vite **verde em cada onda** (TS compila junto com JS residual via `allowJs` temporário). Ordem: (1) setup TS (`tsconfig`, scripts, tipos base); (2) `src/types/` com as 9 interfaces de entidade; (3) camadas de menor acoplamento (`src/api/`, `src/lib/`, hooks); (4) componentes de UI por módulo de negócio; (5) pages por módulo (pacientes → consultas → agendamentos → médicos → templates → logs → dashboard); (6) modo offline; (7) hardening: `strict: true` em 100%, `allowJs` removido, `tsc --noEmit` = 0. Cada onda = 1+ PRs pequenos revisáveis e reversíveis.
- **Quando aplica**: migração interna em que a linguagem muda e o domínio/runtime ficam; apetite conservador a balanced; necessidade de manter o sistema utilizável durante a migração.
- **Custo**: baixo
- **Risco**: baixo
- **Tempo**: médio (compatível com 6–10 dias em 3–5 ondas de migração + 2–3 de testes)
- **Adequação ao apetite derivado** (`balanced`): **alta** — incremental sem rewrite, com gate de qualidade a cada onda; é o meio-termo entre conservador (tipos mínimos) e transformacional (100% TS).
- **Trade-offs**:
  - Prós: build utilizável durante toda a migração; PRs pequenos revisáveis pelo PO/Dev único; rollback trivial por PR (< 5 min); erros de tipo localizados por onda; alinhado ao brief (paridade, sem downtime).
  - Contras: período de convivência JS+TS exige disciplina com `allowJs`/`@ts-ignore`; fronteira JS/TS temporária pode gerar chamadas sem tipo entre camadas (mitigado convertendo folhas primeiro).

### Estratégia B: Big Bang (PR único de conversão total)
- **Descrição**: Converter 100% dos arquivos JS/JSX → TS/TSX em **um único PR/onda**, com `allowJs` apenas durante o trabalho e `strict` ligado no final; merge somente com `tsc --noEmit` = 0.
- **Quando aplica**: sistema pequeno; janela tolerada; apetite transformational; poucas integrações vivas.
- **Custo**: baixo
- **Risco**: alto
- **Tempo**: curto
- **Adequação ao apetite derivado** (`balanced`): **baixa** — é a opção mais "transformational"; o apetite `balanced` não pede risco concentrado.
- **Trade-offs**:
  - Prós: mais rápido em horas brutas; sem fronteira JS/TS temporária; sem custo de convivência.
  - Contras: PR gigante (87 arquivos) difícil de revisar pelo PO/Dev único; erro tipográfico/regressão em qualquer módulo só aparece no fim (projeto tem **0 testes**); rollback é tudo-ou-nada; risco alto de "refatoração silenciosa" (risco nº 1 do brief) materializado; contraria o plano de fases do brief (Setup 1–2 d → Migração 3–5 d → Testes 2–3 d).

### Estratégia C: Strangler Fig (dois sistemas coexistindo com roteamento)
- **Descrição**: Rodar o "sistema novo" (TS) em paralelo ao legado (JS) com proxy/gateway roteando tráfego entre ambos, migrando fatia a fatia.
- **Quando aplica**: sistema em produção com roteamento possível (proxy/API gateway) e dois artefatos executáveis.
- **Custo**: alto
- **Risco**: baixo
- **Tempo**: longo
- **Adequação ao apetite derivado** (`balanced`): **não se aplica** — não há dois sistemas: o alvo é a **mesma SPA** com a mesma stack, mesmo deploy Vite + Base44, sem segundo artefato para rotear. Criar um segundo deploy para validar tipos adicionaria custo (alto) e tempo (longo) sem ganho de paridade, porque o runtime não muda.

> **Parallel Run** foi considerado e descartado pela mesma razão: prova de equivalência em dois sistemas é desnecessária quando a mudança é de **tipos** sobre o mesmo runtime. A validação de paridade apropriada é `tsc --noEmit` + smoke manual online/offline + revisão (Inspector), não execução paralela com dados duplicados.

## Comparativo

| Critério | A (Incremental) | B (Big Bang) | C (Strangler) |
|---|---|---|---|
| Custo | baixo | baixo | alto |
| Risco | baixo | alto | baixo |
| Tempo | médio | curto | longo |
| Aderência ao apetite (`balanced`) | alta | baixa | N/A |
| Compatibilidade com mudança de paradigma (nenhuma) | total | total | N/A (sem 2º sistema) |
| Alinhamento ao brief (PRs, rollback <5min, fases) | alto | baixo | N/A |
| Revisabilidade por PO/Dev único | alta | baixa | N/A |

## Recomendação do Strategist
- **Estratégia recomendada**: A — Migração incremental por camadas (Branch by Abstraction adaptado)
- **Justificativa**: (1) o apetite `balanced` e o gap de paradigma **nenhum** apontam para conversão incremental sem rewrite — a Estratégia A é exatamente isso; (2) o brief exige **sem downtime, rollback < 5 min e PRs revisáveis** — A entrega por construção (cada onda é um PR reversível), enquanto B concentra o risco de regressão silenciosa num PR único num projeto com **0 testes**; (3) as regras LGPD/RLS críticas curadas pelo Curator podem ser validadas módulo a módulo, mantendo o gate de paridade verificável a cada onda; (4) B só se justifica com apetite transformational, que não é o caso; (5) C/Parallel Run são inaplicáveis por inexistência de segundo sistema.

## Sinais de alerta específicos
- **Sem mudança de paradigma + apetite balanced + sistema pequeno em produção** → o sinal do catálogo ("Parallel Run para validar paridade") **não dispara** porque não há runtime novo; o equivalente é o **gate `tsc --noEmit` + smoke tests** previsto no brief (métrica principal) e na Estratégia A onda 7.
- **Risco nº 1 do brief (refatoração silenciosa sem testes)** → mitigado por ondas pequenas + revisão por PR + smoke manual por módulo.
- **Risco nº 6 (dependências declaradas e não usadas)** → são 14 deps de runtime sem import em `src/` (grep 2026-09-10; ver `migration_brief.md` risco 6). Na Estratégia A, decidir na onda 1 se removemos (melhor) ou tipamos como resíduo (`@ts-expect-error` justificado) para não travar a migração — **sempre com reconfirmação por grep e aprovação do usuário** (RISK-006). Não introduzir `zod`/`@hookform/resolvers` (estão no `package.json` mas não no legado).
- Se o usuário escolher B, exigir plano de rollback robusto (git revert do PR único) e smoke manual dos 8 módulos antes do merge.

## Decisão humana
- **Estratégia escolhida**: A — Migração incremental por camadas (Branch by Abstraction adaptado)
- **Quem decidiu**: Product Owner/Developer (stakeholder único)
- **Quando**: 2026-09-09T15:26:00-03:00
- **Justificativa do decisor**: aceitou a recomendação do Strategist — ondas incrementais com build verde, PRs pequenos reversíveis e alinhamento ao brief (paridade comportamental verificada por smoke; rollback < 5 min; fases Setup→Migração→Testes).
