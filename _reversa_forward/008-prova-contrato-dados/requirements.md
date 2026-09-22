# Requirements: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Provar os 4 cenários de `PT-010` — o contrato de acesso a dados — e fazê-lo com o instrumento
que o próprio contrato exige: o **gate de tipos**. Diferente das cinco rodadas anteriores, esta
não se prova renderizando tela nem medindo transporte: prova-se **recusando compilação**. O
gatilho é `npm run prova:negativos`, que escreve cada caso como um arquivo TypeScript, roda o
gate uma vez e confere que cada um foi recusado **pelo motivo certo** — e acrescenta os casos
que faltam para os cenários ainda descobertos: o tratamento explícito de papel (`PT-010.2`), a
integralidade dos adaptadores (`PT-010.3`) e os enums que o cenário nomeia e ninguém provou
(`PT-010.4`). A feature também declara os **dois buracos** do contrato: o compilador confere
forma, nunca autorização; e o ponto de ligação dos adaptadores é uma asserção que apaga a
verificação.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature` | Os 4 cenários de `PT-010`, todos de **compilação**: escopo de ownership exigido, papel explícito no tipo, SDK e mock sob a mesma interface, enums fechados | 🟢 |
| `src/api/contract.ts#L68-88` | `EntityRepository`: `list`/`filter` **sem escopo**, com aviso explícito de que entidades sob RLS usam a camada escopada | 🟢 |
| `src/api/contract.ts#L186-191` | `AdminScope` com a ressalva de que `kind: 'admin'` é **declaração**, não verificação — "o compilador confere a forma, nunca a autorização" (achado F-03) | 🟢 |
| `src/api/scopedRead.ts#L41-90` | `OwnedEntity` **não expõe** `list` nem `filter` crus: é o que faz "código que esquece o filtro de ownership não compilar" ser verdade | 🟢 |
| `src/api/scopedRead.ts#L118-157` | `applyScope` ramifica em `scope.kind === 'admin'`, mas `filterOwned` só aceita `UserScope` — o ramo é inalcançável **pelo tipo**, e alcançável por dentro | 🟢 |
| `src/api/registry.ts#L120-155` | `AppEntities` com as cinco entidades sob RLS como `OwnedEntity` e as demais como leitura aberta; `createAppDataClient` é o ponto que materializa o cenário "SDK e mock implementam a mesma interface" | 🟢 |
| `src/api/entities.ts#L16-71` | `createEntityRepository` com os tipos de **domínio** explícitos — é a chamada que verifica a conformidade do adaptador. **Os retornos do adaptador são convertidos por `as`** | 🟢 |
| `src/api/entities.ts#L122-144` | `bindAdapter` faz `as unknown as Parameters<...>` no ponto de ligação, com a justificativa de variância de contravariância registrada no comentário | 🟢 |
| `src/types/User.ts#L22-56` | `AuthenticatedUser` com `role?: UserRole` e `OfflineUser` com `role?: never` — a ausência é **estrutural**, e é o discriminante da variante (achado F-01) | 🟢 |
| `src/lib/session.ts` e `src/api/sessionScope.ts` | O estreitamento para `User` acontece na camada de sessão, onde o modo é conhecido; `asUserScope`, `resolveScope` e `isAdminScope` derivam o escopo | 🟢 |
| `src/test/verificacoes-negativas.mjs` | O arnês de prova: **9 casos** declarados com a violação, o motivo esperado e a fonte; roda o gate, confere caso a caso, limpa e prova a ausência de resíduo | 🟢 |
| `_reversa_sdd/code-analysis.md#10 Modo Offline (Mock Local)` | O recorte offline, com as limitações L1 a L7 do adaptador — referência para o que este contrato cobre e o que não | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | A guarda de encoding (`mojibake`) e o gate de tipos entram como prova **sem dono** no ciclo forward | 🟢 |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | A feature que **criou** esta camada: o escopo declarado por tipo entrou ali, e a 001 é a origem dos casos negativos T031–T046 | 🟢 |

> **Nota de leitura.** Os dois artefatos de regras do projeto que mais se aproximam deste tema
> citam identificadores que **colidem** entre si — `BR-MIGRAR-0xx` (dos tipos e do contrato) e
> `BR-OFF0x` (do modo offline). Toda citação nesta feature qualifica o artefato de origem.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor do sistema novo | Não conseguir escrever uma leitura de dado clínico sem declarar o escopo | Escreve `pacientes.list()` e o gate de tipos recusa antes de qualquer execução |
| Desenvolvedor do sistema novo | Não conseguir usar permissão de admin sem tratar a variante offline | Escreve `usuario.role === 'admin'` sobre o usuário offline e o gate recusa |
| Revisor de conformidade | Saber o que o contrato garante e o que ele apenas declara | Confronta a promessa de `PT-010.1` com a nota de F-03, que diz que o compilador não valida autorização |
| Mantenedor dos adaptadores | Não conseguir acrescentar um adaptador incompleto | Omite um gateway em um adaptador de prova e o gate recusa |
| Responsável pela qualidade | Saber quais provas têm contrato e quais não têm | Encontra a guarda de encoding entre as provas sem `actions.md` |

## 4. Regras de negócio novas ou alteradas

Nenhuma regra de produto nova. As regras abaixo são **contratos de prova e declarações** — a
feature não altera tipo, contrato nem comportamento.

1. **RN-01:** A prova do contrato é de **compilação**. O instrumento é o gate de tipos, e o
   comando que o reproduz é `npm run prova:negativos` — não a suíte de unidade.
   - Origem no legado: `src/test/verificacoes-negativas.mjs`; decisão D-02 da feature 002
   - Tipo: nova (o instrumento desta feature é outro)
2. **RN-02:** Cada caso negativo declara a **violação que representa** e o **motivo pelo qual a
   recusa é a recusa certa** — um trecho que a mensagem do gate precisa citar, ou o código do
   erro. Recusa pelo motivo errado é falha, não aprovação.
   - Origem no legado: `verificacoes-negativas.mjs` (campos `violacao`, `espera` e `codigo`)
   - Tipo: nova (contrato de prova)
   - O comando passa a distinguir **dois tipos de caso**: o que **deve ser recusado** e o que **deve compilar**. É essa distinção que permite medir um buraco do contrato em vez de apenas declará-lo (decisão `Q5` · `5a`)
3. **RN-03:** O contrato garante a **forma**, nunca a **autorização**. `kind: 'admin'` é uma
   declaração de quem chama, e código que a faz indevidamente continua compilando.
   - Origem no legado: `contract.ts:181-184` e `scopedRead.ts:30-32` (achado **F-03**)
   - Tipo: alterada (declaração do limite, que a feature torna explícita na matriz)
4. **RN-04:** A variante offline do usuário tem `role` **estruturalmente ausente**, e é isso que
   obriga o tratamento explícito do caso offline em vez de compilar cego. Não é detecção de RBAC.
   - Origem no legado: `User.ts:32-56` (achado **F-01**)
   - Tipo: alterada (mesma natureza da RN-03)
5. **RN-05:** A verificação de conformidade dos adaptadores é **entidade por entidade**, em
   `createEntityRepository`, com os tipos vindos do domínio. Os **retornos** do adaptador são
   convertidos por `as`, de modo que a cláusula "as operações do mock têm os mesmos tipos de
   retorno que o SDK" **não é verificada pelo tipo**.
   - Origem no legado: `entities.ts:53-71`
   - Tipo: nova (o limite da verificação nunca foi declarado)
6. **RN-06:** O ponto de ligação dos adaptadores ao registry é uma **asserção** que apaga a
   verificação (`as unknown as Parameters<...>`), justificada por contravariância no próprio
   código. O cenário `PT-010.3` vale **até esse ponto**, e não além dele.
   - Origem no legado: `entities.ts:122-144`
   - Tipo: nova (idem)
7. **RN-07:** O ramo administrativo de `applyScope` é **inalcançável pelo tipo** a partir de
   `filterOwned`, que só aceita `UserScope`. O caso negativo `escopo-admin-em-metodo-de-dono`
   prova que o tipo faz o trabalho; o ramo permanece como defesa de runtime.
   - Origem no legado: `scopedRead.ts:118-157`
   - Tipo: nova
8. **RN-08:** A guarda de codificação (`mojibake`) era uma prova **sem promessa**: existia, passava, e nenhum `actions.md` a reivindicava. A decisão `Q3` · `3a` **adota a guarda nesta feature**: ela passa a ter dono no `actions.md`, e a matriz deixa de listá-la como prova sem dono.
   - Origem no legado: `src/test/mojibake.mjs` e `code-spec-matrix.md#Lacunas de prova`
   - Tipo: alterada (a guarda deixa de ser órfã)
9. **RN-09:** O comando admite **casos positivos** — os que devem **compilar** —, e é essa capacidade que permite **medir** o buraco de `F-03`: um escopo administrativo declarado por quem não é administrador compila, e o comando passa a afirmar isso em vez de apenas registrar a ressalva.
   - Origem no legado: `contract.ts:181-184`; `verificacoes-negativas.mjs`
   - Tipo: nova (capacidade nova do arnês, decisão `Q5` · `5a`)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Provar `PT-010.1` pela **citação** dos casos que já o cobrem, sem duplicá-los | Must | O caso `leitura-sem-escopo` (leitura escopada sem informar o escopo) e o caso `escopo-admin-em-metodo-de-dono` continuam sendo a prova, citados pelo identificador | 🟢 |
| RF-02 | Provar que a entidade sob RLS **não expõe** leitura crua | Must | Um caso novo recusa `pacientes.list()` sobre `OwnedEntity<Patient>`, citando o nome do método ausente | 🟢 |
| RF-03 | Provar `PT-010.2`: o papel é explícito no tipo | Must | Um caso novo recusa atribuir `role` a `OfflineUser`, citando a propriedade | 🟢 |
| RF-04 | Provar que a **ausência** de papel não passa por comparação cega | Must | Um caso novo recusa comparar `role` com `'admin'` sobre a variante offline — a ausência é estrutural, e a comparação é recusada | 🟢 |
| RF-05 | Provar `PT-010.3` no que é verificável: um adaptador **incompleto** é recusado | Must | Um caso novo declara um adaptador sem um dos gateways exigidos e o gate recusa, citando a propriedade ausente | 🟢 |
| RF-06 | Provar `PT-010.4` para os enums que o cenário nomeia e ninguém provou | Must | Casos novos para o status de agendamento e para os tipos documentais, recusando valor fora do conjunto | 🟢 |
| RF-07 | Provar que o **contrato tem dentes** no que ele promete | Must | Uma tabela em `onboarding.md` lista, caso a caso, qual cenário de `PT-010` cada caso do gate cobre — e qual cláusula **não** é coberta | 🟢 |
| RF-08 | Declarar o limite do compilador (**RN-03**, F-03) | Must | A matriz registra que o contrato garante forma, nunca autorização, e cita `contract.ts` e `scopedRead.ts` | 🟢 |
| RF-09 | Declarar o limite dos retornos dos adaptadores (**RN-05**) | Must | A matriz registra que a cláusula de "mesmos tipos de retorno" não é verificada, citando `entities.ts` | 🟢 |
| RF-10 | Declarar o limite do ponto de ligação (**RN-06**) | Must | A matriz registra a asserção de `bindAdapter` e o alcance real de `PT-010.3` | 🟢 |
| RF-11 | Registrar o ramo inalcançável de `applyScope` (**RN-07**) | Should | A matriz registra que `filterOwned` só aceita escopo de dono por tipo, e que o ramo administrativo é defesa de runtime | 🟢 |
| RF-12 | Dar dono à guarda de codificação, **adotando-a nesta feature** (decisão `Q3` · `3a`) | Must | As verificações da guarda passam a ser reivindicadas por um `actions.md`, e a matriz deixa de listá-la como prova sem dono | 🟢 |
| RF-13 | Registrar na matriz o veredito dos 4 cenários de `PT-010` e o saldo dos grupos restantes | Must | `code-spec-matrix.md` recebe a seção do grupo `10`, com o saldo atualizado e cada cláusula não coberta declarada | 🟢 |
| RF-14 | Revalidar os comandos de gate e a integridade da árvore | Must | `npm test`, `npm run typecheck`, `npm run lint`, `npm run prova:negativos` e `npm run prova:encoding` passam; nenhum arquivo de aplicação é tocado | 🟢 |
| RF-15 | Provar o **buraco de `F-03`** com um caso **positivo** (decisão `Q5` · `5a`) | Must | O comando passa a distinguir casos que devem ser recusados dos que devem compilar; um caso declara escopo administrativo indevido e **compila**, provando que o contrato garante forma, nunca autorização | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Determinismo | O comando de provas negativas precisa deixar o repositório **exatamente** como estava | O arnês já executa o gate uma segunda vez depois da limpeza e falha se houver resíduo: é o passo que transforma "apaguei os arquivos" em prova | 🟢 |
| Desempenho | O comando de provas negativas roda o gate de tipos **duas** vezes por execução, e cada caso novo não pode dobrar esse custo | O gate é o passo caro; os casos são escritos de uma vez e verificados numa única passada | 🟢 |
| Isolamento | Os casos de prova **não** podem ficar versionados no projeto verificado | Um arquivo negativo permanente passaria a falhar de propósito no uso normal, e a razão de existir do gate é ser executável a qualquer momento | 🟢 |
| Rastreabilidade | Cada caso declara a violação que representa e o motivo pelo qual a recusa é a certa (`RN-02`) | Sem o motivo, uma recusa qualquer passaria por aprovação | 🟢 |
| Observabilidade | O que **não** é coberto fica declarado na matriz, e não escondido num verde | As três cláusulas não verificadas (autorização, retornos, ponto de ligação) são o conteúdo mais útil desta feature | 🟢 |
| Desempenho da suíte | O teto de 90 segundos da suíte de unidade não pode ser agravado | Esta feature quase não acrescenta arquivo de unidade; o custo é do gate de tipos, que é comando próprio. O teto medido no fecho da 006 foi de 75,78 s em máquina calma e 122,57 s sob carga | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Leitura de dado clínico sem declarar o escopo não compila
  Dado o contrato com as entidades sob RLS expostas sem leitura crua
  Quando o código chama a listagem diretamente sobre a entidade
  Então o gate de tipos recusa, citando o método ausente

Cenário: Escopo administrativo em leitura de dono não compila
  Dado um método de leitura que exige o escopo do dono
  Quando o código informa o escopo administrativo
  Então o gate de tipos recusa, citando o escopo incompatível

Cenário: Papel de usuário não pode ser atribuído à variante offline
  Dado o tipo do usuário offline, cuja ausência de papel é estrutural
  Quando o código tenta atribuir um papel a ele
  Então o gate de tipos recusa, citando a propriedade

Cenário: Comparação cega de papel não compila sobre a variante offline
  Dado o tipo do usuário offline
  Quando o código compara o papel com o valor de administrador
  Então o gate de tipos recusa a comparação

Cenário: Adaptador incompleto não compila
  Dado o contrato dos gateways que todo adaptador precisa oferecer
  Quando um adaptador de prova omite um deles
  Então o gate de tipos recusa, citando a propriedade ausente

Cenário: Valor fora do conjunto fechado de status não compila
  Dado o conjunto fechado de situações do agendamento
  Quando o código atribui um valor fora dele
  Então o gate de tipos recusa, citando o valor

Cenário: Valor fora do conjunto fechado de tipos documentais não compila
  Dado o conjunto fechado de tipos de documento
  Quando o código atribui um valor fora dele
  Então o gate de tipos recusa, citando o valor

Cenário: Cada caso declara o motivo pelo qual a recusa é a certa
  Dado um caso negativo com a violação e o motivo esperado
  Quando o gate recusa por um motivo DIFERENTE do declarado
  Então o comando acusa a falha, e não a aprovação

Cenário: O comando não deixa resíduo no repositório
  Dado o comando de provas negativas executado
  Quando os arquivos de prova são removidos
  Então o gate volta a zero erros
  E o comando confirma a ausência de resíduo

Cenário: Escopo administrativo indevido compila, e o comando mede isso
  Dado um caso POSITIVO, que declara escopo administrativo sem ser administrador
  Quando o gate de tipos roda sobre ele
  Então o caso é aprovado por NÃO produzir erro
  E fica medido que o contrato garante forma, e não autorização
  E que a defesa real é a regra de acesso do servidor

Cenário: Um caso positivo recusado pelo gate é falha do comando
  Dado um caso declarado como positivo, que deve compilar
  Quando o gate o recusa
  Então o comando acusa a falha, e não a aprovação
  E os casos negativos continuam sendo aprovados por serem recusados pelo motivo certo
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-06 | Must | São os quatro cenários de `PT-010` e o que falta para eles |
| RF-07 | Must | Uma tabela caso × cenário é o que impede a leitura de cobertura onde não há |
| RF-08, RF-09, RF-10 | Must | As três cláusulas **não verificadas** são o achado da feature: declaradas, valem mais que um verde falso |
| RF-13, RF-14 | Must | Convergência na matriz e gate |
| RF-11 | Should | Achado lateral real, mas não prometido por `PT-010` |
| RF-12, RF-15 | Must | Decisões `Q3` · `3a` e `Q5` · `5a`: a guarda ganha dono, e o buraco do `F-03` deixa de ser declaração e vira medida |
| RNF de desempenho do gate | Should | O gate é comando próprio; a suíte de unidade quase não muda |

## 9. Esclarecimentos

### Sessão 2026-09-22

Cinco perguntas apresentadas, cinco respondidas. As três primeiras vinham dos `[DÚVIDA]`
declarados; as duas últimas saíram da varredura — e a quinta encontrou uma capacidade que o
arnês de provas ainda **não tinha**.

- **Q:** Qual é o instrumento da prova — o comando de casos negativos, ou também uma comparação de comportamento dos adaptadores?
  **R:** `1a` — estender o comando de casos negativos e **citar** o `typecheck` para a cláusula positiva de `PT-010.3`. Sem prova de comportamento: o SDK real exigiria rede, e comparar o mock contra si mesmo não diria nada sobre o outro adaptador.
- **Q:** Os casos que já existem — citar ou reafirmar?
  **R:** `2a` — **citar** os existentes pelos identificadores e escrever casos novos só para as metades descobertas. Repetir o que já é provado criaria dois pontos de verdade para a mesma cláusula.
- **Q:** A guarda de codificação entra no escopo e ganha dono?
  **R:** `3a` — **entra**. É uma prova sem promessa, e esta é a feature de infraestrutura de gate: é onde adotá-la custa menos.
- **Q:** Quais conjuntos fechados entram no `PT-010.4`?
  **R:** `4a` — os que o cenário nomeia: a situação de **agendamento** e os tipos **documentais**. Ampliar para todos os conjuntos do domínio seria provar mais do que o cenário transferido pede.
- **Q:** Provar o buraco de `F-03` com um caso positivo, ou apenas declará-lo?
  **R:** `5a` — **provar**. O comando ganha a noção de caso **positivo** (deve compilar), e um caso declara escopo administrativo indevido e **compila**. O buraco deixa de ser declaração e vira medida — e o recurso serve às próximas features.

**Consequências no documento:** o `RN-02` passou a distinguir os dois tipos de caso; o `RN-08`
deixou de ser lacuna e virou adoção; o `RN-09` foi criado para a capacidade nova do arnês; o
`RF-12` subiu de Should para Must; o `RF-15` foi acrescentado; um cenário Gherkin foi reescrito
para **medir** em vez de registrar, e outro foi somado para a mecânica do comando; e a seção
`## 10` ficou sem lacunas em aberto.

## 10. Lacunas

n/a — **nenhuma lacuna em aberto.** As três dúvidas declaradas foram resolvidas na sessão de
2026-09-22, junto com as duas que a varredura encontrou (ver `## 9`).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-22 | Sessão de esclarecimentos (5 perguntas): instrumento é o gate com citação do `typecheck`; casos existentes são citados; a guarda de encoding é adotada e ganha dono; enums do cenário apenas; o buraco do `F-03` passa a ser medido com caso positivo. `RN-09` e `RF-15` criados, `RF-12` promovido a Must | `/reversa-clarify` |
