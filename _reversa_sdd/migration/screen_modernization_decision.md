---
schemaVersion: 1
generatedAt: 2026-09-09T15:48:54-03:00
reversa:
  version: "1.3.2"
kind: screen_modernization_decision
producedBy: screen-translator
decidedBy: Product Owner/Developer
decidedAt: 2026-09-09T15:50:00-03:00
mode: literal
sourcePlatform: react-hooks
targetPlatform: web-spa
hash: "sha256:4c42b75790b8275cce6301ec605f8ed810f3eeca60dcf98be5de7b20fe9c44a0"
---

# Decisão de Modernização de Telas

> Decisão consciente sobre como traduzir as telas do sistema legado: paridade observável byte-a-byte, redesign idiomático para a plataforma alvo, ou combinação tela-a-tela.
> Este artefato é leitura obrigatória do próprio Screen Translator (para gerar `target_screens.md`), do Inspector (para construir parity tests adequados ao modo) e do agente de codificação.

## Contexto

- **Plataforma origem detectada**: `react-hooks` — SPA React 18 com componentes funcionais, hooks e TanStack Query, UI shadcn/ui (Radix) + Tailwind (assinatura 🟢: `src/pages/*.jsx` com componentes funcionais + `useState`/`useEffect` — `_reversa_sdd/code-analysis.md`, `_reversa_sdd/inventory.md`)
- **Confiança**: 🟢 CONFIRMADO
- **Plataforma alvo**: `web-spa` — **a mesma SPA React 18 + Vite + shadcn/Radix + Tailwind**, agora em TypeScript strict (`paradigm_decision.md`, `topology_decision.md`, `target_architecture.md`). Não há troca de plataforma de UI: o runtime visual é idêntico.
- **Telas inventariadas**: 16 (15 documentadas em `_reversa_sdd/ui/inventory.md` + `Detalhe do Paciente`/`PatientDetail.jsx`, mapeado em código)
- **Origem do inventário**: `_reversa_sdd/screens/inventory.json` + `_reversa_sdd/ui/inventory.md`
- **Adapter aplicado**: **caso especial — origem ≡ alvo em plataforma** (React → React). O catálogo `adapter-pairs.md` cobre trocas de plataforma; aqui não há troca: as telas do alvo **são** as telas do legado convertidas de `.jsx` para `.tsx`, com os **mesmos** componentes shadcn/Radix, mesmos tokens e mesmo Tailwind. A paridade visual é **por construção** (mesmo componente executado no mesmo runtime), não por re-expressão em outra biblioteca.

## Modos avaliados

### Modo: literal
- **Definição**: cada tela legada é reproduzida no alvo com hierarquia, textos, tokens, componentes e comportamento idênticos — a mudança é apenas de tipos (`.jsx` → `.tsx`). **É o único modo coerente quando origem e alvo são a mesma plataforma**.
- **Trade-offs**:
  - Custo de implementação: baixo (conversão tipada, sem re-expressão visual)
  - Fidelidade visual: alta (idêntica — mesmo runtime/componentes/Tailwind)
  - Viabilidade de parity tests construtivos: sim (comparar árvore de componentes/tokens + smoke visual; golden por screenshot do oráculo offline quando capturado)
  - Aceitação esperada do usuário final: alta (nenhuma mudança perceptível)
  - Débito técnico futuro: baixo (sem divergência visual introduzida)
- **Recomendado**: sim
- **Justificativa**: como o alvo mantém React + shadcn/Radix + Tailwind (paradigma gap nenhum, topologia híbrida preservando componentes), modernizar telas seria **mudança de comportamento/visual** — proibida pela paridade 100% do brief e pelas decisões BR-HUMANA-001…005. Literal também satisfaz RF-13 por construção: não há re-expressão em outra biblioteca, então screenshot do legado não é pré-requisito (o componente legado é o próprio artefato a tipar).

### Modo: modernizado
- **Definição**: redesign idiomático das telas no alvo (nova hierarquia/estados) mesmo mantendo React.
- **Trade-offs**:
  - Custo de implementação: alto
  - Fidelidade visual: baixa (redesign)
  - Viabilidade de parity tests construtivos: parcial (contrato semântico, não visual)
  - Aceitação esperada do usuário final: incerta (mudança perceptível sem pedido)
  - Débito técnico futuro: médio (introduz divergência de UI)
- **Recomendado**: não
- **Justificativa**: viola a paridade 100% e o escopo "migração de tipos, sem novas features" do brief; não há pedido de redesign. Seria correto apenas se o alvo trocasse de plataforma visual (não é o caso).

### Modo: híbrido
- **Definição**: parte das telas em literal, parte modernizada.
- **Trade-offs**:
  - Custo de implementação: médio-alto
  - Fidelidade visual mista: inconsistente entre telas
  - Viabilidade de parity tests: parcial por subset
  - Custo de manutenção da separação: alto
- **Recomendado**: não
- **Justificativa**: sem troca de plataforma não há telas que se beneficiem de modernização; híbrido só adicionaria inconsistência visual sem ganho.

## Decisão

- **Modo escolhido**: literal
- **Justificativa do humano**: aceitou a recomendação do Screen Translator — mesma plataforma React (origem ≡ alvo), paridade visual por construção; modernizar violaria a paridade 100% do brief e as decisões BR-HUMANA-001…005.
- **Alternativas descartadas**: modernizado (redesign não solicitado, fora do escopo de tipos); híbrido (sem base — nenhuma tela se beneficia de modernização sem troca de plataforma).
- **Decidido em**: 2026-09-09T15:50:00-03:00
- **Decidido por**: Product Owner/Developer (stakeholder único)

### Em modo híbrido, listas explícitas (obrigatórias)

**Telas em modo literal**:
- (N/A — modo híbrido não escolhido)

**Telas em modo modernizado**:
- (N/A — modo híbrido não escolhido)

> Listas vazias bloqueiam a Fase 2. O agente recusa prosseguir. — N/A: modo escolhido foi **literal** (todas as 16 telas).

## Implicações pendentes para a Fase 2

| Etapa | Implicação | Como honrar |
|---|---|---|
| Geração de `target_screens.md` | Telas = espelho das telas legadas com hierarquia de componentes e tokens; origem `<arquivo.jsx>` para cada uma | Gerar seção por tela em `component-tree`/referência de conversão; mudança = tipos apenas |
| Captura de golden files | Oráculo = a própria SPA offline (`VITE_OFFLINE=true`) — executável; captura de screenshots é manual em v1 | Emitir `manifest.yaml` com comando sugerido (`npm run dev` + navegador), `present: false` |
| Tokens do design-system | Design system do legado já existe (`_reversa_sdd/design-system/tokens.md`) e **não muda** | Referenciar tokens existentes; nenhum token derivado esperado |
| Conteúdo textual | Todos os textos (labels, mensagens, placeholders) preservados literalmente | Zero diff de strings; sem revisão linguística sem aprovação |

## Implicações para o Inspector

- **Estratégia de paridade**:
  - Modo literal → paridade visual por construção (mesmo runtime) + verificação de que a conversão não alterou textos/tokens/hierarquia; comparação de árvore de componentes por tela.
  - A validação de paridade **não é byte-a-byte de render** (web) — é: mesma tela existe, mesmos componentes/tokens, mesmos textos, mesmos estados e transições.
- **Deviations conhecidas a propagar**: ver `screen_deviation_log.md` (esperado: nenhuma em modo literal; divergências tipográficas pré-existentes do legado são preservadas — EC-11).

## Notas

- Este é o caso canônico "mesma plataforma": a tradução de telas se reduz a **tipar componentes sem mudar o que é renderizado**. Qualquer sugestão de redesenhar telas durante a migração deve ser recusada (mesma regra do `paradigm_decision.md` para o código).
- Em modo literal com a mesma plataforma, RF-13 (screenshot obrigatório) é satisfeito **por construção**: o componente legado é o artefato-fonte a converter, não há re-expressão visual em outra biblioteca.
- `Detalhe do Paciente` (`PatientDetail.jsx`) consta no inventário do agente mas não no `ui/inventory.md` (divergência 6,7% < 10%) — será especificado normalmente; o Visor pode adicioná-lo depois.
