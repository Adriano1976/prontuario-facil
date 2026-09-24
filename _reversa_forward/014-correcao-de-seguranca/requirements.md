# Requirements: Correção dos achados de segurança do frontend

> Identificador: `014-correcao-de-seguranca`
> Data: `2026-09-24`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

> ⚠️ **Nota de proveniência, e ela é obrigatória para ler este documento corretamente.** Esta feature
> é **retroactiva**. As correções que ela descreve foram **entregues em 2026-09-24**, na branch
> `fix/seguranca-frontend`, antes de existir este `requirements.md` — o trabalho nasceu de revisão de
> segurança e foi conduzido por revisão de código, não pelo ciclo forward. Os artefatos foram escritos
> depois, para que o ciclo possa processar a entrega e o `/reversa-sync` possa convergi-la. O que se
> documenta aqui **não é intenção**: é o que foi feito, provado e commitado. Ver
> `_reversa_sdd/pendencias-de-convergencia.md`, que registra a lacuna de processo.

## 1. Resumo executivo

Corrige quatro dos cinco achados das duas auditorias de segurança (`docs/security-audit/001-record` e
`002-record`), alinhando o frontend a regras de negócio que o projeto **já tinha**. O F-01 tira das
mãos de qualquer autenticado o menu, a rota e as ações administrativas; o F-03 torna obrigatório por
tipos o escopo de acesso nas mutações; o F-04 faz a leitura da trilha de auditoria declarar o escopo
administrativo; e o F-05 remove o único sink de HTML perigoso do projeto. O **F-02 fica fora de
escopo** — não é corrigível neste repositório, e a razão está medida no SDK. Nenhuma regra de negócio
do legado é alterada: cada correção é autorizada por uma `BR-MIGRAR` existente.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `docs/security-audit/002-record/achados.json` | Os cinco achados (F-01 a F-05), com severidade e evidência, reconfirmados em 2026-09-16 já sobre o código em TypeScript | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-024` | `AccessLog`: read/update/delete apenas `admin`; inserção pelo sistema | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-015` | CRUD de médicos só `admin` | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-017` | **Leitura de médicos livre** para autenticados; escrita restrita | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-020` | CRUD de templates restrito a `admin`; **leitura de ativos livre** | 🟢 |
| `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-034` | Isolamento por criador ou admin, **tornado obrigatório por tipos** em query *e* mutation | 🟢 |
| `_reversa_sdd/permissions.md#3` e `#4` | Matriz RBAC; offline sem RLS e sem `role` | 🟢 |
| `_reversa_sdd/code-analysis.md#5.1` (logs-acesso) | "Somente admins veem a tela de auditoria" — nota que a extração não conseguia sustentar | 🟢 |
| `_reversa_forward/006-prova-logs-acesso/regression-watch.md#W008` | Vigiava "a navegação **não** consulta papel", e nomeava a guarda de papel como **regra nova legítima** | 🟢 |
| `_reversa_sdd/code-spec-matrix.md#Achados de segurança — estado da correção` | Registro vivo dos cinco achados e das evidências do SDK para o F-02 | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Profissional de saúde (não-admin) | Usar o prontuário sem ver nem alcançar superfície administrativa | Abre o sistema e não encontra o item "Logs de Acesso"; continua lendo médicos e templates, que lhe são úteis no atendimento |
| Administrador | Auditar e configurar | Vê o item de auditoria, entra na trilha, gerencia médicos e templates |
| DPO / responsável por LGPD | Saber quem acessa dado sensível | A trilha de auditoria só é oferecida a admin, e a leitura passa a **declarar** esse escopo em vez de omiti-lo |
| Desenvolvedor | Não reintroduzir os achados | Não consegue compilar uma mutação sem declarar o escopo, nem usar o sink de HTML |

## 4. Regras de negócio novas ou alteradas

1. **RN-01: a guarda de papel é de ROTA onde a leitura é restrita, e de AÇÃO onde o restrito é a escrita.** 🟢
   - Origem no legado: `_reversa_sdd/migration/target_business_rules.md#BR-MIGRAR-024` (trilha) × `#BR-MIGRAR-017`/`#BR-MIGRAR-020` (médicos e templates)
   - Tipo: nova (regra de aplicação; nenhuma BR do legado muda)
2. **RN-02: quem não é admin continua lendo médicos e templates.** 🟢
   - Origem: `#BR-MIGRAR-017` e `#BR-MIGRAR-020`
   - Tipo: preservada — a feature **não** pode restringi-la
3. **RN-03: `update` e `delete` das cinco entidades sob RLS exigem o escopo na assinatura.** 🟢
   - Origem: `#BR-MIGRAR-034`
   - Tipo: nova (obrigatoriedade de contrato; a autorização em runtime continua no servidor)
4. **RN-04: a leitura da trilha declara escopo administrativo; para escopo de dono, responde vazio sem consultar o servidor.** 🟢
   - Origem: `#BR-MIGRAR-024`
   - Tipo: alterada — a leitura era feita pelo repositório cru, sem escopo declarado
5. **RN-05: o usuário de demonstração do modo offline não carrega papel.** 🟢
   - Origem: `#BR-MIGRAR-039`; `_reversa_sdd/modo-offline/requirements.md#2` (`BR-OFF10`, `BR-MIGRAR-044`)
   - Tipo: preservada — a correção **recusa** a tentação de promovê-lo a admin
6. **RN-06: nenhum componente do projeto entrega HTML por `dangerouslySetInnerHTML`.** 🟡
   - Origem: `docs/security-audit/002-record/achados.json` (F-05)
   - Tipo: nova
7. **RN-07: o F-02 não é corrigido neste repositório.** 🟢
   - Origem: `_reversa_sdd/code-spec-matrix.md#Achados de segurança — estado da correção`
   - Tipo: declarada — depende de decisão de plataforma/deployment

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O item de navegação da trilha de auditoria é oferecido **apenas** a administradores | Must | Com sessão sem `role`, nenhum elo de navegação "Logs de Acesso" existe no DOM; com `role: 'admin'`, existe um, apontando para `/AccessLogs` | 🟢 |
| RF-02 | A rota `/AccessLogs` exige papel `admin` | Must | Não-admin é redirecionado ao painel **e** recebe o aviso "Acesso Negado"; admin vê a tela | 🟢 |
| RF-03 | Médicos e Templates continuam alcançáveis por qualquer autenticado | Must | Não-admin renderiza as duas telas e vê as listas | 🟢 |
| RF-04 | Criar, editar e excluir em Médicos não são oferecidos a quem não é admin | Must | Não-admin vê a lista e **não** vê os três botões; a tela tem um único botão — o de voltar | 🟢 |
| RF-05 | Criar, editar e excluir em Templates não são oferecidos a quem não é admin | Must | Idem, **incluindo** o botão "Criar Primeiro Template" do estado vazio | 🟢 |
| RF-06 | `update` e `delete` das entidades sob RLS exigem o escopo por contrato | Must | Omitir o escopo **não compila** (`TS2554`); os dois casos negativos existem no arnês | 🟢 |
| RF-07 | A leitura da trilha declara escopo administrativo | Must | O pedido sai por `asAdmin` com o escopo da sessão, com os argumentos exatos `('-created_date', 500)` | 🟢 |
| RF-08 | A leitura da trilha não pergunta ao servidor para quem não é admin | Must | Com sessão de dono, o transporte **não** é consultado | 🟢 |
| RF-09 | O usuário offline não carrega papel | Must | `OFFLINE_USER` tem `id`, `email` e `full_name`, e nada mais | 🟢 |
| RF-10 | O componente de gráficos não usa `dangerouslySetInnerHTML` | Should | Uma cor hostil entra como **texto** no `<style>`, e nenhum `<script>` nasce no DOM | 🟢 |
| RF-11 | Cada correção tem prova de execução, e a das guardas de ação foi falsificada | Must | Desligada a guarda nas duas telas, 3 das 6 verificações de ação falham; revertida, a suíte volta verde sem resíduo | 🟢 |
| RF-12 | O trabalho é registrado no corpus | Must | Adendo `011`, watches `011`/`012`/`013` e as seções da matriz existem e são coerentes | 🟢 |
| RF-13 | O F-02 é registrado como não corrigível aqui, com a evidência | Must | A matriz cita `client.js:123` e `auth-utils.js:38` e nomeia o que fecharia o achado | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Paridade | Nenhuma regra de negócio do legado é alterada; as correções decorrem de `BR-MIGRAR` existentes | Cada mudança tem a BR que a autoriza, na tabela da matriz | 🟢 |
| Segurança | A autorização real permanece no servidor; as guardas de interface **não** a substituem | `scopedRead.ts:30-32`; `sessionScope.ts:18-21`; `registry.ts:125` | 🟢 |
| Verificação | `typecheck` 0 erros · suíte verde · `prova:negativos` sem resíduo · `prova:encoding` íntegro | Medições de 2026-09-24: **183 verificações em 29 arquivos**; **18 casos negativos** | 🟢 |
| Rastreabilidade | Nenhuma mudança de comportamento sem prova e sem registro | Adendo `011`; watches; matriz | 🟢 |
| Manutenibilidade | O papel do usuário passa a ser lido num ponto único | `src/lib/useCurrentUser.ts` | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: profissional sem papel não vê a superfície de auditoria
  Dado uma sessão autenticada sem papel de administrador
  Quando a navegação principal é desenhada
  Então nenhum elo "Logs de Acesso" existe
  E o acesso direto a /AccessLogs é redirecionado ao painel com aviso de acesso negado

Cenário: profissional sem papel continua lendo médicos e templates
  Dado uma sessão autenticada sem papel de administrador
  Quando a tela de Médicos é aberta
  Então a lista é exibida
  E criar, editar e excluir não são oferecidos

Cenário: mutação sem escopo não compila
  Dado um código que chama update ou delete de entidade sob RLS
  Quando o escopo de acesso não é informado
  Então a verificação de tipos recusa a compilação

Cenário: CSS de gráfico não vira marcação
  Dado uma configuração de gráfico cuja cor tenta encerrar a tag de estilo
  Quando o componente injeta as regras
  Então o valor chega ao documento como texto
  E nenhum elemento executável é criado
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | F-01, severidade **Alta**, reconfirmado por duas auditorias |
| RF-04, RF-05 | Must | Mesma origem; sem eles a correção do F-01 fica pela metade |
| RF-06 | Must | F-03, severidade **Alta** |
| RF-07, RF-08 | Must | F-04 é o achado de severidade **Média**, e é o que fecha a omissão de escopo |
| RF-09 | Must | Promover o usuário offline a admin seria **piorar** a segurança |
| RF-03 | Must | Impede que a correção vire restrição indevida — é o contrapeso |
| RF-11, RF-12, RF-13 | Must | Correção sem prova e sem registro não é correção |
| RF-10 | Should | F-05 é severidade **Baixa**, e o componente não tem consumidor |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

> **Nota:** as decisões desta feature **foram** tomadas — estão na seção `## 3. Decisões técnicas` do
> `roadmap.md`, registradas durante a execução. O que falta não é decisão de implementação: são as
> três perguntas de contexto da seção `## 10`, que dependem do ambiente de produção e de produto.

## 10. Lacunas

- 🔴 [DÚVIDA] **O deployment recebe sessão por `?access_token=`?** Se não receber, o F-02 é um caminho
  que ninguém usa, e a prioridade dele muda. A resposta depende de quem controla o app no Base44.
- 🔴 [DÚVIDA] **O servidor devolve `role` em `auth.me()`?** O `toSessionUser` transforma papel
  desconhecido em `undefined` (regra conservadora), e o `RoleGuard` exige `role === 'admin'`. Se o
  papel não vier em produção, **administradores legítimos perdem o acesso** às três telas.
- 🔴 [DÚVIDA] **O projeto tem ou terá multi-inquilino?** O schema de `AccessLog` não tem campo de
  inquilino ou organização, e por isso a cláusula "filtro de tenant" do achado F-04 não é
  implementável. Se o multi-inquilino estiver no horizonte, ele exige decisão de schema.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-24 | Versão inicial, escrita **retroactivamente** sobre a entrega já feita na branch `fix/seguranca-frontend` | reversa |
