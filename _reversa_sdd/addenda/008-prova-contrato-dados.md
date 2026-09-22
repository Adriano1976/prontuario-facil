# Adendo: Prova automatizada do contrato de dados

> Feature: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-22.

## Resumo da entrega

Provar os quatro cenários de `PT-010` — o contrato de acesso a dados — e fazê-lo com o
instrumento que o próprio contrato exige: o **gate de tipos**. É o único grupo de paridade cuja
prova é de **compilação**, e não de execução. A entrega cita os casos que já cobriam parte dos
cenários, escreve casos novos para as metades descobertas, adota a **guarda de codificação** que
provava sem promessa, e — o mais consequente — dá ao arnês a capacidade de expressar um **caso
positivo**, aquele que **deve compilar**. Com ela, o buraco declarado em `F-03` deixa de ser
ressalva e passa a ser **medido**.

**Ações concluídas: 13 de 13** (`actions.md`).

Gates medidos em 2026-09-22: `npm run prova:negativos` com **16 casos — 15 negativos e 1
positivo —, todos como esperado e sem resíduo**, `npm run prova:encoding` com 438 arquivos
íntegros, `npm run typecheck` e `npm run lint` com zero ocorrências, e `npm test` com **132
verificações em 23 arquivos e 0 falhas**, em 74,83 s.

**Nenhum arquivo de aplicação foi tocado.** `base44/entities/`, `src/api/`, `src/types/` e
`src/lib/` estão sem nenhum diff — a feature **mede** o contrato, e não o altera. O único arquivo
de código que muda é o arnês de provas, `src/test/verificacoes-negativas.mjs`.

> **O achado que passa a ser medido, e não declarado.** `contract.ts` e `scopedRead.ts` já
> registravam que o compilador confere **forma** e nunca **autorização** (achado **F-03**). Agora
> há um caso **positivo** provando que qualquer código declara `{ kind: 'admin' }` e **compila** —
> e o par negativo entrega o **mesmo** objeto a `filterOwned` e é recusado. A diferença entre os
> dois é o **método**, e não quem chama.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/code-spec-matrix.md` | `Cenários de paridade do grupo 10` | `regra-nova` | Seção nova com o veredito dos quatro cenários, com a nota de que é o **único grupo provado por compilação**. `PT-010.1` 🟢 **com ressalva** (o tipo garante que o escopo foi informado, nunca que é legítimo); `PT-010.2` e `PT-010.4` 🟢; `PT-010.3` 🟢 **com duas ressalvas** — os retornos dos adaptadores e o ponto de ligação |
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo `Contrato de dados (10)` deixa de estar endereçado a uma feature a criar e passa a **concluído**. O saldo dos cenários transferidos cai de **31 para 27** — 11 de fluxo e os 16 de paridade visual |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | Ganha **cinco linhas novas**: o contrato garante forma e não autorização (**agora medido**); os retornos dos adaptadores não são verificados; o ponto de ligação é uma asserção; o ramo administrativo de `applyScope` é inalcançável pelo tipo; e a inferência de `UserRole` permanece. A linha das verificações negativas vai de **9 para 16 casos**, com a distinção entre negativos e positivos |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` — a guarda de encoding | `regra-alterada` | A linha `Prova de encoding sem dono no ciclo forward` passa de 🟡 **declarada** a ✅ **fechada**: a guarda é adotada por esta feature, e uma falha dela passa a ter contrato dizendo qual promessa foi violada |
| `_reversa_sdd/code-spec-matrix.md` | `Como a prova é executada` | `regra-alterada` | O comando de provas negativas passou a ser descrito com as **duas naturezas** de caso, e a guarda de encoding consta como tendo dono. A tabela de medições, que estava **parada na feature 004**, ganhou as linhas das features 005 e 006 e a observação de que o tempo é uma propriedade **condicional** |
| `_reversa_sdd/domain.md` | `2.4 Segurança e Auditoria` | `regra-alterada` | O adendo da feature 001 registrou ali a **RN-07**, que fez a leitura de dado clínico exigir a declaração do escopo. Esta feature acrescenta a medida do alcance dela: a exigência é de **forma**, e o compilador **não** valida autorização. A regra permanece; o que passa a existir é o limite explícito |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | `Resumo da entrega` | `regra-alterada` | O adendo da 001 descreve o contrato como **"a rede de proteção que o projeto não tinha"**. A rede existe e é real — e esta feature mede o **tamanho** dela: três cláusulas de `PT-010.3` e de `F-03` **não** são verificadas. O texto do adendo **não** é reescrito: ele descrevia corretamente o que a 001 entregou |
| `_reversa_sdd/code-analysis.md` | `10.3 Contratos expostos` (modo offline) | `regra-alterada` | O contrato do adaptador passa a ter prova de que **tem dentes**: o caso `adaptador-incompleto` demonstra que omitir um dos gateways exigidos é recusado pelo gate de tipos |

> O adendo **anota, não corrige**: nenhuma afirmação dos artefatos originais foi editada. As
> extensões de `code-spec-matrix.md` foram aplicadas pelas ações T008 a T010 da própria feature,
> com a razão declarada no arquivo; o que este adendo faz é registrar que existem, para quem lê a
> extração sem passar pelo ciclo forward.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/008-prova-contrato-dados/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009` · `W010` · `W011` · `W012`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar: são
**propriedades que precisam continuar verdadeiras**. Três merecem destaque:

- **`W003` vigia o caso positivo do buraco de `F-03`** — e registra o que fazer quando ele
  **deixar** de compilar: isso significaria que o furo foi fechado. **Não é defeito**: é mudança
  de comportamento, e a prova tem de ser alterada **de propósito**.
- **`W007` é um watch de AUSÊNCIA**, tipo que este projeto já usa: ele vigia os `as` sobre os
  retornos dos adaptadores. Se eles sumirem, a ressalva de `PT-010.3` deixa de valer e a matriz
  tem de parar de declará-la.
- **`W012` vigia a tabela caso × cenário** — porque a forma mais discreta de o grupo `10` mentir
  seria listar apenas cobertura. A metade que **nomeia o que não é coberto** é o artefato mais
  útil desta entrega.

A seção de observações daquele arquivo registra os oito itens sem peso de regressão, entre eles a
inferência de `UserRole` (que esta feature **não** resolve), a colisão `BR-MIGRAR-0xx` ×
`BR-OFF0x`, e o fato de a `code-spec-matrix.md` ser **arquivo compartilhado** por duas sessões.

## Fontes

- `_reversa_forward/008-prova-contrato-dados/legacy-impact.md`
- `_reversa_forward/008-prova-contrato-dados/regression-watch.md`
- `_reversa_forward/008-prova-contrato-dados/requirements.md`
- `_reversa_forward/008-prova-contrato-dados/roadmap.md`
- `_reversa_forward/008-prova-contrato-dados/investigation.md`
- `_reversa_forward/008-prova-contrato-dados/data-delta.md`
- `_reversa_forward/008-prova-contrato-dados/actions.md`
- `_reversa_forward/008-prova-contrato-dados/progress.jsonl`
- `_reversa_forward/008-prova-contrato-dados/onboarding.md`

---
*Gerado pelo Reversa-Sync em 2026-09-22.*
