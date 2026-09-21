# Regression Watch: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-21`
> Nota: esta feature **não alterou nenhuma regra de negócio, contrato de dados ou
> comportamento observável**. Os itens abaixo não são regressões a evitar, e sim
> **propriedades que precisam continuar verdadeiras** — tanto os comportamentos que a
> prova passou a fixar quanto a própria prova. Ver `legacy-impact.md#Modificadas`.
>
> ⚠️ **Os identificadores `W00x` reiniciam a cada feature.** A feature 001 usa `W001` a
> `W009`; a feature 002 usa `W001` a `W008`; esta usa `W001` a `W011`. Uma citação nua não
> resolve — **toda referência a um watch item precisa nomear a feature de origem**. É a
> mesma disciplina que a RN-07 impõe às duas famílias `BR-A0x`, e a matriz já pagou o
> preço de não a seguir: citava `W009` sem qualificação, e `W009` só existe na feature 001.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/code-analysis.md#4.1 Cálculo de Slots Disponíveis` | A grade de horários parte do início do expediente, em passos da duração, e **o último horário pode terminar depois do fim** — o laço só confere se o horário começa antes | `presença` | Alguém "corrige" o laço para exigir que o horário caiba na duração; a verificação de 17:45 com duração de 45 minutos passa a falhar (RF-01, RN-03) |
| W002 | `_reversa_sdd/code-analysis.md#4.2 Verificação de Conflito de Horário` | A janela de conflito é **pontual**: só bloqueia quando o horário do novo atendimento cai dentro do intervalo do existente | `presença` | Sobreposição por duração maior passa a ser detectada — RN-04 e o cenário PT-003 deixam de valer, e a decisão de preservar o comportamento cai junto |
| W003 | `_reversa_sdd/code-analysis.md#3.4 TimeSlotPicker — Disponibilidade` | Dia sem horário gerado exibe ao usuário a mensagem própria `"Médico não atende neste dia"` | `presença` | A mensagem some ou muda de texto; a verificação de dia fora da jornada falha **pelo motivo errado** e a prova deixa de distinguir "sem horário" de "tela quebrada" |
| W004 | `_reversa_sdd/agendamentos/requirements.md#2` (BR-A03) e decisão D-12 da feature `001-migracao-typescript` | O ciclo de status permanece **manual**: concluir a consulta vinculada não transiciona o agendamento | `presença` | Surge transição automática. PT-004.2 e a decisão D-12 caem juntas, e o cenário passa de vacuidade declarada a falso |
| W005 | `_reversa_sdd/code-analysis.md#4.5 Envio de E-mail de Confirmação` | O e-mail de confirmação é solicitado **antes** da confirmação de sucesso da gravação, e a falha dele deixa o registro gravado sem feedback | `presença` | `SendEmail` passa a ser disparado dentro de `onSuccess` ou depois da navegação — RF-05 e RN-05 deixam de valer, e a ordem deixa de ser a provada |
| W006 | `_reversa_sdd/code-analysis.md#3.2 Criação de Agendamento` | O salvamento **não revalida** o horário escolhido: o portão exige apenas paciente, médico e data | `presença` | Passa a existir validação de jornada ou de conflito no salvamento. É mudança de comportamento observável, e exige decisão explícita — não pode entrar como refatoração silenciosa |
| W007 | `_reversa_sdd/code-analysis.md#3.4 TimeSlotPicker — Disponibilidade` | Médico sem `working_hours` cai na janela padrão de 08:00 às 18:00; a ausência de `working_days` é que produz agenda vazia | `presença` | O fallback de janela muda ou desaparece — o médico volta a ficar invisível na agenda sem erro nenhum (lacuna #7 de `code-analysis.md#9`) |
| W008 | `src/test/appointmentsFixtures.ts` | A massa de prova deriva as datas do relógio real usando o **construtor local**, nunca a partir de string de data | `presença` | Reaparece `new Date('AAAA-MM-DD')` na massa. A string é lida em UTC e `getDay()` é local: num fuso a oeste de Greenwich a prova passa a medir outro dia, **em silêncio** |
| W009 | `_reversa_sdd/code-spec-matrix.md#Módulo Agendamentos` | Toda promessa do módulo citada na matriz aponta para verificação existente, e todo identificador de regra vem **qualificado pelo artefato de origem** | `presença` | Citação volta a usar `BR-A0x` nu, ou aponta arquivo removido, renomeado ou que perdeu a verificação — a terceira testemunha passa a mentir (RF-06, RN-07) |
| W010 | `src/pages/Appointments.tsx`, `src/pages/NewAppointment.tsx`, `src/components/appointments/*`, `base44/entities/*.jsonc` | Nenhum arquivo de aplicação do módulo nem schema de entidade é alterado | `ausência` | Qualquer diff nesses caminhos. A regra de ouro do diff foi violada: a prova passou a alterar o que deveria observar (RF-10, RN-06) |
| W011 | `_reversa_sdd/code-spec-matrix.md#Lacunas declaradas do módulo de Agendamentos` | As lacunas declaradas do módulo continuam declaradas, cada uma com severidade e razão | `presença` | Lacuna some da lista sem ter sido fechada por prova, ou o veredito passa a 🟢 sem verificação que o sustente — ausência de prova disfarçada de cobertura (RF-07) |

## Histórico de re-extrações

(Nenhuma ainda.)

## Arquivadas

(Nenhuma.)

## Observações

Sem peso de regressão — defeitos declarados, divergências conhecidas e decisões
estruturais registradas para contexto:

- **DEFEITO REAL, NÃO CORRIGIDO — envio acidental do formulário de agendamento.** O botão
  do seletor de horário não declara `type`, e o componente compartilhado
  (`src/components/ui/button.jsx`) não impõe padrão. Dentro do formulário, um botão sem
  `type` é `submit`: **escolher o horário aciona a gravação antes de o usuário confirmar**.
  Confirmado por leitura (`NewAppointment.tsx` — `<form>` nas linhas 160 e 299,
  `<TimeSlotPicker>` na 225, botão de cancelar com `type="button"` na 278 e o de horário
  sem `type`). A prova desta feature **isola** o defeito em vez de depender dele: prova que
  quebra quando o defeito é consertado é prova ruim. Decisão de escopo: declarar, e corrigir
  em feature própria.
- **DEFEITO REAL, NÃO CORRIGIDO — falha de e-mail totalmente silenciosa.** `saveMutation`
  em `NewAppointment.tsx` não tem `onError`. Se o envio falha, o agendamento fica gravado,
  o usuário não recebe aviso nenhum, não é redirecionado e o formulário continua
  preenchido. A prova de RF-05 documenta o desfecho; não o conserta.
- **DEFEITO REAL, NÃO CORRIGIDO — horário obsoleto continua gravável.** `formData.date`
  nunca é descartado quando o médico ou a data mudam. O usuário pode gravar um horário que
  a própria tela mostra como indisponível. Provado em `NewAppointment.test.tsx`, nos dois
  casos de "não revalida".
- **Vacuidade declarada do cenário PT-004.2.** `consultation_id` existe no schema mas
  **nada no sistema o lê ou escreve**, e `Consultation` não tem `appointment_id`. Não há
  caminho de código que ligue consulta a agendamento, então a verificação é guarda de
  regressão, não fluxo exercitado. Consequência direta da lacuna #5 (severidade Alta).
- **Divergência spec × código em DUAS fontes documentais.** A BR-A02 de
  `_reversa_sdd/domain.md#2.2` (🟡 inferida) afirma sincronia automática de status; o
  `_reversa_sdd/architecture.md#1`, fluxo 4, afirma o mesmo. Corrigir só o `domain.md`
  deixaria a extração mentindo no outro. Nenhum dos dois foi corrigido aqui.
- **`_reversa_sdd/architecture.md#1`, fluxo 2** afirma que mudar o agendamento para
  `em_atendimento` **cria** a `Consultation`. Nenhum código faz isso.
- **Redação imprecisa de dois cenários de paridade.** PT-003.1 diz "rejeitado com
  indicação de horário indisponível" e PT-003.3 diz "slot que não cabe na duração é
  rejeitado". Nenhuma das duas corresponde ao sistema: não há recusa no salvamento, e o
  caso do PT-003.3 confere por coincidência da grade, não por validação. A prova segue o
  código. Corrigir os `.feature` é trabalho da extração.
- **Contagem divergente das lacunas do módulo.** `code-analysis.md#9` tem **11 linhas**; o
  `requirements.md` desta feature fala em **dez** e enumera nove em §10. A matriz dá
  veredito às onze. O defeito é documental e continua aberto.
- **Instabilidade sob carga em `PatientForm.test.tsx`.** Roda perto do limite de 5 s por
  verificação e já estourou de forma intermitente com a suíte em paralelo. Não se
  reproduziu nas medições desta rodada. Mitigação disponível: elevar `testTimeout` no
  `vitest.config.ts` — caminho hoje **fora** de `allowedPaths`, e a alteração depende de
  decisão humana.
- **Prova de encoding sem dono no ciclo forward.** `src/test/mojibake.mjs`,
  `src/test/mojibake.test.mjs` e `.github/workflows/guarda-encoding.yml` existem e passam
  (8 verificações), mas nasceram no commit `ea87955` fora do `actions.md` de qualquer
  feature. Não há `requirements.md` que os prometa. Regularizar é trabalho de feature
  própria.
- **Divergência entre as duas visões de disponibilidade.** O calendário semanal usa grade
  fixa de 8h às 19h, independente da jornada do médico, enquanto a seleção de horário
  respeita a jornada. Declarada, sem prova — 🟡 por origem, e por isso fora do watch
  principal.
- **Paridade visual das telas do módulo.** Permanece sem prova enquanto a captura dourada
  de referência não existir no repositório. Declarada, não provável hoje — 🔴.
- **Restrição de ambiente.** A suíte exige acesso ampliado para subir neste ambiente: o
  esbuild do vitest abre pipe nomeado e falha com `spawn EPERM` nos dois modos confinados.
  Não é defeito do projeto. O comando de verificação negativa (que criaria
  `src/__negative_checks__/`) tem a mesma restrição.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
