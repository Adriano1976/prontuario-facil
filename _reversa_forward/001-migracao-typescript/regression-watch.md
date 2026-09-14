# Regression Watch: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Nota: arquivo gerado na rodada T024/T039/T040/T041, cobrindo retroativamente as
> rodadas anteriores da feature.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `src/api/scopedRead.ts` | Leitura de entidade sob RLS exige escopo declarado; `list`/`filter` crus não compilam em telas | `presença` | Chamada crua `list`/`filter` compilando em alguma tela |
| W002 | `src/api/registry.ts` | O registro fechado inclui as 8 entidades + a entidade embutida `User` do BaaS | `presença` | `entities.User` ausente → exclusão de conta no Layout volta a falhar |
| W003 | `src/api/mockSeed.ts` | Dados de exemplo offline têm `created_by_id` do usuário demo em todas as entidades sob RLS | `presença` | Modo offline mostra listas vazias onde o legado mostrava dados de exemplo |
| W004 | `src/api/mockSeed.ts` | Prescrições do seed têm `medications` (lista) com `type` e `content` | `presença` | Documentos offline voltam a não exibir medicamentos (regressão para texto único) |
| W005 | `src/pages/Patients.tsx`, `PatientForm.tsx`, `PatientDetail.tsx` | Leitura escopada resolve o escopo pelo papel da sessão (`resolveScope`): admin lê sem filtro de dono | `presença` | Administrador deixa de ver todos os registros (uso de `asUserScope` em listagem) |
| W006 | `base44/entities/*.jsonc` | Schemas do BaaS permanecem intocados (regra de ouro do diff) | `ausência` | Qualquer diff em `base44/entities/` |

## Histórico de re-extrações

(Nenhuma ainda.)

## Arquivadas

(Nenhuma.)

## Observações

Sem peso de regressão — itens originados de regras 🟡/🔴 ou decisões de estrutura,
registrados para contexto:

- **Duplicação de `calculateAge`** entre `Patients.tsx` e `PatientDetail.tsx`,
  preservada por decisão: a extração para módulo compartilhado é mudança de
  estrutura, fora do escopo "só tipos". Candidata a etapa própria.
- **`.jsx` gêmeos de componentes** (9 clínicos + 2 de agendamento) ainda coexistem
  com os `.tsx`; o Vite resolve `.jsx` antes de `.tsx`, então as versões convertidas
  ficam sombreadas até as telas consumidoras (T025–T030) converterem e os `.jsx`
  ficarem órfãos — remoção autorizada pelo usuário ("remover conforme converter").
- **Pendência fora da feature:** remoção das 14 dependências declaradas e não
  utilizadas (`requirements.md` §10).
- **AMB-006 (XSS em templates)** — preservado e documentado, não corrigido.
- **`AppUser` (entidade `User` do BaaS)** — adição por paridade; a re-extração pode
  confirmar os campos efetivamente usados pelo SDK nessa entidade.
