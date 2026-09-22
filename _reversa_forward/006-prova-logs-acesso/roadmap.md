# Roadmap: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/006-prova-logs-acesso/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar a trilha de auditoria **onde cada promessa é observável**, e em três superfícies
distintas — o inverso da feature anterior. O módulo que grava (`AccessLogger`) é o coração:
é ali que se prova quais campos são escritos, que o endereço de rede é o literal
`'client-side'`, que a trilha só recebe inserção e que a gravação **falha aberta**. As telas
que disparam a gravação têm a sua própria promessa, e cada uma é provada onde ela vive: o
Dashboard grava ao montar, o detalhe do paciente e o detalhe da consulta gravam ao exibir. A
página de auditoria é provada no que ela de fato faz no cliente — pedir os 500 mais recentes,
filtrar em memória, contar por heurística — e **declarar** o que ela não faz: escopo, guarda
de papel e paginação. A RLS do servidor não é provável no cliente e entra como declaração,
com a mesma disciplina que a feature 004 aplicou ao default `agendada`. Nenhum arquivo de
aplicação é tocado.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi
registrado, e portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de
princípio vêm do legado e dos adendos vigentes:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A prova substitui o transporte e nunca escreve em `base44/entities/` | respeita |
| Paridade de comportamento observável (`_reversa_sdd/addenda/001-migracao-typescript.md#Vigência`) | Nenhum arquivo de aplicação é alterado; AMB-004 permanece congelado | respeita |
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | Os seis achados do módulo entram como veredito, com ou sem prova, e nenhum é consertado | respeita |
| Veredito verde exige ressalva visível (`_reversa_sdd/addenda/004-prova-consultas.md#Vigência`) | Aplicado a `PT-007.2`, cuja metade servidor é declarada, e a `PT-007.4`, cujo teto de 500 é paridade congelada | respeita |
| Provar ausência exige asserção positiva (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | Aplicado à falha aberta e à ausência de escrita além de `create`: a verificação conta o que **aconteceu** antes de afirmar o que não aconteceu | respeita |
| O defeito provado trava a paridade (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | Aplicado aos dois modos de perda silenciosa: as asserções os fixam, e corrigi-los exigirá mudar a prova de propósito | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este
> plano não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | **Um arquivo de prova por superfície**, e a feature é **paralelizável** — o inverso da 005 | Os quatro cenários de `PT-007` não vivem em um componente: o logger, a página, o Dashboard, o detalhe do paciente, o detalhe da consulta e a navegação são seis arquivos distintos. O que a 005 pagou em serialidade por ter uma só superfície, esta cobra em paralelismo | a) um arquivo único para o módulo — misturaria seis arranjos de dublê e esconderia qual promessa caiu; b) provar tudo pela página — a página não grava nada, quem grava é o logger | 🟢 |
| D-02 | A auditoria é provada **no transporte**, com o módulo `AccessLogger` correndo de verdade e o dublê em `base44.entities.AccessLog` | Mesma decisão D-02 da feature 004, e pela mesma razão: dublar `logAccess` mediria a substituição, não o sistema. É a diferença entre provar a ligação e provar um dublê | a) substituir `logAccess` e afirmar as chamadas — mede o dublê; b) ler o módulo e declarar — leitura não é prova | 🟢 |
| D-03 | A metade **servidor** de `PT-007.2` é **declarada**, e o `RF-09` prova o que é do cliente: que a leitura é pedida sem escopo declarado e que `asUser` e `asAdmin` devolvem o **mesmo** repositório | A RLS é aplicada fora do cliente. Afirmar a imutabilidade por execução daria aparência de cobertura a comportamento de servidor — o erro que a feature 004 recusou com o default `agendada` (D-06 daquela feature) | a) um teste que lê `AccessLog.jsonc` e afirma `read: admin` — prova o conteúdo de um arquivo, não o comportamento do sistema; b) omitir a metade — o verde de `PT-007.2` sugeriria cobertura que não existe | 🟢 |
| D-04 | A alcançabilidade da tela por não-admin é provada **no `Layout`**, com usuário sem papel de admin, e não por leitura | Decisão `2a` da sessão de esclarecimentos. A nota da extração afirma que "somente admins veem a tela de auditoria"; provar que o item de navegação aparece para qualquer autenticado é o que torna a nota **demonstravelmente** imprecisa em vez de suspeita | a) declarar por leitura de `Layout.tsx` — a afirmação é justamente sobre o que o usuário vê, e ver exige renderizar; b) provar dentro da página de auditoria — a página não decide a navegação | 🟢 |
| D-05 | A gravação que **falha aberta** é provada nos **dois** caminhos — identificação recusada e usuário vazio — e o defeito é declarado, **não corrigido** | Decisão `3a`. Provar os dois caminhos importa porque eles são diferentes no código: a recusa cai no `catch`, o usuário vazio cai no `return` antecipado. E a asserção tem de ser positiva: contar as gravações que **não** aconteceram depois de afirmar que a operação principal seguiu | a) corrigir — muda comportamento observável e é decisão de produto; b) declarar sem provar — é o modo de falha mais grave do módulo, e foi por falta de medição que ele passou despercebido; c) provar só o caminho da recusa — deixaria o `return` antecipado sem veredito | 🟢 |
| D-06 | O trio de ações órfãs (`logout`, `create_prescription`, `export_data`) entra como **declaração na matriz**, sem arquivo de prova | Decisão `1a`. A orfandade é propriedade **estática** do código: prová-la exigiria ler arquivos-fonte em vez de medir comportamento, que é o instrumento que a feature 004 recusou. O que **é** provável entra: o catálogo tem exatamente doze ações e o conjunto iguala o enum do schema (`RF-15`) | a) provar por varredura de arquivos — prova o conteúdo de um arquivo, não o comportamento; b) omitir o trio — o achado que a 004 declarou sumiria do veredito do módulo | 🟢 |
| D-07 | A duplicação do registro por nova identidade do objeto é provada nos **dois** efeitos que a apresentam | Decisão `4a`, ampliada pela investigação: o detalhe do paciente usa `[patient, patientId]` e o detalhe da consulta usa `[consultation, patient, consultationId]` — **dois** objetos nas dependências. O achado é sistêmico, não local, e provar só um lado o descreveria como defeito de uma tela | a) provar só o detalhe do paciente, como o `RF-20` enunciava — deixaria a consulta sem veredito sobre o mesmo defeito; b) declarar por leitura — é exatamente o que o `RN-07` fazia sem prova, e a varredura do clarify apontou o furo | 🟢 |
| D-08 | O relógio é congelado **apenas no `Date`**, com temporizadores reais (`vi.useFakeTimers({ toFake: ['Date'] })`) | Padrão firmado nas features 004 e 005. Os recortes de data da página decidem pelo valor de hoje, e temporizadores falsos conflitam com as esperas assíncronas de interface — o conflito que a feature 003 encontrou | a) congelar tudo — já falhou uma vez; b) derivar do relógio real — deixa o recorte sensível à virada da meia-noite | 🟡 |
| D-09 | O recorte de data **sem teto** é provado com um registro desenhado no **futuro** | Decisão `1a` e `RN-10`. O recorte de semana compara `>= hoje − 7 dias` e o de mês `>= hoje − 1 mês`, sem limite superior. Um registro futuro entrando nos dois é a afirmação mais direta possível, e é a mesma forma do defeito que a feature 004 provou em consultas | a) afirmar o intervalo em vez do comportamento — prova a expressão, não o que aparece na tela; b) declarar sem provar — a 004 já provou a forma; repetir a declaração sem medir não acrescenta | 🟢 |
| D-10 | Os quatro indicadores são provados com um **conjunto desenhado** para separar cada categoria, e a soma que não fecha é afirmada | `RF-16`. A heurística é por substring, então um conjunto mal desenhado não distingue `create_prescription` de uma edição. O conjunto precisa ter, ao mesmo tempo, uma ação de cada família (`view_`, `edit_`, `create_`, `delete_`), uma ação de receita e uma ação sem categoria (`login`) | a) usar o conjunto de qualquer verificação — não separaria as categorias e o indicador passaria por acerto; b) provar só a contagem total — é o que a página já mostra e não afirma a heurística | 🟢 |
| D-11 | O diretório `interfaces/` **não é criado** | A feature exercita o transporte de auditoria por dublê, mas não redefine contrato externo nenhum: a assinatura de `AccessLog.asUser().create`, o formato do registro e o tratamento de erro permanecem os do legado | a) documentar o contrato de auditoria — seria inventário de contrato inalterado, não delta | 🟢 |
| D-12 | O teto de **90 segundos** é revalidado ao final, e não renegociado | A suíte está em 67,42 s com 18 arquivos e a folga é de 22,58 s. Esta feature acrescenta **cinco** arquivos novos — quatro de verificação e a massa compartilhada — e toca **dois** existentes, com uma tela densa entre eles: a folga será medida, não presumida | a) subir o teto preventivamente — enfraqueceria o requisito sem medição que o justifique | 🟢 |
| D-13 | Toda citação de `BR-L` carrega o **artefato qualificado**, e a colisão entra como lacuna documental declarada | `logs-acesso/requirements.md#2` e `code-analysis.md#6` usam `BR-L01`/`BR-L02`/`BR-L03` para regras **disjuntas**. É a **quarta** família com esse defeito — depois de `BR-A0x`, `BR-C` e `BR-T` — e a única em que os dois artefatos descrevem o **mesmo** módulo | a) citar `BR-L01` sem qualificar — ambíguo por construção; b) renumerar na extração — fora do escopo do ciclo forward | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as quatro
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-22 e estão
registradas em `_reversa_forward/006-prova-logs-acesso/requirements.md#9. Esclarecimentos`.

### 4.1 O que a prova **não** alcança, e por quê

Três coisas ficam fora por impossibilidade, não por escolha, e precisam estar ditas para que
os vereditos verdes não sejam lidos além do que afirmam:

1. **A RLS.** A imutabilidade da trilha e a restrição de leitura a admin são aplicadas pelo
   servidor. O cliente prova que só insere e que não declara escopo; o resto é declaração.
2. **O endereço de rede real.** `ip_address` é gravado como o literal `'client-side'` porque
   o navegador não tem acesso ao endereço do cliente. A prova afirma o literal — que é a
   promessa de `PT-007.1` — e não afirma nada sobre IP real, que não existe no cliente.
3. **A exportação.** O `code-analysis.md#9` registra "sem exportação real" (Média): o ícone
   de download é decorativo e `export_data` nunca é logado. Provável seria provar que o botão
   não exporta — o que confirmaria uma ausência, não uma promessa. Fica declarado.

### 4.2 Uma redação imprecisa da extração, registrada em vez de silenciada

A nota de `code-analysis.md#5.1` afirma que "somente admins veem a tela de auditoria;
tentativa de usuário comum retornará vazio/negado". A segunda metade está certa; a primeira
**não**: o item de navegação é incondicional (`Layout.tsx:48`) e nenhuma guarda intercepta o
caminho. O `RF-10` prova a alcançabilidade e a matriz declara a divergência. O texto da
extração não é reescrito — a correção vive no adendo do `/reversa-sync`.

## 5. Delta arquitetural

Componentes do legado que mudam. O restante da arquitetura descrita em
`_reversa_sdd/architecture.md` permanece intocado.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de prova do módulo de auditoria | `_reversa_sdd/inventory.md#Cobertura de testes` | `componente-novo` | Quatro arquivos de verificação novos — o logger, a página, o Dashboard e a navegação — mais a massa compartilhada. O módulo não tinha prova nenhuma, apesar de ser a garantia de conformidade que o sistema anuncia no cabeçalho |
| Prova de telas que já tinham arquivo de teste | `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste` | `regra-alterada` | `PatientDetail.test.tsx` e `Consultation.test.tsx` ganham as verificações de visualização auditada. É a **primeira** vez no ciclo forward que um arquivo de prova pré-existente é modificado |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do grupo 06` | `regra-alterada` | Ganha a seção equivalente para o grupo `07`, com veredito por cenário, os dois modos de perda silenciosa, o trio órfão declarado e a colisão de `BR-L` |
| `_reversa_sdd/code-spec-matrix.md` | `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo "Logs de acesso (07)" deixa de estar endereçado a uma feature a criar e passa a ter prova. O saldo dos módulos restantes cai de **19 para 15** |
| `_reversa_sdd/code-analysis.md#5.1` (módulo logs-acesso) | `_reversa_sdd/code-analysis.md#5.1 Entidade AccessLog (Base44 Schema)` | `regra-alterada` | A nota "somente admins veem a tela de auditoria" é **imprecisa**: a tela é alcançável por qualquer autenticado. O texto não é reescrito; a correção vive no adendo |
| `_reversa_sdd/code-analysis.md#9` (módulo logs-acesso) | `_reversa_sdd/code-analysis.md#9 Pontos de Atenção / Lacunas` | `regra-alterada` | As seis lacunas ganham veredito: três passam a ter comportamento provado, uma está resolvida para este módulo e duas permanecem declaradas |
| `_reversa_sdd/logs-acesso/requirements.md#2` | `_reversa_sdd/logs-acesso/requirements.md#2. Regras de Negócio (BRs)` | `regra-alterada` | Os identificadores `BR-L01` a `BR-L03` colidem com os de `code-analysis.md#6` do mesmo módulo. Toda citação precisa qualificar o artefato |
| `src/pages/AccessLogs.tsx` | `_reversa_sdd/code-analysis.md#3.1 Carregamento e Filtragem (AccessLogs.jsx)` | **sem mudança** | A página é o objeto da prova, não o alvo de uma correção. Registrado para que a ausência de mudança seja deliberada |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `src/test/auditFixtures.ts` | Arquivo novo |
| `src/components/medical/__tests__/AccessLogger.test.ts` | Arquivo novo |
| `src/pages/__tests__/AccessLogs.test.tsx` | Arquivo novo |
| `src/pages/__tests__/Dashboard.test.tsx` | Arquivo novo |
| `src/components/__tests__/Layout.test.tsx` | Arquivo novo |
| `src/pages/__tests__/PatientDetail.test.tsx` | **Modificado** — ganha as verificações de visualização auditada |
| `src/pages/__tests__/Consultation.test.tsx` | **Modificado** — idem, na visualização de consulta |
| `_reversa_sdd/code-spec-matrix.md` | Seção do grupo `07`, destino dos cenários e lacunas |
| `src/components/medical/AccessLogger.ts`, `src/pages/AccessLogs.tsx`, `src/Layout.tsx` | **Intocados** |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice, relação ou migração. O schema de `AccessLog` permanece como está, incluindo a RLS admin-only que a prova **declara** sem tocar.
- O único dado introduzido é **massa de prova fictícia**: registros de auditoria por categoria de ação, um registro com data futura, um com data antiga, um usuário de sessão sem papel de admin, e o dia congelado.
- Detalhe completo em: `_reversa_forward/006-prova-logs-acesso/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** O transporte de auditoria é
exercitado pela prova — para verificar **o que** é escrito, **quando** e **sob qual escopo** —
mas a assinatura de `base44.entities.AccessLog.asUser().create`, o formato do registro e o
tratamento de erro permanecem os do legado. O módulo continua engolindo a própria falha em
`console.error`, sem propagar.

Por essa razão, o diretório `interfaces/` **não é criado** (D-11), conforme a regra do
`/reversa-plan`.

## 8. Plano de migração

Não há migração de dados nem de contrato. A sequência abaixo é a ordem de execução:

1. Criar a massa de prova: registros por categoria, registro futuro, usuário sem papel de admin, o dia congelado e os derivadores de data (D-01, D-08).
2. Provar o **logger** — os campos escritos, o literal `'client-side'`, o agente do navegador, os campos de entidade ausentes, a inserção como única operação, a falha aberta nos dois caminhos e o contrato do enum (`RF-02`, `RF-03`, `RF-06`, `RF-07`, `RF-11`, `RF-15`, D-02, D-05, D-06).
3. Provar a **página** — o pedido com limite e ordenação, a ausência de paginação e de reconsulta, os três filtros, o recorte sem teto e a aritmética dos indicadores (`RF-12`, `RF-13`, `RF-14`, `RF-16`, `RF-19`, D-08, D-09, D-10).
4. Provar a página como **somente leitura** e sem escopo declarado (`RF-08`, `RF-09`, D-03).
5. Provar o **Dashboard** — exatamente um registro ao montar, com a ação e o detalhe do cenário (`RF-01`).
6. Provar a **navegação** — o item de auditoria existe para usuário sem papel de admin (`RF-10`, D-04).
7. Provar as **duas telas de detalhe** — a visualização auditada na paciente e na consulta, e a duplicação por nova identidade do objeto nas duas (`RF-04`, `RF-05`, `RF-20`, D-07).
8. Estender a matriz com o veredito do grupo `07`, o saldo 19 → 15, os dois modos de perda silenciosa, o trio órfão declarado e a colisão de `BR-L` (`RF-17`, D-06, D-13).
9. Revalidar os cinco gates, medir o tempo e convergir por adendo no `/reversa-sync` (`RF-21`, D-12).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** O Dashboard é uma tela densa — várias consultas, agregações e gráficos — e renderizá-lo para provar **um** registro de auditoria pode apertar o teto de 90 segundos | médio | média | A verificação do Dashboard afirma a gravação e nada mais; os dublês devolvem conjuntos vazios, para que a página não gaste tempo agregando. Se ainda pesar, o recuo é medir o tempo e registrar — não afrouxar a asserção |
| **R-02** O `Layout` monta menus suspensos Radix e o `useToast`, e nenhum teste do projeto o renderiza hoje — o arranjo de dublês é inédito | médio | média | D-04 exige provar no `Layout`. Os dublês seguem o padrão das páginas; se os menus suspensos estourarem o tempo no DOM simulado, o recorte é renderizar o `Layout` e afirmar apenas o **item de navegação**, sem abrir menu nenhum |
| **R-03** A prova da falha aberta passa por vacuidade: se o arranjo errar o caminho, **nada** é gravado e a verificação fica verde afirmando que nada foi gravado | alto | média | D-05 exige asserção positiva na mesma verificação: primeiro o caminho **feliz** grava exatamente uma vez, depois o caminho da falha não grava. Uma verificação que nunca chega a gravar falha na primeira metade |
| **R-04** "Nenhuma escrita além de `insert`" é uma afirmação de ausência, e passa mesmo quando o arranjo não exercita caminho nenhum | alto | média | A verificação conta as inserções **primeiro** e só então afirma que nenhuma alteração ou exclusão foi pedida, no mesmo arranjo que produziu as inserções |
| **R-05** A duplicação depende da identidade do objeto; sem controle explícito, a verificação mede o comportamento do React e não o do efeito | alto | média | D-07 controla a identidade no arranjo: o mesmo paciente, recarregado com um objeto novo, é o gatilho explícito da segunda gravação. E a verificação afirma a **contagem** antes e depois |
| **R-06** O conjunto desenhado para os indicadores pode não separar as categorias, e o indicador passaria por acerto | médio | média | D-10 exige uma ação de cada família (`view_`, `edit_`, `create_`, `delete_`), uma de receita e uma sem categoria. A verificação confere indicador por indicador **e** afirma a soma que não fecha |
| **R-07** O recorte sem teto depende do dia congelado: sem congelamento, a verificação fica sensível à virada da meia-noite | médio | baixa | D-08 congela só o `Date`, e o registro futuro é derivado do dia congelado |
| **R-08** Esta é a **primeira** feature do ciclo que modifica arquivos de prova pré-existentes (`PatientDetail.test.tsx` e `Consultation.test.tsx`), e uma edição descuidada pode quebrar prova de outra feature | alto | média | As verificações novas entram como blocos `describe` próprios, sem tocar nos blocos existentes. O gate completo roda ao final, e a contagem de verificações é conferida contra a medição anterior: 109 + as novas, sem queda |
| **R-09** A matriz pode divergir da suíte em silêncio | alto | média | O critério de pronto exige conferência da matriz contra a suíte antes de fechar, como nas features 002 a 005 |
| **R-10** A colisão de `BR-L` pode morder na redação da matriz: os identificadores são idênticos nos dois artefatos e descrevem regras disjuntas **do mesmo módulo** | médio | alta | D-13 exige artefato qualificado em toda citação, e a conferência final verifica que nenhum `BR-L` aparece sozinho |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature:

- [ ] Os 4 cenários de `PT-007` têm prova de execução (RF-01 a RF-05, RF-07, RF-08, RF-12, RF-13)
- [ ] O registro carrega `user_email`, o literal `'client-side'` e o agente do navegador (RF-02)
- [ ] Os campos de entidade chegam **ausentes** quando não há entidade (RF-03)
- [ ] A trilha recebe apenas inserção, com a contagem afirmada antes de negar as demais operações (RF-07, R-04)
- [ ] A página de auditoria é somente leitura (RF-08)
- [ ] A leitura é pedida **sem escopo declarado**, e `asUser`/`asAdmin` são o mesmo repositório (RF-09, D-03)
- [ ] A tela é provada **alcançável** por usuário sem papel de admin (RF-10, D-04)
- [ ] A falha aberta é provada nos **dois** caminhos, com o caminho feliz afirmado na mesma verificação (RF-11, D-05, R-03)
- [ ] O pedido de leitura usa `('-created_date', 500)` como argumentos exatos (RF-12)
- [ ] Nenhum controle de paginação existe, e mudar filtro não reconsulta (RF-13)
- [ ] Os três filtros afirmam o **conjunto exibido**, e não a chamada (RF-14)
- [ ] O catálogo tem 12 ações e iguala o enum do schema (RF-15)
- [ ] Os quatro indicadores são conferidos por categoria, e a soma que não fecha é afirmada (RF-16, D-10)
- [ ] Um registro **futuro** entra nos recortes de semana e de mês (RF-19, D-09)
- [ ] A duplicação por nova identidade é provada nas **duas** telas de detalhe (RF-20, D-07)
- [ ] A matriz cita todo `BR-L` com o artefato qualificado, e registra o trio órfão como declaração (RF-17, D-06, D-13)
- [ ] Os dois modos de perda silenciosa aparecem **provados e declarados** (RF-11, RF-20)
- [ ] Nenhum arquivo de aplicação foi alterado (RF-21)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)
- [ ] A contagem de verificações **cresceu** em relação às 109 medidas, sem queda (R-08)
- [ ] A suíte completa executa em menos de 90 segundos (RNF Desempenho, D-12)
- [ ] Existe adendo vigente ao final do ciclo (RF-17)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
