# -*- coding: utf-8 -*-
import json, os
from datetime import datetime, timezone
FD = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript"
NOW = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
LINHAS = [
  ["T021", "partial",
   ["src/components/medical/AccessLogger.ts", "src/lib/session.ts",
    "src/api/sessionScope.ts", "src/api/registry.ts"],
   "Registrador de auditoria convertido. Criado src/lib/session.ts como ponto unico de "
   "conversao da identidade da sessao para o tipo de dominio. Achado: a gravacao na trilha "
   "de auditoria e feita por QUALQUER autenticado, so a LEITURA e restrita a admin "
   "(BR-MIGRAR-024) - usar asAdmin para gravar declararia escopo errado. Acrescentado "
   "asUser ao contrato de leitura aberta. details e TEXTO, nao objeto. 5 de 9 clinicos prontos."],
]
with open(os.path.join(FD, "progress.jsonl"), "a", encoding="utf-8", newline="\n") as fh:
    for acao, status, arquivos, obs in LINHAS:
        fh.write(json.dumps({"ts": NOW, "action": acao, "status": status,
                             "files": arquivos, "obs": obs}, ensure_ascii=False) + "\n")
print("progress.jsonl: %d linhas" % len(LINHAS))
