# -*- coding: utf-8 -*-
import json, os, re
from datetime import datetime, timezone
FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
ACTIONS = os.path.join(FD, "actions.md")
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

EDITS = [
 ("| T021 | Converter os componentes clínicos para a linguagem tipada (9 componentes) | T020 | - | `src/components/medical/` | 🟢 | `[ ]` |",
  "| T021 | Converter os componentes clínicos para a linguagem tipada (9 componentes) | T020 | - | `src/components/medical/` | 🟢 | `[X]` |"),
 ("| T022 | Converter os componentes de agendamento para a linguagem tipada (2 componentes) | T020 | `[//]` | `src/components/appointments/` | 🟢 | `[ ]` |",
  "| T022 | Converter os componentes de agendamento para a linguagem tipada (2 componentes) | T020 | `[//]` | `src/components/appointments/` | 🟢 | `[X]` |"),
]

text = open(ACTIONS, encoding="utf-8").read()
for old, new in EDITS:
    assert text.count(old) == 1, "linha nao casa 1 vez: " + old[:40]
    text = text.replace(old, new)
tmp = ACTIONS + ".tmp"
open(tmp, "w", encoding="utf-8", newline="\n").write(text)
os.replace(tmp, ACTIONS)
print("T021 e T022 marcadas como concluidas")

LINHAS = [
 ["T021", "done", ["src/components/medical/ExamUploader.tsx",
                   "src/components/medical/PrescriptionEditor.tsx",
                   "src/components/medical/ConsultationTimeline.tsx",
                   "src/components/medical/ReportsView.tsx",
                   "src/components/ui/select.d.ts"],
  "T021 COMPLETA: 9 de 9 componentes clinicos convertidos. Declaracao do Select ganhou "
  "tipagem real do valor (texto), evitando asserção no consumidor. ReportsView passou a "
  "declarar escopo nas duas leituras. ConsultationTimeline: a ordenacao subtraia objetos "
  "de data; a forma explicita usa milissegundos, com resultado identico."],
 ["T022", "done", ["src/components/appointments/TimeSlotPicker.tsx",
                   "src/components/appointments/AppointmentCalendar.tsx"],
  "T022 COMPLETA: 2 de 2 componentes de agendamento convertidos."],
]
with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, status, arquivos, obs in LINHAS:
        fh.write(json.dumps({"ts": NOW, "action": acao, "status": status,
                             "files": arquivos, "obs": obs}, ensure_ascii=False) + "\n")
print("progress.jsonl atualizado")
