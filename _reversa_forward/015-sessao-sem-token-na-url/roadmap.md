# Roadmap: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Requirements: `_reversa_forward/015-sessao-sem-token-na-url/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

O caminho técnico tem três movimentos e nenhum componente novo. **Primeiro**, cortar a gravação: `src/lib/app-params.ts` deixa de escrever a credencial no armazenamento, mas **mantém** a retirada do parâmetro da URL — a limpeza permanece, a adoção não. Esse corte sozinho já neutraliza o SDK, porque `app-params.ts` é avaliado antes de o cliente ser construído: quando o SDK chama o próprio coletor, o parâmetro já saiu da URL e o armazenamento está limpo. **Segundo**, mudar o portão de sessão: `src/api/base44Client.ts` deixa de decidir a verificação por `hasSessionToken`, e `src/lib/AuthContext.tsx` passa a tentar a verificação sempre — apoiada no cookie de sessão, que viaja porque o deployment é same-origin. **Terceiro**, separar dois estados que hoje são um só: falha de rede e ausência de sessão deixam de ser indistinguíveis.

Nada disso toca contrato externo, entidade, schema ou RLS. O que a feature entrega é remoção de comportamento de cliente — e é justamente por isso que ela precisa de prova que **falsifique** a reintrodução, e de registro de que a paridade declarada de `app-params` foi rompida de propósito.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| — | `.reversa/principles.md` **não existe** neste projeto, embora `.reversa/setup.json` declare `principles.enabled: true` e `auto-load-into-plan: true`. Não há princípio a aplicar ou a conflitar; nada foi atenuado nem reescrito | n/a |

> **Registrado em vez de silenciado:** o setup aponta para um arquivo de princípios que nunca foi criado. Se ele passar a existir, esta seção precisa ser refeita — e o `/reversa-plan` da próxima feature deve ser o primeiro a notar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A credencial recebida por `?access_token=` **não é adotada**: o parâmetro é lido apenas para ser descartado | É a metade do achado que depende só do cliente. Adotar e depois limpar deixa a credencial entrar no estado da aplicação | a) adotar e limpar depois; b) ignorar o parâmetro e deixá-lo na URL | 🟢 |
| D-02 | O cliente **não grava** credencial de sessão no armazenamento | O dano nomeado pelo achado é a leitura por qualquer script da página. Sem gravação, não há o que ler | a) gravar cifrado; b) gravar em `sessionStorage` — ambos ainda legíveis por script | 🟢 |
| D-03 | A retirada do parâmetro da URL **permanece, e a ordem dela é preservada** | Reduz a janela de exposição na barra de endereço e no histórico da entrada, e não custa nada. **E a ordem tem peso de segurança:** `getAppParams` lê `from_url` com `defaultValue: window.location.href` e o ramo do padrão **grava** o valor no armazenamento. Como `token` é avaliado antes de `fromUrl`, a URL capturada já está limpa; invertida a ordem, `base44_from_url` passa a persistir a credencial. Ver `data-delta.md#4` | a) remover também a limpeza, "já que não adotamos" — aumentaria a exposição sem ganho; b) reordenar os campos do objeto literal por legibilidade — reintroduziria o achado por outra porta | 🟢 |
| D-04 | **Neutralizar o SDK pelo tempo de avaliação**, e não por intervenção nele | `src/api/base44Client.ts` importa `app-params` no topo e só chama o construtor do cliente dentro de `buildClient()`. Como o módulo de parâmetros é avaliado antes, o parâmetro já saiu da URL quando o coletor do SDK roda — e o armazenamento está limpo. Cessar a gravação **basta** | a) `patch-package` sobre o SDK — invasivo, silencioso e some a cada atualização de dependência; b) *fork* do SDK; c) passar `token: undefined` ao construtor — não adianta, o SDK chama o coletor de qualquer forma (`client.js:123`) | 🟢 |
| D-05 | O portão de sessão deixa de ser a presença de credencial legível | Enquanto `hasSessionToken` decide, remover a persistência **desloga a cada recarga**. A verificação passa a ser tentada sempre, apoiada no cookie de sessão | a) manter o portão e gravar um marcador não-sensível de "sessão iniciada" — estado derivado que pode divergir da realidade; b) manter a persistência e reduzir o achado a documentação | 🟢 |
| D-06 | A limpeza de resíduo é **restrita às duas chaves de credencial** | `base44_access_token` e `token` são credenciais. O modo offline usa as **mesmas** `localStorage`, com chaves próprias (`mock_db_<Entidade>`) — uma limpeza ampla apagaria os dados de demonstração | a) limpar todo o `localStorage` da origem; b) limpar por prefixo `base44_` — alcançaria chaves que não são credenciais | 🟢 |
| D-07 | Falha de rede e ausência de sessão passam a ser **estados distintos** | Sem isso, o D-05 transforma qualquer oscilação de rede em "usuário deslogado". Hoje só 401 e 403 produzem erro visível | a) manter o silêncio atual; b) retentativa automática antes de decidir — foi oferecida e recusada na sessão de esclarecimentos | 🟢 |
| D-08 | A **falha de verificação** não redireciona; a **ausência de sessão** leva ao login, como hoje | Decisão Q3 **reescopada** na reconhecimento da codificação: a resposta partiu da premissa de que existia uma tela de erro de sessão, e ela não existe — `auth_required` **é** o redirecionamento (`src/App.tsx:81-89`), e é a porta de entrada de quem não tem sessão. O observável vive no `App`, que passou a ser alvo de `T021` | a) remover o redirecionamento em todos os casos — quebraria a entrada do sistema; b) tratar o tipo desconhecido como "não autenticado" e deixar o `App` renderizar as rotas | 🟢 |
| D-09 | A divergência de paridade é registrada como **regra nova deliberada** | A precedência declarada em `app-params.ts` ("URL → padrão → armazenado") deixa de valer para o token. O corpus tem rito para isso: registro de impacto e watch de regressão, como nas correções F-01 e F-04 | a) só um comentário no código; b) nada — deixaria o cabeçalho do arquivo afirmando uma paridade falsa | 🟢 |
| D-10 | O modo offline **não é tocado** | Tem contrato e provas próprias (`BR-MIGRAR-039`, `BR-OFF10`), e a autenticação dele não passa por este caminho | a) unificar o caminho de sessão dos dois modos | 🟢 |
| D-11 | O **trânsito** da credencial na URL **não é atacado** aqui | A origem é o login hospedado da plataforma (Q1). Não há o que corrigir deste lado; o limite fica declarado com dono nomeado | a) tentar conter no cliente — não há mecanismo; b) adotar PKCE — é decisão de plataforma, não deste repositório | 🟢 |

> **Cobertura por critério de pronto, e não por decisão.** Quatro exigências não têm `D-xx` dedicada e isso é deliberado: `RF-06` (a sessão sobrevive à recarga) é o **desfecho** de `D-05` combinado com a resposta Q2, e não uma escolha técnica separada; `RF-08` (prova falsificável), `RF-09` (os quatro portões) e `RF-10` (registro do estado do achado) são exigências de **processo**, e vivem no critério de pronto e nas ações. Registrado aqui para que a assimetria do mapeamento seja lida como decisão, e não como esquecimento — foi o que a auditoria apontou em **A005**.

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| — | — | Nenhuma. O documento chegou ao plano com **zero** marcadores `[DÚVIDA]`; as três dúvidas iniciais foram resolvidas na sessão de esclarecimentos de 2026-09-24 (§9 do `requirements.md`) |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `app-params` (`src/lib/app-params.ts`) | `_reversa_sdd/inventory.md#Estrutura de pastas`; `_reversa_sdd/inventory.md#Configuração / ambiente` | regra-alterada | Deixa de gravar credencial no armazenamento e de adotar o token da URL; mantém a retirada do parâmetro e a limpeza sob demanda |
| `base44Client` (`src/api/base44Client.ts`) | `_reversa_sdd/code-analysis.md#10.2 Mudanças em arquivos existentes` | regra-alterada | `hasSessionToken` deixa de ser a condição que decide se a sessão é verificada. A resolução de parâmetros de inicialização continua no mesmo lugar |
| `AuthContext` (`src/lib/AuthContext.tsx`) | `_reversa_sdd/code-analysis.md#10.2 Mudanças em arquivos existentes` | regra-alterada | Passa a verificar a sessão sempre; separa falha de rede de ausência de sessão; exibe o estado de erro existente sem redirecionar |
| `App` (`src/App.tsx`) | `_reversa_sdd/inventory.md#Estrutura de pastas` | regra-alterada | Passa a distinguir os dois casos no tratamento de erro: redireciona ao login **só** na ausência de sessão, e renderiza um estado próprio na falha de verificação. Hoje `auth_required` **é** o redirecionamento, e um tipo não reconhecido não é tratado — a aplicação renderiza as rotas assim mesmo |
| Nenhum componente novo | — | — | A feature **remove** comportamento; não acrescenta superfície |
| Nenhum contrato externo alterado | `_reversa_sdd/c4-context.md#Integrações Externas Detectadas` | — | Não há requisição, resposta, rota ou payload novo. O cookie de sessão já era enviado, por ser same-origin |

> **Por que `_reversa_sdd/architecture.md` não é citado nesta tabela.** O template do `/reversa-plan` sugere esse arquivo como origem dos componentes, e ele **não** serve para isso aqui: tem 37 linhas e trata de visão geral e ponteiros para os diagramas canônicos, sem inventário de componentes. O inventário real vive em `_reversa_sdd/c4-components.md`, `_reversa_sdd/inventory.md` e `_reversa_sdd/code-analysis.md`, e é de lá que as citações acima vêm. O desvio é deliberado e fica registrado — foi o que a auditoria apontou em **A007**.

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma entidade, campo ou schema muda.** O que muda é o **estado de sessão no cliente** — duas chaves de credencial deixam de ser escritas e passam a ser removidas.
- Detalhe completo em: `_reversa_forward/015-sessao-sem-token-na-url/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| — | — | **n/a.** Nenhum contrato externo é afetado: não há endpoint novo, alterado ou removido, nem mudança de payload, cabeçalho ou código de erro. Por isso o diretório `interfaces/` **não é criado** — a regra do skill é criá-lo apenas quando houver ao menos um contrato afetado |

## 8. Plano de migração

Não há migração de dados. Há **limpeza de resíduo no cliente**, e ela é a única etapa com ordem relevante:

1. **Retirar a gravação** da credencial em `src/lib/app-params.ts`, preservando a retirada do parâmetro da URL e a ordem de avaliação do módulo (D-02, D-03, D-04).
2. **Remover resíduo** das instalações que já têm a chave gravada, restrita a `base44_access_token` e `token` (D-06). Não há janela de transição: a remoção é idempotente e roda em toda carga.
3. **Trocar o portão de sessão** em `src/api/base44Client.ts` e `src/lib/AuthContext.tsx`, na mesma passada da etapa 1 — separá-las deixaria a aplicação deslogando entre um passo e outro (D-05).
4. **Registrar a divergência de paridade** em `legacy-impact.md` e no watch de regressão (D-09).

> A ordem 1+3 na mesma passada **não é preferência de estilo**: aplicar só a etapa 1 é o defeito que o RF-06 existe para impedir.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **R-01** A sessão deixa de sobreviver à recarga e o usuário é deslogado a cada F5 | alto | média | RF-04 e RF-06 com prova própria; a premissa de same-origin foi confirmada na sessão de esclarecimentos (Q2). Prova: recarregar autenticado mantém a sessão |
| **R-02** A limpeza de resíduo apaga os dados do modo offline, que usam o mesmo armazenamento | alto | baixa | D-06 restringe a limpeza às duas chaves de credencial. A suíte de modo offline é a prova de que `mock_db_*` permanece |
| **R-03** Oscilação de rede passa a ser lida como logout — **regressão criada pelo próprio RF-04** | alto | média | RF-12: estado distinguível. A prova tem de cobrir falha de rede **e** ausência de sessão, senão mede só metade |
| **R-04** Uma mudança futura de ordem de avaliação (import dinâmico, *code splitting*) faz o SDK voltar a colher o token da URL | médio | baixa | A neutralização depende do tempo de avaliação (D-04), e isso é frágil por natureza. Mitigação: prova que falha se a gravação voltar, mais o watch de regressão exigido pelo RF-14 |
| **R-05** Atualização do SDK muda o padrão do coletor e reintroduz a persistência | médio | baixa | `@base44/sdk` está em `^0.8.43`; uma subida de versão pode mudar o comportamento. O watch registra a propriedade a vigiar, e a prova de não-persistência acusa |
| **R-06** A remoção da credencial gravada tira do usuário a única credencial que ele tinha | alto | baixa | Só é seguro porque o deployment é same-origin e o cookie carrega a sessão (Q2). **Se o deployment mudar de origem, esta decisão precisa ser revista antes** — é a dependência externa desta feature |
| **R-07** A paridade rompida passa despercebida e o cabeçalho de `app-params.ts` segue afirmando o contrário | médio | média | D-09 e RF-14: registro de impacto e watch. O comentário de paridade do arquivo é atualizado na mesma ação, sob pena de o código mentir sobre si mesmo |
| **R-08** A ordem entre `access_token` e `from_url` em `getAppParams` é invertida por refatoração, e `base44_from_url` passa a persistir a URL **com a credencial** dentro | alto | baixa | Achado acoplado registrado em `data-delta.md#4`. A chave hoje é escrita e nunca lida — o que a torna exatamente o tipo de campo que alguém reordena ou remove sem pensar. Mitigação: o watch do RF-14 cobre a **ordem**, com sinal de violação nomeado (`base44_from_url` contendo `access_token=`), e não só a ausência de gravação das duas chaves de credencial |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Os quatro portões passam, contra a linha de base registrada em T003 (RF-09 — item que a auditoria apontou como ausente aqui, achado **A003**)
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado, cobrindo a precedência alterada de `app-params` e a não-persistência
- [ ] `legacy-impact.md` gerado, declarando a paridade rompida de propósito
- [ ] Prova de não-adoção e de não-persistência **falsificada antes de aceita**: reintroduzir a gravação tem de fazer a prova falhar
- [ ] A suíte de modo offline passa **sem alteração** — a limpeza não tocou `mock_db_*`
- [ ] O estado do achado F-02 na matriz passa a **🟡 parcial**, nunca ✅
- [ ] O comentário de paridade em `src/lib/app-params.ts` deixa de afirmar o que não vale mais
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-09-24 | Revisão manual pós-auditoria: cobertura por critério de pronto declarada (A005), desvio de citação do `architecture.md` justificado (A007) e o item dos quatro portões acrescentado ao critério de pronto (A003) | reversa |
| 2026-09-24 | `D-08` reescopado na reconhecimento da codificação: o redirecionamento ao login permanece para a ausência de sessão e sai apenas da falha de verificação. `src/App.tsx` entra como alvo (`T021`), porque os observáveis de RF-12 e RF-13 vivem lá e nenhuma ação o alcançava | reversa |
| 2026-09-24 | Segunda auditoria (achado **A002**): `App` acrescentado ao delta arquitetural — ele mudava em `T021` e não constava da tabela, o que faria o `legacy-impact.md` nascer incompleto | reversa |
