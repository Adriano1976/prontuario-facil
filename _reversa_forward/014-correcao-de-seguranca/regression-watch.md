# Regression Watch: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Este arquivo consolida os watches das três correções entregues em 2026-09-24
> (`011-rbac-frontend`, `012-escopo-em-mutacoes`, `013-leitura-da-trilha`) e acrescenta a guarda do
> F-05. Os arquivos originais daqueles três permanecem em disco como registro da entrega de cada um;
> **esta é a lista vigente**, e é ela que uma re-extração deve confrontar.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/Layout.tsx` — `NAV_ITEMS` e o filtro por papel; `BR-MIGRAR-024`; prova `Layout.test.tsx` | O item da trilha de auditoria é oferecido **apenas** ao administrador, uma vez só no DOM | ausência (não-admin) e presença (admin) | O item volta a aparecer para quem não é admin, ou some para o admin |
| W002 | `src/App.tsx` — `isAdminPage = path === 'AccessLogs'`; `BR-MIGRAR-024` × `017`/`020`; prova `RbacRotas.test.tsx` | A guarda de **rota** cobre exatamente uma rota, e Médicos e Templates seguem **alcançáveis** por qualquer autenticado | presença e ausência, pela mesma prova | `'Doctors'` ou `'Templates'` voltam à lista de rotas guardadas, ou `'AccessLogs'` sai dela |
| W003 | `src/pages/Doctors.tsx` — `isAdmin &&` na criação, na edição e na exclusão; `BR-MIGRAR-015`; prova `GuardasDeAcao.test.tsx` | As três ações de escrita não são oferecidas a quem não é admin, e a **lista continua visível** para ele | ausência e presença, pela mesma prova | Uma das três volta a ser oferecida, ou a leitura passa a ser bloqueada junto |
| W004 | `src/pages/Templates.tsx` — `isAdmin &&` nos mesmos três pontos **e** no estado vazio; `BR-MIGRAR-020` | Idem, incluindo o convite "Criar Primeiro Template" | ausência e presença, pela mesma prova | O botão do estado vazio volta a aparecer, ainda que os outros três continuem escondidos |
| W005 | `src/api/mockClient.ts` — `OFFLINE_USER`; `BR-MIGRAR-039`; `src/types/User.ts` | O usuário de demonstração **não** carrega papel nem dono: `id`, `email` e `full_name`, e nada mais | ausência | A propriedade `role` reaparece. Foi a forma **recusada** da primeira tentativa, e promoveria o usuário de demonstração a administrador num modo sem RLS |
| W006 | `src/api/scopedRead.ts` — `OwnedEntity.update` e `delete`; `BR-MIGRAR-034` | Endereçar um registro existente por identificador **exige** o escopo na assinatura | presença, por compilação | As assinaturas voltam a aceitar `(id, data)` e `(id)`, e o arnês deixa de recusar `mutacao-sem-escopo` / `atualizacao-sem-escopo` |
| W007 | `src/api/scopedRead.ts` — `OwnedEntity.create`; `BR-MIGRAR-036` | A **criação continua sem exigir escopo**: é aberta a autenticados, e o dono é carimbado pelo servidor | ausência | `create` passa a exigir escopo. Não é proibido por si — mas é regra nova, e as 7 chamadas das telas precisam mudar de propósito |
| W008 | `src/api/scopedRead.ts` — `createOwnedEntity` | A implementação de `update`/`delete` é **pass-through**: o escopo é recebido e a chamada ao repositório cru é a mesma de antes | presença | A implementação passa a ler o registro, a aplicar filtro de dono ou a lançar por posse — verificação em runtime, recusada pela decisão `D-03` do roadmap |
| W009 | `PatientForm.tsx`, `NewConsultation.tsx`, `Appointments.tsx`, `PatientDetail.tsx` | As quatro telas declaram o escopo resolvido por `resolveScope` sobre a sessão — não um literal, nem `{ kind: 'admin' }` fixo | presença | Uma chamada omite o escopo (não compila) ou fixa escopo administrativo, que compila e não é barrado no cliente |
| W010 | `src/pages/AccessLogs.tsx` — `leituraDaTrilha`; `BR-MIGRAR-024` | A leitura da trilha **declara** escopo administrativo, e nunca usa o repositório cru | presença, na prova de tela | A página volta a chamar `AccessLog.list` direto; a prova acusa, porque afirma `asAdmin` chamado e `asUser` não chamado |
| W011 | `src/pages/AccessLogs.tsx`; `PT-007.4`; `AMB-004` | O pedido mantém os argumentos **exatos** `('-created_date', 500)` — nem o teto nem a ordenação mudam | presença | O limite ou a ordenação mudam. O teto é paridade **congelada por decisão humana** |
| W012 | `src/pages/AccessLogs.tsx` | Para escopo que não é administrativo, a leitura responde vazio e **não chega a perguntar ao servidor** | presença, na prova de tela | O caminho de quem não é admin volta a consultar o transporte, reintroduzindo a indistinção entre "admin lendo" e "qualquer um lendo" |
| W013 | `src/components/ui/chart.jsx` — `ChartStyle`; achado F-05; prova `ChartStyle.test.tsx` | O CSS é entregue como **texto** ao `<style>`; `dangerouslySetInnerHTML` não é usado | ausência do sink e presença do texto | O sink volta, ou a cor hostil da prova deixa de chegar como texto — a verificação falha porque passa a existir `<script>` no DOM |
| W014 | `src/test/verificacoes-negativas.mjs` — casos `mutacao-sem-escopo` e `atualizacao-sem-escopo`; herdado de `012/W005` | Os dois casos existem e seguem recusando com `TS2554`, e o arnês não deixa resíduo | presença | Um dos casos some, muda de código esperado, ou o arnês passa a aceitar a omissão — o que significa que o contrato deixou de ser exigido |
| W015 | `src/pages/AccessLogs.tsx` — filtros; `BR-L04`/`BR-L05`; herdado de `013/W004` | Os filtros da trilha continuam **em memória**: mudar ação, texto ou data não reconsulta o servidor, e os filtros não entram na chave da consulta | presença | Surge consulta por filtro, ou os filtros entram na chave — a prova conta as chamadas ao transporte |
| W016 | `src/components/medical/AccessLogger.ts:60`; `BR-MIGRAR-024`; herdado de `013/W005` | A **inserção** na trilha continua usando a forma de dono (`asUser`), e não a administrativa | presença | A inserção passa a usar `asAdmin` — o que exigiria que todo autenticado fosse admin para gravar a própria trilha |

## Observações

Registradas **sem peso de regressão**: são os limites declarados da correção.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `src/api/scopedRead.ts`; `src/api/sessionScope.ts:18-21` | A correção **não** verifica posse em runtime. Quem decide a posse continua sendo a regra de acesso do servidor, intocada. A metade "runtime" do achado F-03 permanece — por decisão, não por esquecimento |
| O002 | `PT-010`; `sessionScope.ts:18-21` | O escopo declarado por um cliente adulterado (`{ kind: 'admin' }`) **compila** e não é barrado no cliente. O tipo garante a FORMA, nunca a AUTORIZAÇÃO |
| O003 | `src/test/verificacoes-negativas.mjs` | A obrigatoriedade de escopo é de contrato: um `as any` escapa dela. O arnês cobre a omissão em código tipado, que é o caso que a disciplina pretende impedir |
| O004 | `src/api/registry.ts:125` | Em runtime, `asUser` e `asAdmin` devolvem o **mesmo** repositório para `AccessLog`. A declaração de escopo da trilha é **contrato**, não mudança de chamada |
| O005 | `base44/entities/AccessLog.jsonc` | A entidade **não tem campo de inquilino ou organização**. A cláusula "filtro de tenant/organização" do achado F-04 não é implementável como escrita; o isolamento da trilha é por **papel**, na RLS |
| O006 | `src/App.tsx` — `RoleGuard`; achado F-01 | A guarda é de **interface**: decide o que a tela oferece, não substitui a regra do servidor, e um cliente adulterado a contorna |
| O007 | `src/lib/mockClient.ts` — `OFFLINE_USER`; `BR-OFF10` | Em modo offline não há RLS, e o usuário de demonstração não tem papel — o que significa que ele **também não alcança** as telas administrativas. É consequência aceita: o contrato do modo offline nunca prometeu essas telas (`modo-offline/requirements.md#8`) |

## Herança e superação

- **Supera** três itens anteriores:
  - `006/W006` vigiava a leitura da trilha "**sem escopo declarado**", e nomeava como sinal de
    violação exatamente o que foi feito. É regra nova, feita de propósito.
  - `006/W008` vigiava "a navegação **não** consulta papel", e declarava na própria linha que a
    guarda seria "*regra nova, e não conserto*". Foi o que aconteceu.
  - `011/W006` — **herdado** daquele `006/W006` e registrado em
    `_reversa_forward/011-rbac-frontend/regression-watch.md` como "ainda vigente", quando já não era:
    nomeava a mesma condição (a leitura passar a usar `asAdmin`/`asUser`) como sinal de violação.
    **Superado por `W010` deste arquivo**, que é a regra vigente para a leitura da trilha. A duplicata
    foi marcada como superada no próprio arquivo de origem em 2026-09-24.
- **Herdado** da mesma feature, e ainda vigente: os **três modos de perda silenciosa** da trilha, as
  **ações órfãs** do catálogo de auditoria e a imutabilidade da trilha no servidor (RLS). Esta
  feature não os tocou.
- **Herdado** da feature `002-prova-automatizada`, `W006`: o comando de verificação negativa remove
  todo arquivo de prova que cria. O arnês continua sendo limpo — a contagem subiu de 16 para 18
  casos, e o resíduo segue nenhum.
- **Os três watches originais permanecem em disco** — `011-rbac-frontend`, `012-escopo-em-mutacoes` e
  `013-leitura-da-trilha`. Eles registram a entrega de cada correção isoladamente; este arquivo é a
  leitura consolidada, e é o que deve ser confrontado numa re-extração.
