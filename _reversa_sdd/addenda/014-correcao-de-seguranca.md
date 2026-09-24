# Adendo: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/014-correcao-de-seguranca/`

## Vigência

Vigente desde 2026-09-24.

## Resumo da entrega

Corrigir quatro dos cinco achados das duas auditorias de segurança (`docs/security-audit/`),
alinhando o frontend a regras de negócio que o projeto **já tinha** — sem inventar regra nova. O F-01
tira das mãos de qualquer autenticado o menu, a rota e as ações administrativas; o F-03 torna
obrigatório por tipos o escopo de acesso nas mutações; o F-04 faz a leitura da trilha declarar o
escopo administrativo; e o F-05 remove o único sink de HTML perigoso do projeto. O **F-02 fica fora**:
não é corrigível neste repositório, e a razão está medida no SDK do Base44.

**28 de 28 ações concluídas**, sem execução parcial. A suíte vai de **168 verificações em 26 arquivos**
para **183 em 29**; o arnês de casos negativos, de **16 para 18**; `typecheck` em 0 erros e
`prova:encoding` íntegro em 499 arquivos. A prova das guardas de ação foi **falsificada antes de ser
aceita**: desligada a guarda nas duas telas, 3 das 6 verificações falharam — exatamente as que medem o
não-admin —, e foi revertida sem resíduo.

> ⚠️ **Este adendo é a convergência formal de um trabalho que nasceu fora do ciclo.** As correções
> foram entregues antes de existirem `requirements`, `roadmap` e `actions` — a feature `014` foi
> escrita retroactivamente, em 2026-09-24, para que o ciclo pudesse processá-la. A nota de
> proveniência está no `requirements.md` da feature, e a lacuna de processo está declarada em
> `_reversa_sdd/pendencias-de-convergencia.md`.
>
> ⚠️ **Diferente das features `001` a `010`, esta alterou arquivos de aplicação.** A `010` não tocou
> nenhum; aqui, oito arquivos de `src/` mudaram de comportamento. Por isso a convergência abaixo não é
> só de leitura: há **regra aplicada no cliente** que a extração ainda não descreve.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-analysis.md` | `#5.1 Entidade AccessLog` (módulo logs-acesso) | `regra-alterada` | A nota **"Somente admins veem a tela de auditoria; tentativa de usuário comum retornará vazio/negado"** passa a ser **inteiramente verdadeira**: a navegação filtra o item por papel e a rota `/AccessLogs` exige `admin`. **Leia como:** a primeira metade, que o adendo `006` teve de declarar **imprecisa**, é verdadeira outra vez — o achado F-01 era exatamente essa distância |
| `_reversa_sdd/code-analysis.md` | `#9. Pontos de Atenção / Lacunas` (módulo logs-acesso) | `regra-alterada` | A leitura da trilha deixou de ser feita pelo repositório **cru** e passou a declarar escopo administrativo. **Leia como:** o limite de 500 e a ordenação **não** mudam (AMB-004 permanece), e a linha "filtro client-side" segue correta |
| `_reversa_sdd/code-analysis.md` | `#3.1` / `#3.2` (módulos medicos e templates) e componentes de UI | `regra-alterada` | As telas de Médicos e Templates passam a **esconder** criar, editar e excluir de quem não é admin — inclusive o botão do estado vazio de Templates. **Leia como:** a **leitura** continua livre; o que sumiu foi a oferta da escrita |
| `_reversa_sdd/domain.md` | `#2.4 Segurança e Auditoria` | `regra-alterada` (leitura) | `BR-S01` e `BR-S02` **não mudam de conteúdo**. O que passa a existir é contraparte explícita no cliente: a superfície administrativa deixa de ser oferecida a todos, e as mutações das entidades sob RLS passam a exigir escopo por contrato. **Leia como:** a leitura das duas regras não muda; a **aplicação** delas no frontend passa a ser verificável |
| `_reversa_sdd/permissions.md` | `#2. Matriz de Acesso por Entidade` | `regra-alterada` (leitura) | A matriz **não muda**. O que muda é que as duas colunas que ela já distinguia passam a ter efeito no cliente: leitura **livre** de Médicos e Templates, leitura **admin-only** da trilha. **Leia como:** leia a matriz como contrato cumprido nos dois lados, e não só no servidor |
| `_reversa_sdd/permissions.md` | `#3. Implementação Técnica` | `componente-novo` | Entram o ponto único de leitura da sessão (`src/lib/useCurrentUser.ts`) e a guarda de rota por papel (`RoleGuard`, em `src/App.tsx`). **Leia como:** a lista de arquivos de implementação desta seção fica incompleta sem os dois |
| `_reversa_sdd/logs-acesso/requirements.md` | `#2. Regras de Negócio` | `regra-alterada` (leitura) | `BR-L01`, `BR-L04` e `BR-L05` **não mudam de conteúdo**. A leitura da trilha passa a declarar escopo administrativo, e para escopo de dono responde vazio sem consultar o servidor. **Leia como:** o teto de 500 registros é paridade congelada por decisão humana (`AMB-004`), e a correção **não** o tocou |
| `_reversa_sdd/medicos/requirements.md` | `#2` (BR-M01) e `#4` | `regra-alterada` (leitura) | A regra de que só admin cria, atualiza e exclui médicos **já existia** e não muda. O que muda é que ela passa a ser **aplicada na interface**: as três ações não são mais oferecidas a quem não é admin. **Leia como:** nenhuma regra nova; a regra antiga ganhou efeito visível |
| `_reversa_sdd/templates/requirements.md` | `#2` (BR-T03) e `#4` | `regra-alterada` (leitura) | Idem para templates, com a mesma ressalva de que a **leitura** dos ativos permanece livre |
| `_reversa_sdd/migration/target_business_rules.md` | `#BR-MIGRAR-015`, `#BR-MIGRAR-017`, `#BR-MIGRAR-020`, `#BR-MIGRAR-024`, `#BR-MIGRAR-034` | `regra-alterada` (leitura) | As cinco regras **não mudam de conteúdo** — esta feature é o cumprimento delas no frontend. **Leia como:** `BR-MIGRAR-034` deixa de ser promessa parcial; a obrigatoriedade de escopo que ela exigia para *query* **e** *mutation* agora vale para as duas |
| `_reversa_sdd/architecture.md` | `#1. Visão Resumida` | `componente-novo` | Entra a guarda de rota por papel e o autorizador de interface das telas administrativas. **Leia como:** o fluxo de navegação ganha um ponto de decisão que antes não existia |
| `_reversa_sdd/code-spec-matrix.md` | `#Correção do F-01`, `#Correção do F-03`, `#Correção do F-04`, `#Achados de segurança — estado da correção` | `regra-nova` | As seções **já existem**, escritas à mão em 2026-09-24 durante a execução. Este adendo é a **convergência formal** delas: o registro deixa de depender de edição manual da matriz |
| `docs/security-audit/001-record/` e `002-record/` | — | n/a | Os relatórios de auditoria são **históricos** e **não** são reescritos. O estado vivo dos cinco achados é o da tabela em `code-spec-matrix.md#Achados de segurança — estado da correção` |

> **O que este adendo NÃO faz, por regra do skill:** ele **anota**, não corrige. Os artefatos acima
> continuam como estão em disco. Em particular, os vereditos de prova que a sessão de 2026-09-24
> aplicou **à mão** em `dashboard/requirements.md`, `modo-offline/requirements.md`,
> `code-analysis.md`, `gaps.md` e nos cenários `08` e `09` **não** são convergência do framework — e a
> próxima re-extração os substituirá. Isso está declarado em
> `_reversa_sdd/pendencias-de-convergencia.md`.

## Regras sob vigilância

**Treze itens** — `W001` a `W013` — em
`_reversa_forward/014-correcao-de-seguranca/regression-watch.md`, que consolida os watches das três
correções entregues em 2026-09-24 (`011-rbac-frontend`, `012-escopo-em-mutacoes` e
`013-leitura-da-trilha`) e acrescenta a guarda do F-05. **Sete observações** (`O001` a `O007`) ficam no
mesmo arquivo, **sem peso de regressão**: são os limites declarados da correção.

- `W001` — o item de menu da trilha é oferecido só ao administrador
- `W002` — a guarda de rota cobre uma só rota; Médicos e Templates seguem alcançáveis
- `W003` — as três ações de escrita de Médicos somem para quem não é admin
- `W004` — idem em Templates, incluindo o estado vazio
- `W005` — o usuário de demonstração do modo offline **não** carrega papel
- `W006` — `update` e `delete` das entidades sob RLS exigem o escopo na assinatura
- `W007` — `create` **continua** sem exigir escopo
- `W008` — o pass-through de `update`/`delete` não verifica posse em runtime
- `W009` — as quatro telas declaram o escopo resolvido por `resolveScope`
- `W010` — a leitura da trilha declara escopo administrativo
- `W011` — o pedido da trilha mantém `('-created_date', 500)` intacto
- `W012` — para escopo de dono, a leitura da trilha não chega a perguntar ao servidor
- `W013` — o sink `dangerouslySetInnerHTML` não volta ao componente de gráficos

> **Este adendo supera dois itens da feature `006-prova-logs-acesso`**: o `W006` daquela feature
> vigiava a leitura da trilha "sem escopo declarado", e o `W008`, que a navegação "não consulta
> papel". O segundo nomeava, na própria linha, que a guarda seria "*regra nova, e não conserto*" — foi
> o que aconteceu, e o registro de que a tela já foi oferecida a todos permanece no adendo `006`.

## Fontes

- `_reversa_forward/014-correcao-de-seguranca/legacy-impact.md`
- `_reversa_forward/014-correcao-de-seguranca/requirements.md`
- `_reversa_forward/014-correcao-de-seguranca/roadmap.md`
- `_reversa_forward/014-correcao-de-seguranca/actions.md`
- `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`
- `_reversa_sdd/pendencias-de-convergencia.md`

## Atualização 2026-09-24

Conferência da consolidação dos watches, feita **logo após** a criação deste adendo, encontrou **três
itens que não tinham sido transportados** dos watches originais — a consolidação estava em 12 dos 15:

- `W014` — os dois casos negativos de mutação sem escopo seguem recusando com `TS2554` (vinha de `012/W005`)
- `W015` — os filtros da trilha continuam **em memória** (vinha de `013/W004`)
- `W016` — a inserção na trilha continua usando a forma de dono, `asUser` (vinha de `013/W005`)

A seção `## Regras sob vigilância` acima fala em **treze** itens. A lista vigente passa a ter
**dezesseis** (`W001` a `W016`), em `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`. A
contagem anterior **está preservada** no texto acima, e a correção fica aqui — o adendo **não** é
reescrito, conforme a política de escrita do `/reversa-sync`.

Nenhum outro ponto deste adendo muda: os impactos por artefato, o cenário e a vigência permanecem.
