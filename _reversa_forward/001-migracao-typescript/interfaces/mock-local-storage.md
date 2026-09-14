# Contrato: armazenamento local do modo offline

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Tipo: armazenamento do navegador — **formato não alterado por esta feature**
> Confidência: 🟢 CONFIRMADO

## 1. Situação

O formato de armazenamento **não muda**: mesmas chaves, mesma serialização, mesmo
mecanismo de carga. O que muda é apenas o **conteúdo dos dados de exemplo**, alinhado
ao contrato das entidades (decisão D-08).

## 2. Estrutura

| Aspecto | Valor |
|---------|-------|
| Mecanismo | Armazenamento local do navegador |
| Chave por entidade | Prefixo fixo `mock_db_` seguido do nome da entidade |
| Serialização | Texto em formato de objeto estruturado |
| Carga inicial | Quando a chave não existe, os dados de exemplo são gravados e devolvidos |
| Expiração | Não há |
| Escopo | Por origem (endereço) no navegador do usuário |

## 3. Operações e efeitos

| Operação | Efeito no armazenamento |
|----------|--------------------------|
| Listar | Lê a chave da entidade; se ausente, grava os dados de exemplo e devolve |
| Filtrar | Igual a listar, com filtro aplicado em memória |
| Criar | Acrescenta registro com identificador novo e data de criação atual |
| Atualizar | Substitui o registro, preservando o identificador |
| Excluir | Remove o registro e regrava a coleção |

## 4. Comportamento em caso de corrupção

Se o conteúdo armazenado não puder ser interpretado, ele é **ignorado em silêncio** e
os dados de exemplo são regravados. Isso é comportamento atual e **não muda** nesta
feature.

> Consequência a conhecer: uma corrupção não gera aviso ao usuário. O sistema
> simplesmente reapresenta os dados de exemplo.

## 5. Diferenças conhecidas em relação ao modo online

| Aspecto | Modo online | Modo offline |
|---------|-------------|--------------|
| Isolamento por dono | Aplicado pelo servidor | **Não aplicado** — o armazenamento local não tem regra de acesso |
| Usuário da sessão | Autenticado, com papel | Usuário de demonstração, **sem papel** |
| Persistência | No servidor | Somente no navegador do usuário |
| Dados de exemplo | Não existem | Gravados na primeira leitura |

O isolamento não aplicado no modo offline é comportamento **intencional e
documentado**, não defeito. O que a feature faz é tornar a ausência de papel
**explícita** no contrato, para que trecho dependente de papel não compile cego.

## 6. Impacto da feature neste contrato

| Item | Muda? |
|------|-------|
| Chaves de armazenamento | não |
| Formato de serialização | não |
| Mecanismo de carga e gravação | não |
| Conteúdo dos dados de exemplo | **sim** — alinhado ao contrato das entidades (etapa 6) |
| Necessidade de limpar o armazenamento após a mudança | sim, no ambiente de demonstração, para os exemplos serem regravados |
