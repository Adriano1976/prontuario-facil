# Requirements: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O cliente deixa de **adotar** e de **persistir** a credencial de sessão que chega por `?access_token=`: o parâmetro continua sendo retirado da barra de endereço, mas **nada é gravado** no armazenamento do navegador, e a verificação de sessão deixa de depender de um token que o cliente consegue ler. Isso fecha a metade corrigível do achado **F-02** — a exposição da credencial a qualquer script da página e a persistência local. A outra metade, o **trânsito** do token na própria URL, é decisão de plataforma e fica declarada como fora deste repositório, para não ser confundida com conserto.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `docs/security-audit/002-record/achados.json` — achado `F-02` | "Recepção de token de acesso sensível via parâmetro de consulta de URL (`access_token`) **e persistência do token em LocalStorage**". Nomeia os dois danos: vazamento por histórico/logs/`Referer` antes do `replaceState`, e leitura do Bearer Token por qualquer script no contexto da página | 🟢 |
| `docs/security-audit/001-record/achados.json` — achado `F-02` | Redação anterior, sobre `app-params.js`: o dano então descrito era só o trânsito na URL e o `Referer`. A segunda auditoria **acrescentou** a persistência — é a metade que esta feature ataca | 🟢 |
| `_reversa_sdd/inventory.md#Configuração / ambiente` | Os parâmetros de inicialização podem vir por query string: `app_id`, `access_token`, `from_url`, `functions_version`, `app_base_url`, `clear_access_token` — "ver `src/lib/app-params.js`" | 🟢 |
| `_reversa_sdd/inventory.md#Pontos de entrada` | `src/api/base44Client.js` é o cliente único do SDK Base44; `src/lib/AuthContext.jsx` faz o curto-circuito do modo offline | 🟢 |
| `_reversa_sdd/architecture.md#1. Visão Resumida` | Todo o backend — autenticação, CRUD e RLS — é provido pela plataforma Base44, consumida via `@base44/sdk` | 🟢 |
| `_reversa_sdd/permissions.md#3. Implementação Técnica` | As regras de acesso são aplicadas no frontend **e** reforçadas por RLS no schema. O token é a credencial que endereça essa RLS | 🟢 |
| `_reversa_sdd/permissions.md#4. ⚠️ Limitações em Modo Offline` | Em `VITE_OFFLINE=true` não há RLS nem papel — o modo offline não é afetado por esta mudança | 🟢 |
| `_reversa_sdd/migration/migration_brief.md#Objetivo da migração` | A correção lógica de F-01, F-02 e F-03 está **fora** da migração de tipos: "requer mudanças de runtime/backend; fase de segurança posterior" | 🟢 |
| `_reversa_sdd/migration/migration_brief.md#Fatores de risco conhecidos` | "**Premissa de F-02 a revisar**: o achado afirma que o token permanece na URL, mas `app-params.js:84` lê `access_token` com `removeFromUrl: true`". E nomeia o alvo: "tratar o **risco residual real** — token persistido em `localStorage` e janela de exposição via histórico/`Referer` — como item da fase de segurança" | 🟢 |
| `_reversa_sdd/feedback.md#1. Triagem dos apontamentos` | O apontamento de que a premissa do F-02 estava desatualizada foi aceito como "**Procede (correção factual)**", com o risco residual sendo `localStorage`/histórico | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-034` e `#BR-MIGRAR-036` | A camada de tipos foi obrigada a **exigir** `role` e `created_by_id` nos contratos internos — mas "o compilador **não** valida autorização em runtime, e a RLS do BaaS permanece intocada" | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Achados de segurança — estado da correção (2026-09-24)` | Estado vivo dos cinco achados. F-02 consta como ⛔ **não corrigível neste repositório**, com nota que nomeia o SDK como o colhedor independente do token | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | Registra as lacunas remanescentes que **não** são fechadas por esta feature | 🟢 |
| `_reversa_sdd/addenda/014-correcao-de-seguranca.md#Vigência` | Adendo vigente das correções F-01/F-03/F-04/F-05 na mesma frente de segurança. Esta feature é a continuação da mesma fase | 🟢 |
| `_reversa_sdd/addenda/011-rbac-frontend.md#Vigência` | Idem para o F-01; fixa a regra de que a guarda de interface **não** substitui a regra do servidor | 🟢 |

**Termos, na primeira ocorrência.** **Credencial de sessão** é o *token* que identifica o usuário perante o servidor — este documento usa as duas expressões como sinônimos. **RLS** (*Row Level Security*) é a regra de acesso aplicada no **servidor**, e não no cliente. **BaaS** (*Backend as a Service*) é a plataforma que provê o backend, a autenticação e a RLS. **XSS** é a execução de script de terceiro no contexto da página. **LGPD** é a Lei Geral de Proteção de Dados. **Armazenamento do navegador** é o `localStorage` da origem.

**Fatos verificados no código instalado, nesta sessão** — não constam da extração e são a razão de a feature existir:

| Fato | Onde | Confidência |
|------|------|-------------|
| O cliente grava o token recebido por query string no armazenamento do navegador | `src/lib/app-params.ts:60-63` | 🟢 |
| A remoção do parâmetro da URL ocorre **antes** da gravação e independe dela | `src/lib/app-params.ts:54-59` | 🟢 |
| O SDK colhe e persiste o mesmo token **por conta própria**, com `paramName: 'access_token'`, `saveToStorage: true` e `removeFromUrl: true` por padrão, e **não** há opção em `CreateClientConfig` para desligar isso | `@base44/sdk/dist/client.js:123`; `dist/utils/auth-utils.js:38`; `dist/client.types.d.ts:24-77` — faixa conferida na auditoria de 2026-09-24 (achado **A006**): `CreateClientConfig` e `CreateClientOptions` não têm opção alguma de token. A citação original não trazia a faixa e não havia sido verificada | 🟢 |
| Como `app-params.ts` é avaliado antes de o cliente do SDK ser construído, o parâmetro **já saiu da URL** quando o SDK chama `getAccessToken()` — de modo que cessar a gravação **basta** para o SDK também não encontrar o token | `src/api/base44Client.ts:2,133-142`; `src/lib/app-params.ts:103-105` | 🟢 |
| A verificação de sessão só acontece **quando há token legível**: `hasSessionToken` decide se `auth.me()` é chamado, e a ausência de token leva a sessão a "não autenticado" sem consultar o servidor | `src/lib/AuthContext.tsx:149-154`; `src/api/base44Client.ts:47` | 🟢 |
| Só erros 401 e 403 produzem erro de sessão visível; qualquer outra falha de `checkUserAuth` deixa a sessão como não autenticada **em silêncio** | `src/lib/AuthContext.tsx:113-122` | 🟢 |
| Já existe um caminho de limpeza de credencial gravada, disparado por `clear_access_token=true`, que remove `base44_access_token` **e** `token` | `src/lib/app-params.ts:90-93` | 🟢 |
| O cliente HTTP do SDK **não** define `withCredentials`; a sessão por cookie `httpOnly` só viaja porque as requisições são same-origin (`serverUrl: ''`, `baseURL: '/api'`) | `dist/utils/axios-client.js:119-126`; `dist/modules/auth.js:170-171` | 🟢 |
| `auth_required` **é** o redirecionamento automático ao login, e não uma tela: o `App` chama `navigateToLogin()` e devolve `null`. E um erro de tipo **não reconhecido** não é tratado — o `if` não casa, e a aplicação renderiza as rotas assim mesmo, com ou sem sessão | `src/App.tsx:81-89` | 🟢 |

> **A última linha era a que decidia o escopo, e deixou de ser dúvida.** A sessão da clarificação confirmou que o deployment é **same-origin**: as requisições vão para um caminho relativo, o cookie `httpOnly` viaja, e a sessão sobrevive à recarga sem credencial no armazenamento. É o que torna o RF-06 fechável. Ver `## 9. Esclarecimentos`, Q2.

> **O trânsito da credencial na URL tem origem conhecida.** A mesma sessão confirmou que o `?access_token=` vem do **retorno do login hospedado da plataforma** (Q1). Não há, portanto, link de terceiro a contenir deste lado: a metade remanescente do F-02 é de plataforma, com dono nomeado, e permanece declarada em RN-07 e RF-11.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico autenticado | Usar o prontuário sem que sua credencial fique exposta | Abre o app por um link que carrega `?access_token=` e continua trabalhando; recarrega a página e **não** é deslogado |
| Médico autenticado | Ter a sessão preservada entre recargas | Fecha e reabre a aba; a sessão é restabelecida por credencial que o cliente não consegue ler |
| Médico com rede instável | Não ser tratado como deslogado por causa de uma oscilação | A verificação de sessão falha por rede e ele vê um erro distinguível, não um logout silencioso |
| Responsável pela segurança / LGPD | Saber exatamente o que foi e o que **não** foi fechado | Lê o estado do F-02 e encontra a metade remanescente declarada, com o dono nomeado |
| Usuário do modo de demonstração offline | Nada muda para ele | Ativa a variável de modo offline; o comportamento permanece o de hoje |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (alterada):** O cliente **não adota** a credencial de sessão recebida por `?access_token=` — o parâmetro é lido apenas para ser descartado. 🟢
   - Origem no legado: `_reversa_sdd/inventory.md#Configuração / ambiente`
   - Tipo: alterada
2. **RN-02 (alterada):** O cliente **não persiste** credencial de sessão no armazenamento do navegador. Nenhuma chave de token é escrita. 🟢
   - Origem no legado: `docs/security-audit/002-record/achados.json` — achado `F-02`
   - Tipo: alterada
3. **RN-03 (preservada):** A retirada do parâmetro `access_token` da barra de endereço permanece, com o mesmo efeito observável e na mesma ordem. A mudança é **adotar menos**, não limpar menos. 🟢
   - Origem no legado: `_reversa_sdd/migration/migration_brief.md#Fatores de risco conhecidos`
   - Tipo: preservada
4. **RN-04 (alterada):** A verificação de sessão deixa de ter como condição a existência de credencial legível pelo cliente. A sessão passa a ser verificada **independentemente** de haver token em memória. 🟢
   - Origem no legado: `src/lib/AuthContext.tsx:149-154`
   - Tipo: alterada
5. **RN-05 (nova):** Credencial de sessão já gravada por versões anteriores do sistema é **removida** na primeira carga, sem depender de que o usuário informe parâmetro algum. O comportamento atual de limpeza sob demanda permanece inalterado. 🟢
   - Tipo: nova
6. **RN-06 (preservada):** O modo offline permanece intocado: quando ativo, o usuário de demonstração entra sem consultar o servidor e continua **sem papel** (`BR-MIGRAR-039`), porque o modo não aplica RLS (`BR-OFF10`). 🟢
   - Origem no legado: `_reversa_sdd/permissions.md#4. ⚠️ Limitações em Modo Offline`
   - Tipo: preservada
7. **RN-07 (declaração):** O **trânsito** da credencial na URL permanece aberto e **não** é resolvido por esta feature: quem devolve `?access_token=` é o **login hospedado da plataforma**, e o cliente não tem como impedir que a credencial transite. Fica registrado com o dono nomeado (plataforma/deployment). 🔴
   - Origem no legado: `docs/security-audit/002-record/achados.json` — recomendação do achado
   - Tipo: nova (declaração de limite)
8. **RN-08 (nova):** A sessão **falha de forma distinguível**. Ausência de sessão e falha de rede deixam de ser o mesmo estado: só a primeira significa "não autenticado". Hoje o código só reconhece 401 e 403, e trata todo o resto como sessão ausente, em silêncio. 🟢
   - Origem no legado: `src/lib/AuthContext.tsx:113-122`
   - Tipo: nova
9. **RN-09 (nova):** A ordem de precedência dos parâmetros de inicialização **deixa de ser a do legado**, e a divergência é **deliberada**: o nível "armazenado" deixa de receber o token de sessão. Isso quebra uma paridade declarada no próprio código-fonte e tem de ser registrada como regra nova, com artefato de impacto e watch de regressão — o mesmo rito das correções anteriores deste corpus. 🟢
   - Origem no legado: `src/lib/app-params.ts:5-7` (nota de paridade do próprio arquivo)
   - Tipo: alterada (paridade rompida de propósito)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O cliente não adota a credencial recebida por `?access_token=`: o valor não entra no estado da aplicação nem é usado para construir o cliente de dados | Must | Com `?access_token=<valor>` na URL, nenhuma requisição do app carrega `Authorization: Bearer <valor>` | 🟢 |
| RF-02 | O cliente não grava credencial de sessão no armazenamento do navegador | Must | Após a carga, as chaves `base44_access_token` e `token` do armazenamento são nulas | 🟢 |
| RF-03 | O parâmetro `access_token` continua sendo retirado da barra de endereço e do histórico da entrada corrente | Must | Após a carga, a query string não contém `access_token`, com os demais parâmetros preservados | 🟢 |
| RF-04 | A verificação de sessão não depende da presença de credencial legível pelo cliente | Must | Com o armazenamento vazio, a verificação é **tentada** contra o servidor em vez de a sessão ser declarada ausente de imediato | 🟢 |
| RF-05 | Credencial gravada por versão anterior é removida na primeira carga | Should | Com `base44_access_token` pré-existente no armazenamento, a carga o remove | 🟢 |
| RF-06 | A sessão sobrevive à recarga da página | Must | Recarregar a página autenticado mantém a sessão válida, sem exigir novo login. O deployment é same-origin, de modo que o cookie `httpOnly` carrega a sessão | 🟢 |
| RF-07 | O modo offline permanece idêntico ao atual | Must | Com o modo offline ativo, a suíte de modo offline passa sem alteração e o usuário de demonstração continua sem papel | 🟢 |
| RF-08 | Existe prova automatizada dos dois "não" — não adotar e não persistir | Must | Prova nova falha se a gravação for reintroduzida, e falha se o token da URL voltar a ser adotado | 🟢 |
| RF-09 | Os quatro portões de verificação do projeto não regridem | Must | As quatro execuções passam, com a contagem de verificações igual ou maior que a linha de base de 183 em 29 arquivos | 🟢 |
| RF-10 | O estado do achado F-02 é atualizado para **🟡 parcial**, nunca ✅, com a metade remanescente nomeada | Should | O registro vivo dos achados deixa de dizer ⛔ e passa a dizer 🟡, citando esta feature e o dono da metade aberta | 🟢 |
| RF-11 | Eliminar o trânsito da credencial na URL | **Won't** | Não é critério desta feature — a origem é o login hospedado da plataforma, fora deste repositório. Ver RN-07 | 🔴 |
| RF-12 | Falha de rede não é tratada como ausência de sessão | Must | Quando a verificação de sessão falha por motivo que **não** é 401 nem 403, o usuário vê um estado distinguível de "sem sessão", e não um logout silencioso | 🟢 |
| RF-13 | A **falha de verificação** não redireciona; só a **ausência de sessão** leva ao login | Must | Com falha de verificação (não 401 nem 403), a aplicação exibe o estado distinguível **sem** chamar o redirecionamento ao login. Com ausência de sessão, continua levando ao login, como hoje | 🟢 |
| RF-14 | A divergência de paridade é registrada como regra nova, com artefato de impacto e watch de regressão | Must | Existem, na pasta da feature, o registro de impacto no legado e o watch de regressão cobrindo a precedência alterada de `app-params` | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nenhuma credencial de sessão fica legível por script no contexto da página | É o dano nomeado pelo achado `F-02`: "armazenar o Bearer Token no LocalStorage deixa a credencial totalmente acessível para leitura por qualquer script". Fecha a metade de XSS | 🟢 |
| Segurança | O cliente não pode ser a única testemunha da correção: a prova tem de **falsificar** a reintrodução | Prática já adotada na correção do F-01, onde desligar a guarda fez 3 de 6 verificações falharem | 🟢 |
| Privacidade (LGPD) | A mudança não pode ampliar o que o cliente guarda sobre o usuário | A credencial dá acesso a dados de pacientes; reduzi-la é o sentido da feature | 🟢 |
| Compatibilidade | **A paridade do legado é rompida de propósito** em um ponto: o nível "armazenado" da precedência de `app-params` deixa de receber o token. O restante da precedência e a limpeza sob demanda permanecem iguais | RN-09; nota de paridade em `src/lib/app-params.ts:5-7`. A divergência exige artefato de impacto e watch (RF-14) | 🟢 |
| Compatibilidade | O modo offline não é tocado | `_reversa_sdd/permissions.md#4. ⚠️ Limitações em Modo Offline` | 🟢 |
| Desempenho | A mudança não acrescenta requisição ao caminho de carga | A verificação de sessão já ocorria; o que muda é a condição que a dispara | 🟡 |
| Observabilidade | Ausência de sessão e falha de rede são estados distinguíveis no cliente | RN-08 e RF-12. Hoje só 401/403 produzem erro visível (`src/lib/AuthContext.tsx:113-122`) | 🟢 |
| Observabilidade | O limite remanescente fica registrado, não silenciado | Regra do corpus: o que não foi feito tem de ser declarado com o dono. Ver `_reversa_sdd/pendencias-de-convergencia.md` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: token na URL não é adotado nem gravado
  Dado que o app é carregado com "?access_token=<valor>" na barra de endereço
  Quando a aplicação termina de inicializar
  Então o parâmetro "access_token" não está mais na URL
  E o armazenamento do navegador não contém valor para "base44_access_token" nem para "token"
  E nenhuma requisição do app foi emitida com "Authorization: Bearer <valor>"

Cenário: resíduo de versão anterior é removido
  Dado que o armazenamento do navegador já contém "base44_access_token" gravado por uma versão anterior
  Quando a aplicação é carregada sem nenhum token na URL
  Então a carga remove a credencial gravada

Cenário: a sessão é verificada sem credencial legível pelo cliente
  Dado que o armazenamento do navegador está vazio e não há token na URL
  Quando a aplicação verifica o estado de sessão
  Então a verificação é tentada contra o servidor

Cenário: recarga mantém a sessão
  Dado um usuário autenticado com o armazenamento vazio
  Quando ele recarrega a página
  Então a sessão continua válida pelo cookie de sessão, sem novo login

Cenário: falha de rede não vira logout silencioso
  Dado um usuário com sessão válida no servidor
  Quando a verificação de sessão falha por motivo que não é 401 nem 403
  Então o usuário vê um estado distinguível de "sem sessão"
  E não é tratado como deslogado

Cenário: falha de verificação não redireciona, ausência de sessão leva ao login
  Dado que não há sessão válida
  Quando a aplicação conclui a verificação
  Então a ausência de sessão leva ao login, como hoje
  E uma falha de verificação exibe um estado distinguível sem chamar o redirecionamento

Cenário: o modo offline permanece intocado
  Dado que o modo offline está ativo
  Quando a aplicação é carregada
  Então a sessão é a do usuário de demonstração, sem consultar o servidor
  E o usuário de demonstração continua sem papel

Cenário: os portões do projeto continuam verdes
  Dado o repositório com a mudança aplicada
  Quando as quatro verificações do projeto são executadas
  Então todas passam
  E a contagem de verificações não cai em relação à linha de base de 183 em 29 arquivos

Cenário: o estado do achado não é superestimado
  Dado o registro vivo dos achados de segurança
  Quando a mudança é registrada
  Então o achado F-02 passa a constar como parcialmente corrigido, e não como corrigido
  E a metade remanescente aparece com o dono nomeado

Cenário: a divergência de paridade fica registrada
  Dado que a precedência de "app-params" deixa de ter o nível armazenado para o token
  Quando a feature é encerrada
  Então existe registro de impacto no legado apontando a paridade rompida
  E existe watch de regressão que acusa a reintrodução da gravação

Cenário: a gravação reintroduzida é detectada
  Dado que uma mudança futura volte a gravar a credencial de sessão no armazenamento
  Quando a suíte de provas roda
  Então a verificação de não-persistência falha
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | São o núcleo do achado: adoção e persistência da credencial |
| RF-03 | Must | Paridade a preservar; retirar o parâmetro reduz a janela de exposição e não custa nada |
| RF-04 | Must | Sem ele, a correção **desloga o usuário a cada recarga** — trocaria um defeito por outro |
| RF-06 | Must | O deployment é same-origin (Q2), o que torna a sobrevivência da sessão fechável sem manter persistência |
| RF-07 | Must | O modo offline tem contrato próprio e provas próprias (`BR-MIGRAR-039`, `BR-OFF10`) |
| RF-08, RF-09 | Must | O corpus não aceita correção sem prova, e a prova tem de ser falsificável |
| RF-12 | Must | Sem ele, uma oscilação de rede passa a ser indistinguível de logout — regressão criada pelo RF-04 |
| RF-13 | Must | Decisão da sessão de dúvidas (Q3), **reescopada na reconhecimento da codificação**: o redirecionamento é preservado para a ausência de sessão e removido apenas na falha de verificação — a leitura literal da resposta original quebraria a entrada do sistema |
| RF-14 | Must | Decisão da sessão de dúvidas (Q5): a paridade quebrada tem de ficar registrada no rito do corpus |
| RF-05 | Should | Reduz o resíduo de instalações antigas, mas não é condição para o achado |
| RF-10 | Should | Registro do estado; é o que impede a metade aberta de desaparecer |
| RF-11 | **Won't** | Fora do alcance deste repositório — a origem é o login hospedado da plataforma |

## 9. Esclarecimentos

### Sessão 2026-09-24

- **Q:** Em que situação de deployment o `?access_token=` chega à aplicação hoje?
  **R:** (a) É o retorno do **login hospedado da plataforma** — o usuário é redirecionado de volta com o token na URL. Não há link de terceiro a conter deste lado; a metade remanescente do F-02 é de plataforma, com dono nomeado.
- **Q:** O app é servido na **mesma origem** do BaaS?
  **R:** (a) **Sim** — mesmo domínio, requisições para caminho relativo. O cookie `httpOnly` viaja, e a sessão sobrevive à recarga sem credencial no armazenamento. É o que fecha o RF-06.
- **Q:** Quando **não** houver token nem sessão válida, qual o comportamento aceito?
  **R:** (b) Exibir a **tela de erro de sessão que já existe** (`auth_required`). O redirecionamento ao login permanece ação do usuário, e não automática.
  > ⚠️ **Reescopo de 2026-09-24, na reconhecimento da codificação.** A resposta partiu de uma premissa errada **da pergunta**: **não existe tela de erro de sessão** — `auth_required` **é** o redirecionamento automático (`src/App.tsx:81-89`), e é por ele que qualquer visitante sem sessão entra no sistema. Implementar a resposta ao pé da letra quebraria a entrada. O `RF-13` foi reescopado: o redirecionamento permanece para a **ausência de sessão** e sai apenas da **falha de verificação**. A resposta original fica registrada como foi dada — reescrevê-la apagaria a evidência do erro de enquadramento.
- **Q:** Quando a verificação de sessão falhar por **rede** — e não 401/403 —, o que o usuário deve ver?
  **R:** (b) Um erro **distinguível** de "sem sessão", para não confundir queda de rede com logout. Hoje só 401/403 geram erro visível, e todo o resto cai em "não autenticado" silencioso.
- **Q:** Esta mudança **quebra uma paridade declarada** do legado — o cabeçalho de `src/lib/app-params.ts` afirma que a precedência "URL → padrão → armazenado" continua "exatamente como no legado". Como registrar?
  **R:** (a) Como **regra nova deliberada**, com registro de impacto no legado e watch de regressão — o mesmo rito das correções F-01 e F-04.

## 10. Lacunas

> **Nenhuma lacuna aberta.** As três dúvidas iniciais foram resolvidas na sessão de 2026-09-24 e estão em §9.

O que permanece em aberto **não é dúvida, é limite declarado com dono**: o trânsito da credencial na URL (RN-07, RF-11) pertence à plataforma, porque a origem é o login hospedado. Fica registrado para não ser confundido com conserto — e o RF-10 exige que o estado do achado seja atualizado para 🟡 parcial, nunca ✅.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-24 | Sessão de esclarecimentos: cinco perguntas respondidas, as três dúvidas iniciais resolvidas, RF-12, RF-13 e RF-14 e RN-08/RN-09 acrescentados, linha de compatibilidade corrigida | reversa |
| 2026-09-24 | Revisão manual pós-auditoria: a citação de `client.types.d.ts` ganhou a faixa conferida (achado **A006**). Os achados A001 a A004 foram resolvidos em `actions.md` e `roadmap.md`, que não são este documento | reversa |
| 2026-09-24 | Reescopo do `RF-13` na reconhecimento da codificação: o redirecionamento passa a valer só para a ausência de sessão e sai da falha de verificação. `src/App.tsx` reconhecido como alvo obrigatório de RF-12 e RF-13; a premissa da resposta Q3 corrigida em §9 | reversa |

## Pendências de Qualidade

> Registradas na auto-validação do `/reversa-requirements`, depois de uma rodada de reescrita sobre o checklist de `.reversa/templates/quality-template.md`. Nenhuma foi silenciada.

- **Q-018 — nome de produto no documento.** O checklist pede que não haja nome de biblioteca, framework ou produto comercial. Este documento nomeia a plataforma e o SDK, e o faz **de propósito**: o achado não é corrigível sem se saber que existe um **segundo colhedor da credencial**, fora do código do projeto, e a citação do caminho instalado é a única forma de tornar essa afirmação verificável. O nome aparece sempre como **evidência citada**, nunca como escolha de solução.
- **Q-011 — regra original em `domain.md`.** As nove regras não citam `_reversa_sdd/domain.md` porque ele **não trata do assunto**: a busca por sessão, token, autenticação e armazenamento local nesse arquivo não devolve nenhuma ocorrência. A origem de cada regra é citada no artefato que de fato a sustenta — `permissions.md`, o registro de auditoria, o brief de migração e o próprio código.
