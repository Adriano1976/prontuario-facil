# Impacto no Legado: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

## Estado da política de edição no momento da execução

`.reversa/reversa-config.json` foi lido no início da rodada:

```json
{
  "version": 1,
  "allowLegacyEdits": true,
  "allowedPaths": ["src/**", "package.json", "tsconfig.json", "docs/**", "index.html", ".github/**"]
}
```

Todos os arquivos criados e o arquivo modificado em `src/` casam com o glob `src/**` e estavam
liberados. Nenhuma escrita foi feita fora da lista, e `.reversa/reversa-config.json` **não** foi
tocado — ele só muda pela mão do usuário. As pastas próprias do Reversa receberam o adendo de
rastreabilidade e os artefatos da feature.

> **Dois caminhos que a feature quis tocar e não podia.** `vitest.config.ts`, para atacar o custo
> fixo de ambiente por arquivo, e `src/pages/__tests__/PatientForm.test.tsx`, que é o maior
> contribuinte individual do tempo da suíte. O primeiro **não** está em `allowedPaths`; o segundo
> está, mas pertence à prova da feature 002. Nenhum dos dois foi tocado, e a medição que
> justificaria a decisão está registrada em `onboarding.md#7.1`.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| `src/test/auditFixtures.ts` | Camada de prova (nova) | `componente-novo` | **LOW** | Massa de prova fictícia. Não tem efeito fora da suíte |
| `src/components/medical/__tests__/AccessLogger.test.ts` | Camada de prova (nova) | `componente-novo` | **LOW** | Sete verificações sobre o módulo que grava, medidas **no transporte** |
| `src/pages/__tests__/AccessLogs.test.tsx` | Camada de prova (nova) | `componente-novo` | **LOW** | Oito verificações sobre a página de auditoria |
| `src/pages/__tests__/Dashboard.test.tsx` | Camada de prova (nova) | `componente-novo` | **LOW** | A gravação ao montar o painel |
| `src/pages/__tests__/PatientDetailAudit.test.tsx` | Camada de prova (nova) | `componente-novo` | **LOW** | A visualização auditada do paciente **no transporte** e a duplicação por identidade |
| `src/__tests__/Layout.test.tsx` | Camada de prova (nova) | `componente-novo` | **LOW** | A navegação não consulta papel |
| `src/pages/__tests__/Consultation.test.tsx` | Camada de prova (existente) | `regra-alterada` | **MEDIUM** | **Primeira modificação de arquivo de prova pré-existente no ciclo forward.** Ganhou dois blocos `describe` — a visualização auditada no transporte e a duplicação —, sem tocar nos oito anteriores. O risco R-08 era apagar verificação alheia, e a contagem cresceu de 109 para 132 |
| `_reversa_sdd/code-spec-matrix.md` | Matriz de rastreabilidade | `regra-alterada` | **LOW** | Ganhou a seção de paridade do grupo `07`, os dez registros declarados, o saldo 19 → 15 e oito linhas novas em lacunas de prova |
| `_reversa_forward/006-prova-logs-acesso/*` | Artefatos do ciclo forward | `componente-novo` | **LOW** | Requirements, roadmap, investigação, delta de dados, onboarding, ações, progresso, watch e este arquivo |

## Diff conceitual por componente

**Camada de prova — nada do sistema mudou.** Como as features 002 a 005, esta **não** altera
comportamento: todo o delta está em arquivos que a suíte executa e em artefatos de documentação.
Os quatro arquivos de aplicação provados — `AccessLogger.ts`, `AccessLogs.tsx`, `Layout.tsx` e
`Dashboard.tsx` — estão sem nenhum diff, assim como `PatientDetail.tsx` e `Consultation.tsx`.

**A exceção é um arquivo de prova, e ela merece registro.** `Consultation.test.tsx` foi
**modificado** — é a primeira vez no ciclo que uma feature toca prova de outra. O arquivo já
media a auditoria **no transporte**, o que o tornava o lugar certo para as duas verificações
novas; ainda assim, a modificação foi feita por acréscimo de blocos, e as oito verificações
anteriores seguem passando.

**Um arquivo novo existe por incompatibilidade de instrumento.** `PatientDetail.test.tsx` dubla o
módulo `AccessLogger`, e um dublê de módulo vale para o arquivo inteiro. Como a decisão D-02
exige medir no transporte, a prova da visualização auditada do paciente foi para
`PatientDetailAudit.test.tsx`. É desvio do plano original — que previa modificar o arquivo
vizinho — e está registrado no `progress.jsonl` e no `code-spec-matrix.md`.

**O que a feature mudou de fato foi a leitura da trilha.** Três achados nunca medidos passaram a
ter veredito:

- **A trilha perde eventos em silêncio, de dois modos provados** — identificação **recusada** cai
  no `catch` e imprime no console; identificação **vazia** sai por um `return` antecipado e nem
  isso. Nos dois, nenhum registro e nenhum erro para quem chamou. O terceiro modo — a gravação
  não aguardada antes da navegação — fica **declarado por leitura**.
- **A tela de auditoria é oferecida a quem não é admin.** A nota de `code-analysis.md#5.1` diz
  que "somente admins veem a tela"; a navegação não consulta papel nenhum, e isso está provado.
- **A mesma visualização grava duas vezes** quando o objeto da entidade muda de identidade — nas
  **duas** telas de detalhe, o que faz do achado um defeito de padrão, e não de uma tela.

Achados menores, todos provados: o Dashboard grava `login` como procuração de acesso ao painel;
os quatro indicadores não somam o total; e o recorte de data dos logs não tem teto superior.

## Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` e da extração que esta feature **confirmou por medição**, e
que seguem intactas:

| Regra | Origem | O que a prova confirmou |
| :--- | :--- | :--- |
| `BR-L01` / `BR-L03` — a trilha é append-only, por chamadas dedicadas a eventos específicos | `logs-acesso/requirements.md#2` | O módulo só insere, e a verificação conta a inserção **antes** de negar leitura, alteração e exclusão |
| `BR-L04` / `BR-L05` — limite de 500 registros, ordenação sempre do mais recente | `code-analysis.md#6` (logs-acesso) | O pedido é emitido com os argumentos **exatos** `('-created_date', 500)` |
| `BR-L06` — o endereço é gravado como `'client-side'` | `code-analysis.md#6` (logs-acesso) | O literal é afirmado, com asserção negativa de que **não** parece um endereço de rede |
| `BR-L02` — qualquer autenticado cria; leitura só admin | `code-analysis.md#6` (logs-acesso) | A metade do cliente é provada (a página não declara escopo); a metade do servidor é **declarada** |
| `BR-S01` — todo acesso a dado sensível gera log | `domain.md#2.4` | Parcialmente confirmada: os eventos que disparam **gravam**, e os modos em que a trilha se perde ficam declarados |
| Regra de ouro do diff: schemas de entidade intocados | `architecture.md#1` | `base44/entities/` **sem nenhum diff** |

## Modificadas

Nenhuma regra de negócio foi alterada, removida ou rebaixada. O que mudou foi o **veredito de
prova** de leituras que já existiam — e é isso que vai para o watch:

| Leitura | De | Para | Onde está registrado |
| :--- | :--- | :--- | :--- |
| Destino do grupo `Logs de acesso (07)` | "Feature a criar" | ✅ **concluído** | `code-spec-matrix.md#Destino dos cenários de paridade não cobertos nesta feature` |
| Saldo dos cenários transferidos | 19 restantes | **15 restantes** | Nota de saldo, logo abaixo da tabela de destino |
| Nota de `code-analysis.md#5.1` sobre quem vê a tela | "somente admins veem a tela de auditoria" | **Imprecisa** — a navegação não consulta papel | `code-spec-matrix.md#Registros declarados do grupo 07`, registro 2 |
| Classificação de `AccessLog` no contrato do cliente | leitura aberta, ao lado de `Doctor` e `Template` | **Imprecisa** — a leitura é admin-only, e `asUser`/`asAdmin` são o mesmo repositório | `code-spec-matrix.md`, registro 3 |
| As três ações órfãs do catálogo | 🟡 declaradas pela feature 004 | 🟡 **declaradas, com o contrato do enum provado** | `code-spec-matrix.md#Lacunas de prova` |
| Cobertura de testes da suíte | 109 verificações em 18 arquivos | **132 verificações em 23 arquivos** | `inventory.md` e `onboarding.md#7.1` |

**Não modificadas, e a ausência é deliberada:** `src/components/medical/AccessLogger.ts`,
`src/pages/AccessLogs.tsx`, `src/Layout.tsx`, `src/pages/Dashboard.tsx`,
`src/pages/PatientDetail.tsx`, `src/pages/Consultation.tsx`, `base44/entities/*.jsonc` e
`src/test/verificacoes-negativas.mjs`. Nenhum byte deles foi tocado — a feature observa, não
altera.

---
*Gerado pelo Reversa-Coding em 2026-09-22.*
