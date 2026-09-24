# Onboarding: como testar a feature `015` pela primeira vez

> Identificador: `015-sessao-sem-token-na-url`
> Data: `2026-09-24`
> Para quem vai executar a verificação sem ter participado do plano.

## 1. O que você está tentando provar

Uma frase: **a credencial de sessão parou de ser adotada da URL e de ser gravada no navegador, e a sessão continua funcionando.**

Há duas metades, e é essencial não confundi-las:

| Metade | Provável neste repositório? |
|--------|----------------------------|
| A credencial não é gravada e não é adotada pelo cliente | **Sim** — é o que este roteiro verifica |
| A credencial não transita mais pela URL | **Não** — a origem é o login hospedado da plataforma. Se você vir `?access_token=` na URL de entrada, isso **não** é falha da feature |

## 2. Pré-requisitos

```bash
npm ci
```

**Atenção ao ambiente confinado.** Nesta máquina, `npm test` e `npm run prova:negativos` falham com `spawn EPERM` quando executados sob sandbox restrito — o processo filho não consegue abrir o pipe. Se você vir esse erro, **não é falha da suíte**: rode os comandos com acesso ampliado.

## 3. Linha de base, antes de olhar a mudança

Registre os números de partida. Se algum deles já vier diferente, o problema é anterior a esta feature:

| Comando | Esperado |
|---------|----------|
| `npm test` | **183 verificações em 29 arquivos**, 0 falhas |
| `npm run typecheck` | **0 erros** |
| `npm run prova:negativos` | **18 casos** (17 negativos e 1 positivo), sem resíduo em `src/__negative_checks__/` |
| `npm run prova:encoding` | **499 arquivos** íntegros |
| `npm run lint` | **não use como sinal.** O portão está vazio: o config casa apenas padrões `.jsx`, e os `.jsx` restantes vivem na pasta que ele ignora. "0 avisos" não mede nada |

## 4. Verificação manual no navegador — o roteiro que importa

O que a suíte prova por asserção, você vai confirmar com os olhos. **Abra o DevTools antes de carregar a aplicação**, senão o estado inicial já passou.

**Passo 1 — limpe o terreno.** No console: `localStorage.clear()` e recarregue até a tela de login.

**Passo 2 — entre com um link que carrega a credencial.** Acrescente `?access_token=<qualquer valor>` à URL e carregue.

Verifique, nesta ordem:

| O que olhar | Esperado | Se falhar |
|-------------|----------|-----------|
| A barra de endereço | `access_token` **sumiu**; os demais parâmetros continuam | A limpeza da URL quebrou (RF-03) |
| `localStorage.getItem('base44_access_token')` | `null` | A gravação não foi cortada (RF-02) |
| `localStorage.getItem('token')` | `null` | Idem — o SDK grava nas duas chaves |
| **A aba Network, filtrada por `Bearer`** | **nenhuma** requisição com `Authorization: Bearer <o valor que você pôs>` | A credencial foi adotada (RF-01) |

> O último item é o que separa "parou de gravar" de "parou de adotar". Uma implementação que apenas deixasse de gravar, mas ainda usasse o token da URL para montar o cliente, passaria nos três primeiros e falharia neste.

**Passo 3 — a recarga.** Autentique-se de verdade e recarregue a página **sem** parâmetro nenhum na URL.

| O que olhar | Esperado |
|-------------|----------|
| A sessão | continua válida. Você **não** é deslogado |
| `localStorage` | continua sem as chaves de credencial |

Se você for deslogado aqui, o portão de sessão não foi corrigido (RF-04) — e é exatamente o defeito que a feature existe para não criar.

**Passo 4 — o resíduo.** No console: `localStorage.setItem('base44_access_token', 'valor-antigo')`. Recarregue.

| O que olhar | Esperado |
|-------------|----------|
| A chave | foi **removida** na carga (RF-05) |

**Passo 5 — a falha de rede.** No DevTools, ponha a rede em *Offline* e recarregue.

| O que olhar | Esperado |
|-------------|----------|
| O estado da aplicação | um erro **distinguível** de "sem sessão". Não um logout silencioso (RF-12) |
| Volte a rede e recarregue | a sessão volta, sem novo login |

**Passo 6 — sem sessão nenhuma.** `localStorage.clear()`, apague o cookie de sessão da origem, e recarregue.

| O que olhar | Esperado |
|-------------|----------|
| A tela | o erro de sessão **já existente** (`auth_required`) é exibido |
| O redirecionamento | **não** acontece sozinho — o login é ação sua (RF-13) |

## 5. O modo offline, que não pode ter sido tocado

Esta é a verificação que pega o erro mais provável, porque o modo offline usa **o mesmo** armazenamento:

```bash
# com VITE_OFFLINE=true
npm test
```

| O que olhar | Esperado |
|-------------|----------|
| A suíte de modo offline | passa **sem alteração** |
| `localStorage` após navegar no modo offline | as chaves `mock_db_<Entidade>` continuam lá |
| `OFFLINE_USER` | continua **sem** `role` |

Se as chaves `mock_db_*` desaparecerem, a limpeza de resíduo ficou ampla demais (D-06) e apagou os dados de demonstração.

## 6. Falsificar a prova — o passo que não pode ser pulado

Uma prova que passa não vale nada até você vê-la falhar. **Reintroduza a gravação de propósito** e confirme que a suíte acusa:

1. Em `src/lib/app-params.ts`, faça o ramo voltar a gravar a credencial no armazenamento.
2. Rode `npm test`.
3. **Espere falha** na verificação de não-persistência.
4. Reverta e confirme que não sobrou resíduo (`git status`).

Repita para o **segundo** item do watch, que é o mais fácil de não perceber:

5. Inverta a ordem dos campos `token` e `fromUrl` em `getAppParams` — de modo que `from_url` seja capturado **antes** da limpeza.
6. Rode a suíte.
7. **Espere falha** na verificação de ordem, com o sinal nomeado: `base44_from_url` contendo `access_token=`.

> O item 7 existe por causa de um achado desta feature: `base44_from_url` grava a URL completa a cada carga e **nunca é lida de volta** (ver `data-delta.md#4`). É o tipo de campo que alguém reordena sem pensar — e, reordenado, persiste a credencial no mesmo armazenamento que a feature acabou de esvaziar.

## 7. O que este roteiro **não** verifica

- **Que o servidor da plataforma autentica por cookie.** O plano apoia-se nisso por duas evidências indiretas: o logout da plataforma limpa cookies `httpOnly`, e as requisições são same-origin. **É a maior incerteza remanescente.** O Passo 3 é o teste de campo dela: se a sessão não sobreviver à recarga, foi aqui que a premissa falhou.
- **Que a credencial deixou de transitar pela URL.** Depende da plataforma. O roteiro verifica que o cliente não a **adota**; não verifica que ela não **chega**.
- **O comportamento real do modo offline em duas abas.** É limitação declarada (`L2`, `_reversa_sdd/code-analysis.md#10.5`), não exercitável num ambiente de uma aba.

## 8. Armadilhas conhecidas

| Armadilha | Como se manifesta | O que fazer |
|-----------|-------------------|-------------|
| Rodar a suíte sob sandbox restrito | `spawn EPERM` | Rode com acesso ampliado. Não é falha da suíte |
| Ler o `localStorage` **depois** da carga | Você vê o estado final e perde a evidência da gravação | Leia durante a carga, ou use um ponto de parada no código |
| Confiar no `lint` | "0 avisos" | Ignore: o portão não examina arquivo nenhum |
| Testar só com sessão já estabelecida | O caminho da URL nunca é exercitado | Comece pelo Passo 2, com `?access_token=` na URL |
| Esquecer o modo offline | A limpeza ampla passa despercebida | Rode a suíte de modo offline **e** confira `mock_db_*` |

## 9. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial gerada por `/reversa-plan` | reversa |
