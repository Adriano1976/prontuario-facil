# -*- coding: utf-8 -*-
"""Marca as acoes T037 e T038 como concluidas e registra o progresso.

Escrita atomica no actions.md; append-only no progress.jsonl.
"""
import json
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
ACTIONS = os.path.join(FD, "actions.md")
PROGRESS = os.path.join(FD, "progress.jsonl")

EDITS = [
    (
        "| T037 | Converter o cliente online para a linguagem tipada, satisfazendo o contrato | T020 | - | `src/api/base44Client.js` | 🟢 | `[ ]` |",
        "| T037 | Converter o cliente online para a linguagem tipada, satisfazendo o contrato | T020 | - | `src/api/base44Client.ts` | 🟢 | `[X]` |",
    ),
    (
        "| T038 | Converter o cliente offline para a linguagem tipada, satisfazendo o mesmo contrato | T020 | - | `src/api/mockClient.js` | 🟢 | `[ ]` |",
        "| T038 | Converter o cliente offline para a linguagem tipada, satisfazendo o mesmo contrato | T020 | - | `src/api/mockClient.ts` | 🟢 | `[X]` |",
    ),
]

NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def main():
    with open(ACTIONS, "r", encoding="utf-8") as fh:
        text = fh.read()
    for idx, (old, new) in enumerate(EDITS, start=1):
        if text.count(old) != 1:
            raise SystemExit("ABORTADO: edicao %d nao casa 1 vez" % idx)
        text = text.replace(old, new)
    tmp = ACTIONS + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, ACTIONS)
    print("actions.md atualizado")

    linhas = [
        {
            "ts": NOW,
            "action": "T037",
            "status": "done",
            "files": ["src/api/base44Client.ts", "src/vite-env.d.ts"],
            "obs": "Adaptador do SDK real ligado ao contrato; gate de tipos em 0 erros",
        },
        {
            "ts": NOW,
            "action": "T038",
            "status": "done",
            "files": ["src/api/mockClient.ts", "src/api/entities.ts", "src/api/contract.ts"],
            "obs": "Adaptador offline ligado ao mesmo contrato; gate de tipos em 0 erros",
        },
    ]
    with open(PROGRESS, "a", encoding="utf-8", newline="\n") as fh:
        for l in linhas:
            fh.write(json.dumps(l, ensure_ascii=False) + "\n")
    print("progress.jsonl: %d linhas acrescentadas" % len(linhas))


if __name__ == "__main__":
    main()
