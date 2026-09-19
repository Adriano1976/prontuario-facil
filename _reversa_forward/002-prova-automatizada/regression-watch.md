# Regression Watch: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Nota: esta feature **não alterou nenhuma regra de negócio, contrato de dados ou
> comportamento observável**. Os itens abaixo não são regressões a evitar, e sim
> **propriedades novas que precisam continuar verdadeiras** — a prova que acabou de
> nascer. Ver `legacy-impact.md#Modificadas`.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `src/api/mockClient.ts` | O adaptador offline preenche `created_by_id` em todo `create`, espelhando o servidor | `presença` | Paciente cadastrado no modo offline some da listagem escopada — foi o defeito DIV-01 |
| W002 | `src/pages/PatientForm.tsx` | O formulário oferece exatamente os oito tipos ABO/Rh mais `desconhecido`, e nenhum outro | `presença` | Seletor de tipo sanguíneo passa a oferecer valor fora do conjunto fechado (BR-P02) |
| W003 | `src/api/scopedRead.ts` | Leitura de entidade sob RLS exige a declaração do escopo de acesso | `presença` | Chamada de leitura escopada sem argumento de escopo voltando a compilar |
| W004 | `src/types/Patient.ts` | Consentimento aceito exige data e endereço de rede, verificado em tempo de compilação | `presença` | `lgpd_consent: true` sem `lgpd_consent_date` ou sem `lgpd_consent_ip` voltando a compilar |
| W005 | `src/api/registry.ts` | O registro de entidades é fechado: nome inexistente não compila | `presença` | `entities.Pacient` (e erros de digitação equivalentes) voltando a compilar |
| W006 | `src/test/verificacoes-negativas.mjs` | O comando de verificação negativa remove todo arquivo de prova que cria | `ausência` | `src/__negative_checks__/` permanece no repositório após `npm run prova:negativos` |
| W007 | `base44/entities/*.jsonc` | Os schemas de entidade do backend permanecem intocados | `ausência` | Qualquer diff em `base44/entities/` |
| W008 | `_reversa_sdd/code-spec-matrix.md` | Todo arquivo de prova citado na matriz existe e contém a verificação que ela afirma | `presença` | A matriz cita arquivo removido, renomeado ou que perdeu a verificação — a terceira testemunha passa a mentir |

## Histórico de re-extrações

(Nenhuma ainda.)

## Arquivadas

(Nenhuma.)

## Observações

Sem peso de regressão — itens sem confidência 🟢 suficiente, ou decisões estruturais
registradas para contexto:

- **`// @ts-expect-error` como forma de verificação negativa versionada (R-01 do
  `roadmap.md`).** Descartada nesta feature com base numa descrição imprecisa minha da
  alternativa (ver `investigation.md#3.2`). A forma anotada **não** quebra o gate de
  tipos: o arquivo compila e passa a ser uma afirmação positiva de que aquele código
  deve continuar sendo recusado. Candidata a emenda por `/reversa-add`.
- **Verificações de interface que localizam elementos por classe de estilo (R-04).**
  `PatientDetail.test.tsx` encontra o botão de exclusão por `className.includes('text-rose-600')`.
  Quebra numa refatoração visual. Dívida herdada desta sessão, não desta feature.
- **Dublê do módulo de seleção em `PatientForm.test.tsx`.** O seletor real renderiza as
  opções num portal e o `userEvent` estourava o tempo limite ao abri-lo no DOM simulado.
  O dublê segue o padrão já usado em `Patients.test.tsx`. Consequência: a verificação de
  BR-P02 mede o que o formulário decide oferecer, não o que o componente de interface
  desenha.
- **Restrição de ambiente.** A suíte e o comando de verificação negativa exigem acesso
  ampliado neste ambiente: o empacotador abre pipe nomeado e falha com `spawn EPERM` em
  modo confinado (R-03). Não é defeito do projeto.
- **Metade não provável do cenário PT-001.3.** A criptografia do CPF acontece no backend;
  o cliente prova apenas a marcação do campo sensível no contrato (R-02).
- **Cenários de paridade dos sete módulos restantes (34) e paridade visual (16).**
  Transferidos com destino declarado em `_reversa_sdd/code-spec-matrix.md#Destino dos
  cenários de paridade não cobertos nesta feature`.
