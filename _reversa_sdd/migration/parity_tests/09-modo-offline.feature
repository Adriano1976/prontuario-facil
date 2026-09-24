# language: pt
# spec-id: PT-009
# rastreabilidade:
#   process_flows: _reversa_sdd/modo-offline/requirements.md BR-OFF01…12; _reversa_sdd/questions.md Q-13…Q-16
#   target_architecture: BC-08 modo offline (mockClient.ts, mockSeed.ts)
#   target_domain_model: BR-MIGRAR-037…045; User.ts variante offline
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Modo offline (VITE_OFFLINE=true) com paridade de contrato
  Como desenvolvedor/QA
  Quero rodar a SPA sem Base44 com dados locais
  Para demonstrar e testar sem credenciais ou rede

  # ---------------------------------------------------------------------------
  # VEREDITO DE PROVA — convergência de 2026-09-24 (feature 010-prova-modo-offline)
  #
  # Os seis cenários abaixo foram convertidos em verificação de execução em
  # src/api/__tests__/mockClientOffline.test.ts e src/api/__tests__/offlineActivation.test.ts
  # — DOIS arquivos, porque a promessa não vive numa tela: uma metade se mede exercitando o
  # adaptador e a outra no carregamento do módulo. Os vereditos por cenário vivem em
  # _reversa_sdd/code-spec-matrix.md#Cenários de paridade do grupo 09, e o registro completo
  # em _reversa_sdd/addenda/010-prova-modo-offline.md.
  #
  #   PT-009.1  PROVADO nas duas metades, com a RESSALVA de que a negativa afirma a CHAMADA da
  #                          fábrica do provedor, e não o funcionamento do provedor real
  #   PT-009.2  PROVADO      sessão imediata como usuário de demonstração, sem consultar o servidor
  #   PT-009.3  PROVADO      semeadura na primeira leitura e persistência das três operações
  #   PT-009.4  PROVADO      o mock NÃO aplica RLS — comportamento INTENCIONAL (BR-MIGRAR-044)
  #   PT-009.5  PROVADO COM ACHADO — a criação aceita identificador do chamador, que SOBREPÕE o
  #                          gerado; a redação de BR-OFF06 é mais forte do que o código
  #   PT-009.6  PROVADO      filtro por igualdade estrita e ordenação de um campo
  # ---------------------------------------------------------------------------

  @paridade @critico
  Cenário: Ativação exclusiva por env var em build
    Dado VITE_OFFLINE=true no build
    Quando a SPA inicializa
    Então o cliente exportado é o mock (createMockClient), não o SDK Base44
    E com VITE_OFFLINE ausente/false o comportamento volta ao SDK real

  @paridade @critico
  Cenário: Autenticação imediata como OFFLINE_USER
    Dado VITE_OFFLINE=true
    Quando o AuthContext inicializa
    Então o usuário autenticado é OFFLINE_USER (id demo-user-001, email demo@medrecord.local, full_name "Dra. Demo")
    E o tipo de usuário em offline é uma variante SEM role/created_by_id (não compila onde role é exigido)

  @paridade @critico
  Cenário: Persistência local com seed na primeira leitura
    Dado localStorage sem a chave mock_db_Patient
    Quando o mock lista Patient
    Então a coleção é semeada a partir de mockSeed sob mock_db_Patient
    E criar/editar/excluir persiste e reflete na próxima leitura

  @paridade @critico
  Cenário: Mock não aplica RLS (comportamento intencional)
    Dado VITE_OFFLINE=true
    Quando opero CRUD de qualquer entidade
    Então todos os registros são visíveis/editáveis (sem RLS — BR-MIGRAR-044)
    E o comportamento é explícito no contrato tipado (variante offline documentada)

  @paridade
  Cenário: create popula id/created_date e update preserva id com merge
    Dado o mock ativo
    Quando crio um registro sem id
    Então id (uuid) e created_date (ISO agora) são populados
    E update(id) preserva o id original e faz merge superficial
    E update de id inexistente rejeita com erro "Not found"

  @paridade
  Cenário: filter usa comparação estrita e sort de 1 campo
    Dado o mock ativo
    Quando filtro com condição de operador avançado (in/gte/lte)
    Então o comportamento permanece o do legado (sem suporte — somente ===), tipado como operadores indisponíveis
    E sort aceita apenas 1 campo ("field" asc ou "-field" desc)

# ---
# Gerado pelo Reversa-Inspector em 2026-09-09.
