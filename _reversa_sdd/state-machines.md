# Máquinas de Estado — prontuario-facil

## 1. Status de Agendamento (Appointment)

O fluxo de vida de um agendamento é o mais complexo do sistema, envolvendo confirmação e presença.

```mermaid
stateDiagram-v2
    [*] --> agendado
    agendado --> confirmado: confirmar presença
    confirmado --> em_atendimento: iniciar consulta
    em_atendimento --> concluido: finalizar consulta
    
    agendado --> cancelado: cancelar
    confirmado --> cancelado: cancelar
    em_atendimento --> cancelado: cancelar
    
    agendado --> faltou: não compareceu
    confirmado --> faltou: não compareceu
    
    concluido --> [*]
    cancelado --> [*]
    faltou --> [*]
```

## 2. Status de Consulta (Consultation)

Diferente do agendamento, a consulta foca no progresso do preenchimento clínico.

```mermaid
stateDiagram-v2
    [*] --> agendada: criada via agenda
    [*] --> em_andamento: criação direta
    agendada --> em_andamento: abrir prontuário
    em_andamento --> concluida: assinar/salvar
    em_andamento --> cancelada: descartar
    concluida --> [*]
    cancelada --> [*]
```

## 3. Status de Paciente

```mermaid
stateDiagram-v2
    [*] --> ativo
    ativo --> inativo: desativar (ex: óbito, transferência)
    inativo --> ativo: reativar
```

## 4. Matriz de Transições (Inferida) 🟡

| De | Para | Gatilho | Validação |
| :--- | :--- | :--- | :--- |
| `agendado` | `confirmado` | Clique no Botão "Confirmar" | Nenhuma |
| `qualquer` | `cancelado` | Clique no Botão "Cancelar" | Exige confirmação de diálogo |
| `em_atendimento` | `concluido` | Mudança manual no Select | Nenhuma |
