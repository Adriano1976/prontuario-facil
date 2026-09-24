# Regression Watch: Leitura da trilha com escopo declarado (correção do F-04)

> Identificador: `013-leitura-da-trilha`
> Data: `2026-09-24`
> Este arquivo foi escrito **fora do ciclo forward** — a mudança nasceu de revisão de segurança — e
> é lido pelo `/reversa-sync` e por futuras re-extrações. Os itens abaixo precisam continuar
> verdadeiros.
>
> ⚠️ **A lista vigente é `_reversa_forward/014-correcao-de-seguranca/regression-watch.md`**, que
> consolida os watches das três correções de 2026-09-24 e acrescenta o do F-05. Este arquivo fica como
> registro da entrega do F-04 isoladamente. Os cinco itens abaixo estão **todos** consolidados lá, como
> `W010`–`W012`, `W015` e `W016`.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/pages/AccessLogs.tsx` — `leituraDaTrilha`; `BR-MIGRAR-024` | A leitura da trilha **declara** escopo administrativo: `asAdmin(scope)` com o escopo vindo de `resolveScope`, e nunca o repositório cru | presença, na prova de tela | A página volta a chamar `AccessLog.list` direto. A prova de `AccessLogs.test.tsx` acusa, porque afirma `asAdmin` chamado e `asUser` não chamado |
| W002 | `src/pages/AccessLogs.tsx`; achado **F-04** | Para escopo que **não** é administrativo, a leitura responde o conjunto vazio e **não chega a perguntar ao servidor** | presença, na prova de tela | O caminho de quem não é admin volta a consultar o transporte — o que reintroduz a indistinção entre "admin lendo" e "qualquer um lendo" |
| W003 | `src/pages/AccessLogs.tsx`; `PT-007.4`; `AMB-004` | O pedido mantém os argumentos **exatos** `('-created_date', 500)`: nem o teto nem a ordenação mudam | presença | O limite ou a ordenação mudam. O teto é paridade **congelada por decisão humana** (AMB-004): mexer nele é decisão de produto, não conserto |
| W004 | `src/pages/AccessLogs.tsx`; `BR-L04`/`BR-L05` | Os filtros continuam **em memória**: mudar ação, texto ou data não reconsulta o servidor, e os filtros não entram na chave da consulta | presença | Surge consulta por filtro, ou os filtros entram na chave — a prova conta as chamadas ao transporte |
| W005 | `src/components/medical/AccessLogger.ts:60` | A **inserção** continua usando a forma de dono (`asUser`), e não a administrativa: a trilha recebe escrita de qualquer autenticado (BR-MIGRAR-024), e declarar escopo de admin para gravar seria declarar um escopo que não corresponde ao de quem grava | presença | A inserção passa a usar `asAdmin`. Isso exigiria que todo usuário autenticado fosse admin para gravar a própria trilha |

## Observações

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `src/api/registry.ts:125` | Em runtime, `asUser` e `asAdmin` devolvem o **mesmo** repositório para `AccessLog`. A declaração de escopo é **contrato**, não mudança de chamada — a mesma natureza da correção do F-03 |
| O002 | `base44/entities/AccessLog.jsonc` | A entidade **não tem campo de inquilino ou organização**. A cláusula "filtro de tenant/organização" do achado F-04 não é implementável como escrita; o isolamento da trilha é por **papel**, na RLS |
| O003 | `src/api/registry.ts:65-67` | A classificação da trilha como entidade de "leitura aberta" continua **imprecisa**: a leitura é admin-only. O que a correção resolveu foi o **uso**, não a classificação |

## Herança e superação

- **Supera** `W006` de `_reversa_forward/006-prova-logs-acesso/regression-watch.md`, que vigiava a
  leitura "sem escopo declarado" e nomeava esta mudança como sinal de violação **e** como "regra
  nova, não conserto". É regra nova, feita de propósito, com a prova reescrita na mesma passada.
- **Supera também** `W006` de `_reversa_forward/011-rbac-frontend/regression-watch.md` — a cópia
  daquele item, escrita quando a correção do F-01 não tocou a leitura da trilha e a declaração de
  escopo ainda era violação. Esta é a correção que a tornou regra: as duas linhas diziam o contrário
  uma da outra, e a divergência foi resolvida marcando a de `011` como superada.
- **Herdado** da mesma feature: os **três modos de perda silenciosa** da trilha e as **ações
  órfãs** do catálogo continuam abertos e vigiados — esta correção não os tocou.
- **Fora do ciclo:** as features `001` a `010` têm `requirements.md`, `roadmap.md` e `actions.md`.
  Esta não tem, porque a correção nasceu de revisão de segurança — o registro dela é a seção
  `#Correção do F-04 — leitura da trilha` de `_reversa_sdd/code-spec-matrix.md`.
