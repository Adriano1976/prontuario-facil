# Onboarding: Correção da rastreabilidade da paridade visual na matriz

> Identificador: `007-matriz-paridade-visual`
> Data: `2026-09-22`
> Para quem vai conferir a entrega pela primeira vez. Passo a passo executável, na ordem.

## Antes de começar

- Nada a instalar. Nenhuma dependência nova, nenhum serviço, nenhum banco.
- Os comandos rodam da raiz do projeto (`D:\Projetos\prontuario-facil`).
- Tempo esperado de conferência: **5 a 10 minutos**.

## 1. Ver o antes e o depois das linhas corrigidas

```powershell
git diff -- _reversa_sdd/code-spec-matrix.md
```

**O que conferir:**

1. A linha da tabela de destino referente a `Paridade visual (screens/V01 a V16)` **não** diz mais "Lacuna declarada" nem `present: false`; ela descreve trabalho transferido com destino nomeado.
2. A nota de saldo logo abaixo da tabela traz a conta **19 concluídos / 31 transferidos** (15 de fluxo + 16 visuais) e a **data-base 2026-09-22**.
3. A linha `**Paridade visual** (16 cenários)` em `### Lacunas de prova` deixou de dizer "Depende de captura dourada inexistente" e nomeia a lacuna remanescente (execução/harness).
4. A seção `### Como a prova é executada` ganhou **uma linha** apontando `_reversa_sdd/screens/golden/manifest.yaml` e a cobertura **16 de 16**.
5. **Nada mais mudou.** O diff deve ter poucas linhas. Se aparecerem seções inteiras reescritas, o RF-06 foi violado.

## 2. Confirmar que a afirmação corrigida é verdadeira

```powershell
# quantos goldens estão presentes
Select-String -Path _reversa_sdd\screens\golden\manifest.yaml -Pattern 'present: true' | Measure-Object
```

**Esperado**: **26 ocorrências** de `present: true` no arquivo — **24 são entradas de tela** e 2 são comentários do cabeçalho/sumário. Para contar só as entradas:

```powershell
(Select-String -Path _reversa_sdd\screens\golden\manifest.yaml -Pattern '^    present: true').Count
```

**Esperado**: 24.

`present: false` aparece **1 vez**, e apenas no comentário do cabeçalho que descreve a edição anterior (`manifest.yaml:6`) — **nenhuma entrada de tela** o contém.

```powershell
# quantos cenários de paridade visual existem
(Get-ChildItem _reversa_sdd\migration\parity_tests\screens -Filter *.feature | Measure-Object).Count
```

**Esperado**: 16 arquivos — um por cenário `PT-V01`…`PT-V16`.

## 3. Conferir que nenhum identificador foi renumerado

```powershell
git diff -- _reversa_sdd/code-spec-matrix.md | Select-String -Pattern '^-' | Select-String -Pattern 'PT-|BR-|W0|GC-|AMB-|DEV-'
```

**Esperado**: nenhuma linha removida contendo identificadores. As linhas removidas devem conter apenas o texto antigo das afirmações corrigidas. Se algum `PT-Vnn`, `BR-*`, `W00x`, `AMB-*` ou `DEV-*` aparecer como removido, **pare e reporte**: renumerar invalidaria cadeias de rastreio vivas.

## 4. Rodar a guarda de encoding

```powershell
npm run prova:encoding
```

**Esperado**: árvore íntegra. A guarda varre `src/` e **toda pasta `_reversa_*`** (`src/test/mojibake.mjs:286-289`), então ela valida o arquivo editado — encoding UTF-8 válido e ausência de BOM. Se acusar o arquivo da matriz, a edição corrompeu a acentuação: reverta e refaça.

## 5. Conferir que a suíte não foi afetada

```powershell
npm test
```

**Esperado**: 132 verificações em 23 arquivos, 0 falhas. A feature não toca código, então a contagem **não deve mudar**. Se mudou, algo saiu do escopo.

> Opcional: o tempo da suíte é uma propriedade condicional da máquina (medido entre 75 s e 122 s no mesmo conjunto). Só a contagem de verificações é afirmação desta feature.

## 6. Conferir o adendo publicado

```powershell
Get-Content _reversa_sdd\addenda\007-matriz-paridade-visual.md -TotalCount 12
```

**Esperado**: o adendo existe e está **vigente** (seção `## Vigência` com a linha `Vigente desde 2026-09-22.` e **sem** linha de superação). Ele deve declarar que a leitura da matriz mudou e que o adendo `002` permanece vigente e intocado.

## 7. Conferir que o adendo 002 não foi editado

```powershell
git status --short -- _reversa_sdd/addenda/
```

**Esperado**: o adendo `002-prova-automatizada.md` **não** aparece como modificado. Se aparecer, a decisão D-04 foi violada.

## Problemas comuns e o que significam

| Sintoma | Significado | Ação |
|---|---|---|
| O diff da matriz tem dezenas de linhas | Transbordo: seções não afetadas foram tocadas | Reverter e refazer só as linhas dos RF-01 a RF-05 |
| `prova:encoding` acusa a matriz | Acentuação perdida ou BOM introduzido | Reverter o arquivo e reescrever em UTF-8 sem BOM |
| `npm test` com contagem diferente de 132 | Algo de código mudou — fora do escopo | Investigar; esta feature não deve alterar `src/` |
| Adendo `002` modificado | Violação de D-04 | Restaurar o `002` e registrar a reconciliação apenas no adendo `007` |
| Ainda há `present: false` no manifest | A premissa da correção não vale | Parar: a feature não deve declarar trabalho transferido onde não há referência |

## 8. Resultado da conferência — execução de 2026-09-22 (T010)

Registro medido no fechamento da feature. Os passos acima descrevem o que conferir; aqui está o que **foi encontrado**.

| Passo | Resultado |
|---|---|
| 1. Diff das linhas corrigidas | **6 hunks**, todos nos lugares previstos: inserção na seção de prova (`+204,9`) e uma linha por correção (`-297`, `-299`, `-302,3`, `-318`, `-341`). **18 inserções, 7 remoções.** Nenhuma seção reescrita |
| 2. Goldens presentes | **24 entradas** de tela com `present: true`; **16** arquivos `.feature` de tela. `present: false` aparece **1 vez**, só no comentário de cabeçalho que descreve a edição anterior — nenhuma entrada |
| 3. Varredura de identificadores | **Nenhum** identificador (`PT-`, `BR-`, `W0xx`, `AMB-`, `DEV-`) em linha removida. Nada renumerado |
| 4. `npm run prova:encoding` | **Verde.** 428 arquivos de texto verificados nas raízes `src`, `_reversa_docs`, `_reversa_forward`, `_reversa_sdd`; nenhum mojibake. *Era 412 quando o `requirements.md` foi escrito — os 16 a mais são os arquivos de texto desta própria feature* |
| 5. `npm test` | **Tentada em 2026-09-22 e recusada pelo ambiente**: `Error: spawn EPERM` (errno -4048) no `ensureServiceIsRunning` do esbuild, em modo confinado — mesma restrição registrada no onboarding da feature 001, §7. A contagem **não pode ter mudado** porque nenhum arquivo de `src/` foi tocado — confirmado por `git status`, que lista apenas `_reversa_sdd/`, `_reversa_forward/` e `.reversa/` |
| 6. Adendo publicado | **Pendente por desenho**: o adendo `007` é produzido pelo `/reversa-sync`, o estágio seguinte. O `legacy-impact.md` (pré-requisito do sync) foi gerado, com o aceite do finding `A002` registrado |
| 7. Adendo `002` intocado | **Confirmado**: não aparece como modificado em `git status` |
| Extra. Integridade do arquivo | **479 quebras LF, 0 CRLF, sem BOM.** Acentuação íntegra |

### O que a conferência **não** prova

- **Não prova a paridade visual.** O golden é referência capturada, não prova executada: a execução depende do harness de paridade visual, que não existe no projeto. Os 16 cenários seguem como conferência humana (`parity_specs.md#Lacunas declaradas`).
- **Não prova o adendo** — ele só existe depois do `/reversa-sync`.
- **Não rodou a suíte** (item 5 acima). Se você quiser essa linha fechada, rode `npm test` fora do modo confinado e confira **132 verificações em 23 arquivos, 0 falhas**.

## O que **não** se espera encontrar

- Nenhuma mudança em `src/`, `package.json`, `tsconfig.json` ou configurações.
- Nenhum golden novo, nenhuma captura nova, nenhuma recaptura.
- Nenhum teste automatizado novo: a verificação desta feature é o diff conferido, a guarda de encoding e a suíte inalterada.
