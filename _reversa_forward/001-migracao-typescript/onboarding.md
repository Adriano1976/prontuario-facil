# Onboarding: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Para: quem vai executar e validar a feature pela primeira vez

## 1. Pré-requisitos

| Item | Versão / estado | Como conferir |
|------|-----------------|---------------|
| Node.js | 18 ou superior | `node --version` |
| Dependências instaladas | instaladas na raiz do projeto | `npm install` (se `node_modules` não existir) |
| Navegador | qualquer moderno | — |
| Conta no BaaS | necessária apenas para o modo online | variáveis de ambiente já presentes |

## 2. Comandos essenciais

```
npm run typecheck     # gate de tipos: verifica todo o código-fonte, sem emitir arquivos
npm run dev           # sobe o sistema em modo de desenvolvimento
npm run build         # gera o artefato de produção
npm run lint          # análise estática de estilo
```

O comando `typecheck` é o gate principal desta feature. Ele deve terminar **sem
nenhuma saída de erro** e retornar sucesso.

## 3. Verificação passo a passo

### 3.1 Conferir o gate de tipos

```
npm run typecheck
```

Resultado esperado no estado atual da feature: termina sem erro, e verifica os
arquivos já convertidos. **Não** confie apenas na ausência de mensagens: confira que
o número de arquivos verificados é o esperado, porque um erro de sintaxe em um único
arquivo faz o verificador ignorar todo o resto (ver `investigation.md`, seção 3).

### 3.2 Subir o sistema em modo online

```
npm run dev
```

Abra o endereço indicado no terminal. Percorra, nesta ordem:

1. **Pacientes** — a listagem carrega; abrir um paciente mostra o detalhe.
2. **Agendamentos** — o calendário carrega e mostra os agendamentos existentes.
3. **Consultas** — a listagem carrega; abrir uma consulta mostra o registro clínico.
4. **Médicos** — a listagem carrega.
5. **Modelos** — a central de modelos carrega.
6. **Registros de acesso** — a trilha de auditoria carrega.
7. **Painel** — os indicadores carregam.

### 3.3 Subir o sistema em modo offline

O modo offline é ativado na construção, não por botão na tela:

```
VITE_OFFLINE=true npm run dev
```

No Windows, em PowerShell:

```
$env:VITE_OFFLINE="true"; npm run dev
```

Resultado esperado: o sistema entra direto, sem pedir autenticação, com o usuário de
demonstração. As telas carregam dados de exemplo. **Nenhum dado real é tocado** —
tudo é gravado no armazenamento local do navegador.

Para voltar ao estado inicial dos dados de exemplo, limpe o armazenamento local do
site no navegador.

## 4. Roteiro de fumaça de paridade

Fonte: os 26 cenários já existentes em `_reversa_sdd/migration/parity_tests/`
(10 de fluxo e 16 de tela). Execute-os no módulo que acabou de ser convertido e
registre cada um como **conforme** ou **divergente**. Nenhuma divergência pode
permanecer sem tratamento antes de avançar de módulo.

Pontos de atenção por ordem de risco:

| Área | O que conferir | Por que importa |
|------|----------------|-----------------|
| Consentimento LGPD | Cadastro exige aceite; com aceite, grava data e endereço de rede | Requisito regulatório |
| Isolamento por dono | Usuário comum não vê dado de outro | Regra de segurança do domínio |
| Ciclo de status | Agendamento e consulta transitam apenas pelos estados válidos | Regra de domínio central |
| Emissão de documento | Medicamentos só aparecem quando o tipo é de receita | Regra de domínio |
| Trilha de auditoria | Acesso a dado sensível gera registro | Requisito regulatório |
| Modo offline | Mesmas telas funcionam com os dados de exemplo | Evita divergência entre os dois modos |

## 5. O que **não** deve acontecer

Esta feature converte linguagem, não corrige comportamento. Se você observar qualquer
item abaixo, é **divergência**, e deve ser tratada como defeito:

- Critério de algum indicador do painel mudou
- Status de agendamento passou a mudar sozinho ao salvar consulta
- Surgiu paginação na trilha de auditoria
- Surgiu aviso visual de "dados de teste" no modo offline
- Textos da interface mudaram
- Surgiu verificação de permissão antes de alguma tela
- O endereço de rede do consentimento passou a ser removido da URL
- Conteúdo de documento passou a escapar marcação

Os itens acima estão congelados por decisão registrada no plano de migração. Nenhum
deles deve mudar nesta feature.

## 6. Como saber que quebrou

| Sintoma | Onde olhar |
|---------|------------|
| `typecheck` aponta erro | A mensagem indica arquivo e linha; corrija o contrato, não o consumo |
| `typecheck` passa mas o sistema quebra ao abrir uma tela | Provável divergência entre o contrato e os dados reais; compare com `base44/entities/*.jsonc` |
| Tela mostra lista vazia onde antes mostrava dados | Verifique o filtro de dono introduzido pela leitura com escopo |
| Modo offline mostra dados diferentes do online | Verifique `mockSeed.js` contra o contrato (`data-delta.md`, seção 3) |
| Build falha sem erro de tipo | Verifique se o erro é de sintaxe, não de tipo |

## 7. Limites conhecidos deste ambiente

O build de produção **não** foi executado com sucesso no ambiente onde esta feature
está sendo conduzida: o processo de empacotamento falha ao criar subprocesso, por
restrição do ambiente, não por defeito do código. A verificação de tipos funciona
normalmente. Ao executar `npm run build` em uma máquina sem essa restrição, o
resultado deve ser comparado com o artefato anterior.
