# Cross-check — `007-matriz-paridade-visual`

> Data: `2026-09-22`
> Feature: `007-matriz-paridade-visual`
> Artefatos analisados:
> - `_reversa_forward/007-matriz-paridade-visual/requirements.md`
> - `_reversa_forward/007-matriz-paridade-visual/roadmap.md`
> - `_reversa_forward/007-matriz-paridade-visual/actions.md`
>
> Contexto consultado (somente leitura): `data-delta.md`, `investigation.md`, `onboarding.md`, `_reversa_sdd/code-spec-matrix.md`, `_reversa_sdd/screens/golden/manifest.yaml`, `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, `base44/entities/`, `_reversa_sdd/migration/*`.
>
> **Este relatório não alterou nenhum artefato.** A única escrita foi este arquivo.

## Resumo

| Severidade | Quantidade |
|---|---:|
| CRITICAL | **0** |
| HIGH | **1** |
| MEDIUM | **4** |
| LOW | **1** |
| **Total** | **6** |

Veredito curto: **nenhum conflito com regra de negócio do legado, nenhum ciclo de dependência, nenhum contrato externo envolvido.** O único HIGH é uma cobertura ausente **deliberada e já documentada** — a decisão de publicar o adendo não tem ação porque quem o produz é o estágio seguinte do pipeline. Os quatro MEDIUM são de precisão documental e se resolvem por edição manual de uma linha cada.

## Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A001 | MEDIUM | Coerência com o legado | A lista ilustrativa de entidades inclui **`User`**, que **não tem schema** em `base44/entities/` — o diretório tem 8 arquivos `.jsonc` (AccessLog, Appointment, Consultation, Doctor, Exam, Patient, Prescription, Template) | `data-delta.md` §2 |
| A002 | **HIGH** | Cobertura | A decisão **D-04** (publicar adendo novo via `/reversa-sync`) **não tem ação correspondente** em `actions.md` — ausência deliberada, justificada na Nota 1 do próprio `actions.md` | `roadmap.md` §3 (D-04) × `actions.md` |
| A003 | MEDIUM | Cobertura | O **cenário Gherkin negativo** (nº 2 — "cenário visual sem golden continua declarado como lacuna") não tem verificação correspondente em nenhuma ação; hoje a checagem é **vácua**, porque não existe entrada de tela com `present: false` | `requirements.md` §7 × `actions.md` |
| A004 | MEDIUM | Consistência | Os IDs **`T009`, `T015`, `T016`** são citados **sem qualificação de feature** num documento cujo espaço de IDs é `T001`–`T010`. Mesmo anti-padrão do `W009` nu que a feature `006` corrigiu na matriz | `roadmap.md` §1 |
| A005 | MEDIUM | Coerência com o legado | A citação `_reversa_sdd/architecture.md#1. Visão Resumida` **não sustenta** a afirmação "compromisso herdado: schemas de entidade intocados" — essa seção descreve a SPA, o BaaS e o fluxo de dados; não contém a regra. A fonte real é a restrição do brief ("Base44 e schemas imutáveis") | `data-delta.md` §1 |
| A006 | LOW | Consistência | Dois números datados envelhecem sem marcar data-base: "412 arquivos" (guarda de encoding) em `requirements.md` §6 e "132 verificações" no `onboarding.md`. As contagens da matriz ganharam data-base por mitigação declarada no `roadmap.md` §9; estas duas não | `requirements.md` §6 × `onboarding.md` §5 |

## Detalhe dos findings CRITICAL e HIGH

### A002 — D-04 sem ação correspondente (HIGH)

**Impacto.** O critério do eixo 1.2 ("toda decisão do roadmap virou pelo menos uma ação") não é atendido: a decisão mais consequente da feature — **como reconciliar a leitura contra o adendo `002`** — não aparece na tabela de ações. Se ninguém executar o `/reversa-sync`, a correção da matriz fica sem o adendo que declara a precedência, e o leitor da extração continua encontrando dois textos opostos sem saber qual vale.

**Isto é deliberado, e a razão está registrada.** A Nota 1 de `actions.md` explica: transformar a publicação do adendo em ação criaria **impasse de roteamento**, porque enquanto a ação estivesse aberta o estágio físico de `actions.md` seria `coding-em-progresso` e o `/reversa-forward` mandaria de volta ao `/reversa-coding` em vez de seguir ao `/reversa-sync`. O requisito aparece como critério de pronto do `roadmap.md` §10 ("Adendo da feature publicado em `_reversa_sdd/addenda/007-matriz-paridade-visual.md`").

**Direção sugerida ao humano** (não é correção deste skill): decidir entre **(a)** aceitar a ausência e garantir que o `/reversa-sync` seja rodado logo após o coding — o critério de pronto já o exige; ou **(b)** registrar a publicação como ação explícita e assumir que o roteamento do `/reversa-forward` precisará ser conduzido manualmente até ela fechar. A opção (a) é coerente com o que as features `003` a `006` fizeram ("Próximo passo: `/reversa-sync`" ao fim do coding). Se a escolha for (b), a alteração é de `actions.md` e exige edição manual.

## Itens verificados que passaram

### Cobertura

- Os **6 requisitos funcionais** (RF-01 a RF-06) têm decisão correspondente no `roadmap.md` — mapeamento explícito em `roadmap.md` §8 (plano de execução) e nas justificativas de D-01, D-02, D-03, D-07.
- Das **8 decisões técnicas**, 7 têm ação: D-01 → T002–T006; D-02 → T002, T003, T005; D-03 → T006; D-05 → arquivo alvo de T002–T006 + verificação de T007; D-06 → varredura de identificadores de T007; D-07 → T002–T006 + T007; D-08 → T007. (D-04 é o finding A002.)
- Os **3 cenários Gherkin positivos** têm ação: nº 1 → T002, T003, T004; nº 3 → T006; nº 4 → T007. (O negativo é o finding A003.)
- As **3 regras RN-01 a RN-03** têm sustentação textual nas ações que reescrevem as linhas afetadas.

### Consistência

- Terminologia estável nos três documentos: "paridade visual", "golden", "harness de paridade visual", "matriz", "trabalho transferido".
- Todos os identificadores citados **existem**: RF-01…RF-06, RN-01…RN-03, D-01…D-08, T001…T010, `PT-V01`…`PT-V16`, `DEV-001`…`DEV-007`, AMB-001…005.
- Os números batem entre os três documentos e com o repositório: **24** goldens com `present: true` em entradas de tela, **16** arquivos `.feature` de tela, **19 concluídos / 31 transferidos** dos 50 da feature 002, **50 = 34 de fluxo + 16 visuais**.
- `interfaces/` não existe e o `roadmap.md` §7 declara explicitamente que nenhum contrato externo é afetado — coerente com "omitir o diretório" da regra do skill.
- O caminho do adendo é citado de forma idêntica em `roadmap.md` §5 e `actions.md` Nota 1.

### Coerência com o legado

- **Nenhuma decisão contradiz regra 🟢 do `_reversa_sdd/domain.md`** — verificado seção a seção: §2.1 Pacientes, §2.2 Agendamentos e Consultas, §2.3 Documentos e Templates, §2.4 Segurança e Auditoria. A feature não toca regra de negócio: altera texto de um artefato de rastreabilidade.
- A afirmação "nenhum componente do sistema muda" confere: `_reversa_sdd/architecture.md` §1 descreve SPA + BaaS + fluxo de dados, e nada disso é afetado.
- Os artefatos-alvo existem e foram verificados: `_reversa_sdd/code-spec-matrix.md` (seções "Rastreabilidade Spec → Código → Teste", "Como a prova é executada", "Destino dos cenários de paridade não cobertos nesta feature", "Lacunas de prova") e `_reversa_sdd/screens/golden/manifest.yaml`.
- A premissa da correção é verdadeira no repositório: as **24 entradas** de tela do manifest têm `present: true`, e **nenhuma entrada** tem `present: false` (a única ocorrência do valor é o comentário de cabeçalho que descreve a edição anterior).
- A alegação sobre a guarda de encoding é precisa: `src/test/mojibake.mjs` varre `src/` **e toda pasta `_reversa_*`**, logo cobre o arquivo editado.

### Sanidade do `actions.md`

- **Dependências apontam para IDs existentes**: T002–T006 → T001; T007 → T002–T006; T008/T009 → T007; T010 → T007, T008, T009.
- **`[//]` não compartilha arquivo alvo**: apenas T008 (`legacy-impact.md`) e T009 (`regression-watch.md`) são paralelizáveis, e escrevem em arquivos distintos. Justificativa registrada na Nota 2 para o núcleo não ser paralelo (T002–T006 tocam o mesmo arquivo).
- **Nenhum ciclo de dependência**: a cadeia mais longa é T001 → T002 → T007 → T008 → T010 (5).
- **Formato de detecção de estágio íntegro**: 10 linhas de tabela terminando em `| [ ] |` e nenhuma em `| [X] |`; o estágio será lido como `coding-em-progresso`. As ocorrências do marcador em texto livre existem apenas na Nota 3 e não são linhas de tabela.
- **Atomicidade das ações**: nenhuma ação tem mais de cinco subpontos, nenhuma toca mais de três arquivos não relacionados, e nenhuma usa "e também"/"em seguida" para encadear assuntos distintos.

### Princípios

- `.reversa/principles.md` não existe no projeto; o `roadmap.md` §2 declara a ausência e substitui por compromissos herdados dos adendos vigentes. Não há princípio violado nem conflito escondido.

## Observação fora do escopo desta feature

A citação equivocada do finding **A005** também aparece no `roadmap.md` da feature `006-prova-logs-acesso` ("Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`)"). É defeito **pré-existente**, herdado por esta feature ao copiar o padrão. Não é regressão desta entrega e não deve ser corrigido aqui; fica registrado para quem for tratar a rastreabilidade da feature `006`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Auditoria cruzada inicial (rewrite completo) | `/reversa-audit` |
