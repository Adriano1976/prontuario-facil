# Fluxogramas — Módulo `templates`

> Gerado pelo Archaeologist em 2026-08-26 | Nível: **completo** | Mermaid.js
>
> Fonte: `src/pages/Templates.jsx`, `base44/entities/Template.jsonc`

---

## 1. Fluxo Principal: Listagem Agrupada por Tipo

```mermaid
flowchart TD
    A[Usuário acessa /Templates] --> B[useQuery templates -created_date]
    B --> C{isLoading?}
    C -->|Sim| D[Skeleton de 3 cards]
    C -->|Não| E{templates.length > 0?}
    E -->|Não| F[Estado vazio + CTA Criar Primeiro Template]
    E -->|Sim| G[groupedTemplates reduce agrupa por type]
    G --> H[Loop TEMPLATE_TYPES ordem fixa dos 7 tipos]
    H --> I{typeTemplates vazio?}
    I -->|Sim| J[return null - tipo oculto]
    I -->|Não| K[Seção h2 com label do tipo]
    K --> L[Grid md:2 colunas de cards]
    L --> M[Card: nome + preview 150 chars]
    M --> N{is_default?}
    N -->|Sim| O[Badge violeta Padrão]
    N -->|Não| P[sem badge]
    O --> Q{is_active false?}
    P --> Q
    Q -->|Sim| R[Badge outline Inativo]
    Q -->|Não| S[sem badge]
    R --> T[Botões Editar e Excluir]
    S --> T
```

---

## 2. Fluxo: Criação de Template

```mermaid
flowchart TD
    A[Botão Novo Template] --> B[resetForm + setEditingTemplate null]
    B --> C[setShowEditor true]
    C --> D[Dialog: form com defaults receita_simples ativo não-padrão]
    D --> E[Usuário preenche nome required]
    E --> F[Seleciona tipo entre 7 opções]
    F --> G[Clica variável disponível - Tooltip mostra descrição]
    G --> H[insertVariable concatena ao FINAL do content]
    H --> I[Digita conteúdo no Textarea mono required]
    I --> J[Ajusta switches is_default e is_active]
    J --> K[Submit handleSubmit preventDefault]
    K --> L[saveMutation.mutate formData]
    L --> M{editingTemplate?}
    M -->|não| N[Template.create data]
    N --> O[onSuccess: invalidate templates + fechar dialog + resetForm]
```

---

## 3. Fluxo: Edição de Template

```mermaid
flowchart TD
    A[Botão Editar no card] --> B[handleEdit template]
    B --> C[setEditingTemplate template]
    C --> D[setFormData name type content is_default ou false is_active !== false]
    D --> E[setShowEditor true]
    E --> F[Dialog título: Editar Template]
    F --> G[Campos pré-preenchidos]
    G --> H[Submit → saveMutation detecta editingTemplate]
    H --> I[Template.update id, data]
    I --> J[onSuccess: invalidate + fechar + reset]
```

---

## 4. Fluxo: Exclusão com Confirmação

```mermaid
flowchart TD
    A[Botão Trash2 no card] --> B[handleDelete template]
    B --> C[setTemplateToDelete template]
    C --> D[setShowDeleteDialog true]
    D --> E[AlertDialog: Excluir template? ação irreversível]
    E --> F{Usuário confirma?}
    F -->|Cancelar| G[Fecha dialog sem alteração]
    F -->|Excluir| H[deleteMutation.mutate templateToDelete.id]
    H --> I[Template.delete id]
    I --> J[onSuccess: invalidate templates + fechar dialog]
```

---

## 5. Máquina de Estados do Template

```mermaid
stateDiagram-v2
    [*] --> AtivoNaoPadrao: create (default)
    AtivoNaoPadrao --> AtivoPadrao: Switch is_default on
    AtivoPadrao --> AtivoNaoPadrao: Switch is_default off
    AtivoNaoPadrao --> InativoNaoPadrao: Switch is_active off
    AtivoPadrao --> InativoPadrao: Switch is_active off
    InativoNaoPadrao --> AtivoNaoPadrao: Switch is_active on
    InativoPadrao --> AtivoPadrao: Switch is_active on
    AtivoNaoPadrao --> [*]: delete confirmado
    AtivoPadrao --> [*]: delete confirmado
    InativoNaoPadrao --> [*]: delete confirmado
    note right of InativoPadrao
        Template inativo NÃO aparece
        no PrescriptionEditor
        (filtro is_active=true lá)
    end note
    note right of AtivoPadrao
        Múltiplos padrões do mesmo tipo
        são possíveis — sem exclusividade
    end note
```

---

## Lacunas Identificadas

1. **`insertVariable` ignora cursor**: variável sempre concatenada ao final do Textarea.
2. **`variables` órfão**: campo existe no schema, nunca populado pela UI.
3. **`{DIAS_AFASTAMENTO}` sem substituidor**: anunciada na UI, mas o PrescriptionEditor só substitui as outras 4 variáveis.
4. **Múltiplos padrões possíveis**: nada impede dois templates `is_default` do mesmo tipo.
5. **Preview enganoso**: `substring(0,150)` + `"..."` aplicado mesmo a conteúdos curtos.
6. **RLS create admin-only sem feedback**: usuário comum recebe erro cru do Base44 ao tentar criar.
