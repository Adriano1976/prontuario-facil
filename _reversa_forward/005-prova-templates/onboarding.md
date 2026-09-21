# Onboarding: Prova automatizada da emissão de documento com template

> Identificador: `005-prova-templates`
> Data: `2026-09-21`
> Para quem vai rodar esta feature pela primeira vez.

## 1. Pré-requisitos

- Node.js 18 ou superior com `full-icu` (o padrão desde a versão 13 — a prova afirma datas em pt-BR por extenso).
- Dependências instaladas: `npm install`.
- **Nenhum serviço externo.** A suíte substitui o transporte da Base44 por dublês e não toca banco, rede ou credencial.
- Nada a configurar: não há variável de ambiente, chave nem arquivo de configuração novo.

> **Se você roda dentro de um sandbox com restrição de pipes nomeados**, `npm test` pode
> falhar com `spawn EPERM` ao carregar a configuração do Vitest — é o `esbuild` tentando
> abrir um pipe, não um erro da suíte. O modo que libera a execução é o acesso total. Os
> demais comandos da seção 2 rodam em sandbox restrito.

## 2. Os comandos, em ordem

| Ordem | Comando | O que ele prova |
| :---: | :--- | :--- |
| 1 | `npm test` | A suíte inteira. É o comando que responde pelos quatro cenários de `PT-006` |
| 2 | `npm run typecheck` | Nenhum erro de tipo foi introduzido |
| 3 | `npm run lint` | Nenhum aviso de lint |
| 4 | `npm run prova:negativos` | Os 9 casos do gate de tipos continuam recusando pelo motivo certo, e sem resíduo |
| 5 | `npm run prova:encoding` | A árvore de texto continua UTF-8 íntegra, sem mojibake |

O comando 4 verifica uma coisa que esta feature **não** usa: nenhum requisito dela depende
de recusa de compilação. Ele roda porque é gate do projeto, não porque a feature o exija.

## 3. Onde a prova vive

| Arquivo | Papel |
| :--- | :--- |
| `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | **Arquivo novo.** As verificações dos quatro cenários e dos achados laterais |
| `src/test/templateFixtures.ts` | **Arquivo novo.** A massa compartilhada: paciente, modelos por tipo, modelo inativo, modelo com variáveis, modelo com `{DIAS_AFASTAMENTO}`, modelo com marcação |
| `src/components/medical/PrescriptionEditor.tsx` | **Intocado.** É o objeto da prova |
| `src/pages/Templates.tsx` | **Intocado.** Fora do escopo desta feature |
| `_reversa_sdd/code-spec-matrix.md` | Ganha a seção do grupo `06`, o saldo 23 → 19 e as lacunas |

A prova ancora no **componente**, e não nas telas que o montam. A consequência está
declarada em `roadmap.md#4.1`: o encanamento a partir de `PatientDetail.tsx` não é coberto
aqui.

## 4. Onde ler o resultado da feature

| Documento | Para quê |
| :--- | :--- |
| `_reversa_forward/005-prova-templates/requirements.md` | As 18 promessas e os 10 cenários Gherkin. A seção `#9` tem as cinco decisões da sessão de esclarecimentos |
| `_reversa_forward/005-prova-templates/roadmap.md` | As 12 decisões técnicas, os 9 riscos e o critério de pronto |
| `_reversa_forward/005-prova-templates/investigation.md` | Onde cada promessa vive, as alternativas descartadas e o achado de AMB-006 em detalhe |
| `_reversa_forward/005-prova-templates/data-delta.md` | Por que não há mudança de dados, e quais armadilhas a massa evita |
| `_reversa_forward/005-prova-templates/regression-watch.md` | *(gerado no coding)* O que passa a ser vigiado |
| `_reversa_sdd/code-spec-matrix.md` | O veredito de cada cenário do grupo `06`, com as ressalvas |

## 5. O que conferir com os próprios olhos

Quatro coisas que um humano deve verificar, porque a suíte pode estar verde **e** errada:

1. **A ressalva do filtro de modelos está visível.** `PT-006.2` e `PT-006.4` são 🟢 **com ressalva**: o filtro por tipo e por atividade é do servidor, e o cliente não re-filtra. Se a matriz mostrar os dois como 🟢 sem a ressalva, a matriz está mentindo — e a verificação `RF-06`, que prova o cliente exibindo um modelo de tipo errado e um inativo, é a evidência de que a ressalva é necessária.

2. **As três lacunas Alta aparecem com evidência e continuam abertas.** `{DIAS_AFASTAMENTO}` intacta, marcação não escapada no payload, marcação não escapada no HTML impresso. As três são **defeito declarado, não corrigido** — decisão `2a`. Se alguma aparecer como corrigida, alguém mudou comportamento sem passar pela decisão.

3. **A suíte passa a travar AMB-006.** Ao afirmar o defeito, as verificações falham no dia em que alguém corrigir a substituição ou a impressão. Isso é intencional (D-08): quem corrigir precisa alterar a verificação **de propósito**. Confira que o cabeçalho do arquivo de prova nomeia AMB-006 como paridade preservada, para que ninguém leia a asserção como expectativa de produto.

4. **O enum do editor é confrontado com o schema.** `RF-15` compara os seis tipos oferecidos com o conjunto de `Prescription.jsonc`, sem `anamnese`. Se a verificação comparar contra uma lista escrita à mão, ela não protege nada.

E uma conferência de escopo:

```bash
git status --porcelain -- base44/entities     # precisa sair vazio
git status --porcelain -- src/pages/Templates.tsx   # precisa sair vazio
```

## 6. O que **não** está coberto

- **A administração de modelos** (`Templates.tsx`): CRUD, agrupamento por tipo, `is_default` sem exclusividade, `insertVariable` no fim do texto e o campo `variables` órfão. Fora do escopo por decisão `1a`; vira feature própria.
- **O comportamento do filtro no servidor** — o cliente só é provado sobre o **pedido**.
- **O encanamento a partir de `PatientDetail.tsx`** até o editor. O caminho a partir de `Consultation.tsx` já tem prova parcial na feature 004.
- **A renderização visual da janela de impressão** em navegador real: o duplo captura o HTML escrito, não o resultado impresso.
- **Os defaults do schema** (`is_default: false`, `is_active: true`), que são aplicados pelo servidor.
- **As 16 capturas de paridade visual** (`V01` a `V16`), das quais `V12` e `V16` são as telas de Templates. A captura dourada de referência não existe no repositório.

## 7. Registro de execução

> Preenchido pelo `/reversa-coding` ao fechar a feature. Enquanto estiver vazio, esta
> feature **não** foi executada de ponta a ponta.

| Ordem | Comando | Resultado | Data |
| :---: | :--- | :--- | :--- |
| 1 | `npm test` | ✅ **18 arquivos, 109 verificações, 0 falhas** — `Duration 67,42 s`, parede de 69,54 s | 2026-09-21 |
| 2 | `npm run typecheck` | ✅ 0 erros | 2026-09-21 |
| 3 | `npm run lint` | ✅ 0 avisos e 0 erros | 2026-09-21 |
| 4 | `npm run prova:negativos` | ✅ 9 casos, 9 recusados pelo motivo certo, sem resíduo | 2026-09-21 |
| 5 | `npm run prova:encoding` | ✅ 397 arquivos de texto, nenhum mojibake | 2026-09-21 |

**Conferência de escopo, na mesma rodada:** `git status --porcelain` mostrou apenas os arquivos
de prova criados, `actions.md`, `progress.jsonl` e `code-spec-matrix.md`. `PrescriptionEditor.tsx`,
`Templates.tsx` e `base44/entities/` **sem nenhum diff**.

> **Registro de um incidente de codificação, porque custou tempo e pode repetir.** A marcação
> em massa das ações foi feita com `Get-Content` e `Set-Content`, e no PowerShell 5.1 esses
> cmdlets decodificam arquivo sem BOM pela página ANSI: o `actions.md` foi lido como Latin-1 e
> regravado, deixando **330 sequências corrompidas**. A `prova:encoding` **pegou** — o gate fez
> exatamente o trabalho para o qual existe. O arquivo foi reescrito íntegro.
>
> E a primeira tentativa de documentar o incidente **reproduziu o defeito**, ao citar o par de
> caracteres como exemplo literal: a guarda acusou o próprio registro, porque varre bytes e não
> intenção. Lição para as próximas rodadas: nunca fazer round-trip de arquivo do projeto por
> cmdlet de texto do PowerShell — usar a ferramenta de edição, ou
> `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito.

### 7.1 Medição de tempo

| Momento | Arquivos | Verificações | Tempo |
| :--- | ---: | ---: | ---: |
| Antes da feature 005 (fecho da 004, 2026-09-21) | 17 | 90 | 63,66 s |
| Depois da feature 005 (2026-09-21) | **18** | **109** | **67,42 s** |

Teto: **90 segundos**. A folga caiu para **22,58 s**. O arquivo novo acrescenta 19 verificações
e 3,76 s — o custo por verificação é baixo porque a prova ancora em um único componente, sem
montar tela de página inteira.

### 7.2 Comandos além dos quatro

```bash
# A prova desta feature isolada
npx vitest run src/components/medical/__tests__/PrescriptionEditor.test.tsx

# O caminho de impressão, que o jsdom não implementa
# A verificação deve substituir window.open — se ela não substituir,
# o código sai pela guarda "if (!printWindow) return" e nada é exercitado.
```

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
