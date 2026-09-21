# Roadmap: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Requirements: `_reversa_forward/005-prova-templates/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar a emissão de documento **no componente que a implementa** — `PrescriptionEditor` —
e não nas duas telas que o montam. Os quatro cenários de `PT-006` vivem todos ali: a seção
de medicamentos é renderização condicional por tipo; o filtro de modelos é uma consulta ao
transporte; a substituição de variáveis acontece na escolha do modelo; e o portão do
payload é uma expressão booleana no momento de salvar. Cada promessa é afirmada **no lugar
onde ela é observável**: a visibilidade na tela, o filtro nos argumentos do pedido, a
substituição no campo de conteúdo, o portão no objeto entregue ao salvamento. As três
lacunas de severidade Alta do módulo — `{DIAS_AFASTAMENTO}` sem substituidor, ausência de
escape na substituição e injeção na impressão — deixam de ser declaração e passam a ter
evidência, **sem serem corrigidas**, para preservar a paridade. Nenhum arquivo de aplicação
é tocado: a feature acrescenta um arquivo de prova, uma massa compartilhada e a seção do
grupo `06` na matriz.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi
registrado, e portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de
princípio vêm do legado e são respeitados:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A prova substitui o transporte por dublê e nunca escreve em `base44/entities/` | respeita |
| Paridade de comportamento observável (`_reversa_sdd/addenda/001-migracao-typescript.md#Vigência`) | Nenhum arquivo de aplicação é alterado; AMB-006 é provado e preservado | respeita |
| Congelamento deliberado: a ausência de escape de marcação é paridade registrada (`AMB-006`, citado em `src/components/medical/PrescriptionEditor.tsx:145`) | A prova **afirma o defeito** em vez de tratá-lo como bug — e por isso o trava (D-08) | respeita |
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | As três lacunas Alta entram como veredito com evidência, sem conserto | respeita |
| A prova segue o comportamento do código e declara o cenário impreciso (`_reversa_sdd/addenda/003-prova-agendamentos.md#Vigência`) | Aplicado ao `PT-006.3`, cuja redação diz que a substituição ocorre no salvamento (`RN-02`) | respeita |
| Veredito verde exige ressalva visível (`_reversa_sdd/addenda/004-prova-consultas.md#Vigência`) | Aplicado ao `PT-006.2` e ao `PT-006.4`, que dependem de predicado do servidor (D-06) | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este
> plano não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A prova vive em **um arquivo novo** (`src/components/medical/__tests__/PrescriptionEditor.test.tsx`) mais **uma massa compartilhada** (`src/test/templateFixtures.ts`) | Os quatro cenários de `PT-006` habitam **um único componente**: `PrescriptionEditor.tsx`. A fronteira do arquivo de prova é a fronteira do componente, e não a da tela que o monta. O diretório `src/components/medical/__tests__/` já existe e hospeda duas provas de componente | a) um arquivo por tela que monta o editor (`Consultation.tsx`, `PatientDetail.tsx`) — duplicaria a mesma prova duas vezes e mediria a fiação, não a promessa; b) separar a prova de transporte em um segundo arquivo — dois arranjos de dublê para o mesmo componente, sem ganho de legibilidade | 🟢 |
| D-02 | A consulta de modelos é provada **no transporte**: o dublê fica em `base44.entities.Template.filter`, e a asserção é sobre os **argumentos do pedido** | É a única superfície onde o filtro é observável no cliente — o predicado é aplicado pelo servidor. Dublar a consulta em vez do transporte mediria o dublê, e não a única coisa que o cliente de fato faz: pedir certo | a) afirmar sobre a lista renderizada com um dublê que já devolve o resultado filtrado — prova o dublê e esconde o pedido; b) ler o código e declarar — leitura não é prova | 🟢 |
| D-03 | As lacunas de AMB-006 são provadas por **asserção positiva sobre o defeito**: afirma-se que o marcador literal e a marcação HTML **permanecem** no conteúdo e no payload | Provar que um tratamento **não** existe exige asserção positiva (mesma lição de R-03 da feature 003). Afirmar "`replace` não foi chamado" passaria mesmo se a substituição nunca tivesse rodado | a) afirmar ausência de chamadas — passa por vacuidade; b) ler o código e declarar sem prova — foi o que a extração fez, e a lacuna ficou em 🔴 | 🟢 |
| D-04 | O relógio é congelado **apenas no `Date`**, com temporizadores reais (`vi.useFakeTimers({ toFake: ['Date'] })`), e a string em pt-BR é afirmada por extenso | Decisão `5a` da sessão de esclarecimentos. Congelar só o `Date` mantém as esperas assíncronas de interface funcionando — o conflito da feature 003 foi com temporizadores falsos, não com a data. O ambiente traz ICU completo, então `21/09/2026` e `21 de setembro de 2026` são estáveis | a) congelar tudo com `vi.useFakeTimers()` — conflita com `userEvent` e foi descartado na 003; b) duplicar `toLocaleDateString` — mais robusto e menos fiel; fica registrado como recuo se a string se mostrar instável | 🟡 |
| D-05 | A injeção na impressão é provada com **duplo de `window.open`** que captura o HTML escrito; a janela real nunca é aberta | Decisão `4b` da sessão. É a mesma técnica com que a feature 004 provou a assimetria de auditoria — medir no transporte em vez de confiar na leitura. **Sem o duplo o caminho é inalcançável**: o `jsdom` não implementa `window.open`, registra `Not implemented` e devolve `null`, e o próprio código sai pela guarda `if (!printWindow) return`. Uma verificação ingênua — "acionar Imprimir e não quebrar" — ficaria verde sem exercitar uma linha da impressão | a) deixar `handlePrint` fora da prova — era a decisão anterior e deixava uma lacuna Alta sem prova por escolha, não por impossibilidade; b) abrir janela real — impossível em DOM simulado e fora do RNF de isolamento | 🟢 |
| D-06 | O filtro por tipo e por atividade recebe veredito 🟢 **com ressalva declarada**, e **nenhuma** segunda linha de defesa é acrescentada no cliente | Decisão `3a` da sessão. O `RF-06` — que prova o cliente exibindo um modelo de tipo errado e um inativo — é o que torna a ressalva **visível**: sem ele, o verde de `PT-006.2` e `PT-006.4` sugeriria cobertura que a prova não tem. Acrescentar re-filtro seria regra nova, não prova | a) re-filtrar no cliente — muda comportamento observável e sai da paridade; b) declarar 🔴 os dois cenários — desmereceria a metade que **é** provável (o pedido); c) omitir a ressalva — a matriz mentiria por omissão | 🟢 |
| D-07 | A administração de modelos (`Templates.tsx`) fica **fora do escopo**, e nenhum byte dela é tocado | Decisão `1a` da sessão. Nenhum dos quatro cenários de `PT-006` toca a página: o CRUD, o agrupamento por tipo, o `is_default` sem exclusividade, o `insertVariable` e o campo `variables` órfão vão para feature própria. Misturar as duas superfícies faria a feature crescer além do grupo `06` e perder o endereço de rastreabilidade na matriz | a) incorporar a administração agora — escopo maior que o grupo transferido, contra a decisão registrada; b) provar a administração "de passagem" — prova sem promessa, e o projeto já tem oito verificações nessa condição | 🟢 |
| D-08 | A prova **trava a paridade** de AMB-006: corrigir o defeito passa a exigir alterar a prova **de propósito** | Consequência declarada de D-03. Ao afirmar o defeito, a suíte passa a falhar no dia em que alguém corrigir a substituição ou a impressão. Isso é desejável como trava de paridade e **perigoso** como registro: a prova enuncia uma vulnerabilidade conhecida. Quem decidir corrigir AMB-006 precisa mudar a verificação na mesma passada, e a decisão fica visível no diff | a) provar de forma frouxa (só que o conteúdo não veio vazio) — não travaria nada e não provaria nada; b) não provar — deixaria as três lacunas Alta sem evidência | 🟢 |
| D-09 | `RF-13` e `RF-14` — conteúdo obsoleto com procedência perdida, e modelo de origem não recuperado na reedição — entram como **Should**, provados | São achados reais que ninguém tinha registrado, e a prova é barata. `RF-13` afirma que trocar o tipo depois de aplicar um modelo mantém o texto antigo e grava `template_name: null`; `RF-14`, que o editor aberto com dados iniciais deixa o seletor vazio | a) deixá-los fora — a matriz perderia dois comportamentos observáveis; b) promovê-los a Must — inflaria o escopo além dos quatro cenários acordados | 🟢 |
| D-10 | O diretório `interfaces/` **não é criado** | A feature exercita o transporte de modelos por dublê, mas não redefine contrato externo nenhum: a assinatura de `base44.entities.Template.filter`, o formato de resposta e o tratamento de erro permanecem os do legado | a) documentar o contrato de leitura de modelos — seria inventário de contrato inalterado, não delta | 🟢 |
| D-11 | O teto de **90 segundos** é revalidado ao final, e não renegociado | Decisão mantida desde 2026-09-19. A suíte está em 63,7 s com 17 arquivos, e esta feature acrescenta um arquivo — há folga, mas ela será **medida**, não presumida | a) subir o teto preventivamente — enfraqueceria o requisito sem medição que o justifique | 🟢 |
| D-12 | Toda citação de `BR-T` na matriz carrega o **artefato qualificado**, e a colisão de IDs entra como lacuna documental declarada | `domain.md#2.3` usa `BR-T01`/`BR-T02` para *filtro por tipo* e *gate de medicamentos*; `code-analysis.md#6` (módulo templates) e `templates/requirements.md#2` usam os **mesmos IDs** para *campos obrigatórios* e *enum de 7 valores*. É a terceira instância da família de defeitos de numeração, e a primeira em que o **mesmo** identificador denota regras disjuntas — a forma pior | a) citar `BR-T01` sem qualificar — ambíguo por construção; b) renumerar as regras na extração — fora do escopo do ciclo forward, que não reescreve `_reversa_sdd/` | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as cinco
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-21 e estão
registradas em `_reversa_forward/005-prova-templates/requirements.md#9. Esclarecimentos`.

### 4.1 Onde a prova ancora, e o que isso deixa de fora

A prova ancora no **componente** `PrescriptionEditor`, e não nas telas que o montam. Isso é
deliberado (D-01) e tem uma consequência que precisa ficar escrita: o **encanamento** entre
a tela e o editor não é coberto por esta feature. Quem responde por ele é a prova da tela —
a `004-prova-consultas` já cobre o caminho de `Consultation.tsx` até o salvamento do
documento, inclusive a ausência de rastro de auditoria naquele fluxo. O que **não** existe é
prova equivalente para o caminho a partir de `PatientDetail.tsx`.

> Consequência prática para quem for conferir: os quatro cenários de `PT-006` ficam com
> veredito 🟢 **no componente**. Lê-los como cobertura das duas telas de origem seria ler
> mais do que a prova afirma.

### 4.2 Uma redação corrigida, registrada em vez de silenciada

O `PT-006.3` do `.feature` diz que as variáveis são interpoladas *"quando salvo o
documento"*. Pela `RN-02`, a substituição acontece na **seleção do modelo**, e o salvamento
persiste o campo como ele estiver. O plano prova as duas coisas — a substituição na
aplicação (`RF-07`) e a edição sobrevivendo ao salvamento (`RF-08`) — e declara o `.feature`
impreciso.

Isto **não** é premissa adotada de `[DÚVIDA]`: é a correção de uma redação do cenário de
paridade, na mesma família da `PT-005.1`. Ajustar o `.feature` é emenda de uma linha em
`_reversa_sdd/migration/parity_tests/`, que o ciclo forward não reescreve; o registro vive
aqui e na matriz.

## 5. Delta arquitetural

Componentes do legado que mudam. O restante da arquitetura descrita em
`_reversa_sdd/architecture.md` permanece intocado.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de prova da emissão de documento | `_reversa_sdd/inventory.md#Cobertura de testes` | `componente-novo` | Um arquivo de verificação para `PrescriptionEditor` mais a massa compartilhada. O componente não tinha prova nenhuma apesar de servir aos módulos de Consultas e de Pacientes |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do módulo Consultas` | `regra-alterada` | Ganha a seção equivalente para o grupo `06`, com veredito por cenário, as três lacunas Alta com evidência e a colisão de `BR-T` como lacuna documental |
| `_reversa_sdd/code-spec-matrix.md` | `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo "Templates (06)" deixa de estar endereçado a uma feature a criar e passa a ter prova. O saldo dos módulos restantes cai de **23 para 19** |
| `_reversa_sdd/code-analysis.md#5.3` (módulo templates) | `_reversa_sdd/code-analysis.md#5.3 Constante AVAILABLE_VARIABLES` | `regra-alterada` | A lacuna 🔴 "não confirmado no código analisado" passa a ter veredito **confirmado**: a variável não é substituída em nenhum caminho. O texto da extração não é reescrito; a correção vive no adendo do `/reversa-sync` |
| `src/pages/Templates.tsx` | `_reversa_sdd/code-analysis.md#3.1 Listagem Agrupada por Tipo` | **sem mudança** | Fora do escopo por D-07. Registrado aqui para que a ausência seja deliberada, não esquecimento |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `src/test/templateFixtures.ts` | Arquivo novo |
| `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | Arquivo novo |
| `_reversa_sdd/code-spec-matrix.md` | Seção do grupo `06`, destino dos cenários e lacunas |
| `src/components/medical/PrescriptionEditor.tsx` | **Intocado** |
| `src/pages/Templates.tsx` | **Intocado** — fora do escopo (D-07) |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |
| `src/test/verificacoes-negativas.mjs` | **Intocado** — nenhum caso novo é necessário |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice, relação ou migração. Os schemas de `Template` e `Prescription` permanecem como estão, incluindo os defaults `is_default: false` e `is_active: true`, que a prova **não** toca.
- O único dado introduzido é **massa de prova fictícia**: modelos por tipo, um modelo inativo, um modelo contendo as quatro variáveis substituíveis e uma contendo `{DIAS_AFASTAMENTO}`, mais um paciente com e sem CPF.
- Detalhe completo em: `_reversa_forward/005-prova-templates/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** A leitura de modelos é
exercitada pela prova — para verificar **o que** o cliente pede e **o que** ele faz com a
resposta — mas a assinatura de `base44.entities.Template.filter`, o formato devolvido e o
tratamento de erro permanecem os do legado. A impressão é exercitada com dublê de
`window.open`, sem tocar no contrato do navegador.

Por essa razão, o diretório `interfaces/` **não é criado** (D-10), conforme a regra do
`/reversa-plan`.

## 8. Plano de migração

Não há migração de dados nem de contrato. A sequência abaixo é a ordem de execução:

1. Criar a massa de prova: modelos por tipo, modelo inativo, modelo com as quatro variáveis, modelo com `{DIAS_AFASTAMENTO}`, paciente com e sem CPF (D-01, D-04).
2. Provar a seção de medicamentos — presença nos dois tipos de receita, ausência nos quatro restantes, os cinco campos, e o portão do payload ao trocar de tipo (`RF-01`, `RF-02`, `RF-03`, D-03).
3. Provar a consulta de modelos no transporte — o pedido por tipo, o filtro de ativos e o cliente exibindo o que o servidor devolver (`RF-04`, `RF-05`, `RF-06`, D-02, D-06).
4. Provar a substituição e suas bordas — as quatro variáveis, a edição sobrevivendo ao salvamento, o CPF ausente, `{DIAS_AFASTAMENTO}` intacta e a marcação não escapada (`RF-07` a `RF-11`, D-03, D-04).
5. Provar a injeção na impressão com duplo de `window.open` (`RF-18`, D-05, D-08).
6. Provar procedência e contrato de enum — `template_name`, a troca de tipo com conteúdo obsoleto, a reedição sem modelo e os seis tipos do schema (`RF-12`, `RF-13`, `RF-14`, `RF-15`, D-09).
7. Estender a matriz com o veredito do grupo `06`, o saldo 23 → 19, as três lacunas Alta com evidência e a colisão de `BR-T` (`RF-16`, D-12).
8. Revalidar os quatro gates, medir o tempo e convergir por adendo no `/reversa-sync` (`RF-17`, D-11).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** O seletor de tipo é Radix e renderiza em portal; trocar de tipo seis vezes pode estourar o tempo limite no DOM simulado — foi o que aconteceu na feature 002 (66 s até o limite) | alto | média | D-01 concentra as trocas de tipo em uma verificação por conjunto, e o dublê do seletor é o padrão já adotado em `PatientForm.test.tsx`, `Appointments.test.tsx` e `NewConsultation.test.tsx`. O recorte de recuo é afirmar a expressão de visibilidade por tipo em verificações separadas, sem reabrir o portal |
| **R-02** O caminho de impressão é **inalcançável no `jsdom`**: `window.open` não é implementado, devolve `null` e o código sai pela guarda. O risco não é o duplo falhar — é a verificação passar sem exercitar nada | alto | média | A substituição é `vi.spyOn(window, 'open')`, e **apenas** `window.open` — substituir o objeto `window` inteiro quebra o `history` do jsdom. A verificação precisa afirmar que o HTML foi escrito **e** que o conteúdo não escapado está lá; uma verificação que só confirme a ausência de exceção é proibida pelo critério de pronto. Se o duplo não pegar, o `RF-18` volta a ser declaração — e isso vai **registrado na matriz**, não silenciado |
| **R-03** A string de `{DATA}` depende do ICU do ambiente; um Node compilado com `small-icu` devolveria outro formato | médio | baixa | O Node traz `full-icu` por padrão desde a versão 13, então `21/09/2026` e `21 de setembro de 2026` são estáveis. D-04 registra o recuo: duplicar `toLocaleDateString`. A verificação afirma a string por extenso, então a falha é imediata e legível, não intermitente |
| **R-04** Provar o **defeito** de AMB-006 cria uma prova que enuncia uma vulnerabilidade conhecida e trava a paridade (D-08) | alto | certa | É consequência aceita e declarada, não acidente. A mitigação é de registro: D-08 e a matriz dizem que corrigir AMB-006 exige alterar a verificação de propósito, e o cabeçalho do arquivo de prova nomeia AMB-006 como paridade preservada, para que ninguém leia a asserção como expectativa de produto |
| **R-05** O `RF-06` prova a **ausência** de uma defesa no cliente — classe frágil: passa se o dublê devolver o resultado errado por acidente e a verificação não olhar | alto | média | O mesmo dublê devolve, na mesma verificação, um modelo de tipo errado **e** um inativo, e a verificação afirma que **os dois** aparecem. Se o arranjo mudar e o dublê passar a filtrar, a verificação falha — o que é o comportamento desejado, porque a ressalva deixaria de ser verdadeira |
| **R-06** A prova do pedido (`RF-04`, `RF-05`) passa mesmo se o cliente parar de pedir, caso a asserção seja frouxa | alto | baixa | D-02 afirma os **argumentos exatos** do pedido, incluindo `is_active: true`, e não apenas que a consulta aconteceu |
| **R-07** Um arquivo único cobrindo dezoito requisitos pode ficar denso e esconder qual promessa caiu | médio | média | Blocos `describe` por superfície (medicamentos, modelos, substituição, impressão, procedência), uma verificação por promessa, e o nome de cada verificação citando o `RF` que ela prova |
| **R-08** A matriz pode divergir da suíte em silêncio | alto | média | O critério de pronto exige conferência da matriz contra a suíte antes de fechar, como nas features 002, 003 e 004 |
| **R-09** A colisão de `BR-T` pode voltar a morder na redação da matriz, já que os IDs são idênticos em três artefatos | médio | alta | D-12 exige artefato qualificado em toda citação, e a verificação final da matriz confere que nenhum `BR-T` aparece sozinho |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature:

- [ ] Os 4 cenários de `PT-006` têm prova de execução no componente (RF-01 a RF-09)
- [ ] A seção de medicamentos coincide com `type.includes('receita')` nos **seis** tipos (RF-01, RF-02)
- [ ] O portão de `medications` é provado no **payload**, independente da visibilidade (RF-03)
- [ ] O filtro de modelos é provado nos **argumentos do pedido**, por tipo e por `is_active` (RF-04, RF-05, D-02)
- [ ] O cliente é provado **sem re-filtro**, com o mesmo dublê devolvendo tipo errado e inativo (RF-06, D-06)
- [ ] A substituição das quatro variáveis é provada, com o `Date` congelado (RF-07, D-04)
- [ ] A edição após a aplicação sobrevive ao salvamento (RF-08)
- [ ] `{DIAS_AFASTAMENTO}` chega **literal** ao payload, em documento de atestado (RF-09, D-03)
- [ ] A marcação HTML chega **literal** ao payload e ao HTML impresso (RF-11, RF-18, D-03, D-05)
- [ ] A janela de impressão **não** foi aberta de verdade em nenhuma verificação (D-05, RNF Isolamento)
- [ ] `template_name` grava o nome, e a troca de tipo deixa conteúdo obsoleto com procedência nula (RF-12, RF-13)
- [ ] O enum do editor é confrontado com o do schema, e não com uma lista solta (RF-15)
- [ ] A matriz cita todo `BR-T` com o artefato qualificado, e registra a colisão (RF-16, D-12)
- [ ] As três lacunas Alta aparecem com **evidência**, e declaradas como defeito aberto (RF-09, RF-11, RF-18)
- [ ] Nenhum arquivo de aplicação foi alterado, `Templates.tsx` incluído (D-07)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)
- [ ] A suíte completa executa em menos de 90 segundos (RNF Desempenho, D-11)
- [ ] Existe adendo vigente ao final do ciclo (RF-16)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-21 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
