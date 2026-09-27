# Regression Watch: Política de leitura da trilha de auditoria

> Identificador: `017-politica-de-leitura-dos-logs`
> Data: `2026-09-25`
> Âncora: **legado** (`_reversa_sdd/`). Os itens abaixo vêm da regra 🟢 `BR-L04`, a única modificada
> por esta feature (ver `legacy-impact.md#4`).

## Watch principal

Regras que **precisam continuar verdadeiras** nas próximas extrações.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `src/pages/AccessLogs.tsx`; `requirements.md#4` `RN-01` | A leitura da trilha é **paginada com deslocamento**: o registro que não está no primeiro recorte é alcançável | presença | Um registro da trilha deixa de ser alcançável pela interface; a segunda leitura sai com deslocamento zero |
| W002 | `src/pages/AccessLogs.tsx`; `RN-08`, `D-05` | O recorte é de **500** registros por leitura | presença | O recorte muda de tamanho sem decisão registrada |
| W003 | `src/pages/AccessLogs.tsx`; `RN-07`, `D-06` | A leitura pede **um registro a mais** do que exibe, e descarta o excedente | presença | O pedido passa a ser o recorte exato — um recorte cheio vira indistinguível do último, e o avanço desabilita cedo |
| W004 | `src/api/contract.ts`, `entities.ts`, `mockClient.ts`; `RN-06`, `D-02`, `D-03`, `D-04` | O contrato aceita `skip` nas **duas** leituras, e as **duas** implementações o honram | presença | Uma das implementações ignora o deslocamento, ou `filter` perde o parâmetro |
| W005 | `src/pages/AccessLogs.tsx`; `RN-02`, `RF-03` | Nenhum indicador se chama "Total" medindo um recorte | redação | O rótulo "Total de Logs" reaparece |
| W006 | `src/pages/AccessLogs.tsx`; `RN-05`, `RF-08` | A tela declara que a busca alcança o recorte exibido | presença | A declaração desaparece, e o auditor volta a concluir que o registro não existe |
| W007 | `src/pages/AccessLogs.tsx`; `RN-05` | Os três filtros continuam no cliente, operando sobre o recorte, sem reconsulta | presença | Mudar filtro passa a reconsultar o servidor, ou o filtro sai do recorte |
| W008 | `src/pages/AccessLogs.tsx`; `BR-L05` | A ordenação é `-created_date`, em **todas** as páginas | presença | A lista deixa de vir do mais recente para o mais antigo em alguma página |
| W009 | `src/pages/AccessLogs.tsx`; `BR-MIGRAR-024`, correção do F-04 | A leitura declara escopo administrativo, e quem não é admin recebe conjunto vazio **sem** perguntar ao servidor | presença + ausência | A leitura deixa de declarar escopo, ou passa a exibir registro para quem não é admin |
| W010 | `src/pages/AccessLogs.tsx`; `BR-L01` | A tela continua somente leitura: nenhuma linha oferece editar ou excluir | ausência | Um controle de escrita aparece dentro da tabela |

## Observações

Itens que **não** têm peso de regressão: ou descrevem uma regra que já era 🟡/🔴 na origem, ou
registram limitação conhecida em vez de regra.

| ID | Origem | Observação |
|----|--------|------------|
| O001 | `AMB-004` (`_reversa_sdd/migration/ambiguity_log.md`) | A decisão de 2026-09-09 congelou a leitura em até 500 sem paginação e adiou a política real para "fase posterior". **É esta feature.** `AMB-004` está superada |
| O002 | `legacy-impact.md#4` | A heurística que classifica as ações por **substring** permanece: "Edições" soma `edit` **e** `create`, e `login`, `logout`, `upload_exam` e `export_data` não entram em categoria nenhuma. Ficou **fora do escopo** por decisão, e é lacuna declarada e provada |
| O003 | `_reversa_sdd/code-spec-matrix.md#Lacunas de prova` | Os recortes "última semana" e "último mês" continuam comparando **apenas o piso**, de modo que registro com data futura entra nos dois. Paridade provada, mantida por decisão |
| O004 | `actions.md#Notas de execução` | **Divergência herdada, não corrigida:** o SDK documenta `limit` com default **50**; o cliente de modo offline trata `limit` ausente como **sem teto**. Antecede esta feature. Consequência: `list(sort, undefined, skip)` significa coisas diferentes nos dois lados |
| O005 | `roadmap.md#9` (`R-01`) | **Deriva de deslocamento.** A trilha é *append-only*; um registro inserido entre duas leituras empurra os demais, e a página seguinte repete o último item da anterior. É inerente ao deslocamento sobre conjunto que cresce, e não tem contorno dentro do contrato atual. Risco declarado, probabilidade alta |
| O006 | `roadmap.md#9` | **Empate de `created_date`.** A ordenação usa um campo só (`BR-L05`); dois registros com o mesmo carimbo podem ordenar diferente entre requisições. Ordenação por dois campos não é expressável em `SortField` |

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso quando `/reversa` rodar de novo sobre este código. -->

| Data | Extração | Resultado |
|------|----------|-----------|
| — | — | — |

## Arquivadas

| ID | Item | Arquivado em | Razão |
|----|------|--------------|-------|
| — | — | — | — |

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-25 | Versão inicial gerada por `/reversa-coding` — 10 itens no watch principal, 6 observações | reversa |

---
*Gerado pelo Reversa-Coding em 2026-09-27.*
