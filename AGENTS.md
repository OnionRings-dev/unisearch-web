# Agent Guidelines for Uni Search

## Commands
- **Build**: `npm run build` (TypeScript + Vite)
- **Lint**: `npm run lint` (ESLint with TypeScript/React rules)
- **Dev**: `npm run dev` (Vite dev server)
- **Test**: No test framework configured yet

## Code Style
- **Framework**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui with New York style, Tailwind CSS, Lucide icons
- **Imports**: React/* first, then libraries, then local (@/* path mapping)
- **Components**: Function components with proper TypeScript props
- **Styling**: Tailwind classes with `cn()` utility for merging
- **Variants**: Use `class-variance-authority` for component variants
- **TypeScript**: Strict mode, no unused locals/parameters
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Use try/catch for async operations, proper error boundaries