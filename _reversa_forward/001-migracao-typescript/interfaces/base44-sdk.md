# Contrato: SDK do BaaS (`@base44/sdk`)

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Tipo: biblioteca externa — **não alterado por esta feature**
> Confidência: 🟢 CONFIRMADO

## 1. Situação

Nenhuma alteração. A biblioteca é consumida como já era, na mesma versão declarada no
manifesto do projeto, e nesta migração nenhuma dependência é adicionada, removida ou
atualizada. Esta ficha existe para registrar o que foi verificado sobre o contrato
externo, não para propor mudança.

## 2. O que foi verificado

| Aspecto | Achado | Consequência para a feature |
|---------|--------|------------------------------|
| Tipos publicados pela biblioteca | Sim, a biblioteca publica definições de tipo próprias | Não é necessário criar declaração de tipo manual para ela |
| Nome do tipo principal | A biblioteca exporta um tipo chamado `Base44Client` | Conflito de nome com o contrato da aplicação; resolvido por decisão D-04 |
| Acesso às entidades | Aceita tanto nomes conhecidos quanto índice aberto | A feature usa **nomes conhecidos**, por decisão D-02, para que nome errado não compile |
| Operações por entidade | A biblioteca oferece mais operações do que o legado usa | O contrato da aplicação restringe ao subconjunto efetivamente usado |
| Forma de criação do cliente | Função de fábrica que recebe identificador da aplicação, token e endereço do servidor | Inalterada |

## 3. Operações efetivamente usadas

| Operação | Uso no legado | No contrato da aplicação |
|----------|---------------|--------------------------|
| Listar entidade | sim | sim |
| Filtrar entidade | sim | sim |
| Criar entidade | sim | sim |
| Atualizar entidade | sim | sim |
| Excluir entidade | sim | sim |
| Buscar por identificador | **não** | fora do contrato; a busca por identificador é feita por filtro |
| Criar/atualizar em lote | **não** | fora do contrato |
| Contagem | **não** | fora do contrato |
| Inscrição em tempo real | **não** | fora do contrato |
| Autenticação | sim (usuário da sessão, sair, redirecionar) | sim |
| Envio de arquivo | sim | sim |
| Registro de uso do aplicativo | sim, sem efeito | sim |

Manter o contrato no subconjunto usado é deliberado: um contrato que espelha a
biblioteca inteira não protege nada, porque nada nele é específico do domínio.

## 4. Riscos associados

| Risco | Mitigação |
|-------|-----------|
| Atualização da biblioteca alterar a forma das operações | Nenhuma nesta feature. O contrato isola o consumo: uma mudança na biblioteca passa a ser detectada na verificação de tipos, em vez de em produção |
| O tipo do SDK e o contrato da aplicação serem confundidos | Nomes distintos (D-04) e adaptador único |

## 5. Fora de escopo

- Atualização da versão da biblioteca.
- Adoção de operações não usadas hoje.
- Qualquer mudança no comportamento de autorização, que é do servidor.
