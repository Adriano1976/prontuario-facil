# Legacy Impact: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Âncora de contexto: **legado** (`_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`)
> Política de edição no momento da execução: `allowLegacyEdits: true`, com `allowedPaths` liberando
> `README.md`, `README.en.md`, `src/**`, `package.json`, `tsconfig.json`, `docs/**`, `index.html` e
> `.github/**`. Todo arquivo de projeto tocado caiu em `src/**`; nenhuma recusa foi necessária.

## 1. Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `src/lib/taxaAtendimento.ts` | — (novo) | `componente-novo` | LOW | Módulo puro com a fórmula, as constantes e o sentinela. Não existia; nasce para dar símbolo ao que era literal (`RN-08`, reparando `O002`) |
| `src/components/medical/StatsCard.tsx` | `StatsCard` (`_reversa_sdd/c4-components.md`) | `contrato-alterado` | MEDIUM | Ganha `subtitle?: string` opcional. Superfície nova num componente compartilhado, ainda que só um consumidor a use |
| `src/pages/Dashboard.tsx` | `Dashboard` (`_reversa_sdd/code-analysis.md#3.1 Carregamento do Dashboard`) | `regra-alterada` | **HIGH** | O quarto cartão deixa de receber o literal `"94%"` e passa a consumir uma quinta leitura de `Appointment`, sem limite, sob chave de cache própria |
| `src/lib/__tests__/taxaAtendimento.test.ts` | — (novo) | `componente-novo` | LOW | 15 verificações da função pura |
| `src/pages/__tests__/DashboardKpis.test.tsx` | `Dashboard` (prova) | `regra-alterada` | MEDIUM | `PT-008.4` mudou de propósito; `BR-MIGRAR-033` passou a contar duas leituras de agendamento |

## 2. Diff conceitual por componente

**Regra `BR-D08` — "Taxa de Atendimento fixa 94% (decorativa)".** É a regra 🟢 do legado que esta
feature **substitui**, e é a razão de a severidade do delta ser HIGH. O que muda não é a aparência do
cartão: é a natureza do número. Ele passa a ser `Math.round(concluidos / (concluidos + faltas) * 100)`
sobre os agendamentos com desfecho nos últimos 12 meses, lido de `Appointment` com o escopo da
sessão. A quebra é **sancionada e prevista**: a extração marca a própria regra como a lacuna (`G-01`
em `_reversa_sdd/gaps.md`; 🔴 em `_reversa_sdd/dashboard/requirements.md`) e a decisão humana de
2026-09-09 (`AMB-001`) adiou a fórmula real para "fase posterior" — que é esta.

**`Dashboard`.** As quatro leituras originais continuam idênticas em ordenação, limite e escopo. Nasce
uma quinta, e ela é a única sem teto: a janela de 12 meses não cabe com garantia em 100 registros, e
truncá-la produziria um número errado sem sintoma — o mesmo defeito que `BR-D09` registra em
"Documentos Emitidos". A chave de cache é própria (`['appointments-desfecho']`) porque `['appointments']`
já guarda o conjunto limitado, e duas leituras de formas diferentes sob a mesma chave é a armadilha
registrada em `_reversa_sdd/code-analysis.md:1467`.

**`StatsCard`.** Uma prop opcional a mais. Nenhum consumidor existente além do Dashboard — verificado
por busca: nenhum outro arquivo de `src/` o importa, exceto um teste que o substitui inteiro. A
tendência percentual que o componente já suportava continua sem uso.

## 3. Regras 🟢 do `_reversa_sdd/domain.md` preservadas

| Regra | Conteúdo | Por que segue intacta |
|---|---|---|
| `BR-A01` | Um agendamento nasce `agendado` e precisa ser `confirmado` antes de iniciar o atendimento | Nenhuma transição foi tocada. A feature só **lê** o estado |
| `BR-A03` | O dashboard exclui agendamentos `cancelados` das contagens de "hoje" e "próximos" | **Reforçada**: `RN-02` exclui `cancelado` também das duas contas do indicador, na mesma direção |
| `BR-S01` | Todo acesso a dado sensível gera registro em `AccessLog` | O `logAccess` de montagem do painel não foi tocado |
| `BR-MIGRAR-034` | Isolamento por criador ou admin nas cinco entidades sob RLS | A leitura nova nasce **com escopo declarado**, pela mesma camada (`scopedRead.ts`). Nenhuma leitura global foi introduzida |
| `BR-MIGRAR-011` | Máquina de estados do agendamento | A feature trata `concluido` e `faltou` como terminais, que é o que a máquina já diz |

## 4. Regras 🟢 modificadas

| Regra | Conteúdo original | O que passa a valer | Onde |
|---|---|---|---|
| `BR-D08` | "Taxa de Atendimento fixa 94% (decorativa)" — `_reversa_sdd/code-analysis.md#6` | Taxa **calculada** sobre desfechos conhecidos na janela de 12 meses, com subtítulo que nomeia a janela | `src/pages/Dashboard.tsx`, `src/lib/taxaAtendimento.ts` |

**Nenhuma regra foi removida.** A única alteração de conteúdo é a de `BR-D08`.

## 5. Regra de paridade rompida, e o que a autoriza

O comentário de PARIDADE do `Dashboard` afirmava que o indicador estava "congelado em `94%` (valor de
mock, decisão humana preservada)". Essa afirmação **deixou de ser verdadeira** e foi reescrita — deixar
um comentário afirmando paridade que não existe é a mesma classe de defeito que `O002` registrou.

O que autoriza a quebra, em três fontes da própria extração:

1. `_reversa_sdd/gaps.md` lista `G-01` como lacuna aberta pedindo validação com stakeholder.
2. `_reversa_sdd/dashboard/requirements.md` marca a regra em 🔴 e lista fórmula, fonte e período como
   hipóteses a validar.
3. `_reversa_sdd/migration/ambiguity_log.md#AMB-001` registra a decisão de paridade da migração e
   adia a fórmula real para fase posterior.

A validação com stakeholder **aconteceu**: é a sessão de esclarecimentos de 2026-09-25 registrada em
`requirements.md#9`, onde o dono do produto decidiu definição, fonte e período.

## 6. Arquivos do projeto tocados — conferência

Cinco arquivos, todos sob `src/**`. Nenhum arquivo de configuração, nenhuma dependência nova,
nenhuma migração de dados, nenhum contrato externo. Conferido por `git status --porcelain` em `T024`.

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-coding` | reversa |
