# Impacto no Legado: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido no início da rodada:

```json
{
  "version": 1,
  "allowLegacyEdits": true,
  "allowedPaths": ["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]
}
```

O arquivo modificado — `src/test/verificacoes-negativas.mjs` — casa com o glob `src/**` e estava
liberado. Nenhuma escrita foi feita fora da lista, e `.reversa/reversa-config.json` **não** foi
tocado. As pastas próprias do Reversa receberam o adendo de rastreabilidade e os artefatos da
feature.

> **Um arquivo que a feature quis tocar e não tocou:** `src/api/entities.ts`, para fechar os dois
> buracos do `PT-010.3` — os retornos convertidos por `as` e a asserção no ponto de ligação.
> Fechá-los é decisão de **produto**, e não de prova: a feature mede o contrato, e não o
> conserta. Os dois entram declarados na matriz.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| `src/test/verificacoes-negativas.mjs` | Arnês de provas negativas | `regra-alterada` | **MEDIUM** | O instrumento compartilhado ganha a distinção entre caso que **deve ser recusado** e caso que **deve compilar**, e recebe 7 casos novos. Os **9 casos originais não foram tocados** — eles são prova citada por outras features —, e o comando confere caso a caso que todos continuam sendo recusados pelo motivo certo |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganha a seção de paridade do grupo `10`, cinco linhas novas em lacunas de prova, a guarda de encoding deixando de ser órfã, o saldo 31 → 27 e as medições das features 005 e 006 |
| `_reversa_forward/008-prova-contrato-dados/*` | Artefatos do ciclo forward | `componente-novo` | **LOW** | Requirements, roadmap, investigação, delta de dados, onboarding, ações, progresso, watch e este arquivo |

## Diff conceitual por componente

**Nenhum arquivo de aplicação foi tocado.** `git status --porcelain` sobre `base44/entities`,
`src/api`, `src/types` e `src/lib` **saiu vazio**. Este é o diff mais estreito do ciclo forward: a
feature prova o contrato, e não o altera.

**O único código que muda é o arnês de provas.** Ele é infraestrutura de prova, e a mudança nele
tem duas partes:

1. **A capacidade nova.** O comando, até aqui, só sabia expressar **recusa**: um arquivo sem erro
   era lido como "NÃO foi recusado pelo gate" e entrava na lista de falhas. Agora cada caso pode
   ser declarado **positivo** — aquele que **deve compilar**. É essa distinção que permite medir
   um buraco do contrato em vez de apenas registrá-lo como ressalva.
2. **Os sete casos novos**, dos quais **um é positivo**. Os outros seis cobrem as metades que os
   quatro cenários de `PT-010` deixavam descobertas.

**O achado que passa a ser medido, e não declarado.** `contract.ts` e `scopedRead.ts` já
registravam que o compilador confere **forma** e nunca **autorização** (achado **F-03**). O que
faltava era a medida. O caso positivo `escopo-administrativo-declarado-por-qualquer-um` prova que
qualquer código declara `{ kind: 'admin' }` e **compila** — e o par negativo
`escopo-admin-em-metodo-de-dono` entrega o **mesmo** objeto a `filterOwned` e é recusado. A
diferença entre os dois é o **método**, e não quem chama.

**Uma correção de instrumento, registrada.** A tentativa inicial de provar `PT-010.2` por
**comparação** de papel (`usuario.role === 'admin'` sobre a variante offline) **não era
recusada**: o TypeScript permite comparar `undefined` com string. O caso foi substituído por
**extração** do papel, que é recusada — a ausência é estrutural, então o valor não pode ser usado
onde um papel é exigido. O comentário do caso registra a tentativa, para que ninguém a repita.

**A guarda de encoding deixa de ser órfã.** A decisão `3a` a adota, e a adoção é de **registro**:
`src/test/mojibake.mjs` e `src/test/mojibake.test.mjs` **não** foram alterados. O que muda é que
a matriz deixa de listá-la como prova sem dono, e uma falha dela passa a ter contrato dizendo qual
promessa foi violada.

## Preservadas

Regras 🟢 e estruturas que esta feature **confirmou por medição**, e que seguem intactas:

| Regra / estrutura | Origem | O que a prova confirmou |
| :--- | :--- | :--- |
| Leitura de entidade sob RLS exige escopo | `scopedRead.ts`; `PT-010.1` | Confirmada por **três casos citados** mais um caso novo que prova a ausência de leitura crua |
| O papel é explícito no tipo | `User.ts`; `PT-010.2`; F-01 | Confirmada por dois casos novos: atribuir papel à variante offline e extrair papel dela são ambos recusados |
| Os conjuntos fechados continuam fechados | `Appointment.ts`, `Prescription.ts`, `Consultation.ts` | Confirmada para os três: `ConsultationStatus` por caso citado, os dois outros por casos novos |
| O contrato tem dentes | `entities.ts`; `PT-010.3` | Confirmada: um adaptador que omite um gateway é recusado |
| A trilha de auditoria é somente inserção | `AccessLogger.ts` (feature 006) | **Não tocada** por esta feature; o caso `status-fora-do-conjunto` que a 004 cita continua passando |
| Regra de ouro do diff: schemas de entidade intocados | `architecture.md#1` | `base44/entities/` **sem nenhum diff** |

## Modificadas

Nenhuma regra de negócio foi alterada, removida ou rebaixada. Nenhum tipo, contrato ou
comportamento mudou. O que mudou foi o **veredito de prova** de leituras que já existiam — e uma
lacuna que deixou de existir:

| Leitura | De | Para | Onde está registrado |
| :--- | :--- | :--- | :--- |
| Destino do grupo `Contrato de dados (10)` | "Feature a criar" | ✅ **concluído** | `code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` |
| Saldo dos cenários | 31 transferidos | **27 transferidos** (11 de fluxo e 16 visuais) | Nota de saldo da matriz |
| Verificações negativas do gate de tipos | 9 casos | **16 casos** — 15 negativos e 1 positivo | `code-spec-matrix.md#Lacunas de prova` |
| Prova de encoding sem dono | 🟡 declarada | ✅ **fechada** — adotada por esta feature | `code-spec-matrix.md#Lacunas de prova` |
| Tabela de medições da matriz | parada na feature 004 | **atualizada** até a 006, com a faixa de tempo condicional | `code-spec-matrix.md#Como a prova é executada` |
| O buraco de `F-03` | declarado em dois arquivos | **medido** por caso positivo | `code-spec-matrix.md#Lacunas de prova` |

**Não modificadas, e a ausência é deliberada:** `src/api/contract.ts`,
`src/api/scopedRead.ts`, `src/api/registry.ts`, `src/api/entities.ts`, `src/types/User.ts`,
`src/test/mojibake.mjs`, `src/test/mojibake.test.mjs`, `base44/entities/*.jsonc` e
`src/test/verificacoes-negativas.mjs` nos seus **nove casos originais**. Nenhum byte deles foi
tocado — a feature mede o contrato, não o altera.

---
*Gerado pelo Reversa-Coding em 2026-09-22.*
