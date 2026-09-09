# language: pt
# spec-id: PT-010
# rastreabilidade:
#   process_flows: _reversa_sdd/code-analysis.md (acesso a dados); _reversa_sdd/database/business-rules.md
#   target_architecture: src/api (contrato Base44Client); src/types/*.ts
#   target_domain_model: BR-MIGRAR-034/036/038; AD-02 target_architecture.md
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Contrato Base44Client e isolamento por created_by_id/RBAC
  Como desenvolvedor do sistema novo
  Quero que SDK real e mock satisfaçam o mesmo contrato tipado
  Para garantir que offline e online nunca divergem silenciosamente e que escopo/RBAC sejam exigidos por tipos

  @paridade @critico @regulatorio
  Cenário: Acesso a dados exige escopo de ownership
    Dado a interface Base44Client com assinaturas tipadas
    Quando uma query de leitura de Patient/Consultation/Appointment é definida
    Então o tipo exige o escopo do usuário atual (created_by_id) OU a condição admin
    E código que esquece o filtro de ownership não compila (F-03 IDOR detectável em compile-time)

  @paridade @critico
  Cenário: Role de usuário é explícita no tipo
    Dado o tipo User com campo role
    Quando um componente exige operação restrita a admin (CRUD Doctor/Template)
    Então o código precisa tratar explicitamente role === "admin"
    E a variante offline sem role impede uso cego de permissões (F-01 detectável em compile-time)

  @paridade @critico
  Cenário: SDK e mock implementam a mesma interface
    Dado o contrato Base44Client declarado
    Quando sdkClient.ts (SDK real) e mockClient.ts (offline) são compilados
    Então ambos implementam integralmente a interface (tsc sem erro)
    E operações do mock têm os mesmos tipos de retorno que o SDK

  @paridade
  Cenário: Enums de status/tipo não aceitam valores fora do conjunto
    Dado os tipos de status (Appointment/Consultation) e tipos documentais como unions
    Quando o código atribui um valor fora do union
    Então a compilação falha (paridade de contrato de domínio)
