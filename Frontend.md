# Pullmates — Frontend (Next.js)

This document describes how to build the Pullmates frontend using Next.js. It covers stack choices, project structure, routing, data fetching, auth, and core components, aligned with the MVP scope in the main project plan.

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Server components reduce client JS for feed-heavy pages; built-in routing, image optimization, and API proxying |
| Language | TypeScript | Type safety across API responses and component props |
| Styling | Tailwind CSS | Fast iteration, consistent design tokens, easy dark mode |
| Data fetching | TanStack Query (React Query) | Caching, background refetch, optimistic updates for reactions/joins |
| Forms | React Hook Form + Zod | Schema validation shared with backend expectations |
| Auth | NextAuth.js (Auth.js) with GitHub provider | GitHub OAuth doubles as login + repo-linking permission grant |
| Realtime | Server-Sent Events or WebSocket client (native or `socket.io-client`) | Live notifications, new comments/updates without polling |
| State (client-only UI state) | Zustand or React context | Lightweight, avoid Redux overhead for MVP scope |
| Package manager | pnpm | Faster installs, disk-efficient |

## 2. Project Structure

```
frontend/
  app/
    (marketing)/
      page.tsx                 # Landing page for logged-out visitors
    (app)/
      layout.tsx                # Authenticated app shell (nav, notifications bell)
      feed/
        page.tsx                # Main discovery feed (public projects)
        loading.tsx
      projects/
        [id]/
          page.tsx               # Project detail page
          edit/page.tsx           # Poster-only edit form
        new/
          page.tsx                # Create project flow (incl. GitHub link step)
      profile/
        [username]/page.tsx      # Public profile (contributor history)
        settings/page.tsx        # Own account settings
      notifications/
        page.tsx
    api/
      auth/[...nextauth]/route.ts # NextAuth handler
      github-preview/route.ts     # Server route: proxy to backend for repo preview
    layout.tsx                    # Root layout, theme provider, QueryClientProvider
    globals.css
  components/
    project/
      ProjectCard.tsx             # Feed list item
      ProjectHeader.tsx           # Detail page header (title, stage badge, repo stats)
      ReactionBar.tsx
      CommentThread.tsx
      JoinRequestButton.tsx
      UpdateComposer.tsx          # Poster's "post an update" form
      UpdateFeed.tsx
      RoleTags.tsx
      RepoPreviewCard.tsx         # Renders auto-filled GitHub data
    layout/
      NavBar.tsx
      NotificationBell.tsx
      Sidebar.tsx
    ui/                           # Reusable primitives (Button, Badge, Modal, Avatar)
  lib/
    api-client.ts                 # Typed fetch wrapper around backend REST API
    auth.ts                       # NextAuth config, session helpers
    query-keys.ts                 # Central React Query key factory
    types.ts                      # Shared TS types mirroring backend serializers
  hooks/
    useProjects.ts
    useProject.ts
    useJoinRequest.ts
    useNotifications.ts
  middleware.ts                   # Route protection for (app) group
  next.config.js
  tailwind.config.ts
```

## 3. Routing & Pages

- **Landing (`/`)** — logged-out marketing page. Server component, static generation where possible.
- **Feed (`/feed`)** — main discovery surface for browsers. Filters (tag, stage, role wanted) live in the URL as search params so filtered views are shareable/bookmarkable. Fetch via server component for initial paint, hydrate with React Query for client-side filter changes.
- **Project detail (`/projects/[id]`)** — shows repo auto-fill data, roles wanted, updates feed, comments, reactions, and join button. Private projects redirect non-members to a 404-style "not found" page rather than an explicit "private" message, to avoid leaking existence.
- **Create project (`/projects/new`)** — multi-step form: basic info → optional GitHub repo link (triggers preview fetch) → roles wanted → visibility toggle.
- **Profile (`/profile/[username]`)** — public contributor history (projects joined, projects posted), skills, links.
- **Notifications (`/notifications`)** — list view backing the notification bell; bell shows unread count via polling or SSE.

Use Next.js **route groups** — `(marketing)` vs `(app)` — to apply different layouts (public nav vs. authenticated app shell) without affecting the URL path.

## 4. Data Fetching Pattern

- Prefer **server components** for the initial render of list/detail pages (feed, project detail) — fetch directly from the Django REST API using a server-side fetch with the user's session token forwarded.
- Use **React Query on the client** for anything that needs interactivity after load: reactions, join requests, comment posting, filter changes, infinite scroll pagination.
- Mutations (react, comment, join request, post update) use React Query's `useMutation` with **optimistic updates** for reactions (instant UI feedback) and standard invalidate-on-success for join requests/comments (correctness matters more than instant feedback there).

Example pattern for a mutation hook:

```ts
// hooks/useJoinRequest.ts
export function useJoinRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      apiClient.post(`/projects/${projectId}/join-requests/`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
}
```

## 5. Auth Flow

1. User clicks "Sign in with GitHub" → NextAuth redirects to GitHub OAuth.
2. On callback, NextAuth exchanges the code, receives the GitHub access token, and calls a backend endpoint (`POST /api/auth/github/`) to create or fetch the corresponding Django user and issue a backend session token (JWT or DRF token).
3. Store the backend token in the NextAuth session (via the `jwt` and `session` callbacks) so `lib/api-client.ts` can attach it as a `Authorization: Bearer <token>` header on every backend request.
4. `middleware.ts` protects all routes under `(app)` — unauthenticated users are redirected to `/` with a `callbackUrl`.
5. The GitHub access token (not the backend session token) is stored server-side only and used later for repo auto-fill and re-sync calls — never exposed to client-side JS.

## 6. Key Components

**ProjectCard** — feed list item. Shows title, one-line description, stage badge, tags, roles wanted, reaction count, and "last active" timestamp (drives the activity-based ranking mentioned in the plan). Clicking navigates to detail; reacting works inline without navigation.

**RepoPreviewCard** — renders the GitHub auto-fill payload: language breakdown bar, star/fork counts, truncated README (with "read more" expansion), and a list of open `help wanted` / `good first issue` items as clickable chips linking back to GitHub.

**UpdateComposer / UpdateFeed** — the changelog mechanic from the plan. Poster writes a short update; followers get a notification. Render chronologically, newest first, with relative timestamps.

**JoinRequestButton** — shows different states: "Request to join" (not a member), "Pending" (request sent), "Member" (accepted). Opens a small modal to attach an optional message on request.

**NotificationBell** — polls `/api/notifications/unread-count/` every 30s as a fallback, upgraded to SSE/WebSocket push when available, to keep the badge count live without full page reloads.

## 7. Styling & Design System

- Tailwind config defines the palette, spacing scale, and typography once; components consume it via utility classes, not inline styles.
- Support dark mode via Tailwind's `dark:` variant driven by a `ThemeProvider` (persisted in `localStorage`, respects `prefers-color-scheme` by default).
- Stage badges (Idea / Building / Launched / Maintained) get a consistent small color-coded pill component reused everywhere a project is referenced (feed, detail, profile).

## 8. Environment Variables (frontend)

```
NEXT_PUBLIC_API_BASE_URL=https://api.pullmates.dev
NEXTAUTH_URL=https://pullmates.dev
NEXTAUTH_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## 9. Testing

- **Unit/component:** Vitest + React Testing Library for components (ProjectCard, ReactionBar, JoinRequestButton state transitions).
- **E2E:** Playwright — cover the critical paths: sign in → create project with repo link → another user joins → poster posts an update → original user gets notified.

## 10. Deployment

- Deploy to Vercel (first-class Next.js support, preview deployments per PR) or a containerized Node server if you need to keep frontend/backend infra unified.
- Set `NEXT_PUBLIC_API_BASE_URL` per environment (local/staging/prod) via Vercel project environment variables.
- Enable ISR (Incremental Static Regeneration) for the landing page and any public, low-change marketing content; keep the feed and project detail pages dynamic.

## 11. Build Order (maps to MVP scope in the plan)

1. Auth (NextAuth + GitHub) and protected route shell
2. Feed page (server-rendered list, no filters yet)
3. Project detail page (read-only)
4. Create project form (without GitHub auto-fill first, add it once backend endpoint exists)
5. Reactions + comments
6. Join request flow
7. Updates feed (poster post + follower view)
8. Filters on feed (tag, stage, role)
9. Notifications (polling first, upgrade to realtime later)
