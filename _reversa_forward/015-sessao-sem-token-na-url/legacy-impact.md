# Legacy Impact: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)

## Política de edição no momento da execução

| Campo | Valor |
|-------|-------|
| `allowLegacyEdits` | `true` |
| `allowedPaths` | `src/**`, `package.json`, `tsconfig.json`, `docs/**`, `index.html`, `.github/**` |
| Caminhos usados pela feature | todos sob `src/**` — **nenhuma escrita fora da política** |
| Pastas próprias do Reversa | `_reversa_forward/015-…/` e `_reversa_sdd/` — sempre graváveis |

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|:----------:|---------------|
| `src/lib/app-params.ts` | `app-params` (parâmetros de inicialização) | `regra-alterada` | **HIGH** | Deixa de adotar e de gravar a credencial de sessão; remove o resíduo de versões anteriores. Rompe de propósito a paridade declarada no próprio arquivo |
| `src/api/base44Client.ts` | `base44Client` (cliente único) | `regra-alterada` | **HIGH** | O símbolo `hasSessionToken` — que decidia se a sessão seria verificada — **foi removido** |
| `src/lib/AuthContext.tsx` | `AuthContext` (camada de sessão) | `regra-alterada` | **HIGH** | Verifica a sessão sempre; separa falha de verificação de ausência de sessão |
| `src/App.tsx` | `App` (raiz da aplicação) | `regra-alterada` | **HIGH** | Trata os dois casos de erro de sessão de forma distinta: redireciona ao login só na ausência, e exibe estado próprio na falha |
| `src/lib/__tests__/appParams.test.ts` | — (prova) | `componente-novo` | LOW | Prova de não-adoção, de não-gravação, de ordem e de limpeza restrita |
| `src/lib/__tests__/AuthContext.test.tsx` | — (prova) | `regra-alterada` | LOW | Reescrito: o dublê deixa de expor `hasSessionToken`, o que torna a reintrodução do portão detectável |
| `src/__tests__/SessaoIndisponivel.test.tsx` | — (prova) | `componente-novo` | LOW | Prova, no nível da aplicação, que a falha de verificação não redireciona |

**Nenhum outro arquivo foi tocado.** Em particular, `base44/entities/*.jsonc` (schema e RLS) permanece intocado — regra de ouro do diff vigente desde a feature `001`.

## Diff conceitual por componente

**`app-params`.** O módulo recebeu uma opção `descartar`: o parâmetro é lido apenas para ser retirado da URL. A chamada da credencial passou a usá-la, e a limpeza do resíduo ficou **fora** do objeto literal, como instrução anterior ao `return` — o que elimina a dependência de ordem entre campos que existia antes. O campo `token` do tipo `AppParams` continua existindo e agora é sempre `null`: a forma do contrato não mudou, a origem do valor é que deixou de existir.

**`base44Client`.** `hasSessionToken` foi **removido**, e não apenas esvaziado. Ele derivava de um token que agora é sempre nulo; mantê-lo seria manter um símbolo que sempre mente. A resolução dos parâmetros de inicialização continua no mesmo lugar, e o cliente do SDK continua sendo construído do mesmo modo.

**`AuthContext`.** A verificação passou a acontecer sempre, sem condição. No tratamento de erro, `401` e `403` continuam produzindo `auth_required` — ausência de sessão —, e **qualquer outra falha** passa a produzir `session_check_failed`, um estado novo e distinguível. Antes, todo erro que não fosse 401/403 caía em "não autenticado" silencioso.

**`App`.** O tratamento de `authError` passou a ter um terceiro ramo. `auth_required` continua chamando `navigateToLogin()` — é a porta de entrada de quem não tem sessão; `session_check_failed` renderiza um estado próprio, com a explicação de que não é logout e um botão que reexecuta a verificação. Antes, um tipo não reconhecido **não era tratado**: o `if` não casava e a aplicação renderizava as rotas assim mesmo.

## Preservadas

Regras 🟢 que continuam intactas, conferidas uma a uma:

- **A RLS do servidor é a autorização real** — nenhuma política, schema ou entidade foi tocada.
- **BR-MIGRAR-024** (trilha de auditoria: leitura admin-only), **BR-MIGRAR-017/020** (leitura livre de Médicos e Templates) — a guarda de papel da feature `011` continua como estava.
- **BR-MIGRAR-034** (escopo obrigatório nas mutações por identificador) e **BR-MIGRAR-036** (RBAC refletido em tipos) — intocados.
- **BR-MIGRAR-039 / BR-OFF10** (usuário de demonstração sem papel; offline não aplica RLS) — o modo offline não foi alcançado: a limpeza é restrita a duas chaves de credencial, e as chaves `mock_db_<Entidade>` são preservadas, com prova.
- **A ordem de precedência dos demais parâmetros** (URL → padrão → armazenado) e a limpeza sob demanda por `clear_access_token` continuam como no legado.
- **`base44/entities/*.jsonc`** sem nenhum diff.
- Os **defeitos preservados do legado** (AMB-006, o recorte de data sem teto, o portão de agendamento que não revalida jornada) — esta feature não os tocou.

## Modificadas

Regras 🟢 alteradas ou removidas, que geram item de watch na `regression-watch.md`:

1. **Adoção da credencial por `?access_token=`** — regra **removida**. O parâmetro continua sendo retirado da URL, e deixa de ser usado como credencial.
2. **Persistência da credencial no armazenamento do navegador** — regra **removida**, e o resíduo de versões anteriores passa a ser apagado a cada carga.
3. **A paridade declarada em `src/lib/app-params.ts`** ("a ordem de precedência… continuam exatamente como no legado") — **rompida de propósito**, e o comentário do arquivo foi atualizado para dizer o que passou a valer. Deixá-lo como estava faria o código mentir sobre si mesmo.
4. **A condição de verificação da sessão** (`hasSessionToken`) — **removida**. A verificação deixou de depender de uma credencial legível pelo cliente.
5. **A indistinção entre falha de verificação e ausência de sessão** — **removida**. Os dois casos passam a produzir estados distintos, e só o segundo redireciona ao login.

> **O que permanece aberto e não é desta feature:** o **trânsito** da credencial na própria URL (RF-11, RN-07). A origem é o login hospedado da plataforma, e o cliente não tem como impedi-lo. Fica declarado com dono nomeado, e o estado do achado F-02 na matriz passa a **🟡 parcial** — nunca ✅.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-coding` | reversa |
