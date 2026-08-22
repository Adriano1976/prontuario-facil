# Dependências — prontuario-facil

> Gerado pelo **Scout** — dependências e versões.
> Gerenciador de pacotes: **npm** (`package-lock.json` presente)
> Data: 2026-08-20

## Dependências de produção

| Pacote | Versão | Função |
|--------|--------|--------|
| react | ^18.2.0 | UI |
| react-dom | ^18.2.0 | UI (DOM) |
| react-router-dom | ^7.18.2 | Roteamento |
| @tanstack/react-query | ^5.84.1 | Data fetching / cache |
| @base44/sdk | ^0.8.43 | Cliente da plataforma Base44 (CRUD de entidades + auth) |
| @base44/vite-plugin | ^1.0.30 | Plugin Vite da Base44 (HMR, navegação, visual edit) |
| @hello-pangea/dnd | ^17.0.0 | Drag & drop |
| @hookform/resolvers | ^4.1.2 | Resolução de schema p/ react-hook-form |
| react-hook-form | ^7.54.2 | Formulários |
| zod | ^3.24.2 | Validação de schema |
| @radix-ui/* | ^1.x–^2.x | Primitivas de UI (≈24 pacotes, base shadcn/ui) |
| class-variance-authority | ^0.7.1 | Variantes de estilo |
| clsx | ^2.1.1 | Composição de classes |
| tailwind-merge | ^3.0.2 | Merge de classes Tailwind |
| tailwindcss-animate | ^1.0.7 | Animações Tailwind |
| lucide-react | ^0.475.0 | Ícones |
| framer-motion | ^11.16.4 | Animações |
| date-fns | ^3.6.0 | Datas |
| moment | ^2.30.1 | Datas (legado/outro uso) |
| next-themes | ^0.4.4 | Temas (dark mode) |
| sonner | ^2.0.1 | Toasts |
| react-hot-toast | ^2.6.0 | Toasts (adicional) |
| react-day-picker | ^8.10.1 | Calendário |
| embla-carousel-react | ^8.5.2 | Carrossel |
| vaul | ^1.1.2 | Drawer |
| recharts | ^2.15.4 | Gráficos |
| react-markdown | ^9.0.1 | Renderização Markdown |
| react-quill | ^0.0.2 | Editor de texto rico |
| react-resizable-panels | ^2.1.7 | Painéis redimensionáveis |
| cmdk | ^1.0.0 | Command menu |
| input-otp | ^1.4.2 | Input OTP |
| canvas-confetti | ^1.9.4 | Confete |
| three | ^0.171.0 | 3D |

### Instaladas, mas sem uso no código-fonte `src/` (prováveis resíduos de template)

| Pacote | Versão | Nota |
|--------|--------|------|
| @stripe/react-stripe-js | ^3.0.0 | Pagamentos — sem import em `src/` |
| @stripe/stripe-js | ^5.2.0 | Pagamentos — sem import em `src/` |
| react-leaflet | ^4.2.1 | Mapas — sem import em `src/` |
| jspdf | ^4.2.1 | Exportação PDF — sem import em `src/` |
| html2canvas | ^1.4.1 | Captura de tela p/ PDF — sem import em `src/` |
| lodash | ^4.17.21 | Utilitários — sem import em `src/` |

## Dependências de desenvolvimento

| Pacote | Versão | Função |
|--------|--------|--------|
| vite | ^6.1.0 | Bundler / dev server |
| @vitejs/plugin-react | ^4.3.4 | Plugin React para Vite |
| typescript | ^5.8.2 | Typecheck |
| eslint | ^9.19.0 | Lint |
| @eslint/js | ^9.19.0 | Config ESLint |
| eslint-plugin-react | ^7.37.4 | Regras React |
| eslint-plugin-react-hooks | ^5.0.0 | Regras hooks |
| eslint-plugin-react-refresh | ^0.4.18 | Fast refresh |
| eslint-plugin-unused-imports | ^4.3.0 | Imports não usados |
| globals | ^15.14.0 | Globals p/ ESLint |
| @types/node | ^22.13.5 | Tipos Node |
| @types/react | ^18.2.66 | Tipos React |
| @types/react-dom | ^18.2.22 | Tipos React DOM |
| tailwindcss | ^3.4.17 | CSS utility-first |
| postcss | ^8.5.3 | Processador CSS |
| autoprefixer | ^10.4.20 | Prefixos CSS |
| baseline-browser-mapping | ^2.8.32 | Compatibilidade de browser |

## Integrações externas

| Integração | Tipo | Uso real |
|------------|------|----------|
| **Base44** (BaaS) | Backend-as-a-Service | **Sim** — principal. Auth + CRUD de entidades via `@base44/sdk` |
| Stripe | Pagamentos | Não (resíduo de template) |
| react-leaflet | Mapas | Não (resíduo de template) |
| jsPDF / html2canvas | PDF | Não (resíduo de template) |

## Observações

- **Sem framework de testes** configurado e **sem testes** no repositório.
- O README cita "Supabase", mas **não existe** dependência Supabase — a stack real de backend é a Base44.
- A app não possui servidor próprio; toda persistência e autenticação passa pela API da Base44 (proxied pelo plugin Vite, ex.: `/api/apps/public`).