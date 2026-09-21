# Requirements: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo de Consultas é o registro clínico do atendimento — anamnese, sinais vitais,
diagnóstico, conduta e os documentos emitidos a partir dele. É a segunda maior superfície
do sistema e o funil clínico inteiro passa por ele. Esta feature converte em prova de
execução os **3 cenários de paridade do módulo** (PT-005), que nunca foram verificados, e
prova o comportamento real da máquina de estados onde ela decide o que o médico vê: o
status inicial, a troca de status, o filtro da listagem e a legenda do detalhe.

Entrega para o desenvolvedor único, que hoje pode mudar o **status inicial** de uma
consulta sem que nada acuse, e para quem opera o funil clínico, que depende de uma regra de
estado que nunca foi verificada. A prova observa; não altera.

## 2. Contexto a partir do legado

> **Siglas.** **BR** é regra de negócio do domínio, **RF** é requisito funcional, **RNF**
> é requisito não funcional, **RLS** é a regra de acesso por linha do backend, **PT** é
> cenário de paridade da migração, **AMB** é ambiguidade registrada na migração.
>
> ⚠️ **Duas famílias de códigos `BR-C` com grafia quase idêntica.** A extração usa
> **dois** formatos para identificar regras do mesmo módulo: `_reversa_sdd/consultas/requirements.md#2`
> escreve `BR-C01`, `BR-C02`, `BR-C03` (**sem** hífen), enquanto
> `_reversa_sdd/code-analysis.md#6` escreve `BR-C-01` a `BR-C-12` (**com** hífen). São
> conjuntos **diferentes** de regras sobre o mesmo módulo, e a diferença de um caractere
> não é visível numa leitura rápida. **Toda citação nesta feature qualifica o artefato de
> origem**, e nenhuma usa a forma nua.
>
> ⚠️ **A derivação de `domain.md` é indireta.** `_reversa_sdd/domain.md#2` não tem família
> `BR-C` nenhuma: as regras do módulo vivem em `consultas/requirements.md#2` (3 regras) e
> em `code-analysis.md#6` (12 regras). O `domain.md` só alcança o módulo por
> `#2.4 Segurança e Auditoria` (BR-S01, BR-S02) e por `#3 Lacunas e Inconsistências`.

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/consultas/requirements.md#2. Regras de Negócio (BRs)` | BR-C01 (vínculo obrigatório), BR-C02 (ciclo de status) e BR-C03 (medicações só em receita) — e **nenhum cenário de aceitação** | 🟢 |
| `_reversa_sdd/consultas/requirements.md#3. Estrutura de Dados (Schema)` | `status` é enum de 4 valores com **default `agendada`**; `patient_id` obrigatório | 🟢 |
| `_reversa_sdd/state-machines.md#2. Status de Consulta (Consultation)` | A máquina tem **duas entradas**: `[*] --> agendada` (criada via agenda) e `[*] --> em_andamento` (criação direta) | 🟢 |
| `_reversa_sdd/state-machines.md#4. Matriz de Transições (Inferida)` | 🟡 e **só cobre o agendamento** — a matriz de transições da consulta **não existe** na extração | 🟡 |
| `_reversa_sdd/code-analysis.md#5.4 DTO interno formData (NewConsultation)` | ⚠️ O formulário usa `status` default **`em_andamento`**, enquanto o schema usa `agendada` | 🟢 |
| `_reversa_sdd/code-analysis.md#3.3 Criar/Editar Consulta` | Submit exige `selectedPatient`; edição chama `update` e grava `EDIT_CONSULTATION`; criação grava `CREATE_CONSULTATION` | 🟢 |
| `_reversa_sdd/code-analysis.md#3.1 Listagem de Consultas` | Filtro client-side combinado: busca, `statusFilter` de 5 valores e `dateFilter` de 5 valores | 🟢 |
| `_reversa_sdd/code-analysis.md#3.2 Detalhe da Consulta` | Legenda de situação no cabeçalho; seções condicionais; `VIEW_CONSULTATION` auditado | 🟢 |
| `_reversa_sdd/code-analysis.md#4.1 Filtro Combinado de Consultas` | Busca por paciente, queixa e diagnóstico, case-insensitive; status por igualdade | 🟢 |
| `_reversa_sdd/code-analysis.md#4.2 Filtro de Intervalo de Data` | `today`/`week`/`month`/`upcoming`, com a nota de que `upcoming` compara o **instante completo** | 🟢 |
| `_reversa_sdd/code-analysis.md#6. Regras de Negócio Extraídas` | BR-C-01 a BR-C-12, entre elas a elegibilidade por paciente `ativo` (BR-C-04) e o redirecionamento ao salvar (BR-C-12) | 🟢 |
| `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas` | Oito lacunas do módulo, entre elas **duas de severidade Alta**: `applyTemplate` sem escape e `handlePrint` por `window.open` | 🟢 |
| `_reversa_sdd/flowcharts/consultas.md#4. Fluxo: Criação/Edição de Consulta` | O formulário tem quatro etapas e a etapa 1 traz data/hora, **status** e retorno | 🟢 |
| `_reversa_sdd/migration/parity_tests/05-maquina-estados-consulta.feature` | PT-005: 3 cenários — nascimento e avanço, conclusão, e transições inválidas (metade de compilação, metade de interface) | 🟢 |
| `_reversa_sdd/domain.md#2.4 Segurança e Auditoria` | BR-S01: todo acesso ou alteração de dado sensível gera log. BR-S02: não-admin só vê o que criou | 🟢 |
| `_reversa_sdd/addenda/003-prova-agendamentos.md#Vigência` | Precedente vigente: a prova segue o **comportamento do código** e declara o cenário impreciso, em vez de exigir que o código mude | 🟢 |
| `_reversa_sdd/addenda/002-prova-automatizada.md#Vigência` | O mecanismo de prova existe e é executável por comando, incluindo as verificações negativas do gate de tipos | 🟢 |

### 2.1 Duas correções de premissa, medidas no código

**PT-005.1 afirma que uma consulta recém-criada nasce `agendada`.** Isso é verdade por
**um** dos dois caminhos e falso pelo outro. O schema tem default `agendada`, mas o
formulário de criação escreve `status: 'em_andamento'` explicitamente
(`src/pages/NewConsultation.tsx:72`), e o modo edição usa `c.status || 'em_andamento'`
como fallback (linha 127). Como o formulário é o caminho pelo qual o usuário cria
consultas na tela, **o registro nasce `em_andamento`**. A extração já registrava a
divergência em `code-analysis.md#5.4` e a máquina de estados já previa as duas entradas em
`state-machines.md#2` — o que faltava era prova. Confidência: 🟢.

**PT-005.3 afirma que "a interface de UI não oferece transição de `cancelada` para
`concluida`".** Isso é **falso**. O seletor de situação do formulário de edição oferece as
**quatro** situações, incondicionalmente, e escreve direto em `formData.status`
(`NewConsultation.tsx:305-313`). Não há guarda nenhuma sobre a situação atual: de
`cancelada` para `concluida`, de `concluida` para `agendada`, todas são oferecidas. A outra
metade do mesmo cenário — a união fechada do tipo `ConsultationStatus` — é verdadeira e
verificável em tempo de compilação. Confidência: 🟢.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor único (PO e Dev) | Mexer no status inicial ou no seletor de situação sem quebrar o funil clínico | Altera o default do formulário e descobre por comando o que deixou de valer |
| Médico (registro clínico) | Saber que a situação da consulta que ele salvou é a que aparece depois | Depende de uma máquina de estados que nunca foi verificada |
| Recepcionista ou administrador | Filtrar a lista por situação e confiar no recorte | Usa um filtro cuja regra de igualdade nunca foi provada |
| Desenvolvedor único | Saber se a consulta tem ou não o defeito de envio acidental dos agendamentos | Roda a suíte e vê a assimetria afirmada por prova, não por leitura |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Toda promessa registrada nas specs do módulo Consultas tem prova de execução, ou está declarada como lacuna com a razão em documento versionado. 🟢
   - Tipo: nova (estende ao módulo a regra que as features 002 e 003 criaram)
2. **RN-02:** A prova **observa; não altera.** Nenhum arquivo de aplicação, contrato de dados ou schema de entidade é modificado para acomodar a suíte. 🟢
   - Origem no legado: `_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`
   - Tipo: nova (herdada das features 002 e 003)
3. **RN-03:** O status inicial de uma consulta depende do **caminho de criação**: pelo schema é `agendada`; pelo formulário é `em_andamento`. O comportamento é preservado e provado como está — não é defeito a corrigir nesta feature. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#5.4`, `_reversa_sdd/state-machines.md#2`
   - Tipo: nova (formaliza comportamento existente, hoje silencioso)
4. **RN-04:** O seletor de situação do formulário oferece as **quatro** situações sem guarda de transição, de qualquer situação atual. O comportamento é preservado e provado como está. 🟢
   - Origem no legado: `_reversa_sdd/consultas/requirements.md#3` (enum de 4 valores)
   - Tipo: nova (o cenário PT-005.3 afirma o contrário; a divergência é deliberada e está declarada em §2.1)
5. **RN-05:** Nenhuma transição de status de consulta é **automática**. Emitir documento, subir exame ou salvar o formulário não move a situação por conta própria. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#3.3` — as mutações gravam `UPDATE`/`CREATE` e auditoria, nunca um status derivado
   - Tipo: nova
6. **RN-06:** O tipo `ConsultationStatus` é **união fechada** de quatro valores, verificada em tempo de compilação; atribuir valor fora do conjunto não compila. 🟢
   - Origem no legado: `src/types/Consultation.ts` (feature 001), `_reversa_sdd/consultas/requirements.md#3`
   - Tipo: nova
7. **RN-07:** O salvamento do formulário exige **apenas** paciente selecionado. A `date` é obrigatória no schema mas **não** é exigida pelo formulário. 🟢
   - Origem no legado: `src/pages/NewConsultation.tsx:442`, `_reversa_sdd/code-analysis.md#6` (BR-C-01 e BR-C-03)
   - Tipo: nova (a assimetria passa de leitura de código a promessa verificada)
8. **RN-08:** As lacunas do módulo entram nesta feature **apenas como veredito declarado**, com razão e destino. Nenhuma ganha prova de comportamento atual, inclusive as duas de severidade Alta. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#9`
   - Tipo: nova (decisão de escopo a confirmar em `/reversa-clarify`)
9. **RN-09:** Toda citação de regra desta feature qualifica o artefato de origem, por causa das duas grafias de `BR-C`. 🟢
   - Origem no legado: `_reversa_sdd/consultas/requirements.md#2` e `_reversa_sdd/code-analysis.md#6`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O status inicial da consulta tem prova de execução, **fiel ao comportamento do código** e não à redação do cenário PT-005.1 | Must | Consulta criada pelo formulário nasce `em_andamento`; consulta cujo status não é informado cai no default do schema, `agendada`; cada caminho com verificação executável | 🟢 |
| RF-02 | A transição de `em_andamento` para `concluida` tem prova de execução | Must | A troca pelo seletor é persistida e relida do armazém — afirma-se o **valor** gravado, não o formato da chamada | 🟢 |
| RF-03 | A metade de compilação do PT-005.3 tem prova | Must | O tipo `ConsultationStatus` recusa, em tempo de compilação, um valor fora de `{agendada, em_andamento, concluida, cancelada}` — reproduzível por comando | 🟢 |
| RF-04 | A metade de interface do PT-005.3 é provada como **falsa** e declarada | Must | A prova registra que o seletor oferece as quatro situações de qualquer situação atual, inclusive `cancelada` → `concluida`; o `.feature` fica declarado impreciso | 🟢 |
| RF-05 | A ausência de transição automática tem prova | Must | Depois de emitir documento ou subir exame, o status permanece o **valor** anterior — afirmado como valor, nunca como ausência de chamadas | 🟢 |
| RF-06 | O filtro por situação da listagem tem prova | Must | Cada filtro exibe apenas os registros daquela situação; e um registro **sem** status não aparece em filtro específico nenhum | 🟢 |
| RF-07 | A legenda de situação do detalhe tem prova, incluindo a ausência | Should | O registro com status exibe o rótulo correspondente; o registro sem status exibe **nenhuma** legenda, sem quebrar a tela | 🟢 |
| RF-08 | O portão do salvamento tem prova | Must | O botão está desabilitado sem paciente selecionado e habilitado com ele; e **não** exige `date`, apesar de o schema exigir | 🟢 |
| RF-09 | A ausência do defeito de envio acidental no formulário de consulta tem prova | Should | Nenhum controle dentro do `<form>` dispara gravação ao ser acionado; a assimetria com o defeito conhecido dos agendamentos fica afirmada por verificação | 🟢 |
| RF-10 | O filtro de intervalo de data da listagem tem prova | Should | Os quatro recortes (`today`, `week`, `month`, `upcoming`) produzem o conjunto correto, e a comparação de `upcoming` pelo **instante completo** fica registrada | 🟢 |
| RF-11 | A matriz de rastreabilidade registra o veredito de cada promessa do módulo, com o identificador qualificado pelo artefato de origem | Must | Cada linha cita `consultas/requirements.md#2`, `code-analysis.md#6` ou outro artefato nomeado — nunca a forma nua de `BR-C` | 🟢 |
| RF-12 | As lacunas do módulo ficam declaradas com a razão e o destino | Must | Cada uma das oito lacunas de `_reversa_sdd/code-analysis.md#9` tem veredito: fechada, transferida ou declarada | 🟢 |
| RF-13 | A prova do módulo é executável pelos comandos únicos já existentes | Must | A suíte passa por inteiro e os gates de tipos e de análise estática permanecem sem erro | 🟢 |
| RF-14 | A prova não depende de backend real, de rede nem do **valor** do relógio do sistema para decidir resultado | Must | A suíte roda sem backend e sem dublê de rede para o que é puro; onde o valor da data decide, o relógio é controlado | 🟢 |
| RF-15 | Nenhum arquivo de aplicação do módulo é alterado | Must | Não há diff em `src/pages/Consultation*`, `src/pages/NewConsultation*`, `src/components/medical/*` nem em `base44/entities/` | 🟢 |
| RF-16 | O adendo da entrega converge o delta na extração | Must | Existe adendo vigente para a feature, produzido ao final do ciclo | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Reprodutibilidade | Toda evidência é reproduzível em máquina limpa, com instalação de dependências e um comando | RN-01; mecanismo provado nas features 002 e 003 | 🟢 |
| Determinismo | Nenhuma verificação depende do **valor** do relógio real para decidir o resultado | O filtro de data deriva de `new Date()`; sem controle, a verificação quebraria sozinha na virada do dia | 🟢 |
| Isolamento | A prova não fala com o backend real nem com a rede | `_reversa_sdd/c4-context.md#Integrações Externas Detectadas` | 🟢 |
| Desempenho | O acréscimo mantém a suíte completa **abaixo de 90 segundos** | Medição de 2026-09-21 após a feature 003: 66 verificações em 14 arquivos, 57,9 s — folga de 32 s. Teto **mantido** por decisão de 2026-09-19 | 🟢 |
| Paridade | Nenhuma alteração de comportamento observável é introduzida pela feature | Regra de ouro herdada; `base44/entities/*.jsonc` permanece intocado | 🟢 |
| Privacidade | Dados de prova são fictícios; nenhum dado clínico real entra na massa | O módulo manipula anamnese, diagnóstico e CID-10 de paciente | 🟢 |
| Manutenibilidade | Acrescentar verificação nova não exige editar configuração de infraestrutura de prova | A suíte se descobre por convenção de nome de arquivo | 🟢 |
| Observabilidade | A falha identifica a promessa violada, não apenas o arquivo | RN-01 e o padrão de mensagem estabelecido na feature 002 | 🟡 |

### 6.1 Limites explícitos de alcance

- A prova **não** corrige nenhuma das oito lacunas de `_reversa_sdd/code-analysis.md#9`. Elas passam a ter veredito, não conserto — em particular as duas de severidade Alta. 🟢
- A prova **não** cobre as duas lacunas Alta de segurança do cliente (`applyTemplate` sem escape e `handlePrint` por `window.open`), salvo decisão em contrário de `/reversa-clarify`. O comportamento está **registrado como preservação deliberada do legado**: `src/components/medical/PrescriptionEditor.tsx:145` traz o comentário "sem escape de marcação, como no legado (AMB-006)". 🟢
- A prova **não** cobre emissão de documento nem upload de exame além do necessário para afirmar que não movem o status. São superfícies próprias, com cenários de paridade de outros módulos (Templates e Contrato de dados). 🟢
- A prova **não** valida autorização real. A regra de acesso permanece no servidor; a suíte verifica que o escopo foi declarado e aplicado. 🟢
- A **paridade visual** das telas do módulo permanece fora: a captura dourada de referência não existe no repositório. 🟢
- Os cenários de paridade dos **demais módulos** não pertencem a esta feature. 🟢
- Esta feature **não** altera as features 001, 002 e 003 nem reabre o escopo delas. 🟢

## 7. Critérios de Aceitação

```gherkin
Cenário: Consulta criada pelo formulário nasce em andamento
  Dado o formulário de nova consulta com um paciente selecionado
  Quando a consulta é salva
  Então o registro é gravado com situação "em_andamento"

Cenário: Consulta sem situação informada cai no default do schema
  Dado uma consulta cujo campo de situação não foi informado
  Quando a situação é consultada
  Então o default do schema é "agendada"

Cenário: Consulta em andamento avança para concluída
  Dado uma consulta em situação "em_andamento"
  Quando o usuário escolhe "concluida" no seletor e salva
  Então a situação persistida passa a ser "concluida"

Cenário: O seletor oferece as quatro situações de qualquer situação atual
  Dado uma consulta em situação "cancelada" no formulário de edição
  Quando o seletor de situação é aberto
  Então as quatro situações são oferecidas
  E "concluida" consta entre elas

Cenário: O tipo fechado recusa valor fora do conjunto
  Dado o tipo ConsultationStatus como união fechada
  Quando o código tenta atribuir um valor fora de {agendada, em_andamento, concluida, cancelada}
  Então o gate de tipos recusa a compilação

Cenário: Emitir documento não transiciona a consulta
  Dado uma consulta em situação "em_andamento"
  Quando um documento é emitido a partir dela
  Então a situação permanece "em_andamento"

Cenário: Subir exame não transiciona a consulta
  Dado uma consulta em situação "em_andamento"
  Quando um exame é anexado a ela
  Então a situação permanece "em_andamento"

Cenário: O salvamento exige apenas paciente selecionado
  Dado o formulário de nova consulta sem paciente
  Então o botão de salvar está desabilitado
  Quando um paciente é selecionado
  Então o botão está habilitado

Cenário: A data obrigatória do schema não é exigida pelo formulário
  Dado o formulário com paciente selecionado e sem data informada
  Então o botão de salvar permanece habilitado
  E a obrigatoriedade da data é do schema, não do formulário

Cenário: Nenhum controle do formulário dispara envio acidental
  Dado o formulário de nova consulta preenchido
  Quando os controles internos são acionados sem acionar o salvamento
  Então nenhuma gravação acontece

Cenário: O filtro por situação mostra apenas a situação escolhida
  Dado consultas em situações diferentes
  Quando o filtro é ajustado para uma situação
  Então apenas os registros daquela situação são exibidos

Cenário: Registro sem situação não aparece em filtro específico
  Dado uma consulta sem situação gravada
  Quando o filtro é ajustado para qualquer situação específica
  Então esse registro não é exibido

Cenário: Registro sem situação não exibe legenda
  Dado uma consulta sem situação gravada
  Quando o detalhe é aberto
  Então nenhuma legenda de situação é exibida
  E a tela não quebra

Cenário: O recorte por data respeita cada intervalo
  Dado consultas em datas distintas em torno de hoje
  Quando cada recorte de data é aplicado
  Então "hoje", "semana", "mês" e "próximas" produzem os conjuntos correspondentes

Cenário: A prova do módulo é executada pelos comandos únicos já existentes
  Dado o projeto com as dependências instaladas
  Quando o comando único de prova é executado
  Então as verificações do módulo de Consultas são executadas junto com as demais
  E o código de retorno reflete o resultado

Cenário: Nenhum arquivo de aplicação do módulo é alterado
  Dado o estado final da feature
  Quando as alterações são conferidas
  Então nenhuma tela, componente médico ou schema de entidade foi modificado

Cenário: Promessa sem prova é declarada
  Dado o módulo de Consultas
  Quando a matriz de rastreabilidade é consultada
  Então cada promessa do módulo tem veredito de provada por execução ou de lacuna com razão
  E cada regra é citada com o artefato de origem que a define

Cenário: A entrega é convergida na extração
  Dado o estado final da feature
  Quando a extração reversa é consultada
  Então existe adendo vigente descrevendo o delta da entrega
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | O status inicial é o que decide o funil clínico, e a extração registra duas respostas diferentes para a mesma pergunta |
| RF-02 | Must | A conclusão do atendimento é o desfecho do fluxo; sem prova, quebra em silêncio |
| RF-03 | Must | É a única das três metades de PT-005 que a extração já acerta, e é barata de provar por compilação |
| RF-04 | Must | O cenário afirma algo **falso** sobre a interface. Provar o comportamento real é o que impede alguém de "consertar" o seletor achando que corrige um defeito |
| RF-05 | Must | Provar ausência exige asserção positiva; sem isso a verificação passa sem exercitar caminho nenhum |
| RF-06 | Must | O filtro é como a operação consome o status; a igualdade simples tem um caso de borda real (registro sem status) |
| RF-08 | Must | É a assimetria mais concreta do módulo: a data é obrigatória no schema e não no formulário |
| RF-11 | Must | Sem a citação qualificada, a matriz cita a regra errada — as duas grafias de `BR-C` são reais |
| RF-12 | Must | Sem declaração, oito lacunas se disfarçam de cobertura |
| RF-13 | Must | A prova precisa ser executável pelos comandos que já existem |
| RF-14 | Must | Prova dependente de rede ou do relógio real não é reprodutível |
| RF-15 | Must | É a regra de ouro: esta feature prova, não conserta |
| RF-16 | Must | Sem o adendo a extração volta a descrever um sistema sem prova |
| RF-07 | Should | A ausência de legenda é comportamento deliberado do código, mas de impacto menor |
| RF-09 | Should | A assimetria com os agendamentos é valiosa como contraste, e barata |
| RF-10 | Should | O recorte de data tem defeito documentado em `upcoming`; provar o comportamento atual é pré-requisito para decidir mudar |
| RNF Determinismo | Must | O filtro de data deriva de `new Date()`; sem controle, as verificações quebram sozinhas na virada do dia |
| RNF Desempenho | Should | 90 segundos é o teto para a suíte continuar sendo usada no dia a dia |
| RNF Observabilidade | Should | A falha deve apontar a promessa violada, não só o arquivo |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 [DÚVIDA] **Qual status inicial a feature promete?** O formulário grava `em_andamento` e o schema diz `agendada`; o PT-005.1 afirma `agendada`. Provar o comportamento fiel ao código e declarar o cenário impreciso — o precedente da feature 003 —, ou tratar `em_andamento` como defeito a corrigir numa feature própria? A escolha muda o RF-01.
- 🔴 [DÚVIDA] **A metade de interface do PT-005.3 vira promessa ou defeito?** O seletor oferece as quatro situações sem guarda, inclusive `cancelada` → `concluida`. Provar como comportamento atual e declarar (recomendado: é o mesmo padrão do RF-04), ou incluir no escopo a imposição das transições válidas?
- 🔴 [DÚVIDA] **As duas lacunas de severidade Alta entram como prova ou como veredito declarado?** `applyTemplate` sem escape e `handlePrint` por `window.open` são prováveis no cliente e são preservação deliberada do legado (AMB-006). A decisão de 2026-09-19 na feature 003 foi declarar sem provar; esta feature mantém ou abre exceção?

### Pendências transferidas para fora desta feature

- 🟢 **As oito lacunas do módulo** — `_reversa_sdd/code-analysis.md#9. Pontos de Atenção / Lacunas`: `STATUS_CONFIG` duplicado (Baixa), `applyTemplate` sem escape (Alta), `handlePrint` por injeção (Alta), filtro `upcoming` por instante completo (Baixa), impressão sem CSS dedicado (Média), upload sem validação de tamanho e tipo (Média), busca de paciente limitada a 5 (Baixa) e "sem testes" (Alta). Decisão provisória: **veredito declarado, sem prova**.
- 🟡 **A matriz de transições da consulta não existe na extração** — `_reversa_sdd/state-machines.md#4` é 🟡 e cobre apenas o agendamento. A máquina da consulta está descrita só como diagrama, em `#2`. Produzir a matriz é trabalho da extração, não desta feature.
- 🟡 **Terceira e quarta cópias do mapa de situação** — `STATUS_CONFIG` está definido em `src/pages/Consultations.tsx:28` e em `src/pages/Consultation.tsx:36`, com as mesmas quatro entradas. Somados aos dois mapas do módulo de agendamentos, o projeto tem **quatro** mapas paralelos de situação. Unificá-los é trabalho de `/reversa-refactor`.
- 🟡 **Emissão de documento não gera trilha de auditoria** — `src/pages/Consultation.tsx` grava `VIEW_CONSULTATION` (linha 116) e as mutações de criação de prescrição e de exame (linhas 120 e 126) **não** chamam auditoria; o upload de exame audita por dentro do componente (`ExamUploader.tsx:143`). A assimetria precisa ser confirmada e, se real, confrontada com a BR-S01 de `_reversa_sdd/domain.md#2.4`. Registrada como lacuna de leitura, **não provada** nesta feature.
- 🟡 **Imprecisão do cenário PT-005.1 e do PT-005.3** — as duas redações não correspondem ao comportamento observado. Corrigir os `.feature` é trabalho da extração.
- 🔴 **Paridade visual das telas do módulo** — os cenários de tela permanecem sem prova enquanto a captura dourada de referência não existir no repositório.
- 🟡 **Cenários de paridade dos demais módulos** — pertencem a features próprias, com destino já declarado na matriz de rastreabilidade.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-21 | Versão inicial gerada por `/reversa-requirements` | reversa |

---
*Gerado pelo Reversa-Requirements em 2026-09-21.*
