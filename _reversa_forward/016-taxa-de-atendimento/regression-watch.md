# Regression Watch: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Âncora: **legado** (`_reversa_sdd/`). Os itens abaixo vêm da regra 🟢 `BR-D08`, a única modificada
> por esta feature (ver `legacy-impact.md#4`).

## Watch principal

Regras que **precisam continuar verdadeiras** nas próximas extrações. Todas derivam de uma regra que
era 🟢 na origem — `BR-D08` —, e por isso têm peso de regressão.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/lib/taxaAtendimento.ts`; `requirements.md#4` `RN-02` | A Taxa de Atendimento é **calculada**: `Math.round(concluidos / (concluidos + faltas) * 100)` | presença | O cartão volta a exibir valor fixo, ou o número não se move quando a massa muda |
| W002 | `src/lib/taxaAtendimento.ts`; `RN-02` | `cancelado` fica **fora das duas contas** — nem presença, nem falta | presença | Acrescentar agendamentos `cancelado` na janela altera o valor exibido |
| W003 | `src/lib/taxaAtendimento.ts`; `RN-05` | A janela é de **12 meses**, com borda **estrita**: exatamente na marca de 12 meses fica fora | presença | Um agendamento exatamente a 12 meses passa a influenciar a conta, ou a janela muda de tamanho |
| W004 | `src/pages/Dashboard.tsx`; `RN-04`, `D-04` | A leitura da taxa é feita **sem limite**, com o escopo da sessão declarado | presença | A leitura passa a ter teto (100, 500 ou qualquer outro), truncando a janela em silêncio |
| W005 | `src/lib/taxaAtendimento.ts`; `RN-06`, `RN-07` | Sem desfecho na janela, o cartão exibe `—` com o texto "sem agendamentos com desfecho no período"; com desfecho, exibe o percentual com o subtítulo "últimos 12 meses" | redação + presença | Base vazia exibindo `0%`; travessão aparecendo com base; subtítulo desaparecendo ou aparecendo em outro cartão |
| W006 | `src/components/medical/StatsCard.tsx`; `RF-04` | Nenhum dos quatro cartões exibe variação percentual ("+N% este mês") | ausência | O texto "este mês" reaparece no painel |
| W007 | `src/pages/Dashboard.tsx`; `RF-06` | As leituras e os valores de "Pacientes Ativos", "Agendamentos Hoje" e "Documentos Emitidos" seguem intactos: ordenações e limites `['-created_date', 100]`, `['-date', 50]`, `['-created_date', 100]`; a leitura de hoje/próximos mantém `['-date', 100]` | presença | Qualquer um dos limites ou valores muda; `lerAgendamentos` deixa de ser chamado duas vezes com argumentos distintos |

## Observações

Itens que **não** têm peso de regressão: ou descrevem uma regra que já era 🟡/🔴 na origem, ou
registram uma limitação conhecida em vez de uma regra.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `AMB-001` (`_reversa_sdd/migration/ambiguity_log.md`) | A decisão humana exigia "constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`)" e o código tinha o literal `"94%"`. A divergência **acabou**: a feature `016` deu símbolo real à fórmula, o que é mais do que a decisão pedia. `O002` do watch da feature `009` fica encerrado por este item |
| O002 | `W003` do watch da feature `009` | O item `W003` da `009` congelava o literal `"94%"` e proibia tendência. Ele está **superado por decisão**: o `O004` daquele mesmo watch previa "se um dia a fórmula real for definida, `W003` deve mudar de propósito, e não por acidente". É o que aconteceu, com `RF-01`…`RF-03` como causa |
| O003 | `legacy-impact.md#4` | O número mede **desfecho registrado**, não comparecimento real: `Appointment.status` só muda por ação manual (`Appointments.tsx:86`), e concluir uma consulta não atualiza o agendamento (`NewConsultation.tsx` não referencia a entidade). É limitação aceita de `D-02`, não defeito — uma clínica que não marca a agenda verá a taxa afundar sem que ninguém tenha faltado |
| O004 | `src/pages/Dashboard.tsx`; `_reversa_sdd/code-analysis.md:1467` | A quinta leitura usa chave de cache própria (`['appointments-desfecho']`). Se uma extração futura encontrar as duas leituras de agendamento sob a mesma chave, é regressão de `D-05`, não escolha de estilo |
| O005 | `StatsCard` | A prop `trend` continua existindo e continua sem uso em cartão nenhum do Dashboard. `RF-04` proíbe acioná-la; ela não foi removida porque removê-la seria mudança de contrato sem pedido |

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso quando `/reversa` rodar de novo sobre este código. -->

| Data | Extração | Resultado |
|------|----------|-----------|
| — | — | — |

## Arquivadas

<!-- Itens que deixaram de ser vigiados, com a razão. -->

| ID | Item | Arquivado em | Razão |
|----|------|--------------|-------|
| — | — | — | — |

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-coding` — 7 itens no watch principal, 5 observações | reversa |
