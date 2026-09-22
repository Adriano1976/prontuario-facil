# Investigação: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/008-prova-contrato-dados/requirements.md`
> Roadmap: `_reversa_forward/008-prova-contrato-dados/roadmap.md`

## 1. O que foi investigado

O grupo `Contrato de dados (10)` da matriz de rastreabilidade transfere **4 cenários** de
paridade (`PT-010`) descritos em
`_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature`. A investigação
perseguiu quatro perguntas:

1. **Com que instrumento se prova um contrato** — porque os quatro cenários são de
   **compilação**, e nenhuma das cinco rodadas anteriores usou esse instrumento.
2. **O que já está provado** — para não reescrever caso que já existe e não criar dois pontos
   de verdade para a mesma cláusula.
3. **O que o contrato garante de fato** — e o que ele apenas declara.
4. **Como transformar uma ressalva em medição** — porque um buraco provável que fica só
   declarado é uma promessa que ninguém conferiu.

## 2. Onde cada promessa vive

| Cenário | Superfície observável | Instrumento |
| :--- | :--- | :--- |
| `PT-010.1` Acesso exige escopo de ownership | `OwnedEntity` **não expõe** `list`/`filter` crus; `listOwned`/`filterOwned`/`filterAsAdmin` exigem o escopo | Comando de casos negativos — **3 casos já existentes** |
| `PT-010.2` Papel explícito no tipo | `OfflineUser` com `role?: never`; `AuthenticatedUser` com `role?: UserRole`; o estreitamento acontece na camada de sessão | Comando de casos negativos — **nenhum caso hoje** |
| `PT-010.3` SDK e mock sob a mesma interface | `createEntityRepository` com os tipos de domínio; `createAppDataClient` no encaixe; os adaptadores reais | `typecheck` sobre o projeto — **citado**, não reescrito |
| `PT-010.4` Enums fechados | `AppointmentStatus`, `ConsultationStatus`, `PrescriptionType` e demais unions | Comando de casos negativos — **1 caso cobre `ConsultationStatus`** |
| `F-03` (declaração) O compilador não valida autorização | `AdminScope` e o comentário de `scopedRead.ts` | **Caso positivo novo** — passa a ser medido |

Três conclusões caem direto da tabela:

- **`PT-010.1` já está provado.** Três dos nove casos existentes cobrem-no: leitura escopada sem
  informar o escopo, escopo administrativo entregue a método de dono, e filtro de dono informado
  à mão. Reafirmá-los seria duplicação.
- **`PT-010.3` não tem caso negativo possível no cliente.** Os adaptadores reais são os arquivos
  do projeto; o que se pode provar é que um adaptador **incompleto** seria recusado — e que os
  dois reais compilam, o que o `typecheck` já roda.
- **`F-03` é o único item do conjunto que é provável e não estava provado.**

## 3. Alternativas avaliadas

### 3.1 Com que instrumento provar

| Alternativa | Veredito |
| :--- | :--- |
| Comando de casos negativos + `typecheck` citado | **Escolhida** (D-01, decisão `1a`). É o instrumento que o próprio contrato exige, e o comando já existe |
| Comparação de comportamento entre os adaptadores | Descartada. O SDK real exigiria rede e credenciais; exercitar só o mock e comparar com ele mesmo não diria nada sobre o outro adaptador |
| Um arquivo de teste de unidade por cenário | Descartada. Não há comportamento a medir: o que se prova é compilação |

### 3.2 O que fazer com os casos que já existem

| Alternativa | Veredito |
| :--- | :--- |
| Citar pelos identificadores e escrever só o que falta | **Escolhida** (D-02, decisão `2a`) |
| Reafirmar cada cláusula em caso novo | Descartada. Dois pontos de verdade para a mesma cláusula, e a matriz teria de manter os dois |
| Citar tudo e não escrever nada | Descartada. `PT-010.2` não tem caso nenhum, e `PT-010.4` cobre um único conjunto |

### 3.3 Como transformar a ressalva do `F-03` em medição

O comando, hoje, só sabe expressar **recusa**: um arquivo sem erro é lido como "NÃO foi recusado
pelo gate" e entra na lista de falhas.

| Alternativa | Veredito |
| :--- | :--- |
| Acrescentar um campo declarativo que marca o caso como **positivo** (deve compilar) | **Escolhida** (D-03 e D-04, decisão `5a`). É o mínimo que faz o arnês expressar as duas intenções, e serve às próximas features |
| Um segundo comando separado | Descartada. Duplicaria o arnês, a limpeza e a conferência de resíduo |
| Deduzir pelo nome do arquivo (`positivo-*`) | Descartada. Convenção implícita: renomear o arquivo mudaria o veredito sem aviso |
| Declarar o buraco e não medir | Descartada pela decisão `5a`. A ressalva já está no código; repeti-la na matriz não acrescenta medição |
| Um arquivo versionado que demonstra a brecha | Descartada. Ficaria permanente no repositório como exemplo de como contornar o escopo |

### 3.4 A guarda de codificação órfã

A guarda tem 420 linhas, autoteste próprio com 8 verificações, marcador de isenção e tratamento
do cp1252 — é o artefato de prova mais elaborado do projeto, e **nenhum `actions.md` o
reivindica**.

| Alternativa | Veredito |
| :--- | :--- |
| Adotá-la nesta feature, por registro | **Escolhida** (D-05, decisão `3a`). Esta é a feature de infraestrutura de gate; adotá-la aqui custa uma ação de registro |
| Deixá-la como lacuna | Descartada. O furo continua, e a próxima feature de gate teria a mesma conversa |
| Absorvê-la no comando de casos negativos | Descartada. Misturaria duas provas de naturezas diferentes — uma varre bytes, a outra compila tipos |

## 4. Divergências entre a extração e o código

1. **A matriz listava a guarda de codificação como prova sem dono** e cita o gate de tipos na
   mesma condição. Metade disso deixa de ser verdade nesta feature: a guarda passa a ter dono.
2. **O `PT-010.3` afirma mais do que o código verifica.** A cláusula "as operações do mock têm os
   mesmos tipos de retorno que o SDK" não é verificada: `createEntityRepository` converte cada
   retorno com `as`.
3. **O ponto de ligação é uma asserção.** `bindAdapter` faz `as unknown as Parameters<...>`, com
   justificativa de contravariância no próprio código. O cenário vale entidade por entidade, e
   não no encaixe.
4. **A ressalva de `F-03` está em dois lugares e nenhum deles a mede.** `contract.ts:181-184` e
   `scopedRead.ts:30-32` dizem que o compilador confere forma e nunca autorização. Agora há um
   caso positivo afirmando isso.
5. **O ramo administrativo de `applyScope` é inalcançável pelo tipo.** `filterOwned` só aceita
   `UserScope`, mas `applyScope` ramifica em `scope.kind === 'admin'`. O caso existente
   `escopo-admin-em-metodo-de-dono` prova que o **tipo** faz o trabalho; o ramo permanece como
   defesa de runtime, alcançável só por dentro.
6. **Dois artefatos de regras do projeto citam identificadores que colidem.** `BR-MIGRAR-0xx`
   (dos tipos e do contrato) e `BR-OFF0x` (do modo offline) descrevem superfícies que se
   sobrepõem. Toda citação nesta feature qualifica a origem.
7. **O `PT-010.4` nomeia dois conjuntos e um terceiro está coberto por acaso.** O cenário cita
   "status (Appointment/Consultation) e tipos documentais"; o caso existente cobre
   `ConsultationStatus` — que o cenário também nomeia, mas por outra porta.

## 5. O que o contrato garante, e o que ele apenas declara

Esta é a tabela que a feature existe para tornar legível:

| Cláusula de `PT-010` | Garantida por | Verificada? |
| :--- | :--- | :--- |
| Leitura de entidade sob RLS exige escopo | Ausência de `list`/`filter` em `OwnedEntity` | ✅ **sim**, por 3 casos existentes |
| O papel é explícito no tipo | `role?: never` na variante offline | ✅ **sim**, por casos novos |
| SDK e mock implementam o mesmo contrato | `createEntityRepository` por entidade | ✅ **entidade por entidade** |
| SDK e mock devolvem os mesmos tipos | — | 🔴 **não**: os retornos passam por `as` |
| O encaixe no registry é verificado | — | 🔴 **não**: `bindAdapter` asserta |
| Valores fora dos conjuntos fechados não compilam | As unions do domínio | ✅ **sim**, por caso existente e casos novos |
| O escopo informado é **legítimo** | — | 🔴 **não**, e agora **medido**: escopo administrativo indevido compila |
| A defesa real é a RLS do servidor | O BaaS, fora do cliente | ⚪ **fora do alcance** |

## 6. Padrões aplicáveis

| Padrão | Aplicação nesta feature |
| :--- | :--- |
| Cada caso declara o motivo pelo qual a recusa é a certa | Campo `espera` ou `codigo` em cada caso, como nos 9 existentes |
| Citar em vez de duplicar | Os casos que já cobrem `PT-010.1` e parte de `PT-010.4` entram pela citação, como a 004 fez com o caso do tipo fechado |
| Provar o que dá, declarar o que não dá | As três cláusulas não verificadas ficam declaradas; a quarta, por ser provável, é medida |
| Uma verificação por promessa, e o que não é coberto fica visível | A tabela caso × cenário nomeia o que **não** está coberto |
| A prova observa, não altera | O contrato não é tocado: só o arnês de provas |
| Arquivo compartilhado exige releitura | A matriz é relida do zero antes de cada edição (D-11) |

## 7. Fontes externas

- [TypeScript — estreitamento de união por campo discriminante](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) — a base de `role?: never` e do estreitamento por presença de `role`.
- [TypeScript — `never` e tipos impossíveis](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type) — por que a comparação de papel sobre a variante offline é recusada.
- [TypeScript — `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — o que garante que nenhum valor do catálogo de auditoria sai do enum, no caso já existente.
- [TypeScript — variância e atribuibilidade de métodos](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#function-parameter-bivariance) — a razão da asserção em `bindAdapter`.

## 8. O que **não** foi investigado

- **O SDK real.** A conformidade do adaptador online é verificada por tipo, e não por execução; exercitá-lo exigiria rede e credenciais.
- **A autorização.** Nenhuma prova do cliente alcança a RLS do BaaS.
- **Os retornos dos adaptadores em execução.** A cláusula de paridade de retorno permanece declarada, e não provada.
- **O comportamento do modo offline**, cujas limitações L1 a L7 pertencem ao grupo `09`.
- **A guarda de codificação por dentro.** A adoção é de registro: as 420 linhas e o autoteste não são objeto desta feature.
- **Os conjuntos fechados que o cenário não nomeia** — `TemplateType`, `ExamType` e as ações de auditoria, cada um pertencente ao seu módulo.

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
