# Fluxogramas — Módulo `logs-acesso`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Mermaid.js
>
> Fonte: `src/pages/AccessLogs.jsx`, `src/components/medical/AccessLogger.jsx`, `base44/entities/AccessLog.jsonc`

---

## 1. Fluxo Principal: Visualização de Logs de Auditoria

```mermaid
flowchart TD
    A[Usuário admin acessa /AccessLogs] --> B[useQuery access-logs]
    B --> C[AccessLog.list -created_date, 500]
    C --> D{isLoading?}
    D -->|Sim| E[5 rows skeleton]
    D -->|Não| F[Filtro triplo client-side]
    F --> G[matchesSearch user_email OU patient_name contém busca]
    G --> H[matchesAction actionFilter all ou igualdade exata]
    H --> I{matchesDate}
    I -->|all| J[passa]
    I -->|today| K[toDateString igual ao de hoje]
    I -->|week| L[date >= hoje - 7 dias]
    I -->|month| M[date >= hoje - 1 mês]
    J --> N[filteredLogs]
    K --> N
    L --> N
    M --> N
    N --> O[Tabela Data-Hora, Usuário, Ação badge+ícone, Paciente, Detalhes]
    O --> P{Ação conhecida em ACTION_CONFIG?}
    P -->|Sim| Q[label e cor do config]
    P -->|Não| R[fallback label cru + cinza + Eye]
```

---

## 2. Fluxo: Painel de Estatísticas

```mermaid
flowchart TD
    A[logs carregados 500 max] --> B[Total = logs.length]
    A --> C[Visualizações = filter action includes view]
    A --> D[Edições = filter includes edit OU includes create]
    A --> E[Exclusões = filter includes delete]
    B --> F[4 cards coloridos]
    C --> F
    D --> F
    E --> F
    note0[Heurística por substring: create_prescription conta como Edição; login logout upload export ficam fora de todas as categorias]
    D -.-> note0
```

---

## 3. Fluxo do Produtor: logAccess (transversal)

```mermaid
flowchart TD
    A[Ação do usuário em qualquer módulo] --> B[logAccess action, entityType, entityId, patientName, details]
    B --> C[try: base44.auth.me]
    C --> D[AccessLog.create user_email, action, entity_type, entity_id, patient_name, ip_address=client-side, user_agent=navigator.userAgent, details]
    D --> E[sucesso silencioso]
    C -->|erro| F[catch console.error Error logging access]
    F --> G[falha silenciosa - UX não é interrompida]
    note1[RLS: create null aberto a qualquer autenticado; read update delete apenas admin]
    D -.-> note1
```

---

## 4. Fluxo das Chamadas Registradas (quem produz logs)

```mermaid
flowchart LR
    subgraph Produtores de log
        DA[Dashboard mount] -->|LOGIN| LG[logAccess]
        PD[PatientDetail mount] -->|VIEW_PATIENT| LG
        PF[PatientForm save] -->|EDIT_PATIENT / CREATE_PATIENT| LG
        PDel[PatientDetail delete] -->|DELETE_RECORD| LG
        NC[NewConsultation save] -->|CREATE / EDIT_CONSULTATION| LG
        CO[Consultation view] -->|VIEW_CONSULTATION| LG
        PE[PrescriptionEditor save] -->|CREATE_PRESCRIPTION| LG
        EU[ExamUploader save] -->|UPLOAD_EXAM| LG
    end
    LG --> AL[(AccessLog Base44)]
    AL --> ACL[AccessLogs.jsx leitura admin-only]
```

---

## Lacunas Identificadas

1. **Teto rígido de 500 registros**: sem paginação — histórico antigo inacessível.
2. **Stats por substring**: `create_prescription` somado como "Edição"; login/logout/upload/export fora de todas as categorias.
3. **`export_data` nunca logado**: ícone Download decorativo na UI; nenhuma exportação implementada.
4. **`details` com tipo inconsistente**: schema declara string; o logger envia object ou null.
5. **IP fake**: `ip_address` sempre `'client-side'` — sem valor forense real.
6. **LOGIN a cada visita ao dashboard**: `Dashboard.useEffect` dispara log de login a cada mount, não em autenticação real.
7. **Sem rotação/limpeza**: crescimento ilimitado da coleção (sem política de retenção visível).
