# -*- coding: utf-8 -*-
"""Gerador do actions.md da feature 001-migracao-typescript. Escrita atomica."""
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
HOJE = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

BODY = r"""
# Actions: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `HOJE`
> Roadmap: `_reversa_forward/001-migracao-typescript/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 44 |
| Paralelizáveis (`[//]`) | 17 |
| Maior cadeia de dependência | 8 elos |

> **Estado inicial:** as ações `T001` a `T011` já foram executadas e verificadas antes da
> abertura desta feature. Entram com status `[X]` porque o trabalho existe no código —
> marcá-las como pendentes faria o `/reversa-coding` refazer o que já passou por
> verificação. As demais começam em `[ ]`.
>
> **Fase 2 (Testes):** o projeto não adota desenvolvimento guiado por testes e a decisão
> D-07 não autoriza arcabouço de teste nesta feature. A fase existe, mas com outro
> conteúdo: **verificação negativa** — casos de uso propositalmente incorretos que
> precisam **não** compilar. Foi exatamente esse tipo de verificação que revelou os dois
> defeitos de contrato descritos em `investigation.md` (seções 7.1 e 7.2).

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar a configuração de verificação de tipos em modo estrito, cobrindo todo o código-fonte | - | `[//]` | `tsconfig.json` | 🟢 | `[X]` |
| T002 | Corrigir o comando de verificação do manifesto, que apontava para a configuração legada e emitia arquivos | T001 | - | `package.json` | 🟢 | `[X]` |
| T003 | Corrigir o erro de sintaxe que fazia a verificação abortar a análise de todo o projeto | T001 | `[//]` | `src/components/ui/chart.jsx` | 🟢 | `[X]` |
| T004 | Confirmar que a verificação cobre o número esperado de arquivos do código-fonte | T001 | - | `tsconfig.json` | 🟢 | `[X]` |
| T005 | Registrar no arquivo de configuração a exclusão da pasta de componentes de interface herdados, com justificativa por escrito | T001 | - | `tsconfig.json` | 🟢 | `[ ]` |

**Maior cadeia até aqui:** T001 → T002 (2 elos).

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T008, T009 | - | arquivo de verificação negativa | 🟢 | `[X]` |
| T007 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T012 | - | arquivo de verificação negativa | 🟢 | `[X]` |
| T008 | Verificar por caso negativo que valor fora dos conjuntos fechados de status e tipo não compila | T009 | `[//]` | arquivo de verificação negativa | 🟢 | `[X]` |
| T009 | Verificar por caso negativo que nome de entidade inexistente não compila | T011 | `[//]` | arquivo de verificação negativa | 🟢 | `[X]` |
| T010 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T012 | - | arquivo de verificação negativa | 🟢 | `[X]` |
| T011 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T012 | - | arquivo de verificação negativa | 🟢 | `[X]` |
| T012 | Confirmar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T021, T022 | - | arquivo de verificação negativa | 🟢 | `[ ]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | Declarar os campos preenchidos pelo servidor em todo registro persistido | - | `[//]` | `src/types/base.ts` | 🟢 | `[X]` |
| T014 | Declarar os tipos primitivos e os conjuntos fechados compartilhados (gênero, tipo sanguíneo, dia da semana, operações de filtro) | - | `[//]` | `src/types/common.ts` | 🟢 | `[X]` |
| T015 | Declarar o contrato do paciente com o consentimento como tipo condicional | T013, T014 | - | `src/types/Patient.ts` | 🟢 | `[X]` |
| T016 | Declarar o contrato do agendamento com o conjunto fechado de status e tipo | T013, T014 | `[//]` | `src/types/Appointment.ts` | 🟢 | `[X]` |
| T017 | Declarar o contrato da consulta com sinais vitais e conjunto fechado de status | T013, T014 | `[//]` | `src/types/Consultation.ts` | 🟢 | `[X]` |
| T018 | Declarar o contrato da prescrição com os itens de medicamento e os tipos documentais | T013, T014 | `[//]` | `src/types/Prescription.ts` | 🟢 | `[X]` |
| T019 | Declarar o contrato do exame com os conjuntos de tipo de exame e de arquivo | T013, T014 | `[//]` | `src/types/Exam.ts` | 🟢 | `[X]` |
| T020 | Declarar o contrato do médico com dias e janela de atendimento | T013, T014 | `[//]` | `src/types/Doctor.ts` | 🟢 | `[X]` |
| T021 | Declarar o contrato do modelo de documento com os 7 tipos | T013, T014 | `[//]` | `src/types/Template.ts` | 🟢 | `[X]` |
| T022 | Declarar o contrato do registro de acesso com as 12 ações auditadas | T013, T014 | `[//]` | `src/types/AccessLog.ts` | 🟢 | `[X]` |
| T023 | Declarar a sessão do usuário como união discriminada, com a variante offline sem papel nem dono | T014 | - | `src/types/User.ts` | 🟢 | `[X]` |
| T024 | Expor os contratos de domínio pelo ponto de entrada da camada de tipos | T015, T016, T017, T018, T019, T020, T021, T022, T023 | - | `src/types/index.ts` | 🟢 | `[X]` |
| T025 | Declarar o contrato de acesso a dados: repositório de entidade, escopos, gateways e forma crua | - | `[//]` | `src/api/contract.ts` | 🟢 | `[X]` |
| T026 | Declarar o registro fechado das 8 entidades, com verificação das implementações em tempo de compilação | T025, T036 | - | `src/api/registry.ts` | 🟢 | `[X]` |
| T027 | Implementar a leitura com escopo: leitura do dono, filtro do dono e leitura administrativa | T025 | - | `src/api/scopedRead.ts` | 🟢 | `[X]` |
| T028 | Converter os componentes clínicos para a linguagem tipada (9 componentes) | T026, T024 | - | `src/components/medical/` | 🟢 | `[ ]` |
| T029 | Converter os componentes de agendamento para a linguagem tipada (2 componentes) | T026, T024 | `[//]` | `src/components/appointments/` | 🟢 | `[ ]` |
| T030 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo | T028, T038 | - | `src/pages/Patients.jsx`, `src/pages/PatientForm.jsx` | 🟢 | `[ ]` |
| T031 | Converter a tela de detalhe do paciente e migrar suas leituras | T030 | - | `src/pages/PatientDetail.jsx` | 🟢 | `[ ]` |
| T032 | Converter as telas de consulta e migrar suas leituras | T031, T028 | - | `src/pages/Consultations.jsx`, `src/pages/Consultation.jsx`, `src/pages/NewConsultation.jsx` | 🟢 | `[ ]` |
| T033 | Converter as telas de agendamento e migrar suas leituras | T032, T029 | - | `src/pages/Appointments.jsx`, `src/pages/NewAppointment.jsx` | 🟢 | `[ ]` |
| T034 | Converter a tela de médicos | T033 | - | `src/pages/Doctors.jsx` | 🟢 | `[ ]` |
| T035 | Converter a tela de modelos de documento | T034 | - | `src/pages/Templates.jsx` | 🟢 | `[ ]` |
| T036 | Converter a tela de registros de acesso | T035 | - | `src/pages/AccessLogs.jsx` | 🟢 | `[ ]` |
| T037 | Converter a tela do painel e seus componentes de indicadores | T036 | - | `src/pages/Dashboard.jsx`, `src/components/medical/StatsCard.jsx`, `src/components/medical/ReportsView.jsx` | 🟢 | `[ ]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T038 | Converter o cliente online para a linguagem tipada, satisfazendo o contrato | T026 | - | `src/api/base44Client.js` | 🟢 | `[ ]` |
| T039 | Converter o cliente offline para a linguagem tipada, satisfazendo o mesmo contrato | T026 | - | `src/api/mockClient.js` | 🟢 | `[ ]` |
| T040 | Alinhar os dados de exemplo do modo offline ao contrato das entidades | T039, T024 | - | `src/api/mockSeed.js` | 🟢 | `[ ]` |
| T041 | Confirmar por verificação negativa que as duas implementações honram o contrato (fecha T012) | T038, T039 | - | arquivo de verificação negativa | 🟢 | `[ ]` |
| T042 | Converter os arquivos auxiliares restantes para a linguagem tipada, preservando o comportamento | T026, T038 | - | `src/App.jsx`, `src/Layout.jsx`, `src/lib/*`, `src/hooks/*` | 🟢 | `[ ]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T043 | Ligar a verificação sobre os arquivos convertidos e reduzir os erros de tipo a zero | T028, T029, T037, T040, T042 | - | `tsconfig.json` | 🟢 | `[ ]` |
| T044 | Executar a verificação completa e confirmar o critério de pronto do roadmap | T043 | - | `tsconfig.json` | 🟢 | `[ ]` |

## Notas de execução

> O modo de verificação estrita (ligado ou não sobre cada arquivo) é controlado por uma
> única opção na configuração. A estratégia é ligá-la por grupo de arquivos convertidos,
> nunca sobre o projeto inteiro antes da conversão — a medição de 1.324 erros mostra o
> custo de fazer isso cedo demais.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `HOJE` | Versão inicial gerada por `/reversa-to-do` | reversa |
"""


def main():
    target = os.path.join(FD, "actions.md")
    tmp = target + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(BODY.replace("HOJE", HOJE).lstrip("\n"))
    os.replace(tmp, target)
    print("escrito:", target)

    import re
    text = BODY
    rows = re.findall(r"^\| T\d{3} \|", text, re.M)
    par = re.findall(r"^\| T\d{3} \|.*?`\[//\]`", text, re.M)
    done = re.findall(r"^\| T\d{3} \|.*?`\[X\]` \|$", text, re.M)
    print("acoes:", len(rows), "| paralelizaveis:", len(par), "| ja concluidas:", len(done))


if __name__ == "__main__":
    main()
