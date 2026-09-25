# Política de Segurança

O **prontuário-fácil** é uma aplicação de prontuário eletrônico e, por isso, trata dados
pessoais sensíveis de saúde (art. 5º, II e art. 11 da LGPD). Levamos a sério qualquer
relato de vulnerabilidade e agradecemos a divulgação responsável.

Este documento explica **como reportar uma vulnerabilidade** e o que você pode esperar
de nós em cada etapa.

---

## Versões suportadas

Apenas a branch padrão recebe correções de segurança.

| Versão | Suportada |
|--------|-----------|
| `main` (código atual) | ✅ Sim |
| Tags/releases anteriores | ❌ Não |

Como o projeto é um SPA implantado a partir de `main`, não há manutenção de linhas
antigas: a correção entra em `main` e vai para produção no próximo deploy.

---

## Como reportar uma vulnerabilidade

> ⚠️ **Não abra issue pública, nem comente em Pull Request, para relatar uma falha de
> segurança.** Relatos públicos expõem usuários e dados de pacientes antes da correção.

### Canal preferencial — GitHub Private Vulnerability Reporting

1. Acesse a aba **[Security](https://github.com/Adriano1976/prontuario-facil/security)** do repositório.
2. Clique em **Report a vulnerability**.
3. Descreva o problema no formulário privado.

O relato fica visível apenas para os mantenedores e gera um aviso de segurança privado
(*security advisory*), o que facilita acompanhar a correção e publicar o aviso depois.

### Canal alternativo — e-mail

Se não conseguir usar o GitHub, escreva para **adriano1976@users.noreply.github.com**
com o assunto `[SECURITY] prontuario-facil — <resumo curto>`.

Se você não receber confirmação em **7 dias**, reenvie — pode ter caído em spam.

---

## O que incluir no relato

Quanto mais completo o relato, mais rápido conseguimos reproduzir e corrigir:

- **Tipo da falha** — ex.: XSS, IDOR, escalonamento de privilégio, exposição de credencial.
- **Componente afetado** — rota, tela, arquivo ou endpoint (ex.: `/admin/usuarios`, `src/pages/...`).
- **Passos para reproduzir** — passo a passo, com o menor número de ações possível.
- **Prova de conceito** — payload, requisição ou captura de tela (evite usar dados reais de pacientes).
- **Impacto** — o que um atacante consegue fazer e quais dados ficam expostos.
- **Ambiente** — navegador/SO, versão, e se o achado ocorreu em produção ou local.
- **Correção sugerida** (opcional) — se você tiver uma ideia de mitigação.
- **Como você quer ser creditado** (opcional) — nome, usuário ou "anônimo".

Se o teste envolver dados, **use apenas dados fictícios** em ambiente de testes.

---

## Fora de escopo

Estes itens normalmente **não** são tratados como vulnerabilidade:

- Ausência de cabeçalhos de segurança sem impacto demonstrado.
- Relatórios automáticos de scanners sem prova de explorabilidade.
- Ataques que exigem dispositivo/usuário já comprometido (ex.: malware local).
- Engenharia social, phishing ou ataques físicos.
- Falhas que dependem de extensão/usuário malicioso no próprio navegador.
- Divulgação de versões desatualizadas de dependências **sem** caminho de exploração no contexto do app.
- Denegação de serviço por volume/força bruta contra a infraestrutura do provedor.

---

## Nosso compromisso (prazos-alvo)

| Etapa | Prazo-alvo |
|-------|-----------|
| Confirmação de recebimento | até **3 dias úteis** |
| Triagem inicial e classificação de severidade | até **7 dias úteis** |
| Correção de falha crítica/alta | até **30 dias** |
| Correção de falha média/baixa | próximo ciclo de manutenção |
| Aviso público (se aplicável) | após a correção estar em `main` |

> Estes prazos são metas de boa-fé de um projeto mantido por um único responsável, não
> um contrato de nível de serviço.

### O que pedimos de você

- Dê-nos tempo razoável para corrigir antes de qualquer divulgação pública.
- Não acesse, altere, copie nem exclua dados de terceiros ou de pacientes.
- Não degrade o serviço (sem testes de carga, DoS ou spam de requisições).
- Use apenas contas e dados que você mesmo criou para os testes.

### O que oferecemos

- Resposta e acompanhamento do relato até a resolução.
- Crédito público no aviso de segurança, se você quiser.
- Tratamento confidencial da sua identidade, se preferir o anonimato.

---

## Práticas de segurança do projeto

Contexto útil para quem for reportar algo (e para não reportar o que já é tratado):

- **Autenticação e sessão** centralizadas via `base44.auth.me()`, com validação de papel
  (*role*) em `session.ts`.
- **Isolamento de posse** tipado via `OwnedEntity` / `resolveScope` para escopo de dados
  por usuário/organização.
- **Auditoria LGPD** com registro estruturado de eventos de acesso (`AccessLogger.ts`,
  entidade `AccessLog`) e consentimento explícito (`LGPDConsent.tsx`).
- **Comunicação** feita pelo SDK oficial `@base44/sdk`.
- **Tipagem estrita** (`strict: true` no TypeScript) em todo o código novo.
- **Skill de auditoria** própria do projeto em
  [`.github/skills/security-code-audit/`](skills/security-code-audit/SKILL.md), usada a cada
  revisão relevante.

O histórico de auditorias e os achados já corrigidos estão documentados no
[`README.md`](../README.md#segurança) e em `docs/security-audit/`.

---

## Agradecimentos

Obrigado por ajudar a proteger os dados de pacientes e profissionais que usam o
prontuário-fácil. Relatos responsáveis são bem-vindos e reconhecidos.
