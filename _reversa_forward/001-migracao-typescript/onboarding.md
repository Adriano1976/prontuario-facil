# Onboarding: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Para: quem vai executar e validar a feature pela primeira vez

## 1. Pré-requisitos

| Item | Versão / estado | Como conferir |
|------|-----------------|---------------|
| Node.js | 18 ou superior | `node --version` |
| Dependências instaladas | instaladas na raiz do projeto | `npm install` (se `node_modules` não existir) |
| Navegador | qualquer moderno | — |
| Conta no BaaS | necessária apenas para o modo online | variáveis de ambiente já presentes |

## 2. Comandos essenciais

```
npm run typecheck     # gate de tipos: verifica todo o código-fonte, sem emitir arquivos
npm run dev           # sobe o sistema em modo de desenvolvimento
npm run build         # gera o artefato de produção
npm run lint          # análise estática de estilo
```

O comando `typecheck` é o gate principal desta feature. Ele deve terminar **sem
nenhuma saída de erro** e retornar sucesso.

## 3. Verificação passo a passo

### 3.1 Conferir o gate de tipos

```
npm run typecheck
```

Resultado esperado no estado atual da feature: termina sem erro, e verifica os
arquivos já convertidos. **Não** confie apenas na ausência de mensagens: confira que
o número de arquivos verificados é o esperado, porque um erro de sintaxe em um único
arquivo faz o verificador ignorar todo o resto (ver `investigation.md`, seção 3).

### 3.2 Subir o sistema em modo online

```
npm run dev
```

Abra o endereço indicado no terminal. Percorra, nesta ordem:

1. **Pacientes** — a listagem carrega; abrir um paciente mostra o detalhe.
2. **Agendamentos** — o calendário carrega e mostra os agendamentos existentes.
3. **Consultas** — a listagem carrega; abrir uma consulta mostra o registro clínico.
4. **Médicos** — a listagem carrega.
5. **Modelos** — a central de modelos carrega.
6. **Registros de acesso** — a trilha de auditoria carrega.
7. **Painel** — os indicadores carregam.

### 3.3 Subir o sistema em modo offline

O modo offline é ativado na construção, não por botão na tela:

```
VITE_OFFLINE=true npm run dev
```

> ⚠️ **Sintaxe por shell:** a forma acima (`VAR=valor comando`) é de shell Unix
> (Linux/macOS). **Não funciona no PowerShell** — lá a variável é definida com
> `$env:`:

No Windows, em PowerShell:

```
$env:VITE_OFFLINE="true"; npm run dev
```

Resultado esperado: o sistema entra direto, sem pedir autenticação, com o usuário de
demonstração. As telas carregam dados de exemplo. **Nenhum dado real é tocado** —
tudo é gravado no armazenamento local do navegador.

Para voltar ao estado inicial dos dados de exemplo, limpe o armazenamento local do
site no navegador.

## 4. Roteiro de fumaça de paridade

Fonte: `_reversa_sdd/migration/parity_tests/` — **26 arquivos** de cenários em
Gherkin (`Dado/Quando/Então`) que somam **55 cenários**: 39 em 10 arquivos de
**fluxo** (`01`–`10`) e 16 em 16 arquivos de **tela** (`V01`–`V16`).

> ⚠️ **Não são testes automatizados.** O projeto não possui arcabouço de teste (não
> há script `test` nem dependência de `cucumber`/`gherkin`/`jest`/`vitest`), o que é
> decisão registrada da feature (`requirements.md` §6.1). Esses arquivos são a
> **especificação do que precisa continuar verdadeiro** e servem de roteiro: percorra
> cada cenário no módulo convertido e registre **conforme** ou **divergente**.
> Nenhuma divergência pode permanecer sem tratamento antes de avançar de módulo.
>
> Exceção verificável por máquina: `10-contrato-base44-client.feature` trata do
> contrato de tipos e foi validado na ação T039 (6 de 6 violações propositais
> recusadas pelo compilador).

Pontos de atenção por ordem de risco:

| Área | O que conferir | Por que importa |
|------|----------------|-----------------|
| Consentimento LGPD | Cadastro exige aceite; com aceite, grava data e endereço de rede | Requisito regulatório |
| Isolamento por dono | Usuário comum não vê dado de outro | Regra de segurança do domínio |
| Ciclo de status | Agendamento e consulta transitam apenas pelos estados válidos | Regra de domínio central |
| Emissão de documento | Medicamentos só aparecem quando o tipo é de receita | Regra de domínio |
| Trilha de auditoria | Acesso a dado sensível gera registro | Requisito regulatório |
| Modo offline | Mesmas telas funcionam com os dados de exemplo | Evita divergência entre os dois modos |

### 4.1 Mapa módulo → cenários (preenchido pelo responsável)

Estado da ação T044: **CONCLUÍDA em 15/09/2026** — verificação estática (seção 4.2) e
passeio interativo executados. O questionário respondido está em `questions.md`, com a
análise de cada divergência. `npm run build` e `npm run typecheck` passaram na máquina
do responsável (fecha a lacuna da seção 7).

Registre cada módulo como **conforme** ou **divergente** na última coluna. Nenhuma
divergência pode ficar sem tratamento antes de fechar a feature. Sugestão de ordem:
primeiro o modo online (módulos na ordem abaixo) e depois o modo offline completo.

| Módulo | Cenários de paridade | Resultado |
|--------|----------------------|-----------|
| Dashboard | `08-kpis-dashboard`, `V01-dashboard-principal` | ✅ conforme |
| Pacientes — listagem | `V02-pacientes-listagem`, `01-cadastro-paciente-lgpd` | ✅ conforme |
| Pacientes — novo/editar | `01-cadastro-paciente-lgpd`, `V03-pacientes-novo` | ✅ conforme — após corrigir o defeito **DIV-01** |
| Pacientes — detalhe | `V14-paciente-detalhe`, `01-cadastro-paciente-lgpd` | ✅ conforme (inclui o item ⭐ 4.5) |
| Agendamentos — calendário/lista | `03-agendamento-jornada-medico`, `04-ciclo-status-agendamento`, `V04-agendamentos-calendario` | ✅ conforme |
| Agendamentos — novo | `03-agendamento-jornada-medico`, `V05-agendamentos-novo` | ✅ conforme |
| Consultas — listagem | `05-maquina-estados-consulta`, `V06-consultas-listagem` | ✅ conforme |
| Consultas — novo/editar | `05-maquina-estados-consulta`, `V07-consultas-novo` | ✅ conforme |
| Consultas — visualização | `05-maquina-estados-consulta`, `V08-consultas-visualizacao` | ✅ conforme (item 9.6 reclassificado — **DIV-02**) |
| Modal novo documento | `06-emissao-documento-template`, `V09-modal-novo-documento` | ✅ conforme (item 10.4 reclassificado — **DIV-03**) |
| Modal upload de exame | `V10-modal-upload-exame` | ✅ conforme |
| Médicos — listagem/novo | `V11-medicos-listagem`, `V15-medicos-novo` | ✅ conforme |
| Templates — central/modal | `06-emissao-documento-template`, `V12-templates-central`, `V16-templates-modal` | ✅ conforme (item 13.1 reclassificado — **DIV-04**) |
| Logs de acesso | `07-auditoria-acesso`, `V13-logs-acesso` | ✅ conforme |
| Modo offline (todos os módulos) | `09-modo-offline` + `10-contrato-base44-client` (verificação por tipo, já executada em T039) | ✅ conforme — após corrigir a **DIV-01** |

> **Resultado geral do passeio:** com divergências — **1 defeito real** encontrado e
> corrigido (DIV-01), **3 relatos reclassificados** como conforme após conferência
> contra o legado (DIV-02/03/04) e **1 lacuna pré-existente** registrada (DIV-05,
> `{DIAS_AFASTAMENTO}` oferecida e nunca interpolada). Detalhes em `questions.md`.

> ⚠️ **Mudança visível esperada no modo offline:** os dados de exemplo foram
> alinhados ao contrato (T040) — as prescrições do seed agora exibem os
> medicamentos na tela de documento, onde antes não apareciam. Isso é correção de
> dado de exemplo, não divergência (ver `data-delta.md` §4).

### 4.2 Verificação estática já executada (evidência de máquina)

Executada em 14/09/2026 comparando o legado (recuperado do histórico do Git) com as
versões convertidas, antes do passeio interativo:

| Verificação | Escopo | Resultado |
|-------------|--------|-----------|
| Textos de interface preservados | 12 páginas — 428 cadeias | **0 perdidas** |
| Textos de interface preservados | 16 arquivos (componentes + casca) — 237 cadeias | 0 relevantes (2 são exemplo de JSDoc) |
| Superfície de entidades (quais entidades cada arquivo acessa) | 20 arquivos | **0 divergências** |
| Gate de tipos integral | 77 arquivos de `src/` (58 de aplicação + 19 declarações *.d.ts de ui/) | **0 erros** |
| `.jsx` de aplicação remanescentes | — | nenhum (`ui/` por exclusão registrada; o ponto de entrada virou `src/main.tsx`, verificado, em 17/09/2026) |

Método: comparação insensível a acento entre as cadeias de texto do arquivo legado e
do convertido, e comparação do conjunto de entidades acessadas (`entities.<Nome>`)
entre as duas versões.

Isso cobre **por máquina** o item congelado "textos da interface mudaram" (seção 5) e
a suspeita de leitura esquecida. O que **não** é coberto por máquina — e por isso
continua no passeio interativo — é o comportamento em execução: estado de tela,
respostas do servidor/mock e o efeito visível das leituras com escopo.

## 5. O que **não** deve acontecer

Esta feature converte linguagem, não corrige comportamento. Se você observar qualquer
item abaixo, é **divergência**, e deve ser tratada como defeito:

- Critério de algum indicador do painel mudou
- Status de agendamento passou a mudar sozinho ao salvar consulta
- Surgiu paginação na trilha de auditoria
- Surgiu aviso visual de "dados de teste" no modo offline
- Textos da interface mudaram
- Surgiu verificação de permissão antes de alguma tela
- O endereço de rede do consentimento passou a ser removido da URL
- Conteúdo de documento passou a escapar marcação

Os itens acima estão congelados por decisão registrada no plano de migração. Nenhum
deles deve mudar nesta feature.

## 6. Como saber que quebrou

| Sintoma | Onde olhar |
|---------|------------|
| `typecheck` aponta erro | A mensagem indica arquivo e linha; corrija o contrato, não o consumo |
| `typecheck` passa mas o sistema quebra ao abrir uma tela | Provável divergência entre o contrato e os dados reais; compare com `base44/entities/*.jsonc` |
| Tela mostra lista vazia onde antes mostrava dados | Verifique o filtro de dono introduzido pela leitura com escopo |
| Modo offline mostra dados diferentes do online | Verifique `mockSeed.ts` contra o contrato (`data-delta.md`, seção 3) |
| Build falha sem erro de tipo | Verifique se o erro é de sintaxe, não de tipo |

## 7. Limites conhecidos deste ambiente

O build de produção **não** roda no ambiente do agente de IA: o processo de
empacotamento falha ao criar subprocesso, por restrição do ambiente, não por defeito
do código. A verificação de tipos funciona normalmente.

> ✅ **Validado em 15/09/2026:** `npm run build` e `npm run typecheck` foram
> executados **com sucesso na máquina do responsável** (Opera / Windows 11), durante o
> passeio da T044 — a lacuna registrada anteriormente está **fechada**. Antes do
> cutover, compare o artefato gerado com o anterior (`dist/`).
>
> ✅ **Revalidado em 17/09/2026, depois da conversão do ponto de entrada:** `npm run
> typecheck` (0 erros) e `npm run build` (código 0, `dist/` regerado) passaram também no
> ambiente do agente — mas o build só roda com **acesso ampliado**; no modo confinado o
> subprocesso do empacotador segue falhando com `spawn EPERM`. A verificação de tipos
> funciona nos dois modos.
