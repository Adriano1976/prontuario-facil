# Adendo: Prova automatizada do módulo de Consultas

> Feature: `004-prova-consultas`
> Data: `2026-09-21`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-21.

## Resumo da entrega

Provar a máquina de estados da consulta — o funil clínico — e os pontos onde ela decide o
que o médico vê. O módulo de Consultas tinha prova dos componentes auxiliares (a linha do
tempo clínica e a busca de paciente) e **nenhuma** da máquina de estados: o status inicial,
a troca de situação, o filtro da listagem e a legenda do detalhe nunca foram verificados.

A feature converteu em prova de execução os **3 cenários de paridade** do módulo (PT-005),
com a regra que já governa o ciclo: **a prova segue o comportamento do código e declara o
cenário impreciso**. Nenhum arquivo de aplicação, contrato de dados ou schema de entidade
foi modificado.

**Ações concluídas: 14 de 14** (`actions.md`).

Gates medidos em 2026-09-21: `npm test` com **90 verificações em 17 arquivos** e 0 falhas
(63,7 s, contra o teto declarado de 90 s), `npm run typecheck` com 0 erros, `npm run lint`
com 0 erros e `npm run prova:negativos` com 9 de 9 casos recusados pelo motivo esperado e
sem resíduo. O acréscimo desta feature foi de **24 verificações em 3 arquivos** — listagem,
detalhe e formulário.

**Nenhuma regra de negócio foi alterada, nenhum contrato de dados mudou e nenhum
comportamento observável foi tocado.** As linhas de leitura alterada abaixo não registram
mudança no sistema: registram que a extração **agora se sabe** divergente do código em
quatro pontos novos, e que a divergência passou de suspeita a provada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/code-spec-matrix.md` | `Rastreabilidade Spec → Código → Teste` | `regra-nova` | **Acrescente o bloco `Módulo Consultas`**: 16 linhas de veredito de prova por promessa, com **todo identificador qualificado pelo artefato de origem**. A qualificação não é estilo: existem duas grafias de `BR-C` colidindo, e `BR-C01` sozinho não identifica regra nenhuma |
| `_reversa_sdd/code-spec-matrix.md` | `Cenários de paridade do módulo Consultas` | `regra-nova` | **Seção nova.** Os 3 cenários de PT-005 com veredito individual. **PT-005.1** tem redação imprecisa e **PT-005.3** é metade verdadeira e metade falsa |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas declaradas do módulo de Consultas` | `regra-nova` | **Seção nova.** As oito linhas de `code-analysis.md#9` com severidade e veredito, uma a uma, mais o achado de auditoria como nona |
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | **Leia como:** dos 50 cenários transferidos pela feature 002, **11 estão concluídos** (8 de Agendamentos e 3 de Consultas) e **23 permanecem** transferidos. A linha de Consultas deixa de ser "feature a criar" |
| `_reversa_sdd/code-spec-matrix.md` | `Como a prova é executada` | `regra-alterada` | **Leia como:** a medição não é mais "66 verificações em 14 arquivos"; é **90 em 17**. O bloco passou a ter três medições lado a lado |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | A tabela passou a refletir a feature 004 e ganhou onze linhas novas, entre elas a assimetria de auditoria, as três ações órfãs do catálogo, o recorte "semana" que inclui o futuro e a metade não provável do status inicial |
| `_reversa_sdd/inventory.md` | `Cobertura de testes` | `regra-alterada` | **Leia como:** 17 arquivos de verificação e 90 verificações, não 14 e 66 |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | **Acrescente a prova do módulo de Consultas** à camada de prova: três arquivos de verificação e uma massa compartilhada |
| `_reversa_sdd/domain.md` | `2.4 Segurança e Auditoria` | `regra-alterada` | **BR-S01 está provada como divergente.** Ela diz que todo acesso ou alteração de dado sensível gera log; emitir um documento a partir da consulta **não** gera. **Leia com ressalva:** a regra não mudou no sistema, e o defeito não foi corrigido |
| `_reversa_sdd/code-analysis.md` | `3.3 Criar/Editar Consulta` | `regra-alterada` | **Leia como:** a consulta criada pelo **formulário** nasce `em_andamento`, e não `agendada` como o schema documenta. O avanço para `em_andamento` não é uma transição, é o estado inicial |
| `_reversa_sdd/code-analysis.md` | `4.2 Filtro de Intervalo de Data` | `regra-alterada` | **A nota sobre `upcoming` estava certa e agora tem prova.** Acrescente um achado que o artefato **não** registrava: o recorte "última semana" é `>= hoje - 7 dias` **sem limite superior**, e por isso inclui consultas futuras |
| `_reversa_sdd/code-analysis.md` | `5.4 DTO interno formData (NewConsultation)` | `regra-alterada` | **A divergência registrada ali agora tem prova — e uma segunda manifestação.** O formulário grava `em_andamento`; e o **fallback do modo edição** para um registro sem situação também é `em_andamento`, e não o `agendada` do schema |
| `_reversa_sdd/code-analysis.md` | `9. Pontos de Atenção / Lacunas` | `regra-alterada` | **As oito linhas passaram a ter veredito**, e a linha "sem testes" está **fechada para este módulo**. Uma **nona lacuna foi acrescentada**, porque não constava do artefato: o catálogo de auditoria declara doze ações e três nunca são invocadas |
| `_reversa_sdd/state-machines.md` | `2. Status de Consulta` e `4. Matriz de Transições (Inferida)` | `regra-alterada` | A máquina da consulta **tem prova**. A matriz de transições continua **ausente** para a consulta: `#4` é 🟡 e cobre apenas o agendamento |
| `_reversa_sdd/consultas/requirements.md` | `2. Regras de Negócio (BRs)` | `regra-alterada` | **BR-C01 e BR-C02 têm prova** de execução. **BR-C03 continua declarada**, sem prova — fora do escopo desta feature |

> **O adendo anota, não corrige.** Nenhuma das afirmações acima foi editada nos artefatos
> originais — o adendo é a ponte até a próxima re-extração. As únicas escritas em artefato da
> extração feitas por esta feature estão em `code-spec-matrix.md`, e são aditivas.

### Três armadilhas de leitura, declaradas

1. **Duas grafias de `BR-C` com um caractere de diferença.**
   `_reversa_sdd/consultas/requirements.md#2` escreve `BR-C01`, `BR-C02`, `BR-C03` (**sem**
   hífen); `_reversa_sdd/code-analysis.md#6` escreve `BR-C-01` a `BR-C-12` (**com** hífen).
   São conjuntos **diferentes** de regras sobre o mesmo módulo. Contornado por citação
   qualificada (RN-09); a raiz é defeito documental da extração.
2. **Os identificadores `W00x` reiniciam a cada feature.** A 001 usa `W001`–`W009`, a 002
   `W001`–`W008`, a 003 `W001`–`W011` e esta `W001`–`W013`. **Toda referência a um watch item
   precisa nomear a feature de origem.**
3. **A metade do status inicial que NÃO é provável.** O default `agendada` é aplicado pelo
   servidor e não é observável no cliente (decisão D-06). O cenário Gherkin *"Consulta sem
   situação informada cai no default do schema"* é **declarado**, e aparece na matriz com
   essa ressalva. Lê-lo como 🟢 sem ela é ler cobertura onde não há.

> **Sobre o adendo da feature 001.** A frase "não existe teste automatizado" que ele contém
> já foi anotada pelo adendo da feature 002 (D-11: o adendo da 001 não é reescrito). Esta
> feature **não** reabre essa correção.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/004-prova-consultas/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009` · `W010` · `W011` · `W012` · `W013`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar: são
**propriedades que precisam continuar verdadeiras**. Os oito primeiros vigiam a máquina de
estados e a listagem; `W009` e `W010` vigiam o formulário; `W011` vigia a veracidade da
matriz; `W012` vigia a permanência das lacunas declaradas; `W013` vigia a união fechada do
tipo de situação.

A seção de observações daquele arquivo registra, **sem peso de regressão**, os defeitos reais
encontrados e não corrigidos — entre eles a **assimetria de auditoria** e as duas lacunas de
severidade Alta (`applyTemplate` sem escape e `handlePrint` por `window.open`) — e as duas
**armadilhas de arnês** que custaram execuções inteiras nesta feature: o dublê de consulta
que devolve array novo a cada renderização e trava o processo, e a digitação num campo
`datetime-local`.

## Fontes

- `_reversa_forward/004-prova-consultas/legacy-impact.md`
- `_reversa_forward/004-prova-consultas/regression-watch.md`
- `_reversa_forward/004-prova-consultas/requirements.md`
- `_reversa_forward/004-prova-consultas/roadmap.md`
- `_reversa_forward/004-prova-consultas/actions.md`
- `_reversa_forward/004-prova-consultas/progress.jsonl`
- `_reversa_forward/004-prova-consultas/onboarding.md`
- `_reversa_forward/004-prova-consultas/investigation.md`

---
*Gerado pelo Reversa-Sync em 2026-09-21.*
