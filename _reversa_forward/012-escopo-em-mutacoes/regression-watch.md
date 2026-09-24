# Regression Watch: Obrigatoriedade de escopo nas mutações (correção do F-03)

> Identificador: `012-escopo-em-mutacoes`
> Data: `2026-09-24`
> Este arquivo foi escrito **fora do ciclo forward** — a mudança nasceu de revisão de segurança — e
> é lido pelo `/reversa-sync` e por futuras re-extrações. Os itens abaixo precisam continuar
> verdadeiros.
>
> ⚠️ **A lista vigente é `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`**, que
> consolida os watches das três correções de 2026-09-24 e acrescenta o do F-05. Este arquivo fica como
> registro da entrega do F-03 isoladamente. Os cinco itens abaixo estão **todos** consolidados lá, como
> `W006`–`W009` e `W014`.

## Watch principal

Propriedades que a correção do F-03 estabeleceu. Uma violação de qualquer uma delas é mudança de
contrato, e o arnês de casos negativos acusa.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/api/scopedRead.ts` — `OwnedEntity.update` e `OwnedEntity.delete`; `BR-MIGRAR-034` | Endereçar um registro existente por identificador **exige** o escopo na assinatura: `update(scope, id, data)` e `delete(scope, id)` | presença, por compilação | As assinaturas voltam a aceitar `(id, data)` e `(id)`, e o arnês deixa de recusar `mutacao-sem-escopo` / `atualizacao-sem-escopo` |
| W002 | `src/api/scopedRead.ts` — `OwnedEntity.create`; `BR-MIGRAR-036` | A **criação continua sem exigir escopo**: criação é aberta a autenticados, e o dono é carimbado pelo servidor | ausência | `create` passa a exigir escopo. Não é proibido por si — mas é regra nova, e o caso positivo do arnês e as 7 chamadas das telas precisam mudar de propósito |
| W003 | `src/api/scopedRead.ts` — `createOwnedEntity` | A implementação de `update`/`delete` é **pass-through**: recebe o escopo e chama o repositório cru com os mesmos argumentos de antes | presença | A implementação passa a ler o registro, a aplicar filtro de dono ou a lançar por posse. Isso seria **verificação em runtime**, recusada pela decisão registrada em `sessionScope.ts:18-21` — e mudaria o número de requisições de toda a aplicação |
| W004 | `PatientForm.tsx`, `NewConsultation.tsx`, `Appointments.tsx`, `PatientDetail.tsx` | As quatro telas declaram o escopo resolvido por `resolveScope` sobre a sessão — e não um literal, nem um escopo administrativo fixo | presença | Uma chamada volta a omitir o escopo (não compila) ou passa `{ kind: 'admin' }` fixo, que compila e **não** é barrado no cliente |
| W005 | `src/test/verificacoes-negativas.mjs` — casos `mutacao-sem-escopo` e `atualizacao-sem-escopo` | Os dois casos existem e seguem recusando com `TS2554` ("expected more arguments"), e o arnês não deixa resíduo | presença | Um dos casos some, muda de código esperado, ou o arnês passa a aceitar a omissão — o que significa que o contrato deixou de ser exigido |

## Observações

Registradas **sem peso de regressão**: são os limites declarados da correção.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `src/api/scopedRead.ts`; achado **F-03** | A correção **não** verifica posse em runtime. Quem decide a posse continua sendo a regra de acesso do servidor, intocada. A metade "runtime" do achado permanece — por decisão, não por esquecimento |
| O002 | `PT-010`; `sessionScope.ts:18-21` | O escopo declarado por um cliente adulterado (`{ kind: 'admin' }`) **compila** e não é barrado no cliente. O tipo garante a FORMA, nunca a AUTORIZAÇÃO — a mesma nota que já valia para as leituras |
| O003 | `src/test/verificacoes-negativas.mjs` | A obrigatoriedade é de contrato: um `as any` ou um cast explícito escapa dela. O arnês cobre a omissão em código tipado, que é o caso que a disciplina pretende impedir |

## Herança

- **Não supera** nenhum item de watch anterior. A feature `002` vigia a limpeza do arnês (`W006`
  daquela feature) — e essa segue vigente.
- **`006/W006` deixou de valer depois desta correção**, pela irmã `013-leitura-da-trilha`, que fez a
  leitura da trilha **declarar escopo administrativo** — exatamente o que `006/W006` nomeava como sinal
  de violação. A superação está registrada em `014`/`W010`. Esta correção **não** a tocou: o escopo
  dela são as mutações.
- **Fora do ciclo:** as features `001` a `010` têm `requirements.md`, `roadmap.md` e `actions.md`.
  Esta não tem, porque a correção nasceu de revisão de segurança — o registro dela é a seção
  `#Correção do F-03` de `_reversa_sdd/code-spec-matrix.md`.
