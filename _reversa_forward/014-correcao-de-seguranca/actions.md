# Actions: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Roadmap: `_reversa_forward/014-correcao-de-seguranca/roadmap.md`

> ⚠️ **Todas as ações estão `[X]` porque a entrega precedeu a decomposição.** Esta lista foi escrita
> **depois** de o trabalho estar feito, provado e commitado na branch `fix/seguranca-frontend` — ela é
> o registro fiel do que aconteceu, não um plano a executar. A ordem das fases segue o template, e as
> dependências descrevem o que de fato dependeu do quê.

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 28 |
| Paralelizáveis (`[//]`) | 9 |
| Maior cadeia de dependência | 5 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Ler os dois relatórios de auditoria e extrair os cinco achados com severidade, evidência e recomendação | - | `[//]` | `docs/security-audit/001-record/`, `docs/security-audit/002-record/` | 🟢 | [X] |
| T002 | Confrontar cada achado com as `BR-MIGRAR` já existentes e determinar qual regra autoriza cada correção | T001 | - | `_reversa_sdd/migration/target_business_rules.md` | 🟢 | [X] |
| T003 | Levantar todos os pontos de leitura e de escrita das cinco entidades sob RLS | T002 | - | `src/` | 🟢 | [X] |
| T004 | Ler `.reversa/reversa-config.json` antes da primeira escrita fora das pastas do Reversa | - | `[//]` | `.reversa/reversa-config.json` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Reescrever a prova do menu para a regra nova: auditoria só para admin, Médicos e Templates para todos | T002 | `[//]` | `src/__tests__/Layout.test.tsx` | 🟢 | [X] |
| T006 | Criar a prova do encanamento das rotas — não-admin recusado na trilha, aceito em Médicos e Templates | T002 | `[//]` | `src/__tests__/RbacRotas.test.tsx` | 🟢 | [X] |
| T007 | Criar a prova das guardas de ação, incluindo o botão do estado vazio | T002 | `[//]` | `src/__tests__/GuardasDeAcao.test.tsx` | 🟢 | [X] |
| T008 | Acrescentar os dois casos negativos de mutação sem escopo ao arnês de compilação | T015 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T009 | Criar a prova do componente de gráficos, alimentando-o com cor hostil | T018 | `[//]` | `src/__tests__/ChartStyle.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Criar o ponto único de leitura da sessão para a interface | T003 | `[//]` | `src/lib/useCurrentUser.ts` | 🟢 | [X] |
| T011 | Reescrever a guarda de rota e restringi-la à trilha de auditoria | T010 | - | `src/App.tsx` | 🟢 | [X] |
| T012 | Filtrar o menu por papel, marcando **apenas** a trilha como admin-only | T010 | - | `src/Layout.tsx` | 🟢 | [X] |
| T013 | Esconder criar, editar e excluir de Médicos para quem não é admin | T010 | `[//]` | `src/pages/Doctors.tsx` | 🟢 | [X] |
| T014 | Idem em Templates, **incluindo** o botão do estado vazio | T010 | `[//]` | `src/pages/Templates.tsx` | 🟢 | [X] |
| T015 | Exigir o escopo na assinatura de `update` e `delete` das entidades sob RLS | T003 | - | `src/api/scopedRead.ts` | 🟢 | [X] |
| T016 | Declarar o escopo nos quatro pontos de escrita das telas | T015 | - | `src/pages/PatientForm.tsx`, `src/pages/NewConsultation.tsx`, `src/pages/Appointments.tsx`, `src/pages/PatientDetail.tsx` | 🟢 | [X] |
| T017 | Declarar escopo administrativo na leitura da trilha e dizer o caminho de quem não é admin | T010, T003 | - | `src/pages/AccessLogs.tsx` | 🟢 | [X] |
| T018 | Remover o `dangerouslySetInnerHTML`, entregando o CSS como texto | T004 | - | `src/components/ui/chart.jsx` | 🟢 | [X] |
| T019 | Criar a sombra de tipo que faltava para o componente de gráficos | T018 | - | `src/components/ui/chart.d.ts` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T020 | Reverter a promoção do usuário offline a administrador | T011 | - | `src/api/mockClient.ts` | 🟢 | [X] |
| T021 | Atualizar as seis asserções que o contrato novo quebrou, fazendo-as **afirmar** o escopo | T015, T016 | - | `src/pages/__tests__/PatientForm.test.tsx`, `Appointments.test.tsx`, `PatientDetail.test.tsx`, `NewConsultation.test.tsx` | 🟢 | [X] |
| T022 | Tapar a lacuna de `matchMedia` no jsdom, exigida pelo provedor de tema | T006 | - | `src/test/setup.ts` | 🟢 | [X] |
| T023 | Rodar os quatro portões e conferir o resultado contra a linha de base | T005, T006, T007, T008, T009 | - | - | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T024 | Falsificar a prova das guardas de ação, conferir as 3 falhas e reverter sem resíduo | T007, T013, T014 | - | `src/pages/Doctors.tsx`, `src/pages/Templates.tsx` | 🟢 | [X] |
| T025 | Registrar as seções da correção, a tabela dos cinco achados e as medições na matriz | T023 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T026 | Escrever o adendo da correção do F-01 | T025 | - | `_reversa_sdd/addenda/011-rbac-frontend.md` | 🟢 | [X] |
| T027 | Escrever os watches das três correções | T025 | - | `_reversa_forward/011-rbac-frontend/regression-watch.md`, `012-escopo-em-mutacoes/regression-watch.md`, `013-leitura-da-trilha/regression-watch.md` | 🟢 | [X] |
| T028 | Conferir arquivo por arquivo o que os adendos declararam e registrar o que não foi aplicado | T025 | - | `_reversa_sdd/pendencias-de-convergencia.md` | 🟢 | [X] |

## Notas de execução

1. **A execução precedeu a decomposição, e isso está dito em todo lugar.** A feature nasceu de revisão
   de segurança, foi conduzida como hotfix e só depois recebeu `requirements`, `roadmap` e esta lista.
   O critério de pronto do `roadmap` marca `cross-check.md` como **não executado** por causa disso: o
   `/reversa-audit` exige os três artefatos, que não existiam no momento da entrega.
2. **A marcação `[//]` descreve independência de arquivo alvo, não execução simultânea.** A sessão foi
   sequencial; nove ações tocam arquivos que ninguém mais toca, e é só isso que a marca registra.
3. **A primeira tentativa foi recusada, e a recusa virou ação.** A promoção do `OFFLINE_USER` a
   administrador foi implementada, encontrada em revisão e revertida em **T020** — é o item que
   justifica o watch `W005`.
4. **A falsificação (T024) não é cerimônia.** Desligada a guarda nas duas telas, **3 das 6**
   verificações de ação falharam — exatamente as que medem o não-admin —, e os casos de admin
   seguiram verdes. Sem esse passo, "a prova passa" seria indistinguível de "a prova não mede nada".
5. **O F-02 não gerou ação de código, de propósito.** A análise mostrou que o SDK do Base44 faz
   exatamente o que o `app-params.ts` faz (`dist/client.js:123` chama `getAccessToken()`, cujo default
   é `saveToStorage: true`), e que `CreateClientConfig` não expõe opção para desligar isso. Alterar o
   `app-params.ts` daria a impressão de fechar o achado sem fechar nada — o registro está em **T025**,
   não em uma ação de correção.
6. **O status é `[X]` sem crase, deliberadamente.** O template de `actions.md` envolve o status em
   crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou
   `| [X] |`, **sem crase**. Mesma divergência consciente registrada nas features `002` a `010`. Com a
   forma do template, esta feature seria lida com **zero** ações — e o estágio sairia por sorte, não
   por leitura.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial, escrita **retroactivamente** sobre a entrega já feita (28 ações, todas concluídas) | reversa |
