# Delta de Dados: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Base comparada: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/erd.md` e os schemas
> em `base44/entities/`.

## 1. Resumo

**Nenhuma mudança de modelo de dados.** Não há campo novo, campo removido, tipo alterado,
índice, relação nova nem migração. Os dois schemas que a feature toca de perto —
`Template` e `Prescription` — permanecem exatamente como estão, e o diretório
`base44/entities/` é a regra de ouro do diff: **nenhum byte é alterado**.

O que esta feature introduz é **massa de prova fictícia**, que existe apenas dentro dos
arquivos de verificação e nunca chega a um banco.

## 2. O que a emissão grava hoje (referência, sem alteração)

Registrado aqui apenas para que o delta seja legível: quem comparar este documento com o
`data-dictionary.md` precisa saber o que **deveria** estar igual.

| Entidade | Campos relevantes para esta feature | Origem |
| :--- | :--- | :--- |
| `Prescription` | `patient_id` (obrigatório), `type` (obrigatório, enum de **6** valores), `content` (obrigatório), `consultation_id`, `medications[]`, `template_name`, `valid_days`, `notes` | `base44/entities/Prescription.jsonc` |
| `Template` | `name` (obrigatório), `type` (obrigatório, enum de **7** valores), `content` (obrigatório), `variables[]`, `is_default` (default `false`), `is_active` (default `true`) | `base44/entities/Template.jsonc` |
| `Medication` (objeto embutido em `medications[]`) | `name`, `dosage`, `frequency`, `duration`, `instructions` | `base44/entities/Prescription.jsonc:29-52` |

> **Os dois enums não são iguais de propósito.** `Template` tem sete tipos, incluindo
> `anamnese`; `Prescription` tem seis, sem ele. O comentário de `src/types/Template.ts`
> registra a razão: `anamnese` é exclusivo de modelo e **não gera documento**. É uma
> paridade verificável, e a prova a afirma contra o conjunto do schema (RF-15), e não contra
> uma lista escrita à mão.

> **Os defaults do schema não entram na prova.** `is_default: false` e `is_active: true` são
> aplicados pelo servidor e **não são observáveis no cliente**. Afirmar o schema por leitura
> de arquivo daria aparência de cobertura a um comportamento do servidor — o mesmo critério
> que a feature 004 aplicou ao default `agendada` da consulta (D-06 daquela feature).

## 3. Massa de prova introduzida

Vive em `src/test/templateFixtures.ts` e não tem nenhum efeito fora da suíte.

| Elemento | Para que existe |
| :--- | :--- |
| `paciente(alteracoes)` — paciente com `full_name` e `cpf` | Resolver `{PACIENTE_NOME}` e `{PACIENTE_CPF}` sem repetir objeto em cada verificação |
| `pacienteSemCpf()` — paciente cujo `cpf` é ausente | Provar que a variável resolve para **string vazia**, em silêncio (RF-10) |
| `modelo(alteracoes)` — modelo ativo, tipo `receita_simples` | Base de toda verificação; parametrizável por tipo, conteúdo e atividade |
| `MODELO_RECEITA` e `MODELO_ATESTADO` | Provar o filtro por tipo sem strings soltas (RF-04) |
| `MODELO_INATIVO` | Provar o filtro por atividade (RF-05) e o cliente sem re-filtro (RF-06) |
| `MODELO_COM_VARIAVEIS` — conteúdo com `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}` e `{DATA_EXTENSO}` | Provar as quatro substituições de uma vez (RF-07) |
| `MODELO_COM_AFASTAMENTO` — conteúdo com `{DIAS_AFASTAMENTO}` | Provar que o marcador **permanece literal** (RF-09, D-03) |
| `MODELO_COM_MARCACAO` — conteúdo com marcação HTML | Provar a ausência de escape no payload e no HTML impresso (RF-11, RF-18) |
| `documento(alteracoes)` — carga de prescrição | Abrir o editor em modo edição (RF-14) |
| `TIPO_DE_DOCUMENTO` — os **seis** tipos, lidos do schema | Confrontar o enum do editor com o de `Prescription` (RF-15) |
| `DATA_DE_PROVA` e derivadores | Congelar o relógio para `{DATA}` e `{DATA_EXTENSO}` (D-04) |

### 3.1 A armadilha de data que a feature 003 já pagou

`new Date('2026-10-05')` é interpretado em **UTC**, enquanto `getDate()`, `getMonth()` e
`toDateString()` são **locais**. Num fuso a oeste de Greenwich, a string devolve o dia
anterior — e a verificação passaria a medir outro dia **sem avisar**.

Por isso as datas desta massa são construídas com o **construtor local**
(`new Date(ano, mês, dia)`). A regra fica no cabeçalho do arquivo, e as features 003 e 004
têm o mesmo registro em `src/test/appointmentsFixtures.ts` e
`src/test/consultationsFixtures.ts`.

### 3.2 A armadilha de identidade, que custou uma sessão inteira na feature 004

Um dublê de `useQuery` que devolve um **array novo a cada renderização** trava o processo
quando a tela coloca esse array na dependência de um `useEffect` que chama `setState`. O
`PrescriptionEditor` tem exatamente esse arranjo: `templates` entra no `find` de
`handleSave` e no `map` do seletor, e o `useEffect` de `[initialData, open]` chama
`resetForm`. A massa devolve **arrays com identidade estável**, guardados fora do dublê.

## 4. O que a prova **não** cria

| Não criado | Por quê |
| :--- | :--- |
| Arquivo de schema ou alteração em `base44/entities/*.jsonc` | Regra de ouro do diff |
| Migração, seed ou dado persistido | A prova substitui o transporte; nada é gravado em banco |
| Campo novo em qualquer entidade | Não há requisito que peça dado novo — a feature prova o que existe |
| Caso novo em `src/test/verificacoes-negativas.mjs` | Nenhum requisito desta feature depende do gate de tipos: o enum de documentos é afirmado contra o schema, em execução, e não por recusa de compilação |
| Prova da página de administração `Templates.tsx` | Fora do escopo por decisão `1a` (D-07) |

## 5. Conferência de que o schema ficou intocado

O `/reversa-coding` deve confirmar, ao fechar a feature:

```bash
git status --porcelain -- base44/entities     # precisa sair vazio
git log -1 --format="%h %ad %s" -- base44/entities
```

Esperado: nenhuma saída no primeiro comando.

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
