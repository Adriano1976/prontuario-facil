# Delta de Dados: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Base comparada: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/erd.md` e os schemas
> em `base44/entities/`.

## 1. Resumo

**Nenhuma mudança de modelo de dados.** Não há campo novo, campo removido, tipo alterado,
índice, relação nova nem migração. Os schemas das entidades permanecem exatamente como estão, e
`base44/entities/` é a regra de ouro do diff: **nenhum byte é alterado**.

**E não há massa de prova.** Ao contrário das features 002 a 006, esta não escreve objeto de
teste nenhum: os casos do comando de provas negativas são **fontes TypeScript** montadas em
memória, gravadas em `src/__negative_checks__/`, compiladas uma vez e removidas na mesma
execução. Não há fixture, não há dublê e não há dado que sobreviva ao comando.

## 2. O que a prova toca do modelo (referência, sem alteração)

O único "dado" envolvido são os **conjuntos fechados** — usados para provar que um valor **fora**
deles é recusado. Registrados aqui para que o delta seja legível:

| Conjunto | Valores | Origem |
| :--- | :--- | :--- |
| `ConsultationStatus` | `agendada`, `em_andamento`, `concluida`, `cancelada` | `src/types/Consultation.ts` — **já coberto** por caso existente |
| `AppointmentStatus` | `agendado`, `confirmado`, `em_atendimento`, `concluido`, `cancelado`, `faltou` | `src/types/Appointment.ts` — caso **novo** |
| `PrescriptionType` | `receita_simples`, `receita_controlada`, `atestado`, `solicitacao_exame`, `encaminhamento`, `declaracao` | `src/types/Prescription.ts` — caso **novo** |
| `UserRole` | `admin`, `user` | `src/types/User.ts` — o literal não-admin é **inferido**, e está registrado como pendência de confirmação no próprio arquivo |
| `AccessScope` | `{ kind: 'user', user_id }` ou `{ kind: 'admin' }` | `src/api/contract.ts` — não é dado persistido, é forma de chamada |

> **`UserRole` tem uma inferência declarada no código.** Apenas `'admin'` está documentado de
> forma literal no projeto; `'user'` é a inferência adotada, com a pendência de confirmação com
> o stakeholder registrada em `src/types/User.ts:9-11`. Esta feature **não** resolve a pendência
> — ela prova que o papel é explícito no tipo, e não qual é o seu segundo valor.

> **Os conjuntos que o cenário não nomeia ficam fora.** `TemplateType`, `ExamType` e as ações de
> auditoria são conjuntos fechados do domínio, mas cada um pertence ao seu módulo, e o grupo
> transferido nomeia apenas situação e tipos documentais (decisão `Q4` · `4a`).

## 3. O que a prova **não** cria

| Não criado | Por quê |
| :--- | :--- |
| Massa de prova, fixture ou dublê | Os casos são fontes compiladas e descartadas; não há objeto de teste a compartilhar |
| Arquivo de caso **versionado** | Um caso negativo permanente passaria a falhar de propósito no uso normal, e um caso **positivo** permanente seria um exemplo de brecha no repositório |
| Arquivo de schema ou alteração em `base44/entities/*.jsonc` | Regra de ouro do diff |
| Campo novo em qualquer entidade ou tipo | A feature mede o contrato, não o altera |
| Entrada em `data-dictionary.md` | Não há dado novo a dicionarizar |

## 4. Conferência de que o schema ficou intocado

O `/reversa-coding` deve confirmar, ao fechar a feature:

```bash
git status --porcelain -- base44/entities     # precisa sair vazio
git status --porcelain -- src/api src/types   # precisa sair vazio
```

Esperado: nenhuma saída nos dois comandos. O único arquivo de código que esta feature toca é o
**arnês de provas** (`src/test/verificacoes-negativas.mjs`), que não faz parte da aplicação.

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
