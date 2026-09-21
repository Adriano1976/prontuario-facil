# Investigação: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Requirements: `_reversa_forward/005-prova-templates/requirements.md`
> Roadmap: `_reversa_forward/005-prova-templates/roadmap.md`

## 1. O que foi investigado

O grupo `Templates (06)` da matriz de rastreabilidade transfere **4 cenários** de paridade
(`PT-006`) descritos em
`_reversa_sdd/migration/parity_tests/06-emissao-documento-template.feature`. A investigação
perseguiu três perguntas, nesta ordem:

1. **Onde cada uma das quatro promessas é observável** — porque uma prova escrita na
   superfície errada mede o arnês, não o sistema.
2. **O que a extração já sabia e onde ela parou** — para transformar 🔴 em veredito, e não
   repetir leitura já feita.
3. **O que o `jsdom` permite exercitar** — para não escrever uma verificação que fica verde
   por não chegar ao código.

## 2. Onde cada promessa vive

Todas as quatro promessas de `PT-006` habitam **um único componente**,
`src/components/medical/PrescriptionEditor.tsx` (408 linhas). Isso não é o que o nome do
grupo sugere: a matriz chama o grupo de "Templates", mas o componente é analisado pela
extração dentro do módulo **consultas** (`code-analysis.md#4.4` e `#4.6`).

| Cenário | Superfície observável | Linha vigente |
| :--- | :--- | :--- |
| `PT-006.1` Medicamentos só em receita | Renderização condicional da seção | `PrescriptionEditor.tsx:320` |
| `PT-006.1` (persistência) | Expressão booleana na montagem do payload | `PrescriptionEditor.tsx:185` |
| `PT-006.2` Modelo filtrado por tipo | Argumentos do pedido em `base44.entities.Template.filter` | `PrescriptionEditor.tsx:112-117` |
| `PT-006.3` Variáveis interpoladas | Quatro `replace` encadeados, no evento de escolha do modelo | `PrescriptionEditor.tsx:141-163` |
| `PT-006.4` Modelo inativo não oferecido | Mesmo pedido — `is_active: true` é parte do filtro | `PrescriptionEditor.tsx:115` |

Duas conclusões caem direto da tabela:

- **`PT-006.1` tem duas metades com forças diferentes.** A visibilidade é do cliente e é
  plenamente provável; a **persistência** é decidida por uma segunda expressão, independente
  da primeira. Ocultar a seção não limpa o estado — o portão é o `includes('receita')` na
  montagem. Provar só a tela deixaria a promessa de `BR-C-05` sem prova.
- **`PT-006.2` e `PT-006.4` são o mesmo pedido.** Não são dois cenários independentes: ambos
  se resolvem no objeto enviado ao transporte. A diferença entre eles é o predicado
  (`type` × `is_active`), e o predicado é aplicado **no servidor**.

## 3. Alternativas avaliadas

### 3.1 Onde provar o filtro de modelos

| Alternativa | Veredito |
| :--- | :--- |
| Afirmar sobre a lista renderizada, com um dublê que já devolve o resultado filtrado | **Descartada.** Prova o dublê. O cliente poderia estar pedindo qualquer coisa — inclusive nada — e a verificação continuaria verde |
| Afirmar sobre os **argumentos do pedido**, com o dublê no transporte | **Escolhida** (D-02). É a única coisa que o cliente de fato faz e a única que a prova pode afirmar honestamente |
| Provar o filtro de ponta a ponta contra o servidor | Descartada para esta suíte. Seria prova de integração, fora do escopo acordado (`3a`) |

### 3.2 Como congelar a data

| Alternativa | Veredito |
| :--- | :--- |
| `vi.useFakeTimers()` completo | **Descartada.** Já falhou na feature 003: temporizadores falsos conflitam com as esperas assíncronas de `userEvent` |
| `vi.useFakeTimers({ toFake: ['Date'] })` | **Escolhida** (D-04). Isola a dependência do relógio sem mexer nos temporizadores |
| Duplicar `toLocaleDateString` | Recuo registrado, caso a string se mostre instável entre ambientes |
| Afirmar só que o marcador `{DATA}` desapareceu | Descartada. Não afirma o valor, e o projeto firmou que a prova afirma valor (R-03 da 003) |

O `{DATA}` usa `new Date().toLocaleDateString('pt-BR')` e o `{DATA_EXTENSO}` usa o mesmo com
`{ day: 'numeric', month: 'long', year: 'numeric' }`. O Node traz `full-icu` por padrão desde
a versão 13, então as duas formas são estáveis.

### 3.3 Como provar que um tratamento **não** existe

É o problema central das lacunas de AMB-006: `{DIAS_AFASTAMENTO}` **não** é substituída, e a
marcação **não** é escapada.

| Alternativa | Veredito |
| :--- | :--- |
| Afirmar que `replace` não foi chamado com o padrão de `{DIAS_AFASTAMENTO}` | **Descartada.** Passa por vacuidade: se a substituição nunca rodasse, a verificação também ficaria verde |
| Afirmar **positivamente** que o marcador literal está no conteúdo e no payload | **Escolhida** (D-03). Exige que o caminho tenha rodado e que o texto tenha chegado ao destino |
| Ler o código e declarar | Descartada. Foi o que a extração fez, e a lacuna ficou em 🔴 por falta de medição |

### 3.4 Como exercitar a impressão sem abrir janela

`handlePrint` (`PrescriptionEditor.tsx:194-247`) monta um documento HTML por template
literal — interpolando `content` e os medicamentos **sem escape** — e o injeta com
`window.open('', '_blank')` + `document.write` + `print()`.

O `jsdom` **não implementa** `window.open`: registra `Not implemented: window.open` no
console virtual e devolve `null`. E o próprio código trata isso — `if (!printWindow) return;`.
Somado, o efeito é traiçoeiro: **no ambiente de teste o caminho de impressão é
inalcançável**, e uma verificação ingênua ("acionar Imprimir e conferir que não quebrou")
ficaria verde sem exercitar uma única linha.

| Alternativa | Veredito |
| :--- | :--- |
| Não provar; declarar a lacuna Alta | Era a decisão anterior, revertida por `4b`. Deixava uma lacuna Alta sem prova por escolha, não por impossibilidade |
| `vi.spyOn(window, 'open')` devolvendo um duplo com `document.write`/`close` e `print` espiados | **Escolhida** (D-05). Captura o HTML escrito e permite afirmar a ausência de escape |
| Substituir o objeto `window` inteiro | **Proibida.** Quebra o `history` do jsdom e produz falhas sem relação com a prova |
| Abrir janela real | Impossível em DOM simulado, e contra o RNF de isolamento |

### 3.5 Onde ancorar a prova

| Alternativa | Veredito |
| :--- | :--- |
| Nas duas telas que montam o editor (`Consultation.tsx`, `PatientDetail.tsx`) | **Descartada.** Duplicaria quatro verificações e mediria a fiação das telas, não as promessas do editor |
| No **componente**, em `src/components/medical/__tests__/` | **Escolhida** (D-01). A fronteira do arquivo de prova é a fronteira do componente; o diretório já existe e hospeda duas provas de componente |
| Em `src/pages/__tests__/`, junto das demais | Descartada. Moveria a prova para longe do arquivo que ela prova e sugeriria cobertura de tela que ela não tem |

O preço da escolha está declarado em `roadmap.md#4.1`: o encanamento a partir de
`PatientDetail.tsx` não fica coberto por esta feature.

## 4. Divergências entre a extração e o código

Registradas porque cada uma muda como a matriz deve ser lida.

1. **`BR-T` é o mesmo identificador para regras disjuntas.** `domain.md#2.3` usa `BR-T01` e
   `BR-T02` para *modelos filtrados por tipo* e *gate de medicamentos*; `code-analysis.md#6`
   (módulo templates) e `templates/requirements.md#2` usam os **mesmos IDs** para *campos
   obrigatórios* e *enum de 7 valores*. Não é divergência de grafia — é o mesmo endereço com
   dois conteúdos. Citar `BR-T01` sem o artefato é ambíguo por construção (D-12).
2. **A RLS de `templates/requirements.md#4` está errada em dois pontos.** O documento diz que
   `Create/Update/Delete` são restritos a admin e que a leitura alcança apenas templates
   **ativos**. O schema diz: `create` exige admin, mas `update` e `delete` são **criador ou**
   admin, e `read` é `null` — aberto a qualquer autenticado, sem filtro de atividade.
3. **A lacuna 🔴 de `code-analysis.md#5.3` fica confirmada.** A extração registrou "não
   confirmado no código analisado (PrescriptionEditor só substitui as outras 4)". Lido o
   código vigente, a suspeita é **fato**: `applyTemplate` substitui exatamente quatro
   variáveis e `{DIAS_AFASTAMENTO}` não está entre elas.
4. **A redação de `PT-006.3` é imprecisa.** O `.feature` diz que a substituição ocorre
   "quando salvo o documento". Ela ocorre na **seleção do modelo**, e o campo de conteúdo
   segue editável até o salvamento (`RN-02`).
5. **O rótulo do grupo não descreve o conteúdo.** A matriz chama o grupo de
   `Templates (06)`, mas o componente dos quatro cenários pertence ao módulo **consultas**
   segundo a própria extração. O rótulo fica como está — renomear quebraria o endereço de
   rastreabilidade — e a divergência entra declarada.
6. **As linhas citadas pela extração são do `.jsx`.** `code-analysis.md#4.4` cita
   `PrescriptionEditor.tsx:92-104`; o arquivo vigente tem a substituição em `141-163`. O
   deslocamento já está registrado no adendo `001-migracao-typescript`.
7. **`templates/requirements.md#3` omite o campo `variables`** ao listar os campos da
   entidade, embora o schema o declare. É o mesmo campo que `code-analysis.md#6` marca como
   órfão em `BR-T08`.
8. **Os dois enums são diferentes de propósito, e o código espelha isso.** `Template` tem 7
   tipos; `Prescription` tem 6, sem `anamnese`. O comentário de `src/types/Template.ts`
   registra a razão: `anamnese` é exclusivo de modelo e não gera documento. É uma paridade
   verificável, e a prova a afirma contra o conjunto do schema (RF-15).

## 5. O achado de AMB-006, em detalhe

O risco foi catalogado na extração como **AMB-006** e está citado no próprio código
(`src/components/medical/PrescriptionEditor.tsx:145`, e no cabeçalho de
`src/types/Template.ts`). São **três** lacunas de severidade Alta, e nenhuma foi corrigida
na migração — por decisão registrada.

| # | Lacuna | Onde a extração registra | O que a prova passa a afirmar |
| :--- | :--- | :--- | :--- |
| 1 | `{DIAS_AFASTAMENTO}` anunciada na UI e nunca substituída | `code-analysis.md#9` (templates) | O marcador literal chega ao payload (RF-09) |
| 2 | A substituição não escapa marcação | `code-analysis.md#4.5` e `#9` (consultas) | A marcação literal chega ao payload (RF-11) |
| 3 | `handlePrint` injeta o conteúdo sem escape em `document.write` | `code-analysis.md#9` (consultas) | A marcação literal está no HTML escrito na janela de impressão (RF-18) |

A decisão `2a` da sessão de esclarecimentos é **provar e declarar, sem corrigir**. A
consequência precisa ficar explícita, e está em D-08: ao afirmar o defeito, a suíte passa a
**travar a paridade**. No dia em que alguém corrigir AMB-006, estas verificações falham. Isso
é desejável — a mudança de comportamento não passa despercebida — e é perigoso como
registro, porque a prova passa a enunciar uma vulnerabilidade conhecida. Quem corrigir
precisa alterar a verificação na mesma passada, de propósito.

A lacuna nº 3 tem um agravante que vale nomear: o conteúdo impresso é a **única** das três
que sai do sistema. As duas primeiras ficam no banco; a terceira vai para uma janela que o
médico imprime e entrega ao paciente.

## 6. Padrões aplicáveis

| Padrão | Aplicação nesta feature |
| :--- | :--- |
| Provar no transporte, não no módulo | O dublê fica em `base44.entities.Template.filter`; a asserção é sobre os argumentos (D-02). Mesma técnica da prova de auditoria da feature 004 |
| Asserção positiva para provar ausência | Afirmar que o marcador literal **está lá**, nunca que o tratamento não foi chamado (D-03) |
| Uma verificação por promessa, nome citando o requisito | Padrão das features 002 a 004; mantém a falha legível e a matriz conferível |
| A prova observa, não altera | Nenhum arquivo de aplicação é tocado; a feature acrescenta prova e matriz |
| Veredito verde exige ressalva visível | `PT-006.2` e `PT-006.4` são 🟢 **com ressalva declarada**, e o `RF-06` é o que a torna visível (D-06) |
| Massa de prova com construtor local de data | Herdado de 003 e 004: `new Date(ano, mês, dia)`, jamais string de data, por causa da interpretação em UTC |

## 7. Fontes externas

- [`jsdom` não implementa `window.open` — `Not implemented: window.open`](https://stackoverflow.com/questions/75848844/error-not-implemented-window-open-in-jest-unit-test) — sustenta o R-02 e a decisão D-05.
- [Substituir o objeto `window` inteiro quebra o `history`](https://stackoverflow.com/questions/78487996/mocking-the-window-object-causes-error-cannot-read-properties-of-null-reading) — sustenta a proibição de substituir `window` inteiro.
- [Node.js — suporte a internacionalização (`full-icu` por padrão)](https://nodejs.org/api/intl.html) — sustenta o R-03 e a decisão D-04.
- [MDN — `Date.prototype.toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString) — formato de `{DATA}` e `{DATA_EXTENSO}`.
- [MDN — `Window.open`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) — contrato que o duplo substitui.
- [MDN — `Document.write`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write) — o ponto exato onde o conteúdo não escapado é injetado.
- [Vitest — `vi.useFakeTimers`](https://vitest.dev/api/vi.html#vi-usefaketimers) — a opção `toFake: ['Date']` usada em D-04.

## 8. O que **não** foi investigado

- **A administração de modelos** (`Templates.tsx`): CRUD, agrupamento por tipo, `is_default`
  sem exclusividade, `insertVariable` no fim do texto e o campo `variables` órfão. Fora do
  escopo por decisão `1a`; vira feature própria.
- **O comportamento real do filtro no servidor.** O predicado é aplicado fora do cliente; a
  prova cobre o pedido e declara o limite (D-06).
- **O encanamento a partir de `PatientDetail.tsx`** até o editor. A prova ancora no
  componente (D-01, `roadmap.md#4.1`).
- **A renderização da janela de impressão em um navegador real** — o duplo captura o HTML
  escrito, não o resultado visual.
- **Os defaults do schema** (`is_default: false`, `is_active: true`) aplicados pelo servidor.
  Não são observáveis no cliente; a prova do formulário afirmaria a coisa errada com
  aparência de cobertura.
- **Se uma correção de AMB-006 é desejável.** A decisão `2a` foi provar e declarar; julgar o
  conserto é decisão de produto, não de prova.

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
