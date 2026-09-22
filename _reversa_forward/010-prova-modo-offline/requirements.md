# Requirements: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Converter os 6 cenários de fluxo de `PT-009` em prova automatizada. É o **último grupo de fluxo
transferido** pela feature 002: fechá-lo leva o placar a 39 de 39 cenários de fluxo e deixa no mapa
apenas os dois blocos que nunca foram trabalho de prova — o harness de paridade visual e a
administração de modelos.

O modo offline não é um módulo de domínio: é uma **alternativa de implantação** que troca o provedor
de dados por um adaptador sobre o armazenamento local. Por isso a prova tem duas naturezas
distintas. Uma parte se mede **executando o adaptador** — semeadura, persistência, comparação de
filtro, ordenação, mensagem de erro. Outra parte se mede **no carregamento do módulo** — qual cliente
o sistema exporta, e sob qual condição. A segunda é a que exige decisão de instrumento.

A coleta de contexto encontrou duas coisas que a extração não registra, e ambas entram como lacuna:
`OFFLINE_USER` existe **duas vezes** em `src/`, uma delas sem nenhum consumidor; e a variável de
ativação é lida em **dois módulos**, com tempos diferentes.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/migration/parity_tests/09-modo-offline.feature` | Os 6 cenários de `PT-009` a converter | 🟢 |
| `_reversa_sdd/modo-offline/requirements.md#2. Regras de Negócio` | As doze regras `BR-OFF01` a `BR-OFF12` | 🟢 / 🟡 em `BR-OFF10` |
| `_reversa_sdd/modo-offline/requirements.md#3.2 Contrato entities.<X>` | O `Proxy` devolve repositório para **qualquer** nome, sem lançar | 🟢 |
| `_reversa_sdd/modo-offline/requirements.md#3.4 Usuário offline` | `OFFLINE_USER` sem papel, sem dono e sem `tenant_id` | 🟢 |
| `_reversa_sdd/modo-offline/requirements.md#6. Escopo de não-objetivos` | As sete exclusões declaradas do módulo | 🟢 |
| `_reversa_sdd/modo-offline/requirements.md#7. Pontos de Atenção` | `P1` a `P5`, com destaque para a postura de proteção de dados do seed | 🟡 |
| `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` | As sete limitações `L1` a `L7` do adaptador, com severidade | 🟡 |
| `_reversa_sdd/code-analysis.md#10.4 Persistência` | Chave, carga sob demanda, tolerância a JSON corrompido, sem TTL | 🟢 |
| `_reversa_sdd/questions.md#Q-13` | O modo é **permanente**, para desenvolvimento, QA e demonstração sem credenciais | 🟢 |
| `_reversa_sdd/questions.md#Q-14` | O seed é inteiramente fictício; o aviso visual foi recomendado e **não** implementado | 🟢 |
| `_reversa_sdd/questions.md#Q-15` | Cobertura parcial de operações é aceitável, com degradação consciente | 🟢 |
| `_reversa_sdd/questions.md#Q-16` | O usuário fixo é aceitável; todos os logs offline levam o mesmo e-mail | 🟢 |
| `_reversa_sdd/migration/target_architecture.md#BC-08` | O modo offline como contexto delimitado do alvo | 🟢 |
| `_reversa_sdd/migration/interfaces/mock-local-storage.md` | O contrato do adaptador, e a nota de que ele **não** aplica regra de acesso | 🟢 |
| `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` | O contrato único é honrado pelos dois adaptadores | 🟢 |
| `_reversa_sdd/addenda/008-prova-contrato-dados.md#Vigência` | Os casos de compilação sobre a variante offline do usuário | 🟢 |
| `src/api/mockClient.ts` | O objeto da prova, **intocado** | 🟢 |
| `src/api/__tests__/mockClient.test.ts` | Prova herdada da feature 001: 3 verificações | 🟢 |
| `src/lib/__tests__/AuthContext.test.tsx` | Prova herdada: o caminho offline da sessão, com ambiente substituído | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor do projeto | Rodar a aplicação sem credencial e sem rede | `VITE_OFFLINE=true npm run dev` e usar o sistema inteiro |
| Avaliador ou stakeholder | Ver o produto com dados de demonstração | Abrir a aplicação e encontrar cinco pacientes já cadastrados |
| Mantenedor da suíte | Saber qual comportamento offline é promessa e qual é limitação | Ler o contrato em vez de descobrir em execução |

## 4. Regras de negócio novas ou alteradas

Esta feature é de **prova**: nenhuma regra é criada ou alterada. As regras abaixo são o **objeto** da
medição, e o tipo de todas é `preservada`.

1. **RN-01:** O modo offline é ativado exclusivamente por variável de ambiente em tempo de
   construção; não há alternância em execução. 🟢
   - Origem no legado: `_reversa_sdd/modo-offline/requirements.md#2` (BR-OFF01)
   - Tipo: preservada
2. **RN-02:** Quando ativo, o cliente exportado pelo módulo de acesso a dados é o do adaptador
   local, e **não** o do provedor. 🟢
   - Origem no legado: `BR-OFF02`; `_reversa_sdd/migration/target_architecture.md#BC-08`
   - Tipo: preservada
3. **RN-03:** Quando ativo, a sessão entra direto como o usuário de demonstração, sem consultar o
   servidor. 🟢
   - Origem no legado: `BR-OFF03`; `_reversa_sdd/questions.md#Q-16`
   - Tipo: preservada
4. **RN-04:** Cada entidade tem coleção própria no armazenamento local, sob a chave com prefixo; na
   primeira leitura a coleção é semeada, e conteúdo corrompido cai para o seed. 🟢
   - Origem no legado: `BR-OFF04`; `_reversa_sdd/code-analysis.md#10.4 Persistência`
   - Tipo: preservada
5. **RN-05:** A criação sempre popula identificador e data de criação; a data do registro só é
   preenchida quando ausente. 🟢
   - Origem no legado: `BR-OFF06`
   - Tipo: preservada — **com achado**, ver §10
6. **RN-06:** A atualização preserva o identificador original e faz mesclagem superficial; registro
   inexistente é rejeitado com mensagem de não encontrado. 🟢
   - Origem no legado: `BR-OFF07`
   - Tipo: preservada
7. **RN-07:** O filtro compara por igualdade estrita, sem operadores de intervalo, pertinência ou
   conteúdo. 🟢
   - Origem no legado: `BR-OFF08`
   - Tipo: preservada
8. **RN-08:** A ordenação aceita um único campo, ascendente ou descendente, sem critério de
   desempate além da ordem original. 🟢
   - Origem no legado: `BR-OFF09`
   - Tipo: preservada
9. **RN-09:** O adaptador **não** aplica regra de acesso: todos os registros de todas as entidades
   são visíveis e editáveis. 🟡
   - Origem no legado: `BR-OFF10`; limitação `L1`; `_reversa_sdd/migration/interfaces/mock-local-storage.md`
   - Tipo: preservada — **intencional e declarada**, não defeito a corrigir
10. **RN-10:** Encerrar sessão e redirecionar para autenticação não têm efeito em modo offline. 🟢
    - Origem no legado: `BR-OFF11`
    - Tipo: preservada
11. **RN-11:** O registro de acesso à aplicação não tem efeito em modo offline. 🟢
    - Origem no legado: `BR-OFF12`
    - Tipo: preservada
12. **RN-12:** O repositório de entidade é obtido por acesso dinâmico: **qualquer** nome devolve um
    repositório funcional, e um nome sem seed devolve conjunto vazio em vez de falhar. 🟢
    - Origem no legado: `_reversa_sdd/modo-offline/requirements.md#3.2`
    - Tipo: preservada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Provar a ativação por variável de ambiente | Must | Com a variável ligada no ambiente de construção, o cliente exportado é o do adaptador local | 🟢 |
| RF-02 | Provar a **metade negativa** da ativação | Must | Sem a variável — ou com ela desligada — a fábrica do provedor **é chamada** e o cliente exportado não é o do adaptador local (decisão `3a`) | 🟢 |
| RF-03 | Provar a autenticação imediata | Must | Com a variável ligada, a sessão fica autenticada como o usuário de demonstração **sem** chamar o servidor | 🟢 |
| RF-04 | Provar a ausência estrutural de papel | Must | Extrair o papel do usuário offline **não compila**. Coberto por citação dos casos da feature 008 | 🟢 |
| RF-05 | Provar a semeadura na primeira leitura | Must | Com a chave ausente, a primeira leitura grava o seed sob a chave prefixada e devolve o conjunto semeado | 🟢 |
| RF-06 | Provar a persistência entre leituras | Must | Criar, atualizar e excluir refletem na leitura seguinte, e o conjunto sobrevive a uma nova instância do cliente | 🟢 |
| RF-07 | Provar a tolerância a conteúdo corrompido | Must | Com a chave contendo texto inválido, a leitura **não** lança e devolve o seed | 🟢 |
| RF-08 | Provar a ausência de regra de acesso | Must | Um registro criado por outra origem é visível e editável, sem filtro de dono | 🟢 |
| RF-09 | Provar a criação | Must | A criação devolve identificador e data de criação preenchidos, e a data do registro quando ausente | 🟢 |
| RF-10 | Provar a atualização | Must | A atualização preserva o identificador e mescla os campos informados, mantendo os não informados | 🟢 |
| RF-11 | Provar a rejeição de registro inexistente | Must | Atualizar identificador desconhecido rejeita com a mensagem de não encontrado, citando a entidade e o identificador | 🟢 |
| RF-12 | Provar a comparação estrita do filtro | Must | O filtro casa por igualdade exata e **não** casa por operadores de intervalo ou de conteúdo | 🟢 |
| RF-13 | Provar a ordenação de campo único | Must | A ordenação funciona ascendente e descendente por um campo, e o limite corta o conjunto ordenado | 🟢 |
| RF-14 | Provar o acesso dinâmico a entidades | Must | Um nome de entidade sem seed devolve repositório funcional e conjunto vazio, sem lançar | 🟢 |
| RF-15 | Provar os no-ops de sessão e telemetria | Must | Encerrar sessão, redirecionar e registrar acesso não têm efeito observável | 🟢 |
| RF-16 | Provar o envio de arquivo em memória | Must | O envio devolve o conteúdo como dado embutido e **não** deixa registro persistido | 🟢 |
| RF-17 | Provar a ausência de leitura direta por identificador | Must | O repositório **não** expõe leitura por identificador; o caminho é filtrar ou percorrer a lista | 🟢 |
| RF-18 | Registrar que a criação aceita identificador do chamador | Must | Um identificador informado na criação **sobrepõe** o gerado, e o caso registra o comportamento real | 🟢 |
| RF-19 | Provar a recusa explícita do envio de e-mail | Should | A operação rejeita com mensagem própria, em vez de falhar em execução | 🟢 |
| RF-20 | Provar a exclusão de identificador inexistente | Should | A exclusão devolve sucesso mesmo para registro ausente, e o caso registra o comportamento | 🟢 |
| RF-21 | Registrar o estatuto das limitações | Must | O veredito de cada limitação `L1` a `L7` — afirmada, citada ou declarada — está no artefato de prova (decisão `1a`) | 🟢 |
| RF-22 | Não regredir as provas herdadas | Must | As verificações de `mockClient.test.ts` e `AuthContext.test.tsx` continuam verdes e **sem reescrita** | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A suíte completa permanece abaixo do teto de 90 s | Fechamento da feature 009: 85,86 s e 87,43 s em 145 verificações e 24 arquivos. **A margem é estreita**, e a linha de base anterior era de 74,83 s — a rodada precisa medir e registrar a condição | 🟢 |
| Manutenibilidade | Nenhuma dependência nova | A prova do adaptador não precisa de nenhuma: ele já roda sobre o armazenamento local, que o ambiente simulado fornece | 🟢 |
| Determinismo | O armazenamento local é limpo entre verificações | Cada verificação semeia o próprio estado; um conjunto remanescente faria a seguinte passar por acidente | 🟢 |
| Determinismo | O ambiente de construção é substituído e os módulos são recarregados onde a leitura é de carregamento | A variável é lida no carregamento do módulo de acesso a dados, e o cache de módulos precisa ser descartado para que a troca tenha efeito | 🟢 |
| Isolamento | Nenhum arquivo de aplicação é modificado | Mesma disciplina das features de prova anteriores: o perímetro é `src/api/__tests__/`, `src/lib/__tests__/` e, se preciso, `src/test/` | 🟢 |
| Não-regressão | As provas herdadas das features 001 e 005 não são reescritas | Decisão `2a` da feature 008, aplicada aqui: citar o que já cobre, criar casos só para as metades descobertas | 🟢 |
| Segurança | A prova não alcança rede nem provedor | O adaptador local não fala com o servidor por construção; o ambiente simulado não deve tentar | 🟢 |
| Higiene | A guarda de encoding permanece limpa | 451 arquivos íntegros no fechamento da 009 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Ativação exclusiva por variável de ambiente em construção
  Dado a variável de modo offline ligada no ambiente
  Quando o módulo de acesso a dados é carregado
  Então o cliente exportado é o do adaptador local

Cenário: Sem a variável, o comportamento volta ao provedor
  Dado a variável de modo offline ausente ou desligada
  Quando o módulo de acesso a dados é carregado
  Então o cliente exportado não é o do adaptador local

Cenário: Autenticação imediata como o usuário de demonstração
  Dado a variável de modo offline ligada
  Quando a sessão é verificada
  Então o usuário autenticado é o de demonstração, com identificador, e-mail e nome próprios
  E o servidor não é consultado

Cenário: A variante offline não tem papel
  Dado o usuário do modo offline
  Quando um trecho de código extrai o papel dele
  Então a compilação é recusada

Cenário: Semeadura na primeira leitura
  Dado o armazenamento local sem a chave da entidade
  Quando o adaptador lista a entidade
  Então a coleção é semeada e gravada sob a chave prefixada
  E a leitura devolve o conjunto semeado

Cenário: Conteúdo corrompido cai para o seed
  Dado o armazenamento local com a chave da entidade contendo texto inválido
  Quando o adaptador lista a entidade
  Então nenhum erro é lançado e o conjunto semeado é devolvido

Cenário: Criar, atualizar e excluir persistem
  Dado o adaptador ativo
  Quando um registro é criado, atualizado e excluído
  Então cada operação se reflete na leitura seguinte
  E o conjunto sobrevive a uma nova instância do cliente

Cenário: O adaptador não aplica regra de acesso
  Dado um registro gravado por outra origem
  Quando qualquer leitura ou escrita é feita
  Então o registro é visível e editável, sem filtro de dono

Cenário: A criação preenche identificador e datas
  Dado o adaptador ativo
  Quando um registro é criado sem identificador
  Então o identificador e a data de criação são preenchidos
  E a data do registro é preenchida apenas quando ausente

Cenário: A atualização preserva o identificador
  Dado um registro existente
  Quando ele é atualizado com parte dos campos
  Então o identificador original permanece
  E os campos não informados são mantidos

Cenário: Atualizar registro inexistente é recusado
  Dado o adaptador ativo
  Quando um identificador desconhecido é atualizado
  Então a operação é rejeitada com a mensagem de não encontrado, citando a entidade e o identificador

Cenário: O filtro compara por igualdade estrita
  Dado um conjunto com valores próximos e distintos
  Quando o filtro é aplicado
  Então apenas a igualdade exata casa
  E operadores de intervalo ou de conteúdo não têm efeito

Cenário: A ordenação aceita um campo
  Dado um conjunto de registros
  Quando a ordenação é aplicada ascendente e descendente
  Então a ordem corresponde ao campo informado, e o limite corta o conjunto ordenado

Cenário: Entidade sem seed devolve conjunto vazio
  Dado um nome de entidade que não existe no seed
  Quando o adaptador lista esse nome
  Então nenhum erro é lançado e o conjunto é vazio

Cenário: Os no-ops não têm efeito observável
  Dado o adaptador ativo
  Quando a sessão é encerrada, o redirecionamento pedido e o acesso registrado
  Então nada muda no armazenamento e nenhum erro é lançado

Cenário: O envio de arquivo devolve dado embutido e não persiste
  Dado o adaptador ativo e um arquivo informado
  Quando o envio é solicitado
  Então o conteúdo é devolvido como dado embutido
  E nenhum registro persistido é criado

Cenário: O repositório não expõe leitura direta por identificador
  Dado um registro existente na coleção
  Quando o repositório é consultado
  Então não há operação de leitura por identificador
  E o caminho declarado é filtrar ou percorrer a lista

Cenário: A criação aceita identificador informado pelo chamador
  Dado o adaptador ativo
  Quando um registro é criado com identificador informado
  Então o identificador informado é o que fica gravado
  E o caso registra que a redação da regra é mais forte do que o código

Cenário: O envio de e-mail é recusado explicitamente
  Dado o adaptador ativo
  Quando o envio de e-mail é solicitado
  Então a operação é rejeitada com mensagem própria
  E nenhum efeito é deixado no armazenamento

Cenário: A exclusão de identificador inexistente devolve sucesso
  Dado o adaptador ativo e nenhum registro com o identificador informado
  Quando a exclusão é solicitada
  Então a operação resolve com sucesso, e o conjunto permanece inalterado

Cenário: O estatuto das limitações fica registrado
  Dado o artefato de prova escrito
  Quando ele é lido
  Então cada limitação de L1 a L7 tem veredito explícito — afirmada, citada ou declarada

Cenário: As provas herdadas continuam verdes
  Dado a suíte executada
  Quando a execução termina
  Então as verificações do adaptador e da sessão, herdadas de features anteriores, passam sem reescrita
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-13 | Must | São os 6 cenários de fluxo de `PT-009`; a feature existe para eles |
| RF-14 a RF-18 | Must | Escopo confirmado na sessão de esclarecimentos de 2026-09-22 (decisão `2a`): são comportamentos **observáveis** da mesma superfície, e deixá-los fora repetiria o padrão de regra declarada e não medida |
| RF-21 | Must | É o que impede o verde de sugerir que as limitações são defeitos a corrigir |
| RF-22 | Must | É a disciplina que dá sentido ao projeto: provar não é mudar |
| RF-19 e RF-20 | Should | Recusas e tolerâncias declaradas, sem cenário de fluxo — provadas para não ficarem só no contrato |
| RNF de desempenho | Should | O teto já está perto: a margem da rodada anterior foi de ~3 s |

## 9. Esclarecimentos

### Sessão 2026-09-22

- **Q:** Qual é o estatuto das limitações `L1` a `L7`?
  **R:** Provar o **observável** e declarar o resto (opção `a`). `L1`, `L3`, `L4`, `L5` e `L6`
  ganham verificação — são comportamentos que o adaptador exibe. `L2` (escritas concorrentes entre
  abas) e `L7` (dados de pacientes no armazenamento local do navegador) ficam **declaradas**, com
  veredito registrado: a primeira não é exercitável no ambiente simulado, que tem uma aba só; a
  segunda é risco de **privacidade**, e afirmá-la em asserção diria que expor dados de pacientes é o
  comportamento pretendido — o que é decisão de produto, não de prova.
- **Q:** As regras declaradas fora dos 6 cenários entram nesta feature?
  **R:** Sim, as observáveis (opção `a`). O acesso dinâmico a qualquer nome de entidade, os no-ops
  de sessão e telemetria, o envio de arquivo como dado embutido, a recusa explícita do envio de
  e-mail e a tolerância da exclusão a identificador inexistente ganham verificação. E o achado da
  criação **vira caso**: um identificador informado pelo chamador sobrepõe o gerado, e o caso
  **registra** o comportamento real em vez de corrigir a redação da regra. Os cinco foram
  promovidos; a recusa do e-mail e a tolerância da exclusão permanecem `Should`.
- **Q:** Qual instrumento prova a metade negativa de `PT-009.1`?
  **R:** Substituir a **fábrica do provedor** e afirmar que ela foi chamada (opção `a`). É a única
  das opções que mede o ramo sem depender de o provedor real construir com os parâmetros da
  aplicação: sem configuração, ele pode lançar por motivo alheio à promessa, e uma verificação que
  falha pelo motivo errado é pior que uma ausente. A metade positiva afirma o adaptador local; a
  negativa afirma a chamada da fábrica do provedor.

## 10. Lacunas

Nenhuma dúvida aberta após a sessão de esclarecimentos de 2026-09-22. Permanecem registrados os
quatro achados da coleta de contexto, **sem correção**.

- 🟡 **`OFFLINE_USER` existe duas vezes.** `src/api/mockClient.ts:26` define a constante sem tipo, e
  é ela que `AuthContext` importa e usa. `src/types/User.ts:81` define **outra**, tipada como a
  variante offline, reexportada por `src/types/index.ts:42` — e **nenhum arquivo a consome**. Duas
  fontes para o mesmo valor, uma delas morta, e um teste (`AuthContext.test.tsx`) que substitui a
  cópia viva por um literal. Mudar o valor num lugar não muda o outro.
- 🟡 **A ativação é lida em dois módulos, com tempos diferentes.** `src/api/base44Client.ts:21` lê a
  variável **no carregamento do módulo**; `src/lib/AuthContext.tsx:130` lê **a cada verificação de
  estado**. São duas leituras independentes da mesma decisão, sem ponto único — a nota de
  `#5. Configuração` fala de uma.
- 🟡 **O discriminante `kind` do usuário autenticado não tem consumidor.** `toSessionUser` o produz,
  e nenhum ponto do código estreita por `user.kind` — o que o projeto estreita é `role`. O caminho
  offline **não** passa por `toSessionUser` e põe o objeto cru na sessão, de modo que as duas
  variantes circulam com formas diferentes.
- 🟡 **A criação não garante o identificador que a regra promete.** `RN-05` diz que a criação
  **sempre** popula o identificador, mas `mockClient.ts:116-121` espalha os dados do chamador
  **depois** do identificador gerado: um `id` informado pelo chamador sobrepõe o gerado. O mesmo
  vale para a data de criação. É comportamento do legado, preservado — e a redação da regra é mais
  forte do que o código.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-22 | Sessão de esclarecimentos: 3 dúvidas resolvidas; `RF-14` a `RF-18` promovidos a `Must` e quatro requisitos acrescentados (`RF-17` a `RF-20`); `L2` e `L7` ficam declaradas; o instrumento da metade negativa da ativação é a substituição da fábrica do provedor | reversa |
