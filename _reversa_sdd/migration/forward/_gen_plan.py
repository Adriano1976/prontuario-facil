# -*- coding: utf-8 -*-
"""Gerador dos artefatos do /reversa-plan para a feature 001-migracao-typescript.

Escrita atomica (tmp + rename) por arquivo. Gerador descartavel.
"""
import os
from datetime import datetime, timezone

ROOT = r"D:\Projetos\prontuario-facil"
FD = os.path.join(ROOT, "_reversa_forward", "001-migracao-typescript")
HOJE = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

FILES = {}

FILES["roadmap.md"] = """
# Roadmap: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Requirements: `_reversa_forward/001-migracao-typescript/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é um delta de **camada de tipos** sobre uma arquitetura que não muda: a SPA
React continua idêntica em runtime, o backend continua sendo o BaaS, e nenhum contrato
de dados é alterado. O caminho é incremental por camadas, da folha para a raiz:
primeiro o gate de verificação e os contratos de tipo das entidades; depois o contrato
único de acesso a dados; depois os componentes; por último as telas, módulo a módulo.
Cada etapa é reversível e tem critério objetivo de aceite. Duas decisões de topologia
sustentam o resto: registro **fechado** de entidades (nome de entidade inexistente
deixa de compilar) e leitura de dado clínico **exigindo escopo declarado**. O ponto de
partida medido é de 1.324 erros em 81 arquivos — não os 677 registrados no plano de
migração original, que mediu apenas parte do código-fonte.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto (verificado: nenhum arquivo de
princípios ativo, e `setup.json` declara `principles.enabled: true` mas sem arquivo
correspondente). Não há princípio a respeitar nem conflito a registrar. 🟢

> Observação para o `/reversa-to-do`: como não há princípios ativos, o item de
> verificação de princípios do critério de pronto fica sem objeto. Isso é esperado,
> não é lacuna.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Verificação em modo estrito sobre todo o código-fonte, **exceto** a pasta de componentes de interface herdados de biblioteca, com a exclusão escrita no próprio arquivo de configuração | Decisão humana (esclarecimento 3b): os componentes herdados quase não foram tocados e renderizariam muito ajuste de baixo valor | Estrito absoluto sem exceção; estrito só no código próprio (deixaria a camada de interface sem verificação nenhuma) | 🟢 |
| D-02 | Registro **fechado** de entidades: o acesso a dados é tipado com as 8 entidades conhecidas, não com índice aberto | Com índice aberto, erro de digitação no nome da entidade continua compilando — risco nº 5 do plano de migração ("desacoplamento silencioso") | Índice aberto como o legado faz; híbrido com escape aberto para entidades futuras | 🟢 |
| D-03 | Leitura de entidade sob isolamento por dono não expõe operação de leitura sem escopo; a leitura passa por escopo declarado (dono ou administrativo) | Cenário 1 do teste de paridade PT-010: "código que esquece o filtro de ownership não compila" | Exigir escopo nas operações cruas tocando as 51 chamadas; deixar apenas documentado para fase futura | 🟢 |
| D-04 | O contrato de acesso a dados da aplicação recebe nome próprio (`AppDataClient`), porque o SDK do BaaS já exporta um tipo com o nome `Base44Client` | Evita dois tipos homônimos com significados diferentes no mesmo projeto | Manter o nome e apelidar o tipo do SDK; não importar o tipo do SDK pelo nome | 🟢 |
| D-05 | Anexar o adapter ao contrato por função de verificação em compile-time, e não por anotação em cada adaptador | Uma única função comprova que as duas implementações (online e offline) honram o mesmo contrato — cenário 3 do PT-010 | Anotar cada adaptador separadamente; confiar em revisão manual | 🟢 |
| D-06 | Conversão para TypeScript feita de dentro para fora: entidades de dados, depois acesso a dados, depois componentes, depois telas | Estratégia A aprovada (incremental por camadas): erro de tipo fica localizado na camada que está sendo convertida | Conversão total em um único passo; conversão por tela começando pelas telas | 🟢 |
| D-07 | Paridade atestada por verificação de tipos somada a roteiro manual de fumaça derivado dos 26 cenários existentes | Decisão humana (esclarecimento 2a): sem dependência nova e sem arcabouço de teste nesta feature | Introduzir teste automatizado agora; confiar só na verificação de tipos | 🟢 |
| D-08 | Os dados iniciais do modo offline são alinhados ao contrato das entidades | O conteúdo atual dos dados de exemplo diverge do contrato em vários campos e já é incompatível com o consumo das telas | Manter como está e converter com asserções de tipo; reescrever os dados de exemplo | 🟢 |
| D-09 | A remoção das 14 dependências não utilizadas fica **fora** desta feature | Decisão humana (esclarecimento 1b); exige reconfirmação por busca e aprovação explícita | Remover junto com a conversão; remover apenas as de risco óbvio | 🟢 |
| D-10 | As não conformidades de segurança já auditadas permanecem **apenas documentadas**, sem correção | Regra de ouro da migração: só tipos, nenhuma correção de comportamento. A verificação confere forma, nunca autorização | Corrigir junto; deixar sem menção | 🟢 |
| D-11 | O modo offline do usuário de sessão é uma variante discriminada que não carrega papel nem dono | BR-MIGRAR-039: a ausência precisa ser explícita para que trecho dependente de papel não compile cego | Papel opcional; papel com valor sentinela | 🟢 |

## 4. Premissas

Nenhuma. O `requirements.md` não possui marcador `[DÚVIDA]` pendente — as três dúvidas
do documento inicial foram resolvidas na sessão de esclarecimentos de `HOJE`. 🟢

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/types/` | `_reversa_sdd/architecture.md` | componente-novo | Camada de contratos de tipo das 8 entidades, sem equivalente no legado |
| `src/api/` (contrato) | `_reversa_sdd/architecture.md` | contrato-novo | Contrato único de acesso a dados, honrado pelos dois modos |
| `src/api/base44Client.js` | `_reversa_sdd/code-analysis.md` | contrato-alterado | Passa a satisfazer o contrato tipado; comportamento idêntico |
| `src/api/mockClient.js` | `_reversa_sdd/code-analysis.md` | contrato-alterado | Passa a satisfazer o mesmo contrato; comportamento idêntico |
| `src/api/mockSeed.js` | `_reversa_sdd/code-analysis.md` | regra-alterada | Dados de exemplo alinhados ao contrato (D-08) — única mudança de dados desta feature |
| Arquivos de configuração de verificação | — | componente-novo | Configuração do verificador e comando de gate |
| Script de verificação no manifesto do projeto | — | contrato-alterado | O comando atual mira a configuração legada e não verifica de fato |
| Demais `src/` (~87 arquivos) | `_reversa_sdd/inventory.md#Estrutura de pastas` | regra-alterada | Conversão de linguagem sem mudança de comportamento |

Nenhum componente é extinto. Nenhuma pasta muda de lugar (topologia híbrida aprovada).

## 6. Delta no modelo de dados

- Resumo: **nenhuma mudança de esquema.** Os contratos de dados do BaaS permanecem
  intocados e não há migração de dados. O delta é de representação: os tipos passam a
  espelhar os esquemas existentes, e o único ajuste de conteúdo é nos dados de exemplo
  do modo offline (D-08), que hoje divergem do contrato.
- Detalhe completo em: `_reversa_forward/001-migracao-typescript/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Contrato interno de acesso a dados (`AppDataClient`) | interno, entre telas e camada de dados | `_reversa_forward/001-migracao-typescript/interfaces/app-data-client.md` |
| SDK do BaaS (`@base44/sdk`) | biblioteca externa — **não alterado** | `_reversa_forward/001-migracao-typescript/interfaces/base44-sdk.md` |
| Armazenamento local do modo offline (`mock_db_*`) | armazenamento do navegador — **não alterado no formato** | `_reversa_forward/001-migracao-typescript/interfaces/mock-local-storage.md` |

Nenhum contrato HTTP, de fila, gRPC ou GraphQL é criado ou alterado.

## 8. Plano de migração

Ordem de execução, de dentro para fora (D-06). As etapas 1 a 3 já foram executadas
antes da abertura desta feature e entram como trabalho reconhecido, não pendente.

1. **Configuração e gate** — configuração do verificador em modo estrito, comando de
   gate sem emissão de arquivos, exclusão registrada dos componentes herdados (D-01).
   ✅ **Executada.**
2. **Contratos de tipo das entidades** — os 8 contratos, o tipo condicional de
   consentimento, os conjuntos fechados de status e tipo, e a variante de sessão
   offline (D-11). ✅ **Executada.**
3. **Contrato de acesso a dados** — contrato único, registro fechado (D-02), leitura
   com escopo (D-03), verificação em compile-time dos adaptadores (D-05).
   🟡 **Parcial:** contrato, registro e camada de escopo prontos e verificados; a
   ligação dos dois adaptadores ainda não foi feita.
4. **Componentes de negócio** — conversão dos componentes que consomem dados.
5. **Telas, por módulo** — ordem: pacientes → consultas → agendamentos → médicos →
   templates → logs de acesso → painel. A cada módulo, além de converter, migrar as
   leituras para a camada com escopo (D-03) e registrar o roteiro de fumaça (D-07).
6. **Modo offline** — alinhar os dados de exemplo ao contrato (D-08).
7. **Endurecimento final** — ligar a verificação sobre os arquivos convertidos, zerar
   os 1.324 erros, e comprovar o gate completo.

A ordem de 4 para 5 é obrigatória nesta direção porque as telas consomem os
componentes; converter na ordem inversa deixaria a fronteira sem tipo no meio do
caminho.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Regressão silenciosa de comportamento: o projeto não tem nenhum teste automatizado, e "só tipos" é uma promessa difícil de verificar | alto | alto | Roteiro de fumaça derivado dos 26 cenários de paridade, executado a cada módulo (D-07); cada etapa é reversível isoladamente |
| O ponto de partida real (1.324 erros) é quase o dobro do registrado no plano original, e o prazo estimado pode não se sustentar | médio | alto | Trabalhar por módulo com gate parcial; não prometer prazo derivado do plano antigo |
| Ferramenta de tipos apaga invariante sem avisar quando o utilitário de omissão não distribui sobre união | alto | médio | Já ocorreu e foi corrigido nesta sessão: o invariante de consentimento havia sumido e só foi detectado por arquivo de teste com uso incorreto. Manter esse tipo de verificação negativa a cada etapa |
| Erro de sintaxe em um único arquivo interrompe a verificação de todo o projeto, dando aparência de código saudável | alto | médio | Já ocorreu nesta sessão (um parêntese a mais mascarava mais de mil erros). Sempre conferir que a contagem de arquivos verificados é a esperada, não apenas que o gate passou |
| A conversão do acesso a dados quebra as telas que ainda estão na linguagem antiga | médio | médio | Converter de dentro para fora e por módulo; a resolução de módulos do empacotador aceita as duas linguagens convivendo |
| Os dados de exemplo do modo offline divergem do contrato em vários campos, e alguns já são incompatíveis com o consumo atual das telas | médio | alto | Alinhar na etapa 6 (D-08), depois que o contrato estiver estável |
| A verificação estrita sobre a camada de interface herdada geraria muito ajuste de baixo valor | baixo | alto | Exclusão registrada por escrito (D-01); a exceção é auditável |
| Não conformidades de segurança auditadas serem confundidas com algo que os tipos resolvem | alto | médio | Registrado explicitamente nos limites de alcance do `requirements.md`: o verificador confere forma, nunca autorização |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Verificação estrita termina sem erro sobre todo o código-fonte, com a única
      exclusão registrada sendo a pasta de componentes herdados
- [ ] As duas implementações de acesso a dados verificadas contra o mesmo contrato
- [ ] Nenhum marcador de dúvida pendente no `requirements.md`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Roteiro de fumaça executado e registrado para cada módulo convertido
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Verificação de princípios: **sem objeto** neste projeto (não há
      `.reversa/principles.md`)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `HOJE` | Versão inicial gerada por `/reversa-plan` | reversa |
"""

FILES["investigation.md"] = """
# Investigation: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Objetivo da pesquisa

Responder três perguntas antes de escrever o plano: (a) a verificação de tipos
realmente protege contra a classe de erro que motivou a feature? (b) qual o ponto de
partida real? (c) o que impede a adoção de um teste automatizado já nesta feature?

## 2. Ponto de partida real — medição

O plano de migração original registra "677 erros em 43 arquivos". A medição foi
refeita nesta sessão e o número correto é **1.324 erros em 81 arquivos**. 🟢

Causa da divergência, apurada por leitura da configuração de verificação legada:

| Fator | Configuração legada | Configuração nova |
|-------|---------------------|-------------------|
| Arquivos cobertos | apenas parte do código-fonte (subconjunto de pastas) | todo o código-fonte |
| Tipos da biblioteca de interface | não resolvidos | resolvidos |
| Exclusões | três pastas excluídas (incluindo a camada de acesso a dados) | nenhuma, exceto a decisão D-01 |

Ambas as configurações foram executadas nesta sessão; a legada reproduz exatamente
677 erros e a nova reproduz 1.324. A diferença não é estimativa: é medição. 🟢

### Estatística dos erros na configuração nova

Distribuição por categoria de erro, na medição de 1.324:

| Categoria | Ocorrências |
|-----------|-------------|
| Propriedade inexistente no tipo | 462 |
| Atribuição incompatível | 336 |
| Tipo sem propriedades em comum | 171 |
| Parâmetro com tipo implícito | 163 |
| Elemento com tipo implícito | 34 |
| Propriedade obrigatória ausente | 32 |
| Argumento incompatível | 30 |

As duas primeiras categorias são exatamente a classe de erro que motiva a feature:
nome de campo errado e valor de tipo errado.

## 3. O mascaramento por erro de sintaxe

Descoberto nesta sessão, e relevante o bastante para virar risco no roadmap. 🟢

O arquivo `src/components/ui/chart.jsx` continha um parêntese de fechamento
excedente na linha 32. Um erro de sintaxe faz o verificador **abortar a análise
semântica de todo o projeto**: com o arquivo presente, a verificação reportava
**1 erro**; após a correção, reportou **1.324**.

Sequência de comprovação executada:

1. A configuração nova reportava 1 erro (apenas o de sintaxe).
2. Um erro de tipo proposital foi inserido e **não** foi detectado.
3. Isolando o arquivo com o erro de sintaxe, os 1.324 erros apareceram — incluindo o
   erro proposital.

Consequência prática: "gate passou" não é evidência suficiente. É preciso conferir
que a cobertura de arquivos é a esperada. Registrado como risco de impacto alto.

## 4. Alternativas avaliadas para a estratégia de conversão

| Alternativa | Veredito | Motivo |
|-------------|----------|--------|
| Incremental por camadas, de dentro para fora | **adotada** (D-06) | Erro localizado na camada convertida; cada etapa reversível |
| Conversão total em um passo | descartada | Um único ponto de falha num projeto sem testes; revisão inviável |
| Conversão por tela, começando pelas telas | descartada | As telas consomem os componentes; a fronteira ficaria sem tipo no meio |
| Dois sistemas em paralelo com roteamento | descartada | Não há segundo runtime: a stack é a mesma, só a camada de tipos é nova |

A estratégia adotada coincide com a já registrada no plano de migração original
(estratégia incremental), que permanece válida — apenas o ponto de partida estava
medido errado.

## 5. Alternativas avaliadas para a paridade

| Alternativa | Veredito | Motivo |
|-------------|----------|--------|
| Verificação de tipos + roteiro manual derivado dos 26 cenários existentes | **adotada** (D-07) | Decisão humana; não introduz dependência nova |
| Introduzir arcabouço de teste automatizado agora | descartada | Contraria a restrição de não introduzir dependência nova nesta feature |
| Apenas verificação de tipos | descartada | Verificação de tipos não detecta mudança de comportamento |

## 6. Padrões aplicáveis

- **Verificação negativa obrigatória.** Para cada garantia de tipo que a feature
  promete, é preciso um caso de uso propositalmente incorreto que **não** compila.
  Sem isso, a garantia é apenas uma intenção. Este padrão foi aplicado nesta sessão e
  foi o que revelou dois defeitos reais (seções 3 e 7).
- **Delta mínimo.** Nenhuma correção de comportamento entra junto com a conversão,
  mesmo quando o defeito é evidente. Não conformidades auditadas ficam documentadas.
- **Uma barreira por etapa.** Cada etapa termina com uma verificação executável e
  reprodutível, não com uma afirmação de que está pronta.

## 7. Armadilhas de tipo encontradas nesta sessão

Ambas foram encontradas por teste, não por revisão, e ambas são relevantes para as
etapas seguintes. 🟢

**7.1 Omissão de campo apaga invariante em tipos de união.** O utilitário padrão de
omissão de propriedades não distribui sobre união de tipos: aplicado ao contrato do
paciente — que é uma união discriminada por consentimento — ele colapsa as variantes
e **desativa silenciosamente** a exigência de data e endereço de rede no
consentimento aceito. Foi corrigido com uma versão que distribui variante a variante.
Registrado como risco de impacto alto, porque a falha é silenciosa.

**7.2 Herança de interface vaza operação que deveria ser proibida.** A primeira
versão do contrato fazia a entidade sob isolamento herdar o repositório cru, e com
isso a leitura **sem** escopo continuava compilando — exatamente o que o cenário 1 do
teste de paridade exige que não aconteça. Só foi detectado porque foi escrito um
caso de uso incorreto de propósito. Corrigido separando leitura de escrita.

## 8. Fontes consultadas

- `_reversa_sdd/migration/handoff.md` e demais artefatos do time de migração
- `_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature`
- `base44/entities/*.jsonc` (8 contratos de dados canônicos)
- `node_modules/@base44/sdk/dist/client.types.d.ts` e `modules/entities.types.d.ts`
- Código legado: `src/api/base44Client.js`, `src/api/mockClient.js`, `src/api/mockSeed.js`
- Medições executadas nesta sessão (verificação de tipos em duas configurações)

## 9. Lacunas remanescentes

Nenhuma bloqueante. A pendência das 14 dependências não utilizadas foi transferida
para fora desta feature por decisão humana e está registrada no `requirements.md`.
"""

FILES["data-delta.md"] = """
# Data Delta: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Modelo extraído de referência: `_reversa_sdd/data-dictionary.md` e `_reversa_sdd/database/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Veredito

**Nenhuma migração de dados. Nenhuma alteração de esquema.** Os 8 contratos de dados
do BaaS permanecem intocados, e o armazenamento local do modo offline mantém o mesmo
formato e as mesmas chaves. 🟢

O delta desta feature é de **representação em tempo de compilação**: os tipos passam a
espelhar os esquemas que já existem. A única alteração de conteúdo são os dados de
exemplo do modo offline (seção 4).

## 2. Campos novos, removidos ou alterados

| Entidade | Campo | Situação | Observação |
|----------|-------|----------|------------|
| todas | `id`, `created_date` | já existiam | Passam a ser declarados como preenchidos pelo servidor |
| todas | `created_by_id` | já existia | Base do isolamento por dono; declarado **opcional no registro**, por não existir no modo offline |
| Paciente | bloco de consentimento | já existia | Passa a ser **condicional**: consentimento aceito exige data e endereço de rede |
| Agendamento | `status`, `type` | já existiam | Passam a conjunto fechado |
| Consulta | `status` | já existia | Passa a conjunto fechado |
| Prescrição | `type` | já existia | Passa a conjunto fechado |
| Exame | `type`, `file_type` | já existiam | Passam a conjunto fechado |
| Médico | `working_days` | já existia | Passa a lista de dias válidos (0 a 6) em vez de número genérico |
| Modelo | `type` | já existia | Passa a conjunto fechado de 7 valores |
| Registro de acesso | `action` | já existia | Passa a conjunto fechado de 12 valores |

Nenhum campo é removido. Nenhuma entidade nova é criada.

## 3. Divergências entre os dados de exemplo e o contrato

Os dados de exemplo do modo offline foram escritos antes de o contrato existir e
divergem dele em vários pontos. Levantamento por leitura direta do arquivo: 🟢

| Entidade | Divergência observada | Consequência |
|----------|----------------------|--------------|
| Paciente | Gênero registrado em forma abreviada, fora do conjunto válido | Não valida contra o contrato |
| Consulta | Registro usa nomes de campo diferentes dos do esquema (histórico clínico e vínculo com agendamento) | Campos não encontrados; anamnese fica vazia |
| Prescrição | Medicamento registrado como texto único, enquanto o consumo nas telas espera lista de itens | A tela de prescrição não exibe os medicamentos dos dados de exemplo |
| Prescrição | Ausência de `type`, que é obrigatório | Não valida contra o contrato |
| Agendamento | Ausência de campos com valor padrão | Depende do preenchimento pelo servidor |
| Médico | Ausência de `specialty` e `crm`, ambos obrigatórios | Não valida contra o contrato |
| Modelo | Tipo registrado fora do conjunto válido | Não valida contra o contrato |
| Exame | `file_type` ausente e `file_url` vazio | Tolerado: ambos são opcionais |
| Registro de acesso | Campos com valor nulo | Tolerado: campo declarado como anulável |

Observação relevante: a divergência de **Prescrição** não é apenas uma questão de
tipos. As telas já consomem a lista de medicamentos, e os dados de exemplo fornecem
texto único — ou seja, **já existe hoje** uma incompatibilidade entre os dados de
exemplo e o consumo nas telas, independentemente desta feature. 🟢

## 4. Alteração de conteúdo prevista

A etapa 6 do plano alinha os dados de exemplo ao contrato (decisão D-08). Natureza da
alteração:

| Aspecto | Situação |
|---------|----------|
| O que muda | O conteúdo dos dados de exemplo do modo offline, para validar contra o contrato |
| O que **não** muda | O formato de armazenamento, as chaves de armazenamento, e o mecanismo de carga |
| Dados reais afetados | **Nenhum.** Os dados de exemplo são gravados no armazenamento do navegador na primeira leitura, e não há dado de produção no modo offline |
| Migração necessária | Não. Basta limpar o armazenamento local do navegador para os exemplos serem regravados |
| Risco | Baixo: afeta apenas ambiente de demonstração offline |

> ⚠️ Consequência de comportamento a validar na etapa 6: como a tela de prescrição
> espera a lista de medicamentos, alinhar os dados de exemplo fará os medicamentos
> **aparecerem** onde hoje não aparecem no modo offline. Isso é correção de dado de
> exemplo, não mudança de regra — mas precisa ser conferido no roteiro de fumaça,
> porque altera o que se vê na tela.

## 5. Índices, ordenação e limites

Nenhuma alteração. As ordenações usadas pelo legado permanecem as mesmas, e o limite
de registros por consulta não muda. O contrato restringe a ordenação a um único campo,
que é o comportamento atual. 🟢

## 6. Restrições e integridade

| Regra | Situação |
|-------|----------|
| Identificador único por registro | Inalterado; gerado pelo servidor, ou localmente no modo offline |
| Integridade referencial entre entidades | Inalterada; não há chave estrangeira física, a consistência é de domínio |
| Isolamento por dono | Inalterado no servidor; passa a ser **exigido** na fronteira de tipos |
| Proteção de campo sensível | Inalterada no servidor; o contrato apenas marca o campo como sensível |
| Trilha de auditoria | Inalterada; permanece somente inserção, leitura restrita a administrador |
"""

FILES["onboarding.md"] = """
# Onboarding: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
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

Fonte: os 26 cenários já existentes em `_reversa_sdd/migration/parity_tests/`
(10 de fluxo e 16 de tela). Execute-os no módulo que acabou de ser convertido e
registre cada um como **conforme** ou **divergente**. Nenhuma divergência pode
permanecer sem tratamento antes de avançar de módulo.

Pontos de atenção por ordem de risco:

| Área | O que conferir | Por que importa |
|------|----------------|-----------------|
| Consentimento LGPD | Cadastro exige aceite; com aceite, grava data e endereço de rede | Requisito regulatório |
| Isolamento por dono | Usuário comum não vê dado de outro | Regra de segurança do domínio |
| Ciclo de status | Agendamento e consulta transitam apenas pelos estados válidos | Regra de domínio central |
| Emissão de documento | Medicamentos só aparecem quando o tipo é de receita | Regra de domínio |
| Trilha de auditoria | Acesso a dado sensível gera registro | Requisito regulatório |
| Modo offline | Mesmas telas funcionam com os dados de exemplo | Evita divergência entre os dois modos |

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
| Modo offline mostra dados diferentes do online | Verifique `mockSeed.js` contra o contrato (`data-delta.md`, seção 3) |
| Build falha sem erro de tipo | Verifique se o erro é de sintaxe, não de tipo |

## 7. Limites conhecidos deste ambiente

O build de produção **não** foi executado com sucesso no ambiente onde esta feature
está sendo conduzida: o processo de empacotamento falha ao criar subprocesso, por
restrição do ambiente, não por defeito do código. A verificação de tipos funciona
normalmente. Ao executar `npm run build` em uma máquina sem essa restrição, o
resultado deve ser comparado com o artefato anterior.
"""

FILES["interfaces/app-data-client.md"] = """
# Contrato: acesso a dados da aplicação (`AppDataClient`)

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Tipo: contrato **interno**, entre as telas e a camada de acesso a dados
> Implementações: modo online (SDK do BaaS) e modo offline (armazenamento local)
> Confidência: 🟢 CONFIRMADO

## 1. Por que este contrato existe

O legado já tinha duas implementações de acesso a dados escolhidas em tempo de
construção, mas **nenhum contrato comum**: nada garantia que as duas respondessem às
mesmas operações com as mesmas formas. A consequência é a classe de defeito mais cara
possível neste projeto — código que funciona no modo online e falha silenciosamente no
modo offline, ou o contrário, sem que nada acuse.

Este contrato existe para que as duas implementações sejam verificadas contra a mesma
definição. Se uma delas divergir, a verificação de tipos falha.

> Nota de nomenclatura: o SDK do BaaS já exporta um tipo chamado `Base44Client`. Para
> evitar ambiguidade, o contrato da aplicação tem nome próprio (decisão D-04).

## 2. Superfície

### 2.1 Repositório de entidade

Toda entidade expõe as mesmas cinco operações:

| Operação | Entrada | Retorno | Observação |
|----------|---------|---------|------------|
| Listar | campo de ordenação opcional, limite opcional | lista de registros | Ordenação aceita **um** campo |
| Filtrar | condições, ordenação opcional, limite opcional | lista de registros | Comparação apenas por igualdade |
| Criar | dados do registro | registro criado | Identificador e data de criação são preenchidos pelo servidor |
| Atualizar | identificador, dados parciais | registro atualizado | Identificador é preservado |
| Excluir | identificador | confirmação de sucesso | — |

Restrições de ordenação e de filtro são **deliberadamente restritas** ao que as duas
implementações suportam de fato: um campo de ordenação e comparação por igualdade.

### 2.2 Entidades conhecidas

O registro é **fechado** (decisão D-02): paciente, consulta, agendamento, prescrição,
exame, médico, modelo de documento e registro de acesso. Referenciar qualquer outro
nome não compila.

### 2.3 Leitura com escopo

As cinco entidades clínicas (paciente, consulta, agendamento, prescrição e exame) **não
expõem leitura sem escopo**. A leitura acontece por uma destas formas:

| Forma | Escopo | Comportamento |
|-------|--------|---------------|
| Leitura do próprio dono | do usuário da sessão | O filtro de dono é aplicado automaticamente |
| Filtro do próprio dono | do usuário da sessão | Filtro de dono somado às condições informadas; informar o dono manualmente **não compila** |
| Leitura administrativa | declarado explicitamente | Sem filtro de dono |

As três entidades restantes (médico, modelo e registro de acesso) têm leitura livre
para usuário autenticado, conforme a regra de acesso do domínio.

## 3. Erros

| Situação | Comportamento |
|----------|---------------|
| Registro não encontrado na atualização | Rejeição com mensagem que identifica a entidade e o identificador |
| Arquivo ausente no envio | Rejeição com mensagem indicando que nenhum arquivo foi fornecido |
| Corrupção do armazenamento local | O conteúdo é ignorado e os dados de exemplo são regravados |

O contrato **não** define tratamento de erro de autorização: a autorização é do
servidor e permanece lá.

## 4. Idempotência e concorrência

| Operação | Idempotente | Observação |
|----------|-------------|------------|
| Listar, filtrar | sim | Somente leitura |
| Criar | não | Cada chamada gera novo identificador |
| Atualizar | sim | Mesma entrada produz o mesmo resultado |
| Excluir | sim | Excluir registro já ausente não falha |

Não há controle de concorrência otimista no contrato. A última escrita prevalece, que
é o comportamento atual.

## 5. Timeouts e limites

Não há timeout próprio no contrato: o tempo limite é o da camada de rede da
implementação online. No modo offline não há espera de rede. Limites por consulta
permanecem os do legado e não são alterados por esta feature.

## 6. O que este contrato **não** garante

Esta seção é a mais importante do documento.

- **Não valida autorização.** O escopo é uma declaração de quem chama, verificada
  apenas na forma. Código que declarar escopo administrativo indevidamente continua
  compilando.
- **Não impede acesso indevido a dado.** Quem impede é a regra de acesso do servidor,
  que permanece intocada.
- **Não substitui a proteção de campo sensível**, que continua sendo do servidor.
- **Não corrige** as não conformidades de segurança já auditadas. Elas seguem
  registradas como pendência de codificação, fora do escopo desta feature.

## 7. Critérios de conformidade

Uma implementação está em conformidade quando:

1. Expõe integralmente a superfície da seção 2, com as mesmas formas de entrada e
   saída.
2. Recusa valor fora dos conjuntos fechados de status e tipo.
3. Obriga o consentimento completo quando o consentimento é aceito.
4. Não permite leitura de dado clínico sem escopo declarado.

A conformidade é verificada em tempo de compilação, não por teste em tempo de
execução.
"""

FILES["interfaces/base44-sdk.md"] = """
# Contrato: SDK do BaaS (`@base44/sdk`)

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Tipo: biblioteca externa — **não alterado por esta feature**
> Confidência: 🟢 CONFIRMADO

## 1. Situação

Nenhuma alteração. A biblioteca é consumida como já era, na mesma versão declarada no
manifesto do projeto, e nesta migração nenhuma dependência é adicionada, removida ou
atualizada. Esta ficha existe para registrar o que foi verificado sobre o contrato
externo, não para propor mudança.

## 2. O que foi verificado

| Aspecto | Achado | Consequência para a feature |
|---------|--------|------------------------------|
| Tipos publicados pela biblioteca | Sim, a biblioteca publica definições de tipo próprias | Não é necessário criar declaração de tipo manual para ela |
| Nome do tipo principal | A biblioteca exporta um tipo chamado `Base44Client` | Conflito de nome com o contrato da aplicação; resolvido por decisão D-04 |
| Acesso às entidades | Aceita tanto nomes conhecidos quanto índice aberto | A feature usa **nomes conhecidos**, por decisão D-02, para que nome errado não compile |
| Operações por entidade | A biblioteca oferece mais operações do que o legado usa | O contrato da aplicação restringe ao subconjunto efetivamente usado |
| Forma de criação do cliente | Função de fábrica que recebe identificador da aplicação, token e endereço do servidor | Inalterada |

## 3. Operações efetivamente usadas

| Operação | Uso no legado | No contrato da aplicação |
|----------|---------------|--------------------------|
| Listar entidade | sim | sim |
| Filtrar entidade | sim | sim |
| Criar entidade | sim | sim |
| Atualizar entidade | sim | sim |
| Excluir entidade | sim | sim |
| Buscar por identificador | **não** | fora do contrato; a busca por identificador é feita por filtro |
| Criar/atualizar em lote | **não** | fora do contrato |
| Contagem | **não** | fora do contrato |
| Inscrição em tempo real | **não** | fora do contrato |
| Autenticação | sim (usuário da sessão, sair, redirecionar) | sim |
| Envio de arquivo | sim | sim |
| Registro de uso do aplicativo | sim, sem efeito | sim |

Manter o contrato no subconjunto usado é deliberado: um contrato que espelha a
biblioteca inteira não protege nada, porque nada nele é específico do domínio.

## 4. Riscos associados

| Risco | Mitigação |
|-------|-----------|
| Atualização da biblioteca alterar a forma das operações | Nenhuma nesta feature. O contrato isola o consumo: uma mudança na biblioteca passa a ser detectada na verificação de tipos, em vez de em produção |
| O tipo do SDK e o contrato da aplicação serem confundidos | Nomes distintos (D-04) e adaptador único |

## 5. Fora de escopo

- Atualização da versão da biblioteca.
- Adoção de operações não usadas hoje.
- Qualquer mudança no comportamento de autorização, que é do servidor.
"""

FILES["interfaces/mock-local-storage.md"] = """
# Contrato: armazenamento local do modo offline

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Tipo: armazenamento do navegador — **formato não alterado por esta feature**
> Confidência: 🟢 CONFIRMADO

## 1. Situação

O formato de armazenamento **não muda**: mesmas chaves, mesma serialização, mesmo
mecanismo de carga. O que muda é apenas o **conteúdo dos dados de exemplo**, alinhado
ao contrato das entidades (decisão D-08).

## 2. Estrutura

| Aspecto | Valor |
|---------|-------|
| Mecanismo | Armazenamento local do navegador |
| Chave por entidade | Prefixo fixo `mock_db_` seguido do nome da entidade |
| Serialização | Texto em formato de objeto estruturado |
| Carga inicial | Quando a chave não existe, os dados de exemplo são gravados e devolvidos |
| Expiração | Não há |
| Escopo | Por origem (endereço) no navegador do usuário |

## 3. Operações e efeitos

| Operação | Efeito no armazenamento |
|----------|--------------------------|
| Listar | Lê a chave da entidade; se ausente, grava os dados de exemplo e devolve |
| Filtrar | Igual a listar, com filtro aplicado em memória |
| Criar | Acrescenta registro com identificador novo e data de criação atual |
| Atualizar | Substitui o registro, preservando o identificador |
| Excluir | Remove o registro e regrava a coleção |

## 4. Comportamento em caso de corrupção

Se o conteúdo armazenado não puder ser interpretado, ele é **ignorado em silêncio** e
os dados de exemplo são regravados. Isso é comportamento atual e **não muda** nesta
feature.

> Consequência a conhecer: uma corrupção não gera aviso ao usuário. O sistema
> simplesmente reapresenta os dados de exemplo.

## 5. Diferenças conhecidas em relação ao modo online

| Aspecto | Modo online | Modo offline |
|---------|-------------|--------------|
| Isolamento por dono | Aplicado pelo servidor | **Não aplicado** — o armazenamento local não tem regra de acesso |
| Usuário da sessão | Autenticado, com papel | Usuário de demonstração, **sem papel** |
| Persistência | No servidor | Somente no navegador do usuário |
| Dados de exemplo | Não existem | Gravados na primeira leitura |

O isolamento não aplicado no modo offline é comportamento **intencional e
documentado**, não defeito. O que a feature faz é tornar a ausência de papel
**explícita** no contrato, para que trecho dependente de papel não compile cego.

## 6. Impacto da feature neste contrato

| Item | Muda? |
|------|-------|
| Chaves de armazenamento | não |
| Formato de serialização | não |
| Mecanismo de carga e gravação | não |
| Conteúdo dos dados de exemplo | **sim** — alinhado ao contrato das entidades (etapa 6) |
| Necessidade de limpar o armazenamento após a mudança | sim, no ambiente de demonstração, para os exemplos serem regravados |
"""


def main():
    os.makedirs(os.path.join(FD, "interfaces"), exist_ok=True)
    for name, body in FILES.items():
        target = os.path.join(FD, name.replace("/", os.sep))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        tmp = target + ".tmp"
        with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(body.replace("HOJE", HOJE).lstrip("\n"))
        os.replace(tmp, target)
        print("escrito:", name, len(body), "bytes")
    print("TOTAL:", len(FILES))


if __name__ == "__main__":
    main()
