# Adendo: Prova automatizada do módulo de Agendamentos

> Feature: `003-prova-agendamentos`
> Data: `2026-09-21`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-21.

## Resumo da entrega

Fechar a maior superfície do sistema sem nenhuma prova de execução. O módulo de
Agendamentos concentrava duas telas inteiras, a máquina de estados mais complexa do
domínio, o cálculo de disponibilidade que decide o que a clínica pode agendar, a detecção
de conflito de horário e o envio de e-mail de confirmação — tudo sem uma única verificação
automatizada.

A feature converteu em prova de execução os **8 cenários de paridade** do módulo, cobriu os
casos de borda do cálculo de disponibilidade e declarou, com razão, o que permanece sem
prova. A regra que governa a entrega é explícita: **a prova observa, não altera.** Nenhum
arquivo de aplicação, contrato de dados ou schema de entidade foi modificado para acomodar
a suíte.

**Ações concluídas: 11 de 11** (`actions.md`).

Gates medidos em 2026-09-21: `npm test` com **66 verificações em 14 arquivos** e 0 falhas
(57,9 s, contra o teto declarado de 90 s), `npm run typecheck` com 0 erros, `npm run lint`
com 0 erros e `npm run prova:negativos` com 9 de 9 casos recusados pelo motivo esperado e
sem resíduo. O acréscimo desta feature foi de **30 verificações em 4 arquivos** — 22 nas
três provas do módulo e 8 na guarda de encoding.

**Nenhuma regra de negócio foi alterada, nenhum contrato de dados mudou e nenhum
comportamento observável foi tocado.** As linhas de leitura alterada que aparecem abaixo
não registram mudança no sistema: registram que a extração **agora se sabe** divergente do
código em quatro pontos, e que a divergência passou de suspeita a provada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/code-spec-matrix.md` | `Rastreabilidade Spec → Código → Teste` | `regra-nova` | **Acrescente o bloco `Módulo Agendamentos`**: 12 linhas de veredito de prova por promessa, com **todo identificador de regra qualificado pelo artefato de origem**. A qualificação não é estilo: existem duas famílias `BR-A0x` colidindo na extração, e `BR-A01` sozinho não identifica regra nenhuma |
| `_reversa_sdd/code-spec-matrix.md` | `Cenários de paridade do módulo Agendamentos` | `regra-nova` | **Seção nova.** Os 8 cenários de PT-003 e PT-004 com veredito individual e **três ressalvas declaradas**: PT-003.1 e PT-003.3 têm redação que não corresponde ao sistema, e PT-004.2 é vazio por construção |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas declaradas do módulo de Agendamentos` | `regra-nova` | **Seção nova.** As onze linhas de `code-analysis.md#9` com severidade e veredito, uma a uma — decisão D-07: declaradas, não provadas |
| `_reversa_sdd/code-spec-matrix.md` | `Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | **Leia como:** dos 50 cenários transferidos pela feature 002, **8 estão concluídos** (Agendamentos) e **26 permanecem** transferidos. A linha de Agendamentos deixa de ser "feature a criar" |
| `_reversa_sdd/code-spec-matrix.md` | `Como a prova é executada` | `regra-alterada` | **Leia como:** a medição não é mais "36 verificações em 10 arquivos"; é **66 em 14**. O bloco passou a ter as duas medições lado a lado. A citação `W009`, que era nua e não resolvia, foi qualificada |
| `_reversa_sdd/code-spec-matrix.md` | `Lacunas de prova` | `regra-alterada` | A tabela era o retrato de 2026-09-19. Passou a refletir a feature 003 e ganhou quatro linhas novas: a divergência entre as duas visões de disponibilidade, a ausência de validação no salvamento (provada, e não lacuna), a colisão `BR-A0x` e a prova de encoding sem dono no ciclo forward |
| `_reversa_sdd/inventory.md` | `Cobertura de testes` | `regra-alterada` | **Leia como:** 14 arquivos de verificação e 66 verificações, não 10 e 36. A guarda de encoding (`src/test/mojibake.{mjs,test.mjs}`) e `.github/workflows/guarda-encoding.yml` entraram nessa conta e **não pertencem ao `actions.md` de feature nenhuma** |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | **Acrescente a prova do módulo de Agendamentos** à camada de prova: três arquivos de verificação e uma massa compartilhada. Metade do módulo é componente puro e não precisou de um único dublê |
| `_reversa_sdd/domain.md` | `2.2 Agendamentos e Consultas` | `regra-alterada` | **BR-A02 permanece 🟡 inferida — e agora está provada como falsa.** Ela afirma que concluir a consulta marca o agendamento como `concluido`. **Leia como:** a transição é **manual** (BR-A03 de `agendamentos/requirements.md#2`). A regra não mudou no sistema; o que mudou é que deixou de ser dúvida e passou a ser divergência provada |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` (fluxo 4) | `regra-alterada` | **Segunda fonte da mesma divergência.** O fluxo 4 afirma "`Consultation` concluída → `Appointment` atualizado para `concluido`". Corrigir apenas o `domain.md` deixaria a extração mentindo aqui. Provado falso |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` (fluxo 2) | `regra-alterada` | O fluxo 2 afirma que mudar o agendamento para `em_atendimento` **cria** a `Consultation`. Nenhum código faz isso — é a lacuna de auto-vínculo, de severidade Alta, e a razão pela qual o cenário PT-004.2 é vazio |
| `_reversa_sdd/agendamentos/requirements.md` | `2. Regras de Negócio (BRs)` | `regra-alterada` | **BR-A04 promete mais do que o código cumpre.** Ela diz que o horário deve "caber na duração definida por `appointment_duration`"; o laço de geração só confere se o horário **começa** antes do fim do expediente. **Leia com ressalva:** com duração de 45 minutos e expediente até as 18:00, o sistema oferece 17:45, que terminaria às 18:30 |
| `_reversa_sdd/code-analysis.md` | `9. Pontos de Atenção / Lacunas` | `regra-alterada` | **Duas correções de leitura.** (1) A tabela tem **11 linhas**, e não 10 — o `requirements.md` da feature fala em dez e enumera nove. (2) A linha "sem fallback se ausentes" está **imprecisa**: o fallback de `working_hours` **existe** (08:00 às 18:00); o que falta é o de `working_days` |
| `_reversa_sdd/code-analysis.md` | `4.1`, `4.2` e `4.5` | `regra-alterada` | **As limitações documentadas deixaram de ser comentário e passaram a ser promessa verificada.** O laço que não confere a duração, a janela de conflito pontual e a ordem entre e-mail e confirmação de gravação agora têm prova de execução e watch item próprio |

> **O adendo anota, não corrige.** Nenhuma das afirmações acima foi editada nos artefatos
> originais — o adendo é a ponte até a próxima re-extração. As únicas escritas em artefato
> da extração feitas por esta feature estão em `code-spec-matrix.md`, e são aditivas.

### Três armadilhas de leitura, declaradas

1. **Duas famílias `BR-A0x` colidem.** `_reversa_sdd/domain.md#2.2` e
   `_reversa_sdd/agendamentos/requirements.md#2` usam os mesmos códigos para regras
   diferentes. Contornado por citação qualificada (RN-07); a raiz é defeito documental da
   extração, a resolver numa re-extração. Renumerar invalidaria citações existentes,
   inclusive da feature 001.
2. **Os identificadores `W00x` reiniciam a cada feature.** A 001 usa `W001`–`W009`, a 002
   usa `W001`–`W008`, esta usa `W001`–`W011`. **Toda referência a um watch item precisa
   nomear a feature de origem.** A matriz já pagou o preço de não seguir essa disciplina:
   citava `W009` nu, e `W009` só existe na feature 001.
3. **Prova sem dono.** `src/test/mojibake.mjs`, `src/test/mojibake.test.mjs` e
   `.github/workflows/guarda-encoding.yml` existem, passam e são citados na matriz, mas não
   há `requirements.md` que os prometa nem ação que os exija. A rastreabilidade deles é
   incompleta por construção.

> **Sobre o adendo da feature 001.** A frase "não existe teste automatizado" que ele contém
> já foi anotada pelo adendo da feature 002 (D-11: o adendo da 001 não é reescrito). Esta
> feature **não** reabre essa correção — apenas confirma que a anotação continua sendo o
> caminho de leitura correto para o estado presente.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/003-prova-agendamentos/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008` · `W009` · `W010` · `W011`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar: são
**propriedades que precisam continuar verdadeiras** — tanto os comportamentos que a prova
passou a fixar quanto a própria prova. Os oito primeiros vigiam o módulo; `W009` vigia a
veracidade da matriz; `W010` vigia a regra de ouro do diff; `W011` vigia a permanência das
lacunas declaradas.

A seção de observações daquele arquivo registra, **sem peso de regressão**, os defeitos
reais encontrados e não corrigidos — entre eles o **envio acidental do formulário**, porque
o botão do seletor de horário não declara `type` e o componente compartilhado não impõe
padrão: escolher o horário grava o agendamento antes de o usuário confirmar.

## Fontes

- `_reversa_forward/003-prova-agendamentos/legacy-impact.md`
- `_reversa_forward/003-prova-agendamentos/regression-watch.md`
- `_reversa_forward/003-prova-agendamentos/requirements.md`
- `_reversa_forward/003-prova-agendamentos/roadmap.md`
- `_reversa_forward/003-prova-agendamentos/actions.md`
- `_reversa_forward/003-prova-agendamentos/progress.jsonl`
- `_reversa_forward/003-prova-agendamentos/onboarding.md`

---
*Gerado pelo Reversa-Sync em 2026-09-21.*
