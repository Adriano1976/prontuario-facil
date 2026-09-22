# Investigação: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/006-prova-logs-acesso/requirements.md`
> Roadmap: `_reversa_forward/006-prova-logs-acesso/roadmap.md`

## 1. O que foi investigado

O grupo `Logs de acesso (07)` da matriz de rastreabilidade transfere **4 cenários** de
paridade (`PT-007`) descritos em
`_reversa_sdd/migration/parity_tests/07-auditoria-acesso.feature`. A investigação perseguiu
quatro perguntas:

1. **Onde cada promessa é observável** — a trilha tem três superfícies distintas e uma
   promessa pode estar em qualquer uma delas.
2. **O que a extração já sabia e onde ela parou** — para transformar 🔴 em veredito sem
   repetir leitura já feita.
3. **O que o cliente pode afirmar sobre uma regra que é do servidor** — a separação entre a
   metade provável e a metade declarada.
4. **Como a trilha se perde** — porque uma trilha de auditoria que falha em silêncio é pior
   do que uma que não existe, já que a primeira dá a impressão de estar completa.

## 2. Onde cada promessa vive

| Cenário | Superfície observável | Linha vigente |
| :--- | :--- | :--- |
| `PT-007.1` Visualização gera registro | Efeito do detalhe do paciente | `PatientDetail.tsx:156-160` |
| `PT-007.1` (mesma promessa, outra entidade) | Efeito do detalhe da consulta | `Consultation.tsx:114-118` |
| `PT-007.2` Somente inserção | O módulo `AccessLogger` — nenhuma função de leitura ou alteração | `AccessLogger.ts:46-73` |
| `PT-007.2` Imutabilidade e leitura por admin | **RLS do servidor** — não observável no cliente | `AccessLog.jsonc:56-73` |
| `PT-007.2` Quem chega à tela | Item de navegação, sem condição de papel | `Layout.tsx:41-49` |
| `PT-007.3` Dashboard grava ao montar | Efeito de montagem do Dashboard | `Dashboard.tsx:109-111` |
| `PT-007.4` Até 500, ordenado, sem paginação | O pedido de leitura e a tabela | `AccessLogs.tsx:75-78` e `:212-287` |

Três conclusões caem direto da tabela:

- **A trilha tem duas pontas e o meio.** Quem grava é o logger; quem dispara são as telas;
  quem lê é a página. Provar tudo pela página mediria a leitura e deixaria a gravação — que é
  o objeto da garantia — sem veredito.
- **`PT-007.2` é a única regra do módulo com metade fora do cliente.** O resto é todo
  observável.
- **`PT-007.1` aparece em duas telas**, e o cenário nomeia "paciente/consulta" — as duas
  entidades. Provar uma só deixaria a outra sem veredito.

## 3. Alternativas avaliadas

### 3.1 Onde provar a gravação disparada pelas telas

| Alternativa | Veredito |
| :--- | :--- |
| Nas telas — renderizar o detalhe e o Dashboard e afirmar o registro | **Escolhida.** A promessa é "o Dashboard grava ao montar", e isso é comportamento da tela, não do logger |
| Só no logger, chamando `logAccess` diretamente | Descartada para `PT-007.1` e `PT-007.3`: provaria que a função grava, não que a tela a chama. A ligação entre as duas é justamente onde a feature 004 encontrou o defeito da receita |
| Dublar `logAccess` e afirmar as chamadas | **Proibida** (D-02). Mede o dublê, e foi assim que o defeito da 004 passou despercebido |

### 3.2 Como provar a falha aberta

O modo de falha tem **dois caminhos distintos** no código:

- `base44.auth.me()` **recusando** → cai no `catch`, que registra em `console.error`;
- `me()` devolvendo valor **falsy** → cai no `return` antecipado, e **nem isso** é registrado.

| Alternativa | Veredito |
| :--- | :--- |
| Provar os dois caminhos, com asserção positiva no mesmo arranjo | **Escolhida** (D-05, R-03). Afirmar só "nada foi gravado" passa por vacuidade |
| Provar só a recusa | Descartada. O `return` antecipado é silencioso **até no console** — é o pior dos dois |
| Afirmar que `console.error` foi chamado | Descartada como asserção principal: prova que o erro foi impresso, não que o registro se perdeu. Pode entrar como asserção secundária |
| Corrigir | Descartado por decisão `3a` — muda comportamento observável e é decisão de produto |

### 3.3 Como provar que a tela é alcançável por quem não é admin

| Alternativa | Veredito |
| :--- | :--- |
| Renderizar o `Layout` com usuário sem papel de admin e afirmar o item de auditoria | **Escolhida** (D-04). A afirmação é sobre o que o usuário **vê**, e ver exige renderizar |
| Declarar por leitura de `Layout.tsx` | Descartada pela decisão `2a`. É exatamente o tipo de leitura que a extração fez e que ficou imprecisa |
| Provar dentro da página de auditoria | Descartada. A página não decide a navegação; provar ali mediria outro componente |

### 3.4 Como provar a duplicação do registro

| Alternativa | Veredito |
| :--- | :--- |
| Fornecer o mesmo paciente com uma **nova identidade de objeto** e afirmar a segunda gravação | **Escolhida** (D-07). O gatilho é explícito, e não depende de o React re-renderizar por conta própria |
| Deixar o re-render acontecer naturalmente | Descartada. O resultado dependeria do comportamento do React e do dublê, e a verificação mediria o arranjo |
| Declarar por leitura | Descartada pela decisão `4a` — era o que o `RN-07` fazia, sem prova, e a varredura do clarify apontou o furo |

A investigação **ampliou** o achado: o detalhe da consulta tem a **mesma forma**
(`[consultation, patient, consultationId]`, com dois objetos nas dependências). A duplicação
é sistêmica, não local — e provar só o detalhe do paciente a descreveria como defeito de uma
tela.

### 3.5 Onde ancorar a prova do logger

| Alternativa | Veredito |
| :--- | :--- |
| Arquivo próprio em `src/components/medical/__tests__/`, ao lado do módulo | **Escolhida** (D-01). É a fronteira do arquivo que ele prova, e o diretório já existe |
| Dentro do arquivo da página de auditoria | Descartada. Misturaria os dublês da leitura com os da gravação |
| Um arquivo único para todo o módulo | Descartada. Seis superfícies, seis arranjos de dublê |

## 4. Divergências entre a extração e o código

Registradas porque cada uma muda como a matriz deve ser lida.

1. **`BR-L` é a quarta família com identificador colidindo, e a única dentro do mesmo módulo.**
   `logs-acesso/requirements.md#2` usa `BR-L01`/`BR-L02`/`BR-L03` para *append-only*, *enum de
   ações* e *chamadas dedicadas*; `code-analysis.md#6` usa os **mesmos IDs** para *campos
   obrigatórios*, *quem cria e quem lê* e *imutabilidade*. Depois de `BR-A0x` (003), `BR-C`
   (004) e `BR-T` (005), é a primeira vez que os dois artefatos descrevem o **mesmo** módulo
   — o que torna a citação sem qualificação ainda mais enganosa.
2. **"Somente admins veem a tela de auditoria" é impreciso.** `code-analysis.md#5.1` afirma
   isso; o item de navegação é incondicional (`Layout.tsx:48`) e nenhuma guarda intercepta o
   caminho. A segunda metade da nota — "tentativa de usuário comum retornará vazio/negado" —
   está certa. A primeira, não.
3. **`AccessLog` está classificada como entidade de leitura aberta.** `registry.ts:65-67` a
   agrupa com `Doctor` e `Template`, cuja leitura é de fato aberta a autenticados — mas a
   leitura da trilha é **admin-only** na RLS. E `withAccess` (`registry.ts:124-126`) faz
   `asUser` e `asAdmin` devolverem o **mesmo** repositório, de modo que os dois acessos são
   indistinguíveis para esta entidade.
4. **A lacuna `BR-L07` (🟡) sobre `details` está superada.** A extração registra "schema
   string, logger envia object/null". O código migrado corrigiu a leitura: `AccessLog.ts:38`
   declara `details?: Nullable<string>` e `AccessLogger.ts:16-17` registra que a documentação
   anterior dizia "objeto" mas as duas chamadas existentes passam **texto**. O tipo agora
   reflete o uso real.
5. **O Dashboard grava um evento que a regra não enumera.** `BR-L03` de
   `logs-acesso/requirements.md#2` diz que os logs vêm de chamadas dedicadas em eventos
   específicos, "incluindo autenticação bem-sucedida e visualização de prontuários". A
   montagem do Dashboard não é nenhum dos dois: ela reaproveita a ação `login` como procuração
   de acesso à página, porque o enum não tem ação de painel.
6. **"Sem exportação real" é confirmado.** O ícone de download existe em `ACTION_CONFIG` como
   apresentação da ação `export_data`, mas não há nenhuma exportação implementada e a ação
   nunca é logada. A lacuna está certa.
7. **"Sem testes" (Alta) permanece verdadeira para este módulo** — e a extração diz "zero
   testes no projeto", o que está desatualizado desde a feature 002.
8. **O `details` do seed offline é `null`.** `AccessLog.ts:39` registra que o seed grava
   `null` ali, e a massa de prova precisa tolerar isso — um registro com `details` nulo não
   pode quebrar a tabela.

## 5. O achado dos modos de perda silenciosa, em detalhe

`BR-S01` de `domain.md#2.4` é 🟢 e promete que **todo** acesso ou alteração de dado sensível
gera um log. A feature 004 já provou que uma operação — emitir documento — não gera nenhuma.
Esta feature acrescenta **dois modos** em que a trilha perde um evento que deveria registrar,
e os dois são silenciosos:

| # | Modo | Onde | O que se observa |
| ---: | :--- | :--- | :--- |
| 1 | A identificação do usuário **falha** | `AccessLogger.ts:70-72` | O `catch` engole e imprime em `console.error`. Nenhum registro é criado e **nenhum erro chega a quem chamou** |
| 2 | A identificação devolve **usuário vazio** | `AccessLogger.ts:55` | O `return` antecipado sai **sem nem imprimir**. É o mais silencioso dos três |
| 3 | A gravação **não é aguardada** antes da navegação | `PatientDetail.tsx:177-178`, `Dashboard.tsx:110`, `Consultation.tsx:116` | O pedido é disparado e a navegação segue. Se a requisição for cancelada pela desmontagem, o registro se perde — **e este modo é declarado por leitura, não provado**: provar cancelamento exigiria simular o ciclo de vida da requisição, e o resultado diria mais sobre o arranjo do que sobre o sistema |

O modo 1 e o modo 2 são **provados** (`RF-11`, decisão `3a`); o modo 3 fica **declarado** na
matriz. Os três são consequência de uma decisão registrada no próprio módulo — "nunca
propagada, para não derrubar a operação principal" — e por isso **não** são corrigidos: a
decisão `3a` preserva a paridade.

> A consequência para quem lê a trilha é a que importa: **uma trilha incompleta e uma trilha
> completa são indistinguíveis** para quem só olha a tela. O sistema anuncia conformidade com
> a LGPD no cabeçalho (`Layout.tsx:216-220`), e a prova desta feature mostra os três pontos
> em que essa garantia vaza em silêncio.

## 6. Padrões aplicáveis

| Padrão | Aplicação nesta feature |
| :--- | :--- |
| Provar no transporte, não no módulo | O dublê fica em `base44.entities.AccessLog`; o `AccessLogger` corre de verdade (D-02). Mesma técnica da prova de auditoria da feature 004 |
| Asserção positiva para provar ausência | Contar as gravações **primeiro** e só então negar as demais operações (R-03, R-04) |
| Uma verificação por promessa, nome citando o requisito | Padrão das features 002 a 005 |
| A prova observa, não altera | Nenhum arquivo de aplicação é tocado; a feature acrescenta prova e matriz |
| Veredito verde exige ressalva visível | `PT-007.2` (metade servidor) e `PT-007.4` (teto de 500 congelado por AMB-004) |
| Declarar o comportamento de servidor | A RLS entra como declaração, com a mesma disciplina do default `agendada` (004) e dos defaults `is_default`/`is_active` (005) |
| Massa de prova com construtor local de data | Herdado de 003, 004 e 005: `new Date(ano, mês, dia)`, jamais string de data |

## 7. Fontes externas

- [Vitest — `vi.useFakeTimers` e a opção `toFake`](https://vitest.dev/api/vi.html#vi-usefaketimers) — o congelamento só do `Date` (D-08).
- [Vitest — `mockRejectedValue`](https://vitest.dev/api/mock.html#mockrejectedvalue) — o arranjo do caminho em que a identificação do usuário falha (RF-11).
- [React — `useEffect` e o array de dependências](https://react.dev/reference/react/useEffect#parameters) — a base do achado da duplicação (D-07).
- [Testing Library — tipos de consulta](https://testing-library.com/docs/queries/about#types-of-queries) — a espera pelos seletores e pela tabela depois da montagem assíncrona.
- [MDN — `Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) — o filtro triplo e a heurística dos indicadores.

## 8. O que **não** foi investigado

- **A RLS do servidor.** A imutabilidade da trilha e a restrição de leitura a admin são
  aplicadas fora do cliente (D-03).
- **O endereço de rede real.** O literal `'client-side'` é a promessa; não existe IP real no
  cliente para provar.
- **A exportação de dados.** `code-analysis.md#9` registra que não há exportação real; provar
  a ausência de um recurso confirmaria uma ausência, não uma promessa.
- **As agregações do Dashboard.** A prova do Dashboard toca um único efeito; o resto da tela
  pertence à suíte `08`, que está bloqueada pela Taxa de Atendimento.
- **Os demais menus do `Layout`.** A prova da navegação olha o item de auditoria e nada mais.
- **O seed offline de `AccessLog`.** Existe em `src/api/mockSeed.ts`, e a prova usa massa
  própria; o recorte do modo offline é do grupo `09`.
- **A correção de qualquer um dos achados.** A decisão `3a` provou e declarou, e as decisões
  `1a`, `2a` e `4a` mantiveram os demais achados como veredito, não como conserto.

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
