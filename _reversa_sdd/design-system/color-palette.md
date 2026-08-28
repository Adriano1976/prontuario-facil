# Sistema de Cores (Paleta)

> Gerado por reversa-design-system em 27/08/2026.
> Nível de Confiança: 🟢 Extraído de `src/index.css` e `tailwind.config.js`.

O projeto adota uma arquitetura de tokens baseada em **HSL** (`hsl(var(--token))`), suportando nativamente Light Mode e Dark Mode através da classe `.dark`. As cores são padronizadas ao redor da UI library Shadcn UI (estilo "new-york" com tema base "neutral").

## Tokens Estruturais

| Token | Light Mode (HSL) | Dark Mode (HSL) | Uso |
| --- | --- | --- | --- |
| `--background` | `0 0% 100%` (Branco) | `0 0% 3.9%` (Quase Preto) | Fundo principal da aplicação |
| `--foreground` | `0 0% 3.9%` | `0 0% 98%` | Texto principal |
| `--border` | `0 0% 89.8%` | `0 0% 14.9%` | Bordas de componentes (`* { border-border }`) |
| `--input` | `0 0% 89.8%` | `0 0% 14.9%` | Bordas de inputs e textareas |
| `--ring` | `0 0% 3.9%` | `0 0% 83.1%` | Anel de foco de teclado (outline) |

## Tokens de Componentes

| Token | Light Mode (HSL) | Dark Mode (HSL) | Uso |
| --- | --- | --- | --- |
| `--card` | `0 0% 100%` | `0 0% 3.9%` | Fundo de cartões |
| `--popover` | `0 0% 100%` | `0 0% 3.9%` | Fundo de menus flutuantes, tooltips e modais |
| `--primary` | `0 0% 9%` | `0 0% 98%` | Elementos de ação principal (ex: botão primary) |
| `--secondary`| `0 0% 96.1%` | `0 0% 14.9%` | Elementos de ação secundária |
| `--muted` | `0 0% 96.1%` | `0 0% 14.9%` | Fundo para elementos sem ênfase (ex: badges) |
| `--accent` | `0 0% 96.1%` | `0 0% 14.9%` | Hover em itens de lista ou menu |
| `--destructive`| `0 84.2% 60.2%` | `0 62.8% 30.6%` | Ações perigosas (ex: excluir paciente) |

## Sidebar e Layout

| Token | Light Mode | Dark Mode |
| --- | --- | --- |
| `--sidebar-background` | `0 0% 98%` | `240 5.9% 10%` |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` |
| `--sidebar-accent` | `240 4.8% 95.9%`| `240 3.7% 15.9%` |

## Gráficos (Data Visualization)

A escala de cores para gráficos (`--chart-1` a `--chart-5`) usa tons vibrantes no Light Mode (ex: Laranja, Turquesa, Azul Escuro) e tons análogos adaptados para leitura no Dark Mode.
