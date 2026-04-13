# Buildmancer Frontend Design Spec

## Overview

Next.js 15 frontend for Buildmancer — a browser-based coding education platform where students build real projects through guided, testable submodules. Three page groups: marketing (landing, pricing), platform (course dashboard, workspace). Dark theme, Spanish-first.

**Stack:** Next.js 15 (App Router), Tailwind CSS v4, CodeMirror 6, Lucide React, TypeScript

**Backend:** FastAPI at `/api/*` (proxied via Next.js rewrites in dev). SSE for test streaming. Debounced PATCH for autosave. See `docs/superpowers/specs/2026-04-12-buildmancer-architecture-design.md` for full API surface.

---

## 1. Architecture & Routing

Single Next.js app in `frontend/`. App Router with route groups to separate marketing and platform layouts.

```
frontend/src/app/
├── (marketing)/              # Marketing layout: nav bar + footer
│   ├── layout.tsx
│   ├── page.tsx              # Landing page (/)
│   └── pricing/
│       └── page.tsx          # Pricing page (/pricing)
├── (platform)/               # Platform layout: no marketing chrome
│   ├── layout.tsx
│   ├── courses/
│   │   ├── page.tsx          # Course dashboard (/courses)
│   │   └── [courseId]/
│   │       └── page.tsx      # Course detail + language select (/courses/http-server)
│   └── workspace/
│       └── [courseId]/
│           └── [lang]/
│               └── page.tsx  # Workspace (/workspace/http-server/go)
├── layout.tsx                # Root layout: fonts, theme, metadata
└── globals.css               # Tailwind + CSS custom properties
```

### Rendering strategy

| Route | Rendering | Why |
|-------|-----------|-----|
| `/` | Server component (SSR) | SEO, fast first paint |
| `/pricing` | Server component (SSR) | SEO, static content |
| `/courses` | Server component | Fetches `/api/courses`, needs fresh data |
| `/courses/[courseId]` | Server component | Fetches course detail + enrollment state |
| `/workspace/[courseId]/[lang]` | `'use client'` | CodeMirror, SSE, panel state, autosave — all client-side |

### API proxying

`next.config.js` rewrites `/api/*` to the Python backend:
- Dev: `http://localhost:8000/api/*`
- Prod: same-origin (reverse proxy handles it)

---

## 2. Design System

### Colors (CSS custom properties)

```css
:root {
  --bg: #131111;
  --surface: #0d0d0d;
  --surface-hover: #1a1a1a;
  --border: #1a1a1a;
  --primary: #ff0000;
  --primary-hover: #cc0000;
  --primary-subtle: rgba(255, 0, 0, 0.08);
  --text: #ffffff;
  --text-muted: #888888;
  --text-dim: #555555;
  --success: #4ec9b0;
  --error: #f44747;
  --warning: #ff6600;
}
```

Tailwind config extends with these values. All components reference custom properties, not raw hex.

### Typography

- **Body/UI:** Inter (with system font fallback)
- **Code/Editor:** JetBrains Mono or system monospace
- **Marketing scale:** Hero 56-72px, H2 36-48px, body 18-20px — generous, editorial
- **Platform scale:** H2 20px, body 14px, labels 11px — compact, functional

### Icons

Lucide React throughout. Default size 20px, compact size 16px. Consistent stroke width.

### Buttons

| Variant | Style |
|---------|-------|
| Primary | `bg-primary text-white` — red, used for CTAs |
| Secondary | `border border-white/20 text-white` — transparent, outline |
| Ghost | No border, hover: `bg-surface-hover` |

All buttons: `rounded-lg`, `transition-colors duration-150`, subtle hover state. No bouncy or dramatic animations.

### Motion

- Transitions: 150ms ease for hovers, color changes
- Panel collapse/expand: 200ms ease-out
- SSE test results: fade-in per line, 100ms stagger
- No spring physics, no bounce, no parallax

---

## 3. Landing Page (`/`)

Spanish-first marketing page. Aspirational tone — career-value driven. Full-bleed sections with generous whitespace.

### Navigation bar

- **Left:** Buildmancer logo (`builderslogo2.svg`)
- **Center:** "Cómo funciona" | "Proyectos" | "Precios" — anchor links to page sections and /pricing
- **Right:** "Comenzar" CTA button (primary)
- **Behavior:** Transparent background over hero. On scroll past hero, transitions to solid `--bg` with border-bottom. Sticky.

### Section 1: Hero

Full viewport height. Centered content.

- **Headline:** "Construye software real. Aprende de verdad."
- **Subline:** Career angle — projects go to your portfolio, repos on your GitHub, certifications on LinkedIn. ~2 sentences.
- **CTA:** "Empieza a construir" (primary button, large)
- **Background:** Subtle decorative element — faint geometric grid or pattern derived from the logo aesthetic. Not distracting.

### Section 2: How it works

Three-step horizontal layout (stacks vertically on mobile).

1. **"Elige un proyecto"** — Pick from real-world challenges (HTTP server, DNS, etc.)
2. **"Escribe código real"** — Guided submodules, real tests, no hand-holding
3. **"Llévalo a tu portafolio"** — Finished repo on GitHub, certification on LinkedIn

Each step: Lucide icon, title, 1-2 sentence description. Connected by a subtle line or step indicator.

### Section 3: Project showcase

Grid of course cards fetched from `/api/courses` at build/request time.

Each card:
- Project title
- Short description
- Language badges (Go, Python, etc.)
- Difficulty tag

Even with one course, the grid layout accommodates future additions.

### Section 4: Career value

The core pitch. Three value blocks in a grid:

1. **GitHub repo** — "Tu proyecto, tus commits, tu perfil." Complete the course, the repo lands on your GitHub with your commit history.
2. **Certificación** — "Lista para LinkedIn." Verifiable certification of completion.
3. **Software real** — "No son apps de juguete." Real protocols, real architecture. Understand what you're building.

### Section 5: Pricing teaser

Brief mention: "Comienza gratis. Planes desde $149 MXN/mes." Link to `/pricing`.

### Section 6: Final CTA

Closing line + repeated "Empieza a construir" button. Simple, clean.

---

## 4. Pricing Page (`/pricing`)

### Header

"Un plan. Todo incluido."

### Three pricing cards

Centered row (stacks on mobile). Middle card (Buildmancer) gets a highlight border or "Popular" badge.

| | Free | Buildmancer | Estudiante |
|---|---|---|---|
| **Price** | $0 | $199 MXN/mes | $149 MXN/mes |
| **Access** | 1 free project | All projects, all languages | All projects, all languages |
| **Features** | Editor + tests | GitHub repo export, LinkedIn certification, progress tracking | Everything in Buildmancer |
| **How** | Sign up | Subscribe | Student verification (university email or ID) |
| **CTA** | "Comenzar gratis" | "Suscribirse" | "Verificar estudiante" |

### FAQ section

Below the cards. 4-5 collapsible questions:
- What's included in the free plan?
- How does student verification work?
- How does the GitHub repo export work?
- How does the certification work?
- Can I cancel anytime?

Placeholder answers for now — real copy later.

---

## 5. Course Dashboard (`/courses`)

Server-rendered. Fetches from `GET /api/courses`.

### Layout

- Top: "Proyectos" heading
- Grid of course cards (1 col mobile, 2 col tablet, 3 col desktop)

### Course card

- Course title (e.g. "HTTP Server")
- Short description
- Difficulty tag
- **Progress bar** — shows progress for the language with highest completion % the user has enrolled in. Small badge indicates which language (e.g. "Go — 3/7").
- Click anywhere on card → navigates to `/courses/[courseId]`

### Course detail page (`/courses/[courseId]`)

- Course title and full description
- Language options as selectable cards (e.g. Go, Python)
- Each language card shows enrollment progress if enrolled ("3/7 submodules") or "Start" if not
- Clicking a language: if not enrolled, POST `/api/enroll/{course}/{lang}` then redirect. If enrolled, redirect directly.
- Destination: `/workspace/{course}/{lang}`

---

## 6. Workspace (`/workspace/[courseId]/[lang]`)

The core product. Full-screen, chrome-free. `'use client'` component.

### Layout structure

```
┌──────┬────────────┬────────────────────────────────┐
│ Icon │ Collapsible│          Tab Bar               │
│ Rail │   Panel    ├────────────────────────────────┤
│      │            │                                │
│  B   │ Modules    │         Code Editor            │
│  📦  │ or Files   │       (CodeMirror 6)           │
│  📁  │ or Resources│                               │
│  📖  │            │                                │
│      │            ├────────────────────────────────┤
│  ▶   │            │     Test Output (expandable)   │
│  🏠  │            │                                │
└──────┴────────────┴────────────────────────────────┘
```

All icons above are Lucide React in production — the diagram uses emoji for clarity only.

### Icon rail (48px wide)

Fixed left column. Dark background (`--surface`).

| Icon | Action |
|------|--------|
| Logo mark | Brand anchor (non-interactive) |
| `Package` | Toggle modules panel |
| `FolderOpen` | Toggle file tree panel |
| `BookOpen` | Toggle resources panel |
| `Play` | Run tests (red background, prominent) |
| `Home` | Navigate back to `/courses` |

Clicking an active icon collapses the panel. Clicking a different icon swaps panel content. Active icon has a left border accent (`--primary`) and highlighted background.

### Collapsible panel (220px, collapsible to 0)

Shows one of three views based on active icon:

**Modules view:**
- Course title and language at top
- Overall progress bar (e.g. "2/7" with red bar)
- Module list with states:
  - **Completed** — green check, muted text
  - **Active** — red left border, highlighted background, "In progress" label
  - **Locked** — dimmed, circle outline
- Clicking a completed/active module loads that submodule's files in the editor

**Files view:**
- File tree for the current submodule
- Shows all working files (e.g. `main.go`, `handler.go`)
- Active file highlighted
- Click to open in editor tab

**Resources view:**
- List of resource files for the current submodule (from `/api/resources/{course}/{lang}/{module}`)
- Click a resource → opens resource reader

### Resource reader

Two modes, toggleable:

1. **Slide-over** (default) — renders markdown over the editor as a modal/drawer. Full-width readable area. Dismiss to return to editor. Good for focused reading.
2. **Side-by-side split** — splits the editor area. Resource markdown on right, code on left. Good for reference while coding.

Toggle between modes via a button in the resource reader header.

### Code editor

- **CodeMirror 6** with appropriate language mode (Go, Python, etc. based on `lang` param)
- Tab bar for multi-file editing — tabs for each working file
- Active tab has red top border
- **Autosave:** debounced PATCH to `/api/files/{course}/{lang}` — 1-2 second debounce after last keystroke
- Dark theme matching `--bg` and `--surface` colors
- Line numbers enabled

### Test output panel

- **Default state:** collapsed (hidden)
- **On run (▶ click):** panel auto-expands from bottom with 200ms ease-out animation
- **Header:** "Test Output" label + pass count badge (e.g. "2/5 passed") + close button
- **Results stream via SSE** from `/api/stream/{run_id}`:
  - Each test appears as a line with icon + description + duration
  - `✓` green for pass, `✗` red for fail (with error detail expanded below), `○` dim for pending/skipped
  - Lines fade in as they arrive from SSE (100ms stagger)
- **Close button** collapses panel back to hidden
- **Persistent:** last run results stay visible until next run or manual close

### Keyboard shortcuts

- `Ctrl/Cmd + Enter` — Run tests
- `Ctrl/Cmd + S` — Force save (in addition to autosave)
- `Ctrl/Cmd + B` — Toggle panel collapse
- `Escape` — Close resource reader or test output

---

## 7. API Integration

### Server-side (marketing + courses pages)

Direct `fetch()` calls in server components:

```typescript
// In /courses page.tsx
const courses = await fetch(`${API_BASE}/api/courses`).then(r => r.json());
```

### Client-side hooks (workspace)

| Hook | Purpose | Endpoint |
|------|---------|----------|
| `useCourse(courseId, lang)` | Load course metadata, enrollment state, files | `GET /api/courses/{course}/{lang}`, `GET /api/files/{course}/{lang}` |
| `useAutosave(courseId, lang)` | Debounced file save on editor change | `PATCH /api/files/{course}/{lang}` |
| `useTestRunner(courseId, lang, module)` | Trigger run + subscribe to SSE stream | `POST /api/run/{course}/{lang}/{module}` → `GET /api/stream/{run_id}` |
| `useResources(courseId, lang, module)` | Fetch resource list and content | `GET /api/resources/{course}/{lang}/{module}` |
| `useProgress(courseId, lang)` | Fetch/update progress state | `GET /api/progress/{course}/{lang}` |

### SSE consumption

The `useTestRunner` hook:
1. POST to `/api/run/...` → receives `{ run_id }`
2. Opens `EventSource` to `/api/stream/{run_id}`
3. Parses SSE events: `test_start`, `test_pass`, `test_fail`, `run_complete`, `error`
4. Updates state per event, triggers UI updates (line-by-line test results)
5. Closes connection on `run_complete` or `error`

### Autosave

The `useAutosave` hook:
1. Listens to CodeMirror `onChange`
2. Debounces for 1500ms after last keystroke
3. Sends PATCH with `{ files: { "main.go": "content..." } }`
4. Shows subtle save indicator (small dot or "Saved" text near tab)

---

## 8. Responsive Behavior

### Marketing pages (/, /pricing)

Fully responsive, mobile-first:
- Nav collapses to hamburger menu on mobile
- Hero stacks vertically
- How-it-works steps stack vertically
- Course cards: 1 col → 2 col → 3 col
- Pricing cards stack on mobile

### Course dashboard (/courses, /courses/[id])

Responsive grid, same as marketing.

### Workspace

**Desktop only (min-width: 1024px).** On smaller screens, show a centered message:

> "Buildmancer funciona mejor en escritorio. Abre esta página en tu computadora para comenzar a construir."

With the Buildmancer logo and a link back to `/courses`.

---

## 9. State Management

No global state library. React state + context where needed:

- **Workspace context** — wraps the workspace page. Holds: current module, files, editor state, panel visibility, resource reader mode. Single `WorkspaceProvider` at the workspace layout level.
- **Auth context** — placeholder for now (default user "local"). Will hold user identity when Shark auth is integrated.

No Redux, no Zustand. The workspace is the only complex stateful page and a single context handles it.

---

## 10. File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx           # Marketing shell
│   │   │   ├── page.tsx             # Landing
│   │   │   └── pricing/
│   │   │       └── page.tsx         # Pricing
│   │   ├── (platform)/
│   │   │   ├── layout.tsx           # Platform shell
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx         # Dashboard
│   │   │   │   └── [courseId]/
│   │   │   │       └── page.tsx     # Course detail
│   │   │   └── workspace/
│   │   │       └── [courseId]/
│   │   │           └── [lang]/
│   │   │               └── page.tsx # Workspace
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # Shared primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   ├── marketing/               # Marketing-specific
│   │   │   ├── navbar.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── project-showcase.tsx
│   │   │   ├── career-value.tsx
│   │   │   ├── pricing-teaser.tsx
│   │   │   └── footer.tsx
│   │   ├── courses/                 # Course dashboard
│   │   │   ├── course-card.tsx
│   │   │   └── language-picker.tsx
│   │   └── workspace/              # Workspace components
│   │       ├── icon-rail.tsx
│   │       ├── panel.tsx
│   │       ├── module-list.tsx
│   │       ├── file-tree.tsx
│   │       ├── editor.tsx           # CodeMirror wrapper
│   │       ├── tab-bar.tsx
│   │       ├── test-output.tsx
│   │       ├── resource-reader.tsx
│   │       └── workspace-provider.tsx
│   ├── hooks/
│   │   ├── use-course.ts
│   │   ├── use-autosave.ts
│   │   ├── use-test-runner.ts
│   │   ├── use-resources.ts
│   │   └── use-progress.ts
│   └── lib/
│       ├── api.ts                   # API client helpers
│       └── constants.ts             # Route constants, config
├── public/
│   └── builderslogo2.svg
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
