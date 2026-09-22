---
schemaVersion: 1
generatedAt: 2026-09-09T16:00:00-03:00
reversa:
  version: "1.3.2"
kind: ambiguity_log
producedBy: orchestrator
hash: "sha256:b183179f8e568d370a99609689520f8b72082d65fc2eeb0bffbbbd1f78804b95"
---

# Ambiguity Log

> Consolidação de todos os itens ⚠️ AMBÍGUOS ou pendentes detectados pelos agentes ao longo do pipeline.
> Status final esperado quando o pipeline conclui: nenhum item PENDENTE.

## Resumo
- Total de itens: 8
- PENDENTES: **0** (DEV-005 foi aberto e resolvido no mesmo dia — ver "Revisão 2026-09-22" no fim deste arquivo)
- RESOLVIDOS COM DECISÃO HUMANA: 5
- REFERIDOS À CODIFICAÇÃO: 2

> O resumo original de 2026-09-09 declarava 7 itens e **0 PENDENTES**. A regeneração da Fase 2 do Screen Translator em 2026-09-22 abriu **uma pendência nova** (DEV-005), **resolvida no mesmo dia por leitura do código legado**. O total passou a 8, com **0 pendentes**.

## Itens

### AMB-001 — Taxa de Atendimento do Dashboard (placeholder 94%)
- **Descrição**: KPI "Taxa de Atendimento" não tem fórmula/fonte/período definidos no legado; exibido fixo em `94%`. Migrar como paridade (constante tipada mock) ou definir fórmula?
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-001; `dashboard/requirements.md` (decisão pendente); `gaps.md` G-01
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — manter `94%` como constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`), sem inventar fórmula; correção/fórmula real em fase posterior.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: brief exige paridade 100% e exclui mudanças de comportamento nesta migração.

### AMB-002 — Divergência de critério entre KPIs "Consultas de Hoje" e "Agendamentos Hoje"
- **Descrição**: Contador de Consultas de hoje pode incluir `cancelada`; o de Agendamentos exclui. Unificar ou reproduzir a divergência no alvo?
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-002; `domain.md` §3; `review-report.md` §3
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — reproduzir o critério atual de cada KPI (inclusive a divergência); o codificador **não** deve "consertar" silenciosamente.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: unificação seria correção comportamental fora do escopo.

### AMB-003 — Sincronia automática Agendamento ↔ Consulta (regra inferida BR-A02)
- **Descrição**: A regra "concluir consulta → agendamento `concluido`" é inferida; legado não tem gatilho automático (marcação manual na UI).
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-003; `domain.md` §2.2 (BR-A02 🟡) e §3
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — migrar o comportamento real (transição manual); descartar a inferência de gatilho automático.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: o legado não implementa a regra inferida; automação seria mudança de comportamento fora do escopo de tipos.

### AMB-004 — Política de paginação dos Logs de Acesso
- **Descrição**: Legado carrega 500 registros e renderiza todos os filtrados, sem paginação; política acima de 500 indefinida.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-004; `logs-acesso/screens.md`; `gaps.md` G-02
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: paridade exata — manter carregamento de até 500 registros sem paginação (constante de limite tipada); política real em fase futura.
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: implementar paginação seria mudança de comportamento/feature fora do escopo.

### AMB-005 — Aviso visual de "dados de teste" no Modo Offline
- **Descrição**: Badge/aviso "Modo Offline — dados fictícios" recomendado (Q-14/G-04) mas não implementado no legado.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-HUMANA-005; `modo-offline/requirements.md` §7 (P1); `gaps.md` G-04
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: não implementar nesta migração (paridade); registrar como melhoria futura sugerida ao codificador (item pós-cutover).
  - **Decisor**: Product Owner/Developer
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: o legado não tem o badge; adicioná-lo seria nova feature.

### AMB-006 — Interpolação de templates sem escape de HTML (XSS potencial)
- **Descrição**: `code-analysis.md` §4.5 registra que a substituição de variáveis de template não escapa HTML (risco XSS). Paridade preserva o comportamento; risco deve ser conhecido pelo codificador.
- **Detectado por**: curator
- **Origem**: `target_business_rules.md` → BR-MIGRAR-021 (nota); `code-analysis.md` §4.5; propagado em `parity_tests/06-emissao-documento-template.feature`
- **Status**: REFERIDO À CODIFICAÇÃO
- **Decisão tomada**:
  - **Escolha**: propagar como alerta — manter paridade funcional, **não** corrigir nesta migração; tipar de forma que o risco fique visível (ex.: função de interpolação documentada).
  - **Decisor**: curator (recomendação) + revisão humana (paridade)
  - **Quando**: 2026-09-09T15:24:37-03:00
  - **Justificativa**: correções de segurança lógica são fase posterior (brief).

### AMB-007 — Não conformidades F-01 (RBAC), F-02 (token recebido por URL), F-03 (IDOR)
- **Descrição**: não conformidades Alta conhecidas do legado que motivaram a migração para tipos; a correção lógica fica em fase posterior. A camada de tipos deve **exigir** os campos/parâmetros que elas exploram (`role`, `created_by_id`, `access_token`) — o que **não** equivale a detectar as vulnerabilidades em compile-time.
- **Detectado por**: orchestrator (consolidação) — origem no `migration_brief.md` (objetivo/restrições) e nas regras BR-MIGRAR-034/036
- **Origem**: `migration_brief.md` (Objetivo); `docs/security-audit/achados.json` (F-01/F-02/F-03 Alta; F-04/F-05 fora do escopo) e `docs/security-audit/relatorio-auditoria-seguranca.md` (fontes canônicas dos IDs F-*); `target_business_rules.md` BR-MIGRAR-034/036; `target_architecture.md` AD-03; `parity_tests/10-contrato-base44-client.feature`
- **Status**: REFERIDO À CODIFICAÇÃO
- **Decisão tomada**:
  - **Escolha**: o código novo deve tornar **obrigatórios por tipo** `role`, o escopo de dados (`created_by_id`) e os params de URL (token) nas APIs internas. O compilador verifica **forma, não autorização**: código que passe `role` errado, ignore o escopo ou leia o token segue compilando. A correção lógica (guardas de rota, remoção de token, RLS) fica para a fase de segurança.
  - **Decisor**: Product Owner/Developer (via brief) + Designer (AD-03)
  - **Quando**: 2026-09-09T16:00:00-03:00 (reformulado em 2026-09-10, revisão do brief pós-`feedback.md`)
  - **Justificativa**: o brief define obrigatoriedade de tipos como entrega desta migração e correção lógica como fase posterior; a formulação original ("detecção em compile-time") prometia ao compilador algo que ele não faz.

## Itens referidos à codificação
> Lista somente itens com status `REFERIDO À CODIFICAÇÃO`. Aparecem destacados em `handoff.md`.

- AMB-006: interpolação de templates sem escape HTML (XSS) — não corrigir; alerta para o codificador + cenário de paridade PT-06.
- AMB-007: F-01 RBAC / F-02 token recebido por URL / F-03 IDOR — exigir `role`/`created_by_id`/params tipados nos contratos internos (não é detecção de vulnerabilidade); correção lógica em fase posterior (PT-10).

## Notas

- **0 itens PENDENTES** ao final do pipeline (conforme esperado).
- AMB-001…005 resolvidos na pausa humana do Curator (2026-09-09T15:24:37-03:00) pela via da **paridade exata**; uma tentativa de expandir escopo com mudanças comportamentais foi apresentada e **revertida pelo usuário** para paridade.
- AMB-006/007 são referidos à codificação e estarão destacados no `handoff.md` para o agente de codificação.
- **Revisão 2026-09-10** (pós-`_reversa_sdd/feedback.md`): AMB-007 reformulado para não prometer "detecção em compile-time"; a fonte canônica dos IDs F-* passou a ser `docs/security-audit/achados.json` (o brief apontava, incorretamente, para `gaps.md`/`code-analysis.md`). Nenhum status mudou: segue 0 PENDENTE, 5 resolvidos com decisão humana, 2 referidos à codificação.
- Nenhum item `auto-decidido` (modo interativo, sem `--auto`).

---
*Gerado pelo Reversa-Orchestrator em 2026-09-09.*

---

## Revisão 2026-09-22 — regeneração da Fase 2 do Screen Translator

> Contexto: `/reversa-migrate --regenerate=screen_translator:generation`. As **23 capturas douradas** do legado passaram a existir, encerrando a lacuna que as features forward `002` a `006` declaravam permanente ("a captura dourada de referência não existe no repositório"). Backup em `migration/.backup-20260922-122055/` e `screens/.backup-20260922-122055/`.

### RESOLVIDOS COM DECISÃO HUMANA (2026-09-22)

- **Política dos golden files** — as capturas formam conjunto heterogêneo (5 larguras, 15 alturas, 6 páginas inteiras, 1 montagem com rolagem) e as `normalizationRules` do manifest não normalizam viewport. Alternativa oferecida: recapturar as 16 telas em viewport padronizado. **Escolha**: aceitar o conjunto misto e declarar que a paridade é **construtiva/semântica**, não pixel a pixel. Registrado como `DEV-001`/`DEV-002` (aprovados). Consequência prática: **não há prova de pixel** para os 16 cenários, e produzi-la exigiria recaptura + harness de navegador (ver item referido à codificação abaixo).
- **Capturas extras** — as 6 imagens sem cenário V (Editar Paciente, Lista de Agendamentos, Detalhes do Agendamento, Editar Consulta, Editar Médico, Criar Template) **entram** no manifest como entradas marcadas, e não apenas no inventário interno.
- **Inspector** — decidido **invalidar**: `parity_specs.md` e `handoff.md` foram construídos sobre a versão de 2026-09-09 de `target_screens.md` (16 telas, 0 goldens) e ficam marcados como `stale` até serem refeitos.
- **Divergência de hash na abertura** — os três artefatos da Fase 2 tinham hash divergente do `.state.json`. Decisão: prosseguir com backup; os hashes registrados foram atualizados para os valores correntes.

### RESOLVIDO POR EVIDÊNCIA DE CÓDIGO — DEV-005 (aberto e fechado em 2026-09-22)

#### DEV-005 — Novo Agendamento sem campo de data/hora na captura
- **Descrição**: a captura `agendamentos-novo.png` (`PT-V05`, 2026-09-22 11:38) mostra o formulário com duas seções — "Paciente e Médico" (Paciente*, Médico*) e "Detalhes" (Tipo de Consulta, Observações) — e **nenhum campo de data ou horário**. A extração (`_reversa_sdd/agendamentos/screens.md`, versão de 2026-08-27) descreve um **widget de calendário interativo (date picker embutido)**; `target_screens.md` especificava uma `DateTimeSection` com esse widget (Q-03); e o cenário `PT-V05` pressupõe data/hora no formulário.
- **Detectado por**: screen-translator (regeneração da Fase 2)
- **Origem**: `agendamentos/screenshots/tela_novo_agendamento.png` × `src/pages/NewAppointment.jsx` × `_reversa_sdd/agendamentos/screens.md`
- **Status**: RESOLVIDO POR EVIDÊNCIA DE CÓDIGO (2026-09-22)
- **Opções para a decisão**:
  - **(a)** o campo não existe nesta revisão da tela e a data/hora é definida apenas por clique na grade do calendário → a spec está errada, o formulário do alvo não deve ter date picker, e `target_screens.md` + `PT-V05` precisam ser corrigidos;
  - **(b)** a captura cortou/omitiu a seção → a spec está certa e a captura deve ser refeita.
- **Evidência disponível**: nenhuma além das duas acima. O código legado (`NewAppointment.jsx`) é o árbitro, e não foi consultado nesta execução porque o orquestrador opera só no nível das specs.
- **Resolução (2026-09-22)**: o usuário pediu decisão por evidência, não por escolha entre hipóteses. A leitura read-only de `src/pages/NewAppointment.tsx` mostrou que a seção **"Data e Horário" existe e é condicional ao médico selecionado** (`:204`), contendo `Calendar` (`:215`) e `TimeSlotPicker` (`:225`, este só após a data ser escolhida). A captura foi feita com "Selecione o médico" em branco — estado inicial legítimo. **A extração estava correta**; a leitura do Visor ("sem campo de data/hora") valia apenas para aquele estado do formulário.
- **Implicação**: o objeto de verificação do `PT-V05` volta a ser definido — formulário **com** a seção condicional. Recomendada captura complementar do estado pós-seleção para o golden desta tela. **O gate do Inspector está liberado.**

### REFERIDOS À CODIFICAÇÃO (novos, desta revisão)

- **Harness de paridade visual**: os 16 cenários `PT-V01`…`PT-V16` agora têm golden, mas **executá-los** exige um harness de navegador. O projeto tem `vitest` + `jsdom` + testing-library e **não tem** Playwright, Puppeteer nem biblioteca de diff de imagem. Instalar e escrever esse harness é trabalho de **feature forward nova**, não de uma spec — e, para comparação pixel a pixel, exige antes a recaptura padronizada recusada em `DEV-001`.
- **Tokens das cores da legenda de status** (`DEV-006`): a captura mostra "Em Atendimento" verde e "Concluído" cinza-esverdeado. Se o `design-system` não tiver token para essas cores, o codificador deve abrir `DEV-008` em vez de improvisar literal solto.
- **Recapturas recomendadas** (não bloqueiam): `logs-acesso.png` (página inteira de 15029 px — `DEV-003`), `modal-detalhe-agendamento.png` (montagem com rolagem) e `templates-novo.png` (truncada antes dos toggles — `DEV-007`).

### Itens anteriores

Nenhum item das seções acima mudou de status: **AMB-001 a AMB-005** seguem resolvidos com decisão humana (paridade exata), **AMB-006** e **AMB-007** seguem referidos à codificação. A captura de 2026-09-22 **confirmou** por imagem duas dessas decisões: a Taxa de Atendimento `94%` (AMB-001) e a ausência de paginação nos Logs (AMB-004).

---
### Fechamento — Inspector reexecutado (2026-09-22)

- O gate de deviations foi consumido com **0 pendentes** (DEV-001 a DEV-007 aprovadas) e o **Inspector rodou** sobre a versão de 2026-09-22 de `target_screens.md`.
- Resultado: `parity_specs.md` regenerado (24 goldens, exceções propagadas, harness de paridade visual declarado como lacuna) e **26 arquivos `.feature`** — 10 de fluxo + 16 de tela, todos os 16 agora ancorados em golden capturado.
- Nenhuma pendência nova. O total continua **8 itens, 0 PENDENTES**. O item referido à codificação "harness de paridade visual" foi incorporado também a `parity_specs.md#Lacunas declaradas`, que é onde o codificador o encontra.

---
*Revisão registrada pelo Reversa-Orchestrator em 2026-09-22 (Fase 2 do Screen Translator regenerada; Inspector reexecutado).*
