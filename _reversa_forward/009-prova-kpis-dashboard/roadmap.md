# Roadmap: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/009-prova-kpis-dashboard/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar os KPIs do Dashboard **renderizando a página de verdade** e medindo o texto que cada cartão
exibe. O instrumento é uma suíte de tela com massa sintética: o transporte das quatro leituras é
substituído, e o resto do caminho — a conversão de sessão, a resolução de escopo, os cinco cálculos
client-side e o componente do cartão — corre sem dublê. É o mesmo desenho da feature 006, com uma
diferença que decide a qualidade da medida: **`resolveScope` não é dublado**, para que a prova da
declaração de escopo (`RF-08`) não meça o próprio dublê.

O arquivo de prova é **novo**, e não uma extensão do `Dashboard.test.tsx`. Aquele arquivo existe
para provar `PT-007.3`, e o seu desenho é deliberado: os dublês devolvem conjuntos **vazios** para
que a página não gaste tempo agregando, e os componentes pesados são substituídos por nada. Enfiar
massa sintética lá dentro contradiria a decisão registrada na 006 e misturaria dois instrumentos no
mesmo arquivo.

Três cenários não se provam por valor de cartão. `PT-008.3` — a divergência de `AMB-002` — prova-se
pela **ausência**: a tela exibe exatamente os quatro cartões do legado, e o contador de consultas de
hoje não é um deles, porque os dois agregados que o calculariam são descartados no código. Os
limites de payload (`BR-MIGRAR-033`) e a declaração de escopo provam-se no **transporte**, medindo
os argumentos exatos com que cada leitura é emitida. E a Taxa de Atendimento prova-se pelo valor
exibido, com a divergência entre a decisão `AMB-001` e o literal da linha 173 **registrada**, não
corrigida.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi registrado, e
portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de princípio vêm do legado e
dos adendos vigentes:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | Nenhum arquivo de aplicação é tocado; o perímetro é o arquivo de prova e a massa | respeita |
| Provar o que dá, declarar o que não dá (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | `PT-008.3` é provado pela ausência, e o descarte dos agregados entra **declarado** no artefato — não escondido atrás de um verde | respeita |
| Veredito verde exige ressalva visível (`_reversa_sdd/addenda/004-prova-consultas.md#Vigência`) | A divergência de `AMB-001` fica visível no arquivo de prova e no `onboarding.md`, com a metade "constante tipada" marcada como **falsa hoje** | respeita |
| Citar em vez de reafirmar (`_reversa_sdd/addenda/008-prova-contrato-dados.md#Vigência`) | A verificação herdada de `PT-007.3` é **citada e mantida intocada**; nenhuma cláusula dela é reescrita aqui | respeita |
| A matriz é arquivo compartilhado (`_reversa_sdd/addenda/008-prova-contrato-dados.md#Vigência`) | A `code-spec-matrix.md` volta a ser relida do zero antes de qualquer edição, conforme a decisão `D-11` da 008 | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este plano não
> os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A prova vive num arquivo **novo**, `src/pages/__tests__/DashboardKpis.test.tsx` | O arquivo existente tem desenho deliberado para `PT-007.3`: dublês que devolvem conjunto vazio e componentes pesados anulados. Acrescentar massa lá contradiria aquela decisão e faria um arquivo medir duas promessas com instrumentos diferentes | a) estender o arquivo existente — mistura instrumentos; b) um arquivo por cenário — cinco arquivos para uma página, com o mesmo arranjo repetido cinco vezes | 🟢 |
| D-02 | O dublê de consulta de dados **modela a cache por chave**: executa a função de consulta **uma vez por chave** e devolve o mesmo objeto entre renderizações | Armadilha medida na feature 006: um dublê que executa a função a cada renderização conta renderizações, não pedidos, e produz contagem inflada. Aqui ele também inflaria as asserções de transporte de `RF-07`, que contam chamadas | a) devolver `data` fixo — mediria o dublê e nunca o transporte; b) executar sempre — contagem inflada; c) usar a biblioteca real de consulta — exigiria provedor e rede | 🟢 |
| D-03 | `toSessionUser` e `resolveScope` correm **de verdade**; substituem-se apenas `base44.auth.me` e os quatro transportes de entidade | `RF-08` mede a declaração de escopo. Substituir `resolveScope` faria a asserção comparar o dublê consigo mesmo — exatamente a armadilha da feature 005, em que a asserção sobre um controle mediu o dublê do controle | a) dublar `resolveScope` — mais simples e sem valor de prova; b) dublar `toSessionUser` — idem | 🟢 |
| D-04 | O valor de cada cartão é lido por um auxiliar local que **ancora no título** e desce até o irmão de valor | A estrutura do cartão é `<p>título</p><p>valor</p>` no mesmo contêiner. O auxiliar deixa o acoplamento explícito num único lugar em vez de espalhado pelas dez verificações | a) procurar o número pelo texto — ambíguo: dois cartões podem exibir o mesmo valor, que é justamente o que a massa mista provoca; b) índice fixo na lista de cartões — mediria a ordem de renderização, que o cenário não enuncia | 🟢 |
| D-05 | O componente do cartão é renderizado **de verdade**; apenas a busca de paciente e a aba de relatórios são substituídas por nada | O cartão é a superfície da promessa. Os outros dois são pesados, não participam de nenhum dos dez requisitos, e substituí-los mantém o custo marginal baixo | a) dublar o cartão — provaria o dublê, que é o objeto da medida; b) renderizar tudo — custo e ruído sem ganho de prova | 🟢 |
| D-06 | `PT-008.3` é provado pela **ausência**: enumeram-se os quatro títulos e afirma-se que nenhum é contador de consultas de hoje | Decisão `1a` da sessão de esclarecimentos. Os dois agregados de consulta são calculados e descartados — não há superfície onde medir o critério. O que existe e é medível é o conjunto de cartões; o descarte entra como achado declarado | a) citar a linha do código — não mede nada; b) exigir superfície na aplicação — mudaria o perímetro de prova para correção | 🟢 |
| D-07 | O quarto KPI e os limites de payload **entram**, o KPI por valor e os limites por argumento de transporte | Decisão `2a` da sessão de esclarecimentos. São regras declaradas (`BR-MIGRAR-029`, `BR-MIGRAR-033`) da mesma superfície. Deixá-las fora reproduziria o padrão que este esforço existe para eliminar: regra vigente e não medida | a) deixá-las fora — mantém a promessa sem prova; b) feature própria — uma rodada inteira para a mesma página e o mesmo arranjo | 🟢 |
| D-08 | A Taxa de Atendimento é provada pelo **comportamento**: valor exibido `94%` e ausência de tendência | Decisão `3a` da sessão de esclarecimentos. O valor exibido está correto; o que falta é a forma que a decisão pediu. Exigir a constante converteria prova em correção e mudaria o perímetro para a página | a) exigir a constante nomeada — correção, não prova; b) não registrar a divergência — o verde passaria a sugerir que a forma decidida existe | 🟢 |
| D-09 | A massa vive em `src/test/dashboardFixtures.ts`, com construtores por entidade e datas derivadas | Há três `paciente()` homônimos em três arquivos de massa diferentes. Importar qualquer um deles para o Dashboard seria arbitrário e produziria nomes ambíguos no arquivo de prova | a) reusar os construtores existentes — três homônimos, nenhum cobrindo as quatro entidades; b) massa literal dentro do teste — repetida em cada caso | 🟢 |
| D-10 | Datas "de hoje" derivam do relógio local, com deslocamento explícito em dias | Armadilha medida na feature 003: uma data no formato `AAAA-MM-DD` é interpretada em fuso universal enquanto os leitores de data são locais, e o resultado muda conforme o fuso da máquina | a) literal `AAAA-MM-DD` — o cenário passaria ou falharia conforme o fuso; b) carimbo de tempo fixo — envelhece e quebra sozinho | 🟢 |
| D-11 | `CF-01` a `CF-03` são medidos **por comando** no fechamento e não viram verificação | Decisão `4a` da sessão de esclarecimentos. O teto de duração é o tempo da própria suíte, e o perímetro é o estado do repositório: nenhuma verificação dentro da suíte pode afirmá-los | a) manter como cenários — critérios de aceitação que nenhum teste executa; b) remover — perderia duas restrições que a feature deve respeitar | 🟢 |
| D-12 | O teto de **90 segundos é revalidado**, e esta feature o move pouco | Linha de base: 74,83 s em 23 arquivos no fechamento da 008. O custo novo é um arquivo com massa sintética e dublês — os quatro transportes são promessas resolvidas, não rede | a) subir o teto — enfraqueceria o critério sem medição que o justifique | 🟢 |
| D-13 | A `_reversa_sdd/code-spec-matrix.md` é **relida do zero antes de cada edição** | Decisão `D-11` da feature 008, nascida de uma colisão real entre duas sessões escrevendo no mesmo arquivo. O risco é operacional, não técnico, e continua vivo | a) editar a partir da leitura anterior — sobrescreveria trabalho de outra sessão sem avisar | 🟢 |

## 4. Premissas

Nenhuma. A sessão de esclarecimentos de 2026-09-22 zerou os marcadores `[DÚVIDA]` do
`requirements.md`, e todas as quatro decisões estão registradas em `requirements.md#9. Esclarecimentos`.

### 4.1 O que a prova **não** alcança, e por quê

Declarado aqui para que o verde da suíte não sugira mais cobertura do que existe:

1. **O critério de `AMB-002` em si.** Os dois agregados que o calculariam são descartados no código
   (`src/pages/Dashboard.tsx:83-92`). Prova-se a ausência da superfície, não o critério.
2. **A forma decidida de `AMB-001`.** A decisão pediu constante nomeada; o código tem literal. A
   prova trava o **valor**, e a divergência fica registrada.
3. **O badge de tipo do agendamento e o nome do paciente** na lista de Próximos Agendamentos. São
   renderizados, mas nenhum dos cinco cenários de `PT-008` os enuncia. Ficam de fora para que a
   prova não afirme mais do que o cenário pede.
4. **A aba de Relatórios.** `ReportsView` é substituída por nada e nenhum requisito a alcança.
5. **A ordenação da lista.** Os cenários falam em "até 5 futuros não cancelados" e não enunciam
   critério de ordenação; a asserção mede pertinência e cardinalidade, não ordem.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `Dashboard` (AGG-Dashboard) | `_reversa_sdd/architecture.md#1. Visão Resumida`; `_reversa_sdd/migration/target_domain_model.md#AGG-Dashboard (contexto de leitura)` | **nenhuma** | A página é o **objeto** da prova. Nenhuma linha de `src/pages/Dashboard.tsx` muda |
| `StatsCard` | `_reversa_sdd/flowcharts/dashboard.md#1` | **nenhuma** | Renderizado de verdade, como superfície da medida |
| Contrato de leitura escopada | `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` | **nenhuma** | As quatro leituras são medidas nos argumentos; a assinatura permanece a do legado |
| Arnês de prova | *(não existe no legado)* | **componente-novo** | `src/pages/__tests__/DashboardKpis.test.tsx` e `src/test/dashboardFixtures.ts` |

### 5.1 Arquivos do legado tocados

**Nenhum arquivo de aplicação.** O delta é inteiramente aditivo e vive no perímetro de prova:

| Arquivo | Natureza | Estado |
|---------|----------|--------|
| `src/pages/__tests__/DashboardKpis.test.tsx` | Arquivo de prova (novo) | a criar |
| `src/test/dashboardFixtures.ts` | Massa de prova (novo) | a criar |
| `src/pages/__tests__/Dashboard.test.tsx` | Prova herdada de `PT-007.3` | **intocado** |
| `src/pages/Dashboard.tsx` | Objeto da prova | **intocado** |
| `src/api/contract.ts`, `src/api/scopedRead.ts`, `src/api/sessionScope.ts`, `src/lib/session.ts` | Contrato exercitado | **intocado** |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. A feature não cria, altera nem remove campo, coleção, índice ou
  migração. A massa de prova instancia as quatro entidades existentes em memória, e nada é
  persistido.
- Detalhe completo em: `_reversa_forward/009-prova-kpis-dashboard/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | — | Não há contrato externo afetado. A feature não cria endpoint, não altera payload e não muda o contrato do provedor: ela **mede** as chamadas que a página já faz ao contrato de leitura escopada, que permanece intacto |

O diretório `interfaces/` **não é criado**, conforme a regra do skill para features sem contrato
externo.

## 8. Plano de migração

Não aplicável — não há dado a migrar, schema a versionar nem comportamento a alternar. A feature
produz dois arquivos novos no perímetro de prova e nada em produção.

1. Criar a massa de prova com as quatro entidades e os auxiliares de data.
2. Criar o arquivo de prova com o dublê de consulta que modela a cache por chave.
3. Escrever as verificações na ordem dos requisitos, citando `PT-008.x` e `BR-MIGRAR-0xx` em cada uma.
4. Executar a suíte e medir `CF-01`, `CF-02` e `CF-03` no fechamento.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| `R-01` O teto de duração é sensível à carga da máquina — a 006 mediu 75,78 s calma e 122,57 s sob carga, para código idêntico | médio | alta | `CF-01` é medido e **registrado com a condição de medição**, como na 006. Um estouro sob carga é propriedade condicional, não falha da feature |
| `R-02` O auxiliar de leitura ancora na estrutura interna do cartão: se o cartão mudar de forma, a asserção quebra | baixo | média | Quebra de paridade **é** o que se quer detectar; o custo é um falso positivo quando a mudança for legítima. O acoplamento fica num único auxiliar, documentado |
| `R-03` O conteúdo das abas pode não estar montado quando a lista de Próximos Agendamentos é medida | alto | média | A aba inicial é a que contém a lista. Verificar na primeira execução se o conteúdo monta; se não montar, fixar a aba ativa explicitamente em vez de depender do padrão |
| `R-04` Massa casada por chave errada devolve o conjunto de uma leitura a outro cartão, e a verificação passa medindo outra coisa | alto | média | O dublê resolve por chave exata e a massa usa marcadores distintos por entidade; a verificação de `RF-07` confere os quatro pares de argumentos, o que denuncia troca de chave |
| `R-05` Um agendamento "futuro" construído com poucos minutos vira passado durante a execução | médio | média | Massa futura construída com folga em **dias**, nunca em minutos |
| `R-06` O jsdom não aplica a ocultação por CSS, e conteúdo inativo pode aparecer no DOM — armadilha medida na feature 006 | médio | média | Asserções de contagem **exata** (quatro cartões) e consultas ancoradas por título, em vez de buscas globais por papel |
| `R-07` O quarto cartão exibe zero quando a leitura devolve indefinido, e a verificação passaria por acidente | médio | baixa | Dois casos: conjunto não vazio **e** conjunto vazio, cada um afirmando o valor esperado |
| `R-08` A verificação herdada de `PT-007.3` regride por causa de mudança de dublê compartilhada | alto | baixa | O arquivo herdado não é tocado; a massa nova não é importada por ele. `git status` sobre ele em `CF-02` |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `RF-01` a `RF-10` com verificação verde, cada uma citando `PT-008.x` ou `BR-MIGRAR-0xx`
- [ ] A verificação herdada de `PT-007.3` continua verde e **sem reescrita**
- [ ] `CF-01` medido e registrado com a condição de medição (teto de 90 s)
- [ ] `CF-02` medido: `git status` vazio sobre `src/pages/Dashboard.tsx`, `src/api`, `src/types` e `src/lib`
- [ ] `CF-03` medido: guarda de encoding limpa, com contagem de arquivos maior que a anterior
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] `onboarding.md#7 Registro de execução` preenchido com a medição real
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
