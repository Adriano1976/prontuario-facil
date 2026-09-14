# -*- coding: utf-8 -*-
"""Registra o progresso dos componentes convertidos nesta rodada."""
import json
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

LINHAS = [
    ("T005", ["tsconfig.json"], "Exclusao da pasta de componentes herdados registrada na configuracao. "
                                "Tentativa anterior de documentar por comentarios no proprio arquivo foi "
                                "descartada: o verificador nao aceita comentarios nem virgula final, e o "
                                "arquivo ficou invalido. A justificativa vive no roadmap (D-01)."),
    ("T021", ["src/components/medical/StatsCard.tsx", "src/components/medical/VitalSignsForm.tsx",
              "src/components/medical/PatientSearch.tsx"],
     "3 de 9 componentes clinicos convertidos; gate de tipos em 0 erros."),
    ("T022", ["src/components/appointments/TimeSlotPicker.tsx"],
     "1 de 2 componentes de agendamento convertidos; gate de tipos em 0 erros."),
]

with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, arquivos, obs in LINHAS:
        fh.write(json.dumps({"ts": NOW, "action": acao, "status": "partial",
                             "files": arquivos, "obs": obs}, ensure_ascii=False) + "\n")
print("progress.jsonl: %d linhas" % len(LINHAS))
