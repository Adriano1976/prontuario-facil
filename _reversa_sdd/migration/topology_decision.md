---
schemaVersion: 1
generatedAt: 2026-09-09T15:27:30-03:00
reversa:
  version: "1.3.2"
kind: topology_decision
producedBy: designer
hash: "sha256:eb5ea9122c9b3b02ebcfd70ea3e0fa7b1c45a172520cb5a4fb015a74c4221d9b"
---

# Topology Decision

> Decisão consciente sobre como organizar o sistema novo: preservar a topologia do legado, adotar uma topologia moderna ou aplicar um híbrido.
> Este artefato é leitura obrigatória do próprio Designer (para decompor bounded contexts) e do agente de codificação (para criar a árvore de pastas).

## Topologia do legado detectada
- **Padrão organizacional**: híbrido: **package-by-feature no nível de páginas + subpastas de componentes por domínio**, com **camadas transversais por tipo** (api/lib/hooks/utils) — sem bounded contexts explícitos
- **Confiança**: 🟢 CONFIRMADO
- **Evidências**:
  - `_reversa_sdd/inventory.md` (estrutura de pastas): `src/pages/` contém uma página por domínio (`Patients.jsx`, `Consultations.jsx`, `Appointments.jsx`, `Doctors.jsx`, `Templates.jsx`, `AccessLogs.jsx`, `Dashboard.jsx`) — package-by-feature no nível de páginas.
  - `_reversa_sdd/inventory.md`: `src/components/` organiza por domínio em subpastas (`appointments/`, `medical/`) + `ui/` (shadcn/Radix, transversal) — componente por domínio embutido na camada de componentes.
  - `_reversa_sdd/inventory.md`: camadas transversais por tipo: `src/api/` (cliente Base44), `src/lib/` (AuthContext, query-client, utils), `src/hooks/` (use-mobile), `src/utils/` (index.ts) — package-by-layer de suporte.
  - `_reversa_sdd/architecture.md` §1: "estado de servidor gerenciado pelo TanStack Query… UI Radix UI (shadcn/ui) + Tailwind" — organização de pastas não segue DDD/bounded contexts; é uma SPA de escopo pequeno-médio.
  - `_reversa_sdd/code-analysis.md` §4.1: `calculateAge` **duplicado** em `Patients.jsx:59-69` e `PatientDetail.jsx:124-134` — sintoma de ausência de fronteira de domínio compartilhado entre páginas do mesmo módulo.
- **Mapa da árvore legada** (resumido):
  ```
  prontuario-facil/
  ├── base44/entities/*.jsonc          ← schemas BaaS (8 entidades)
  ├── src/
  │   ├── api/base44Client.js          ← cliente único @base44/sdk (+ mockClient.js/mockSeed.js)
  │   ├── components/                  ← appointments/, medical/, ui/ (shadcn ~60)
  │   ├── hooks/use-mobile.jsx
  │   ├── lib/                         ← AuthContext, NavigationTracker, query-client, PageNotFound, utils, app-params
  │   ├── pages/                       ← 13 páginas por domínio
  │   ├── utils/index.ts               ← createPageUrl
  │   ├── App.jsx, Layout.jsx, pages.config.js, main.jsx, index.css
  ```

## Diagnóstico estrutural
- **Acoplamento**: médio — pages dependem de componentes de domínio, camadas `api/`/`lib/` e do SDK Base44 diretamente; páginas do mesmo domínio duplicam lógica (ex.: `calculateAge`); sem repositório/porta por domínio entre page e SDK.
- **Coesão por módulo**: média — subpastas `components/appointments/` e `components/medical/` indicam coesão por domínio, mas regras/helpers vivem espalhados entre pages (ex.: cálculo de idade e filtros combinados em `Patients.jsx`, slots de horário em páginas de agendamento — `code-analysis.md` §4.1/4.2/4.5 e agendamentos).
- **Módulos órfãos / mortos**: nenhum arquivo de `src/` órfão identificado; dependências mortas (Stripe, react-leaflet, jsPDF, html2canvas, lodash) são de `package.json`, não pastas — ver `dependencies.md`.
- **Camadas redundantes**: `src/utils/index.ts` (1 função) coexiste com `src/lib/utils.js` (shadcn `cn`) — redundância leve de nomenclatura; duplicidade de libs de data (`moment` + `date-fns`) e toast (`sonner` + `react-hot-toast`) em `package.json`.
- **Violações de fronteira**: pages chamam `base44.entities.<X>` diretamente (sem camada de repositório tipada por domínio); a fronteira "api" é só o cliente HTTP — o contrato de dados não tem dono por domínio (origem do risco F-03/IDOR e de BR-MIGRAR-034).
- **Mistura de paradigmas/estilos**: homogêneo — React funcional + hooks + TanStack Query em todo o código (confirma `paradigm_decision.md`).
- **Avaliação geral**: **parcialmente problemática** — funcionalmente saudável e pequena, mas sem fronteiras de domínio explícitas (duplicação intra-módulo, acesso a dados acoplado às pages) e com nomes de camada redundantes.

## Topologia moderna proposta
- **Padrão**: **feature-sliced / vertical slices por domínio com camada de tipos centralizada** — páginas, componentes, hooks e tipos de um domínio sob uma pasta própria (`src/features/<domínio>/`), com `src/types/` (entidades) e `src/api/` (contrato `Base44Client` tipado) como camadas compartilhadas.
- **Justificativa**: o objetivo central da migração (type-safety em dados médicos + detectar F-01/F-02/F-03 em compile-time) é maximizado quando cada domínio tem **fronteira clara** (componentes + páginas + tipos co-localizados) e o acesso a dados passa por um **contrato tipado único** (`Base44Client` — BR-MIGRAR-038). Isso elimina a duplicação intra-módulo (ex.: `calculateAge`), dá dono ao contrato de dados (mitiga IDOR/ownership) e mantém a árvore pequena o bastante para não exigir monorepo.
- **Ganhos concretos esperados**:
  - Testabilidade isolada por domínio (uma pasta = um módulo testável).
  - Detecção em compile-time de acesso fora de escopo (`created_by_id`) via contrato tipado.
  - Onboarding mais rápido (mapa mental = árvore de features).
- **Custo / risco**:
  - Reorganização de pastas (mover components/pages por domínio) — esforço e diff além da conversão de tipos.
  - Contraria o "100% igual" literal do brief se aplicada em toda a árvore.
- **Esboço da árvore proposta**:
  ```
  src/
  ├── app/                 ← App, Layout, rotas (pages.config), providers
  ├── api/                 ← Base44Client (interface), sdkClient, mockClient, mockSeed
  ├── types/               ← entidades por arquivo (Patient.ts, Doctor.ts, ...) + tipos LGPD
  ├── features/
  │   ├── pacientes/       ← pages + components + hooks do domínio
  │   ├── consultas/       ← inclui prescrições/exames
  │   ├── agendamentos/
  │   ├── medicos/
  │   ├── templates/
  │   ├── logs-acesso/
  │   └── dashboard/
  ├── components/ui/       ← shadcn/Radix (transversal, como hoje)
  └── lib/                 ← AuthContext, query-client, utils (transversal)
  ```

## Opções apresentadas ao usuário
1. **Preservar topologia legada** (conservador)
   - Consequências: mantém a árvore atual 1:1 (pages/components/hooks/lib/api + **único delta: novo `src/types/`**, já previsto no brief); risco mínimo de migração; perpetua duplicação intra-módulo e acesso a dados acoplado às pages (débitos estruturais leves do diagnóstico).
2. **Adotar topologia moderna proposta** (transformacional)
   - Consequências: reorganiza `src/` em `features/` por domínio + `app/` + `types/` + `api/` tipada; rompe com duplicação e dá fronteiras por domínio; exige mover arquivos além de tipá-los (diff maior, mais tempo, contradiz "arquitetura 100% igual" do brief e a estratégia A incremental pura).
3. **Híbrido** (equilibrado)
   - Consequências: **preserva a árvore atual** (páginas em `src/pages/`, componentes em `src/components/<domínio>/`) e adota o moderno apenas onde o delta já existe e o ganho é direto: novo `src/types/` com entidades/LGPD; novo `src/api/` com **contrato `Base44Client` tipado** implementado por SDK e mock (BR-MIGRAR-038); helpers duplicados intra-domínio (ex.: `calculateAge`) extraídos para um módulo tipado compartilhado do domínio. Sem mover pastas inteiras.

## Decisão do usuário
- **Escolha**: 3 — Híbrido (equilibrado)
- **Justificativa do usuário**: aceitou a recomendação do Designer — preservar a árvore atual, adotar o moderno apenas no delta: `src/types/`, contrato `Base44Client` tipado (SDK + mock) e deduplicação pontual intra-domínio.
- **Decidido em**: 2026-09-09T15:28:00-03:00

## Mapeamento legado → novo

> O mapeamento abaixo é **provisório** e será finalizado conforme a opção escolhida (1/2/3) nas próximas etapas do Designer.

| Módulo / pasta legada | Bounded context novo | Tipo | Observações |
|---|---|---|---|
| `src/pages/Patients*.jsx` + `components/medical/PatientSearch.jsx`, `LGPDConsent.jsx` | pacientes | preservado | opção 3: páginas e componentes ficam onde estão; lógica duplicada (ex.: `calculateAge`) ganha módulo tipado compartilhado |
| `src/pages/Consult*.jsx` + `components/medical/*` (clínicos) | consultas (+ prescrições/exames) | preservado | Prescription/Exam emitidos na consulta (BR-C03, BR-MIGRAR-008) |
| `src/pages/Appointment*.jsx` + `components/appointments/*` | agendamentos | preservado | — |
| `src/pages/Doctors.jsx` | medicos | preservado | — |
| `src/pages/Templates.jsx` | templates | preservado | — |
| `src/pages/AccessLogs.jsx` + `components/medical/AccessLogger.jsx` | logs-acesso | preservado | — |
| `src/pages/Dashboard.jsx` + `components/medical/StatsCard.jsx`, `ReportsView.jsx` | dashboard | preservado | — |
| `src/api/base44Client.js` + `mockClient.js` + `mockSeed.js` | api (contrato `Base44Client`) | refatorado (sem mover pasta) | SDK e mock sob interface única tipada (BR-MIGRAR-038) |
| `src/types/` (novo) | types (entidades LGPD) | novo | já previsto no brief; obrigatório em todas as opções |
| dependências mortas (Stripe, react-leaflet…) | (removidas) | removido | fora do código `src/`; decisão RISK-006 |

## Implicações pendentes para próximos passos do Designer
| Etapa do Designer | Implicação | Como honrar |
|---|---|---|
| Bounded contexts | Opção 3: bounded contexts são agrupamentos **lógicos** sobre a árvore atual, não pastas novas | Definir agrupamentos por coesão de invariantes; pastas físicas permanecem |
| target_architecture | Contrato `Base44Client` tipado + `src/types/` são as únicas estruturas novas obrigatórias | Diagramar arquitetura com a árvore híbrida e seção "Honra à topologia escolhida" |
| target_domain_model | Entidades de domínio tipadas (Patient, Consultation, Appointment…) e regras BR-MIGRAR ancoradas nelas | Modelar agregados lógicos mapeando BR-MIGRAR → local no domínio |
| target_data_model | Dados continuam no BaaS (schemas imutáveis); tipos espelham os JSONC | Nenhum DDL; tipos = reflexo fiel dos schemas |

## Notas
- Recomendação do Designer: **opção 3 (híbrido)** — preserva a árvore (alinhado ao brief "arquitetura 100% igual" e à estratégia A incremental) e captura os ganhos centrais da migração (tipos centralizados, contrato de API tipado, deduplicação pontual) sem o custo/risco de reorganizar pastas inteiras durante uma migração de tipos com 0 testes.
- Se o usuário preferir opção 2, o prazo de 6–10 dias precisa ser revisto (reorganização + conversão), e a estratégia A muda de "conversão por camada" para "conversão por feature folder".
- Para o agente de codificação: a árvore final de pastas depende desta decisão; `src/types/` e o contrato tipado do SDK existem em todas as opções.
