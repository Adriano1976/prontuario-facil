# Especificação SDD — Módulo Modo Offline (Mock Local)

> Unit **transversal** ativada por env var `VITE_OFFLINE=true`. Não é uma feature de domínio; é uma alternativa de **deployment / runtime** que substitui o backend Base44 por um mock client persistido em `localStorage`.

## 1. Visão Geral

O modo offline permite rodar a SPA **sem** o backend Base44, com todos os dados residindo no `localStorage` do navegador. O comportamento da UI é equivalente ao modo online — as pages continuam chamando `base44.entities.<X>.<op>()` e não sabem se estão falando com o SDK real ou com o mock.

**Caso de uso primário:** permitir que o desenvolvedor (ou um avaliador/stakeholder) rode a aplicação localmente sem configurar credenciais Base44 e sem depender de rede, tendo à disposição um conjunto razoável de dados de demonstração.

**Caso de uso secundário (potencial):** ambiente isolado para QA, demos offline, ou prototipagem de UI.

## 2. Regras de Negócio (BRs)

- **BR-OFF01**: O modo offline é ativado **exclusivamente** pela env var `VITE_OFFLINE=true` em tempo de **build** (Vite injeta `import.meta.env`). Não há toggle em runtime. 🟢
- **BR-OFF02**: Quando ativo, o módulo exportado por `src/api/base44Client.js` (`base44`) é o retorno de `createMockClient()`, e **não** o `createClient()` do SDK Base44. 🟢
- **BR-OFF03**: Quando ativo, o `AuthContext` não chama `base44.auth.me()` — autentica imediatamente como `OFFLINE_USER` (`id: 'demo-user-001'`, `email: 'demo@medrecord.local'`, `full_name: 'Dra. Demo'`). 🟢
- **BR-OFF04**: Cada entidade do mock tem sua própria coleção em `localStorage` sob a chave `mock_db_<EntityName>`. Na primeira leitura, se a chave não existir ou estiver corrompida, é semeada a partir de `mockSeed`. 🟢
- **BR-OFF05**: Operações expostas pelo mock: `list(sort?, limit?)`, `filter(conds, sort?, limit?)`, `create(data)`, `update(id, data)`, `delete(id)` por entidade, mais `integrations.Core.UploadFile({ file })`, `auth.me/logout/redirectToLogin`, `appLogs.logUserInApp`. 🟢
- **BR-OFF06**: `create(data)` sempre popula `id` (uuid), `created_date` (ISO agora) e, se ausente, `date` (ISO agora). 🟢
- **BR-OFF07**: `update(id, data)` mantém o `id` original e faz merge superficial. Rejeita com `Error('Not found: <entity> <id>')` se o registro não existir. 🟢
- **BR-OFF08**: `filter(conds)` usa comparação estrita (`===`) por chave/valor — **sem** suporte a `in`, `contains`, `gte`, `lte`, `ne`. 🟢
- **BR-OFF09**: `sort` aceita string única no formato `field` (asc) ou `-field` (desc). Suporta apenas 1 campo, sem tie-breaker determinístico além da ordem original. 🟢
- **BR-OFF10**: O modo offline **não aplica RLS** — todos os registros de todas as entidades são visíveis e editáveis. 🟡
- **BR-OFF11**: `auth.logout()` e `auth.redirectToLogin()` são no-op em offline. O usuário permanece "logado" porque a sessão é local e não há servidor para invalidar. 🟢
- **BR-OFF12**: `appLogs.logUserInApp()` é no-op. 🟢

## 3. Estrutura de Dados

### 3.1 Persistência

| Aspecto | Valor |
|---------|-------|
| Storage | `window.localStorage` |
| Prefixo de chave | `mock_db_` |
| Encoding | JSON |
| Tamanho máximo | 5–10 MB por origem (limite do navegador) |
| TTL | Nenhum |
| Limpeza | Manual via DevTools ou `localStorage.clear()` |

### 3.2 Contrato `entities.<X>` (Proxy dinâmico)

`entities` é um `Proxy({}, { get: (_, name) => makeRepo(String(name)) })` — qualquer nome de entidade solicitado devolve um repo fresco, sem registry estático. Isso significa:

- Acessar `base44.entities.QualquerCoisa` em offline **não lança** — retorna um repo funcional que começa vazio (sem seed).
- Entidades sem seed definido em `mockSeed` simplesmente retornam `[]` na primeira listagem.

### 3.3 Schema das entidades seed

Ver `data-dictionary.md` → "Apêndice A — Seed do Modo Offline". Resumo:

| Entidade | Registros | Campos notáveis |
|----------|-----------|-----------------|
| `Doctor` | 3 | `full_name`, `crm`, `specialty`, `is_active` |
| `Patient` | 5 | `full_name`, `cpf`, `birth_date`, `gender`, `phone`, `email`, `status` |
| `Appointment` | 4 | `patient_id`, `doctor_id`, `date`, `status`, `notes` |
| `Consultation` | 2 | `patient_id`, `doctor_id`, `appointment_id?`, `date`, `chief_complaint`, `anamnesis`, `diagnosis` |
| `Prescription` | 2 | `consultation_id`, `patient_id`, `medication`, `dosage`, `frequency`, `instructions` |
| `Exam` | 1 | `patient_id`, `consultation_id`, `name`, `type`, `date`, `file_url`, `file_type`, `laboratory`, `results_summary`, `notes` |
| `Template` | 2 | `name`, `type`, `content`, `is_active` |
| `AccessLog` | 1 | `user_email`, `action`, `entity_type`, `entity_id`, `patient_name`, `ip_address: 'client-side'`, `user_agent`, `details` |

### 3.4 Usuário offline

```js
OFFLINE_USER = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
}
```

**Não contém:** `role`, `created_by_id`, `permissions`, `tenant_id` ou qualquer campo de papel.

## 4. Permissões e Segurança (RLS)

| Operação | Modo Online | Modo Offline |
|----------|-------------|--------------|
| Create | Own (por `created_by_id`) | Sem restrição |
| Read | Own OR Admin | Sem restrição |
| Update | Own OR Admin | Sem restrição |
| Delete | Own OR Admin | Sem restrição |
| Logs (AccessLog) | System → Admin (read) | Sem restrição, todas as escritas virão de `demo@medrecord.local` |

⚠️ **Atenção LGPD:** os dados seed incluem CPF, data de nascimento e email de pacientes fictícios. Em ambiente compartilhado, esses dados ficam expostos a qualquer pessoa que abrir o navegador no perfil usado. Ver Q-14 (questions.md).

## 5. Configuração

| Arquivo | Mudança |
|---------|---------|
| `.env.local` (do dev offline) | Acrescentar `VITE_OFFLINE=true` |
| `.env.example` | Documentar a env var |
| `vite.config.js` | Sem mudança — `import.meta.env.VITE_OFFLINE` já é injetado por padrão |

**Não há configuração runtime** — o valor é congelado no bundle em `npm run build`. Para alternar online↔offline, é preciso rebuild + restart do dev server.

## 6. Escopo de não-objetivos

- **NÃO** cobre persistência em IndexedDB, SQLite, ou service workers. Apenas `localStorage`.
- **NÃO** cobre sincronização offline→online. O que é criado em offline fica isolado.
- **NÃO** cobre múltiplos usuários simultâneos no mesmo navegador — toda sessão vê `demo@medrecord.local`.
- **NÃO** cobre upload de arquivos persistido. `Core.UploadFile` retorna Data URL em memória (perdido no reload).
- **NÃO** cobre queries avançadas (apenas `===` em `filter`, apenas 1 campo em `sort`).
- **NÃO** cobre `entities.<X>.get(id)` direto — callers devem usar `filter({ id }, ...)` ou iterar a lista.
- **NÃO** cobre `integrations.Core.SendEmail`, `InvokeLLM`, ou qualquer integração além de `UploadFile`.

## 7. Pontos de Atenção

| # | Item | Severidade |
|---|------|-----------|
| P1 | Dados seed fictícios em `localStorage` — recomenda-se aviso visual em dispositivo compartilhado (Q-14) | Média 🟡 |
| P2 | Ausência de RLS no mock — qualquer página que assume restrição pode apresentar comportamento divergente (Q-16) | Média |
| P3 | Cobertura parcial de operações SDK — pages que usam `get`, `count`, `bulk*` ou filtros avançados quebram silenciosamente (Q-15) | Média |
| P4 | Sem migração de dados entre releases — se `mockSeed` mudar de formato, dados antigos podem corromper | Baixa |
| P5 | Toggle compile-time — debug mais lento (precisa rebuild) | Baixa |

## 8. Critérios de Aceite

- [ ] Setar `VITE_OFFLINE=true` em `.env.local` e rodar `npm run dev` abre a aplicação sem erros no console.
- [ ] A tela de login não aparece — o usuário entra direto como `Dra. Demo`.
- [ ] O Dashboard carrega com os 5 pacientes e 4 agendamentos do seed.
- [ ] Criar, editar e excluir pacientes reflete na próxima leitura (persistência local).
- [ ] Limpar o `localStorage` e recarregar restaura os dados do seed.
- [ ] Setar `VITE_OFFLINE=false` (ou ausente) volta ao comportamento online (requer credenciais Base44 válidas).

---
*Gerado pelo Reversa-Writer em 2026-08-28.*
