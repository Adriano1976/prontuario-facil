# Actions: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Roadmap: `_reversa_forward/010-prova-modo-offline/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 20 |
| Paralelizáveis (`[//]`) | 6 |
| Maior cadeia de dependência | 5 elos |

> **A ordem das fases é invertida, como na 009, e por um motivo mais forte.** Aqui os testes não
> preparam o caminho do núcleo: eles **são** a feature inteira. A fase 2 prova o adaptador nos seis
> cenários de `PT-009`; a fase 3 prova a **ativação** e as regras que os cenários não nomeiam — e
> essas ficam no arquivo do adaptador, porque são comportamento do adaptador, e não do carregamento.
>
> **A fronteira entre os dois arquivos é a preocupação, não a fase.** O arquivo de ativação contém
> **duas** verificações — o ramo positivo e o negativo — e mais nada: ele existe para provar uma
> decisão que acontece uma vez por processo. Tudo o que se mede chamando o cliente vive no arquivo
> do adaptador, porque é lá que está o arranjo de armazenamento de que essas verificações precisam.
>
> **Seis ações são paralelizáveis, e a razão é que esta feature tem seis arquivos-alvo distintos.**
> As duas frentes de prova vivem em arquivos separados (`D-01`), e a documentação de fecho vive em
> três arquivos distintos. É o maior número de pares paralelos da série — as features 005 a 009
> tinham zero, um ou dois, porque quase tudo escrevia no mesmo arquivo. Contagem conferida: os seis
> marcados não compartilham arquivo entre si.
>
> **Duas verificações de `PT-009` são CITAÇÕES, e não entram como ação** (`D-12`): a autenticação
> imediata, já provada pela feature 001, e a ausência estrutural de papel, já provada pelos casos de
> compilação da feature 008. Escrevê-las de novo criaria dois pontos de verdade para a mesma
> cláusula.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar o arquivo de prova do **adaptador** com o arranjo comum: limpeza do armazenamento entre verificações, afirmação do estado de partida, e o auxiliar que devolve um repositório sobre um nome de entidade **sem seed** (`D-06`, `R-04`) | - | `[//]` | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Provar `RF-05` · `PT-009.3` e `RF-07`: sem a chave, a primeira leitura grava o **seed real** sob a chave prefixada; com conteúdo inválido na chave, a leitura não lança e devolve o seed (`BR-OFF04`, `D-05`, `D-08`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T003 | Provar `RF-06` · `PT-009.3`: criar, atualizar e excluir refletem na leitura seguinte, e o conjunto sobrevive a uma **nova instância** do cliente (`BR-OFF04`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T004 | Provar o ciclo de vida do registro em três verificações: `RF-09` — a criação preenche identificador e datas; `RF-10` — a atualização preserva o identificador e mescla; `RF-11` — identificador desconhecido rejeita com a **mensagem exata** (`BR-OFF06`, `BR-OFF07`, `D-09`, `D-10`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T005 | Provar `RF-12` · `PT-009.6`: o filtro casa por igualdade **exata**, e valores próximos ou operadores de intervalo não têm efeito (`BR-OFF08`, `L4`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T006 | Provar `RF-13` · `PT-009.6`: a ordenação funciona ascendente e descendente por **um** campo, e o limite corta **depois** de ordenar (`BR-OFF09`, `L5`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T007 | Provar `RF-08` · `PT-009.4` na forma forte: um registro com **dono alheio**, gravado direto no armazenamento, é visível e editável (`BR-OFF10`, `L1`, `D-07`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Criar o arquivo de prova da **ativação** com o arranjo próprio: fábrica do provedor substituída devolvendo os quatro gateways do contrato, ambiente trocado e **registro de módulos descartado** antes da importação dinâmica (`D-01`, `D-02`, `D-04`, `R-02`, `R-03`) | - | `[//]` | `src/api/__tests__/offlineActivation.test.ts` | 🟢 | [X] |
| T009 | Provar `RF-01` e `RF-02` · `PT-009.1`, as **duas metades**: com a variável ligada, o cliente exportado lê do armazenamento e a fábrica **não** é chamada; sem ela, a fábrica **é** chamada (`BR-OFF01`, `BR-OFF02`, `D-03`) | T008 | - | `src/api/__tests__/offlineActivation.test.ts` | 🟢 | [X] |
| T010 | Provar `RF-14` e `RF-15`: um nome de entidade **fora do domínio** devolve repositório funcional e conjunto vazio, sem lançar; e os no-ops de sessão e telemetria não mudam o armazenamento (`#3.2`, `BR-OFF11`, `BR-OFF12`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T011 | Provar `RF-16` e `RF-19`: o envio de arquivo devolve dado embutido e **não** cria registro persistido; o envio de e-mail rejeita com mensagem própria (`L3`, `#6`, `R-07`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T012 | Provar `RF-17`: o repositório **não** expõe leitura direta por identificador, e o caminho declarado é filtrar ou percorrer a lista (`L6`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T013 | Provar `RF-18` como **registro**: um identificador informado pelo chamador **sobrepõe** o gerado, e o caso fixa o comportamento real em vez de corrigir a redação da regra (`BR-OFF06`, decisão `2a`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |
| T014 | Provar `RF-20`: a exclusão de identificador **inexistente** resolve com sucesso e o conjunto permanece inalterado (`BR-OFF07`) | T001 | - | `src/api/__tests__/mockClientOffline.test.ts` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T015 | Preencher a tabela **requisito × cenário** do onboarding com o instrumento de cada um, e registrar o **veredito de `L1` a `L7`** — afirmada, citada ou declarada (`RF-21`, decisão `1a` do clarify) | T007, T014 | `[//]` | `_reversa_forward/010-prova-modo-offline/onboarding.md` | 🟢 | [X] |
| T016 | Estender a matriz com a seção de paridade do **grupo `09`** e com a linha de destino do grupo, marcando-o como concluído (`D-15`) | T014 | `[//]` | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T017 | Registrar na matriz os **quatro achados** da coleta, o veredito de `L2` e `L7` como declaradas, a linha de medição da feature `010` e o saldo 22 → **16 transferidos** (`D-15`) | T016 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T018 | Executar a suíte e os gates, medir `CF-01` **duas vezes** com a condição de medição, `CF-02` e `CF-03`; conferir que as quatro provas herdadas continuam verdes **sem reescrita** e que nenhum arquivo de aplicação foi tocado (`RF-22`, `D-13`, `R-01`) | T015, T016, T017 | - | `_reversa_forward/010-prova-modo-offline/onboarding.md` | 🟢 | [X] |
| T019 | Produzir o `regression-watch.md` da feature, cobrindo as regras que passam a ser vigiadas e as observações sem peso de regressão | T018 | `[//]` | `_reversa_forward/010-prova-modo-offline/regression-watch.md` | 🟢 | [X] |
| T020 | Produzir o `legacy-impact.md` da feature, com a política de edição lida, os arquivos afetados e as seções de regras preservadas e modificadas | T018 | `[//]` | `_reversa_forward/010-prova-modo-offline/legacy-impact.md` | 🟢 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado (`CF-02`).** O perímetro é `src/api/__tests__/` e a documentação da feature. O adaptador, o seed, o módulo de ativação, a sessão e os tipos são o **objeto** da prova.
2. **Não toque em `mockClient.test.ts` nem em `AuthContext.test.tsx` (`RF-22`).** As duas provas herdadas cobrem cláusulas que esta feature **cita** (`D-12`). Acrescentar verificação lá dentro criaria dois pontos de verdade para a mesma promessa.
3. **`RF-03` e `RF-04` NÃO ganham verificação nova.** A autenticação imediata já é provada com ambiente substituído, e a ausência estrutural de papel já é recusada pelo gate de tipos. O que a feature faz com elas é **apontar**.
4. **A fábrica substituída do provedor precisa dos QUATRO gateways (`R-03`).** O adaptador real consome entidades, sessão, integrações e registro de aplicação; um substituto incompleto faz o carregamento falhar por motivo alheio à promessa — e essa é a pior forma de falha, porque parece defeito da feature.
5. **`vi.stubEnv` e `vi.resetModules()` vêm ANTES da importação dinâmica (`D-04`).** A variável é lida no carregamento do módulo: sem descartar o registro, `base44Client` continua com o valor antigo e a metade negativa passa por acidente.
6. **Limpe o armazenamento no `beforeEach` E afirme o estado de partida (`R-04`).** Limpeza sem conferência é suposição, e suposição é o que faz uma verificação passar sem medir.
7. **Afirme os IDENTIFICADORES do seed, não o objeto inteiro (`R-05`).** Comparar o objeto acopla a prova a cada campo do seed; a promessa é a **origem** dos dados, e não o conteúdo campo a campo.
8. **Nunca afirme o formato do identificador gerado (`D-10`, `R-06`).** O adaptador usa o gerador do navegador quando existe e cai para um identificador próprio quando não existe. Afirme que é não vazio e distinto entre duas criações.
9. **Aguarde a promessa do envio de arquivo (`R-07`).** A leitura do arquivo é assíncrona; medir antes de ela terminar produz uma falha que parece defeito do adaptador.
10. **O caso do `RF-18` REGISTRA, não corrige.** Um identificador informado sobrepõe o gerado — comportamento do legado, preservado. Se alguém "consertar" a criação para sempre gerar o identificador, o caso precisa **falhar**, e é isso que obriga a decisão a ser explícita.
11. **`CF-01`, `CF-02` e `CF-03` são MEDIDOS, não afirmados (`D-13`).** Nenhum vira verificação. E meça o tempo **duas vezes**: a margem medida no fechamento da 009 foi de cerca de 3 segundos, e a 006 já registrou 122,57 s sob carga para código que rodava em 75,78 s calmo.
12. **A contagem de verificações deve SUBIR.** Linha de base: **145 verificações em 24 arquivos**. Uma contagem que **caia** é regressão. Não meça apenas "passou".
13. **`npm test` precisa de acesso total no sandbox.** O empacotador cria processo filho com `stdio` em pipe, e o modo confinado bloqueia isso com erro de permissão — foi assim nas features 005 a 009, e não é defeito do arranjo. A guarda de encoding **não** tem essa dependência.
14. **A `_reversa_sdd/code-spec-matrix.md` é arquivo COMPARTILHADO (`D-15`).** **Releia o arquivo do zero antes de cada edição** — `T016` e `T017` são duas edições no mesmo arquivo, e a segunda exige releitura depois da primeira. Foi esse descuido que produziu duas features numeradas `007`.
15. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002 a 009.
16. **Marcador `[//]` só onde existe par — e aqui existem três.** `T001` × `T008` (as duas frentes de prova), `T015` × `T016` (onboarding e matriz) e `T019` × `T020` (watch e impacto). Os seis arquivos-alvo são distintos entre si, e nenhum dos pares tem dependência mútua. Contagem conferida: **6 declarados, 6 marcados**. Não invente paralelismo entre ações que disputam o mesmo arquivo.
17. **Aviso herdado da rodada 005.** Não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell: o `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e corrompe o arquivo ao regravar. Use a ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito. E não escreva exemplo literal de mojibake em nota nenhuma: a guarda varre bytes e não distingue texto corrompido de texto que **cita** corrupção.
18. **O veredito de `L2` e `L7` é documental, e vive no onboarding.** Escrever um teste que afirme "esta limitação está declarada" produziria um teste que mede a si mesmo. O registro é a §5.3 do onboarding, e a conferência é de leitura.
19. **Correção do próprio plano, feita antes da primeira execução.** `T010` a `T014` nasceram apontando para o arquivo de **ativação** e dependendo de `T008`, por eu ter distribuído as ações por **fase** em vez de por **arquivo**. Elas provam comportamento do adaptador, e o arranjo de que precisam é o de `T001` — o armazenamento limpo, não o ambiente trocado. Foram reapontadas para o arquivo do adaptador, dependendo de `T001`. Era o desenho que o `roadmap.md` já descrevia (`D-01`: "a fronteira é a preocupação"), e o `actions.md` tinha se desviado dele. Nenhuma verificação mudou de conteúdo — só de lugar.

### Notas acrescentadas pelo `/reversa-coding`

20. **As 23 verificações passaram na PRIMEIRA execução — e isso não foi aceito como evidência.** Três asserções foram **deliberadamente quebradas** antes de o resultado valer, e a suíte acusou exatamente as três: `expected "spy" to not be called at all, but actually been called 1 times` na metade negativa da ativação; `expected [ 'Ana', 'Bruno' ] to deeply equal [ 'Carlos', 'Ana' ]` no corte depois de ordenar; e `length of 3 but got 2` na igualdade estrita. **A primeira é a que importa:** ela prova que a decisão `3a` do clarify — substituir a fábrica em vez de carregar o provedor real — mede de fato o ramo, e não a ausência de chamada por acidente de arranjo.
21. **Um bloco meu foi removido por duplicar prova herdada.** Eu havia acrescentado, além do plano, uma verificação do carimbo de dono na criação (`BR-MIGRAR-039`). Ela **duplica** o que `mockClient.test.ts` já prova desde a feature 001 — e a decisão `D-12` manda **citar**, não reafirmar. Removida, junto com o import que ficou órfão. É a segunda vez nesta série que eu ultrapasso o plano e a conferência pega.
22. **`R-03` não se materializou, e o substituto foi a razão.** O arranjo da ativação devolveu os **quatro** gateways do contrato — entidades, sessão, integrações e registro de aplicação —, e o encaixe passou de primeira. Um substituto incompleto faria o carregamento falhar por motivo alheio à promessa.
23. **`R-01` — o risco mais provável do plano — não aconteceu, e a razão não foi a feature.** A suíte mediu **69,79 s** e **70,53 s**, contra 85,86 s e 87,43 s no fechamento da 009 — com **24 verificações a mais** em 2 arquivos novos. A máquina estava mais calma. É a variância condicional que a 006 já havia documentado, e serve de aviso: **o teto é uma medida do ambiente tanto quanto do código**, e a linha da tabela de medições da matriz precisa ser lida com essa ressalva.
24. **A ordem de `T018` foi antecipada, e isso produziu um erro que a medição corrigiu.** A §5.2 do onboarding precisa de **números medidos**, então medi a suíte antes de escrever a documentação de fecho. Ao escrever a primeira versão da tabela, preenchi a contagem de arquivos da guarda de encoding **por antecipação** — um valor plausível e **errado**. A medição real devolveu 462, e o número foi corrigido. Registro o episódio porque é exatamente o que a disciplina "medir, não estimar" existe para impedir.
25. **Resultado da rodada:** `npm test` com **168 verificações em 26 arquivos e 0 falhas**; `typecheck` e `lint` com zero ocorrências; `prova:encoding` com **462** arquivos íntegros; `CF-02` vazio, com apenas dois arquivos novos em `src/`. O `prova:negativos` **não** foi executado: a feature não toca o arnês de casos negativos.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-22 | `T010` a `T014` reapontadas do arquivo de ativação para o do adaptador, por distribuí-las por fase em vez de por arquivo | reversa |
| 2026-09-22 | Execução completa pelo `/reversa-coding`: 20 de 20 ações concluídas, com 6 notas novas de execução | reversa |
