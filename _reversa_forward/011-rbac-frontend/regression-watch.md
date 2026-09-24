# Regression Watch: Guarda de papel no frontend (correção do F-01)

> Identificador: `011-rbac-frontend`
> Data: `2026-09-24`
> Este arquivo foi escrito **fora do ciclo forward** — a mudança nasceu de revisão de segurança — e
> é lido pelo `/reversa-sync` e por futuras re-extrações. Os itens abaixo precisam continuar
> verdadeiros, **exceto os que a seção "Herança e superação" declarar superados**.
>
> ⚠️ **A lista vigente é `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`**, que
> consolida os watches das três correções de 2026-09-24 e acrescenta o do F-05. Este arquivo fica como
> registro da entrega do F-01 isoladamente. Onde os dois divergirem, vale o da `014`.

## Watch principal

Propriedades que a correção do F-01 estabeleceu, e que uma mudança futura não pode desfazer em
silêncio. Uma violação de qualquer uma delas é mudança de comportamento, e a suíte acusa.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `Layout.tsx` — `NAV_ITEMS` (`adminOnly: true` na trilha) e o filtro `!item.adminOnly \|\| user?.role === 'admin'`; `BR-MIGRAR-024`; prova `Layout.test.tsx` | O item de navegação da trilha de auditoria é oferecido **apenas** ao administrador, uma vez só no DOM, e some para quem não tem papel | ausência (não-admin) e presença (admin) | O item volta a aparecer para quem não é admin, ou deixa de aparecer para o admin |
| W002 | `App.tsx` — `const isAdminPage = path === 'AccessLogs'`; `BR-MIGRAR-024` × `BR-MIGRAR-017/020`; prova `RbacRotas.test.tsx` | A guarda de **rota** cobre exatamente uma rota — a trilha. Médicos e Templates seguem **alcançáveis** por qualquer autenticado | presença e ausência, pela mesma prova | `'Doctors'` ou `'Templates'` voltam à lista de rotas guardadas, ou `'AccessLogs'` sai dela |
| W003 | `Doctors.tsx` — `isAdmin &&` na criação, na edição e na exclusão; `BR-MIGRAR-015`; prova `GuardasDeAcao.test.tsx` | As três ações de escrita não são oferecidas a quem não é admin, e a **lista continua visível** para ele | ausência e presença, pela mesma prova | Uma das três ações volta a ser oferecida; ou a leitura passa a ser bloqueada junto |
| W004 | `Templates.tsx` — `isAdmin &&` nos mesmos três pontos **e** no botão do estado vazio; `BR-MIGRAR-020` | Idem, incluindo o convite "Criar Primeiro Template" do estado vazio — o ponto mais fácil de esquecer, porque não fica ao lado dos outros | ausência e presença, pela mesma prova | O botão do estado vazio volta a aparecer para quem não é admin, ainda que os outros três continuem escondidos |
| W005 | `src/api/mockClient.ts` — `OFFLINE_USER`; `BR-MIGRAR-039`; `src/types/User.ts` | O usuário de demonstração do modo offline **não** carrega papel nem dono: `id`, `email` e `full_name`, e nada mais | ausência | A propriedade `role` reaparece na constante. Foi a forma **recusada** da primeira tentativa: promoveria o usuário de demonstração a administrador num modo que não aplica RLS (`BR-OFF10`) |
| **W006 — SUPERADO** | `AccessLogs.tsx` — a leitura com os argumentos exatos `('-created_date', 500)` e sem escopo; `AMB-004`; watch `W006` da feature `006` | **Superado em 2026-09-24 pela correção do F-04** (`013-leitura-da-trilha`, consolidada em `014`/`W010`). Enquanto valeu, a leitura da trilha era pedida sem escopo declarado no cliente, com o limite e a ordenação congelados por decisão humana | — (superado) | O sinal de violação que este item nomeava — "a leitura passa a usar `asAdmin`/`asUser`" — **ocorreu de propósito**, e é hoje a regra vigente: `AccessLogs.tsx` declara escopo administrativo por `leituraDaTrilha`. Quem vigia o comportamento atual é `014`/`W010` |

## Observações

Registradas **sem peso de regressão**: são os limites declarados da correção, e afirmá-las como
regra seria dizer que o projeto promete mais do que ele entrega.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `App.tsx` — `RoleGuard` | A guarda é de **interface**. Ela decide o que a tela oferece; não substitui a regra de acesso do servidor, e um cliente adulterado a contorna. A restrição real da trilha continua sendo a RLS (`BR-MIGRAR-024`) |
| O002 | `AccessLogs.tsx:75-78`; achado **F-04** | A listagem ampla de até 500 registros **sem filtro de escopo ou de inquilino no cliente** continua aberta. O que esta correção fez foi restringir **quem chega** à tela, não o que a leitura pede. **Parcialmente superado em 2026-09-24:** a `013-leitura-da-trilha` fez a leitura declarar escopo administrativo, e o caminho de quem não é admin deixou de consultar o transporte; a metade do **inquilino** segue aberta, porque a entidade não tem campo de organização (`014`/`O005`) |
| O003 | `eslint.config.js`; registrado na matriz em 2026-09-24 | O portão de `lint` está **vazio**: o config casa apenas padrões `.jsx`, e todos os `.jsx` restantes vivem em `src/components/ui/**`, que ele próprio ignora. Nenhuma verificação desta mudança passou por ele — o gate que a cobriu foi o `typecheck` |

## Herança e superação

- **Supera** `W008` de `_reversa_forward/006-prova-logs-acesso/regression-watch.md`, que vigiava "a
  navegação **não** consulta papel". Aquele item nomeava esta mudança como sinal de violação e, na
  mesma linha, declarava que ela "**não** é defeito — é regra nova". É exatamente o caso: o `W008`
  está **superado**, não violado.
- **Herdado** de `W006` da mesma feature — e **depois superado**: esta correção não tocou a leitura da
  trilha, mas a `013-leitura-da-trilha` tocou, e ela passou a **declarar escopo administrativo**. O
  `W006` deste arquivo nomeava essa mudança como sinal de violação; ela é hoje a regra vigente, e quem
  a vigia é `W010` da `014`. Ver `O002`.
- **Fora do ciclo:** as features `001` a `010` têm `requirements.md`, `roadmap.md` e `actions.md`.
  Esta não tem, porque a correção nasceu de revisão de segurança e foi conduzida por revisão de
  código — o registro dela é o adendo `_reversa_sdd/addenda/011-rbac-frontend.md`.
