---
schemaVersion: 1
generatedAt: 2026-09-09T15:52:00-03:00
reversa:
  version: "1.3.2"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
hash: "sha256:f97a137150b798ae79eddbf493c4265e122122e9dce8c61ebb6bac9a97676088"
---

# Screen Deviation Log

> Registro de toda divergência entre o legado e a spec gerada em `target_screens.md`. Append-only. Deviations pendentes bloqueiam o handoff ao Inspector.
> Deviations aprovadas são propagadas para `parity_specs.md § Exceções` quando o Inspector rodar.

## Convenções

- **ID**: `DEV-NNN` (sequencial, três dígitos).
- **Tipo**: `tecnica` | `modernizacao` | `plataforma` | `correcao`.
- **Aprovação**: `pendente` | `aprovado` | `rejeitado`.

## Resumo

- **Total**: 0
- **Pendentes**: 0
- **Aprovadas**: 0
- **Rejeitadas**: 0

## Entradas

(nenhuma deviation registrada)

## Telas com mais de uma deviation

| Tela | IDs |
|---|---|
| — | — |

## Notas

- **Zero deviations** porque o modo escolhido foi **literal na mesma plataforma** (`react-hooks` → `web-spa` React + TS): as telas do alvo são os arquivos `.jsx` convertidos a `.tsx`, sem re-expressão visual. Não há divergência introduzida pelo Screen Translator.
- **Itens pré-existentes do legado que NÃO são deviations de tela** (já tratados em `target_business_rules.md`/`ambiguity_log.md`, fora do escopo desta migração):
  - Paginação de Logs de Acesso (limite 500 sem paginação) — AMB-004, paridade.
  - Taxa de Atendimento `94%` mock — AMB-001, paridade.
  - Interpolação de templates sem escape HTML (XSS) — AMB-006, referido à codificação (não corrigir).
  - Divergência seed offline (`file_url: ''`, AccessLog sem user_email real) — tratada em `target_data_model.md`.
- **EC-11 aplicado**: eventuais typos visuais do legado são **preservados** em modo literal (sem correção). Nenhum typo específico foi catalogado como deviation.
- Caso o agente de codificação encontre divergência visual ao converter (ex.: componente shadcn indisponível), deve **abrir DEV-001** aqui e pausar — nunca improvisar layout.
