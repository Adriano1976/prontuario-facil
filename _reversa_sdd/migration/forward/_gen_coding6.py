# -*- coding: utf-8 -*-
"""Registra a decisao de escopo e o novo modulo."""
import json, os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

LINHAS = [
    ["T021", "blocked", ["src/api/sessionScope.ts"],
     "DECISAO DE ESCOPO RESOLVIDA (opcao C, escolha do usuario): o escopo e resolvido pelo "
     "papel da sessao, preservando o comportamento atual nos dois modos. Implementado em "
     "src/api/sessionScope.ts. Verificacao negativa: 3 de 3 violacoes recusadas, incluindo "
     "o usuario offline NAO poder ser tratado como administrador. Destrava os 4 componentes "
     "que leem dados."],
    ["T018", "corrected", ["src/api/contract.ts", "src/api/entities.ts"],
     "Contrato corrigido em duas assinaturas que estavam menores que o uso real: "
     "logout passa a aceitar a URL de redirecionamento (AuthContext.jsx a informa) e "
     "logUserInApp recebe o nome da pagina (NavigationTracker.jsx o informa)."],
]

with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, status, arquivos, obs in LINHAS:
        fh.write(json.dumps({"ts": NOW, "action": acao, "status": status,
                             "files": arquivos, "obs": obs}, ensure_ascii=False) + "\n")
print("progress.jsonl: %d linhas" % len(LINHAS))
