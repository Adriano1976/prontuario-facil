# Data Delta: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Modelo extraído de referência: `_reversa_sdd/database/data-dictionary.md`, `_reversa_sdd/erd-complete.md`

## 1. Veredito

**n/a — nenhuma mudança de modelo de dados.**

A feature é editorial: altera o texto de linhas de um artefato de rastreabilidade. Não cria, altera ou remove entidade, campo, tipo, índice, schema Base44, relação ou migração. Nenhuma linha de `base44/entities/` é tocada — o compromisso herdado "schemas de entidade intocados" (`_reversa_sdd/architecture.md#1. Visão Resumida`) permanece intacto.

## 2. Entidades e campos

| Entidade | Campo | Mudança |
|----------|-------|---------|
| — | — | nenhuma |

Nenhuma entidade do dicionário de dados (`Patient`, `Appointment`, `Consultation`, `Doctor`, `Template`, `AccessLog`, `Prescription`, `Exam`, `User`) é mencionada pela feature, direta ou indiretamente.

## 3. Migrações

Nenhuma. Não há script, backfill, reindexação ou alteração de contrato de leitura/escrita. O `_reversa_sdd/migration/data_migration_plan.md` permanece válido sem emenda.

## 4. "Dados" que a feature efetivamente manipula

Para não deixar a seção vazia sem explicação: a feature mexe em **números de contagem** dentro de um documento — não em dados de sistema.

| Número | Antes | Depois | Onde |
|--------|-------|--------|------|
| Cenários de paridade visual em "lacuna declarada" | 16 | **0** | tabela de destino e tabela de lacunas de prova da matriz |
| Cenários transferidos (dos 50 da feature 002) | 15 | **31** (15 de fluxo + 16 visuais) | nota de saldo da matriz |
| Cenários concluídos (dos 50) | 19 | 19 (inalterado) | nota de saldo da matriz |
| Goldens registrados como artefato de prova | 0 | **24** (com `present: true` em 24 de 24) | seção "Como a prova é executada" da matriz, por apontador ao manifest |

> Esses números têm **data-base 2026-09-22**. Se uma feature futura concluir cenários visuais ou de fluxo, ela atualiza a nota — o padrão de nota datada já é usado pelas features `003` a `006`.

## 5. Impacto em dados de terceiros

Nenhum. A feature não toca BaaS, não faz requisição, não altera payload e não muda contrato consumido por outro sistema.

## 6. Fontes

- `_reversa_forward/007-matriz-paridade-visual/requirements.md` (§6 Requisitos Não Funcionais; §5 RF-01 a RF-06)
- `_reversa_sdd/code-spec-matrix.md` (§ Destino dos cenários de paridade não cobertos nesta feature; § Lacunas de prova; § Como a prova é executada)
- `_reversa_sdd/architecture.md#1. Visão Resumida` (compromisso de schemas intocados)
- `_reversa_sdd/screens/golden/manifest.yaml`
