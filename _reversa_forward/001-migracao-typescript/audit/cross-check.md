# Cross-Check: Migração de JavaScript para TypeScript

> Feature: `001-migracao-typescript`
> Data da auditoria: `2026-09-17`
> Revisão 2: `2026-09-17` — A010 com escopo estreitado após conferência do código; acrescentados
> os apêndices de disposição dos achados e de plano de patch (proposta, nada aplicado).
> Revisão 3: `2026-09-17` — decisões humanas registradas (**1A, 2A, 3A1**); A002, A003, A005,
> A006, A009 e A016 passam de "aguarda decisão" para "decisão tomada — aguarda aplicação".
> Revisão 4: `2026-09-17` — disposição sincronizada com a árvore de trabalho (`git diff`):
> A002 e A003 **resolvidos**; parte do Apêndice A já aplicada por terceiros, com três
> correções pendentes registradas em 6.2.
> Artefatos analisados:
> - `_reversa_forward/001-migracao-typescript/requirements.md`
> - `_reversa_forward/001-migracao-typescript/roadmap.md`
> - `_reversa_forward/001-migracao-typescript/actions.md`
>
> Referências cruzadas usadas na conferência: `data-delta.md`, `interfaces/` (3 fichas),
> `investigation.md`, `onboarding.md`, `questions.md`, `progress.jsonl`,
> `regression-watch.md`, `legacy-impact.md`, `_reversa_sdd/addenda/001-migracao-typescript.md`,
> `_reversa_sdd/domain.md`, `_reversa_sdd/state-machines.md`,
> `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/handoff.md`,
> `_reversa_sdd/migration/parity_tests/` e o próprio código-fonte.
>
> Ganchos: `before-audit` e `after-audit` estão vazios em `.reversa/hooks.yml` — nada a executar.
>
> **Nenhum dos três artefatos auditados foi alterado por esta auditoria.**
> Os apêndices deste relatório são **proposta de correção**; a aplicação parcial registrada na
> seção 6.2 foi feita por terceiros, fora desta auditoria.

## 1. Resumo

| Severidade | Ocorrências | Estado (revisão 4) |
|------------|-------------|--------------------|
| CRITICAL | 0 | — |
| HIGH | 9 | 2 resolvidos (A002, A003); 7 abertos |
| MEDIUM | 7 | 7 abertos |
| LOW | 3 | 3 abertos |
| **Total** | **19** | **2 resolvidos, 17 abertos** |

Leitura do conjunto: os três artefatos são internamente coerentes na maior parte —
o que a auditoria encontrou é sobretudo **defasagem do `roadmap.md` e das fichas de
`interfaces/` em relação ao que foi efetivamente entregue e registrado** em
`progress.jsonl`, `questions.md` e no adendo de `_reversa_sdd/`. Nenhum conflito com
regra 🟢 do legado foi encontrado; por isso não há CRITICAL.

## 2. Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A001 | HIGH | Consistência | O roadmap declara a etapa 3 como parcial ("a ligação dos dois adaptadores ainda não foi feita") e as etapas 4 a 7 como não executadas, enquanto o `actions.md` está 44/44 `[X]`, o `progress.jsonl` registra T037/T038 concluídas em 14/09 e o adendo declara "44 de 44" com gate em 0 erros e build validado. O critério de pronto (§10) segue com todas as caixas desmarcadas | `roadmap.md` §8 (linhas 96-106) e §10 (127-137) × `actions.md` (Fases 4 e 5) × `progress.jsonl` × `_reversa_sdd/addenda/001-migracao-typescript.md` (linha 19) |
| A002 | HIGH | Cobertura | `T005` está `[X]`, mas seu entregável declarado — registrar a exclusão **com justificativa por escrito no próprio arquivo de configuração** — foi abandonado (o verificador não aceita comentários). O `tsconfig.json` tem a exclusão sem justificativa, e o `progress.jsonl` marca T005 como `partial`. O critério de RF-09 e o esclarecimento de §9 exigem a justificativa no arquivo de configuração | `actions.md` T005 (linha 40) × `progress.jsonl` (linha 35) × `tsconfig.json` (linha 31) × `requirements.md` RF-09 (linha 98) e §9 (linha 224) |
| A003 | HIGH | Cobertura | RF-09 afirma que a única exclusão é a pasta de componentes herdados, e T042/T043/`onboarding.md` §4.2 registram "58 arquivos de `src/` no programa, sem nenhum de `ui/`". Medição reproduzida nesta auditoria com `tsc --listFiles`: **77 arquivos de `src/`**, dos quais **19 são de `src/components/ui/`** (as declarações de sombreamento entram no programa por resolução de import, apesar do `exclude`). A evidência de cobertura registrada está errada, e é exatamente a conferência que `investigation.md` §3 exige | `requirements.md` RF-09 × `actions.md` T042/T043 × `onboarding.md` §4.2 × `tsconfig.json` (linha 31) |
| A004 | HIGH | Consistência | Módulos novos e materiais não constam do delta arquitetural do roadmap nem de nenhuma ação: `src/api/sessionScope.ts`, `src/lib/session.ts`, `src/api/entities.ts` e os **19 arquivos `src/components/ui/*.d.ts`**. O `progress.jsonl` afirma que o padrão de declarações foi "Reconhecido no roadmap como desdobramento da decisao D-01", mas o roadmap não contém essa menção. A decisão de escopo tomada em execução ("opção C", `resolveScope`) só existe no `progress.jsonl` | `roadmap.md` §5 (linhas 54-65) e D-01 (linha 35) × `progress.jsonl` (linhas 5, 36, 40, 42) × `legacy-impact.md` §2 |
| A005 | HIGH | Cobertura | RF-10 (`Should`) exige que "componentes de interface compilam sob verificação estrita", enquanto RF-09/D-01 excluem justamente a pasta de componentes de interface herdados de biblioteca. O roadmap **não cita nenhum identificador RF** (busca por `RF-` no arquivo: 0 ocorrências), de modo que RF-10 não tem decisão nem ação rastreável; hoje os contratos de propriedades são conferidos apenas pelas declarações de sombreamento, não por verificação estrita da pasta | `requirements.md` RF-10 (linha 99) e RF-09 (linha 98) × `roadmap.md` D-01 (linha 35) e §3 (nenhuma referência a RF) |
| A006 | HIGH | Coerência com o legado | RN-03 afirma com confiança 🟢 que "a transição permanece manual", citando `domain.md#2.2`. Lá, BR-A02 é 🟡 e diz o oposto: "Ao concluir uma consulta, o agendamento correspondente deve ser marcado como `concluido`. 🟡 (Inferido, UI permite manual)". O congelamento da ausência de gatilho está registrado apenas em `requirements.md` §6.1 e `onboarding.md` §5 — nenhuma decisão do roadmap (D-01 a D-11) o registra, e o roadmap não mapeia RN-01 a RN-08 | `requirements.md` RN-03 (linhas 58-63) e §6.1 (linhas 124-127) × `_reversa_sdd/domain.md` §2.2 (linha 22) e §3 (linha 35) × `roadmap.md` §3 |
| A007 | HIGH | Consistência | `requirements.md` §10 declara "Nenhuma lacuna em aberto", com a única pendência sendo as 14 dependências não utilizadas — enquanto `questions.md` (DIV-05), `onboarding.md` §4.1 e o adendo registram a lacuna pré-existente de `{DIAS_AFASTAMENTO}` (oferecida e nunca interpolada) como pendência mantida fora da feature. O critério Gherkin "nenhuma divergência permanece sem tratamento" e o critério de pronto do roadmap dependem de uma decisão que não está refletida no `requirements.md` | `requirements.md` §7 (linhas 190-194) e §10 (linhas 226-232) × `questions.md` DIV-05 (linhas 269-278) × `onboarding.md` §4.1 (linhas 139-142) × adendo (linha 33) |
| A008 | HIGH | Consistência | A ficha de contrato do armazenamento offline afirma que o isolamento por dono **não é aplicado** no modo offline e que "mecanismo de carga e gravação" não muda. O comportamento entregue contradiz: T040 pôs `created_by_id` no seed, a correção de DIV-01 fez o `create` do mock preencher `created_by_id`, e tanto o `regression-watch.md` (W009) quanto o adendo classificam isso como `regra-alterada`. Um leitor da ficha concluiria que o offline não filtra por dono — o oposto do que causou o defeito DIV-01 | `interfaces/mock-local-storage.md` §5 (linhas 46-51) e §6 (linhas 59-64) × `actions.md` T040 × `progress.jsonl` (linhas 49 e 63) × `regression-watch.md` W009 × adendo (linhas 28 e 35) |
| A009 | HIGH | Cobertura | RF-09 promete verificação estrita de "todo o código-fonte" com **uma única** exclusão registrada. `src/main.jsx` — código de aplicação, ponto de entrada — permanece no programa sem verificação (`allowJs: true` com `checkJs: false`), ou seja, é uma segunda exceção não registrada em nenhum dos três artefatos; o `handoff.md` (Onda 7) previa justamente remover `allowJs` no endurecimento final | `requirements.md` RF-09 (linha 98) × `actions.md` T005/T042/T043 × `tsconfig.json` (linhas 22-23 e 30-31) × `src/main.jsx` × `_reversa_sdd/migration/handoff.md` (linhas 77-78) |
| A010 | MEDIUM | Consistência | O registro fechado de entidades tem **9** chaves (as 8 do domínio + a entidade embutida `User`), mas o `roadmap.md` D-02 ("as 8 entidades conhecidas") e `interfaces/app-data-client.md` §2.2 ("Referenciar qualquer outro nome não compila") descrevem 8. O adendo, `regression-watch.md` W002 e `legacy-impact.md` §2 registram 9. **Escopo revisado em 2026-09-17:** RF-01 ("8 entidades persistidas") e o cenário Gherkin do `requirements.md` estão corretos como estão — a entidade embutida `User` não é entidade de domínio nem persistida pelo BaaS; a divergência atinge apenas D-02 e a ficha do contrato | `roadmap.md` D-02 (linha 36) × `interfaces/app-data-client.md` §2.2 (linhas 40-44) × adendo (linha 27) × `regression-watch.md` W002 (`requirements.md` RF-01 e §7 conferidos e **sem** alteração necessária) |
| A011 | MEDIUM | Consistência | A evidência de paridade é descrita como derivada de "26 cenários" em três pontos do `requirements.md`, mas o conjunto real é de **26 arquivos com 55 cenários** (39 em 10 arquivos de fluxo + 16 de tela), como o próprio `actions.md`/`progress.jsonl` corrigiram e o `onboarding.md` §4 fixou. O `requirements.md` nunca foi corrigido | `requirements.md` NFR Paridade (linha 108), §6.1 (linha 129) e §9 (linha 222) × `actions.md` T044 × `progress.jsonl` (linha 61) × `onboarding.md` §4 × `questions.md` (linha 14) |
| A012 | MEDIUM | Cobertura | O cenário Gherkin "Campo com nome incorreto é recusado" não tem verificação negativa correspondente: T031 cobre consentimento, T032 conjuntos fechados, T033/T034 escopo, T036 nome de entidade — nenhuma exercita nome de campo inexistente, apesar de `investigation.md` §6 exigir caso negativo para cada garantia prometida e de RF-06/§8 citarem "nome de campo" como a classe de erro mais comum | `requirements.md` §7 (linhas 140-143), RF-06 (linha 95) e §8 (linha 206) × `actions.md` Fase 3 (T031-T036) × `investigation.md` §6 (linhas 88-91) |
| A013 | MEDIUM | Cobertura | O cenário Gherkin de entidade inexistente exige que a verificação "falhe **sugerindo o nome correto**"; T036 registra apenas que o uso incorreto não compila. Não há decisão nem ação que verifique a sugestão — o critério de aceite fica sem cobertura registrada | `requirements.md` §7 (linhas 175-178) × `actions.md` T036 (linha 84) × `roadmap.md` D-02 |
| A014 | MEDIUM | Sanidade do actions | A coluna "Arquivo alvo" diverge do que foi executado: T021 aponta só `src/components/medical/`, mas produziu também `src/api/sessionScope.ts`, `src/lib/session.ts`, `src/api/registry.ts` e `src/components/ui/*.d.ts`; T041 aponta `src/App.tsx`, `src/Layout.tsx`, `src/lib/*`, `src/hooks/*`, mas também alterou `src/pages/Patients.tsx`, `src/pages/PatientForm.tsx`, `src/api/registry.ts`, `src/api/entities.ts` e `src/types/User.ts`. Como T023 também tem `src/pages/Patients.tsx`/`PatientForm.tsx` como alvo e T041 não depende de T023, existe serialização oculta entre as duas (não é violação de `[//]`, que não compartilha arquivo entre paralelas) | `actions.md` T021 (linha 61), T023 (linha 63) e T041 (linha 94) × `progress.jsonl` (linhas 39-45 e 50) |
| A015 | MEDIUM | Consistência | O delta arquitetural do roadmap ainda nomeia os arquivos na linguagem antiga (`src/api/base44Client.js`, `mockClient.js`, `mockSeed.js`) enquanto as ações e o código usam `.ts`; e a incorporação de `integrations.Core.SendEmail` ao contrato — registrada como necessária para não regredir o agendamento — aparece só no adendo e em W007, não no roadmap §7 nem na ficha `interfaces/app-data-client.md` | `roadmap.md` §5 (linhas 58-60) e §7 (linhas 77-81) × `actions.md` T037/T038/T040 × `progress.jsonl` (linha 53) × `regression-watch.md` W007 × adendo (linha 27) |
| A016 | MEDIUM | Cobertura | Os comportamentos congelados por decisão humana listados em `requirements.md` §6.1 (indicador de mock do painel, divergência de critérios entre contadores, transição manual de status, ausência de paginação na trilha, ausência de aviso visual no offline) não têm decisão correspondente no roadmap — D-10 cobre apenas "não conformidades de segurança". O congelamento existe nas ações (T044/perguntas do fumo) mas não é rastreável a partir do roadmap | `requirements.md` §6.1 (linhas 124-127) × `roadmap.md` D-01 a D-11 e §9 × `questions.md` (itens 1.1, 5.6, 10.7, 14.5) |
| A017 | LOW | Sanidade do actions | O cabeçalho do `actions.md` continua descrevendo o "Estado inicial" (só T001-T020 e T031-T036 pré-executadas), embora a tabela esteja integralmente `[X]`; o histórico de alterações não registra a conclusão das etapas posteriores, ao contrário do que o `progress.jsonl` e o adendo registram | `actions.md` (linhas 15-30 e 113-117) × `progress.jsonl` (linhas 57-64) |
| A018 | LOW | Coerência com o legado | O `legacy-impact.md` fixa o retrato da política de edição do legado como `allowedPaths: ["src/**", "package.json", "tsconfig.json"]`, enquanto a configuração vigente em `.reversa/reversa-config.json` inclui também `docs/**`. As escritas da feature permaneceram dentro dos caminhos permitidos; é imprecisão de retrato | `legacy-impact.md` (linhas 5-6) × `.reversa/reversa-config.json` (linhas 4-9) |
| A019 | LOW | Consistência | RF-13 permanece como linha numerada na tabela de requisitos funcionais, com prioridade "—" e critério "n/a", embora o texto e a tabela MoSCoW o declarem retirado do escopo. Item retirado que segue na numeração de requisitos | `requirements.md` RF-13 (linha 102) e §8 (linha 213) |

## 3. Findings HIGH — impacto e direção de correção

### A001 — Roadmap defasado em relação à entrega

`roadmap.md` §8 marca a etapa 3 como "🟡 **Parcial:** contrato, registro e camada de escopo
prontos e verificados; a ligação dos dois adaptadores ainda não foi feita" e apresenta as
etapas 4 a 7 como trabalho a fazer. T037 e T038 (ligar os dois adaptadores) estão `[X]` em
`actions.md` e datadas em `progress.jsonl`; T044 fechou o fumo em 15/09; o adendo declara a
feature concluída com gate em 0 erros. O critério de pronto (§10) segue todo desmarcado.

Impacto: quem entrar no projeto pelo roadmap concluirá que a feature está no meio do
caminho e poderá refazer trabalho já validado ou bloquear o avanço. A sugestão é revisar o
`roadmap.md` (etapas 3 a 7 e §10) contra `actions.md` + `progress.jsonl` + adendo antes de
qualquer decisão de continuidade; a atualização do roadmap é edição humana ou do agente de
planejamento, **não** desta auditoria.

### A002 — T005 marcada como concluída sem o entregável exigido · RESOLVIDO (revisão 4)

RF-09 diz "cuja exclusão é explícita e justificada no arquivo de configuração", e o
esclarecimento de §9 é ainda mais direto: "registrada e justificada por escrito no próprio
arquivo de configuração da verificação". `tsconfig.json` traz `"exclude": ["node_modules",
"dist", "src/components/ui"]` sem justificativa; o `progress.jsonl` explica por que a
tentativa foi abandonada (o verificador não aceita comentários nem vírgula final) e que a
justificativa passou a viver no roadmap (D-01). Há duas consequências: o critério de aceite
de um requisito `Must` não está satisfeito, e `actions.md` e `progress.jsonl` discordam
sobre o status de T005 (`[X]` × `partial`).

Impacto: um critério de conclusão declarado não é verificável no artefato que ele mesmo
nomeia. **Estado em 2026-09-17:** resolvido na árvore de trabalho — RF-09 e §9 reescritos,
T005 com descrição corrigida e linha `corrected` em `progress.jsonl`. Resta mover o texto de
D-01 para a coluna correta (ressalva P1, seção 6.2) e commitar.

### A003 — Cobertura declarada do gate não corresponde à medição · RESOLVIDO (revisão 4)

`tsconfig.json` exclui `src/components/ui`, e as declarações `*.d.ts` criadas dentro dessa
pasta entram no programa por resolução de import (comportamento normal do compilador: o
`exclude` não bloqueia arquivo alcançado por import). Medição desta auditoria:

```
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --listFiles
→ 77 arquivos sob src/, dos quais 19 são src/components/ui/*.d.ts
```

O registro (`T042`, `T043`, `onboarding.md` §4.2, `regression-watch.md`) afirmava 58 arquivos
e "nenhum de `ui/`". `investigation.md` §3 é explícito: "'gate passou' não é evidência
suficiente; é preciso conferir que a cobertura de arquivos é a esperada" — e a conferência
registrada usava um número que não se reproduz.

**Estado em 2026-09-17:** resolvido na árvore de trabalho — `onboarding.md` §4.2 passou a
registrar 77 arquivos (58 de aplicação + 19 declarações) e o `progress.jsonl` recebeu a linha
`corrected` de T042/T043. Restam duas ressalvas cosméticas (P2 e P3, seção 6.2).

### A004 — Módulos e declarações materiais fora do roadmap e das ações

`src/api/sessionScope.ts` (resolução de escopo por papel), `src/lib/session.ts` (conversão
única da identidade da sessão), `src/api/entities.ts` (ligação ao SDK) e os 19
`src/components/ui/*.d.ts` são artefatos novos com poder de alterar comportamento — o
primeiro deles restringe ou libera o filtro de dono conforme o papel. Nenhum aparece no
delta arquitetural do roadmap (§5) nem como ação; o `progress.jsonl` afirma que o padrão das
declarações foi "Reconhecido no roadmap como desdobramento da decisao D-01", o que não se
confirma no arquivo.

Impacto: o roadmap, lido como fonte de verdade arquitetural, não descreve a fronteira que
decide o isolamento por dono. Direção: registrar esses módulos no delta arquitetural e
decidir se merecem ação própria (ou nota explicativa em D-01/D-03) — a correção é de
planejamento/documentação.

### A005 — RF-10 sem cobertura e em conflito com RF-09/D-01

RF-10 pede verificação estrita dos componentes de interface; RF-09 e D-01 excluem a pasta
de componentes herdados. As duas leituras não convivem sem uma definição explícita de qual
"componente de interface" cada requisito designa. Como o roadmap não referencia nenhum
RF, não há como demonstrar cobertura de RF-10 por decisão ou ação.

Impacto: um requisito `Should` fica sem rastreabilidade e potencialmente contradito por
decisão humana registrada. Direção: revisar a redação de RF-10 (aplicável a
`src/components/medical` e `src/components/appointments`, que foram convertidos, ou
abandonado explicitamente) e criar o mapeamento RF↔decisão no roadmap. **Decisão 2A aceita**;
patch no Apêndice A, ainda não aplicado.

### A006 — RN-03 eleva a 🟢 uma regra que o legado marca como inferida e contrária

`domain.md` §2.2 traz BR-A02 como 🟡 ("Inferido, UI permite manual") afirmando que o
agendamento **deve** ser marcado como `concluido` ao concluir a consulta; `domain.md` §3
registra que não existe gatilho. RN-03 declara 🟢 que "a transição permanece manual" e cita
BR-A01/BR-A02 como origem. Não há conflito com regra 🟢 do legado (por isso o finding não é
CRITICAL), mas há inversão de confiança e congelamento de comportamento sem decisão
correspondente no roadmap.

Impacto: a escolha de não automatizar a transição — que é legítima e foi validada no fumo
(item 5.6) — não está ancorada em decisão rastreável no planejamento, o que a torna
vulnerável a "correção" por engano em rodadas futuras. Direção: registrar a decisão de
congelamento no roadmap e ajustar a confiança/citação de RN-03. **Decisão 2A aceita**; patch
no Apêndice A, ainda não aplicado.

### A007 — "Nenhuma lacuna em aberto" convive com uma lacuna registrada fora do documento

A validação de fumo encontrou `{DIAS_AFASTAMENTO}` oferecida na lista de variáveis e nunca
interpolada; a decisão foi registrá-la como lacuna para tratamento próprio. Essa pendência
está em `questions.md`, `onboarding.md` e no adendo, mas não em `requirements.md` §10, que
afirma não haver lacuna alguma além das 14 dependências.

Impacto: o artefato que orienta o escopo nega uma pendência conhecida e documentada, e o
critério "nenhuma divergência permanece sem tratamento" passa a depender de uma decisão
invisível para quem lê só o `requirements.md`. Direção: registrar a pendência de
`{DIAS_AFASTAMENTO}` em §10 — edição humana/`/reversa-clarify`.

### A008 — Ficha do armazenamento offline contradiz o comportamento entregue

A ficha afirma duas coisas que hoje não valem: isolamento por dono "**Não aplicado**" no
modo offline e mecanismo de carga/gravação inalterado. Depois de T040 e da correção de
DIV-01, o seed carrega `created_by_id` e o `create` do mock preenche o dono, de modo que as
leituras escopadas filtram no offline exatamente como no online — foi esse filtro que tornou
os registros "invisíveis" e gerou o defeito. Tanto W009 quanto o adendo classificam a
mudança como `regra-alterada`.

Impacto: documento de contrato que descreve o oposto do comportamento observável, em ponto
com consequência de segurança (isolamento). Direção: atualizar a ficha de
`interfaces/mock-local-storage.md` para refletir que o armazenamento não impõe RLS, mas o
adaptador preenche `created_by_id` e a leitura escopada filtra por dono.

### A009 — Segunda exceção não registrada à verificação estrita

`src/main.jsx` permanece código de aplicação sob `allowJs: true` + `checkJs: false`: entra
no programa e não é verificado. RF-09 promete verificação estrita de todo o código-fonte com
uma única exclusão. O `handoff.md` da extração já previa remover `allowJs` no endurecimento
final, o que o plano desta feature não retomou.

Impacto: requisito `Must` com critério de "única exceção" que hoje tem duas. Direção:
converter `main.jsx` (ou registrar formalmente a exceção junto de D-01, com justificativa).
**Decisão 3A1 aceita** (converter); passo de código no Apêndice A.7, ainda não aplicado.

## 4. Verificações que passaram

### Cobertura

- RF-01 a RF-09, RF-11 e RF-12 têm decisão/etapa e ação correspondente: RF-01 → etapa 2 (T006-T017); RF-02 → T008/T031; RF-03 → T007/T009-T015/T032; RF-04 → D-04/D-05 e T018/T037/T038/T039; RF-05 → D-03 e T019/T033; RF-06 → D-02 e T020/T036; RF-07 → D-11 e T016; RF-08 → D-01 e T001/T002; RF-09 → D-01 e T005/T042/T043; RF-11 → T021-T030; RF-12 → D-08 e T040.
- Toda decisão do roadmap tem materialização: D-01→T001/T005; D-02→T020/T036; D-03→T019/T033/T034; D-04→T018 (`AppDataClient` exportado em `src/api/contract.ts`); D-05→T020/T039; D-06→ordem de T006 a T041; D-07→T044; D-08→T040; D-11→T016. D-09 e D-10 são deliberadamente sem ação (fora de escopo / apenas documentado), como o próprio texto declara.
- 9 dos 12 cenários Gherkin têm ação explícita (verificação integral, consentimento, status fora do conjunto, leitura sem escopo, escopo informado, contrato único honrado, verificação isolada sem emissão, comportamento preservado, paridade por roteiro manual); os três restantes são objeto de A012 e A013.
- Os três contratos de `interfaces/` estão listados no roadmap §7 e os três arquivos existem.

### Consistência

- Terminologia estável entre os três artefatos para "verificação/gate de tipos", "escopo de leitura", "registro fechado de entidades", "consentimento" e "dados de exemplo do modo offline".
- Conjuntos fechados conferem com o legado: status de Consulta e de Agendamento batem exatamente com `state-machines.md` (linhas 9-38); tipo sanguíneo com BR-P02; filtragem de templates por tipo com BR-T01; isolamento por dono com BR-S02.
- Os 7 tipos de modelo (`src/types/Template.ts`, linhas 9-16) e as 12 ações auditadas (`src/types/AccessLog.ts`, linhas 5-17) conferem com `data-delta.md` §2 e com as contagens citadas em T014/T015.
- Identificadores citados existem nos artefatos de origem: BR-MIGRAR-004/017/020/024/034/039 (`target_business_rules.md`), BR-A01/A02, BR-P02, BR-T01, BR-S02 (`domain.md`), RISK-006 (`handoff.md`), PT-010 (`parity_tests/10-contrato-base44-client.feature`).
- A premissa corrigida sobre o ponto de partida é consistente entre `requirements.md` §2, `roadmap.md` §1 e `investigation.md` §2 (1.324 erros / 81 arquivos), e o número do `handoff.md` (677/43) confere com o documento citado.
- A afirmação do roadmap §2 sobre princípios foi conferida: não existe `.reversa/principles.md` e `.reversa/setup.json` declara `principles.enabled: true` (linhas 17-20) — o item de verificação de princípios fica mesmo sem objeto.
- Contagens do cabeçalho do `actions.md` conferem (antes do acréscimo de T045/T046): 44 ações, 16 marcadas `[//]`, maior cadeia de dependência com 15 elos (T006→T008→T017→T020→T021→T023→T024→T025→T026→T027→T028→T029→T030→T042→T043).

### Sanidade do actions

- Todas as dependências apontam para IDs existentes; nenhuma referência a ID inexistente.
- Não há ciclo de dependência (ordem topológica consistente com a numeração).
- Nenhum par de ações `[//]` compartilha arquivo alvo (T001, T003, T006-T007, T009-T015, T018, T022, T031, T032, T036 têm alvos distintos entre si).
- Nenhuma ação depende de ID maior que o próprio, coerente com a nota de ordenação do cabeçalho.

### Coerência com o legado

- O gate é real e reproduzível: `node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` termina com código 0 (nenhum erro), com `strict: true`.
- A exclusão declarada é única no `tsconfig.json` (`src/components/ui`), ainda que sua eficácia e sua justificativa sejam objeto de A002/A003.
- Os 49 `.jsx` de `src/components/ui/` foram preservados como estavam (não foram convertidos nem editados em massa); o tratamento dado foi de declaração de tipos ao lado, o que respeita a regra de delta mínimo.
- Nenhum `.jsx` de aplicação permanece além de `src/main.jsx`; as 8 entidades de domínio têm arquivo de tipo em `src/types/`, mais `User.ts` para a variante de sessão/entidade embutida.
- `src/api/base44Client.ts`, `mockClient.ts` e `mockSeed.ts` existem como alvos das ações T037, T038 e T040, coerentes com o registro do `progress.jsonl`.

## 5. Nota de método

- Auditoria estritamente leitora: as medições foram feitas com leitura de arquivos, com a
  execução do verificador de tipos em modo `--noEmit` (que não escreve artefatos) e com
  `git diff` para aferir o estado da árvore de trabalho.
- A única escrita desta auditoria é este arquivo, `audit/cross-check.md`, gravado por
  reescrita completa.
- Os IDs `A001`–`A019` são estáveis apenas dentro deste relatório e não se comunicam com
  identificadores de `requirements.md`, `roadmap.md` ou `actions.md`.
- Os apêndices A e B são **proposta**: esta auditoria não aplicou nenhuma substituição.
  Aplicar é decisão humana ou dos skills donos de cada artefato.

## 6. Disposição dos achados (sincronizada na revisão 4)

Nenhum achado foi marcado como **aceito** (isto é, sem correção). As decisões humanas foram
registradas em 2026-09-17 (seção 6.1) e, na mesma data, **parte do Apêndice A já foi aplicada
por terceiros** na árvore de trabalho — conferido por `git diff` nesta revisão. **Esta
auditoria não aplicou nenhuma substituição**: a única escrita dela é este arquivo. A coluna
"Aplicação sugerida" indica quem é dono do artefato e qual é o caminho — nunca uma promessa
de que a auditoria aplica.

| ID | Severidade | Disposição | Aplicação sugerida |
|----|------------|------------|--------------------|
| A001 | HIGH | aberto — aguarda aplicação | `/reversa-plan` (com backup) ou edição manual: `roadmap.md` §8 e §10 |
| A002 | HIGH | **resolvido** — aplicado em 2026-09-17 (falta commit) | Feito: RF-09, §9, `actions.md` T005 e linha `corrected` em `progress.jsonl`. Falta mover o texto de D-01 para a coluna "Justificativa" (ressalva P1, seção 6.2) |
| A003 | HIGH | **resolvido** — aplicado em 2026-09-17 (falta commit) | Feito: `onboarding.md` §4.2 (77 arquivos) e linha `corrected` de T042/T043 em `progress.jsonl`. Ressalvas cosméticas P2/P3 (seção 6.2) |
| A004 | HIGH | aberto — aguarda aplicação | `/reversa-plan`: `roadmap.md` §5 (delta arquitetural) |
| A005 | HIGH | decisão tomada (**2A**) — aguarda aplicação | `/reversa-clarify` (RF-10) + `/reversa-plan` (mapeamento RF↔decisão) |
| A006 | HIGH | decisão tomada (**2A**) — aguarda aplicação | `/reversa-clarify` (RN-03) + `/reversa-plan` (decisão D-12) |
| A007 | HIGH | aberto — aguarda aplicação | `/reversa-clarify`: `requirements.md` §10 |
| A008 | HIGH | aberto — aguarda aplicação | edição manual em `interfaces/mock-local-storage.md` (dono é `/reversa-plan`; regenerar traz risco maior) |
| A009 | HIGH | decisão tomada (**3A1**) — aguarda aplicação | código: `src/main.tsx` + `index.html`, com `typecheck` e `build` |
| A010 | MEDIUM | revisado (escopo estreitado) — aberto | `/reversa-plan` (D-02) e edição manual na ficha `interfaces/app-data-client.md` §2.2 |
| A011 | MEDIUM | aberto — aguarda aplicação | `/reversa-clarify`: três pontos do `requirements.md` |
| A012 | MEDIUM | aberto — aguarda aplicação | edição manual em `actions.md` (nova ação) + `/reversa-coding T045` para executá-la |
| A013 | MEDIUM | aberto — aguarda aplicação | idem A012 (`/reversa-coding T046`) |
| A014 | MEDIUM | aberto — aguarda aplicação | edição manual em `actions.md` (evitar `/reversa-to-do`, que zera os status) |
| A015 | MEDIUM | aberto — aguarda aplicação | `/reversa-plan` (`roadmap.md` §5 e §7) + edição manual na ficha |
| A016 | MEDIUM | decisão tomada (**2A**) — aguarda aplicação | `roadmap.md`: decisão D-12 (`/reversa-plan`) |
| A017 | LOW | aberto — aguarda aplicação | edição manual em `actions.md` (cabeçalho, resumo e histórico) |
| A018 | LOW | aberto — aguarda aplicação | `/reversa-coding` (dono de `legacy-impact.md`) ou edição manual |
| A019 | LOW | aberto — aguarda aplicação | `/reversa-clarify` (opcional, cosmético) |

### 6.1 Decisões — registradas em 2026-09-17 (aceitas: 1A, 2A, 3A1)

Consequência: os textos finais, sem variantes, foram entregues ao usuário; a aplicação é
humana ou dos skills donos de cada artefato. **Nada foi aplicado por esta auditoria.**

| # | Decisão | Achados travados | Decisão aceita |
|---|---------|------------------|----------------|
| 1 | A pasta `src/components/ui` fica excluída de verdade, ou passa a ser descrita como "corpo `.jsx` fora da verificação estrita e contratos verificados por declaração"? Onde vive a justificativa da exclusão, já que o verificador não aceita comentários na configuração? | A002, A003 | **1A (aceita)**: manter a configuração, descrever a realidade e mover a exigência de justificativa para o roadmap (D-01) |
| 2 | RF-10 continua exigindo verificação estrita da camada de interface? O congelamento dos cinco comportamentos de §6.1 vira decisão formal do roadmap? | A005, A006, A016 | **2A (aceita)**: estreitar RF-10 aos componentes da aplicação e criar a decisão de congelamento (D-12) no roadmap |
| 3 | `src/main.jsx` é convertido para `src/main.tsx` ou a exceção é registrada? | A009 | **3A1 (aceita)**: converter `src/main.jsx` → `src/main.tsx` e ajustar o `index.html`, sem mexer em `allowJs`/`checkJs` |

### 6.2 Correções pendentes na aplicação parcial (registro de 2026-09-17)

Aplicado por terceiros, fora desta auditoria, e conferido por `git diff` na revisão 4:

| # | Arquivo | Correção pendente |
|---|---------|-------------------|
| P1 | `roadmap.md`, D-01 | O trecho sobre as 19 declarações `*.d.ts` entrou na coluna **"Alternativas descartadas"**; deve ir para **"Justificativa"** (do jeito que está, a linha sugere que verificar por declaração era uma alternativa descartada) |
| P2 | `onboarding.md` §4.2 | Perdeu as crases em volta de `src/` — ficou `77 arquivos de src/` |
| P3 | `progress.jsonl` | As duas linhas novas foram anexadas sem quebra de linha no fim do arquivo (`\ No newline at end of file`) |

Estado da aplicação, item a item do Apêndice A:

| Item do Apêndice A | Achado | Estado |
|--------------------|--------|--------|
| A.1 — RF-09 (regra + critério) | A002, A003 | **aplicado** |
| A.1 — §9 (esclarecimento) | A002 | **aplicado** |
| A.2 — D-01 (acréscimo) | A002, A004 | **aplicado, com P1** |
| A.3 — T005 (descrição) | A002 | **aplicado** |
| A.6 — `onboarding.md` §4.2 | A003 | **aplicado, com P2** |
| A.6 — `progress.jsonl` (2 linhas) | A002, A003 | **aplicado, com P3** |
| Restante (A.1 RF-10/§8/RN-03/§10/26 cenários/RF-13; A.2 §8/§10/§5/D-02/D-12/§3.1/§7; A.3 resumo/cabeçalho/T021/T041/T045/T046/histórico; A.4; A.5; A.6 `legacy-impact.md`; A.7) | A001, A004-A019 | **não aplicado** |

Nenhum arquivo em `src/` aparece em `git status` — a decisão **3A1** (A.7) segue **não
aplicada**.

## 7. Apêndice A — plano de patch (proposta)

Texto âncora exato para localizar cada trecho. As variantes foram decididas em 6.1
(**1A, 2A, 3A1**): aplicar os textos abaixo como estão, sem variantes. Marcações
**[APLICADO em 2026-09-17]** indicam o que já está na árvore de trabalho (aplicado por
terceiros, não por esta auditoria).

### A.1 `requirements.md`

**RF-09 (linha 98)** — **[APLICADO em 2026-09-17]** trocar `exceto a pasta de componentes de interface herdados de biblioteca, cuja exclusão é explícita e justificada no arquivo de configuração`
por `exceto o corpo dos arquivos .jsx da pasta de componentes de interface herdados de biblioteca, cuja exclusão é explícita no arquivo de configuração e justificada por escrito no roadmap (D-01), já que o verificador não aceita comentários`.

**RF-09, coluna Critério de aceite** — **[APLICADO em 2026-09-17]** trocar `Verificação estrita termina sem erro sobre todo o código-fonte, e a única exclusão é a pasta de componentes herdados, registrada por escrito`
por `Verificação estrita termina sem erro sobre os 77 arquivos do programa (58 de aplicação + 19 declarações de tipo dos componentes herdados); a única exclusão é o corpo .jsx da pasta de componentes herdados, registrada por escrito`.

**§9 (linha 224)** — **[APLICADO em 2026-09-17]** trocar `cuja exclusão é registrada e justificada por escrito no próprio arquivo de configuração da verificação.`
por `cuja exclusão é registrada no próprio arquivo de configuração da verificação — a justificativa por escrito vive no roadmap (D-01), porque o verificador não aceita comentários nesse arquivo.`

**RF-10 (linha 99)** — trocar `Os componentes de interface são verificados quanto a contrato de propriedades`
por `Os componentes de interface da aplicação (src/components/medical, src/components/appointments) são verificados quanto a contrato de propriedades; os herdados de biblioteca são verificados por declaração de tipo`.

**RF-10, critério** — trocar `Componentes de interface compilam sob verificação estrita`
por `Os componentes de interface da aplicação compilam sob verificação estrita; as declarações dos herdados são verificadas pelo mesmo gate`.

**§8, justificativa do RF-10** — trocar `Amplia a cobertura do gate para a camada de interface`
por `Amplia a cobertura do gate para os componentes da aplicação que consomem dados; os herdados entram por declaração de tipo`.

**RN-03 (linhas 60-63)** — trocar `permanece **manual**. 🟢`
por `permanece **manual** (congelamento deliberado, registrado no roadmap como D-12). 🟢`;
e trocar `` `_reversa_sdd/domain.md#2.2` (BR-A01, BR-A02) e `` por `` `_reversa_sdd/domain.md#2.2` (BR-A01, BR-A02 🟡 — a regra inferida afirma o contrário e a divergência é deliberada) e ``.

**§10 (linhas 226-232)** — trocar `Nenhuma lacuna em aberto. As três dúvidas do documento inicial foram resolvidas na sessão de esclarecimentos acima.`
por `As três dúvidas do documento inicial foram resolvidas na sessão de esclarecimentos acima. Permanece uma pendência registrada fora desta feature, encontrada no fumo de paridade:`;
e acrescentar à lista de pendências:
`- 🟡 **{DIAS_AFASTAMENTO} oferecida e nunca interpolada** — a variável aparece na lista de variáveis disponíveis e o editor substitui apenas {PACIENTE_NOME}, {PACIENTE_CPF}, {DATA} e {DATA_EXTENSO}. Lacuna **pré-existente** do legado, preservada de propósito. Registro: questions.md DIV-05; _reversa_sdd/addenda/001-migracao-typescript.md.`

**A011 — três pontos, "26 cenários" → 26 arquivos / 55 cenários:**
- linha 108: `derivado dos 26 cenários já existentes em` → `derivado dos 26 arquivos de cenário (55 cenários: 39 de fluxo + 16 de tela) já existentes em`
- linha 129: `derivado dos 26 cenários de paridade já existentes` → `derivado dos 55 cenários de paridade (26 arquivos) já existentes`
- linha 222: `derivado dos 26 cenários Gherkin já existentes em` → `derivado dos 26 arquivos / 55 cenários Gherkin já existentes em`

**RF-13 (linha 102)** — acrescentar ao fim da célula: `(linha mantida na tabela apenas para preservar a numeração estável dos IDs)`.

**Sem alteração necessária:** RF-01 ("8 entidades persistidas") e o cenário Gherkin do
registro fechado — conferidos e corretos (ver A010).

### A.2 `roadmap.md`

**§8 (substituir as etapas 1 a 7):**

```
Ordem de execução, de dentro para fora (D-06). Todas as etapas foram executadas.

1. **Configuração e gate** — ✅ Executada (T001-T005).
2. **Contratos de tipo das entidades** — ✅ Executada (T006-T017).
3. **Contrato de acesso a dados** — ✅ Executada: contrato, registro fechado, camada de escopo
   e a ligação dos dois adaptadores (T018-T020, T037-T039).
4. **Componentes de negócio** — ✅ Executada (T021, T022).
5. **Telas, por módulo** — ✅ Executada na ordem prevista (T023-T030).
6. **Modo offline** — ✅ Executada (T040).
7. **Endurecimento final** — ✅ Executada: gate ligado e os 1.324 erros reduzidos a 0
   (T042, T043).

Estado em 2026-09-15: 44 de 44 ações [X]; `npm run typecheck` e `npm run build` validados na
máquina do responsável (T044, questions.md). A verificação `tsc --listFiles` cobre 77 arquivos
sob `src/` (58 de aplicação + 19 declarações).
```

**§10** — marcar `[x]` em: ações do `actions.md`; verificação estrita sem erro; as duas
implementações verificadas; nenhum marcador de dúvida; `regression-watch.md` gerado;
roteiro de fumaça registrado por módulo; princípios sem objeto. **Deixar desmarcado**
`cross-check.md sem CRITICAL nem HIGH` (esta auditoria abriu 9 HIGH) e `re-extração reversa`.

**§5 — acrescentar quatro linhas à tabela:**

```
| `src/api/sessionScope.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Resolução do escopo de leitura pelo papel da sessão (`resolveScope`), preservando o comportamento nos dois modos |
| `src/api/entities.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Ligação ao SDK com o registro fechado de entidades |
| `src/lib/session.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Ponto único de conversão da identidade da sessão para o tipo de domínio |
| `src/components/ui/*.d.ts` (19) | — | componente-novo | Declarações de tipo ao lado dos componentes herdados; dão contrato de propriedades sem tocar o corpo `.jsx` |
```

**§5 — nomes de arquivo:** `src/api/base44Client.js` → `.ts`; `src/api/mockClient.js` → `.ts`;
`src/api/mockSeed.js` → `.ts`.

**D-01 (linha 35)** — **[APLICADO em 2026-09-17, com a ressalva P1: o texto entrou na coluna "Alternativas descartadas"]** acrescentar ao fim da Justificativa:
`; o corpo (.jsx) da pasta permanece fora da verificação estrita, mas os contratos de propriedades são verificados pelas 19 declarações *.d.ts, que entram no programa por import`.
**Não aplicar** o acréscimo sobre `src/main.jsx`: a decisão 3A1 converte o ponto de entrada,
e essa exceção deixa de existir.

**D-02 (linha 36)** — trocar `tipado com as 8 entidades conhecidas, não com índice aberto`
por `tipado com as 8 entidades de domínio mais a entidade embutida User do BaaS, não com índice aberto`.

**§3 — nova decisão de congelamento (D-12, decisão 2A):**

```
| D-12 | Congelar os comportamentos que o legado sinaliza como divergência ou ausência: indicador de mock do painel, critério divergente entre contadores, transição manual de status do agendamento, ausência de paginação na trilha e ausência de aviso visual no offline | Decisão humana (requirements §6.1): a feature converte linguagem, não corrige comportamento. BR-A02 é 🟡 inferida e afirma o contrário — a divergência é deliberada | Corrigir junto com a conversão; manter só em §6.1, sem decisão rastreável | 🟢 |
```

**§3.1 — nova subseção de rastreabilidade (resolve A005):**

```
### 3.1 Mapeamento requisito ↔ decisão

| Requisito | Decisão / etapa |
|-----------|-----------------|
| RF-01 | etapa 2 (T006-T017) |
| RF-02 | RN-06; etapa 2 (T008); T031 |
| RF-03 | etapa 2 (T007, T009-T015); T032 |
| RF-04 | D-04, D-05; T018, T037-T039 |
| RF-05 | D-03; T019, T033 |
| RF-06 | D-02; T020, T036 |
| RF-07 | D-11; T016 |
| RF-08 | D-01; T001, T002 |
| RF-09 | D-01; T005, T042, T043 |
| RF-10 | D-01 (componentes da aplicação; herdados por declaração) |
| RF-11 | D-06; T021-T030 |
| RF-12 | D-08; T040 |
| RF-13 | fora de escopo (D-09) |
| RN-01..RN-08 | etapa 2; D-11 (RN-08); D-12 (RN-03) |
```

**§7** — linha do `AppDataClient`, coluna Tipo: trocar `interno, entre telas e camada de dados`
por `interno, entre telas e camada de dados; inclui envio de e-mail transacional (SendEmail) na confirmação de agendamento`.

### A.3 `actions.md`

**Resumo** — `| Total de ações | 44 |` → `46`; `| Paralelizáveis ([//]) | 16 |` → `17`; acrescentar nota: `T045/T046 foram acrescentadas pela auditoria cruzada (audit/cross-check.md, A012/A013) e estão pendentes.`

**Cabeçalho (linhas 15-19)** — substituir o bloco "Estado inicial" por:
`Todas as 44 ações estão concluídas ([X]); as ações T001-T020 e T031-T036 foram executadas antes da abertura formal da feature e tiveram rastro retroativo em progress.jsonl.`

**T005 (linha 40)** — **[APLICADO em 2026-09-17]** trocar a descrição por:
`Registrar no arquivo de configuração a exclusão do corpo .jsx da pasta de componentes de interface herdados (a justificativa por escrito fica no roadmap, D-01)`.

**T021 (linha 61)** — Arquivo alvo → `src/components/medical/`, `src/api/sessionScope.ts`,
`src/lib/session.ts`, `src/api/registry.ts`, `src/components/ui/*.d.ts`.

**T041 (linha 94)** — Arquivo alvo → acrescentar `src/pages/Patients.tsx`,
`src/pages/PatientForm.tsx`, `src/api/entities.ts`, `src/types/User.ts`, `src/pages.config.ts`;
Dependências → `T020, T023, T037`.

**Fase 3 — duas ações novas (A012/A013), após a linha do T036:**

```
| T045 | Verificar por caso negativo que nome de campo inexistente no contrato não compila | T008 | `[//]` | verificação negativa do nome de campo | 🟢 | `[ ]` |
| T046 | Verificar que a mensagem de erro de entidade inexistente indica o nome correto | T020 | - | verificação negativa do registro de entidades | 🟡 | `[ ]` |
```

**Histórico** — acrescentar: `| 2026-09-15 | Feature concluída: 44 de 44 ações; T045/T046 acrescentadas pela auditoria cruzada | reversa |`.

### A.4 `interfaces/mock-local-storage.md`

- **§3, linha Criar** — trocar `Acrescenta registro com identificador novo e data de criação atual`
  por `Acrescenta registro com identificador novo, data de criação atual e created_by_id do usuário da sessão`.
- **§5, linha da tabela** — trocar `**Não aplicado** — o armazenamento local não tem regra de acesso`
  por `Aplicado pelo adaptador: o create preenche created_by_id e a leitura escopada filtra por dono (o armazenamento em si não impõe regra de acesso)`.
- **§5, parágrafo** — trocar `O isolamento não aplicado no modo offline é comportamento **intencional e documentado**, não defeito.`
  por `O armazenamento local não impõe regra de acesso; o filtro por dono é aplicado pela camada de leitura escopada, e o adaptador preenche created_by_id, espelhando o servidor.`
- **§6, linha** — trocar `| Mecanismo de carga e gravação | não |`
  por `| Mecanismo de carga e gravação | **sim, em um ponto**: o create do adaptador passou a preencher created_by_id, espelhando o servidor |`.

### A.5 `interfaces/app-data-client.md`

- **§2.2** — acrescentar `e a entidade embutida User do BaaS (usada na exclusão de conta)` antes de `Referenciar qualquer outro nome não compila.`
- **nova §2.4 Integrações** — `Envio de e-mail transacional (integrations.Core.SendEmail), usado na confirmação de agendamento; o adaptador offline rejeita explicitamente.`

### A.6 `onboarding.md`, `legacy-impact.md` e `progress.jsonl`

- **`onboarding.md` §4.2 (linha 159)** — **[APLICADO em 2026-09-17, com a ressalva P2]** trocar `| Gate de tipos integral | 58 arquivos de src/ | **0 erros** |`
  por `| Gate de tipos integral | 77 arquivos de src/ (58 de aplicação + 19 declarações *.d.ts de ui/) | **0 erros** |`.
- **`legacy-impact.md` (linhas 5-6)** — trocar `allowedPaths: ["src/**", "package.json", "tsconfig.json"]`
  por `allowedPaths: ["src/**", "package.json", "tsconfig.json", "docs/**"]`.
- **`progress.jsonl`** — **[APLICADO em 2026-09-17, com a ressalva P3]** acrescentar ao fim (append-only; correção por linha nova, nunca reescrevendo):

```json
{"ts": "2026-09-17T00:00:00-03:00", "action": "T005", "status": "corrected", "files": ["tsconfig.json"], "obs": "Status real: done. A justificativa por escrito nao pode viver no tsconfig (o verificador nao aceita comentarios); vive no roadmap D-01. Restricao registrada tambem em requirements RF-09 e secao 9."}
{"ts": "2026-09-17T00:00:00-03:00", "action": "T042/T043", "status": "corrected", "files": ["tsconfig.json"], "obs": "Correcao da evidencia de cobertura (auditoria cruzada A003): tsc --listFiles lista 77 arquivos sob src/ (58 de aplicacao + 19 declaracoes *.d.ts de src/components/ui), nao 58. O exclude nao bloqueia arquivo alcancado por import. Gate segue em 0 erros."}
```

### A.7 Decisão 3 — `src/main.jsx` (código) — **aceita: 3A1, não aplicada**

- **A1 (aceita)** — renomear `src/main.jsx` → `src/main.tsx`; ajustar o `src` do script em
  `index.html`; manter `allowJs`/`checkJs`; rodar `npm run typecheck` e `npm run build`.
- ~~A2~~ — descartada (não remover `allowJs` nesta rodada).
- ~~B~~ — descartada (a exceção do ponto de entrada deixa de existir com A1).

## 8. Apêndice B — roteiro de aplicação

Ordem recomendada, com o dono de cada artefato. **Nenhum passo foi executado por esta
auditoria**; a aplicação parcial de 2026-09-17 (seção 6.2) cobre parte dos passos 2 e 6.

| # | Passo | Dono / comando | Observação |
|---|-------|----------------|------------|
| 0 | Backup/commit de `_reversa_forward/001-migracao-typescript/` | você | Protege contra regeneração (`/reversa-plan`, `/reversa-to-do`) |
| 1 | Decidir os três pontos da seção 6.1 | você | **Feito em 2026-09-17: 1A, 2A, 3A1** |
| 2 | `requirements.md` (A002, A003, A005, A006, A007, A011, A019) | `/reversa-clarify` | Parcialmente aplicado (RF-09 e §9); faltam RF-10, §8, RN-03, §10, "26 cenários" e RF-13 |
| 3 | `roadmap.md` (A001, A004, A005, A006, A015, A016) e `interfaces/` (A008, A010, A015) | `/reversa-plan` (⚠️ regenera `roadmap`, `investigation`, `data-delta`, `onboarding` e `interfaces/`) **ou** edição manual | A edição manual é mais segura para as fichas e para o `onboarding.md` §4, que só existe por causa do fumo |
| 4 | `actions.md` (A012, A013, A014, A017) | edição manual (evitar `/reversa-to-do`, que grava tudo como `[ ]`) | Se optar por `/reversa-to-do`, a feature volta a `coding-em-progresso` |
| 5 | Executar as duas verificações negativas novas | `/reversa-coding T045-T046` | Reescreve `legacy-impact.md` por completo com base na rodada: confira o arquivo depois |
| 6 | `legacy-impact.md` (A018), `regression-watch.md`, `progress.jsonl` | `/reversa-coding` (dono) ou edição manual | Parcialmente aplicado (`progress.jsonl`); falta `legacy-impact.md` |
| 7 | Decisão 3 no código (`src/main.tsx`) | você ou `/reversa-coding` com ação própria | Rodar `npm run typecheck` e `npm run build` |
| 8 | Confirmar o fechamento | nova execução de `/reversa-audit` | Um `cross-check.md` sem CRITICAL nem HIGH é o critério declarado no `roadmap.md` §10 |
| 9 | Convergir a entrega na extração | `/reversa-sync` | **Já executado** (adendo vigente); rodar de novo apenas se houver fato novo |
| — | Commit do que já está aplicado | você | O último commit (`0b65f4d`) só trouxe a revisão 1 deste relatório |

Regra que vale para todos os passos: **o Reversa nunca sobrescreve artefato pré-existente do
projeto fora das pastas próprias**, e a política de edição do legado vigente é
`allowLegacyEdits: true` com `allowedPaths` = `src/**`, `package.json`, `tsconfig.json`,
`docs/**` (o que basta para o passo 7).
