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
| 1 | `npm test` | *(a preencher)* | — |
| 2 | `npm run typecheck` | *(a preencher)* | — |
| 3 | `npm run lint` | *(a preencher)* | — |
| 4 | `npm run prova:negativos` | *(a preencher)* | — |
| 5 | `npm run prova:encoding` | *(a preencher)* | — |

### 7.1 Medição de tempo

| Momento | Arquivos | Verificações | Tempo |
| :--- | ---: | ---: | ---: |
| Antes da feature 006 (fecho da 005, 2026-09-21) | 18 | 109 | 67,42 s |
| Depois da feature 006 | *(a preencher)* | *(a preencher)* | *(a preencher)* |

Teto: **90 segundos**, com 22,58 s de folga no fecho anterior. Esta feature acrescenta
**cinco** arquivos novos — quatro de verificação e a massa compartilhada — e toca **dois**
existentes, com uma tela densa entre eles: a folga será **medida**, não presumida (D-12). Se a
suíte apertar o teto, o recorte declarado é reduzir o que a prova do Dashboard exercita, e
**não** afrouxar asserção.

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
