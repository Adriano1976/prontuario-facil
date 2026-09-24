# Regression Watch: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Este arquivo consolida o que a correção do achado **F-02** estabeleceu na metade que é
> corrigível neste repositório. Os itens abaixo precisam continuar verdadeiros.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/lib/app-params.ts` — `getAppParamValue` com `descartar`; `RF-02`, `RN-02` | O cliente **não grava** credencial de sessão: `setItem` nunca é chamado para `base44_access_token` nem para `token` | **ausência do ato**, medida por armazenamento instrumentado | Uma das duas chaves é gravada em qualquer momento da carga. **Atenção:** medir só o estado final NÃO basta — a limpeza de resíduo apaga o valor no mesmo bloco e esconde a gravação. Foi assim que a primeira versão desta prova passou sob mutação |
| W002 | `src/lib/app-params.ts` — `descartar: true` na chamada de `access_token`; `RF-01`, `RN-01` | O valor recebido por `?access_token=` **não é adotado**: o campo `token` de `AppParams` é sempre `null` | presença (o campo é nulo) | A chamada volta a devolver o valor do parâmetro, ou `token` volta a receber algo diferente de `null` |
| W003 | `src/lib/app-params.ts` — ordem entre a limpeza de `access_token` e a captura de `from_url`; `R-08`, `data-delta.md#4` | A URL é limpa **antes** de `from_url` capturar `window.location.href`. Nenhuma gravação de `base44_from_url` carrega credencial | **presença da ordem**, medida sobre TODAS as gravações | **Sinal nomeado:** uma gravação de `base44_from_url` contendo `access_token=` no valor. Inverter as duas instruções produz exatamente isso — e a última gravação (limpa) esconderia a primeira se a prova olhasse só o valor final |
| W004 | `src/lib/app-params.ts` — `removerCredencialGravada`; `RF-05`, `D-06` | A limpeza de resíduo é **restrita** a `base44_access_token` e `token`. As chaves `mock_db_<Entidade>` do modo offline e os parâmetros de inicialização permanecem | presença e ausência, pela mesma prova | Uma chave `mock_db_*` desaparece, ou a limpeza passa a varrer o armazenamento inteiro |
| W005 | `src/api/base44Client.ts` — ausência de `hasSessionToken`; `RF-04`, `D-05` | A verificação de sessão **não** é decidida por credencial legível pelo cliente. O símbolo não existe mais, e o dublê das provas também não o expõe | ausência | `hasSessionToken` reaparece — em `base44Client` ou no dublê de `AuthContext.test.tsx`. Reintroduzi-lo faz a verificação voltar a ser condicional, e o caso "verifica sem credencial legível" falha |
| W006 | `src/lib/AuthContext.tsx` — `checkUserAuth`, ramo `else`; `RF-12`, `RN-08` | Falha de verificação produz `session_check_failed`, **distinguível** de `auth_required` | presença, na prova de contexto | Uma falha sem `status`, ou com `status` diferente de 401/403, volta a cair em "não autenticado" silencioso |
| W007 | `src/App.tsx` — tratamento de `authError`; `RF-13`, `D-08` | `auth_required` **redireciona** ao login (é a entrada de quem não tem sessão); `session_check_failed` **não** redireciona e renderiza estado próprio | presença e ausência, pela mesma prova de aplicação | O redirecionamento passa a ocorrer na falha, ou deixa de ocorrer na ausência. O primeiro caso derruba o usuário para o login por causa de uma oscilação de rede; o segundo fecha a porta de entrada do sistema |
| W008 | `src/lib/app-params.ts` — `removeFromUrl: true`; `RF-03`, `RN-03` | A retirada do parâmetro `access_token` da barra de endereço **permanece**, com os demais parâmetros preservados | presença | O parâmetro volta a ficar na URL, ou a limpeza passa a derrubar outros parâmetros |

## Observações

Registradas **sem peso de regressão**: são os limites declarados da correção, e afirmá-las como regra seria dizer que o projeto promete mais do que entrega.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `docs/security-audit/002-record/achados.json` — recomendação do F-02 | O **trânsito** da credencial na URL continua aberto. A origem é o login hospedado da plataforma, e o cliente não tem como impedi-lo. Nenhuma prova deste repositório mede isso, e nenhuma deve fingir que mede |
| O002 | `src/lib/app-params.ts` — nota de paridade | A paridade declarada com o legado foi **rompida de propósito** neste ponto. O comentário do arquivo foi atualizado para dizer o que passou a valer; uma re-extração deve ler a nota nova, e não a antiga |
| O003 | `src/lib/__tests__/appParams.test.ts` | **Armadilha de prova, medida nesta rodada:** em jsdom, `vi.spyOn(window.localStorage, 'setItem')` e `vi.spyOn(Storage.prototype, 'setItem')` **não interceptam nada** — os dois devolveram zero chamadas. Um espião inerte faz uma prova parecer rigorosa sem ser. O que funciona é substituir `window.localStorage` por um objeto instrumentado antes da avaliação do módulo |
| O004 | `src/App.tsx` | O estado renderizado na falha de verificação é **apresentação**, não regra de negócio: nenhum teste de negócio deve depender do texto dele. O que tem peso é a distinção entre os dois casos e a ausência de redirecionamento na falha |
| O005 | `src/lib/AuthContext.tsx` | A conclusão de que o **cookie de sessão** autentica as requisições apoia-se em duas evidências indiretas — o logout da plataforma limpa cookies `httpOnly`, e as requisições são same-origin. O servidor não foi observado diretamente. O Passo 3 do `onboarding.md` é o teste de campo dessa premissa |

## Histórico de re-extrações

> Vazio. Será preenchido pelo agente reverso quando `/reversa` rodar de novo.

## Arquivadas

> Vazio.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-coding` — 8 itens no watch principal e 5 observações | reversa |
