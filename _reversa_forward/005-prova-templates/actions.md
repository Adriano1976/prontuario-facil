# Actions: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Roadmap: `_reversa_forward/005-prova-templates/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 18 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 7 elos |

> Esta feature **não** cria caminho novo de execução: a infraestrutura de prova existe desde
> a 002. O que ela acrescenta é uma massa de prova de modelos, um arquivo de verificação e a
> seção do grupo `06` na matriz.
>
> **A feature é sequencial por construção.** A decisão D-01 ancora a prova em **um único
> arquivo**, porque os quatro cenários de `PT-006` habitam um único componente. Como o
> marcador `[//]` exige arquivos diferentes, só a Fase 1 tem par paralelo. A coluna de
> dependências registra a **dependência lógica**, não o conflito de arquivo: dentro de uma
> mesma fase, a ordem da tabela é a ordem de execução.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar a massa de prova compartilhada — paciente com e sem CPF, modelo parametrizável por tipo e conteúdo, os modelos de borda (receita, atestado, inativo, com as quatro variáveis, com `{DIAS_AFASTAMENTO}` e com marcação HTML), os **seis** tipos de documento, e o dia de prova com derivadores por **construtor local**, devolvendo **arrays de identidade estável** | - | [//] | `src/test/templateFixtures.ts` | 🟢 | [X] |
| T002 | Abrir o arquivo de verificação do editor com o arranjo de dublês reutilizável — consulta de modelos, seletor de tipo e seletor de modelo — e uma verificação de fumaça que monta o diálogo e confirma que o editor abre com o tipo inicial de receita simples | - | [//] | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Provar a seção de Medicamentos nos **seis** tipos de documento: presente em `receita_simples` e `receita_controlada` com os **cinco** campos do cenário, ausente em `atestado`, `solicitacao_exame`, `encaminhamento` e `declaracao` — afirmando o que aparece na tela, não a expressão que decide | T001, T002 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T004 | Provar o **portão de `medications` no payload**, independente da visibilidade: com um medicamento preenchido em receita, trocar para atestado e salvar entrega `medications: []` ao salvamento | T003 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Provar o **pedido de modelos no transporte** (D-02): a consulta é emitida com o `type` corrente e com `is_active: true`, afirmando os **argumentos exatos**, e é reemitida com o tipo novo quando o tipo muda | T002 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T006 | Provar que o cliente **não re-filtra** o resultado (D-06): o mesmo dublê devolve, na mesma verificação, um modelo de tipo errado e um modelo inativo, e ambos são oferecidos pelo seletor | T005 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T007 | Provar a substituição das **quatro** variáveis na escolha do modelo, com o `Date` congelado e a string em pt-BR afirmada por extenso (D-04) — `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}` e `{DATA_EXTENSO}` | T003 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟡 | [X] |
| T008 | Provar que o texto é **editável após a aplicação** e que o salvamento persiste a edição, e não o texto do modelo — a metade que corrige a redação imprecisa de `PT-006.3` (RN-02) | T007 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T009 | Provar as **bordas da substituição** por asserção positiva (D-03): um modelo com `{DIAS_AFASTAMENTO}` chega ao payload com o marcador **literal**, e um paciente sem CPF resolve `{PACIENTE_CPF}` para string vazia sem quebrar a tela | T007 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T010 | Provar que a **marcação HTML não é escapada** na substituição: o modelo com marcação chega literal ao campo de conteúdo e ao payload entregue ao salvamento | T007 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T011 | Provar a **injeção na impressão** com duplo de `window.open` que captura o HTML escrito (D-05): o documento impresso contém a marcação do modelo sem escape — e a verificação **falha** se o duplo não capturar nada, para que o caminho inalcançável do `jsdom` não passe por verde | T002, T007 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T012 | Provar a **procedência** do modelo gravado — `template_name` recebe o nome do modelo escolhido e `null` quando nenhum foi aplicado — e o achado da troca de tipo após a aplicação: conteúdo obsoleto permanece e a procedência vira nula (RF-12, RF-13) | T007 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |
| T013 | Provar que a reedição **não** recupera o modelo de origem, deixando o seletor vazio ao abrir com dados iniciais (RF-14), e que o seletor de tipo oferece **exatamente** os seis tipos de `Prescription`, sem `anamnese`, confrontados com o conjunto do schema (RF-15) | T002 | - | `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Estender a matriz com o veredito dos **quatro** cenários de `PT-006`, citando todo identificador de regra com o **artefato de origem qualificado** (D-12), e registrar as **três lacunas de severidade Alta** com a evidência que cada uma ganhou — deixando explícito que seguem **abertas** | T004, T006, T011, T013 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T015 | Registrar na matriz o destino do grupo `Templates (06)`, o saldo dos módulos restantes (**23 → 19**), a colisão de `BR-T` como lacuna documental, a imprecisão de `templates/requirements.md#4` sobre a RLS e a redação corrigida de `PT-006.3` | T014 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T016 | Revalidar os cinco comandos de gate com a prova no lugar e conferir que nenhum arquivo de aplicação foi tocado, incluindo `Templates.tsx` e os schemas de entidade | T011, T013 | - | `_reversa_forward/005-prova-templates/onboarding.md` | 🟢 | [X] |
| T017 | Medir o tempo da suíte completa com o arquivo novo e registrar o valor no roteiro, verificando o teto de 90 segundos | T016 | - | `_reversa_forward/005-prova-templates/onboarding.md` | 🟢 | [X] |
| T018 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados — incluindo a trava de paridade de AMB-006 e a dependência do filtro no servidor | T015, T016 | - | `_reversa_forward/005-prova-templates/regression-watch.md` | 🟢 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** As ações mexem em arquivo de prova, na massa compartilhada e em artefato da extração. Se alguma ação parecer exigir mudança em `src/components/medical/PrescriptionEditor.tsx` ou em `src/pages/Templates.tsx`, algo saiu do escopo — pare e revise.
2. **`src/pages/Templates.tsx` intocado.** A administração de modelos está fora do escopo por decisão `1a` (D-07), e a ausência é deliberada. Não "aproveite" a passagem para provar o CRUD nem para corrigir `is_default`, `insertVariable` ou o campo `variables`.
3. **`base44/entities/` intocado.** Regra de ouro do diff.
4. **O caminho de impressão é inalcançável sem o duplo (R-02, D-05).** O `jsdom` não implementa `window.open`: registra `Not implemented` e devolve `null`, e `handlePrint` sai pela guarda `if (!printWindow) return`. Uma verificação que apenas acione "Imprimir" e confirme que nada quebrou fica **verde sem exercitar uma linha**. T011 precisa substituir `window.open` e afirmar que algo foi **escrito**. Substitua **apenas** `window.open` — trocar o objeto `window` inteiro quebra o `history` do jsdom.
5. **Provar ausência exige asserção positiva (D-03).** Para `{DIAS_AFASTAMENTO}` e para a marcação, afirmar que o texto **está lá**, literal. Asserção do tipo "o `replace` não foi chamado" passa por vacuidade e é placebo com aparência de prova.
6. **A prova trava a paridade de AMB-006 (D-08).** Ao afirmar o defeito, a suíte passa a falhar no dia em que alguém corrigir a substituição ou a impressão. Isso é intencional. O cabeçalho do arquivo de prova deve nomear AMB-006 como **paridade preservada**, para que ninguém leia a asserção como expectativa de produto — e quem decidir corrigir precisa mudar a verificação de propósito.
7. **Congele só o `Date` (D-04).** `vi.useFakeTimers({ toFake: ['Date'] })` mantém os temporizadores reais e não conflita com as esperas assíncronas de interface. Temporizadores falsos já custaram caro na feature 003; não repetir.
8. **Datas sempre por construtor local.** `new Date('AAAA-MM-DD')` é lido em UTC e `getDate()` é local: num fuso a oeste de Greenwich a prova mediria outro dia sem avisar. A armadilha está documentada no cabeçalho das massas das features 003 e 004 e precisa estar na desta.
9. **Identidade estável no dublê de `useQuery` (armadilha da feature 004).** Um dublê que devolve **array novo a cada renderização** trava o processo quando a tela coloca esse array na dependência de um efeito que chama `setState`. O `PrescriptionEditor` tem esse arranjo no `useEffect` de `[initialData, open]`. Guarde os arrays fora do dublê.
10. **O seletor de tipo e o de modelo exigem dublê de módulo.** São Radix e renderizam em portal; abrir o seletor real no DOM simulado já custou 66 segundos até estourar o limite, na feature 002. Reaproveitar o padrão de `PatientForm.test.tsx` e `NewConsultation.test.tsx`.
11. **O filtro de modelos é predicado do servidor (D-06).** Ao dar veredito a `PT-006.2` e `PT-006.4` na matriz, a ressalva de que o cliente apenas **pede** precisa acompanhá-los. Marcá-los 🟢 sem a ressalva é mentira — e o `RF-06`, provado em T006, é a evidência de que a ressalva é necessária.
12. **`BR-T` sempre com artefato qualificado (D-12).** `domain.md#2.3`, `code-analysis.md#6` (módulo templates) e `templates/requirements.md#2` usam os **mesmos IDs** para regras disjuntas. Citar `BR-T01` sozinho é ambíguo por construção.
13. **A prova ancora no componente (D-01, §4.1 do roadmap).** O encanamento a partir de `PatientDetail.tsx` **não** é coberto aqui. Não tente cobri-lo: seria mudar a fronteira da prova no meio da execução.
14. **A serialidade é consequência de D-01.** Como tudo vive em um arquivo, não há `[//]` depois da Fase 1. Se o coding concluir que o custo da serialidade supera o ganho de legibilidade, o recorte é mover as verificações de **transporte** (T005, T006, T011) para um arquivo irmão — mas isso é **emenda ao roadmap** (D-01), não decisão do coding. Não faça em silêncio.
15. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002, 003 e 004.
16. **Marcador `[//]` só onde existe par.** T001 e T002 são os dois únicos casos: arquivos diferentes, sem dependência entre si. Contagem conferida: **2 declarados, 2 marcados**.
17. **Duas correções feitas na conferência, antes de fechar, e o registro delas.** Primeira: o T011 nasceu dependendo apenas de `T002` (o arranjo de dublês), mas a verificação afirma que a marcação **do modelo** chega ao HTML impresso — e isso exige um modelo aplicado, provado em `T007`. A dependência foi corrigida para `T002, T007`. Segunda, e mais séria: o resumo declarava **8 elos** de cadeia, e o cálculo correto dá **7**. O erro foi encadear `T001 → T002`, que **não** é aresta — as duas ações são independentes, e é por isso que recebem `[//]`. A cadeia mais longa é `T001 → T003 → T007 → T011 → T014 → T015 → T018`, com 7 elos, e o resumo foi corrigido. Registrado porque a contagem de elos é exatamente o tipo de número que ninguém reconfere depois.
18. **Anotação de 2026-09-21, no fecho da execução: este arquivo foi corrompido e recuperado.** A marcação em massa das ações T001 a T013 foi feita com `Get-Content` e `Set-Content`, e no PowerShell 5.1 esses cmdlets decodificam arquivo sem BOM pela **página ANSI**: leram o UTF-8 como Latin-1 e gravaram de volta, deixando **330 sequências** corrompidas — o acento de `ã` foi gravado como o par de caracteres que a leitura em Latin-1 produz. A **guarda de encoding do projeto pegou**, e o arquivo foi reescrito íntegro. Lição para as próximas rodadas: **nunca** fazer round-trip de arquivo do projeto por cmdlet de texto do PowerShell — usar a ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito.
19. **A guarda de encoding não distingue texto corrompido de texto que CITA a corrupção.** A primeira versão desta nota trazia o par de caracteres defeituoso como exemplo literal, e a guarda acusou **este próprio arquivo** — a documentação do incidente virou o incidente. O registro foi reescrito para descrever o defeito sem reproduzi-lo. Fica como limitação conhecida da guarda: ela varre bytes, não intenção, e por isso nenhum artefato do projeto pode conter um exemplo literal de mojibake.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-21` | Versão inicial gerada por `/reversa-to-do` | reversa |
| `2026-09-21` | T001 a T013 marcadas como concluídas; dependência de T011 corrigida; arquivo reescrito após corrupção de codificação detectada pela guarda | `/reversa-coding` |

---
*Gerado pelo Reversa-To-Do em 2026-09-21.*
