# Regression Watch: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Nota: esta feature **não alterou nenhuma regra de negócio, contrato de dados ou
> comportamento observável**. Os itens abaixo não são regressões a evitar, e sim
> **propriedades que precisam continuar verdadeiras** — tanto os comportamentos que a
> prova passou a fixar quanto a própria prova. Ver `legacy-impact.md#Modificadas`.
>
> ⚠️ **Os identificadores `W00x` reiniciam a cada feature.** A 001 usa `W001`–`W009`, a 002
> usa `W001`–`W008`, a 003 usa `W001`–`W011` e esta usa `W001`–`W013`. Uma citação nua não
> resolve — **toda referência a um watch item precisa nomear a feature de origem**. É a
> mesma disciplina que a RN-09 impõe às duas grafias de `BR-C`, e a matriz já pagou o preço
> de não a seguir uma vez.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `src/pages/NewConsultation.tsx:72` e `_reversa_sdd/code-analysis.md#5.4 DTO interno formData` | A consulta criada **pelo formulário** nasce com situação `em_andamento`, e não com o `agendada` do schema | `presença` | O default do formulário passa a ser `agendada` sem decisão registrada; a prova de situação inicial falha e a divergência documentada deixa de existir |
| W002 | `src/pages/NewConsultation.tsx:127` | O modo edição cai em `em_andamento` quando o registro **não tem** situação — o fallback do cliente, que também diverge do schema | `presença` | O fallback passa a usar o default do schema, ou deixa de existir; a segunda manifestação da divergência desaparece sem ninguém notar |
| W003 | `src/pages/NewConsultation.tsx:305-313` | O seletor oferece as **quatro** situações de qualquer situação atual, sem guarda de transição | `presença` | Surge uma guarda que impeça `cancelada` → `concluida`. É mudança de comportamento observável e exige decisão explícita — o cenário PT-005.3 afirma que a guarda existe, e a prova registra que não |
| W004 | `src/pages/Consultation.tsx` (mutações de documento e exame) | Nenhuma transição de situação é **automática**: emitir documento ou anexar exame não move a consulta | `presença` | Surge transição automática. A prova, que afirma o **valor** depois de cada operação, passa a falhar — e com ela a garantia de que o funil clínico é conduzido à mão |
| W005 | `src/pages/Consultation.tsx:120-124` contra `src/components/medical/ExamUploader.tsx:143-149` | Emitir documento **não** grava trilha de auditoria; anexar exame **grava**, com a ação `upload_exam` | `presença` | A assimetria muda por qualquer um dos lados: ou a prescrição passa a auditar — o que **fecha** a lacuna e deve ser comemorado, não tratado como regressão —, ou o exame deixa de auditar — o que agrava o problema |
| W006 | `src/pages/Consultations.tsx:98-101` | O recorte "última semana" é `date >= hoje - 7 dias`, **sem limite superior**, e por isso inclui consultas futuras | `presença` | O recorte ganha limite superior. Muda o conjunto exibido, e a prova — que afirma quatro resultados, um deles futuro — falha. É a decisão de corrigir o defeito documentado em `code-analysis.md#4.2` |
| W007 | `src/pages/Consultations.tsx:106-108` | O recorte "próximas" compara o **instante completo**: consulta de hoje já passada não aparece | `presença` | Passa a comparar apenas o dia; a prova que afirma dois resultados passa a afirmar três |
| W008 | `src/pages/Consultations.tsx:88`, `:115-116` e `src/pages/Consultation.tsx:137` | Registro **sem** situação não exibe legenda e não casa com filtro específico nenhum — a ausência é preservada, e não substituída por um rótulo inventado | `presença` | A ausência passa a virar legenda padrão ou erro de renderização; as provas de listagem e de detalhe falham |
| W009 | `src/pages/NewConsultation.tsx:442` e `:296-301` | O portão do salvamento exige **apenas** paciente; a data é obrigatória no **controle**, por `required`, e não no portão | `presença` | O portão passa a exigir data — melhora real, que exige atualizar a prova —, ou o `required` do campo desaparece, deixando o formulário aceitar consulta sem data |
| W010 | `src/pages/NewConsultation.tsx` (o `<form>` da linha 215) | Todo botão **dentro** do formulário declara o próprio `type`, e nenhum dispara gravação por acidente | `ausência` | Um botão sem `type` volta a existir dentro do `<form>` — é exatamente o defeito conhecido dos agendamentos (`W101` da feature 003). A prova de contagem falha |
| W011 | `_reversa_sdd/code-spec-matrix.md#Módulo Consultas` | Toda promessa do módulo citada na matriz aponta para verificação existente, e todo identificador de regra vem **qualificado pelo artefato de origem** | `presença` | Citação volta a usar `BR-C01` ou `BR-C-01` sem o artefato — as duas grafias são reais e diferem por um caractere |
| W012 | `_reversa_sdd/code-spec-matrix.md#Lacunas declaradas do módulo de Consultas` | As oito lacunas declaradas continuam declaradas, cada uma com severidade e razão | `presença` | Lacuna some da lista sem ter sido fechada por prova, ou o veredito passa a 🟢 sem verificação que o sustente — ausência de prova disfarçada de cobertura |
| W013 | `src/types/Consultation.ts:25-29` | `ConsultationStatus` permanece **união fechada** de quatro valores, verificada em compilação | `presença` | O tipo passa a aceitar `string` ou ganha valor novo. O caso `status-fora-do-conjunto` de `npm run prova:negativos` deixa de recusar |

## Histórico de re-extrações

(Nenhuma ainda.)

## Arquivadas

(Nenhuma.)

## Observações

Sem peso de regressão — defeitos declarados, divergências conhecidas e decisões
estruturais registradas para contexto:

- **DEFEITO REAL, NÃO CORRIGIDO — a emissão de documento não deixa rastro de auditoria.**
  `ACCESS_ACTIONS` declara **doze** ações (`AccessLogger.ts:22-35`) e apenas **nove** são
  invocadas. As três órfãs são `create_prescription`, `logout` e `export_data`. A primeira
  é a que importa: o fluxo existe (`Consultation.tsx:120-124`), a ação existe
  (`AccessLogger.ts:31`), e **nada liga os dois**. Emitir uma receita, documento derivado de
  diagnóstico e portanto dado sensível, não deixa rastro — enquanto anexar um exame deixa,
  porque o `ExamUploader` audita por dentro. Confronta a **BR-S01** de `domain.md#2.4`, que
  é 🟢. Provado e declarado; **não** corrigido. As outras duas não têm sequer fluxo
  correspondente.
- **DEFEITO REAL, NÃO CORRIGIDO — `applyTemplate` sem escape de marcação.** Severidade
  **Alta** em `code-analysis.md#9`. É **preservação deliberada do legado**: o próprio código
  registra *"sem escape de marcação, como no legado (AMB-006)"* em
  `PrescriptionEditor.tsx:145`. Declarado sem prova, por decisão da sessão de 2026-09-21.
- **DEFEITO REAL, NÃO CORRIGIDO — injeção por `window.open` no editor.** Mesma severidade
  Alta e mesma decisão. Vale a distinção: o `handlePrint` do **detalhe**
  (`Consultation.tsx:132`) é `window.print()` simples e **não** tem o problema — são dois
  métodos de mesmo nome em arquivos diferentes, e só o do editor injeta.
- **DEFEITO REAL, NÃO CORRIGIDO — o recorte "última semana" inclui o futuro.** O recorte é
  `consultDate >= hoje - 7 dias`, sem limite superior. Não é "última semana" no sentido de
  passado. Provado e registrado como verdade, não corrigido.
- **QUATRO mapas de situação paralelos no projeto.** `STATUS_CONFIG` está definido em
  `Consultations.tsx:28`, `Consultation.tsx:36`, `Appointments.tsx` e `AppointmentCalendar.tsx`
  (`STATUS_COLORS`). Os dois primeiros têm as mesmas quatro entradas. Unificá-los é trabalho
  de `/reversa-refactor`, e a duplicação deste módulo é a lacuna de severidade Baixa #1.
- **A tela do detalhe depende de `created_date` nas prescrições.** A seção "Documentos
  Emitidos" formata esse campo (`Consultation.tsx:412`); um registro sem ele quebra a
  renderização com `Invalid time value`. O campo é de `BaseEntity` e o backend sempre o
  preenche, então o caso é teórico — mas foi **descoberto por acidente**, ao escrever um
  dublê que não o informava, e fica registrado porque o próximo a escrever um dublê aqui
  cairá nele.
- **A data é obrigatória no controle, e não no portão.** O portão em JavaScript olha apenas
  o paciente; o campo carrega `required`. As duas coisas convivem, e a segunda **não é
  exercitável no DOM simulado**, que não implementa validação de restrição do navegador. A
  prova afirma as duas como atributos e deliberadamente **não** testa o envio com a data
  apagada — isso mediria a limitação do ambiente, não o sistema.
- **ARMADILHA DE ARNÊS, registrada para quem escrever a próxima prova.** Um dublê de
  `useQuery` que devolve um **array novo a cada renderização** trava o processo quando a tela
  tem esse array nas dependências de um efeito que chama `setState` — o laço bloqueia o event
  loop e nem o limite de tempo por verificação chega a disparar. Foi o que aconteceu aqui, e
  custou uma execução inteira. A defesa é guardar as listas por identidade, como o armazém
  desta suíte faz.
- **ARMADILHA DE ARNÊS — `user.type` em campo `datetime-local`.** O `userEvent` escreve
  componente a componente e trava no DOM simulado. Alterar o campo por evento direto é a
  alternativa usada aqui.
- **Dois arquivos de prova diferem por uma letra (R-02 do `roadmap.md`).**
  `Consultation.test.tsx` é o **detalhe**; `Consultations.test.tsx` é a **listagem**. Os
  nomes espelham os dos componentes, que é a convenção de descoberta da suíte e o que a
  matriz cita. O cabeçalho `describe` de cada um nomeia a tela por extenso.
- **Divergência entre o formulário e o schema, sem dono.** O formulário grava
  `em_andamento` e o schema documenta `agendada`. Provado nesta feature como comportamento
  atual; alinhar os dois é decisão de produto, candidata a feature própria.
- **O recorte de paridade visual das telas do módulo.** Permanece sem prova enquanto a
  captura dourada de referência não existir no repositório. Declarada — 🔴.
- **Restrição de ambiente.** A suíte exige acesso ampliado para subir: o esbuild do vitest
  abre pipe nomeado e falha com `spawn EPERM` nos dois modos confinados. O comando de
  verificação negativa (que criaria `src/__negative_checks__/`) tem a mesma restrição. Não é
  defeito do projeto.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
