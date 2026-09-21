# Legacy Impact: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Política de edição do legado no momento da execução: `allowLegacyEdits: true`, com
> `allowedPaths` liberando `src/**`, `package.json`, `tsconfig.json`, `docs/**`,
> `index.html` e `.github/**`. As pastas próprias do Reversa permanecem graváveis pela
> regra própria.
> **Nenhum caminho do plano caiu fora da política** — não houve recusa de escrita.

## Tabela de arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/test/consultationsFixtures.ts` | Camada de prova (`_reversa_sdd/inventory.md#Cobertura de testes`) | `componente-novo` | LOW | Massa de prova compartilhada do módulo. Não entra no programa verificado (admissão de JavaScript desligada) nem é coletado como prova (nome fora do padrão de arquivo de teste) |
| `src/pages/__tests__/Consultations.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova da listagem: filtro por situação e os quatro recortes de intervalo de data |
| `src/pages/__tests__/Consultation.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova do detalhe: legenda e ausência, ausência de transição automática e a assimetria de auditoria |
| `src/pages/__tests__/NewConsultation.test.tsx` | Camada de prova | `componente-novo` | LOW | Prova do formulário: situação inicial, troca de situação, situações oferecidas, portão do salvamento e ausência de envio acidental |
| `_reversa_sdd/code-spec-matrix.md` | Artefato da extração | `regra-alterada` | MEDIUM | Ganha o veredito de prova de cada promessa do módulo, os 3 cenários de paridade com destino, as oito lacunas declaradas, o achado de auditoria e a medição de tempo atualizada |

> **Nenhum arquivo de aplicação foi tocado.** Não há `src/pages/Consultations.tsx`,
> `src/pages/Consultation.tsx`, `src/pages/NewConsultation.tsx`, nenhum arquivo de
> `src/components/medical/` nem `base44/entities/*.jsonc` na lista. A regra de ouro do diff
> foi respeitada: a prova observa, não altera.
>
> Conferido por comando, e não por inspeção visual: `git status --porcelain` lista **apenas**
> os quatro arquivos de prova, o `actions.md` e o `progress.jsonl`. E `git status --porcelain
> -- base44/entities` não devolve nada — o último commit que tocou o diretório continua sendo
> o `19ed662`, de **2026-08-18**.
>
> `src/test/verificacoes-negativas.mjs` também **não** foi tocado: o caso
> `status-fora-do-conjunto`, que prova o `RF-03`, já existia desde a feature 001 e foi
> reaproveitado por citação (decisão D-05).

## Diff conceitual por componente

### Camada de prova (componente novo em relação ao legado)

A camada nasceu na feature 002 e passou por Pacientes (002) e Agendamentos (003). Esta
feature a estende ao **funil clínico**: o módulo de Consultas tinha prova dos componentes
auxiliares — a linha do tempo clínica e a busca de paciente —, e **nenhuma** da máquina de
estados.

O acréscimo é de **24 verificações em 3 arquivos**, mais a massa compartilhada que os três
usam. O que a camada passa a afirmar sobre Consultas: a situação inicial depende do caminho
de criação; o seletor oferece as quatro situações **sem guarda de transição**; nenhuma
transição é automática; emitir documento **não** deixa rastro de auditoria enquanto anexar
exame deixa; o recorte de "última semana" **inclui o futuro**; e o registro sem situação é
tolerado sem virar rótulo inventado.

Nada disso é comportamento novo. É comportamento que já existia sem que ninguém pudesse
saber — e três desses pontos **contrariam o que a extração documentava**.

### Artefato da extração

`code-spec-matrix.md` passa a registrar, para o módulo de Consultas, o que antes só existia
como promessa. Duas correções de precisão foram feitas no caminho: a medição de tempo, que
estava congelada na feature 003, e o saldo dos cenários de paridade, que estava em 26 e cai
para 23.

## Preservadas

Regras 🟢 que continuam intactas — **nenhuma foi alterada por esta feature**:

- **BR-P01** — apenas pacientes `ativo` são selecionáveis para agendamento ou consulta.
- **BR-P02** — `blood_type` restrito ao enum ABO/Rh mais `desconhecido`.
- **BR-A01** e **BR-A03** de `_reversa_sdd/domain.md#2.2` — nascimento `agendado` e exclusão de cancelados das contagens.
- **BR-A01 a BR-A04** de `_reversa_sdd/agendamentos/requirements.md#2`.
- **BR-C01 a BR-C03** de `_reversa_sdd/consultas/requirements.md#2` — vínculo obrigatório, ciclo de status e medicações em receita.
- **BR-T01** e **BR-T02** — filtragem de modelos por tipo e medicações só em receita.
- **BR-S02** — usuário não-admin só vê o que ele mesmo criou.

## Modificadas

**Nenhuma.** Esta feature não altera regra de negócio, contrato de dados, schema de entidade
nem comportamento observável. A única classe de afirmação que muda é a documental, e apenas
num artefato da extração.

> Consequência para o `regression-watch.md`: como não houve regra alterada nem removida, os
> itens de vigilância desta feature não são regressões a evitar, e sim **propriedades que
> precisam continuar verdadeiras** — tanto os comportamentos que a prova passou a fixar
> quanto a própria prova.

### Divergências entre a extração e o código, provadas e não corrigidas

Esta feature **não** corrige artefato da extração que descreve o sistema errado. Ela prova o
comportamento real e declara a divergência. Quatro merecem registro:

1. **A situação inicial — duas manifestações, não uma.** O `code-analysis.md#5.4` já
   registrava que o formulário usa `em_andamento` e o schema `agendada`. O que **não** estava
   registrado em lugar nenhum é que o **fallback do modo edição** para um registro sem
   situação (`NewConsultation.tsx:127`) também é `em_andamento`, e não o `agendada` do
   schema. São dois pontos onde o cliente contradiz o schema, e a prova cobre os dois.
2. **O cenário PT-005.3 é falso na metade de interface.** Ele afirma que a interface não
   oferece `cancelada` → `concluida`. O seletor oferece as quatro situações,
   incondicionalmente, sem guarda sobre a situação atual.
3. **A trilha de auditoria da prescrição não existe.** `ACCESS_ACTIONS` declara doze ações e
   três nunca são invocadas: `create_prescription`, `logout` e `export_data`. O fluxo de
   emissão existe, a ação existe, e nada liga os dois. Confronta a **BR-S01** de
   `domain.md#2.4`, que é 🟢. O achado **não estava em `code-analysis.md#9`** — nasceu da
   leitura do código durante a sessão de esclarecimentos.
4. **A matriz de transições da consulta não existe na extração.** `state-machines.md#4` é 🟡
   e cobre apenas o agendamento; a máquina da consulta está descrita só como diagrama, em
   `#2`. Produzir a matriz é trabalho da extração.

Todas as quatro entram no `regression-watch.md`, não porque esta feature as tenha
introduzido, mas porque agora estão **provadas** e não podem voltar a passar despercebidas.

---
*Gerado pelo Reversa-Coding em 2026-09-21.*
