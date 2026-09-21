# Actions: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Roadmap: `_reversa_forward/002-prova-automatizada/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 14 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 6 elos |

> O volume de escrita de prova é pequeno de propósito: a suíte já existe e concentra 20
> das 34 verificações no módulo Pacientes. O que falta não é escrever teste — é
> **arrolar** o que existe, **reproduzir** o que se perdeu e **declarar** o que não é
> provável. As ações de maior peso são as da Fase 4, onde a terceira testemunha deixa de
> depor sem ter sido convocada.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar o comando de reprodução das verificações negativas com o mecanismo completo — montar a lista de casos, escrever o arquivo temporário, executar o gate de tipos, conferir que a recusa ocorreu com o código de erro esperado, remover o resíduo e reportar caso a caso — e um caso inicial (nome de campo inexistente) que prova o mecanismo | - | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T002 | Expor o comando no manifesto como `prova:negativos`, apontando para o arquivo de T001 | T001 | - | `package.json` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Provar por execução o conjunto fechado de tipo sanguíneo (BR-P02): o formulário oferece exatamente os oito tipos ABO/Rh mais `desconhecido`, e nenhum outro valor | - | [//] | `src/pages/__tests__/PatientForm.test.tsx` | 🟢 | [X] |
| T004 | Provar por execução o recorte do defeito DIV-01 no modo offline: cadastrar paciente pelo adaptador falso e reler pela leitura escopada, limpando a chave de armazenamento local antes de cada verificação | - | [//] | `src/api/__tests__/mockClient.test.ts` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Acrescentar ao comando os casos negativos de contrato de dados: entidade com nome inexistente, consentimento aceito sem data e consentimento aceito sem endereço de rede | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T006 | Acrescentar ao comando os casos negativos de regra de domínio: status de consulta fora do conjunto, leitura de dado clínico sem escopo declarado, escopo administrativo em método de dono e escrita sem campo obrigatório | T005 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T007 | Executar o comando completo e conferir que cada caso é recusado com o erro esperado e que nenhum arquivo temporário permanece no repositório | T006 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Estender a matriz de rastreabilidade com o veredito de prova de cada promessa do módulo Pacientes: o código que cumpre, o arquivo de prova que sustenta e o veredito 🟢/🟡/🔴 | T003, T004 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T009 | Declarar na matriz o destino de cada cenário de paridade não coberto nesta feature — os 34 cenários de fluxo dos sete módulos restantes, os 16 de tela e o desdobramento do cenário PT-001.3 — com a razão de cada lacuna | T008 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T010 | Corrigir a afirmação defasada de `dependencies.md`: não é verdade que o projeto esteja sem arcabouço de prova e sem testes | - | [//] | `_reversa_sdd/dependencies.md` | 🟢 | [X] |
| T011 | Corrigir as afirmações defasadas do inventário: a seção de cobertura de testes e a frase sobre integração contínua (existe fluxo de publicação do mini-site, não integração contínua da aplicação) | - | [//] | `_reversa_sdd/inventory.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Medir o tempo da suíte completa e registrar o valor no roteiro de conferência, verificando o teto de 90 segundos | T007 | - | `_reversa_forward/002-prova-automatizada/onboarding.md` | 🟢 | [X] |
| T013 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados | T009, T011 | - | `_reversa_forward/002-prova-automatizada/regression-watch.md` | 🟢 | [X] |
| T014 | Conferir o critério de pronto e registrar o resultado no roteiro: três promessas sorteadas na matriz batem com os arquivos de prova, e nenhuma promessa do módulo Pacientes tem veredito de lacuna | T009, T012, T013 | - | `_reversa_forward/002-prova-automatizada/onboarding.md` | 🟡 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** As ações mexem em arquivo de prova, manifesto de comandos e artefato da extração. Se alguma ação parecer exigir mudança em `src/pages/`, `src/lib/` ou `src/api/` fora de `__tests__`, algo saiu do escopo — pare e revise.
2. **`base44/entities/` intocado.** Regra de ouro do diff. Qualquer alteração ali é defeito, não entrega.
3. **R-01, do roadmap, é dívida declarada.** A alternativa `// @ts-expect-error` foi descartada nesta feature com base numa descrição imprecisa minha (ver `investigation.md#3.2`). O comando de T001 é a decisão registrada e deve ser implementado como está; a forma anotada fica como candidata a `/reversa-add`, à escolha do responsável.
4. **R-03, do roadmap: a suíte exige acesso ampliado neste ambiente.** O empacotador abre pipe nomeado e falha com `spawn EPERM` em modo confinado. Não é defeito do projeto e não deve virar ação de correção.
5. **T010 e T011 corrigem a extração, não o código.** São as duas únicas afirmações da extração que esta feature torna falsas, e deixá-las de pé faria a documentação mentir sobre o presente.
6. **O `/reversa-sync` desta feature tem uma obrigação específica (D-11):** produzir o adendo que corrige a afirmação "não existe teste automatizado" no adendo da feature 001 — **sem reescrever** o adendo da 001, que é registro histórico de uma entrega fechada.
7. **A Fase 4 é o coração da feature.** Sem T008 e T009, a suíte continua provando o código sem que nenhuma spec tenha prometido a prova — que é exatamente o problema que motivou a feature.
8. **Formato do marcador de status — desvio deliberado do template.** O template do `actions.md` envolve o status em crase (`` `[ ]` ``), mas a tabela de detecção de estágio físico do próprio Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, **sem** crase. O arquivo da feature 001 seguiu o template e, por isso, **não é reconhecido pela detecção automática** — nesta sessão o estágio dele teve de ser classificado à mão. Aqui o marcador é gravado sem crase para que `/reversa-forward` e `/reversa-resume` leiam o estágio corretamente. É divergência consciente de formato, não descuido; a correção do template pertence ao Reversa, não a este projeto.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-19` | Versão inicial gerada por `/reversa-to-do` | reversa |
