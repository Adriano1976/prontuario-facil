# Legacy Impact: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Âncora de contexto: **legado** (`_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`)
> Política de edição no momento da execução: `allowLegacyEdits: true`, com `allowedPaths` liberando
> `README.md`, `README.en.md`, `src/**`, `package.json`, `tsconfig.json`, `docs/**`, `index.html` e
> `.github/**`. Todo arquivo de projeto tocado caiu em `src/**`; nenhuma recusa foi necessária.

## 1. Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `src/api/contract.ts` | Contrato de entidade | `contrato-alterado` | **HIGH** | `EntityRepository.list` e `.filter` ganham `skip` como terceiro posicional. É o ponto exato onde a capacidade se perdia |
| `src/api/entities.ts` | Adaptador do provedor | `contrato-alterado` | MEDIUM | `RepoLike` e `createEntityRepository` passam a repassar o deslocamento ao SDK, que já o aceita |
| `src/api/mockClient.ts` | Cliente de modo offline | `contrato-alterado` | MEDIUM | `sortAndLimit` recorta `[skip, skip + limit)` depois de ordenar |
| `src/pages/AccessLogs.tsx` | `AccessLogs` (`_reversa_sdd/code-analysis.md#Análise de Código — Módulo logs-acesso`) | `regra-alterada` | **HIGH** | Leitura paginada, navegação entre recortes, rótulo do indicador corrigido e declaração do alcance da busca |
| `src/test/auditFixtures.ts` | Massa de prova | `componente-novo` | LOW | Conjunto paginado com 501 registros e carimbos determinísticos |
| `src/api/__tests__/leituraPaginada.test.ts` | Prova | `componente-novo` | LOW | Transparência do adaptador quanto ao deslocamento |
| `src/api/__tests__/mockClientOffline.test.ts` | Prova | `regra-alterada` | LOW | Duas verificações do deslocamento no cliente offline |
| `src/pages/__tests__/AccessLogs.test.tsx` | Prova | `regra-alterada` | MEDIUM | O dublê de `useQuery` passou a devolver o retorno do transporte; três verificações herdadas mudaram de propósito |

## 2. Diff conceitual por componente

**Regra `BR-L04` — "Limite de 500 registros por consulta".** É a regra 🟢 do legado que esta feature
**substitui**, e é a razão de a severidade do delta ser HIGH. O limite continua valendo 500, e o que
muda é o que ele **é**: deixa de ser teto absoluto e passa a ser o tamanho do recorte por leitura.
Antes, o 501º registro mais recente era inalcançável e nada dizia isso; agora existe a página
seguinte, e o caminho até o resto da trilha.

**Contrato de entidade e as duas implementações.** A extensão é uma **passagem**, não uma capacidade
nova: o SDK do provedor já expõe `skip` (`entities.types.d.ts:248` e `:345`), documentado como
"Number of results to skip for pagination", com o teto de 5.000 por requisição e exemplo de terceira
página. Quem descartava o parâmetro era o adaptador, que declarava `(sort, limit)` e repassava dois
argumentos. O comentário de `contract.ts` que diz que as assinaturas são "deliberadamente iguais às do
legado" **passou a ser mais verdadeiro**, não menos.

**`AccessLogs`.** A leitura pede **um registro a mais** do que exibe. O excedente é o que diz que há
recorte seguinte — o contrato não tem operação de contagem, e esta feature não a criou. A página
entrou na chave de cache, e o rótulo "Total de Logs" virou "Logs neste recorte", porque ele sempre
mediu o conjunto carregado. A tela declara que a busca alcança o recorte, e não a trilha.

## 3. Regras 🟢 do `_reversa_sdd/domain.md` e da extração preservadas

| Regra | Conteúdo | Por que segue intacta |
|---|---|---|
| `BR-L01` | A trilha é *append-only*; vedada edição ou exclusão por usuários comuns | Nenhuma operação de escrita foi tocada. A prova de "somente leitura" continua passando |
| `BR-L02` | A ação registrada pertence ao enum suportado | O enum não foi tocado |
| `BR-L03` | Os logs nascem de chamadas dedicadas, não de interceptação de rota | Intocado |
| `BR-L05` | Ordenação sempre mais recente primeiro (`-created_date`) | Preservada, e agora provada em **todas** as páginas |
| `BR-MIGRAR-024` | A leitura da trilha é restrita a administrador | Preservada: a leitura continua declarando escopo administrativo, e quem não é admin recebe conjunto vazio sem chegar a perguntar |
| `BR-MIGRAR-043` | `filter` compara apenas com `===` | Preservada — e é por isso que o deslocamento, e não um intervalo de data, é o mecanismo da paginação |
| `BR-S01` | Todo acesso a dado sensível gera registro em `AccessLog` | Intocado |

## 4. Regras 🟢 modificadas

| Regra | Conteúdo original | O que passa a valer | Onde |
|---|---|---|---|
| `BR-L04` | "Limite de 500 registros por consulta" — `_reversa_sdd/code-analysis.md#6` | O limite continua sendo **500**, e passa a ser o **tamanho do recorte**: a leitura aceita deslocamento, e a tela navega entre recortes | `src/api/contract.ts`, `src/api/entities.ts`, `src/api/mockClient.ts`, `src/pages/AccessLogs.tsx` |

**Nenhuma regra foi removida.**

## 5. Paridade rompida, e o que a autoriza

O comentário de PARIDADE de `AccessLogs.tsx` afirmava que continuavam iguais "a leitura com limite de
500 registros ordenados por criação, [...] e a tabela com a ausência de paginação". A última parte
deixou de ser verdadeira e foi reescrita.

O que autoriza a quebra, em três fontes da própria extração:

1. `_reversa_sdd/gaps.md` lista `G-02` como lacuna aberta pedindo a decisão da política acima de 500.
2. `_reversa_sdd/code-analysis.md#Análise de Código — Módulo logs-acesso` descreve a tela como
   "tabela paginada implicitamente (limite 500 registros)" — o eufemismo escondia a truncagem.
3. `_reversa_sdd/migration/ambiguity_log.md#AMB-004` congelou a paridade e adiou a política real para
   "fase futura", que é esta feature.

A decisão foi tomada pelo dono do produto em duas sessões de esclarecimento em 2026-09-25, registradas
em `requirements.md#9`.

## 6. Provas herdadas que mudaram de propósito

| Verificação | O que afirmava | O que afirma agora | Por quê |
|---|---|---|---|
| `pede os registros com a ordenação e o limite exatos` | `('-created_date', 500)` | `('-created_date', 501, 0)`, com o excedente descartado | O pedido mudou (`D-06`, `D-13`) |
| `não oferece controle de paginação e não reconsulta` | ausência de controles de paginação | a navegação **existe**; o que permanece é "filtro não reconsulta" | Invertida de propósito |
| `conta por heurística de substring` | `indicador('Total de Logs')` | `indicador('Logs neste recorte')` | O rótulo mentia (`RN-02`) |
| `não pergunta ao servidor quando a sessão não é de administrador` | via o registro na tela, porque o dublê o entregava | **não** vê registro nenhum, e a tela diz "Nenhum log encontrado" | A metade de tela faltava |

## 7. Arquivos do projeto tocados — conferência

Oito arquivos, todos sob `src/**`. Nenhum arquivo de configuração, nenhuma dependência nova, nenhuma
migração de dados, nenhum contrato externo. Conferido por `git status --porcelain` em `T031`.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-coding` | reversa |

---
*Gerado pelo Reversa-Coding em 2026-09-27.*
