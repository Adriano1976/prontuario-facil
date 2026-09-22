# Actions: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Roadmap: `_reversa_forward/009-prova-kpis-dashboard/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 16 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 8 elos |

> **Esta feature é quase toda sequencial, e a razão é a mesma da 008: os arquivos.** Nove das
> dezesseis ações escrevem no **mesmo arquivo de prova**, quatro escrevem em **dois** artefatos de
> documentação — duas no onboarding e duas na matriz —, duas tocam a massa e uma produz o arquivo de
> vigilância. O marcador `[//]` aparece **duas vezes**, no único par que satisfaz as três condições ao
> mesmo tempo: arquivos diferentes, nenhuma dependência entre si e nenhuma disputa de escrita.
>
> **A ordem das fases é invertida em relação ao normal, e isso é deliberado.** Numa feature de
> comportamento, a fase de testes prepara o caminho para o núcleo. Aqui os testes **são** o núcleo:
> a fase 2 monta o arnês e prova os quatro primeiros cenários, e a fase 3 continua provando — o
> quarto cartão e as duas metades de transporte. Nada é "integrado" no sentido de cola entre
> sistemas, porque a feature não cria sistema nenhum: ela liga uma promessa a uma medição.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar o módulo de massa com os construtores das **quatro entidades** lidas pelo Dashboard (paciente, agendamento, consulta, prescrição) e os auxiliares de data derivados do relógio local, com deslocamento explícito em dias (`D-09`, `D-10`) | - | - | `src/test/dashboardFixtures.ts` | 🟢 | [X] |
| T002 | Acrescentar ao módulo a **massa mista de prova**: marcadores que não colidem entre entidades, as três classes de data (hoje, futuro com folga em dias, passado) e os status que dão dentes ao critério — `cancelado` fora, `faltou` e `concluido` dentro (`R-04`, `R-05`) | T001 | - | `src/test/dashboardFixtures.ts` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Criar o arquivo de prova com o **dublê de consulta que modela a cache por chave** — executa a função uma vez por chave, devolve a mesma referência entre renderizações e tem cache limpa entre verificações — e com o auxiliar de leitura ancorado no título do cartão (`D-02`, `D-04`, `R-04`, `R-06`) | T002 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T004 | Provar `RF-01` · `PT-008.1`: com massa mista de `ativo` e `inativo`, o cartão "Pacientes Ativos" exibe exatamente a contagem de ativos (`BR-MIGRAR-027`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T005 | Provar `RF-02` · `PT-008.2` em **três** verificações: `cancelado` não conta, `faltou` e `concluido` **contam**, e agendamento de outra data não conta (`BR-MIGRAR-028`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T006 | Provar `RF-03` · `PT-008.3` pela **ausência**: a tela exibe exatamente os quatro títulos do legado, nenhum deles um contador de consultas de hoje, e o descarte dos dois agregados fica registrado no comentário da verificação (`AMB-002`, `D-06`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T007 | Provar `RF-04` · `PT-008.4`: com massa em que uma fórmula plausível daria outro valor, o cartão exibe `94%` e **não** exibe texto de tendência (`AMB-001`, `D-08`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Provar `RF-05` · `PT-008.5` em **três** verificações: seis futuros não cancelados produzem cinco; passado e futuro cancelado não aparecem; sem nenhum, exibe "Nenhum agendamento" e o atalho "Agendar consulta" (`BR-MIGRAR-030`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T009 | Provar `RF-06` · `BR-MIGRAR-029` em **duas** verificações: com conjunto não vazio o cartão "Documentos Emitidos" exibe o tamanho lido; com conjunto vazio exibe zero, e nunca vazio ou indefinido (`D-07`, `R-07`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T010 | Provar `RF-07` · `BR-MIGRAR-033` no **transporte**: cada uma das quatro leituras é emitida com o par exato de ordenação e limite — `-created_date`/100, `-date`/50, `-created_date`/100, `-date`/100 (`D-07`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |
| T011 | Provar `RF-08` · `BR-MIGRAR-033` no **transporte**: as quatro leituras passam pelo método escopado com o escopo resolvido da sessão — e a asserção compara com o escopo que a resolução real produz, **não** com um dublê (`D-03`) | T003 | - | `src/pages/__tests__/DashboardKpis.test.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Preencher a tabela **requisito × cenário** do onboarding, distinguindo o que se prova por **valor**, por **ausência** e por **transporte**, e nomeando o que **não** está coberto (`RF-09`, `D-06`, `D-08`) | T011 | `[//]` | `_reversa_forward/009-prova-kpis-dashboard/onboarding.md` | 🟢 | [X] |
| T013 | Estender a matriz com o veredito dos **cinco** cenários de `PT-008` e com o **bloqueio vencido** do grupo `08` — a dependência declarada de `G-01` é de produto, não de prova (`D-13`) | T011 | `[//]` | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T014 | Registrar na matriz as **duas divergências documentais** encontradas na coleta de contexto — o fluxograma do Dashboard e o conflito entre `dashboard/requirements.md:17` e `target_domain_model.md:88` — e atualizar o saldo dos grupos transferidos | T013 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T015 | Executar a suíte e os gates, medir `CF-01`, `CF-02` e `CF-03` **com a condição de medição**, conferir que a verificação herdada de `PT-007.3` continua verde sem reescrita, que a contagem de verificações **subiu** e que nenhum arquivo de aplicação foi tocado (`RF-10`, `D-11`, `D-12`, `R-01`, `R-08`) | T012, T013, T014 | - | `_reversa_forward/009-prova-kpis-dashboard/onboarding.md` | 🟢 | [X] |
| T016 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados — os dois achados registrados, o critério de `AMB-002` sem superfície e os limites declarados que agora têm prova | T015 | - | `_reversa_forward/009-prova-kpis-dashboard/regression-watch.md` | 🟢 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado (`CF-02`, `D-01`).** O perímetro é `src/pages/__tests__/DashboardKpis.test.tsx`, `src/test/dashboardFixtures.ts` e a documentação da feature. A página do Dashboard, o contrato de leitura, os tipos e a sessão são o **objeto** da prova. Se alguma ação parecer exigir mudança neles, algo saiu do escopo.
2. **Não toque em `src/pages/__tests__/Dashboard.test.tsx` (`RF-10`).** Aquele arquivo prova `PT-007.3` com um desenho deliberado — dublês que devolvem conjunto vazio, componentes pesados anulados. A prova nova vive em arquivo próprio exatamente para não mexer lá.
3. **O dublê de consulta modela a CACHE, não a renderização (`D-02`).** A armadilha foi medida na 006: um dublê que executa a função a cada renderização conta renderizações, não pedidos, e a contagem infla. Como `T010` conta chamadas de transporte, um dublê ingênuo faria a verificação falhar por culpa do arnês. A cache precisa ser **limpa entre verificações**, senão a massa de um caso vaza para o seguinte.
4. **Não duble `resolveScope` nem `toSessionUser` (`D-03`).** É a armadilha da 005: uma asserção sobre um escopo dublado compara o dublê consigo mesmo. Só `base44.auth.me` e os quatro transportes de entidade são substituídos; a conversão de sessão e a resolução de escopo correm de verdade.
5. **Datas sempre locais (`D-10`, `R-05`).** Uma data no formato `AAAA-MM-DD` é lida em fuso universal enquanto os leitores de data são locais — armadilha medida na 003. E a massa futura usa folga em **dias**, nunca em minutos: um agendamento a poucos minutos do presente vira passado no meio da execução.
6. **Marcadores distintos por entidade (`R-04`).** Se dois cartões puderem exibir o mesmo número, a verificação passa por acidente quando o dublê troca uma chave. Escolha valores que colidam com nada.
7. **A aba ativa precisa montar (`R-03`).** O Dashboard abre em `visao-geral`, que é a aba onde a lista de Próximos Agendamentos vive. Confirme na **primeira** execução que o conteúdo monta; se não montar, fixe a aba ativa explicitamente em vez de depender do padrão do componente de abas.
8. **`R-06`: o jsdom não aplica ocultação por CSS.** Conte os cartões por **contagem exata** e ancore as consultas no título, em vez de buscar globalmente por papel ou por texto solto. Foi assim que a 006 descobriu duas navegações no DOM para uma na tela.
9. **O auxiliar de leitura ancora na estrutura do cartão (`R-02`).** Título e valor são parágrafos irmãos. Mantenha o acoplamento num **único** auxiliar, documentado: se o cartão mudar de forma, é sinal de paridade quebrada, e a quebra precisa ser um diagnóstico claro, não um erro espalhado por dez verificações.
10. **`CF-01`, `CF-02` e `CF-03` são MEDIDOS, não afirmados (`D-11`).** Nenhum deles vira verificação: o teto de duração é o tempo da própria suíte, e o perímetro é o estado do repositório. Registre cada um **com a condição de medição** — a 006 mediu 75,78 s em máquina calma e 122,57 s sob carga, para código idêntico.
11. **A contagem de verificações deve SUBIR.** Linha de base: **132 verificações em 23 arquivos**. Esta feature acrescenta um arquivo e as verificações dos dez requisitos; uma contagem que **caia** é regressão. Não meça apenas "passou".
12. **`npm test` precisa de acesso total no sandbox.** O empacotador cria processo filho com `stdio` em pipe, e o modo confinado bloqueia isso com erro de permissão — foi assim nas features 005 a 008, e não é defeito do arnês. A guarda de encoding **não** tem essa dependência e roda em modo restrito.
13. **A `_reversa_sdd/code-spec-matrix.md` é arquivo COMPARTILHADO (`D-13`).** Outra sessão já escreveu nela depois da minha última leitura, e foi esse descuido que produziu duas features numeradas `007`. **Releia o arquivo do zero antes de cada edição** — `T013` e `T014` são duas edições no mesmo arquivo, e a segunda exige releitura depois da primeira.
14. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002 a 008.
15. **Marcador `[//]` só onde existe par — e aqui existe um (`T012` × `T013`).** Eles tocam arquivos diferentes, nenhum depende do outro e nenhum escreve onde o outro escreve. Fora desse par, tudo é sequencial: nove ações escrevem no arquivo de prova, quatro escrevem na documentação, duas tocam a massa e uma produz o arquivo de vigilância. Contagem conferida: **2 declarados, 2 marcados** — e a soma por arquivo fecha as dezesseis: 9 + 4 + 2 + 1. Não invente paralelismo entre ações que disputam o mesmo arquivo.
16. **Aviso herdado da rodada 005.** Não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell: o `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e corrompe o arquivo ao regravar. Use a ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito. E não escreva exemplo literal de mojibake em nota nenhuma: a guarda varre bytes e não distingue texto corrompido de texto que **cita** corrupção.
17. **Os dois achados entram como comentário e como documento, nunca como verificação.** O quarto cartão não ser contador de consultas, e a constante de `AMB-001` nunca ter existido, são afirmações sobre o código que nenhuma asserção de tela sustenta. Escrevê-las como verificação produziria um teste que mede a si mesmo.

### Notas acrescentadas pelo `/reversa-coding`

18. **As treze verificações passaram na PRIMEIRA execução — e isso não foi aceito como evidência.** Verde de primeira não distingue medição de stub, então duas asserções foram **deliberadamente quebradas** antes de o resultado valer: o valor da Taxa de Atendimento foi esperado como `95%`, e o limite da lista como 6 itens. A suíte acusou **exatamente as duas** falhas — `expected '94%' to be '95%'` e `expected [...] to have a length of 6 but got 5` —, provando que a primeira lê o DOM renderizado e a segunda conta itens reais. Revertido em seguida; o episódio está em `onboarding.md#7.1` e nas duas linhas `status: corrected` do `progress.jsonl`.
19. **`R-03` não se materializou.** A aba ativa (`visao-geral`) montou o conteúdo na primeira execução, como a documentação do componente de abas sugeria — a lista de Próximos Agendamentos apareceu no DOM sem intervenção. A mitigação preventiva não foi necessária, e o risco pode ser rebaixado numa próxima revisão.
20. **O auxiliar de leitura ancorou na GRADE, e não na classe do título.** `closest('div.grid')` a partir do título sobe até a grade de cartões; cada filho é um cartão, e dentro dele os parágrafos são título e valor. O acoplamento à estilização ficou menor do que o previsto em `D-04` — a âncora é estrutural, e não uma classe de Tailwind.
21. **A ordem de `T015` foi invertida em relação ao plano, e a razão é de qualidade.** A linha de medição da matriz precisa de **números medidos**, e a matriz é escrita em `T013`/`T014` — antes de `T015`. A suíte foi medida duas vezes **antes** da edição da matriz, para que a tabela registrasse o medido e não o esperado. Nenhum requisito foi afetado; o desvio está registrado no campo próprio do `onboarding.md#7`.
22. **O tempo subiu ~12 s, e o acréscimo NÃO é das verificações novas.** A suíte mediu **85,86 s** e **87,43 s** (0 falhas nas duas), contra 74,83 s no fecho da 008. As treze verificações somam **1,4 s** no arquivo; o resto vem da coleta sob concorrência (`collect` somando ~122 s entre os processos). É a mesma variância condicional da 006, e o teto de 90 s permanece cumprido nas duas medições — mas por margem estreita, e o registro é honesto sobre isso.
23. **A matriz tinha uma contradição interna, e ela foi corrigida além do plano.** A nota da guarda de encoding ainda dizia que regularizá-la "é trabalho de feature própria, não desta", enquanto a tabela de lacunas, poucas linhas abaixo, já a dava como **fechada pela feature 008**. As duas afirmações conviviam no mesmo arquivo desde a rodada anterior. A redação foi corrigida com o registro histórico preservado — deixar a contradição de pé seria pior do que sair do plano por uma linha.
24. **Resultado da rodada:** `npm test` com **145 verificações em 24 arquivos e 0 falhas**; `typecheck` e `lint` com zero ocorrências; `prova:encoding` com **450** arquivos íntegros; `CF-02` vazio, com apenas dois arquivos novos em `src/`. O `prova:negativos` **não** foi executado: a feature não toca o arnês de casos negativos.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-22 | Execução completa pelo `/reversa-coding`: 16 de 16 ações concluídas, com 7 notas novas de execução | reversa |
