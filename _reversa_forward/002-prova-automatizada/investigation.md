# Investigation: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Documento de fundo do `roadmap.md`. Registra o que foi pesquisado, o que foi avaliado e
> o que foi descartado — inclusive o que foi descartado por decisão, não por mérito.

## 1. Ponto de partida medido

| Métrica | Valor | Como foi medido |
|---------|-------|-----------------|
| Arquivos de prova | 10 | `src/**/*.test.ts(x)` |
| Verificações | 34 | contagem de `it`/`test` por arquivo |
| Duração da suíte | 33,21 s | execução de 2026-09-19, sem cache |
| Gate de tipos | 0 erros | comando de verificação estrita |
| Análise estática | 0 erros | análise de lint |
| Cenários de paridade | 55 (39 de fluxo, 16 de tela) | 26 arquivos em `_reversa_sdd/migration/parity_tests/` |
| Cenários de paridade executados por comando | 0 | nenhum `.feature` é lido por código |

Distribuição das 34 verificações: 8 de formulário de paciente, 5 de detalhe de paciente,
4 de seleção de paciente ativo, 3 de listagem, 4 de busca reutilizável, 2 de linha do
tempo clínica, 1 de contexto de autenticação, 3 de escopo de sessão, 2 de leitura
escopada e 2 do adaptador offline. A concentração é no módulo Pacientes (20 de 34), que é
exatamente o módulo desta feature.

## 2. Padrões aplicáveis

### 2.1 Prova de caracterização

É o padrão que dá nome ao que já foi feito aqui. A suíte não descreve o comportamento
*pretendido*: ela congela o comportamento *observado* antes da mudança, para que uma
regressão apareça como falha em vez de silêncio. As fontes externas:

- Martin Fowler, *Characterization Test* — https://martinfowler.com/bliki/CharacterizationTest.html
- Princípios de prova da Testing Library (provar o que o usuário percebe, não o detalhe de implementação) — https://testing-library.com/docs/guiding-principles

O alinhamento importa porque `_reversa_sdd/migration/parity_specs.md#Estratégia geral` já
declarou "characterization tests — primário" como estratégia de paridade. A feature não
introduz estratégia nova: executa a que foi declarada.

### 2.2 Prova de contrato no lugar de prova de servidor

O legado não tem servidor próprio: autenticação, persistência e regra de acesso vivem no
serviço de terceiro (`_reversa_sdd/c4-context.md#Elementos do Contexto`). Isso põe um teto
no que é provável a partir do cliente, e o teto precisa ser declarado em vez de
disfarçado. O que a prova pode afirmar:

| Afirmável no cliente | Não afirmável no cliente |
|----------------------|--------------------------|
| Que a leitura **declarou** o escopo de acesso | Que o servidor **honrou** o escopo |
| Que o filtro de dono foi **aplicado** na consulta | Que a regra de acesso do servidor está correta |
| Que a gravação **não foi solicitada** quando o consentimento faltava | Que nenhum registro existe no repositório do servidor |
| Que o campo sensível está **marcado** no contrato de tipos | Que o campo está **criptografado** em repouso |

A quarta linha é a que morde: o cenário PT-001 do acervo de paridade exige as duas coisas
na mesma frase ("o cpf permanece criptografado … E o tipo do campo cpf é marcado como
sensível"). Metade dele não é provável aqui. Ver risco **R-02** do `roadmap.md`.

## 3. Alternativas avaliadas

### 3.1 Verificação negativa do gate de tipos

O problema: as seis verificações negativas da feature 001 (T031–T036, mais T039, T045 e
T046) foram executadas criando um arquivo temporário, rodando o gate e **apagando o
arquivo em seguida**. A evidência está no histórico e não pode ser reexecutada por
ninguém. Três formas de resolver:

| Forma | Como funciona | Veredito |
|-------|----------------|----------|
| **(a) Comando que reconstrói** | Um script escreve o arquivo negativo, executa o gate, confere que o erro esperado apareceu, remove o arquivo e reporta. Nada permanece no repositório | **Adotada** (D-02). Atende ao RF-04 e à decisão da sessão de 2026-09-19 |
| **(b) Arquivo versionado que falha por construção** | O arquivo com o erro fica no repositório | Descartada: o gate de tipos passaria a falhar de propósito no uso normal, e a razão de existir do gate é ser executável a qualquer momento |
| **(c) Arquivo versionado com `// @ts-expect-error`** | O arquivo contém a linha inválida **e** a anotação que diz "aqui deve haver erro". Se o erro existir, tudo compila; se o erro **deixar de existir**, a anotação sozinha se torna o erro e a verificação falha | **Não adotada nesta feature, e é a correção de uma imprecisão minha.** Ver §3.2 |

### 3.2 Correção de uma imprecisão na sessão de esclarecimentos

Na pergunta sobre o rastro da verificação negativa, eu descrevi a alternativa de arquivo
versionado apenas na forma (b) — "falha por construção" — e não apresentei a forma (c).
A diferença é material:

- Na forma (b) o repositório passa a ter um erro permanente e o gate deixa de ser
  executável no uso normal. Foi por isso que o responsável a recusou, corretamente.
- Na forma (c) o arquivo **compila**, o gate continua verde, e a verificação negativa vira
  uma afirmação positiva e versionada: *"este código deve continuar sendo recusado"*. Se
  alguém tornar o campo válido, a anotação passa a apontar para o vazio e o gate acusa. É
  o padrão recomendado pela própria documentação da linguagem:
  https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html

Ou seja: a decisão registrada foi tomada sobre uma descrição incompleta das opções. Ela
**não** é inválida — o comando da forma (a) atende ao requisito e foi o que o responsável
escolheu com a informação que tinha. O que não seria honesto é enterrar a diferença. Ela
está no risco **R-01** e fica como candidata a emenda por `/reversa-add`.

### 3.3 Executar os cenários de paridade diretamente

Avaliada e descartada: um motor de cenários que lesse os 26 arquivos `.feature` e os
executasse como estão. Seria a tradução mais fiel da spec para a prova — o texto do
cenário vira a própria verificação, sem intermediário.

Descartada por duas razões: exige dependência nova (a feature não autoriza acréscimo, e o
projeto tem 14 dependências declaradas e não usadas esperando decisão de remoção), e os
cenários estão escritos em linguagem de negócio, com termos que não têm contraparte
executável no cliente ("o registro é persistido no Base44", "permanece criptografado no
armazenamento"). O que se ganharia em fidelidade se perderia em promessas que a suíte não
consegue cumprir.

O caminho adotado converte cenário a cenário, à mão, mantendo o vínculo declarado na
matriz — e, quando o cenário excede o que o cliente pode provar, divide em vez de fingir.

### 3.4 Onde vive o comando de reprodução

| Local | Situação |
|-------|----------|
| `scripts/` | Lugar natural para um utilitário de desenvolvimento. **Fora da política de escrita autorizada**: `allowedPaths` em `.reversa/reversa-config.json` lista `src/**`, `package.json`, `tsconfig.json`, `docs/**` e `index.html` |
| `src/test/` | Dentro da política. Já hospeda o ponto de montagem comum da prova (`src/test/setup.ts`), então o utilitário fica ao lado do que ele serve |

Adotado `src/test/verificacoes-negativas.mjs` (D-03). Um arquivo `.mjs` sob `src/` não
entra no programa verificado (a admissão de JavaScript está desligada na configuração de
tipos) e não é coletado como prova (o nome não casa com o padrão de arquivo de teste),
portanto não interfere em nenhum dos dois gates.

## 4. Ponto de ferramenta: o que já está instalado

A feature **não acrescenta nenhuma dependência**. O que ela usa já está declarado como
dependência de desenvolvimento desde os quatro commits que introduziram a suíte:

| Peça | Papel |
|------|-------|
| Executor de prova | descobre, executa e reporta; fornece o relógio controlável de D-10 |
| Ambiente de DOM simulado | dá ao teste um documento navegável sem navegador |
| Biblioteca de consulta | oferece as consultas por papel e por texto acessível, que é o que torna a prova legível por humano (RF-02) |
| Simulador de interação | digitação, clique e envio de arquivo com a semântica do navegador |
| Extensões de asserção de DOM | asserções sobre o documento |
| Medidor de cobertura | já declarado no manifesto, ainda sem uso registrado |

Documentação de referência do executor: https://vitest.dev/guide/

## 5. Achados colaterais desta investigação

1. **`_reversa_sdd/dependencies.md` está factualmente incorreto.** A linha 89 afirma
   "Sem framework de testes configurado e sem testes no repositório". A extração foi
   escrita antes dos quatro commits da suíte e nunca foi atualizada. É a única afirmação
   da extração que esta feature torna falsa — e sendo assim, precisa de correção
   (D-11).
2. **O inventário também está defasado sobre integração contínua.** `_reversa_sdd/inventory.md#CI/CD`
   diz "Nenhum pipeline encontrado (sem `.github/workflows/`…)", mas existe
   `.github/workflows/deploy-pages.yml`. A leitura correta é mais estreita: não há
   integração contínua **da aplicação**; o fluxo existente publica o mini-site de
   documentação em GitHub Pages e não instala dependências nem constrói o artefato. A
   conclusão do inventário continua válida na prática, mas a frase que a sustenta não.
3. **A verificação de tipos não protege os arquivos de prova.** Por decisão da feature
   001 (admissão de JavaScript desligada), nenhum `.js`/`.jsx` entra no programa. Os
   arquivos de prova são `.ts`/`.tsx` e **entram**; o utilitário `.mjs` desta feature
   **não entra**. É coerente, mas convém saber que o utilitário não é verificado.
4. **A prova está concentrada no módulo que motivou a feature.** 20 das 34 verificações
   são de Pacientes. Os outros sete módulos têm, somados, 14 — e nenhuma verificação de
   agendamento ou de consulta. Isso reforça o fatiamento decidido na sessão de
   2026-09-19.

## 6. Fontes internas consultadas

| Artefato | Uso |
|----------|-----|
| `_reversa_sdd/architecture.md` | fronteira entre a SPA e o serviço de backend |
| `_reversa_sdd/c4-context.md` | sistemas externos e o que não é provável no cliente |
| `_reversa_sdd/dependencies.md` | composição de dependências e a linha defasada sobre testes |
| `_reversa_sdd/inventory.md` | cobertura de testes do legado e a linha defasada sobre integração contínua |
| `_reversa_sdd/code-analysis.md#10. Modo Offline (Mock Local)` | contratos espelhados e limitações L1 a L7 |
| `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` | "sem testes — severidade alta" |
| `_reversa_sdd/confidence-report.md` | confiança por unit; `modo-offline/` com 61% |
| `_reversa_sdd/migration/parity_specs.md` | estratégia de validação de equivalência |
| `_reversa_sdd/migration/parity_tests/` | os 55 cenários, lidos um a um para a triagem |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | adendo vigente e a afirmação a corrigir |
| `_reversa_forward/001-migracao-typescript/progress.jsonl` | as verificações negativas executadas e removidas |
| `_reversa_forward/001-migracao-typescript/regression-watch.md` | W009, o defeito DIV-01 |
| `_reversa_sdd/code-spec-matrix.md` | as cinco lacunas declaradas em 2026-09-19 |

---
*Gerado pelo Reversa-Plan em 2026-09-19.*
