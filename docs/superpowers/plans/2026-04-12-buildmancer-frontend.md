# Buildmancer Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Next.js frontend for Buildmancer — landing page (Spanish), pricing, course dashboard, and workspace with CodeMirror editor + SSE test streaming.

**Architecture:** Single Next.js 15 app in `frontend/` using App Router with route groups `(marketing)` and `(platform)` for layout separation. Marketing pages are server-rendered, workspace is fully client-side. API calls proxied to FastAPI backend at `localhost:8000` via Next.js rewrites.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, CodeMirror 6, Lucide React, react-markdown

**Spec:** `docs/superpowers/specs/2026-04-12-buildmancer-frontend-design.md`

**Backend:** Already built and tested. FastAPI at `:8000`, Go runner at `:9000`. Start with:
```bash
cd backend && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000
```

---

## File Map

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css                              # Tailwind v4 + theme
│   │   ├── layout.tsx                               # Root layout: fonts, metadata
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx                           # Navbar + footer
│   │   │   ├── page.tsx                             # Landing (/)
│   │   │   └── pricing/
│   │   │       └── page.tsx                         # Pricing (/pricing)
│   │   └── (platform)/
│   │       ├── layout.tsx                           # Minimal shell
│   │       ├── courses/
│   │       │   ├── page.tsx                         # Dashboard (/courses)
│   │       │   └── [courseId]/
│   │       │       └── page.tsx                     # Detail (/courses/http-server)
│   │       └── workspace/
│   │           └── [courseId]/
│   │               └── [lang]/
│   │                   └── page.tsx                 # Workspace
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   ├── marketing/
│   │   │   ├── navbar.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── project-showcase.tsx
│   │   │   ├── career-value.tsx
│   │   │   ├── pricing-teaser.tsx
│   │   │   ├── footer.tsx
│   │   │   └── faq.tsx
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   └── language-picker.tsx
│   │   └── workspace/
│   │       ├── workspace-provider.tsx
│   │       ├── icon-rail.tsx
│   │       ├── panel.tsx
│   │       ├── module-list.tsx
│   │       ├── file-tree.tsx
│   │       ├── editor.tsx
│   │       ├── tab-bar.tsx
│   │       ├── test-output.tsx
│   │       └── resource-reader.tsx
│   ├── hooks/
│   │   ├── use-autosave.ts
│   │   ├── use-test-runner.ts
│   │   └── use-resources.ts
│   └── lib/
│       ├── api.ts
│       └── types.ts
├── public/
│   └── builderslogo2.svg
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `frontend/` (via create-next-app)
- Modify: `frontend/package.json` (add deps)
- Modify: `frontend/src/app/globals.css` (theme)
- Modify: `frontend/src/app/layout.tsx` (fonts, metadata)
- Create: `frontend/postcss.config.mjs`
- Modify: `frontend/next.config.ts` (API rewrites)
- Copy: `frontend/public/builderslogo2.svg`
- Modify: `.gitignore` (add `frontend/node_modules`, `.next`)

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
npx create-next-app@latest frontend --typescript --eslint --app --src-dir --no-tailwind --no-turbopack --no-import-alias
```

Select defaults when prompted. This creates the base Next.js 15 app.

- [ ] **Step 2: Install all dependencies**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend
npm install tailwindcss @tailwindcss/postcss lucide-react react-markdown remark-gfm
npm install codemirror @codemirror/lang-go @codemirror/lang-python @codemirror/theme-one-dark @codemirror/state @codemirror/view
npm install -D @types/node
```

- [ ] **Step 3: Configure PostCSS for Tailwind v4**

Create `frontend/postcss.config.mjs`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 4: Set up globals.css with theme**

Replace `frontend/src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #131111;
  --color-surface: #0d0d0d;
  --color-surface-hover: #1a1a1a;
  --color-border: #1a1a1a;
  --color-primary: #ff0000;
  --color-primary-hover: #cc0000;
  --color-primary-subtle: rgba(255, 0, 0, 0.08);
  --color-text: #ffffff;
  --color-text-muted: #888888;
  --color-text-dim: #555555;
  --color-success: #4ec9b0;
  --color-error: #f44747;
  --color-warning: #ff6600;

  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace;
}

html {
  background-color: var(--color-bg);
  color: var(--color-text);
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-dim);
}
```

- [ ] **Step 5: Set up root layout with fonts**

Replace `frontend/src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Buildmancer — Construye software real",
  description:
    "Plataforma de educación para desarrolladores. Construye proyectos reales, pasa pruebas automatizadas, llévalo a tu portafolio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-text min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Configure API rewrites**

Replace `frontend/next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Copy logo and update .gitignore**

```bash
cp C:/Users/raulg/Desktop/projects/BuildersPlatform/builderslogo2.svg C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend/public/builderslogo2.svg
```

Add to the project root `.gitignore`:

```
# Frontend
frontend/node_modules/
frontend/.next/
```

- [ ] **Step 8: Delete default page content**

Replace `frontend/src/app/page.tsx` with a temporary placeholder:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Buildmancer</h1>
    </main>
  );
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend
npm run dev
```

Open `http://localhost:3000`. Expected: dark page with "Buildmancer" centered in white text. Verify Tailwind classes are applying (dark background, white text).

- [ ] **Step 10: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/ .gitignore
git commit -m "feat(frontend): scaffold Next.js 15 app with Tailwind v4 and deps"
```

---

### Task 2: Design System — Shared UI Components

**Files:**
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/badge.tsx`

- [ ] **Step 1: Create shared types**

Create `frontend/src/lib/types.ts`:

```typescript
// API response types matching the FastAPI backend

export interface EstimatedHours {
  junior: number;
  mid: number;
  senior: number;
}

export interface CourseSummary {
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  estimated_hours: EstimatedHours;
}

export interface StubRef {
  path: string;
}

export interface Resource {
  title: string;
  file: string;
  type: string;
  visible_to: string[];
}

export interface TestSpec {
  type: string;
  match?: string;
  timeout_ms: number;
}

export interface Submodule {
  id: string;
  full_id: string;
  title: string;
  spec: string;
  stubs: StubRef[];
  tests: TestSpec[];
  resources: Resource[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  submodules: Submodule[];
}

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  runner: string;
  estimated_hours: EstimatedHours;
  build_cmd?: string;
  run_cmd?: string;
  unit_cmd?: string;
}

export interface Course {
  meta: CourseMeta;
  modules: Module[];
}

export interface WorkingFile {
  filepath: string;
  content: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  course_slug: string;
  language: string;
  difficulty: string;
  locale: string;
}

export interface ProgressEntry {
  submodule_id: string;
  passed_at: string;
}

export interface ProgressResponse {
  course_slug: string;
  language: string;
  difficulty: string;
  locale: string;
  passed: ProgressEntry[];
}

export interface RunResponse {
  run_id: string;
}

export interface TestResult {
  test_index: number;
  passed: boolean;
  message: string;
}

export interface RunCompleteEvent {
  all_passed: boolean;
  results: TestResult[];
}

export interface ResourceContent {
  title: string;
  type: string;
  content: string;
}
```

- [ ] **Step 2: Create Button component**

Create `frontend/src/components/ui/button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover",
  secondary:
    "border border-white/20 text-white hover:bg-surface-hover active:bg-surface-hover",
  ghost: "text-white hover:bg-surface-hover active:bg-surface-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 3: Create Card component**

Create `frontend/src/components/ui/card.tsx`:

```tsx
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-6 ${
        hover ? "transition-colors duration-150 hover:border-text-dim cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create Badge component**

Create `frontend/src/components/ui/badge.tsx`:

```tsx
type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-hover text-text-muted",
  primary: "bg-primary-subtle text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Verify components render**

Temporarily update `frontend/src/app/page.tsx` to test all components:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Design System</h1>
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <Card hover>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-text-muted mt-1">Card description text.</p>
        <div className="mt-3 flex gap-2">
          <Badge variant="primary">Go</Badge>
          <Badge variant="success">Passed</Badge>
          <Badge variant="warning">In Progress</Badge>
        </div>
      </Card>
    </main>
  );
}
```

Run dev server, open `http://localhost:3000`. Expected: dark page with red/outline/ghost buttons, a card with badges. Verify colors match the theme.

- [ ] **Step 6: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/lib/types.ts frontend/src/components/ui/
git commit -m "feat(frontend): add shared types and UI components (Button, Card, Badge)"
```

---

### Task 3: Marketing Layout + Navbar

**Files:**
- Create: `frontend/src/components/marketing/navbar.tsx`
- Create: `frontend/src/components/marketing/footer.tsx`
- Create: `frontend/src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Create Navbar component**

Create `frontend/src/components/marketing/navbar.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/builderslogo2.svg" alt="Buildmancer" width={32} height={32} />
          <span className="text-lg font-bold">Buildmancer</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm text-text-muted hover:text-text transition-colors">
            Cómo funciona
          </a>
          <a href="#proyectos" className="text-sm text-text-muted hover:text-text transition-colors">
            Proyectos
          </a>
          <Link href="/pricing" className="text-sm text-text-muted hover:text-text transition-colors">
            Precios
          </Link>
        </div>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/courses">Comenzar</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-text-muted hover:text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-bg px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#como-funciona"
              className="text-sm text-text-muted hover:text-text"
              onClick={() => setMobileOpen(false)}
            >
              Cómo funciona
            </a>
            <a
              href="#proyectos"
              className="text-sm text-text-muted hover:text-text"
              onClick={() => setMobileOpen(false)}
            >
              Proyectos
            </a>
            <Link
              href="/pricing"
              className="text-sm text-text-muted hover:text-text"
              onClick={() => setMobileOpen(false)}
            >
              Precios
            </Link>
            <Button asChild size="sm" className="w-fit">
              <Link href="/courses">Comenzar</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

Note: The `Button` component doesn't support `asChild` yet. We need to update it or just use `Link` styled as a button. Simpler approach — wrap `Link` directly:

Actually, let's keep it simple. Replace the `Button asChild` usages with direct link styling. Update the Navbar to use `Link` with button classes:

Replace `<Button asChild size="sm"><Link href="/courses">Comenzar</Link></Button>` with:

```tsx
<Link
  href="/courses"
  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors duration-150"
>
  Comenzar
</Link>
```

Do this for both the desktop and mobile CTA in the Navbar.

- [ ] **Step 2: Create Footer component**

Create `frontend/src/components/marketing/footer.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/builderslogo2.svg" alt="Buildmancer" width={24} height={24} />
          <span className="text-sm text-text-muted">
            Buildmancer © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex gap-6">
          <Link href="/pricing" className="text-sm text-text-muted hover:text-text transition-colors">
            Precios
          </Link>
          <Link href="/courses" className="text-sm text-text-muted hover:text-text transition-colors">
            Proyectos
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create marketing layout**

Create `frontend/src/app/(marketing)/layout.tsx`:

```tsx
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Move landing page into marketing route group**

Move the landing page into the marketing route group. Create `frontend/src/app/(marketing)/page.tsx`:

```tsx
export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-16">
      <h1 className="text-4xl font-bold">Landing Page</h1>
    </div>
  );
}
```

Delete the old `frontend/src/app/page.tsx` (if it still exists — the route group page takes over `/`).

- [ ] **Step 5: Verify navbar behavior**

Run dev server, open `http://localhost:3000`. Expected:
- Transparent navbar at top with logo, links, and "Comenzar" button
- Scroll down — navbar gets solid dark background with bottom border
- Mobile (resize to < 768px) — hamburger menu opens/closes

- [ ] **Step 6: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/marketing/ frontend/src/app/\(marketing\)/
git rm frontend/src/app/page.tsx 2>/dev/null || true
git commit -m "feat(frontend): add marketing layout with sticky navbar and footer"
```

---

### Task 4: Landing Page

**Files:**
- Create: `frontend/src/components/marketing/hero.tsx`
- Create: `frontend/src/components/marketing/how-it-works.tsx`
- Create: `frontend/src/components/marketing/project-showcase.tsx`
- Create: `frontend/src/components/marketing/career-value.tsx`
- Create: `frontend/src/components/marketing/pricing-teaser.tsx`
- Modify: `frontend/src/app/(marketing)/page.tsx`

- [ ] **Step 1: Create Hero section**

Create `frontend/src/components/marketing/hero.tsx`:

```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Construye software real.{" "}
          <span className="text-primary">Aprende de verdad.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted md:text-xl">
          Proyectos reales que van directo a tu GitHub y tu portafolio.
          Certificaciones listas para LinkedIn. Sin tutoriales — solo código.
        </p>
        <div className="mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-hover transition-colors duration-150"
          >
            Empieza a construir
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create How it Works section**

Create `frontend/src/components/marketing/how-it-works.tsx`:

```tsx
import { FolderSearch, Code2, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepProps {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

function Step({ icon: Icon, number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-subtle">
        <Icon size={28} className="text-primary" />
      </div>
      <span className="mt-4 text-sm font-medium text-text-dim">{number}</span>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-text-muted">{description}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Cómo funciona
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          <Step
            icon={FolderSearch}
            number="01"
            title="Elige un proyecto"
            description="HTTP servers, DNS, Git — desafíos reales que los devs construyen en la industria."
          />
          <Step
            icon={Code2}
            number="02"
            title="Escribe código real"
            description="Submódulos guiados con pruebas automatizadas. Sin hand-holding — tú escribes cada línea."
          />
          <Step
            icon={Briefcase}
            number="03"
            title="Llévalo a tu portafolio"
            description="Proyecto terminado en tu GitHub con tu historial de commits. Certificación lista para LinkedIn."
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Project Showcase section**

Create `frontend/src/components/marketing/project-showcase.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseSummary } from "@/lib/types";

interface ProjectShowcaseProps {
  courses: CourseSummary[];
}

export function ProjectShowcase({ courses }: ProjectShowcaseProps) {
  return (
    <section id="proyectos" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Proyectos
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-text-muted">
          Construye lo que los ingenieros de software construyen en el mundo real.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.slug} hover>
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="mt-2 text-sm text-text-muted line-clamp-2">
                {course.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{course.language}</Badge>
                <Badge variant="primary">{course.difficulty}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Career Value section**

Create `frontend/src/components/marketing/career-value.tsx`:

```tsx
import { Github, Award, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ValueBlockProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function ValueBlock({ icon: Icon, title, description }: ValueBlockProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
        <Icon size={20} className="text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  );
}

export function CareerValue() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Directamente a tu CV
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-text-muted">
          No es otro tutorial más. Es experiencia real que puedes demostrar.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ValueBlock
            icon={Github}
            title="Tu proyecto, tus commits, tu perfil"
            description="Termina un curso y el repo aparece en tu GitHub. Con tu historial de commits real — no un template clonado."
          />
          <ValueBlock
            icon={Award}
            title="Certificación lista para LinkedIn"
            description="Verificable y profesional. Demuestra que construiste un servidor HTTP desde cero, no que viste un video de 4 horas."
          />
          <ValueBlock
            icon={Cpu}
            title="No son apps de juguete"
            description="Protocolos reales, arquitectura real. Entiende cómo funciona el software que usas todos los días."
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create Pricing Teaser section**

Create `frontend/src/components/marketing/pricing-teaser.tsx`:

```tsx
import Link from "next/link";

export function PricingTeaser() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Comienza gratis
        </h2>
        <p className="mt-4 text-lg text-text-muted">
          Un proyecto completo sin costo. Planes desde{" "}
          <span className="text-text font-semibold">$149 MXN/mes</span> para
          estudiantes.
        </p>
        <div className="mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-surface-hover transition-colors duration-150"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Assemble landing page**

Replace `frontend/src/app/(marketing)/page.tsx` with:

```tsx
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { CareerValue } from "@/components/marketing/career-value";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import Link from "next/link";
import type { CourseSummary } from "@/lib/types";

async function getCourses(): Promise<CourseSummary[]> {
  try {
    const res = await fetch("http://localhost:8000/api/courses", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const courses = await getCourses();

  return (
    <>
      <Hero />
      <HowItWorks />
      <ProjectShowcase courses={courses} />
      <CareerValue />
      <PricingTeaser />

      {/* Final CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Deja de practicar en el vacío
        </h2>
        <p className="mt-4 text-text-muted">
          Empieza a construir software que importa.
        </p>
        <div className="mt-8">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-hover transition-colors duration-150"
          >
            Empieza a construir
          </Link>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 7: Verify landing page**

Run dev server and backend:
```bash
# Terminal 1: backend
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/backend && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000

# Terminal 2: frontend
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend && npm run dev
```

Open `http://localhost:3000`. Expected:
- Hero section with headline, subline, red CTA button, subtle grid background
- "Cómo funciona" with 3 steps
- Project showcase with course cards (if backend is running) or empty (graceful fallback)
- Career value section with 3 blocks
- Pricing teaser
- Final CTA
- Sticky navbar transitions on scroll
- Footer at bottom
- Responsive at mobile widths

- [ ] **Step 8: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/marketing/ frontend/src/app/\(marketing\)/page.tsx
git commit -m "feat(frontend): add landing page with hero, how-it-works, career value, and CTAs"
```

---

### Task 5: Pricing Page

**Files:**
- Create: `frontend/src/components/marketing/faq.tsx`
- Create: `frontend/src/app/(marketing)/pricing/page.tsx`

- [ ] **Step 1: Create FAQ component**

Create `frontend/src/components/marketing/faq.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "¿Qué incluye el plan gratuito?",
    answer:
      "Un proyecto completo con acceso al editor, pruebas automatizadas y todo el entorno de desarrollo. Perfecto para probar la plataforma.",
  },
  {
    question: "¿Cómo funciona la verificación de estudiante?",
    answer:
      "Verificamos tu estatus de estudiante con tu correo institucional (.edu.mx o similar). Una vez verificado, obtienes el precio de estudiante automáticamente.",
  },
  {
    question: "¿Cómo funciona la exportación a GitHub?",
    answer:
      "Al completar un curso, generamos un repositorio presentable en tu cuenta de GitHub con tu historial de commits, README profesional y descripción del proyecto.",
  },
  {
    question: "¿Cómo funciona la certificación?",
    answer:
      "Al completar todos los submódulos de un curso, recibes una certificación verificable que puedes agregar directamente a tu perfil de LinkedIn.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí. Sin contratos, sin preguntas. Cancelas y mantienes acceso hasta el final de tu periodo de facturación.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold">
          Preguntas frecuentes
        </h2>
        <div className="mt-10 divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-text-muted transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.question}
                <ChevronDown
                  size={16}
                  className={`ml-2 flex-shrink-0 text-text-dim transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <p className="pb-4 text-sm leading-relaxed text-text-muted">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Pricing page**

Create `frontend/src/app/(marketing)/pricing/page.tsx`:

```tsx
import { Check } from "lucide-react";
import Link from "next/link";
import { Faq } from "@/components/marketing/faq";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Prueba un proyecto completo sin costo.",
    features: [
      "1 proyecto gratuito",
      "Editor completo",
      "Pruebas automatizadas",
      "Entorno de desarrollo completo",
    ],
    cta: "Comenzar gratis",
    ctaHref: "/courses",
  },
  {
    name: "Buildmancer",
    price: "$199",
    period: "MXN/mes",
    description: "Todo lo que necesitas para construir tu carrera.",
    features: [
      "Todos los proyectos",
      "Todos los lenguajes",
      "Exportación a GitHub",
      "Certificación LinkedIn",
      "Seguimiento de progreso",
    ],
    cta: "Suscribirse",
    ctaHref: "/courses",
    highlighted: true,
  },
  {
    name: "Estudiante",
    price: "$149",
    period: "MXN/mes",
    description: "Todo en Buildmancer, con descuento estudiantil.",
    features: [
      "Todo en Buildmancer",
      "Verificación con correo .edu",
      "Descuento estudiantil permanente",
    ],
    cta: "Verificar estudiante",
    ctaHref: "/courses",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24">
      {/* Header */}
      <div className="px-6 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Un plan. Todo incluido.
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Sin límites artificiales. Construye todo lo que quieras.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-16 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-xl border p-8 ${
              tier.highlighted
                ? "border-primary bg-primary-subtle"
                : "border-border bg-surface"
            }`}
          >
            {tier.highlighted && (
              <span className="mb-4 inline-flex w-fit rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
                Popular
              </span>
            )}
            <h3 className="text-xl font-semibold">{tier.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.period && (
                <span className="text-sm text-text-muted">{tier.period}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-text-muted">{tier.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.ctaHref}
              className={`mt-8 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                tier.highlighted
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "border border-white/20 text-white hover:bg-surface-hover"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <Faq />
    </div>
  );
}
```

- [ ] **Step 3: Verify pricing page**

Open `http://localhost:3000/pricing`. Expected:
- "Un plan. Todo incluido." heading
- Three cards — Free ($0), Buildmancer ($199, highlighted with red), Estudiante ($149)
- Features with green checkmarks
- "Popular" badge on middle card
- FAQ section with expandable items
- Responsive: stacks on mobile

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/marketing/faq.tsx frontend/src/app/\(marketing\)/pricing/
git commit -m "feat(frontend): add pricing page with tier cards and FAQ"
```

---

### Task 6: API Client + Platform Layout

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/app/(platform)/layout.tsx`

- [ ] **Step 1: Create API client helpers**

Create `frontend/src/lib/api.ts`:

```typescript
import type {
  CourseSummary,
  Course,
  WorkingFile,
  Enrollment,
  ProgressResponse,
  RunResponse,
  ResourceContent,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Server-side (used in server components with full URL)
export async function fetchCoursesServer(): Promise<CourseSummary[]> {
  const res = await fetch("http://localhost:8000/api/courses", {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCourseServer(
  courseId: string,
  lang: string
): Promise<Course> {
  const res = await fetch(
    `http://localhost:8000/api/courses/${courseId}/${lang}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Course not found: ${courseId}/${lang}`);
  return res.json();
}

export async function fetchProgressServer(
  courseId: string,
  lang: string
): Promise<ProgressResponse | null> {
  const res = await fetch(
    `http://localhost:8000/api/progress/${courseId}/${lang}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

// Client-side (uses Next.js rewrite proxy)
export async function fetchCourse(
  courseId: string,
  lang: string
): Promise<Course> {
  return fetchJson<Course>(`/api/courses/${courseId}/${lang}`);
}

export async function fetchFiles(
  courseId: string,
  lang: string
): Promise<WorkingFile[]> {
  return fetchJson<WorkingFile[]>(`/api/files/${courseId}/${lang}`);
}

export async function saveFile(
  courseId: string,
  lang: string,
  filepath: string,
  content: string
): Promise<void> {
  await fetch(`${API_BASE}/api/files/${courseId}/${lang}/${filepath}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export async function enroll(
  courseId: string,
  lang: string
): Promise<Enrollment> {
  return fetchJson<Enrollment>(`/api/enroll/${courseId}/${lang}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty: "junior", locale: "es" }),
  });
}

export async function runTests(
  courseId: string,
  lang: string,
  submoduleId: string
): Promise<RunResponse> {
  return fetchJson<RunResponse>(
    `/api/run/${courseId}/${lang}/${submoduleId}`,
    { method: "POST" }
  );
}

export async function fetchResources(
  courseId: string,
  lang: string,
  submoduleId: string
): Promise<ResourceContent[]> {
  return fetchJson<ResourceContent[]>(
    `/api/resources/${courseId}/${lang}/${submoduleId}`
  );
}

export async function fetchProgress(
  courseId: string,
  lang: string
): Promise<ProgressResponse> {
  return fetchJson<ProgressResponse>(`/api/progress/${courseId}/${lang}`);
}
```

- [ ] **Step 2: Create platform layout**

Create `frontend/src/app/(platform)/layout.tsx`:

```tsx
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/lib/api.ts frontend/src/app/\(platform\)/
git commit -m "feat(frontend): add API client helpers and platform layout shell"
```

---

### Task 7: Course Dashboard

**Files:**
- Create: `frontend/src/components/courses/course-card.tsx`
- Create: `frontend/src/app/(platform)/courses/page.tsx`

- [ ] **Step 1: Create CourseCard component**

Create `frontend/src/components/courses/course-card.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CourseSummary } from "@/lib/types";

interface CourseCardProps {
  course: CourseSummary;
  progress?: { lang: string; completed: number; total: number } | null;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group rounded-xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-text-dim cursor-pointer">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <Badge variant="primary">{course.difficulty}</Badge>
        </div>
        <p className="mt-2 text-sm text-text-muted line-clamp-2">
          {course.description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge>{course.language}</Badge>
        </div>

        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                {progress.lang} — {progress.completed}/{progress.total}
              </span>
              <span>
                {Math.round((progress.completed / progress.total) * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create Course Dashboard page**

Create `frontend/src/app/(platform)/courses/page.tsx`:

```tsx
import { fetchCoursesServer } from "@/lib/api";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import Image from "next/image";

export default async function CoursesPage() {
  const courses = await fetchCoursesServer();

  return (
    <div className="min-h-screen">
      {/* Simple header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/builderslogo2.svg"
              alt="Buildmancer"
              width={28}
              height={28}
            />
            <span className="font-bold">Buildmancer</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <p className="mt-2 text-text-muted">
          Elige un proyecto y empieza a construir.
        </p>

        {courses.length === 0 ? (
          <div className="mt-12 text-center text-text-muted">
            <p>No hay proyectos disponibles todavía.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify course dashboard**

Start the backend, then open `http://localhost:3000/courses`. Expected:
- Header with logo and "Buildmancer" text
- "Proyectos" heading
- Grid of course cards with title, description, language badge, difficulty badge
- Cards are clickable (navigate to `/courses/{slug}`)
- If backend is down, shows "No hay proyectos disponibles todavía."

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/courses/ frontend/src/app/\(platform\)/courses/page.tsx
git commit -m "feat(frontend): add course dashboard with course cards"
```

---

### Task 8: Course Detail + Language Picker

**Files:**
- Create: `frontend/src/components/courses/language-picker.tsx`
- Create: `frontend/src/app/(platform)/courses/[courseId]/page.tsx`

- [ ] **Step 1: Create LanguagePicker component**

Create `frontend/src/components/courses/language-picker.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { enroll } from "@/lib/api";
import { useState } from "react";

interface LanguageOption {
  lang: string;
  enrolled: boolean;
  progress?: { completed: number; total: number };
}

interface LanguagePickerProps {
  courseId: string;
  languages: LanguageOption[];
}

export function LanguagePicker({ courseId, languages }: LanguagePickerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(lang: string, enrolled: boolean) {
    if (enrolled) {
      router.push(`/workspace/${courseId}/${lang}`);
      return;
    }

    setLoading(lang);
    try {
      await enroll(courseId, lang);
      router.push(`/workspace/${courseId}/${lang}`);
    } catch (err) {
      // 409 = already enrolled, just redirect
      router.push(`/workspace/${courseId}/${lang}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((opt) => (
        <button
          key={opt.lang}
          onClick={() => handleSelect(opt.lang, opt.enrolled)}
          disabled={loading !== null}
          className="flex flex-col rounded-xl border border-border bg-surface p-6 text-left transition-colors duration-150 hover:border-text-dim disabled:opacity-50"
        >
          <span className="text-lg font-semibold capitalize">{opt.lang}</span>

          {opt.enrolled && opt.progress ? (
            <div className="mt-3 w-full">
              <div className="flex justify-between text-xs text-text-muted">
                <span>
                  {opt.progress.completed}/{opt.progress.total} submódulos
                </span>
                <span>
                  {Math.round(
                    (opt.progress.completed / opt.progress.total) * 100
                  )}
                  %
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${
                      (opt.progress.completed / opt.progress.total) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="mt-3 inline-block text-sm font-medium text-primary">
                Continuar
              </span>
            </div>
          ) : (
            <span className="mt-3 text-sm text-text-muted">
              {loading === opt.lang ? "Inscribiendo..." : "Comenzar"}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create Course Detail page**

Create `frontend/src/app/(platform)/courses/[courseId]/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LanguagePicker } from "@/components/courses/language-picker";
import { fetchCoursesServer, fetchProgressServer } from "@/lib/api";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const courses = await fetchCoursesServer();

  // Find all language variants of this course
  const courseVariants = courses.filter((c) => c.slug === courseId);

  if (courseVariants.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Proyecto no encontrado.</p>
      </div>
    );
  }

  const firstVariant = courseVariants[0];

  // Check enrollment/progress for each language
  const languages = await Promise.all(
    courseVariants.map(async (variant) => {
      const progress = await fetchProgressServer(courseId, variant.language);
      // We'd need total submodule count from the course detail endpoint
      // For now, use progress data if available
      return {
        lang: variant.language,
        enrolled: progress !== null,
        progress: progress
          ? { completed: progress.passed.length, total: 7 }
          : undefined,
      };
    })
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/builderslogo2.svg"
              alt="Buildmancer"
              width={28}
              height={28}
            />
            <span className="font-bold">Buildmancer</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          Proyectos
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{firstVariant.title}</h1>
            <Badge variant="primary">{firstVariant.difficulty}</Badge>
          </div>
          <p className="mt-3 text-text-muted">{firstVariant.description}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold">Elige un lenguaje</h2>
          <p className="mt-1 text-sm text-text-muted">
            Selecciona en qué lenguaje quieres construir este proyecto.
          </p>
          <div className="mt-6">
            <LanguagePicker courseId={courseId} languages={languages} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify course detail page**

Open `http://localhost:3000/courses/http-server`. Expected:
- Back link to "/courses"
- Course title, difficulty badge, description
- "Elige un lenguaje" with language cards
- Clicking a language enrolls (if not enrolled) and redirects to workspace URL
- Progress bar shown if already enrolled

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/courses/language-picker.tsx frontend/src/app/\(platform\)/courses/\[courseId\]/
git commit -m "feat(frontend): add course detail page with language picker and enrollment"
```

---

### Task 9: Workspace Provider + Shell Layout

**Files:**
- Create: `frontend/src/components/workspace/workspace-provider.tsx`
- Create: `frontend/src/components/workspace/icon-rail.tsx`
- Create: `frontend/src/components/workspace/panel.tsx`
- Create: `frontend/src/app/(platform)/workspace/[courseId]/[lang]/page.tsx`

- [ ] **Step 1: Create WorkspaceProvider**

Create `frontend/src/components/workspace/workspace-provider.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Course, WorkingFile, Module, Submodule } from "@/lib/types";

export type PanelView = "modules" | "files" | "resources" | null;
export type ResourceReaderMode = "slide-over" | "split";

interface WorkspaceState {
  course: Course | null;
  files: WorkingFile[];
  activeModule: Module | null;
  activeSubmodule: Submodule | null;
  activeFile: string | null;
  openFiles: string[];
  panelView: PanelView;
  panelOpen: boolean;
  testOutputOpen: boolean;
  resourceReaderOpen: boolean;
  resourceReaderMode: ResourceReaderMode;
  activeResource: string | null;
  passedSubmodules: Set<string>;
}

interface WorkspaceActions {
  setCourse: (course: Course) => void;
  setFiles: (files: WorkingFile[]) => void;
  setActiveSubmodule: (module: Module, submodule: Submodule) => void;
  setActiveFile: (filepath: string) => void;
  openFile: (filepath: string) => void;
  closeFile: (filepath: string) => void;
  updateFileContent: (filepath: string, content: string) => void;
  setPanelView: (view: PanelView) => void;
  togglePanel: (view: PanelView) => void;
  setTestOutputOpen: (open: boolean) => void;
  openResourceReader: (resource: string) => void;
  closeResourceReader: () => void;
  toggleResourceReaderMode: () => void;
  markSubmodulePassed: (submoduleId: string) => void;
  setPassedSubmodules: (ids: string[]) => void;
}

const WorkspaceContext = createContext<
  (WorkspaceState & WorkspaceActions) | null
>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({
    course: null,
    files: [],
    activeModule: null,
    activeSubmodule: null,
    activeFile: null,
    openFiles: [],
    panelView: "modules",
    panelOpen: true,
    testOutputOpen: false,
    resourceReaderOpen: false,
    resourceReaderMode: "slide-over",
    activeResource: null,
    passedSubmodules: new Set(),
  });

  const setCourse = useCallback((course: Course) => {
    setState((s) => ({ ...s, course }));
  }, []);

  const setFiles = useCallback((files: WorkingFile[]) => {
    const firstFile = files[0]?.filepath ?? null;
    setState((s) => ({
      ...s,
      files,
      activeFile: s.activeFile ?? firstFile,
      openFiles:
        s.openFiles.length > 0
          ? s.openFiles
          : firstFile
            ? [firstFile]
            : [],
    }));
  }, []);

  const setActiveSubmodule = useCallback(
    (module: Module, submodule: Submodule) => {
      setState((s) => ({
        ...s,
        activeModule: module,
        activeSubmodule: submodule,
      }));
    },
    []
  );

  const setActiveFile = useCallback((filepath: string) => {
    setState((s) => ({
      ...s,
      activeFile: filepath,
      openFiles: s.openFiles.includes(filepath)
        ? s.openFiles
        : [...s.openFiles, filepath],
    }));
  }, []);

  const openFile = useCallback((filepath: string) => {
    setState((s) => ({
      ...s,
      activeFile: filepath,
      openFiles: s.openFiles.includes(filepath)
        ? s.openFiles
        : [...s.openFiles, filepath],
    }));
  }, []);

  const closeFile = useCallback((filepath: string) => {
    setState((s) => {
      const newOpen = s.openFiles.filter((f) => f !== filepath);
      return {
        ...s,
        openFiles: newOpen,
        activeFile:
          s.activeFile === filepath
            ? newOpen[newOpen.length - 1] ?? null
            : s.activeFile,
      };
    });
  }, []);

  const updateFileContent = useCallback(
    (filepath: string, content: string) => {
      setState((s) => ({
        ...s,
        files: s.files.map((f) =>
          f.filepath === filepath ? { ...f, content } : f
        ),
      }));
    },
    []
  );

  const setPanelView = useCallback((view: PanelView) => {
    setState((s) => ({ ...s, panelView: view, panelOpen: view !== null }));
  }, []);

  const togglePanel = useCallback((view: PanelView) => {
    setState((s) => {
      if (s.panelView === view && s.panelOpen) {
        return { ...s, panelOpen: false };
      }
      return { ...s, panelView: view, panelOpen: true };
    });
  }, []);

  const setTestOutputOpen = useCallback((open: boolean) => {
    setState((s) => ({ ...s, testOutputOpen: open }));
  }, []);

  const openResourceReader = useCallback((resource: string) => {
    setState((s) => ({
      ...s,
      resourceReaderOpen: true,
      activeResource: resource,
    }));
  }, []);

  const closeResourceReader = useCallback(() => {
    setState((s) => ({
      ...s,
      resourceReaderOpen: false,
      activeResource: null,
    }));
  }, []);

  const toggleResourceReaderMode = useCallback(() => {
    setState((s) => ({
      ...s,
      resourceReaderMode:
        s.resourceReaderMode === "slide-over" ? "split" : "slide-over",
    }));
  }, []);

  const markSubmodulePassed = useCallback((submoduleId: string) => {
    setState((s) => ({
      ...s,
      passedSubmodules: new Set([...s.passedSubmodules, submoduleId]),
    }));
  }, []);

  const setPassedSubmodules = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, passedSubmodules: new Set(ids) }));
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        setCourse,
        setFiles,
        setActiveSubmodule,
        setActiveFile,
        openFile,
        closeFile,
        updateFileContent,
        setPanelView,
        togglePanel,
        setTestOutputOpen,
        openResourceReader,
        closeResourceReader,
        toggleResourceReaderMode,
        markSubmodulePassed,
        setPassedSubmodules,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
```

- [ ] **Step 2: Create Icon Rail**

Create `frontend/src/components/workspace/icon-rail.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Package, FolderOpen, BookOpen, Play, Home } from "lucide-react";
import Image from "next/image";
import { useWorkspace, type PanelView } from "./workspace-provider";

interface RailButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  onClick: () => void;
  title: string;
}

function RailButton({ icon, active, accent, onClick, title }: RailButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
        accent
          ? "bg-primary text-white hover:bg-primary-hover"
          : active
            ? "bg-surface-hover text-text border-l-2 border-primary"
            : "text-text-dim hover:text-text-muted hover:bg-surface-hover"
      }`}
    >
      {icon}
    </button>
  );
}

export function IconRail() {
  const router = useRouter();
  const { panelView, panelOpen, togglePanel } = useWorkspace();

  const isActive = (view: PanelView) => panelView === view && panelOpen;

  return (
    <div className="flex h-full w-12 flex-col items-center gap-1.5 bg-surface border-r border-border py-3">
      {/* Logo */}
      <div className="mb-2">
        <Image src="/builderslogo2.svg" alt="B" width={26} height={26} />
      </div>

      {/* Navigation icons */}
      <RailButton
        icon={<Package size={18} />}
        active={isActive("modules")}
        onClick={() => togglePanel("modules")}
        title="Módulos"
      />
      <RailButton
        icon={<FolderOpen size={18} />}
        active={isActive("files")}
        onClick={() => togglePanel("files")}
        title="Archivos"
      />
      <RailButton
        icon={<BookOpen size={18} />}
        active={isActive("resources")}
        onClick={() => togglePanel("resources")}
        title="Recursos"
      />

      <div className="flex-1" />

      {/* Run tests */}
      <RailButton
        icon={<Play size={18} />}
        accent
        onClick={() => {
          // Dispatched via workspace event — handled in test-output.tsx
          window.dispatchEvent(new CustomEvent("buildmancer:run-tests"));
        }}
        title="Ejecutar pruebas"
      />

      {/* Home */}
      <RailButton
        icon={<Home size={18} />}
        onClick={() => router.push("/courses")}
        title="Volver a proyectos"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create Panel component**

Create `frontend/src/components/workspace/panel.tsx`:

```tsx
"use client";

import { useWorkspace } from "./workspace-provider";
import { ModuleList } from "./module-list";
import { FileTree } from "./file-tree";

export function Panel() {
  const { panelView, panelOpen } = useWorkspace();

  if (!panelOpen || !panelView) return null;

  return (
    <div className="h-full w-[220px] flex-shrink-0 overflow-y-auto border-r border-border bg-surface">
      {panelView === "modules" && <ModuleList />}
      {panelView === "files" && <FileTree />}
      {panelView === "resources" && <ResourceList />}
    </div>
  );
}

// Inline resource list (simple — full reader is separate)
function ResourceList() {
  const { activeSubmodule, openResourceReader } = useWorkspace();

  if (!activeSubmodule) {
    return (
      <div className="p-3">
        <p className="text-xs text-text-dim">Selecciona un submódulo primero.</p>
      </div>
    );
  }

  const resources = activeSubmodule.resources;

  return (
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        Recursos
      </h4>
      <div className="mt-3 flex flex-col gap-1">
        {resources.length === 0 ? (
          <p className="text-xs text-text-dim">Sin recursos para este submódulo.</p>
        ) : (
          resources.map((r) => (
            <button
              key={r.file}
              onClick={() => openResourceReader(r.file)}
              className="rounded-md px-2 py-1.5 text-left text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
            >
              {r.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create Workspace page**

Create `frontend/src/app/(platform)/workspace/[courseId]/[lang]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { IconRail } from "@/components/workspace/icon-rail";
import { Panel } from "@/components/workspace/panel";
import { WorkspaceMain } from "./workspace-main";
import Image from "next/image";
import Link from "next/link";

function DesktopGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Image src="/builderslogo2.svg" alt="Buildmancer" width={48} height={48} />
        <p className="text-text-muted">
          Buildmancer funciona mejor en escritorio. Abre esta página en tu
          computadora para comenzar a construir.
        </p>
        <Link
          href="/courses"
          className="text-sm text-primary hover:underline"
        >
          Volver a proyectos
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

export default function WorkspacePage() {
  return (
    <DesktopGuard>
      <WorkspaceProvider>
        <div className="flex h-screen overflow-hidden">
          <IconRail />
          <Panel />
          <WorkspaceMain />
        </div>
      </WorkspaceProvider>
    </DesktopGuard>
  );
}
```

Now create the main workspace area as a separate client component in the same directory.

Create `frontend/src/app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { fetchCourse, fetchFiles, fetchProgress } from "@/lib/api";

export function WorkspaceMain() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    course,
    setCourse,
    setFiles,
    setActiveSubmodule,
    setPassedSubmodules,
    activeFile,
    files,
  } = useWorkspace();

  // Load course data on mount
  useEffect(() => {
    async function load() {
      const [courseData, filesData, progressData] = await Promise.all([
        fetchCourse(params.courseId, params.lang),
        fetchFiles(params.courseId, params.lang),
        fetchProgress(params.courseId, params.lang).catch(() => null),
      ]);

      setCourse(courseData);
      setFiles(filesData);

      if (progressData) {
        setPassedSubmodules(progressData.passed.map((p) => p.submodule_id));
      }

      // Set first non-passed submodule as active
      const passedIds = new Set(
        progressData?.passed.map((p) => p.submodule_id) ?? []
      );
      for (const mod of courseData.modules) {
        for (const sub of mod.submodules) {
          if (!passedIds.has(sub.full_id)) {
            setActiveSubmodule(mod, sub);
            return;
          }
        }
      }
      // All passed — just set the first one
      if (courseData.modules[0]?.submodules[0]) {
        setActiveSubmodule(
          courseData.modules[0],
          courseData.modules[0].submodules[0]
        );
      }
    }
    load();
  }, [params.courseId, params.lang, setCourse, setFiles, setActiveSubmodule, setPassedSubmodules]);

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-text-muted">Cargando...</span>
      </div>
    );
  }

  const activeContent = files.find((f) => f.filepath === activeFile);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Placeholder for editor + test output — implemented in Tasks 11-12 */}
      <div className="flex flex-1 items-center justify-center bg-bg text-text-dim text-sm">
        {activeFile ? (
          <pre className="max-h-full overflow-auto p-4 font-mono text-xs text-text-muted">
            {activeContent?.content ?? ""}
          </pre>
        ) : (
          "Selecciona un archivo"
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify workspace shell**

Start backend and frontend. Navigate to `http://localhost:3000/courses`, click a course, select a language. Expected:
- Enrolled and redirected to `/workspace/{course}/{lang}`
- Icon rail on the left with logo, module/files/resources icons, run button, home
- Collapsible panel (placeholder content for now)
- Main area shows file content as plain text (placeholder for CodeMirror)
- Mobile view shows "funciona mejor en escritorio" message

- [ ] **Step 6: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/workspace/workspace-provider.tsx frontend/src/components/workspace/icon-rail.tsx frontend/src/components/workspace/panel.tsx frontend/src/app/\(platform\)/workspace/
git commit -m "feat(frontend): add workspace shell with icon rail, panel, and provider"
```

---

### Task 10: Workspace Panel — Module List + File Tree

**Files:**
- Create: `frontend/src/components/workspace/module-list.tsx`
- Create: `frontend/src/components/workspace/file-tree.tsx`

- [ ] **Step 1: Create ModuleList component**

Create `frontend/src/components/workspace/module-list.tsx`:

```tsx
"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

export function ModuleList() {
  const {
    course,
    activeSubmodule,
    passedSubmodules,
    setActiveSubmodule,
  } = useWorkspace();

  if (!course) return null;

  const totalSubmodules = course.modules.reduce(
    (acc, m) => acc + m.submodules.length,
    0
  );
  const completedCount = passedSubmodules.size;

  return (
    <div className="p-3">
      {/* Course header */}
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        {course.meta.title}
      </h4>
      <p className="text-[10px] text-text-dim capitalize">{course.meta.language}</p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Progreso</span>
          <span>
            {completedCount}/{totalSubmodules}
          </span>
        </div>
        <div className="mt-1 h-1 rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${
                totalSubmodules > 0
                  ? (completedCount / totalSubmodules) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Module list */}
      <div className="mt-4 flex flex-col gap-0.5">
        {course.modules.map((mod) =>
          mod.submodules.map((sub) => {
            const passed = passedSubmodules.has(sub.full_id);
            const isActive = activeSubmodule?.full_id === sub.full_id;
            // Locked = not passed and there's a previous unpassed submodule
            const allSubs = course.modules.flatMap((m) => m.submodules);
            const idx = allSubs.findIndex((s) => s.full_id === sub.full_id);
            const locked =
              !passed &&
              !isActive &&
              idx > 0 &&
              !passedSubmodules.has(allSubs[idx - 1].full_id);

            return (
              <button
                key={sub.full_id}
                onClick={() => {
                  if (!locked) setActiveSubmodule(mod, sub);
                }}
                disabled={locked}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                  isActive
                    ? "bg-primary-subtle border-l-2 border-primary"
                    : locked
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-surface-hover"
                }`}
              >
                {passed ? (
                  <CheckCircle2 size={16} className="flex-shrink-0 text-success" />
                ) : isActive ? (
                  <CircleDot size={16} className="flex-shrink-0 text-warning" />
                ) : (
                  <Circle size={16} className="flex-shrink-0 text-text-dim" />
                )}
                <span
                  className={`text-xs ${
                    isActive
                      ? "font-medium text-text"
                      : passed
                        ? "text-text-muted"
                        : "text-text-dim"
                  }`}
                >
                  {sub.title}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FileTree component**

Create `frontend/src/components/workspace/file-tree.tsx`:

```tsx
"use client";

import { File } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

export function FileTree() {
  const { files, activeFile, openFile } = useWorkspace();

  if (files.length === 0) {
    return (
      <div className="p-3">
        <p className="text-xs text-text-dim">No hay archivos todavía.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        Archivos
      </h4>
      <div className="mt-3 flex flex-col gap-0.5">
        {files.map((f) => (
          <button
            key={f.filepath}
            onClick={() => openFile(f.filepath)}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              activeFile === f.filepath
                ? "bg-surface-hover text-text"
                : "text-text-muted hover:bg-surface-hover hover:text-text"
            }`}
          >
            <File size={14} className="flex-shrink-0" />
            {f.filepath.split("/").pop()}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify module list and file tree**

Navigate to the workspace. Click the module icon in the rail — should see:
- Course title and language
- Progress bar
- List of submodules with completed (green check), active (orange dot with red border), locked (dimmed) states
- Click a non-locked submodule to switch

Click the folder icon — should see:
- List of working files
- Click to open (active file highlighted)

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/workspace/module-list.tsx frontend/src/components/workspace/file-tree.tsx
git commit -m "feat(frontend): add module list and file tree panel views"
```

---

### Task 11: CodeMirror Editor + Tab Bar + Autosave

**Files:**
- Create: `frontend/src/components/workspace/editor.tsx`
- Create: `frontend/src/components/workspace/tab-bar.tsx`
- Create: `frontend/src/hooks/use-autosave.ts`
- Modify: `frontend/src/app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx`

- [ ] **Step 1: Create useAutosave hook**

Create `frontend/src/hooks/use-autosave.ts`:

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { saveFile } from "@/lib/api";

interface UseAutosaveOptions {
  courseId: string;
  lang: string;
  filepath: string | null;
  content: string;
  delay?: number;
}

export function useAutosave({
  courseId,
  lang,
  filepath,
  content,
  delay = 1500,
}: UseAutosaveOptions) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(async () => {
    if (!filepath || content === lastSavedRef.current) return;
    setSaving(true);
    try {
      await saveFile(courseId, lang, filepath, content);
      lastSavedRef.current = content;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silently fail — will retry on next change
    } finally {
      setSaving(false);
    }
  }, [courseId, lang, filepath, content]);

  // Debounced autosave
  useEffect(() => {
    if (!filepath || content === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, filepath, delay, save]);

  // Initialize lastSaved on filepath change
  useEffect(() => {
    lastSavedRef.current = content;
  }, [filepath]); // eslint-disable-line react-hooks/exhaustive-deps

  return { saving, saved, forceSave: save };
}
```

- [ ] **Step 2: Create TabBar component**

Create `frontend/src/components/workspace/tab-bar.tsx`:

```tsx
"use client";

import { X } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

interface TabBarProps {
  saving?: boolean;
  saved?: boolean;
}

export function TabBar({ saving, saved }: TabBarProps) {
  const { openFiles, activeFile, setActiveFile, closeFile } = useWorkspace();

  if (openFiles.length === 0) return null;

  return (
    <div className="flex h-9 items-center gap-px overflow-x-auto bg-surface border-b border-border px-2">
      {openFiles.map((filepath) => {
        const filename = filepath.split("/").pop() ?? filepath;
        const isActive = filepath === activeFile;

        return (
          <div
            key={filepath}
            className={`group flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs cursor-pointer transition-colors ${
              isActive
                ? "bg-bg text-text border-t border-x border-border border-b-0 -mb-px"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => setActiveFile(filepath)}
          >
            {isActive && (
              <span
                className="absolute top-0 left-0 right-0 h-px bg-primary"
                style={{ position: "relative", width: "100%", display: "block", height: "1px", marginBottom: "-1px" }}
              />
            )}
            <span>{filename}</span>
            {isActive && (saving || saved) && (
              <span className="text-[10px] text-text-dim">
                {saving ? "..." : "✓"}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(filepath);
              }}
              className="ml-1 hidden rounded p-0.5 text-text-dim hover:text-text hover:bg-surface-hover group-hover:block"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create Editor component**

Create `frontend/src/components/workspace/editor.tsx`:

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { go } from "@codemirror/lang-go";
import { python } from "@codemirror/lang-python";
import { bracketMatching } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";

interface EditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

function getLanguageExtension(lang: string) {
  switch (lang.toLowerCase()) {
    case "go":
      return go();
    case "python":
      return python();
    default:
      return [];
  }
}

export function Editor({ content, language, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        closeBrackets(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        getLanguageExtension(language),
        oneDark,
        EditorView.theme({
          "&": {
            backgroundColor: "var(--color-bg)",
            height: "100%",
          },
          ".cm-gutters": {
            backgroundColor: "var(--color-bg)",
            borderRight: "1px solid var(--color-border)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "var(--color-surface-hover)",
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update content when file changes (not on every keystroke)
  const updateContent = useCallback(
    (newContent: string) => {
      const view = viewRef.current;
      if (!view) return;
      const currentContent = view.state.doc.toString();
      if (currentContent !== newContent) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: newContent,
          },
        });
      }
    },
    []
  );

  useEffect(() => {
    updateContent(content);
  }, [content, updateContent]);

  return <div ref={containerRef} className="h-full overflow-auto" />;
}
```

- [ ] **Step 4: Update workspace-main to use editor**

Replace `frontend/src/app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx` with:

```tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Editor } from "@/components/workspace/editor";
import { TabBar } from "@/components/workspace/tab-bar";
import { useAutosave } from "@/hooks/use-autosave";
import { fetchCourse, fetchFiles, fetchProgress } from "@/lib/api";

export function WorkspaceMain() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    course,
    setCourse,
    files,
    setFiles,
    activeFile,
    updateFileContent,
    setActiveSubmodule,
    setPassedSubmodules,
  } = useWorkspace();

  const activeContent =
    files.find((f) => f.filepath === activeFile)?.content ?? "";

  const { saving, saved, forceSave } = useAutosave({
    courseId: params.courseId,
    lang: params.lang,
    filepath: activeFile,
    content: activeContent,
  });

  // Load course data on mount
  useEffect(() => {
    async function load() {
      const [courseData, filesData, progressData] = await Promise.all([
        fetchCourse(params.courseId, params.lang),
        fetchFiles(params.courseId, params.lang),
        fetchProgress(params.courseId, params.lang).catch(() => null),
      ]);

      setCourse(courseData);
      setFiles(filesData);

      if (progressData) {
        setPassedSubmodules(progressData.passed.map((p) => p.submodule_id));
      }

      // Set first non-passed submodule as active
      const passedIds = new Set(
        progressData?.passed.map((p) => p.submodule_id) ?? []
      );
      for (const mod of courseData.modules) {
        for (const sub of mod.submodules) {
          if (!passedIds.has(sub.full_id)) {
            setActiveSubmodule(mod, sub);
            return;
          }
        }
      }
      if (courseData.modules[0]?.submodules[0]) {
        setActiveSubmodule(
          courseData.modules[0],
          courseData.modules[0].submodules[0]
        );
      }
    }
    load();
  }, [params.courseId, params.lang, setCourse, setFiles, setActiveSubmodule, setPassedSubmodules]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("buildmancer:run-tests"));
      }
      if (mod && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        // Toggle panel — handled by workspace provider
      }
      if (e.key === "Escape") {
        e.preventDefault();
        // Close resource reader or test output — handled by respective components
        window.dispatchEvent(new CustomEvent("buildmancer:escape"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forceSave]);

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-text-muted">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar saving={saving} saved={saved} />

      {/* Editor area — TestOutput and ResourceReader are added in Tasks 12-13 */}
      {activeFile ? (
        <div className="flex-1 overflow-hidden">
          <Editor
            content={activeContent}
            language={course.meta.language}
            onChange={(val) => updateFileContent(activeFile, val)}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Selecciona un archivo para editar
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify editor**

Navigate to workspace. Expected:
- Tab bar showing open files with red top accent on active tab
- CodeMirror editor with Go syntax highlighting, line numbers, dark theme
- Typing changes content
- Save indicator appears after 1.5s pause ("✓" next to tab name)

- [ ] **Step 6: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/components/workspace/editor.tsx frontend/src/components/workspace/tab-bar.tsx frontend/src/hooks/use-autosave.ts frontend/src/app/\(platform\)/workspace/
git commit -m "feat(frontend): add CodeMirror editor with tab bar and autosave"
```

---

### Task 12: Test Runner — SSE + Test Output Panel

**Files:**
- Create: `frontend/src/hooks/use-test-runner.ts`
- Create: `frontend/src/components/workspace/test-output.tsx`

- [ ] **Step 1: Create useTestRunner hook**

Create `frontend/src/hooks/use-test-runner.ts`:

```typescript
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { runTests } from "@/lib/api";
import type { TestResult } from "@/lib/types";

export type TestStatus = "idle" | "running" | "done";

interface TestLine {
  index: number;
  passed: boolean | null; // null = pending
  message: string;
  duration?: string;
}

interface UseTestRunnerReturn {
  status: TestStatus;
  lines: TestLine[];
  allPassed: boolean | null;
  run: () => Promise<void>;
}

export function useTestRunner(
  courseId: string,
  lang: string,
  submoduleId: string | null
): UseTestRunnerReturn {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [lines, setLines] = useState<TestLine[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const run = useCallback(async () => {
    if (!submoduleId) return;

    // Close previous stream
    eventSourceRef.current?.close();
    setStatus("running");
    setLines([]);
    setAllPassed(null);

    try {
      const { run_id } = await runTests(courseId, lang, submoduleId);

      const es = new EventSource(`/api/stream/${run_id}`);
      eventSourceRef.current = es;

      es.addEventListener("run_complete", (event) => {
        const data = JSON.parse(event.data) as {
          all_passed: boolean;
          results: TestResult[];
        };

        setLines(
          data.results.map((r) => ({
            index: r.test_index,
            passed: r.passed,
            message: r.message,
          }))
        );
        setAllPassed(data.all_passed);
        setStatus("done");
        es.close();
      });

      es.addEventListener("system_error", (event) => {
        const data = JSON.parse(event.data);
        setLines([{ index: 0, passed: false, message: data.error ?? "Error del sistema" }]);
        setAllPassed(false);
        setStatus("done");
        es.close();
      });

      // Handle generic messages (build output, etc.)
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.line) {
            setLines((prev) => [
              ...prev,
              { index: prev.length, passed: null, message: data.line },
            ]);
          }
        } catch {
          // Not JSON — ignore
        }
      };

      es.onerror = () => {
        setStatus("done");
        es.close();
      };
    } catch {
      setLines([
        { index: 0, passed: false, message: "Error al iniciar las pruebas" },
      ]);
      setAllPassed(false);
      setStatus("done");
    }
  }, [courseId, lang, submoduleId]);

  return { status, lines, allPassed, run };
}
```

- [ ] **Step 2: Create TestOutput component**

Create `frontend/src/components/workspace/test-output.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { X, CheckCircle2, XCircle, Circle, Loader2 } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { useTestRunner } from "@/hooks/use-test-runner";

export function TestOutput() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    activeSubmodule,
    setTestOutputOpen,
    markSubmodulePassed,
  } = useWorkspace();

  const { status, lines, allPassed, run } = useTestRunner(
    params.courseId,
    params.lang,
    activeSubmodule?.full_id ?? null
  );

  // Listen for run-tests event from icon rail / keyboard shortcut
  useEffect(() => {
    function handleRun() {
      setTestOutputOpen(true);
      run();
    }
    function handleEscape() {
      setTestOutputOpen(false);
    }
    window.addEventListener("buildmancer:run-tests", handleRun);
    window.addEventListener("buildmancer:escape", handleEscape);
    return () => {
      window.removeEventListener("buildmancer:run-tests", handleRun);
      window.removeEventListener("buildmancer:escape", handleEscape);
    };
  }, [run, setTestOutputOpen]);

  // Mark submodule passed when all tests pass
  useEffect(() => {
    if (allPassed && activeSubmodule) {
      markSubmodulePassed(activeSubmodule.full_id);
    }
  }, [allPassed, activeSubmodule, markSubmodulePassed]);

  const passedCount = lines.filter((l) => l.passed === true).length;
  const totalCount = lines.filter((l) => l.passed !== null).length;

  return (
    <div
      className="border-t border-border bg-surface"
      style={{
        height: "180px",
        animation: "slideUp 200ms ease-out",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { height: 0; opacity: 0; }
          to { height: 180px; opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Test Output
          </span>
          {status === "running" && (
            <Loader2 size={12} className="animate-spin text-text-muted" />
          )}
          {status === "done" && totalCount > 0 && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                allPassed
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {passedCount}/{totalCount} passed
            </span>
          )}
        </div>
        <button
          onClick={() => setTestOutputOpen(false)}
          className="text-text-dim hover:text-text transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Results */}
      <div className="overflow-y-auto p-3" style={{ height: "calc(180px - 37px)" }}>
        {lines.length === 0 && status === "running" && (
          <p className="text-xs text-text-dim">Ejecutando pruebas...</p>
        )}
        <div className="flex flex-col gap-1">
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{
                animation: `fadeIn 100ms ease ${i * 80}ms both`,
              }}
            >
              {line.passed === true ? (
                <CheckCircle2
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-success"
                />
              ) : line.passed === false ? (
                <XCircle
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-error"
                />
              ) : (
                <Circle
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-text-dim"
                />
              )}
              <span
                className={`text-xs ${
                  line.passed === false
                    ? "text-error"
                    : line.passed === null
                      ? "text-text-dim"
                      : "text-text-muted"
                }`}
              >
                {line.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Integrate TestOutput into workspace-main**

Modify `frontend/src/app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx`:

Add import at top:
```tsx
import { TestOutput } from "@/components/workspace/test-output";
```

Add `testOutputOpen` to the destructured workspace state:
```tsx
  const {
    ...existing destructuring...,
    testOutputOpen,
  } = useWorkspace();
```

Wrap the editor area in a flex column and add TestOutput below the editor. Replace:
```tsx
      {/* Editor area — TestOutput and ResourceReader are added in Tasks 12-13 */}
      {activeFile ? (
        <div className="flex-1 overflow-hidden">
```
with:
```tsx
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeFile ? (
          <div className="flex-1 overflow-hidden">
```

And after the editor's closing `)}`, before the component's final `</div>`, add:
```tsx
          {/* Test output panel */}
          {testOutputOpen && <TestOutput />}
        </div>
```

- [ ] **Step 4: Verify test runner**

Start both backend and Go runner:
```bash
# Terminal 1: Python API
cd backend && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000

# Terminal 2: Go Runner
cd backend/runner && go run ./cmd/runner

# Terminal 3: Frontend
cd frontend && npm run dev
```

Navigate to workspace, write some code, press the red ▶ button (or Ctrl+Enter). Expected:
- Test output panel slides up from bottom
- "Ejecutando pruebas..." while running
- Test results stream in one by one with pass/fail icons
- Pass count badge updates
- Close button hides the panel
- If all pass, submodule is marked as completed in the module list

- [ ] **Step 5: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/hooks/use-test-runner.ts frontend/src/components/workspace/test-output.tsx frontend/src/app/\(platform\)/workspace/
git commit -m "feat(frontend): add test runner with SSE streaming and test output panel"
```

---

### Task 13: Resource Reader

**Files:**
- Create: `frontend/src/hooks/use-resources.ts`
- Create: `frontend/src/components/workspace/resource-reader.tsx`

- [ ] **Step 1: Create useResources hook**

Create `frontend/src/hooks/use-resources.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { fetchResources } from "@/lib/api";
import type { ResourceContent } from "@/lib/types";

export function useResources(
  courseId: string,
  lang: string,
  submoduleId: string | null
) {
  const [resources, setResources] = useState<ResourceContent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submoduleId) {
      setResources([]);
      return;
    }

    setLoading(true);
    fetchResources(courseId, lang, submoduleId)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [courseId, lang, submoduleId]);

  return { resources, loading };
}
```

- [ ] **Step 2: Create ResourceReader component**

Create `frontend/src/components/workspace/resource-reader.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X, PanelRightOpen, PanelRightClose } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspace } from "./workspace-provider";
import { useResources } from "@/hooks/use-resources";

export function ResourceReader() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    activeSubmodule,
    activeResource,
    resourceReaderMode,
    closeResourceReader,
    toggleResourceReaderMode,
  } = useWorkspace();

  const { resources } = useResources(
    params.courseId,
    params.lang,
    activeSubmodule?.full_id ?? null
  );

  const [content, setContent] = useState("");

  useEffect(() => {
    if (!activeResource) return;
    const match = resources.find(
      (r) => r.title === activeResource || r.content.length > 0
    );
    setContent(match?.content ?? "");
  }, [activeResource, resources]);

  // Listen for escape
  useEffect(() => {
    function handleEscape() {
      closeResourceReader();
    }
    window.addEventListener("buildmancer:escape", handleEscape);
    return () => window.removeEventListener("buildmancer:escape", handleEscape);
  }, [closeResourceReader]);

  const isSlideOver = resourceReaderMode === "slide-over";

  if (isSlideOver) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="relative mx-4 h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface">
          <ReaderHeader
            title={activeResource ?? "Recurso"}
            mode={resourceReaderMode}
            onToggleMode={toggleResourceReaderMode}
            onClose={closeResourceReader}
          />
          <ReaderContent content={content} />
        </div>
      </div>
    );
  }

  // Split mode
  return (
    <div className="h-full w-[400px] flex-shrink-0 overflow-hidden border-l border-border bg-surface">
      <ReaderHeader
        title={activeResource ?? "Recurso"}
        mode={resourceReaderMode}
        onToggleMode={toggleResourceReaderMode}
        onClose={closeResourceReader}
      />
      <ReaderContent content={content} />
    </div>
  );
}

function ReaderHeader({
  title,
  mode,
  onToggleMode,
  onClose,
}: {
  title: string;
  mode: string;
  onToggleMode: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2">
      <span className="text-xs font-medium text-text-muted truncate">
        {title}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMode}
          className="rounded p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          title={mode === "slide-over" ? "Vista dividida" : "Vista modal"}
        >
          {mode === "slide-over" ? (
            <PanelRightOpen size={14} />
          ) : (
            <PanelRightClose size={14} />
          )}
        </button>
        <button
          onClick={onClose}
          className="rounded p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function ReaderContent({ content }: { content: string }) {
  return (
    <div className="overflow-y-auto p-6" style={{ height: "calc(100% - 41px)" }}>
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-text prose-p:text-text-muted prose-a:text-primary prose-code:text-primary prose-code:bg-surface-hover prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-bg prose-pre:border prose-pre:border-border">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Integrate ResourceReader into workspace-main**

Modify `frontend/src/app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx`:

Add import at top:
```tsx
import { ResourceReader } from "@/components/workspace/resource-reader";
```

Add `resourceReaderOpen` and `resourceReaderMode` to the destructured workspace state:
```tsx
  const {
    ...existing destructuring...,
    resourceReaderOpen,
    resourceReaderMode,
  } = useWorkspace();
```

Wrap the editor column and test output in a `flex overflow-hidden` row. After the `</div>` that closes the editor+test column, add:
```tsx
        {/* Resource reader in split mode */}
        {resourceReaderOpen && resourceReaderMode === "split" && (
          <ResourceReader />
        )}
      </div>

      {/* Resource reader in slide-over mode */}
      {resourceReaderOpen && resourceReaderMode === "slide-over" && (
        <ResourceReader />
      )}
```

The final workspace-main return structure should be:
```tsx
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar saving={saving} saved={saved} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor */}
          {testOutputOpen && <TestOutput />}
        </div>
        {resourceReaderOpen && resourceReaderMode === "split" && <ResourceReader />}
      </div>
      {resourceReaderOpen && resourceReaderMode === "slide-over" && <ResourceReader />}
    </div>
  );
```

- [ ] **Step 4: Verify resource reader**

Navigate to workspace, click the book icon in the rail, click a resource. Expected:
- Slide-over modal with markdown content rendered
- Toggle button switches to split view (resource on right, editor on left)
- Close button or Escape dismisses reader
- Markdown renders with proper dark theme styling (white headings, muted body, red links)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/src/hooks/use-resources.ts frontend/src/components/workspace/resource-reader.tsx frontend/src/app/\(platform\)/workspace/
git commit -m "feat(frontend): add resource reader with slide-over and split view modes"
```

---

### Task 14: Integration Verification + Polish

**Files:**
- Modify: `frontend/src/app/globals.css` (add prose styles if needed)
- Verify all pages and flows

- [ ] **Step 1: Add Tailwind typography plugin for markdown**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend
npm install @tailwindcss/typography
```

Add to `frontend/src/app/globals.css` after the `@import "tailwindcss";` line:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

- [ ] **Step 2: Add .superpowers to .gitignore**

Add to the project root `.gitignore`:

```
# Superpowers brainstorm sessions
.superpowers/
```

- [ ] **Step 3: Full integration test**

Start all three services:
```bash
# Terminal 1: Python API
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/backend && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000

# Terminal 2: Go Runner
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/backend/runner && go run ./cmd/runner

# Terminal 3: Frontend
cd C:/Users/raulg/Desktop/projects/BuildersPlatform/frontend && npm run dev
```

Test the complete flow:

**Landing page** (`http://localhost:3000`):
- [ ] Hero section renders with headline, subline, CTA
- [ ] Navbar is transparent, turns solid on scroll
- [ ] How it works shows 3 steps
- [ ] Project showcase shows course cards (from API)
- [ ] Career value section renders 3 blocks
- [ ] Pricing teaser links to /pricing
- [ ] Final CTA works
- [ ] Mobile responsive (hamburger menu, stacked sections)

**Pricing page** (`/pricing`):
- [ ] Three pricing cards (Free, Buildmancer highlighted, Estudiante)
- [ ] Real prices ($0, $199, $149)
- [ ] FAQ expands/collapses
- [ ] Mobile responsive

**Course dashboard** (`/courses`):
- [ ] Course cards load from API
- [ ] Click card navigates to detail

**Course detail** (`/courses/http-server`):
- [ ] Course title, description, difficulty
- [ ] Language picker with enrollment status
- [ ] Click language → enroll → redirect to workspace

**Workspace** (`/workspace/http-server/go`):
- [ ] Icon rail with all icons
- [ ] Module list with progress bar and submodule states
- [ ] File tree shows working files
- [ ] CodeMirror editor with Go syntax highlighting
- [ ] Tab bar with file tabs
- [ ] Autosave works (edit → wait → save indicator)
- [ ] Run tests → SSE streaming → test results appear
- [ ] Resource panel lists resources
- [ ] Resource reader opens in slide-over and split modes
- [ ] Keyboard shortcuts: Ctrl+Enter (run), Ctrl+S (save), Escape (close)
- [ ] Mobile shows desktop-only message

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raulg/Desktop/projects/BuildersPlatform
git add frontend/ .gitignore
git commit -m "feat(frontend): add typography plugin and final integration polish"
```

---

## Dependency Graph

```
Task 1 (Scaffold)
  └── Task 2 (Design System)
        ├── Task 3 (Marketing Layout)
        │     ├── Task 4 (Landing Page)
        │     └── Task 5 (Pricing Page)
        └── Task 6 (API Client + Platform Layout)
              ├── Task 7 (Course Dashboard)
              │     └── Task 8 (Course Detail)
              └── Task 9 (Workspace Shell)
                    ├── Task 10 (Module List + File Tree)
                    ├── Task 11 (Editor + Autosave)
                    │     └── Task 12 (Test Runner + SSE)
                    └── Task 13 (Resource Reader)

Task 14 (Integration) — depends on all above
```

Tasks 4 & 5 can run in parallel. Tasks 10, 11, 13 can run in parallel (all depend on 9). Task 12 depends on 11.
