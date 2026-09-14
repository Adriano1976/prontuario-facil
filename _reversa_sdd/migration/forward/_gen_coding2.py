# -*- coding: utf-8 -*-
"""Registra o progresso parcial das acoes T021/T022 e o achado dos tipos de interface."""
import json
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
PROGRESS = os.path.join(FD, "progress.jsonl")
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

LINHAS = [
    {
        "ts": NOW,
        "action": "T021",
        "status": "partial",
        "files": ["src/components/medical/StatsCard.tsx"],
        "obs": "1 de 9 componentes convertidos. Os 8 restantes dependem de decisao sobre escopo de leitura e tipos de interface.",
    },
    {
        "ts": NOW,
        "action": "T022",
        "status": "partial",
        "files": ["src/components/appointments/TimeSlotPicker.tsx"],
        "obs": "1 de 2 componentes convertidos; AppointmentCalendar pendente.",
    },
    {
        "ts": NOW,
        "action": "T021",
        "status": "blocked",
        "files": ["src/components/ui/*.d.ts"],
        "obs": "Achado: componentes de interface herdados nao tinham tipo inferivel, impedindo NOSSO codigo de compilar. Resolvido com 19 declaracoes de sombreamento (padrao *.d.ts ao lado do *.jsx). Verificacao negativa: 4 de 4 props invalidas recusadas. Reconhecido no roadmap como desdobramento da decisao D-01.",
    },
]

with open(PROGRESS, "a", encoding="utf-8", newline="\n") as fh:
    for l in LINHAS:
        fh.write(json.dumps(l, ensure_ascii=False) + "\n")
print("progress.jsonl: %d linhas" % len(LINHAS))
