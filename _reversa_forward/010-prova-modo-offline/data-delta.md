# Delta de Dados: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/010-prova-modo-offline/requirements.md`
> Modelo extraído de referência: `_reversa_sdd/modo-offline/requirements.md#3. Estrutura de Dados`;
> `_reversa_sdd/data-dictionary.md` (Apêndice A — Seed do Modo Offline)

## 1. Resumo

**Nenhuma mudança de dados.** A feature não cria, altera nem remove campo, coleção, chave de
armazenamento ou migração. Ela **lê** dois conjuntos que já existem — o seed de demonstração e o
armazenamento local do navegador — e não grava nada fora do ambiente de prova.

É a quinta feature consecutiva de prova com delta de dados vazio (005, 006, 008, 009 e agora 010).
O padrão é estrutural, não coincidência: o instrumento de prova do projeto é aditivo por construção,
e é isso que faz o critério de perímetro ser verificável por comando em vez de prometido.

## 2. O que a prova **lê** do modelo (referência, sem alteração)

| Conjunto | Chave ou origem | Papel na massa | Fonte no legado |
|----------|-----------------|----------------|-----------------|
| Seed de demonstração | `src/api/mockSeed.ts` — objeto tipado contra as oito entidades | É o **valor esperado** na prova de semeadura e o ponto de queda na prova de conteúdo corrompido | `data-dictionary.md` Apêndice A; `mockSeed.ts` |
| Coleção persistida | Armazenamento local, sob a chave com prefixo `mock_db_` por entidade | É o **objeto observado**: o que o adaptador grava e relê | `code-analysis.md#10.4 Persistência` |
| Entidade sem seed | Nome fora das oito do domínio, obtido por acesso dinâmico | Dá ponto de partida **vazio e determinístico** às verificações de criação, filtro, ordenação e exclusão, sem tocar nos dados de demonstração | `modo-offline/requirements.md#3.2` |
| Registro com dono alheio | Gravado **direto** no armazenamento, com dono diferente do usuário de demonstração | É a forma forte da prova de ausência de regra de acesso: o registro de **outra origem** também é visível e editável | `BR-OFF10`; limitação `L1` |

> **Nota de escopo.** O seed entra como **referência**, e não como massa injetada. A promessa é
> "semeia a partir do seed": uma massa própria provaria a massa, e não a origem.

## 3. O que a prova **não** cria

1. **Nenhum campo, coleção, chave ou índice.** O modelo do modo offline permanece o do legado.
2. **Nenhuma migração.** Não há dado existente a transformar.
3. **Nenhum dado de produção.** A massa vive no armazenamento local do ambiente simulado, que é
   limpo entre verificações.
4. **Nenhuma alteração no seed.** `mockSeed.ts` é referência de leitura; corrigir ou ampliar o seed
   mudaria os dados de demonstração da aplicação, o que está fora do perímetro.
5. **Nenhum arquivo de massa compartilhado novo.** As coleções de prova são construídas dentro do
   próprio arquivo, porque usam um nome de entidade que não existe no domínio — não há o que
   compartilhar com outras features.

## 4. Conferência de que o modelo ficou intocado

Medido por comando no fechamento, como nas features anteriores:

| Verificação | Comando | Resultado esperado |
|-------------|---------|--------------------|
| Adaptador intocado | Estado do repositório sobre `src/api/mockClient.ts` | vazio |
| Seed intocado | Estado do repositório sobre `src/api/mockSeed.ts` | vazio |
| Ativação e sessão intocadas | Estado do repositório sobre `src/api/base44Client.ts`, `src/lib/AuthContext.tsx`, `src/types/User.ts` | vazio |
| Provas herdadas intocadas | Estado do repositório sobre `src/api/__tests__/mockClient.test.ts` e `src/lib/__tests__/AuthContext.test.tsx` | vazio |

## 5. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` — delta de dados vazio | reversa |
