# Onboarding: Prova automatizada do módulo de Consultas

> Identificador: `004-prova-consultas`
> Data: `2026-09-21`
> Para quem vai executar e conferir esta feature pela primeira vez.

## 1. Pré-requisitos

| Item | Observação |
|------|------------|
| Node.js e npm | Versões que o projeto já usa no dia a dia |
| Repositório clonado | Nenhum serviço de backend precisa estar de pé |
| Variáveis de ambiente | **Não são necessárias.** A prova substitui o backend, o transporte de auditoria e o seletor de interface por dublês |
| Acesso ampliado para rodar a suíte | O empacotador do vitest abre pipe nomeado e falha com `spawn EPERM` em modo confinado. Não é defeito do projeto — é restrição de ambiente, já registrada no onboarding da feature 001, §7 |

## 2. Os comandos, em ordem

```bash
npm test                  # a suíte completa
npm run typecheck         # gate de tipos estrito
npm run lint              # análise estática
npm run prova:negativos   # reprodução das verificações negativas do gate de tipos
```

O que esperar: tudo passa, os dois gates terminam sem saída e o comando de verificações
negativas reporta cada caso recusado sem deixar resíduo. O código de retorno é 0 quando
tudo passa.

> Os comandos são os mesmos das features 002 e 003 — esta feature **não** cria caminho novo
> de prova. Se algum deles falhar, o problema é do módulo, não da infraestrutura.
>
> O caso `status-fora-do-conjunto` de `npm run prova:negativos` **já existia** desde a
> feature 001 e é reaproveitado por citação: ele é a prova do `RF-03` e não deve ser
> duplicado.

## 3. Onde a prova do módulo vive

| Arquivo | Promessa que sustenta |
|---------|------------------------|
| `src/pages/__tests__/Consultations.test.tsx` | Filtro por situação, registro sem situação e os quatro recortes de data |
| `src/pages/__tests__/Consultation.test.tsx` | Legenda e ausência, ausência de transição automática e a assimetria de auditoria |
| `src/pages/__tests__/NewConsultation.test.tsx` | Situação inicial, troca de situação, situações oferecidas, portão do salvamento e ausência de envio acidental |
| `src/test/consultationsFixtures.ts` | Massa compartilhada — não é arquivo de prova, é insumo |
| `npm run prova:negativos`, caso `status-fora-do-conjunto` | Tipo `ConsultationStatus` como união fechada (`RF-03`) |

> ⚠️ **Dois arquivos diferem por uma letra** — `Consultation.test.tsx` (o detalhe) e
> `Consultations.test.tsx` (a listagem). É a convenção do projeto, que espelha o nome do
> componente, e é o que a matriz cita. Ao editar, confira o cabeçalho `describe`: cada
> arquivo nomeia a tela por extenso na primeira linha.

## 4. Onde ler o resultado da feature

| Pergunta | Onde responder |
|----------|----------------|
| O que esta feature prometeu? | `_reversa_forward/004-prova-consultas/requirements.md` |
| Como foi decidido tecnicamente? | `_reversa_forward/004-prova-consultas/roadmap.md` |
| Por que cada decisão foi tomada assim? | `_reversa_forward/004-prova-consultas/investigation.md` |
| Qual promessa tem prova, e qual não tem? | `_reversa_sdd/code-spec-matrix.md#Cenários de paridade do módulo Consultas` |
| O que ficou sem prova, e por quê? | `_reversa_sdd/code-spec-matrix.md#Lacunas declaradas do módulo de Consultas` |

## 5. O que conferir com os próprios olhos

1. **A situação inicial depende do caminho.** O formulário grava `em_andamento`; o schema
   diz `agendada`. Os dois fatos convivem, e a prova afirma o que o cliente faz. Se a
   verificação afirmar que a consulta nasce `agendada`, ela está medindo a coisa errada.
2. **A segunda metade do `RF-01` é declarada, não provada.** O default `agendada` é do
   servidor e não é observável no cliente. Se ele aparecer como 🟢 na matriz **sem** a
   ressalva de que é declaração, a matriz está mentindo (decisão D-06).
3. **A assimetria de auditoria é o achado mais importante da feature.** Emitir um documento
   **não** grava registro de auditoria; anexar um exame **grava**. A verificação tem de
   medir isso no **transporte** — se ela substituir o módulo `AccessLogger`, mede o dublê e
   o achado desaparece.
4. **Os dois fluxos de auditoria são medidos com a mesma espiã.** Se ela não disparar em
   nenhum dos dois, o arnês está errado: anexar exame **precisa** disparar.
5. **A interface oferece as quatro situações de qualquer situação atual.** Não existe
   guarda de transição: `cancelada` → `concluida` é oferecida. O `.feature` PT-005.3 afirma
   o contrário e está declarado impreciso.
6. **A ausência de transição automática é afirmada pelo valor.** Emitir documento ou anexar
   exame não move a situação; a verificação afirma o **valor exibido depois**, e não a
   ausência de chamadas.
7. **Nada mudou no comportamento.** Nenhum arquivo de aplicação do módulo pode ter diff.
   Se você vir `Consultations.tsx`, `Consultation.tsx`, `NewConsultation.tsx` ou qualquer
   arquivo de `src/components/medical/` modificado, algo saiu do escopo.
8. **Nada mudou no backend.** Os schemas de `base44/entities/` não podem ter diff nenhum.
   É a regra de ouro.
9. **A matriz diz a verdade.** Escolha três promessas do módulo ao acaso: o arquivo de prova
   citado deve existir e conter a verificação correspondente.
10. **As lacunas estão nomeadas.** O módulo tem oito lacunas documentadas, **duas de
    severidade Alta**, que esta feature declara e não prova. Elas precisam aparecer na
    matriz com a razão.

## 6. O que **não** está coberto

| Fora da prova | Por quê |
|---------------|---------|
| `applyTemplate` sem escape de marcação | Lacuna de severidade Alta, declarada e não provada — preservação deliberada do legado (`AMB-006`), por decisão da sessão de 2026-09-21 |
| `handlePrint` por `window.open` | Mesma decisão; a injeção é paridade registrada |
| O default `agendada` aplicado pelo servidor | Não é observável no cliente (D-06) |
| A ligação da auditoria da prescrição | O defeito é provado e declarado, **não** corrigido (D-08) |
| As outras duas ações órfãs do catálogo (`logout`, `export_data`) | Não têm fluxo correspondente para provar |
| Validação de transições inválidas na interface | Provado que **não** existe; impor as transições válidas saiu do escopo |
| Impressão com CSS dedicado, validação de upload, busca de paciente além de 5 | Lacunas declaradas do módulo |
| Paridade visual das telas | Depende de captura dourada inexistente |
| Cenários dos demais módulos | Pertencem a features próprias |

## 7. Registro de execução

Rodada de fechamento em **2026-09-21**, sobre a árvore de trabalho com as provas do módulo
acrescidas.

| # | Item | Resultado |
|---|------|-----------|
| 1 | `npm test` passa por inteiro | ✅ **17 arquivos, 90 verificações, 0 falhas** — código de retorno 0 |
| 2 | `npm run typecheck` sem saída | ✅ **0 erros** |
| 3 | `npm run lint` sem saída | ✅ **0 erros** (`eslint . --quiet`) |
| 4 | `npm run prova:negativos` reporta cada caso e não deixa resíduo | ✅ **9 casos, 9 recusados** — entre eles `status-fora-do-conjunto`, que é a prova do `RF-03` —, e `src/__negative_checks__/` **não** ficou no repositório |
| 5 | Nenhum arquivo de aplicação do módulo modificado | ✅ `git status --porcelain` lista **apenas** os quatro arquivos de prova, o `actions.md` e o `progress.jsonl`. Nenhum `Consultations.tsx`, `Consultation.tsx`, `NewConsultation.tsx` nem arquivo de `src/components/medical/` |
| 6 | `base44/entities/` sem diff | ✅ Nenhuma saída em `git status --porcelain -- base44/entities` |
| 7 | A situação inicial é provada pelos dois caminhos observáveis | ✅ `NewConsultation.test.tsx` — o formulário grava `em_andamento` e o modo edição cai em `em_andamento` quando o registro não tem situação. A metade do schema é **declarada** (D-06) |
| 8 | A assimetria de auditoria é provada no transporte, com a mesma espiã nos dois fluxos | ✅ `Consultation.test.tsx` — o módulo `AccessLogger` corre de verdade e o dublê fica em `AccessLog`. Uma verificação separada prova que a espiã dispara no carregamento antes de as demais medirem |
| 9 | As oito lacunas aparecem na matriz com razão | ✅ As oito de `code-analysis.md#9`, cada uma com severidade e veredito, incluindo as duas de severidade Alta. O achado de auditoria entrou como nona, por não constar do artefato |
| 10 | Suíte completa abaixo de 90 segundos | ✅ **63,7 s** medidos pelo vitest (66,1 s de relógio) — **26 s de folga** |

### 7.1 Medição de tempo

| Medição | Verificações | Arquivos | Tempo | Teto | Folga |
|---------|-------------:|---------:|------:|-----:|------:|
| 2026-09-21, antes desta feature | 66 | 14 | 57,9 s | 90 s | 32,1 s |
| 2026-09-21, após esta feature | 90 | 17 | 63,7 s | 90 s | **26,3 s** |

O acréscimo foi de **24 verificações em 3 arquivos** — listagem (9), detalhe (8) e
formulário (7) —, com o tempo ainda bem abaixo do teto. O teto foi **revalidado**, e não
renegociado (D-11).

### 7.2 Comandos além dos quatro

| Comando | Resultado |
|---------|-----------|
| `git status --porcelain` | Apenas os quatro arquivos de prova, o `actions.md` e o `progress.jsonl` — nenhuma alteração acidental em arquivo de aplicação |
| `npm run prova:encoding` | ✅ Árvore íntegra, nenhum mojibake |

> **Ressalva de ambiente.** Os comandos de prova **não** sobem nos modos confinados de
> sandbox: o esbuild do vitest abre pipe nomeado e falha com `spawn EPERM`, e o
> `prova:negativos` falha ao criar `src/__negative_checks__/`. Exigem acesso ampliado —
> mesma restrição registrada no onboarding da feature 001, §7.

---
*Gerado pelo Reversa-Plan em 2026-09-21.*
*Registro de execução preenchido pelo Reversa-Coding em 2026-09-21.*
