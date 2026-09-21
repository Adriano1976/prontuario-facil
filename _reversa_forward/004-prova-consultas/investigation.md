# Investigação: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Para quem for executar o plano e quiser saber **por que** cada decisão técnica foi tomada.

## 1. O que foi investigado

A pergunta prática desta feature é: **onde cada promessa da máquina de estados da consulta
é observável, e qual é o arranjo de prova mais honesto para cada uma?** A investigação
seguiu três frentes:

1. Ler o código de produção do módulo até o fim, e não apenas os artefatos da extração —
   porque os artefatos divergem do código em pelo menos três pontos (§4).
2. Medir o custo e a fragilidade de cada arranjo de prova possível, com base no que as
   features 002 e 003 já pagaram para aprender.
3. Verificar até o fim a suspeita de assimetria de auditoria levantada ao escrever o
   `requirements.md`, que era a única afirmação do documento feita sobre leitura parcial.

## 2. Onde cada promessa vive

| Promessa | Superfície real | Por que a prova é feita ali |
| :--- | :--- | :--- |
| Situação inicial da consulta (RF-01) | `src/pages/NewConsultation.tsx:72` e `:127` | O único lugar do sistema que **escreve** uma situação inicial é o formulário. O default do schema é do backend e não é observável aqui |
| Troca de situação (RF-02, RF-04) | `src/pages/NewConsultation.tsx:305-313` | O seletor do formulário é a **única** interface de transição do sistema. A listagem tem filtro, e não transição; o detalhe mostra legenda, e não transição |
| Tipo fechado (RF-03) | `src/types/Consultation.ts:25-29` | Verificável em tempo de compilação, não em execução |
| Ausência de transição automática (RF-05) | `src/pages/Consultation.tsx` (mutações de documento e exame) | É no detalhe que os dois fluxos que **poderiam** mover a situação são acionados |
| Filtro por situação (RF-06) | `src/pages/Consultations.tsx:88` | O filtro é client-side e puro sobre a lista carregada |
| Legenda e ausência (RF-07) | `src/pages/Consultation.tsx:137` e `Consultations.tsx:116` | Duas telas, o mesmo mapa de situação, a mesma tolerância à ausência |
| Portão do salvamento (RF-08) | `src/pages/NewConsultation.tsx:442` | `disabled` é estado observável do botão |
| Ausência de envio acidental (RF-09) | `src/pages/NewConsultation.tsx` (o `<form>` da linha 215) | O defeito conhecido dos agendamentos nasce de um botão sem `type` **dentro** do formulário |
| Recortes de data (RF-10) | `src/pages/Consultations.tsx` (filtro de data) | Os quatro recortes comparam com hoje, e por isso dependem do valor do relógio |
| Assimetria de auditoria (RF-17) | `src/pages/Consultation.tsx:120-130` e `src/components/medical/ExamUploader.tsx:143-149` | A diferença entre os dois fluxos só é visível no transporte |

## 3. Alternativas avaliadas

### 3.1 Como provar a trilha de auditoria

| Alternativa | Veredito |
| :--- | :--- |
| Dublar `logAccess` e afirmar as chamadas recebidas | **Descartada.** Mede o dublê, não o sistema. Se a ligação entre o fluxo e a auditoria não existisse, o dublê continuaria sendo chamado em qualquer código que o chamasse — e a verificação passaria por um caminho que não é o do sistema |
| Dublar `base44.entities.AccessLog` e deixar `logAccess` correr de verdade | **Escolhida (D-02).** É a diferença entre provar o encanamento e provar uma imitação do encanamento. O módulo de auditoria é pequeno (`AccessLogger.ts`, 73 linhas), determinístico e sem dependência externa além do transporte |
| Declarar sem provar, como nas oito lacunas | **Descartada para este achado.** Foi o que o `requirements.md` fez na primeira redação, e a verificação mostrou que a suspeita era maior do que parecia: das doze ações do catálogo, **três** nunca são invocadas |

### 3.2 Como exercitar o seletor de situação

O seletor é um componente Radix. A feature 002 tentou abri-lo no DOM simulado e gastou
**66 segundos** até estourar o limite de 5 s por verificação; o conserto foi dublar o
módulo `@/components/ui/select`, e as features 002 e 003 reaproveitaram o mesmo padrão.

**Consequência que precisa ficar declarada, e não escondida:** com o dublê, o que se mede é
**o que a tela decide oferecer**, e não o que o componente de interface desenha. Como o
conjunto de situações é passado pela tela como `<SelectItem value=...>`, a afirmação
"o seletor oferece quatro situações" continua verdadeira sobre a tela — mas não é uma
afirmação sobre o desenho do componente. É a mesma ressalva que a feature 002 registrou
para a prova do tipo sanguíneo.

### 3.3 Como controlar o relógio

Os recortes de data decidem pelo valor de hoje. Três caminhos foram considerados:

| Alternativa | Veredito |
| :--- | :--- |
| Datas explícitas e distantes | **Descartada.** Vira bomba-relógio: a verificação passa hoje e falha numa data futura, sem que ninguém tenha mexido no código |
| Derivar as datas do relógio real, como a feature 003 fez | **Recuo declarado.** Funciona e não conflita com nada, mas deixa o recorte `today` sensível à virada da meia-noite no meio da execução |
| Congelar **apenas o `Date`**, mantendo temporizadores reais | **Escolhida (D-04).** O conflito que a feature 003 encontrou foi com temporizadores falsos, não com a data: `userEvent` depende de esperas assíncronas, e `Date` congelado não interfere nelas |

### 3.4 Como provar a ausência de envio acidental

Provar ausência é a classe de verificação mais fácil de escrever mal. A forma escolhida
(D-09) exige **duas asserções na mesma verificação**: a gravação não aconteceu antes do
salvamento deliberado, e aconteceu **exatamente uma vez** depois dele. A segunda asserção é
o que impede o placebo — uma verificação que nunca chega a gravar falha nela.

### 3.5 O caso negativo do tipo fechado

O caso `status-fora-do-conjunto` já existe em `src/test/verificacoes-negativas.mjs` desde
a feature 001 (ação T032). Ele escreve `export const caso: ConsultationStatus = 'finalizada'`
e confere que o gate recusa citando `finalizada`. **Escrever um segundo caso idêntico
duplicaria a cobertura e criaria dois pontos de verdade** (D-05). A feature cita o caso
existente e não toca no arquivo.

## 4. Divergências entre a extração e o código

Três foram medidas, e as três são provadas ou declaradas nesta feature:

1. **O status inicial.** `_reversa_sdd/code-analysis.md#5.4` já registrava que o formulário
   usa `em_andamento` e o schema `agendada`. O código confirma: `NewConsultation.tsx:72`
   escreve `em_andamento`, e o modo edição usa `c.status || 'em_andamento'` (linha 127).
   **Duas manifestações da mesma divergência**, e a segunda não estava registrada em lugar
   nenhum: o **fallback do cliente** para um registro sem situação também é `em_andamento`,
   e não o `agendada` do schema.
2. **A interface de transição.** O cenário PT-005.3 afirma que a interface não oferece
   `cancelada` → `concluida`. O seletor oferece as quatro situações, incondicionalmente,
   sem guarda sobre a situação atual.
3. **A trilha de auditoria.** Não estava registrada na extração. Ver §5.

## 5. O achado de auditoria, em detalhe

O catálogo de ações auditáveis é um objeto constante com doze entradas
(`src/components/medical/AccessLogger.ts:22-35`). Cruzando o catálogo com as invocações
existentes no código:

| Ação | Invocada em | Situação |
| :--- | :--- | :--- |
| `login` | `Dashboard.tsx:110` | ✅ |
| `view_patient` | `PatientDetail.tsx:158` | ✅ |
| `edit_patient` | `PatientForm.tsx:194` | ✅ |
| `create_patient` | `PatientForm.tsx:197` | ✅ |
| `view_consultation` | `Consultation.tsx:116` | ✅ |
| `create_consultation` | `NewConsultation.tsx:159` | ✅ |
| `edit_consultation` | `NewConsultation.tsx:156` | ✅ |
| `upload_exam` | `ExamUploader.tsx:144` | ✅ |
| `delete_record` | `PatientDetail.tsx:177` | ✅ |
| `create_prescription` | — | ❌ **nunca** |
| `logout` | — | ❌ nunca |
| `export_data` | — | ❌ nunca |

**A primeira das três órfãs é a que importa.** O fluxo existe
(`Consultation.tsx:120-124` cria a prescrição) e a ação existe no catálogo
(`AccessLogger.ts:31`). Nada liga os dois. Emitir uma receita — documento derivado de
diagnóstico, portanto dado sensível — não deixa rastro na trilha.

O contraste com o exame é o que torna o achado demonstrável: anexar um exame **audita**,
mas por dentro do componente (`ExamUploader.tsx:143-149`), depois de a gravação ser aceita
— e não pela mutação da tela. Os dois fluxos foram resolvidos de formas diferentes, e
apenas um deles deixou rastro.

A regra confrontada é a **BR-S01** de `_reversa_sdd/domain.md#2.4`, que é 🟢: *"todo acesso
ou alteração de dados sensíveis deve gerar um log em `AccessLogs`"*.

As outras duas ações órfãs têm explicação mais simples e menos grave: `logout` não tem
auditoria de saída no sistema, e `export_data` não tem funcionalidade de exportação
correspondente. São entradas de catálogo à espera de fluxos que talvez não existam.

## 6. Padrões aplicáveis

| Padrão | Origem | Uso nesta feature |
| :--- | :--- | :--- |
| Dublê de módulo para o seletor Radix | `PatientForm.test.tsx`, reaproveitado em `Patients.test.tsx` e nas features 002 e 003 | D-03 |
| Massa de prova compartilhada com datas **derivadas**, nunca de string de data | `src/test/appointmentsFixtures.ts`, feature 003 | `consultationsFixtures.ts` |
| Asserção positiva sobre o valor observado, em vez de ausência de chamadas | R-03 da feature 003, decisão D-12 desta | RF-05, RF-09 |
| Armazém de mentira com releitura, para afirmar o valor persistido | `Appointments.test.tsx`, feature 003 | RF-02, RF-05 |
| Reaproveitamento de caso negativo existente por citação | `verificacoes-negativas.mjs`, feature 002 | D-05 |
| Escrita atômica (arquivo preparado mais renomeação) | Convenção do projeto e das features 001 a 003 | Todos os artefatos |

## 7. Fontes externas

**Nenhuma foi consultada.** Todas as decisões desta investigação repousam em evidência
dentro do repositório — código de produção, artefatos da extração, adendos vigentes e o
histórico das features anteriores. Não há biblioteca nova, integração nova nem padrão
externo a avaliar, e inventar referências para preencher a seção seria pior do que
declarar que ela está vazia.

Vale registrar o que **foi** consultado como fonte de decisão, porque não é externo mas é
o que sustenta cada escolha: `PatientForm.test.tsx`, `Appointments.test.tsx`,
`NewAppointment.test.tsx`, `src/test/appointmentsFixtures.ts`,
`src/test/verificacoes-negativas.mjs` e os três adendos vigentes em `_reversa_sdd/addenda/`.

## 8. O que **não** foi investigado

- **A impressão de documentos.** A lacuna Alta de `handlePrint` por injeção em
  `window.open` fica declarada, sem prova, por decisão da sessão de 2026-09-21.
- **A substituição de variáveis de template.** Mesma decisão, para `applyTemplate`.
- **As outras duas ações órfãs do catálogo.** `logout` e `export_data` foram registradas
  como consequência do mesmo cruzamento, mas não têm fluxo para provar.
- **O comportamento do backend.** O default `agendada` do schema e a aplicação real da RLS
  acontecem no servidor e não são observáveis no cliente (D-06).
- **A correção de qualquer um dos achados.** Por regra, esta feature prova e declara.

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
