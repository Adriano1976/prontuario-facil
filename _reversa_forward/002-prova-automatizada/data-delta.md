# Data Delta: Prova automatizada como cidadã do ciclo Reversa

> Identificador: `002-prova-automatizada`
> Data: `2026-09-19`
> Base de comparação: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/database/` e
> `_reversa_sdd/erd-complete.md`

## 1. Veredito

**Nenhuma alteração de modelo de dados.** Não há campo novo, campo removido, campo com
tipo alterado, entidade nova, índice novo nem migração. As 8 entidades persistidas
mantêm o contrato atual, e nada é escrito em `base44/entities/`.

Esta é a consequência direta da regra de ouro da migração e do RF de paridade: a suíte
**observa** o sistema, não o altera. Um delta de dados aqui seria sintoma de defeito, não
de entrega.

## 2. Diff conceitual

| Entidade | Campos | Situação |
|----------|--------|----------|
| `Patient` | 22 campos, incluindo o bloco de consentimento (`lgpd_consent`, `lgpd_consent_date`, `lgpd_consent_ip`) | sem alteração |
| `Consultation` | conforme `_reversa_sdd/data-dictionary.md` | sem alteração |
| `Prescription` | idem | sem alteração |
| `Exam` | idem | sem alteração |
| `Appointment` | idem | sem alteração |
| `Doctor` | idem | sem alteração |
| `Template` | idem | sem alteração |
| `AccessLog` | idem | sem alteração |

## 3. Dados que a feature introduz

Não são dados do sistema: são **massa de prova**, fictícia, dentro dos arquivos de
verificação. Nenhum registro real de paciente é reutilizado (RN-07).

| Origem | Natureza | Onde vive |
|--------|----------|-----------|
| Registros de paciente fictícios | Objeto literal no próprio arquivo de prova, com identificador, nome, CPF e telefone inventados | `src/pages/__tests__/*`, `src/components/medical/__tests__/*` |
| Registros clínicos fictícios | Objeto literal, usado para exercitar a linha do tempo e as abas do histórico | idem |
| Usuário de sessão fictício | Identidade devolvida pelo dublê de autenticação | idem |
| Arquivo de imagem fictício | Objeto de arquivo em memória, usado na prova de envio de foto | idem |
| Massa do adaptador offline | Semeada pelo próprio adaptador a partir de `src/api/mockSeed.ts` e persistida no armazenamento local | chave `mock_db_<Entidade>` |

### 3.1 Consequência para o modo offline

A prova de ponta a ponta do recorte DIV-01 (D-08) exercita o adaptador falso contra o
armazenamento local do ambiente de prova. Isso significa que a verificação **depende de
estado persistido entre execuções dentro do mesmo ambiente**, e por isso precisa limpar a
chave antes de cada verificação. Sem essa limpeza, a segunda execução encontra o registro
da primeira e o resultado deixa de ser determinístico — colisão direta com o RNF de
Determinismo.

> Registrado aqui porque é o único ponto desta feature em que a prova toca dado
> persistido, e é o ponto mais provável de produzir resultado intermitente.

## 4. Migrações necessárias

**Nenhuma.** Não há script de migração, não há reescrita de registro e não há
realinhamento de massa existente.

O que existe é um **delta de conteúdo na extração**, que não é migração de dados mas
precisa de registro:

| Artefato | Afirmação atual | Realidade a partir de 2026-09-19 |
|----------|-----------------|----------------------------------|
| `_reversa_sdd/dependencies.md` | "Sem framework de testes configurado e sem testes no repositório" | Há arcabouço configurado e 10 arquivos de verificação |
| `_reversa_sdd/addenda/001-migracao-typescript.md` | "não existe teste automatizado" | Descreve corretamente o estado da entrega da 001; o presente é corrigido por adendo desta feature (D-11 do `roadmap.md`) |

## 5. O que fica de fora

- **Remoção das 14 dependências declaradas e não utilizadas** — pendência registrada em
  `_reversa_forward/001-migracao-typescript/requirements.md#10. Lacunas`, ainda sem
  aprovação explícita. Nada é removido por esta feature.
- **Limitações L1 a L7 do modo offline** — inclusive L7 (dado de paciente em
  armazenamento local do navegador) e L3 (arquivo enviado não persiste). Nenhuma é
  corrigida nem provada.
