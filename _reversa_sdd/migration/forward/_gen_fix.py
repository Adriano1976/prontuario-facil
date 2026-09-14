# -*- coding: utf-8 -*-
"""Ultimos ajustes de consistencia pos-clarify. Escrita atomica."""
import os

TARGET = r"D:\Projetos\prontuario-facil\_reversa_forward\001-migracao-typescript\requirements.md"

EDITS = [
    (
        "Cenário: Verificação integral sem erros\n"
        "  Dado o código-fonte integralmente convertido\n"
        "  Quando a verificação estrita de tipos é executada sobre todo o código-fonte\n"
        "  Então ela termina sem nenhum erro",
        "Cenário: Verificação integral sem erros\n"
        "  Dado o código-fonte integralmente convertido\n"
        "  Quando a verificação estrita de tipos é executada sobre todo o código-fonte,\n"
        "  exceto a pasta de componentes de interface herdados de biblioteca\n"
        "  Então ela termina sem nenhum erro",
    ),
    (
        "| RF-09 | Must | É o critério final de conclusão |",
        "| RF-09 | Must | É o critério final de conclusão, ressalvada a exclusão registrada da pasta de componentes herdados |",
    ),
]


def main():
    with open(TARGET, "r", encoding="utf-8") as fh:
        text = fh.read()
    for idx, (old, new) in enumerate(EDITS, start=1):
        if text.count(old) != 1:
            raise SystemExit("ABORTADO: edicao %d nao casa exatamente 1 vez" % idx)
        text = text.replace(old, new)
        print("edicao %d aplicada" % idx)
    tmp = TARGET + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, TARGET)
    print("gravado:", TARGET)
    print("marcadores restantes:", text.count("[DÚVIDA]"))


if __name__ == "__main__":
    main()
