# Requirements: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Provar os 4 cenários de `PT-006` — a emissão de documento a partir de modelo — no
`PrescriptionEditor`, o componente por onde passa **todo** documento clínico emitido no
sistema, tanto pelo módulo de Consultas quanto pelo de Pacientes. A feature fecha a lacuna
🔴 que a extração deixou aberta em `code-analysis.md#5.3` (a variável `{DIAS_AFASTAMENTO}`
é substituída?) e declara o limite estrutural de dois dos quatro cenários, que são
predicados **do servidor**: neles o cliente só pode provar o pedido. Não altera código de
aplicação, schema nem contrato. A **administração** de modelos (`Templates.tsx`) fica fora do
escopo por decisão de 2026-09-21 e vira feature própria.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/migration/parity_tests/06-emissao-documento-template.feature` | Os 4 cenários de `PT-006`: medicamentos só em receita; modelo filtrado por tipo; variáveis interpoladas; modelo inativo não oferecido | 🟢 |
| `_reversa_sdd/architecture.md#1` | Fluxo 3 — "Documentação: durante a `Consultation`, Médico usa `Templates` → cria `Prescription` / `Exam`" | 🟢 |
| `_reversa_sdd/domain.md#2.3` | `BR-T01` (modelos filtrados por `type`) e `BR-T02` (`medications` visível se o tipo incluir "receita") — **atenção à colisão de IDs, ver `RN-08`** | 🟢 |
| `_reversa_sdd/code-analysis.md#4.4` (módulo consultas) | Substituição de variáveis: exatamente 4 (`{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}`, `{DATA_EXTENSO}`), sem escape | 🟢 |
| `_reversa_sdd/code-analysis.md#4.6` (módulo consultas) | Montagem do payload: `medications` barrado por `type.includes('receita')`; `valid_days` só para `atestado` | 🟢 |
| `_reversa_sdd/code-analysis.md#6` (módulo consultas) | `BR-C-05` (medications só para receita), `BR-C-06` (`valid_days` só em atestado), `BR-C-08` (modelos filtrados por `is_active: true`) | 🟢 |
| `_reversa_sdd/code-analysis.md#5.3` (módulo templates) | As 5 variáveis anunciadas na UI de administração; a nota registra como 🔴 **LACUNA** se `{DIAS_AFASTAMENTO}` é substituída — "não confirmado no código analisado" | 🔴 → 🟢 nesta feature |
| `_reversa_sdd/code-analysis.md#6` (módulo templates) | `BR-T01` a `BR-T08`, incluindo `BR-T07` (`is_active=false` esconde do editor) e `BR-T08` (`variables` órfão) — **IDs colidem com `domain.md#2.3`, ver `RN-08`** | 🟢 |
| `_reversa_sdd/code-analysis.md#9` (módulo templates) | Lacunas: `{DIAS_AFASTAMENTO}` sem substituidor (**Alta**), `variables` órfão (Média), `is_default` sem exclusividade (Média) | 🟢 |
| `_reversa_sdd/code-analysis.md#4.5` e `#9` (módulo consultas) | `applyTemplate` sem escape HTML (**Alta**) e `handlePrint` injetando conteúdo em `window.open` (**Alta**) — AMB-006 preservado | 🟢 |
| `_reversa_sdd/templates/requirements.md#2` | `BR-T01` a `BR-T04` do módulo de modelos — terceira família de numeração para a mesma superfície | 🟢 |
| `_reversa_sdd/templates/requirements.md#4` | Permissões: declara "Create/Update/Delete restrito a admin" e "Read de **templates ativos**" | 🟡 **impreciso** — ver `RN-03` |
| `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | Grupo `Templates (06)`: 4 cenários, "Feature a criar — conversão dos cenários de fluxo de documentos e modelos" | 🟢 |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | Modelos permanecem entidade de **leitura livre** para autenticados (a RLS do servidor segue sendo a única autorização); as leituras de outras entidades passaram a declarar escopo | 🟢 |
| `base44/entities/Template.jsonc` | Enum de **7** tipos; `required`: `name`, `type`, `content`; `is_default` default `false`; `is_active` default `true`; `create`: admin; `read`: `null`; `update`/`delete`: criador **ou** admin | 🟢 |
| `base44/entities/Prescription.jsonc` | Enum de **6** tipos (sem `anamnese`); `required`: `patient_id`, `type`, `content`; `template_name`, `valid_days`, `medications[]` | 🟢 |
| `_reversa_sdd/database/business-rules.md#2` | Modelos são dados mestres / configuração global da clínica | 🟢 |

> **Nota de leitura.** As citações de `code-analysis.md` carregam números de linha do
> código **anterior à migração** (`.jsx`). A extração analisou o `.jsx`; o código vigente é
> `.tsx`, com deslocamento de linhas já registrado no adendo `001-migracao-typescript`. As
> linhas citadas nesta feature são sempre as do arquivo vigente.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico | Emitir receita, atestado ou solicitação já preenchidos, sem redigitar texto padrão | Abre "Novo Documento" na consulta, escolhe o tipo, escolhe um modelo da clínica e o conteúdo aparece pronto para revisão |
| Médico | Emitir documento coerente com o tipo escolhido | Troca o tipo de documento e espera que a lista de modelos acompanhe o tipo |
| Administrador da clínica | Manter o acervo de modelos | Cadastra/edita modelos e desativa os que não devem mais ser oferecidos — **fora do escopo desta feature** (decisão `Q1` · `1a`); a administração vira feature própria, com seus próprios cenários |
| Responsável pela qualidade | Saber o que o sistema garante e o que ele apenas pede | Consulta a matriz e encontra, por cenário, se a prova cobre a tela, o payload ou só a requisição |

## 4. Regras de negócio novas ou alteradas

Nenhuma regra de produto nova. As regras abaixo são **contratos de prova** e correções de
leitura — a feature não altera o comportamento do sistema.

1. **RN-01:** A prova afirma o **valor persistido ou exibido**, nunca a forma da chamada.
   - Origem no legado: disciplina firmada nas features `002`, `003` e `004` (`D-12` da 004)
   - Tipo: nova (contrato de prova)
2. **RN-02:** A substituição de variáveis de modelo acontece na **seleção do modelo**, não
   no salvamento. `PT-006.3` diz "quando salvo o documento ... o conteúdo persistido tem as
   variáveis substituídas" — a redação é **imprecisa**: o salvamento persiste o campo de
   conteúdo como ele estiver, e o médico pode editá-lo depois de aplicar o modelo.
   - Origem no legado: `code-analysis.md#4.4` (módulo consultas)
   - Tipo: alterada (correção de redação do cenário de paridade)
3. **RN-03:** O filtro de modelos por `type` e por `is_active` é **predicado do servidor**.
   O cliente envia `{ type, is_active: true }` e consome o resultado, sem re-filtrar. A prova
   cobre o **pedido** e declara explicitamente que a garantia do filtro é do servidor. Na
   mesma linha, `templates/requirements.md#4` é **impreciso** ao declarar leitura restrita a
   templates ativos e `update`/`delete` restritos a admin: o schema diz `read: null` e
   `update`/`delete` como criador **ou** admin.
   - Origem no legado: `base44/entities/Template.jsonc`; `BR-C-08`; `BR-T07`
   - Tipo: alterada (correção de leitura documental)
4. **RN-04:** `{DIAS_AFASTAMENTO}` é anunciada na UI de administração e **nunca é
   substituída** em nenhum caminho de emissão. O marcador literal atravessa o salvamento e
   chega ao conteúdo persistido.
   - Origem no legado: `code-analysis.md#5.3` e `#9` (módulo templates), severidade Alta
   - Tipo: nova (a lacuna 🔴 da extração passa a ter veredito)
5. **RN-05:** Paciente sem `cpf` faz a variável `{PACIENTE_CPF}` ser substituída por string
   vazia, **em silêncio** — sem erro, sem marcação, sem aviso ao médico.
   - Origem no legado: `code-analysis.md#4.4` (módulo consultas)
   - Tipo: nova
6. **RN-06:** AMB-006 mantido: a substituição **não escapa marcação**, e a impressão injeta o
   conteúdo já substituído em um documento HTML via `window.open` + `document.write`. É
   preservação deliberada do legado, não descuido — o próprio código registra a decisão. As
   duas metades passam a ter evidência: a marcação literal no payload (`RF-11`) e a marcação
   literal no HTML impresso (`RF-18`, decisão `4b`).
   - Origem no legado: `code-analysis.md#4.5` e `#9` (módulo consultas); AMB-006
   - Tipo: alterada (confirmada como preservada, com veredito de prova)
7. **RN-07:** `medications` é barrado na **montagem do payload**, não na tela. Ocultar a
   seção não limpa o estado: o portão é `type.includes('receita')` no momento de salvar.
   Trocar de receita para atestado com medicamentos preenchidos persiste `medications: []`,
   e os medicamentos digitados não vão a lugar nenhum.
   - Origem no legado: `code-analysis.md#4.6`; `BR-C-05`; `domain.md#2.3` `BR-T02`
   - Tipo: nova (a assimetria tela × payload nunca foi afirmada)
8. **RN-08:** Toda citação de regra do tipo `BR-T` exige **artefato qualificado**.
   `domain.md#2.3` usa `BR-T01`/`BR-T02` para *filtro por tipo* e *gate de medicamentos*,
   enquanto `code-analysis.md#6` e `templates/requirements.md#2` usam os **mesmos IDs** para
   *campos obrigatórios* e *enum de 7 valores*. Não é divergência de grafia como as duas
   formas de `BR-C`: é o **mesmo ID com significados disjuntos** em artefatos diferentes.
   Citar `BR-T01` sem o artefato é ambíguo por construção.
   - Origem no legado: `domain.md#2.3` × `code-analysis.md#6` (templates) × `templates/requirements.md#2`
   - Tipo: nova (defeito documental da extração, agora com instância confirmada)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Provar `PT-006.1`: a seção de Medicamentos aparece **exatamente** nos tipos que contêm "receita" e em nenhum outro | Must | Para os 6 tipos de documento, a presença da seção coincide com `type.includes('receita')` — `receita_simples` e `receita_controlada` presentes; `atestado`, `solicitacao_exame`, `encaminhamento` e `declaracao` ausentes | 🟢 |
| RF-02 | Provar que a seção de Medicamentos oferece os **cinco** campos do cenário | Must | Com o tipo em receita, existem os campos Nome, Dosagem, Frequência e Duração (entradas de texto) e Instruções — cinco no total | 🟢 |
| RF-03 | Provar o portão de `medications` **no payload**, independente da visibilidade (`RN-07`) | Must | Com um medicamento preenchido em receita, trocar para `atestado` e salvar grava `medications: []`, afirmado no objeto entregue ao salvamento | 🟢 |
| RF-04 | Provar `PT-006.2`: a lista de modelos acompanha o tipo do documento | Must | A consulta de modelos é emitida com `type` igual ao tipo corrente e é reemitida com o novo valor quando o tipo muda | 🟢 |
| RF-05 | Provar `PT-006.4` na mesma consulta de RF-04 | Must | A consulta de modelos carrega `is_active: true` em todos os tipos | 🟢 |
| RF-06 | Provar e **declarar** que o cliente não re-filtra o resultado (`RN-03`) | Must | Um resultado contendo modelo de outro tipo e modelo inativo é exibido pelo seletor sem defesa adicional — a garantia é integralmente do servidor | 🟢 |
| RF-07 | Provar `PT-006.3` na substituição, com a redação corrigida (`RN-02`) | Must | Aplicar um modelo substitui `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}` e `{DATA_EXTENSO}` pelos valores do paciente e do dia congelado, no campo de conteúdo | 🟢 |
| RF-08 | Provar que o texto é editável após a aplicação e que o salvamento persiste a edição, não o texto do modelo | Must | Editar o conteúdo depois de aplicar o modelo e salvar persiste o texto editado, provando que a substituição não ocorre no salvamento | 🟢 |
| RF-09 | Provar `RN-04`: `{DIAS_AFASTAMENTO}` não é substituída | Must | Um modelo contendo `{DIAS_AFASTAMENTO}` chega ao conteúdo e ao payload com o marcador literal intacto, em documento do tipo atestado | 🟢 |
| RF-10 | Provar `RN-05`: ausência de CPF substitui por vazio, sem erro | Should | Paciente sem `cpf` aplica o modelo com a variável resolvida para string vazia e a tela não quebra | 🟢 |
| RF-11 | Provar `RN-06`: marcação não é escapada | Must | Conteúdo de modelo contendo marcação (`<b>`, `<script>`) permanece literal no conteúdo e no payload — AMB-006 preservado, declarado como risco | 🟢 |
| RF-12 | Provar a procedência do modelo gravado | Must | `template_name` recebe o **nome** do modelo selecionado, e `null` quando nenhum modelo foi aplicado | 🟢 |
| RF-13 | Provar a perda de procedência ao trocar o tipo após aplicar um modelo | Should | Aplicar modelo de receita e trocar para atestado mantém o conteúdo antigo no campo e grava `template_name: null` — conteúdo obsoleto com procedência perdida | 🟢 |
| RF-14 | Provar que a edição de um documento não recupera o modelo de origem | Should | Abrir o editor com dados iniciais deixa o seletor de modelo vazio, pois não há campo de modelo nos dados iniciais — `template_name` não sobrevive a uma reedição | 🟢 |
| RF-15 | Provar que o enum de documentos do editor é **exatamente** o enum de `Prescription` | Must | O seletor oferece os 6 tipos do schema, sem `anamnese`; a comparação é feita contra o conjunto do schema | 🟢 |
| RF-16 | Registrar na matriz o veredito dos 4 cenários de `PT-006`, o saldo dos módulos restantes e a colisão de `BR-T` | Must | `code-spec-matrix.md` recebe a seção de paridade do grupo `06`, com o saldo atualizado e `RN-08` citada | 🟢 |
| RF-17 | Revalidar os comandos de gate e a integridade da árvore | Must | `npm test`, `npm run typecheck`, `npm run lint` e `npm run prova:negativos` passam; nenhum arquivo de aplicação é tocado | 🟢 |
| RF-18 | Provar a **injeção de conteúdo na impressão**, com duplo de `window.open` (`RN-06`; decisão `Q4` · `4b`) | Must | Com `window.open` substituído por um duplo que captura o HTML escrito, o documento impresso contém a marcação do modelo **sem escape** — a terceira lacuna Alta deixa de ser só declarada e passa a ter evidência | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A suíte completa não deve ultrapassar o teto de 90 segundos | Teto firmado nas features `002` a `004`; a rodada 004 fechou em 63,7 s | 🟢 |
| Determinismo | A prova de `{DATA}` e `{DATA_EXTENSO}` congela **apenas o `Date`**, como na feature `004`, e afirma a string exata em pt-BR (decisão `Q5` · `5a`) | `toLocaleDateString('pt-BR')` depende do relógio e do ICU do ambiente; o congelamento remove a dependência do relógio, e o Node 18+ traz ICU completo. Se a string se mostrar instável, a alternativa registrada é duplicar `toLocaleDateString` | 🟢 |
| Isolamento | A prova não pode gravar em armazém real nem abrir **janela de impressão real** | `handlePrint` chama `window.open` + `print()`; por decisão `Q4` · `4b` a prova substitui `window.open` por um duplo que captura o HTML escrito — a janela real nunca é aberta e o `print()` real nunca é chamado | 🟢 |
| Manutenibilidade | Massa de prova compartilhada para paciente, modelo e tipos | Padrão firmado na feature `004` (`consultationsFixtures.ts`); evita divergência de critério entre arquivos | 🟡 |
| Rastreabilidade | Toda citação de `BR-T` qualifica o artefato de origem (`RN-08`) | Colisão confirmada entre `domain.md#2.3` e `code-analysis.md#6` | 🟢 |
| Observabilidade | O limite servidor-cliente de `PT-006.2` e `PT-006.4` fica declarado na matriz, não escondido num verde | Sem a declaração, o veredito 🟢 sugeriria cobertura que a prova não tem | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Medicamentos aparecem somente em documentos de receita
  Dado o editor de documento aberto em uma consulta
  Quando o tipo do documento é "Receita Simples"
  Então a seção de Medicamentos é exibida com os cinco campos do cenário
  Quando o tipo do documento passa a "Atestado Médico"
  Então a seção de Medicamentos não é exibida

Cenário: Medicamentos digitados não sobrevivem à troca para um tipo que não é receita
  Dado o editor com tipo "Receita Controlada" e um medicamento preenchido
  Quando o tipo passa a "Solicitação de Exame" e o documento é salvo
  Então o documento entregue ao salvamento tem a lista de medicamentos vazia

Cenário: O modelo é pedido ao servidor com o tipo do documento e apenas ativos
  Dado o editor de documento aberto
  Quando o tipo do documento é "Receita Simples"
  Então a consulta de modelos é emitida com o tipo "receita_simples" e com o filtro de ativos
  Quando o tipo do documento passa a "Atestado Médico"
  Então uma nova consulta de modelos é emitida com o tipo "atestado"

Cenário: O cliente exibe o que o servidor devolver, sem re-filtrar
  Dado que o servidor devolve um modelo de atestado e um modelo inativo
  Quando o seletor de modelos é aberto em um documento de receita
  Então os dois modelos são oferecidos
  E o limite é declarado: o filtro por tipo e por atividade é garantia do servidor, não da tela

Cenário: Variáveis do modelo são substituídas na aplicação do modelo
  Dado um paciente com nome e CPF e um modelo contendo as quatro variáveis substituíveis
  Quando o modelo é escolhido no editor
  Então o campo de conteúdo recebe o texto do modelo com as quatro variáveis resolvidas

Cenário: O conteúdo editado depois do modelo é o que se persiste
  Dado um modelo já aplicado ao conteúdo
  Quando o médico edita o texto e salva o documento
  Então o documento entregue ao salvamento contém o texto editado, e não o texto do modelo

Cenário: A variável de dias de afastamento nunca é substituída
  Dado um modelo contendo {DIAS_AFASTAMENTO} e um documento do tipo "Atestado Médico"
  Quando o modelo é aplicado e o documento é salvo
  Então o marcador {DIAS_AFASTAMENTO} permanece literal no conteúdo persistido

Cenário: Marcação no modelo não é escapada
  Dado um modelo cujo conteúdo contém marcação HTML
  Quando o modelo é aplicado e o documento é salvo
  Então a marcação permanece literal no conteúdo persistido
  E o risco AMB-006 fica declarado como preservação deliberada do legado

Cenário: Trocar o tipo depois de aplicar um modelo deixa conteúdo obsoleto
  Dado um modelo de receita já aplicado ao conteúdo
  Quando o tipo do documento passa a "Atestado Médico" e o documento é salvo
  Então o conteúdo persistido continua sendo o texto do modelo de receita
  E a procedência gravada é nula

Cenário: O editor de documento oferece exatamente os seis tipos do schema
  Dado o editor de documento aberto
  Quando o seletor de tipo é inspecionado
  Então ele oferece os seis tipos de Prescription, sem "anamnese"
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | São o corpo de `PT-006.1`; sem eles o cenário não tem veredito |
| RF-03 | Must | Prova o portão real de `BR-C-05`; a tela sozinha não afirma nada sobre o que é persistido |
| RF-04, RF-05 | Must | São `PT-006.2` e `PT-006.4` |
| RF-06 | Must | Sem ele, `PT-006.2` e `PT-006.4` ficariam com veredito 🟢 enganoso |
| RF-07, RF-08 | Must | São `PT-006.3`, com a redação corrigida por `RN-02` |
| RF-09 | Must | Dá veredito à lacuna Alta que a extração deixou em 🔴 |
| RF-11 | Must | AMB-006 é a lacuna de segurança do módulo; provar que segue preservada é requisito de paridade |
| RF-12, RF-15, RF-16, RF-17 | Must | Procedência, contrato de enum, convergência na matriz e gate |
| RF-10, RF-13, RF-14 | Should | Achados laterais reais, mas não prometidos por `PT-006`; enriquecem a matriz sem inflar o escopo |
| RNF de desempenho | Should | Teto já firmado; a feature acrescenta poucos arquivos |
| RF-18 | Must | Decisão `Q4` · `4b`: a terceira lacuna Alta ganha evidência em vez de ficar apenas declarada |
| Administração de modelos (`Templates.tsx`) | **Won't** | Decisão `Q1` · `1a`: fora do escopo desta feature. CRUD, agrupamento por tipo, `is_default` sem exclusividade, `insertVariable` e o campo `variables` órfão vão para feature própria |

## 9. Esclarecimentos

### Sessão 2026-09-21

Cinco perguntas apresentadas, cinco respondidas. As três primeiras vinham dos `[DÚVIDA]`
declarados; as duas últimas saíram do cruzamento com a taxonomia do `/reversa-clarify` —
lacunas de cobertura que os marcadores não registravam.

- **Q:** Até onde vai o escopo desta feature — só os 4 cenários de `PT-006` (emissão), ou também a administração de modelos em `Templates.tsx`?
  **R:** `1a` — só os 4 cenários de `PT-006`. A administração fica **fora do escopo** e vira feature própria. Nenhum dos quatro cenários toca `Templates.tsx`; misturar as duas superfícies faria a feature crescer além do grupo `06` e perder o endereço de rastreabilidade na matriz.
- **Q:** AMB-006 — provar as três lacunas Alta e declarar, corrigir as três, corrigir só `{DIAS_AFASTAMENTO}`, ou apenas declarar sem provar?
  **R:** `2a` — provar as três e **declarar** o defeito, sem corrigir. Paridade preservada, no mesmo critério que a feature `004` aplicou à assimetria de auditoria; corrigir mudaria comportamento observável e sairia da paridade.
- **Q:** O filtro por tipo e por atividade é predicado do servidor. Provar só o pedido basta?
  **R:** `3a` — provar o **pedido** e declarar que o cliente não re-filtra. Veredito 🟢 **com ressalva declarada**. Não entra segunda linha de defesa no cliente: seria regra nova, não prova.
- **Q:** A impressão (`handlePrint`, terceira lacuna Alta) entra na prova?
  **R:** `4b` — entra, com duplo de `window.open` que captura o HTML escrito, afirmando que a marcação do modelo chega **sem escape**. O defeito fica declarado. **Emenda o RNF de isolamento**, que passa a admitir o duplo e continua proibindo janela real.
- **Q:** Como congelar `{DATA}` e `{DATA_EXTENSO}`?
  **R:** `5a` — congelar apenas o `Date`, como na feature `004`, afirmando a string exata em pt-BR. Se a string se mostrar instável, a alternativa registrada é duplicar `toLocaleDateString`.

**Consequências no documento:** `RF-18` foi acrescentado (prova da injeção na impressão); o RNF
de isolamento foi emendado; o RNF de determinismo registra a decisão; a administração de modelos
passou a **Won't** no MoSCoW; e a seção `## 10` ficou sem lacunas em aberto.

## 10. Lacunas

n/a — **nenhuma lacuna em aberto.** As três dúvidas declaradas foram resolvidas na sessão de
2026-09-21 (ver `## 9`), e a administração de modelos saiu do escopo por decisão `1a`,
registrada como **Won't** em `## 8`.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-21 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-21 | Sessão de esclarecimentos (5 perguntas): escopo fechado na emissão; AMB-006 provado e declarado; filtro do servidor com ressalva; impressão provada por duplo; `Date` congelado. `RF-18` acrescentado e RNF de isolamento emendado | `/reversa-clarify` |
