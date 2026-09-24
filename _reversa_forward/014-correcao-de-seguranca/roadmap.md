# Roadmap: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Requirements: `_reversa_forward/014-correcao-de-seguranca/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

> ⚠️ **Retroactivo, como o `requirements.md`.** As decisões abaixo foram tomadas **durante** a
> execução das correções, em 2026-09-24, e estão sendo registradas depois. Onde uma decisão foi
> tomada contra a primeira tentativa implementada, isso está dito — porque a tentativa recusada é
> parte do valor do registro.

## 1. Resumo da abordagem

O fio condutor é **não inventar regra nova onde já existe regra escrita**. Cada um dos quatro achados
foi confrontado com o contrato do projeto antes de virar código: o F-01 com a distinção que o próprio
corpus faz entre leitura restrita (trilha, `BR-MIGRAR-024`) e leitura livre (médicos e templates,
`BR-MIGRAR-017`/`020`); o F-03 com `BR-MIGRAR-034`, que **já exigia** obrigatoriedade de escopo em
mutações e só tinha sido implementada para leitura; o F-04 com a mesma `BR-MIGRAR-024`; e o F-05 com
a remoção de um sink, sem trocar comportamento por outro. O F-02 foi analisado até o SDK e
**declarado fora de alcance**, com a evidência registrada — em vez de receber um remendo que daria a
impressão de fechar o achado.

## 2. Princípios aplicados

`.reversa/principles.md` **não existe** neste projeto (o `/reversa` nunca gerou o arquivo, embora o
template exista em `.reversa/templates/principles-template.md`). Não há, portanto, princípio formal a
confrontar. No lugar dele, a feature seguiu três regras que o corpus declara em prosa, e as três
foram tratadas como obrigação:

| Regra herdada do corpus | Como a feature se relaciona | Status |
|-------------------------|------------------------------|--------|
| "O tipo garante a FORMA, nunca a AUTORIZAÇÃO" (`scopedRead.ts:30-32`; `sessionScope.ts:18-21`) | Nenhuma guarda desta feature verifica autorização; todas declaram escopo ou oferecem/omitir superfície | respeita |
| "A defesa real permanece a RLS do backend, intocada" (`scopedRead.ts:32`) | `base44/entities/*.jsonc` não foi tocado; nenhuma leitura passou a confiar em verificação de cliente | respeita |
| "Mudança de comportamento exige prova, decisão registrada e alteração da prova **de propósito**" (features 003, 005, 006) | As seis verificações existentes que a mudança de contrato quebrou foram reescritas para **afirmar** o novo contrato, e a prova nova foi falsificada antes de aceita | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A guarda de **rota** cobre **uma só** rota — `/AccessLogs`. Médicos e Templates recebem guarda de **ação** na própria tela | `BR-MIGRAR-024` restringe a **leitura** da trilha; `BR-MIGRAR-017`/`020` **liberam** a leitura de médicos e templates. Uma guarda de rota nas três restringiria mais do que a regra permite | a) guardar as três rotas — era a primeira tentativa, e contraría `BR-MIGRAR-017`/`020`; b) não guardar nada — é o achado | 🟢 |
| D-02 | O `OFFLINE_USER` **não** recebe papel | O modo offline **não aplica RLS** (`BR-OFF10`/`BR-MIGRAR-044`); dar `role: 'admin'` ao usuário de demonstração transformaria a guarda na única barreira, e ela passaria por construção | a) `role: 'admin'` no mock, "para a guarda passar" — era o que a primeira tentativa fazia, e contradiz `src/types/User.ts` | 🟢 |
| D-03 | A obrigatoriedade de escopo nas mutações é de **contrato**, não de verificação em runtime | `BR-MIGRAR-034` diz textualmente que "o compilador **não** valida autorização em runtime, e a RLS do BaaS permanece intocada" | a) verificar posse no cliente, lendo o registro antes de mutar — duplicaria a RLS no cliente, acrescentaria uma requisição por mutação e tem TOCTOU; b) não fazer nada — era o achado | 🟢 |
| D-04 | A leitura da trilha passa a declarar escopo administrativo, e o caminho de dono responde vazio **sem consultar o servidor** | `asAdmin` só aceita escopo administrativo, então o caminho de quem não é admin precisa ser **dito** — era exatamente o que a omissão escondia: "admin lendo" e "qualquer um lendo" eram o mesmo código | a) manter o repositório cru — era o achado F-04; b) usar `asUser` para todos — declararia o escopo errado para uma leitura admin-only | 🟢 |
| D-05 | O F-05 remove o sink entregando o CSS como **texto**, em vez de propriedades customizadas inline | As regras têm duas variantes de tema (`light` e `.dark`); propriedade inline não expressa a variante escura, e o componente **não tem consumidor** — a regressão passaria despercebida | a) seguir a recomendação literal da auditoria (inline) — trocaria um achado baixo por defeito latente de tema; b) apagar o componente — contradiz a decisão `D-01` da feature 001, que preservou os `.jsx` de `ui/` | 🟢 |
| D-06 | A correção do F-05 **não** tem watch próprio | Não há contrato de comportamento a preservar; a guarda é a prova, que alimenta o componente com uma cor hostil e afirma que nada executável nasce | a) criar watch de um item só — ruído sem função | 🟢 |
| D-07 | Toda correção entra com prova, e a prova das guardas de ação é **falsificada** antes de aceita | Verde de primeira não prova nada: desligada a guarda, 3 das 6 verificações falharam — exatamente as que medem o não-admin | a) aceitar o verde — foi assim que o F-01 passou despercebido por duas auditorias | 🟢 |
| D-08 | O trabalho é registrado por **adendo + seções da matriz + watches**, e a edição direta de artefatos da extração é declarada **fora do rito** | O framework prevê que o adendo **anote** e a re-extração **converga**; editar a extração à mão cria uma segunda divergência, e ela fica registrada em `_reversa_sdd/pendencias-de-convergencia.md` | a) não registrar — deixaria o corpus afirmando o comportamento revogado; b) registrar só na matriz — deixaria as três features sem watch | 🟢 |
| D-09 | O **F-02 não é corrigido neste repositório**: o achado fica registrado com a evidência medida, e o remendo no `app-params.ts` é **recusado** | O SDK do Base44 faz **o mesmo sozinho** — `@base44/sdk/dist/client.js:123` executa `token \|\| getAccessToken()`, e `getAccessToken()` tem por default `saveToStorage: true` e `paramName: 'access_token'` (`dist/utils/auth-utils.js:38`). Apagar o tratamento do `app-params.ts` **não removeria a exposição**, e `CreateClientConfig` não expõe opção para desligar isso. O que fecharia o achado é deixar de receber sessão por `?access_token=`, apoiando-se na sessão por cookie `httpOnly` que o próprio SDK referencia — decisão de **plataforma/deployment** | a) alinhar o `app-params.ts` com o utilitário do SDK e chamar isso de correção — **teatro de segurança**: a exposição permanece, e o registro passaria a afirmar o contrário; b) remover o tratamento de token do cliente — o SDK o colheria de volta, com o mesmo resultado | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| O deployment recebe sessão por `?access_token=` | `## 10`, primeira dúvida | Se não receber, o F-02 é caminho sem uso e a prioridade dele baixa — mas o achado continua registrado |
| O servidor devolve `role` em `auth.me()` | `## 10`, segunda dúvida | **Alto:** sem papel, o `RoleGuard` barra administradores legítimos nas três telas |
| O projeto não tem multi-inquilino no horizonte | `## 10`, terceira dúvida | A cláusula "filtro de tenant" do F-04 continua não implementável até que exista campo de inquilino |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `App` | `_reversa_sdd/c4-components.md#Visão de Componentes (Container SPA)`; `_reversa_sdd/code-spec-matrix.md#Rastreabilidade Spec → Código → Teste` | contrato-alterado | Ganha a guarda de rota por papel, e o aviso de acesso negado sai do corpo do render para um efeito |
| `Layout` | `_reversa_sdd/code-analysis.md#3.1` (logs-acesso) | regra-alterada | O item da trilha passa a ser filtrado por papel; Médicos e Templates seguem visíveis |
| `Doctors` | `_reversa_sdd/code-analysis.md#3` (medicos) | regra-alterada | As três ações de escrita deixam de ser oferecidas a quem não é admin |
| `Templates` | `_reversa_sdd/code-analysis.md#3` (templates) | regra-alterada | Idem, incluindo o botão do estado vazio |
| `AccessLogs` | `_reversa_sdd/code-analysis.md#3.1` (logs-acesso) | contrato-alterado | A leitura passa a declarar escopo administrativo |
| `createOwnedEntity` | `_reversa_sdd/migration/target_domain_model.md` | contrato-alterado | `update` e `delete` passam a exigir o escopo na assinatura |
| Leitura da sessão | `_reversa_sdd/c4-components.md#Componentes de Infraestrutura` | componente-novo | `src/lib/useCurrentUser.ts` — ponto único de leitura da sessão, contraparte na interface do `AuthContext.jsx`, que é o componente que a extração documenta ali |
| `ChartStyle` | `_reversa_sdd/code-analysis.md` (componentes de UI) | regra-alterada | O CSS deixa de ser injetado por `dangerouslySetInnerHTML` |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma.** Nenhum `base44/entities/*.jsonc` foi tocado, nenhum tipo de domínio mudou de forma, e nenhum campo foi criado.
- Detalhe completo em: n/a — a feature não tem `data-delta.md` de propósito.

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | — | Nenhum contrato externo muda: o SDK do Base44 é consumido exatamente como antes, e o único contrato alterado é **interno** (`OwnedEntity`) |

## 8. Plano de migração

n/a — a mudança é de código de aplicação, na mesma stack, sem migração de dados e sem janela de
implantação. O que existe é **merge pendente**: as 15 alterações vivem na branch
`fix/seguranca-frontend`, e `main` segue com o F-01 vulnerável até a revisão.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Administradores legítimos perderem as três telas, se `auth.me()` não devolver `role` | alto | média | É a premissa de maior risco, e está declarada; a verificação existe no gate de tipos e o comportamento conservador vem de `toSessionUser` |
| A obrigatoriedade de escopo ser contornada por um cast explícito (`as any`) | baixo | baixa | Declarada como limite em `O003` do watch; o arnês cobre a omissão em código tipado, que é o caso que a disciplina pretende impedir |
| Alguém "melhorar" o pass-through de `update`/`delete` introduzindo verificação de posse sem mudar a decisão | médio | média | Watch `W003` da feature `012` nomeia o sinal exato de violação |
| O harness de paridade visual continuar inexistente e as 16 telas seguirem em conferência humana | médio | alta | Fora do escopo desta feature; segue como a maior lacuna aberta do projeto |
| A branch não ser revisada e o merge não acontecer | alto | média | Registrado no critério de pronto e no plano de migração acima |

## 10. Critério de pronto

- [x] Todas as ações do `actions.md` marcadas `[X]`
- [x] `regression-watch.md` gerado
- [x] `legacy-impact.md` gerado (é a fonte do `/reversa-sync`)
- [x] Adendo vigente em `_reversa_sdd/addenda/011-rbac-frontend.md` (parcial — ver a nota de proveniência)
- [x] `cross-check.md` executado em 2026-09-24 — **0 CRITICAL e 0 HIGH** na reexecução, após a correção de `A001`, `A002` e `A007` do primeiro relatório; restam **4 MEDIUM**, todos de rastreabilidade e redação estrutural
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Merge da branch `fix/seguranca-frontend` — **pendente**, e é o que falta para o F-01 deixar de estar vulnerável em `main`

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial, escrita **retroactivamente** sobre a entrega já feita | reversa |
| 2026-09-24 | Correção de `A001` e `A007` — as citações a `code-analysis.md#3.1` e a `code-spec-matrix.md` passam a **resolver a alvo único** — e acréscimo da decisão **`D-09`**, que dá decisão ao `RF-13` e registra a alternativa recusada do remendo no `app-params.ts`. Feito por **revisão humana** após o primeiro `cross-check.md` | revisão |
