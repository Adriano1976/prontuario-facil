# Adendo: Prova automatizada do módulo de Logs de acesso

> Feature: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-22.

## Resumo da entrega

Provar os quatro cenários de `PT-007` — a trilha de auditoria — em três superfícies: o módulo
que grava (`AccessLogger`), a página que lê (`AccessLogs`) e as telas que disparam a gravação
(Dashboard e os dois detalhes). A entrega separa o que é do cliente do que é **RLS do
servidor**, dá veredito às três lacunas que ninguém tinha medido — a trilha que **perde eventos
em silêncio**, a tela de auditoria oferecida a quem não é admin e a **gravação duplicada** por
identidade de objeto —, e resolve a classificação imprecisa de `AccessLog` no contrato do
cliente.

**Ações concluídas: 19 de 19** (`actions.md`).

Gates medidos em 2026-09-22: `npm test` com **132 verificações em 23 arquivos e 0 falhas**,
`npm run typecheck` com 0 erros, `npm run lint` com 0 erros, `npm run prova:negativos` com 9 de
9 casos recusados pelo motivo esperado e sem resíduo, e `npm run prova:encoding` com 412
arquivos de texto íntegros.

> ⚠️ **O teto de tempo é uma propriedade CONDICIONAL, e as duas medições estão registradas.** A
> mesma suíte mediu **122,57 s** numa máquina sob carga — **acima do teto de 90 s** — e
> **75,78 s** numa máquina calma. A medição por arquivo mostra que a feature não é a causa: o
> maior contribuinte individual é `PatientForm.test.tsx`, com 13,11 s, **pré-existente**, e
> nenhum dos cinco arquivos novos aparece entre os doze mais lentos. Detalhe em
> `_reversa_forward/006-prova-logs-acesso/onboarding.md#7.1`.

**Nenhuma regra de negócio foi alterada, nenhum contrato de dados mudou e nenhum arquivo de
aplicação foi tocado.** `AccessLogger.ts`, `AccessLogs.tsx`, `Layout.tsx`, `Dashboard.tsx`,
`PatientDetail.tsx` e os schemas em `base44/entities/` estão sem nenhum diff.

> **Uma exceção, e ela é de prova, não de aplicação.** `src/pages/__tests__/Consultation.test.tsx`
> foi **modificado** — a primeira vez no ciclo forward que uma feature toca prova de outra. Os
> dois blocos novos entraram por acréscimo e as oito verificações anteriores seguem passando. E
> `PatientDetailAudit.test.tsx` é arquivo **novo** porque o vizinho dubla o módulo `AccessLogger`,
> o que seria incompatível com a prova no transporte.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/inventory.md` | `Cobertura de testes` | `regra-alterada` | A seção registrava 109 verificações em 18 arquivos. **Leia como:** 132 verificações em 23 arquivos, medidos em 2026-09-22 |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | **Acrescente a camada de prova da auditoria** — cinco arquivos de verificação e uma massa compartilhada — aos componentes do sistema. A trilha é a garantia de conformidade que o sistema anuncia no cabeçalho, e não tinha prova nenhuma |
| `_reversa_sdd/domain.md` | `2.4 Segurança e Auditoria` | `regra-alterada` | `BR-S01` ("todo acesso ou alteração de dado sensível deve gerar um log") está **parcialmente confirmada**: os eventos que disparam gravam, medidos no transporte — e a feature declara **três modos em que a trilha perde um evento em silêncio**. A regra permanece 🟢 no que promete; o que passa a existir é a medida do que ela não alcança |
| `_reversa_sdd/code-analysis.md` | `5.1 Entidade AccessLog (Base44 Schema)` (módulo logs-acesso) | `regra-alterada` | A nota **"somente admins veem a tela de auditoria; tentativa de usuário comum retornará vazio/negado"** é **imprecisa na primeira metade**: o item de navegação é incondicional (`Layout.tsx:48`) e nenhuma guarda intercepta o caminho — o não-admin **chega** à tela e vê a tabela vazia. A segunda metade está certa |
| `_reversa_sdd/code-analysis.md` | `4.1 Filtro Triplo Combinado` (módulo logs-acesso) | `regra-alterada` | O filtro triplo passa a ter prova de execução: busca por usuário e por paciente sem diferenciar maiúsculas, igualdade exata por ação, e os três recortes de data. **Correção de leitura:** os recortes de semana e de mês comparam apenas o **piso**, sem teto — um registro com data futura entra nos dois |
| `_reversa_sdd/code-analysis.md` | `4.2 Classificação Heurística de Ação para Stats` (módulo logs-acesso) | `regra-alterada` | A nota de que "a soma não fecha com o total" está **provada com número**: com um registro de cada ação, os três indicadores somam **8** contra um total de **12**, e `create_prescription` entra como "Edição" |
| `_reversa_sdd/code-analysis.md` | `6. Regras de Negócio Extraídas` (módulo logs-acesso) | `regra-alterada` | `BR-L01` a `BR-L03` **colidem** com os mesmos identificadores de `logs-acesso/requirements.md#2`, que denotam regras disjuntas. E `BR-L04`, `BR-L05` e `BR-L06` — limite de 500, ordenação decrescente e o endereço literal `'client-side'` — estão **confirmadas por medição**; `BR-L02` tem a metade do cliente provada e a do servidor declarada |
| `_reversa_sdd/code-analysis.md` | `9. Pontos de Atenção / Lacunas` (módulo logs-acesso) | `regra-alterada` | As seis lacunas ganham veredito: **"limite rígido 500"** é paridade congelada por decisão humana (AMB-004), não defeito a corrigir; **"stats por substring"** e **"filtro client-side"** passam a ter comportamento provado; **"`details` tipagem inconsistente"** está **superada** pela migração, que corrigiu o tipo para refletir o uso real; **"sem exportação real"** é confirmada; e **"sem testes"** está desatualizada para este módulo, que hoje tem 23 verificações |
| `_reversa_sdd/logs-acesso/requirements.md` | `2. Regras de Negócio (BRs)` | `regra-alterada` | Os identificadores `BR-L01` a `BR-L03` deste artefato são **disjuntos** dos mesmos códigos em `code-analysis.md#6` — e, ao contrário das colisões anteriores do projeto, os dois artefatos descrevem o **mesmo módulo**. Toda citação precisa qualificar a origem |
| `_reversa_sdd/logs-acesso/requirements.md` | `4. Permissões e Segurança (RLS)` | `regra-alterada` | Este trecho está **correto** e é o único dos quatro artefatos de regras do módulo que não precisou de ressalva: `create` aberto ao sistema, `read`/`update`/`delete` restritos a admin. A RLS **não é provável no cliente** e entra como declaração |
| `_reversa_sdd/migration/parity_tests/07-auditoria-acesso.feature` | `PT-007.2` | `regra-alterada` | O cenário tem uma metade provável no cliente (a trilha só insere, e a página não oferece operação sobre o registro) e uma metade que é **RLS**. O `.feature` fica com a metade do servidor **declarada**, no mesmo critério do default `agendada` da feature 004 |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | `Impacto por artefato da extração` | `regra-alterada` | O adendo da 001 agrupa a **trilha de auditoria** entre as "entidades de leitura livre", ao lado de médicos e templates. A classificação é **imprecisa** para ela: a leitura da trilha é admin-only na RLS, e `asUser`/`asAdmin` devolvem o mesmo repositório para esta entidade. O texto do adendo **não** é reescrito — ele descrevia corretamente a decisão de escopo daquela feature |
| `_reversa_sdd/code-spec-matrix.md` | `Cenários de paridade do grupo 07` | `regra-nova` | Seção nova com o veredito dos quatro cenários: `PT-007.1` e `PT-007.3` 🟢; `PT-007.2` 🟢 **metade** e 🔴 **metade** (a RLS é declarada); `PT-007.4` 🟢 **com ressalva**, porque o teto de 500 é paridade congelada (AMB-004) |
| `_reversa_sdd/code-spec-matrix.md` | `Registros declarados do grupo 07` | `regra-nova` | Dez registros que passam a ter veredito, entre eles os **três modos de perda silenciosa**, a duplicação por identidade de objeto nas duas telas, a tela oferecida a quem não é admin, a classificação de `AccessLog` no contrato do cliente e o trio de ações órfãs |
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo `Logs de acesso (07)` deixa de estar endereçado a uma feature a criar e passa a **concluído**. O saldo dos cenários transferidos cai de **19 para 15** |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | Ganha **oito linhas novas**, entre elas os três modos de perda silenciosa, os indicadores que não somam, o recorte sem teto, a colisão das famílias `BR-L` e o registro de que `PatientDetail.test.tsx` mede a **chamada**, não o transporte. A linha da paridade dos módulos restantes vai de 34 → 19 para 34 → 15 |

> O adendo **anota, não corrige**: nenhuma afirmação dos artefatos originais foi editada. As
> correções factuais de `inventory.md` e as extensões de `code-spec-matrix.md` foram aplicadas
> pelas ações T015 e T016 da própria feature, com a razão declarada nos arquivos; o que este
> adendo faz é registrar que existem, para quem lê a extração sem passar pelo ciclo forward.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/006-prova-logs-acesso/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009` · `W010` · `W011` · `W012` · `W013` · `W014`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar: são
**propriedades que precisam continuar verdadeiras**. Quatro merecem destaque para quem for ler o
watch:

- **`W004` e `W005` são a trava da falha aberta.** Ao afirmar que a gravação não propaga erro nos
  dois caminhos de perda, a suíte passou a falhar no dia em que alguém corrigir isso — **por
  desenho** (decisão `3a`). A correção exige alterar as verificações de propósito, e a decisão
  fica visível no diff.
- **`W008` é um watch de AUSÊNCIA**, tipo incomum neste projeto: ele vigia a **falta** de uma
  guarda de papel no caminho até a tela de auditoria. Se uma guarda aparecer, **não** é defeito —
  é regra nova, e a nota da matriz sobre quem vê a tela deixa de valer. O mesmo tipo aparece em
  `W010`, que vigia o uso do **objeto** (e não do identificador) nas dependências do efeito.
- **`W014` vigia a separação entre prova de chamada e prova de transporte.** É o que obrigou o
  arquivo novo: se alguém mover a prova de transporte para o arquivo que dubla o módulo
  `AccessLogger`, ela vira uma prova de chamada com aparência de prova de transporte.

A seção de observações daquele arquivo registra os oito itens sem peso de regressão, entre eles a
**condicionalidade do teto de 90 segundos**, medido em 75,78 s e em 122,57 s na mesma suíte.

## Fontes

- `_reversa_forward/006-prova-logs-acesso/legacy-impact.md`
- `_reversa_forward/006-prova-logs-acesso/regression-watch.md`
- `_reversa_forward/006-prova-logs-acesso/requirements.md`
- `_reversa_forward/006-prova-logs-acesso/roadmap.md`
- `_reversa_forward/006-prova-logs-acesso/investigation.md`
- `_reversa_forward/006-prova-logs-acesso/data-delta.md`
- `_reversa_forward/006-prova-logs-acesso/actions.md`
- `_reversa_forward/006-prova-logs-acesso/progress.jsonl`
- `_reversa_forward/006-prova-logs-acesso/onboarding.md`

---
*Gerado pelo Reversa-Sync em 2026-09-22.*
