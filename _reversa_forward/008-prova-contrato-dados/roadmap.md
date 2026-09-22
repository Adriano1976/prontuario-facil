# Roadmap: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/008-prova-contrato-dados/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar o contrato **recusando compilação**. Os quatro cenários de `PT-010` não se provam
renderizando tela nem medindo transporte: provam-se com o gate de tipos. O instrumento é o
comando de casos negativos, que já existe e já cobre parte dos cenários — a feature **cita** os
casos existentes e escreve casos novos só para as metades descobertas: o tratamento explícito de
papel, a integralidade dos adaptadores e os conjuntos fechados que faltam. A cláusula positiva
de `PT-010.3` é coberta por **citação do `typecheck`**, que roda sobre o projeto inteiro.

Duas decisões mudam o artefato de forma mais funda. O comando ganha a noção de **caso positivo**
— o que deve **compilar** —, e com ela o buraco declarado em `F-03` deixa de ser ressalva e
passa a ser **medido**: um escopo administrativo declarado por quem não é administrador compila,
e o comando afirma isso. E a **guarda de codificação**, que provava sem promessa, é adotada:
passa a ter dono, e a matriz deixa de listá-la como órfã. Nenhum arquivo de aplicação é tocado —
o único arquivo de código que muda é o próprio arnês de provas.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi registrado, e
portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de princípio vêm do
legado e dos adendos vigentes:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A feature prova tipos e não toca schema, entidade nem runtime | respeita |
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | Nenhum arquivo de aplicação é alterado; o único código tocado é o arnês de provas | respeita |
| Prova sem promessa é furo declarado (`_reversa_sdd/addenda/006-prova-logs-acesso.md#Vigência`) | A decisão `Q3` · `3a` **fecha** o furo: a guarda de codificação ganha dono | respeita |
| Veredito verde exige ressalva visível (`_reversa_sdd/addenda/004-prova-consultas.md#Vigência`) | As três cláusulas **não verificadas** do contrato entram declaradas, e não escondidas num verde | respeita |
| Provar o que dá, declarar o que não dá (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | A decisão `Q5` · `5a` vai além: o buraco do `F-03` é **provável**, então passa a ser medido em vez de declarado | respeita |
| A prova trava a paridade (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | O caso positivo **fixa** o buraco do `F-03`: quem fechar o buraco verá o comando falhar, e terá de mudar o caso de propósito | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este plano
> não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | O instrumento é o **comando de casos negativos**, e a cláusula positiva de `PT-010.3` é coberta por **citação do `typecheck`** | Decisão `Q1` · `1a`. O `typecheck` já roda sobre o projeto inteiro, e é ele que verifica que os dois adaptadores reais honram o contrato — não há o que acrescentar ali | a) comparação de comportamento entre os adaptadores — o SDK real exigiria rede, e comparar o mock consigo mesmo não diria nada sobre o outro; b) só citar o que existe — deixaria três metades de cenário sem prova | 🟢 |
| D-02 | Os casos existentes são **citados pelos identificadores**; casos novos entram só para as metades descobertas | Decisão `Q2` · `2a`. Três casos já cobrem `PT-010.1` e um cobre parte de `PT-010.4`; reafirmá-los criaria dois pontos de verdade para a mesma cláusula, e a matriz passaria a ter de manter os dois | a) reafirmar cada cláusula — duplicação com dois lugares para manter; b) citar tudo e não escrever nada — a feature seria só declaração | 🟢 |
| D-03 | O comando passa a distinguir **caso que deve ser recusado** de **caso que deve compilar**, com um campo declarativo em cada caso | Decisão `Q5` · `5a`. Hoje um arquivo sem erro é lido como "NÃO foi recusado pelo gate" e acusado como falha — o comando não sabe expressar "este **deve** passar". A distinção é o que permite medir um buraco do contrato em vez de só declará-lo | a) um segundo comando separado para casos positivos — duplicaria o arnês; b) deduzir pelo nome do arquivo — convenção implícita, que quebra em silêncio | 🟢 |
| D-04 | O buraco de `F-03` é **medido**: um caso positivo declara escopo administrativo indevido e **compila** | Decisão `Q5` · `5a`. O contrato afirma que o compilador confere forma e nunca autorização; isso é **provável**, e um buraco medido vale mais que um buraco declarado. É a diferença entre saber e saber que se sabe | a) declarar na matriz — a ressalva já está no código, e repeti-la não acrescenta medição; b) provar por arquivo versionado — exigiria um arquivo permanente que demonstra uma brecha, sob pena de virar exemplo a ser copiado | 🟢 |
| D-05 | A **guarda de codificação é adotada** e ganha dono; a ação é de **registro**, não de código | Decisão `Q3` · `3a`. Ela já existe, já passa e já tem autoteste: o que falta é um `actions.md` que a reivindique, para que uma falha dela tenha contrato dizendo qual promessa foi violada. Esta é a feature de infraestrutura de gate, e é onde adotá-la custa menos | a) deixá-la como lacuna — o furo continua, e a próxima feature de gate teria a mesma conversa; b) absorvê-la no comando de casos negativos — misturaria duas provas de naturezas diferentes | 🟢 |
| D-06 | O `PT-010.4` cobre **os conjuntos que o cenário nomeia**: situação de agendamento e tipos documentais | Decisão `Q4` · `4a`. `ConsultationStatus` já está coberto por um caso existente; os dois que faltam são exatamente os que o cenário enuncia. Ampliar para todos os conjuntos do domínio provaria mais do que o grupo transferido pede | a) todos os conjuntos fechados (`TemplateType`, `ExamType`, ações de auditoria) — escopo maior que o cenário, e cada um pertence ao seu módulo; b) só agendamento — deixaria os tipos documentais sem veredito | 🟢 |
| D-07 | O `PT-010.3` vale **até o ponto de ligação**, e o limite é declarado | O `bindAdapter` faz `as unknown as Parameters<...>` para encaixar o registro tipado na forma crua, com justificativa de contravariância registrada no código. A cláusula "SDK e mock implementam a mesma interface" é verdadeira **entidade por entidade** e **não** no ponto de ligação | a) omitir o limite — o cenário pareceria cobrir mais do que cobre; b) remover a asserção — fora do escopo, e o comentário do código argumenta por que ela existe | 🟢 |
| D-08 | Os **retornos** dos adaptadores ficam declarados como não verificados | `createEntityRepository` converte cada retorno com `as`. A cláusula "as operações do mock têm os mesmos tipos de retorno que o SDK" **não** é verificada pelo tipo — e é a cláusula mais fácil de ler como coberta | a) afirmar a cláusula — falso; b) deixá-la fora da matriz — o verde de `PT-010.3` a sugeriria | 🟢 |
| D-09 | O diretório `interfaces/` **não é criado** | A feature prova tipos e não redefine contrato externo: as assinaturas do repositório, dos gateways e do escopo permanecem as do legado | a) documentar o contrato — seria inventário de contrato inalterado, não delta | 🟢 |
| D-10 | O único arquivo de **código** tocado é o arnês de provas (`src/test/verificacoes-negativas.mjs`) | Ele é infraestrutura de prova, não aplicação. Nenhum arquivo de `src/api/`, `src/types/` ou `src/lib/` é alterado — a feature mede o contrato, não o conserta | a) tocar o contrato para fechar os buracos — decisão de produto, não de prova | 🟢 |
| D-11 | A `_reversa_sdd/code-spec-matrix.md` é tratada como **arquivo compartilhado** e é relida do zero antes de cada edição | Ela foi editada pela sessão que entregou a `007-matriz-paridade-visual` **depois** da minha última escrita. Duas sessões escrevendo no mesmo arquivo é o risco real desta rodada, e ele é operacional, não técnico | a) editar a partir da leitura anterior — sobrescreveria o trabalho da outra sessão sem avisar | 🟢 |
| D-12 | O teto de **90 segundos é revalidado**, e esta feature quase não o move | Ela não acrescenta arquivo de teste de unidade: o custo novo é do gate de tipos, que é comando próprio. O teto medido no fecho da 006 foi de 75,78 s em máquina calma e 122,57 s sob carga — e a variância continua sendo a observação registrada | a) subir o teto — enfraqueceria o requisito sem medição que o justifique | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as cinco
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-22 e estão registradas
em `_reversa_forward/008-prova-contrato-dados/requirements.md#9. Esclarecimentos`.

### 4.1 O que a prova **não** alcança, e por quê

O contrato é a superfície mais bem instrumentada do projeto, e ainda assim tem quatro limites.
Os três primeiros ficam **declarados**; o quarto passa a ser **medido** (`D-04`):

1. **A autorização.** O tipo garante que o escopo foi informado, nunca que ele é legítimo. A
   defesa real é a RLS do BaaS, fora do cliente.
2. **Os retornos dos adaptadores.** Convertidos por `as` em `createEntityRepository`.
3. **O ponto de ligação.** O `bindAdapter` apaga a verificação no encaixe final.
4. **O buraco de `F-03`.** Escopo administrativo indevido **compila** — e isso, por ser
   provável, deixa de ser declaração e vira caso positivo do comando.

> Consequência prática para quem for conferir: o verde de `PT-010.1` afirma que **não dá para
> esquecer o escopo**, e não que o escopo está certo. Ler os cenários do grupo `10` como
> "autorização verificada" seria ler quatro vezes mais do que eles prometem.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Arnês de provas negativas | `_reversa_sdd/code-spec-matrix.md#Como a prova é executada` | `regra-alterada` | Ganha o conceito de **caso positivo** e os casos novos dos grupos não cobertos |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do grupo 07` | `regra-alterada` | Ganha a seção do grupo `10`, com veredito por cenário e as três cláusulas não verificadas declaradas |
| `_reversa_sdd/code-spec-matrix.md` | `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo "Contrato de dados (10)" deixa de estar endereçado a uma feature a criar e passa a ter prova |
| Guarda de codificação | `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | `regra-alterada` | Deixa de ser listada como **prova sem dono**: passa a ser reivindicada por esta feature |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `src/test/verificacoes-negativas.mjs` | **Modificado** — o arnês ganha casos positivos e os casos novos |
| `_reversa_sdd/code-spec-matrix.md` | Seção do grupo `10`, destino dos cenários e a guarda deixando de ser órfã |
| `src/api/**`, `src/types/**`, `src/lib/**` | **Intocados** — a feature mede o contrato, não o altera |
| `src/test/mojibake.mjs` e `src/test/mojibake.test.mjs` | **Intocados** — a adoção da guarda é de registro, não de código |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice, relação ou migração.
- Não há **massa de prova**: os casos do comando são fontes TypeScript escritas em tempo de execução e removidas no fim. O único "dado" envolvido são os valores dos conjuntos fechados, usados para provar que um valor **fora** deles é recusado.
- Detalhe completo em: `_reversa_forward/008-prova-contrato-dados/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** A feature *prova* o contrato — ela
não o modifica. As assinaturas do repositório de entidade, dos gateways de autenticação,
integração e log, e as formas de escopo permanecem exatamente as do legado.

Por essa razão, o diretório `interfaces/` **não é criado** (D-09), conforme a regra do
`/reversa-plan`.

## 8. Plano de migração

Não há migração de dados nem de contrato. A sequência abaixo é a ordem de execução:

1. Acrescentar ao arnês a distinção entre **caso que deve ser recusado** e **caso que deve compilar**, sem quebrar os 9 existentes (D-03).
2. Escrever os casos novos das metades descobertas: leitura crua sobre entidade sob RLS (`RF-02`), papel atribuído à variante offline (`RF-03`), comparação cega de papel (`RF-04`) e adaptador incompleto (`RF-05`).
3. Escrever os casos dos conjuntos que o cenário nomeia: situação de agendamento e tipos documentais (`RF-06`, D-06).
4. Escrever o **caso positivo** que mede o buraco de `F-03` (D-04).
5. Montar a tabela caso × cenário de `PT-010`, incluindo **o que não é coberto** (`RF-07`).
6. Registrar na matriz o veredito do grupo `10`, as três cláusulas não verificadas, o ramo inalcançável de `applyScope` e o saldo dos grupos restantes (`RF-08` a `RF-11`, `RF-13`, D-07, D-08).
7. Adotar a guarda de codificação: reivindicá-la no `actions.md`, tirá-la da lista de provas sem dono e citá-la na matriz e no roteiro (`RF-12`, D-05).
8. Revalidar os cinco comandos, medir o tempo e convergir por adendo no `/reversa-sync` (`RF-14`, D-12).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** Ao mexer no arnês, os **9 casos existentes** podem deixar de passar — e eles são a prova citada por outras features | alto | média | Os casos existentes não são tocados: a mudança é aditiva, e o comando é executado antes e depois. Se algum deixar de passar, a mudança está errada |
| **R-02** O caso positivo pode "passar" por acidente: um arquivo sem erro **não relacionado** ao contrato seria lido como aprovação | alto | média | O comando já confere **por arquivo**; o caso positivo exige **zero** erros naquele arquivo. E o conteúdo do caso é mínimo, para que não haja outro motivo de erro |
| **R-03** Um caso novo pode ser recusado pelo **motivo errado** — mensagem diferente da esperada | médio | média | Cada caso declara o que a mensagem precisa citar, ou o código do erro. O comando já acusa "recusado, mas não pelo motivo esperado" |
| **R-04** A `code-spec-matrix.md` é **compartilhada** com outra sessão, que escreveu nela depois de mim (D-11) | alto | alta | Reler o arquivo do zero antes de cada edição, e nunca editar a partir de uma leitura anterior. Foi o que produziu o conflito de numeração das features `007` |
| **R-05** Adotar a guarda de codificação cria a tentação de **melhorá-la** no caminho | médio | média | A decisão `Q3` · `3a` é de **registro**: o escopo é reivindicá-la, não alterá-la. `mojibake.mjs` e `mojibake.test.mjs` ficam intocados |
| **R-06** O caso positivo pode virar exemplo de brecha a ser copiado | médio | baixa | Ele existe dentro do comando, é escrito e removido na mesma execução, e nunca é versionado — a mesma razão que mantém os casos negativos fora do repositório |
| **R-07** A contagem de verificações da suíte de unidade pode **cair** se alguma edição atingir arquivo de teste existente | alto | baixa | A feature não altera nenhum arquivo de teste de unidade. A contagem medida no fecho da 006 (132 verificações em 23 arquivos) é a referência, e o critério de pronto exige que ela **não caia** |
| **R-08** O comando roda o gate de tipos **duas** vezes por execução, e os casos novos poderiam dobrar o custo | médio | baixa | Os casos são escritos de uma vez e o gate roda numa passada só; o segundo gate é o da conferência de resíduo, e não muda. O que cresce é o número de arquivos por passada, não o número de passadas |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature:

- [ ] Os 4 cenários de `PT-010` têm veredito, com o que é **citado** e o que é **novo** distinguido (RF-01 a RF-06)
- [ ] A tabela caso × cenário existe, e **nomeia o que não é coberto** (RF-07)
- [ ] O comando distingue caso que deve ser recusado de caso que deve compilar (D-03)
- [ ] O buraco de `F-03` é **medido** por um caso positivo, e não apenas declarado (RF-15, D-04)
- [ ] Os **9 casos existentes** continuam sendo recusados pelo motivo certo (R-01)
- [ ] Os **três limites** do contrato estão declarados na matriz: autorização, retornos e ponto de ligação (RF-08 a RF-10, D-07, D-08)
- [ ] O ramo inalcançável de `applyScope` está registrado (RF-11)
- [ ] A guarda de codificação **não** aparece mais como prova sem dono (RF-12, D-05)
- [ ] Nenhum arquivo de aplicação foi alterado — só o arnês de provas (D-10)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)
- [ ] A contagem de verificações da suíte **não caiu** em relação às 132 medidas (R-07)
- [ ] A matriz foi relida antes de cada edição, e o trabalho da sessão paralela está preservado (R-04, D-11)
- [ ] Existe adendo vigente ao final do ciclo (RF-13)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
