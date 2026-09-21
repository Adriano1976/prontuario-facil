# Data Delta: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-19`
> Base de comparação: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/` e
> `_reversa_sdd/erd-complete.md`

## 1. Veredito

**Nenhuma alteração de modelo de dados.** Não há campo novo, campo removido, campo com
tipo alterado, entidade nova, índice novo nem migração. A entidade `Appointment` mantém o
contrato atual — 8 campos de agendamento mais os campos de servidor —, e nada é escrito em
`base44/entities/`.

Consequência direta da RN-06 e do RF-10: a suíte **observa** o sistema, não o altera.

## 2. Diff conceitual

| Entidade | Campos | Situação |
|----------|--------|----------|
| `Appointment` | vínculos (`patient_id`, `doctor_id`, `consultation_id`), agendamento (`date`, `duration`), tipo, status, notas e flags de lembrete | sem alteração |
| `Doctor` | consumido pela prova (jornada, duração padrão), não alterado | sem alteração |
| `Patient` | consumido pela prova (seleção de ativo, e-mail), não alterado | sem alteração |
| `Consultation` | referenciada pelo cenário de ausência de gatilho automático, não alterada | sem alteração |

## 3. Dados que a feature introduz

Não são dados do sistema: são **massa de prova**, fictícia, dentro dos arquivos de
verificação. Nenhum registro real é reutilizado.

| Origem | Natureza | Para que serve |
|--------|----------|----------------|
| Médicos com jornadas construídas | Objeto literal, um por caso de borda | Exercitar janela padrão, janela explícita, jornada invertida, ausência de configuração e durações diferentes |
| Agendamentos existentes fictícios | Objeto literal com data e duração | Exercitar conflito pontual e a sobreposição por duração maior que **não** é detectada |
| Pacientes fictícios | Objeto literal, um ativo e um sem e-mail | Exercitar a seleção de ativo e a ausência de envio |
| Agendamento em atendimento com consulta vinculada | Objeto literal | Provar que concluir a consulta não transiciona o agendamento |

### 3.1 Datas e o relógio

O módulo é o primeiro do projeto em que **o valor do relógio decide resultado** em dois
pontos: o filtro de próximos agendamentos compara o instante completo com o agora, e o
calendário da tela de criação desabilita datas anteriores a hoje.

Por isso a prova controla o tempo nesses dois pontos e usa datas explícitas nos demais
(D-03 do `roadmap.md`). Sem esse cuidado, duas consequências reais:

| Sem controle | O que acontece |
|--------------|----------------|
| Filtro de próximos | A verificação que fixa uma data futura passa a falhar sozinha no dia em que essa data chegar |
| Calendário de criação | O mês exibido muda com o passar do tempo, e a verificação que clica em um dia específico deixa de encontrá-lo |

Este é o ponto mais provável de produzir resultado intermitente nesta feature, e o único
de natureza temporal.

## 4. Migrações necessárias

**Nenhuma.** Não há script de migração, reescrita de registro nem realinhamento de massa.

O que existe é um **delta de documentação**, que não é migração de dados:

| Artefato | Situação |
|----------|----------|
| `_reversa_sdd/code-spec-matrix.md` | Passa a registrar o veredito do módulo de Agendamentos, o destino dos 8 cenários e as dez lacunas declaradas |
| `_reversa_sdd/dependencies.md` e `_reversa_sdd/inventory.md` | Já corrigidos pela feature 002; nada a fazer aqui |

## 5. O que fica de fora

- **As dez lacunas do módulo** (`_reversa_sdd/code-analysis.md#9`) — incluindo a
  concorrência na criação simultânea e a ausência de auto-vínculo da consulta, ambas de
  severidade Alta. Entram como veredito declarado, sem correção e sem prova.
- **A divergência entre o calendário semanal e a seleção de horário** — declarada como
  lacuna, sem prova.
- **A ausência de validação do horário no salvamento** — provada como comportamento atual;
  corrigir mudaria comportamento observável.
- **Edição de agendamento** — não existe; permanece fora do escopo.
- **Paridade visual das telas do módulo** — depende de captura dourada inexistente.

---
*Gerado pelo Reversa-Plan em 2026-09-20.*
