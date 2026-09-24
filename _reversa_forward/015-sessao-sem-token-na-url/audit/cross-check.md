# Cross-check: `015-sessao-sem-token-na-url`

> Data: `2026-09-24` (segunda rodada)
> Identificador da feature: `015-sessao-sem-token-na-url`
> Artefatos analisados:
> - `_reversa_forward/015-sessao-sem-token-na-url/requirements.md`
> - `_reversa_forward/015-sessao-sem-token-na-url/roadmap.md`
> - `_reversa_forward/015-sessao-sem-token-na-url/actions.md`
>
> Este relatório é **leitor**. Nenhum dos três artefatos foi alterado — ver a seção final.
>
> **Rodada anterior:** registrou 1 HIGH e 3 MEDIUM (`A001`–`A004`) e 3 LOW (`A005`–`A007`). Todos foram resolvidos por revisão manual em 2026-09-24, e os IDs sobrevivem citados por nome em `actions.md` (Notas de execução), `roadmap.md` (histórico) e `requirements.md` (histórico). Esta rodada é um retrato novo, não uma continuação daquele.

## Resumo

| Severidade | Quantidade |
|------------|-----------:|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 0 |
| **Total** | **2** |

## Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A001 | **HIGH** | Cobertura | A prova de `RF-12` e `RF-13` não cabe no alvo declarado. `T007` aponta para `src/lib/__tests__/AuthContext.test.tsx`, e o observável reescopado — *"exibe um estado distinguível **sem chamar o redirecionamento**"* — é do `App`. No nível do contexto prova-se que `redirectToLogin` não é chamado e que o tipo de erro é distinguível; **não** se prova que a aplicação renderiza em vez de redirecionar. Falta ação cujo alvo seja uma prova de nível de `App`, como as que já existem em `src/__tests__/` | `requirements.md#7` × `actions.md` Fases 2 e 3 |
| A002 | MEDIUM | Consistência | O **delta arquitetural** do roadmap não lista `src/App.tsx`, embora `T021` o altere. O documento afirma um conjunto de componentes alterados que a própria lista de ações desmente — e é desse delta que o `legacy-impact.md` vai ser derivado | `roadmap.md#5` × `actions.md` `T021` |

## Detalhe do finding HIGH

### A001 — a prova do reescopo não tem onde morar

**Impacto.** A revisão manual desta rodada reescopou o `RF-13` e acrescentou `T021`, com `src/App.tsx` como alvo, porque foi ali que os observáveis de `RF-12` e `RF-13` se revelaram. O alvo da **implementação** foi corrigido; o alvo da **prova** não.

O `T007` foi ampliado na rodada anterior justamente para afirmar o observável, e continua apontando para `src/lib/__tests__/AuthContext.test.tsx`. Nesse arquivo é possível provar:

- que a verificação é tentada sem credencial legível;
- que o tipo de erro da falha de verificação é **distinguível** do de ausência de sessão;
- que o contexto **não** chama `redirectToLogin` numa falha.

O que **não** é possível provar ali é o que o cenário de aceitação afirma literalmente: que a aplicação **exibe** o estado distinguível e **não** redireciona. Essa decisão vive em `src/App.tsx:81-89`, no `if (authError)`. Sem uma prova de nível de `App`, o `RF-13` fica com implementação e sem medição — exatamente o formato que a rodada anterior deste relatório apontou no `A001` antigo, agora um nível mais fundo.

**Direção da correção.** Acrescentar ação de prova cujo alvo seja um arquivo de `src/__tests__/` — o corpus já tem três provas nesse nível (`Layout.test.tsx`, `RbacRotas.test.tsx`, `GuardasDeAcao.test.tsx`), e `RbacRotas.test.tsx` já substitui `useAuth`, o que é o padrão necessário aqui. Como isso mexe em `actions.md`, a correção é por edição manual — **este skill não corrige**.

## Nota de método: um eixo que faltava

A rodada anterior verificou **cobertura** — todo requisito tem decisão, toda decisão tem ação — e verificou que as ações **citam** os requisitos. O que ela não verificou foi se o **arquivo alvo** da ação é capaz de produzir o observável que o requisito descreve. Foi por essa fresta que passou o `App.tsx` inteiro: o `T011` citava `RF-12` e `RF-13` corretamente, e o alvo é que não fechava.

O eixo está aplicado nesta rodada, e é ele que sustenta os dois findings acima. Fica registrado como quinto eixo a incorporar: **"o alvo da ação sustenta o observável do requisito"**. Ele é diferente dos quatro originais porque não se resolve lendo os três documentos — exige abrir o código que os artefatos citam.

## Itens verificados que passaram

### Cobertura

- Os 14 requisitos funcionais têm decisão (`D-xx`), item de critério de pronto, ou ação que os implementa — os quatro de processo estão declarados em `roadmap.md#3` como cobertos por critério de pronto, o que fecha o `A005` da rodada anterior.
- As 11 decisões técnicas têm ação correspondente, `D-08` agora com `T021`.
- **O eixo novo, percorrido requisito a requisito:** o alvo de cada ação sustenta o observável do seu requisito — `RF-01`/`RF-02`/`RF-03`/`RF-05` em `app-params.ts` (`T008`, `T009`); `RF-04` em `base44Client.ts` e `AuthContext.tsx` (`T010`, `T011`); `RF-12` e `RF-13` em `AuthContext.tsx` **e** `App.tsx` (`T011`, `T021`) — a implementação está coberta; `RF-14` em `T017`/`T018`. **A única exceção é a prova de `RF-12`/`RF-13`**, que é o A001.
- 10 dos 11 cenários Gherkin têm ação correspondente; o reescopado ("falha de verificação não redireciona, ausência de sessão leva ao login") é o A001.

### Consistência

- **Terminologia.** "Credencial de sessão" e "token" continuam declarados sinônimos na primeira ocorrência (`requirements.md#2`), e os três documentos os usam nessa chave. O vocabulário novo do reescopo — "falha de verificação" × "ausência de sessão" — é usado com o mesmo sentido em `RF-12`, `RF-13`, `RN-08`, `D-07` e `D-08`.
- **Identificadores.** `RF-01` a `RF-14`, `D-01` a `D-11`, `R-01` a `R-08`, `T001` a `T021`, `BR-MIGRAR-039`, `BR-OFF10` — todos existem nos documentos que os definem.
- **A premissa corrigida não deixou resíduo.** A expressão "tela de erro de sessão que já existe" sobrevive em `requirements.md:216`, dentro da resposta Q3 **preservada de propósito**, e é imediatamente seguida da nota de reescopo. Não há nenhuma outra passagem do corpus que nomeie uma tela inexistente — conferido por varredura de `auth_required`, "tela de erro de sessão" e "já existente".
- **Dependências.** As 21 ações apontam apenas para IDs existentes; nenhuma aponta para fora da lista.
- **Paralelismo.** As 11 tarefas `[//]` não compartilham arquivo alvo. `T021`, que é `-`, não disputa arquivo com nenhuma delas.
- **Ciclos.** Nenhum. Verificado por caminho mais longo com memoização, que retornou **9** terminando em `T017` — igual ao valor declarado. `T021` entrou num ramo existente (`T011 → T021 → T014`) e **não** alongou a cadeia, o que o resumo do `actions.md` afirma corretamente.
- **Detecção de estágio.** As **21** linhas de ação terminam em `| [ ] |`, sem crase — o que o `/reversa-forward` procura. A divergência em relação ao template segue declarada em "Notas de execução".

### Coerência com o legado

- Nenhuma decisão do roadmap contradiz regra 🟢 do `_reversa_sdd/domain.md`: a busca por "sessão", "token", "autentica", "LGPD" e "localStorage" nesse arquivo não devolve nenhuma ocorrência.
- Os componentes citados existem e são os reais: `app-params`, `base44Client`, `AuthContext`, e agora `App`.
- O reescopo do `D-08` é coerente com o legado em vez de contra ele: **preserva** o redirecionamento que hoje leva qualquer visitante sem sessão ao login, e restringe a mudança ao caso que o achado F-02 justifica.
- O modo offline mantém contrato próprio (`BR-MIGRAR-039`, `BR-OFF10`) e não é alcançado pela limpeza, restrita a duas chaves de credencial.
- A divergência de paridade declarada (`RN-09`, `D-09`) tem precedente no corpus — F-01 e F-04 romperam paridade com o mesmo rito.

## Sobre a integridade deste relatório

Nenhum dos três artefatos auditados foi alterado. Este skill escreve **apenas** `feature-dir/audit/cross-check.md`, e foi o que fez — com rewrite completo, conforme a regra, o que substituiu a rodada anterior. Os IDs `A001`–`A007` daquela rodada **não se perderam**: continuam citados por nome nos três artefatos, junto do que foi feito para cada um.

Os IDs desta rodada são novos e **não** continuam a numeração anterior: `A001` aqui é um achado diferente do `A001` de antes. É ambíguo por construção, e fica registrado como tal em vez de silenciado.

## Próximo passo

Há **1 HIGH**. A recomendação é **revisão manual antes de seguir**: resolver A001 exige acrescentar uma ação de prova em `actions.md`, e o A002 corrigir o delta arquitetural do `roadmap.md`. Este skill não corrige nenhum dos dois.

Resolvidos, o caminho é `/reversa-coding`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Primeira rodada: 1 HIGH, 3 MEDIUM, 3 LOW (`A001`–`A007`), todos resolvidos por revisão manual | reversa |
| 2026-09-24 | Segunda rodada, após o reescopo do `RF-13` e a entrada de `T021`: 1 HIGH, 1 MEDIUM. Eixo novo aplicado — "o alvo da ação sustenta o observável do requisito" | reversa |
