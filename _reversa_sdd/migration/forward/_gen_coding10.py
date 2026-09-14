# -*- coding: utf-8 -*-
"""Fecha a acao T023 (telas de pacientes) e registra o progresso."""
import json
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
ACTIONS = os.path.join(FD, "actions.md")
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

ANTIGO = (
    "| T023 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo "
    "| T021, T020 | - | `src/pages/Patients.jsx`, `src/pages/PatientForm.jsx` | 🟢 | `[ ]` |"
)
NOVO = (
    "| T023 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo "
    "| T021, T020 | - | `src/pages/Patients.tsx`, `src/pages/PatientForm.tsx` | 🟢 | `[X]` |"
)

with open(ACTIONS, encoding="utf-8") as fh:
    text = fh.read()
if text.count(ANTIGO) != 1:
    raise SystemExit("ABORTADO: linha de T023 nao casa 1 vez")
text = text.replace(ANTIGO, NOVO)
tmp = ACTIONS + ".tmp"
with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
    fh.write(text)
os.replace(tmp, ACTIONS)
print("T023 marcada como concluida")

OBS = (
    "T023 COMPLETA: Patients e PatientForm convertidos; os dois .jsx antigos removidos "
    "(estavam versionados e intactos, conforme a opcao (a) do usuario). "
    "Leituras migradas para a camada com escopo (listOwned / filterOwned). "
    "VERIFICACAO NEGATIVA DO LGPD com a forma REAL de payload do formulario: 4 de 4 "
    "violacoes recusadas - consentimento aceito sem data, sem endereco de rede, campo "
    "obrigatorio ausente, e genero em forma abreviada ('M'). Esta ultima confirma que o "
    "formulario nao pode gravar a forma que o seed offline usa. "
    "calculateAge preservada como copia: extrair para modulo compartilhado e mudanca de "
    "ESTRUTURA, fora do escopo 'so tipos'."
)

with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    fh.write(
        json.dumps(
            {
                "ts": NOW,
                "action": "T023",
                "status": "done",
                "files": [
                    "src/pages/Patients.tsx",
                    "src/pages/PatientForm.tsx",
                ],
                "obs": OBS,
            },
            ensure_ascii=False,
        )
        + "\n"
    )
print("progress.jsonl atualizado")
