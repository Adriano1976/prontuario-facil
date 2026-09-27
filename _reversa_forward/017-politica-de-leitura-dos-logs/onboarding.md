# Onboarding: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Para quem nunca viu esta feature: siga na ordem. Cada passo diz **o que fazer** e **o que deve
> aparecer**. Se aparecer outra coisa, o passo diz o que isso significa.

## 1. Antes de começar

| Item | Valor |
|---|---|
| Instalação | `npm install` |
| Ligar a aplicação | `npm run dev` |
| Modo offline | `VITE_OFFLINE=true` no ambiente — dados de demonstração no `localStorage`, sem servidor |
| Portões automatizados | `npm test`, `npm run typecheck`, `npm run prova:negativos`, `npm run prova:encoding` |

### Leia isto antes: no modo offline a tela fica vazia, e é de propósito

A tela de Logs é **admin-only**, e a leitura declara o escopo: para quem não é admin ela devolve
conjunto vazio sem sequer perguntar ao servidor (`leituraDaTrilha`, `AccessLogs.tsx:87-91`). No modo
offline a sessão é o usuário de demonstração, que **não tem papel** — `OFFLINE_USER` é
`{ id, email, full_name }` (`src/api/mockClient.ts:26-30`).

Portanto:

- **No modo offline, a tela de Logs de Acesso não mostra nada.** Não é defeito desta feature nem
  regressão: é o comportamento decidido na correção do achado F-01.
- **Não há como conceder o papel pela configuração.** Acrescentar `role` ao `OFFLINE_USER` é recusado
  pelo portão de tipos — existe um caso negativo dedicado a isso,
  `papel-atribuido-ao-usuario-offline`, em `src/test/verificacoes-negativas.mjs:211`. A ausência de
  papel é **estrutural**, por decisão registrada.

Ou seja: **o roteiro abaixo exige uma sessão com papel de administrador.** A forma de obtê-la neste
repositório é pelo arnês de prova, que já monta a sessão assim (`USUARIO_DA_SESSAO`, em
`src/pages/__tests__/AccessLogs.test.tsx`); num ambiente real, vale para quem entrar com uma conta de
administrador.

⚠️ **A massa de demonstração tem um único registro de trilha** (`log-1`, `src/api/mockSeed.ts:87`).
Para exercitar paginação numa sessão de administrador, use o passo 2.

## 2. Semear a massa

Com a aplicação aberta, abra o console do navegador e cole:

```js
const agora = Date.now();
const registros = Array.from({ length: 1200 }, (_, i) => ({
  id: `log-massa-${i + 1}`,
  user_email: i % 4 === 0 ? 'outro@medrecord.local' : 'demo@medrecord.local',
  action: i % 3 === 0 ? 'view_patient' : i % 3 === 1 ? 'edit_patient' : 'login',
  entity_type: 'Paciente',
  entity_id: 'pat-1',
  patient_name: i % 5 === 0 ? 'João Silva' : null,
  ip_address: 'client-side',
  user_agent: '',
  details: null,
  created_date: new Date(agora - i * 60000).toISOString(),
}));
localStorage.setItem('mock_db_AccessLog', JSON.stringify(registros));
location.reload();
```

São **1200 registros**, um por minuto, do mais recente (`i = 0`) para o mais antigo (`i = 1199`). Com
recorte de 500, isso dá **três páginas**: 500, 500 e 200.

**Se a tela mostrar o registro único de demonstração (`log-1`):** o armazenamento não foi substituído.
Repita o passo e recarregue sem apagar o `localStorage`.

## 3. Roteiro de verificação manual

### Passo 1 — a primeira página

Abra a tela de **Logs de Acesso**.

**Esperado:** a lista mostra **500** linhas; o indicador que antes se chamava "Total de Logs" agora diz
**"Logs neste recorte"** e vale **500**; o controle de **retroceder está indisponível**; o de avançar
está disponível.

**Se aparecer "Total de Logs":** o rótulo não foi corrigido — `RN-02` violada.

### Passo 2 — avançar alcança o que não estava lá

Avance uma página.

**Esperado:** aparecem **outros** 500 registros, mais antigos que os da primeira página. Nenhum deles
estava visível antes — é a entrega central: com 1200 registros, a tela antiga mostrava 500 e os outros
700 eram inalcançáveis.

**Se a segunda página repetir a primeira:** o deslocamento não chegou ao adaptador. Verifique se
`skip` foi repassado em `src/api/entities.ts`.

### Passo 3 — a última página e o fim da trilha

Avance até a terceira página.

**Esperado:** **200** linhas; **"Logs neste recorte" vale 200**; o controle de avançar fica
**indisponível**. Não existe quarta página.

**Se o avançar continuar disponível numa página vazia:** a detecção pelo excedente não foi
implementada — a tela assumiu que página cheia é a última, ou pediu exatamente o recorte em vez de
`recorte + 1`.

### Passo 4 — retroceder volta ao recorte anterior

Retroceda duas vezes.

**Esperado:** volta à segunda e depois à primeira página; na primeira, o retroceder fica indisponível.

### Passo 5 — o alcance da busca é declarado

Com a primeira página aberta, digite **`João Silva`** na busca.

**Esperado:** **100** registros — os múltiplos de 5 dentro de `i = 0..499`. E a tela **declara** que a
busca alcança o recorte exibido, e não a trilha inteira (`RF-08`).

Vá para a terceira página e busque o mesmo nome.

**Esperado:** **40** registros — múltiplos de 5 dentro de `i = 1000..1199`. Números diferentes para a
mesma busca, **e é o comportamento decidido**: a busca é do cliente e alcança a página. O que a
declaração na tela impede é o auditor concluir que o registro não existe.

**Se a busca devolver os mesmos 140 registros nas duas páginas:** o filtro deixou de ser do cliente, o
que contraria `RN-05`.

### Passo 6 — a ordem não regride

Em qualquer página, confira os carimbos da coluna "Data/Hora".

**Esperado:** sempre do mais recente para o mais antigo, dentro da página e entre páginas.

### Passo 7 — a heurística dos indicadores continua a mesma

Com a busca limpa, olhe os quatro cartões na primeira página.

**Esperado:** "Logs neste recorte" = 500; "Visualizações" conta as ações com `view`; "Edições" conta
`edit` **e** `create` juntas; "Exclusões" conta `delete`. Os quatro **não somam** o recorte — `login`
não entra em categoria nenhuma. Isso é a lacuna herdada, declarada e provada, e ficou **fora do escopo**
por decisão.

### Passo 8 — a tela continua somente leitura

Nenhuma linha oferece editar ou excluir.

## 4. O que este roteiro **não** consegue provar, e você deve saber

- **A deriva de deslocamento.** A trilha cresce enquanto se navega. Com ordenação do mais recente para
  o mais antigo, um registro inserido entre duas leituras **empurra** os demais, e a página seguinte
  repete o último item da anterior. Você pode observar isso: na segunda página, anote o primeiro
  registro; grave um acesso novo em outra tela; recarregue e volte à segunda página. É limitação
  inerente ao deslocamento sobre tabela que cresce, declarada como risco — **não** é defeito da
  implementação, e não tem contorno dentro do contrato atual.
- **Empate de carimbo.** Dois registros com o mesmo `created_date` podem ordenar de forma diferente
  entre duas requisições. A massa deste roteiro usa um por minuto justamente para não cair nisso.
- **O comportamento do servidor real e o do cliente de modo offline, ao mesmo tempo.** O roteiro roda
  numa sessão de administrador; a massa por `localStorage` só tem efeito no cliente de modo offline.
  Nenhum ambiente único exercita os dois. A concordância entre as duas implementações é o que a prova
  de paridade (`PT-010`) verifica, e é lá que ela deve ser conferida.

## 5. Portões automatizados

| Comando | O que prova | Linha de base antes desta feature |
|---|---|---|
| `npm test` | Unidade e tela, incluindo a paginação e a paridade entre os dois clientes | 218 verificações em 32 arquivos, 0 falhas |
| `npm run typecheck` | Que o contrato estendido continua íntegro | 0 erros |
| `npm run prova:negativos` | Que nenhum caso negativo deixou resíduo | 18 casos |
| `npm run prova:encoding` | Que nenhum arquivo tem BOM nem mojibake | 541 arquivos |

A contagem **sobe** com esta feature. O que não pode acontecer é a suíte ficar vermelha, nem a
contagem **cair**.

## 6. Onde olhar quando algo não bate

| Sintoma | Onde investigar |
|---|---|
| A segunda página repete a primeira | `skip` não chegou ao adaptador (`src/api/entities.ts`), ou a chave de cache não inclui a página |
| O avançar nunca desabilita | A leitura pede o recorte exato em vez de `recorte + 1` |
| O avançar desabilita cedo demais | O excedente está sendo exibido em vez de descartado |
| O modo offline diverge do adaptador | Uma das duas implementações não honra `skip` — é o que `PT-010` existe para pegar |
| "Total de Logs" na tela | O rótulo não foi corrigido |
| A busca devolve o mesmo em qualquer página | O filtro saiu do cliente |

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-plan` | reversa |
