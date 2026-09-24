# Impacto no Legado: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Âncora de contexto: **legado** — `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`
> Extração de referência: `_reversa_sdd/`, `_reversa_sdd/migration/`

> ⚠️ **Diferente das features `001` a `010`, esta alterou arquivos de aplicação.** Não é uma feature
> de prova: é uma correção de comportamento. Por isso este `legacy-impact.md` descreve **regras que
> mudaram**, e o `/reversa-sync` tem aqui o delta que faltava para convergir a extração.

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido antes da primeira escrita fora das pastas do Reversa:

| Campo | Valor observado |
|-------|-----------------|
| `allowLegacyEdits` | `true` |
| `allowedPaths` | `["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]` |
| Caminhos que a feature precisou | `src/**` (aplicação e provas) e `_reversa_sdd/**` / `_reversa_forward/**` / `.reversa/**` (pastas próprias do Reversa) |
| Resultado | **Liberados** — os caminhos de aplicação casam com o glob `src/**`; as pastas do Reversa não dependem da config |

Nenhuma liberação irrestrita foi necessária, nenhum caminho fora da lista foi pedido, e a config
**não foi alterada** por esta feature. O `base44/entities/*.jsonc` (schemas e RLS) **não foi tocado**.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/App.tsx` | Guarda de rota por papel | `regra-alterada` | **MEDIUM** | Passa a guardar **uma** rota — `/AccessLogs`. O aviso de acesso negado sai do corpo do render para um efeito, e o `useNavigate`/`navigate` morto foi removido |
| `src/Layout.tsx` | Navegação principal | `regra-alterada` | **MEDIUM** | O item da trilha passa a `adminOnly` e é filtrado por papel; **Médicos e Templates seguem visíveis** (`BR-MIGRAR-017`/`020`). A sessão passa a ser lida por `useCurrentUser` |
| `src/pages/Doctors.tsx` | Tela de Médicos | `regra-alterada` | **MEDIUM** | Criar, editar e excluir deixam de ser oferecidos a quem não é admin (`BR-MIGRAR-015`). A lista continua visível |
| `src/pages/Templates.tsx` | Tela de Templates | `regra-alterada` | **MEDIUM** | Idem (`BR-MIGRAR-020`), **incluindo** o botão "Criar Primeiro Template" do estado vazio |
| `src/pages/AccessLogs.tsx` | Leitura da trilha | `regra-alterada` | **MEDIUM** | A leitura passa a declarar escopo administrativo (`asAdmin`); para escopo de dono, responde vazio **sem consultar o servidor**. Limite e ordenação intactos (`('-created_date', 500)`, AMB-004) |
| `src/api/scopedRead.ts` | Contrato `OwnedEntity` | `contrato-alterado` | **MEDIUM** | `update(scope, id, data)` e `delete(scope, id)` passam a **exigir** o escopo (`BR-MIGRAR-034`). A implementação é pass-through: o escopo **não** altera a chamada |
| `src/api/mockClient.ts` | Usuário offline | `regra-alterada` | **LOW** | **Reversão**: `role: 'admin'` sai do `OFFLINE_USER`. O valor volta a ser `id`, `email` e `full_name`, como `src/types/User.ts` declara |
| `src/components/ui/chart.jsx` | `ChartStyle` | `regra-alterada` | **LOW** | O CSS deixa de ser injetado por `dangerouslySetInnerHTML` e passa a ser entregue como texto (achado F-05) |
| `src/components/ui/chart.d.ts` | Sombra de tipo | `componente-novo` | **LOW** | Era o único componente de `components/ui` sem `.d.ts` — a ausência era a evidência de que ninguém o importava |
| `src/lib/useCurrentUser.ts` | Leitura da sessão | `componente-novo` | **LOW** | Ponto único de leitura do usuário da sessão para a interface; lê o papel, **não** autoriza |
| `src/test/setup.ts` | Arnês de prova | `componente-novo` | **LOW** | Tapa a lacuna de `matchMedia` no jsdom, exigida pelo provedor de tema — segue o padrão que o arquivo já usava para `scrollIntoView` e `pointerCapture` |
| `src/pages/{PatientForm,NewConsultation,Appointments,PatientDetail}.tsx` | Pontos de escrita | `regra-alterada` | **LOW** | As quatro chamadas de `update`/`delete` passam a declarar o escopo, resolvido por `resolveScope` como as leituras da mesma tela já faziam |
| `src/__tests__/Layout.test.tsx` | Prova do menu | `regra-alterada` | **LOW** | **Reescrita**: media que a navegação não consultava papel; passa a medir o contrário, nos dois sentidos |
| `src/__tests__/RbacRotas.test.tsx` | Prova do roteamento (novo) | `componente-novo` | **LOW** | 4 verificações: não-admin recusado na trilha e **aceito** em Médicos e Templates |
| `src/__tests__/GuardasDeAcao.test.tsx` | Prova das guardas de ação (novo) | `componente-novo` | **LOW** | 6 verificações sobre o que não é oferecido, incluindo o botão do estado vazio |
| `src/__tests__/ChartStyle.test.tsx` | Prova do sink removido (novo) | `componente-novo` | **LOW** | Alimenta o componente com cor hostil e afirma que nada executável nasce no DOM |
| `src/test/verificacoes-negativas.mjs` | Arnês de compilação | `regra-alterada` | **LOW** | Ganha `mutacao-sem-escopo` e `atualizacao-sem-escopo`; o arnês vai de 16 para **18 casos** |
| `src/pages/__tests__/{PatientForm,Appointments,PatientDetail,NewConsultation}.test.tsx` | Provas das telas | `regra-alterada` | **LOW** | Seis asserções passam a afirmar o escopo como primeiro argumento — ficaram mais fortes, não mais frouxas |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganha as seções das correções F-01, F-03, F-04 e F-05, a tabela viva dos cinco achados, as medições de 2026-09-24, a contagem nova do arnês e a correção da nota do `lint` |
| `_reversa_sdd/addenda/011-rbac-frontend.md` | Adendo da correção do F-01 (novo) | `componente-novo` | **LOW** | Registro canônico da mudança de comportamento do RBAC |
| `_reversa_sdd/pendencias-de-convergencia.md` | Registro de convergência (novo) | `componente-novo` | **LOW** | Diz, artefato por artefato, o que os adendos declararam e não foi aplicado — inclusive as edições feitas à mão por esta sessão |
| `_reversa_forward/{011,012,013}/regression-watch.md` | Watches (novos) | `componente-novo` | **LOW** | As propriedades que precisam continuar verdadeiras |
| `_reversa_sdd/{dashboard/requirements,modo-offline/requirements,code-analysis,gaps,inventory,dependencies}.md` | Extração | `regra-alterada` | **LOW** | Vereditos e contagens aplicados **à mão, fora do rito** — a próxima `/reversa` os sobrescreve. Declarado em `pendencias-de-convergencia.md` |
| `_reversa_sdd/migration/{parity_specs,handoff}.md` e `parity_tests/{08,09}.feature` | Artefatos de migração e cenários | `regra-alterada` | **LOW** | Contagens corrigidas e blocos de veredito por cenário |

## Diff conceitual por componente

### 1. A guarda de papel separa ROTA de AÇÃO (F-01)

O achado dizia que "menu e rotas administrativas estão expostos a qualquer autenticado". A correção
não podia tratar as três telas igual, porque o corpus **já distinguia** as duas situações:

- **Trilha de auditoria** — leitura admin-only (`BR-MIGRAR-024`): ganha guarda de **rota**, e o item de
  menu some para quem não é admin. A nota de `code-analysis.md#5.1` ("somente admins veem a tela"), que
  o adendo `006` teve de declarar imprecisa, **volta a ser verdadeira**.
- **Médicos e Templates** — leitura livre para autenticados (`BR-MIGRAR-017`/`020`), escrita restrita:
  as **páginas continuam acessíveis**, e o que some são as ações de criar, editar e excluir.

> **A primeira tentativa errou exatamente aqui**, e a recusa ficou registrada: ela guardava as três
> rotas — restringindo leitura que a regra libera — e, para a guarda passar em modo offline,
> acrescentava `role: 'admin'` ao `OFFLINE_USER`, promovendo o usuário de demonstração a administrador
> num modo que **não aplica RLS**. As duas coisas foram revertidas.

### 2. O escopo passa a ser exigido também na escrita (F-03)

`BR-MIGRAR-034` já mandava tornar o escopo **obrigatório por tipos** em query *e* mutation. A leitura
tinha recebido essa camada (`ScopedReader`); `update` e `delete` seguiam endereçando o registro por
identificador sem exigir nada. A correção fecha a metade que faltava.

**O que ela não é, e é preciso ler com atenção:** a implementação recebe o escopo e **não altera a
chamada**. Quem decide a posse continua sendo a regra de acesso do servidor. O que a camada entrega é
**obrigatoriedade de contrato** — e a própria `BR-MIGRAR-034` diz que "o compilador não valida
autorização em runtime". Verificar posse no cliente duplicaria a RLS e não barraria um cliente
adulterado.

### 3. A leitura da trilha declara o seu escopo (F-04)

A leitura saía pelo repositório **cru** — enquanto a **inserção** na mesma entidade já declarava o seu
(`AccessLogger.ts:60`). Era a única operação da trilha sem escopo. Agora ela passa por `asAdmin`, e o
caminho de quem não é admin responde vazio **sem consultar o servidor**: antes, "admin lendo a trilha"
e "qualquer um lendo a trilha" eram o **mesmo código**.

> **Precisão sobre o achado:** a cláusula "sem filtro de tenant/organização" **não é implementável** —
> `base44/entities/AccessLog.jsonc` tem oito propriedades e nenhuma de inquilino. O isolamento do
> projeto é por **dono** nas entidades clínicas, e a trilha não tem dono: a RLS dela é por **papel**.

### 4. O sink de HTML sai sem trocar comportamento por outro (F-05)

`ChartStyle` injetava as regras de cor com `dangerouslySetInnerHTML`. Passa a entregá-las como texto,
que o React grava por `textContent` — não interpretado como marcação.

**A recomendação literal da auditoria (propriedades customizadas inline) foi recusada de propósito:**
as regras têm duas variantes de tema (`light` e `.dark`), e uma propriedade inline não expressa a
variante escura. Aplicá-la trocaria um achado de **baixa** severidade por um defeito latente de tema —
e o componente **não tem consumidor**, então a regressão passaria despercebida.

### 5. O F-02 fica fora, com a evidência medida

`src/lib/app-params.ts` lê `access_token` da query string e o grava em `localStorage`. Mas o **SDK faz
o mesmo sozinho**: em `@base44/sdk/dist/client.js:123` o `createClient` executa `token ||
getAccessToken()`, e `getAccessToken()` tem por default `saveToStorage: true` e
`paramName: 'access_token'` (`dist/utils/auth-utils.js:38`). Apagar o tratamento do `app-params.ts`
**não removeria a exposição**, e `CreateClientConfig` não expõe opção para desligar isso.

**O que fecharia o achado:** deixar de receber sessão por `?access_token=`, apoiando-se na sessão por
cookie `httpOnly` que o próprio SDK referencia (`dist/modules/auth.js:170`). É decisão de
**plataforma/deployment**, não deste repositório — e por isso aqui não há ação de código.

## O que o `/reversa-sync` deve convergir a partir daqui

As regras de negócio **não mudaram**: cada mudança decorre de `BR-MIGRAR` que já existia. O que mudou
foi a **aplicação** delas no frontend, e é isso que a extração precisa absorver — em especial:

1. `code-analysis.md#5.1` (logs-acesso) — a nota "somente admins veem a tela" volta a ser precisa.
2. `code-analysis.md#3` (medicos e templates) — as telas passam a esconder as ações de escrita.
3. `code-analysis.md` (contrato e componentes de UI) — `OwnedEntity` exige escopo na escrita, e o
   componente de gráficos não usa o sink.
4. `permissions.md` — a matriz RBAC passa a ter contraparte explícita no cliente.
