# Legacy Impact: Prova automatizada do módulo de Agendamentos

> Identificador: `003-prova-agendamentos`
> Data: `2026-09-21`
> Política de edição do legado no momento da execução: `allowLegacyEdits: true`, com
> `allowedPaths` liberando `src/**`, `package.json`, `tsconfig.json`, `docs/**`,
> `index.html` e `.github/**`. As pastas próprias do Reversa permanecem graváveis pela
> regra própria.
> **Nenhum caminho do plano caiu fora da política** — não houve recusa de escrita.

## Tabela de arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/test/appointmentsFixtures.ts` | Camada de prova (`_reversa_sdd/inventory.md#Cobertura de testes`) | `componente-novo` | LOW | Massa de prova compartilhada do módulo. Não entra no programa verificado (admissão de JavaScript desligada) nem é coletado como prova (nome fora do padrão de arquivo de teste) |
| `src/components/appointments/__tests__/TimeSlotPicker.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova de disponibilidade e de conflito de horário. **Sem nenhum dublê** — o componente é puro |
| `src/pages/__tests__/Appointments.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova do ciclo de status pela tela de listagem |
| `src/pages/__tests__/NewAppointment.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova da criação, da ausência de revalidação no salvamento e da ordem entre e-mail e confirmação |
| `_reversa_sdd/code-spec-matrix.md` | Artefato da extração | `regra-alterada` | MEDIUM | Ganha o veredito de prova de cada promessa do módulo, os 8 cenários de paridade com destino, as onze lacunas declaradas e a medição de tempo atualizada |

> **Nenhum arquivo de aplicação foi tocado.** Não há `src/pages/Appointments.tsx`,
> `src/pages/NewAppointment.tsx`, `src/components/appointments/*.tsx` nem
> `base44/entities/*.jsonc` na lista. A regra de ouro do diff foi respeitada: a prova
> observa, não altera.
>
> Conferido por histórico, e não por inspeção visual: o último commit que tocou
> `src/pages/Appointments.tsx` e `src/pages/NewAppointment.tsx` é o `4c31d76`, de
> **2026-09-14** — a migração da feature 001, cinco dias antes desta feature existir. O
> último que tocou `base44/entities/` e `src/components/ui/button.jsx` é o `19ed662`, de
> **2026-08-18**. O commit que trouxe os arquivos de prova deste módulo, `b6d2fce`
> (2026-09-21), adiciona **exatamente quatro arquivos**, todos de prova, e nenhum de
> aplicação.

## Diff conceitual por componente

### Camada de prova (componente novo em relação ao legado)

A camada nasceu na feature 002 e esta feature a estende ao maior módulo do sistema. O
acréscimo é de **22 verificações em 3 arquivos**, mais a massa compartilhada que as três
usam.

O que a camada passa a afirmar sobre Agendamentos: a disponibilidade tem **três**
comportamentos distintos e não um; o conflito de horário é **pontual** e deixa passar a
sobreposição por duração maior; o ciclo de status é **manual** e nenhuma prova pressupõe
automação; o envio de e-mail acontece **antes** da confirmação de sucesso, e a falha dele
é silenciosa; e o salvamento **não revalida** o horário escolhido.

Nada disso é comportamento novo. É comportamento que já existia sem que ninguém pudesse
saber.

### Artefato da extração

`code-spec-matrix.md` passa a registrar, para o módulo de Agendamentos, o que antes só
existia como promessa: veredito de prova por promessa, destino dos 8 cenários de paridade,
e as lacunas declaradas uma a uma. Duas correções de precisão foram feitas no caminho —
a citação `W009` sem qualificação de feature e a medição de tempo, que estava congelada na
feature 002.

## Preservadas

Regras 🟢 que continuam intactas — **nenhuma foi alterada por esta feature**:

- **BR-P01** — apenas pacientes `ativo` são selecionáveis para agendamento ou consulta.
- **BR-P02** — `blood_type` restrito ao enum ABO/Rh mais `desconhecido`.
- **BR-A01** de `_reversa_sdd/domain.md#2.2` — o agendamento nasce `agendado` e precisa ser `confirmado` antes do atendimento.
- **BR-A03** de `_reversa_sdd/domain.md#2.2` — o painel exclui agendamentos `cancelados` das contagens.
- **BR-A01 a BR-A04** de `_reversa_sdd/agendamentos/requirements.md#2` — obrigatoriedade dos vínculos, paciente ativo, ciclo manual e respeito à jornada.
- **BR-T01** — modelos de documento são filtrados por tipo.
- **BR-T02** — `medications` só é exigido quando o tipo do documento inclui "receita".
- **BR-S01** — todo acesso a dado sensível gera registro na trilha de auditoria.
- **BR-S02** — usuário não-admin só vê o que ele mesmo criou.

## Modificadas

**Nenhuma.** Esta feature não altera regra de negócio, contrato de dados, schema de
entidade nem comportamento observável. A única classe de afirmação que muda é a
documental, e apenas num artefato da extração.

> Consequência para o `regression-watch.md`: como não houve regra alterada nem removida,
> os itens de vigilância desta feature não são regressões a evitar, e sim **propriedades
> que precisam continuar verdadeiras** — tanto os comportamentos que a prova passou a
> fixar quanto a própria prova.

### Divergências documentais encontradas, e não corrigidas

Esta feature **não** corrige artefato da extração que descreve o sistema errado. Ela
prova o comportamento real e declara a divergência. Duas merecem registro:

1. **Sincronia automática do status — duas fontes, não uma.** O `requirements.md` desta
   feature declara a divergência com `_reversa_sdd/domain.md#2.2` (BR-A02, 🟡 inferida).
   Ao mapear componentes para este documento, apareceu uma **segunda** fonte da mesma
   afirmação falsa: `_reversa_sdd/architecture.md#1`, fluxo 4 — *"Médico marca
   `Consultation` como `concluida` → `Appointment` atualizado para `concluido`"*. Corrigir
   apenas o `domain.md` deixaria a extração ainda mentindo em outro lugar.
2. **Criação automática da consulta.** `_reversa_sdd/architecture.md#1`, fluxo 2, afirma
   que mudar o agendamento para `em_atendimento` **cria** a `Consultation`. Nenhum código
   faz isso — é a lacuna `consultation_id` sem auto-link, de severidade Alta, e é a razão
   pela qual o cenário PT-004.2 é vazio.

Ambas entram no `regression-watch.md`, não porque esta feature as tenha introduzido, mas
porque agora estão **provadas como falsas** e não podem voltar a passar despercebidas.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
