# Actions: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Roadmap: `_reversa_forward/004-prova-consultas/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 14 |
| Paralelizáveis (`[//]`) | 3 |
| Maior cadeia de dependência | 8 elos |

> Esta feature **não** cria caminho novo de execução: a infraestrutura de prova existe desde
> a 002. O que ela acrescenta é uma massa de prova do módulo, três arquivos de verificação e
> a seção do módulo na matriz. E o caso negativo do tipo fechado (`RF-03`) **já existe**
> desde a feature 001 — é reaproveitado por citação, não reescrito (decisão D-05).

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar a massa de prova compartilhada do módulo — paciente ativo, consulta parametrizável por situação, consulta **sem** situação, as quatro situações como constantes nomeadas, derivadores de data a partir do **dia congelado** com construtor local, e as cargas de documento e de exame — para que os três arquivos de verificação usem a mesma massa e o mesmo critério temporal | - | - | `src/test/consultationsFixtures.ts` | 🟢 | [ ] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Provar o filtro por situação da listagem: cada situação exibe apenas os seus registros, e um registro **sem** situação não aparece em filtro específico nenhum — afirmando o conjunto exibido, e não a chamada do filtro | T001 | [//] | `src/pages/__tests__/Consultations.test.tsx` | 🟢 | [ ] |
| T003 | Provar os quatro recortes de intervalo de data da listagem, com o `Date` congelado e temporizadores reais (D-04), registrando que `upcoming` compara o **instante completo** | T002 | - | `src/pages/__tests__/Consultations.test.tsx` | 🟡 | [ ] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Provar a legenda de situação no detalhe, **incluindo a ausência**: o registro com situação exibe o rótulo correspondente e o registro sem situação não exibe legenda nenhuma, sem quebrar a tela | T001 | [//] | `src/pages/__tests__/Consultation.test.tsx` | 🟢 | [ ] |
| T005 | Provar a **ausência de transição automática**: emitir documento e anexar exame não movem a situação, afirmando o **valor** exibido depois de cada operação e não a ausência de chamadas (D-12) | T004 | - | `src/pages/__tests__/Consultation.test.tsx` | 🟢 | [ ] |
| T006 | Provar a **assimetria de auditoria no transporte** (D-02): com o mesmo observador, emitir documento **não** grava registro e anexar exame **grava**; a mesma verificação prova que o observador dispara, para que a ausência não seja confundida com arnês quebrado | T005 | - | `src/pages/__tests__/Consultation.test.tsx` | 🟢 | [ ] |
| T007 | Provar a situação inicial pelos **dois caminhos observáveis** — o formulário grava `em_andamento` e o modo edição cai em `em_andamento` quando o registro não tem situação (D-06) — e que o seletor oferece as **quatro** situações, inclusive de `cancelada` para `concluida` | T001 | [//] | `src/pages/__tests__/NewConsultation.test.tsx` | 🟢 | [ ] |
| T008 | Provar a troca de situação persistida: escolher `concluida` e salvar grava o novo valor, com releitura do armazém — afirmando o valor, não o formato da chamada | T007 | - | `src/pages/__tests__/NewConsultation.test.tsx` | 🟢 | [ ] |
| T009 | Provar o portão do salvamento — exige paciente e **não** exige data — e a ausência de envio acidental, com a contagem de gravações afirmada **antes** e **depois** do salvamento deliberado (D-09) | T008 | - | `src/pages/__tests__/NewConsultation.test.tsx` | 🟢 | [ ] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Estender a matriz com o veredito de prova de cada promessa do módulo de Consultas, citando **todo identificador de regra com o artefato de origem qualificado** — por causa das duas grafias de `BR-C` — e citando o caso `status-fora-do-conjunto` existente como prova do `RF-03`, sem duplicá-lo (D-05) | T006, T009 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [ ] |
| T011 | Registrar na matriz o destino dos 3 cenários de paridade do módulo, o saldo dos módulos restantes (26 → 23) e as **oito lacunas declaradas** com severidade e razão, incluindo as duas de severidade Alta e o achado de auditoria do `RF-17` | T010 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [ ] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Revalidar os quatro comandos de gate com o módulo provado e conferir que nenhum arquivo de aplicação do módulo nem schema de entidade foi tocado | T006, T009 | - | `_reversa_forward/004-prova-consultas/onboarding.md` | 🟢 | [ ] |
| T013 | Medir o tempo da suíte completa com o módulo provado e registrar o valor no roteiro, verificando o teto de 90 segundos | T012 | - | `_reversa_forward/004-prova-consultas/onboarding.md` | 🟢 | [ ] |
| T014 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados | T011, T012 | - | `_reversa_forward/004-prova-consultas/regression-watch.md` | 🟢 | [ ] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** As ações mexem em arquivo de prova, na massa de prova compartilhada e em artefato da extração. Se alguma ação parecer exigir mudança em `src/pages/Consultations.tsx`, `src/pages/Consultation.tsx`, `src/pages/NewConsultation.tsx` ou em `src/components/medical/`, algo saiu do escopo — pare e revise.
2. **`base44/entities/` intocado.** Regra de ouro do diff.
3. **`src/test/verificacoes-negativas.mjs` intocado.** O caso `status-fora-do-conjunto` já prova o `RF-03` desde a feature 001; a ação T010 apenas o **cita**. Escrever um segundo caso idêntico criaria dois pontos de verdade (D-05).
4. **A auditoria é medida no transporte, não no módulo (D-02).** A verificação de T006 deve deixar `AccessLogger` correr de verdade e dublar `base44.entities.AccessLog`. Se ela substituir o `logAccess`, mede o dublê e o achado desaparece — que é exatamente como o defeito passou despercebido até agora.
5. **A mesma verificação prova que o observador dispara.** Em T006, anexar exame **precisa** produzir registro. Se a espiã não disparar em nenhum dos dois fluxos, o arnês está quebrado, não o sistema — e a verificação tem de falhar por isso.
6. **Congele só o `Date` (D-04).** `vi.useFakeTimers({ toFake: ['Date'] })` mantém os temporizadores reais e não conflita com as esperas assíncronas de interface. Temporizadores falsos já custaram caro na feature 003; não repetir.
7. **Datas sempre por construtor local.** `new Date('AAAA-MM-DD')` é lido em UTC e `toDateString()` é local: num fuso a oeste de Greenwich a prova mediria outro dia sem avisar. A armadilha está documentada no cabeçalho da massa de prova da feature 003 e precisa estar na desta.
8. **O seletor de situação exige dublê de módulo (D-03).** Abrir o seletor real no DOM simulado já custou 66 segundos até estourar o limite, na feature 002. Reaproveitar o padrão de `PatientForm.test.tsx`.
9. **Provar ausência exige asserção positiva (D-09, D-12).** Para `RF-05`, afirmar o **valor** da situação depois. Para `RF-09`, afirmar a contagem **antes** e **depois** do salvamento deliberado. Asserção do tipo "nada foi chamado" passa mesmo quando a verificação não exercita o caminho certo — placebo com aparência de prova.
10. **Dois arquivos diferem por uma letra (R-02).** `Consultation.test.tsx` é o **detalhe**; `Consultations.test.tsx` é a **listagem**. Antes de editar, confira o cabeçalho `describe`, que nomeia a tela por extenso.
11. **A metade não provável do `RF-01` é declarada (D-06, §4.1 do roadmap).** O default `agendada` do schema é do servidor e não é observável no cliente. Ao dar veredito a esse cenário na matriz, a ressalva de que é **declaração** precisa acompanhá-lo; marcá-lo 🟢 sem ela é mentira.
12. **As oito lacunas declaram-se, não se provam (D-07).** T011 dá veredito e razão a cada uma, incluindo as duas de severidade Alta; nenhuma vira arquivo de verificação.
13. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente já registrada na nota 8 do `actions.md` das features 002 e 003.
14. **Marcador `[//]` só onde existe par.** Uma ação sozinha na fase não recebe `[//]`: o marcador diz "pode rodar junto com as irmãs", e sem irmã ele não informa nada. As features 002 e 003 aplicaram o marcador também a uma ação solitária da Fase 5 e **ajustaram o resumo para bater** — 4 declarados, 4 marcados, sem divergência. Aqui o resumo foi escrito com 3 e a tabela saiu com 4; a conferência pegou a diferença e a correção foi **remover o marcador da ação solitária**, e não inflar o resumo. Contagem conferida: **3 declarados, 3 marcados**.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-21` | Versão inicial gerada por `/reversa-to-do` | reversa |

---
*Gerado pelo Reversa-To-Do em 2026-09-21.*
