# Questions: Fumaça de paridade — Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Ação: **T044** — roteiro de fumaça de paridade e registro por módulo
> Preenchido por: `Esp. Adriano Santos` · Data: `15/09/2026`

## Como preencher

1. Preencha a coluna **Resultado** com **`ok`** (conforme) ou **`div`** (divergente).
2. Se marcar `div`, descreva na seção **Divergências** (no fim do arquivo) o que viu de diferente — uma frase basta.
3. Não deixe em branco: se não conseguiu testar, escreva **`n/t`** (não testado).
4. **Não teste** "Excluir Conta" (Layout) nem excluir paciente — são irreversíveis.

Fonte dos cenários: `_reversa_sdd/migration/parity_tests/` — 26 arquivos, 55 cenários.
Detalhes do ambiente: `onboarding.md` §3 (comandos) e §4 (roteiro e evidência estática já executada).

---

## Bloco 0 — Comandos (na sua máquina)

```powershell
npm run build
npm run typecheck
```

| # | Comando | Resultado |
|---|---------|-----------|
| 0.1 | `npm run build` terminou sem erro | ✅ |
| 0.2 | `npm run typecheck` terminou sem erro | ✅ |

> Se algum falhar, **cole o erro** na seção Divergências.

---

## Bloco A — Modo OFFLINE (`http://localhost:5173/`)

Suba com: `$env:VITE_OFFLINE="true"; npm run dev`

### 1. Dashboard *(cenários `08-kpis-dashboard`, `V01-dashboard-principal`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 1.1 | Os 4 indicadores aparecem: Pacientes Ativos, Agendamentos Hoje, Documentos Emitidos e **Taxa de Atendimento = 94%** | ✅ |
| 1.2 | A data por extenso no topo está correta | ✅ |
| 1.3 | A busca de paciente (nome/CPF/telefone) retorna resultados | ✅ |
| 1.4 | A aba **Relatórios** abre e mostra conteúdo | ✅ |
| 1.5 | "Próximos Agendamentos" lista itens (ou mostra o estado vazio) | ✅ |

### 2. Pacientes — listagem *(cenários `V02-pacientes-listagem`, `01-cadastro-paciente-lgpd`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 2.1 | Lista os **5 pacientes** de exemplo | ✅ |
| 2.2 | Cada item mostra nome, idade, telefone, email, convênio e tipo sanguíneo (quando houver) | ✅ |
| 2.3 | Busca por nome/CPF/telefone/email filtra a lista | ✅ |
| 2.4 | Filtro **Ativos / Inativos / Todos** funciona | ✅ |
| 2.5 | Estado vazio aparece quando a busca não encontra nada | ✅ |

### 3. Pacientes — novo e editar *(cenários `01-cadastro-paciente-lgpd`, `V03-pacientes-novo`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 3.1 | Salvar **sem** aceitar o termo é bloqueado (o termo de LGPD é exibido) | ✅ |
| 3.2 | Ao aceitar, ficam gravados **data** e **endereço de rede** do consentimento | ✅ |
| 3.3 | Máscara de CPF e de telefone funciona enquanto digita | ✅ |
| 3.4 | Salvar com os campos obrigatórios grava e volta para a lista | ✅ |
| 3.5 | **Editar** um paciente existente carrega os dados preenchidos e salva | ✅ |

### 4. Paciente — detalhe *(cenários `V14-paciente-detalhe`, `01-cadastro-paciente-lgpd`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 4.1 | Cabeçalho com nome, iniciais/foto, status, tipo sanguíneo e selo LGPD | ✅ |
| 4.2 | Idade, contato, endereço e convênio corretos | ✅ |
| 4.3 | Alergias, Condições Crônicas e Medicamentos em Uso aparecem quando preenchidos | ✅ |
| 4.4 | Abas do Histórico (Todos/Agendamentos/Consultas/Documentos/Exames) filtram, com contadores | ✅ |
| 4.5 | ⭐ Na aba **Documentos**, os medicamentos da prescrição de exemplo **aparecem** (mudança esperada da T040) | ✅ |
| 4.6 | Ações rápidas (Agendar, Nova Consulta, Receita, Exame) abrem as telas | ✅ |

### 5. Agendamentos — calendário e lista *(cenários `03`, `04-ciclo-status-agendamento`, `V04`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 5.1 | Aba **Calendário** mostra a semana com os agendamentos nos horários certos | ✅ |
| 5.2 | Navegação de semana (anterior / próximo / hoje) funciona | ✅ |
| 5.3 | Aba **Lista** mostra os agendamentos futuros e **exclui** cancelados/passados | ✅ |
| 5.4 | Clicar num agendamento abre o diálogo com paciente, médico, data e status | ✅ |
| 5.5 | Alterar o status (Confirmar/Cancelar) **salva e reflete** na tela | ✅ |
| 5.6 | ⭐ Salvar uma **consulta** **não** altera sozinho o status do agendamento (transição manual) | ✅ |

### 6. Agendamentos — novo *(cenários `03-agendamento-jornada-medico`, `V05-agendamentos-novo`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 6.1 | Seletores listam só pacientes ativos e só médicos ativos | ✅ |
| 6.2 | Escolher o médico revela o calendário; datas passadas ficam desabilitadas | ✅ |
| 6.3 | Os horários oferecidos respeitam os **dias e a janela** do médico, e marcam os ocupados | ✅ |
| 6.4 | Tipo (Primeira consulta / Retorno / Exame / Procedimento) e observações funcionam | ✅ |
| 6.5 | Salvar grava e volta para Agendamentos | ✅ |

### 7. Consultas — listagem *(cenários `05-maquina-estados-consulta`, `V06-consultas-listagem`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 7.1 | Lista com paciente, data, queixa e selo de status | ✅ |
| 7.2 | Filtro por status (Agendada / Em andamento / Concluída / Cancelada) funciona | ✅ |
| 7.3 | Filtros de data (Hoje / Última semana / Último mês / Próximas) funcionam | ✅ |
| 7.4 | Busca por paciente, queixa ou diagnóstico funciona | ✅ |
| 7.5 | Consulta **sem** status aparece com o selo **vazio** (sem texto inventado) | ✅ |

### 8. Consultas — novo e editar *(cenários `05`, `V07-consultas-novo`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 8.1 | Pré-seleção por `?patient_id=` (vindo do detalhe do paciente) funciona | ✅ |
| 8.2 | Busca de paciente por nome/CPF limita a 5 resultados | ✅ |
| 8.3 | Sinais vitais (7 campos) e anamnese preenchem | ✅ |
| 8.4 | Status inicial e data de retorno | ✅|
| 8.5 | Salvar grava e redireciona (para o paciente, quando houver) | ✅ |
| 8.6 | Editar (`?id=`) carrega a consulta existente preenchida | ✅ |

### 9. Consultas — visualização *(cenários `05`, `V08-consultas-visualizacao`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 9.1 | Cabeçalho com data por extenso e selo de status | ✅ |
| 9.2 | Card do paciente, com bloco de **alergias** quando houver | ✅ |
| 9.3 | Sinais vitais só aparecem quando preenchidos | ✅ |
| 9.4 | Anamnese: queixa principal, história da doença atual e exame físico | ✅ |
| 9.5 | Diagnóstico, CID, plano de tratamento e retorno | ✅ |
| 9.6 | Listas de **Documentos emitidos** e **Exames** (com "Visualizar" quando houver arquivo) | ✅ |
| 9.7 | **Imprimir** abre a janela de impressão | ✅ |

### 10. Modal novo documento *(cenários `06-emissao-documento-template`, `V09-modal-novo-documento`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 10.1 | Tipo **Receita Simples/Controlada** mostra a lista de medicamentos | ✅ |
| 10.2 | Tipo **Atestado** mostra os dias de afastamento (e esconde medicamentos) | ✅ |
| 10.3 | Escolher um **modelo** substitui as variáveis no conteúdo | ✅ |
| 10.4 | Adicionar e remover medicamento (nome/dose/frequência/duração/instruções) funciona | ✅ |
| 10.5 | Salvar cria o documento e ele aparece na aba Documentos | ✅ |
| 10.6 | **Imprimir** gera a janela com o conteúdo |✅ |
| 10.7 | ⭐ Texto com marcação (ex. `<b>teste</b>`) **não** é escapado (comportamento congelado — AMB-006) | ✅ |

### 11. Modal upload de exame *(cenário `V10-modal-upload-exame`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 11.1 | Só permite enviar com **arquivo E nome** preenchidos | ✅ |
| 11.2 | Pré-visualização aparece para imagem e **não** para PDF | ✅ |
| 11.3 | Tipo de exame, data, laboratório e resumo preenchem | ✅ |
| 11.4 | Enviar grava, fecha o diálogo e o exame aparece na lista | ✅ |

### 12. Médicos *(cenários `V11-medicos-listagem`, `V15-medicos-novo`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 12.1 | Lista com nome, especialidade, CRM, janela (início–fim), dias e selo Ativo/Inativo | ✅ |
| 12.2 | Novo médico não salva sem nome, especialidade e CRM | ✅ |
| 12.3 | Dias de atendimento (checkboxes) e janela de horário funcionam | ✅ |
| 12.4 | Duração (min) e o interruptor "Médico ativo" funcionam | ✅ |
| 12.5 | Editar carrega os dados atuais e salva | ✅ |
| 12.6 | Excluir remove da lista | ✅ |

### 13. Templates *(cenários `06`, `V12-templates-central`, `V16-templates-modal`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 13.1 | Central agrupa por tipo, na ordem fixa, com selos **Padrão** e **Inativo** | ✅ |
| 13.2 | Tipos sem modelos **não** criam seção vazia | ✅ |
| 13.3 | Novo template não salva sem nome e conteúdo | ✅ |
| 13.4 | Inserir variável (ex. `{PACIENTE_NOME}`, `{DATA}`) adiciona ao conteúdo | ✅ |
| 13.5 | Interruptores "Template padrão" e "Ativo" funcionam | ✅ |
| 13.6 | Excluir pede confirmação mostrando o nome do template | ✅ |

### 14. Logs de acesso *(cenários `07-auditoria-acesso`, `V13-logs-acesso`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 14.1 | Tabela com Data/Hora, Usuário, Ação, Paciente e Detalhes | ✅ |
| 14.2 | Os 4 indicadores (Total / Visualizações / Edições / Exclusões) coerentes com a tabela | ✅ |
| 14.3 | Filtros de **ação** e de **data** funcionam | ✅ |
| 14.4 | Busca por usuário ou paciente funciona | ✅ |
| 14.5 | ⭐ **Não** existe paginação | ✅ |
| 14.6 | Navegar pelas telas gera registro novo na trilha (recarregue e confira) | ✅ |

---

## Bloco B — Modo OFFLINE (geral) *(cenários `09-modo-offline`, `10-contrato-base44-client`)*

| # | O que conferir | Resultado |
|---|----------------|-----------|
| 15.1 | Nenhuma tela pediu login | ✅ |
| 15.2 | Recarregar a página (F5) **mantém** os dados | ✅ |
| 15.3 | Criar, editar e excluir no offline refletem na próxima leitura | ✅ |
| 15.4 | Os dados de exemplo aparecem nas telas com leitura escopada (Pacientes, Consultas, Agendamentos, Exames, Documentos) | ✅ |
| 15.5 | O console do navegador (F12) **não** mostra erro | ✅ |

---

## Bloco C — Modo ONLINE (comparação)

Pare o servidor e suba **sem** a variável: `Remove-Item Env:VITE_OFFLINE; npm run dev`
(o publicado `prontuariofacil.base44.app` também serve).

Percorra o mesmo menu e responda: **a tela carrega e se comporta igual?**
(O backend real pode ter pouco ou nenhum dado — o que importa é a tela abrir sem erro e sem perder texto.)

| # | Tela | Resultado |
|---|------|-----------|
| C.1 | Dashboard | ✅ |
| C.2 | Pacientes (lista) | ✅ |
| C.3 | Pacientes (novo/editar) | ✅ |
| C.4 | Paciente (detalhe) |✅|
| C.5 | Agendamentos |✅|
| C.6 | Novo agendamento |✅|
| C.7 | Consultas (lista) |✅|
| C.8 | Nova consulta |✅|
| C.9 | Ver consulta |✅|
| C.10 | Modal documento |✅|
| C.11 | Modal exame |✅|
| C.12 | Médicos |✅|
| C.13 | Templates |✅|
| C.14 | Logs de acesso |✅|

---

## Divergências

> Descreva cada `div` com: **o que fez**, **o que esperava** e **o que aconteceu**.
> Se não houve divergência, escreva **"nenhuma"**.

### DIV-01 — ⚠️ ENCONTRADA E CORRIGIDA durante o passeio

- **Item:** 3.4 (Pacientes — salvar) — mesma causa em 6.5, 8.5, 10.5, 11.4 e 14.6
- **O que fiz:** preenchi o cadastro de um paciente no modo offline e salvei
- **O que esperava:** o paciente aparecer na lista de Pacientes
- **O que aconteceu:** o paciente era salvo (a tela voltava para a lista), mas **não aparecia** — e o mesmo valia para tudo criado no offline (consultas, agendamentos, documentos, exames)
- **Causa:** no modo offline o registro era criado **sem `created_by_id`** (o mock preenchia só `id` e `created_date`, e `WriteInput` exclui os campos de servidor). Como as leituras passaram a filtrar por dono (BR-MIGRAR-034), o registro existia no armazenamento mas ficava **invisível** para a lista.
- **Correção:** `src/api/mockClient.ts` — o mock passou a preencher `created_by_id` com o usuário da sessão offline, espelhando o que o servidor faz. Gate de tipos: 0 erros.
- **Não afeta o modo online** (o servidor já preenchia o dono).
- **Reteste:** ✅ **confirmado** — após limpar as chaves `mock_db_*` e cadastrar um paciente novo, o registro foi salvo e **apareceu na lista e na busca**.

### DIV-02 — ❌ NÃO é divergência (conferido contra o legado)

- **Item:** 9.6
- **O que fiz:** Visualizei os 2 na lista e só a recurso "Visualizar" existia para "Exames"
- **O que esperava:** Listas de **Documentos emitidos** e **Exames** (com "Visualizar" quando houver arquivo)
- **O que aconteceu:** Listas de **Exames** (com "Visualizar" quando houver arquivo)
- **Veredito:** ✅ conforme. O link "Visualizar" só existe no bloco de **exames** (documento clínico não tem arquivo anexo) — conferido no legado, comportamento idêntico. As **duas listas aparecem**. A dúvida veio da redação da pergunta: o "quando houver arquivo" valia apenas para exames.

### DIV-03 — ❌ NÃO é defeito (conferido contra o legado)

- **Item:** 10.4
- **O que fiz:** Tentei edicar ou modificar os medicamento, mas não tenho acesso.
- **O que esperava:**  Adicionar e remover medicamento (nome/dose/frequência/duração/instruções)
- **O que aconteceu:** Sem acesso para editar
- **Veredito:** ✅ conforme. O botão **"+ Adicionar"** existe (seção *Medicamentos*, que aparece só com tipo de receita): clicar nele cria o cartão com os 5 campos e a lixeira remove. Código idêntico ao legado (`addMedication` / `removeMedication`). A lista começa **vazia** — não há o que editar antes de adicionar.

### DIV-04 — ❌ NÃO é divergência (conferido contra o legado)

- **Item:** 13.1
- **O que fiz:** Abrir a aba Templates, mas não aparece os modelos "Padrão"
- **O que esperava:** Central agrupa por tipo, na ordem fixa, com selos **Padrão** e **Inativo**
- **O que aconteceu:** Não aparece os Templates "Padrão"
- **Veredito:** ✅ conforme. O selo só é renderizado quando `is_default === true`, e **nenhum** dos 2 templates do demo está marcado como padrão — no legado também não estava. O selo "Inativo" segue a mesma regra (`!is_active`) e também não aparece porque ambos estão ativos.

### DIV-05 — ⚠️ LACUNA PRÉ-EXISTENTE no legado (fora do escopo desta feature)

- **Item:** 13.4
- **O que fiz:** Abrir a aba "Novo Template", na aba template e colei todas as variável
- **O que esperava:** Inserir variável (ex. `{PACIENTE_NOME}`, `{DATA}`) adiciona ao conteúdo
- **O que aconteceu:** Essa variável ({DIAS_AFASTAMENTO}) não funciona quando ao emitir o documento
- **Conferência:** a variável é **oferecida** na lista "Variáveis disponíveis", mas o editor substitui **apenas 4**: `{PACIENTE_NOME}`, `{PACIENTE_CPF}`, `{DATA}` e `{DATA_EXTENSO}`. O legado faz exatamente o mesmo — `{DIAS_AFASTAMENTO}` fica literal **desde sempre**.
- **Classificação:** defeito **anterior à migração**, preservado de propósito (a feature converte linguagem, não corrige comportamento).
- **Decisão:** **(a) registrar como lacuna** para uma alteração própria. *(A alternativa — corrigir agora — é uma linha no editor, mas muda comportamento e sai do escopo da migração.)*
- **Nota:** o item 13.4 em si está ✅ — a *inserção* da variável no conteúdo funciona; o que não existe é a *substituição* dela na emissão.

---

## Observações livres

> Qualquer coisa que tenha chamado atenção e não se encaixe acima (sugestões, dúvidas, elogios, estranhezas).

**Conclusão do passeio — 15/09/2026:**

- **Todas as 14 telas passaram** nos dois modos (offline e online).
- **O fumaça achou 1 defeito real** (DIV-01), que **quebraria todo cadastro no modo offline** — nenhum registro criado apareceria nas listas. Corrigido e retestado com sucesso.
- **3 relatos** (DIV-02, DIV-03, DIV-04) eram **expectativa, não divergência**: conferidos contra o código legado, o comportamento é o mesmo. A causa foi a redação ambígua das perguntas.
- **1 lacuna pré-existente** encontrada (DIV-05): `{DIAS_AFASTAMENTO}` é oferecida como variável e nunca interpolada — defeito do legado, preservado de propósito.
- **`npm run build` passou** — era a lacuna registrada no `onboarding.md` §7 (o empacotamento nunca havia sido validado).



---

## Fechamento

| Campo | Valor |
|-------|-------|
| Executado por | Esp. Adriano Santos|
| Data | 15/09/2026 |
| Ambiente (navegador/SO) | Opera no Windows 11 |
| Resultado geral | ⬜ tudo conforme · ✅ com divergências |

---
*Gerado pelo Reversa-Coding em 2026-09-15.*
