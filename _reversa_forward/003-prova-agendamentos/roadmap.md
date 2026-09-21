# Roadmap: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Requirements: `_reversa_forward/003-prova-agendamentos/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Provar o módulo de Agendamentos **onde cada promessa de fato vive**. O cálculo de
disponibilidade é uma função pura dentro de um componente que recebe tudo por prop e não
consulta nada: a prova o renderiza direto, com médicos e agendamentos construídos no
próprio arquivo, e mede os três comportamentos distintos que a sessão de esclarecimentos
separou — horário **não gerado**, horário **gerado e desabilitado**, e a mensagem de dia
sem atendimento. O ciclo de status não existe fora do diálogo da tela de listagem: a prova
monta a tela, abre o diálogo, transiciona e confere a gravação. A criação de agendamento
ganha prova da ordem entre o envio de e-mail e a confirmação de gravação. Nenhum arquivo
de aplicação é tocado: a feature acrescenta três arquivos de prova e atualiza a matriz de
rastreabilidade. O relógio é controlado **apenas** onde o valor decide o resultado — o
filtro de próximos agendamentos e o calendário de datas passadas —, e fixado nos demais.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto — nenhum princípio formal foi
registrado, e portanto nenhum conflito a declarar. Os compromissos que fazem as vezes de
princípio vêm do legado e são respeitados:

| Compromisso herdado | Como a feature se relaciona | Status |
|---------------------|------------------------------|--------|
| Regra de ouro do diff: schemas de entidade intocados (`_reversa_sdd/architecture.md#1. Visão Resumida`) | A prova substitui o backend por dublê e nunca escreve em `base44/entities/` | respeita |
| Paridade de comportamento observável (`_reversa_sdd/addenda/001-migracao-typescript.md#Vigência`) | Nenhum arquivo de aplicação é alterado por esta feature | respeita |
| Congelamentos deliberados: transição manual de status e ausência de gatilho automático (`_reversa_sdd/agendamentos/requirements.md#2. Regras de Negócio (BRs)`, BR-A03) | A prova **afirma** a ausência de automação, em vez de tratá-la como defeito | respeita |
| A prova observa, não altera (`_reversa_sdd/addenda/002-prova-automatizada.md#Vigência`) | As dez lacunas do módulo entram como veredito declarado, sem conserto | respeita |

> Se o projeto quiser princípios formais, `/reversa-principles` é o skill próprio — este
> plano não os cria nem os atenua.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A prova da disponibilidade é feita **renderizando o componente de seleção de horário diretamente**, com médicos e agendamentos construídos como objeto no arquivo de prova | `src/components/appointments/TimeSlotPicker.tsx` recebe tudo por prop, não consulta dados e não usa roteador: é o maior valor de prova pelo menor custo e pela menor fragilidade | a) provar pela tela de criação inteira — mais realista, muito mais caro e dependente do calendário; b) extrair a função de geração de horários para um módulo próprio — mudança de estrutura, proibida pela RN-06 | 🟢 |
| D-02 | A prova do ciclo de status é feita **pela tela de listagem**, abrindo o diálogo, acionando a transição e conferindo a gravação | As transições existem apenas no diálogo de `src/pages/Appointments.tsx`; não há componente isolado. Provar só a mutação não provaria que a transição é **manual na interface**, que é exatamente o que o cenário PT-004 afirma | a) provar apenas a chamada de atualização — não cobre a promessa; b) provar pelo calendário semanal — o diálogo é o mesmo, e o calendário acrescenta fragilidade de grade | 🟢 |
| D-03 | O relógio do sistema é **controlado** nas verificações em que o valor decide o resultado (filtro de próximos agendamentos e desabilitação de datas passadas) e **fixado por data explícita** nas demais | É a decisão de determinismo da feature 002 aplicada: sem controle, a verificação do filtro de próximos quebraria na virada do dia | a) usar apenas datas distantes no futuro — funciona hoje e vira bomba-relógio; b) congelar o tempo em toda a suíte — conflita com as esperas assíncronas de interface | 🟡 |
| D-04 | O seletor de status é exercitado com **dublê do módulo de seleção**, no padrão já adotado em `PatientForm.test.tsx` | Aprendizado registrado na feature 002: o seletor real renderiza em portal e levava o `userEvent` a estourar o tempo limite no DOM simulado | a) abrir o seletor real — já falhou uma vez, com 66 s até o limite; b) acionar os botões de confirmar e cancelar sem passar pelo seletor — cobriria duas das transições e deixaria a terceira sem prova | 🟢 |
| D-05 | O envio de e-mail é substituído por dublê, e a prova mede a **ordem** entre envio e confirmação de gravação | RF-05; é o que produz o estado inconsistente hoje descrito em `_reversa_sdd/code-analysis.md#4.5 Envio de E-mail de Confirmação` | a) provar só que o e-mail é solicitado quando o paciente tem e-mail — não cobre a ordem, que é a promessa; b) deixar a integração real — exigiria rede | 🟢 |
| D-06 | A prova do módulo vive em **três arquivos novos**, um por preocupação: disponibilidade, ciclo de status e criação | Cada arquivo corresponde a uma promessa distinta e a um artefato distinto do legado, o que mantém a falha legível (RNF Observabilidade) | a) um arquivo único para o módulo — falha deixa de apontar a promessa; b) espalhar por arquivos existentes de outros módulos — mistura responsabilidades | 🟢 |
| D-07 | As **dez lacunas** do módulo entram na matriz como veredito declarado, com razão e destino, e **sem arquivo de prova** | Decisão da sessão de esclarecimentos de 2026-09-19; corrigi-las ou prová-las sai do escopo desta feature | a) provar as duas de severidade Alta — exigiria cenários que os 8 de paridade não cobrem; b) omiti-las da matriz — a ausência de prova se disfarçaria de cobertura | 🟢 |
| D-08 | A divergência entre o calendário semanal (grade fixa de 8h às 19h) e a seleção de horário (jornada do médico) fica **declarada como lacuna**, sem prova | Decisão da sessão de esclarecimentos; o calendário é visão de agenda, não de disponibilidade | a) provar a divergência — amplia escopo para fora dos 8 cenários; b) alinhar o calendário à jornada — muda comportamento observável | 🟢 |
| D-09 | O diretório `interfaces/` **não é criado** | A feature exercita a integração de e-mail, mas não redefine seu contrato: a assinatura, o formato e o tratamento de erro permanecem os do legado | a) documentar o contrato de e-mail — seria inventário de contrato inalterado, não delta | 🟢 |
| D-10 | O teto de 90 segundos é **revalidado ao final**, e não renegociado | Decisão da sessão de esclarecimentos; há folga de mais de 50 segundos sobre a medição anterior | a) subir o teto preventivamente — enfraqueceria o requisito sem medição que o justifique | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` chegou ao plano com **zero** marcadores `[DÚVIDA]` — as cinco
questões abertas foram resolvidas na sessão de esclarecimentos de 2026-09-19 e estão
registradas em `_reversa_forward/003-prova-agendamentos/requirements.md#9. Esclarecimentos`.

## 5. Delta arquitetural

Componentes do legado que mudam. O restante da arquitetura descrita em
`_reversa_sdd/architecture.md` permanece intocado.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de prova do módulo de Agendamentos | `_reversa_sdd/inventory.md#Módulos identificados` | `componente-novo` | Três arquivos de verificação: disponibilidade, ciclo de status e criação com envio de e-mail. O módulo não tinha nenhuma prova de execução |
| Matriz de rastreabilidade | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do módulo Pacientes` | `regra-alterada` | Ganha a seção equivalente para o módulo de Agendamentos, com veredito por promessa, destino dos 8 cenários e as dez lacunas declaradas |
| `_reversa_sdd/code-spec-matrix.md` | `_reversa_sdd/code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` | `regra-alterada` | O grupo "Agendamentos (8)" deixa de estar endereçado a uma feature a criar e passa a ter prova |

### 5.1 Arquivos do legado tocados

Rascunho para o `legacy-impact.md` do `/reversa-coding`:

| Arquivo | Natureza do toque |
|---------|-------------------|
| `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` | Arquivo novo |
| `src/pages/__tests__/Appointments.test.tsx` | Arquivo novo |
| `src/pages/__tests__/NewAppointment.test.tsx` | Arquivo novo |
| `_reversa_sdd/code-spec-matrix.md` | Seção do módulo, destino e lacunas |
| `src/pages/Appointments.tsx`, `src/pages/NewAppointment.tsx`, `src/components/appointments/*` | **Intocados** |
| `base44/entities/*.jsonc` | **Intocado** — regra de ouro |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. Não há campo, entidade, índice ou migração. O schema de `Appointment` permanece como está.
- O único dado introduzido é **massa de prova fictícia** dentro dos arquivos de verificação: médicos com jornadas construídas para exercitar cada caso de borda, pacientes e agendamentos inventados.
- Detalhe completo em: `_reversa_forward/003-prova-agendamentos/data-delta.md`

## 7. Delta de contratos externos

**Nenhum contrato externo é criado, alterado ou removido.** A integração de envio de
e-mail é exercitada pela prova — para verificar a **ordem** entre o envio e a confirmação
de gravação —, mas sua assinatura, seu formato e seu tratamento de erro permanecem os do
legado.

Por essa razão, o diretório `interfaces/` **não é criado** (D-09), conforme a regra do
`/reversa-plan`.

## 8. Plano de migração

Não há migração de dados nem de contrato. A sequência abaixo é a ordem de execução:

1. Provar a disponibilidade no componente de seleção de horário, cobrindo os três comportamentos distintos e o conflito (D-01).
2. Provar o ciclo de status pela tela de listagem, com o seletor dublado (D-02, D-04).
3. Provar a criação e a ordem entre envio de e-mail e confirmação de gravação (D-05).
4. Estender a matriz com o veredito do módulo, o destino dos 8 cenários e as dez lacunas (D-07, D-08).
5. Revalidar o teto de desempenho e convergir por adendo no `/reversa-sync` (D-10).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** O calendário da tela de criação é um componente de terceiro e depende do mês exibido, que por sua vez depende do relógio — a prova pode ficar frágil ou lenta | médio | alta | D-03: o tempo é controlado, o que fixa o mês exibido. Se ainda assim for frágil, a verificação da ordem do e-mail pode ser feita com a data preenchida por outra via, sem abrir mão da promessa |
| **R-02** As dez lacunas ficam declaradas e duas delas têm severidade **Alta** na extração: concorrência na criação simultânea e ausência de auto-vínculo da consulta | alto | certa | É consequência aceita da decisão de escopo. O RF-07 obriga a matriz a nomeá-las, então elas não se disfarçam de cobertura. Registrado aqui para que a decisão seja revisitável |
| **R-03** Provar a **ausência** de gatilho automático é intrinsecamente frágil: a verificação passa enquanto ninguém introduzir a automação, e passa também se a asserção estiver mal escrita | alto | média | A verificação precisa afirmar o estado do agendamento **depois** de concluir a consulta, e não apenas que nada foi chamado — asserção positiva sobre o valor observável |
| **R-04** A prova do ciclo de status depende de diálogo e seletor de interface de terceiro, que já se mostraram frágeis no DOM simulado | médio | média | D-04 usa o dublê de seleção já validado na feature 002; o diálogo tem precedente funcionando em `PatientDetail.test.tsx` |
| **R-05** O teto de 90 segundos pode ser apertado por três arquivos novos de interface | médio | média | D-10 revalida ao final; se estourar, é decisão registrada, não ajuste silencioso |
| **R-06** A matriz pode divergir da suíte em silêncio | alto | média | RF-06 e o critério de pronto exigem conferência da matriz contra a suíte antes de fechar |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

Específicos desta feature:

- [ ] Os 4 cenários de jornada (PT-003) têm prova de execução, **fiéis ao comportamento do código** (RF-01)
- [ ] Os 4 cenários do ciclo de status (PT-004) têm prova de execução pela interface (RF-02)
- [ ] Os casos de borda da disponibilidade têm prova, incluindo a mensagem de dia sem atendimento (RF-03)
- [ ] O conflito de horário é provado como **gerado e desabilitado**, e a sobreposição por duração maior como não detectada (RF-04)
- [ ] A ordem entre envio de e-mail e confirmação de gravação tem prova (RF-05)
- [ ] A matriz cita toda regra com o artefato de origem qualificado (RF-06)
- [ ] As dez lacunas do módulo têm veredito declarado com razão (RF-07)
- [ ] Nenhum arquivo de aplicação do módulo foi alterado (RF-10)
- [ ] `base44/entities/` sem nenhum diff (regra de ouro)
- [ ] A suíte completa executa em menos de 90 segundos (RNF Desempenho)
- [ ] Existe adendo vigente ao final do ciclo (RF-11)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-19 | Versão inicial gerada por `/reversa-plan` | reversa |

---
*Gerado pelo Reversa-Plan em 2026-09-19.*
