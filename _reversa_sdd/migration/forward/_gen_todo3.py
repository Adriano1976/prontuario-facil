# -*- coding: utf-8 -*-
"""Ajustes finais do actions.md, com validacao embutida antes de gravar.

Corrige:
1. T037 (Fase 3) dependia de T038/T039 (Fase 4) - referencia para frente.
   Movida para a Fase 4, depois dos adaptadores que ela verifica.
2. T031/T032/T036 eram paralelas com o MESMO arquivo alvo, o que viola a regra
   do marcador [//]. Cada verificacao negativa recebe arquivo proprio.
3. Recontagem do resumo a partir do conteudo final.
"""
import os
import re

TARGET = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript\actions.md"

LINHA_T037 = "| T037 | Verificar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T038, T039 | - | arquivo de verificação negativa | 🟢 | `[ ]` |"

LINHA_T037_NOVA = "| T037 | Verificar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T038, T039 | `[//]` | verificação negativa do contrato de dados | 🟢 | `[ ]` |"

SUBST = [
    # Arquivos alvo distintos para as paralelas da Fase 3.
    ("| T031 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T008 | `[//]` | arquivo de verificação negativa |",
     "| T031 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T008 | `[//]` | verificação negativa do consentimento |"),
    ("| T032 | Verificar por caso negativo que valor fora dos conjuntos fechados de status e tipo não compila | T009, T010 | `[//]` | arquivo de verificação negativa |",
     "| T032 | Verificar por caso negativo que valor fora dos conjuntos fechados de status e tipo não compila | T009, T010 | `[//]` | verificação negativa dos conjuntos fechados |"),
    ("| T036 | Verificar por caso negativo que nome de entidade inexistente não compila | T020 | `[//]` | arquivo de verificação negativa |",
     "| T036 | Verificar por caso negativo que nome de entidade inexistente não compila | T020 | `[//]` | verificação negativa do registro de entidades |"),
    ("| T033 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T019 | - | arquivo de verificação negativa |",
     "| T033 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T019 | - | verificação negativa do escopo |"),
    ("| T034 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T019 | - | arquivo de verificação negativa |",
     "| T034 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T019 | - | verificação negativa do filtro escopado |"),
    ("| T035 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T019 | - | arquivo de verificação negativa |",
     "| T035 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T019 | - | verificação de uso correto |"),
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

    cadeia = max(dep(t) for t in deps) if deps else 0
    alvos = {}
    for l in rows:
        if "`[//]`" in l:
            c = [x.strip() for x in l.split("|")]
            alvos.setdefault(c[5], []).append(c[1])
    colisao = {k: v for k, v in alvos.items() if len(v) > 1}
    return dict(total=len(rows), par=par, done=done, cadeia=cadeia,
                fwd=fwd, missing=missing, colisao=colisao)


def main():
    with open(TARGET, "r", encoding="utf-8") as fh:
        text = fh.read()

    for idx, (old, new) in enumerate(SUBST, start=1):
        if text.count(old) != 1:
            raise SystemExit("ABORTADO: substituicao %d nao casa 1 vez" % idx)
        text = text.replace(old, new)

    # Mover T037 da Fase 3 para o fim da Fase 4 (depois de T038/T039).
    if text.count(LINHA_T037) != 1:
        raise SystemExit("ABORTADO: linha de T037 nao encontrada exatamente 1 vez")
    text = text.replace(LINHA_T037 + "\n", "")
    ancora = "| T041 | Converter os arquivos auxiliares restantes para a linguagem tipada, preservando o comportamento |"
    i = text.index(ancora)
    fim = text.index("\n", i) + 1
    text = text[:fim] + LINHA_T037_NOVA + "\n" + text[fim:]

    m = contar(text)
    if m["fwd"] or m["missing"] or m["colisao"]:
        raise SystemExit("ABORTADO: validacao falhou -> %s" % m)

    text = re.sub(r"\| Total de ações \| \d+ \|", "| Total de ações | %d |" % m["total"], text)
    text = re.sub(r"\| Paralelizáveis \(`\[//\]`\) \| \d+ \|",
                  "| Paralelizáveis (`[//]`) | %d |" % m["par"], text)
    text = re.sub(r"\| Maior cadeia de dependência \| \d+ elos? \|",
                  "| Maior cadeia de dependência | %d elos |" % m["cadeia"], text)

    # A Fase 3 nao tem mais T037; renomear a secao nao e necessario (segue "Testes").
    tmp = TARGET + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, TARGET)

    print("gravado:", TARGET)
    for k in ("total", "par", "done", "cadeia"):
        print("  %-9s: %s" % (k, m[k]))
    print("  pendentes:", m["total"] - m["done"])
    print("  ref. para frente:", m["fwd"] or "NENHUMA")
    print("  dep. inexistentes:", m["missing"] or "NENHUMA")
    print("  colisao de alvo [//]:", m["colisao"] or "NENHUMA")


if __name__ == "__main__":
    main()
