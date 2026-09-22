# Onboarding: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Para quem vai rodar esta feature pela primeira vez.

## 1. Pré-requisitos

- Node.js 18 ou superior.
- Dependências instaladas: `npm install` — o comando de provas negativas usa o `tsc` de `node_modules`.
- **Nenhum serviço externo.** A prova é de compilação: não há rede, banco nem credencial.
- Nada a configurar.

> **Se você roda dentro de um sandbox com restrição de pipes nomeados**, a suíte de unidade
> (`npm test`) pode falhar com `spawn EPERM` ao carregar o Vitest — é o `esbuild`, não a suíte.
> O comando de provas negativas e a guarda de encoding **não** têm essa dependência e rodam em
> sandbox restrito.

> **E não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell.** O
> `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e
> corrompe o arquivo ao regravar — a rodada 005 pagou esse preço. Use a ferramenta de edição, ou
> `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)`.

## 2. Os comandos, em ordem

| Ordem | Comando | O que ele prova |
| :---: | :--- | :--- |
| 1 | `npm run prova:negativos` | **O comando desta feature.** Escreve os casos, roda o gate de tipos, confere caso a caso e limpa |
| 2 | `npm run prova:encoding` | A guarda de codificação — **adotada por esta feature** |
| 3 | `npm run typecheck` | A cláusula positiva de `PT-010.3`: os dois adaptadores reais honram o contrato |
| 4 | `npm run lint` | Nenhum aviso |
| 5 | `npm test` | A suíte de unidade. Esta feature quase não a move; ela roda para provar que **não caiu** |

A ordem importa: o comando 1 é o que responde pelos quatro cenários de `PT-010`, e os comandos 3
e 5 são as provas **citadas** que o complementam.

## 3. Onde a prova vive

| Arquivo | Papel |
| :--- | :--- |
| `src/test/verificacoes-negativas.mjs` | **Modificado.** O arnês: a lista de casos, cada um com a violação, o motivo esperado e a fonte. Ganha os casos novos e a distinção entre caso que deve ser recusado e caso que deve compilar |
| `src/test/mojibake.mjs` | **Intocado.** A guarda de codificação, adotada por registro |
| `src/test/mojibake.test.mjs` | **Intocado.** O autoteste da guarda, que roda na suíte de unidade |
| `src/api/contract.ts`, `src/api/scopedRead.ts`, `src/api/entities.ts`, `src/types/User.ts` | **Intocados.** São o **objeto** da prova |
| `_reversa_sdd/code-spec-matrix.md` | Ganha a seção do grupo `10`, os limites declarados e a guarda deixando de ser órfã |

**Nenhum arquivo de aplicação é tocado.** O único código que muda é o arnês de provas.

## 4. Onde ler o resultado da feature

| Documento | Para quê |
| :--- | :--- |
| `_reversa_forward/008-prova-contrato-dados/requirements.md` | As 17 promessas e os 11 cenários Gherkin. A seção `#9` tem as cinco decisões da sessão de esclarecimentos |
| `_reversa_forward/008-prova-contrato-dados/roadmap.md` | As 12 decisões técnicas, os 8 riscos e o critério de pronto |
| `_reversa_forward/008-prova-contrato-dados/investigation.md` | A tabela do que o contrato garante e do que ele apenas declara — o conteúdo mais útil da feature |
| `_reversa_forward/008-prova-contrato-dados/data-delta.md` | Por que não há dado nem massa, e os conjuntos fechados envolvidos |
| `_reversa_forward/008-prova-contrato-dados/regression-watch.md` | *(gerado no coding)* O que passa a ser vigiado |
| `_reversa_sdd/code-spec-matrix.md` | O veredito de cada cenário do grupo `10`, com as cláusulas não cobertas |

## 5. O que conferir com os próprios olhos

Cinco coisas que um humano deve verificar, porque o comando pode estar verde **e** errado:

1. **A tabela caso × cenário nomeia o que NÃO é coberto.** É o artefato mais importante da feature. Se ela só listar cobertura, o verde do grupo `10` estará sugerindo autorização verificada — que ninguém verifica.

2. **O caso positivo existe e é positivo.** O buraco de `F-03` deixa de ser ressalva e passa a ser medido: um caso declara escopo administrativo indevido e **compila**. Se o comando tratar esse caso como "não foi recusado pelo gate" e acusar falha, a distinção entre os dois tipos de caso não foi implementada.

3. **Os 9 casos existentes continuam passando.** Eles são a prova **citada** por outras features — inclusive o `status-fora-do-conjunto`, que a 004 cita como prova do `RF-03` dela. Se algum deixar de ser recusado pelo motivo certo, a mudança no arnês quebrou prova alheia.

4. **A guarda de codificação não aparece mais como prova sem dono.** Ela é reivindicada por esta feature, e a matriz precisa refletir isso. A adoção é de **registro**: `mojibake.mjs` e `mojibake.test.mjs` ficam intocados.

5. **A `code-spec-matrix.md` foi relida antes de cada edição.** Ela é **arquivo compartilhado** com a sessão que entregou a `007-matriz-paridade-visual`, que escreveu nela depois da minha última leitura. O conflito de numeração das features `007` nasceu exatamente de não reler o estado antes de agir — e o mesmo descuido aqui apagaria trabalho alheio.

E duas conferências de escopo:

```bash
git status --porcelain -- base44/entities          # precisa sair vazio
git status --porcelain -- src/api src/types src/lib # precisa sair vazio
```

### 5.1 A tabela caso × cenário de `PT-010`

Onze dos **dezesseis** casos do comando servem a este grupo; os outros cinco servem a outras
regras da feature 001 e continuam onde estavam. O que é **citado** e o que é **novo** está
distinguido, porque a diferença importa: citar não é provar de novo.

| Cenário | Casos que o provam | Origem |
| :--- | :--- | :--- |
| `PT-010.1` — escopo exigido | `leitura-sem-escopo`, `escopo-admin-em-metodo-de-dono`, `dono-manual-em-leitura-escopada` | **citados** — feature 001 |
| `PT-010.1` — leitura crua não existe | `leitura-crua-em-entidade-escopada` | **novo** |
| `PT-010.2` — papel explícito no tipo | `papel-atribuido-ao-usuario-offline`, `papel-extraido-do-usuario-offline` | **novos** |
| `PT-010.3` — os adaptadores reais honram o contrato | `npm run typecheck` sobre o projeto inteiro | **citado** |
| `PT-010.3` — o contrato tem dentes | `adaptador-incompleto` | **novo** |
| `PT-010.4` — conjunto de situação de consulta | `status-fora-do-conjunto` | **citado** — feature 001 |
| `PT-010.4` — os conjuntos que faltavam | `situacao-de-agendamento-fora-do-conjunto`, `tipo-documental-fora-do-conjunto` | **novos** |
| `F-03` — o buraco, **medido** | `escopo-administrativo-declarado-por-qualquer-um` — **caso positivo** | **novo** |

E o que **não** está coberto, que é a metade mais útil desta tabela:

| Cláusula | Situação |
| :--- | :--- |
| "O mock tem os mesmos tipos de retorno que o SDK" | 🔴 **não verificada** — os retornos passam por `as` em `createEntityRepository` |
| O encaixe no registry é verificado | 🔴 **não** — `bindAdapter` asserta no ponto de ligação |
| O escopo informado é **legítimo** | 🔴 **não** — e agora **medido**: o caso positivo prova que qualquer código declara `{ kind: 'admin' }` e compila |
| A defesa real é a RLS do servidor | ⚪ **fora do alcance** do cliente |

> Quem ler o verde de `PT-010.1` deve ler **"não dá para esquecer o escopo"** — e não "o escopo
> está certo". São quatro vezes menos do que a tabela inteira sugere.

## 6. O que **não** está coberto

- **O SDK real em execução** — a conformidade do adaptador online é verificada por tipo, não por execução.
- **A autorização** — nenhuma prova do cliente alcança a RLS do BaaS.
- **Os retornos dos adaptadores** — convertidos por `as` em `createEntityRepository`, e por isso não verificados.
- **O ponto de ligação** — `bindAdapter` asserta no encaixe final.
- **Os conjuntos fechados que o cenário não nomeia** — `TemplateType`, `ExamType` e as ações de auditoria.
- **O comportamento do modo offline** — as limitações L1 a L7 pertencem ao grupo `09`.
- **A inferência de `UserRole`** — o literal não-admin está registrado como pendência no próprio tipo, e esta feature não a resolve.

## 7. Registro de execução

> Preenchido pelo `/reversa-coding` ao fechar a feature. Enquanto estiver vazio, esta feature
> **não** foi executada de ponta a ponta.

| Ordem | Comando | Resultado | Data |
| :---: | :--- | :--- | :--- |
| 1 | `npm run prova:negativos` | ✅ **16 casos — 15 negativos e 1 positivo —, todos como esperado**, sem resíduo | 2026-09-22 |
| 2 | `npm run prova:encoding` | ✅ 438 arquivos de texto, nenhum mojibake | 2026-09-22 |
| 3 | `npm run typecheck` | ✅ 0 erros | 2026-09-22 |
| 4 | `npm run lint` | ✅ 0 avisos e 0 erros | 2026-09-22 |
| 5 | `npm test` | ✅ **23 arquivos, 132 verificações, 0 falhas** — `Duration 74,83 s` | 2026-09-22 |

**Conferência de escopo, na mesma rodada:** `git status --porcelain` sobre `base44/entities`,
`src/api`, `src/types` e `src/lib` **saiu vazio**. O único arquivo de código tocado é o arnês de
provas, `src/test/verificacoes-negativas.mjs` — infraestrutura de prova, não aplicação.

**Conferência de contagem (R-07):** a suíte fechou com **132 verificações**, exatamente as mesmas
da rodada 006. Esta feature **não** acrescenta verificação de unidade — o que ela acrescenta são
casos de compilação, que vivem noutro comando. O critério era **não cair**, e não caiu: nenhum
arquivo de teste de unidade foi tocado.

### 7.1 Medição

| Momento | Casos no comando | Verificações da suíte | Tempo da suíte |
| :--- | ---: | ---: | ---: |
| Antes da feature 008 (fecho da 006, 2026-09-22) | 9 | 132 em 23 arquivos | 75,78 s em máquina calma / 122,57 s sob carga |
| Depois da feature 008 (2026-09-22) | **16** (15 negativos, 1 positivo) | **132** em 23 arquivos | **74,83 s** |

O teto de **90 segundos** continua valendo e continua sendo uma propriedade **condicional**: a
mesma suíte já mediu 75,78 s e 122,57 s sem uma linha de diferença. Esta medição saiu em 74,83 s,
dentro do teto com 15,17 s de folga — e **não** deve ser lida como garantia, porque a máquina
estava calma.

O comando de provas negativas passou de 9 para 16 casos **sem dobrar o custo**: ele continua
rodando o gate de tipos **duas** vezes por execução — uma com os casos, outra depois da limpeza,
para provar a ausência de resíduo. O que cresceu foi o número de arquivos por passada, não o
número de passadas.

### 7.2 Comandos além dos cinco

```bash
# O comando desta feature, com a saida completa caso a caso
npm run prova:negativos

# A guarda de encoding sobre um caminho especifico
npm run prova:encoding -- _reversa_forward/008-prova-contrato-dados

# Quantos casos o comando tem hoje
Select-String -Path src/test/verificacoes-negativas.mjs -Pattern "    id: '" | Measure-Object
```

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
