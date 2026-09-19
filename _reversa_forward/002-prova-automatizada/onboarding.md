# Onboarding: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Para quem vai executar e conferir esta feature pela primeira vez.

## 1. Pré-requisitos

| Item | Observação |
|------|------------|
| Node.js e npm | Versões que o projeto já usa no dia a dia |
| Repositório clonado | Nenhum serviço de backend precisa estar de pé |
| Variáveis de ambiente | **Não são necessárias.** A prova substitui o backend por dublê e não alcança a rede |

## 2. Instalação

```bash
npm ci
```

Uma vez. Nenhuma dependência nova é instalada por esta feature — o que a prova usa já
estava declarado como dependência de desenvolvimento.

## 3. Os comandos, em ordem

### 3.1 A suíte de prova

```bash
npm test
```

O que esperar: todas as verificações passam e o resumo final informa quantos arquivos e
quantas verificações foram executados. O código de retorno é 0 quando tudo passa e
diferente de zero quando algo falha — é isso que o torna utilizável como gate.

> Esta é a **porta de entrada única** da prova (RF-01). Se você só puder rodar um comando,
> rode este.

### 3.2 A verificação de tipos

```bash
npm run typecheck
```

O que esperar: nenhuma saída e código de retorno 0. Qualquer saída é erro, com arquivo e
linha.

> São **dois gates independentes** (RN-05): este confere forma em tempo de compilação, o
> anterior confere comportamento em tempo de execução. Um não substitui o outro.

### 3.3 A análise estática

```bash
npm run lint
```

### 3.4 A reprodução das verificações negativas

```bash
npm run prova:negativos
```

O que esperar: o comando reconstrói cada caso negativo registrado, executa a verificação
de tipos sobre ele, confere que a recusa ocorreu com o erro esperado, remove o resíduo e
reporta o resultado caso a caso.

> **Por que este comando existe.** As verificações negativas da feature 001 foram
> executadas criando um arquivo temporário, rodando o gate e apagando o arquivo. A
> evidência ficou registrada no histórico e **não podia ser reexecutada por ninguém**. Este
> comando é a versão reproduzível daquela evidência (RF-04).
>
> Ao final, confira que **nenhum arquivo temporário permaneceu**: o repositório precisa
> ficar exatamente como estava.

## 4. Onde ler o resultado da feature

| Pergunta | Onde responder |
|----------|----------------|
| O que esta feature prometeu? | `_reversa_forward/002-prova-automatizada/requirements.md` |
| Como foi decidido tecnicamente? | `_reversa_forward/002-prova-automatizada/roadmap.md` |
| Qual promessa tem prova, e qual não tem? | `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste` |
| O que ficou sem prova, e por quê? | `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` e `requirements.md#10. Lacunas` |
| Para onde foram os cenários de paridade não convertidos? | mesma seção da matriz (destino por cenário) |

## 5. Restrição de ambiente conhecida

Em ambiente confinado, a suíte **não sobe**: o empacotador usado pelo executor abre um
pipe nomeado e falha com `spawn EPERM`. A mensagem aparece como falha ao carregar a
configuração, seguida de `Error: spawn EPERM`.

Isso **não é defeito do projeto** — é restrição do ambiente. Exige execução com acesso
ampliado. A mesma restrição foi registrada na feature 001, e lá o build de produção
passou na máquina do responsável.

## 6. O que conferir com os próprios olhos

1. **Nada mudou no comportamento.** Nenhum arquivo de aplicação sob `src/` é alterado por
   esta feature; só arquivos de prova e de configuração. Se você vir um arquivo de tela
   modificado, algo saiu do escopo.
2. **Nada mudou no backend.** Os schemas de entidade em `base44/entities/` não podem ter
   diff nenhum. É a regra de ouro.
3. **A prova não toca a rede.** A suíte inteira roda sem backend e sem conexão.
4. **A matriz diz a verdade.** Abra a matriz e escolha três promessas ao acaso: para cada
   uma, o arquivo de prova citado deve existir e conter a verificação correspondente. Se
   alguma não bater, a matriz está mentindo e o critério de pronto não foi atingido.
5. **O módulo Pacientes não tem lacuna.** Nenhuma promessa do módulo pode aparecer com
   veredito de lacuna (RF-13). Lacuna em outro módulo é esperada e está declarada.

## 7. O que **não** está coberto

Não presuma cobertura onde não há. Fica declarado como lacuna, com a razão:

| Fora da prova | Por quê |
|---------------|---------|
| Paridade visual das 16 telas | A captura dourada de referência não existe no repositório |
| Cenários de paridade dos sete outros módulos (34) | Fatiados para features seguintes, conforme decisão de 2026-09-19 |
| Autorização real no servidor | A regra de acesso vive no backend; a prova confere que o escopo foi declarado e aplicado |
| Criptografia do CPF em repouso | Acontece no backend; a prova confere a marcação do campo sensível no contrato |
| Concorrência entre abas no modo offline | Limitação L2 herdada, registrada em `_reversa_sdd/code-analysis.md#10.5 Limitações funcionais` |
| Empacotamento de produção | Verificação de outra natureza |

## 8. Integridade dos artefatos desta feature

O Reversa **não assina** os artefatos do ciclo forward. A assinatura existe apenas para
os arquivos da instalação (`.reversa/_config/files-manifest.json`, 260 entradas SHA-256
cobrindo só o framework) e para os artefatos do time de migração
(`_reversa_sdd/migration/*.md`, que trazem frontmatter com `hash` e `producedBy`). Nenhum
skill do forward menciona hash, e nenhum template do ciclo tem campo de assinatura.

`MANIFEST.sha256`, nesta pasta, cobre essa lacuna. Ele registra o SHA-256 de:

- os **6 documentos** desta feature: `requirements.md`, `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e `actions.md`;
- a **matriz de rastreabilidade** (`_reversa_sdd/code-spec-matrix.md`);
- a **camada de prova** no estado atual: `vitest.config.ts`, `src/test/setup.ts` e os 10 arquivos de verificação.

O que ele **não** cobre, e por quê:

| Fora do manifesto | Razão |
|-------------------|-------|
| O próprio `MANIFEST.sha256` | Um hash não pode cobrir a linha que o contém |
| `package.json` | A ação `T002` vai alterá-lo |
| `_reversa_sdd/dependencies.md` e `_reversa_sdd/inventory.md` | As ações `T010` e `T011` vão corrigi-los |

### Como conferir

Git Bash, Linux ou macOS, a partir da raiz do projeto:

```bash
sha256sum -c _reversa_forward/002-prova-automatizada/MANIFEST.sha256
```

PowerShell, a partir da raiz do projeto:

```powershell
Get-Content _reversa_forward\002-prova-automatizada\MANIFEST.sha256 | ForEach-Object {
  $h, $p = $_ -split '  ', 2
  if ((Get-FileHash -Algorithm SHA256 $p).Hash.ToLower() -eq $h) { "OK    $p" }
  else { "MUDOU $p" }
}
```

### Ressalva honesta

O hash é dos **bytes em disco**, não do conteúdo lógico. Se o Git normalizar fim de linha
entre LF e CRLF em outro checkout, os hashes divergem sem que uma vírgula tenha mudado.
O manifesto certifica o estado desta árvore de trabalho em 2026-09-19 — ele **não**
substitui o histórico do Git, que continua sendo o registro durável de verdade.

## 9. Registro de execução

Ao executar o roteiro, registre conforme ou divergente por item. O registro alimenta o
`legacy-impact.md` e o `regression-watch.md` da feature.

| # | Item | Resultado |
|---|------|-----------|
| 1 | `npm ci` conclui sem erro | não executado — dependências já instaladas na árvore de trabalho |
| 2 | `npm test` passa por inteiro | ✅ 36 verificações em 10 arquivos, 0 falhas |
| 3 | `npm run typecheck` sem saída | ✅ código de retorno 0 |
| 4 | `npm run lint` sem saída | ✅ código de retorno 0 |
| 5 | `npm run prova:negativos` reporta cada caso e não deixa resíduo | ✅ 9 de 9 recusados pelo motivo esperado, resíduo nenhum, retorno 0 |
| 6 | Nenhum arquivo de aplicação sob `src/` modificado | ✅ só arquivo de prova, o utilitário novo e `package.json` |
| 7 | `base44/entities/` sem diff | ✅ nenhum |
| 8 | Promessas da matriz batem com os arquivos de prova | ✅ todos os arquivos de prova citados na matriz existem e contêm a verificação |
| 9 | Nenhuma promessa do módulo Pacientes com veredito de lacuna | ✅ a seção de lacunas não registra nenhuma aberta para Pacientes |
| 10 | Suíte completa abaixo de 90 segundos | ✅ 32,5 s |

> Execução registrada em 2026-09-19 pelo `/reversa-coding`. Os itens 1 e 8 são os únicos
> com ressalva: o item 1 não foi reexecutado e o item 8 foi conferido por inspeção dos
> arquivos citados, não por sorteio aleatório de três promessas.
