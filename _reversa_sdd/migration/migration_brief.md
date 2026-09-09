---
schemaVersion: 1
generatedAt: 2026-09-09T15:03:57-03:00
reversa:
  version: "1.3.2"
kind: migration_brief
producedBy: orchestrator
hash: "sha256:f42b544795ef5fd7b7b610a5d46d8f3bf5ed16431c748b40ae36f3df43d1669c"
---

# Migration Brief

> Documento de critério de migração coletado em entrevista no início do `/reversa-migrate`.
> Consumido pelos seis agentes do Time de Migração. Não pergunta paradigma (responsabilidade do Paradigm Advisor) nem apetite (derivado em `paradigm_decision.md`).

## Objetivo da migração

Migrar o **Prontuário Fácil** de JavaScript para **TypeScript** (100% de `.ts`/`.tsx`), adicionando type-safety em dados médicos sensíveis e criando a base em compile-time para mitigar 3 vulnerabilidades críticas de segurança (IDOR, token em URL, RBAC inadequado). A arquitetura **React + Vite + Base44 permanece 100% igual** — a migração é uma camada de tipos sobre o runtime atual, sem mudança de backend, banco ou infraestrutura. Sucesso em runtime: compilação segura, sem *runtime surprises*, principalmente em dados LGPD.

> Nota de escopo registrada: a **correção lógica** das vulnerabilidades F-01 (RBAC), F-02 (token em URL) e F-03 (IDOR) está **fora** desta migração (requer mudanças além de tipos; fase posterior). O que esta migração entrega é a capacidade de detectá-las em compile-time via tipos.

## Métricas de sucesso

1. **Paridade funcional 100%** — nenhuma feature quebrada em relação ao legado.
2. **Segurança** — 3 vulnerabilidades de severidade Alta detectáveis em compile-time via types.
3. **LGPD** — tipos obrigatórios em campos sensíveis (CPF, `lgpd_consent`).
4. **Performance** — bundle < 185 KB; build < 4 s.
5. **Cobertura** — 100% do código em TypeScript (`.ts`/`.tsx`).
6. **Manutenibilidade** — 50% menos tempo de refatoração.
7. **Métrica principal (gate de aceite)**: `tsc --noEmit` retorna **0 erros** ao final.

## Restrições

- **Prazo**: 6–10 dias úteis. Fase 1 (Setup): 1–2 d. Fase 2 (Migração): 3–5 d. Fase 3 (Testes): 2–3 d. Buffer: +2–3 d.
- **Orçamento**: ~US$ 3,1k–4,7k (50–70 h de dev). Desenvolvimento 40–56 h; Testes & QA 8–10 h; Documentação 2–4 h; Contingência 20%.
- **Técnicas (não mudam)**:
  - Base44 SDK v0.8.43+ (contrato de API fixa, imutável).
  - React v18.2+ (compatibilidade shadcn/ui + Radix UI).
  - Vite v6.1+ (build tool).
  - `base44.auth.me()` imutável.
  - Schemas Base44 em `base44/entities/` não mudam.
  - Modo offline (`mockClient.js`) compatível com os tipos novos.
- **Regulatórias (LGPD)**:
  - CPF sempre criptografado.
  - Campos `lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip` obrigatórios e type-safe.
  - Auditoria `AccessLog` preservada.
  - Isolamento multi-tenant por médico/clínica — TypeScript força filtros `created_by_id`.
- **Operacionais**:
  - Sem downtime (build local + deploy silencioso via PR).
  - Rollback < 5 min se necessário.
  - Modo offline (`VITE_OFFLINE=true`) funcionando igual.
  - Nenhuma janela de manutenção exigida.

## Fatores de risco conhecidos

1. **Refatoração silenciosa em escala**: 60+ arquivos JSX/JS podem introduzir erros que passam despercebidos — projeto tem 0 testes automatizados.
2. **Dependência crítica do Base44 SDK**: incompatibilidade entre tipos TypeScript e a versão do SDK derruba a build inteira.
3. **Regressão LGPD**: campos sensíveis (CPF, `lgpd_consent`) precisam manter criptografia e auditoria durante a migração; qualquer erro quebra conformidade.
4. **Falta de CI/CD**: sem pipeline automatizado, erros só aparecem em testes manuais.
5. **Modo offline frágil**: `mockClient.js` precisa permanecer sincronizado com os tipos novos; risco de desacoplamento.
6. **Dependências não utilizadas**: Stripe e react-leaflet estão no `package.json` mas fora do código; podem gerar conflitos de tipo durante a migração.
7. **Prazo apertado**: 6–10 dias para 50–70 h de trabalho; possível incompatibilidade entre TypeScript strict mode e bibliotecas externas (Radix UI / shadcn/ui).

## Stakeholders

| Nome / papel | Responsabilidade na migração |
|---|---|
| Product Owner / Developer (único) | Aprovação de PRs, decisões arquiteturais e aceite final da migração |

## Stack alvo

- **Linguagem**: TypeScript 5.8.2 (100% de cobertura em `.ts`/`.tsx`)
- **Framework**: React 18.2 + Vite 6.1 (tooling mantido)
- **Componentes & UI**: Radix UI + shadcn/ui + Tailwind CSS 3.4 (sem mudanças)
- **Estado & Data Fetching**: TanStack React Query 5.84 + React Hook Form 7.54 + Zod 3.24 (validação type-safe)
- **Roteamento**: React Router DOM 7.18 (mantido)
- **Backend**: Base44 SDK v0.8.43+ (BaaS imutável — contrato de API preservado)
- **Banco**: em aberto — gerenciado pelo Base44; nenhuma mudança necessária para a migração de tipos
- **Mensageria**: em aberto — SPA sem fila/pub-sub
- **Infra**: em aberto — mantém deployment atual (Vite static export + Base44 cloud); sem mudanças para TypeScript
- **Observabilidade**: em aberto — hoje não configurada. Pós-migração, avaliar: (1) APM (Datadog/New Relic); (2) logging centralizado (Sentry) para rastrear F-01/F-02/F-03; (3) strict mode como visibilidade de type-safety

**Resumo da stack**: ~95% idêntica à atual — a migração adiciona TypeScript como camada de compile-time, sem alterações de runtime ou infraestrutura.

## Escopo declarado

- **Incluído**:
  - Todos os 9 módulos de negócio: Pacientes, Agendamentos, Consultas, Templates, Prescrições, Exames, Médicos, Dashboard e Logs de Acesso.
  - Autenticação Base44 tipada (`base44.auth.me()`).
  - Camadas técnicas convertidas para `.ts`/`.tsx` com 100% de cobertura de tipos: `src/api/`, `src/lib/`, `src/components/`, `src/pages/`.
  - Modo offline: `mockClient.ts` + `mockSeed.ts` preservando persistência em `localStorage`.
  - React Query com tipos; React Hook Form + Zod type-safe; React Router tipado.
  - Novo diretório `src/types/` com interfaces de entidades: `Patient.ts`, `Doctor.ts`, `Appointment.ts`, `Consultation.ts`, `Prescription.ts`, `Exam.ts`, `Template.ts`, `AccessLog.ts`, `User.ts`.
- **Excluído**:
  - Backend Base44 (contrato de API imutável).
  - Entity Policies / RLS no Base44 (fora do frontend).
  - Infraestrutura e deploy (sem mudanças).
  - Banco de dados (gerenciado pelo Base44).
  - Novas features (escopo é migração, não desenvolvimento).
  - Correção lógica das vulnerabilidades P1 — F-01 RBAC, F-02 token em URL, F-03 IDOR (requerem mudanças além de tipos; fase posterior).
  - Testes automatizados (projeto não tem framework; não se adiciona framework nesta migração).

## Notas livres

- Migração de tipos apenas: a árvore de arquivos, dependências de runtime e o contrato Base44 não mudam; o único delta de build é a camada TypeScript.
- Vulnerabilidades a tornar detectáveis em compile-time: F-01 (RBAC), F-02 (token em URL), F-03 (IDOR) — verificar fontes no legado (`_reversa_sdd/code-analysis.md`, `gaps.md`).
- Preferência do stakeholder único (PO/Dev): decisões arquiteturais e aceite final concentrados na mesma pessoa; manter artefatos enxutos e objetivos.
