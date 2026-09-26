# Adendo: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/016-taxa-de-atendimento/`

## Vigência

Vigente desde 2026-09-25.

## Resumo da entrega

Fechar `G-01`: o quarto cartão do Dashboard exibia o literal `"94%"`, sem fórmula, fonte ou período.
A feature definiu o indicador com o dono do produto — comparecimento sobre **desfecho conhecido**,
`concluido ÷ (concluido + faltou)`, lido de `Appointment`, nos últimos **12 meses** com borda estrita
— e o implementou. O cartão passou a exibir o percentual calculado e, sob o valor, o subtítulo que
nomeia a janela; quando não há desfecho na janela, exibe `—` com o texto explicativo, e **não** `0%`.

**27 de 27 ações concluídas**, sem execução parcial. A suíte passou de 198 verificações em 31
arquivos para **218 em 32**, com 0 falhas. As seis falsificações previstas foram executadas e todas
falharam pelo sinal nomeado, o que é a prova de que as verificações medem algo.

Esta é a primeira entrega do projeto que **rompe a paridade de propósito** para atender uma lacuna
declarada de produto: a regra 🟢 `BR-D08` — "Taxa de Atendimento fixa 94% (decorativa)" — foi
substituída, com a quebra prevista em `AMB-001` e o watch `W003` da feature `009` declarado
superado por decisão.

## Impacto por artefato da extração

> **Atenção ao ler esta tabela.** Diferente de adendos anteriores, esta feature **já editou**
> diretamente vários artefatos da extração, no passo de convergência do `/reversa-coding`. As linhas
> marcadas **✅ já aplicado** descrevem edições que estão no disco. As demais continuam **defasadas**
> e dependem de leitura atenta ou da próxima re-extração.

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-analysis.md` | `#4.5 Valor Fixo de Taxa de Atendimento` | `regra-alterada` | **Ainda defasado.** Diz "`value="94%"` hardcoded — métrica decorativa sem cálculo real 🔴". **Leia como:** o literal deixou de existir; o valor vem de `src/lib/taxaAtendimento.ts` |
| `_reversa_sdd/code-analysis.md` | `#6. Regras de Negócio Extraídas` (`BR-D08`) | `regra-alterada` | **Ainda defasado.** A regra 🟢 "Taxa de Atendimento fixa 94% (decorativa)" foi substituída por cálculo. **Leia como:** é a única regra confirmada deste corpus que esta feature alterou |
| `_reversa_sdd/code-analysis.md` | `#5.1 Entidades Consumidas` | `contrato-alterado` | **Ainda defasado.** A tabela lista quatro leituras de `Appointment` com limite 100. **Leia como:** existe uma **quinta**, sem limite, sob a chave de cache `['appointments-desfecho']` — sem ela a janela de 12 meses seria truncada em silêncio |
| `_reversa_sdd/code-analysis.md` | `#4.2 Janela Móvel de 12 Meses` | `regra-alterada` | O edge case registra "appointment exatamente há 12 meses entra (isAfter estrito > cutoff)" — **as duas afirmações se contradizem**, porque `isAfter(d, cutoff)` é falso quando `d === cutoff`. **Leia como:** vale a comparação, não a conclusão; a borda é **exclusiva**, e é o que o código executa |
| `_reversa_sdd/domain.md` | `#2.2 Agendamentos e Consultas` (`BR-A03`) | `regra-nova` | **Não editado.** `BR-A03` manda o Dashboard excluir `cancelados` das contagens de "hoje" e "próximos". **Leia como:** a mesma exclusão passou a valer para o indicador, com `cancelado` fora do numerador **e** do denominador |
| `_reversa_sdd/architecture.md` | `#1. Visão Resumida` | `componente-novo` | **Não editado.** O panorama não menciona o módulo de cálculo. **Leia como:** `src/lib/taxaAtendimento.ts` é função pura, sem React, com a fórmula e os textos do cartão |
| `_reversa_sdd/dashboard/requirements.md` | `#Regras de Negócio`, `#Requisitos Funcionais` | `regra-alterada` | ✅ **já aplicado.** A regra da Taxa deixou de ser 🔴 e passou a declarar fórmula, fonte, período, borda e estado vazio; a seção "decisão pendente" virou "decidida e implementada"; `RF-01` não diz mais que a taxa permanece mockada |
| `_reversa_sdd/dashboard/screens.md` | `#KPI Cards` | `regra-alterada` | ✅ **já aplicado.** O cartão deixou de ser descrito como `"94%"` hard-coded e passou a 🟢 calculado, com o subtítulo |
| `_reversa_sdd/gaps.md` | `#Lacunas abertas` | `regra-removida` | ✅ **já aplicado.** `G-01` **saiu** da tabela de lacunas abertas e está em "Lacunas resolvidas". Restam abertas `G-02` (paginação dos logs) e `G-04` (aviso do modo offline) |
| `_reversa_sdd/code-spec-matrix.md` | `#Cenários de paridade do grupo 08` | `regra-alterada` | ✅ **já aplicado.** O veredito de `PT-008.4` passou de 🟡 com ressalva para 🟢 provado **com o cenário superado por decisão**, e a nota do bloqueio de `G-01` registra o fechamento |
| `_reversa_sdd/code-spec-matrix.md` | `#Lacunas de prova` | `regra-removida` | ✅ **já aplicado.** Duas lacunas 🔴 estão **resolvidas**: "a constante decidida de `AMB-001` nunca existiu" e "a Taxa resolvida num artefato e pendente noutro" |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` | `regra-alterada` | ✅ **já aplicado.** Linha nova de medição: 218 verificações em 32 arquivos |
| `_reversa_sdd/migration/ambiguity_log.md` | `#AMB-001 — Taxa de Atendimento do Dashboard` | `regra-alterada` | ✅ **já aplicado.** `AMB-001` está marcada ⛔ **SUPERADA** — a "fase posterior" que a decisão previa chegou —, com a nota de revisão de 2026-09-25 |
| `_reversa_sdd/migration/target_business_rules.md` | `#BR-HUMANA-001 — Taxa de Atendimento` | `regra-alterada` | ✅ **já aplicado.** Passou de "DECISÃO HUMANA" resolvida a ⛔ **SUPERADA**, apontando para a regra vigente |
| `_reversa_sdd/migration/target_screens.md` e `parity_tests/screens/V01-dashboard-principal.feature` | `#KpiGrid`; `PT-V01` | `regra-alterada` | ✅ **já aplicado.** Os dois deixaram de afirmar `Taxa de Atendimento "94%"`. ⚠️ O **golden** `dashboard-principal.png` continua mostrando `94%` — ele **não é verificável por execução** (os 16 cenários `PT-V` não têm arnês), e a recaptura é recomendação registrada, não bloqueio |
| `_reversa_sdd/inventory.md` | `#Cobertura de testes` | `regra-alterada` | **Ainda defasado.** Registra 145 verificações em 24 arquivos — número que já estava vencido antes desta feature. **Leia como:** 218 em 32, medidos em 2026-09-25 |
| `_reversa_sdd/migration/parity_specs.md` e `migration/handoff.md` | Métrica primária | `regra-alterada` | **Ainda defasado.** As duas citam "132 verificações em 23 arquivos", vencido desde a feature `009`. **Leia como:** 218 em 32 |

**Impactos já aplicados:** 9 linhas. **Ainda defasados:** 7 linhas, das quais 5 são de artefatos que
nenhuma feature forward edita por rotina (`code-analysis.md`, `domain.md`, `architecture.md`,
`inventory.md`, `parity_specs.md`/`handoff.md`) e por isso dependem da próxima re-extração.

## Regras sob vigilância

Os itens abaixo vivem em `_reversa_forward/016-taxa-de-atendimento/regression-watch.md`, onde estão
com conteúdo completo. Aqui ficam só os apontadores.

- `W001` — a Taxa de Atendimento é **calculada**, não fixa
- `W002` — `cancelado` fica fora das duas contas
- `W003` — a janela é de 12 meses, com borda **estrita**
- `W004` — a leitura da taxa é **sem limite**, com escopo declarado
- `W005` — o estado sem base exibe `—` com texto; com base, o percentual e o subtítulo da janela
- `W006` — nenhum cartão exibe variação percentual ("+N% este mês")
- `W007` — os outros três KPIs e os limites das leituras originais seguem intactos

Cinco observações (`O001` a `O005`) acompanham o watch, **sem peso de regressão**: registram que a
divergência de `O002` da feature `009` está encerrada, que `W003` da `009` está superado, que o número
mede desfecho **registrado** e não comparecimento real, que a chave de cache é própria, e que a prop
`trend` do cartão continua sem uso.

## Fontes

- `_reversa_forward/016-taxa-de-atendimento/legacy-impact.md`
- `_reversa_forward/016-taxa-de-atendimento/regression-watch.md`
- `_reversa_forward/016-taxa-de-atendimento/requirements.md`
- `_reversa_forward/016-taxa-de-atendimento/roadmap.md`
- `_reversa_forward/016-taxa-de-atendimento/investigation.md`
- `_reversa_forward/016-taxa-de-atendimento/data-delta.md`
- `_reversa_forward/016-taxa-de-atendimento/onboarding.md`
- `_reversa_forward/016-taxa-de-atendimento/audit/cross-check.md`
- `_reversa_forward/016-taxa-de-atendimento/actions.md`
- `_reversa_forward/016-taxa-de-atendimento/progress.jsonl`
