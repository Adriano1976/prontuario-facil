# Investigação: Prova automatizada do Modo offline

> Identificador: `010-prova-modo-offline`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/010-prova-modo-offline/requirements.md`
> Roadmap: `_reversa_forward/010-prova-modo-offline/roadmap.md`

## 1. A pergunta desta investigação

O modo offline é a única superfície do projeto cuja promessa **não vive numa tela**. Ela vive em
dois lugares que se comportam de forma diferente sob teste: um adaptador de dados, que se exercita
chamando métodos, e uma **decisão de carregamento de módulo**, que só existe uma vez por processo.

A pergunta é: **como se prova uma escolha que acontece no carregamento**, sem montar a aplicação
inteira e sem depender de configuração do provedor real?

Essa é a dificuldade central da rodada. A segunda pergunta, menor mas real, é o que fazer com as
sete limitações declaradas do adaptador — porque algumas são comportamento observável e outras não
são comportamento nenhum.

## 2. O que o projeto já tem para esta prova

### 2.1 As duas provas herdadas

| Arquivo | Feature | Verificações | O que cobre |
|---------|---------|--------------|-------------|
| `src/api/__tests__/mockClient.test.ts` | 001 | 3 | Criação e listagem com dono offline; sessão devolvendo o usuário de demonstração; o defeito de escopo corrigido |
| `src/lib/__tests__/AuthContext.test.tsx` | 005 | 1 | O caminho offline da sessão, com **ambiente substituído e registro de módulos descartado** |

A segunda é a descoberta que muda o plano. Ela já faz exatamente o que a frente de ativação precisa:

```
vi.stubEnv('VITE_OFFLINE', 'true');
vi.resetModules();
const { AuthProvider, useAuth } = await import('../AuthContext');
```

Isso prova que o instrumento **funciona neste projeto**, nesta versão, com esta configuração — e é
evidência mais forte do que qualquer documentação de biblioteca, porque foi medida aqui. As duas
verificações que ela e o arquivo da feature 001 cobrem entram por **citação** (decisão `D-12`).

### 2.2 Os pontos de leitura da variável, e por que eles importam

| Módulo | Linha | Quando lê | Consequência para a prova |
|--------|-------|-----------|---------------------------|
| `src/api/base44Client.ts` | 21 | **No carregamento do módulo** | A troca de ambiente exige **descartar o registro de módulos** antes da importação |
| `src/lib/AuthContext.tsx` | 130 | **A cada verificação de estado** | A troca de ambiente basta, porque a leitura é tardia |

São **dois** pontos de leitura da mesma decisão, e a extração descreve um só. Isso está registrado
como achado no `requirements.md#10`, e é o que obriga os dois arranjos a viverem em arquivos
separados: um deles precisa mexer no registro de módulos, e o outro não.

## 3. Armadilhas herdadas, e como cada uma reaparece

| Armadilha | Onde foi medida | Como reaparece aqui |
|-----------|-----------------|---------------------|
| Dublê que conta renderizações em vez de pedidos | Feature 006 | **Não se aplica**: nenhuma verificação desta feature renderiza tela |
| Asserção que mede o dublê em vez do objeto | Feature 005 | A metade positiva da ativação afirma o **comportamento do adaptador**, e não a identidade do objeto exportado (`D-03`) |
| Ambiente trocado sem efeito porque a leitura já aconteceu | *(nova nesta rodada)* | É a armadilha central: sem descartar o registro de módulos, `base44Client` continua com o valor antigo (`D-04`) |
| Estado remanescente entre verificações | Feature 003, com o relógio | O armazenamento local persiste por origem: sem limpeza, uma verificação herda a coleção da anterior (`R-04`) |
| Identificador gerado dependente do ambiente | *(nova nesta rodada)* | O adaptador usa o gerador do navegador quando existe e cai para um identificador próprio quando não existe — afirmar o formato tornaria a prova dependente do ambiente (`D-10`) |
| Fábrica de dublê não pode referenciar vínculo importado | Feature 006 | A fábrica que substitui o provedor usará apenas literais ou o mecanismo de içamento |

## 4. Alternativas de instrumento avaliadas

### A) Um único arquivo de prova — **descartada**

Seria mais simples de navegar. Descartada porque a frente de ativação precisa **descartar o registro
de módulos**, o que é uma intervenção global: se as duas frentes dividissem arquivo, os vínculos já
importados pela frente do adaptador passariam a conviver com um registro que muda no meio da
execução. Dois arranjos, dois arquivos (`D-01`).

### B) Dois arquivos, com a fábrica do provedor substituída — **escolhida**

A frente de ativação substitui o ambiente, descarta o registro de módulos, substitui a fábrica do
provedor e importa o módulo dinamicamente. A frente do adaptador exercita os repositórios sobre o
armazenamento local, sem tocar em ambiente nem em registro.

### C) Construção real do provedor na metade negativa — **descartada**

Seria a prova mais fiel: carregar o provedor de verdade com a variável desligada e observar que o
cliente é o dele. Descartada por fragilidade — o módulo constrói um cliente com os parâmetros da
aplicação no carregamento, e sem configuração isso pode lançar por motivo **alheio à promessa**.
Uma verificação que falha pelo motivo errado é pior que uma ausente, e o risco `R-03` mostraria
exatamente esse sintoma.

### D) Provar apenas a metade positiva — **descartada**

Seria o menor custo. Descartada porque o cenário enuncia **as duas** metades: "com a variável
ausente ou falsa o comportamento volta ao SDK real". Provar só a positiva deixaria a metade
declarada sem medição, que é a terceira opção apresentada no clarify e a única que não mede nada.

### E) Provar pela tela, montando a aplicação em modo offline — **descartada**

Seria a prova mais próxima da experiência: ligar a variável, montar a aplicação e observar os cinco
pacientes de demonstração na listagem. Descartada por três motivos. O primeiro é de **superfície**:
o cenário `PT-009` não descreve tela nenhuma, e a lista de pacientes em modo offline é a mesma tela
que a feature 002 já provou. O segundo é de **custo**: exigiria a árvore inteira da aplicação e o
dublê de roteamento, para medir um adaptador. O terceiro é de **diagnóstico**: quando falha, não se
sabe se o problema é o adaptador ou a tela — e a prova existe para separar as duas coisas.

### F) Prova por inspeção estática do código — **descartada**

Localizar os pontos de leitura da variável e afirmar que existem dois seria rápido e não exigiria
execução. Descartada porque mede a **forma** do código, e não o comportamento: a forma já mudou sem
que o comportamento mudasse, como a feature 009 descobriu com a constante que nunca existiu.

## 5. Como se prova cada limitação

A decisão `1a` do clarify separou o que é comportamento observável do que não é:

| Limitação | Instrumento | Por quê |
|-----------|-------------|---------|
| `L1` sem regra de acesso | **Afirmação forte**: registro com dono alheio, gravado direto no armazenamento, é visível e editável | Não basta o próprio registro ser visível — o de outra origem também é |
| `L2` escritas concorrentes | **Declarada** | O ambiente simulado tem uma aba; fingir duas mediria o fingimento |
| `L3` envio de arquivo não persiste | **Afirmação**: o conteúdo volta como dado embutido e nenhuma coleção é criada | É comportamento observável, com desfecho verificável |
| `L4` filtro estrito | **Afirmação**: valores próximos e distintos, e operadores de intervalo sem efeito | A borda é o que separa igualdade de comparação |
| `L5` ordenação de um campo | **Afirmação**: ascendente, descendente e corte após ordenar | O corte **depois** de ordenar é a parte que se poderia errar |
| `L6` sem leitura direta | **Afirmação**: o repositório não expõe a operação | É a ausência que o cenário descreve |
| `L7` dados no armazenamento | **Declarada** | É risco de privacidade, não comportamento; afirmá-lo diria que expor dados de pacientes é o pretendido |

## 6. Fontes externas consultadas

| Fonte | O que foi extraído | Uso neste plano |
|-------|--------------------|-----------------|
| [Documentação da API de utilitários do Vitest](https://vitest.dev/api/vi.md) | A substituição de variáveis de ambiente é feita por utilitário próprio, e vale para as variáveis expostas ao código | Base da decisão `D-04` |
| [Relato de erro enganoso em acesso a variáveis de ambiente](https://github.com/vitest-dev/vitest/issues/7888) | Ponteiro encontrado na busca sobre acesso **estático** à variável de ambiente; **não foi aberto** | Registrado como caveat para a codificação, caso a substituição não tenha efeito |

Nada além disso foi consultado. A evidência decisiva é **interna**: a prova herdada da sessão já
faz substituição de ambiente com descarte de módulos, neste projeto, e passa. Uma técnica que já
roda aqui vale mais que uma promessa de documentação.

## 7. Padrões aplicáveis

### 7.1 Arranjo da ativação

```
vi.mock('@base44/sdk', ...)            // a fábrica do provedor, substituída
vi.stubEnv('VITE_OFFLINE', 'true')     // ou 'false', conforme a metade
vi.resetModules()                      // o módulo ainda não foi lido
const { base44 } = await import('@/api/base44Client')
// com a variável ligada: a fábrica NÃO foi chamada, e a leitura devolve o seed
// com a variável desligada: a fábrica FOI chamada
```

A substituição da fábrica precisa vir **antes** de qualquer importação do módulo em prova, e o
descarte do registro, antes da importação dinâmica.

### 7.2 Arranjo do adaptador

```
beforeEach(() => localStorage.clear())
```

E, em cada verificação que dependa do estado de partida, a afirmação de que o armazenamento está
mesmo vazio — a limpeza sem conferência é uma suposição, e suposição é o que faz a verificação
passar por acidente.

### 7.3 Nome de entidade sem seed como área de rascunho

O acesso dinâmico devolve repositório para qualquer nome. Usar um nome **fora** das oito entidades
do domínio dá um ponto de partida vazio e determinístico, sem tocar nos dados de demonstração — o
que permite provar criação, filtro, ordenação e exclusão sem que o conteúdo do seed interfira.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
