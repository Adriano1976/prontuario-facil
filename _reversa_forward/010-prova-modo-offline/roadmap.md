# Roadmap: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/010-prova-modo-offline/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar o modo offline em **duas frentes separadas**, porque a promessa tem duas naturezas. Uma parte
se mede **executando o adaptador**: semeadura, persistência, tolerância a conteúdo corrompido,
comparação de filtro, ordenação, mensagem de erro. Outra se mede **no carregamento do módulo**: qual
cliente o sistema exporta, e sob qual condição.

Por isso são **dois arquivos de prova**, e não um. A frente de ativação substitui o **ambiente de
construção** e descarta o **registro de módulos** para que a troca tenha efeito — o que é uma
intervenção global, e contaminaria a outra frente se as duas dividissem o arquivo. A frente do
adaptador mexe apenas no armazenamento local.

A metade negativa da ativação é a decisão de instrumento desta rodada: em vez de carregar o provedor
real — que constrói um cliente com os parâmetros da aplicação no carregamento e pode lançar por
motivo alheio à promessa —, substitui-se a **fábrica do provedor** e afirma-se que ela **foi
chamada**. É a única das saídas que mede o ramo sem depender de configuração.

Duas verificações de `PT-009` são **citadas**, não reescritas: a autenticação imediata, que a prova
herdada da feature 001 já cobre com o ambiente substituído, e a ausência estrutural de papel, que os
casos de compilação da feature 008 já recusam. Aplicação da decisão `2a` da feature 008.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum conflito a declarar. Os compromissos
que fazem as vezes de princípio vêm do legado e dos adendos vigentes:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | Nenhum arquivo de aplicação é tocado; o perímetro é o de prova | respeita |
| Provar o que dá, declarar o que não dá (`_reversa_sdd/addenda/005-prova-templates.md#Vigência`) | `L1`, `L3`, `L4`, `L5` e `L6` ganham verificação; `L2` e `L7` entram **declaradas**, com veredito registrado (decisão `1a`) | respeita |
| Citar em vez de reafirmar (`_reversa_sdd/addenda/008-prova-contrato-dados.md#Vigência`) | A autenticação imediata e a ausência de papel são **citadas** das features 001 e 008 | respeita |
| Veredito verde exige ressalva visível (`_reversa_sdd/addenda/004-prova-consultas.md#Vigência`) | Os quatro achados da coleta — inclusive `OFFLINE_USER` duplicado — ficam registrados sem correção | respeita |
| Nenhum arquivo de aplicação no diff (`_reversa_sdd/addenda/009-prova-kpis-dashboard.md#Vigência`) | Mesma disciplina: o adaptador é o **objeto** da prova | respeita |
| A matriz é arquivo compartilhado (`_reversa_sdd/addenda/008-prova-contrato-dados.md#Vigência`) | A `code-spec-matrix.md` é relida do zero antes de cada edição | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A prova vive em **dois arquivos novos**: `src/api/__tests__/offlineActivation.test.ts` e `src/api/__tests__/mockClientOffline.test.ts` | A frente de ativação substitui o ambiente e descarta o registro de módulos — intervenção global, que contaminaria a frente do adaptador se as duas dividissem arquivo. Separadas, cada uma tem um arranjo só | a) um arquivo só — o descarte de módulos afetaria os vínculos da outra frente; b) estender `mockClient.test.ts` — violaria `RF-22`, que exige a prova herdada **sem reescrita** | 🟢 |
| D-02 | A metade negativa da ativação prova que a **fábrica do provedor foi chamada**, com a fábrica substituída | Decisão `3a` do clarify. Carregar o provedor real constrói um cliente com os parâmetros da aplicação; sem configuração isso pode lançar por motivo alheio à promessa, e uma verificação que falha pelo motivo errado é pior que uma ausente | a) construção real — frágil e dependente de configuração; b) identidade do módulo — não há referência clara para comparar; c) só a metade positiva — não mede nada | 🟢 |
| D-03 | A metade **positiva** afirma **comportamento do adaptador**, e não identidade de objeto | Com a variável ligada, o cliente exportado lê uma entidade e devolve o conjunto semeado do armazenamento local, **e** a fábrica do provedor não é chamada. Isso mede o ramo e o efeito, em vez de comparar referências | a) comparar o objeto exportado com `createMockClient()` — mede a identidade, que é detalhe de implementação | 🟢 |
| D-04 | O ambiente é trocado com substituição de variável e **descarte do registro de módulos**, antes de cada importação dinâmica | A variável é lida **no carregamento do módulo** (`base44Client.ts:21`), e sem descartar o registro a troca não tem efeito. O padrão já está provado na prova herdada da sessão, que faz exatamente isso | a) importar o módulo uma vez e trocar a variável depois — sem efeito, porque a leitura já aconteceu | 🟢 |
| D-05 | A semeadura é provada contra o **seed real**, não contra massa sintética | A promessa é "semeia a partir do seed". Uma massa própria provaria a massa. O seed é tipado contra as entidades do domínio desde a Onda 6, então ele é confiável como referência | a) massa sintética injetada — mediria a injeção; b) afirmar apenas que a coleção ficou não vazia — não prova a origem | 🟢 |
| D-06 | As verificações de criação, atualização, filtro, ordenação e exclusão usam um **nome de entidade sem seed** | O acesso é dinâmico: um nome fora do seed devolve repositório funcional e conjunto vazio, o que dá um ponto de partida determinístico sem tocar nos dados de demonstração | a) usar uma entidade real e limpar o armazenamento — funcionaria, mas acopla cada verificação ao conteúdo do seed | 🟢 |
| D-07 | A prova da **ausência de regra de acesso** grava um registro com dono alheio **direto no armazenamento**, e afirma que ele é visível e editável | É a forma mais forte da cláusula: não basta que o próprio registro seja visível — o de **outra origem** também é. O adaptador não filtra por dono em nenhum caminho | a) criar pelo adaptador e reler — provaria menos, porque o adaptador carimba o próprio dono | 🟢 |
| D-08 | A prova da **tolerância a conteúdo corrompido** usa uma entidade **semeada** | O desfecho da promessa é "cai para o seed": sem uma entidade com seed, o fallback devolveria vazio e a verificação não distinguiria tolerância de ausência | a) entidade sem seed — não distingue os dois desfechos | 🟢 |
| D-09 | A mensagem de erro é afirmada **por extenso**, com entidade e identificador | `BR-OFF07` promete a forma exata. Afirmar por expressão regular deixaria passar mudança de redação, que é o que a promessa fixa | a) afirmar que rejeita, sem a mensagem — metade da cláusula | 🟢 |
| D-10 | A criação afirma identificador **não vazio e único**, e não o formato de identificador universal | O adaptador usa o gerador do navegador quando existe e **cai para um identificador próprio** quando não existe. Afirmar o formato tornaria a verificação dependente do ambiente — e a regra promete o identificador, não o formato | a) afirmar o formato canônico — falharia no caminho de reserva, por motivo alheio à promessa | 🟢 |
| D-11 | A criação com identificador informado é um **caso que registra**, não um defeito a corrigir | Decisão `2a` do clarify. O comportamento é do legado e preservado; o que a redação da regra tem é uma promessa mais forte do que o código. O caso fixa o comportamento real, de modo que "consertá-lo" exija decisão explícita | a) corrigir a criação — mudaria comportamento observável e sairia do perímetro de prova; b) só documentar — um comentário volta a divergir | 🟢 |
| D-12 | As duas verificações por **citação** são apontadas, não reescritas | Decisão `2a` da feature 008: a autenticação imediata já é provada com ambiente substituído, e a ausência de papel já é provada por recusa de compilação. Reafirmar criaria dois pontos de verdade | a) reescrever as duas — duplicação com dois lugares para manter | 🟢 |
| D-13 | `CF-01` a `CF-03` são **medidos** no fechamento, e não viram verificação | Decisão `4a` da feature 009, aplicada aqui: o teto de duração é o tempo da própria suíte, e o perímetro é o estado do repositório | a) manter como cenários de aceitação — critérios que nenhum teste executa | 🟢 |
| D-14 | O teto de **90 segundos é revalidado com atenção**, e esta feature o move na direção errada | A suíte mediu 85,86 s e 87,43 s no fechamento da 009 — **cerca de 3 segundos de margem**. Esta feature acrescenta dois arquivos com dezenas de verificações, e a linha de base anterior era 74,83 s. O risco `R-01` é o mais provável da rodada | a) subir o teto — enfraqueceria o critério sem medição que o justifique; b) ignorar — o teto é critério de bloqueio herdado | 🟢 |
| D-15 | A `_reversa_sdd/code-spec-matrix.md` é **relida do zero antes de cada edição** | Decisão `D-11` da feature 008, nascida de colisão real entre sessões. O risco continua vivo e é operacional, não técnico | a) editar a partir da leitura anterior — sobrescreveria trabalho de outra sessão | 🟢 |
| D-16 | O diretório `interfaces/` **não é criado** | O adaptador não é contrato externo: ele é a implementação local do **mesmo** contrato que o provedor honra, e esse contrato já está descrito em `addenda/001-migracao-typescript.md`. Documentá-lo aqui seria inventário, não delta | a) criar um arquivo de contrato — duplicaria um contrato inalterado | 🟢 |

## 4. Premissas

Nenhuma. A sessão de esclarecimentos de 2026-09-22 zerou os marcadores `[DÚVIDA]`.

### 4.1 O que a prova **não** alcança, e por quê

1. **`L2` — escritas concorrentes entre abas.** O ambiente simulado tem **uma** aba. Um teste que
   fingisse duas mediria o fingimento, não a concorrência. Declarada com veredito (decisão `1a`).
2. **`L7` — dados de pacientes no armazenamento local.** É risco de **privacidade**, não
   comportamento. Afirmá-lo em asserção diria que expor dados de pacientes é o pretendido. O seed é
   fictício e não sai do navegador, mas o risco em dispositivo compartilhado permanece, com a
   recomendação de aviso visual registrada e **não implementada**.
3. **A metade negativa da ativação, no que ela tem de real.** A prova afirma que a **fábrica do
   provedor foi chamada** — não que o provedor real funciona. É o limite declarado da decisão `D-02`.
4. **A troca de modo em execução.** Não existe: a variável é lida na construção. A prova da metade
   negativa recarrega o módulo, que é o mais próximo disso.
5. **O conteúdo visual da aplicação em modo offline.** Nenhum cenário de `PT-009` descreve tela, e os
   16 cenários de paridade visual continuam transferidos para um harness próprio.
6. **O provedor real.** Nenhuma verificação desta feature fala com o servidor, e nenhuma depende de
   credencial.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Modo offline (contexto delimitado) | `_reversa_sdd/migration/target_architecture.md#BC-08` | **nenhuma** | O adaptador é o **objeto** da prova; nenhuma linha de `src/api/mockClient.ts` muda |
| Sessão offline | `_reversa_sdd/modo-offline/requirements.md#3.4` | **nenhuma** | `AuthContext` e o usuário de demonstração permanecem como estão |
| Contrato único de acesso a dados | `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` | **nenhuma** | Os dois adaptadores continuam honrando o mesmo contrato |
| Arnês de prova | *(não existe no legado)* | **componente-novo** | Os dois arquivos de prova novos |

### 5.1 Arquivos do legado tocados

**Nenhum arquivo de aplicação.** O delta é inteiramente aditivo:

| Arquivo | Natureza | Estado |
|---------|----------|--------|
| `src/api/__tests__/offlineActivation.test.ts` | Arquivo de prova da ativação (novo) | a criar |
| `src/api/__tests__/mockClientOffline.test.ts` | Arquivo de prova do adaptador (novo) | a criar |
| `src/api/__tests__/mockClient.test.ts` | Prova herdada da feature 001 | **intocado** |
| `src/lib/__tests__/AuthContext.test.tsx` | Prova herdada da sessão offline | **intocado** |
| `src/api/mockClient.ts`, `src/api/base44Client.ts`, `src/lib/AuthContext.tsx` | Objeto da prova | **intocado** |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. A feature não cria, altera nem remove campo, coleção, chave de
  armazenamento ou migração. Ela lê o seed e o armazenamento local, e nada é persistido fora do
  próprio ambiente de prova.
- Detalhe completo em: `_reversa_forward/010-prova-modo-offline/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | — | Não há contrato externo afetado. O adaptador não fala com a rede: ele é a implementação **local** do mesmo contrato que o provedor honra, e esse contrato não muda |

O diretório `interfaces/` **não é criado** (`D-16`).

## 8. Plano de migração

Não aplicável — não há dado a migrar, schema a versionar nem comportamento a alternar.

1. Criar o arquivo de prova do adaptador, com a limpeza do armazenamento entre verificações.
2. Provar semeadura e tolerância a conteúdo corrompido, contra o seed real.
3. Provar criação, atualização, rejeição, filtro, ordenação e exclusão, sobre entidade sem seed.
4. Provar a ausência de regra de acesso, o acesso dinâmico, os no-ops, o envio de arquivo e as recusas.
5. Criar o arquivo de prova da ativação, com a fábrica do provedor substituída e o registro de
   módulos descartado.
6. Medir `CF-01`, `CF-02` e `CF-03` no fechamento, com a condição de medição.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| `R-01` O teto de 90 s é estourado — a margem medida no fechamento da 009 foi de cerca de 3 s, e esta feature acrescenta dois arquivos | alto | **alta** | Medir **antes** de escrever a documentação de fecho, duas vezes, e registrar a condição. Se estourar, o achado é do teto, não da feature: a 006 já mediu 122,57 s sob carga para código idêntico |
| `R-02` O descarte do registro de módulos afeta vínculos já importados no mesmo arquivo | médio | média | Arranjos em arquivos separados (`D-01`), e as importações do módulo em prova são dinâmicas e locais à verificação |
| `R-03` A fábrica substituída do provedor não devolve a forma que o encaixe espera, e o carregamento falha por motivo alheio à promessa | alto | média | O substituto espelha os quatro gateways que o adaptador real consome — entidades, sessão, integrações e registro de aplicação —, e a primeira execução confirma o encaixe |
| `R-04` Estado remanescente no armazenamento faz uma verificação passar por acidente | médio | alta | Limpeza no `beforeEach` **e** afirmação do estado de partida em cada verificação que dependa dele |
| `R-05` Afirmar o conjunto semeado por igualdade profunda acopla a prova ao conteúdo do seed | baixo | média | Afirmar os **identificadores** do seed, e não o objeto inteiro: o conteúdo pode ganhar campos sem que a promessa mude |
| `R-06` O identificador gerado depende do gerador do navegador, que pode não existir no ambiente simulado | médio | média | Afirmar identificador não vazio e distinto entre duas criações (`D-10`), nunca o formato |
| `R-07` A leitura de arquivo é assíncrona e a verificação mede antes de o conteúdo chegar | médio | média | Aguardar a promessa do envio, e não o evento |
| `R-08` A prova herdada regride por causa de arranjo compartilhado | alto | baixa | Os dois arquivos herdados não são tocados e não importam nada de novo. `CF-02` confere o estado do repositório |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `RF-01` a `RF-22` com veredito: verificação, citação ou inspeção — todas nomeadas
- [ ] As quatro provas herdadas continuam verdes e **sem reescrita**
- [ ] `CF-01` medido **duas vezes** e registrado com a condição de medição
- [ ] `CF-02` medido: estado do repositório vazio sobre o adaptador, a sessão, o provedor e as provas herdadas
- [ ] `CF-03` medido: guarda de encoding limpa, com contagem maior que a anterior
- [ ] O veredito de cada limitação `L1` a `L7` registrado no artefato de prova
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] `onboarding.md#7 Registro de execução` preenchido com a medição real
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
