# Delta de Dados: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Base comparada: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/erd.md` e os schemas
> em `base44/entities/`.

## 1. Resumo

**Nenhuma mudança de modelo de dados.** Não há campo novo, campo removido, tipo alterado,
índice, relação nova nem migração. O schema de `AccessLog` permanece exatamente como está,
**incluindo a RLS admin-only** que a prova declara e não toca, e o diretório
`base44/entities/` é a regra de ouro do diff: **nenhum byte é alterado**.

O que esta feature introduz é **massa de prova fictícia**, que existe apenas dentro dos
arquivos de verificação e nunca chega a um banco.

## 2. O que o módulo grava hoje (referência, sem alteração)

| Entidade | Campos relevantes para esta feature | Origem |
| :--- | :--- | :--- |
| `AccessLog` | `user_email` (obrigatório), `action` (obrigatório, enum de **12** valores), `entity_type`, `entity_id`, `patient_name`, `ip_address`, `user_agent`, `details` | `base44/entities/AccessLog.jsonc` |
| `AccessLog` — RLS | `create: null` (qualquer autenticado grava); `read`, `update` e `delete` com `user_condition: role == admin` | `base44/entities/AccessLog.jsonc:56-73` |

> **O enum tem doze valores e nove são usados.** `ACCESS_ACTIONS` declara `login`, `logout`,
> `view_patient`, `edit_patient`, `create_patient`, `view_consultation`,
> `create_consultation`, `edit_consultation`, `create_prescription`, `upload_exam`,
> `delete_record` e `export_data`. Três nunca são invocados em lugar nenhum — `logout`,
> `create_prescription` e `export_data` —, e a prova afirma o **contrato** do enum
> (doze entradas iguais às do schema) enquanto a **orfandade** fica declarada, porque é
> propriedade estática do código (decisão `1a` e D-06 do roadmap).

> **O literal `ip_address: 'client-side'` é a promessa, não um defeito.** O navegador não tem
> acesso ao endereço de rede do cliente; o valor gravado é o que o sistema sempre usou
> (`AccessLogger.ts:14-15`). A prova afirma o literal, que é o que `PT-007.1` enuncia.

> **`details` é texto, e o seed offline grava `null`.** A extração registra a lacuna `BR-L07`
> (🟡) como "schema string, logger envia object/null"; a leitura foi corrigida na migração —
> `AccessLog.ts:38` declara `details?: Nullable<string>` e o módulo registra que as duas
> chamadas existentes passam **texto**. A massa de prova precisa cobrir o registro com
> `details` nulo, que é a forma que o seed offline produz.

## 3. Massa de prova introduzida

Vive em `src/test/auditFixtures.ts` e não tem nenhum efeito fora da suíte.

| Elemento | Para que existe |
| :--- | :--- |
| `registro(alteracoes)` — registro de auditoria com ação e data coerentes | Base de toda verificação da página e do logger; parametrizável por ação, data e detalhe |
| `ACOES` — as doze ações como constantes nomeadas | Provar o contrato do enum sem strings soltas (RF-15) |
| `registroEm(dia, acao, alteracoes)` — registro com a data **exatamente** como recebida | Provar os recortes de data sem forçar horário dentro do auxiliar |
| `hoje()`, `diasAtras(n)`, `diasAFrente(n)`, `horaLocal(dia, h, m)` | Derivar as datas **do dia congelado**, e nunca de string de data |
| `REGISTRO_FUTURO` — registro com data à frente do dia congelado | Provar o recorte **sem teto superior** (RF-19, decisão `1a`) |
| `SEM_DETALHES` — registro com `details` nulo | Tolerar a forma que o seed offline produz, sem quebrar a tabela |
| `USUARIO_DA_SESSAO` — usuário autenticado **sem** papel de admin | Provar a alcançabilidade da tela (RF-10) e o e-mail gravado (RF-02) |
| `USUARIO_ADMIN` — o mesmo usuário com papel de admin | Contraste explícito na prova da navegação: a tela aparece nos **dois** casos |
| `CONJUNTO_DE_INDICADORES` — registros desenhados para separar as categorias | Provar a heurística dos indicadores e a soma que não fecha (RF-16, D-10). Precisa ter uma ação de cada família (`view_`, `edit_`, `create_`, `delete_`), uma de receita e uma sem categoria (`login`) |
| `DIA_DE_PROVA` | O dia congelado das verificações de recorte (D-08) |

### 3.1 A armadilha de data que as features 003 a 005 já pagaram

`new Date('2026-09-22')` é interpretado em **UTC**, enquanto `getDate()` e `toDateString()`
são **locais**. Num fuso a oeste de Greenwich, a string devolve o dia anterior — e a
verificação passaria a medir outro dia **sem avisar**. A massa usa o **construtor local** e
registra a regra no cabeçalho, como `appointmentsFixtures.ts`, `consultationsFixtures.ts` e
`templateFixtures.ts`.

### 3.2 A armadilha de identidade, que custou uma sessão na feature 004

Um dublê de `useQuery` que devolve um **array novo a cada renderização** trava o processo
quando a tela coloca esse array na dependência de um efeito que chama `setState`. A página de
auditoria não corre esse risco (ela filtra em memória, sem `setState`), mas o Dashboard e as
telas de detalhe correm. A massa e os dublês devolvem **arrays com identidade estável**.

> Esta feature **usa** a identidade de propósito, e num lugar só: `RF-20` troca a identidade
> do objeto do paciente de forma **explícita** para provar que o efeito grava de novo. Fora
> dessa verificação, identidade instável é defeito do arranjo.

## 4. O que a prova **não** cria

| Não criado | Por quê |
| :--- | :--- |
| Arquivo de schema ou alteração em `base44/entities/*.jsonc` | Regra de ouro do diff |
| Migração, seed ou dado persistido | A prova substitui o transporte; nada é gravado em banco |
| Campo novo em qualquer entidade | Não há requisito que peça dado novo — a feature prova o que existe |
| Paginação ou qualquer controle novo na tela de auditoria | AMB-004 é paridade **congelada por decisão humana** (`handoff.md`); o teto de 500 é promessa provada, não lacuna a fechar nesta feature |
| Guarda de papel no cliente | Decisão `2a`: seria **regra nova**, não prova |
| Caso novo em `src/test/verificacoes-negativas.mjs` | Nenhum requisito desta feature depende do gate de tipos |

## 5. Conferência de que o schema ficou intocado

O `/reversa-coding` deve confirmar, ao fechar a feature:

```bash
git status --porcelain -- base44/entities     # precisa sair vazio
git log -1 --format="%h %ad %s" -- base44/entities
```

Esperado: nenhuma saída no primeiro comando.

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
