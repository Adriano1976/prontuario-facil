# Regression Watch: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Cenário: **legado** — âncora em `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`.

Este arquivo diz o que precisa **continuar verdadeiro** quando uma nova extração `/reversa`
rodar sobre este código. Ele não é uma lista de desejos: cada item nasceu de uma leitura que
esta feature mediu, e o sinal de violação é o que se deve procurar no diff da re-extração.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
| :--- | :--- | :--- | :--- | :--- |
| **W001** | `AccessLogger.ts:46-73`; `BR-L01`/`BR-L03` de `code-analysis.md#6` | A trilha é **somente inserção** pelo cliente: o módulo grava e nunca lê, altera ou apaga | `presença` | O módulo passa a ler, alterar ou apagar. Uma extração que descreva a trilha como editável pelo cliente está errada |
| **W002** | `AccessLogger.ts:60-69`; `BR-L06` | O registro carrega o e-mail da sessão, o endereço **literal** `'client-side'` e o agente do navegador | `presença` | O endereço passa a vir do cliente como IP real, ou o campo some |
| **W003** | `AccessLogger.ts:63-65` | Campos de entidade **ausentes** (`undefined`) quando o evento não tem entidade, e não strings vazias | `presença` | Os campos passam a ser gravados como `''` ou `null` |
| **W004** | `AccessLogger.ts:70-72`; decisão `3a` | Com a identificação do usuário **recusada**, nada é gravado e **nenhum erro é propagado** ao chamador | `presença` | O erro passa a propagar (mudança de comportamento: a operação principal passaria a falhar por causa da auditoria) ou um registro parcial passa a ser gravado |
| **W005** | `AccessLogger.ts:55`; decisão `3a` | Com a identificação devolvendo **usuário vazio**, nada é gravado, nada propaga **e nem o console é avisado** | `presença` | Surge uma linha de console nesse caminho, ou um registro com usuário desconhecido — qualquer das duas é mudança de comportamento |
| **W006** | `AccessLogs.tsx:75-78`; `BR-L04`/`BR-L05`; AMB-004 | A leitura é pedida com os argumentos **exatos** `('-created_date', 500)` e **sem escopo declarado** | `presença` | O limite ou a ordenação mudam, ou a leitura passa a usar `asAdmin`/`asUser` — o que seria regra nova, e não conserto |
| **W007** | `AccessLogs.tsx:80-107` | Os filtros atuam **em memória**: mudar ação, texto ou data **não** reconsulta o servidor | `presença` | Surge uma consulta por filtro, ou os filtros entram na chave da consulta |
| **W008** | `Layout.tsx:41-49`; `code-analysis.md#5.1` | A navegação **não** consulta papel: o item de auditoria aparece para qualquer autenticado | `ausência` | Surge uma guarda de papel no caminho até a tela. Isso **não** é defeito — é regra nova, e invalidaria a nota de que a tela é oferecida a todos |
| **W009** | `Dashboard.tsx:109-111` | A montagem do Dashboard grava **exatamente um** registro, com `action: 'login'` e `details: 'Acesso ao dashboard'` | `presença` | A ação muda para uma ação de painel inexistente no enum, o detalhe muda, ou a gravação passa a acontecer mais de uma vez por montagem |
| **W010** | `PatientDetail.tsx:156-160` e `Consultation.tsx:114-118`; `RN-07` | O efeito grava de novo quando o **objeto** da entidade muda de identidade — comportamento atual, provado nas duas telas | `presença` | As dependências passam a usar o **identificador** em vez do objeto. Isso corrigiria a duplicação, e é mudança de comportamento: a prova tem de ser alterada de propósito |
| **W011** | `AccessLogs.tsx:186-203`; `code-analysis.md#4.2` | Os indicadores são **heurísticos por substring**: `view`, `edit`/`create` e `delete`. A soma **não** fecha com o total | `presença` | A classificação passa a ser por prefixo exato ou por categoria fechada — o que mudaria os números exibidos |
| **W012** | `AccessLogs.tsx:95-103` | Os recortes de semana e de mês comparam apenas o **piso**, sem teto: um registro com data futura entra nos dois | `presença` | Surge um limite superior. É correção de comportamento, e a prova precisa acompanhar |
| **W013** | `AccessLogger.ts:22-35`; `AccessLog.jsonc` | O catálogo declara **doze** ações, iguais às do schema | `presença` | O catálogo ganha ou perde ação, ou o enum do schema muda sem o catálogo |
| **W014** | `src/pages/__tests__/PatientDetail.test.tsx` | A prova da visualização de paciente **no transporte** vive em `PatientDetailAudit.test.tsx`, porque o arquivo vizinho dubla o módulo `AccessLogger` | `presença` | Alguém move a prova de transporte para o arquivo que dubla o módulo — o que a tornaria uma prova de chamada com aparência de prova de transporte |

## Observações

Itens que **não** têm peso de regressão: são leituras declaradas, limitações de instrumento, ou
comportamentos do servidor. Ficam registrados para que a re-extração os veja.

| # | Item | Situação |
| ---: | :--- | :--- |
| 1 | **O trio de ações órfãs** | `logout`, `create_prescription` e `export_data` nunca são invocados. A orfandade é propriedade **estática** do código e fica **declarada**, não provada — medi-la exigiria ler arquivos-fonte (decisão `1a`) |
| 2 | **A colisão das famílias `BR-L`** | `logs-acesso/requirements.md#2` e `code-analysis.md#6` usam os mesmos identificadores para regras disjuntas. É a quarta família com esse defeito no projeto, e a única em que os dois artefatos descrevem o **mesmo módulo** |
| 3 | **`AccessLog` é classificada como leitura aberta** | `registry.ts:65-67` a agrupa com `Doctor` e `Template`, mas a leitura da trilha é admin-only na RLS. E `asUser`/`asAdmin` devolvem o mesmo repositório para esta entidade |
| 4 | **A RLS não é provável no cliente** | A imutabilidade e a restrição de leitura a administrador são aplicadas pelo servidor. Entram como **declaração**, no mesmo critério do default `agendada` (feature 004) |
| 5 | **A exportação de dados não existe** | O ícone de download é apresentação da ação `export_data`, sem exportação implementada. Lacuna de `code-analysis.md#9` confirmada |
| 6 | **`details` é texto, e o seed offline grava `null`** | A lacuna `BR-L07` (🟡) da extração está superada pela migração, que corrigiu o tipo para refletir o uso real |
| 7 | **O teto de 90 segundos é uma propriedade condicional** | A mesma suíte mediu **75,78 s** numa máquina calma e **122,57 s** sob carga. O maior contribuinte individual é `PatientForm.test.tsx` (13,11 s), **pré-existente** e alheio a esta feature. Perseguir o teto exige decisão do usuário: toca prova de outra feature ou `vitest.config.ts`, que não está em `allowedPaths` |
| 8 | **Esta é a primeira feature que modifica arquivo de prova pré-existente** | `Consultation.test.tsx` ganhou dois blocos `describe` novos, sem tocar nos oito anteriores. A contagem de verificações cresceu de 109 para 132, e o crescimento é a garantia de que nada foi perdido |

## Histórico de re-extrações

> Preenchido pelo agente reverso quando `/reversa` rodar de novo. Vazio até então.

## Arquivadas

> Itens que deixarem de ser verdade e forem endereçados saem daqui, com a data e a razão.
> Vazio até então.

---
*Gerado pelo Reversa-Coding em 2026-09-22.*
