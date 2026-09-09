# language: pt
# spec-id: PT-006
# rastreabilidade:
#   process_flows: _reversa_sdd/flowcharts/consultas.md; consultas/design.md §2; templates/requirements.md BR-T04
#   target_architecture: BC-02 consultas / BC-05 templates (PrescriptionEditor.tsx)
#   target_domain_model: AGG-Consulta / AGG-Template (BR-MIGRAR-008/009/019/021/022)
#   paradigma_alvo: funcional/declarativo — sem mudança (paradigm_decision.md)

Funcionalidade: Emissão de documento com template e medicamentos
  Como médico
  Quero emitir receitas, atestados e solicitações com conteúdo baseado em template
  Para gerar documentos clínicos rapidamente e de forma padronizada

  @paridade @critico
  Cenário: Medicamentos só aparecem em documentos do tipo receita
    Dado o modal "Novo Documento" aberto em uma consulta
    Quando seleciono um tipo de documento que inclui "receita"
    Então a seção de Medicamentos é exibida (com itens Nome, Dosagem, Frequência, Duração, Instruções)
    Quando seleciono um tipo de documento que não é receita (ex: atestado)
    Então a seção de Medicamentos é completamente ocultada

  @paridade @critico
  Cenário: Template é filtrado pelo tipo do documento
    Dado um template do tipo "atestado" e um do tipo "receita_simples"
    Quando crio um documento do tipo receita
    Então o dropdown de templates não oferece o template de atestado

  @paridade @critico
  Cenário: Variáveis de template são interpoladas no save
    Dado um template com conteúdo contendo {PACIENTE_NOME} e {DATA}
    Quando salvo o documento com paciente vinculado
    Então o conteúdo persistido tem {PACIENTE_NOME} e {DATA} substituídos pelos valores reais
    E o texto substituído permanece sem escape HTML (paridade — AMB-006 não corrigido nesta migração)

  @paridade
  Cenário: Template inativo não é oferecido
    Dado um template com is_active = false
    Quando abro o seletor de template na emissão de documento
    Então o template inativo não aparece na lista
