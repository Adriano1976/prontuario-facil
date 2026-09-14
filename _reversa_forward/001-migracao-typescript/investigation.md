# Investigation: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
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
