# Data Delta: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Requirements: `_reversa_forward/015-sessao-sem-token-na-url/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Escopo: o que é "modelo" nesta feature

A extração descreve dois modelos distintos, e é preciso dizer qual está em jogo:

| Modelo | Onde vive na extração | Esta feature muda? |
|--------|----------------------|--------------------|
| Modelo **de domínio** (entidades, campos, relações do BaaS) | `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`, `base44/entities/*.jsonc` | **Não** |
| Modelo **de sessão do cliente** (o que a aplicação guarda no navegador) | `_reversa_sdd/code-analysis.md#10.4 Persistência`; `src/lib/app-params.ts` | **Sim** — é o único delta |

## 2. Modelo de domínio: nenhuma mudança

| Item | Antes | Depois |
|------|-------|--------|
| Entidades | 8 (`Doctor`, `Patient`, `Appointment`, `Consultation`, `Prescription`, `Exam`, `Template`, `AccessLog`) | **as mesmas 8** |
| Campos | — | **nenhum campo novo, nenhum removido, nenhum tipo alterado** |
| Schema do BaaS (`base44/entities/*.jsonc`) | — | **intocado** — regra de ouro do diff desde a feature `001` (`W006` daquele watch) |
| Políticas de RLS | — | **intocadas.** A autorização continua no servidor; esta feature não a substitui nem a enfraquece |
| Relações e índices | — | **nenhuma mudança** |

> A tentação de "aproveitar a passagem" para mexer em schema é justamente o que a regra de ouro proíbe. Nada foi tocado.

## 3. Modelo de sessão do cliente: o delta

O armazenamento do navegador da origem passa a ter um conteúdo diferente. Inventário do que `src/lib/app-params.ts` escreve **hoje**, verificado linha a linha em `getAppParamValue` (`src/lib/app-params.ts:44-73`):

| Chave | O que é | Escrita por | Antes | Depois |
|-------|---------|-------------|-------|--------|
| `base44_access_token` | **credencial de sessão** | `app-params.ts:61` (só quando vem da URL) e o coletor do SDK | gravada | **não gravada, e removida se existir** |
| `token` | **credencial de sessão** (espelho do padrão da plataforma) | `saveAccessToken` do SDK (`auth-utils.js:114`) | gravada | **não gravada, e removida se existir** |
| `base44_app_id` | parâmetro de inicialização | `app-params.ts:65` (ramo do `defaultValue`) | gravada a cada carga | **inalterada** |
| `base44_from_url` | parâmetro de inicialização | `app-params.ts:65`, idem | gravada a cada carga | **inalterada** — ver §4 |
| `base44_functions_version` | parâmetro de inicialização | `app-params.ts:65`, idem | gravada a cada carga | **inalterada** |
| `base44_app_base_url` | parâmetro de inicialização | `app-params.ts:65`, idem | gravada a cada carga | **inalterada** |
| `mock_db_<Entidade>` | **dados do modo offline** | `src/api/mockClient.ts:48,53` | gravadas | **intocadas** |

**Duas chaves saem do conjunto de credenciais; quatro permanecem como estão; as do modo offline não são alcançadas.** A restrição da limpeza a `base44_access_token` e `token` (D-06) existe exatamente por causa da última linha: `mock_db_*` vive no **mesmo** armazenamento, e uma limpeza ampla apagaria os dados de demonstração (`_reversa_sdd/code-analysis.md#10.4 Persistência`).

## 4. ⚠️ Achado acoplado: `base44_from_url` grava a URL inteira

Encontrado ao montar o inventário acima, e **não** faz parte do achado F-02. Fica registrado porque esta feature depende da ordem que o mantém inofensivo.

**O que acontece.** `src/lib/app-params.ts:97` lê `from_url` com `defaultValue: window.location.href`. O ramo do `defaultValue` em `getAppParamValue` (`:64-67`) **grava** o valor no armazenamento. Resultado: a cada carga, a **URL completa da página** é persistida em `base44_from_url`.

**Três propriedades verificadas:**

1. A chave é **escrita e nunca lida de volta**. A varredura de `from_url`, `base44_from_`, `base44_app_id`, `base44_functions` e `base44_app_base` em todo o `src/` devolve **uma única ocorrência** — a própria linha 97. Nada consome `appParams.fromUrl`; o cliente em `src/api/base44Client.ts:33-38` desestrutura `appId`, `token`, `functionsVersion` e `appBaseUrl`, e não `fromUrl`. São quatro chaves gravadas em toda carga e nunca lidas: resíduo, não funcionalidade. 🟢
2. **Hoje ela não vaza credencial** porque a ordem de avaliação do objeto literal (`:94-100`) põe `token` (`:96`, com remoção do parâmetro) **antes** de `fromUrl` (`:97`). Em JavaScript, as propriedades de um objeto literal são avaliadas na ordem do código, então `window.location.href` já está limpo quando é capturado. 🟢
3. **Se essa ordem inverter, a credencial passa a ser gravada** em `base44_from_url` — no exato armazenamento que esta feature está esvaziando. Seria reintroduzir o achado F-02 por outra porta, com a aparência de uma refatoração inocente de ordem de campos. 🟢

**Consequência para o plano.** A D-03 deixa de ser "preservar uma limpeza que não custa nada" e passa a ser **ordem com peso de segurança**. O watch de regressão exigido pelo RF-14 tem de cobrir duas coisas, não uma:

- a **ausência de gravação** das duas chaves de credencial; e
- a **ordem** entre `access_token` e `from_url` em `getAppParams`, com o sinal de violação nomeado: `base44_from_url` passa a conter `access_token=`.

Sem o segundo item, a prova mediria o sintoma de hoje e ficaria cega para a reintrodução por outra chave — que é a forma mais provável de o defeito voltar.

**O que este achado *não* é.** Não é um achado de segurança novo e não deve ser registrado como um: não há vazamento enquanto a ordem se mantiver, e a URL em si não é credencial. É uma **dependência de ordem**, registrada como observação e como item de watch. Corrigir de verdade — deixar de gravar as quatro chaves que nunca são lidas — é mudança de comportamento fora do escopo desta feature, e fica declarado para uma decisão futura.

## 5. Migração de dados

| Pergunta | Resposta |
|----------|----------|
| Há migração de dados? | **Não.** Nenhum registro de entidade é lido, escrito, convertido ou movido |
| Há migração de schema? | **Não** |
| Há limpeza de estado obsoleto? | **Sim** — remoção de `base44_access_token` e `token` na primeira carga (RF-05) |
| A limpeza é idempotente? | **Sim.** Rodar sobre armazenamento já limpo é inócuo, e a operação se repete a cada carga sem efeito colateral |
| Há janela de transição? | **Não é necessária.** A remoção acontece na primeira carga da versão nova; não há dado a preservar entre as duas |
| A limpeza pode perder algo do usuário? | **Não**, desde que restrita às duas chaves. As chaves de dados do modo offline e as quatro de parâmetros de inicialização permanecem — e a suíte de modo offline é a prova de que `mock_db_*` sobrevive |

## 6. RLS, índices e chamadas de servidor

| Item | Delta |
|------|-------|
| Políticas de RLS | **nenhuma** — continuam no servidor, e continuam sendo a autorização real |
| Índices | **nenhum** |
| Funções de servidor / RPC | **nenhuma** |
| Chamadas de servidor | **nenhuma nova.** A verificação de sessão já existia; o que muda é a condição que a dispara (D-05). A contagem de requisições do caminho de carga não aumenta |

## 7. Contratos de tipo afetados

| Contrato | Arquivo | Delta |
|----------|---------|-------|
| `AppParams` | `src/lib/app-params.ts:76-82` | A **forma** do tipo não muda — `token` continua existindo e continua podendo ser `null`. O que muda é a origem do valor: deixa de haver o nível "armazenado" |
| `hasSessionToken` | `src/api/base44Client.ts:47` | Continua exportado e continua significando "há token em memória". **Deixa de ser a condição de sessão** — o consumidor (`AuthContext`) para de usá-lo como portão. A decisão sobre manter, renomear ou remover a exportação fica para o `actions.md`, para não deixar símbolo sem consumidor |
| `AuthContextValue` | `src/lib/AuthContext.tsx:32-48` | Ganha estado para a distinção entre falha de rede e ausência de sessão (D-07/RF-12). É a única superfície de tipo que cresce |

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-plan`; achado acoplado de `base44_from_url` registrado na §4 | reversa |
