# Legacy Impact: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Estado da política de edição do legado na execução: `allowLegacyEdits: true`,
> `allowedPaths: ["src/**", "package.json", "tsconfig.json", "docs/**"]`

> Nota: este arquivo não existia nas rodadas anteriores (T001–T023) e foi gerado
> na rodada que fechou T024/T039/T040/T041, cobrindo retroativamente o impacto
> acumulado da feature até aqui.

## 1. Arquivo afetado | Componente | Tipo | Severidade | Justificativa

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|-----------|------|------------|---------------|
| `src/types/*.ts` (12 arquivos) | Camada de tipos | `componente-novo` | LOW | Espelhos dos schemas do BaaS; sem runtime |
| `src/api/contract.ts`, `scopedRead.ts`, `registry.ts`, `sessionScope.ts`, `entities.ts`, `base44Client.ts`, `mockClient.ts` | Camada de acesso a dados | `componente-novo` / `delta-de-contrato-externo` | LOW | Contrato único; os dois adaptadores (SDK e mock) passam a ser ligados pelo mesmo ponto |
| `src/api/registry.ts` + `src/types/User.ts` | Registro fechado de entidades | `delta-de-contrato-externo` | LOW | Entidade embutida `User` do BaaS acrescentada ao registro (o legado a usava na exclusão de conta) |
| `src/components/medical/*` (9) e `src/components/appointments/*` (2) | Componentes clínicos e de agendamento | `componente-novo` | LOW | Versões `.tsx`/`.ts` criadas; os `.jsx` gêmeos permanecem até as telas consumidoras converterem |
| `src/pages/Patients.tsx`, `PatientForm.tsx`, `PatientDetail.tsx` | Telas de paciente | `componente-novo` | LOW | Conversão com leituras escopadas; `.jsx` removidos após conferência de versionamento |
| `src/pages/Consultations.tsx`, `Consultation.tsx`, `NewConsultation.tsx` | Telas de consulta | `componente-novo` | LOW | Conversão com leituras escopadas; `.jsx` removidos após conferência de versionamento |
| `src/pages/Appointments.tsx`, `NewAppointment.tsx` | Telas de agendamento | `componente-novo` | LOW | Conversão com leituras escopadas; `.jsx` removidos após conferência de versionamento |
| `src/pages/Doctors.tsx` | Tela de médicos | `componente-novo` | LOW | Conversão com leitura livre (BR-MIGRAR-017); `.jsx` removido após conferência de versionamento |
| `src/pages/Templates.tsx` | Tela de templates | `componente-novo` | LOW | Conversão com leitura livre (BR-MIGRAR-020); `.jsx` removido após conferência de versionamento |
| `src/pages/AccessLogs.tsx` | Trilha de auditoria | `componente-novo` | LOW | Conversão com leitura sem escopo declarado (restrição por admin imposta pela RLS do servidor); `.jsx` removido após conferência de versionamento |
| `src/pages/Dashboard.tsx`, `src/pages.config.ts`, `src/components/UserNotRegisteredError.tsx` | Painel e estrutura | `componente-novo` | LOW | Conversão com leituras escopadas; `.jsx` removidos após conferência de versionamento |
| `src/components/medical/*.jsx` (9) e `src/components/appointments/*.jsx` (2) | Componentes convertidos | `componente-extinto` | LOW | Os `.jsx` gêmeos ficaram órfãos quando a última tela converteu e foram removidos — as versões `.tsx`/`.ts` passam a ser as resolvidas em runtime |
| `src/api/contract.ts`, `entities.ts`, `base44Client.ts`, `mockClient.ts` | Contrato de integrações | `delta-de-contrato-externo` | LOW | `SendEmail` incorporado ao contrato (o legado o usava no agendamento; estava fora do escopo original e regrediu em T037) |
| `src/pages/Patients.tsx`, `PatientForm.tsx` | Leitura de pacientes | `regra-alterada` | LOW | Escopo de leitura passa a ser resolvido pelo papel da sessão (`resolveScope`) — espelha a RLS do servidor |
| `src/api/mockSeed.ts` | Dados de exemplo do modo offline | `delta-de-dados` | MEDIUM | Conteúdo dos dados de demonstração alinhado ao contrato; medicamentos passam a aparecer na tela de documento offline (mudança visível esperada, registrada em `data-delta.md` §4) |
| `src/App.tsx`, `src/Layout.tsx`, `src/lib/*`, `src/hooks/*`, `src/pages.config.ts` | Estrutura e auxiliares | `componente-novo` | LOW | Conversão preservando comportamento; import do Layout corrigido |
| `src/api/mockClient.ts` | Adaptador offline | `regra-alterada` | LOW | `create` passa a preencher `created_by_id` (usuário da sessão offline), espelhando o servidor. Sem isso, todo registro criado no modo offline ficava **invisível** para as leituras com escopo — defeito DIV-01, encontrado no fumaça da T044. Não afeta o modo online |

## 2. Diff conceitual por componente

**Camada de tipos (nova).** Nenhum código de runtime existia para esses arquivos; o
que mudou é que os contratos de dados passam a existir como artefato compilado:
os 8 schemas do BaaS, os enums fechados e o tipo condicional de LGPD.

**Camada de dados (nova, substituindo acesso direto ao SDK).** O legado importava o
cliente do SDK e usava `entities.<Nome>.list/filter` sem declaração de escopo. Agora
o único ponto de acesso é `base44` (`base44Client.ts`), que liga os dois adaptadores
ao mesmo contrato. As entidades sob RLS deixam de expor `list`/`filter` crus — a
leitura exige escopo declarado (`listOwned`/`filterOwned`/`filterAsAdmin`).

**Registro fechado com a entidade `User`.** O registro cobre as 8 entidades clínicas
e, após correção nesta rodada, a entidade embutida `User` do BaaS — usada em um único
ponto do legado (exclusão de conta no `Layout`). Sem ela, a conversão do `Layout`
quebraria esse fluxo em runtime (regressão introduzida pela Onda 3, corrigida aqui).

**Telas de paciente.** As três telas convertidas declaram escopo de leitura. A
resolução é por papel da sessão (`resolveScope`, decisão de escopo opção C):
administrador lê sem filtro de dono e usuário comum recebe o filtro imposto — a
mesma condição que a RLS do servidor já aplicava. A primeira versão de
`Patients`/`PatientForm` usava `asUserScope`, que restringiria administradores ao
próprio dado; a correção restaura a paridade com o legado.

**Telas de consulta.** As três telas (lista, detalhe e formulário) seguem o mesmo
padrão de escopo. A legenda de situação preserva a ausência quando o registro não
tem `status` — o seed offline de consultas não o grava, e a renderização continua a
mesma do legado (badge sem rótulo), em vez de assumir um valor padrão.

**Telas de agendamento.** As duas telas seguem o mesmo padrão de escopo; médicos
continuam com leitura livre para autenticados (BR-MIGRAR-017). Dois ajustes de
paridade: (1) a prop `selectedDate` do `TimeSlotPicker` voltou a aceitar `Date`,
que é o que o consumidor legado entrega; (2) a prop `required` dos Selects de
paciente/médico foi removida — o componente de interface nunca a renderizou, então
nada muda em runtime.

**Contrato de integrações (SendEmail).** A decisão original de escopo listava
`SendEmail` como fora do contrato, mas o legado o usa no agendamento (email de
confirmação). A função foi incorporada com a assinatura do SDK: o adaptador online
liga ao SDK real e o adaptador offline rejeita a chamada — o mesmo desfecho
observável do legado offline, que não a implementava e falhava em runtime.

**Dados de exemplo offline.** O seed foi tipado contra as entidades e alinhado:
gênero nas formas do enum, `lgpd_consent` explícito, `anamnese` →
`history_present_illness`, campos fora do schema removidos, vínculo com agendamento
movido para `Appointment.consultation_id`, medicamentos como lista com `type` e
`content`, templates no conjunto fechado e defaults de agendamento explícitos. As
entidades sob RLS ganharam `created_by_id` do usuário de demonstração para que as
leituras escopadas continuem encontrando os dados de exemplo no modo offline.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas:

- **BR-S02** — usuário não-admin só vê o que ele mesmo criou. A autorização real
  permanece na RLS do servidor; o cliente apenas passou a exigir a declaração de
  escopo (forma, nunca autorização).
- **BR-A01 / BR-A02 e a ausência de gatilho automático** — a transição de status de
  Agendamento permanece manual; nada passa a mudar sozinho ao salvar Consulta.
- **BR-P02** — tipo sanguíneo continua no conjunto fechado ABO/Rh + `desconhecido`.
- **BR-T01** — tipos documentais continuam fechados; um modelo de atestado não
  aparece ao emitir receita.
- **BR-MIGRAR-004 (LGPD)** — consentimento aceito continua exigindo data e endereço
  de rede; agora a exigência é verificada em compile-time.
- **AMB-003 e AMB-006** — comportamentos congelados por decisão humana foram
  preservados (marcação sem escape em templates; transições manuais).
- Nenhum schema em `base44/entities/*.jsonc` foi alterado; nenhuma dependência nova
  foi introduzida.

## 4. Modificadas

- **RN-07 (leitura de dado clínico exige escopo)** — alterada de "regra implícita do
  servidor" para "regra também exigida na fronteira de tipos do cliente". Para
  usuário comum e administrador o resultado das consultas não muda (a condição
  espelha a RLS); o que muda é que a omissão do escopo deixa de compilar.
- **RN-08 (usuário offline sem papel nem dono)** — alterada para variante estrutural
  no tipo (`role?: never`), tornando a ausência explícita em compile-time.
- **Contrato de acesso a dados** — estendido com a entidade embutida `User` do BaaS
  (tipo `AppUser`), restaurada por paridade com o legado (exclusão de conta).

---
*Gerado pelo Reversa-Coding em 2026-09-17.*
