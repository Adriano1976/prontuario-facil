# Design — Módulo Modo Offline (Mock Local)

> Decisões de design da feature transversal `modo-offline`. Foco em **como** os requisitos (ver `requirements.md`) são satisfeitos.

## 1. Decisões de Arquitetura

### D-01: Cliente único, decisão em tempo de build

**Decisão:** o módulo `src/api/base44Client.js` continua sendo o **único** ponto de exportação do cliente. A escolha entre SDK real e mock acontece via ternário em escopo de módulo, lendo `import.meta.env.VITE_OFFLINE`.

**Por quê:** zero impacto nas pages. Toda chamada existente `base44.entities.X.list(...)` continua funcionando sem alteração, contra qualquer uma das duas implementações. O Vite faz tree-shaking e dead-code elimination: o ramo não usado do ternário é removido do bundle final.

**Alternativas consideradas:**
- *Strategy pattern com DI* (injetar cliente via Context): exigiria refactor de todas as pages.
- *Factory async*: adicionaria latência no boot sem benefício.
- *Feature flag runtime* (cookie / query string): exigiria rebuild para mudar comportamento em produção, mesmo problema.

### D-02: Mock como Proxy dinâmico

**Decisão:** `entities` é um `Proxy({}, { get: (_, name) => makeRepo(String(name)) })`. Qualquer acesso a `base44.entities.<X>` devolve um repo novo, sem lista pré-definida.

**Por quê:**
- Pages podem acessar entidades que não estão no seed sem crashar — só retornam lista vazia.
- Não exige sincronizar um registry estático com os schemas `base44/entities/*.jsonc` (que estão no repositório mas não são importados pelo código de runtime).
- Custo: zero (Proxy é nativo e barato para esse padrão de uso).

**Trade-off aceito:** erros de grafia em nomes de entidade (`base44.entities.Pattient.list()`) só aparecem como lista vazia em vez de erro descritivo. Aceitável porque a checagem é responsabilidade do TypeScript no código de produção.

### D-03: Persistência em `localStorage` (não IndexedDB)

**Decisão:** usar `localStorage` com serialização JSON, chave por entidade.

**Por quê:**
- API síncrona, simples, suficiente para volumes pequenos (este projeto não lida com >1000 registros de uma entidade em uso normal).
- Sem dependência adicional.
- Inspeção trivial via DevTools.

**Por que NÃO IndexedDB:**
- API assíncrona exigiria refactor dos repos para `async` real — mas como já retornam `Promise.resolve(...)`, o impacto seria absorvido. Ainda assim, IndexedDB adiciona complexidade sem ganho mensurável para o volume de dados esperado.
- Upload de arquivos via Data URL em IndexedDB esbarra em custos de serialização.

**Limitação conhecida:** limite de ~5–10 MB por origem no `localStorage`. Se o usuário criar milhares de registros, começará a lançar `QuotaExceededError`. Mitigação futura: mover para IndexedDB (ver tasks.md → TO-DO futuro).

### D-04: Auth bypass via curto-circuito no `checkAppState`

**Decisão:** no início de `checkAppState()`, antes de qualquer chamada de rede, retornar imediatamente autenticado como `OFFLINE_USER` quando `VITE_OFFLINE=true`.

**Por quê:**
- Evita chamada de rede que falharia (não há servidor).
- Mantém o resto da lógica de AuthContext intacta — todos os consumidores (`useAuth`, `UserNotRegisteredError`, etc.) continuam funcionando.
- O `OFFLINE_USER` é importado diretamente de `mockClient.js`, garantindo uma única fonte de verdade para a identidade offline.

**Localização:** `src/lib/AuthContext.jsx` linhas 47–53 (ver diff no `code-analysis.md` seção 10.2).

### D-05: `entities.<X>.create` popula `id`, `created_date`, `date`

**Decisão:** o mock cria campos derivados automaticamente, espelhando o que o Base44 BaaS faz no servidor.

| Campo | Lógica | Por quê |
|-------|--------|---------|
| `id` | `crypto.randomUUID()` ou fallback | Mesmo formato que Base44 |
| `created_date` | `new Date().toISOString()` | Compatível com schema |
| `date` | se ausente, mesmo timestamp de `created_date` | Espelha comportamento de várias entidades Base44 |

**Por que o fallback de `date`:** várias pages gravam apenas `appointment_id`, `medication`, etc. e esperam que `date` seja derivado. Sem o fallback, tabelas com ordenação por `date` ficariam bagunçadas em offline.

### D-06: `UploadFile` como Data URL

**Decisão:** `integrations.Core.UploadFile({ file })` lê o arquivo via `FileReader.readAsDataURL` e resolve `{ file_url: dataUrl }`.

**Por quê:**
- Mesma forma de retorno que o SDK Base44 (`{ file_url: string }`).
- Permite que o componente `ExamUploader` mostre preview imediato.
- **Limitação:** o Data URL **não é persistido** no `localStorage` (seria absurdamente grande). No próximo reload, o `file_url` vira `null` ou string vazia. Ver `requirements.md` §6.

### D-07: `filter` estrito e `sort` simples

**Decisão:** implementar apenas o subconjunto mínimo de operações para a app rodar.

| Operação | Suportado? | Observação |
|----------|-----------|-----------|
| `filter({ field: value })` | ✅ | Apenas `===` |
| `filter({ field: { $in: [...] } })` | ❌ | Quebra silenciosa (filtro vazio) |
| `filter({ field: { contains: 'x' } })` | ❌ | Idem |
| `sort: 'field'` | ✅ | Ascendente |
| `sort: '-field'` | ✅ | Descendente |
| `sort: ['-a', 'b']` | ❌ | Ignorado |
| `limit: N` | ✅ | Truncamento |
| `get(id)` | ❌ | Caller usa `filter({ id }, 1)` |

**Por que essa simplicidade:** nenhuma página atual da app usa filtros complexos além de `===` em campos simples. Auditar antes de expandir.

### D-08: Sem banner visual de "modo offline"

**Decisão (provisória):** **NÃO** adicionar indicador visual de que o app está em modo offline. A detecção é por inspeção de env var, não por UI.

**Risco:** usuário pode esquecer que está em offline, criar dados fictícios que parecem reais e tirar conclusões erradas. P1 em `requirements.md` §7.

**Mitigação futura (TO-DO):** badge persistente no header quando offline. Pendente de confirmação do usuário (ver Q-13 em `questions.md`).

## 2. Estrutura de Arquivos

```
src/
├── api/
│   ├── base44Client.js       ← ternário OFFLINE ? createMockClient() : createClient()
│   ├── mockClient.js         ← Proxy + makeRepo + auth + integrations + appLogs
│   └── mockSeed.js           ← mockSeed = { Doctor: [...], Patient: [...], ... }
└── lib/
    └── AuthContext.jsx       ← curto-circuito no checkAppState
```

Nenhum arquivo novo de rota, page, componente ou schema.

## 3. Fluxo de Inicialização

```
main.jsx
  └─ App.jsx
       └─ <AuthProvider>
            └─ checkAppState()
                 │
                 ├── VITE_OFFLINE === 'true'  ──────────────┐
                 │                                          ▼
                 │                              setUser(OFFLINE_USER)
                 │                              setIsAuthenticated(true)
                 │                              setIsLoading*(false)
                 │                                          │
                 ▼                                          │
              fetch public settings                        │
                 │                                          │
                 ├── ok ─► fetch user ─► setUser(user) ◄───┘
                 │
                 └── 401/403 ─► logout
```

Em offline, todo o ramo esquerdo (chamadas de rede) é pulado.

## 4. Fluxo de uma Operação Típica

```
Page chama:  base44.entities.Patient.list('full_name', 10)
                    │
                    ▼
              mockClient.entities.Patient   ← Proxy retorna makeRepo('Patient')
                    │
                    ▼
              repo.list('full_name', 10)
                    │
                    ▼
              load('Patient')              ← JSON.parse(localStorage.getItem('mock_db_Patient'))
                    │                            (se vazio/corrompido, semeia via mockSeed.Patient)
                    ▼
              sortAndLimit(arr, 'full_name', 10)
                    │
                    ▼
              Promise.resolve(result)
```

Latência percebida: ~0–1 ms (acesso local síncrono + envelope Promise).

## 5. Compatibilidade e Migração

### 5.1 Build

- Vite substitui `import.meta.env.VITE_OFFLINE` em build. Não requer plugin adicional.
- O ramo do SDK real é removido do bundle quando `VITE_OFFLINE=true` (e vice-versa) via tree-shaking.

### 5.2 Upgrade de `mockSeed`

Se um dia o schema do Base44 mudar (ex: campo novo obrigatório em `Patient`), atualizar `mockSeed.js` apenas afeta **novas instalações** (localStorage vazio). Instalações existentes continuam com os dados antigos. Para forçar reset, documentar em release notes.

### 5.3 Migração para IndexedDB (futuro)

Se o volume de dados crescer, mover de `localStorage` para `IDB`:

1. Trocar `load/save` por wrappers IDB (assíncronos).
2. Atualizar `makeRepo` para retornar `Promise`s reais (não mais `Promise.resolve(...)`).
3. Adicionar migração: na primeira execução IDB, copiar de `localStorage` se houver dados.
4. Pages **não mudam** (já consomem `Promise`).

Fora de escopo agora.

## 6. Riscos Aceitos

| Risco | Mitigação |
|-------|-----------|
| LGPD: seed em `localStorage` | Documentado em Q-14 e `permissions.md` §4 |
| Mock sem RLS | Documentado em `requirements.md` BR-OFF10 e Q-16 |
| Cobertura parcial de SDK | Documentado em Q-15; pages afetadas listadas em `tasks.md` |
| Dados não persistem entre reloads para uploads | Documentado em `requirements.md` §6 |
| Toggle compile-time | Aceitável; documentado em `requirements.md` BR-OFF01 |

## 7. Trade-offs Resumidos

| Decisão | Pro | Contra |
|---------|-----|--------|
| `localStorage` em vez de IDB | Simplicidade, zero deps | Limite de ~5MB, sem transações |
| Proxy dinâmico de entities | Zero coupling a schema | Erros de grafia silenciosos |
| Auth bypass (não mock de token) | Menos código | Sem granularidade de papel |
| Sem banner offline | UI idêntica ao online | Usuário pode esquecer que está em offline |
| Seed hardcoded em JS | Sem dependência externa | Mudanças exigem rebuild |
