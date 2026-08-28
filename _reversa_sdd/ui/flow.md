# Fluxo de Navegação — MedRecord

Fluxo principal identificado a partir das interfaces.

```mermaid
graph TD
    Dashboard[Dashboard Principal] -->|Botão Novo Paciente| NovoPaciente[Cadastro de Novo Paciente]
    Dashboard -->|Link Ver Todos / Menu| ListaPacientes[Listagem de Pacientes]
    Dashboard -->|Atalho / Menu| Agenda[Calendário de Agendamentos]
    Dashboard -->|Atalho / Menu| ListaConsultas[Listagem de Consultas]
    Dashboard -->|Atalho / Menu| ListaMedicos[Gerenciamento de Médicos]
    Dashboard -->|Atalho / Menu| ListaTemplates[Central de Templates]
    Dashboard -->|Menu Superior| LogsAcesso[Logs de Acesso]
    
    Menu[Menu Superior] --> Dashboard
    Menu --> ListaPacientes
    Menu --> Agenda
    Menu --> ListaConsultas
    Menu --> ListaMedicos
    Menu --> ListaTemplates
    Menu --> LogsAcesso
    
    ListaPacientes -->|Botão Novo Paciente| NovoPaciente
    ListaPacientes -->|Clique na Linha| DetalhePaciente[Detalhe do Paciente]
    
    NovoPaciente -->|Cancelar/Salvar| ListaPacientes
    NovoPaciente -->|Voltar| Dashboard
    
    Agenda -->|Botão Novo Agendamento| NovoAgendamento[Novo Agendamento]
    Agenda -->|Clique no Slot de Horário| NovoAgendamento
    
    NovoAgendamento -->|Cancelar/Confirmar| Agenda
    
    ListaConsultas -->|Botão Nova Consulta| NovoAtendimento[Novo Atendimento (Anamnese)]
    ListaConsultas -->|Clique na Linha| VerConsulta[Visualização de Consulta]
    
    NovoAtendimento -->|Salvar Consulta| VerConsulta
    
    VerConsulta -->|Botão Novo Documento / Receita| ModalDocumento[Modal: Novo Documento]
    VerConsulta -->|Botão Exame| ModalExame[Modal: Upload de Exame]
    VerConsulta -->|Botão Editar| NovoAtendimento
    
    ListaMedicos -->|Botão Novo Médico| ModalMedico[Modal: Novo Médico]
    ListaMedicos -->|Botão Editar| ModalMedico
    
    ListaTemplates -->|Botão Novo Template| ModalTemplate[Modal: Criar/Editar Template]
    ListaTemplates -->|Botão Editar| ModalTemplate
```

---
*Gerado pelo Reversa-Visor em 2026-08-27.*
