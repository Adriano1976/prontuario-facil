# Tasks — Módulo Modo Offline (Mock Local)

> Plano de implementação da feature `modo-offline`. Como o código já existe, esta lista captura **verificações pós-implementação**, correções de gaps e melhorias incrementais.

## Legenda de Status

- ✅ Feito (código presente)
- 🟡 Parcial (código presente com lacunas)
- 🔴 Pendente (ação aberta)
- ⚪ TO-DO futuro (não-bloqueante)

---

## T-01 ✅ Setup do toggle OFFLINE em `base44Client.js`

**Arquivo:** `src/api/base44Client.js`
**Critério:** `OFFLINE === true` em build → mock; senão SDK real.
**Verificação:** ✅ implementado conforme `design.md` D-01.

```js
const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';
export const base44 = OFFLINE ? createMockClient() : createClient({ ... });
```

---

## T-02 ✅ Implementação de `createMockClient` em `mockClient.js`

**Arquivo:** `src/api/mockClient.js`
**Critério:** exporta `createMockClient()` que retorna `{ entities, integrations, auth, appLogs }`.
**Verificação:** ✅ implementado conforme `design.md` §2.

---

## T-03 ✅ Seed de 8 entidades em `mockSeed.js`

**Arquivo:** `src/api/mockSeed.js`
**Critério:** objeto `mockSeed` exportado com Doctor, Patient, Appointment, Consultation, Prescription, Exam, Template, AccessLog.
**Verificação:** ✅ 8 entidades presentes.

---

## T-04 ✅ Persistência em `localStorage` com lazy seed

**Arquivo:** `src/api/mockClient.js`
**Critério:** `load(entity)` semeia do `mockSeed` na primeira leitura; `save(entity, arr)` persiste.
**Verificação:** ✅ implementado. Tolerante a JSON corrompido.

---

## T-05 ✅ Auto-popular `id`, `created_date`, `date` no `create`

**Arquivo:** `src/api/mockClient.js` (`makeRepo.create`)
**Critério:** novos registros recebem UUID, timestamp ISO e `date` se ausente.
**Verificação:** ✅ implementado conforme D-05.

---

## T-06 ✅ Auth bypass no `checkAppState`

**Arquivo:** `src/lib/AuthContext.jsx`
**Critério:** quando `VITE_OFFLINE === 'true'`, autenticar direto como `OFFLINE_USER` sem chamadas de rede.
**Verificação:** ✅ curto-circuito presente nas linhas 47–53.

---

## T-07 🔴 Documentar env var em `.env.example`

**Arquivo:** `.env.example` (criar se não existir)
**Ação:** adicionar `VITE_OFFLINE=` com comentário explicativo.
**Por quê:** o toggle é a única "interface" do modo offline. Sem documentação, devs não descobrem.

```
# Habilita modo offline com mock client persistido em localStorage.
# Aceito apenas em tempo de build (não muda em runtime).
# Valores: true | false. Default: false.
VITE_OFFLINE=false
```

---

## T-08 🟡 Auditoria de páginas: uso de operações fora do subset suportado

**Arquivos:** `src/pages/**/*.jsx`, `src/components/**/*.jsx`
**Ação:** grep por chamadas `base44.entities.*.*` e classificar cada uma:
- Suportado em offline ✅
- Fora do subset ⚠️ (documentar em Q-15)

**Operações fora do subset conhecido:**
- `entities.<X>.get(id)` — se existir, substituir por `filter({ id }, limit=1)` ou iterar a lista.
- `entities.<X>.count()` — se existir, substituir por `list().length` (cuidado com performance).
- Filtros com `$in`, `$ne`, `contains`, `gte` — quebram silenciosamente em offline.
- `integrations.Core.SendEmail`, `InvokeLLM`, etc. — não implementadas no mock; devem retornar rejeição clara.

**Status:** não auditado. Requer sweep antes de promover offline de "experimental" para "estável".

---

## T-09 🔴 Banner visual "modo offline" (TO-DO bloqueado por Q-13)

**Arquivos:** `src/components/ui/`, `src/Layout.jsx`
**Ação:** badge no header com texto "Modo Offline — dados não são sincronizados" e cor distinta.
**Bloqueio:** depende da decisão do usuário em Q-13 (questions.md) sobre se o modo offline é feature permanente ou temporária.

---

## T-10 ⚪ Anonimizar seed (TO-DO bloqueado por Q-14)

**Arquivo:** `src/api/mockSeed.js`
**Ação:** substituir CPFs por números claramente fictícios (ex: `000.000.000-00`, `111.111.111-11`), emails por `@example.com`, e adicionar nota no seed: `// Dados fictícios — não usar em produção`.
**Bloqueio:** depende da resposta do usuário em Q-14.

---

## T-11 ⚪ Migrar de `localStorage` para IndexedDB (futuro)

**Arquivos:** `src/api/mockClient.js`
**Ação:** substituir `load`/`save` por wrappers IDB assíncronos; ajustar `makeRepo` para retornar `Promise` real (não `Promise.resolve`).
**Quando:** se o volume de dados típico crescer > ~2 MB em `localStorage`, ou se passar a haver uploads binários a persistir.
**Não-bloqueante:** não há demanda imediata.

---

## T-12 🔴 Atualizar `confidence-report.md` e `gaps.md` pós-revisao

**Arquivos:** `_reversa_sdd/confidence-report.md`, `_reversa_sdd/gaps.md`
**Ação:** após a revisão (Task #5 do plano reversa-delta), atualizar a confiança dos artefatos novos (geralmente 🟡 Inicial até validação humana) e adicionar gap se T-08 revelar páginas incompatíveis.

---

## T-13 ✅ Marcar unit como "documentada" no `state.json`

**Arquivo:** `.reversa/state.json`
**Ação:** ao final, acrescentar `modo-offline` à lista `checkpoints.archaeologist.modules_analyzed` (refletindo que foi analisado).
**Status:** a fazer após aprovação do usuário (esta task só roda se o usuário confirmar a documentação).

---

## Critérios de Pronto (DoD) da Unit

- [x] `requirements.md` cobre todas as BRs (OFF01..OFF12) com marcador de confiança
- [x] `design.md` explica decisões de arquitetura (D-01..D-08) e trade-offs
- [x] `tasks.md` lista T-01..T-13 com status e bloqueios
- [x] `screens.md` indica explicitamente que o módulo é **transversal sem telas próprias**
- [x] Menções cruzadas em `code-analysis.md` §10, `data-dictionary.md` Apêndice A, `architecture.md`, `permissions.md` §4
- [x] 4 perguntas detective abertas (Q-13..Q-16) em `questions.md`
- [x] Linhas marcadas em `code-spec-matrix.md`

---
*Gerado pelo Reversa-Writer em 2026-08-28.*
