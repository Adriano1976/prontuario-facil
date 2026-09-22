# Interface: Logs de Acesso — MedRecord

## Tela: Logs de Acesso
Tabela de auditoria e conformidade LGPD para rastreamento de acessos aos dados sensíveis de pacientes.

### Elementos de Interface
- **Tabela de Auditoria:**
  - **Data/Hora:** Timestamp legível com data e hora exata da ação (ex: `28/08/2026 02:34:08`).
  - **Usuário:** Identificação/E-mail do operador do sistema com ícone de perfil (ex: `adrianosantos.git@g...`).
  - **Ação:** Badge de identificação do evento:
    - `Login` (Badge azul com ícone de entrada `->]`)
    - `Visualizar Consulta` (Badge verde claro com ícone de olho)
    - `Visualizar Paciente` (Badge verde claro com ícone de olho)
  - **Paciente:** Nome do paciente associado ao registro de visualização (ex: `Adriano Santos`, `Neide Ferreira`), ou `-` quando não aplicável (ex: no Login).
  - **Detalhes:** Descrição complementar do evento (ex: "Acesso ao dashboard" ou `-`).
- **Paginação:** A implementação atual carrega até 500 registros e renderiza todos os filtrados no cliente; não há controles de paginação. A política desejada para volumes acima desse limite permanece pendente. 🔴

---
*Gerado pelo Reversa-Visor em 2026-08-27.*

---

## Documentação visual a partir das capturas de tela — 2026-09-22

> Segunda passada do Visor, agora sobre a imagem fornecida pelo usuário em `logs-acesso/screenshots/`.
> A seção acima foi preservada integralmente (diretiva non-destructive); o que segue é a leitura forense da imagem.
> Capturas nesta unit: **1**.

### Tela: Logs de Acesso — `screenshots/tela_logs_acesso.png`

- **Propósito**: auditar quem acessou o quê, quando e por qual ação — evidência de conformidade LGPD. 🟢
- **Estado da tela**: `preenchido` — 254 registros. 🟢
- **Contexto de uso**: item "Logs de Acesso" do menu (ativo na captura). 🟢
- **Captura**: **1732×15029 px** — captura de página inteira, com rolagem completa da tabela. ⚠️ *Não serve como golden de comparação pixel a pixel (ver recomendação no fim desta seção).* 🟢

**Cabeçalho**: seta **"←"**; ícone; título **"Logs de Acesso"**; subtítulo **"Auditoria e conformidade de ações LGPD"** 🟡 *(corpo pequeno)*. Sem botão de ação primário. 🟢

**Busca e filtros**
- Input de busca com lupa e placeholder **"Buscar por paciente, usuário ou ação..."** 🟡 *(texto pequeno; leitura parcial)*. 🟢
- Select **"Todas as Ações"** (ícone de funil) e select **"Todas as datas"** (ícone de calendário) à direita. 🟢

**Quatro KPI cards** (rótulo pequeno acima, valor grande abaixo, ícone colorido à direita) — ⚠️ **elemento não descrito na seção anterior**:

| Rótulo | Valor | Ícone |
|---|---|---|
| Total de logs 🟡 | **254** | escuro |
| Visualizações | **65** | verde |
| Logins | **9** | âmbar |
| Exclusões | **0** | vermelho |

🟢 *(valores e cores)* / 🟡 *(o rótulo do primeiro card tem corpo pequeno; lê-se "Total de logs")*

**Tabela de auditoria** — colunas: **Data/Hora**, **Usuário**, **Ação**, **Paciente**, **Detalhes**. 🟢

- **Data/Hora**: duas linhas por célula — data (`23/09/2026`) em destaque e hora (`14:00`) em cinza abaixo. 🟢
- **Usuário**: ícone de pessoa + e-mail truncado com reticências, ex. **"adrianosantos.git@g..."**; também aparece **"neide.ferreira@g..."**. Exibido sempre na mesma coluna, sem avatar. 🟢
- **Ação** — selos observados na captura:

  | Selo | Cor | Ícone |
  |---|---|---|
  | Login | azul | seta de entrada 🟡 |
  | Visualizar Consulta | verde | olho |
  | Visualizar Paciente | verde | olho |
  | Criar Consulta | azul | documento 🟡 |
  | Editar Paciente | âmbar | lápis 🟡 |

  🟢 *(rótulos e cores)* / 🟡 *(ícones: pequenos, leitura parcial)*
  ⚠️ **"Criar Consulta"** e **"Editar Paciente"** não constavam da seção anterior — a enumeração de ações é maior do que a documentada.
- **Paciente**: nome do paciente associado quando a ação é sobre prontuário (**Neide Ferreira**, **Adriano Santos**, **Roberto Santos**); **"-"** quando não se aplica (ex.: Login). 🟢
- **Detalhes**: **"Acesso ao dashboard"** nos registros de Login e **"-"** nos demais. 🟢
- **Ordenação**: decrescente por data/hora — a captura começa em **23/09/2026 14:00** e termina em **17/09/2026**. 🟢

**Fim da página**: após a última linha, a captura tem uma grande área branca — **não há controles de paginação, rodapé de total nem botão "carregar mais"**. 🟢 Isso confirma, por evidência visual, a observação da seção anterior (renderização de todos os filtrados no cliente, sem paginação).

**Lacunas desta tela**
- 🔴 Enumeração completa das ações possíveis (a captura mostra cinco; pode haver mais).
- 🔴 Opções dos selects "Todas as Ações" e "Todas as datas".
- 🔴 Se o KPI "Exclusões" conta exclusões de registros de prontuário, de logs ou ambas.
- 🔴 Critério de escopo: a captura é do usuário `adrianosantos.git@gmail.com`; não é possível saber pela imagem se outro perfil vê registros de terceiros (a RLS do servidor não é observável no cliente).
- 🔴 Estado vazio (nenhum log).

### Recomendações para uso desta captura

1. **Não usar como golden de paridade pixel a pixel**: 15029 px de altura com dados dinâmicos (254 registros variáveis) torna qualquer comparação não determinística. Para paridade visual, capturar a **viewport** (ex.: 1732×1080) com massa fixa de logs.
2. As três fatias usadas nesta leitura foram geradas temporariamente em `.reversa/_visor_tmp/` apenas para tornar a imagem legível e **foram removidas ao fim da sessão** — a captura original em `logs-acesso/screenshots/` permanece intacta.
3. Se a paridade desta tela for exigida, fixar a massa (nº de registros, datas e ações) antes de capturar, porque os KPIs do topo derivam dela (254/65/9/0).

---
*Documentação visual gerada pelo Reversa-Visor em 2026-09-22 a partir de `logs-acesso/screenshots/tela_logs_acesso.png`.*
