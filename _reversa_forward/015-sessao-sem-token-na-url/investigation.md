# Investigation: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Requirements: `_reversa_forward/015-sessao-sem-token-na-url/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. A pergunta que a investigação teve de responder

O `requirements.md` afirma uma coisa que não é óbvia e que, se estivesse errada, mudaria o plano inteiro:

> *"Como `app-params.ts` é avaliado antes de o cliente do SDK ser construído, o parâmetro já saiu da URL quando o SDK chama o coletor — de modo que cessar a gravação **basta** para o SDK também não encontrar o token."*

Se essa afirmação for falsa, cortar a gravação no projeto **não** fecha a metade de persistência: o SDK gravaria sozinho, e a feature seria cosmética. A investigação abaixo existe para verificar exatamente isso, e é a razão de a **D-04** ser a decisão central do roadmap.

## 2. Fontes primárias verificadas

Todas lidas no `node_modules` instalado, não em documentação. A citação é literal.

| # | Fonte | O que diz | Confidência |
|---|-------|-----------|-------------|
| 1 | `@base44/sdk/dist/client.js:122-127` | `if (typeof window !== "undefined") { const accessToken = token \|\| getAccessToken(); if (accessToken) { userAuthModule.setToken(accessToken); } }` — o construtor do cliente **colhe por conta própria** quando não recebe token | 🟢 |
| 2 | `@base44/sdk/dist/client.js:134` | `getAuthToken: () => token \|\| getAccessToken()` — o coletor é **chamado de novo**, por conexão dos atores. Não é uma leitura única na construção | 🟢 |
| 3 | `@base44/sdk/dist/utils/auth-utils.js:37-38` | `export function getAccessToken(options = {}) { const { storageKey = "base44_access_token", paramName = "access_token", saveToStorage = true, removeFromUrl = true } = options;` — os padrões **são** desligáveis, mas quem chama não passa opção nenhuma | 🟢 |
| 4 | `@base44/sdk/dist/utils/auth-utils.js:41-63` | O coletor lê a query string **primeiro**; se achar, grava (`saveAccessToken`) e limpa a URL; se não achar, cai para `window.localStorage.getItem(storageKey)` | 🟢 |
| 5 | `@base44/sdk/dist/utils/auth-utils.js:106-121` | `saveAccessToken` grava em **duas** chaves: a informada (`base44_access_token`) e `token` | 🟢 |
| 6 | `@base44/sdk/dist/utils/axios-client.js:118-130` | `createAxiosClient({ baseURL, headers, token, ... })` monta o `axios.create` **sem** `withCredentials`. O `Authorization: Bearer` só existe se `token` for passado | 🟢 |
| 7 | `@base44/sdk/dist/modules/auth.js:170-172` | O logout vai para `${appBaseUrl}/api/apps/auth/logout`, com o comentário *"Redirect to server-side logout endpoint to clear HTTP-only cookies"* — prova de que a plataforma mantém sessão por cookie `httpOnly` | 🟢 |
| 8 | `@base44/sdk/dist/modules/auth.js:188-195` | `setToken` grava em `base44_access_token` **e** `token` quando o padrão é mantido | 🟢 |

**Ordem de avaliação, verificada no projeto:** `src/api/base44Client.ts:2` importa `appParams` no topo; `src/lib/app-params.ts:103-105` monta `appParams` no **corpo do módulo**; o construtor do SDK só é chamado dentro de `buildClient()`, em `src/api/base44Client.ts:133-142`. Em ESM, as importações são avaliadas antes do corpo do módulo que as importa — logo, o módulo de parâmetros executa **primeiro**. E ele já limpa a URL (`removeFromUrl: true`, `src/lib/app-params.ts:96`). 🟢

**Conclusão da verificação:** quando o coletor do SDK roda, a query string **já não tem** o parâmetro. O que ele encontra é o `localStorage` — e é exatamente o que a linha 61 de `app-params.ts` acabou de gravar. Cortada a gravação, o coletor não encontra nada em nenhum dos dois lugares. **A afirmação do `requirements.md` se sustenta.** 🟢

## 3. O caminho completo da credencial, antes e depois

**Antes:**

```
plataforma (login hospedado)
  → redireciona para a app com ?access_token=<credencial>
    → app-params.ts ............ lê o parâmetro, limpa a URL, GRAVA em localStorage
    → createClient (SDK) ....... chama getAccessToken(), que LÊ o localStorage
    → Authorization: Bearer <credencial> em toda requisição
    → recarga: a URL já está limpa, mas o localStorage ainda tem → sessão continua
```

**Depois:**

```
plataforma (login hospedado)
  → redireciona para a app com ?access_token=<credencial>
    → app-params.ts ............ lê o parâmetro, limpa a URL, NÃO grava
    → createClient (SDK) ....... chama getAccessToken(): URL limpa, armazenamento limpo → nada
    → sem Authorization: a requisição é autenticada pelo cookie httpOnly (same-origin)
    → recarga: nada persistido; a sessão vem do cookie
```

O que **não** muda é a primeira seta: a credencial ainda passa pela URL vinda da plataforma. É o limite declarado em RN-07/RF-11.

## 4. Alternativas avaliadas e por que foram descartadas

| Alternativa | Avaliação | Veredito |
|-------------|-----------|----------|
| **`patch-package` sobre o SDK** para forçar `saveToStorage: false` no coletor | Tecnicamente viável, mas silenciosa: o patch vive fora do código, não é exercitado pela suíte, e quebra sem aviso em qualquer atualização de dependência. Introduz um segundo lugar onde a regra de sessão mora | **descartada** |
| ***Fork* do SDK** | Resolveria tudo, inclusive o `withCredentials`. Custo desproporcional e obriga a manter um SDK de terceiro | **descartada** |
| **Guardar em `sessionStorage` em vez de `localStorage`** | Reduz a janela, mas o valor continua legível por qualquer script da página — o dano nomeado pelo achado é leitura por script, não persistência entre abas | **descartada** |
| **Guardar cifrado** | Sem chave que o script da página também não alcance, é ofuscação. Não fecha o achado | **descartada** |
| **Manter o portão e gravar um marcador não-sensível** ("sessão já iniciada") | Resolveria a recarga sem guardar credencial, mas cria estado derivado que pode divergir da realidade — e a sessão passaria a ser decidida por um sinal que o cliente inventa | **descartada** |
| **Manter a persistência e só documentar** | Deixaria o achado aberto por decisão, o que já é o estado atual (F-02 consta ⛔). Não é o que a feature se propõe a fazer | **descartada** |
| **OAuth PKCE + cookie `httpOnly` `SameSite=Strict`** — recomendação literal da auditoria | É a direção normativa correta, e o cookie `httpOnly` **já existe** na plataforma. Mas adotar PKCE exige mudar o fluxo de login hospedado, que é da plataforma | **fora do alcance** — registrada como o caminho canônico para o dono da metade remanescente |
| **Redirecionar ao login quando não houver sessão** | Oferecida na sessão de esclarecimentos (Q3) e recusada em favor de exibir o estado de erro existente | **recusada pelo responsável** |
| **Retentativa automática antes de declarar falha de rede** | Oferecida (Q4) e recusada: o responsável preferiu erro distinguível a retentativa | **recusada pelo responsável** |

## 5. Padrões aplicáveis

| Padrão | Aplicação aqui | Confidência |
|--------|----------------|-------------|
| **Credencial de sessão não deve ser legível por script** — é a base do uso de cookie `httpOnly` | É o critério que decide a D-02. A plataforma já oferece o cookie; a feature apenas deixa de duplicar a credencial num lugar legível | 🟢 |
| **Ausência de autenticação e falha de transporte são estados distintos** | É a base da D-07 e do RF-12. Confundir os dois produz o sintoma clássico de "deslogou sozinho" | 🟢 |
| **Limpeza de artefato de sessão na borda de entrada** | Justifica a D-09: a precedência de parâmetros é comportamento documentado do arquivo, e alterá-la exige registro, não silêncio | 🟢 |
| **OAuth 2.0 for Browser-Based Apps**, que desaconselha credencial em query string | Referência normativa citada pela auditoria (`docs/security-audit/002-record/achados.json`) como o caminho de correção. **Não foi aberta nesta sessão** | 🟡 |

> **Nota de honestidade metodológica.** As três primeiras linhas são princípios gerais de engenharia, não citações. A última é uma referência normativa que eu **não** abri: os *links* de fontes externas que o skill pede não são apresentados aqui porque não foram verificados, e apresentá-los seria citar o que não li. A investigação que sustenta este plano é a da seção 2, toda ela verificada no código instalado.

## 6. O que esta investigação **não** cobriu

- **O comportamento real do servidor da plataforma.** Não foi possível verificar como o backend trata uma requisição sem `Authorization` mas com cookie de sessão. A conclusão de que o cookie autentica apoia-se em duas evidências indiretas: o logout limpa cookies `httpOnly` (`auth.js:170`), o que só faz sentido se eles autenticarem; e o `baseURL` é relativo, logo same-origin. **É a maior incerteza remanescente do plano** — e é ela que a prova do RF-06 tem de atacar na primeira execução.
- **O fluxo de login hospedado.** Não se verificou se há como pedir à plataforma que não devolva o token na URL. Se houver, a metade hoje declarada fora de alcance (RF-11) volta a ser candidata — e o dono da decisão continua sendo a plataforma.
- **O que o `@base44/vite-plugin` faz com a URL de navegação.** O plugin está declarado em `dependencies.md` e atua em HMR e navegação; não se verificou se ele interfere em parâmetros de query em algum caminho.

## 7. Fontes

- Código instalado: `node_modules/@base44/sdk/dist/client.js`, `dist/utils/auth-utils.js`, `dist/utils/axios-client.js`, `dist/modules/auth.js`
- Código do projeto: `src/lib/app-params.ts`, `src/api/base44Client.ts`, `src/lib/AuthContext.tsx`
- Auditoria: `docs/security-audit/001-record/achados.json`, `docs/security-audit/002-record/achados.json` (achado F-02)
- Extração reversa: `_reversa_sdd/inventory.md#Configuração / ambiente`, `_reversa_sdd/code-analysis.md#10.2`, `_reversa_sdd/code-analysis.md#10.4 Persistência`, `_reversa_sdd/c4-context.md#Integrações Externas Detectadas`, `_reversa_sdd/dependencies.md`
- Decisões do responsável: `_reversa_forward/015-sessao-sem-token-na-url/requirements.md#9. Esclarecimentos`
