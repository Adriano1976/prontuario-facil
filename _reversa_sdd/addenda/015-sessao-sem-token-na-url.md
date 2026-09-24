# Adendo: Sessão sem adoção de token na URL e sem persistência no cliente

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Cenário: **legado** (`_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` presentes)

## Vigência

Vigente desde 2026-09-24.

## Resumo da entrega

A feature fecha a **metade corrigível no cliente** do achado **F-02** — "recepção de token de acesso sensível via parâmetro de consulta de URL e **persistência do token em LocalStorage**" (`docs/security-audit/002-record/achados.json`). O cliente deixou de **adotar** e de **persistir** a credencial de sessão: o parâmetro continua sendo retirado da barra de endereço, mas nada é gravado no armazenamento do navegador, o resíduo de versões anteriores é removido a cada carga, e a verificação de sessão deixou de depender de uma credencial que o cliente consiga ler.

A metade do **trânsito** da credencial na URL **permanece aberta** e é de plataforma: a origem é o login hospedado, e o cliente não tem como impedir que a credencial transite. O estado do achado passa de ⛔ para **🟡 parcial** — nunca ✅.

**22 de 22 ações concluídas**, com as duas provas falsificadas antes de aceitas. As duas falsificações **não falharam** na primeira tentativa — as provas mediam o estado final em vez do ato —, e a correção de cada uma está registrada no `regression-watch.md`.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
| :--- | :--- | :--- | :--- |
| `_reversa_sdd/inventory.md` | `#Configuração / ambiente` | `regra-alterada` | A lista de parâmetros por query string continua correta, mas `access_token` **deixou de ser adotado**: é lido apenas para ser retirado da URL. **Leia como:** dos seis parâmetros citados, um passou a ser descartado |
| `_reversa_sdd/inventory.md` | `#Pontos de entrada` | `regra-alterada` | `base44Client` continua sendo o cliente único, e **deixou de exportar** `hasSessionToken` — o símbolo que decidia se a sessão seria verificada. **Leia como:** a sessão não é mais condicional a credencial legível |
| `_reversa_sdd/code-analysis.md` | `#10.2 Mudanças em arquivos existentes` | `regra-alterada` | A tabela descreve os diffs do modo offline em `base44Client.js` e `AuthContext.jsx`. **Leia como:** esses dois arquivos voltaram a mudar, agora pela sessão — `base44Client.ts` perdeu o portão e `AuthContext.tsx` verifica sempre e separa falha de ausência |
| `_reversa_sdd/code-analysis.md` | `#10.4 Persistência` | `delta-de-dados` | A seção descreve as chaves do modo offline (`mock_db_<Entidade>`) no armazenamento. **Leia como:** o mesmo armazenamento deixou de receber credencial de sessão, e a limpeza é **restrita** às duas chaves de credencial — as `mock_db_*` são preservadas, com prova |
| `_reversa_sdd/code-spec-matrix.md` | `#Achados de segurança — estado da correção (2026-09-24)` | `regra-alterada` | A linha do F-02 dizia ⛔ **não corrigível neste repositório**. **Leia como:** passou a 🟡 **parcialmente corrigido**, com as duas metades nomeadas — persistência fechada, trânsito aberto e de plataforma |
| `_reversa_sdd/code-spec-matrix.md` | `#Correção do F-02 — a metade corrigível no cliente` | `regra-nova` | **Seção nova**, acrescentada pela própria feature junto da linha de medição (198 verificações em 31 arquivos). **Leia como:** o lugar onde as duas metades do achado estão separadas e o motivo de a recomendação literal da auditoria não ter sido seguida |

> **Onde este adendo se desvia do formato padrão.** O `/reversa-sync` pede que componentes apontem para `_reversa_sdd/architecture.md#<seção>` e regras de negócio para `_reversa_sdd/domain.md#<seção>`. Nenhum dos dois serve aqui, e isso está verificado: `architecture.md` tem 37 linhas e não traz inventário de componentes — ele vive em `c4-components.md` e `inventory.md`; e `domain.md` **não trata do assunto**, porque a busca por "sessão", "token", "autentica", "LGPD" e "localStorage" nesse arquivo não devolve nenhuma ocorrência. Os apontadores acima vão para os artefatos que de fato carregam o conteúdo. Registrado em vez de silenciado — é o mesmo desvio que o `roadmap.md` justificou no achado A007.

## Regras sob vigilância

Oito itens, todos em `_reversa_forward/015-sessao-sem-token-na-url/regression-watch.md`:

- **Não-gravação da credencial** — `W001` (medida no **ato** de gravar, não no estado final)
- **Não-adoção do token da URL** — `W002`
- **Ordem entre a limpeza da URL e a captura de `from_url`** — `W003`, com sinal nomeado
- **Limpeza restrita às duas chaves de credencial** — `W004`
- **Ausência de `hasSessionToken`** — `W005`
- **Falha de verificação distinguível de ausência de sessão** — `W006`
- **Redirecionamento preservado para a ausência, removido da falha** — `W007`
- **Retirada do parâmetro da URL preservada** — `W008`

Cinco observações, sem peso de regressão (`O001` a `O005`), entre elas o limite do trânsito na URL e a armadilha de prova medida nesta rodada — `vi.spyOn` no `localStorage` não intercepta nada em jsdom.

## Fontes

- `_reversa_forward/015-sessao-sem-token-na-url/legacy-impact.md` — fonte principal do delta
- `_reversa_forward/015-sessao-sem-token-na-url/regression-watch.md`
- `_reversa_forward/015-sessao-sem-token-na-url/requirements.md` — 14 requisitos, 9 regras, 11 cenários
- `_reversa_forward/015-sessao-sem-token-na-url/roadmap.md`, `data-delta.md`, `investigation.md`, `onboarding.md`
- `_reversa_forward/015-sessao-sem-token-na-url/audit/cross-check.md` — duas rodadas
- `_reversa_forward/015-sessao-sem-token-na-url/progress.jsonl`
- `docs/security-audit/001-record/achados.json` e `002-record/achados.json` — achado F-02
- `src/lib/app-params.ts`, `src/api/base44Client.ts`, `src/lib/AuthContext.tsx`, `src/App.tsx`
- `src/lib/__tests__/appParams.test.ts`, `src/lib/__tests__/AuthContext.test.tsx`, `src/__tests__/SessaoIndisponivel.test.tsx`
