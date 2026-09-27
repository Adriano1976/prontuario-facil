# Data Delta: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Modelo extraído em: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/`, `_reversa_sdd/erd.md`

## 1. Veredito

**Nenhuma mudança de modelo de dados.** Esta feature não cria, remove, renomeia nem migra campo algum
da trilha. `AccessLog` continua com os mesmos campos, o mesmo schema e a mesma regra de imutabilidade
(`BR-L01`).

O que muda é **como a trilha é lida**, e essa mudança é de contrato — não de modelo. Ela está na §3
abaixo, porque os artefatos de dados da extração descrevem apenas o formato, e a leitura vive em
`code-analysis.md`.

## 2. Campos consumidos

Nenhum campo novo. Os que a tela já usa continuam os mesmos: `created_date` (ordenação e recorte),
`user_email` e `patient_name` (busca), `action` (filtro e indicadores), `details` (coluna).

| Entidade | Campo | Origem no legado | Novo? |
|-----------|-------|-------------------|-------|
| `AccessLog` | `created_date` | `BR-L05` (ordenação `-created_date`) | não |
| `AccessLog` | `action` | `_reversa_sdd/logs-acesso/requirements.md#3` (enum) | não |
| `AccessLog` | `user_email`, `patient_name`, `details` | `_reversa_sdd/logs-acesso/requirements.md#3` | não |

## 3. Delta de contrato de leitura — onde a mudança de fato acontece

O contrato de entidade (`src/api/contract.ts`) passa a expor o deslocamento que o SDK do provedor já
oferece. Registrado aqui porque `_reversa_sdd/code-analysis.md#5.1 Entidades Consumidas` descreve as
leituras do sistema, e essa descrição passa a estar incompleta.

| Operação | Antes | Depois |
|----------|-------|--------|
| `EntityRepository.list` | `list(sort?, limit?)` | `list(sort?, limit?, skip?)` |
| `EntityRepository.filter` | `filter(conditions, sort?, limit?)` | `filter(conditions, sort?, limit?, skip?)` |
| Adaptador do provedor (`src/api/entities.ts`) | repassa `sort`, `limit` | repassa `sort`, `limit`, `skip` |
| Cliente de modo offline (`src/api/mockClient.ts`) | `slice(0, limit)` | `slice(skip, skip + limit)` |
| Leitura da tela (`src/pages/AccessLogs.tsx`) | `list('-created_date', 500)` | `list('-created_date', 501, skip)` — pede um a mais para saber se há próximo |

**Não** é criada operação de contagem. O contrato continua sem ela, e a decisão técnica `D-06`
resolve "há mais?" pelo excedente em vez de por um total.

## 4. Impacto no ERD, no dicionário de dados e nas regras de banco

| Artefato da extração | Impacto |
|----------------------|---------|
| `_reversa_sdd/erd.md`, `_reversa_sdd/erd-complete.md`, `_reversa_sdd/database/erd.md` | **nenhum** |
| `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/data-dictionary.md` | **nenhum** — `AccessLog` não muda |
| `_reversa_sdd/database/business-rules.md` | **nenhum** — nenhuma regra de banco ou de RLS é tocada. A leitura continua admin-only (`BR-MIGRAR-024`) |
| `_reversa_sdd/database/relationships.md` | **nenhum** |
| `_reversa_sdd/code-analysis.md#6` (`BR-L04`) | **alterado** — a regra deixa de ser teto absoluto e passa a ser o tamanho do recorte (`D-12`) |

## 5. O que este data-delta **não** cobre

- **Não** propõe campo de ordenação secundária. O empate de `created_date` (risco do `roadmap.md#9`)
  exigiria ordenar por dois campos, e `SortField` aceita um só. É mudança de contrato maior, e não foi
  pedida.
- **Não** propõe índice. A trilha é lida no servidor, e o projeto não gerencia índices — eles vivem na
  plataforma.
- **Não** propõe retenção ou expurgo da trilha. "Quantos registros a trilha guarda" é política de
  retenção, tema distinto de "como a tela lê" — e ninguém o pediu.

## 6. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` — veredito de delta zero no modelo, com delta de contrato de leitura | reversa |
