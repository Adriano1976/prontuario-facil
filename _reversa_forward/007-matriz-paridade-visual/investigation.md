# Investigation: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Pesquisa de fundo que sustenta o `roadmap.md`. Fontes internas apenas — não há pesquisa externa aplicável.

## 1. Pergunta que a investigação responde

Por que uma afirmação **falsa há um dia** continua na matriz, e qual é a forma de corrigi-la sem destruir o que cinco features construíram nesse artefato?

## 2. Como a afirmação falsa nasceu

1. Em **2026-09-09**, o Screen Translator emitiu o `manifest.yaml` com as 16 telas em `present: false`: a captura dourada era **opcional em v1** ("captura manual é OQ-02, fica para v2" — `_reversa_sdd/migration/screen_modernization_decision.md#Implicações pendentes para a Fase 2`).
2. Em **2026-09-19**, a feature `002-prova-automatizada` decidiu (`D-06`) manter os 16 cenários visuais **fora** da feature e declará-los como lacuna, com a razão "a captura dourada de referência não existe" — e registrou isso na matriz, na tabela de destino.
3. Nas features `003`, `004`, `005` e `006`, cada sync **atualizou o saldo** dos cenários de fluxo (26 → 23 → 19 → 15), mas **nenhuma delas tocou a linha da paridade visual** — porque, para todas, ela continuava sendo "trabalho de outra natureza".
4. Em **2026-09-22**, 24 goldens passaram a existir (`present: true` em 24 de 24), a Fase 2 do Screen Translator foi regenerada e o Inspector reexecutou. A linha da matriz **não** foi corrigida por nenhum deles: o Inspector só escreve em `migration/`, e o sync só escreve em `addenda/`.

**Conclusão da investigação**: não houve erro de nenhum agente — houve **ausência de dono** da linha. A matriz é editada por ações de coding das features forward; nenhuma feature forward cuidou deste fato até agora.

## 3. Onde a afirmação vive (varredura completa)

Varredura por `V01|V16|16 cenários|cenários de tela|paridade visual` em toda a extração:

| Local | Situação |
|---|---|
| `_reversa_sdd/code-spec-matrix.md` linhas 297, 303, 318 e 341 | **Defasado — é o alvo desta feature** |
| `_reversa_sdd/ui/inventory.md` (linhas 63, 82) | **Já correto** — a atualização do Visor de 2026-09-22 declara a captura encerrada |
| `_reversa_sdd/migration/*` (parity_specs, handoff, target_screens, deviation log, ambiguity log) | **Já correto** — regenerados em 2026-09-22; o `parity_specs.md:96` chega a declarar a defasagem da matriz |
| `_reversa_sdd/addenda/006-*` (linha 154) | Correto no contexto: ressalva sobre recaptura, não afirmação de lacuna |
| `_reversa_sdd/logs-acesso/screens.md`, `templates/screens.md` | Outro assunto: recomendações de recaptura por tela |

**A lacuna está confinada a um arquivo.** Foi isso que permitiu tratar a correção como feature curta em vez de re-extração.

## 4. Alternativas avaliadas

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| **A. Edição cirúrgica das linhas** (escolhida) | Diff mínimo; preserva o artefato acumulado; verificável por `git diff` | Exige disciplina para não transbordar | **Escolhida** (D-01, D-07) |
| B. Regenerar a matriz | Estado garantidamente coerente | Apaga vereditos e citações construídos por 5 features; nenhum agente reproduz o histórico | Descartada |
| C. Deixar para a próxima `/reversa` (re-extração) | Custo zero agora | Mantém a contradição viva por tempo indeterminado; a re-extração marca todos os adendos como superados e perde a nuance acumulada | Descartada |
| D. Corrigir via `/reversa-add` na feature `006` | Pipeline curto | O assunto não pertence ao que a `006` entregou (trilha de auditoria); a skill restringe `add` a ajustes do que a feature ativa entregou | Descartada |
| E. Quarta categoria na matriz ("referência capturada, execução pendente") | Precisão conceitual | Inventa categoria num artefato que quatro features mantêm com três | Descartada (D-02) |

## 5. Padrões aplicáveis do próprio projeto

- **Nota de saldo datada**: as features `003`, `004`, `005` e `006` registram o saldo com data ("Saldo após a feature 006 (2026-09-22)"). A correção segue o mesmo padrão e carrega a data-base.
- **Adendo como ponte**: o adendo é o mecanismo previsto para deltas que a extração ainda não absorveu (`reversa-sync`), exatamente o caso aqui.
- **Apontador, não cópia**: o `architecture.md` da raiz já virou apontador para os canônicos separados (decisão de 2026-09-05). A mesma lógica vale para o golden: a matriz aponta para o manifest em vez de duplicar 16 linhas.

## 6. Fontes consultadas

- `_reversa_sdd/code-spec-matrix.md` (§ Rastreabilidade, § Como a prova é executada, § Destino dos cenários de paridade não cobertos nesta feature, § Lacunas de prova)
- `_reversa_sdd/screens/golden/manifest.yaml`
- `_reversa_sdd/migration/parity_specs.md`, `handoff.md`, `target_screens.md`, `screen_deviation_log.md`, `ambiguity_log.md`, `screen_modernization_decision.md`
- `_reversa_sdd/addenda/002-prova-automatizada.md`, `003`…`006`
- `_reversa_sdd/ui/inventory.md`
- `src/test/mojibake.mjs` (recorte da guarda de encoding)
- `_reversa_forward/007-matriz-paridade-visual/requirements.md`

## 7. Lacunas desta investigação

Nenhuma. Não há fonte externa a consultar: o artefato é interno e o histórico está integralmente no repositório e nos adendos.
