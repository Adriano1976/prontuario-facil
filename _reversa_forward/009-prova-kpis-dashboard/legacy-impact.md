# Impacto no Legado: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Âncora de contexto: **legado** — `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`
> Extração de referência: `_reversa_sdd/`, `_reversa_sdd/migration/`

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido antes da primeira escrita fora das pastas do Reversa:

| Campo | Valor observado |
|-------|-----------------|
| `allowLegacyEdits` | `true` |
| `allowedPaths` | `["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]` |
| Caminhos que a feature precisou | `src/pages/__tests__/DashboardKpis.test.tsx` e `src/test/dashboardFixtures.ts` |
| Resultado | **Liberados** — ambos casam com o glob `src/**` |

Nenhuma liberação irrestrita foi necessária, nenhum caminho fora da lista foi pedido, e a config
**não foi alterada** por esta feature.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/pages/__tests__/DashboardKpis.test.tsx` | Arnês de prova dos KPIs (novo) | `componente-novo` | **LOW** | Arquivo de teste, fora do caminho de execução da aplicação. Treze verificações novas. Não é importado por nenhum arquivo de produção |
| `src/test/dashboardFixtures.ts` | Massa de prova (novo) | `componente-novo` | **LOW** | Módulo de teste. Importado **apenas** pelo arquivo acima — a via é de mão única, nenhum arquivo existente passou a depender dele |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganha a seção de paridade do grupo `08`, quatro linhas novas em lacunas de prova, o bloqueio do grupo `08` marcado como vencido, o saldo 27 → 22, a linha de medição da feature 009 e a correção de uma nota contraditória sobre a guarda de encoding |
| `_reversa_forward/009-prova-kpis-dashboard/*` | Artefatos do ciclo forward | `componente-novo` | **LOW** | Requirements, roadmap, investigação, delta de dados, onboarding, ações, progresso, watch e este arquivo |

> **Nenhum arquivo de aplicação foi tocado.** É o critério `CF-02` do roadmap, medido por comando:
> `src/pages/Dashboard.tsx`, `src/api`, `src/types`, `src/lib`, `base44/entities` e
> `src/pages/__tests__/Dashboard.test.tsx` permanecem **byte a byte** como estavam.

## Diff conceitual por componente

### Arnês de prova dos KPIs — `src/pages/__tests__/DashboardKpis.test.tsx` (novo)

O arquivo prova os cinco cenários de `PT-008` e as três regras declaradas da mesma superfície. A
escolha de **arquivo próprio**, e não de extensão do `Dashboard.test.tsx`, é a decisão `D-01`: aquele
arquivo foi desenhado pela feature 006 para provar `PT-007.3` com dublês que devolvem **conjunto
vazio** de propósito, e acrescentar massa lá contradiria o desenho registrado.

Duas decisões mudam a qualidade da medida, e não apenas o resultado:

1. **O dublê de consulta modela a cache por chave** (`D-02`). Um dublê que executasse a função a cada
   renderização contaria renderizações, não pedidos — armadilha medida na feature 006, onde a
   contagem saiu seis vezes maior que o real. Como `RF-07` afirma **uma** chamada por leitura, um
   dublê ingênuo faria a verificação falhar por culpa do arnês.
2. **`resolveScope` e `toSessionUser` não são dublados** (`D-03`). `RF-08` mede a declaração de
   escopo, e comparar contra um escopo dublado seria comparar o dublê consigo mesmo — a armadilha
   que a feature 005 pagou.

### Massa de prova — `src/test/dashboardFixtures.ts` (novo)

Construtores das quatro entidades lidas pelo Dashboard e as massas mistas que dão dentes a cada
critério. Os marcadores são **distintos de propósito** — 3 pacientes ativos, 2 agendamentos hoje,
4 prescrições, 7 consultas hoje (`R-04`): se o dublê entregasse a massa de uma chave a outro cartão,
uma coincidência numérica faria a verificação passar por acidente. Datas derivadas do relógio local,
com folga em dias (`D-10`, `R-05`).

### Matriz de rastreabilidade — `_reversa_sdd/code-spec-matrix.md`

O que muda, e por quê:

- **A seção do grupo `08`** passa a existir, com o veredito de cada um dos cinco cenários.
- **O bloqueio do grupo `08`** deixa de ser declarado: a dependência de `G-01` era de **produto**, e
  não de prova. A lacuna de produto continua aberta — o que caducou foi o bloqueio da prova.
- **Quatro linhas novas em lacunas de prova**: o contador de consultas sem superfície, a constante
  decidida que nunca existiu, o fluxograma que descreve um render que não acontece, e a Taxa marcada
  como pendente num artefato e resolvida noutro.
- **O saldo** passa de 27 para **22 transferidos dos 50**.
- **Uma correção fora do plano**: a nota da guarda de encoding ainda dizia que regularizá-la "é
  trabalho de feature própria, não desta", enquanto a tabela de lacunas, poucas linhas abaixo, já a
  dava como **fechada pela feature 008**. As duas afirmações conviviam no mesmo arquivo. A redação foi
  corrigida e o registro histórico, preservado.

## Preservadas

Regras 🟢 do `_reversa_sdd/domain.md` e do `_reversa_sdd/migration/target_business_rules.md` que
**continuam intactas** — esta feature as prova, não as altera:

| Regra | Origem | Situação |
|-------|--------|----------|
| Pacientes Ativos conta apenas `status == 'ativo'` | `target_business_rules.md#BR-MIGRAR-027` | Preservada — e agora **provada** |
| Agendamentos Hoje exclui `cancelado` e só conta hoje | `target_business_rules.md#BR-MIGRAR-028`; `domain.md#2.2` (BR-A03) | Preservada — e agora **provada**, inclusive a borda de `faltou`/`concluido` |
| Documentos Emitidos reflete a leitura limitada a 100 | `target_business_rules.md#BR-MIGRAR-029` | Preservada — e agora **provada** |
| Taxa de Atendimento é a constante `"94%"` | `ambiguity_log.md#AMB-001` | Preservada — e agora **provada** no comportamento |
| Próximos Agendamentos: até 5 futuros não cancelados | `target_business_rules.md#BR-MIGRAR-030` | Preservada — e agora **provada** |
| Limites de payload 100/50 nas quatro leituras | `target_business_rules.md#BR-MIGRAR-033` | Preservada — e agora **provada** no transporte |
| Escopo de acesso resolvido por papel (opção C) | `src/api/sessionScope.ts`; `addenda/001-migracao-typescript.md#Vigência` | Preservada — exercitada **de verdade** pela prova, sem dublê |
| Log de acesso na montagem do Dashboard | `target_business_rules.md#BR-MIGRAR-032`; `parity_tests/07-auditoria-acesso.feature` `PT-007.3` | Preservada — a verificação da feature 006 continua verde e **sem reescrita** |
| Contrato de leitura escopada: toda leitura declara escopo | `addenda/001-migracao-typescript.md#Vigência` | Preservada — `Contract` e `scopedRead` intocados |

## Modificadas

**Nenhuma.** Esta feature não altera, remove nem rebaixa regra de negócio alguma: ela transforma em
medição o que era promessa. As duas divergências que ela encontra — o contador de consultas sem
superfície e a constante decidida que nunca existiu — são **registradas como achados** e não
corrigidas, por decisão das sessões de esclarecimentos (`1a` e `3a`). Corrigi-las mudaria
comportamento observável e sairia do perímetro de prova, que é o que `CF-02` mede.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-coding` — nenhum arquivo de aplicação afetado | reversa |
