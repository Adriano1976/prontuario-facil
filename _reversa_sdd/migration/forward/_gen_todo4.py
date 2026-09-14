# -*- coding: utf-8 -*-
"""Nomes de arquivo alvo por acao na fase de Testes + validacao do grafo.

Regra do marcador [//]: tarefas paralelas nao podem compartilhar arquivo alvo.
As 3 acoes paralelas da fase de Testes recebem arquivos distintos. As nao
paralelas podem compartilhar, mas recebem nome proprio por clareza.
"""
import os
import re

TARGET = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript\actions.md"

# (id da acao, novo nome de arquivo alvo)
ALVOS = [
    ("T031", "verificação negativa do consentimento"),
    ("T032", "verificação negativa dos conjuntos fechados"),
    ("T033", "verificação negativa do escopo de leitura"),
    ("T034", "verificação negativa do filtro escopado"),
    ("T035", "verificação de uso correto"),
    ("T036", "verificação negativa do registro de entidades"),
]


def contar(text):
    rows = [l for l in text.splitlines() if re.match(r"^\| T\d{3} \|", l)]
    deps = {}
    done = par = 0
    for l in rows:
        c = [x.strip() for x in l.split("|")]
        deps[c[1]] = [x.strip() for x in c[3].split(",") if x.strip() not in ("", "-")]
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

    alvos = {}
    for l in rows:
        if "`[//]`" in l:
            c = [x.strip() for x in l.split("|")]
            alvos.setdefault(c[5], []).append(c[1])
    return dict(total=len(rows), par=par, done=done,
                cadeia=max(dep(t) for t in deps) if deps else 0,
                fwd=fwd, missing=missing,
                colisao={k: v for k, v in alvos.items() if len(v) > 1})


def main():
    with open(TARGET, "r", encoding="utf-8") as fh:
        text = fh.read()

    for tid, novo in ALVOS:
        padrao = re.compile(
            r"^(\| " + tid + r" \| .*?\| )(arquivo de verificação negativa)( \| .*)$",
            re.M,
        )
        text, n = padrao.subn(lambda m: m.group(1) + novo + m.group(3), text)
        if n != 1:
            raise SystemExit("ABORTADO: %s -> %d ocorrencias (esperado 1)" % (tid, n))
        print("%s -> %s" % (tid, novo))

    if "arquivo de verificação negativa" in text:
        raise SystemExit("ABORTADO: sobrou nome generico")

    m = contar(text)
    if m["fwd"] or m["missing"] or m["colisao"]:
        raise SystemExit("ABORTADO: validacao falhou -> %s" % m)

    text = re.sub(r"\| Total de ações \| \d+ \|", "| Total de ações | %d |" % m["total"], text)
    text = re.sub(r"\| Paralelizáveis \(`\[//\]`\) \| \d+ \|",
                  "| Paralelizáveis (`[//]`) | %d |" % m["par"], text)
    text = re.sub(r"\| Maior cadeia de dependência \| \d+ elos? \|",
                  "| Maior cadeia de dependência | %d elos |" % m["cadeia"], text)

    tmp = TARGET + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, TARGET)

    print()
    print("gravado:", TARGET)
    print("  total de acoes   :", m["total"])
    print("  paralelizaveis   :", m["par"])
    print("  concluidas       :", m["done"])
    print("  pendentes        :", m["total"] - m["done"])
    print("  maior cadeia     :", m["cadeia"], "elos")
    print("  ref. p/ frente   :", m["fwd"] or "NENHUMA")
    print("  dep. inexistente :", m["missing"] or "NENHUMA")
    print("  colisao de alvo  :", m["colisao"] or "NENHUMA")


if __name__ == "__main__":
    main()
