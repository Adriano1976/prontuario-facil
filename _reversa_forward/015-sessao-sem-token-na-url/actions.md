# Actions: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Roadmap: `_reversa_forward/015-sessao-sem-token-na-url/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 22 |
| Paralelizáveis (`[//]`) | 12 |
| Maior cadeia de dependência | 9 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Ler o `roadmap.md`, o `data-delta.md` e o `onboarding.md` e fixar as duas metades do escopo: o que esta feature fecha e o que permanece na plataforma | - | `[//]` | `_reversa_forward/015-sessao-sem-token-na-url/` | 🟢 | [X] |
| T002 | Ler `.reversa/reversa-config.json` e confirmar que `src/**` está liberado antes da primeira escrita fora das pastas do Reversa | - | `[//]` | `.reversa/reversa-config.json` | 🟢 | [X] |
| T003 | Medir a linha de base dos quatro portões antes de tocar em código, para que a comparação de T014 tenha termo de partida | - | `[//]` | - | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Provar a não-adoção e a não-persistência: com `?access_token=` na URL, nenhuma chave de credencial é gravada e nenhuma requisição carrega o valor (RF-01, RF-02, RF-08) | T001 | `[//]` | `src/lib/__tests__/appParams.test.ts` | 🟢 | [X] |
| T005 | Provar a ordem: a URL é limpa **antes** de `from_url` capturar o endereço, de modo que `base44_from_url` nunca receba credencial (R-08, `data-delta.md#4`) | T004 | - | `src/lib/__tests__/appParams.test.ts` | 🟢 | [X] |
| T006 | Provar a limpeza de resíduo restrita às duas chaves de credencial, com as chaves `mock_db_*` do modo offline preservadas (RF-05, D-06, R-02) | T005 | - | `src/lib/__tests__/appParams.test.ts` | 🟢 | [X] |
| T007 | Provar a sessão sem credencial legível: a verificação é tentada, **uma nova montagem do provedor mantém a sessão autenticada** com o armazenamento vazio, falha de rede é distinguível de ausência de sessão, e sem sessão válida o erro existente é exibido sem redirecionar (RF-04, RF-06, RF-12, RF-13) | T001 | `[//]` | `src/lib/__tests__/AuthContext.test.tsx` | 🟢 | [X] |
| T022 | Provar, no nível da **aplicação**, o que o contexto não alcança: falha de verificação exibe o estado distinguível **sem** chamar o redirecionamento ao login, e ausência de sessão **continua** levando ao login (RF-12, RF-13) | T001 | `[//]` | `src/__tests__/SessaoIndisponivel.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Cortar a gravação da credencial e parar de adotar o token da URL, preservando a retirada do parâmetro e a ordem de avaliação do módulo (RF-01, RF-02, RF-03, D-01 a D-04) | T004 | `[//]` | `src/lib/app-params.ts` | 🟢 | [X] |
| T009 | Remover o resíduo das duas chaves de credencial na carga, sem alcançar as chaves `mock_db_*` (RF-05, D-06) | T008 | - | `src/lib/app-params.ts` | 🟢 | [X] |
| T010 | Retirar a decisão de sessão de `hasSessionToken`, para a verificação não depender de credencial legível pelo cliente (RF-04, D-05) | T007 | `[//]` | `src/api/base44Client.ts` | 🟢 | [X] |
| T011 | Separar falha de rede de ausência de sessão e exibir o estado de erro existente sem redirecionar (RF-12, RF-13, D-07, D-08) | T010 | - | `src/lib/AuthContext.tsx` | 🟢 | [X] |
| T012 | Atualizar o comentário de paridade de `app-params.ts`, que passa a afirmar o que de fato vale (D-09, R-07) | T009 | - | `src/lib/app-params.ts` | 🟢 | [X] |
| T021 | Renderizar o estado de **falha de verificação** sem redirecionar, preservando o redirecionamento ao login apenas para a **ausência de sessão** — hoje o `App` chama `navigateToLogin()` para `auth_required` e ignora qualquer outro tipo (RF-12, RF-13, D-07, D-08) | T011 | - | `src/App.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | Atualizar as provas herdadas que o contrato novo quebra — as que dependem de credencial no armazenamento para montar a sessão | T006, T011 | - | `src/lib/__tests__/AuthContext.test.tsx` | 🟢 | [X] |
| T014 | Rodar os quatro portões — incluindo a suíte de modo offline **sem alteração**, que é a prova de que a limpeza não alcançou as chaves de dados — e conferir contra a linha de base registrada em T003 (RF-07, RF-09) | T012, T013, T021, T022 | - | - | 🟢 | [X] |
| T015 | Falsificar a não-persistência: reintroduzir a gravação, conferir a falha da prova e reverter sem resíduo (RF-08) | T014 | - | `src/lib/app-params.ts` | 🟢 | [X] |
| T016 | Falsificar a ordem: inverter `access_token` e `from_url`, conferir a falha pelo sinal nomeado e reverter sem resíduo (R-08) | T015 | - | `src/lib/app-params.ts` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T017 | Escrever o `legacy-impact.md` declarando a paridade rompida de propósito e o que permaneceu intocado (RF-14, D-09) | T016 | `[//]` | `_reversa_forward/015-sessao-sem-token-na-url/legacy-impact.md` | 🟢 | [X] |
| T018 | Escrever o `regression-watch.md` com os dois itens vigiados: a ausência de gravação das duas chaves **e** a ordem entre `access_token` e `from_url` (RF-14) | T016 | `[//]` | `_reversa_forward/015-sessao-sem-token-na-url/regression-watch.md` | 🟢 | [X] |
| T019 | Atualizar a matriz: seção da correção do F-02, estado do achado de ⛔ para 🟡 parcial e as medições novas (RF-10) | T014 | `[//]` | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T020 | Conferir por `git status --porcelain` que nenhum arquivo fora de `src/**` e das pastas do Reversa foi tocado | T019 | `[//]` | - | 🟢 | [X] |

## Notas de execução

**Divergência de formato, consciente e registrada.** A coluna `Status` desta tabela termina em `| [ ] |` **sem crase**, embora o template `.reversa/templates/actions-template.md` a mostre como `` `[ ]` ``. A detecção de estágio do `/reversa-forward` procura a linha terminando em `| [ ] |` ou `| [X] |` — com a crase, nenhuma ação é encontrada e a feature é lida como `vazio`. É a mesma divergência deliberada já registrada nas features `002` a `010` e na `014`. **Não "conserte" isto de volta para o formato do template**: o template está errado quanto a isto, e a detecção é o que importa.

**A ordem de T008 e T010 não é preferência.** Aplicar T008 sem T010 produz uma aplicação que **desloga a cada recarga**, porque a verificação de sessão depende de credencial legível (R-01). As duas pertencem à mesma passada; se a execução for interrompida entre elas, o estado intermediário é um defeito, não um progresso.

**T015 e T016 são falsificações, não verificações.** Uma prova que passa não vale nada até ser vista falhar. Se qualquer das duas não produzir falha, a prova não mede o que diz medir — e o defeito é da prova, não do código.

**O que nenhuma ação aqui fecha.** O trânsito da credencial na URL (RF-11, RN-07) é da plataforma. Nenhuma ação desta lista deve tentar contorná-lo no cliente, e T019 tem de registrar o estado como 🟡 parcial, nunca ✅.

**Resoluções da auditoria de 2026-09-24.** O `audit/cross-check.md` registrou 1 HIGH e 3 MEDIUM. Esta rodada de revisão manual os fechou **sem renumerar ação alguma e sem reciclar ID**:

| Achado | O que foi feito |
|--------|-----------------|
| **A001** (HIGH) | `T007` passou a afirmar o **observável**, e não só o mecanismo: com o armazenamento vazio, uma **nova montagem do provedor mantém a sessão autenticada**. Antes, o cenário "recarga mantém a sessão" atravessava as 20 ações sem ser medido por nenhuma |
| **A002** (MEDIUM) | `T007` incorporou a metade sem prova do `RF-13`: sem sessão válida, o erro existente é exibido e **não** há redirecionamento |
| **A003** (MEDIUM) | O critério de pronto do `roadmap.md` ganhou o item dos quatro portões, que até então só existia nas ações |
| **A004** (MEDIUM) | `T014` passou a **nomear** a suíte de modo offline, fechando o `D-10`, que não tinha ação com o offline no alvo declarado |
| **A005**, **A006**, **A007** (LOW) | Fechados por nota de cobertura no `roadmap.md#3`, por justificativa do desvio de citação no `roadmap.md#5` e pela correção da citação no `requirements.md#2` |

As contagens do resumo foram atualizadas para **21 ações**: nenhuma das 20 originais foi removida, e `T021` foi acrescentada na reconhecimento da codificação.

**Ação `T021`, acrescentada na reconhecimento da codificação.** O `T011` tem `src/lib/AuthContext.tsx` como alvo e cita `RF-12` e `RF-13` — mas os dois observáveis vivem em `src/App.tsx`, que **nenhuma ação alcançava**. Duas razões, ambas verificadas em `src/App.tsx:81-89`: hoje `auth_required` **é** o redirecionamento automático ao login, e é por ele que qualquer visitante sem sessão entra no sistema; e um erro de tipo não reconhecido **não é tratado**, de modo que o `if` não casa e a aplicação renderiza as rotas assim mesmo. Sem tocar esse arquivo, nem o estado distinguível do `RF-12` apareceria, nem o `RF-13` teria onde valer.

O `RF-13` foi **reescopado**: o redirecionamento permanece para a **ausência de sessão** e sai apenas da **falha de verificação**. Implementá-lo ao pé da letra quebraria a entrada do sistema — e o erro de premissa foi da pergunta feita na sessão de esclarecimentos, não da resposta.

Com a ação nova: **21 ações** e **11 `[//]`**; a maior cadeia seguiu **9**, porque `T021` entrou num ramo já existente (`T011 → T021 → T014`).

**Ação `T022`, acrescentada na segunda auditoria (achado A001 daquela rodada).** A revisão anterior corrigiu o alvo da **implementação** e deixou intacto o alvo da **prova**. O `T007` afirma o observável reescopado e aponta para `src/lib/__tests__/AuthContext.test.tsx`, onde se prova que a verificação é tentada, que o tipo de erro é distinguível e que o contexto não chama `redirectToLogin` — mas **não** que a aplicação **exibe** o estado em vez de redirecionar. Essa decisão vive no `if (authError)` do `App`. A prova passa a ter alvo próprio, em `src/__tests__/`, onde o corpus já tem três provas de nível de aplicação.

Contagens finais: **22 ações**, **12 `[//]`**, maior cadeia **9**.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-to-do` | reversa |
