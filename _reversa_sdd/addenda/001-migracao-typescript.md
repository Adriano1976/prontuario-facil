# Adendo: Migração de JavaScript para TypeScript

> Feature: `001-migracao-typescript`
> Data: `2026-09-15`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-15.

## Resumo da entrega

Tornar **verificável em tempo de compilação** o contrato de dados do Prontuário Fácil:
as 8 entidades clínicas, os conjuntos fechados de status e tipo, e o contrato único de
acesso a dados compartilhado entre o modo online e o offline. A entrega dá ao projeto a
rede de proteção que ele não tinha — não existe teste automatizado — e substitui a
linguagem do código-fonte sem alterar comportamento observável.

**Ações concluídas: 44 de 44** (`actions.md`), com o gate de tipos em 0 erros
(`npm run typecheck`) e o build de produção validado (`npm run build`).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | Duas camadas novas: `src/types/` (contratos de dados) e `src/api/` (contrato de acesso a dados). O código de aplicação não fala mais com o SDK diretamente |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `delta-de-contrato-externo` | O contrato é **fechado** — as 8 entidades do domínio mais a entidade embutida `User` — e incorpora `integrations.Core.SendEmail` (usado no agendamento) |
| `_reversa_sdd/architecture.md` | `2. Variante de Deployment — Modo Offline` | `regra-alterada` | O adaptador offline passou a preencher `created_by_id` no `create`, espelhando o servidor. Sem isso, todo registro criado no offline ficava **invisível** para as leituras com escopo (defeito encontrado e corrigido no fumaça) |
| `_reversa_sdd/domain.md` | `2.4 Segurança e Auditoria` | `regra-alterada` | **RN-07**: a leitura de dado clínico passou a **exigir a declaração do escopo de acesso** na fronteira de tipos. A autorização real continua na RLS do servidor |
| `_reversa_sdd/domain.md` | `2.4 Segurança e Auditoria` | `regra-nova` | **Registro fechado de entidades**: referenciar entidade com nome inexistente **não compila** |
| `_reversa_sdd/domain.md` | `2. Regras de Negócio de Ouro (Core Business Rules)` | `regra-alterada` | **RN-08**: o usuário do modo offline é uma variante **sem papel e sem dono**, de forma estrutural e não silenciosa |
| `_reversa_sdd/domain.md` | `2.1` a `2.3` | `regra-nova` | Os conjuntos fechados (status de consulta e de agendamento, tipos documentais, tipo sanguíneo, ações auditadas) e o **invariante de LGPD** (consentimento aceito exige data e endereço de rede) passam a ser verificados em compile-time |
| `_reversa_sdd/domain.md` | `2.3 Documentos e Templates` | `regra-alterada` | **Lacuna pré-existente confirmada na validação:** `{DIAS_AFASTAMENTO}` é listada como variável disponível na UI, mas **nunca é interpolada** — o editor substitui apenas `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}` e `{DATA_EXTENSO}`. Não foi alterado (fora do escopo); leia a descrição das variáveis com essa ressalva |
| `_reversa_sdd/data-dictionary.md` | `Apêndice A — Seed do Modo Offline` | `delta-de-dados` | Seed reescrito e alinhado ao contrato: gênero nas formas do enum, `lgpd_consent` explícito, `anamnese` → `history_present_illness`, campos fora do schema removidos, vínculo com agendamento em `Appointment.consultation_id`, medicamentos como lista com `type` e `content`, e `created_by_id` do usuário demo em todas as entidades sob RLS |
| `_reversa_sdd/data-dictionary.md` | `Apêndice A — Campos auto-gerados pelo mock em runtime` | `regra-alterada` | O `create` do mock passou a gerar também **`created_by_id`** (antes: apenas `id`, `created_date` e, se ausente, `date`) |
| `_reversa_sdd/data-dictionary.md` | `RLS (Row Level Security) — Patient, Consultation, Appointment, Prescription, Exam` | `regra-alterada` | As leituras do cliente passam a **declarar o escopo** (`listOwned` / `filterOwned` / `filterAsAdmin`); a RLS do servidor segue sendo a única fonte de autorização. As entidades de leitura livre (médicos, templates, trilha de auditoria) permanecem sem escopo |

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/001-migracao-typescript/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009`

## Fontes

- `_reversa_forward/001-migracao-typescript/legacy-impact.md`
- `_reversa_forward/001-migracao-typescript/regression-watch.md`
- `_reversa_forward/001-migracao-typescript/requirements.md`
- `_reversa_forward/001-migracao-typescript/progress.jsonl`
- `_reversa_forward/001-migracao-typescript/actions.md`
- `_reversa_forward/001-migracao-typescript/questions.md`
