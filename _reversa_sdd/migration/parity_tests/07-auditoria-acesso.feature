# language: pt
# spec-id: PT-007
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/logs-acesso.md; logs-acesso/requirements.md BR-L01/02/03
#   target_architecture: BC-06 logs-acesso (AccessLogger.tsx, AccessLogs.tsx)
#   target_domain_model: AGG-AccessLog (BR-MIGRAR-024/025/026)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Auditoria de acesso (append-only, eventos específicos)
  Como auditor
  Quero que cada acesso a dados sensíveis gere um log imutável
  Para garantir rastreabilidade LGPD

  @paridade @critico @regulatorio
  Cenário: Visualização de prontuário gera AccessLog
    Dado um usuário autenticado visualizando um paciente/consulta
    Quando o evento de visualização dispara
    Então um AccessLog é criado com user_email, action (ex: view_patient), entity_type, entity_id e patient_name
    E ip_address é gravado como "client-side" (não é IP real)

  @paridade @regulatorio
  Cenário: Log é append-only — usuário comum não edita nem exclui
    Dado um AccessLog existente
    Quando um usuário não-admin tenta editar ou excluir o registro
    Então a operação não é permitida
    E apenas admin consegue ler logs

  @paridade @critico
  Cenário: Dashboard gera log de acesso ao carregar
    Dado que o usuário acessa o Dashboard
    Quando a página monta
    Então é registrado um AccessLog com action de login/acesso e detalhe "Acesso ao dashboard"

  @paridade
  Cenário: Listagem de logs carrega até 500 registros sem paginação
    Dado um volume de AccessLogs
    Quando abro a tela de Logs de Acesso
    Então são carregados até 500 registros ordenados por -created_date
    E os filtrados são renderizados no cliente sem controles de paginação (paridade — AMB-004)
