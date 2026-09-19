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
declara o que permanece sem prova. Entrega para o desenvolvedor único, que hoje não
consegue distinguir o que está provado do que apenas se afirmou provado, e para o
responsável por conformidade, que precisa da prova de execução do consentimento.

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
| `_reversa_sdd/migration/parity_tests/` | 26 arquivos de cenário, 55 cenários (39 de fluxo e 16 de tela) — especificação de paridade nunca executada por comando | 🟢 |
| `_reversa_sdd/migration/parity_tests/screens/V01-dashboard-principal.feature` | A paridade visual depende de captura dourada ausente: `golden: screens/golden/manifest.yaml → dashboard-principal.png (present: false)` | 🟢 |
| `_reversa_sdd/architecture.md#2. Variante de Deployment — Modo Offline` | "Não há mudanças nos contratos consumidos pelas pages" — o repositório falso é observável pelo mesmo contrato do real | 🟢 |
| `_reversa_sdd/code-analysis.md#10. Modo Offline (Mock Local)` | Contratos espelhados do backend e sete limitações funcionais (L1 a L7), entre elas a ausência de RLS e o envio de arquivo que não persiste | 🟡 |
| `_reversa_sdd/confidence-report.md#Confiança por unit` | `modo-offline/` é a unit de menor confiança (61%); `dashboard/` e `logs-acesso/` mantêm lacunas abertas | 🟢 |
| `_reversa_sdd/addenda/001-migracao-typescript.md#Vigência` | Adendo vigente desde 2026-09-15; registra que a paridade foi atestada **manualmente**, por roteiro de fumaça | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste` | Seção acrescentada em 2026-09-19 com cinco lacunas de prova declaradas, entre elas a verificação negativa não reproduzível | 🟢 |

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
6. **RN-06:** A paridade de comportamento deixa de ser atestada por roteiro manual e passa a ser atestada por execução, cenário a cenário. Cada cenário de paridade recebe destino explícito: provado por execução ou declarado como lacuna com justificativa. 🟢
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
| RF-04 | As verificações negativas do gate de tipos são reproduzíveis por comando | Must | Comando único reconstrói cada caso negativo, reporta que foi recusado e não deixa resíduo no repositório | 🟢 |
| RF-05 | As regras de domínio do módulo Pacientes têm prova de execução | Must | BR-P01, BR-P02, BR-P03 e a regra de isolamento por dono (BR-S02) têm, cada uma, verificação executável | 🟢 |
| RF-06 | Os caminhos de falha e cancelamento têm prova de execução | Must | Falha ao salvar no cadastro, falha ao salvar na alteração, cancelamento de exclusão e recusa de envio de foto têm verificação executável | 🟢 |
| RF-07 | O modo offline tem prova de ponta a ponta | Should | Cadastrar e reler no modo offline produz o registro na listagem, pelas mesmas consultas escopadas do modo online | 🟡 |
| RF-08 | Os cenários de fluxo de paridade recebem destino explícito e verificável | Should | Cada um dos 39 cenários tem veredito de provado por execução ou de lacuna declarada | 🟢 |
| RF-09 | Os cenários de paridade visual recebem destino explícito | Should | Cada um dos 16 cenários está provado ou declarado como lacuna, com a razão da ausência | 🟢 |
| RF-10 | As lacunas de prova ficam registradas em documento versionado | Must | Existe documento listando toda promessa sem prova, com a razão de cada ausência | 🟢 |
| RF-11 | A prova de interface substitui o backend por dublê e nunca alcança a rede | Must | A execução da suíte completa não abre conexão de rede | 🟢 |
| RF-12 | O gate de tipos continua disponível como comando isolado, sem emitir arquivos | Must | O comando de verificação termina sem erro e não escreve artefato | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Reprodutibilidade | Toda evidência registrada é reproduzível em máquina limpa, com instalação de dependências e um comando | RN-02; a evidência hoje registrada em histórico depende de arquivo temporário removido à mão | 🟢 |
| Determinismo | Nenhuma verificação depende de relógio real, fuso, ordem de execução ou estado deixado por outra verificação | O cálculo de idade e as datas de consentimento são sensíveis a relógio; resultado intermitente destrói a confiança na prova | 🟡 |
| Isolamento | A prova de interface não fala com o backend real nem com a rede | `_reversa_sdd/architecture.md#1. Visão Resumida` — todo o backend é serviço de terceiro | 🟢 |
| Desempenho | A suíte completa executa em menos de 90 segundos | Medição de 2026-09-19: 34 verificações em 33 segundos | 🟢 |
| Paridade | Nenhuma alteração de comportamento observável é introduzida pela feature | Regra de ouro herdada; os schemas de entidade do backend permanecem intocados | 🟢 |
| Privacidade | Dados de prova são fictícios; nenhum dado real de paciente entra em massa de teste | RN-07; a unit `modo-offline/` já concentra risco de dado local | 🟢 |
| Manutenibilidade | Acrescentar uma verificação nova não exige editar configuração de infraestrutura de prova | A suíte se descobre por convenção de nome de arquivo | 🟡 |
| Observabilidade | A falha identifica a promessa violada, não apenas o arquivo | RN-03; sem isso a matriz e a suíte divergem em silêncio | 🟡 |

### 6.1 Limites explícitos de alcance

- A prova **não** valida autorização real. A decisão de quem pode ler o quê permanece na regra de acesso do servidor; a suíte verifica que o escopo foi declarado e que o filtro foi aplicado, não que o servidor o honra. 🟢
- A prova **não** corrige as lacunas de segurança herdadas: validação de dígito verificador de CPF ausente, ausência de escape de marcação na substituição de variáveis de modelo e endereço de rede do consentimento fixo em `'client-side'`. Elas permanecem onde estão. 🟢
- A prova **não** cobre concorrência entre abas no modo offline (limitação L2 herdada, registrada em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais`). 🟡
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

Cenário: Modo offline cadastra e relê
  Dado o modo offline ativo
  Quando um paciente é cadastrado e a listagem é consultada
  Então o registro cadastrado aparece na listagem

Cenário: Cenário de paridade com destino declarado
  Dado os 39 cenários de fluxo e os 16 cenários de tela de paridade
  Quando a matriz de rastreabilidade é consultada
  Então cada cenário tem veredito de provado por execução ou de lacuna declarada
  E nenhum cenário permanece sem destino
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
| RF-10 | Must | Sem declaração de lacuna, a ausência de prova se disfarça de cobertura |
| RF-11 | Must | Prova dependente do backend real não é reprodutível |
| RF-12 | Must | O gate de tipos permanece a barreira mecânica de compilação |
| RF-07 | Should | O modo offline é a unit de menor confiança (61%) |
| RF-08 | Should | Os 39 cenários de fluxo são o maior acervo de especificação não executada |
| RF-09 | Should | A paridade visual depende de captura dourada ausente — ver §10 |
| RNF Desempenho | Should | 90 segundos é o teto para a suíte continuar sendo usada no dia a dia |
| RNF Determinismo | Should | Resultado intermitente destrói a confiança na prova |
| RNF Reprodutibilidade | Must | É a condição que separa evidência de afirmação |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 [DÚVIDA] Os 16 cenários de paridade visual entram nesta feature ou ficam declarados como lacuna? A captura dourada de referência não existe no repositório (`present: false`) e produzi-la é trabalho de outra natureza.
- 🔴 [DÚVIDA] Os 39 cenários de fluxo de paridade entram todos nesta feature, ou a conversão é fatiada por módulo em features seguintes?
- 🔴 [DÚVIDA] A evidência da verificação negativa do gate de tipos precisa deixar rastro versionado no repositório, ou basta que o comando a reproduza e reporte a cada execução?

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-19 | Versão inicial gerada por `/reversa-requirements` | reversa |
