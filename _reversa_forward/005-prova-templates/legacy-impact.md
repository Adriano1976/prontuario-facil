# Impacto no Legado: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido no início da rodada:

```json
{
  "version": 1,
  "allowLegacyEdits": true,
  "allowedPaths": ["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]
}
```

Os dois arquivos criados em `src/` casam com o glob `src/**` e estavam liberados. Nenhuma
escrita foi feita fora da lista, e `.reversa/reversa-config.json` **não** foi tocado — ele só
muda pela mão do usuário. As pastas próprias do Reversa (`_reversa_sdd/`, `_reversa_forward/`)
são sempre graváveis e receberam o adendo de rastreabilidade e os artefatos da feature.

> **Um caminho que a feature quase precisou e não estava liberado:** `vitest.config.ts`, para
> ampliar o `testTimeout` do arquivo mais lento da suíte. Não foi necessário nesta rodada — a
> suíte fechou verde com o teto atual — mas fica registrado como o candidato natural caso a
> oscilação volte (observação 8 do `regression-watch.md`).

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| `src/test/templateFixtures.ts` | Camada de prova (nova) | `componente-novo` | **LOW** | Massa de prova fictícia. Não tem efeito fora da suíte e não é importada por nenhum arquivo de aplicação |
| `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | Camada de prova (nova) | `componente-novo` | **LOW** | 19 verificações sobre o editor de documentos. O componente provado não foi alterado |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganhou a seção de paridade do grupo 06, os registros declarados, o saldo 23 → 19 e o veredito das três lacunas Alta com evidência |
| `_reversa_sdd/inventory.md` | Superfície do código | `regra-alterada` | **LOW** | A seção de cobertura dizia "10 arquivos de verificação"; passa a registrar 18 arquivos e 109 verificações, e corrige a citação de `jsconfig.json` para `tsconfig.json` |
| `_reversa_forward/005-prova-templates/*` | Artefatos do ciclo forward | `componente-novo` | **LOW** | Requirements, roadmap, investigação, delta de dados, onboarding, ações, progresso, watch e este arquivo. Pasta própria do Reversa |

## Diff conceitual por componente

**Camada de prova — nada do sistema mudou.** Esta feature é a mais estreita das quatro do
ciclo: ela **não** altera comportamento. Todo o delta está em arquivos que a suíte executa e
em artefatos de documentação. O componente provado, `PrescriptionEditor.tsx`, foi lido e
medido, e o diff é **vazio**.

**O que a feature de fato mudou foi a leitura do legado.** Três lacunas de severidade Alta que
a extração registrava como "declaradas, não provadas" passaram a ter evidência de execução, e
uma lacuna 🔴 do módulo de templates ("não confirmado no código analisado") está fechada:

- `{DIAS_AFASTAMENTO}` **não é substituída** — e o agravante que a extração não tinha: o
  editor coleta os dias de afastamento, envia em `valid_days` e ainda assim deixa o marcador
  no texto;
- a substituição **não escapa marcação** — o conteúdo literal chega ao campo e ao payload;
- a impressão **injeta** esse conteúdo sem escape em um documento escrito por `window.open`.

As três continuam **abertas**: a decisão foi provar e declarar, não corrigir. A consequência
está declarada em `roadmap.md` (D-08): as asserções **travam a paridade**, e corrigir exige
alterar a verificação de propósito.

**Dois achados novos, que não constavam de `code-analysis.md#9`.** A troca do tipo de
documento depois de aplicar um modelo deixa o texto antigo no campo — e ele vai para o
documento do tipo novo, porque o schema **copia** o conteúdo em vez de referenciar o modelo —
enquanto a procedência (`template_name`) fica nula. E abrir o editor para reeditar um documento
não recupera o modelo de origem, porque não há campo de modelo nos dados iniciais.

**Um defeito documental da extração, agora com instância confirmada.** As famílias `BR-T`
colidem: `domain.md#2.3` usa `BR-T01` e `BR-T02` para *filtro por tipo* e *gate de
medicamentos*, enquanto `code-analysis.md#6` do módulo templates e `templates/requirements.md#2`
usam os **mesmos identificadores** para *campos obrigatórios* e *enum de 7 valores*. É o mesmo
ID com dois conteúdos — forma pior que a divergência de grafia de `BR-C`, porque qualificar
pelo identificador não resolve.

## Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` e da extração que esta feature **confirmou por medição**,
e que seguem intactas:

| Regra | Origem | O que a prova confirmou |
| :--- | :--- | :--- |
| `BR-T01` — templates de documentos são filtrados pelo `type` | `domain.md#2.3` | O pedido do cliente carrega o tipo corrente como predicado, e é reemitido quando o tipo muda. **Ressalva:** o filtro é aplicado no servidor; o cliente não re-filtra, e isso está provado |
| `BR-T02` — `medications` só é visível para tipos que incluem "receita" | `domain.md#2.3` | Confirmada na tela **e** no payload. A prova acrescenta a metade que a regra não enuncia: o portão é a montagem do payload, independente da visibilidade |
| `BR-C-05` — prescrição exige `patient_id`/`type`/`content`; `medications` só para receita | `code-analysis.md#6` (módulo consultas) | Metade de `medications` confirmada por execução, com as três gravações da verificação de portão |
| `BR-T07` — `is_active = false` esconde o template do editor | `code-analysis.md#6` (módulo templates) | Confirmada no **pedido** (`is_active: true` em todos os tipos). A ocultação em si é do servidor |
| Regra de ouro do diff: schemas de entidade intocados | `architecture.md#1` | `base44/entities/` **sem nenhum diff** |

## Modificadas

Nenhuma regra de negócio foi alterada, removida ou rebaixada. O que mudou foi o **veredito de
prova** de leituras que já existiam — e é isso que vai para o watch:

| Leitura | De | Para | Onde está registrado |
| :--- | :--- | :--- | :--- |
| `applyTemplate` sem escape de marcação | 🔴 declarada, não provada | 🟢 **provada e declarada** (defeito aberto) | `code-spec-matrix.md#Lacunas declaradas do módulo de Consultas`, linha 2 |
| `handlePrint` do editor por injeção em `window.open` | 🔴 declarada, não provada | 🟢 **provada e declarada** (defeito aberto) | `code-spec-matrix.md#Lacunas declaradas do módulo de Consultas`, linha 3 |
| A lacuna de `{DIAS_AFASTAMENTO}` | 🔴 "não confirmado no código analisado" | 🟢 **fato medido** — a variável não é substituída | `code-spec-matrix.md#Registros declarados do grupo 06`, registro 3 |
| Destino do grupo `Templates (06)` | "Feature a criar" | ✅ **concluído** — prova da emissão, administração segue sem prova | `code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` |
| Saldo dos cenários transferidos | 23 restantes | **19 restantes** | Nota de saldo, logo abaixo da tabela de destino |
| Cobertura de testes | 10 arquivos | **18 arquivos, 109 verificações** | `inventory.md#Cobertura de testes` |

**Não modificadas, e a ausência é deliberada:** `src/components/medical/PrescriptionEditor.tsx`,
`src/pages/Templates.tsx`, `base44/entities/*.jsonc` e `src/test/verificacoes-negativas.mjs`.
Nenhum byte deles foi tocado — a feature observa, não altera.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
