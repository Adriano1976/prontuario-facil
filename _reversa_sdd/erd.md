# Modelo de Dados (ERD) — prontuario-facil

Este diagrama representa as entidades e seus relacionamentos conforme definido nos arquivos `.jsonc` e na lógica de componentes.

```mermaid
erDiagram
    Patient ||--o{ Appointment : "tem"
    Patient ||--o{ Consultation : "possui histórico"
    Doctor ||--o{ Appointment : "atende"
    
    Appointment |o--o| Consultation : "gera"
    
    Consultation ||--o{ Prescription : "emite"
    Consultation ||--o{ Exam : "solicita"
    
    Template ||--o{ Prescription : "baseia"
    
    Patient {
        string id PK
        string full_name
        string cpf
        string status "ativo | inativo"
    }
    
    Appointment {
        string id PK
        string patient_id FK
        string doctor_id FK
        string consultation_id FK
        datetime date
        string status "agendado | confirmado | concluido..."
    }
    
    Consultation {
        string id PK
        string patient_id FK
        string diagnosis
        string status "agendada | concluida..."
    }
    
    Prescription {
        string id PK
        string consultation_id FK
        string type "receita | atestado..."
    }
```

## Relacionamentos Críticos 🟢

1. **Patient -> Appointment/Consultation**: Relacionamento forte. Exclusão de paciente requer tratamento de registros órfãos.
2. **Appointment <-> Consultation**: Link 1:1 opcional. Nem todo agendamento gera consulta (ex: cancelados), mas toda consulta deveria estar ligada a um agendamento.
3. **Template -> Prescription**: Relacionamento fraco (apenas cópia de conteúdo). Mudar um template não afeta prescrições já emitidas.

---
*Gerado pelo Reversa-Architect em 2026-08-31.*
