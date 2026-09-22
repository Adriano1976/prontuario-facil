---
schemaVersion: 1
generatedAt: 2026-09-22T12:34:19-03:00
reversa:
  version: "1.3.2"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
replaces: "edição de 2026-09-09 (0 deviations), preservada em migration/.backup-20260922-122055/"
hash: "sha256:c9bab70b43a8ae67a102cdfe2305d2804a098fab66ed2ec326a01e8bea38f7c8"
---

# Screen Deviation Log

> Registro de toda divergência entre o legado e a spec gerada em `target_screens.md`. Append-only. Deviations pendentes bloqueiam o handoff ao Inspector.
> Deviations aprovadas são propagadas para `parity_specs.md § Exceções` quando o Inspector rodar.

## Convenções

- **ID**: `DEV-NNN` (sequencial, três dígitos).
- **Tipo**: `tecnica` | `modernizacao` | `plataforma` | `correcao`.
- **Aprovação**: `pendente` | `aprovado` | `rejeitado`.

## Resumo

- **Total**: 7
- **Pendentes**: **0** — DEV-005 foi resolvido por evidência de código em 2026-09-22
- **Aprovadas**: 7
- **Rejeitadas**: 0

> **Por que esta edição deixou de ter zero deviations.** A de 2026-09-09 tinha zero porque o modo é literal na mesma plataforma e nenhuma re-expressão visual foi introduzida — o que continua verdade. As deviations abaixo não vêm de re-expressão: vêm da **captura dourada**, que passou a existir em 2026-09-22. É a captura que revela (a) limites do próprio conjunto de imagens e (b) uma divergência entre a imagem e o que a extração afirmava sobre uma tela.

## Entradas

### DEV-001

| Campo | Valor |
|---|---|
| Tela afetada | Todas as 23 capturas (conjunto) |
| Tipo | `tecnica` |
| Descrição | O conjunto de goldens é heterogêneo: **5 larguras distintas** (1314, 1443, 1460, 1623, 1732), **15 alturas distintas**, seis capturas de **página inteira** (1190 a 1815 px) e uma **montagem com rolagem** (`modal-detalhe-agendamento.png`, com o cabeçalho do app no meio da figura). As `normalizationRules` do manifest não normalizam viewport, resolução nem recorte de página. |
| Motivo | As capturas foram feitas manualmente pelo usuário, tela a tela, sem viewport fixo — e são a única referência visual do legado que existe no repositório. Recapturar tudo em viewport padronizado foi oferecido e **recusado** em 2026-09-22. |
| Origem no legado | `_reversa_sdd/screens/golden/` (23 arquivos) |
| Implicação para parity tests | **Comparação pixel a pixel está fora de escopo.** Os cenários PT-V01…PT-V16 comparam a **especificação construtiva** (tela existe, mesmos componentes, mesmos textos, mesma hierarquia, mesmos estados), não bytes de imagem. Qualquer teste futuro de pixel precisará de recaptura com viewport fixo. |
| Aprovação | `aprovado` |
| Aprovado por | Adriano (decisão de sessão: "aceitar o conjunto misto e declarar paridade semântica") |
| Aprovado em | 2026-09-22T12:26:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-002

| Campo | Valor |
|---|---|
| Tela afetada | Todas as 23 capturas (conjunto) |
| Tipo | `tecnica` |
| Descrição | O template de manifesto sugere, para alvo web, golden em **`.html` + `.css` snapshot**. As capturas entregues são **PNG**. |
| Motivo | O usuário capturou imagens de tela do app legado em execução; não houve snapshot de DOM/CSS. O PNG é aceito pelo template (`format: png`) e é o que existe. |
| Origem no legado | `_reversa_sdd/screens/golden/*.png` |
| Implicação para parity tests | Sem snapshot de DOM/CSS não é possível diff estrutural automatizado de markup; a verificação de hierarquia/tokens continua **descritiva**, ancorada em `target_screens.md` e em `<unit>/screens.md`. |
| Aprovação | `aprovado` |
| Aprovado por | Adriano (mesma decisão de DEV-001) |
| Aprovado em | 2026-09-22T12:26:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-003

| Campo | Valor |
|---|---|
| Tela afetada | Logs de Acesso (`logs-acesso.png`, PT-V13) |
| Tipo | `tecnica` |
| Descrição | A captura é de **página inteira com 15029 px de altura** e traz **254 registros** de uma massa viva, além de KPIs que derivam desses registros (Total 254 / Visualizações 65 / Logins 9 / Exclusões 0). Nem o número de linhas nem os valores dos KPIs são estáveis entre execuções. |
| Motivo | A tela é uma tabela longa sem paginação (paridade congelada por AMB-004); a captura integral era a forma natural de documentá-la. |
| Origem no legado | `logs-acesso/screenshots/tela_logs_acesso.png` |
| Implicação para parity tests | O golden vale como referência **estrutural** (colunas Data/Hora, Usuário, Ação, Paciente, Detalhes; selos de ação; KPIs no topo; ausência de paginação). O **conteúdo das linhas não é contrato**. Recaptura em viewport com massa fixa é recomendada se a paridade visual desta tela for exigida. |
| Aprovação | `aprovado` |
| Aprovado por | Adriano (mesma decisão de DEV-001) |
| Aprovado em | 2026-09-22T12:26:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-004

| Campo | Valor |
|---|---|
| Tela afetada | Detalhe do Paciente (`paciente-detalhe.png`, PT-V14) |
| Tipo | `tecnica` |
| Descrição | A tela saiu de **`nonDeterministic`** (manifest de 2026-09-09) para **`present: true`**. A timeline do histórico depende de dados do seed e a captura fixa uma massa específica (6 agendamentos, com duas datas de 17/09 e duas de 12/01 e duas de 09/01). |
| Motivo | Havia captura disponível; manter a tela fora do manifest quando existe imagem seria perder a referência. |
| Origem no legado | `pacientes/screenshots/tela_informacoes_paciente.png` |
| Implicação para parity tests | A captura desta tela **não** serve para comparar conteúdo de timeline; serve para header, selos (ativo/O+/LGPD), card de informações, ações e conjunto de abas. A massa do golden é a da captura, não a do seed canônico. |
| Aprovação | `aprovado` |
| Aprovado por | Adriano (mesma decisão de DEV-001) |
| Aprovado em | 2026-09-22T12:26:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-005 (resolvido em 2026-09-22 — ver Resolução ao fim do bloco)

| Campo | Valor |
|---|---|
| Tela afetada | Novo Agendamento (`agendamentos-novo.png`, PT-V05) |
| Tipo | `tecnica` |
| Descrição | **Divergência entre a captura e a extração, não resolvida.** A captura mostra o formulário com apenas duas seções — "Paciente e Médico" (Paciente*, Médico*) e "Detalhes" (Tipo de Consulta, Observações) — e **nenhum campo de data ou horário**. A extração (`_reversa_sdd/agendamentos/screens.md`, seção anterior à captura) descreve um **widget de calendário interativo (date picker embutido)**; `target_screens.md` desta tela especifica uma `DateTimeSection` com esse widget (Q-03); e o cenário PT-V05 pressupõe data/hora no formulário. |
| Motivo (da pendência) | Duas leituras possíveis, com consequências opostas para o codificador: **(a)** o campo não existe nesta revisão da tela e a data/hora é definida apenas por clique na grade do calendário — então a spec está errada e o formulário do alvo não deve ter date picker; **(b)** a captura cortou/omitiu a seção — então a spec está certa e a captura precisa ser refeita. **Nenhuma evidência adicional no repositório decide entre as duas.** |
| Origem no legado | `agendamentos/screenshots/tela_novo_agendamento.png` × `src/pages/NewAppointment.jsx` |
| Implicação para parity tests | Enquanto pendente, o PT-V05 tem um objeto de verificação indefinido: não se sabe se o alvo deve exibir campo de data/hora. **Bloqueia o handoff ao Inspector.** |
| Aprovação | `aprovado` |
| Aprovado por | Evidência de código (`src/pages/NewAppointment.tsx:204-237`, leitura read-only), confirmada pelo usuário |
| Aprovado em | 2026-09-22T12:45:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

**Resolução (2026-09-22) — o código legado decide: a seção existe e é condicional.**

- **Evidência**: `src/pages/NewAppointment.tsx:204` abre `{formData.doctor_id && (` e fecha em `:237`, envolvendo o Card **"Data e Horário"**; dentro dele, `<Calendar mode="single" … disabled={(date) => date < new Date()} />` (`:215-221`) e `<TimeSlotPicker …>` (`:225-231`), este último dentro de `{selectedDate && (` (`:224`). Ou seja: **a seção só renderiza quando há médico selecionado, e a grade de horários só depois de a data ser escolhida.**
- **Por que a captura não a mostra**: o formulário foi capturado com "Selecione o médico" em branco — o estado inicial legítimo. Nada foi cortado.
- **Consequência para o codificador**: **a spec estava certa.** O formulário do alvo DEVE ter a seção "Data e Horário", preservando a mesma condicionalidade. Não implementar como campo sempre visível.
- **Consequência para o golden**: `agendamentos-novo.png` está correto para o estado inicial e **deveria ser complementado** com uma captura pós-seleção (médico + data escolhidos), que é a que exibe o widget. Não é defeito de layout.
- **Recaptura entregue em 2026-09-22 às 12:47** (`tela_novo_agendamento_escolhido.png`, 1443×1152): passou a ser o **golden principal do PT-V05**, por ser a única imagem que mostra a seção condicional — calendário com o dia 24 escolhido, painel "Horários Disponíveis" (14:00 a 17:30, 14:30 selecionado) e o botão "Confirmar Agendamento" habilitado. A captura anterior (estado inicial) fica como estado alternativo. A ausência dela no golden anterior era, portanto, apenas do estado do formulário.
- **Confirmado no mesmo arquivo**: o botão "Confirmar Agendamento" desabilita sem `patient_id`/`doctor_id`/`date` (`:283`) — explica o tom claro na captura; e "Tipo de Consulta" tem **quatro** opções (`primeira_consulta`, `retorno`, `exame`, `procedimento`, `:256-259`), das quais a captura mostra só o default.

### DEV-006

| Campo | Valor |
|---|---|
| Tela afetada | Calendário de Agendamentos (`agendamentos-calendario.png`, PT-V04) |
| Tipo | `tecnica` |
| Descrição | As **cores da legenda de status** divergem entre o que a extração descrevia (`agendamentos/screens.md`, versão de 2026-08-27: "Em Atendimento (roxo)", "Concluído (verde)") e o que a captura mostra (Em Atendimento **verde**, Concluído **cinza-esverdeado**). |
| Motivo | A descrição anterior da tela veio de inferência, não de captura. A imagem é observação direta. |
| Origem no legado | `agendamentos/screenshots/tela_agendamentos_calendario.png` (rodapé da grade) |
| Implicação para parity tests | Em modo **literal**, prevalece o observado: a legenda do alvo deve reproduzir as cores da captura. Se as cores observadas não tiverem token no design-system, o codificador deve abrir deviation própria em vez de improvisar (regra 3 do Screen Translator). |
| Aprovação | `aprovado` |
| Aprovado por | Regra do modo literal (a captura é o artefato-fonte; nenhuma decisão humana necessária) |
| Aprovado em | 2026-09-22T12:34:19-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-007

| Campo | Valor |
|---|---|
| Tela afetada | Modal: Criar / Editar Template (`templates-novo.png` e `templates-modal.png`, PT-V16) |
| Tipo | `tecnica` |
| Descrição | Existem duas capturas do mesmo dialog em modos diferentes, e a do **modo criação está truncada** antes dos toggles "Template padrão"/"Ativo" e dos botões "Cancelar"/"Salvar". O golden do PT-V16 é o **modal de edição** (`templates-modal.png`), único que mostra o dialog inteiro. |
| Motivo | O PT-V16 cobre criar **e** editar num único cenário; usar a captura parcial como golden deixaria os toggles e as ações sem referência visual. |
| Origem no legado | `templates/screenshots/tela_novo_templates.png` (parcial) × `templates/screenshots/tela_editar_template.png` (completo) |
| Implicação para parity tests | A verificação dos toggles e botões usa a captura de edição. Se a paridade do **estado de criação** for exigida, é preciso nova captura — a atual não cobre o rodapé do modal. |
| Aprovação | `aprovado` |
| Aprovado por | Regra do Screen Translator (golden principal = captura completa) |
| Aprovado em | 2026-09-22T12:34:19-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

## Telas com mais de uma deviation

| Tela | IDs |
|---|---|
| Conjunto de golden files (todas as telas) | DEV-001, DEV-002 |
| Novo Agendamento | DEV-005 |
| Calendário de Agendamentos | DEV-006 |
| Logs de Acesso | DEV-003 |
| Detalhe do Paciente | DEV-004 |
| Modal: Criar / Editar Template | DEV-007 |

## Notas

- **Zero deviations de re-expressão visual**: o modo escolhido continua sendo **literal na mesma plataforma** (`react-hooks` → `web-spa` React + TS). Nenhuma tela foi redesenhada; nenhuma string foi reescrita; nenhum token foi trocado. As 7 deviations acima são sobre o **conjunto de referências** e sobre uma divergência de extração, não sobre escolhas de design do alvo.
- **Itens pré-existentes do legado que NÃO são deviations de tela** (já tratados em `target_business_rules.md`/`ambiguity_log.md`, fora do escopo desta migração):
  - Paginação de Logs de Acesso (limite 500 sem paginação) — AMB-004, paridade **confirmada pela captura** (não há rodapé de paginação na imagem).
  - Taxa de Atendimento `94%` mock — AMB-001, paridade (visível na captura do Dashboard).
  - Interpolação de templates sem escape HTML (XSS) — AMB-006, referido à codificação (não corrigir).
  - Divergência seed offline (`file_url: ''`, AccessLog sem user_email real) — tratada em `target_data_model.md`.
- **Massa de dados divergente entre capturas**: a mesma paciente (Neide Ferreira) aparece com 30 anos, telefone (79) 99917-9068 e e-mail `neide.ferreira@hotmail.com` na listagem, e com 50 anos, (79) 99917-9999 e `neidefs@hotmail.com` no detalhe. **Não é deviation de tela** — é divergência de massa entre execuções. Registrada em `pacientes/screens.md` com o alerta de não usar as duas capturas como oráculo cruzado.
- **EC-11 aplicado**: eventuais typos visuais do legado são **preservados** em modo literal (sem correção). Nenhum typo específico foi catalogado.
- Caso o agente de codificação encontre divergência visual ao converter (ex.: componente shadcn indisponível), deve **abrir DEV-008** aqui e pausar — nunca improvisar layout.
- **Rastreabilidade das imagens**: cada golden tem `sha256`, `capturedAt`, `parityScenario` e `sourceCapture` (caminho do arquivo original entregue pelo usuário) no `manifest.yaml`. As capturas originais em `<unit>/screenshots/` **não foram movidas nem alteradas**.

---
*Gerado pelo Reversa-Screen-Translator em 2026-09-22 (Fase 2 regenerada por `/reversa-migrate --regenerate=screen_translator:generation`).*
