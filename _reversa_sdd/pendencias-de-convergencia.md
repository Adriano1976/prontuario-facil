# Pendências de Convergência — prontuario-facil

> Levantamento de **2026-09-24**. Cada linha foi conferida **no arquivo**, não no adendo.

## O achado que originou este arquivo

Os adendos do `/reversa-sync` trazem uma tabela **"Impacto por artefato da extração"** descrevendo o
que cada artefato passou a dizer. Conferindo arquivo por arquivo, a maior parte dessas tabelas
descreve **intenção**, não o que foi escrito: o único artefato efetivamente convergido foi
`_reversa_sdd/code-spec-matrix.md`.

A evidência é direta e verificável:

- `_reversa_sdd/code-analysis.md` **não contém a palavra "veredito"** em lugar nenhum, embora os
  adendos `004` e `006` afirmem que as oito lacunas de Consultas e as seis de Logs de Acesso
  "passaram a ter veredito". A tabela de `#9` do módulo consultas continua na **redação original**,
  e a "nona lacuna" que o adendo `004` diz ter acrescentado não existe.
- **Nenhum** arquivo `.feature` tinha veredito, embora os adendos `009` e `010` afirmem isso dos
  cenários `PT-008` e `PT-009`.

**Por que isto importa:** a tabela do adendo é o que uma pessoa ou um agente lê para saber em que
acreditar. Enquanto ela descrever edições que não existem, o corpus afirma o que não tem — que é
exatamente o defeito que a sessão de 2026-09-24 vem corrigindo em outros pontos.

## Estado por artefato

Legenda: ✅ convergido · 🟡 parcial · ⛔ **não aplicado**

### Feature `010-prova-modo-offline` (adendo `010`)

| Artefato | O adendo diz | Estado |
| :--- | :--- | :--- |
| `code-spec-matrix.md` (grupo 09, lacunas, medição) | seções novas e alteradas | ✅ |
| `modo-offline/requirements.md#2` | as 12 BRs ganham veredito | ✅ aplicado em 2026-09-24 |
| `modo-offline/requirements.md#7` e `#8` | `P1`–`P5` ganham veredito; critérios ficam sem medição própria | ✅ aplicado em 2026-09-24 |
| `code-analysis.md#10.5` | as sete limitações ganham veredito | ✅ aplicado em 2026-09-24 |
| `code-analysis.md#10.4` | semeadura e tolerância a corrupção com prova | ✅ aplicado em 2026-09-24 |
| `questions.md#Q-13 a #Q-16` | as quatro respostas ganham medição | ⛔ **não aplicado** |
| `gaps.md#G-04` | nota de que nenhuma prova a cobre | ✅ aplicado em 2026-09-24 |
| `parity_tests/09-modo-offline.feature` | os seis cenários ganham veredito | ✅ aplicado em 2026-09-24 |
| `migration/target_architecture.md#BC-08` | prova de adaptador e de carregamento | ⛔ **não aplicado** |
| `migration/parity_specs.md` e `migration/handoff.md` | contagens | ✅ corrigido em 2026-09-24 |

### Feature `009-prova-kpis-dashboard` (adendo `009`)

| Artefato | O adendo diz | Estado |
| :--- | :--- | :--- |
| `code-spec-matrix.md` (grupo 08, destino, lacunas, medição) | seções novas e alteradas | ✅ |
| `dashboard/requirements.md` | as cinco regras ganham prova; a Taxa fica por lacuna de produto | ✅ aplicado em 2026-09-24 |
| `flowcharts/dashboard.md#1` | o diagrama está errado e agora se sabe onde | ⛔ **não aplicado** |
| `migration/target_business_rules.md` (BR-MIGRAR-027…033) | as sete regras passam a ter prova | ⛔ **não aplicado** |
| `migration/ambiguity_log.md` (AMB-001) | a constante decidida nunca existiu | 🟡 registrado em `dashboard/requirements.md`; **o log não foi editado** |
| `parity_tests/08-kpis-dashboard.feature` | os cinco cenários ganham veredito | ✅ aplicado em 2026-09-24 |
| `migration/gaps.md#G-01` | a lacuna permanece aberta | ⛔ **o arquivo não existe** — ver "caminho quebrado" |
| `inventory.md` | contagem | ✅ corrigido em 2026-09-24 |
| `domain.md#2.2` (BR-A03) | a borda do critério (só `cancelado` é excluído) fica explícita | ⛔ **não aplicado** |

### Backlog anterior, que este levantamento expôs

| Feature | Artefato | O adendo diz | Estado |
| :--- | :--- | :--- | :--- |
| `004-prova-consultas` | `code-analysis.md#9` (módulo consultas) | as oito linhas ganham veredito e uma **nona** é acrescentada | ⛔ **não aplicado** — a tabela está na redação original |
| `006-prova-logs-acesso` | `code-analysis.md#9` (módulo logs) e `#5.1` | as seis linhas ganham veredito; a nota "somente admins veem a tela" fica imprecisa | ⛔ **não aplicado** |
| `003-prova-agendamentos` | `code-analysis.md#9` (módulo agendamentos) | duas **correções de leitura**: a tabela tem 11 linhas, e o fallback de `working_hours` existe | ⛔ **não aplicado** |
| `005-prova-templates` | `code-analysis.md#5.3` | a lacuna 🔴 de `{DIAS_AFASTAMENTO}` fica fechada | ⛔ **não aplicado** |
| `009-prova-kpis-dashboard` | `addenda/009` cita `_reversa_sdd/migration/gaps.md` | — | ⛔ **caminho quebrado**: o canônico é `_reversa_sdd/gaps.md` |

## Caminho canônico

A convergência é trabalho do `/reversa-sync` — ou da reexecução do Inspector, para os artefatos de
`migration/`. Este arquivo **não substitui** isso: ele existe para que, enquanto a convergência não
acontece, o estado real esteja dito **num lugar só**, em vez de a informação falsa ficar espalhada
pelas tabelas dos adendos.

> **Regra de leitura enquanto este arquivo existir:** ao consultar um adendo, confira o artefato
> citado. A tabela "Impacto por artefato da extração" descreve a **intenção** do sync; o que está no
> arquivo é o que vale.
