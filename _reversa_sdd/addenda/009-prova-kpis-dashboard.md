# Adendo: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/009-prova-kpis-dashboard/`

## Vigência

Vigente desde 2026-09-22.

## Resumo da entrega

Converter os cinco cenários de fluxo de `PT-008` em prova automatizada, e com eles as regras de
indicador-chave que o Dashboard declarava e ninguém media. A feature **não alterou comportamento de
aplicação nenhum**: ela transformou em asserção o que era promessa.

Entrega principal: `src/pages/__tests__/DashboardKpis.test.tsx`, com **13 verificações**, e
`src/test/dashboardFixtures.ts`, com a massa das quatro entidades. A suíte passou de 132 verificações
em 23 arquivos para **145 em 24**, com 0 falhas.

Duas decisões de instrumento mudam a qualidade da medida, e não apenas o resultado: o dublê de
consulta **modela a cache por chave** (armadilha medida na feature 006, onde a contagem de leitura
saiu seis vezes maior que o real), e `resolveScope` **não é dublado** — a asserção de escopo compara
com o que a resolução real produz, e não com um dublê (armadilha medida na feature 005).

**16 de 16 ações concluídas**, sem execução parcial.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-spec-matrix.md` | `#Cenários de paridade do grupo 08` | `regra-nova` | A seção **nasce** com o veredito dos cinco cenários de `PT-008`. **Leia como:** dois deles não são 🟢 pleno — `PT-008.3` tem achado e `PT-008.4` tem ressalva |
| `_reversa_sdd/code-spec-matrix.md` | `#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo `08` sai de "feature a criar" e entra como concluído. **Leia como:** o bloqueio declarado por `G-01` estava **vencido** — a dependência era de produto, não de prova. O saldo passa de 27 para **22 transferidos dos 50** |
| `_reversa_sdd/code-spec-matrix.md` | `#Lacunas de prova` | `regra-alterada` | Quatro linhas novas — o contador de consultas sem superfície, a constante decidida que nunca existiu, o fluxograma que descreve um render que não acontece e a Taxa pendente num artefato e resolvida noutro. **Leia como:** a linha dos módulos restantes passa de 11 para **6**, e Modo offline é a única feature de fluxo que falta |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` | `regra-alterada` | Entra a linha de medição da feature `009` (145 verificações, 24 arquivos, 85,9 s a 87,4 s). **Leia como:** a nota da guarda de encoding, que ainda dizia ser trabalho de feature própria enquanto a tabela de lacunas já a dava como fechada, **deixou de se contradizer** |
| `_reversa_sdd/flowcharts/dashboard.md` | `#1. Fluxo Principal: Carregamento do Dashboard` | `regra-alterada` | **O diagrama está errado, e agora se sabe onde.** Ele afirma que `todayConsultations` e `upcomingConsultations` alimentam a renderização (`I --> N`, `J --> N`), quando o código calcula os dois e **descarta os dois**; e atribui os "4 StatsCards" a três nós, deixando o quarto cartão sem origem. **Leia como:** o quarto cartão consome prescrições, que não é nó do fluxograma |
| `_reversa_sdd/dashboard/requirements.md` | `#Regras de Negócio` e `#Taxa de Atendimento — decisão pendente` | `regra-alterada` | As cinco regras da unit deixam de ser promessa e passam a ter prova de execução. **Leia como:** a Taxa de Atendimento continua 🔴, mas por **lacuna de produto** — a fórmula real nunca foi definida —, e não por impedimento de prova |
| `_reversa_sdd/migration/target_business_rules.md` | `#BR-MIGRAR-027` a `#BR-MIGRAR-033` | `regra-alterada` | As sete regras do Dashboard passam a ter prova: os quatro KPIs, a lista de próximos, os limites de payload e o escopo das leituras. **Leia como:** nenhuma regra mudou de conteúdo — o que mudou é que agora há medição |
| `_reversa_sdd/migration/ambiguity_log.md` | `#AMB-001 — Taxa de Atendimento do Dashboard` | `regra-alterada` | A decisão registrou "manter `94%` como **constante explícita e tipada** (`TAXA_ATENDIMENTO_MOCK = 94`)" e **não há símbolo com esse nome em `src/`**: o valor é o literal em `Dashboard.tsx:173`. **Leia como:** a paridade do **comportamento** foi cumprida; a **forma decidida** nunca foi implementada, e a divergência fica registrada |
| `_reversa_sdd/migration/parity_tests/08-kpis-dashboard.feature` | Todos os cenários de `PT-008` | `regra-alterada` | Os cinco cenários ganham veredito. **Leia como:** `PT-008.3` é provado pela **ausência** — o critério de `AMB-002` está preservado em código morto, e não há superfície onde medi-lo; `PT-008.4` afirma "vindo de constante tipada", metade que é **falsa hoje** |
| `_reversa_sdd/migration/parity_specs.md` e `_reversa_sdd/migration/handoff.md` | Métrica primária | `regra-alterada` | As duas citam "132 verificações em 23 arquivos". **Leia como:** 145 em 24, medidos em 2026-09-22 |
| `_reversa_sdd/migration/gaps.md` | `#G-01 — Taxa de Atendimento fixa em 94%` | `regra-alterada` | A lacuna de produto **permanece aberta** e segue pedindo validação com stakeholder. **Leia como:** o que caducou foi o **bloqueio de prova** derivado dela, não a lacuna |
| `_reversa_sdd/inventory.md` | `#Cobertura de testes` | `regra-alterada` | A seção registrava 109 verificações em 18 arquivos. **Leia como:** 145 em 24, medidos em 2026-09-22 |
| `_reversa_sdd/domain.md` | `#2.2 Agendamentos e Consultas` (BR-A03) | `regra-alterada` | A regra permanece a mesma; o que passa a estar explícito é a **borda** do critério: o KPI de hoje exclui **apenas** `cancelado`, de modo que `faltou`, `concluido` e `confirmado` **contam**. **Leia como:** a borda que a redação do cenário deixava ambígua agora é verificada |

## Regras sob vigilância

Sete itens no watch principal da feature — `W001` a `W007`, em
`_reversa_forward/009-prova-kpis-dashboard/regression-watch.md`. Seis observações (`O001` a `O006`)
ficam registradas no mesmo arquivo, **sem peso de regressão**: são as regras que já eram 🟡 ou 🔴 na
origem.

- `W001` — Pacientes Ativos conta só `ativo`
- `W002` — Agendamentos Hoje exclui `cancelado` e só conta hoje
- `W003` — Taxa de Atendimento é a constante `"94%"`, sem fórmula e sem tendência
- `W004` — Próximos Agendamentos: até 5 futuros não cancelados, com estado vazio correto
- `W005` — Documentos Emitidos reflete a leitura, inclusive quando vazia
- `W006` — limites de payload 100/50/100/100 nas quatro leituras
- `W007` — log de acesso na montagem (`PT-007.3`), herdado da feature 006 e **não reescrito**

## Fontes

- `_reversa_forward/009-prova-kpis-dashboard/legacy-impact.md`
- `_reversa_forward/009-prova-kpis-dashboard/regression-watch.md`
- `_reversa_forward/009-prova-kpis-dashboard/requirements.md`
- `_reversa_forward/009-prova-kpis-dashboard/roadmap.md`
- `_reversa_forward/009-prova-kpis-dashboard/onboarding.md`
- `_reversa_forward/009-prova-kpis-dashboard/progress.jsonl`
- `_reversa_forward/009-prova-kpis-dashboard/actions.md`

---

## Correção de caminho — 2026-09-24

A tabela acima cita `_reversa_sdd/migration/gaps.md`. **Esse arquivo não existe**: as lacunas de
especificação vivem em `_reversa_sdd/gaps.md`, e é lá que `G-01` está. O texto da tabela **não** é
reescrito — adendo é registro histórico —, e esta nota é a correção de leitura.

O levantamento completo do que este adendo declarou e não foi aplicado está em
`_reversa_sdd/pendencias-de-convergencia.md`.
