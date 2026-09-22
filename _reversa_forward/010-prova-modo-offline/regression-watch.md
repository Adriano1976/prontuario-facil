# Regression Watch: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Este arquivo é preenchido pelo `/reversa-coding` e lido pelo `/reversa-sync` e por futuras
> re-extrações. Os itens abaixo precisam continuar verdadeiros.

## Watch principal

Regras 🟢 do legado que passam a ser **vigiadas** por esta feature. Uma violação de qualquer uma
delas é uma regressão de paridade, e a suíte acusa.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `parity_tests/09-modo-offline.feature` `PT-009.1`; `BR-OFF01`, `BR-OFF02`; `base44Client.ts:21` | O modo offline é ativado **exclusivamente** por variável de ambiente em tempo de construção; com ela ligada o cliente exportado é o do adaptador local, e sem ela a fábrica do provedor é consultada | presença | O modo passa a ter alternância em execução, ou o ramo deixa de ser decidido pela variável |
| W002 | `PT-009.2`; `BR-OFF03` | Com o modo ativo, a sessão entra direto como o usuário de demonstração, **sem** consultar o servidor | presença — **citado** | A sessão passa a chamar o servidor, ou o usuário deixa de ser o de demonstração |
| W003 | `PT-009.3`; `BR-OFF04`; `code-analysis.md#10.4` | Cada entidade tem coleção própria sob a chave `mock_db_<Entidade>`; na primeira leitura a coleção é semeada a partir do seed, e conteúdo corrompido cai para o seed em silêncio | presença | A chave muda de prefixo, a semeadura deixa de acontecer, ou conteúdo corrompido passa a lançar |
| W004 | `PT-009.5`; `BR-OFF06` | A criação popula identificador, data de criação e a data do registro quando ausente | presença | Um dos três deixa de ser preenchido |
| W005 | `PT-009.5`; `BR-OFF07` | A atualização preserva o identificador original e mescla os campos, mantendo os não informados | presença | O identificador muda, ou campos não informados são apagados |
| W006 | `PT-009.5`; `BR-OFF07` | Atualizar identificador desconhecido rejeita com a mensagem `Not found: <entidade> <id>` | redação | A mensagem muda de forma, ou a operação passa a resolver |
| W007 | `PT-009.6`; `BR-OFF08` | O filtro casa **apenas** por igualdade estrita; operadores de intervalo e de conteúdo não têm efeito | presença | Um operador passa a ser interpretado |
| W008 | `PT-009.6`; `BR-OFF09` | A ordenação aceita **um** campo, ascendente ou descendente, e o limite corta **depois** de ordenar | presença | Múltiplos campos passam a ser aceitos, ou o corte passa a vir antes da ordenação |
| W009 | `BR-OFF11` | Encerrar sessão e redirecionar para autenticação não têm efeito no modo offline | presença | A operação passa a alterar o armazenamento ou a lançar |
| W010 | `BR-OFF12` | O registro de acesso à aplicação não tem efeito no modo offline | presença | A operação passa a gravar |
| W011 | `modo-offline/requirements.md#3.2` | O acesso a entidades é **dinâmico**: qualquer nome devolve repositório funcional, e um nome sem seed devolve conjunto vazio em vez de falhar | presença | O acesso a nome desconhecido passa a lançar |

> **`W002` é citado, e continua vigiado por outro arquivo.** A verificação vive em
> `src/lib/__tests__/AuthContext.test.tsx`, herdada da feature 005, e esta feature **não a
> reescreveu** (decisão `2a` da 008, aplicada pela terceira vez). O item entra neste watch porque a
> promessa é do mesmo módulo, e uma quebra dele precisa poder ser rastreada até a origem.

## Observações

Regras que eram 🟡 ou 🔴 na origem **não entram no watch principal** — elas não têm peso de
regressão. Ficam registradas para que a próxima re-extração saiba onde olhar.

| ID | Origem | O que é | Por que não vigia |
|----|--------|---------|-------------------|
| O001 | `BR-OFF10`; `code-analysis.md#10.5` (`L1`) | O adaptador **não** aplica regra de acesso: qualquer registro é visível e editável por qualquer sessão | A regra é 🟡 na origem e é **intencional** — não há correção a proteger. A consequência prática, essa sim, merece atenção: toda página que **assume** restrição de dono diverge em modo offline, e nada cobre essa divergência |
| O002 | `code-analysis.md#10.5` (`L2`) | Escritas concorrentes entre abas não têm proteção | 🟡 na origem, e **não exercitável** no ambiente simulado, que tem uma aba. Declarada por decisão `1a` |
| O003 | `code-analysis.md#10.5` (`L3`) | O envio de arquivo vira dado embutido em memória e **não** persiste | 🟡 na origem. A feature 010 **prova** o desfecho, mas a limitação é intencional e não-objetivo declarado — não há promessa a regredir |
| O004 | `code-analysis.md#10.5` (`L6`) | Não há leitura direta por identificador; o chamador usa filtro ou percorre a lista | 🟡 na origem, e provado por ausência. Um dia a operação pode ser acrescentada — e aí a falta deixa de ser promessa |
| O005 | `code-analysis.md#10.5` (`L7`); `questions.md#Q-14`; `gaps.md#G-04` | Dados de pacientes ficam no armazenamento local do navegador — risco em dispositivo compartilhado | Risco de **privacidade**, não comportamento. O seed é fictício, mas a recomendação de aviso visual foi registrada e **não implementada**. Se for implementada, muda comportamento observável e a prova muda de propósito |
| O006 | `BR-OFF06` × `mockClient.ts:116-121` | A regra promete que a criação **sempre** popula o identificador; o código deixa um identificador informado pelo chamador sobrepôr o gerado | Divergência entre a **redação** e o código. A feature 010 fixou o comportamento real em caso: quem "consertar" a criação verá a verificação falhar |
| O007 | `src/api/mockClient.ts:26` × `src/types/User.ts:81` | `OFFLINE_USER` existe **duas vezes**, e a cópia tipada — reexportada por `src/types/index.ts:42` — não tem nenhum consumidor | Defeito de duplicação, não regra de negócio. Mudar o valor num lugar não muda o outro |
| O008 | `base44Client.ts:21` × `AuthContext.tsx:130` | A variável de ativação é lida em **dois** módulos, com tempos diferentes: no carregamento do módulo e a cada verificação de estado | Arquitetura, não regra. A extração descreve um ponto de leitura só |
| O009 | `src/types/User.ts:22-30` | O discriminante `kind: 'authenticated'` do usuário autenticado não é consumido por ninguém, e o caminho offline **não** passa pela conversão de sessão | Arquitetura, não regra. O que o projeto estreita é `role`, e não `kind` |
| O010 | `modo-offline/requirements.md#8. Critérios de Aceite` | Os critérios de aceite da unit falam de **tela** ("o Dashboard carrega com os 5 pacientes e 4 agendamentos do seed", "a tela de login não aparece") | Não são asserções desta feature: nenhum cenário de `PT-009` descreve tela, e a lista de pacientes é superfície já provada pela feature 002. Permanecem sem medição própria |

## Histórico de re-extrações

| Data | Re-extração | Resultado |
|------|-------------|-----------|
| — | — | Ainda não houve re-extração após esta feature |

## Arquivadas

| ID | Motivo do arquivamento | Data |
|----|------------------------|------|
| — | — | — |

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial — 11 itens no watch principal e 10 observações | reversa |
