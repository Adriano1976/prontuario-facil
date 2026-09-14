# -*- coding: utf-8 -*-
"""Integra as respostas do /reversa-clarify no requirements.md da feature 001.

Edicoes cirurgicas: cada substituicao e verificada por contagem (deve ocorrer
exatamente 1 vez). Escrita atomica (tmp + rename). Gerador descartavel.
"""
import os
from datetime import datetime, timezone

ROOT = r"D:\Projetos\prontuario-facil"
TARGET = os.path.join(
    ROOT, "_reversa_forward", "001-migracao-typescript", "requirements.md"
)

hoje = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

EDITS = [
    # --- RF-13: dependencias ficam FORA do escopo (resposta 1b) ---
    (
        "| RF-13 | Dependências declaradas e não utilizadas são removidas | Could | Lista reconfirmada e removida com aprovação registrada | 🟡 |",
        "| RF-13 | ~~Dependências declaradas e não utilizadas são removidas~~ **Retirado do escopo** na sessão de esclarecimentos: a remoção não integra esta feature e fica registrada como pendência separada | — | n/a | 🟢 |",
    ),
    (
        "| RF-13 | Could | Não bloqueia a conclusão; exige confirmação de escopo |",
        "| RF-13 | Won't | Retirado do escopo por decisão humana: a remoção das dependências não utilizadas não pertence a esta feature |",
    ),
    # --- Paridade: roteiro manual derivado dos cenarios existentes (resposta 2a) ---
    (
        "| Paridade | Nenhuma alteração de comportamento observável é introduzida | Regra de ouro do plano de migração; projeto sem testes automatizados | 🟢 |",
        "| Paridade | Nenhuma alteração de comportamento observável é introduzida, e a paridade é comprovada por verificação de tipos somada a roteiro manual de fumaça derivado dos 26 cenários já existentes em `_reversa_sdd/migration/parity_tests/` | Regra de ouro do plano; projeto sem testes automatizados e sem dependência nova autorizada | 🟢 |",
    ),
    # --- Limites de alcance: registrar as duas decisoes ---
    (
        "- Não são introduzidos componentes, produtos ou serviços novos. 🟢",
        "- Não são introduzidos componentes, produtos ou serviços novos; em particular, "
        "**nenhum arcabouço de teste automatizado é adicionado** nesta feature. 🟢\n"
        "- A paridade de comportamento é atestada por roteiro manual de fumaça derivado dos "
        "26 cenários de paridade já existentes, **não** por execução automatizada. A "
        "expressão \"paridade comprovada\" não deve ser usada: a evidência é verificável, "
        "mas manual. 🟢",
    ),
    # --- Gherkin: explicitar como a paridade e atestada ---
    (
        "Cenário: Comportamento preservado após a conversão\n"
        "  Dado o sistema convertido\n"
        "  Quando a verificação por módulo é executada\n"
        "  Então nenhuma diferença observável de comportamento é introduzida",
        "Cenário: Comportamento preservado após a conversão\n"
        "  Dado o sistema convertido\n"
        "  Quando a verificação por módulo é executada\n"
        "  Então nenhuma diferença observável de comportamento é introduzida\n"
        "\n"
        "Cenário: Paridade atestada por roteiro manual\n"
        "  Dado o sistema convertido e o roteiro de fumaça derivado dos cenários de paridade\n"
        "  Quando o responsável executa o roteiro no módulo convertido\n"
        "  Então cada cenário do roteiro é registrado como conforme ou divergente\n"
        "  E nenhuma divergência permanece sem tratamento antes de avançar de módulo",
    ),
    # --- Secao 9: registrar a sessao ---
    (
        "> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.",
        "### Sessão " + hoje + "\n"
        "\n"
        "- **Q:** As 14 dependências declaradas e não utilizadas entram no escopo desta feature?\n"
        "  **R:** Não. Ficam fora do escopo; a remoção é registrada como pendência separada. "
        "Consequência: RF-13 retirado, prioridade passa a `Won't`.\n"
        "- **Q:** Com o que a paridade de comportamento será comprovada?\n"
        "  **R:** Verificação de tipos somada a roteiro manual de fumaça derivado dos 26 "
        "cenários Gherkin já existentes em `_reversa_sdd/migration/parity_tests/`. Nenhuma "
        "dependência nova é introduzida e nenhum arcabouço de teste é adicionado.\n"
        "- **Q:** O modo estrito se aplica aos componentes de interface herdados de biblioteca?\n"
        "  **R:** Estrito em todo o código-fonte, **exceto** a pasta de componentes de interface "
        "herdados, cuja exclusão é registrada e justificada por escrito no próprio arquivo de "
        "configuração da verificação.",
    ),
    # --- Secao 10: nao ha mais duvida; sobra a pendencia transferida ---
    (
        "- 🔴 [DÚVIDA] **Escopo da remoção de dependências declaradas e não utilizadas.**\n"
        "  Foram identificadas 14 dependências de execução sem nenhum uso no código-fonte.\n"
        "  Removê-las é seguro em tese, mas exige sua aprovação explícita e reconfirmação.\n"
        "  Entra nesta feature (RF-13) ou fica fora do escopo?\n"
        "- 🔴 [DÚVIDA] **Verificação de comportamento após a conversão.** O projeto não\n"
        "  possui nenhum teste automatizado, e a paridade de comportamento é requisito\n"
        "  (regra de ouro). Com o que a paridade deve ser comprovada: apenas verificação de\n"
        "  tipos somada a roteiro manual de fumaça, ou introduzimos algum teste automatizado\n"
        "  nesta feature — o que acrescenta uma dependência nova, hoje proibida pelo plano?\n"
        "- 🔴 [DÚVIDA] **Alcance do modo estrito na camada de interface.** A verificação\n"
        "  estrita sobre os componentes de interface herdados de biblioteca pode exigir\n"
        "  muitos ajustes de baixo valor. Aplicamos modo estrito a todo o código-fonte\n"
        "  (RF-09) ou excluímos explicitamente a biblioteca de interface, registrando a\n"
        "  exclusão?",
        "Nenhuma lacuna em aberto. As três dúvidas do documento inicial foram resolvidas na "
        "sessão de esclarecimentos acima.\n"
        "\n"
        "### Pendência transferida para fora desta feature\n"
        "\n"
        "- 🟡 **Remoção das 14 dependências declaradas e não utilizadas** "
        "(`@stripe/react-stripe-js`, `@stripe/stripe-js`, `react-leaflet`, `jspdf`, "
        "`html2canvas`, `lodash`, `react-quill`, `three`, `react-markdown`, `canvas-confetti`, "
        "`@hello-pangea/dnd`, `@radix-ui/react-toast`, `zod`, `@hookform/resolvers`). "
        "Não pertence a esta feature. Exige reconfirmação por busca no código-fonte e "
        "aprovação explícita antes de qualquer remoção (plano original, RISK-006).",
    ),
    # --- Secao 11: historico ---
    (
        "| " + hoje + " | Registrado o ponto de partida correto (1.324 erros) e os limites explícitos de alcance da verificação de tipos | reversa |",
        "| " + hoje + " | Registrado o ponto de partida correto (1.324 erros) e os limites explícitos de alcance da verificação de tipos | reversa |\n"
        "| " + hoje + " | Sessão de esclarecimentos: 3 dúvidas resolvidas. RF-13 retirado do escopo; paridade passa a ser atestada por roteiro manual; exclusão da biblioteca de interface registrada | reversa-clarify |",
    ),
]


def main():
    with open(TARGET, "r", encoding="utf-8") as fh:
        text = fh.read()

    for idx, (old, new) in enumerate(EDITS, start=1):
        count = text.count(old)
        if count != 1:
            raise SystemExit(
                "ABORTADO: edicao %d casa %d vezes (esperado 1). Nada foi gravado."
                % (idx, count)
            )
        text = text.replace(old, new)
        print("edicao %d aplicada" % idx)

    if "[DÚVIDA]" in text:
        raise SystemExit("ABORTADO: ainda restam marcadores [DUVIDA]. Nada foi gravado.")

    tmp = TARGET + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, TARGET)
    print("gravado (atomico):", TARGET)
    print("marcadores [DUVIDA] restantes:", text.count("[DÚVIDA]"))


if __name__ == "__main__":
    main()
