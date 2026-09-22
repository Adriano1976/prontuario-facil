# Requirements: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Provar os 4 cenários de `PT-007` — a trilha de auditoria — em **três superfícies**: o módulo
que grava (`AccessLogger`), a página que lê (`AccessLogs`) e as telas que disparam a gravação
(Dashboard e detalhe do paciente). A feature dá veredito às duas metades da regra
*append-only*, separando o que é do cliente do que é da RLS; resolve a classificação
imprecisa de `AccessLog` no contrato do cliente; e prova que a gravação **falha aberta** —
sem usuário identificado, nada é gravado e nada é reportado. Não altera código de aplicação,
schema nem contrato.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/migration/parity_tests/07-auditoria-acesso.feature` | Os 4 cenários de `PT-007`: visualização gera log; append-only e leitura só admin; Dashboard gera log ao montar; listagem até 500 sem paginação | 🟢 |
| `_reversa_sdd/domain.md#2.4` | `BR-S01` — "todo acesso ou alteração de dados sensíveis deve gerar um log em `AccessLogs`" | 🟢 |
| `_reversa_sdd/code-analysis.md#5.1` (módulo logs-acesso) | Entidade `AccessLog`: enum de 12 ações, 2 obrigatórios (`user_email`, `action`); RLS com `create: null` e `read/update/delete` apenas admin. **Nota:** "Somente admins veem a tela de auditoria; tentativa de usuário comum retornará vazio/negado" | 🟢 |
| `_reversa_sdd/code-analysis.md#4.1` (módulo logs-acesso) | O filtro triplo combinado: busca case-insensitive em `user_email`/`patient_name`, igualdade exata na ação, e os três recortes de data | 🟢 |
| `_reversa_sdd/code-analysis.md#4.2` (módulo logs-acesso) | A classificação heurística dos indicadores, com a nota de que a heurística é por substring e **a soma não fecha com o total** | 🟢 |
| `_reversa_sdd/code-analysis.md#6` (módulo logs-acesso) | `BR-L01` a `BR-L07` deste artefato — **atenção à colisão de IDs, ver `RN-09`** | 🟢 |
| `_reversa_sdd/code-analysis.md#9` (módulo logs-acesso) | Pontos de atenção do módulo | 🟢 |
| `_reversa_sdd/logs-acesso/requirements.md#2` | `BR-L01` a `BR-L03` com significados **diferentes** dos mesmos códigos em `code-analysis.md#6` | 🟢 |
| `_reversa_sdd/logs-acesso/requirements.md#4` | RLS: create aberto ao sistema; read/update/delete restritos a admin — coerente com o schema | 🟢 |
| `_reversa_sdd/migration/ambiguity_log.md#AMB-004` | A política de paginação dos Logs de Acesso: limite de 500, sem paginação — **resolvido por paridade**, não corrigido | 🟢 |
| `_reversa_sdd/migration/handoff.md` | AMB-004 entre os comportamentos **congelados por decisão humana** (não corrigir) | 🟢 |
| `_reversa_sdd/addenda/004-prova-consultas.md` | A assimetria de auditoria provada: emitir documento **não** grava `AccessLog`, anexar exame grava. O trio de ações órfãs fica declarado | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | As três ações órfãs do catálogo e a trilha de auditoria da emissão de documento | 🟢 |
| `src/api/registry.ts#L64-79` e `#L124-126` | `AccessLog` é declarada **entidade de leitura aberta**, ao lado de `Doctor` e `Template` — embora sua leitura seja admin-only. `withAccess` faz `asUser` e `asAdmin` devolverem o **mesmo** repositório | 🟢 |
| `base44/entities/AccessLog.jsonc` | `create: null`; `read`, `update` e `delete` com `user_condition: role == admin`. 8 propriedades, 2 obrigatórios | 🟢 |
| `src/components/medical/AccessLogger.ts` | 12 ações declaradas em `ACCESS_ACTIONS`; `logAccess` grava com `ip_address: 'client-side'` e `user_agent` do navegador; **engole** qualquer falha em `console.error` | 🟢 |
| `src/pages/AccessLogs.tsx` | A página de auditoria: `list('-created_date', 500)`, filtro no cliente, quatro indicadores heurísticos e tabela sem paginação | 🟢 |

> **Nota de leitura.** As citações de `code-analysis.md` carregam números de linha do código
> **anterior à migração** (`.jsx`). A extração analisou o `.jsx`; o código vigente é `.tsx`,
> com deslocamento já registrado no adendo `001-migracao-typescript`. As linhas citadas nesta
> feature são sempre as do arquivo vigente.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Auditor / responsável por LGPD | Reconstruir quem acessou o quê, e quando | Abre a tela de auditoria e lê a trilha ordenada do mais recente para o mais antigo |
| Médico | Exercer o atendimento sem se preocupar com a trilha | Visualiza um paciente, cria uma consulta, anexa um exame — e espera que cada operação deixe rastro |
| Administrador | Restringir quem lê a trilha | A RLS do servidor limita a leitura; a interface **não** aplica filtro de papel nenhum |
| Responsável pela qualidade | Saber o que a trilha garante e onde ela vaza em silêncio | Confronta a promessa de `BR-S01` com os caminhos em que a gravação não acontece |

## 4. Regras de negócio novas ou alteradas

Nenhuma regra de produto nova. As regras abaixo são **contratos de prova** e correções de
leitura — a feature não altera o comportamento do sistema.

1. **RN-01:** A prova afirma o **valor gravado ou exibido**, nunca a forma da chamada.
   - Origem no legado: disciplina firmada nas features `002` a `005`
   - Tipo: nova (contrato de prova)
2. **RN-02:** A trilha é **append-only pelo cliente**: este módulo só grava, e nunca lê,
   altera ou apaga. A imutabilidade em si é **RLS do servidor** e não é provável no cliente.
   - Origem no legado: `AccessLogger.ts:18` ("a trilha é somente inserção"); `BR-L03` de `code-analysis.md#6`
   - Tipo: nova (a separação entre a metade do cliente e a do servidor nunca foi afirmada)
   - **Declarado, não provado (decisão `Q1` · `1a`):** três das doze ações do catálogo nunca são invocadas em lugar nenhum — `logout`, `create_prescription` e `export_data`. A orfandade é propriedade **estática** do código, e prová-la exigiria ler arquivos-fonte em vez de medir comportamento, que é o instrumento que a feature 004 recusou. Fica declarada na matriz
3. **RN-03:** `AccessLog` é classificada em `src/api/registry.ts:65-67` como entidade de
   **leitura aberta**, ao lado de `Doctor` e `Template` — mas sua leitura é **admin-only** na
   RLS. A classificação é **imprecisa**: a leitura não é aberta, apenas não declara escopo. E
   `withAccess` faz `asUser` e `asAdmin` devolverem o **mesmo** repositório, de modo que os
   dois acessos são indistinguíveis para esta entidade.
   - Origem no legado: `src/api/registry.ts`; `base44/entities/AccessLog.jsonc`
   - Tipo: alterada (correção de leitura documental)
4. **RN-04:** A tela de auditoria é **oferecida a todo usuário autenticado**: o item de
   navegação é incondicional (`Layout.tsx:48`) e não há guarda de papel no caminho até a
   página. Um não-admin chega à tela e vê a tabela vazia, sem que a interface explique a
   restrição. Isso torna **imprecisa** a nota de `code-analysis.md#5.1`, que diz que
   "somente admins veem a tela de auditoria".
   - Origem no legado: `src/Layout.tsx`; `src/pages/AccessLogs.tsx`
   - Tipo: nova
5. **RN-05:** A gravação **falha aberta**. Se `base44.auth.me()` falhar, ou devolver usuário
   vazio, `logAccess` retorna sem gravar e sem reportar: a falha é engolida em `console.error`
   por decisão registrada no próprio módulo ("nunca propagada, para não derrubar a operação
   principal"). O efeito na trilha é o pior possível: **o registro simplesmente não existe**, e
   ninguém é avisado.
   - Origem no legado: `src/components/medical/AccessLogger.ts:53-72`
   - Tipo: nova (o modo de falha nunca foi medido)
6. **RN-06:** O `Dashboard` grava a ação `login` **a cada montagem**, como procuração de acesso
   à página, com o detalhe fixo "Acesso ao dashboard". O enum não tem ação de acesso a painel,
   então toda visita ao Dashboard é contabilizada como um login.
   - Origem no legado: `src/pages/Dashboard.tsx:109-111`
   - Tipo: nova
7. **RN-07:** O detalhe do paciente grava `view_patient` em um efeito cujas dependências são
   `[patient, patientId]` — o **objeto** do paciente, não o seu identificador. Uma nova
   identidade do objeto grava um segundo registro para a mesma visualização; e o pedido de
   gravação **não é aguardado**.
   - Origem no legado: `src/pages/PatientDetail.tsx:156-160`
   - Tipo: nova
8. **RN-08:** Os quatro indicadores da tela de auditoria são **heurísticos por substring**:
   "Visualizações" conta `action` que contém `view`, "Edições" conta `edit` **ou** `create`, e
   "Exclusões" conta `delete`. `create_prescription` entra como edição; `login`, `logout`,
   `upload_exam` e `export_data` não entram em categoria nenhuma — **a soma não fecha com o
   total**, e o indicador de edições mistura criação com edição.
   - Origem no legado: `code-analysis.md#4.2`; `src/pages/AccessLogs.tsx:186-203`
   - Tipo: nova
9. **RN-09:** Toda citação de regra do tipo `BR-L` exige **artefato qualificado**.
   `logs-acesso/requirements.md#2` usa `BR-L01`/`BR-L02`/`BR-L03` para *append-only*, *enum de
   ações* e *chamadas dedicadas*; `code-analysis.md#6` usa os **mesmos IDs** para *campos
   obrigatórios*, *quem cria e quem lê* e *imutabilidade*. É a **quarta** família de numeração
   do projeto com o mesmo identificador denotando regras disjuntas — depois de `BR-A0x`,
   `BR-C` e `BR-T`.
   - Origem no legado: `logs-acesso/requirements.md#2` × `code-analysis.md#6` (logs-acesso)
   - Tipo: nova (defeito documental da extração, com instância confirmada)
10. **RN-10:** Os recortes de data da tela de auditoria comparam apenas o **piso** — `>= hoje − 7 dias` na semana e `>= hoje − 1 mês` no mês — **sem teto superior**. Um registro com data futura entra nos dois recortes. É a mesma forma do defeito que a feature 004 provou no recorte de consultas, e a decisão `Q1` · `1a` a traz para o escopo desta feature.
   - Origem no legado: `src/pages/AccessLogs.tsx:95-103`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Provar `PT-007.3`: o Dashboard grava ao montar | Must | Montar o Dashboard produz **exatamente um** registro, com `action: 'login'` e `details: 'Acesso ao dashboard'` (RN-06) | 🟢 |
| RF-02 | Provar os campos que o logger preenche por conta própria | Must | O registro carrega `user_email` do usuário da sessão, `ip_address` literal `'client-side'` e `user_agent` do navegador | 🟢 |
| RF-03 | Provar que os campos de entidade ficam **ausentes** quando não há entidade | Must | No registro do Dashboard, `entity_type`, `entity_id` e `patient_name` chegam como `undefined`, e não como string vazia | 🟢 |
| RF-04 | Provar `PT-007.1` na visualização de paciente | Must | Abrir o detalhe grava `view_patient` com `'Patient'`, o identificador e o nome do paciente | 🟢 |
| RF-05 | Provar `PT-007.1` na visualização de consulta | Must | Abrir a consulta grava `view_consultation` com `'Consultation'`, o identificador e o nome do paciente | 🟢 |
| RF-06 | Provar a tolerância a paciente sem nome | Should | A gravação com nome nulo entrega `patient_name: undefined` e não quebra a tela | 🟢 |
| RF-07 | Provar a metade **cliente** de `PT-007.2`: nenhuma escrita além de `create` (RN-02) | Must | Nenhum fluxo exercitado chama `update` ou `delete` sobre `AccessLog`, e o módulo nunca chama `list` ou `filter` | 🟢 |
| RF-08 | Provar que a página de auditoria **não oferece** edição nem exclusão | Must | Nenhuma linha da tabela tem controle de editar ou excluir; a página é somente leitura | 🟢 |
| RF-09 | Provar e **declarar** a classificação imprecisa de `AccessLog` (RN-03) | Must | A leitura é pedida **sem escopo declarado**, e `asUser`/`asAdmin` devolvem o mesmo repositório — a metade do servidor é declarada, não provada | 🟢 |
| RF-10 | Provar e **declarar** que a tela é alcançável por qualquer autenticado (RN-04) | Must | O item de navegação existe para usuário sem papel de admin, e nenhuma guarda intercepta o caminho até a página | 🟢 |
| RF-11 | Provar que a gravação **falha aberta** (RN-05) | Must | Com `auth.me()` recusando, ou devolvendo usuário vazio, **nenhum** registro é criado e **nenhum** erro é propagado ao chamador | 🟢 |
| RF-12 | Provar `PT-007.4`: a leitura é pedida com limite e ordenação | Must | O pedido é emitido com `('-created_date', 500)` — argumentos exatos, não aproximados | 🟢 |
| RF-13 | Provar a ausência de paginação e de reconsulta (AMB-004, metade cliente) | Must | Nenhum controle de paginação existe na página, e mudar qualquer filtro **não** emite novo pedido ao servidor | 🟢 |
| RF-14 | Provar os três filtros afirmando o conjunto exibido | Must | Busca por usuário e por paciente, igualdade exata por ação, e os três recortes de data — afirmando quantos registros aparecem, e quais | 🟢 |
| RF-15 | Provar o contrato do enum de ações | Must | `ACCESS_ACTIONS` tem exatamente **12** entradas e o conjunto de valores iguala o enum de `AccessLog.jsonc` | 🟢 |
| RF-16 | Provar a aritmética dos indicadores e a soma que não fecha (RN-08) | Should | Os quatro indicadores são conferidos contra um conjunto conhecido, e fica provado que a soma deles difere do total | 🟢 |
| RF-17 | Registrar na matriz o veredito dos 4 cenários de `PT-007`, o saldo dos módulos restantes, a colisão de `BR-L` citada com artefato qualificado e o **trio de ações órfãs** como declaração (`RN-02`) | Must | `code-spec-matrix.md` recebe a seção do grupo `07`; o trio aparece declarado, com a razão de não ser provado | 🟢 |
| RF-19 | Provar o recorte de data **sem limite superior** (`RN-10`, decisão `Q1` · `1a`) | Should | Um registro com data no futuro entra nos recortes de "última semana" e "último mês"; a ausência de teto é afirmada, não inferida | 🟢 |
| RF-20 | Provar a **duplicação do registro** por nova identidade do objeto do paciente (`RN-07`, decisão `Q4` · `4a`) | Should | O mesmo paciente, com uma nova identidade de objeto, produz um **segundo** registro de `view_patient` para a mesma visualização — o defeito fica provado e declarado | 🟢 |
| RF-21 | Revalidar os comandos de gate e a integridade da árvore | Must | `npm test`, `npm run typecheck`, `npm run lint`, `npm run prova:negativos` e `npm run prova:encoding` passam; nenhum arquivo de aplicação é tocado | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A suíte completa não deve ultrapassar o teto de 90 segundos | Teto firmado nas features `002` a `004`; a rodada 005 fechou em 67,42 s, com 22,58 s de folga | 🟢 |
| Segurança | A metade **servidor** de `PT-007.2` fica declarada, nunca marcada como provada | A RLS é aplicada fora do cliente; afirmar o contrário daria aparência de cobertura a comportamento de servidor, como o default `agendada` da feature 004 | 🟢 |
| Determinismo | A prova dos recortes de data congela **apenas o `Date`**, como nas features 004 e 005 | Os recortes decidem pelo valor de hoje; sem congelamento a verificação fica sensível à virada do dia | 🟢 |
| Observabilidade | O modo de falha de `RF-11` fica declarado na matriz, não escondido num verde | A trilha que falha em silêncio é o achado mais grave do módulo: sem a declaração, o verde de `PT-007.1` sugeriria uma garantia que não existe | 🟢 |
| Isolamento | A prova não grava em armazém real nem depende de usuário autenticado de verdade | O transporte de auditoria é substituído; `base44.auth.me` é dublado | 🟢 |
| Rastreabilidade | Toda citação de `BR-L` qualifica o artefato de origem (`RN-09`) | Colisão confirmada entre `logs-acesso/requirements.md#2` e `code-analysis.md#6` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: O Dashboard grava um acesso ao montar
  Dado um usuário autenticado abrindo o Dashboard
  Quando a página monta
  Então exatamente um registro de auditoria é gravado
  E a ação é "login" e o detalhe é "Acesso ao dashboard"
  E os campos de entidade chegam ausentes, e não vazios

Cenário: O registro carrega os campos que o logger preenche sozinho
  Dado um usuário autenticado com e-mail conhecido
  Quando qualquer evento auditável dispara
  Então o registro carrega o e-mail do usuário da sessão
  E o endereço de rede é gravado como "client-side", e não como endereço real
  E o agente do navegador é gravado

Cenário: Visualizar um paciente grava a ação correspondente
  Dado um paciente carregado no detalhe
  Quando o detalhe é exibido
  Então é gravado um registro com ação "view_patient", entidade "Patient", o identificador e o nome do paciente

Cenário: Visualizar uma consulta grava a ação correspondente
  Dado uma consulta carregada
  Quando a consulta é exibida
  Então é gravado um registro com ação "view_consultation", entidade "Consultation" e o nome do paciente

Cenário: A trilha é somente inserção pelo cliente
  Dado qualquer fluxo auditável exercitado
  Quando a gravação acontece
  Então o transporte recebe apenas inserção
  E nenhuma chamada de alteração, exclusão, listagem ou filtro é feita sobre a trilha

Cenário: A tela de auditoria é somente leitura
  Dado a tela de auditoria com registros carregados
  Quando a tabela é inspecionada
  Então nenhuma linha oferece controle de editar ou excluir

Cenário: A gravação falha aberta
  Dado que a identificação do usuário falha ou devolve usuário vazio
  Quando um evento auditável dispara
  Então nenhum registro é criado
  E nenhum erro chega ao chamador

Cenário: A leitura da trilha é pedida com limite e ordenação
  Dado a tela de auditoria aberta
  Quando a consulta é emitida
  Então os argumentos são a ordenação por criação decrescente e o limite de 500

Cenário: Os filtros atuam sobre o que já foi carregado
  Dado um conjunto de registros em memória
  Quando um filtro de ação, de texto ou de data é aplicado
  Então o conjunto exibido muda
  E nenhum novo pedido é emitido ao servidor

Cenário: A tela é oferecida a quem não é administrador
  Dado um usuário autenticado sem papel de administrador
  Quando a navegação é inspecionada
  Então o item de auditoria está presente
  E nenhuma guarda de papel intercepta o caminho até a página

Cenário: A soma dos indicadores não fecha com o total
  Dado um conjunto de registros com ações de categorias distintas
  Quando os quatro indicadores são lidos
  Então o total é afirmado separadamente
  E fica provado que os indicadores não somam o total

Cenário: O recorte de data não tem limite superior
  Dado um registro com data no futuro
  Quando o recorte de "última semana" é aplicado
  Então o registro futuro aparece no conjunto exibido
  E o mesmo acontece no recorte de "último mês"

Cenário: A mesma visualização grava duas vezes quando o objeto do paciente muda de identidade
  Dado o detalhe de um paciente já carregado e um registro de visualização gravado
  Quando o paciente é recarregado com uma nova identidade de objeto
  Então um segundo registro de visualização é gravado para a mesma visualização
  E o defeito fica declarado na matriz
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-03 | Must | São o corpo de `PT-007.3`; sem eles o cenário não tem veredito |
| RF-04, RF-05 | Must | São `PT-007.1` nas duas entidades que o cenário nomeia |
| RF-07, RF-08 | Must | São a metade **cliente** de `PT-007.2`, a única provável |
| RF-09, RF-10 | Must | Sem elas, a metade servidor de `PT-007.2` e a ausência de guarda de papel passariam por cobertas |
| RF-11 | Must | É o achado mais grave do módulo: a trilha que falha em silêncio |
| RF-12, RF-13 | Must | São `PT-007.4` no que é provável no cliente |
| RF-14, RF-15 | Must | Filtros e contrato do enum são o núcleo da página |
| RF-17, RF-21 | Must | Convergência na matriz e gate |
| RF-06, RF-16, RF-19, RF-20 | Should | Achados laterais reais, mas não prometidos por `PT-007`. Os quatro entram por decisão `Q1` · `1a` e `Q4` · `4a`: enriquecem a matriz sem inflar o escopo |
| RNF de desempenho | Should | Teto já firmado; a feature acrescenta poucos arquivos |
| O trio de ações órfãs | **Declarado** | Entra no escopo por `Q1` · `1a`, mas como **declaração na matriz**, não como prova: a orfandade é propriedade estática do código, e medi-la exigiria ler arquivos-fonte |

## 9. Esclarecimentos

### Sessão 2026-09-22

Quatro perguntas apresentadas, quatro respondidas. As três primeiras vinham dos `[DÚVIDA]`
declarados; a quarta saiu da varredura e apontou um furo **neste** documento — uma regra
declarada sem requisito que a provasse.

- **Q:** Quais achados laterais entram no escopo — o trio de ações órfãs, a aritmética dos indicadores e o recorte de data sem limite superior?
  **R:** `1a` — os três entram. A orfandade do trio fica **declarada**, não provada: é propriedade estática do código, e medi-la exigiria ler arquivos-fonte, o instrumento que a feature 004 recusou por confundir "provar o conteúdo de um arquivo" com "provar comportamento".
- **Q:** `PT-007.2` e a guarda de papel — provar as metades do cliente e declarar, provar a alcançabilidade, acrescentar guarda, ou declarar tudo como não provável?
  **R:** `2a` — provar as metades do cliente, **provar** que a tela é alcançável por não-admin e **declarar** os dois defeitos: a RLS não é provável no cliente, e a guarda de papel não existe. Não entra guarda no cliente — seria regra nova, não prova.
- **Q:** A gravação que falha aberta — provar e declarar, corrigir, ou declarar sem provar?
  **R:** `3a` — provar e **declarar**, mantendo a paridade. Corrigir mudaria comportamento observável, e isso é decisão de produto, não de prova.
- **Q:** A duplicação do log por re-render — requisito Should provado, declaração por leitura, Must, ou fora do documento?
  **R:** `4a` — entra como **Should** (`RF-20`), provado com a troca de identidade do objeto, e o defeito fica declarado. A varredura encontrou aqui um furo do documento original: o `RN-07` declarava a regra e **nenhum** dos 18 requisitos a provava.

**Consequências no documento:** `RF-19` (recorte sem teto) e `RF-20` (duplicação) foram
acrescentados; o requisito de gate passou de `RF-18` para `RF-21`, com as referências
ajustadas; o `RN-10` foi criado para o recorte de data; o `RN-02` ganhou a declaração do trio
órfão; três cenários Gherkin foram somados; e a seção `## 10` ficou sem lacunas em aberto.

## 10. Lacunas

n/a — **nenhuma lacuna em aberto.** As três dúvidas declaradas foram resolvidas na sessão de
2026-09-22, junto com o furo de cobertura que a varredura encontrou (ver `## 9`).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-22 | Sessão de esclarecimentos (4 perguntas): achados laterais entram com o trio órfão declarado; tela provada como alcançável por não-admin; falha aberta provada e declarada; duplicação entra como Should. `RF-19` e `RF-20` acrescentados, gate renumerado para `RF-21`, `RN-10` criado | `/reversa-clarify` |
