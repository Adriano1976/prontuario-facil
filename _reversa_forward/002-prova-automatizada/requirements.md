# Requirements: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O projeto passou a ter prova automatizada — 34 verificações em 10 arquivos — mas ela
nasceu fora do ciclo Reversa: nenhuma spec a prometeu e a matriz de rastreabilidade não
a registra. Esta feature arrola essa prova como cidadã de primeira classe: dá-lhe
requisitos, critérios de aceite e rastreabilidade, converte em comando reproduzível as
verificações que hoje só existem como procedimento manual registrado em histórico, e
declara o destino de tudo o que permanece sem prova. Entrega para o desenvolvedor único,
que hoje não consegue distinguir o que está provado do que apenas se afirmou provado, e
para o responsável por conformidade, que precisa da prova de execução do consentimento.

## 2. Contexto a partir do legado

> Siglas usadas neste documento: **BR** é regra de negócio do domínio, **RF** é
> requisito funcional, **RNF** é requisito não funcional, **RLS** é a regra de acesso
> por linha do backend.

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/inventory.md#Cobertura de testes` | "Nenhum teste encontrado (sem arquivos `*.test.*` / `*.spec.*`, sem framework de teste configurado)" — a ausência é a lacuna de origem | 🟢 |
| `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` | Item "Sem testes — Zero arquivos de teste no projeto — Severidade Alta" | 🟢 |
| `_reversa_sdd/code-analysis.md#11. Próximos Passos` | Item 6 recomenda prova para o cálculo de idade, as máscaras de CPF e telefone e a substituição de variáveis de modelo | 🟢 |
| `_reversa_sdd/domain.md#2. Regras de Negócio de Ouro (Core Business Rules)` | Dez regras confirmadas (BR-P01 a BR-S02) sem nenhuma prova de execução | 🟢 |
| `_reversa_sdd/pacientes/requirements.md#2. Regras de Negócio (BRs)` | As três regras do módulo Pacientes e a seção de RLS, sem um único cenário de aceitação | 🟢 |
| `_reversa_sdd/migration/parity_specs.md#Estratégia geral` | "Characterization tests (suíte derivada do comportamento atual do legado) — primário"; o contrato de tipos aparece como métrica primária | 🟢 |
| `_reversa_sdd/migration/parity_tests/` | 26 arquivos de cenário, 55 cenários (39 de fluxo e 16 de tela) — especificação de paridade nunca executada por comando. Distribuição por módulo: pacientes 5, agendamentos 8, modo offline 6, dashboard 5, templates 4, logs de acesso 4, contrato de dados 4, consultas 3 | 🟢 |
| `_reversa_sdd/migration/parity_tests/screens/V01-dashboard-principal.feature` | A paridade visual depende de captura dourada ausente: `golden: screens/golden/manifest.yaml → dashboard-principal.png (present: false)` | 🟢 |
| `_reversa_sdd/architecture.md#2. Variante de Deployment — Modo Offline` | "Não há mudanças nos contratos consumidos pelas pages" — o repositório falso é observável pelo mesmo contrato do real | 🟢 |
| `_reversa_sdd/code-analysis.md#10. Modo Offline (Mock Local)` | Contratos espelhados do backend e sete limitações funcionais (L1 a L7), entre elas a ausência de RLS e o envio de arquivo que não persiste | 🟡 |
| `_reversa_sdd/confidence-report.md#Confiança por unit` | `modo-offline/` é a unit de menor confiança (61%); `dashboard/` e `logs-acesso/` mantêm lacunas abertas | 🟢 |
| `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` | Adendo vigente desde 2026-09-15; registra que a paridade foi atestada **manualmente**, por roteiro de fumaça | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste` | Seção acrescentada em 2026-09-19 com cinco lacunas de prova declaradas, entre elas a verificação negativa não reproduzível | 🟢 |
| `_reversa_forward/001-migracao-typescript/regression-watch.md#Watch principal` | W009: o adaptador offline passou a preencher o dono do registro; sem isso, o registro criado no offline ficava invisível para as leituras escopadas (defeito DIV-01) | 🟢 |

> ⚠️ **Correção de premissa.** A §6.1 do `requirements.md` da feature 001 registrou a
> decisão de que "nenhum arcabouço de teste automatizado é adicionado nesta feature". A
> decisão foi cumprida e a feature fechou em 44 de 44 ações. O que existe hoje entrou
> **depois** dela, em quatro commits, sem feature que o promovesse. Esta feature não
> reabre a 001: ela assume o que nasceu fora do ciclo e dá estatuto ao que ficou de
> fora. Confidência: 🟢 (verificável no histórico do repositório e no `progress.jsonl`
> da feature 001).

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor único (PO e Dev) | Saber o que está provado e o que é apenas afirmação | Altera um campo do cadastro de paciente e descobre por comando o que quebrou |
| Desenvolvedor único | Reexecutar qualquer evidência já registrada | Repete a verificação negativa de "nome de campo inexistente não compila" sem depender de procedimento manual |
| Responsável por conformidade (LGPD) | Comprovar que o consentimento é exigido e registrado | Exige a prova de execução do aceite, da recusa sem aceite e do registro de data e endereço de rede |
| Desenvolvedor único | Distinguir paridade provada de paridade presumida | Consulta a matriz e vê, por promessa, o que tem prova e o que é lacuna declarada |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Toda promessa registrada nas specs do sistema possui prova automatizada executável por comando único, ou está declarada como lacuna em documento versionado. Não existe promessa sem um desses dois destinos. 🟢
   - Tipo: nova
2. **RN-02:** Toda evidência registrada em histórico de execução é reproduzível por comando. Evidência que dependa de arquivo temporário criado e removido à mão, ou de conferência visual do responsável, não conta como prova. 🟢
   - Origem no legado: `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` (a paridade foi atestada por roteiro manual)
   - Tipo: nova
3. **RN-03:** A matriz de rastreabilidade registra, para cada promessa, o código que a cumpre, a prova que a sustenta e o veredito. Promessa sem prova aparece marcada, nunca omitida. 🟢
   - Origem no legado: `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste`
   - Tipo: nova
4. **RN-04:** A prova observa; não altera. Nenhum contrato de dados, schema de entidade do backend ou comportamento observável é modificado para acomodar a suíte. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1. Visão Resumida` (regra de ouro do diff, com os schemas de entidade intocados)
   - Tipo: nova
5. **RN-05:** A verificação de tipos e a prova de execução são gates independentes e ambos precisam passar. Uma não substitui a outra: a primeira confere forma em tempo de compilação, a segunda confere comportamento em tempo de execução. 🟢
   - Origem no legado: `_reversa_sdd/addenda/001-migracao-typescript.md#Resumo da entrega` (a verificação de tipos foi a única barreira mecânica da migração)
   - Tipo: alterada
6. **RN-06:** A paridade de comportamento deixa de ser atestada por roteiro manual e passa a ser atestada por execução, cenário a cenário. Cada cenário de paridade recebe **um** destino explícito, entre três: provado por execução nesta feature, endereçado a uma feature seguinte nomeada, ou declarado como lacuna com justificativa. 🟢
   - Origem no legado: `requirements.md` da feature 001, §6.1 — limite de alcance revisto por decisão humana nesta feature
   - Tipo: alterada
7. **RN-07:** Todo dado usado em prova é fictício e não reutiliza registro real de paciente. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` (L7: dado de paciente em armazenamento local do navegador)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | A suíte de prova é executável por comando único, que retorna situação e não depende do backend real nem de rede | Must | O comando executa a suíte completa em máquina limpa e o código de retorno reflete o resultado | 🟢 |
| RF-02 | O resultado da execução é legível por humano: cada falha aponta arquivo, verificação e asserção violada | Must | Uma quebra deliberada produz mensagem com o arquivo e o nome da verificação | 🟢 |
| RF-03 | A matriz de rastreabilidade registra, por promessa, o código que a cumpre, a prova que a sustenta e o veredito | Must | Cada promessa do módulo Pacientes tem linha com os três campos preenchidos ou veredito de lacuna | 🟢 |
| RF-04 | As verificações negativas do gate de tipos são reproduzíveis por comando, que reconstrói cada caso, reporta a recusa e não deixa resíduo no repositório | Must | O comando reconstrói os casos negativos registrados, reporta que foram recusados, e nenhum arquivo temporário permanece após a execução | 🟢 |
| RF-05 | As regras de domínio do módulo Pacientes têm prova de execução | Must | BR-P01, BR-P02, BR-P03 e a regra de isolamento por dono (BR-S02) têm, cada uma, verificação executável | 🟢 |
| RF-06 | Os caminhos de falha e cancelamento têm prova de execução | Must | Falha ao salvar no cadastro, falha ao salvar na alteração, cancelamento de exclusão e recusa de envio de foto têm verificação executável | 🟢 |
| RF-07 | O cadastro de paciente feito no modo offline aparece na listagem, pelas mesmas consultas escopadas do modo online | Must | Cadastrar um paciente no modo offline e consultar a listagem devolve o registro cadastrado | 🟢 |
| RF-08 | Os cenários de fluxo de paridade do módulo Pacientes são convertidos em prova de execução | Must | Os 5 cenários do módulo (3 de cadastro e LGPD, 2 de seleção de paciente ativo) têm verificação executável | 🟢 |
| RF-09 | Todo cenário de paridade não coberto nesta feature tem destino declarado | Must | Os 34 cenários de fluxo restantes e os 16 de tela aparecem na matriz com módulo e feature de destino, ou com lacuna e a razão da ausência | 🟢 |
| RF-10 | As lacunas de prova ficam registradas em documento versionado | Must | Existe documento listando toda promessa sem prova, com a razão de cada ausência | 🟢 |
| RF-11 | A prova de interface substitui o backend por dublê e nunca alcança a rede | Must | A execução da suíte completa não abre conexão de rede | 🟢 |
| RF-12 | O gate de tipos continua disponível como comando isolado, sem emitir arquivos | Must | O comando de verificação termina sem erro e não escreve artefato | 🟢 |
| RF-13 | Ao final da feature, nenhuma promessa do módulo Pacientes permanece com veredito de lacuna | Must | A matriz não registra lacuna aberta para o módulo Pacientes; as lacunas dos demais módulos estão declaradas e endereçadas | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Reprodutibilidade | Toda evidência registrada é reproduzível em máquina limpa, com instalação de dependências e um comando | RN-02; a evidência hoje registrada em histórico depende de arquivo temporário removido à mão | 🟢 |
| Determinismo | Nenhuma verificação depende do **valor** do relógio real para decidir o resultado. Onde o valor importa, o tempo é controlado pela prova; onde apenas a forma importa, o relógio do sistema é aceito | O cálculo de idade e as datas de consentimento são sensíveis a relógio; uma verificação que fixe a idade quebra sozinha no aniversário do paciente | 🟡 |
| Isolamento | A prova de interface não fala com o backend real nem com a rede | `_reversa_sdd/architecture.md#1. Visão Resumida` — todo o backend é serviço de terceiro | 🟢 |
| Desempenho | A suíte completa executa em menos de 90 segundos | Medição de 2026-09-19: 34 verificações em 33 segundos | 🟢 |
| Paridade | Nenhuma alteração de comportamento observável é introduzida pela feature | Regra de ouro herdada; os schemas de entidade do backend permanecem intocados | 🟢 |
| Privacidade | Dados de prova são fictícios; nenhum dado real de paciente entra em massa de teste | RN-07; a unit `modo-offline/` já concentra risco de dado local | 🟢 |
| Manutenibilidade | Acrescentar uma verificação nova não exige editar configuração de infraestrutura de prova | A suíte se descobre por convenção de nome de arquivo | 🟡 |
| Observabilidade | A falha identifica a promessa violada, não apenas o arquivo | RN-03; sem isso a matriz e a suíte divergem em silêncio | 🟡 |

### 6.1 Limites explícitos de alcance

- A prova **não** valida autorização real. A decisão de quem pode ler o quê permanece na regra de acesso do servidor; a suíte verifica que o escopo foi declarado e que o filtro foi aplicado, não que o servidor o honra. 🟢
- A prova **não** corrige as lacunas de segurança herdadas: validação de dígito verificador de CPF ausente, ausência de escape de marcação na substituição de variáveis de modelo e endereço de rede do consentimento fixo em `'client-side'`. Elas permanecem onde estão. 🟢
- A conversão dos cenários de paridade dos **sete módulos restantes** (34 dos 39 cenários de fluxo) não pertence a esta feature; cada grupo vira feature própria, nomeada na matriz. Decisão da sessão de 2026-09-19. 🟢
- A **paridade visual** (16 cenários de tela) fica fora desta feature e permanece declarada como lacuna, porque a captura dourada de referência não existe no repositório. Decisão da sessão de 2026-09-19. 🟢
- A verificação negativa do gate de tipos é **reproduzida por comando e não deixa arquivo versionado**. Não existe caso negativo permanente no repositório: um arquivo assim precisaria ficar fora do programa verificado, sob pena de o gate de tipos passar a falhar de propósito no uso normal. Decisão da sessão de 2026-09-19. 🟢
- A prova **não** cobre a concorrência entre abas no modo offline nem as demais limitações funcionais herdadas (L1 a L7, registradas em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais`). 🟡
- A prova **não** cobre o empacotamento de produção; a construção do artefato continua sendo verificação de outra natureza. 🟢
- Comportamentos congelados por decisão humana não são alterados, inclusive os que a suíte venha a documentar como estranhos: o indicador fixo do painel, a divergência de critérios entre contadores e a transição manual de status de agendamento. 🟢
- Esta feature **não** altera a feature 001 nem reabre o escopo dela. 🟢

## 7. Critérios de Aceitação

```gherkin
Cenário: Suíte completa executada por comando único
  Dado o projeto com as dependências instaladas
  Quando o comando único de prova é executado
  Então todas as verificações registradas são executadas
  E o código de retorno reflete o resultado

Cenário: Falha identificável
  Dado uma promessa coberta por verificação automatizada
  Quando a verificação correspondente é deliberadamente quebrada
  Então a execução falha apontando o arquivo e a verificação violada

Cenário: Verificação executada sem rede
  Dado o ambiente sem acesso ao backend real
  Quando a suíte completa é executada
  Então nenhuma verificação falha por ausência de rede

Cenário: Verificação negativa do gate de tipos é reproduzível
  Dado um caso negativo registrado de nome de campo inexistente
  Quando o comando de reprodução das verificações negativas é executado
  Então ele reporta que o caso foi recusado pela verificação de tipos
  E nenhum arquivo temporário permanece no repositório

Cenário: Gate de tipos permanece isolado e sem emissão
  Dado o código-fonte verificado
  Quando o comando de verificação de tipos é executado
  Então ele termina sem erro
  E nenhum arquivo de saída é produzido

Cenário: Promessa sem prova é declarada, não omitida
  Dado uma promessa das specs sem verificação automatizada correspondente
  Quando a matriz de rastreabilidade é consultada
  Então a promessa aparece com veredito de lacuna
  E a razão da ausência consta no documento de lacunas

Cenário: Módulo Pacientes sem lacuna de prova ao final
  Dado o estado final da feature
  Quando a matriz de rastreabilidade do módulo Pacientes é consultada
  Então nenhuma promessa aparece com veredito de lacuna
  E as lacunas dos demais módulos estão declaradas com destino

Cenário: Regra de isolamento por dono tem prova
  Dado um usuário comum autenticado
  Quando ele lê um registro clínico
  Então a leitura declara o escopo do próprio dono
  E o filtro de dono é aplicado

Cenário: Paciente inativo não é oferecido para seleção
  Dado um paciente com status inativo
  Quando um novo agendamento ou uma nova consulta é aberta
  Então apenas pacientes ativos são oferecidos
  E o paciente inativo não aparece nem por busca pelo nome ou pelo CPF

Cenário: Tipo sanguíneo restrito ao conjunto permitido
  Dado o formulário de cadastro de paciente
  Quando o campo de tipo sanguíneo é aberto
  Então são oferecidos exatamente os oito tipos ABO/Rh mais "desconhecido"
  E nenhum outro valor pode ser gravado

Cenário: Consentimento ausente recusa o cadastro
  Dado o cadastro de paciente sem consentimento aceito
  Quando o salvamento é solicitado
  Então o cadastro é recusado
  E o formulário permanece preenchido

Cenário: Falha de gravação é anunciada e não redireciona
  Dado o cadastro de paciente com consentimento aceito
  Quando a gravação falha
  Então o usuário é avisado da falha
  E o formulário permanece na tela com os dados preenchidos

Cenário: Cancelamento da exclusão não exclui
  Dado um paciente existente com o diálogo de exclusão aberto
  Quando o cancelamento é acionado
  Então nenhum registro é excluído
  E nenhuma auditoria de exclusão é registrada

Cenário: Registro ausente tem estado próprio
  Dado um identificador que a consulta não devolve
  Quando o detalhe do paciente é aberto
  Então o estado de registro não encontrado é exibido
  E nenhuma auditoria de visualização é registrada

Cenário: Modo offline cadastra e relê o paciente
  Dado o modo offline ativo
  Quando um paciente é cadastrado e a listagem é consultada
  Então o registro cadastrado aparece na listagem

Cenário: Cenário de paridade do módulo Pacientes é executado
  Dado os cenários de paridade do módulo Pacientes
  Quando a suíte de prova é executada
  Então cada um deles tem veredito de provado por execução
  E nenhum permanece sem destino

Cenário: Cenário de paridade fora desta feature tem destino declarado
  Dado os 34 cenários de fluxo dos sete módulos restantes e os 16 cenários de tela
  Quando a matriz de rastreabilidade é consultada
  Então cada um tem destino declarado: módulo e feature de destino, ou lacuna com razão
  E nenhum é apresentado como provado
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem comando único a prova não é executável por outra pessoa além do autor |
| RF-02 | Must | Falha ilegível não vira correção |
| RF-03 | Must | É a terceira testemunha: sem registro, a prova não sustenta a promessa |
| RF-04 | Must | É exatamente a evidência hoje registrada como não reproduzível |
| RF-05 | Must | Cobre as regras de domínio que hoje não têm nenhuma prova de execução |
| RF-06 | Must | Caminhos de erro e cancelamento são os mais caros quando falham em silêncio |
| RF-07 | Must | É o fluxo do defeito DIV-01 (W009): cadastro no offline invisível para as leituras escopadas |
| RF-08 | Must | Fecha a paridade do módulo que motivou a feature |
| RF-09 | Must | Sem destino declarado, o cenário não coberto se disfarça de coberto |
| RF-10 | Must | Sem declaração de lacuna, a ausência de prova se disfarça de cobertura |
| RF-11 | Must | Prova dependente do backend real não é reprodutível |
| RF-12 | Must | O gate de tipos permanece a barreira mecânica de compilação |
| RF-13 | Must | É o critério de pronto: sem ele a feature não tem alvo declarado |
| RNF Reprodutibilidade | Must | É a condição que separa evidência de afirmação |
| RNF Isolamento | Must | Prova que depende do serviço de terceiro não roda em máquina limpa |
| RNF Desempenho | Should | 90 segundos é o teto para a suíte continuar sendo usada no dia a dia |
| RNF Determinismo | Should | Resultado intermitente destrói a confiança na prova |

## 9. Esclarecimentos

### Sessão 2026-09-19

Sessão dedicada às três dúvidas do documento inicial e a dois pontos abertos
encontrados na varredura de esclarecimento: o tratamento do relógio real e o alcance do
critério de pronto. As cinco respostas foram dadas de uma vez, com as cinco
recomendações aceitas.

- **Q:** Os 16 cenários de paridade visual entram nesta feature ou ficam declarados como lacuna?
  **R:** Ficam fora, declarados como lacuna. A captura dourada de referência não existe no repositório (`present: false`) e produzi-la é trabalho de outra natureza. Consequências: o RF-09 passa a exigir apenas a declaração do destino, e o conjunto entra em §10 como pendência transferida.
- **Q:** Os 39 cenários de fluxo de paridade entram todos nesta feature, ou a conversão é fatiada por módulo?
  **R:** Fatiada por módulo. Esta feature converte os **5 cenários do módulo Pacientes** (3 de cadastro e LGPD, 2 de seleção de paciente ativo) e declara o destino dos 34 restantes, agrupados assim: agendamentos (8), modo offline (6), dashboard (5), templates (4), logs de acesso (4), contrato de dados (4) e consultas (3). Consequências: o RF-08 é reescrito com o escopo do módulo, a RN-06 ganha o terceiro destino possível (conversão endereçada a feature seguinte nomeada) e o restante vai para §10.
- **Q:** A evidência da verificação negativa do gate de tipos precisa deixar rastro versionado no repositório?
  **R:** Não. Basta o comando reproduzível que reconstrói cada caso negativo, reporta a recusa e não deixa resíduo. Um arquivo negativo versionado precisaria ficar fora do programa verificado, sob pena de o gate de tipos passar a falhar de propósito no uso normal — e a razão de existir do gate é ser executável a qualquer momento. Consequências: o RF-04 passa a dizer explicitamente que o comando reconstrói, reporta e não deixa resíduo, e §6.1 declara a ausência de caso negativo permanente.
- **Q:** O RNF de determinismo diz que nenhuma verificação depende de relógio real, mas a suíte atual aceita o relógio do sistema no cálculo de idade e na data do consentimento. Como tratar?
  **R:** Misto. O requisito passa a ser "nenhuma verificação depende do **valor** do relógio real para decidir o resultado": onde o valor importa, o tempo é controlado pela prova; onde apenas a forma importa, o relógio do sistema é aceito. A redação anterior era absoluta e obrigaria controle de tempo em toda a suíte, inclusive nas esperas assíncronas de interface. Consequência: o RNF Determinismo foi reescrito e a confidência permanece 🟡, porque "onde o valor importa" é julgamento do autor de cada verificação.
- **Q:** Até onde a feature precisa chegar para ser considerada pronta?
  **R:** Mecanismo reproduzível mais as lacunas do **módulo Pacientes** zeradas; as lacunas dos demais módulos permanecem declaradas, não resolvidas. Consequências: criado o RF-13 com esse critério de pronto, e o RF-07 foi **estreitado ao cadastro de paciente no modo offline visível na listagem** e promovido de `Should` para `Must` — é exatamente o fluxo do defeito DIV-01, registrado como W009 em `_reversa_forward/001-migracao-typescript/regression-watch.md`. As demais limitações do modo offline (L1 a L7) permanecem fora do escopo. **Esta é a única interpretação desta sessão que vai além da resposta literal**: o RF-07 original falava do modo offline inteiro e foi estreitado ao recorte que pertence ao módulo Pacientes.

## 10. Lacunas

Nenhuma lacuna em aberto nesta feature. As três dúvidas do documento inicial foram
resolvidas na sessão de esclarecimentos de 2026-09-19, e os dois pontos abertos
encontrados na varredura foram decididos na mesma sessão.

### Pendências transferidas para fora desta feature

- 🟢 **Conversão dos cenários de paridade dos sete módulos restantes** — 34 dos 39 cenários de fluxo, distribuídos por módulo: agendamentos (8), modo offline (6), dashboard (5), templates (4), logs de acesso (4), contrato de dados (4) e consultas (3). Decisão da sessão de 2026-09-19: fatiamento por módulo, com o módulo Pacientes (5 cenários) fechado nesta feature. O destino de cada grupo é declarado na matriz de rastreabilidade (RF-09) e cada grupo vira feature própria.
- 🔴 **Paridade visual** — os 16 cenários de tela permanecem sem prova. A captura dourada de referência não existe no repositório (`present: false` em `_reversa_sdd/migration/parity_tests/screens/golden/manifest.yaml`). Decisão da sessão de 2026-09-19: fora do escopo, declarados como lacuna. Produzir as imagens de referência é trabalho de outra natureza.
- 🟡 **Limitações funcionais do modo offline (L1 a L7)** — herdadas de `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais`: ausência de RLS, escrita concorrente entre abas, envio de arquivo que não persiste, filtros estritos sem operadores, ordenação de campo único, ausência de leitura direta por identificador e dado de paciente em armazenamento local. Nenhuma delas é corrigida nem provada nesta feature.
- 🟡 **Empacotamento de produção** — a construção do artefato não é coberta por prova automatizada.
- 🟡 **Lacunas de conteúdo da extração** — a fórmula da Taxa de Atendimento do painel e a política de paginação da trilha de auditoria continuam abertas em `_reversa_sdd/confidence-report.md#Lacunas 🔴 pendentes`. Sem elas não há o que provar.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-19 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-19 | Sessão de esclarecimentos: 5 respostas. Paridade visual fora do escopo (RF-09 reescrito); conversão de paridade fatiada por módulo (RF-08 reescrito e RN-06 com terceiro destino); verificação negativa sem rastro versionado (RF-04 explicitado); RNF de determinismo reescrito para o valor do relógio; critério de pronto criado (RF-13) com o RF-07 estreitado ao fluxo DIV-01 e promovido a Must | reversa-clarify |

---
*Gerado pelo Reversa-Requirements em 2026-09-19.*
