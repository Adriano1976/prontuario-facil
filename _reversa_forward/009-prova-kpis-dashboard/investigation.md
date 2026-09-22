# Investigação: Prova automatizada dos KPIs do Dashboard

> Identificador: `009-prova-kpis-dashboard`
> Data: `2026-09-22`
> Requirements: `_reversa_forward/009-prova-kpis-dashboard/requirements.md`
> Roadmap: `_reversa_forward/009-prova-kpis-dashboard/roadmap.md`

## 1. A pergunta desta investigação

Os cinco cenários de `PT-008` descrevem **contagens e um valor fixo**. Não há contrato de rede a
medir, não há transição de estado a observar, não há compilação a recusar. A pergunta é: **como se
prova que um número na tela é o número certo**, sem que a prova acabe medindo o próprio dublê?

Essa é a armadilha central desta feature. O projeto já a encontrou duas vezes — na 003, com uma
asserção que media a contagem de renderizações em vez de pedidos; e na 005, com uma asserção sobre
um controle que media o dublê do controle. A investigação abaixo existe para não repeti-la uma
terceira vez.

## 2. O que o projeto já tem para esta prova

### 2.1 O instrumento de cada suíte entregue

| Feature | Superfície | Instrumento | O que a prova mede |
|---------|-----------|-------------|--------------------|
| 002 | Pacientes | Tela + transporte | Renderização e argumentos de leitura |
| 003 | Agendamentos | Tela + máquina de estados | Transições e efeitos |
| 004 | Consultas | Tela | Estados e histórico |
| 005 | Emissão com template | Tela + renderizador de documento | Interpolação e escape |
| 006 | Logs de acesso | Tela + transporte de auditoria | Gravação e leitura paginada |
| 008 | Contrato de dados | **Compilação** | Recusa do gate de tipos |
| **009** | **Dashboard** | **Tela + transporte** | **Contagens e valor fixo** |

O Dashboard é a **sétima** superfície provada, e a primeira cujo objeto é um número derivado de
quatro coleções distintas.

### 2.2 A prova herdada, e o que o desenho dela proíbe

`src/pages/__tests__/Dashboard.test.tsx` existe desde a feature 006 e prova `PT-007.3` — a gravação
de auditoria na montagem. O cabeçalho dele diz, em letras claras, o que foi decidido:

- o módulo de auditoria **não** é dublado; substitui-se o transporte;
- a tela é densa e **os dublês devolvem conjuntos vazios de propósito**;
- os três componentes pesados são substituídos por nada pelo mesmo motivo.

Esse desenho é incompatível com a prova de KPI, que precisa de massa. Duas saídas eram possíveis:
acrescentar massa ao arquivo existente, ou criar um arquivo próprio. A escolha está em `D-01`.

## 3. Armadilhas já medidas que esta prova herda

| Armadilha | Onde foi medida | Como reaparece aqui |
|-----------|-----------------|---------------------|
| Dublê de consulta que executa a função a cada renderização conta **renderizações**, não pedidos | Feature 006 — `AccessLogs` contou 6 leituras onde havia 1 | `RF-07` e `RF-08` contam chamadas de transporte com argumentos exatos; um dublê ingênuo produziria contagem inflada |
| Asserção sobre um controle que acabou medindo o **dublê** do controle | Feature 005 — `toHaveValue('')` num seletor dublado | `RF-08` mede a declaração de escopo: dublar a resolução de escopo faria a asserção comparar o dublê consigo mesmo |
| Data no formato `AAAA-MM-DD` é lida em **fuso universal**; os leitores de data são locais | Feature 003 — massa de datas do dia | A massa de "hoje" do Dashboard precisa ser local, ou o cenário passa conforme o fuso da máquina |
| O jsdom **não aplica** a ocultação por CSS, e elementos invisíveis aparecem no DOM | Feature 006 — `Layout` renderiza duas navegações | Se o conteúdo de uma aba inativa permanecer montado, uma busca global pode encontrar elementos duplicados |
| Dependência circular entre efeito e dado derruba a execução | Feature 004 — efeito que dependia de lista recriada a cada renderização | O efeito de auditoria do Dashboard depende de lista vazia e não consome dado; **não** é vulnerável |
| Fábrica de dublê não pode referenciar vínculo importado | Feature 006 — elevação da fábrica de dublês acima dos imports | A fábrica do arquivo novo usará literais ou o mecanismo de içamento explícito |

## 4. Alternativas de instrumento avaliadas

### A) Estender `Dashboard.test.tsx` com massa sintética — **descartada**

Seria a opção de menor custo de arquivo. Descartada porque contradiz o desenho registrado daquele
arquivo: os dublês devolvem vazio **de propósito**, e os componentes pesados são anulados pelo mesmo
motivo. Acrescentar massa faria o arquivo medir duas promessas com dois instrumentos, e `RF-10` —
não regredir a verificação herdada — ficaria mais difícil de garantir, não mais fácil.

### B) Arquivo novo, com dublê de consulta que modela a cache por chave — **escolhida**

O dublê resolve por chave exata, executa a função de consulta uma vez por chave e devolve o mesmo
objeto entre renderizações. Com isso, três coisas ficam verdadeiras ao mesmo tempo: os cartões
recebem a massa certa, a contagem de chamadas de transporte mede **pedidos**, e a asserção de
argumentos de `RF-07` mede o que a página realmente pediu.

### C) Prova por captura da estrutura renderizada (snapshot) — **descartada**

Uma captura da árvore renderizada mudaria a cada ajuste de classe de estilo, e o projeto tem uma
feature inteira (007) dedicada à paridade **visual**, com captura dourada e manifesto. Duplicar o
mecanismo aqui criaria dois lugares para manter a mesma aparência, com resoluções diferentes — e um
deles falharia por motivo alheio à promessa.

### D) Extrair os cinco cálculos para funções puras e prová-los isoladamente — **descartada**

Seria a prova mais barata e mais estável: funções puras, sem renderização. Descartada por dois
motivos. O primeiro é de perímetro: extrair exige **tocar a página**, e `CF-02` proíbe. O segundo é
de significado: provar a função não prova que o **cartão exibe** o resultado dela — e é o cartão que
o cenário descreve. A distância entre "o cálculo está certo" e "a tela mostra o número certo" é
exatamente onde os defeitos de painel moram.

### E) Prova por inspeção estática do código-fonte — **descartada**

Analisar o texto de `Dashboard.tsx` para afirmar os critérios seria rápido e não exigiria
renderização. Descartada porque mediria a **forma** do código, não o comportamento — e a forma já
mudou sem que o comportamento mudasse (a constante de `AMB-001`, que nunca existiu). É a classe de
prova que este projeto decidiu não usar: a 008 provou compilação porque o cenário era sobre tipos;
aqui o cenário é sobre números na tela.

### F) Provar as duas metades: função pura **e** tela — **descartada**

Combinaria D e B e seria o mais completo. Descartada por custo de manutenção: as cinco expressões
são de uma linha cada, e mantê-las em dois lugares (extraídas e na página) obrigaria a página a
consumir as funções extraídas — o que já é a alternativa D.

## 5. Como medir "sem fórmula" e "sem sparkline"

Duas cláusulas de `PT-008.4` não são valores: são **ausências**, e ausência se prova por contraste.

1. **Sem fórmula.** A massa é construída de modo que uma fórmula plausível — por exemplo
   `concluídos ÷ (concluídos + cancelados + faltou)` sobre os agendamentos — daria um valor
   **diferente** de `94%`. Se o cartão exibisse qualquer coisa além de `94%`, a verificação falha.
   Não é uma prova de que nenhuma fórmula existe no código; é a prova de que **nenhuma fórmula
   influencia o valor exibido**, que é o que o cenário enuncia.
2. **Sem sparkline nem barra.** O componente do cartão aceita uma tendência opcional que renderiza
   um texto de variação percentual. A verificação afirma que esse texto **não existe** — o que
   distingue "o cartão foi usado sem tendência" de "o cartão ganhou um indicador que o legado não
   tinha". Uma barra gráfica exigiria um elemento de gráfico no cartão, e a mesma asserção de
   ausência o pegaria.

## 6. Fontes externas consultadas

| Fonte | O que foi extraído | Uso neste plano |
|-------|--------------------|-----------------|
| [Documentação do componente de abas do Radix UI](https://www.radix-ui.com/primitives/docs/components/tabs.md) | O conteúdo de aba aceita uma propriedade de montagem forçada (`forceMount`), o que implica montagem condicional; o padrão de aba ativa vem da raiz (`defaultValue`) | Confirma que a aba ativa monta o conteúdo e que a aba inativa não — o risco `R-03` |
| [Discussão do repositório Radix sobre abas em código de teste](https://github.com/radix-ui/primitives/discussions/1519) | Ponteiro encontrado na busca sobre o mesmo tema; **não foi aberto** | Registrado para consulta durante a codificação, caso `R-03` se materialize |

Nada além disso foi consultado. As decisões deste plano se apoiam sobretudo na **medição anterior do
próprio projeto**, que é fonte mais forte que qualquer documentação de biblioteca: as armadilhas da
§3 foram todas observadas aqui, com números.

## 7. Padrões aplicáveis

### 7.1 Dublê de consulta com cache por chave

```js
// A função de consulta roda uma vez por chave; a mesma referência volta a cada renderização.
const cache = new Map();
useQuery: ({ queryKey, queryFn }) => {
  const chave = JSON.stringify(queryKey);
  if (!cache.has(chave)) cache.set(chave, { data: undefined, isLoading: false });
  const entrada = cache.get(chave);
  if (entrada.data === undefined && !entrada.pendente) {
    entrada.pendente = true;
    queryFn().then((dados) => { entrada.data = dados; });
  }
  return entrada;
};
```

A cache é **limpa entre verificações**, senão a massa de um caso vaza para o seguinte — o mesmo
cuidado que a feature 006 precisou ter.

### 7.2 Ancoragem estrutural num único auxiliar

A leitura do valor de um cartão fica num só lugar, com o acoplamento à estrutura do cartão
documentado e assumido. O resto do arquivo chama o auxiliar pelo título e nunca conhece a estrutura.

### 7.3 Massa com marcadores distintos

Cada entidade recebe valores que não colidem com os das outras — paciente ativo conta 3, agendamento
de hoje conta 2, prescrição conta 4 — para que uma troca de chave no dublê produza um **número
errado visível** em vez de um acerto por coincidência. Três cartões com o mesmo valor seriam um
teste que passa por acidente, e é o risco `R-04`.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-22 | Versão inicial gerada por `/reversa-plan` | reversa |
