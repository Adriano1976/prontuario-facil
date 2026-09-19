# Legacy Impact: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Política de edição do legado no momento da execução: `allowLegacyEdits: true`, com
> `allowedPaths` liberando `src/**`, `package.json`, `tsconfig.json`, `docs/**` e
> `index.html`. As pastas próprias do Reversa permanecem graváveis pela regra própria.
> **Nenhum caminho do plano caiu fora da política** — não houve recusa de escrita.

## Tabela de arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/test/verificacoes-negativas.mjs` | Camada de prova (`_reversa_sdd/inventory.md#Cobertura de testes`) | `componente-novo` | LOW | Utilitário novo. Não entra no programa verificado (admissão de JavaScript desligada) nem é coletado como prova (nome fora do padrão de arquivo de teste) |
| `package.json` | Manifesto de comandos (`_reversa_sdd/dependencies.md`) | `regra-nova` | LOW | Acrescenta `prova:negativos`. **Nenhuma dependência nova** — usa o verificador de tipos já declarado |
| `src/pages/__tests__/PatientForm.test.tsx` | Camada de prova | `regra-alterada` | LOW | Prova de execução de BR-P02 (conjunto fechado de tipo sanguíneo) e dublê do módulo de seleção, no padrão já usado em `Patients.test.tsx` |
| `src/api/__tests__/mockClient.test.ts` | Camada de prova | `regra-alterada` | LOW | Prova de ponta a ponta do defeito DIV-01 no modo offline |
| `_reversa_sdd/code-spec-matrix.md` | Artefato da extração | `regra-alterada` | MEDIUM | Ganha vereditos atualizados, o desdobramento do cenário PT-001.3, o destino dos 50 cenários não cobertos e a relação de lacunas |
| `_reversa_sdd/dependencies.md` | Artefato da extração | `regra-alterada` | MEDIUM | A linha "sem framework de testes e sem testes no repositório" era factualmente falsa |
| `_reversa_sdd/inventory.md` | Artefato da extração | `regra-alterada` | MEDIUM | A seção de cobertura de testes estava defasada, e a frase sobre integração contínua era imprecisa |

> **Nenhum arquivo de aplicação foi tocado.** Não há `src/pages/*.tsx`, `src/lib/*`,
> `src/api/*.ts` (fora de `__tests__`) nem `base44/entities/*.jsonc` na lista. A regra de
> ouro do diff foi respeitada: a prova observa, não altera.

## Diff conceitual por componente

### Camada de prova (componente novo em relação ao legado)

O inventário registrava "nenhum teste encontrado". A camada existe desde os quatro
commits de 2026-09-19 e esta feature a arrola: acrescenta duas verificações de execução
(BR-P02 e DIV-01) e o utilitário que reproduz as verificações negativas do gate de tipos.

### Manifesto de comandos

Ganha `prova:negativos`. O comando `test` já existia. Não há dependência nova: o
utilitário usa o verificador de tipos que o projeto já declara.

### Artefatos da extração

Três documentos passam a dizer a verdade sobre o presente. `dependencies.md` e
`inventory.md` afirmavam que não havia prova automatizada; a matriz não registrava
veredito de prova nem destino para os cenários de paridade.

## Preservadas

Regras 🟢 de `_reversa_sdd/domain.md#2. Regras de Negócio de Ouro` que continuam
intactas — **todas as dez**:

- **BR-P01** — apenas pacientes `ativo` são selecionáveis para agendamento ou consulta.
- **BR-P02** — `blood_type` restrito ao enum ABO/Rh mais `desconhecido`.
- **BR-A01** — o agendamento nasce `agendado` e precisa ser `confirmado` antes do atendimento.
- **BR-A03** — o painel exclui agendamentos `cancelados` das contagens de hoje e próximos.
- **BR-T01** — modelos de documento são filtrados por tipo.
- **BR-T02** — `medications` só é exigido quando o tipo do documento inclui "receita".
- **BR-S01** — todo acesso a dado sensível gera registro na trilha de auditoria.
- **BR-S02** — usuário não-admin só vê o que ele mesmo criou.

As regras 🟢 herdadas de `_reversa_sdd/pacientes/requirements.md#4. Permissões e Segurança`
(RLS por `created_by_id` ou papel `admin`) também permanecem intactas.

## Modificadas

**Nenhuma.** Esta feature não altera regra de negócio, contrato de dados, schema de
entidade nem comportamento observável. A única classe de afirmação que muda é a
documental: três artefatos da extração que descreviam o projeto como desprovido de prova
automatizada passam a descrevê-lo como ele é.

> Consequência para o `regression-watch.md`: como não houve regra alterada nem removida,
> os itens de vigilância desta feature não são regressões a evitar, e sim **propriedades
> novas que precisam continuar verdadeiras** — a prova que acabou de nascer.
