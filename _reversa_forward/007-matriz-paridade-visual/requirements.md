# Requirements: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A matriz de código e especificação (`_reversa_sdd/code-spec-matrix.md`) declara, em três pontos, que os 16 cenários de paridade visual — identificados como `PT-V01`…`PT-V16`, onde **PT** é *parity test* — são uma **lacuna permanente** porque "a captura dourada de referência não existe no repositório". Essa afirmação **deixou de ser verdadeira em 2026-09-22**: existem **24 goldens com `present: true`** (golden = imagem de referência da tela legada, com hash registrado), cobrindo **16 de 16** cenários. A feature corrige a leitura da matriz e reclassifica os 16 cenários de "lacuna declarada" para **trabalho transferido com destino declarado** — a feature do **harness de paridade visual**, isto é, do programa que abre as telas do alvo em navegador automatizado e as compara com os goldens, que hoje **não existe** no projeto. Entrega para quem dimensiona as próximas features forward e para quem lê a matriz como registro de cobertura. **Não altera código, comportamento, schema nem contrato.**

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | Linha do grupo "Paridade visual (`screens/V01` a `V16`)": *"**Lacuna declarada.** A captura dourada de referência não existe no repositório (`present: false`); produzi-la é trabalho de outra natureza"* | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | Nota de saldo: *"Os 16 de paridade visual seguem declarados como lacuna, e não como trabalho transferido"* | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | Linha *"**Paridade visual** (16 cenários) — 🔴 Declarada. Depende de captura dourada inexistente"* | 🟢 |
| `_reversa_sdd/screens/golden/manifest.yaml` | **24 entradas com `present: true`**; 16 delas com `parityScenario` `PT-V01`…`PT-V16`; `sha256`, `capturedAt` e `sourceCapture` por arquivo | 🟢 |
| `_reversa_sdd/migration/target_screens.md#Apêndice: rastreabilidade ao inventário` | *"Cobertura: 16 de 16 cenários de paridade visual com golden presente"* | 🟢 |
| `_reversa_sdd/migration/parity_specs.md#Paridade visual (modo literal — mesma plataforma)` | Estratégia reexecutada em 2026-09-22: 24 goldens, exceções propagadas e aviso explícito de que a linha da matriz está defasada | 🟢 |
| `_reversa_sdd/migration/handoff.md#Próximos passos para o agente de codificação` | Item 8: *"Corrigir a linha defasada da matriz"* — a correção está atribuída à próxima feature forward ou ao próximo `/reversa-sync` | 🟢 |
| `_reversa_sdd/ui/inventory.md#Atualização de 2026-09-22 (pós-captura) — as 22 telas têm imagem` | Cobertura de captura: 22 de 22 telas (100%), 24 arquivos contando o estado alternativo | 🟢 |
| `_reversa_sdd/addenda/002-prova-automatizada.md#Impacto por artefato da extração` | Origem da tabela de destino: *"o destino declarado dos 50 cenários de paridade não cobertos nesta feature"* | 🟢 |
| `_reversa_sdd/addenda/006-prova-logs-acesso.md#Impacto por artefato da extração` | Última atualização do saldo registrada por adendo: *"O saldo dos cenários transferidos cai de 19 para 15"* — os 16 visuais **nunca** entraram nessa contagem | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Product Owner / responsável único | Saber o que ainda não está provado antes de decidir a próxima feature | Lê a matriz para escolher entre "harness de paridade visual" e os 15 cenários de fluxo restantes |
| Agente de codificação / planejador forward | Dimensionar a feature do harness com escopo correto | Escreve as requirements do harness e precisa saber que os 16 cenários têm golden e destino, e não que são impossíveis |
| Auditor de conformidade | Tratar a matriz como registro de cobertura | Verifica se uma promessa de UI tem referência de prova e encontra o `sha256` do golden correspondente |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** um cenário de paridade só pode ser declarado **lacuna** enquanto o artefato de referência não existir no repositório. Existindo a referência, ele passa a **trabalho transferido com destino declarado** — a feature que fará a verificação. 🟢
   - Origem no legado: `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` (a própria tabela já usa as duas categorias: "Concluído" / "Feature a criar" / "Lacuna declarada")
   - Tipo: nova (invariante de registro)
2. **RN-02:** toda afirmação de cobertura na matriz precisa apontar para o artefato que a sustenta. Para os cenários visuais, o artefato é `_reversa_sdd/screens/golden/manifest.yaml`, com `sha256` por tela. 🟢
   - Origem no legado: `_reversa_sdd/migration/handoff.md#Lista de artefatos produzidos` (linha do `screens/golden/`: "24 goldens, `present: true` em 24 de 24")
   - Tipo: nova
3. **RN-03:** nenhuma linha da matriz pode contradizer `parity_specs.md` vigente. Divergência entre os dois é defeito de rastreabilidade, não escolha editorial. 🟡
   - Origem no legado: `_reversa_sdd/migration/parity_specs.md#Paridade visual (modo literal — mesma plataforma)` (que declara 24 goldens) × `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` (que declara captura inexistente)
   - Tipo: nova

> Esta feature **não cria nem altera regra de negócio do produto**. As três regras acima são invariantes do artefato de rastreabilidade.
>
> **Princípios**: `.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi registrado, portanto não há princípio a respeitar nem conflito a declarar (mesma constatação registrada no `roadmap.md` da feature `006-prova-logs-acesso`). Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio; esta feature não os cria nem os atenua.

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Corrigir a linha da tabela de destino referente a "Paridade visual (`screens/V01` a `V16`)", reclassificando os 16 cenários de "Lacuna declarada" para trabalho transferido, com destino nomeado (harness de paridade visual) | Must | A linha não contém mais `present: false` nem "Lacuna declarada"; cita os 24 goldens e o destino | 🟢 |
| RF-02 | Corrigir a nota de saldo da mesma seção, registrando que os 16 deixam de ser lacuna, com a data (2026-09-22) e a razão (captura dourada passou a existir) | Must | A nota afirma que os 16 são trabalho transferido, com data e razão; a contagem de transferidos passa a incluir os 16 | 🟢 |
| RF-03 | Corrigir a linha "Paridade visual (16 cenários)" da seção de lacunas de prova, deixando de dizer que depende de captura inexistente e passando a registrar que o golden existe e falta o harness | Must | A linha cita o golden capturado e nomeia a lacuna remanescente (harness/execução), mantendo o marcador de confidência coerente | 🟢 |
| RF-04 | Registrar os 24 goldens como artefato de prova no rastreio da matriz, com uma linha na seção **"Como a prova é executada"** apontando `_reversa_sdd/screens/golden/manifest.yaml` como fonte única do `sha256` por tela, e a cobertura de 16 de 16 cenários | Should | A seção "Como a prova é executada" menciona o manifest e a cobertura 16/16; nenhuma tabela de 16 linhas é criada na matriz | 🟢 |
| RF-05 | Atualizar a aritmética de cenários transferidos onde a matriz declarar o saldo, somando os 16 visuais aos 15 de fluxo: **19 concluídos e 31 transferidos** dos 50 transferidos pela feature 002 | Should | A nota de saldo e a linha "Paridade dos módulos restantes" apresentam a conta com os 16 visuais incluídos como transferidos | 🟢 |
| RF-06 | Restringir a alteração às linhas afetadas, sem tocar em nenhuma outra afirmação da matriz | Must | O diff do arquivo contém apenas as linhas dos RF-01 a RF-05; nenhum ID `PT-Vnn` é renumerado ou removido | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Consistência documental | Cada linha corrigida cita a fonte que a sustenta, no formato `_reversa_sdd/<arquivo>#<seção>` | RN-02; padrão já usado na matriz | 🟢 |
| Não-regressão de rastreio | Nenhum identificador de cenário (`PT-Vnn`), watch item (`W00x`) ou regra (`BR-*`) pode ser renumerado, removido ou reinterpretado | As citações cruzam features 001 a 006; renumerar invalidaria cadeias existentes | 🟢 |
| Integridade de arquivo | O arquivo permanece UTF-8 sem BOM e a guarda de encoding continua verde | `npm run prova:encoding` cobre 412 arquivos e atestou a árvore íntegra em 2026-09-22 | 🟢 |
| Escopo de escrita | Nenhuma escrita fora de `_reversa_sdd/` | Regra do Reversa: a feature é documental; `src/`, `package.json` e configurações não são tocados | 🟢 |
| Concorrência / retentativa / timeout | **n/a** | A feature não tem estado em execução, não chama serviço nem processo externo: é edição de texto em um artefato de rastreabilidade | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: A matriz deixa de declarar uma lacuna que não existe mais
  Dado que os 16 cenários PT-V01 a PT-V16 têm golden capturado com present: true no manifest
  Quando eu leio a seção "Destino dos cenários de paridade não cobertos nesta feature"
  Então a linha da paridade visual descreve trabalho transferido com destino declarado
  E nenhuma linha da seção afirma que a captura dourada não existe

Cenário: Cenário visual sem golden continua declarado como lacuna (caso negativo)
  Dado um cenário PT-Vnn cujo arquivo de golden esteja ausente do manifest ou com present: false
  Quando eu leio a linha correspondente na matriz
  Então ela permanece declarada como lacuna
  E a matriz não afirma cobertura que o manifest não sustenta

Cenário: O golden fica localizável a partir da matriz
  Dado que o manifest lista 24 goldens com sha256 por arquivo
  Quando eu leio a seção de prova da matriz
  Então encontro o caminho do manifest e a cobertura de 16 de 16 cenários
  E a contagem de cenários transferidos inclui os 16 visuais

Cenário: A correção não transborda para o resto da matriz
  Dado o diff desta feature aplicado ao arquivo da matriz
  Quando eu comparo o antes e o depois
  Então apenas as linhas dos RF-01 a RF-05 aparecem alteradas
  E todos os identificadores e cadeias de rastreio anteriores permanecem idênticos
```

**Cobertura dos requisitos pelos cenários**

| Cenário | Requisitos cobertos |
|---|---|
| A matriz deixa de declarar uma lacuna que não existe mais | RF-01, RF-02, RF-03 |
| Cenário visual sem golden continua declarado como lacuna | RF-03 (caso negativo), RN-01 |
| O golden fica localizável a partir da matriz | RF-04, RF-05 |
| A correção não transborda para o resto da matriz | RF-06, RNF de não-regressão de rastreio |

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É a afirmação que induz ao erro de escopo: diz que a paridade visual é impossível |
| RF-02 | Must | Mantém a aritmética de transferidos coerente com as features 002 a 006 |
| RF-03 | Must | A lacuna continua existindo, mas é outra (harness, não captura) — deixar como está mantém a informação errada |
| RF-06 | Must | Uma correção que transborda destrói a confiança na matriz como registro |
| RF-04 | Should | Torna o golden localizável a partir da matriz, sem obrigar a abrir o manifest |
| RF-05 | Should | Consistência aritmética; nenhuma decisão depende dela |
| RNF de integridade | Should | Guarda já existente cobre o risco |

## 9. Esclarecimentos

### Sessão 2026-09-22

- **Q:** Com o golden capturado mas sem harness, como os 16 cenários devem ser classificados na matriz?
  **R:** **Trabalho transferido** — entram na conta. A matriz já tem a categoria "Feature a criar" para trabalho planejável, e o harness é a feature que fará a verificação. A nota de saldo passa a declarar: dos 50 cenários transferidos pela feature 002, **19 concluídos** e **31 transferidos** (15 de fluxo + 16 visuais). Dúvida resolvida → RF-02, RF-05.
- **Q:** O adendo 002 está vigente e registra que os 16 são lacuna porque a captura não existe. Como reconciliar?
  **R:** **Adendo novo desta feature via `/reversa-sync`**; o adendo `002-prova-automatizada.md` fica **vigente e intocado** — adendo é registro histórico e o skill de sync só acrescenta, nunca reescreve. O adendo novo declara a mudança de estado e é ele que o leitor deve usar para reconciliar a leitura. Dúvida resolvida → RF-01, RF-02.
- **Q:** Onde a matriz deve registrar os 24 goldens como artefato de prova?
  **R:** **Uma linha na seção "Como a prova é executada"**, apontando `_reversa_sdd/screens/golden/manifest.yaml` como fonte única do `sha256` por tela. A matriz aponta para a evidência; não duplica as 16 linhas que já vivem no manifest e no apêndice de `target_screens.md`. Dúvida resolvida → RF-04.

## 10. Lacunas

Nenhuma lacuna aberta. As duas dúvidas da versão inicial foram resolvidas na sessão de esclarecimentos de 2026-09-22 (acima).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-22 | Sessão de esclarecimentos: classificação dos 16 como trabalho transferido (19 concluídos / 31 transferidos), reconciliação por adendo novo sem tocar o adendo 002, e registro do golden na seção "Como a prova é executada". RF-04 e RF-05 especificados; as 2 dúvidas da versão inicial foram zeradas | `/reversa-clarify` |
