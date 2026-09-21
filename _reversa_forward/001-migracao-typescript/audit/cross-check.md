# Cross-Check: Migração de JavaScript para TypeScript

> Feature: `001-migracao-typescript`
> Data da auditoria: `2026-09-17`
> Revisão 6: `2026-09-17` — auditoria completa e independente, refeita **depois** de A020,
> A021 e A022 terem sido corrigidos. Re-medida por comando, com sonda adversarial, e não por
> leitura do que foi escrito na rodada de correção.
>
> **Resultado:** **0 achados**. Nenhum CRITICAL, HIGH, MEDIUM ou LOW.
>
> **Numeração de IDs:** a série continua (A001…A022) e a seção 6 preserva o mapa completo,
> porque os artefatos citam esses IDs (`A003`, `A005`, `A009`, `A012/A013` em `actions.md`,
> `requirements.md`, `onboarding.md`, `legacy-impact.md` e `progress.jsonl`; `A020`–`A022` em
> `roadmap.md`). Esta revisão não abriu IDs novos. O relatório da revisão 4 está no histórico
> do Git (`0b65f4d` para a revisão 1, `c7661a5` para o estado aplicado) e o da revisão 5 no
> commit `96e3aa6`.
>
> Artefatos analisados:
> - `_reversa_forward/001-migracao-typescript/requirements.md`
> - `_reversa_forward/001-migracao-typescript/roadmap.md`
> - `_reversa_forward/001-migracao-typescript/actions.md`
>
> Referências cruzadas: `data-delta.md`, `interfaces/` (3 fichas), `investigation.md`,
> `onboarding.md`, `questions.md`, `progress.jsonl`, `regression-watch.md`, `legacy-impact.md`,
> `_reversa_sdd/addenda/001-migracao-typescript.md`, `_reversa_sdd/domain.md`,
> `_reversa_sdd/state-machines.md`, `_reversa_sdd/migration/parity_tests/` (26 arquivos),
> `_reversa_sdd/migration/migration_brief.md`, `_reversa_sdd/migration/handoff.md` e o
> código-fonte.
>
> Ganchos: `before-audit` e `after-audit` estão vazios em `.reversa/hooks.yml` — nada a executar.
>
> **Nenhum dos três artefatos foi alterado por esta auditoria.** A única escrita desta revisão é
> este arquivo.

## 1. Resumo

| Severidade | Ocorrências |
|------------|-------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 0 |
| **Total** | **0** |

Os 22 achados das revisões 4 e 5 estão fechados — os 19 primeiros na rodada de aplicação do
Apêndice A e os três últimos (`A020`, `A021`, `A022`) na rodada imediatamente anterior a esta
revisão. O critério de pronto do `roadmap.md` §10 que exige um `cross-check.md` **sem CRITICAL
nem HIGH** está, por medição, satisfeito; marcar a caixa é ato do dono do roadmap, não desta
auditoria.

## 2. Findings

Nenhum. Nenhuma contradição, lacuna de cobertura, identificador fantasma, ciclo de dependência
ou conflito de paralelismo foi encontrado nos três artefatos.

## 3. Conferência dos achados fechados na rodada anterior

| ID (rev. 5) | Como foi fechado | Evidência re-medida nesta revisão |
|-------------|------------------|-----------------------------------|
| A020 | `tsconfig.json` passou a `allowJs: false` (a linha `checkJs` foi removida, pois só teria efeito com `allowJs` ligado) e o `roadmap.md` ganhou a decisão **D-13**, que registra a escolha, a justificativa e a medição; `requirements.md` RF-09 e §9 acompanharam | Leitura do `tsconfig.json` (linha 22: `"allowJs": false`; nenhuma ocorrência de `checkJs` no arquivo). Gate em **0 erros** e **77 arquivos** no programa (58 de aplicação + 19 declarações), igual antes e depois da mudança. **Sonda adversarial:** criados `src/__probe__/sonda.js` e `sonda2.jsx`, `tsc --listFiles` não listou **nenhum** arquivo da sonda — nenhum `.js`/`.jsx` entra no programa — e a sonda foi removida. D-13 existe e é citada por RF-09 |
| A021 | `roadmap.md` §8 passou a registrar também o estado de 2026-09-17 | §8 contém "**46 de 46 ações `[X]`**", coerente com o §Resumo do `actions.md` (46 ações) e com a contagem medida nas tabelas (46 linhas, 0 pendentes). As duas ocorrências remanescentes de "44 de 44" são registros **datados** de 2026-09-15 (roadmap §8 e histórico do actions) e continuam corretas para aquela data |
| A022 | A linha do delta arquitetural deixou de citar "~87 arquivos" e passou a declarar o número conferido | `roadmap.md` §5 declara "38 arquivos legados de aplicação convertidos", com a razão da diferença para os 87 alvos do brief (os 49 `.jsx` de `ui/`). Número conferido no histórico do Git: o conjunto de `.js`/`.jsx` de aplicação sob `src/` chegou a **38** (commit `21d3244`) e hoje é **0**; os 49 `.jsx` de `ui/` são constantes em todos os commits. A única menção restante a "~87" é a linha de histórico que descreve a própria correção |

## 4. Verificações que passaram

### Cobertura

- Os 13 requisitos funcionais existem (RF-01 a RF-13) e todos aparecem no `roadmap.md`; a seção
  3.1 mapeia cada RF para decisão/etapa, incluindo RN-01 a RN-08.
- Os 12 cenários Gherkin de `requirements.md` §7 têm cobertura rastreável por ação ou decisão —
  verificação integral → T042/T043; nome de campo inexistente → T045; status fora do conjunto →
  T032; consentimento incompleto → T031; leitura sem escopo → T033; escopo informado → T035;
  contrato único nos dois modos → T039; usuário offline sem papel → T016; entidade inexistente
  com sugestão → T036 + T046; verificação isolada sem emissão → T002; comportamento preservado →
  T021-T030/T041; paridade manual → T044.
- Zero identificador fantasma: todos os IDs de ação citados no roadmap existem no `actions.md`;
  todos os RF citados existem no `requirements.md`; D-01 a D-13 estão definidos; as três fichas
  de `interfaces/` existem em disco e estão no §7 do roadmap.
- Toda decisão tem materialização ou ausência deliberada e declarada de ação: D-09 (fora de
  escopo), D-10 (apenas documentado), D-12 (congelamento) e D-13 (configuração de verificação).

### Consistência

- **Cobertura do gate, medida:** `tsc -p tsconfig.json --noEmit` termina com código 0;
  `--listFiles` lista **77** arquivos sob `src/`, dos quais **19** são
  `src/components/ui/*.d.ts` — exatamente o que RF-09, o §10 do roadmap e `onboarding.md` §4.2
  declaram. Em disco: 48 `.ts` + 29 `.tsx` = 77, **0** `.jsx` de aplicação, 49 `.jsx` em `ui/`
  preservados, e nenhum `.js`/`.jsx` no programa.
- **Evidência de paridade, medida:** 26 arquivos de cenário (10 de fluxo + 16 de tela) com 55
  cenários (39 + 16) — o número registrado no `requirements.md` (NFR Paridade, §6.1 e §9), no
  `roadmap.md` (D-07 e §9), no `investigation.md` §5 e no `onboarding.md` §4.
- **Sanidade do actions, medida:** 46 ações, 17 `[//]`, 0 pendentes; toda dependência aponta
  para ID existente **e anterior** ao próprio (0 violações → nenhum ciclo possível); nenhum par
  `[//]` compartilha arquivo alvo (0 conflitos, com os alvos corrigidos de T021 e T041);
  `progress.jsonl` com 70 linhas, todas JSON válido.
- **Terminologia e números:** nenhuma menção obsoleta a `main.jsx` como arquivo corrente, a "26
  cenários", a "58 arquivos", a "8 entidades conhecidas" ou a exclusão "não aplicada" no modo
  offline. A sessão de esclarecimentos do `requirements.md` deixou de citar identificadores
  internos do relatório de auditoria (§9 agora declara as três decisões em texto próprio).
- **Regras de domínio no código:** `ConsultationStatus` = `agendada | em_andamento | concluida |
  cancelada` (RN-02) e `AppointmentStatus` = `agendado | confirmado | em_atendimento | concluido
  | cancelado | faltou` (RN-03); `src/types/AccessLog.ts` com as 12 ações de T015;
  `src/types/Template.ts` com os 7 tipos de T014; registro fechado com 9 chaves (8 entidades de
  domínio + `User`), como D-02 declara.
- **RF-10 confere com o disco:** `src/components/medical` tem 9 arquivos (8 `.tsx` +
  `AccessLogger.ts`) e `src/components/appointments` tem 2 `.tsx`, sem `.jsx` em nenhum dos dois.
- **Pendências de `requirements.md` §10:** as duas transferidas (`{DIAS_AFASTAMENTO}` e as 14
  dependências não utilizadas) conferem com `questions.md` DIV-05 e com `RISK-006`.

### Coerência com o legado

- Nenhuma decisão contradiz regra 🟢 do `_reversa_sdd/domain.md`. A inversão de confiança de
  BR-A02 (🟡 e contrária à transição manual) está declarada em RN-03 e congelada em D-12.
- Os conjuntos de status conferem com `state-machines.md` e com o código (medido acima).
- O delta é real e versionado: o histórico do Git mostra o crescimento de `.ts`/`.tsx` sob `src/`
  ao longo da conversão e o número de `.jsx` em `ui/` constante em 49 em todos os commits,
  inclusive nos anteriores à migração.
- A promessa de RF-09 tem hoje exatamente uma exclusão registrada — o corpo `.jsx` da pasta
  herdada — **e essa promessa passou a ser fiscalizada pela própria configuração**: com
  `allowJs: false`, um `.js`/`.jsx` novo sob `src/` não entra no programa verificado (sonda
  adversarial desta revisão).
- O `requirements.md` mantém a correção de premissa sobre o ponto de partida (1.324 erros em 81
  arquivos, não 677 em 43), coerente com `roadmap.md` §1 e `investigation.md` §2.

## 5. Nota de método

- Apenas leitura nos três artefatos. Medições: contagem e listagem de arquivos em disco;
  `tsc -p tsconfig.json --noEmit` e `--listFiles` (sem emissão); criação e remoção de arquivos
  de sonda em `src/__probe__/` para o teste adversarial (a árvore foi restaurada — a sonda não
  existe mais e o gate voltou a 0 erros); `git ls-tree`/`git log` para o estado versionado;
  contagem de cenários por arquivo `.feature`; parse das tabelas de `actions.md` para
  dependências, paralelismo e status; parse linha a linha de `progress.jsonl`.
- **Limite de independência, declarado:** esta revisão foi escrita pelo mesmo agente que aplicou
  as correções de A020–A022. A mitigação não é retórica: nenhuma afirmação aqui vem da leitura
  do que foi escrito naquela rodada — todas as contagens e o teste adversarial foram refeitos
  por comando nesta revisão, e o resultado do portão é reprodutível por qualquer pessoa com
  `npm run typecheck`.
- Os IDs `A001`–`A022` pertencem às revisões anteriores; esta revisão não reutilizou nem criou
  IDs.

## 6. Mapa de IDs (A001–A022)

| ID | Revisão | Assunto | Estado |
|----|---------|---------|--------|
| A001 | 4 | Roadmap defasado em relação à entrega | fechado — `roadmap.md` §8 e §10 |
| A002 | 4 | T005 marcada `[X]` sem o entregável exigido | fechado — RF-09, §9, T005, D-01 |
| A003 | 4 | Evidência de cobertura declarava 58 em vez de 77 | fechado — RF-09, `onboarding.md` §4.2 |
| A004 | 4 | Módulos e declarações novos fora do roadmap | fechado — `roadmap.md` §5 |
| A005 | 4 | RF-10 sem cobertura e em conflito com RF-09/D-01 | fechado — RF-10, §8, §3.1 |
| A006 | 4 | RN-03 elevava a 🟢 regra que o legado marca como inferida | fechado — RN-03, D-12 |
| A007 | 4 | "Nenhuma lacuna em aberto" com lacuna registrada fora do documento | fechado — `requirements.md` §10 |
| A008 | 4 | Ficha do armazenamento offline contradizia o comportamento entregue | fechado — `interfaces/mock-local-storage.md` |
| A009 | 4 | `src/main.jsx` era a segunda exceção não registrada | fechado — `src/main.tsx` + `index.html` (commit `b93e208`) |
| A010 | 4 | Registro com 9 chaves descrito como 8 | fechado — D-02 e ficha §2.2 |
| A011 | 4 | "26 cenários" em vez de 26 arquivos / 55 cenários | fechado — três pontos do requirements, D-07, roadmap §9, `investigation.md` §5 |
| A012 | 4 | Cenário de nome de campo sem verificação negativa | fechado — T045 executada |
| A013 | 4 | Cenário de entidade inexistente exigia sugestão do nome correto | fechado — T046 executada |
| A014 | 4 | Alvos de T021/T041 divergentes do executado | fechado — `actions.md` |
| A015 | 4 | Nomes `.js` no roadmap e `SendEmail` fora do §7 | fechado — `roadmap.md` §5/§7, ficha §2.4 |
| A016 | 4 | Comportamentos congelados sem decisão no roadmap | fechado — D-12 |
| A017 | 4 | Cabeçalho do `actions.md` descrevia o estado inicial | fechado — cabeçalho, resumo, histórico |
| A018 | 4 | `allowedPaths` do `legacy-impact.md` incompleto | fechado — `docs/**` |
| A019 | 4 | RF-13 permanecia na numeração sem razão declarada | fechado — RF-13 |
| A020 | 5 | `allowJs`/`checkJs` inertes e decisão sem registro no roadmap | fechado — D-13, `allowJs: false`, sonda adversarial |
| A021 | 5 | "44 de 44" sem o estado posterior no roadmap | fechado — §8 com o estado de 17/09 |
| A022 | 5 | "~87 arquivos" não descrevia o delta | fechado — §5 com 38 arquivos conferidos no Git |

## 7. Disposição e próximo passo

Não há achado a dispor. O relatório fica como registro de conformidade desta revisão, e as
citações a IDs de revisões anteriores continuam resolvendo pela tabela da seção 6.

Com 0 CRITICAL e 0 HIGH, o caminho sugerido é **`/reversa-coding`** para o que ainda falta fora
do escopo desta feature — lembrando que a única pendência declarada em `requirements.md` §10 que
toca código é a remoção das 14 dependências não utilizadas, que exige reconfirmação por busca e
aprovação explícita antes de qualquer remoção (`RISK-006`). A re-extração reversa segue
recomendada, não obrigatória.

---
*Gerado pelo Reversa-Audit em 2026-09-17.*
