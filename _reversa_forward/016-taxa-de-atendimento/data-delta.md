# Data Delta: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Modelo extraído em: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/`, `_reversa_sdd/erd.md`

## 1. Veredito

**Nenhuma mudança de modelo de dados.** Esta feature não cria, remove, renomeia nem migra campo algum.
O indicador é inteiramente **derivado** de dois campos que já existem em `Appointment` e já estão
espelhados em `src/types/Appointment.ts`.

A razão de não haver delta é medida, não otimista: a união de estados do agendamento já é fechada e já
contém tudo o que a fórmula precisa — presença (`concluido`) e ausência (`faltou`) —, e a data do
agendamento já é obrigatória (`BR-MIGRAR-010`). Não falta dado; faltava decisão.

## 2. Campos consumidos

| Entidade | Campo | Tipo | Origem no legado | Novo? |
|-----------|-------|------|-------------------|-------|
| `Appointment` | `status` | `AppointmentStatus` — união fechada de 6 | `_reversa_sdd/state-machines.md#1. Status de Agendamento`; `BR-MIGRAR-011` | não |
| `Appointment` | `date` | `ISODateTime` | `BR-MIGRAR-010` (obrigatório) | não |
| `Appointment` | `created_by_id` | `UUID` | `BR-MIGRAR-034` (isolamento por dono) | não — consumido pela camada de escopo, não pela fórmula |

`status` é opcional no tipo (`status?: AppointmentStatus`), com default `'agendado'` documentado em
`src/types/Appointment.ts:45`. Um registro sem `status` **não** tem desfecho, e portanto não entra nem
no numerador nem no denominador — o mesmo tratamento de `agendado`. Isso está coberto por `RN-02`.

## 3. Campos criados, removidos ou alterados

Nenhum. Nenhuma migração, nenhum backfill, nenhum índice novo.

## 4. Delta de leitura — onde a mudança de fato acontece

O que muda não é o modelo: é **como** o dado é lido. Registrado aqui porque a extração descreve as
leituras do Dashboard em `_reversa_sdd/code-analysis.md#5.1 Entidades Consumidas`, e essa seção passa a
estar incompleta.

| Leitura | Antes | Depois |
|---------|-------|--------|
| Agendamentos (cartões de hoje/próximos) | `Appointment.listOwned(escopo, '-date', 100)` — `Dashboard.tsx:77` | **inalterada** |
| Agendamentos (taxa de atendimento) | não existia — o cartão recebia o literal `"94%"` | `Appointment.listOwned(resolveScope(user))`, sem ordenação e **sem limite**, sob a chave de cache `['appointments-desfecho']` |

A janela de 12 meses **não** é expressa na leitura: ela é aplicada no cliente, dentro da função pura.
Isso não é preferência de estilo — `FilterConditions<T>` (`src/types/common.ts:52`) aceita um valor
exato por campo e não tem operador de intervalo, de modo que a janela não é exprimível na consulta.
`_reversa_sdd/code-analysis.md#4.2` registra que o legado resolve o mesmo problema do mesmo jeito.

## 5. Impacto no ERD, no dicionário de dados e nas regras de banco

| Artefato da extração | Impacto |
|----------------------|---------|
| `_reversa_sdd/erd.md`, `_reversa_sdd/erd-complete.md`, `_reversa_sdd/database/erd.md` | **nenhum** — nenhuma relação ou cardinalidade muda |
| `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/data-dictionary.md` | **nenhum** — nenhum campo novo ou alterado |
| `_reversa_sdd/database/business-rules.md` | **nenhum** — nenhuma regra de banco ou de RLS é tocada |
| `_reversa_sdd/database/relationships.md` | **nenhum** |

Ou seja: os quatro artefatos de dados da extração continuam corretos depois desta feature. O que fica
defasado é a seção de **leituras** do Dashboard, e ela será corrigida em `_reversa_sdd/code-analysis.md`
pelo passo de convergência do `roadmap.md#8`.

## 6. O que este data-delta **não** cobre

- **Não** propõe persistir o valor calculado. O percentual é derivado a cada carga, como os outros
  quatro KPIs; guardá-lo criaria uma tabela que precisaria de invalidação e não foi pedida.
- **Não** propõe campo para "quem cancelou" (paciente ou clínica). A distinção não existe no legado e
  não é necessária para a fórmula decidida — mas se um dia for, ela **é** mudança de modelo, e virá
  por outra feature com migração.

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` — veredito de delta zero | reversa |
