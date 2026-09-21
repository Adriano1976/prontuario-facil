# Roadmap: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Requirements: `_reversa_forward/002-prova-automatizada/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature não acrescenta capacidade ao produto: dá estatuto ao que já existe e fecha o
que ficou pela metade. O caminho é declarar a camada de prova como componente de
primeira classe na extração, criar o comando que reproduz as verificações negativas do
gate de tipos (hoje perdidas em histórico de execução), converter os 5 cenários de
paridade do módulo Pacientes em verificação de execução, provar o recorte do defeito
DIV-01 no modo offline, e registrar na matriz de rastreabilidade o veredito de cada
promessa — incluindo as que ficam sem prova. Nenhum contrato de dados, schema de
entidade ou comportamento observável muda: a suíte observa. As cinco lacunas hoje
declaradas na matriz são triadas em três destinos: fechadas nesta feature, endereçadas a
features seguintes, ou declaradas como lacuna permanente com a razão.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi
registrado, e portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de
princípio estão no legado e foram respeitados:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A prova substitui o backend por dublê e nunca escreve em `base44/entities/` | respeita |
| Paridade de comportamento observável (`_reversa_sdd/addenda/001-migracao-typescript.md#Vigência`) | Nenhum arquivo de aplicação é alterado por esta feature | respeita |
| Congelamentos deliberados por decisão humana (transição manual de status, indicador fixo do painel) | A suíte documenta o comportamento, não o corrige | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este
> plano não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A camada de prova passa a ser declarada como componente da extração, com o comando único de prova como porta de entrada | RF-01, RF-03 e RN-01; hoje a suíte existe no código e não aparece em nenhum artefato da extração | a) manter a suíte fora da extração — é exatamente o problema que a feature resolve; b) registrar a suíte apenas em documentação de projeto, sem vínculo com as specs | 🟢 |
| D-02 | O comando de reprodução das verificações negativas vive em `src/test/verificacoes-negativas.mjs` e é exposto no manifesto como `prova:negativos`. Ele reconstrói cada caso em arquivo temporário, executa a verificação de tipos, confere que a recusa ocorreu com o código de erro esperado, e remove o arquivo ao final | RF-04 e a decisão da sessão de 2026-09-19; é a evidência hoje registrada em histórico que não pode ser reexecutada | a) arquivo versionado que falha por construção — o gate de tipos passaria a falhar de propósito no uso normal; b) `// @ts-expect-error` versionado — tecnicamente viável e **não** quebra o gate, ver `investigation.md` e o risco R-01 | 🟢 |
| D-03 | O comando fica sob `src/test/` porque é o único lugar autorizado pela política de escrita em vigor. A pasta `scripts/`, que seria o lugar natural, não está em `allowedPaths` de `.reversa/reversa-config.json` | Restrição objetiva da política do Reversa; ampliar `allowedPaths` é ato exclusivo do responsável, não deste plano | a) criar `scripts/` e escrever fora da política — recusado pela regra não-negociável; b) pedir a ampliação antes de planejar — desnecessário, `src/test/` já hospeda o ponto de montagem da prova (`src/test/setup.ts`) | 🟢 |
| D-04 | A rastreabilidade spec → código → prova e a declaração de lacunas vivem ambas em `_reversa_sdd/code-spec-matrix.md`, estendendo a seção já criada em 2026-09-19 | RF-03, RF-10 e RN-03; a seção existe e é o documento que o desenvolvedor já consulta | a) um documento de lacunas separado — cria dois lugares para a mesma verdade; b) registrar só no `actions.md` da feature — não sobrevive à feature | 🟢 |
| D-05 | Os 5 cenários de paridade do módulo Pacientes viram verificação de execução dentro dos arquivos de prova já existentes do módulo, sem camada nova | RF-08; 4 dos 5 já estão cobertos e o quinto precisa de recorte | a) um motor de cenários que execute os arquivos `.feature` diretamente — exigiria dependência nova, e a feature não autoriza acréscimo de dependência; b) converter os cenários em arquivo de prova próprio só para dizer que existe — duplicaria cobertura | 🟢 |
| D-06 | Os 16 cenários de paridade visual ficam fora da feature e são declarados como lacuna na matriz, com a razão | Decisão da sessão de 2026-09-19; a captura dourada de referência não existe (`present: false`) | a) capturar as 16 imagens de referência — trabalho de outra natureza, infla o escopo; b) converter só os que não dependem de imagem — a decisão registrada foi declarar o conjunto inteiro | 🟢 |
| D-07 | O fluxo de publicação existente (`.github/workflows/deploy-pages.yml`) **não** é alterado. O gate continua local, por comando | Ele publica o mini-site de documentação em GitHub Pages, não instala dependências nem constrói a aplicação. Acoplar a suíte a ele mudaria o propósito do fluxo e criaria um gate que não protege o que importa — além disso, `.github/` não está na política de escrita autorizada | a) acrescentar a suíte ao fluxo de publicação — gatilho errado, alvo errado; b) criar um fluxo de integração contínua novo — superfície nova e fora do escopo declarado | 🟢 |
| D-08 | O modo offline ganha verificação de ponta a ponta do recorte do paciente: cadastrar pelo adaptador falso e reler pela leitura escopada, no mesmo armazenamento local do ambiente de prova | RF-07; é o fluxo do defeito DIV-01 (watch W009), que passou pela prova de adaptador isolado sem ser detectado | a) provar apenas o adaptador isolado — é o que existe hoje e foi insuficiente; b) provar o modo offline inteiro — as limitações L1 a L7 ficaram declaradas fora do escopo | 🟢 |
| D-09 | O teto de desempenho é medido como tempo total do comando único de prova, com limite de 90 segundos | RF-01 e RNF Desempenho; a medição de 2026-09-19 foi de 33 segundos para 34 verificações, e há folga para o crescimento previsto | a) medir por arquivo — não é o que o desenvolvedor sente; b) não fixar teto — o requisito pede valor concreto | 🟢 |
| D-10 | O tempo é controlado apenas nas verificações em que o **valor** do relógio decide o resultado; nas demais o relógio do sistema é aceito | Decisão da sessão de 2026-09-19; congelar o tempo em toda a suíte conflita com as esperas assíncronas das interações de interface | a) congelar o tempo globalmente — frágil com interações assíncronas; b) aceitar sempre o relógio real — uma verificação que fixe a idade quebra sozinha no aniversário do paciente | 🟡 |
| D-11 | O adendo vigente da feature 001 não é reescrito. A frase "não existe teste automatizado" fica factualmente defasada e é corrigida por adendo próprio desta feature no `/reversa-sync` | Regra de não sobrescrita de artefato de feature concluída; `_reversa_sdd/addenda/001-migracao-typescript.md` é registro histórico daquela entrega | a) editar o adendo da 001 — reescreveria o registro de uma entrega fechada; b) deixar a frase como está — a extração passaria a mentir sobre o presente | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as cinco
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-19 e estão
registradas em `_reversa_forward/002-prova-automatizada/requirements.md#9. Esclarecimentos`.

## 5. Delta arquitetural

Componentes do legado que mudam. O restante da arquitetura descrita em
`_reversa_sdd/architecture.md` permanece intocado.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de prova | `_reversa_sdd/inventory.md#Cobertura de testes` | componente-novo | 10 arquivos de verificação executáveis por comando único. O inventário registra "nenhum teste encontrado": a camada inteira é nova em relação ao legado |
| Configuração de prova | `_reversa_sdd/architecture.md#1. Visão Resumida` | componente-novo | `vitest.config.ts` — ambiente de DOM simulado, ponto de montagem comum e resolução do apelido `@/` |
| Ambiente de prova | `_reversa_sdd/architecture.md#1. Visão Resumida` | componente-novo | `src/test/setup.ts` — paliativos das APIs de captura de ponteiro e de rolagem, ausentes no DOM simulado |
| Comando de reprodução das verificações negativas | `_reversa_forward/001-migracao-typescript/progress.jsonl` (ações T031–T036, T039, T045, T046) | componente-novo | Reconstrói cada caso negativo, executa o gate de tipos, confere a recusa pelo código de erro e remove o resíduo |
| Manifesto de comandos | `_reversa_sdd/dependencies.md` | contrato-alterado | `package.json` passa a declarar os comandos de prova e o comando das verificações negativas |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md` | contrato-alterado | Ganha veredito de prova por promessa, destino de cada cenário de paridade e a relação de lacunas declaradas |
| `_reversa_sdd/dependencies.md` | ele mesmo | regra-alterada | A linha "Sem framework de testes configurado e sem testes no repositório" fica factualmente incorreta a partir de 2026-09-19 e precisa ser corrigida na extração |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | ele mesmo | regra-alterada | A afirmação "não existe teste automatizado" descreve o estado da entrega da 001 e permanece válida como registro; o presente é corrigido por adendo desta feature (D-11) |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `package.json` | Acrescenta comandos; nenhuma dependência nova |
| `src/test/verificacoes-negativas.mjs` | Arquivo novo |
| `src/pages/__tests__/PatientForm.test.tsx` | Verificação nova: conjunto fechado de tipo sanguíneo (BR-P02) |
| `src/pages/__tests__/NewAppointment` / `ActivePatientSelection` | Verificação de execução do cenário PT-002 (já substancialmente coberta) |
| `src/api/__tests__/mockClient.test.ts` | Verificação de ponta a ponta do recorte DIV-01 |
| `_reversa_sdd/code-spec-matrix.md` | Vereditos, destinos e lacunas |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice ou migração. As 8 entidades persistidas permanecem com o contrato atual, e os schemas em `base44/entities/` não são tocados.
- O único dado que a feature introduz é **massa de prova fictícia** dentro dos arquivos de verificação, e a chave de armazenamento local que o adaptador falso já usa (`mock_db_<Entidade>`).
- Detalhe completo em: `_reversa_forward/002-prova-automatizada/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** A feature não toca o contrato
de acesso a dados, a assinatura do SDK, o serviço de e-mail nem qualquer chamada de rede:
a prova de interface substitui o backend por dublê, e a prova de dados exercita o
adaptador local.

Por essa razão, o diretório `interfaces/` **não é criado** nesta feature, conforme a
regra do `/reversa-plan`.

## 8. Plano de migração

Não há migração de dados. A sequência abaixo é a ordem de execução dos artefatos:

1. Criar o comando de reprodução das verificações negativas e expô-lo no manifesto (D-02).
2. Converter os 5 cenários de paridade de Pacientes em verificação de execução (D-05), incluindo o recorte de BR-P02 que hoje só tem prova estática.
3. Provar o recorte DIV-01 no modo offline (D-08).
4. Estender a matriz de rastreabilidade com vereditos, destinos e lacunas (D-04).
5. Corrigir a linha defasada de `_reversa_sdd/dependencies.md` e convergir por adendo no `/reversa-sync` (D-11, D-01).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** A decisão D-02 foi tomada sobre uma descrição imprecisa da alternativa `// @ts-expect-error` na sessão de esclarecimentos: eu a apresentei como "arquivo que falha por construção", mas a forma anotada **não** quebra o gate de tipos — ela falha se o erro deixar de existir | médio | média | Comparação corrigida em `investigation.md`. A decisão registrada é mantida e o comando é implementado como decidido; a forma anotada fica registrada como candidata a emenda por `/reversa-add`, à escolha do responsável |
| **R-02** Um dos 5 cenários de paridade (PT-001, "Campo cpf é tratado como dado sensível") não é inteiramente provável na fronteira do cliente: a criptografia acontece no backend | médio | alta | Dividir o cenário: a marcação de campo sensível no contrato tipado é provada pelo gate de tipos; a criptografia em repouso é declarada como lacuna, com a razão |
| **R-03** A suíte não sobe em ambiente confinado: o empacotador abre pipe nomeado e falha com `spawn EPERM` | baixo | alta neste ambiente, baixa em máquina de desenvolvimento | Registrar no `onboarding.md`. Não é defeito do projeto — a mesma restrição foi registrada na feature 001 e o build passou na máquina do responsável |
| **R-04** Verificações de interface que localizam elementos por classe de estilo (por exemplo, o botão de exclusão por `text-rose-600`) quebram numa refatoração visual | médio | média | Dívida já existente, registrada aqui. Endereçar quando houver refatoração de interface; não é escopo desta feature |
| **R-05** A matriz e a suíte divergem em silêncio: uma promessa ganha verificação e o veredito não é atualizado | alto | média | RF-02 (o nome da verificação aparece na falha) e o critério de pronto desta feature, que exige conferência da matriz contra a suíte antes de fechar |
| **R-06** Congelar o relógio em verificação que também espera interação assíncrona produz resultado intermitente | médio | média | D-10: congelar apenas onde o valor decide o resultado |
| **R-07** A pasta `scripts/`, lugar natural do comando, está fora da política de escrita autorizada; se o responsável ampliar `allowedPaths` depois, o comando fica em dois lugares | baixo | baixa | Registrado em D-03. Mover o arquivo é uma linha; a decisão de ampliar a política é exclusiva do responsável |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature, derivados do RF-13:

- [ ] O comando único de prova executa a suíte completa e o código de retorno reflete o resultado (RF-01)
- [ ] O comando das verificações negativas reconstrói cada caso registrado, reporta a recusa e não deixa resíduo (RF-04)
- [ ] Os 5 cenários de paridade do módulo Pacientes têm veredito de provado por execução (RF-08)
- [ ] Os 34 cenários de fluxo restantes e os 16 de tela têm destino declarado na matriz (RF-09)
- [ ] O cadastro de paciente no modo offline aparece na listagem pelas leituras escopadas (RF-07)
- [ ] Nenhuma promessa do **módulo Pacientes** aparece com veredito de lacuna na matriz (RF-13)
- [ ] A linha defasada de `_reversa_sdd/dependencies.md` foi corrigida na extração (D-11)
- [ ] A suíte completa executa em menos de 90 segundos (RNF Desempenho)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-19 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-19.*
