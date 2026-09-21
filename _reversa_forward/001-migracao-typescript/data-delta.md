# Data Delta: Migração de JavaScript para TypeScript

> Identificador: `001-migracao-typescript`
> Data: `2026-09-14`
> Modelo extraído de referência: `_reversa_sdd/data-dictionary.md` e `_reversa_sdd/database/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Veredito

**Nenhuma migração de dados. Nenhuma alteração de esquema.** Os 8 contratos de dados
do BaaS permanecem intocados, e o armazenamento local do modo offline mantém o mesmo
formato e as mesmas chaves. 🟢

O delta desta feature é de **representação em tempo de compilação**: os tipos passam a
espelhar os esquemas que já existem. A única alteração de conteúdo são os dados de
exemplo do modo offline (seção 4).

## 2. Campos novos, removidos ou alterados

| Entidade | Campo | Situação | Observação |
|----------|-------|----------|------------|
| todas | `id`, `created_date` | já existiam | Passam a ser declarados como preenchidos pelo servidor |
| todas | `created_by_id` | já existia | Base do isolamento por dono; declarado **opcional no registro**, por não existir no modo offline |
| Paciente | bloco de consentimento | já existia | Passa a ser **condicional**: consentimento aceito exige data e endereço de rede |
| Agendamento | `status`, `type` | já existiam | Passam a conjunto fechado |
| Consulta | `status` | já existia | Passa a conjunto fechado |
| Prescrição | `type` | já existia | Passa a conjunto fechado |
| Exame | `type`, `file_type` | já existiam | Passam a conjunto fechado |
| Médico | `working_days` | já existia | Passa a lista de dias válidos (0 a 6) em vez de número genérico |
| Modelo | `type` | já existia | Passa a conjunto fechado de 7 valores |
| Registro de acesso | `action` | já existia | Passa a conjunto fechado de 12 valores |

Nenhum campo é removido. Nenhuma entidade nova é criada.

## 3. Divergências entre os dados de exemplo e o contrato

Os dados de exemplo do modo offline foram escritos antes de o contrato existir e
divergem dele em vários pontos. Levantamento por leitura direta do arquivo: 🟢

| Entidade | Divergência observada | Consequência |
|----------|----------------------|--------------|
| Paciente | Gênero registrado em forma abreviada, fora do conjunto válido | Não valida contra o contrato |
| Consulta | Registro usa nomes de campo diferentes dos do esquema (histórico clínico e vínculo com agendamento) | Campos não encontrados; anamnese fica vazia |
| Prescrição | Medicamento registrado como texto único, enquanto o consumo nas telas espera lista de itens | A tela de prescrição não exibe os medicamentos dos dados de exemplo |
| Prescrição | Ausência de `type`, que é obrigatório | Não valida contra o contrato |
| Agendamento | Ausência de campos com valor padrão | Depende do preenchimento pelo servidor |
| Médico | Ausência de `specialty` e `crm`, ambos obrigatórios | Não valida contra o contrato |
| Modelo | Tipo registrado fora do conjunto válido | Não valida contra o contrato |
| Exame | `file_type` ausente e `file_url` vazio | Tolerado: ambos são opcionais |
| Registro de acesso | Campos com valor nulo | Tolerado: campo declarado como anulável |

Observação relevante: a divergência de **Prescrição** não é apenas uma questão de
tipos. As telas já consomem a lista de medicamentos, e os dados de exemplo fornecem
texto único — ou seja, **já existe hoje** uma incompatibilidade entre os dados de
exemplo e o consumo nas telas, independentemente desta feature. 🟢

## 4. Alteração de conteúdo prevista

A etapa 6 do plano alinha os dados de exemplo ao contrato (decisão D-08). Natureza da
alteração:

| Aspecto | Situação |
|---------|----------|
| O que muda | O conteúdo dos dados de exemplo do modo offline, para validar contra o contrato |
| O que **não** muda | O formato de armazenamento, as chaves de armazenamento, e o mecanismo de carga |
| Dados reais afetados | **Nenhum.** Os dados de exemplo são gravados no armazenamento do navegador na primeira leitura, e não há dado de produção no modo offline |
| Migração necessária | Não. Basta limpar o armazenamento local do navegador para os exemplos serem regravados |
| Risco | Baixo: afeta apenas ambiente de demonstração offline |

> ⚠️ Consequência de comportamento a validar na etapa 6: como a tela de prescrição
> espera a lista de medicamentos, alinhar os dados de exemplo fará os medicamentos
> **aparecerem** onde hoje não aparecem no modo offline. Isso é correção de dado de
> exemplo, não mudança de regra — mas precisa ser conferido no roteiro de fumaça,
> porque altera o que se vê na tela.

## 5. Índices, ordenação e limites

Nenhuma alteração. As ordenações usadas pelo legado permanecem as mesmas, e o limite
de registros por consulta não muda. O contrato restringe a ordenação a um único campo,
que é o comportamento atual. 🟢

## 6. Restrições e integridade

| Regra | Situação |
|-------|----------|
| Identificador único por registro | Inalterado; gerado pelo servidor, ou localmente no modo offline |
| Integridade referencial entre entidades | Inalterada; não há chave estrangeira física, a consistência é de domínio |
| Isolamento por dono | Inalterado no servidor; passa a ser **exigido** na fronteira de tipos |
| Proteção de campo sensível | Inalterada no servidor; o contrato apenas marca o campo como sensível |
| Trilha de auditoria | Inalterada; permanece somente inserção, leitura restrita a administrador |

---
*Gerado pelo Reversa-Plan em 2026-09-14.*
