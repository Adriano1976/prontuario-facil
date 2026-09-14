# -*- coding: utf-8 -*-
"""Registra a conversao do AuthContext no rastro da feature."""
import json
import os
from datetime import datetime, timezone

FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

LINHAS = [
    [
        "T023",
        "partial",
        [
            "src/lib/AuthContext.tsx",
            "src/api/contract.ts",
            "src/api/base44Client.ts",
            "src/api/mockClient.ts",
            "src/api/entities.ts",
        ],
        "AuthContext convertido (opcao b escolhida pelo usuario). Tres mudancas de forma, "
        "sem efeito observavel: (1) as configuracoes publicas passam pelo contrato "
        "(getPublicSettings), em vez de o contexto importar caminho INTERNO do SDK; "
        "(2) o usuario da sessao passa por toSessionUser, ponto unico de conversao para o "
        "tipo de dominio; (3) o contexto ganhou tipo explicito (AuthContextValue). "
        "ERRO DE PARIDADE CORRIGIDO NO MEIO: eu havia trocado a condicao de verificacao de "
        "sessao (o legado usa o TOKEN, nao o identificador da aplicacao) - isso mudaria "
        "quem e autenticado. Corrigido com hasSessionToken, exposto pela camada de dados.",
    ],
]

with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, status, arquivos, obs in LINHAS:
        fh.write(
            json.dumps(
                {"ts": NOW, "action": acao, "status": status, "files": arquivos, "obs": obs},
                ensure_ascii=False,
            )
            + "\n"
        )
print("progress.jsonl atualizado")
