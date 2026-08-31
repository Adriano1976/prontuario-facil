# Design SDD — Módulo Pacientes

## 1. Visão Geral de Arquitetura e Componentes
O módulo de **Pacientes** (`Patient`) gerencia o cadastro completo dos indivíduos atendidos na clínica, integrando dados demográficos, histórico médico, convênio e conformidade com a LGPD.

### Componentes Principais
- **Listagem de Pacientes**: Cartões resumidos com avatar, status, telefones, convênio e tipo sanguíneo, além de busca textual e filtros.
- **Formulário de Cadastro/Edição**: Dividido em blocos lógicos (Dados Pessoais, Contato, Convênio, Informações Médicas e Consentimento LGPD).
- **Validação de CPF**: Verificação de formato e obrigatoriedade no cadastro.
- **Seção LGPD**: Controle de aceite obrigatório (`lgpd_consent` é item obrigatório conforme schema `Patient.jsonc`) com botão "Ver Termo".

---

## 2. Fluxo e Consentimento LGPD
- **Obrigatoriedade**: O consentimento LGPD (`lgpd_consent`) é um campo obrigatório (`required` no schema da entidade). O cadastro não pode ser salvo (`Salvar Paciente`) sem que o aceite esteja marcado.
- **Botão "Ver Termo"**: Abre uma modal de leitura/visualização com os termos completos de tratamento de dados pessoais conforme a LGPD. O aceite em si é marcado por checkbox/toggle diretamente no formulário de cadastro, registrando a data (`lgpd_consent_date`) e o IP do usuário no momento da persistência.
- **Atualização**: O consentimento pode ser revisado ou atualizado durante a edição do cadastro do paciente.

---
*Gerado pelo Reversa-Writer em 2026-08-31.*
