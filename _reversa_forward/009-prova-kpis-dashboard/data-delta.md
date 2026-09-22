# Delta de Dados: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/009-prova-kpis-dashboard/requirements.md`
> Modelo extraído de referência: `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`

## 1. Resumo

**Nenhuma mudança de dados.** A feature não cria, altera nem remove campo, coleção, índice,
relacionamento ou migração. O delta é inteiramente de prova: a massa de teste instancia as quatro
entidades existentes **em memória**, e nada é persistido — nem no provedor, nem no armazenamento
local do navegador.

Esta é a quarta feature consecutiva de prova com delta de dados vazio (005, 006, 008 e agora 009).
Não é coincidência: o instrumento de prova do projeto é aditivo por construção, e é isso que faz
`CF-02` — nenhum arquivo de aplicação alterado — ser um critério verificável em vez de uma promessa.

## 2. O que a prova toca do modelo (referência, sem alteração)

As quatro entidades lidas pelo Dashboard, com os campos que a massa de prova precisa preencher para
exercitar cada critério. Nenhum campo é criado; a coluna "papel na massa" diz apenas para que serve.

| Entidade | Campos usados pela massa | Papel na massa | Fonte no legado |
|----------|--------------------------|----------------|-----------------|
| `Patient` | `id`, `full_name`, `status` (`'ativo'` \| `'inativo'`) | Alimenta o KPI Pacientes Ativos e o nome do paciente na lista | `_reversa_sdd/erd-complete.md`; `src/types/Patient.ts` |
| `Appointment` | `id`, `patient_id`, `date`, `status` (`'agendado'` \| `'confirmado'` \| `'em_atendimento'` \| `'concluido'` \| `'cancelado'` \| `'faltou'`) | Alimenta o KPI Agendamentos Hoje e a lista de Próximos Agendamentos | `_reversa_sdd/erd-complete.md`; `src/types/Appointment.ts` |
| `Consultation` | `id`, `date`, `status` (`'agendada'` \| `'em_andamento'` \| `'concluida'` \| `'cancelada'`) | Massa dos dois agregados **descartados** — o objeto do achado de `PT-008.3` | `_reversa_sdd/erd-complete.md`; `src/types/Consultation.ts` |
| `Prescription` | `id`, `created_date` | Alimenta o KPI Documentos Emitidos | `_reversa_sdd/erd-complete.md`; `src/types/Prescription.ts` |

> **Nota de escopo.** `Consultation` entra na massa mesmo sem superfície: o Dashboard a lê, e medir o
> **descarte** exige que a leitura aconteça com dado real. Uma massa de consultas vazia tornaria o
> achado invisível.

## 3. O que a prova **não** cria

1. **Nenhuma coleção, campo ou índice.** O modelo extraído permanece o do legado, campo por campo.
2. **Nenhuma migração.** Não há dado existente a transformar, e portanto não há script, versão nem
   janela de execução.
3. **Nenhum dado persistido.** A massa existe apenas no processo de teste. As quatro leituras são
   substituídas por dublês, e o provedor nunca é alcançado.
4. **Nenhum registro no armazenamento local do navegador.** Diferente do modo offline, que semeia
   `localStorage` — aqui nada é gravado.
5. **Nenhum arquivo de massa compartilhado com outras features.** `src/test/dashboardFixtures.ts` é
   novo e não é importado por nenhum arquivo existente; a via é de mão única.

## 4. Conferência de que o schema ficou intocado

O critério `CF-02` do `roadmap.md` cobre exatamente isto, medido por comando no fechamento:

| Verificação | Comando | Resultado esperado |
|-------------|---------|--------------------|
| Schema de entidades intocado | Estado do repositório sobre `base44/entities` | vazio |
| Tipos e contrato intocados | Estado do repositório sobre `src/types`, `src/api`, `src/lib` | vazio |
| Página do Dashboard intocada | Estado do repositório sobre `src/pages/Dashboard.tsx` | vazio |
| Prova herdada intocada | Estado do repositório sobre `src/pages/__tests__/Dashboard.test.tsx` | vazio |

## 5. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` — delta de dados vazio | reversa |
