# Regression Watch: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

Este arquivo diz o que precisa **continuar verdadeiro** quando uma nova extração `/reversa`
rodar sobre este código. Ele não é uma lista de desejos: cada item nasceu de uma leitura que
esta feature mediu, e o sinal de violação é o que se deve procurar no diff da re-extração.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
| :--- | :--- | :--- | :--- | :--- |
| **W001** | `src/api/scopedRead.ts#L73-90`; `PT-010.1` | A entidade sob RLS **não expõe** `list` nem `filter` crus: a leitura passa obrigatoriamente pelo escopo | `presença` | `OwnedEntity` volta a expor leitura crua, ou alguém acrescenta um método que a contorne |
| **W002** | `src/types/User.ts#L48-56`; `PT-010.2`; achado F-01 | A variante offline do usuário tem `role` **estruturalmente ausente**, e o papel não pode ser extraído dela | `presença` | `OfflineUser` ganha `role` utilizável, ou a ausência deixa de ser `never` |
| **W003** | `src/api/contract.ts#L178-188`; achado F-03 | Qualquer código declara `{ kind: 'admin' }` e **compila** — o contrato garante forma, nunca autorização | `presença` | O caso **positivo** passa a ser recusado. Isso significaria que o buraco foi fechado: **não é defeito**, é mudança de comportamento, e a prova tem de ser alterada de propósito |
| **W004** | `src/api/entities.ts#L73-88`; `PT-010.3` | O contrato tem **dentes**: um adaptador que omite um gateway é recusado | `presença` | `AdapterGateways` deixa de exigir um dos gateways, ou o caso `adaptador-incompleto` deixa de ser recusado |
| **W005** | `src/types/Appointment.ts#L19-25`; `src/types/Prescription.ts#L8-14`; `PT-010.4` | Os conjuntos fechados de situação de agendamento e de tipos documentais continuam fechados | `presença` | Um valor fora do conjunto passa a compilar — e aí o domínio perdeu a união fechada |
| **W006** | `src/test/verificacoes-negativas.mjs`, os **nove casos originais** | Os nove casos da feature 001 continuam sendo recusados **pelo motivo certo** | `presença` | Qualquer um deles passa a "recusado, mas não pelo motivo esperado" ou a não ser recusado. Eles são prova **citada** por outras features |
| **W007** | `src/api/entities.ts#L53-71` | Os **retornos** dos adaptadores **não** são verificados: `createEntityRepository` converte cada um com `as` | `ausência` | Os `as` somem e os retornos passam a vir tipados do adaptador. Isso **fecharia** a ressalva de `PT-010.3`, e a matriz teria de parar de declará-la |
| **W008** | `src/api/entities.ts#L136-144` | O encaixe no registry é uma **asserção** (`as unknown as Parameters<...>`), com a justificativa de contravariância no comentário | `presença` | A asserção soma ou o comentário que a explica some — a segunda hipótese é pior, porque deixa a decisão sem rastro |
| **W009** | `src/api/scopedRead.ts#L118-157` | O ramo administrativo de `applyScope` é **inalcançável pelo tipo** a partir de `filterOwned`, que só aceita escopo de dono | `presença` | `filterOwned` passa a aceitar `AccessScope`. Seria mudança de contrato, e o caso `escopo-admin-em-metodo-de-dono` deixaria de ser recusado |
| **W010** | `src/test/mojibake.mjs` e `mojibake.test.mjs` | A guarda de codificação **tem dono** no ciclo forward desde a feature 008, e os dois arquivos permanecem **intocados** por ela | `presença` | A guarda deixa de ser reivindicada, ou passa a ser alterada "de passagem" por outra feature |
| **W011** | `src/test/verificacoes-negativas.mjs`, conferência de resíduo | O comando roda o gate **duas** vezes por execução e falha se sobrar arquivo de prova | `presença` | A segunda passada some, ou a pasta `src/__negative_checks__/` fica para trás e derruba o `typecheck` |
| **W012** | `_reversa_forward/008-prova-contrato-dados/onboarding.md#5.1` | A tabela caso × cenário nomeia **o que não é coberto**, e não só o que é | `presença` | A tabela passa a listar apenas cobertura. Seria a forma mais discreta de o grupo `10` mentir |

## Observações

Itens que **não** têm peso de regressão: são leituras declaradas, inferências do projeto ou
limitações de instrumento.

| # | Item | Situação |
| ---: | :--- | :--- |
| 1 | **A inferência de `UserRole`** | Apenas `'admin'` está documentado de forma literal; `'user'` é inferência, com pendência de confirmação registrada em `src/types/User.ts:9-11`. A feature provou que o papel é explícito no tipo, **não** qual é o seu segundo valor |
| 2 | **A colisão `BR-MIGRAR-0xx` × `BR-OFF0x`** | Dois artefatos de regras do projeto descrevem superfícies que se sobrepõem, com identificadores próprios. Toda citação qualifica a origem |
| 3 | **O SDK real não é exercitado** | A conformidade do adaptador online é verificada por **tipo**, e não por execução: exercitá-lo exigiria rede e credenciais |
| 4 | **A autorização não é alcançável pelo cliente** | Nenhuma prova do cliente toca a RLS do BaaS. O que existe é a **medida** de que o tipo não pergunta quem chama |
| 5 | **Os conjuntos que o cenário não nomeia** | `TemplateType`, `ExamType` e as ações de auditoria são conjuntos fechados do domínio e ficam fora, cada um pertencente ao seu módulo (decisão `4a`) |
| 6 | **O teto de 90 segundos é condicional** | A mesma suíte já mediu 75,78 s e 122,57 s. A medição desta feature saiu em 74,83 s, com a máquina calma — e isso não é garantia |
| 7 | **A `code-spec-matrix.md` é arquivo compartilhado** | Duas sessões escreveram nela em 2026-09-22. O conflito de numeração das features `007` nasceu de agir sem reler o estado; a regra de trabalho é reler do zero antes de cada edição |
| 8 | **A tabela de medições da matriz estava parada na feature 004** | Esta feature acrescentou as linhas das features 005 e 006, que as suas antecessoras não registraram. Uma medição que não acompanha as features deixa de ser medição |

## Histórico de re-extrações

> Preenchido pelo agente reverso quando `/reversa` rodar de novo. Vazio até então.

## Arquivadas

> Itens que deixarem de ser verdade e forem endereçados saem daqui, com a data e a razão.
> Vazio até então.

---
*Gerado pelo Reversa-Coding em 2026-09-22.*
