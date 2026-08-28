# Design System (Overview)

> Gerado por reversa-design-system em 27/08/2026.
> Nível de Confiança: 🟢 Alta. Baseado em arquivos de configuração estáticos do Tailwind, CSS e `components.json`.

O "Prontuário Fácil" adota o padrão de UI do **Shadcn UI**, gerando componentes diretamente na pasta `src/components/ui/` sob a variante de estilo **`new-york`** e base de cor **`neutral`**.

## Princípios de UI do Projeto

1. **Estilização Utilitária Absoluta:** O projeto usa o TailwindCSS de forma nativa e intensiva. Não há regras CSS soltas para componentes isolados no arquivo `index.css`, apenas a definição do esqueleto de variáveis de tema.
2. **Sistema de Tema Flexível (Dark Mode First-Class):** Todas as cores são estruturadas sob HSL em variáveis semânticas (ex: `var(--card)`, `var(--primary)`). Se um usuário alternar para o tema escuro (`.dark`), o contraste de todos os componentes inverte perfeitamente de forma automática, sem a necessidade de prefixar `dark:bg-black` em cada componente.
3. **Padrão de Ícones e Interface:**
   - **Ícones:** Lucide React (`iconLibrary: "lucide"`).
   - **Formas (Radius):** Arredondamentos contidos de 8px padrão, fornecendo um aspecto sério mas não completamente "quadrado".
   - **Animações:** Suporte nativo à plugin `tailwindcss-animate`, provendo suporte para comportamentos de sanfona (accordion).
4. **App-Like Feel (PWA/Mobile):**
   - O sistema desabilita a seleção de texto do navegador em tags `<button>`, `<a>`, e `<nav>`, tornando o toque no celular muito mais responsivo (evita que o texto seja selecionado por acidente no long press).
   - Inclui preenchimentos e áreas de respiro nativas de telas (Notch/Dynamic Island) usando as variáveis `env(safe-area-inset)`.

## Documentos Relacionados

- [Paleta de Cores (`color-palette.md`)](file:///d:/Projetos/prontuario-facil/_reversa_sdd/design-system/color-palette.md)
- [Tipografia (`typography.md`)](file:///d:/Projetos/prontuario-facil/_reversa_sdd/design-system/typography.md)
- [Espaçamento e Layout (`spacing.md`)](file:///d:/Projetos/prontuario-facil/_reversa_sdd/design-system/spacing.md)
- [Tabela de Tokens (`tokens.md`)](file:///d:/Projetos/prontuario-facil/_reversa_sdd/design-system/tokens.md)
