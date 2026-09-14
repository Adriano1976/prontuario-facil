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
| W007 | `src/api/contract.ts` | `integrations.Core.SendEmail` faz parte do contrato; o adaptador online liga ao SDK | `presença` | Email de confirmação de agendamento volta a falhar no modo online |
| W008 | `src/pages/Doctors.tsx` (e Templates) | Médicos e templates mantêm leitura livre para autenticados, sem escopo de dono (BR-MIGRAR-017/020) | `presença` | Usuário comum deixa de ver as listas de médicos/templates que o legado mostrava |

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
- **Legenda de status nas telas de consulta (T025)** — preservada a ausência de
  legenda quando o registro não tem `status` (o seed offline de consultas não o
  grava). Se uma futura alteração usar `?? 'agendada'` nessas telas, a badge muda
  visualmente no modo offline — verificar paridade antes de aceitar.
- **Trilha de auditoria (T029)** — a leitura continua sem escopo declarado no
  cliente; a restrição real (apenas admin lê, BR-MIGRAR-024) vive na regra de
  acesso do servidor. Se a leitura passar a declarar `asAdmin`/`asUser`, conferir
  que o resultado para cada papel continua idêntico ao do legado.
- **Resolução dos `.jsx` gêmeos (T030)** — a observação anterior sobre os
  componentes sombreados foi RESOLVIDA: com a última tela convertida, os 11
  `.jsx` de componentes e o `AuthContext.jsx` ficaram órfãos e foram removidos; as
  versões tipadas passaram a ser as resolvidas em runtime. Verificar no fumaça
  (T044) que nenhum componente voltou a renderizar a versão legada.
- **`src/main.jsx` (T030)** — permanece em JS por ser o ponto de entrada referido
  pelo empacotador; é o único arquivo de aplicação fora de `ui/` não verificado.
  Se o ponto de entrada mudar de nome/extensão, ajustar aqui e no empacotador.
- **`UserNotRegisteredError` e `pages.config` (T030)** — convertidos para `.tsx`/
  `.ts`; o código-fonte passou a ser integralmente verificado, exceto a pasta
  `ui/` (exclusão registrada em `tsconfig.json`).
