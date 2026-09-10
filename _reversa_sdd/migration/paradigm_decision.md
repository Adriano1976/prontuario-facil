---
schemaVersion: 1
generatedAt: 2026-09-09T15:07:19-03:00
reversa:
  version: "1.3.2"
kind: paradigm_decision
producedBy: paradigm_advisor
hash: "sha256:f114b42ffbe9e7b797eafd036d3d7e08510ed85a98dab57cbca2f28a7fecd92e"
---

# Paradigm Decision

> Decisão consciente sobre como tratar a mudança (ou ausência) de paradigma entre o legado e a stack alvo.
> Este artefato é leitura obrigatória primeiro para qualquer agente posterior e para o agente de codificação.

## Paradigma do legado detectado
- **Paradigma principal**: funcional/declarativo (componentes React + hooks + TanStack Query; sem classes de domínio)
- **Confiança**: 🟢 CONFIRMADO
- **Evidências**:
  - `architecture.md` §1: "SPA (React 18 + Vite)… estado de servidor gerenciado pelo TanStack Query e a UI usa Radix UI (shadcn/ui) + Tailwind CSS" — UI declarativa, sem camada de classes.
  - `inventory.md` (estrutura de pastas): `src/pages/*.jsx` (12 páginas funcionais), `src/hooks/use-mobile.jsx`, componentes como `PatientSearch.jsx`, `LGPDConsent.jsx` — componentes funcionais, sem classes de domínio.
  - `code-analysis.md` §4.1–4.5: lógica expressa como funções puras / helpers dentro de componentes (`calculateAge`, filtro combinado via `filter`, substituição de template por `replace` encadeado) — estilo funcional leve.
  - `consultas/design.md` e `agendamentos/design.md`: pages consomem dados via React Query (`Appointments.jsx` consulta agendamentos/médicos/pacientes via React Query) — dados declarativos, sem Active Record nem controllers próprios.
  - `database/business-rules.md`: "Não foram detectadas Stored Procedures puras… lógicas reativas… são tratadas por hooks do próprio Base44" — backend é BaaS; não há OO de servidor no escopo do frontend.
- **Variações observadas**: N/A — paradigma único e consistente (nenhuma evidência de OO clássico, herança, DI containers ou event-driven no frontend).

## Stack alvo declarada
- Linguagem: TypeScript 5.8.2 (100% de `.ts`/`.tsx`) — **superconjunto do JavaScript atual**; sem mudança de linguagem de runtime.
- Framework: React 18.2 + Vite 6.1 (mantidos); Radix UI/shadcn/ui + Tailwind 3.4; TanStack Query 5.84; React Hook Form 7.54 + Zod 3.24; React Router DOM 7.18.
- Backend: Base44 SDK v0.8.43+ (BaaS imutável, contrato preservado).
- Infra: Vite static export + Base44 cloud — sem mudanças.

## Paradigma natural inferido
- **Paradigma**: funcional/declarativo (React) — **idêntico ao do legado**
- **Justificativa**: a stack alvo é a própria stack do legado com TypeScript adicionado como camada de compile-time. TypeScript não impõe um paradigma novo sobre React; componentes funcionais + hooks + consultas declarativas (TanStack Query) continuam sendo o modelo natural. A tipagem adiciona disciplina de dados (unions, discriminated states) mas não altera o paradigma de composição de UI.
- **Alternativas viáveis**: não aplicável — não há troca de stack; forçar um paradigma distinto (ex.: OO com classes de domínio) seria introduzir atrito sem ganho, contrariando o brief ("arquitetura 100% igual").

## Gap identificado
- **Severidade**: nenhum
- **Implicações concretas**: sem implicações de mudança paradigmática. Implicações decorrentes da camada de tipos (não de paradigma) são listadas abaixo e repassadas aos próximos agentes:
  - Regras LGPD/RLS (CPF criptografado, `lgpd_consent*` obrigatórios, filtros `created_by_id`) deixam de ser convenção e viram **tipos obrigatórios** (compile-time).
  - Estados de entidades (ex.: `Appointment`, `Consultation` com máquinas de estado) podem virar **discriminated unions** para eliminar estados inválidos em runtime.
  - F-01 (RBAC), F-02 (token recebido por URL), F-03 (IDOR): os elementos que essas não conformidades exploram (`role`, `created_by_id`, params de URL) passam a ser **exigidos pelos contratos internos**; correção lógica fica em fase posterior (fora do escopo declarado no brief). Tipos restringem **forma** — não detectam autorização nem vazamento.
  - Modo offline (`mockClient.ts`) precisa manter contrato idêntico ao do SDK real sob tipos — sincronia de tipos entre os dois caminhos.

## Opções apresentadas ao usuário
1. **Adotar paradigma natural da stack** (transformacional)
   - Consequências: N/A como mudança — o paradigma natural é o mesmo do legado; adotá-lo significa apenas manter o modelo funcional/declarativo atual e adicionar tipos. (Opção default quando há gap; aqui o gap é zero.)
2. **Forçar paradigma similar ao legado** (conservador)
   - Consequências: idêntico ao legado por definição (o legado já é o alvo). Nenhum custo idiomático a evitar.
3. **Híbrido** (equilibrado)
   - Consequências: N/A — não há dois paradigmas a reconciliar.

## Decisão do usuário
- **Escolha**: confirmação de "sem mudança de paradigma" (gap = nenhum); apetite default para gap nulo.
- **Justificativa do usuário**: "Confirmo: sem mudança de paradigma, apetite balanced" — a migração JS→TS é camada de tipos sobre a mesma stack React/Base44; sem refatoração paradigmática.
- **Decidido em**: 2026-09-09T15:07:19-03:00

## Apetite derivado
- `derived_appetite`: balanced

## Implicações pendentes para próximos agentes
| Agente | Implicação | Como honrar |
|---|---|---|
| Curator | Regras de negócio (LGPD, máquinas de estado, RLS/ownership) devem sobreviver como tipos no alvo | Migrar regras para o alvo preservando semântica; sinalizar o que vira tipo obrigatório |
| Strategist | Sem mudança de paradigma → estratégia de migração incremental por módulos com paridade por regra | Dimensionar estratégia compatível com apetite `balanced` (tipos primeiro, sem rewrite) |
| Designer | Topologia e arquitetura do alvo = espelho do legado (mesma stack); tipos de domínio novos (`src/types/*.ts`) | Manter a topologia equivalente; modelar `src/types/` com os 8 módulos e as 9 entidades Base44 |
| Screen Translator | UI mantém modo literal (mesma stack, mesma biblioteca de componentes) | Confirmar que não há mudança de plataforma de UI (shadcn/Radix se mantém) |
| Inspector | Critério de paridade: comportamento idêntico + `tsc --noEmit` 0 erros + tipos obrigatórios em campos sensíveis | Incluir gate de tipos (compile-time) nos critérios de paridade |

## Notas
- A decisão paradigmática desta migração é deliberadamente **conservadora quanto a paradigma** (nenhum gap) e **transformadora quanto a disciplina de tipos** (100% TS). O `derived_appetite` `balanced` reflete isso: tipos em todo o código, sem mudança de arquitetura ou padrões de runtime.
- Leitura obrigatória para Curator, Strategist, Designer, Screen Translator, Inspector e para o agente de codificação: **nenhuma transformação de paradigma deve ser aplicada**; qualquer sugestão de reescrever módulos em estilo diferente do React funcional atual deve ser recusada.
