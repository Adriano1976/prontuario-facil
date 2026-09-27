# Adendo: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)
> Feature de origem: `_reversa_forward/017-politica-de-leitura-dos-logs/`

## Vigência

Vigente desde 2026-09-25.

## Resumo da entrega

Fechar `G-02`: a tela de Logs de Acesso lia os 500 registros mais recentes e **não tinha como passar
deles**. Acima de 500, o registro antigo era inalcançável, o cartão "Total de Logs" reportava o teto,
e o recorte "Hoje" também podia estar incompleto — tudo sem que a tela dissesse que a lista era
parcial.

A feature decidiu a política em duas sessões de esclarecimento e a implementou: a leitura passou a
aceitar **deslocamento**, o recorte continua de **500**, e a tela **navega entre recortes**. A
descoberta que definiu o custo: o SDK do provedor **já expõe `skip`**
(`entities.types.d.ts:248` e `:345`, documentado como "Number of results to skip for pagination");
quem o descartava era o adaptador do projeto. A entrega foi **parar de perder o parâmetro**, não
inventar paginação.

**31 de 31 ações concluídas**, sem execução parcial. A suíte passou de 218 verificações em 32 arquivos
para **229 em 33**, com 0 falhas. As **cinco falsificações** previstas foram executadas e todas
falharam pelo sinal nomeado.

## Impacto por artefato da extração

> **Atenção ao ler esta tabela.** Esta feature **já editou** vários artefatos da extração no passo de
> convergência do `/reversa-coding`. As linhas **✅ já aplicado** estão no disco. As **⚠️ ainda
> defasado** continuam descrevendo a tela antiga e são o que este adendo existe para cobrir.

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/code-analysis.md` | `#Análise de Código — Módulo logs-acesso` | `regra-alterada` | ✅ **já aplicado.** A descrição deixou de dizer "tabela paginada implicitamente (limite 500 registros)" — o eufemismo escondia a truncagem |
| `_reversa_sdd/code-analysis.md` | `#6. Regras de Negócio Extraídas` (`BR-L04`) | `regra-alterada` | ✅ **já aplicado.** É a regra 🟢 que esta feature **substitui**: "limite de 500 registros por consulta" passou a "por recorte". O limite continua valendo 500 — o que muda é ser possível passar dele |
| `_reversa_sdd/code-analysis.md` | `#9. Pontos de Atenção` | `regra-alterada` | ⚠️ **Ainda defasado.** A linha "Limite rígido 500 — sem paginação — histórico além de 500 logs inacessível na UI — Alta" **deixou de ser verdadeira**: o histórico passou a ser acessível |
| `_reversa_sdd/code-analysis.md` | `#5.1 Entidades Consumidas` | `contrato-alterado` | ⚠️ **Ainda defasado.** A tabela descreve as leituras sem mencionar o deslocamento. **Leia como:** `list` e `filter` do contrato passaram a aceitar `skip` como terceiro parâmetro |
| `_reversa_sdd/gaps.md` | `#Lacunas abertas` | `regra-removida` | ✅ **já aplicado.** `G-02` **saiu** da tabela de lacunas abertas. Resta aberta apenas `G-04` (aviso do modo offline) |
| `_reversa_sdd/logs-acesso/screens.md` | `#Elementos de Interface` | `regra-alterada` | ✅ **já aplicado.** A linha de paginação deixou de ser 🔴 e descreve o recorte, a navegação, o rótulo corrigido e a declaração do alcance da busca |
| `_reversa_sdd/logs-acesso/design.md` | `#Carregamento da tabela` e lacunas | `regra-alterada` | ⚠️ **Ainda defasado.** Diz "não implementa paginação" e lista a decisão como "permanece aberta 🔴". **Leia como:** implementa, e a decisão foi tomada |
| `_reversa_sdd/logs-acesso/tasks.md` | `LOG-06` | `regra-removida` | ⚠️ **Ainda defasado.** A tarefa "Definir e implementar a política de paginação/limite da tabela de auditoria" está aberta e **foi cumprida por esta feature** |
| `_reversa_sdd/flowcharts/logs-acesso.md` | `#Pontos de atenção` | `regra-alterada` | ⚠️ **Ainda defasado.** "Teto rígido de 500 registros: sem paginação — histórico antigo inacessível" deixou de valer |
| `_reversa_sdd/data-dictionary.md` | `#Consulta UI` | `regra-alterada` | ⚠️ **Parcialmente defasado.** "Limite fixo de 500 registros, `-created_date`" — o limite continua 500, mas por recorte, e a leitura passou a levar deslocamento |
| `_reversa_sdd/code-spec-matrix.md` | `#Cenários de paridade do grupo 07` | `regra-alterada` | ✅ **já aplicado.** `PT-007.4` passou a 🟢 **provado com o cenário superado**, e a nota do achado F-04 registra que o teto deixou de ser paridade congelada |
| `_reversa_sdd/code-spec-matrix.md` | `#Como a prova é executada` | `regra-alterada` | ✅ **já aplicado.** Linha nova de medição: 229 verificações em 33 arquivos |
| `_reversa_sdd/migration/ambiguity_log.md` | `#AMB-004` | `regra-alterada` | ✅ **já aplicado.** `AMB-004` está ⛔ **SUPERADA** — a "política real em fase futura" que ela adiava é esta feature |
| `_reversa_sdd/migration/target_business_rules.md` | `#BR-HUMANA-004` | `regra-alterada` | ✅ **já aplicado.** Passou de "DECISÃO HUMANA" resolvida a ⛔ **SUPERADA**, apontando para a regra vigente |
| `_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature` | `SDK e mock implementam a mesma interface` | `contrato-alterado` | ✅ **já aplicado.** A cláusula de paridade passou a cobrir o deslocamento |
| `_reversa_sdd/migration/target_screens.md` | `#Logs de Acesso` | `regra-alterada` | ⚠️ **Ainda defasado, e é o mais sensível.** Registra "renderização client-side SEM paginação (AMB-004 resolvido — paridade)". **Leia como:** a linha do alvo descreve a tela antiga |
| `_reversa_sdd/migration/parity_specs.md` | `#Critério de bloqueio` | `regra-alterada` | ⚠️ **Ainda defasado, e é uma REGRA VIVA.** O documento diz que "**paginação adicionada**" é comportamento divergente que **bloqueia o merge/cutover**. Isso contradiz frontalmente a entrega desta feature, que foi decidida e aprovada. **Leia como:** o critério continua valendo para divergência **não decidida**; paginação deixou de ser divergência porque foi decidida em `requirements.md#9` |
| `_reversa_sdd/migration/screen_deviation_log.md` | `DEV-003` e itens de paridade | `regra-alterada` | ⚠️ **Ainda defasado.** Descreve a tela como "tabela longa sem paginação" e a ausência de paginação como parte da referência estrutural do golden |
| `_reversa_sdd/confidence-report.md` | `#Lacunas 🔴 pendentes` | `regra-removida` | ⚠️ **Ainda defasado.** Lista "logs-acesso/: política de paginação e estratégia acima do limite de 500 registros" como lacuna pendente, e o checklist tem "Definir paginação/limite da tabela de Logs de Acesso" aberto |
| `_reversa_sdd/questions.md` | `R-02` | `regra-removida` | ⚠️ **Ainda defasado.** A pergunta sobre paginação da trilha continua marcada 🔴 ("Ainda não foi informado") |
| `_reversa_sdd/architecture.md` | `#1. Visão Resumida` | `contrato-alterado` | ⚠️ **Ainda defasado.** Não menciona que o contrato de entidade passou a aceitar deslocamento |
| `_reversa_sdd/inventory.md` | `#Cobertura de testes` | `regra-alterada` | ⚠️ **Já estava defasado antes desta feature.** Registra 145 verificações em 24 arquivos. **Leia como:** 229 em 33, medidos em 2026-09-25 |

**Impactos já aplicados:** 9 linhas. **Ainda defasados:** 13 linhas, das quais uma
(`parity_specs.md`) é uma **regra de processo viva**, e não apenas descrição.

### Correção de leitura do adendo `016`

O adendo `_reversa_sdd/addenda/016-taxa-de-atendimento.md` registra, na tabela de impacto, que
"restam abertas `G-02` (paginação dos logs) e `G-04`". Aquilo era verdade quando foi escrito, no
mesmo dia, e **o texto não é reescrito** — adendo é registro histórico. `G-02` fechou depois, por
esta feature. Resta aberta apenas `G-04`.

## Regras sob vigilância

Os itens vivem em `_reversa_forward/017-politica-de-leitura-dos-logs/regression-watch.md`, com
conteúdo completo. Aqui ficam só os apontadores.

- `W001` — a leitura é paginada com deslocamento; nenhum registro é inalcançável
- `W002` — o recorte é de 500 registros
- `W003` — a leitura pede um registro a mais e descarta o excedente
- `W004` — as duas leituras do contrato aceitam `skip`, e as duas implementações o honram
- `W005` — nenhum indicador se chama "Total" medindo um recorte
- `W006` — a tela declara que a busca alcança o recorte exibido
- `W007` — os três filtros continuam no cliente, sem reconsulta
- `W008` — a ordenação `-created_date` vale em todas as páginas
- `W009` — a leitura declara escopo administrativo, e quem não é admin não vê registro
- `W010` — a tela continua somente leitura

Seis observações (`O001` a `O006`) acompanham o watch, **sem peso de regressão**: registram que
`AMB-004` está superada, que a heurística das categorias e o teto superior dos recortes de data
ficaram fora do escopo, que existe uma divergência herdada no default de `limit` entre o SDK e o
cliente offline, e que a **deriva de deslocamento** e o **empate de `created_date`** são riscos
aceitos e declarados.

## Fontes

- `_reversa_forward/017-politica-de-leitura-dos-logs/legacy-impact.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/regression-watch.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/requirements.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/roadmap.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/investigation.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/data-delta.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/onboarding.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/actions.md`
- `_reversa_forward/017-politica-de-leitura-dos-logs/progress.jsonl`

---
*Gerado pelo Reversa-Sync em 2026-09-25.*
