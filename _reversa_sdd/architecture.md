# Arquitetura do Sistema — prontuario-facil

## 1. Diagrama de Contexto (C4 Level 1)

O sistema simplifica a gestão de uma clínica médica, permitindo que Médicos e Admins gerenciem o ciclo de vida do paciente.

```mermaid
C4Context
    title Diagrama de Contexto - Prontuário Fácil
    Person(p, "Profissional de Saúde", "Médico, Enfermeiro ou Admin")
    System(pf, "Prontuário Fácil", "Gestão de prontuários, agendas e documentos médicos.")
    System_Ext(mail, "Serviço de E-mail", "Envio de confirmações de agendamento.")

    Rel(p, pf, "Gerencia pacientes, agenda consultas e emite documentos")
    Rel(pf, mail, "Envia lembretes via", "SMTP/API")
```

## 2. Diagrama de Containers (C4 Level 2)

```mermaid
C4Container
    title Diagrama de Containers
    Person(user, "Usuário", "Médico ou Admin")
    Container(spa, "Single Page Application", "React, Tailwind, Lucide", "Interface do usuário e lógica de negócio client-side")
    ContainerDb(db, "Repositório de Dados", "Base44 / LocalStorage / Cloud", "Armazena Entidades (Pacientes, Consultas, etc)")

    Rel(user, spa, "Usa via navegador")
    Rel(spa, db, "Lê/Escreve dados via SDK Base44", "JSON over HTTPS/Local")
```

> **Variante de deployment (adicionada em 2026-08-28):** quando `VITE_OFFLINE=true`, o container `spa` substitui o uso do SDK Base44 por um mock client (`src/api/mockClient.js`) que persiste no `localStorage` do navegador. Mesmo container, mesma UI, repositório de dados diferente. Não há mudanças nos contratos consumidos pelas pages.

## 3. Fluxo de Dados Principal

1. **Agendamento**: Médico seleciona Paciente (Ativo) e Médico → Cria `Appointment`.
2. **Atendimento**: No horário, Médico muda `Appointment` para `em_atendimento` → Cria `Consultation`.
3. **Documentação**: Durante a `Consultation`, Médico usa `Templates` → Cria `Prescription` / `Exam`.
4. **Finalização**: Médico marca `Consultation` como `concluida` → `Appointment` atualizado para `concluido`.
