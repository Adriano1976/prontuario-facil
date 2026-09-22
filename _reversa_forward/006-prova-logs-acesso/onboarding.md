# Onboarding: Prova automatizada do módulo de Logs de acesso

> Identificador: `006-prova-logs-acesso`
> Data: `2026-09-22`
> Para quem vai rodar esta feature pela primeira vez.

## 1. Pré-requisitos

- Node.js 18 ou superior com `full-icu` (o padrão desde a versão 13 — a prova afirma datas em pt-BR).
- Dependências instaladas: `npm install`.
- **Nenhum serviço externo.** A suíte substitui o transporte da Base44 por dublês e não toca banco, rede ou credencial.
- Nada a configurar: não há variável de ambiente, chave nem arquivo de configuração novo.

> **Se você roda dentro de um sandbox com restrição de pipes nomeados**, `npm test` pode falhar
> com `spawn EPERM` ao carregar a configuração do Vitest — é o `esbuild` tentando abrir um
> pipe, não um erro da suíte. O modo que libera a execução é o acesso total. Os demais
> comandos da seção 2 rodam em sandbox restrito.

> **E não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell.** O
> `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e
> corrompe o arquivo ao regravar. Aconteceu na rodada 005 e a guarda de encoding pegou. Use a
> ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com
> `UTF8Encoding($false)` explícito.

## 2. Os comandos, em ordem

| Ordem | Comando | O que ele prova |
| :---: | :--- | :--- |
| 1 | `npm test` | A suíte inteira. É o comando que responde pelos quatro cenários de `PT-007` |
| 2 | `npm run typecheck` | Nenhum erro de tipo foi introduzido |
| 3 | `npm run lint` | Nenhum aviso de lint |
| 4 | `npm run prova:negativos` | Os 9 casos do gate de tipos continuam recusando pelo motivo certo, e sem resíduo |
| 5 | `npm run prova:encoding` | A árvore de texto continua UTF-8 íntegra, sem mojibake |

O comando 5 ganhou peso nesta rodada: a feature **modifica dois arquivos de prova
pré-existentes**, e um deles carrega acentuação em português em nomes de cenário. Conferir a
guarda depois de editar arquivo antigo não é cerimônia.

## 3. Onde a prova vive

| Arquivo | Papel |
| :--- | :--- |
| `src/test/auditFixtures.ts` | **Arquivo novo.** A massa compartilhada: registros por categoria, registro futuro, registro sem detalhes, usuário sem papel de admin e o dia congelado |
| `src/components/medical/__tests__/AccessLogger.test.ts` | **Arquivo novo.** O módulo que grava: campos escritos, o literal `'client-side'`, inserção como única operação, falha aberta e contrato do enum |
| `src/pages/__tests__/AccessLogs.test.tsx` | **Arquivo novo.** A página: pedido com limite, ausência de paginação, os três filtros, os indicadores, o recorte sem teto e a leitura sem escopo |
| `src/pages/__tests__/Dashboard.test.tsx` | **Arquivo novo.** A gravação ao montar |
| `src/components/__tests__/Layout.test.tsx` | **Arquivo novo.** A navegação: o item de auditoria existe para quem não é admin |
| `src/pages/__tests__/PatientDetail.test.tsx` | **Modificado.** Ganha as verificações de visualização auditada e da duplicação |
| `src/pages/__tests__/Consultation.test.tsx` | **Modificado.** Idem, na visualização de consulta |

É a **primeira** feature do ciclo forward que modifica arquivos de prova pré-existentes. As
verificações novas entram como blocos `describe` próprios, sem tocar nos blocos existentes.

## 4. Onde ler o resultado da feature

| Documento | Para quê |
| :--- | :--- |
| `_reversa_forward/006-prova-logs-acesso/requirements.md` | As 20 promessas e os 13 cenários Gherkin. A seção `#9` tem as quatro decisões da sessão de esclarecimentos |
| `_reversa_forward/006-prova-logs-acesso/roadmap.md` | As 13 decisões técnicas, os 10 riscos e o critério de pronto |
| `_reversa_forward/006-prova-logs-acesso/investigation.md` | Onde cada promessa vive, as alternativas descartadas e os **modos de perda silenciosa** em detalhe |
| `_reversa_forward/006-prova-logs-acesso/data-delta.md` | Por que não há mudança de dados, e quais armadilhas a massa evita |
| `_reversa_forward/006-prova-logs-acesso/regression-watch.md` | *(gerado no coding)* O que passa a ser vigiado |
| `_reversa_sdd/code-spec-matrix.md` | O veredito de cada cenário do grupo `07`, com as ressalvas |

## 5. O que conferir com os próprios olhos

Cinco coisas que um humano deve verificar, porque a suíte pode estar verde **e** errada:

1. **Os três modos de perda silenciosa estão declarados.** Dois são **provados** (identificação recusada e usuário vazio) e o terceiro é **declarado por leitura** (gravação não aguardada antes da navegação). Se a matriz apresentar a trilha como completa sem mencionar os três, ela está mentindo — e o sistema anuncia conformidade com a LGPD no cabeçalho.

2. **A metade servidor de `PT-007.2` está declarada, não verde.** A imutabilidade e a leitura por admin são RLS. O que a prova afirma é que o cliente só insere e que **não declara escopo** na leitura.

3. **O trio de ações órfãs está declarado, e não provado** — e a diferença entre as duas coisas está escrita. `RF-15` prova o **contrato** do enum (doze entradas iguais às do schema); a **orfandade** de `logout`, `create_prescription` e `export_data` é propriedade estática do código, e prová-la exigiria ler arquivos-fonte.

4. **A contagem de verificações cresceu.** Esta feature toca arquivos de prova de outras features. O número medido ao final precisa ser **maior** que as 109 da rodada 005; uma queda significa que uma verificação existente foi perdida na edição.

5. **O teto de 500 registros é paridade, não esquecimento.** AMB-004 é um comportamento **congelado por decisão humana** (`handoff.md`), e a página não ganha paginação. A prova afirma o teto como promessa.

E duas conferências de escopo:

```bash
git status --porcelain -- base44/entities            # precisa sair vazio
git status --porcelain -- src/components/medical/AccessLogger.ts src/pages/AccessLogs.tsx src/Layout.tsx
# os tres precisam sair vazios: a feature prova, nao altera
```

## 6. O que **não** está coberto

- **A RLS do servidor** — a imutabilidade da trilha e a restrição de leitura a admin.
- **O endereço de rede real** — o cliente só conhece o literal `'client-side'`.
- **A exportação de dados** — não existe exportação real; a lacuna fica declarada.
- **As agregações do Dashboard** — a prova toca um único efeito; o resto pertence à suíte `08`, bloqueada pela Taxa de Atendimento.
- **Os demais itens de navegação do `Layout`** — a prova olha o item de auditoria.
- **O seed offline de `AccessLog`** — o recorte do modo offline é do grupo `09`.
- **As 16 capturas de paridade visual** (`V01` a `V16`), das quais `V13` é a tela de auditoria. A captura dourada de referência não existe no repositório.

## 7. Registro de execução

> Preenchido pelo `/reversa-coding` ao fechar a feature. Enquanto estiver vazio, esta
> feature **não** foi executada de ponta a ponta.

| Ordem | Comando | Resultado | Data |
| :---: | :--- | :--- | :--- |
| 1 | `npm test` | ✅ **23 arquivos, 132 verificações, 0 falhas** — `Duration 75,78 s` na medição de referência (ver §7.1) | 2026-09-22 |
| 2 | `npm run typecheck` | ✅ 0 erros | 2026-09-22 |
| 3 | `npm run lint` | ✅ 0 avisos e 0 erros | 2026-09-22 |
| 4 | `npm run prova:negativos` | ✅ 9 casos, 9 recusados pelo motivo certo, sem resíduo | 2026-09-22 |
| 5 | `npm run prova:encoding` | ✅ 412 arquivos de texto, nenhum mojibake | 2026-09-22 |

**Conferência de escopo, na mesma rodada:** `git status --porcelain` mostrou os cinco arquivos de
verificação novos, a massa compartilhada, `code-spec-matrix.md` e `Consultation.test.tsx`
**modificado**. `AccessLogger.ts`, `AccessLogs.tsx`, `Layout.tsx`, `Dashboard.tsx` e
`PatientDetail.tsx` **sem nenhum diff** — a feature prova, não altera.

**Conferência de contagem (R-08):** as verificações passaram de **109 para 132**, e os arquivos
de **18 para 23**. O crescimento é o exigido: esta é a primeira feature do ciclo que toca prova
pré-existente, e uma queda denunciaria verificação perdida na edição. Nenhuma foi perdida — as
oito verificações anteriores de `Consultation.test.tsx` seguem passando.

### 7.1 Medição de tempo — e uma variância que precisa ser lida

| Momento | Arquivos | Verificações | Tempo |
| :--- | ---: | ---: | ---: |
| Antes da feature 006 (fecho da 005, 2026-09-21) | 18 | 109 | 67,42 s |
| Depois da feature 006, **máquina sob carga** | 23 | 132 | **122,57 s** — 🔴 **acima do teto** |
| Depois da feature 006, **máquina calma** | 23 | 132 | **75,78 s** — ✅ com 14,22 s de folga |

**As duas medições são da mesma suíte, sem uma linha de diferença entre elas.** A primeira foi
feita imediatamente depois de várias execuções pesadas; a segunda, com a máquina em repouso. A
soma dos tempos **por arquivo** é de 53,16 s, e o resto do `Duration` é coleta e ambiente, que
correm em paralelo — por isso a carga da máquina move o número tanto assim.

> **O teto de 90 segundos é, portanto, uma propriedade condicional, e não garantida.** Ele é
> cumprido com folga numa máquina calma e estourado numa máquina ocupada. Quem for conferir
> precisa medir duas vezes antes de concluir qualquer coisa, e registrar as duas.

**Onde o tempo está, medido por arquivo.** Os cinco arquivos novos **não** são o problema: o mais
lento deles é `AccessLogs.test.tsx`, com 2,45 s, e nenhum dos outros aparece entre os doze mais
lentos. O maior contribuinte individual é um arquivo **pré-existente**:

| Arquivo | Tempo |
| :--- | ---: |
| `src/pages/__tests__/PatientForm.test.tsx` | **13,11 s** |
| `src/components/medical/__tests__/PrescriptionEditor.test.tsx` | 6,39 s |
| `src/pages/__tests__/NewAppointment.test.tsx` | 4,43 s |

`PatientForm.test.tsx` é o mesmo arquivo que a feature 004 registrou como flutuante perto do teto
de 5 s por verificação. Ele sozinho responde por um quarto do tempo de prova da suíte, e o custo
**não** foi introduzido por esta feature.

**O recorte declarado no plano não é o alavanca certa, e isso fica registrado.** O D-12 previa
reduzir o que a prova do Dashboard exercita se a suíte apertasse; a medição mostra que o Dashboard
nem aparece entre os mais lentos (os dublês devolvem conjuntos vazios, como planejado). Atacar o
teto por ali não moveria o número. As alavancas reais, se o projeto quiser persegui-lo, são o
custo por arquivo de `PatientForm.test.tsx` e o custo fixo de ambiente por arquivo — e as duas
exigem decisão do usuário, porque a primeira toca prova de outra feature e a segunda toca
`vitest.config.ts`, que **não** está em `allowedPaths`.

### 7.2 Comandos além dos quatro

```bash
# A prova do módulo que grava, isolada
npx vitest run src/components/medical/__tests__/AccessLogger.test.ts

# A prova da pagina de auditoria, isolada
npx vitest run src/pages/__tests__/AccessLogs.test.tsx

# A contagem de verificacoes, para comparar com as 109 da rodada anterior
npx vitest run 2>&1 | Select-String -Pattern 'Test Files|Tests '
```

---
*Gerado pelo Reversa-Plan em 2026-09-22.*
