# -*- coding: utf-8 -*-
"""Validacao independente do actions.md: grafo de dependencias e contagens."""
import re

P = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript\actions.md"

text = open(P, encoding="utf-8").read()
rows = [l for l in text.splitlines() if re.match(r"^\| T\d{3} \|", l)]

deps = {}
done = par = 0
for l in rows:
    c = [x.strip() for x in l.split("|")]
    tid = c[1]
    deps[tid] = [x.strip() for x in c[3].split(",") if x.strip() not in ("", "-")]
    if l.rstrip().endswith("`[X]` |"):
        done += 1
    if "`[//]`" in l:
        par += 1

fwd = [(t, d) for t, ds in deps.items() for d in ds if d > t]
missing = [(t, d) for t, ds in deps.items() for d in ds if d not in deps]

memo = {}


def dep(t):
    if t in memo:
        return memo[t]
    memo[t] = 1
    if deps[t]:
        memo[t] = 1 + max(dep(x) for x in deps[t])
    return memo[t]


print("total de acoes   :", len(rows))
print("paralelizaveis   :", par)
print("concluidas       :", done)
print("pendentes        :", len(rows) - done)
print("IDs unicos       :", "sim" if len(set(deps)) == len(rows) else "NAO")
print("maior cadeia     :", max(dep(t) for t in deps), "elos")
print("ref. para frente :", fwd if fwd else "NENHUMA")
print("dep. inexistentes:", missing if missing else "NENHUMA")
print("arquivos distintos entre paralelos:")
alvos = {}
for l in rows:
    if "`[//]`" in l:
        c = [x.strip() for x in l.split("|")]
        alvos.setdefault(c[5], []).append(c[1])
colisao = {k: v for k, v in alvos.items() if len(v) > 1}
print("  ", colisao if colisao else "nenhuma colisao de arquivo alvo")
