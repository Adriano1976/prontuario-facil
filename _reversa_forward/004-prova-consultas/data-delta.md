# Delta de Dados: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Base comparada: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/erd.md` e os schemas
> em `base44/entities/`.

## 1. Resumo

**Nenhuma mudança de modelo de dados.** Não há campo novo, campo removido, tipo alterado,
índice, relação nova nem migração. Os três schemas do módulo — `Consultation`,
`Prescription` e `Exam` — permanecem exatamente como estão, e o diretório
`base44/entities/` é a regra de ouro do diff desta feature: **nenhum byte é tocado**.

O que esta feature introduz é **massa de prova fictícia**, que existe apenas dentro dos
arquivos de verificação e nunca chega a um banco.

## 2. O que o módulo grava hoje (referência, sem alteração)

Registrado aqui apenas para que o delta seja legível: quem comparar este documento com o
`data-dictionary.md` precisa saber o que **deveria** estar igual.

| Entidade | Campos relevantes para esta feature | Origem |
| :--- | :--- | :--- |
| `Consultation` | `patient_id` (obrigatório), `date` (obrigatório), `status` (enum de 4 valores, default `agendada`), `follow_up_date` | `base44/entities/Consultation.jsonc`, `_reversa_sdd/consultas/requirements.md#3` |
| `Prescription` | `patient_id`, `type`, `content`, `consultation_id`, `medications[]`, `valid_days` | `base44/entities/Prescription.jsonc` |
| `Exam` | `patient_id`, `name`, `date`, `consultation_id`, `file_url`, `file_type` | `base44/entities/Exam.jsonc` |
| `AccessLog` | `user_email`, `action`, `entity_type`, `entity_id`, `patient_name`, `ip_address`, `user_agent`, `details` | `src/components/medical/AccessLogger.ts:60-69` |

> O enum de situação tem quatro valores — `agendada`, `em_andamento`, `concluida`,
> `cancelada` — e o **default do schema é `agendada`**. É esse default que a prova
> **declara por citação e não prova por execução**, porque ele é aplicado pelo servidor e
> não é observável no cliente (decisão D-06 do `roadmap.md`).

## 3. Massa de prova introduzida

Vive em `src/test/consultationsFixtures.ts` e não tem nenhum efeito fora da suíte.

| Elemento | Para que existe |
| :--- | :--- |
| `paciente()` — paciente ativo, com e-mail | Satisfazer a elegibilidade da BR-P01 e da BR-C-04 sem repetir objeto em três arquivos |
| `consulta(alteracoes)` — consulta com situação padrão e datas coerentes | Base de toda verificação; parametrizável por situação |
| `SEM_SITUACAO` — consulta cujo campo de situação é ausente | Provar a tolerância à ausência na listagem e no detalhe (RF-06, RF-07) e o fallback do formulário (RF-01) |
| As quatro situações como constantes nomeadas | Provar o filtro e o conjunto oferecido pelo seletor sem strings soltas |
| `hoje()`, `diasAtras(n)`, `diasAFrente(n)` | Derivar as datas dos quatro recortes **a partir do dia congelado**, e nunca de string de data |
| `documento(alteracoes)` — carga de prescrição | Acionar o fluxo de emissão no detalhe (RF-17) |
| `exame(alteracoes)` — carga de exame | Acionar o fluxo de anexo no detalhe (RF-17), que é o contraponto positivo da assimetria |

### 3.1 A armadilha de data que a feature 003 já pagou

`new Date('2026-10-05')` é interpretado em **UTC**, enquanto `getDay()`, `getMonth()` e
`toDateString()` são **locais**. Num fuso a oeste de Greenwich, a string devolve o dia
anterior — e a verificação passaria a medir outro dia **sem avisar**.

Por isso as datas desta massa são construídas com o **construtor local**
(`new Date(ano, mês, dia)`) e os deslocamentos usam `setDate`. A regra fica no cabeçalho do
arquivo, e a feature 003 tem o mesmo registro em `src/test/appointmentsFixtures.ts`.

Como o `Date` é congelado nas verificações de recorte (D-04), as datas derivam do dia
**congelado**, e não do relógio real: o recorte `today` deixa de ser sensível à virada da
meia-noite.

## 4. O que a prova **não** cria

| Não criado | Por quê |
| :--- | :--- |
| Arquivo de schema ou alteração em `base44/entities/*.jsonc` | Regra de ouro do diff |
| Migração, seed ou dado persistido | A prova substitui o transporte; nada é gravado em banco |
| Campo novo em qualquer entidade | Não há requisito que peça dado novo — a feature prova o que existe |
| Caso novo em `src/test/verificacoes-negativas.mjs` | O caso `status-fora-do-conjunto` já cobre o `RF-03` desde a feature 001 (D-05) |

## 5. Conferência de que o schema ficou intocado

O `/reversa-coding` deve confirmar, ao fechar a feature:

```bash
git status --porcelain -- base44/entities     # precisa sair vazio
git log -1 --format="%h %ad %s" -- base44/entities
```

Esperado: nenhuma saída no primeiro comando, e o último commit que tocou o diretório sendo
o `19ed662`, de **2026-08-18** — anterior a todas as features do ciclo forward.

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
