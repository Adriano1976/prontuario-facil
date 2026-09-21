# Roadmap: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Requirements: `_reversa_forward/004-prova-consultas/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar a máquina de estados da consulta **na superfície onde cada promessa é observável**, e
não onde seria mais fácil montar um arnês. O status inicial e a troca de situação existem
no formulário: a prova o renderiza, escolhe o paciente, muda a situação e confere o que foi
gravado. O filtro e a legenda existem na listagem e no detalhe: a prova monta as duas telas
sobre um armazém de mentira e afirma o que aparece. A assimetria de auditoria é provada no
**transporte**, não no módulo de auditoria — `logAccess` corre de verdade e o que é dublado é
o `AccessLog`, de modo que a verificação mede a ligação (ou a falta dela) em vez de medir um
dublê. O caso negativo do tipo fechado **já existe** desde a feature 001 e é reaproveitado
por citação. Nenhum arquivo de aplicação é tocado: a feature acrescenta três arquivos de
prova, uma massa compartilhada e a seção do módulo na matriz de rastreabilidade.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi
registrado, e portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de
princípio vêm do legado e são respeitados:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A prova substitui o transporte por dublê e nunca escreve em `base44/entities/` | respeita |
| Paridade de comportamento observável (`_reversa_sdd/addenda/001-migracao-typescript.md#Vigência`) | Nenhum arquivo de aplicação é alterado por esta feature | respeita |
| Congelamento deliberado: a ausência de escape de marcação é paridade registrada (`AMB-006`, citado em `src/components/medical/PrescriptionEditor.tsx:145`) | A prova **declara** a lacuna em vez de tratá-la como defeito, e não a conserta | respeita |
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | As oito lacunas do módulo entram como veredito declarado, sem conserto | respeita |
| A prova segue o comportamento do código e declara o cenário impreciso (`_reversa_sdd/addenda/003-prova-agendamentos.md#Vigência`) | Aplicado ao PT-005.1 e ao PT-005.3, que afirmam o contrário do observado | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este
> plano não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A prova do módulo vive em **três arquivos novos**, um por superfície: listagem, detalhe e formulário — mais uma massa compartilhada | Cada arquivo corresponde a um artefato distinto do legado (`Consultations.tsx`, `Consultation.tsx`, `NewConsultation.tsx`), o que mantém a falha legível (RNF Observabilidade) e evita um arquivo único que mistura três arranjos de dublê diferentes | a) um arquivo único para o módulo — a falha deixa de apontar a promessa e a montagem fica pesada; b) espalhar por arquivos de teste existentes de outros módulos — mistura responsabilidades | 🟢 |
| D-02 | A assimetria de auditoria é provada **no transporte**: o módulo `AccessLogger` corre de verdade e o dublê fica em `base44.entities.AccessLog` | É a diferença entre provar a **ligação** e provar um dublê. Se a verificação substituísse `logAccess`, ela mediria a própria substituição — o defeito passaria despercebido exatamente como passou | a) dublar `logAccess` e afirmar as chamadas — mede o dublê, não o sistema; b) ler o código e declarar sem prova — é o que a feature anterior fez e não bastou | 🟢 |
| D-03 | O seletor de situação é exercitado com **dublê do módulo de seleção**, no padrão já adotado em `PatientForm.test.tsx` e reaproveitado nas features 002 e 003 | Aprendizado registrado: o seletor real renderiza em portal e levava o `userEvent` a estourar o tempo limite no DOM simulado — 66 s até o limite, na feature 002 | a) abrir o seletor real — já falhou uma vez; b) acionar só os botões de salvar e cancelar — não cobriria a escolha de situação, que é a promessa | 🟢 |
| D-04 | O relógio é congelado **apenas no `Date`**, com temporizadores reais (`vi.useFakeTimers({ toFake: ['Date'] })`), para as verificações do filtro de data | Os recortes `today`/`week`/`month`/`upcoming` decidem pelo **valor** de hoje, e uma verificação derivada do relógio real vira frágil na virada do dia. Congelar só o `Date` mantém as esperas assíncronas de interface funcionando — o conflito que a feature 003 encontrou foi com temporizadores falsos, não com a data | a) derivar as datas do relógio real, como na 003 — funciona, mas deixa o recorte `today` sensível à virada da meia-noite; b) congelar tudo com `vi.useFakeTimers()` — conflita com `userEvent` e foi descartado na 003 | 🟡 |
| D-05 | O caso negativo do tipo fechado (`RF-03`) é **reaproveitado por citação**, e nenhum caso novo é escrito | O caso `status-fora-do-conjunto` já existe em `src/test/verificacoes-negativas.mjs` desde a feature 001 (ação T032) e recusa `ConsultationStatus = 'finalizada'` citando a violação. Escrever um segundo caso idêntico seria duplicação com dois lugares para manter | a) acrescentar um caso novo — duplicaria a cobertura e criaria dois pontos de verdade; b) provar a união fechada dentro da suíte — o gate de tipos é o lugar certo, e a suíte não compila código inválido de propósito | 🟢 |
| D-06 | O default `agendada` do schema é **declarado por citação, não provado por execução** | O default é do backend e **não é observável no cliente**. O que o cliente mostra é o oposto: o formulário grava `em_andamento` e o modo edição cai em `em_andamento` quando o registro não tem situação. Provar o texto de `Consultation.jsonc` seria provar a coisa errada com aparência de cobertura | a) um teste que lê `base44/entities/Consultation.jsonc` e afirma `default === 'agendada'` — prova o conteúdo de um arquivo, não o comportamento do sistema, e cria falsa sensação de cobertura de um comportamento do servidor; b) omitir a metade — esconderia que o RF-01 tem duas metades com forças diferentes | 🟢 |
| D-07 | As **oito lacunas** do módulo entram na matriz como veredito declarado, com razão e destino, e **sem arquivo de prova** | Decisão da sessão de esclarecimentos de 2026-09-21, incluindo as duas de severidade Alta (`applyTemplate` sem escape e `handlePrint` por `window.open`), que são preservação deliberada do legado (`AMB-006`) | a) provar as duas de severidade Alta — mudaria o escopo decidido na sessão; b) omiti-las da matriz — a ausência de prova se disfarçaria de cobertura | 🟢 |
| D-08 | A **assimetria de auditoria** é provada (`RF-17`) e o defeito é declarado, **não corrigido** | Decisão da sessão de esclarecimentos (Q4). Ligar a ação `create_prescription` ao fluxo mudaria comportamento observável e é trabalho de outra feature; provar a assimetria é o que a torna visível em vez de suspeita | a) corrigir a ligação nesta feature — muda comportamento e viola a RN-02; b) declarar sem provar — foi o que se fez antes e o achado ficou maior do que a suspeita justamente porque ninguém tinha medido | 🟢 |
| D-09 | O `RF-09` (ausência de envio acidental) é provado por **asserção positiva sobre a contagem de gravações**, e não por ausência de chamadas | Provar ausência exige asserção positiva (R-03 da feature 003). A verificação preenche tudo, aciona os controles internos e afirma que a gravação **ainda não** aconteceu; depois aciona o salvamento e afirma que aconteceu **exatamente uma vez** | a) afirmar apenas "nada foi chamado" — passa mesmo quando a verificação não exercita o caminho certo; b) confiar na leitura do código, que já mostra os `type` corretos — leitura não é prova, e o defeito dos agendamentos nasceu de uma leitura que ninguém conferiu | 🟢 |
| D-10 | O diretório `interfaces/` **não é criado** | A feature exercita o transporte de auditoria por dublê, mas não redefine contrato externo nenhum: assinatura, formato e tratamento de erro permanecem os do legado | a) documentar o contrato de auditoria — seria inventário de contrato inalterado, não delta | 🟢 |
| D-11 | O teto de **90 segundos** é revalidado ao final, e não renegociado | Decisão mantida desde 2026-09-19; há 32 segundos de folga sobre a medição de 2026-09-21 | a) subir o teto preventivamente — enfraqueceria o requisito sem medição que o justifique | 🟢 |
| D-12 | A prova do detalhe afirma o **valor da situação exibida**, e não a ausência de transição | É a mesma decisão de R-03 na feature 003: afirmar o valor observável é o que separa prova de placebo | a) afirmar que `Consultation.update` não foi chamado — passaria mesmo se a tela parasse de exibir a situação | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as cinco
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-21 e estão
registradas em `_reversa_forward/004-prova-consultas/requirements.md#9. Esclarecimentos`.

### 4.1 Uma imprecisão do `requirements.md`, registrada em vez de silenciada

O critério de aceite do `RF-01` afirma que "consulta cujo status não é informado cai no
default do schema, `agendada`". Pela D-06, essa metade **não** é provável no cliente. O
plano prova as duas metades observáveis — o formulário grava `em_andamento`, e o modo
edição cai em `em_andamento` quando o registro não tem situação — e **declara** a terceira
por citação do schema.

Isto **não** é uma premissa adotada de `[DÚVIDA]`: é a correção de uma redação que o
`/reversa-requirements` escreveu antes de o código ser medido até o fim. Ajustar a redação
do critério é emenda de uma linha, e cabe a `/reversa-add` ou a uma passada de
`/reversa-requirements` — este plano não reescreve o `requirements.md`.

> Consequência prática para quem for conferir: o cenário Gherkin *"Consulta sem situação
> informada cai no default do schema"* é **declarado**, não provado. Se ele aparecer como
> 🟢 na matriz sem essa ressalva, a matriz está mentindo.

## 5. Delta arquitetural

Componentes do legado que mudam. O restante da arquitetura descrita em
`_reversa_sdd/architecture.md` permanece intocado.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de prova do módulo de Consultas | `_reversa_sdd/inventory.md#Cobertura de testes` | `componente-novo` | Três arquivos de verificação — listagem, detalhe e formulário — mais a massa compartilhada. O módulo tinha prova de componentes auxiliares, e nenhuma da máquina de estados |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md#Módulo Agendamentos` | `regra-alterada` | Ganha a seção equivalente para o módulo de Consultas, com veredito por promessa, destino dos 3 cenários, as oito lacunas declaradas e o achado de auditoria do `RF-17` |
| `_reversa_sdd/code-spec-matrix.md` | `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo "Consultas (3)" deixa de estar endereçado a uma feature a criar e passa a ter prova. O saldo dos módulos restantes cai de 26 para 23 |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `src/test/consultationsFixtures.ts` | Arquivo novo |
| `src/pages/__tests__/Consultations.test.tsx` | Arquivo novo |
| `src/pages/__tests__/Consultation.test.tsx` | Arquivo novo |
| `src/pages/__tests__/NewConsultation.test.tsx` | Arquivo novo |
| `_reversa_sdd/code-spec-matrix.md` | Seção do módulo, destino dos cenários e lacunas |
| `src/pages/Consultations.tsx`, `src/pages/Consultation.tsx`, `src/pages/NewConsultation.tsx`, `src/components/medical/*` | **Intocados** |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |
| `src/test/verificacoes-negativas.mjs` | **Intocado** — o caso do `RF-03` é reaproveitado por citação (D-05) |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice ou migração. O schema de `Consultation` permanece como está, incluindo o default `agendada` que a prova declara sem tocar.
- O único dado introduzido é **massa de prova fictícia**: consultas em cada uma das quatro situações, uma consulta **sem** situação, um paciente ativo e datas derivadas para exercitar os quatro recortes de tempo.
- Detalhe completo em: `_reversa_forward/004-prova-consultas/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** O transporte de auditoria é
exercitado pela prova — para verificar **se** a gravação acontece em cada fluxo — mas sua
assinatura, seu formato e seu tratamento de erro permanecem os do legado. O
`logAccess` continua engolindo a própria falha em `console.error`, sem propagar.

Por essa razão, o diretório `interfaces/` **não é criado** (D-10), conforme a regra do
`/reversa-plan`.

## 8. Plano de migração

Não há migração de dados nem de contrato. A sequência abaixo é a ordem de execução:

1. Criar a massa de prova compartilhada: consultas nas quatro situações, uma sem situação, paciente e derivadores de data (D-04).
2. Provar a listagem — filtro por situação, registro sem situação e os quatro recortes de data (RF-06, RF-10).
3. Provar o detalhe — legenda e ausência, ausência de transição automática e a assimetria de auditoria (RF-05, RF-07, RF-17, D-02, D-12).
4. Provar o formulário — situação inicial, troca de situação, situações oferecidas, portão do salvamento e ausência de envio acidental (RF-01, RF-02, RF-04, RF-08, RF-09, D-03, D-09).
5. Estender a matriz com o veredito do módulo, o destino dos 3 cenários e as oito lacunas, citando o caso negativo existente pelo `RF-03` (RF-11, RF-12, D-05, D-07).
6. Revalidar os quatro gates, medir o tempo e convergir por adendo no `/reversa-sync` (RF-13, RF-16, D-11).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** A prova de ausência da trilha de auditoria é intrinsecamente frágil: passa enquanto ninguém liga a ação, e passa também se a verificação estiver medindo o dublê errado | alto | média | D-02 dubla o transporte, não o módulo. A **mesma espiã** é provada disparando no caminho do exame — se ela não disparar em nenhum dos dois, a verificação falha e o arnês está errado, não o sistema |
| **R-02** Dois arquivos de teste diferem por **uma letra** (`Consultation.test.tsx` e `Consultations.test.tsx`), e a edição pode cair no arquivo errado | médio | alta | Os nomes espelham os dos componentes, que é a convenção de descoberta da suíte e o que a matriz cita. Mitigação: o cabeçalho `describe` de cada arquivo nomeia a tela por extenso, e cada arquivo tem um comentário de abertura dizendo qual tela ele prova |
| **R-03** Congelar o `Date` pode interferir na formatação de datas por `date-fns` ou no agendamento interno do React Query | médio | média | D-04 congela **só** o `Date`, com temporizadores reais. Se ainda assim interferir, o recuo é a abordagem da feature 003: derivar as datas do relógio real e aceitar a sensibilidade à virada da meia-noite, declarada |
| **R-04** O formulário de consulta é uma tela densa — quatro etapas, mais de trinta campos — e três verificações de interface sobre ele podem apertar o teto de 90 segundos | médio | média | D-11 revalida ao final; se estourar, é decisão registrada, não ajuste silencioso. O recorte possível é mover a prova do filtro de data para o arquivo da listagem, que é mais leve |
| **R-05** O `RF-09` pode passar por acidente: se o salvamento for acionado duas vezes pelo mesmo caminho, a contagem "exatamente uma vez" denuncia, mas se **nenhum** caminho gravar a verificação também passa | alto | baixa | D-09 exige as duas asserções na mesma verificação: nada gravado antes do salvamento deliberado **e** exatamente uma gravação depois. Uma verificação que não chega a gravar falha na segunda |
| **R-06** A metade não provável do `RF-01` pode ser lida como cobertura | médio | média | D-06 e a §4.1 registram o recorte nominalmente, e o critério de pronto exige a ressalva na matriz. O cenário declarado **não** pode aparecer como 🟢 sem ela |
| **R-07** A matriz pode divergir da suíte em silêncio | alto | média | O critério de pronto exige conferência da matriz contra a suíte antes de fechar, como nas features 002 e 003 |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature:

- [ ] Os 3 cenários de PT-005 têm prova de execução, **fiéis ao comportamento do código** (RF-01 a RF-04)
- [ ] A situação inicial é provada pelos **dois caminhos observáveis**, e a metade do schema é declarada com a ressalva (RF-01, D-06, §4.1)
- [ ] O seletor é provado oferecendo as quatro situações, inclusive de `cancelada` para `concluida` (RF-04)
- [ ] A ausência de transição automática é afirmada pelo **valor** da situação (RF-05, D-12)
- [ ] Emitir documento **não** grava auditoria e anexar exame **grava**, medidos no transporte (RF-17, D-02)
- [ ] O filtro por situação e o registro sem situação têm prova (RF-06)
- [ ] Os quatro recortes de data têm prova com o `Date` congelado (RF-10, D-04)
- [ ] O portão do salvamento exige paciente e **não** exige data (RF-08)
- [ ] Nenhum controle do formulário grava antes do salvamento deliberado (RF-09, D-09)
- [ ] A matriz cita toda regra com o artefato de origem qualificado (RF-11)
- [ ] As oito lacunas do módulo têm veredito declarado com razão, incluindo as duas de severidade Alta (RF-12, D-07)
- [ ] Nenhum arquivo de aplicação do módulo foi alterado (RF-15)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)
- [ ] A suíte completa executa em menos de 90 segundos (RNF Desempenho, D-11)
- [ ] Existe adendo vigente ao final do ciclo (RF-16)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-21 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
