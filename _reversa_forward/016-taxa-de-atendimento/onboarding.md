# Onboarding: Taxa de Atendimento computada

> Identificador: `016-taxa-de-atendimento`
> Data: `2026-09-25`
> Para quem nunca viu esta feature: siga na ordem. Cada passo diz **o que fazer** e **o que deve
> aparecer**. Se aparecer outra coisa, o passo diz o que isso significa.

## 1. Antes de começar

| Item | Valor |
|---|---|
| Node / gerenciador | o mesmo do projeto (ver `package.json`) |
| Instalação | `npm install` |
| Ligar a aplicação | `npm run dev` |
| Modo offline | `VITE_OFFLINE=true` no ambiente — usa dados de demonstração no `localStorage`, sem servidor |
| Portões automatizados | `npm test`, `npm run typecheck`, `npm run prova:negativos`, `npm run prova:encoding` |

O modo offline é o caminho mais curto: ele já traz uma massa conhecida, com dono igual ao usuário
demonstrativo (`demo-user-001`), de modo que a leitura escopada encontra os registros.

## 2. O que a feature muda, em uma frase

O quarto cartão do painel — "Taxa de Atendimento" — deixa de mostrar sempre `94%` e passa a mostrar o
percentual de agendamentos **concluídos** sobre os que tiveram **desfecho** (`concluído` + `falta`),
nos últimos 12 meses. Cancelamento não entra em nenhuma das duas contas.

## 3. Roteiro de verificação manual

### Passo 1 — abrir o painel

Ligue a aplicação em modo offline e abra a página inicial (Dashboard).

**Esperado:** o quarto cartão mostra **`100%`** e, sob o valor, o texto **"últimos 12 meses"**.

**Por que 100%:** a massa de demonstração tem quatro agendamentos — um `concluido`, dois `agendado` e
um `cancelado` (`src/api/mockSeed.ts:66-69`). Só um tem desfecho, e ele foi concluído: `1 ÷ (1 + 0)`.

**Se aparecer `—` e "sem agendamentos com desfecho no período":** a leitura não encontrou nenhum
agendamento com desfecho. As duas causas prováveis são o filtro de dono não casar (usuário da sessão
diferente de `demo-user-001`) ou o `localStorage` ter massa antiga de uma sessão anterior — limpe as
chaves `mock_db_*` e recarregue.

**Se continuar aparecendo `94%`:** o cartão ainda está com o literal. A feature não foi aplicada.

### Passo 2 — provar que cancelamento não conta

Vá em **Agendamentos**, abra o agendamento cancelado (o de 02/09) e confirme que ele continua
`cancelado`. Volte ao painel.

**Esperado:** continua **`100%`**. Nenhuma mudança.

**Se cair para `50%`:** o cancelamento está entrando no denominador, e `RN-02` foi violada.

### Passo 3 — provar que falta entra na conta

Ainda em **Agendamentos**, mude o status de um dos agendamentos `agendado` para **`faltou`** — escolha
o de 28/08. Volte ao painel.

**Esperado:** passa a **`50%`** — `1 ÷ (1 + 1)`.

**Por que este passo importa:** ele exercita o caminho de escrita do status (`Appointments.tsx:86`) e o
reflexo no indicador. É a prova manual de que o cartão lê o dado, e não uma constante.

### Passo 4 — provar o estado sem base

Em **Agendamentos**, devolva o agendamento do passo 3 de `faltou` para **`agendado`**, e mude o
agendamento `concluido` de 27/08 para **`agendado`**. Agora **nenhum** agendamento tem desfecho.
Volte ao painel.

**Esperado:** o cartão mostra **`—`** e, sob o valor, **"sem agendamentos com desfecho no período"**.

**Se mostrar `0%`:** o cartão está tratando base vazia como zero, e `RN-06` foi violada. `0%` diria
"ninguém compareceu", que é diferente de "ninguém tinha o que comparecer".

### Passo 5 — provar que o zero é zero

Ainda em **Agendamentos**, mude agora o agendamento de 28/08 para **`faltou`**, deixando todos os
outros sem desfecho.

**Esperado:** o cartão mostra **`0%`** — denominador um (a falta), numerador zero.

Este passo é o par do anterior, e é o que prova que os dois estados são distinguíveis: no passo 4 não
havia desfecho nenhum, aqui há um e ele foi uma falta. Sem esta distinção, `—` e `0%` seriam o mesmo
número com desenhos diferentes.

### Passo 6 — provar que os outros três cartões não mudaram

Compare "Pacientes Ativos", "Agendamentos Hoje" e "Documentos Emitidos" antes e depois dos passos
acima. Eles devem exibir **exatamente os mesmos valores** que exibiam antes da feature. Só o quarto
cartão se move.

### Passo 7 — provar a ausência de tendência

Nenhum dos quatro cartões pode exibir uma linha do tipo "+5% este mês". O componente de cartão suporta
essa linha, e a decisão é não usá-la (`RF-04`).

## 4. O que este roteiro **não** consegue provar, e você deve saber

- **A janela de 12 meses.** A massa de demonstração é toda recente. Para exercitar a borda, é preciso
  um agendamento com data anterior a `hoje − 12 meses` com status `concluido` ou `faltou`, e ele deve
  **ficar de fora** da conta. Isso exige editar a massa no `localStorage` — ou confiar na prova
  automatizada, que cobre a borda.
- **O limite de leitura.** A massa tem quatro agendamentos; o truncamento por limite só apareceria com
  mais de 100 desfechos. Também é coberto por prova automatizada.
- **A qualidade do número.** O indicador mede **desfecho registrado**, não comparecimento real:
  concluir uma consulta **não** marca o agendamento como `concluido` — quem marca é uma pessoa, na tela
  de Agendamentos. Numa clínica que não marca, a taxa afunda sem que ninguém tenha faltado. Isso está
  registrado em `requirements.md#2.1` e no `roadmap.md#9`, e **não** é corrigido por esta feature.

## 5. Portões automatizados

| Comando | O que prova | Linha de base antes desta feature |
|---|---|---|
| `npm test` | As verificações de unidade e de tela, incluindo a fórmula e o cartão | 198 verificações em 31 arquivos, 0 falhas |
| `npm run typecheck` | Que o contrato de tipos continua íntegro | 0 erros |
| `npm run prova:negativos` | Que nenhum caso negativo deixou resíduo | 18 casos |
| `npm run prova:encoding` | Que nenhum arquivo tem BOM nem mojibake | 519 arquivos |

A contagem de verificações **sobe** com esta feature: a fórmula ganha prova própria e o cartão ganha
verificações novas. O que não pode acontecer é a suíte ficar vermelha, nem a contagem **cair**.

## 6. Onde olhar quando algo não bate

| Sintoma | Onde investigar |
|---|---|
| `94%` na tela | O literal em `Dashboard.tsx` não foi substituído |
| Sempre `0%` | A leitura está vazia ou o status lido não é o esperado |
| Sempre `—` | A leitura não retornou nada — verifique o filtro de dono e o `localStorage` |
| Muda sem você mexer | A chave de cache pode estar colidindo com a leitura limitada do Dashboard (`roadmap.md#3`, `D-05`) |
| Os outros cartões mudaram | Regressão — a quinta leitura não pode compartilhar chave nem substituir as quatro primeiras |

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` | reversa |
