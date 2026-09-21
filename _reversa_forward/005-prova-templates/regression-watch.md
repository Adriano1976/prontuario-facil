# Regression Watch: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

Este arquivo diz o que precisa **continuar verdadeiro** quando uma nova extração `/reversa`
rodar sobre este código. Ele não é uma lista de desejos: cada item nasceu de uma regra que
esta feature provou, e o sinal de violação é o que se deve procurar no diff da re-extração.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
| :--- | :--- | :--- | :--- | :--- |
| **W001** | `code-analysis.md#5.3` (módulo templates); `code-analysis.md#9` (módulo templates) | `{DIAS_AFASTAMENTO}` **não** é substituída em nenhum caminho de emissão: o marcador literal atravessa o salvamento e chega ao payload | `presença` | O payload de um atestado traz um valor no lugar do marcador, ou o `valid_days` passa a alimentar o texto. Uma extração que afirme que a variável **é** resolvida está errada |
| **W002** | `code-analysis.md#4.5` e `#9` (módulo consultas); AMB-006 | A substituição de variáveis **não** escapa marcação: o conteúdo do modelo chega literal ao campo e ao payload | `presença` | Aparece marcação escapada (`&lt;`, `&gt;`, `&amp;`) no payload, ou um utilitário de sanitização entra no caminho de emissão |
| **W003** | `code-analysis.md#9` (módulo consultas); AMB-006 | `handlePrint` do editor injeta o conteúdo **sem escape** em um documento escrito por `window.open` + `document.write` | `presença` | O HTML escrito passa a trazer marcação escapada, ou o método deixa de usar `window.open` — nos dois casos, comportamento observável mudou e a paridade com o legado se rompeu |
| **W004** | `PrescriptionEditor.tsx:112-117`; `BR-C-08`; `BR-T07` | O pedido de modelos carrega **os dois** predicados: o tipo do documento corrente e `is_active: true` | `presença` | A consulta perde um dos predicados, ou passa a ser uma listagem sem filtro seguida de recorte no cliente |
| **W005** | `PrescriptionEditor.tsx:112-117`, decisão D-06 | O cliente **não** re-filtra o resultado da consulta de modelos: o que o servidor devolver é o que o seletor oferece | `ausência` | Surge no cliente uma segunda linha de defesa (recorte por `type` ou por `is_active` depois da resposta). Isso **não** é defeito: é regra nova, e invalida a ressalva que a matriz registra em `PT-006.2` e `PT-006.4` |
| **W006** | `PrescriptionEditor.tsx:185` e `:320`; `BR-C-05`; `domain.md#2.3` `BR-T02` | `medications` é barrado na **montagem do payload** por `type.includes('receita')`, de forma independente da visibilidade da seção | `presença` | O portão passa a depender da seção estar visível, ou a lista é limpa ao ocultar a seção — o que mudaria o comportamento provado na terceira gravação |
| **W007** | `PrescriptionEditor.tsx:44-51`; `base44/entities/Prescription.jsonc` | O seletor de tipo do editor oferece **exatamente** os seis tipos de `Prescription`, sem `anamnese` | `presença` | A lista ganha um sétimo tipo, perde um, ou passa a divergir do enum do schema |
| **W008** | `PrescriptionEditor.tsx:141-163`; `RN-02` da feature 005 | A substituição de variáveis acontece na **escolha do modelo**, e não no salvamento; o campo de conteúdo segue editável e é o que se persiste | `redação` | A substituição migra para o salvamento. A redação de `PT-006.3` ("interpoladas no save") passaria a estar **correta**, e o cenário deixaria de ser impreciso |
| **W009** | `code-analysis.md#5.3`, nota da lacuna 🔴 | A lacuna sobre `{DIAS_AFASTAMENTO}` está **fechada**: a variável não é substituída, e isso é fato medido, não suspeita | `confidência` | Uma extração futura volta a marcar a lacuna como 🔴 "não confirmado no código analisado", ou afirma o contrário sem prova |
| **W010** | `code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | O grupo `Templates (06)` tem prova de **emissão de documento com modelo**, e **não** da administração de modelos | `presença` | A matriz passa a apresentar `Templates.tsx` como coberto sem que exista arquivo de verificação para ele. A administração continua sem prova |
| **W011** | `code-spec-matrix.md#Lacunas de prova`; `addenda/` das features 002 a 005 | Nenhum adendo é apagado ou reescrito: a cadeia 001 a 005 permanece vigente até a re-extração marcar a superação | `presença` | Um adendo some, ou é editado no lugar em vez de receber a linha de superação |

## Observações

Itens que **não** têm peso de regressão: são regras que já eram 🟡 ou 🔴 na extração, ou
limitações de infraestrutura de prova. Ficam registrados para que a re-extração os veja.

| # | Item | Situação |
| ---: | :--- | :--- |
| 1 | **Colisão das famílias `BR-T`** | `domain.md#2.3` (`BR-T01`, `BR-T02`) e `code-analysis.md#6` do módulo templates mais `templates/requirements.md#2` usam os **mesmos identificadores** para regras disjuntas. É o **mesmo ID** com dois conteúdos — forma pior que a divergência de grafia de `BR-C`. Toda citação precisa qualificar o artefato. Resolver é re-extração, não feature |
| 2 | **A RLS de `templates/requirements.md#4` está errada** | O documento restringe `Update`/`Delete` a admin e a leitura a templates ativos. O schema diz: `create` exige admin, `update`/`delete` são criador **ou** admin, e `read` é `null`. RLS de servidor: não é provável no cliente |
| 3 | **Os defaults do schema não são observáveis no cliente** | `is_default: false` e `is_active: true` são aplicados pelo servidor, como o default `agendada` da consulta. Afirmá-los por leitura de arquivo daria aparência de cobertura a comportamento de servidor |
| 4 | **A administração de modelos segue sem prova** | CRUD, agrupamento por tipo, `is_default` sem exclusividade, `insertVariable` no fim do texto e o campo `variables` órfão (`BR-T08`). Fora do escopo por decisão `1a`; vira feature própria |
| 5 | **A guarda de encoding não distingue texto corrompido de texto que cita corrupção** | Ela varre bytes, não intenção. Nesta rodada, a primeira tentativa de documentar um incidente de codificação **reproduziu o incidente** e a guarda acusou o próprio registro. Nenhum artefato do projeto pode conter exemplo literal de mojibake |
| 6 | **`Get-Content`/`Set-Content` do PowerShell 5.1 corrompem arquivo sem BOM** | Eles decodificam pela página ANSI. Um round-trip de `actions.md` deixou 330 sequências corrompidas, que a guarda pegou. A regra de trabalho é usar a ferramenta de edição ou `[System.IO.File]` com `UTF8Encoding($false)` |
| 7 | **A prova ancora no componente, não nas telas** | O encanamento a partir de `PatientDetail.tsx` até o editor **não** está coberto. O caminho a partir de `Consultation.tsx` tem prova parcial na feature 004. Ler os vereditos do grupo 06 como cobertura de tela seria ler mais do que a prova afirma |
| 8 | **`PatientForm.test.tsx` opera perto do teto de 5 s por verificação** | Observado nas rodadas 004 e 005 sob carga paralela; a suíte fechou verde nas duas. Se voltar a oscilar, o caminho é ampliar `testTimeout` em `vitest.config.ts`, que **não** está em `allowedPaths` e depende de decisão do usuário |

## Histórico de re-extrações

> Preenchido pelo agente reverso quando `/reversa` rodar de novo. Vazio até então.

## Arquivadas

> Itens que deixarem de ser verdade e forem endereçados saem daqui, com a data e a razão.
> Vazio até então.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
