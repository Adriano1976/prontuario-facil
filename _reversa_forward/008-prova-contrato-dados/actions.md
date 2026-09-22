# Actions: Prova automatizada do contrato de dados

> Identificador: `008-prova-contrato-dados`
> Data: `2026-09-22`
> Roadmap: `_reversa_forward/008-prova-contrato-dados/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 13 |
| Paralelizáveis (`[//]`) | 0 |
| Maior cadeia de dependência | 6 elos |

> **Esta feature é inteiramente sequencial, e a razão é diferente da 005.** A 005 não tinha par
> porque as promessas viviam em **um componente**; aqui elas vivem em **um arquivo** — o arnês de
> provas negativas. Todas as ações de prova escrevem na mesma lista de casos, então o marcador
> `[//]` não aparece nenhuma vez, e a contagem declarada é **zero**.
>
> O que a feature entrega é pequeno em arquivos e grande em consequência: o arnês ganha a
> distinção entre caso que **deve ser recusado** e caso que **deve compilar**, e com ela o buraco
> declarado em `F-03` passa a ser **medido**. A guarda de codificação, que provava sem promessa,
> é adotada por registro.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Acrescentar ao arnês a distinção entre **caso que deve ser recusado** e **caso que deve compilar**, com um campo declarativo em cada caso, e conferir que os **9 casos existentes** continuam sendo recusados pelo motivo certo (D-03, R-01) | - | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Provar que a entidade sob RLS **não expõe leitura crua**: caso novo que recusa a listagem direta sobre a entidade escopada, citando o método ausente (`RF-02`) | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T003 | Provar `PT-010.2` em dois casos: atribuir papel à variante offline é recusado, e **extrair** o papel dela também (`RF-03`, `RF-04`). O segundo **substituiu** a comparação prevista — ver nota 15 | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T004 | Provar que um adaptador **incompleto** é recusado: caso novo que omite um dos gateways exigidos pelo contrato (`RF-05`) | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T005 | Provar `PT-010.4` nos conjuntos que o cenário nomeia: situação de **agendamento** e tipos **documentais**, cada um com um caso que atribui valor fora do conjunto (`RF-06`, D-06) | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Escrever o **caso positivo** que mede o buraco de `F-03`: escopo administrativo declarado por quem não é administrador **compila**, e o comando afirma isso em vez de acusar a ausência de recusa (`RF-15`, D-04) | T001 | - | `src/test/verificacoes-negativas.mjs` | 🟢 | [X] |
| T007 | Montar a tabela **caso × cenário** de `PT-010`, distinguindo o que é **citado** do que é **novo** e nomeando **o que não é coberto** (`RF-07`) | T006 | - | `_reversa_forward/008-prova-contrato-dados/onboarding.md` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Estender a matriz com o veredito dos **quatro** cenários de `PT-010`, citando os casos existentes por identificador e os novos pelo que provam (`RF-13`, D-01, D-02) | T006 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T009 | Registrar na matriz as **três cláusulas não verificadas** — autorização, retornos dos adaptadores e ponto de ligação — e o **ramo inalcançável** de `applyScope` (`RF-08`, `RF-09`, `RF-10`, `RF-11`, D-07, D-08) | T008 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |
| T010 | Registrar na matriz que a **guarda de codificação deixou de ser prova sem dono**, o destino do grupo `Contrato de dados (10)` e o saldo dos grupos restantes (`RF-12`, `RF-13`, D-05) | T009 | - | `_reversa_sdd/code-spec-matrix.md` | 🟢 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Revalidar os cinco comandos, conferir que nenhum arquivo de aplicação foi tocado e que a **contagem de verificações** da suíte não caiu (`RF-14`, R-07) | T006 | - | `_reversa_forward/008-prova-contrato-dados/onboarding.md` | 🟢 | [X] |
| T012 | Medir o tempo da suíte e registrar quantos casos o comando passou a ter, verificando que o gate continua rodando em **uma** passada por execução (`R-08`) | T011 | - | `_reversa_forward/008-prova-contrato-dados/onboarding.md` | 🟢 | [X] |
| T013 | Produzir o `regression-watch.md` da feature, cobrindo os pontos que passam a ser vigiados — incluindo os três limites do contrato e o buraco de `F-03` agora medido | T010, T011 | - | `_reversa_forward/008-prova-contrato-dados/regression-watch.md` | 🟢 | [X] |

## Notas de execução

Registradas pelo `/reversa-plan` para orientar o `/reversa-coding`:

1. **Nenhum arquivo de aplicação é tocado.** O único arquivo de **código** que muda é `src/test/verificacoes-negativas.mjs` — infraestrutura de prova. `src/api/`, `src/types/` e `src/lib/` são o **objeto** da prova, e ficam intocados. Se alguma ação parecer exigir mudança neles, algo saiu do escopo.
2. **`base44/entities/` intocado.** Regra de ouro do diff.
3. **Não toque nos 9 casos existentes (R-01).** Eles são prova **citada** por outras features — inclusive o `status-fora-do-conjunto`, que a 004 cita como prova do `RF-03` dela. A mudança no arnês é **aditiva**, e o comando é executado antes e depois.
4. **O caso positivo exige ZERO erros no arquivo dele (R-02).** Ele pode "passar" por acidente se houver erro não relacionado. Mantenha a fonte mínima, para que não exista outro motivo de erro.
5. **Cada caso declara o motivo pelo qual a recusa é a certa (R-04).** Trecho que a mensagem precisa citar, ou o código do erro. O comando já acusa "recusado, mas não pelo motivo esperado".
6. **Não melhore a guarda de codificação (R-05).** A decisão `3a` é de **registro**: reivindicar, não alterar. `mojibake.mjs` e `mojibake.test.mjs` ficam intocados.
7. **O caso positivo não fica versionado (R-06).** Ele é escrito e removido na mesma execução, como os negativos. Um arquivo permanente demonstrando a brecha seria um exemplo a ser copiado.
8. **A contagem de verificações da suíte não pode cair (R-07).** A referência é **132 verificações em 23 arquivos**, medidas no fecho da 006. Esta feature não altera arquivo de teste de unidade nenhum.
9. **A `_reversa_sdd/code-spec-matrix.md` é arquivo COMPARTILHADO (D-11, R-04).** A sessão que entregou a `007-matriz-paridade-visual` escreveu nela depois da minha última leitura. **Releia o arquivo do zero antes de cada edição** e nunca edite a partir de uma leitura anterior — foi esse descuido que produziu duas features numeradas `007`.
10. **O comando roda o gate de tipos duas vezes por execução** — uma com os casos, outra depois da limpeza, para provar a ausência de resíduo. Os casos novos **não** aumentam o número de passadas (R-08); o que cresce é o número de arquivos por passada.
11. **Se o comando for interrompido, apague `src/__negative_checks__/`.** A pasta é removida pelo próprio arnês ao final e no `finally`, mas uma interrupção dura pode deixá-la para trás — e aí o `typecheck` e o `lint` passariam a falhar por causa dela. A guarda de codificação **já ignora** essa pasta (ela está na lista de pastas ignoradas), então a guarda não acusa resíduo ali.
12. **Formato do marcador de status — sem crase, deliberadamente.** O template do `actions.md` envolve o status em crase, mas a tabela de detecção de estágio do Reversa procura a linha terminando em `| [ ] |` ou `| [X] |`, sem crase. Mesma divergência consciente registrada nas features 002 a 006.
13. **Marcador `[//]` só onde existe par — e aqui não existe nenhum.** Todas as ações de prova escrevem no mesmo arquivo, e as de integração escrevem na mesma matriz. Contagem conferida: **0 declarados, 0 marcados**. Não invente paralelismo entre ações que disputam o mesmo arquivo.
14. **Aviso de codificação, herdado da rodada 005.** Não faça round-trip de arquivo do projeto por cmdlet de texto do PowerShell: o `Get-Content`/`Set-Content` do PowerShell 5.1 decodifica arquivo sem BOM pela página ANSI e corrompe o arquivo ao regravar. Use a ferramenta de edição, ou `[System.IO.File]::ReadAllText`/`WriteAllText` com `UTF8Encoding($false)` explícito. E não escreva exemplo literal de mojibake em nota nenhuma: a guarda varre bytes e não distingue texto corrompido de texto que **cita** corrupção.

### Notas acrescentadas pelo `/reversa-coding`

15. **T003 MUDOU DE INSTRUMENTO, e a mudança é o achado.** O plano previa provar `PT-010.2` por **comparação** de papel sobre a variante offline (`usuario.role === 'admin'`). O caso **não era recusado**: o TypeScript permite comparar `undefined` com string, e a primeira execução o acusou como "NÃO foi recusado pelo gate". O caso foi substituído por **extração** do papel — devolver `usuario.role` onde se espera um `UserRole` —, recusado com TS2322, e é a formulação mais fiel ao achado `F-01`, que fala da ausência **estrutural** obrigando tratamento. O comentário dentro do caso registra a tentativa descartada, para que ninguém a repita.
16. **A tabela de medições da matriz foi estendida além do plano.** Ela estava **parada na feature 004** e não tinha as linhas das features 005 e 006 — as antecessoras atualizaram o `inventory.md` e os próprios roteiros, mas não a matriz. Deixar a matriz dizendo "90 verificações" enquanto a própria tabela de lacunas dizia 132 seria uma divergência dentro do mesmo arquivo. Foram acrescentadas as linhas que faltavam e a observação sobre o teto condicional.
17. **O comando precisa de acesso total no sandbox.** Ele spawna o `tsc` com `stdio` em pipe, e o modo confinado bloqueia isso com `EPERM` — a primeira execução da rodada falhou por esse motivo, e não por defeito do arnês. A guarda de encoding **não** tem essa dependência e roda em modo restrito.
18. **Resultado da rodada de fecho:** `prova:negativos` com **16 casos — 15 negativos e 1 positivo —, todos como esperado**, sem resíduo; `prova:encoding` com 438 arquivos íntegros; `typecheck` e `lint` com zero ocorrências; `npm test` com **132 verificações em 23 arquivos e 0 falhas**, em **74,83 s** de `Duration`. A contagem da suíte **não caiu** em relação às 132 da rodada 006, porque a feature não acrescenta verificação de unidade — ela acrescenta casos de compilação, que vivem noutro comando.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| `2026-09-22` | Versão inicial gerada por `/reversa-to-do` | reversa |
| `2026-09-22` | T003 teve o instrumento substituído (comparação → extração de papel); 13 ações marcadas como concluídas e notas 15 a 18 acrescentadas | `/reversa-coding` |

---
*Gerado pelo Reversa-To-Do em 2026-09-22.*
