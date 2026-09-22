# Actions: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Roadmap: `_reversa_forward/006-prova-logs-acesso/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 19 |
| Paralelizáveis (`[//]`) | 6 |
| Maior cadeia de dependência | 6 elos |

> Esta feature **não** cria caminho novo de execução: a infraestrutura de prova existe desde
> a 002. O que ela acrescenta é uma massa de prova de auditoria, **cinco** arquivos de
> verificação novos e a seção do grupo `07` na matriz.
>
> **A feature é paralelizável, e isso a distingue da anterior.** A 005 provou um único
> componente e ficou em fila indiana; aqui as promessas vivem em **seis** superfícies, e as
> quatro provas independentes da Fase 2 têm arquivos distintos e nenhuma dependência entre si.
>
> **E é a primeira do ciclo que modifica arquivos de prova pré-existentes.** A ação T014 mexe
> em `Consultation.test.tsx`, que já continha prova da feature 004. Os blocos novos entram como
> `describe` próprios, e o critério de pronto exige que a contagem total de verificações
> **cresça** em relação às 109 medidas (risco R-08). Cresceu para **132**.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar a massa de prova compartilhada da auditoria — registro parametrizável por ação, data e detalhe; as **doze** ações como constantes nomeadas; derivadores de data por **construtor local** a partir do dia congelado; o registro **futuro**; o registro **sem detalhes**; o usuário de sessão **sem** papel de admin e o contraste admin; e o conjunto desenhado para separar as categorias dos indicadores | - | - | `src/test/auditFixtures.ts` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Abrir a prova do **logger** com o arranjo de dublês e provar os campos que ele preenche sozinho: o e-mail da sessão, o literal `'client-side'` no endereço de rede, o agente do navegador, e os campos de entidade **ausentes** quando não há entidade — afirmando `undefined`, e não string vazia (`RF-02`, `RF-03`, D-02) | T001 | [//] | `src/components/medical/__tests__/AccessLogger.test.ts` | 🟢 | [X] |
| T003 | Abrir a prova da **página de auditoria** e provar o pedido de leitura com **argumentos exatos** — ordenação por criação decrescente e limite de 500 — mais a ausência de qualquer controle de paginação e a ausência de reconsulta quando um filtro muda (`RF-12`, `RF-13`, AMB-004) | T001 | [//] | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T004 | Abrir a prova do **Dashboard** e provar que a montagem grava **exatamente um** registro, com a ação `login` e o detalhe `'Acesso ao dashboard'` — e os campos de entidade ausentes (`RF-01`, `RF-03`) | T001 | [//] | `src/pages/__tests__/Dashboard.test.tsx` | 🟢 | [X] |
| T005 | Abrir a prova da **navegação** e provar que o item de auditoria é oferecido ao usuário **sem** papel de admin, com o mesmo item presente para o admin — a afirmação é sobre o que aparece na tela, e não sobre a condição que o decide (`RF-10`, D-04) | T001 | [//] | `src/__tests__/Layout.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Provar a **falha aberta nos dois caminhos** (D-05): com a identificação do usuário **recusando**, nenhum registro é criado e nenhum erro chega ao chamador; com a identificação devolvendo **usuário vazio**, o mesmo — e o caminho feliz é afirmado **na mesma verificação**, para que a ausência não seja confundida com arranjo quebrado (R-03) | T002 | - | `src/components/medical/__tests__/AccessLogger.test.ts` | 🟢 | [X] |
| T007 | Provar a **inserção como única operação** da trilha: a verificação conta as inserções **primeiro** e só então afirma que nenhuma leitura, alteração ou exclusão foi pedida no mesmo arranjo (R-04) | T002 | - | `src/components/medical/__tests__/AccessLogger.test.ts` | 🟢 | [X] |
| T008 | Provar o **contrato do enum**: o catálogo tem exatamente **doze** entradas e o conjunto de valores iguala o do schema — confrontado com o conjunto, e não com uma lista escrita à mão (D-06) | T002 | - | `src/components/medical/__tests__/AccessLogger.test.ts` | 🟢 | [X] |
| T009 | Provar os **três filtros** da página afirmando o **conjunto exibido**: busca por usuário e por paciente sem diferenciar maiúsculas, igualdade exata por ação, e os recortes de hoje, semana e mês (`RF-14`) | T003 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T010 | Provar a **aritmética dos indicadores** com o conjunto desenhado (D-10): cada indicador conferido por categoria, a ação de receita contada como edição, a ação sem categoria fora de todas, e a **soma que não fecha** com o total (`RF-16`) | T003 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T011 | Provar o recorte de data **sem limite superior** (D-09): um registro com data no **futuro** aparece nos recortes de semana e de mês, com o `Date` congelado (D-08) | T003 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T012 | Provar que a página é **somente leitura** — nenhuma linha oferece editar ou excluir — e que a leitura é pedida **sem escopo declarado**, registrando que `asUser` e `asAdmin` devolvem o mesmo repositório e que a metade servidor de `PT-007.2` é **declarada** (`RF-08`, `RF-09`, D-03) | T003 | - | `src/pages/__tests__/AccessLogs.test.tsx` | 🟢 | [X] |
| T013 | Provar, no **detalhe do paciente**, que a visualização grava `view_patient` com a entidade, o identificador e o nome — e a **duplicação** por nova identidade do objeto, com a contagem afirmada antes e depois (D-07, R-05). **Arquivo próprio, e não bloco no vizinho:** ver nota 20 | T001 | [//] | `src/pages/__tests__/PatientDetailAudit.test.tsx` | 🟢 | [X] |
| T014 | Provar, no **detalhe da consulta**, que a visualização grava `view_consultation` com a entidade e o nome do paciente — e a **mesma duplicação**, que a investigação revelou ser sistêmica e não local (D-07). Bloco `describe` novo, sem tocar nos existentes | T001 | [//] | `src/pages/__tests__/Consultation.test.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T015 | Estender a matriz com o veredito dos **quatro** cenários de `PT-007`, citando todo `BR-L` com o **artefato de origem qualificado** (D-13); registrar os **modos de perda silenciosa** com o que é provado e o que é declarado; e declarar o **trio de ações órfãs** com a razão de não ser provado (D-06) | T006, T008, T012, T014 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T016 | Registrar na matriz o destino do grupo `Logs de acesso (07)`, o saldo dos módulos restantes (**19 → 15**), a colisão das famílias `BR-L` como lacuna documental e a imprecisão da nota de `code-analysis.md#5.1` sobre quem vê a tela de auditoria | T015 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T017 | Revalidar os cinco comandos de gate e conferir que nenhum arquivo de aplicação foi tocado — incluindo os quatro que a feature prova sem alterar — e que a **contagem de verificações cresceu** em relação às 109 medidas (R-08) | T012, T014 | - | `_reversa_forward/006-prova-logs-acesso/onboarding.md` | 🟢 | [X] |
| T018 | Medir o tempo da suíte completa com os arquivos novos e o modificado, e registrar o valor no roteiro, verificando o teto de 90 segundos | T017 | - | `_reversa_forward/006-prova-logs-acesso/onboarding.md` | 🟢 | [X] |
| T019 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados — incluindo os três modos de perda silenciosa, a ausência de guarda de papel e a classificação de `AccessLog` no contrato do cliente | T016, T017 | - | `_reversa_forward/006-prova-logs-acesso/regression-watch.md` | 🟢 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** As ações mexem em arquivo de prova, na massa compartilhada e em artefato da extração. Se alguma ação parecer exigir mudança em `src/components/medical/AccessLogger.ts`, `src/pages/AccessLogs.tsx`, `src/Layout.tsx`, `src/pages/Dashboard.tsx`, `src/pages/PatientDetail.tsx` ou `src/pages/Consultation.tsx`, algo saiu do escopo — pare e revise.
2. **`base44/entities/` intocado.** Regra de ouro do diff, e o schema de `AccessLog` é justamente o que a feature **declara** sem tocar.
3. **A auditoria é medida no transporte (D-02).** Deixe `AccessLogger` correr de verdade e duble `base44.entities.AccessLog`. Se a verificação substituir `logAccess`, mede a própria substituição — foi assim que o defeito da feature 004 passou despercebido.
4. **A RLS é declarada, não provada (D-03).** Não escreva teste que leia `AccessLog.jsonc` e afirme `read: admin`: isso prova o conteúdo de um arquivo, não o comportamento do sistema. O que se prova é que a leitura é pedida **sem escopo declarado**.
5. **Provar ausência exige asserção positiva (R-03, R-04).** Para a falha aberta, afirme o caminho feliz gravando **na mesma verificação**. Para "só inserção", conte as inserções **primeiro** e só então negue as demais operações.
6. **A falha aberta tem dois caminhos distintos.** A recusa cai no `catch`; o usuário vazio cai no `return` antecipado, que é **mais silencioso** porque nem imprime. Provar um só deixa o outro sem veredito.
7. **Dois arquivos de prova pré-existentes (R-08).** T013 e T014 acrescentam blocos `describe` a arquivos que já provam outras features. Não toque nos blocos existentes, e confira no fim que a contagem total de verificações **cresceu** em relação às 109 da rodada anterior — uma queda significa prova perdida na edição.
8. **Congele só o `Date` (D-08).** `vi.useFakeTimers({ toFake: ['Date'] })` mantém os temporizadores reais e não conflita com as esperas assíncronas de interface. Temporizadores falsos já custaram caro na feature 003.
9. **Datas sempre por construtor local.** `new Date('AAAA-MM-DD')` é lido em UTC e `getDate()` é local. A armadilha está documentada nos cabeçalhos das massas das features 003 a 005.
10. **Identidade estável nos dublês de `useQuery` — com uma exceção deliberada.** Array novo a cada renderização trava o processo (armadilha da 004). A exceção é a verificação da duplicação (`RF-20`), onde a troca de identidade do objeto é **explícita e proposital**, e existe justamente para provocar a segunda gravação.
11. **O Dashboard é denso (R-01).** Os dublês devolvem **conjuntos vazios**, para que a página não gaste tempo agregando. A verificação afirma a gravação e nada mais. Se ainda pesar no teto, o recuo é medir e registrar — não afrouxar a asserção.
12. **O `Layout` nunca foi renderizado por teste nenhum (R-02).** Ele monta menus suspensos Radix e o `useToast`. Se os menus estourarem o tempo no DOM simulado, o recorte é renderizar e afirmar apenas o **item de navegação**, sem abrir menu nenhum.
13. **`details` pode ser nulo.** O seed offline grava `null` ali, e a tabela não pode quebrar com isso (`RF-14`).
14. **O teto de 500 é paridade congelada (AMB-004).** Não "melhore" a página com paginação nem scroll infinito: o comportamento foi congelado por decisão humana (`handoff.md`) e a prova o afirma como promessa.
15. **`BR-L` sempre com artefato qualificado (D-13).** `logs-acesso/requirements.md#2` e `code-analysis.md#6` usam os mesmos identificadores para regras disjuntas — e, ao contrário das colisões anteriores, os dois artefatos descrevem o **mesmo módulo**.
16. **O trio órfão é declarado, não provado (D-06).** Não tente provar a orfandade de `logout`, `create_prescription` e `export_data` por varredura de arquivos-fonte: isso prova o conteúdo de arquivos, não comportamento. O que se prova é o **contrato** do enum (doze entradas iguais às do schema).
17. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002 a 005.
18. **Marcador `[//]` só onde existe par.** Seis ações o recebem: T002, T003, T004 e T005 na Fase 2, e T013 e T014 na Fase 3. Todas têm arquivo distinto e nenhuma depende das irmãs de fase. Contagem conferida: **6 declarados, 6 marcados**.
19. **Aviso de codificação, herdado da rodada 005.** Não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell: o `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e corrompe o arquivo ao regravar. Use a ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito. E não escreva exemplo literal de mojibake em nota nenhuma: a guarda varre bytes e não distingue texto corrompido de texto que **cita** corrupção.

### Notas acrescentadas pelo `/reversa-coding`

20. **T013 MUDOU DE ARQUIVO, e o desvio é o ponto.** O plano dizia que a prova da visualização auditada do paciente entraria em `PatientDetail.test.tsx`. Ele **não podia**: aquele arquivo **dubla o módulo `AccessLogger`** (`logAccess` é uma espiã), e um dublê de módulo vale para o arquivo inteiro — com ele, a prova mediria a **chamada**, nunca o transporte, contra a decisão D-02. A prova foi para `PatientDetailAudit.test.tsx`. O arquivo vizinho **não** foi tocado, e continua provando o que sempre provou. Registrado aqui porque o plano mentiria se ficasse como estava.
21. **O dublê de `useQuery` destas páginas precisou modelar o CACHE.** Nas features anteriores ele chamava a função de consulta a cada renderização, o que era inócuo porque as asserções olhavam os **argumentos**. Aqui uma delas conta **pedidos**, e a primeira execução acusou a diferença: `listar` foi chamado 6 vezes, uma por renderização, em vez de 1. O dublê passou a consultar cada chave uma única vez — que é o que o TanStack Query faz. Com isso a afirmação "mudar filtro não reconsulta" passou a ser load-bearing: se a página incluísse os filtros na chave, a contagem denunciaria.
22. **A navegação do `Layout` é desenhada DUAS vezes.** Além da barra do topo, existe a navegação inferior de tela estreita, e ela **duplica os quatro primeiros itens no DOM** — o jsdom não aplica o CSS que a esconderia. A consulta por papel para "Pacientes" encontrou dois elementos e falhou. O auxiliar do item de auditoria passou a afirmar a contagem, e "Logs de Acesso" é o sétimo item, então aparece uma vez só.
23. **O teto de 90 segundos foi medido DUAS vezes, com resultados opostos.** A mesma suíte, sem uma linha de diferença, mediu **122,57 s** sob carga e **75,78 s** com a máquina calma. O teto é, portanto, uma propriedade **condicional** — e o maior contribuinte individual é `PatientForm.test.tsx` (13,11 s), **pré-existente** e alheio a esta feature. O recorte previsto no D-12 (reduzir a prova do Dashboard) **não** é a alavanca certa: o Dashboard não aparece entre os doze arquivos mais lentos. As duas medições estão em `onboarding.md#7.1`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-22` | Versão inicial gerada por `/reversa-to-do` | reversa |
| `2026-09-22` | T013 movida para `PatientDetailAudit.test.tsx`; dependência de T011 corrigida na origem; 19 ações marcadas como concluídas e notas 20 a 23 acrescentadas | `/reversa-coding` |

---
*Gerado pelo Reversa-To-Do em 2026-09-22.*
