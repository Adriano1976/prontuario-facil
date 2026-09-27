# Investigation: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Requirements: `_reversa_forward/017-politica-de-leitura-dos-logs/requirements.md`

## 1. Pergunta de investigação

A decisão de produto foi **paginar de fato**. Antes de planejar, era preciso responder: *o sistema
tem como paginar, e a que custo?* O `requirements.md` registrou que o contrato de entidade não oferece
deslocamento, intervalo nem contagem — e a conclusão provisória era que a feature teria de **inventar**
uma capacidade. A investigação mostrou o contrário.

## 2. O que já existe no projeto — medido em 2026-09-25

| Peça | Onde | O que ela faz hoje |
|---|---|---|
| Contrato de entidade | `src/api/contract.ts:68-88` | `list(sort?, limit?)`, `filter(conditions, sort?, limit?)`, `create`, `update`, `delete`. **Sem `skip`, sem intervalo, sem contagem** |
| Interface do adaptador | `src/api/entities.ts:40-41` | `list(sort?: string, limit?: number)` — a mesma forma, já sem o terceiro parâmetro |
| Repasse ao SDK | `src/api/entities.ts:57-62` | `list: (sort, limit) => source.list(sort, limit)` |
| Cliente de modo offline | `src/api/mockClient.ts:63-81` | `sortAndLimit(registros, sort, limit)` → `out.slice(0, limit)` |
| Leitura da tela | `src/pages/AccessLogs.tsx:87-91` | `AccessLog.asAdmin(scope).list('-created_date', 500)` |
| Massa do modo offline | `src/api/mockSeed.ts:86-88` | **Um** registro de trilha (`log-1`) |
| Prova herdada | `src/pages/__tests__/AccessLogs.test.tsx:200` | Afirma os argumentos exatos `('-created_date', 500)` |

## 3. A descoberta que mudou o plano

**O SDK do provedor já aceita deslocamento.**

```
list<K extends keyof T = keyof T>(sort?: SortField<T>, limit?: number, skip?: number, fields?: K[]): Promise<Pick<T, K>[]>
filter<K extends keyof T = keyof T>(query: EntityFilterQuery<T>, sort?: SortField<T>, limit?: number, skip?: number, fields?: K[]): Promise<Pick<T, K>[]>
```

Em `node_modules/@base44/sdk/dist/modules/entities.types.d.ts:248` e `:345`, com a documentação inline
no próprio arquivo:

- `@param skip - Number of results to skip for pagination. Defaults to 0.`
- `@param limit - Maximum number of results to return. Defaults to 50.`
- `**Note:** The maximum limit is 5,000 items per request.`
- E um exemplo literal de terceira página: `await base44.entities.MyEntity.list('-created_date', 10, 20)`.

**Consequência para o plano.** A feature deixa de ser "inventar paginação" e passa a ser **parar de
perder um parâmetro no caminho**. Quem descarta `skip` é o nosso adaptador — `entities.ts:57` declara
`(sort, limit)` e repassa só dois argumentos. A extensão do contrato é uma **passagem**, e o comentário
de `contract.ts:61-63`, que diz que as assinaturas são "deliberadamente iguais às do legado",
**passa a ser mais verdadeiro** depois da mudança, não menos.

Efeito colateral: o item `PT-010` da suíte de paridade continua sendo o guarda-corpo certo — a mudança
tem de valer para **as duas** implementações, e o SDK real já tem o comportamento que o mock precisa
imitar.

## 4. Alternativas avaliadas

### 4.1 Mecanismo da paginação

| Candidata | Veredito |
|---|---|
| **Deslocamento (`skip`)** | **Escolhida.** É o que o SDK oferece, e o único expressável: o filtro compara apenas com `===`, então "os anteriores a esta data" não é pedível |
| Cursor por `created_date` | Descartada: exigiria operador de intervalo no contrato, que não existe e não é o que o SDK expõe no filtro |
| Carregar tudo e paginar no cliente | Descartada: troca a truncagem por um payload que cresce sem limite — exatamente o que a decisão de produto recusou |

### 4.2 Forma do parâmetro no contrato

| Candidata | Veredito |
|---|---|
| **Terceiro posicional: `list(sort?, limit?, skip?)`** | **Escolhida.** Espelha o SDK, torna o adaptador um repasse de uma linha, e mantém o contrato legível como espelho do legado |
| Objeto de opções (`list({ sort, limit, skip })`) | Descartada: diverge do SDK e obrigaria a reescrever as chamadas existentes — mudança de forma sem ganho |
| `offset` em vez de `skip` | Descartada: sinônimo, e usar o nome do SDK evita uma tradução mental a cada leitura |

### 4.3 Escopo da extensão

| Candidata | Veredito |
|---|---|
| **`list` e `filter`** | **Escolhida.** O SDK tem `skip` nas duas. Estender só a usada deixaria `filter` como armadilha silenciosa para a próxima feature |
| Só `list` | Descartada por isso |

### 4.4 Detecção de "há mais"

| Candidata | Veredito |
|---|---|
| **Pedir `recorte + 1` e exibir `recorte`** | **Escolhida.** Condição suficiente, sem contagem e sem nova operação. O excedente é a resposta |
| Criar operação de contagem | Descartada: acrescenta ao contrato uma capacidade que a decisão de produto não pediu e que o SDK não expõe na forma usada |
| Assumir que página cheia é a última | Descartada: erra sempre que a trilha é múltiplo exato do recorte — o controle de avanço ficaria habilitado para uma página vazia |

### 4.5 Superfície

| Candidata | Veredito |
|---|---|
| **Avançar e retroceder, posição sem total** | **Escolhida.** Sem contagem não existe "de N"; exibir um total falso seria repetir o defeito que a feature corrige |
| Paginação numerada ("1 2 3 … 12") | Descartada pelo mesmo motivo |
| "Carregar mais" acumulativo | Descartada: a lista cresceria sem teto na tela, reintroduzindo o problema de renderização que o recorte resolve |

## 5. Armadilhas medidas

| Armadilha | Medida em | Como o plano lida |
|---|---|---|
| **Deriva de deslocamento** — a trilha cresce entre duas leituras; com ordenação do mais recente para o mais antigo, um registro novo empurra os demais e a página 2 repete o último item da página 1 | Propriedade do deslocamento sobre tabela *append-only* (`BR-L01`) | Declarada como risco `R-01` de probabilidade **alta**; a alternativa por cursor não é expressável hoje |
| **Empate de carimbo** — `BR-L05` fixa um único campo de ordenação; dois registros com o mesmo `created_date` podem ordenar diferente entre requisições | `code-analysis.md#6` (`BR-L05`) | Declarada; ordenação por dois campos não é expressável |
| `limit = 0` é falso em `mockClient.ts:80` — hoje significa "sem limite" | `src/api/mockClient.ts:80` | Não alterar o herdado, mas **fixar em prova** para que a extensão com `skip` não o mude por acidente |
| O seed do modo offline tem **um** registro de trilha | `src/api/mockSeed.ts:87` | O `onboarding.md` traz o procedimento de semear massa no armazenamento local |
| A prova herdada trava os argumentos exatos | `AccessLogs.test.tsx:200` | Muda de propósito (`D-13`), com a razão no `legacy-impact.md` |

## 6. Fontes

**As tipagens da própria dependência**, que é onde a capacidade está documentada e é o que torna a
decisão verificável:

- `node_modules/@base44/sdk/dist/modules/entities.types.d.ts:214-248` — assinatura e documentação de
  `list`, incluindo `skip`, o teto de 5.000 por requisição e o exemplo de terceira página.
- `node_modules/@base44/sdk/dist/modules/entities.types.d.ts:255-345` — o mesmo para `filter`.

Nenhuma fonte **externa ao repositório** foi consultada, e isso é deliberado: a evidência decisiva
estava na dependência instalada, e ela responde a pergunta sem intermediário. A deriva de deslocamento
(risco `R-01`) é propriedade conhecida de paginação por `skip` sobre conjunto que cresce; está
declarada como risco aceito, não como descoberta nova.

## 7. O que a investigação **não** resolveu

- **Se a deriva de deslocamento incomoda na prática.** Ela é real e não tem contorno dentro do
  contrato atual. Numa trilha de clínica, o intervalo entre duas leituras de página é de segundos, e a
  chance de um registro entrar nesse intervalo depende do volume. Nenhuma medição foi feita porque
  depende de produção; a decisão foi declarar.
- **Se o recorte de 500 é o melhor tamanho.** A decisão preservou o valor do legado para não mudar a
  renderização. Se a renderização de 500 linhas se mostrar pesada, a correção é de desempenho e vira
  outra feature — o recorte passa a ser parâmetro.
- **Se o SDK honra `skip` no modo `asServiceRole` e sob RLS.** A assinatura é a mesma, mas só o
  adaptador de usuário é exercitado por este projeto. A prova cobre o mock e o repasse; o comportamento
  do servidor é o que a dependência documenta.
