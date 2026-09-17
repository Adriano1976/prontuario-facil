# Roadmap: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
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
| D-01 | Verificação em modo estrito sobre todo o código-fonte, **exceto** a pasta de componentes de interface herdados de biblioteca, com a exclusão escrita no próprio arquivo de configuração | Decisão humana (esclarecimento 3b): os componentes herdados quase não foram tocados e renderizariam muito ajuste de baixo valor; o corpo (.jsx) da pasta permanece fora da verificação estrita, mas os contratos de propriedades são verificados pelas 19 declarações *.d.ts, que entram no programa por import | Estrito absoluto sem exceção; estrito só no código próprio (deixaria a camada de interface sem verificação nenhuma) | 🟢 |
| D-02 | Registro **fechado** de entidades: o acesso a dados é tipado com as 8 entidades de domínio mais a entidade embutida User do BaaS, não com índice aberto | Com índice aberto, erro de digitação no nome da entidade continua compilando — risco nº 5 do plano de migração ("desacoplamento silencioso") | Índice aberto como o legado faz; híbrido com escape aberto para entidades futuras | 🟢 |
| D-03 | Leitura de entidade sob isolamento por dono não expõe operação de leitura sem escopo; a leitura passa por escopo declarado (dono ou administrativo) | Cenário 1 do teste de paridade PT-010: "código que esquece o filtro de ownership não compila" | Exigir escopo nas operações cruas tocando as 51 chamadas; deixar apenas documentado para fase futura | 🟢 |
| D-04 | O contrato de acesso a dados da aplicação recebe nome próprio (`AppDataClient`), porque o SDK do BaaS já exporta um tipo com o nome `Base44Client` | Evita dois tipos homônimos com significados diferentes no mesmo projeto | Manter o nome e apelidar o tipo do SDK; não importar o tipo do SDK pelo nome | 🟢 |
| D-05 | Anexar o adapter ao contrato por função de verificação em compile-time, e não por anotação em cada adaptador | Uma única função comprova que as duas implementações (online e offline) honram o mesmo contrato — cenário 3 do PT-010 | Anotar cada adaptador separadamente; confiar em revisão manual | 🟢 |
| D-06 | Conversão para TypeScript feita de dentro para fora: entidades de dados, depois acesso a dados, depois componentes, depois telas | Estratégia A aprovada (incremental por camadas): erro de tipo fica localizado na camada que está sendo convertida | Conversão total em um único passo; conversão por tela começando pelas telas | 🟢 |
| D-07 | Paridade atestada por verificação de tipos somada a roteiro manual de fumaça derivado dos 26 arquivos / 55 cenários existentes | Decisão humana (esclarecimento 2a): sem dependência nova e sem arcabouço de teste nesta feature | Introduzir teste automatizado agora; confiar só na verificação de tipos | 🟢 |
| D-08 | Os dados iniciais do modo offline são alinhados ao contrato das entidades | O conteúdo atual dos dados de exemplo diverge do contrato em vários campos e já é incompatível com o consumo das telas | Manter como está e converter com asserções de tipo; reescrever os dados de exemplo | 🟢 |
| D-09 | A remoção das 14 dependências não utilizadas fica **fora** desta feature | Decisão humana (esclarecimento 1b); exige reconfirmação por busca e aprovação explícita | Remover junto com a conversão; remover apenas as de risco óbvio | 🟢 |
| D-10 | As não conformidades de segurança já auditadas permanecem **apenas documentadas**, sem correção | Regra de ouro da migração: só tipos, nenhuma correção de comportamento. A verificação confere forma, nunca autorização | Corrigir junto; deixar sem menção | 🟢 |
| D-11 | O modo offline do usuário de sessão é uma variante discriminada que não carrega papel nem dono | BR-MIGRAR-039: a ausência precisa ser explícita para que trecho dependente de papel não compile cego | Papel opcional; papel com valor sentinela | 🟢 |
| D-12 | Congelar os comportamentos que o legado sinaliza como divergência ou ausência: indicador de mock do painel, critério divergente entre contadores, transição manual de status do agendamento, ausência de paginação na trilha e ausência de aviso visual no offline | Decisão humana (requirements §6.1): a feature converte linguagem, não corrige comportamento. BR-A02 é 🟡 inferida e afirma o contrário — a divergência é deliberada | Corrigir junto com a conversão; manter só em §6.1, sem decisão rastreável | 🟢 |

### 3.1 Mapeamento requisito ↔ decisão

| Requisito | Decisão / etapa |
|-----------|-----------------|
| RF-01 | etapa 2 (T006-T017) |
| RF-02 | RN-06; etapa 2 (T008); T031 |
| RF-03 | etapa 2 (T007, T009-T015); T032 |
| RF-04 | D-04, D-05; T018, T037-T039 |
| RF-05 | D-03; T019, T033 |
| RF-06 | D-02; T020, T036 |
| RF-07 | D-11; T016 |
| RF-08 | D-01; T001, T002 |
| RF-09 | D-01; T005, T042, T043 |
| RF-10 | D-01 (componentes da aplicação; herdados por declaração) |
| RF-11 | D-06; T021-T030 |
| RF-12 | D-08; T040 |
| RF-13 | fora de escopo (D-09) |
| RN-01..RN-08 | etapa 2; D-11 (RN-08); D-12 (RN-03) |

## 4. Premissas

Nenhuma. O `requirements.md` não possui marcador `[DÚVIDA]` pendente — as três dúvidas
do documento inicial foram resolvidas na sessão de esclarecimentos de `2026-09-14`. 🟢

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/types/` | `_reversa_sdd/architecture.md` | componente-novo | Camada de contratos de tipo das 8 entidades, sem equivalente no legado |
| `src/api/` (contrato) | `_reversa_sdd/architecture.md` | contrato-novo | Contrato único de acesso a dados, honrado pelos dois modos |
| `src/api/base44Client.ts` | `_reversa_sdd/code-analysis.md` | contrato-alterado | Passa a satisfazer o contrato tipado; comportamento idêntico |
| `src/api/mockClient.ts` | `_reversa_sdd/code-analysis.md` | contrato-alterado | Passa a satisfazer o mesmo contrato; comportamento idêntico |
| `src/api/mockSeed.ts` | `_reversa_sdd/code-analysis.md` | regra-alterada | Dados de exemplo alinhados ao contrato (D-08) — única mudança de dados desta feature |
| Arquivos de configuração de verificação | — | componente-novo | Configuração do verificador e comando de gate |
| Script de verificação no manifesto do projeto | — | contrato-alterado | O comando atual mira a configuração legada e não verifica de fato |
| Demais `src/` (~87 arquivos) | `_reversa_sdd/inventory.md#Estrutura de pastas` | regra-alterada | Conversão de linguagem sem mudança de comportamento |
| `src/api/sessionScope.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Resolução do escopo de leitura pelo papel da sessão (`resolveScope`), preservando o comportamento nos dois modos |
| `src/api/entities.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Ligação ao SDK com o registro fechado de entidades |
| `src/lib/session.ts` | `_reversa_sdd/code-analysis.md` | componente-novo | Ponto único de conversão da identidade da sessão para o tipo de domínio |
| `src/components/ui/*.d.ts` (19) | — | componente-novo | Declarações de tipo ao lado dos componentes herdados; dão contrato de propriedades sem tocar o corpo `.jsx` |

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
| Contrato interno de acesso a dados (`AppDataClient`) | interno, entre telas e camada de dados; inclui envio de e-mail transacional (SendEmail) na confirmação de agendamento | `_reversa_forward/001-migracao-typescript/interfaces/app-data-client.md` |
| SDK do BaaS (`@base44/sdk`) | biblioteca externa — **não alterado** | `_reversa_forward/001-migracao-typescript/interfaces/base44-sdk.md` |
| Armazenamento local do modo offline (`mock_db_*`) | armazenamento do navegador — **não alterado no formato** | `_reversa_forward/001-migracao-typescript/interfaces/mock-local-storage.md` |

Nenhum contrato HTTP, de fila, gRPC ou GraphQL é criado ou alterado.

## 8. Plano de migração

Ordem de execução, de dentro para fora (D-06). Todas as etapas foram executadas.

1. **Configuração e gate** — ✅ Executada (T001-T005).
2. **Contratos de tipo das entidades** — ✅ Executada (T006-T017).
3. **Contrato de acesso a dados** — ✅ Executada: contrato, registro fechado, camada de escopo
   e a ligação dos dois adaptadores (T018-T020, T037-T039).
4. **Componentes de negócio** — ✅ Executada (T021, T022).
5. **Telas, por módulo** — ✅ Executada na ordem prevista (T023-T030).
6. **Modo offline** — ✅ Executada (T040).
7. **Endurecimento final** — ✅ Executada: gate ligado e os 1.324 erros reduzidos a 0
   (T042, T043).

Estado em 2026-09-15: 44 de 44 ações [X]; `npm run typecheck` e `npm run build` validados na
máquina do responsável (T044, questions.md). A verificação `tsc --listFiles` cobre 77 arquivos
sob `src/` (58 de aplicação + 19 declarações).

A ordem de 4 para 5 é obrigatória nesta direção porque as telas consomem os
componentes; converter na ordem inversa deixaria a fronteira sem tipo no meio do
caminho.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Regressão silenciosa de comportamento: o projeto não tem nenhum teste automatizado, e "só tipos" é uma promessa difícil de verificar | alto | alto | Roteiro de fumaça derivado dos 26 arquivos / 55 cenários de paridade, executado a cada módulo (D-07); cada etapa é reversível isoladamente |
| O ponto de partida real (1.324 erros) é quase o dobro do registrado no plano original, e o prazo estimado pode não se sustentar | médio | alto | Trabalhar por módulo com gate parcial; não prometer prazo derivado do plano antigo |
| Ferramenta de tipos apaga invariante sem avisar quando o utilitário de omissão não distribui sobre união | alto | médio | Já ocorreu e foi corrigido nesta sessão: o invariante de consentimento havia sumido e só foi detectado por arquivo de teste com uso incorreto. Manter esse tipo de verificação negativa a cada etapa |
| Erro de sintaxe em um único arquivo interrompe a verificação de todo o projeto, dando aparência de código saudável | alto | médio | Já ocorreu nesta sessão (um parêntese a mais mascarava mais de mil erros). Sempre conferir que a contagem de arquivos verificados é a esperada, não apenas que o gate passou |
| A conversão do acesso a dados quebra as telas que ainda estão na linguagem antiga | médio | médio | Converter de dentro para fora e por módulo; a resolução de módulos do empacotador aceita as duas linguagens convivendo |
| Os dados de exemplo do modo offline divergem do contrato em vários campos, e alguns já são incompatíveis com o consumo atual das telas | médio | alto | Alinhar na etapa 6 (D-08), depois que o contrato estiver estável |
| A verificação estrita sobre a camada de interface herdada geraria muito ajuste de baixo valor | baixo | alto | Exclusão registrada por escrito (D-01); a exceção é auditável |
| Não conformidades de segurança auditadas serem confundidas com algo que os tipos resolvem | alto | médio | Registrado explicitamente nos limites de alcance do `requirements.md`: o verificador confere forma, nunca autorização |

## 10. Critério de pronto

- [x] Todas as ações do `actions.md` marcadas `[X]`
- [x] Verificação estrita termina sem erro sobre os 77 arquivos do programa (58 de
      aplicação + 19 declarações de tipo dos componentes herdados), com a única exclusão
      registrada sendo o corpo `.jsx` da pasta de componentes herdados
- [x] As duas implementações de acesso a dados verificadas contra o mesmo contrato
- [x] Nenhum marcador de dúvida pendente no `requirements.md`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [x] `regression-watch.md` gerado
- [x] Roteiro de fumaça executado e registrado para cada módulo convertido
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [x] Verificação de princípios: **sem objeto** neste projeto (não há
      `.reversa/principles.md`)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-14` | Versão inicial gerada por `/reversa-plan` | reversa |
| `2026-09-17` | Aplicado o Apêndice A.2 do `audit/cross-check.md`: §8 e §10 sincronizados com a entrega (A001); delta arquitetural com os quatro artefatos novos e os nomes `.ts` (A004, A015); D-02 alinhado ao registro real de entidades (A010); D-12 de congelamento (A006, A016) e §3.1 de rastreabilidade requisito↔decisão (A005) criados; §7 com o envio de e-mail transacional (A015) | revisão manual pós-auditoria |
