# -*- coding: utf-8 -*-
"""Corrige dependencias com referencia para frente e recontagem do resumo.

Uma acao nao pode depender de ID maior que o proprio: a fase 2 (Testes) foi
escrita antes do nucleo existir, e as dependencias apontavam para o futuro.
Escrita atomica.
"""
import os
import re

TARGET = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript\actions.md"

SUBST = [
    # T007/T010/T011 dependiam de T012 (futuro): o que sustenta a verificacao da
    # leitura com escopo e o contrato (T025) e a implementacao (T027).
    ("| T007 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T012 |",
     "| T007 | Verificar por caso negativo que ler dado clínico sem declarar escopo não compila | T027 |"),
    ("| T010 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T012 |",
     "| T010 | Verificar por caso negativo que informar o dono manualmente num filtro já escopado não compila | T027 |"),
    ("| T011 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T012 |",
     "| T011 | Confirmar por uso correto que a leitura com escopo compila e aplica o filtro de dono | T027 |"),
    ("| T012 | Confirmar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T021, T022 |",
     "| T012 | Confirmar por caso negativo que as duas implementações de acesso a dados divergentes do contrato não compilam | T038, T039 |"),
    # T006 dependia de T008/T009: ambos sao verificacao negativa de contrato de
    # entidade, sustentados por T015 (paciente) e T016 (agendamento).
    ("| T006 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T008, T009 |",
     "| T006 | Verificar por caso negativo que consentimento aceito sem data ou sem endereço de rede não compila | T015, T016 |"),
    # O registro fechado precisa da camada de escopo para montar a entidade.
    ("| T026 | Declarar o registro fechado das 8 entidades, com verificação das implementações em tempo de compilação | T025, T036 |",
     "| T026 | Declarar o registro fechado das 8 entidades, com verificação das implementações em tempo de compilação | T025, T027 |"),
    # A tela consome o contrato, nao o adaptador (que vem depois, na integracao).
    ("| T030 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo | T028, T038 |",
     "| T030 | Converter a tela de pacientes e migrar suas leituras para a camada com escopo | T028, T026 |"),
]


def main():
    with open(TARGET, "r", encoding="utf-8") as fh:
        text = fh.read()

    for idx, (old, new) in enumerate(SUBST, start=1):
        if text.count(old) != 1:
            raise SystemExit("ABORTADO: substituicao %d nao casa 1 vez" % idx)
        text = text.replace(old, new)
        print("substituicao %d aplicada" % idx)

    # Recontagem a partir do conteudo final.
    linhas = [l for l in text.splitlines() if re.match(r"^\| T\d{3} \|", l)]
    par = [l for l in linhas if "`[//]`" in l]
    done = [l for l in linhas if l.rstrip().endswith("`[X]` |")]
    pend = [l for l in linhas if l.rstrip().endswith("`[ ]` |")]

    # Recalcular a maior cadeia de dependencia.
    deps = {}
    for l in linhas:
        cols = [c.strip() for c in l.split("|")]
        tid = cols[1]
        d = [x.strip() for x in cols[3].split(",") if x.strip() and x.strip() != "-"]
        deps[tid] = d

    memo = {}

    def depth(t):
        if t in memo:
            return memo[t]
        memo[t] = 0  # guarda contra ciclo
        if not deps.get(t):
            memo[t] = 1
            return 1
        memo[t] = 1 + max(depth(d) for d in deps[t])
        return memo[t]

    cadeia = max(depth(t) for t in deps)

    # Referencias para frente remanescentes?
    fwd = []
    for t, ds in deps.items():
        for d in ds:
            if d > t:
                fwd.append((t, d))

    text = re.sub(r"\| Total de ações \| \d+ \|", "| Total de ações | %d |" % len(linhas), text)
    text = re.sub(r"\| Paralelizáveis \(`\[//\]`\) \| \d+ \|",
                  "| Paralelizáveis (`[//]`) | %d |" % len(par), text)
    text = re.sub(r"\| Maior cadeia de dependência \| \d+ elos? \|",
                  "| Maior cadeia de dependência | %d elos |" % cadeia, text)

    tmp = TARGET + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, TARGET)

    print("gravado:", TARGET)
    print("total de acoes:", len(linhas))
    print("paralelizaveis:", len(par))
    print("concluidas:", len(done), "| pendentes:", len(pend))
    print("maior cadeia:", cadeia, "elos")
    print("referencias para frente remanescentes:", fwd if fwd else "nenhuma")


if __name__ == "__main__":
    main()
