# Regression Watch: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Cenário: **legado**

> **Regra de leitura deste arquivo.** Esta feature **não alterou nenhuma regra de negócio** — a seção "Modificadas" do `legacy-impact.md` está vazia. Portanto os itens abaixo **não são regressões a evitar**: são **propriedades que precisam continuar verdadeiras** depois da correção. Se um deles deixar de valer, a matriz voltou a mentir sobre a cobertura de provas, ou alguém desfez a correção sem perceber.
>
> Os IDs `W00x` reiniciam a cada feature. Toda citação a um watch item precisa **nomear a feature de origem** (a `001` usou `W001`–`W009`, a `002` `W001`–`W008`, a `003` `W001`–`W011`, a `004` `W001`–`W013`, a `005` `W001`–`W011`, a `006` `W001`–`W014`, e esta usa `W001`–`W008`).

## Watch principal

| ID | Origem (arquivo, seção) | Propriedade esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|--------------------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/code-spec-matrix.md` — tabela `Destino dos cenários de paridade não cobertos nesta feature` | A linha do grupo `Paridade visual (screens/V01 a V16)` declara **trabalho transferido com destino nomeado** (harness de paridade visual) | presença | A linha volta a dizer "Lacuna declarada", cita `present: false`, ou perde o destino nomeado |
| W002 | `_reversa_sdd/screens/golden/manifest.yaml` — entradas de tela | Nenhuma entrada de tela tem `present: false`; as 16 com `parityScenario` `PT-V01`…`PT-V16` têm golden presente | ausência | Aparece entrada de tela sem golden e a matriz continua afirmando cobertura |
| W003 | `_reversa_sdd/code-spec-matrix.md` — seção `Como a prova é executada` | Existe o parágrafo de paridade visual apontando `_reversa_sdd/screens/golden/manifest.yaml` como fonte única do `sha256` | presença | O apontador desaparece, ou a matriz passa a duplicar as 16 linhas do manifest |
| W004 | `_reversa_sdd/code-spec-matrix.md` — nota de saldo da seção de destino | A conta é **19 concluídos / 31 transferidos dos 50**, com a decomposição 15 de fluxo + 16 visuais e a data-base 2026-09-22 | redação | A conta volta a 15 transferidos sem qualificar os 16 visuais, ou perde a data-base |
| W005 | `_reversa_sdd/code-spec-matrix.md` — arquivo inteiro | Nenhum identificador (`PT-`, `BR-`, `W0xx`, `AMB-`, `DEV-`) foi renumerado, removido ou reinterpretado pela correção | ausência | Linha removida contendo identificador; ID reciclado para outro significado |
| W006 | `_reversa_sdd/code-spec-matrix.md` — seção `Lacunas de prova` | A lacuna remanescente da paridade visual está declarada como **execução** (harness), não como ausência de referência | presença | A linha volta a dizer que a captura dourada não existe |
| W007 | `_reversa_sdd/addenda/002-prova-automatizada.md` | O adendo `002` permanece **intocado**; a reconciliação vive no adendo `007` | ausência | O adendo `002` aparece modificado em `git status` |
| W008 | `_reversa_sdd/code-spec-matrix.md` — integridade do arquivo | UTF-8 sem BOM, quebras LF uniformes, acentuação íntegra | presença | `npm run prova:encoding` acusa o arquivo, ou ele passa a ter CRLF/BOM |

## Histórico de re-extrações

> Preenchido pelo agente reverso quando `/reversa` rodar de novo. Cada linha deve registrar a data da re-extração e o veredito de cada watch item (`W00x` → 🟢 / 🟡 / 🔴).

| Data da re-extração | Veredito por item | Observação |
|---|---|---|
| — | — | nenhuma re-extração desde a criação deste arquivo |

## Arquivadas

| ID | Origem | Motivo do arquivamento |
|---|---|---|
| — | — | — |

## Observações (sem peso de regressão)

Estes itens **não** entram no watch principal: nenhum deles é regra extraída (🟢) nem propriedade que a correção estabeleceu. Ficam registrados para quem escrever a próxima feature ou a próxima re-extração.

1. **O cenário Gherkin negativo do `requirements.md` não tem verificação correspondente** (finding `A003` da auditoria). Hoje a checagem é **vácua**: não existe entrada de tela com `present: false`, então "a matriz volta a declarar lacuna se o golden faltar" não é exercitável. Se um dia for, o item `W002` acima é quem vigia.
2. **A citação dos IDs `T009`/`T015`/`T016` sem qualificação de feature** (finding `A004`) foi mantida como está: são ações da feature `002`, e o `roadmap.md` §1 as cita no contexto "que construíram esse artefato por ações próprias". Um leitor futuro pode confundi-las com IDs desta feature — vale qualificar na próxima passagem por esse arquivo.
3. **A citação equivocada herdada da feature 006** (finding `A005`): `roadmap.md` da `006` atribui a `_reversa_sdd/architecture.md#1. Visão Resumida` a regra "schemas de entidade intocados", que não está nessa seção. O `data-delta.md` desta feature herdou o mesmo ponteiro. Defeito pré-existente, fora do escopo desta entrega.
4. **Números datados envelhecem** (finding `A006`): a guarda de encoding verificou **428** arquivos nesta execução (era 412 quando o `requirements.md` foi escrito, porque esta feature acrescentou 16 arquivos de texto). O `requirements.md` cita 412 **com data** — está correto como medição de 2026-09-22 no momento em que foi escrita; a contagem viva é a do `onboarding.md`.
5. **A paridade visual continua sendo conferência humana.** O golden existe, mas **executá-lo** exige o harness de paridade visual, que não existe no projeto (`parity_specs.md#Lacunas declaradas`). Até lá, o que existe é referência capturada — não prova executada.
