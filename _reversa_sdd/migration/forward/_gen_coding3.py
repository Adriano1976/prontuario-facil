# -*- coding: utf-8 -*-
"""Fecha T005 (exclusao registrada no tsconfig) e completa o rastro no progress.jsonl.

O progress.jsonl e append-only: linhas antigas jamais sao reescritas. O rastro das
acoes executadas ANTES da feature existir entra como linhas `corrected`, que e o
status que o proprio skill define para registrar correcao retroativa.
"""
import json
import os
from datetime import datetime, timezone

ROOT = r"D:\Projetos\prontuario-facil"
TSCONFIG = os.path.join(ROOT, "tsconfig.json")
FD = os.path.join(ROOT, "_reversa_forward", "001-migracao-typescript")
ACTIONS = os.path.join(FD, "actions.md")
PROGRESS = os.path.join(FD, "progress.jsonl")

NOVO_TSCONFIG = """{
  // Configuracao de verificacao de tipos do projeto.
  //
  // MODO INCREMENTAL: `checkJs: false` mantem os arquivos ainda nao convertidos fora
  // da verificacao, e a verificacao estrita vale para os arquivos ja convertidos.
  // A opcao e ligada por grupo de arquivos convertidos, nunca sobre o projeto inteiro
  // antes da conversao: a medicao inicial era de 1.324 erros em 81 arquivos.
  //
  // EXCLUSAO REGISTRADA (decisao D-01 do roadmap, esclarecimento 3b):
  // A pasta `src/components/ui` NAO e verificada. Sao componentes herdados de
  // biblioteca, quase nao tocados, e verifica-los renderizaria muito ajuste de baixo
  // valor. A exclusao esta declarada abaixo, de forma explicita e auditavel.
  //
  // ACHADO POSTERIOR, que muda o entendimento desta exclusao: sem tipos, o
  // verificador nao consegue inferir as props desses componentes e, com isso, NENHUM
  // componente do projeto que os use consegue compilar. A mitigacao adotada foi
  // declarar tipos para os componentes efetivamente usados, em arquivos `*.d.ts` ao
  // lado de cada `*.jsx` (sombreamento de tipos: o JavaScript continua sendo o que
  // executa). Os `.jsx` herdados permanecem intocados.
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,

      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "moduleDetection": "force",
      "noEmit": true,
      "jsx": "react-jsx",

      "strict": true,
      "noUnusedLocals": false,
      "noUnusedParameters": false,
      "noFallthroughCasesInSwitch": true,

      "allowJs": true,
      "checkJs": false,

      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src"],
    "exclude": [
      "node_modules",
      "dist",
      // Ver veja o comentario no topo: componentes herdados de biblioteca, fora da
      // verificacao estrita por decisao registrada (D-01).
      "src/components/ui"
    ]
  }
"""

EDITS_ACTIONS = [
    (
        "| T005 | Registrar no arquivo de configuração a exclusão da pasta de componentes de interface herdados, com justificativa por escrito | T001 | - | `tsconfig.json` | 🟢 | `[ ]` |",
        "| T005 | Registrar no arquivo de configuração a exclusão da pasta de componentes de interface herdados, com justificativa por escrito | T001 | - | `tsconfig.json` | 🟢 | `[X]` |",
    ),
]

NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

# Acoes executadas FORA do ciclo (ondas 1-3 do handoff de migracao), sem rastro.
RETROATIVAS = [
    ("T001", ["tsconfig.json"]),
    ("T002", ["package.json"]),
    ("T003", ["src/components/ui/chart.jsx"]),
    ("T004", ["tsconfig.json"]),
    ("T006", ["src/types/base.ts"]),
    ("T007", ["src/types/common.ts"]),
    ("T008", ["src/types/Patient.ts"]),
    ("T009", ["src/types/Appointment.ts"]),
    ("T010", ["src/types/Consultation.ts"]),
    ("T011", ["src/types/Prescription.ts"]),
    ("T012", ["src/types/Exam.ts"]),
    ("T013", ["src/types/Doctor.ts"]),
    ("T014", ["src/types/Template.ts"]),
    ("T015", ["src/types/AccessLog.ts"]),
    ("T016", ["src/types/User.ts"]),
    ("T017", ["src/types/index.ts"]),
    ("T018", ["src/api/contract.ts"]),
    ("T019", ["src/api/scopedRead.ts"]),
    ("T020", ["src/api/registry.ts"]),
    ("T031", ["verificação negativa do consentimento"]),
    ("T032", ["verificação negativa dos conjuntos fechados"]),
    ("T033", ["verificação negativa do escopo de leitura"]),
    ("T034", ["verificação negativa do filtro escopado"]),
    ("T035", ["verificação de uso correto"]),
    ("T036", ["verificação negativa do registro de entidades"]),
]


def main():
    with open(TSCONFIG, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(NOVO_TSCONFIG)
    print("tsconfig.json: exclusao registrada com justificativa")

    with open(ACTIONS, "r", encoding="utf-8") as fh:
        text = fh.read()
    for old, new in EDITS_ACTIONS:
        if text.count(old) != 1:
            raise SystemExit("ABORTADO: linha de T005 nao casa 1 vez")
        text = text.replace(old, new)
    tmp = ACTIONS + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, ACTIONS)
    print("actions.md: T005 marcada como concluida")

    with open(PROGRESS, "a", encoding="utf-8", newline="\n") as fh:
        for acao, arquivos in RETROATIVAS:
            fh.write(
                json.dumps(
                    {
                        "ts": NOW,
                        "action": acao,
                        "status": "corrected",
                        "files": arquivos,
                        "obs": "Executada fora do ciclo forward (onda do handoff de migracao); "
                        "rastro registrado retroativamente. Status real: done.",
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
        for estagio in ("requirements", "clarify", "plan", "to-do"):
            fh.write(
                json.dumps(
                    {
                        "ts": NOW,
                        "action": estagio,
                        "status": "done",
                        "files": [],
                        "obs": "Estagio do ciclo concluido; registro retroativo no rastro.",
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
    print("progress.jsonl: %d linhas retroativas + 4 de estagio" % len(RETROATIVAS))


if __name__ == "__main__":
    main()
