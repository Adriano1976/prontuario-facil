# Requirements: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Tornar verificável, por meio de um verificador de tipos, o contrato de dados do
Prontuário Fácil: as 8 entidades clínicas, os enums fechados de status e tipo, e o
contrato único de acesso a dados compartilhado entre o modo online e o offline.
Entrega para o desenvolvedor único do projeto, que hoje não tem como saber que
quebrou um nome de campo, um status ou a fronteira de isolamento por dono antes de
o sistema falhar em uso real. Resolve a ausência de rede de proteção descrita na
extração original: o projeto não possui nenhum teste automatizado.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/inventory.md#Visão geral` | SPA React + Vite, backend Base44 (BaaS), sem servidor próprio | 🟢 |
| `_reversa_sdd/architecture.md` | Estado de servidor por camada de consulta; dados acessados direto pelas páginas | 🟢 |
| `_reversa_sdd/domain.md#2.4 Segurança e Auditoria` | BR-S02: usuário não-admin só vê o que ele mesmo criou | 🟢 |
| `_reversa_sdd/domain.md#3. Lacunas e Inconsistências` | Não há gatilho que sincronize status de Agendamento ao salvar Consulta | 🟢 |
| `_reversa_sdd/permissions.md` | Papéis User e Admin; único literal de papel documentado é `admin` | 🟢 |
| `_reversa_sdd/state-machines.md` | Ciclos de status de Consulta e Agendamento | 🟢 |
| `_reversa_sdd/confidence-report.md` | Grau de confiança global da extração | 🟢 |
| `_reversa_sdd/migration/handoff.md` | Plano de migração em 7 ondas; gate de tipos por onda | 🟢 |
| `_reversa_sdd/migration/target_data_model.md` | Espelho tipado das 8 entidades + tipo condicional de LGPD | 🟢 |
| `_reversa_sdd/migration/parity_tests/10-contrato-base44-client.feature` | Cenários de contrato único e exigência de escopo por tipo | 🟢 |

> ⚠️ **Correção de premissa do plano original.** O `handoff.md` registra o ponto de
> partida como "677 erros em 43 arquivos". Essa medição está incorreta: foi feita com
> a configuração legada de tipos, que cobria apenas parte do código-fonte e não
> resolvia os tipos da biblioteca de interface. A medição correta, refeita sobre a
> totalidade do código-fonte com verificador em modo estrito, é de **1.324 erros em
> 81 arquivos**. Confidência: 🟢 (medição reproduzível).

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor único (PO e Dev) | Alterar o sistema sem quebrar contrato de dados já em uso | Renomeia um campo do cadastro de paciente e descobre o impacto antes de publicar |
| Desenvolvedor único | Alternar entre uso online e offline sem divergência silenciosa | O mesmo trecho de tela funciona nos dois modos sem caminho de código separado |
| Responsável por conformidade (LGPD) | Comprovar que dado sensível é tratado como tal | Campo sensível identificado no contrato; consentimento completo exigido |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Todo registro persistido possui identificador e data de criação
   preenchidos pelo servidor; o código de tela não os define. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_data_model.md`
   - Tipo: nova (formaliza comportamento existente)
2. **RN-02:** Status de Consulta pertence ao conjunto fechado `agendada`,
   `em_andamento`, `concluida`, `cancelada`. 🟢
   - Origem no legado: `_reversa_sdd/state-machines.md`
   - Tipo: nova (formaliza comportamento existente)
3. **RN-03:** Status de Agendamento pertence ao conjunto fechado `agendado`,
   `confirmado`, `em_atendimento`, `concluido`, `cancelado`, `faltou`, e a transição
   permanece **manual**. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.2` (BR-A01, BR-A02) e
     `_reversa_sdd/domain.md#3` (ausência de gatilho automático)
   - Tipo: nova (a ausência de automação é deliberada e não deve ser "corrigida")
4. **RN-04:** Tipo sanguíneo pertence ao conjunto fechado ABO/Rh mais
   `desconhecido`. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.1` (BR-P02)
   - Tipo: nova
5. **RN-05:** Tipos de documento clínico e de modelo de documento pertencem a um
   conjunto fechado; um modelo de atestado não aparece ao emitir receita. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.3` (BR-T01)
   - Tipo: nova
6. **RN-06:** Consentimento de LGPD aceito exige, obrigatoriamente, data e endereço
   de rede do consentimento. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md` (BR-MIGRAR-004)
   - Tipo: nova
7. **RN-07:** Leitura de dado clínico exige a declaração do escopo de acesso: do
   próprio dono, ou administrativo. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2.4` (BR-S02)
   - Tipo: alterada (a regra já existia no servidor; passa a ser exigida também na
     fronteira de tipos)
8. **RN-08:** Em modo offline, o usuário da sessão não possui papel nem dono, e essa
   ausência é explícita — não silenciosa. 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md` (BR-MIGRAR-039)
   - Tipo: alterada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O projeto possui descrição de tipo para as 8 entidades persistidas, espelhando os contratos de dados existentes, sem alterá-los | Must | Existe um arquivo de tipo por entidade; nenhum contrato do servidor foi modificado | 🟢 |
| RF-02 | Campo sensível é identificável no contrato e o consentimento de LGPD é condicional | Must | Registrar consentimento aceito sem data e sem endereço de rede **não compila** | 🟢 |
| RF-03 | Conjuntos fechados de status e tipo rejeitam valores fora do conjunto | Must | Atribuir valor não pertencente ao conjunto **não compila** | 🟢 |
| RF-04 | Existe um único contrato de acesso a dados, honrado tanto pelo modo online quanto pelo offline | Must | Ambos os modos são compilados contra o mesmo contrato sem erro | 🟢 |
| RF-05 | A leitura de dado clínico exige declaração de escopo de acesso | Must | Ler dado clínico sem informar escopo **não compila** | 🟢 |
| RF-06 | O nome de entidade é verificado; entidade inexistente não compila | Must | Referenciar entidade com nome incorreto **não compila** | 🟢 |
| RF-07 | O usuário da sessão em modo offline é uma variante que não carrega papel | Must | Trecho de código que exige papel não compila contra a variante offline | 🟢 |
| RF-08 | A verificação de tipos é executável de forma isolada e não emite arquivos | Must | Comando único de verificação existe, retorna situação e não escreve artefatos | 🟢 |
| RF-09 | O código-fonte é integralmente verificado em modo estrito, exceto o corpo dos arquivos .jsx da pasta de componentes de interface herdados de biblioteca, cuja exclusão é explícita no arquivo de configuração e justificada por escrito no roadmap (D-01), já que o verificador não aceita comentários | Must | Verificação estrita termina sem erro sobre os 77 arquivos do programa (58 de aplicação + 19 declarações de tipo dos componentes herdados); a única exclusão é o corpo .jsx da pasta de componentes herdados, registrada por escrito | 🟢 |
| RF-10 | Os componentes de interface são verificados quanto a contrato de propriedades | Should | Componentes de interface compilam sob verificação estrita | 🟡 |
| RF-11 | As telas são convertidas por módulo, preservando comportamento | Should | Cada módulo converte sem alteração observável; verificação por módulo | 🟢 |
| RF-12 | O modo offline possui dados iniciais alinhados ao contrato das entidades | Should | Dados iniciais do modo offline validam contra os contratos | 🟢 |
| RF-13 | ~~Dependências declaradas e não utilizadas são removidas~~ **Retirado do escopo** na sessão de esclarecimentos: a remoção não integra esta feature e fica registrada como pendência separada | — | n/a | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Paridade | Nenhuma alteração de comportamento observável é introduzida, e a paridade é comprovada por verificação de tipos somada a roteiro manual de fumaça derivado dos 26 cenários já existentes em `_reversa_sdd/migration/parity_tests/` | Regra de ouro do plano; projeto sem testes automatizados e sem dependência nova autorizada | 🟢 |
| Segurança | A verificação de tipos confere forma, nunca autorização; o isolamento real permanece no servidor | `_reversa_sdd/permissions.md`; achados de auditoria F-01/F-02/F-03 referidos à codificação | 🟢 |
| Segurança | O contrato de campo sensível não substitui a proteção do dado, que permanece no servidor | `_reversa_sdd/inventory.md#Visão geral` | 🟢 |
| Privacidade | Campos sensíveis e de consentimento são marcados no contrato | Requisito regulatório LGPD | 🟢 |
| Manutenibilidade | A verificação de tipos é o gate objetivo de cada etapa | Ausência de testes automatizados torna o gate a única barreira mecânica | 🟢 |
| Compatibilidade | A estrutura de pastas existente é preservada; apenas a camada de tipos e o contrato de dados são acrescentados | Decisão de topologia híbrida registrada no plano de migração | 🟢 |
| Desempenho | A verificação não altera o artefato de produção nem o tempo de execução do sistema | Requisito de verificação sem emissão de arquivos | 🟡 |
| Observabilidade | Mensagens de falha da verificação indicam arquivo e linha | Convenção da ferramenta de verificação | 🟡 |
| Processo | O ponto de partida está medido e registrado antes de iniciar a conversão | Medição real: 1.324 erros em 81 arquivos | 🟢 |

### 6.1 Limites explícitos de alcance

- A verificação de tipos **não** valida autorização, papel ou dono. Ela exige que o
  escopo seja informado; não verifica se o escopo informado é legítimo. 🟢
- A verificação de tipos **não** corrige as não conformidades de segurança
  identificadas na auditoria; elas permanecem referidas à codificação. 🟢
- Comportamentos congelados por decisão humana não são alterados: indicador de
  mock do painel, divergência de critérios entre contadores, transição manual de
  status, ausência de paginação na trilha de auditoria e ausência de aviso visual
  no modo offline. 🟢
- Não são introduzidos componentes, produtos ou serviços novos; em particular, **nenhum arcabouço de teste automatizado é adicionado** nesta feature. 🟢
- A paridade de comportamento é atestada por roteiro manual de fumaça derivado dos 26 cenários de paridade já existentes, **não** por execução automatizada. A expressão "paridade comprovada" não deve ser usada: a evidência é verificável, mas manual. 🟢

## 7. Critérios de Aceitação

```gherkin
Cenário: Verificação integral sem erros
  Dado o código-fonte integralmente convertido
  Quando a verificação estrita de tipos é executada sobre todo o código-fonte,
  exceto a pasta de componentes de interface herdados de biblioteca
  Então ela termina sem nenhum erro

Cenário: Campo com nome incorreto é recusado
  Dado um contrato de tipo para o cadastro de paciente
  Quando o código atribui um valor a um campo com nome inexistente
  Então a verificação falha apontando o arquivo e a linha

Cenário: Status fora do conjunto é recusado
  Dado o conjunto fechado de status de consulta
  Quando o código atribui um status que não pertence ao conjunto
  Então a verificação falha

Cenário: Consentimento incompleto é recusado
  Dado o contrato condicional de consentimento
  Quando o código registra consentimento aceito sem data ou sem endereço de rede
  Então a verificação falha

Cenário: Leitura de dado clínico sem escopo é recusada
  Dado o contrato de acesso a dados
  Quando uma leitura de dado clínico é escrita sem informar o escopo de acesso
  Então a verificação falha

Cenário: Escopo informado permite a leitura
  Dado o contrato de acesso a dados
  Quando a leitura informa o escopo do próprio dono
  Então a verificação passa e o filtro de dono é aplicado

Cenário: Contrato único honrado pelos dois modos
  Dado o contrato único de acesso a dados
  Quando a implementação online e a implementação offline são verificadas
  Então ambas satisfazem o contrato sem erro

Cenário: Usuário offline não carrega papel
  Dado o contrato do usuário de sessão
  Quando o código exige um papel do usuário em modo offline
  Então a verificação falha, obrigando o tratamento explícito do caso

Cenário: Entidade inexistente é recusada
  Dado o registro fechado de entidades conhecidas
  Quando o código referencia uma entidade com nome incorreto
  Então a verificação falha sugerindo o nome correto

Cenário: Verificação isolada não emite artefatos
  Dado o comando de verificação de tipos
  Quando ele é executado
  Então nenhum arquivo de saída é produzido e o código de retorno reflete o resultado

Cenário: Comportamento preservado após a conversão
  Dado o sistema convertido
  Quando a verificação por módulo é executada
  Então nenhuma diferença observável de comportamento é introduzida

Cenário: Paridade atestada por roteiro manual
  Dado o sistema convertido e o roteiro de fumaça derivado dos cenários de paridade
  Quando o responsável executa o roteiro no módulo convertido
  Então cada cenário do roteiro é registrado como conforme ou divergente
  E nenhuma divergência permanece sem tratamento antes de avançar de módulo
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem os contratos de entidade nada mais é verificável |
| RF-02 | Must | Requisito regulatório de privacidade |
| RF-03 | Must | Enums fechados são o núcleo das regras de domínio |
| RF-04 | Must | Impede divergência silenciosa entre online e offline |
| RF-05 | Must | Dá sustentação mecânica ao isolamento por dono |
| RF-06 | Must | Elimina a classe de erro mais comum: nome de campo e de entidade |
| RF-07 | Must | Torna explícita a ausência de papel no modo offline |
| RF-08 | Must | Sem gate executável o processo não tem barreira objetiva |
| RF-09 | Must | É o critério final de conclusão, ressalvada a exclusão registrada da pasta de componentes herdados |
| RF-10 | Should | Amplia a cobertura do gate para a camada de interface |
| RF-11 | Should | Converte o restante do sistema por módulo, com verificação parcial |
| RF-12 | Should | Alinha os dados do modo offline ao contrato |
| RF-13 | Won't | Retirado do escopo por decisão humana: a remoção das dependências não utilizadas não pertence a esta feature |

## 9. Esclarecimentos

### Sessão 2026-09-14

- **Q:** As 14 dependências declaradas e não utilizadas entram no escopo desta feature?
  **R:** Não. Ficam fora do escopo; a remoção é registrada como pendência separada. Consequência: RF-13 retirado, prioridade passa a `Won't`.
- **Q:** Com o que a paridade de comportamento será comprovada?
  **R:** Verificação de tipos somada a roteiro manual de fumaça derivado dos 26 cenários Gherkin já existentes em `_reversa_sdd/migration/parity_tests/`. Nenhuma dependência nova é introduzida e nenhum arcabouço de teste é adicionado.
- **Q:** O modo estrito se aplica aos componentes de interface herdados de biblioteca?
  **R:** Estrito em todo o código-fonte, **exceto** a pasta de componentes de interface herdados, cuja exclusão é registrada no próprio arquivo de configuração da verificação — a justificativa por escrito vive no roadmap (D-01), porque o verificador não aceita comentários nesse arquivo.

## 10. Lacunas

Nenhuma lacuna em aberto. As três dúvidas do documento inicial foram resolvidas na sessão de esclarecimentos acima.

### Pendência transferida para fora desta feature

- 🟡 **Remoção das 14 dependências declaradas e não utilizadas** (`@stripe/react-stripe-js`, `@stripe/stripe-js`, `react-leaflet`, `jspdf`, `html2canvas`, `lodash`, `react-quill`, `three`, `react-markdown`, `canvas-confetti`, `@hello-pangea/dnd`, `@radix-ui/react-toast`, `zod`, `@hookform/resolvers`). Não pertence a esta feature. Exige reconfirmação por busca no código-fonte e aprovação explícita antes de qualquer remoção (plano original, RISK-006).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-14 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-14 | Registrado o ponto de partida correto (1.324 erros) e os limites explícitos de alcance da verificação de tipos | reversa |
| 2026-09-14 | Sessão de esclarecimentos: 3 dúvidas resolvidas. RF-13 retirado do escopo; paridade passa a ser atestada por roteiro manual; exclusão da biblioteca de interface registrada | reversa-clarify |
