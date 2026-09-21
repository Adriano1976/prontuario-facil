# Adendo: Prova automatizada da emissão de documento com template

> Feature: `005-prova-templates`
> Data: `2026-09-21`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-21.

## Resumo da entrega

Provar os quatro cenários de `PT-006` — a emissão de documento a partir de modelo — no
componente por onde passa **todo** documento clínico emitido no sistema, tanto pelo módulo de
Consultas quanto pelo de Pacientes. A entrega fecha a lacuna 🔴 que a extração deixou aberta
em `code-analysis.md#5.3` (a variável `{DIAS_AFASTAMENTO}` é substituída?), dá **evidência de
execução** às três lacunas de severidade Alta preservadas em AMB-006, e declara o limite
estrutural de dois dos quatro cenários, que são predicados **do servidor**.

**Ações concluídas: 18 de 18** (`actions.md`).

Gates medidos em 2026-09-21: `npm test` com **109 verificações em 18 arquivos e 0 falhas**
(67,42 s, contra o teto de 90 s), `npm run typecheck` com 0 erros, `npm run lint` com 0 erros,
`npm run prova:negativos` com 9 de 9 casos recusados pelo motivo esperado e sem resíduo, e
`npm run prova:encoding` com 399 arquivos de texto íntegros.

**Nenhuma regra de negócio foi alterada, nenhum contrato de dados mudou e nenhum arquivo de
aplicação foi tocado.** O componente provado — `PrescriptionEditor.tsx` — está sem nenhum
diff, assim como `Templates.tsx` e os schemas em `base44/entities/`. O que muda nesta entrega
é a **verificabilidade** de parte das regras, e o que muda de conteúdo são artefatos da
extração que descreviam o sistema sem essa prova.

> **Onde a feature NÃO chegou, e a distinção importa.** O grupo se chama
> `Templates (06)`, mas seus quatro cenários provam a **emissão de documento com modelo**,
> cujo componente a extração analisa dentro do módulo **consultas** (`code-analysis.md#4.4` e
> `#4.6`). A página de administração de modelos (`Templates.tsx`) — CRUD, agrupamento por
> tipo, `is_default`, `insertVariable` e o campo `variables` órfão — **não é tocada por
> nenhum dos quatro** e segue sem prova.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/inventory.md` | `Cobertura de testes` | `regra-alterada` | A seção registrava "10 arquivos de verificação". **Leia como:** 18 arquivos e 109 verificações em 2026-09-21, mais a guarda de codificação entre os comandos. A citação de `jsconfig.json` foi corrigida para `tsconfig.json`, vigente desde a migração da feature 001 |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | **Acrescente a camada de prova do editor de documentos** — um arquivo de verificação e uma massa compartilhada — aos componentes do sistema. O fluxo 3 ("Médico usa `Templates` → cria `Prescription`") passa a ter prova de execução no componente que o implementa |
| `_reversa_sdd/domain.md` | `2.3 Documentos e Templates` | `regra-alterada` | `BR-T01` e `BR-T02` **permanecem corretas** e agora têm medição: o pedido de modelos carrega o tipo corrente como predicado e é reemitido na troca de tipo, e o portão de `medications` foi provado no payload, não na tela. Nenhuma das duas foi alterada. **Atenção:** os identificadores `BR-T01`/`BR-T02` **colidem** com os de `code-analysis.md#6` do módulo templates e de `templates/requirements.md#2` — ver o registro da colisão na matriz |
| `_reversa_sdd/code-analysis.md` | `4.4 Substitution de Variáveis de Template` e `4.5 Template Variable Substitution` (módulo consultas) | `regra-alterada` | As duas lacunas de severidade **Alta** deste trecho — `applyTemplate` sem escape e `handlePrint` injetando em `window.open` — deixam de ser declaração e passam a ter evidência de execução. Continuam **abertas**: corrigir sai da paridade. **Correção de leitura:** a substituição ocorre na **escolha do modelo**, não no salvamento — o texto editado depois é o que se persiste |
| `_reversa_sdd/code-analysis.md` | `5.3 Constante AVAILABLE_VARIABLES` (módulo templates) | `regra-alterada` | A nota registrava 🔴 **LACUNA**: "`{DIAS_AFASTAMENTO}` é substituída pelo PrescriptionEditor? Não confirmado no código analisado". **Leia como:** confirmado que **não é** substituída em nenhum caminho. A lacuna está fechada, e o agravante que a extração não tinha é que o editor **coleta** os dias de afastamento e os envia em `valid_days`, deixando o marcador no texto |
| `_reversa_sdd/code-analysis.md` | `6. Regras de Negócio Extraídas` (módulo templates) | `regra-alterada` | Os identificadores `BR-T01` a `BR-T04` deste artefato denotam regras **disjuntas** das que `domain.md#2.3` numera com os mesmos códigos. Toda citação precisa qualificar o artefato de origem |
| `_reversa_sdd/code-analysis.md` | `9. Pontos de Atenção / Lacunas` (módulo templates) | `regra-alterada` | A linha "`{DIAS_AFASTAMENTO}` sem substituidor" (Alta) passa de suspeita a **fato medido**. A linha "Sem testes" (Alta) está desatualizada para este componente, que hoje tem 19 verificações — permanece válida como afirmação sobre os módulos ainda sem prova |
| `_reversa_sdd/templates/requirements.md` | `2. Regras de Negócio (BRs)` | `regra-alterada` | A **terceira** família de numeração para a mesma superfície: `BR-T01` a `BR-T04` aqui significam coisas diferentes do que significam em `domain.md#2.3`. A colisão está registrada na matriz e no watch |
| `_reversa_sdd/templates/requirements.md` | `4. Permissões e Segurança (RLS)` | `regra-alterada` | **Impreciso em dois pontos.** O documento restringe `Update`/`Delete` a admin e a leitura a templates **ativos**; o schema diz `create` exige admin, `update`/`delete` são **criador ou** admin, e `read` é `null` — aberto a qualquer autenticado. É RLS de servidor e não é provável no cliente |
| `_reversa_sdd/migration/parity_tests/06-emissao-documento-template.feature` | `PT-006.3` | `regra-alterada` | A redação "as variáveis são interpoladas **no save**" é imprecisa: a substituição acontece na seleção do modelo, e o campo de conteúdo segue editável até o salvamento. O `.feature` fica declarado impreciso, na mesma família de `PT-005.1` |
| `_reversa_sdd/code-spec-matrix.md` | `Cenários de paridade do grupo 06` | `regra-nova` | Seção nova com o veredito dos quatro cenários: `PT-006.1` 🟢 pleno; `PT-006.2` e `PT-006.4` 🟢 **com ressalva declarada**, porque o filtro por tipo e por atividade é predicado do servidor; `PT-006.3` 🟢 **com redação imprecisa** |
| `_reversa_sdd/code-spec-matrix.md` | `Registros declarados do grupo 06` | `regra-nova` | Seis registros que passam a ter veredito, entre eles dois achados que **não constavam de `code-analysis.md#9`**: trocar o tipo depois de aplicar um modelo deixa conteúdo obsoleto com procedência nula, e reabrir um documento não recupera o modelo de origem |
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo `Templates (06)` deixa de estar endereçado a uma feature a criar e passa a **concluído**. O saldo dos cenários transferidos cai de **23 para 19** |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | Ganha as três lacunas de severidade Alta **com evidência** e explicitamente abertas; atualiza a linha da paridade dos módulos restantes (34 → 19) e acrescenta três linhas declaradas: a colisão das famílias `BR-T`, a imprecisão da RLS de `templates/requirements.md#4` e a administração de modelos sem prova |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas declaradas do módulo de Consultas` | `regra-alterada` | As linhas 2 e 3 — `applyTemplate` sem escape de marcação e `handlePrint` do editor por injeção — passam de "🔴 declarada, não provada" para "🟢 provada e declarada". O defeito **não** foi corrigido: deixou de ser suspeita |

> O adendo **anota, não corrige**: nenhuma afirmação dos artefatos originais foi editada. As
> correções factuais de `inventory.md` e as extensões de `code-spec-matrix.md` foram aplicadas
> pelas ações T014 e T015 da própria feature, com a razão declarada nos arquivos; o que este
> adendo faz é registrar que existem, para quem lê a extração sem passar pelo ciclo forward.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/005-prova-templates/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009` · `W010` · `W011`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar: são
**propriedades que precisam continuar verdadeiras**. Três deles merecem destaque para quem
for ler o watch:

- **`W001`, `W002` e `W003` são a trava de paridade de AMB-006.** Ao afirmar o defeito, a
  suíte passou a falhar no dia em que alguém corrigir a substituição ou a impressão. Isso é
  intencional (decisão D-08): quem corrigir precisa alterar a verificação **de propósito**, e
  a decisão fica visível no diff em vez de escorregar.
- **`W005` é um watch de ausência**, tipo incomum neste projeto: ele vigia a **falta** de uma
  segunda linha de defesa no cliente. Se um re-filtro aparecer, não é defeito — é regra nova,
  e invalida a ressalva que a matriz registra em `PT-006.2` e `PT-006.4`.
- **`W010` vigia o escopo do grupo.** Se a matriz passar a apresentar `Templates.tsx` como
  coberto sem que exista arquivo de verificação para ele, o adendo e a matriz estarão mentindo
  juntos.

A seção de observações daquele arquivo registra os oito itens sem confidência suficiente para
o watch principal, entre eles a **limitação da guarda de encoding** — ela varre bytes e não
distingue texto corrompido de texto que **cita** corrupção, o que nesta rodada fez a
documentação de um incidente virar o incidente.

## Fontes

- `_reversa_forward/005-prova-templates/legacy-impact.md`
- `_reversa_forward/005-prova-templates/regression-watch.md`
- `_reversa_forward/005-prova-templates/requirements.md`
- `_reversa_forward/005-prova-templates/roadmap.md`
- `_reversa_forward/005-prova-templates/investigation.md`
- `_reversa_forward/005-prova-templates/data-delta.md`
- `_reversa_forward/005-prova-templates/actions.md`
- `_reversa_forward/005-prova-templates/progress.jsonl`
- `_reversa_forward/005-prova-templates/onboarding.md`

---
*Gerado pelo Reversa-Sync em 2026-09-21.*
