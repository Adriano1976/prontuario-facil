# Adendo: Prova automatizada como cidadã do ciclo Reversa

> Feature: `002-prova-automatizada`
> Data: `2026-09-19`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-19.

## Resumo da entrega

Arrolar como cidadã de primeira classe a prova automatizada que existia no código sem
que nenhuma spec a tivesse prometido: dar-lhe requisitos, critérios de aceite e
rastreabilidade; converter em comando reproduzível as verificações negativas do gate de
tipos que só existiam como procedimento manual registrado em histórico; converter em
prova de execução os cenários de paridade do módulo Pacientes; provar o recorte do
defeito DIV-01 no modo offline; e declarar o destino de tudo o que permanece sem prova.

**Ações concluídas: 14 de 14** (`actions.md`).

Gates medidos em 2026-09-19: `npm test` com 36 verificações em 10 arquivos e 0 falhas
(32,5 s), `npm run typecheck` com 0 erros, `npm run lint` com 0 erros e
`npm run prova:negativos` com 9 de 9 casos recusados pelo motivo esperado e sem resíduo.

**Nenhuma regra de negócio foi alterada, nenhum contrato de dados mudou e nenhum
comportamento observável foi tocado.** Por isso a tabela abaixo não registra impacto em
`_reversa_sdd/domain.md`: as dez regras de ouro continuam corretas como estão. O que
muda é a **verificabilidade** de parte delas, e o que muda de conteúdo são três artefatos
da extração que descreviam o projeto sem prova automatizada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/inventory.md` | `Cobertura de testes` | `regra-alterada` | A seção afirmava "nenhum teste encontrado (sem framework de teste configurado)". **Leia como:** a camada de prova existe desde 2026-09-19 — 10 arquivos de verificação, executáveis por `npm test` e por `npm run prova:negativos` |
| `_reversa_sdd/inventory.md` | `CI/CD` | `regra-alterada` | A frase que sustentava a conclusão ("sem `.github/workflows/`") é imprecisa: existe `.github/workflows/deploy-pages.yml`, mas ele publica o mini-site de documentação em GitHub Pages e não constitui integração contínua da aplicação. A conclusão permanece válida na prática |
| `_reversa_sdd/dependencies.md` | `Observações` | `regra-alterada` | A linha "Sem framework de testes configurado e sem testes no repositório" é **falsa** desde 2026-09-19. As dependências de desenvolvimento da prova foram declaradas depois da extração original e não constam do levantamento daquele documento |
| `_reversa_sdd/architecture.md` | `1. Visão Resumida` | `componente-novo` | **Acrescente a camada de prova** aos componentes do sistema: os 10 arquivos de verificação, a configuração de ambiente de DOM simulado, o ponto de montagem comum e o comando de reprodução das verificações negativas do gate de tipos. Não existia no legado |
| `_reversa_sdd/code-spec-matrix.md` | `Rastreabilidade Spec → Código → Teste` | `regra-alterada` | A seção ganhou veredito de prova por promessa, o desdobramento do cenário de paridade PT-001.3, o destino declarado dos 50 cenários de paridade não cobertos nesta feature e a relação de lacunas atualizada — com o que foi fechado marcado como fechado |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | `Resumo da entrega` | `regra-alterada` | A afirmação "não existe teste automatizado" **descrevia corretamente o estado da entrega da 001** e permanece válida como registro histórico daquela feature. Para o estado **presente**, leia este adendo: o adendo da 001 não foi reescrito, por decisão registrada (D-11 do roadmap desta feature) |

> O adendo **anota, não corrige**: nenhuma das afirmações acima foi editada nos artefatos
> originais. As três correções factuais de `inventory.md` e `dependencies.md` já foram
> aplicadas como parte das ações T010 e T011 desta feature, com a razão declarada no
> próprio arquivo; o que este adendo faz é registrar que elas existem, para quem lê a
> extração sem passar pelos artefatos do ciclo forward.

## Regras sob vigilância

Watch items criados por esta feature — conteúdo em
`_reversa_forward/002-prova-automatizada/regression-watch.md`:

`W001` · `W002` · `W003` · `W004` · `W005` · `W006` · `W007` · `W008`

Como esta feature não alterou comportamento, esses itens não são regressões a evitar:
são **propriedades novas que precisam continuar verdadeiras** — a prova que acabou de
nascer. A seção de observações daquele arquivo registra os itens sem confidência
suficiente para o watch principal, entre eles a alternativa `// @ts-expect-error`
descartada e a dívida do localizador de elemento por classe de estilo.

## Fontes

- `_reversa_forward/002-prova-automatizada/legacy-impact.md`
- `_reversa_forward/002-prova-automatizada/regression-watch.md`
- `_reversa_forward/002-prova-automatizada/requirements.md`
- `_reversa_forward/002-prova-automatizada/roadmap.md`
- `_reversa_forward/002-prova-automatizada/actions.md`
- `_reversa_forward/002-prova-automatizada/progress.jsonl`
- `_reversa_forward/002-prova-automatizada/onboarding.md`

---
*Gerado pelo Reversa-Sync em 2026-09-19.*
