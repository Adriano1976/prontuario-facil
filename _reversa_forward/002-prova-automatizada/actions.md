# Actions: Prova automatizada como cidadÃ£ do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Roadmap: `_reversa_forward/002-prova-automatizada/roadmap.md`

## Resumo

| MÃ©trica | Valor |
|---------|-------|
| Total de aÃ§Ãµes | 14 |
| ParalelizÃ¡veis (`[//]`) | 4 |
| Maior cadeia de dependÃªncia | 6 elos |

> O volume de escrita de prova Ã© pequeno de propÃ³sito: a suÃ­te jÃ¡ existe e concentra 20
> das 34 verificaÃ§Ãµes no mÃ³dulo Pacientes. O que falta nÃ£o Ã© escrever teste â€” Ã©
> **arrolar** o que existe, **reproduzir** o que se perdeu e **declarar** o que nÃ£o Ã©
> provÃ¡vel. As aÃ§Ãµes de maior peso sÃ£o as da Fase 4, onde a terceira testemunha deixa de
> depor sem ter sido convocada.

## Fase 1, PreparaÃ§Ã£o

| ID | DescriÃ§Ã£o | DependÃªncias | Paralelismo | Arquivo alvo | ConfidÃªncia | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar o comando de reproduÃ§Ã£o das verificaÃ§Ãµes negativas com o mecanismo completo â€” montar a lista de casos, escrever o arquivo temporÃ¡rio, executar o gate de tipos, conferir que a recusa ocorreu com o cÃ³digo de erro esperado, remover o resÃ­duo e reportar caso a caso â€” e um caso inicial (nome de campo inexistente) que prova o mecanismo | - | - | `src/test/verificacoes-negativas.mjs` | ðŸŸ¢ | [X] |
| T002 | Expor o comando no manifesto como `prova:negativos`, apontando para o arquivo de T001 | T001 | - | `package.json` | ðŸŸ¢ | [X] |

## Fase 2, Testes

| ID | DescriÃ§Ã£o | DependÃªncias | Paralelismo | Arquivo alvo | ConfidÃªncia | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Provar por execuÃ§Ã£o o conjunto fechado de tipo sanguÃ­neo (BR-P02): o formulÃ¡rio oferece exatamente os oito tipos ABO/Rh mais `desconhecido`, e nenhum outro valor | - | [//] | `src/pages/__tests__/PatientForm.test.tsx` | ðŸŸ¢ | [X] |
| T004 | Provar por execuÃ§Ã£o o recorte do defeito DIV-01 no modo offline: cadastrar paciente pelo adaptador falso e reler pela leitura escopada, limpando a chave de armazenamento local antes de cada verificaÃ§Ã£o | - | [//] | `src/api/__tests__/mockClient.test.ts` | ðŸŸ¢ | [X] |

## Fase 3, NÃºcleo

| ID | DescriÃ§Ã£o | DependÃªncias | Paralelismo | Arquivo alvo | ConfidÃªncia | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Acrescentar ao comando os casos negativos de contrato de dados: entidade com nome inexistente, consentimento aceito sem data e consentimento aceito sem endereÃ§o de rede | T001 | - | `src/test/verificacoes-negativas.mjs` | ðŸŸ¢ | [X] |
| T006 | Acrescentar ao comando os casos negativos de regra de domÃ­nio: status de consulta fora do conjunto, leitura de dado clÃ­nico sem escopo declarado, escopo administrativo em mÃ©todo de dono e escrita sem campo obrigatÃ³rio | T005 | - | `src/test/verificacoes-negativas.mjs` | ðŸŸ¢ | [X] |
| T007 | Executar o comando completo e conferir que cada caso Ã© recusado com o erro esperado e que nenhum arquivo temporÃ¡rio permanece no repositÃ³rio | T006 | - | `src/test/verificacoes-negativas.mjs` | ðŸŸ¢ | [X] |

## Fase 4, IntegraÃ§Ã£o

| ID | DescriÃ§Ã£o | DependÃªncias | Paralelismo | Arquivo alvo | ConfidÃªncia | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Estender a matriz de rastreabilidade com o veredito de prova de cada promessa do mÃ³dulo Pacientes: o cÃ³digo que cumpre, o arquivo de prova que sustenta e o veredito ðŸŸ¢/ðŸŸ¡/ðŸ”´ | T003, T004 | - | `_reversa_sdd/code-spec-matrix.md` | ðŸŸ¢ | [X] |
| T009 | Declarar na matriz o destino de cada cenÃ¡rio de paridade nÃ£o coberto nesta feature â€” os 34 cenÃ¡rios de fluxo dos sete mÃ³dulos restantes, os 16 de tela e o desdobramento do cenÃ¡rio PT-001.3 â€” com a razÃ£o de cada lacuna | T008 | - | `_reversa_sdd/code-spec-matrix.md` | ðŸŸ¢ | [X] |
| T010 | Corrigir a afirmaÃ§Ã£o defasada de `dependencies.md`: nÃ£o Ã© verdade que o projeto esteja sem arcabouÃ§o de prova e sem testes | - | [//] | `_reversa_sdd/dependencies.md` | ðŸŸ¢ | [X] |
| T011 | Corrigir as afirmaÃ§Ãµes defasadas do inventÃ¡rio: a seÃ§Ã£o de cobertura de testes e a frase sobre integraÃ§Ã£o contÃ­nua (existe fluxo de publicaÃ§Ã£o do mini-site, nÃ£o integraÃ§Ã£o contÃ­nua da aplicaÃ§Ã£o) | - | [//] | `_reversa_sdd/inventory.md` | ðŸŸ¢ | [X] |

## Fase 5, Polimento

| ID | DescriÃ§Ã£o | DependÃªncias | Paralelismo | Arquivo alvo | ConfidÃªncia | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Medir o tempo da suÃ­te completa e registrar o valor no roteiro de conferÃªncia, verificando o teto de 90 segundos | T007 | - | `_reversa_forward/002-prova-automatizada/onboarding.md` | ðŸŸ¢ | [X] |
| T013 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados | T009, T011 | - | `_reversa_forward/002-prova-automatizada/regression-watch.md` | ðŸŸ¢ | [X] |
| T014 | Conferir o critÃ©rio de pronto e registrar o resultado no roteiro: trÃªs promessas sorteadas na matriz batem com os arquivos de prova, e nenhuma promessa do mÃ³dulo Pacientes tem veredito de lacuna | T009, T012, T013 | - | `_reversa_forward/002-prova-automatizada/onboarding.md` | ðŸŸ¡ | [X] |

## Notas de execuÃ§Ã£o

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicaÃ§Ã£o Ã© tocado.** As aÃ§Ãµes mexem em arquivo de prova, manifesto de comandos e artefato da extraÃ§Ã£o. Se alguma aÃ§Ã£o parecer exigir mudanÃ§a em `src/pages/`, `src/lib/` ou `src/api/` fora de `__tests__`, algo saiu do escopo â€” pare e revise.
2. **`base44/entities/` intocado.** Regra de ouro do diff. Qualquer alteraÃ§Ã£o ali Ã© defeito, nÃ£o entrega.
3. **R-01, do roadmap, Ã© dÃ­vida declarada.** A alternativa `// @ts-expect-error` foi descartada nesta feature com base numa descriÃ§Ã£o imprecisa minha (ver `investigation.md#3.2`). O comando de T001 Ã© a decisÃ£o registrada e deve ser implementado como estÃ¡; a forma anotada fica como candidata a `/reversa-add`, Ã  escolha do responsÃ¡vel.
4. **R-03, do roadmap: a suÃ­te exige acesso ampliado neste ambiente.** O empacotador abre pipe nomeado e falha com `spawn EPERM` em modo confinado. NÃ£o Ã© defeito do projeto e nÃ£o deve virar aÃ§Ã£o de correÃ§Ã£o.
5. **T010 e T011 corrigem a extraÃ§Ã£o, nÃ£o o cÃ³digo.** SÃ£o as duas Ãºnicas afirmaÃ§Ãµes da extraÃ§Ã£o que esta feature torna falsas, e deixÃ¡-las de pÃ© faria a documentaÃ§Ã£o mentir sobre o presente.
6. **O `/reversa-sync` desta feature tem uma obrigaÃ§Ã£o especÃ­fica (D-11):** produzir o adendo que corrige a afirmaÃ§Ã£o "nÃ£o existe teste automatizado" no adendo da feature 001 â€” **sem reescrever** o adendo da 001, que Ã© registro histÃ³rico de uma entrega fechada.
7. **A Fase 4 Ã© o coraÃ§Ã£o da feature.** Sem T008 e T009, a suÃ­te continua provando o cÃ³digo sem que nenhuma spec tenha prometido a prova â€” que Ã© exatamente o problema que motivou a feature.
8. **Formato do marcador de status â€” desvio deliberado do template.** O template do `actions.md` envolve o status em crase (`` `[ ]` ``), mas a tabela de detecÃ§Ã£o de estÃ¡gio fÃ­sico do prÃ³prio Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, **sem** crase. O arquivo da feature 001 seguiu o template e, por isso, **nÃ£o Ã© reconhecido pela detecÃ§Ã£o automÃ¡tica** â€” nesta sessÃ£o o estÃ¡gio dele teve de ser classificado Ã  mÃ£o. Aqui o marcador Ã© gravado sem crase para que `/reversa-forward` e `/reversa-resume` leiam o estÃ¡gio corretamente. Ã‰ divergÃªncia consciente de formato, nÃ£o descuido; a correÃ§Ã£o do template pertence ao Reversa, nÃ£o a este projeto.

## HistÃ³rico de alteraÃ§Ãµes

| Data | AlteraÃ§Ã£o | Autor |
|------|-----------|-------|
| `2026-09-19` | VersÃ£o inicial gerada por `/reversa-to-do` | reversa |
