# Agent Guidelines for UniSearch

## Commands
- **Build**: `npm run build` (TypeScript + Vite)
- **Lint**: `npm run lint` (ESLint with TypeScript/React rules)
- **Dev**: `npm run dev` (Vite dev server, proxy `/api` → `localhost:8000`)
- **Test**: No test framework configured yet

## Architecture

The frontend talks to `unisearch-api` (FastAPI backend) for all data. There is no more localStorage for chat/user data — everything is persisted on PostgreSQL.

### Key files

| File | Purpose |
|------|---------|
| `src/config/endpoints.ts` | Centralized API endpoint URLs (AUTH, USER, CHAT, QUERY, COLLECTIONS) |
| `src/types/api.ts` | All API request/response types (Collection, StudentProfile, ChatListItem, etc.) |
| `src/services/authApi.ts` | Google OAuth login, JWT refresh, logout |
| `src/services/chatService.ts` | Chat CRUD: save, list, get, delete (calls `/auth/chat/*`) |
| `src/services/profileService.ts` | Student profile: fetch, update, delete account |
| `src/services/collectionService.ts` | Fetch available Milvus collections/universities |
| `src/hooks/useAuth.ts` | Auth state management (JWT parse, refresh, expiry) |
| `src/hooks/useCollections.ts` | Dynamic university list from API |
| `src/hooks/useRagQuery.ts` | Streaming RAG query via SSE |

### Data flow

```
User action → React component → Service (src/services/) → API call → PostgreSQL/Milvus
                                                                          ↓
User sees   ← React state      ← Response              ← Backend response
```

**Chat storage**: `RagInterface` → `chatStorage.ts` → `chatService.ts` → `POST/GET /auth/chat/*` → PostgreSQL `chats` table

**Collections**: `RagInterface` → `useCollections()` → `collectionService.ts` → `GET /collections` → Milvus

**Profile**: `ProfileView` → `profileService.ts` → `GET/PUT /auth/user/me/profile` → PostgreSQL `student_profiles` table

## Code Style
- **Framework**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui with New York style, Tailwind CSS, Lucide icons
- **Imports**: React/* first, then libraries, then local (@/* path mapping)
- **Components**: Function components with proper TypeScript props
- **Styling**: Tailwind classes with `cn()` utility for merging
- **Variants**: Use `class-variance-authority` for component variants
- **TypeScript**: Strict mode, no unused locals/parameters
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: try/catch for async operations, error state in UI
- **Endpoints**: Always use `ENDPOINTS` from `@/config/endpoints`, never hardcode URLs
- **Types**: Shared types in `src/types/api.ts`, component-specific types colocated

## Adding a new API endpoint

1. Add the URL to `src/config/endpoints.ts`
2. Add request/response types to `src/types/api.ts`
3. Create a service function in `src/services/`
4. Call the service from the component/hook
