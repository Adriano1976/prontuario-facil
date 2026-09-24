# Adendo: Guarda de papel no frontend (correção do F-01)

> Identificador: `011-rbac-frontend`
> Data: `2026-09-24`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/011-rbac-frontend/` — **apenas o watch**. A mudança **não**
> percorreu o ciclo forward: nasceu de revisão de segurança, e este adendo é o registro dela.

## Vigência

Vigente desde 2026-09-24.

## Resumo da entrega

Primeira mudança de **comportamento** registrada neste corpus depois do ciclo de provas (features
`001` a `010`). Ela corrige o achado **F-01** das duas auditorias de segurança — "menu de navegação
e rotas administrativas expostas a todos os usuários sem verificação de privilégio no frontend",
reconfirmado pela auditoria de 2026-09-16 já sobre o código migrado para TypeScript.

**A primeira tentativa foi recusada, e vale registrar por quê.** Ela existia na árvore de trabalho
sem commit: guardava as três rotas (`Doctors`, `Templates`, `AccessLogs`) e, para que a guarda
passasse em modo offline, acrescentava `role: 'admin'` ao `OFFLINE_USER`. As duas coisas foram
recusadas:

1. a promoção do usuário de demonstração o torna **administrador num modo que não aplica RLS**
   (`BR-OFF10`), e contradiz `src/types/User.ts`, que se declara espelho exato de `mockClient.ts`;
2. a guarda de rota em Médicos e Templates **restringe a LEITURA**, que é livre para autenticados
   (`BR-MIGRAR-017` e `BR-MIGRAR-020`). O que é restrito ali é a escrita.

A correção entregue separa as duas coisas — rota onde a leitura é restrita, ação onde o restrito é
a escrita:

| Onde | Guarda | Regra que autoriza |
| :--- | :--- | :--- |
| Navegação (`Layout.tsx`) | O item da trilha de auditoria some para quem não é admin | BR-MIGRAR-024 |
| Rota (`App.tsx`) | `/AccessLogs` exige `admin`; `/Doctors` e `/Templates` **não** | BR-MIGRAR-024 × BR-MIGRAR-017/020 |
| Tela de Médicos (`Doctors.tsx`) | Criar, editar e excluir somem para quem não é admin | BR-MIGRAR-015 |
| Tela de Templates (`Templates.tsx`) | Idem, **incluindo** o botão do estado vazio | BR-MIGRAR-020 |

Um ponto único novo, `src/lib/useCurrentUser.ts`, passou a servir navegação, guarda de rota e
guardas de ação — antes, cada uma abria a própria consulta. Ele lê o papel; **não** autoriza.

**Verificação.** A suíte vai de **168 verificações em 26 arquivos** para **179 em 28**, com 0
falhas e `typecheck` em 0 erros. As 11 novas vivem em `Layout.test.tsx` (reescrito, 4),
`RbacRotas.test.tsx` (novo, 4) e `GuardasDeAcao.test.tsx` (novo, 6). A prova das guardas de ação
foi **falsificada antes de ser aceita**: desligada a guarda nas duas telas, 3 das 6 verificações
falharam — exatamente as que medem o não-admin —, e foi revertida sem resíduo.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-spec-matrix.md` | `#Correção do F-01 — guarda de papel no frontend` | `regra-nova` | **Seção nova.** O que mudou, a regra que autoriza cada parte, os três arquivos de prova e a falsificação executada. **Leia como:** a última linha da tabela — Médicos e Templates continuam visíveis — é o que distingue a correção de um excesso |
| `_reversa_sdd/code-spec-matrix.md` | `#Lacunas de prova` — a linha da tela oferecida a não-admin | `regra-alterada` | A linha saiu de 🟢 **provada e declarada** para ✅ **Fechada**. **Leia como:** o texto que afirmava "o item de navegação não tem condição de papel" descrevia o código de então, e está preservado no adendo `006` e no watch `W008` daquela feature |
| `_reversa_sdd/code-spec-matrix.md` | `#Cenários de paridade do grupo 07` — `PT-007.2` | `regra-alterada` | A cláusula final dizia que "a tela é oferecida a quem não é admin, o que torna imprecisa a nota de `code-analysis.md#5.1`". **Leia como:** a tela deixou de ser oferecida, e a nota **volta a ser precisa** |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` — tabela de medições | `regra-alterada` | Entra a linha de medição da `011` (179 verificações, 28 arquivos, 72,5 s a 101,5 s) e a nota de que é a **primeira rodada do projeto a ultrapassar o teto declarado de 90 s** nesta máquina — com a mesma suíte medindo 72,5 s minutos antes |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` — a nota do `lint` | `regra-alterada` | A nota afirmava que o `lint` "confere estilo e imports mortos". **Leia como:** ele **não examina arquivo nenhum** — o `eslint.config.js` casa apenas padrões `.jsx`, e todos os `.jsx` restantes vivem na pasta que ele próprio ignora. O "0 avisos" das medições não mede nada |
| `_reversa_sdd/code-analysis.md` | `#5.1 Entidade AccessLog` — a linha "Implicação" | `regra-alterada` (leitura) | A extração diz "Somente admins veem a tela de auditoria; tentativa de usuário comum retornará vazio/negado". **Leia como:** a primeira metade, que o adendo `006` teve de declarar imprecisa, **passou a ser verdadeira**; a segunda nunca deixou de ser. O texto **não** é reescrito |
| `_reversa_sdd/addenda/006-prova-logs-acesso.md` | Tabela de impacto, linha de `code-analysis.md#5.1` | `regra-alterada` (leitura) | O adendo `006` declara a nota "imprecisa na primeira metade". **Leia como superado neste ponto específico** por este adendo. O texto do `006` **não** é reescrito — adendo é registro histórico |
| `_reversa_forward/006-prova-logs-acesso/regression-watch.md` | `W008` | `regra-alterada` (leitura) | O item vigiava "a navegação **não** consulta papel", com o sinal de violação nomeando exatamente o que foi feito. **Leia como:** `W008` está **superado**, e a mudança foi antecipada por ele como regra nova legítima — não como defeito |
| `_reversa_forward/006-prova-logs-acesso/legacy-impact.md` | Linha do `Layout.test.tsx` e a conclusão "a navegação não consulta papel nenhum" | `regra-alterada` (leitura) | Fica superado pelo mesmo motivo. A prova daquele arquivo foi **reescrita**, não apagada |

## Regras sob vigilância

Seis itens no watch principal da mudança — `W001` a `W006` —, em
`_reversa_forward/011-rbac-frontend/regression-watch.md`. Três observações (`O001` a `O003`) ficam
registradas no mesmo arquivo, **sem peso de regressão**: são os limites declarados da correção.

## Fontes

- `_reversa_forward/011-rbac-frontend/regression-watch.md`
- `src/App.tsx`, `src/Layout.tsx`, `src/lib/useCurrentUser.ts`
- `src/pages/Doctors.tsx`, `src/pages/Templates.tsx`, `src/api/mockClient.ts`
- `src/__tests__/Layout.test.tsx`, `src/__tests__/RbacRotas.test.tsx`,
  `src/__tests__/GuardasDeAcao.test.tsx`
- `docs/security-audit/001-record/` e `docs/security-audit/002-record/` (achado F-01)
- `_reversa_sdd/migration/target_business_rules.md` — BR-MIGRAR-015/017/020/024
