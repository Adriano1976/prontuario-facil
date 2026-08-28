# Espaçamento e Layout

> Gerado por reversa-design-system em 27/08/2026.
> Nível de Confiança: 🟢 Extraído de `tailwind.config.js` e `src/index.css`.

## Safe Areas (Mobile)
A aplicação possui suporte a PWA/Mobile wrappers através das classes criadas em `index.css`:
- `.safe-area-top` (Usa `env(safe-area-inset-top)`)
- `.safe-area-bottom` (Usa `env(safe-area-inset-bottom)`)

A seleção de texto também é globalmente prevenida em botões e links para evitar comportamentos nativos não desejados (ex: long-press em Android):
`user-select: none; -webkit-user-select: none;`

## Raios de Borda (Border Radius)
Definidos em cascata através de uma variável `--radius` primária:
- **Base (lg):** `var(--radius)` (Em `index.css` está `0.5rem` / 8px).
- **Médio (md):** `calc(var(--radius) - 2px)` (6px).
- **Pequeno (sm):** `calc(var(--radius) - 4px)` (4px).

## Breakpoints & Espaçamentos Padrões
A aplicação delega ao Tailwind as escalas de espaçamento (escala linear com base `0.25rem` / 4px) e breakpoints padrão:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
