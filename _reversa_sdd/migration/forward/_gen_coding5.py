# -*- coding: utf-8 -*-
"""Registra os componentes presentacionais convertidos."""
import json, os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

LINHAS = [
    ("T021", ["src/components/medical/LGPDConsent.tsx"],
     "Componente de consentimento convertido. 4 de 9 clinicos prontos; gate em 0 erros. "
     "Declaracao do Checkbox ganhou tipagem real do estado indeterminado."),
    ("T022", ["src/components/appointments/AppointmentCalendar.tsx"],
     "Componente de calendario convertido. T022 COMPLETA (2 de 2); gate em 0 erros."),
]

with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, arquivos, obs in LINHAS:
        status = "done" if acao == "T022" else "partial"
        fh.write(json.dumps({"ts": NOW, "action": acao, "status": status,
                             "files": arquivos, "obs": obs}, ensure_ascii=False) + "\n")
print("progress.jsonl: %d linhas" % len(LINHAS))
