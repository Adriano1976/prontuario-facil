# Contrato: acesso a dados da aplicação (`AppDataClient`)

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Tipo: contrato **interno**, entre as telas e a camada de acesso a dados
> Implementações: modo online (SDK do BaaS) e modo offline (armazenamento local)
> Confidência: 🟢 CONFIRMADO

## 1. Por que este contrato existe

O legado já tinha duas implementações de acesso a dados escolhidas em tempo de
construção, mas **nenhum contrato comum**: nada garantia que as duas respondessem às
mesmas operações com as mesmas formas. A consequência é a classe de defeito mais cara
possível neste projeto — código que funciona no modo online e falha silenciosamente no
modo offline, ou o contrário, sem que nada acuse.

Este contrato existe para que as duas implementações sejam verificadas contra a mesma
definição. Se uma delas divergir, a verificação de tipos falha.

> Nota de nomenclatura: o SDK do BaaS já exporta um tipo chamado `Base44Client`. Para
> evitar ambiguidade, o contrato da aplicação tem nome próprio (decisão D-04).

## 2. Superfície

### 2.1 Repositório de entidade

Toda entidade expõe as mesmas cinco operações:

| Operação | Entrada | Retorno | Observação |
|----------|---------|---------|------------|
| Listar | campo de ordenação opcional, limite opcional | lista de registros | Ordenação aceita **um** campo |
| Filtrar | condições, ordenação opcional, limite opcional | lista de registros | Comparação apenas por igualdade |
| Criar | dados do registro | registro criado | Identificador e data de criação são preenchidos pelo servidor |
| Atualizar | identificador, dados parciais | registro atualizado | Identificador é preservado |
| Excluir | identificador | confirmação de sucesso | — |

Restrições de ordenação e de filtro são **deliberadamente restritas** ao que as duas
implementações suportam de fato: um campo de ordenação e comparação por igualdade.

### 2.2 Entidades conhecidas

O registro é **fechado** (decisão D-02): paciente, consulta, agendamento, prescrição,
exame, médico, modelo de documento, registro de acesso e a entidade embutida User do
BaaS (usada na exclusão de conta). Referenciar qualquer outro nome não compila.

### 2.3 Leitura com escopo

As cinco entidades clínicas (paciente, consulta, agendamento, prescrição e exame) **não
expõem leitura sem escopo**. A leitura acontece por uma destas formas:

| Forma | Escopo | Comportamento |
|-------|--------|---------------|
| Leitura do próprio dono | do usuário da sessão | O filtro de dono é aplicado automaticamente |
| Filtro do próprio dono | do usuário da sessão | Filtro de dono somado às condições informadas; informar o dono manualmente **não compila** |
| Leitura administrativa | declarado explicitamente | Sem filtro de dono |

As três entidades restantes (médico, modelo e registro de acesso) têm leitura livre
para usuário autenticado, conforme a regra de acesso do domínio.

### 2.4 Integrações

Envio de e-mail transacional (`integrations.Core.SendEmail`), usado na confirmação de
agendamento; o adaptador offline rejeita explicitamente.

## 3. Erros

| Situação | Comportamento |
|----------|---------------|
| Registro não encontrado na atualização | Rejeição com mensagem que identifica a entidade e o identificador |
| Arquivo ausente no envio | Rejeição com mensagem indicando que nenhum arquivo foi fornecido |
| Corrupção do armazenamento local | O conteúdo é ignorado e os dados de exemplo são regravados |

O contrato **não** define tratamento de erro de autorização: a autorização é do
servidor e permanece lá.

## 4. Idempotência e concorrência

| Operação | Idempotente | Observação |
|----------|-------------|------------|
| Listar, filtrar | sim | Somente leitura |
| Criar | não | Cada chamada gera novo identificador |
| Atualizar | sim | Mesma entrada produz o mesmo resultado |
| Excluir | sim | Excluir registro já ausente não falha |

Não há controle de concorrência otimista no contrato. A última escrita prevalece, que
é o comportamento atual.

## 5. Timeouts e limites

Não há timeout próprio no contrato: o tempo limite é o da camada de rede da
implementação online. No modo offline não há espera de rede. Limites por consulta
permanecem os do legado e não são alterados por esta feature.

## 6. O que este contrato **não** garante

Esta seção é a mais importante do documento.

- **Não valida autorização.** O escopo é uma declaração de quem chama, verificada
  apenas na forma. Código que declarar escopo administrativo indevidamente continua
  compilando.
- **Não impede acesso indevido a dado.** Quem impede é a regra de acesso do servidor,
  que permanece intocada.
- **Não substitui a proteção de campo sensível**, que continua sendo do servidor.
- **Não corrige** as não conformidades de segurança já auditadas. Elas seguem
  registradas como pendência de codificação, fora do escopo desta feature.

## 7. Critérios de conformidade

Uma implementação está em conformidade quando:

1. Expõe integralmente a superfície da seção 2, com as mesmas formas de entrada e
   saída.
2. Recusa valor fora dos conjuntos fechados de status e tipo.
3. Obriga o consentimento completo quando o consentimento é aceito.
4. Não permite leitura de dado clínico sem escopo declarado.

A conformidade é verificada em tempo de compilação, não por teste em tempo de
execução.

---
*Gerado pelo Reversa-Plan em 2026-09-17.*
