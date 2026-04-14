# Buildmancer Workspace Design Revamp

> Spec for a full UX redesign of the workspace experience.
> Scope: primarily `frontend/src/components/workspace/*`, `workspace-main.tsx`, workspace page, and supporting hooks.
> Backend changes noted where needed.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [UX Gap Analysis](#3-ux-gap-analysis)
4. [Redesign Spec](#4-redesign-spec)
5. [Component-Level Changes](#5-component-level-changes)
6. [New Components](#6-new-components)
7. [State Management Changes](#7-state-management-changes)
8. [Backend Changes Required](#8-backend-changes-required)
9. [Course YAML Revamp — The Guided Script](#9-course-yaml-revamp--the-guided-script)
10. [Interaction & Micro-interaction Design](#10-interaction--micro-interaction-design)
11. [Keyboard & Accessibility](#11-keyboard--accessibility)
12. [Migration Strategy](#12-migration-strategy)

---

## 1. Executive Summary

Buildmancer's workspace is a **guided coding environment** where users build real software by completing spec-driven submodules, writing code, and running tests. The current workspace is functional but treats all information equally — the spec (what to build), the editor (where to build), the test output (feedback), and the resources (how to learn) all compete for attention without a clear hierarchy.

**The core UX thesis of this revamp:**

> The workspace should feel like a focused conversation between the spec and the code, with everything else supporting that dialogue. The user should always know: **what to do, where to do it, and whether it worked.**

**Key design principles for the revamp:**
- **Spec-first**: The task description drives the experience, not the file tree
- **Feedback-rich**: Test results should feel like a coach, not a log dump
- **Progressive disclosure**: Show what's needed now, hide what's not
- **Momentum**: Every completed submodule should feel like a win
- **Zero-confusion**: Eliminate every moment where the user wonders "what now?"

---

## 2. Current State Audit

### 2.1 Current Layout

```
┌──────────────────────────────────────────────────────┐
│ IconRail │ Panel (220px)    │ TabBar                 │
│ (48px)   │                  │ Editor                 │
│          │ ModuleList       │                        │
│          │   or FileTree    │                        │
│          │   or Resources   │                        │
│          │                  │ TestOutput (180px, opt)│
│          │                  │                        │
│          │                  │ ResourceReader (opt)   │
└──────────────────────────────────────────────────────┘
```

### 2.2 What Works

| Aspect | Strength |
|--------|----------|
| Custom CodeMirror theme | Cohesive dark+red branding, matches the site identity |
| Autosave with visual indicator | Users see "..." then "checkmark" in tab — clear and unobtrusive |
| Sequential submodule locking | Enforces learning path, prevents skipping ahead |
| Keyboard shortcuts | Ctrl+Enter (run), Ctrl+S (save), Escape (close panels) |
| EventSource test streaming | Real-time test output feels alive, not batch |
| Progress tracking | Passed submodules persist via API, re-entry picks up where left off |
| Custom scrollbar styling | Thin, dark scrollbars match the editor aesthetic |

### 2.3 What Doesn't Work

Detailed in the gap analysis below.

---

## 3. UX Gap Analysis

### GAP 1: The Spec is Buried (Critical)

**Problem**: The submodule `spec` — literally the instructions for what to build — appears as a tiny 10px text block nested inside the ModuleList accordion, below the submodule title, in a dark `bg-bg` box. It competes with navigation elements and is easy to miss entirely.

**Impact**: Users don't know what they're supposed to build. They open files and stare at stub code without context. This is the single biggest UX failure in the workspace.

**Evidence**: `module-list.tsx:174-179` — spec renders as `text-[10px]` inside a collapsed tree node, only visible when the submodule is active AND the parent module is expanded.

**What the user actually needs**: The spec should be the **first and most prominent thing** they see when a submodule activates. It's the assignment brief.

---

### GAP 2: No Task-Code Connection (Critical)

**Problem**: There is no visual or interactive link between what the spec asks and what files/code the user should edit. The spec says "implement X" but the user has to manually figure out which file to open and where to write.

**Impact**: Cognitive overhead. New users (the primary audience) waste time hunting for the right file instead of coding.

**Evidence**: `workspace-provider.tsx` has `activeSubmodule` with `stubs[].path` — the data exists to highlight which files matter, but it's never surfaced in the editor UI. The file tree and module list are separate panels with no cross-referencing.

**What the user actually needs**: When a submodule activates, its stub files should be auto-opened and visually marked as "the files you need to edit."

---

### GAP 3: Test Output Feels Like a Log, Not Feedback (High)

**Problem**: The test output panel is a flat list of lines with pass/fail icons. It has no structure, no grouping, no context about what each test was checking, and no guidance on what to fix when tests fail.

**Impact**: When tests fail, users see "Test falló" with a raw message but no path to fixing the issue. This creates a dead end — the user has to re-read the spec, guess what went wrong, and try again without structured feedback.

**Evidence**: `test-output.tsx:73-88` — each line renders identically with only a colored icon differentiating pass/fail/info. No test name grouping, no expected-vs-actual diff, no link to failing line.

**What the user actually needs**: Structured test results with: test name, what it checked, expected vs actual (when available), and a clear "X of Y passed" summary that persists.

---

### GAP 4: No Completion Celebration (High)

**Problem**: When all tests pass for a submodule, the only feedback is: (1) a green "5/5 passed" badge in the test panel, and (2) a silent checkmark appearing next to the submodule in the module list (which may not even be visible). There's no moment of satisfaction.

**Impact**: The platform is a guided learning experience. Completion moments are the primary motivation loop. A flat green badge doesn't create momentum — it feels like nothing happened.

**Evidence**: `test-output.tsx:60-63` — just a badge swap. `module-list.tsx:144-148` — CheckCircle2 icon appears. No animation, no transition, no celebration.

**What the user actually needs**: A visible, animated success state that acknowledges the accomplishment and clearly prompts "what's next." Think confetti is too much — but a satisfying animated transition with a clear "next step" CTA is essential.

---

### GAP 5: Resource Reader is Disconnected (Medium)

**Problem**: Resources (guides, docs, hints) open in either a modal overlay or a side panel, both of which obscure or compress the editor. The user can't read a guide and code at the same time comfortably. Additionally, the resource list is hidden behind the "Resources" icon rail button — a third panel that replaces the module list or file tree.

**Impact**: Users have to context-switch between reading and coding. The modal blocks the editor entirely. The split mode takes 400px from the editor width, which on a 1280px screen leaves very little coding space.

**Evidence**: `resource-reader.tsx:57-70` (modal mode blocks editor), `resource-reader.tsx:73-83` (split mode takes 400px). Panel is fixed-width with no resize.

**What the user actually needs**: Resources should integrate into the flow, not fight with the editor. Consider: (a) resources as a tab in the editor area (like an "open file" but for docs), or (b) a bottom drawer that doesn't steal horizontal space.

---

### GAP 6: Silent Error Handling (Medium)

**Problem**: Multiple failure modes are invisible to the user:
- Autosave failures: silently swallowed (`use-autosave.ts:29`)
- File fetch failures: return empty array, no notification
- API errors: generic `throw new Error` with no user-facing message
- No error boundary: unhandled exception crashes the entire workspace

**Impact**: Users can lose work without knowing. They might edit for minutes, switch submodules, and discover their changes weren't saved. Trust erosion.

**What the user actually needs**: Toast notifications for save failures ("Could not save — retrying..."), clear error states for API failures, and an error boundary that shows a recoverable message instead of a white screen.

---

### GAP 7: No Breadcrumb / Context Bar (Medium)

**Problem**: Once inside the workspace, there's no persistent indicator of: what course they're in, what module they're working on, what submodule is active, or their overall progress. The only context is the module list title (`text-[10px]`), which disappears when the panel is closed.

**Impact**: Users lose their place, especially after returning to the workspace from another tab/session. They have to re-open the module panel, find the active submodule, and re-read the spec.

**What the user actually needs**: A compact status bar or breadcrumb showing: `Course > Module > Submodule` with progress indicator, always visible.

---

### GAP 8: Icon Rail is Cryptic (Low-Medium)

**Problem**: The icon rail uses icon-only buttons (Package, FolderOpen, BookOpen, Play, Home) with `title` tooltips as the only discoverability mechanism. First-time users don't know what the icons mean. The Play button being red makes it look like "stop" or "danger" rather than "run."

**Evidence**: `icon-rail.tsx:45-56` — no labels, no onboarding hints, no first-use tooltips.

**What the user actually needs**: Either (a) labels below icons (like VS Code's activity bar with hover labels), or (b) a first-use tooltip sequence, or (c) a slightly wider rail with text labels.

---

### GAP 9: Fixed Panel Widths (Low-Medium)

**Problem**: All panels have fixed dimensions — icon rail (48px), sidebar panel (220px), test output (180px), resource reader (400px). None are resizable. On larger screens, the sidebar feels cramped. On exactly-1024px screens (the minimum), the editor gets squeezed.

**Evidence**: `icon-rail.tsx:41` (w-12), `panel.tsx:13` (w-[220px]), `test-output.tsx:54` (height: 180px), `resource-reader.tsx:74` (w-[400px]).

**What the user actually needs**: Drag-to-resize dividers on at least the sidebar panel and test output panel. Not essential for MVP but improves power-user experience significantly.

---

### GAP 10: No File Relevance Indicators (Medium)

**Problem**: The file tree shows all files equally. There's no indication of which files are relevant to the current submodule (stubs), which are read-only infrastructure, or which have been modified.

**Evidence**: `file-tree.tsx:105-119` — all files rendered identically. The `Submodule.stubs[].path` data exists but is never cross-referenced with the file tree.

**What the user actually needs**: Stub files for the active submodule should be visually distinct (highlighted, badged, or pinned to top). Modified-but-unsaved files should show a dot indicator.

---

### GAP 11: Test Results Don't Persist Across Submodule Switches (Low)

**Problem**: When the user switches to a different submodule, the test output clears entirely. If they switch back, they have to re-run tests to see results.

**Evidence**: `use-test-runner.ts:48-54` — `run()` resets all state. No caching by submodule.

**What the user actually needs**: Cache last test results per submodule so switching back restores the output without re-running.

---

### GAP 12: No Code Block Syntax Highlighting in Resources (Low)

**Problem**: Resources are rendered with `react-markdown` + `remark-gfm` but code blocks within the markdown have no syntax highlighting. They render as plain monospace text on a dark background.

**Evidence**: `resource-reader.tsx:119` — no `rehype-highlight` or similar plugin.

**What the user actually needs**: Syntax-highlighted code blocks in resources that match the editor's color scheme, so examples in guides look like the code they'll write.

---

### GAP 13: No Loading Skeletons (Low)

**Problem**: The workspace shows "Cargando..." as a single text string centered on screen while the course, files, and progress load in parallel. There's no skeleton to indicate what the workspace will look like.

**Evidence**: `workspace-main.tsx:101-105` — plain text loading state.

**What the user actually needs**: A skeleton layout showing the approximate shape of the workspace (sidebar, editor area, tab bar) so the transition feels fast and the user orients before data arrives.

---

### GAP 14: No Submodule Transition (Low-Medium)

**Problem**: When switching submodules, the files change instantly with no transition. The user's editor state (cursor, scroll position, undo history) is lost because CodeMirror rebuilds. There's no visual cue that the context switched.

**Evidence**: `editor.tsx:140-149` — content replacement dispatches a full document swap. `workspace-main.tsx:55-62` — submodule change triggers file reload.

**What the user actually needs**: A brief transition (fade or slide) when switching submodules, and preservation of editor state per file (cursor position, undo stack).

---

## 4. Redesign Spec

### 4.1 New Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ ContextBar (full width, 36px)                                  │
│  Logo │ Course > Module > Submodule    │ Progress │ Shortcuts  │
├───────┬──────────────┬──────────────────────────────────────────┤
│ Rail  │ Sidebar      │ Main Area                               │
│ 44px  │ (resizable)  │                                         │
│       │ 200-400px    │ ┌──────────────────────────────────────┐ │
│ [M]   │              │ │ TaskBrief (collapsible, ~80px)       │ │
│ [F]   │ ModuleList   │ │  "Implement an HTTP GET handler..." │ │
│ [R]   │   or         │ ├──────────────────────────────────────┤ │
│       │ FileTree     │ │ TabBar                               │ │
│       │   or         │ │ Editor                               │ │
│       │ ResourceList │ │                                      │ │
│       │              │ │                                      │ │
│       │              │ ├──────────────────────────────────────┤ │
│       │              │ │ TestPanel (resizable, collapsible)   │ │
│       │              │ │  Structured results + actions        │ │
│ ──────│              │ └──────────────────────────────────────┘ │
│ [Run] │              │                                         │
│ [Home]│              │                                         │
└───────┴──────────────┴─────────────────────────────────────────┘
```

### 4.2 Key Layout Changes

| Current | Proposed | Rationale |
|---------|----------|-----------|
| Spec hidden in module tree | Dedicated TaskBrief above editor | Spec is the assignment — it should be front and center |
| Context only in sidebar title | Persistent ContextBar with breadcrumb | User always knows where they are |
| Resources in separate panel or overlay | Resources open as editor tabs | Read and code side by side without layout disruption |
| Test output as fixed-height bottom drawer | Resizable, structured test panel | Users need to examine failure details; 180px isn't enough |
| Icon rail 48px, no labels | 44px rail with tooltip labels + keyboard hint | Discoverability without wasting space |
| All fixed widths | Sidebar + test panel resizable with drag handles | Power users can customize; minimum/maximum bounds prevent breakage |

### 4.3 Information Hierarchy (Priority Order)

1. **TaskBrief** — What to build (spec text + stub files as links)
2. **Editor** — Where to build (code)
3. **TestPanel** — Whether it works (structured feedback)
4. **ContextBar** — Where you are (breadcrumb + progress)
5. **Sidebar** — Navigation and resources (supporting)

---

## 5. Component-Level Changes

### 5.1 `ContextBar` (new component, replaces top of icon rail)

A 36px horizontal bar spanning the full width above the workspace.

**Contents (left to right):**
- Logo (20x20, clickable to /courses)
- Breadcrumb: `Course Title / Module Title / Submodule Title` in `text-xs text-text-muted`, active submodule in `text-text`
- Flex spacer
- Progress pill: `3/12` with mini progress bar (width ~80px)
- Keyboard shortcut hint: `Ctrl+Enter to run` (only shown first 3 sessions, then auto-hides — stored in localStorage)

**Styling:**
- `bg-surface border-b border-border`
- Height: 36px fixed
- z-index above editor

---

### 5.2 `TaskBrief` (new component, replaces spec in ModuleList)

A collapsible panel between the ContextBar and TabBar, showing the active submodule's spec.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ ▼ Current Task                      [Collapse]  │
│                                                 │
│ Implement an HTTP GET handler that responds     │
│ with "Hello, World!" on the root path (/).      │
│                                                 │
│ Files: main.go, handler.go                      │
│         ↑ clickable, opens/focuses file         │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Expanded by default on submodule activation
- Collapsible to a single-line summary: `"▶ Current Task: Implement an HTTP GET handler..."` (truncated)
- Collapse state persisted in localStorage per submodule
- Stub file names rendered as clickable chips that open/focus the file
- Text rendered at `text-sm` (14px) — readable, not the current 10px
- Background: `bg-surface` with subtle left border accent `border-l-2 border-primary`

**Data source:** `activeSubmodule.spec` + `activeSubmodule.stubs[].path`

---

### 5.3 `IconRail` (modified)

**Changes:**
- Width reduced from 48px to 44px
- Remove logo (moved to ContextBar)
- Add `aria-label` to all buttons
- Tooltips: show on hover with label + shortcut (e.g., "Modules (Ctrl+1)")
- Run button: keep red accent but add a pulsing ring animation when tests were never run for active submodule
- Add keyboard shortcuts: `Ctrl+1` (modules), `Ctrl+2` (files), `Ctrl+3` (resources)

---

### 5.4 `Panel` (modified sidebar)

**Changes:**
- Width: default 240px (up from 220px), resizable 200px-400px via drag handle on right edge
- Drag handle: 4px hit area, cursor `col-resize`, subtle `border-border` that brightens on hover
- Animate open/close with 150ms width transition
- Persist width in localStorage

**ModuleList changes within panel:**
- Remove the spec text block from submodule items (moved to TaskBrief)
- Add a "current" indicator that's more prominent: solid left bar + subtle background pulse on activation
- Module progress: replace `done/total` text with mini segmented bar (each segment = submodule, filled = passed)
- Submodule items: show stub file count as dim badge: `2 files`

**FileTree changes within panel:**
- Highlight stub files for active submodule with a primary-colored dot or left border
- Show modified-but-unsaved indicator (small dot) next to filename
- Dim files that aren't relevant to the current submodule (but keep them accessible)

---

### 5.5 `TabBar` (modified)

**Changes:**
- Increase height from 36px to 38px for slightly more breathing room
- Add file extension icon (color-coded dot: `.go` = teal, `.py` = blue, `.js` = yellow)
- Modified indicator: unsaved changes show a dot before filename (replaces current `...` / `checkmark`)
- Save status: move to ContextBar or make the dot animate (pulse when saving, solid when saved)
- Tab overflow: when tabs exceed width, show left/right scroll arrows (currently just overflows with scrollbar)
- Resource tabs: when resources open as editor tabs, distinguish them with a BookOpen icon instead of File icon
- Close button: always visible on active tab (currently hidden until hover)
- Middle-click to close tab
- Tab drag-to-reorder (nice-to-have, not MVP)

---

### 5.6 `Editor` (modified)

**Changes:**
- Add indentation guides extension (`@codemirror/indent-service` or custom)
- Add fold gutter (code folding)
- Add search/replace panel (`@codemirror/search`) — currently missing entirely
- Add minimap (nice-to-have, not MVP)
- Preserve cursor position and scroll when switching between open files (store per-file state in a Map)
- Add placeholder text when file is empty: `"// Start implementing here..."` in dim text

**Editor state preservation:**
```typescript
// New: per-file state cache
const editorStates = useRef<Map<string, EditorState>>(new Map());
```

---

### 5.7 `TestPanel` (replaces `TestOutput`)

Complete redesign. The test panel should feel like a **coach**, not a log viewer.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Test Results              2/3 passed  [Re-run ▶] [× Close] │
├─────────────────────────────────────────────────────────────┤
│ ✓ GET / returns 200                                        │
│ ✓ Response body is "Hello, World!"                         │
│ ✗ Content-Type header is text/plain                        │
│   ├─ Expected: text/plain                                  │
│   └─ Got: text/html                                        │
│                                                            │
│ ──────────────────────────────────                          │
│ Build: 0.3s │ Tests: 1.2s                                  │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Height: default 200px, resizable 120px-400px via drag handle on top edge
- Header: "Test Results" label, pass count badge, Re-run button (inline, not just in icon rail), Close button
- Each test: structured line with icon + test name/message
- Failed tests: expand inline to show expected vs actual when the backend provides it
- Summary footer: build time + test execution time (requires backend data — see section 8)
- Animate test results in sequentially (keep current stagger, but smoother)
- **Persist results per submodule** — cache in a `Map<string, TestLine[]>` so switching back restores output
- Status states:
  - `idle`: "Run tests to check your implementation" with Ctrl+Enter hint
  - `running`: Spinner with "Building..." → "Running tests..." phase labels
  - `done + all passed`: Green success state with "Next step" button
  - `done + failures`: Red failure state with structured results
  - `error`: Red error state with retry button

**On all tests passed:**
- The panel transforms briefly: background pulses to `bg-success/5`
- A "Continue to next task" button appears prominently
- The submodule checkmark in the sidebar animates in (scale-up + checkmark draw)

---

### 5.8 `ResourceReader` (modified to be tab-based)

**Changes:**
- Remove the slide-over (modal) mode entirely
- Remove the split-panel mode
- Instead: resources open as **read-only tabs** in the editor area
- Tab distinguisher: BookOpen icon + "Resource" label instead of File icon
- Content: same Markdown rendering, but inside the editor content area dimensions
- Add `rehype-highlight` for syntax-highlighted code blocks in resources
- Resources and code tabs live side-by-side — user can click between them freely
- Closing a resource tab removes it from `openFiles` just like a code file
- Resource tabs cannot be "saved" (no autosave indicator)

**Data changes:**
- `openFiles` array needs to support both code files and resource references
- New type: `OpenTab = { type: "file"; filepath: string } | { type: "resource"; resourceId: string; title: string }`
- Or simpler: prefix resource paths with `resource://` to distinguish in the string array

---

## 6. New Components

### 6.1 `Toast` (notification system)

Add a lightweight toast system for surfacing errors and confirmations.

**Use cases:**
- Autosave failure: "Could not save [filename]. Retrying..." (warning, auto-dismiss 5s)
- Autosave recovery: "Changes saved." (success, auto-dismiss 2s)
- API error: "Connection lost. Check your internet." (error, persistent until dismissed)
- Test error: "Could not start test runner." (error, auto-dismiss 5s)
- Enrollment success: "Enrolled! Loading workspace..." (success, auto-dismiss 3s)

**Implementation:** Use `sonner` (2.5KB, zero-config) — already popular in Next.js ecosystem.

**Position:** Bottom-right, above test panel if open.

---

### 6.2 `SuccessOverlay` (submodule completion)

A brief overlay that appears when all tests pass for a submodule.

**Design:**
```
┌─────────────────────────────────────┐
│                                     │
│         ✓ Submodule Complete        │
│                                     │
│      "HTTP GET Handler"             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Continue to next task →   │   │
│   └─────────────────────────────┘   │
│                                     │
│         [Skip celebration]          │
└─────────────────────────────────────┘
```

**Behavior:**
- Appears overlaid on the editor area (not fullscreen — sidebar stays visible for context)
- Subtle entrance animation: scale 0.95 → 1.0, opacity 0 → 1 (200ms)
- Checkmark icon draws itself (SVG stroke animation, 400ms)
- "Continue to next task" button auto-advances to next unlocked submodule
- "Skip celebration" link at bottom (remembers preference in localStorage — if clicked 3 times, auto-skip future celebrations)
- Auto-dismisses after 5s if no action taken (fades out, test panel stays green)
- If this is the **last submodule in a module**, show "Module Complete!" instead
- If this is the **last submodule in the course**, show "Project Complete!" with link to courses page

---

### 6.3 `ResizeHandle` (utility component)

A reusable drag handle for resizable panels.

**Props:**
```typescript
interface ResizeHandleProps {
  direction: "horizontal" | "vertical"; // horizontal = drag left/right, vertical = drag up/down
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}
```

**Behavior:**
- 4px visible area, 8px hit area (offset with negative margin for easier grabbing)
- Cursor: `col-resize` or `row-resize`
- Visual: transparent by default, `bg-border` on hover, `bg-primary/50` while dragging
- Dispatches delta on mousemove during drag

---

### 6.4 `ErrorBoundary` (new)

A React error boundary wrapping the workspace.

**Recovery UI:**
```
┌─────────────────────────────────────┐
│                                     │
│      Something went wrong           │
│                                     │
│   Your code is safe — this is a     │
│   platform error, not your code.    │
│                                     │
│   ┌────────────┐  ┌─────────────┐  │
│   │  Reload     │  │  Go to Home │  │
│   └────────────┘  └─────────────┘  │
│                                     │
│   [Show error details]              │
└─────────────────────────────────────┘
```

**Key message:** Reassure the user that their code (which autosaves) is not lost.

---

### 6.5 `CommandPalette` (nice-to-have, not MVP)

A `Cmd+K` / `Ctrl+K` command palette for quick navigation.

**Commands:**
- Open file by name
- Switch submodule
- Run tests
- Open resource
- Toggle panel
- Go home

Implementation: lightweight — just a filtered list in a modal with keyboard navigation. No need for a library.

---

## 7. State Management Changes

### 7.1 Updated WorkspaceState

```typescript
interface WorkspaceState {
  // Existing (keep)
  course: Course | null;
  files: WorkingFile[];
  activeModule: Module | null;
  activeSubmodule: Submodule | null;
  activeFile: string | null;
  panelView: PanelView;
  panelOpen: boolean;
  passedSubmodules: Set<string>;

  // Modified
  openTabs: OpenTab[];          // replaces openFiles: string[]
  testPanelOpen: boolean;       // replaces testOutputOpen

  // New
  taskBriefExpanded: boolean;
  sidebarWidth: number;         // default 240, persisted
  testPanelHeight: number;      // default 200, persisted
  testResultsCache: Map<string, CachedTestResult>;  // keyed by submodule full_id
  showSuccessOverlay: boolean;
  completedSubmoduleId: string | null;  // for the success overlay
  unsavedFiles: Set<string>;    // tracks which files have unsaved changes
}

interface OpenTab {
  type: "file" | "resource";
  id: string;        // filepath for files, resource identifier for resources
  label: string;     // display name
}

interface CachedTestResult {
  lines: TestLine[];
  allPassed: boolean | null;
  timestamp: number;
}
```

### 7.2 New Actions

```typescript
interface WorkspaceActions {
  // ... existing actions ...

  // New
  openTab: (tab: OpenTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setSidebarWidth: (width: number) => void;
  setTestPanelHeight: (height: number) => void;
  setTaskBriefExpanded: (expanded: boolean) => void;
  cacheTestResults: (submoduleId: string, result: CachedTestResult) => void;
  showSuccess: (submoduleId: string) => void;
  dismissSuccess: () => void;
  markFileUnsaved: (filepath: string) => void;
  markFileSaved: (filepath: string) => void;
}
```

### 7.3 localStorage Persistence

The following should persist across sessions:
- `buildmancer:sidebar-width` — sidebar panel width
- `buildmancer:test-panel-height` — test panel height
- `buildmancer:task-brief-collapsed` — per-submodule collapse state
- `buildmancer:skip-celebration` — boolean, auto-skip success overlay
- `buildmancer:shortcut-hint-seen` — number, count of sessions to decide hiding keyboard hint

---

## 8. Backend Changes Required

### 8.1 Test Result Enrichment (Recommended)

**Current:** `test_pass` and `test_fail` events send `{ message: string }`. No test name, no expected/actual values.

**Proposed:** Enrich the event payloads:

```json
// test_pass event
{
  "test_name": "GET / returns 200",
  "message": "Status code is 200",
  "duration_ms": 45
}

// test_fail event
{
  "test_name": "Content-Type header is text/plain",
  "message": "Header mismatch",
  "expected": "text/plain",
  "actual": "text/html",
  "duration_ms": 23
}

// run_complete event (add timing)
{
  "all_passed": false,
  "results": [...],
  "build_time_ms": 320,
  "test_time_ms": 1200
}
```

**Files affected:** Go runner dispatchers (`runner/dispatchers/*.go`) and the Python SSE bridge (`backend/api/routers/runs.py`).

**Scope:** This is an additive change — new fields on existing event payloads. Frontend should handle missing fields gracefully (current messages still work as fallback).

### 8.2 Submodule Hint System (Nice-to-have)

**Current:** Resources have a `visible_to` field that filters by difficulty level, but there's no progressive hint system — all resources for a submodule are shown at once.

**Proposed:** Add an optional `hint_order` field to resources, enabling the frontend to reveal hints progressively (e.g., show hint 1 after first failed test run, hint 2 after third failed run).

```yaml
resources:
  - title: "HTTP Handler Basics"
    file: "handler-basics.md"
    type: "guide"
    visible_to: ["junior"]
  - title: "Hint: Setting Headers"
    file: "hint-headers.md"
    type: "hint"
    hint_order: 1            # new field
    visible_to: ["junior"]
```

**Frontend:** Track failed run count per submodule. Show hint resources progressively based on `hint_order <= failedRunCount`.

---

## 9. Course YAML Revamp — The Guided Script

### 9.0 Why the YAML Needs to Change

The investigation uncovered a fundamental misalignment: **the course YAML defines what to test, but not how to teach.** The workspace redesign (sections 4-8) fixes the frontend's information hierarchy, but even a perfect UI can't create a guided learning experience if the underlying data model treats resources as flat, unsorted, dump-it-all-at-once attachments.

Three discoveries drive this section:

1. **Every submodule follows the same implicit 3-resource pattern** (doc → signature → hint) but this ordering is convention, not schema. A frontend can't reliably derive staging from an arbitrary `type` string.

2. **Tests have no human-readable descriptions.** The Go runner already emits `expected`/`actual` data in failure payloads (`http.go:84-130`), but the frontend shows "Test falló" because there's no test name to display. The YAML defines `{type: http, request: {method: GET, path: /health}, expected: {status: 200}}` — pure machine data with no label.

3. **The SSE event names are mismatched.** Runner sends `test_done`/`test_failed`; frontend listens for `test_pass`/`test_fail`. This means test failure detail (expected vs actual, output) is **already being transmitted but silently dropped**. This is a bug, not a feature gap — but fixing it makes test descriptions even more important.

The goal is to turn the course YAML into a **guided script**: a declarative format that describes not just what to test, but what to show, when to show it, and what to say at each stage.

---

### 9.1 Current YAML Limitations

| Aspect | Current | Problem |
|--------|---------|---------|
| Resources | Flat list per submodule, all shown at once | No progressive disclosure; junior user sees the hint before trying |
| Resource timing | None — `visible_to` controls WHO, nothing controls WHEN | Can't stage resources by learning moment |
| Resource `type` | Free string (`doc`, `hint`, `signature`, `spec`) | No schema constraint, no ordering semantics |
| Test descriptions | None — only `type`, `match`, `file`, `expected` | Frontend shows "Test pasó" instead of "GET /health returns 200" |
| Submodule `spec` | Implementation instructions ("Implementa X, llama Y") | No separation between high-level goal and procedural steps |
| Completion messages | None | Generic "All tests passed" — no submodule-specific celebration |
| Error guidance | None | When tests fail, user gets raw error with no pedagogical guidance |

---

### 9.2 Proposed YAML Changes

#### 9.2.1 Test Descriptions (`description` field on tests)

**Current:**
```yaml
tests:
  - type: http
    request:
      method: GET
      path: /health
    expected:
      status: 200
      body_contains: '"status":"ok"'
    timeout_ms: 3000
```

**Proposed:**
```yaml
tests:
  - description: "GET /health returns 200 with JSON status"    # NEW
    type: http
    request:
      method: GET
      path: /health
    expected:
      status: 200
      body_contains: '"status":"ok"'
    timeout_ms: 3000
```

**Impact:** The redesigned TestPanel (section 5.7) can now show:
```
✓ GET /health returns 200 with JSON status
✗ POST /echo returns the request body
  ├─ Expected: "hello"
  └─ Got: ""
```

Instead of:
```
✓ Test pasó
✗ Test falló
```

**Backend change:** Add `description: str | None = None` to `TestSpec` model. Pass through to runner's SSE events. The runner's `test_start` event already sends `{index, type}` — add `description` to this payload. Frontend uses `description` as the test label, falling back to a generated label from `type`+`request.method`+`request.path` if absent.

**Migration:** Fully backward-compatible. Missing `description` defaults to `None`; frontend falls back to current behavior.

---

#### 9.2.2 Resource Staging (`stage` field with smart defaults)

**Current:**
```yaml
resources:
  - title: "net.Listen y TCP accept loops"
    file: tcp/server_doc.md
    type: doc
    visible_to: [junior, mid, senior]
  - title: "Signature: Server.Start"
    file: tcp/listen_signature.md
    type: signature
    visible_to: [junior, mid, senior]
  - title: "Hint: listener, accept loop y goroutines"
    file: tcp/listen_hint.md
    type: hint
    visible_to: [junior]
```

**Proposed:**
```yaml
resources:
  - title: "net.Listen y TCP accept loops"
    file: tcp/server_doc.md
    type: doc
    visible_to: [junior, mid, senior]
    # stage omitted → defaults to 0 (immediate) because type=doc

  - title: "Signature: Server.Start"
    file: tcp/listen_signature.md
    type: signature
    visible_to: [junior, mid, senior]
    # stage omitted → defaults to 1 (after first run) because type=signature

  - title: "Hint: listener, accept loop y goroutines"
    file: tcp/listen_hint.md
    type: hint
    visible_to: [junior]
    # stage omitted → defaults to 2 (after failed run) because type=hint
```

**The `stage` field:**

| Stage | Trigger | Default for `type` | What it means |
|-------|---------|-------------------|---------------|
| `0` | Submodule activation | `doc`, `spec` | "Read this before you start" |
| `1` | After first test run (any outcome) | `signature` | "You've tried — here's the precise interface" |
| `2` | After a failed test run | `hint` | "You're stuck — here's structured help" |
| `3` | After 3+ failed runs | *(explicit only)* | "Deep trouble — here's the walkthrough" |

**Explicit override example** — a course author wants the signature shown immediately:
```yaml
  - title: "Signature: Server.Start"
    file: tcp/listen_signature.md
    type: signature
    visible_to: [junior, mid, senior]
    stage: 0    # override: show immediately, don't wait for first run
```

**Smart defaults derivation:**
```python
# In course_loader/models.py
STAGE_DEFAULTS = {"doc": 0, "spec": 0, "signature": 1, "hint": 2}

class Resource(BaseModel):
    title: str
    file: str
    type: str
    visible_to: list[str] = []
    stage: int | None = None  # None = use default based on type

    @property
    def effective_stage(self) -> int:
        if self.stage is not None:
            return self.stage
        return STAGE_DEFAULTS.get(self.type, 0)
```

**API response change:**
```json
[
  { "title": "...", "type": "doc", "content": "...", "stage": 0 },
  { "title": "...", "type": "signature", "content": "...", "stage": 1 },
  { "title": "...", "type": "hint", "content": "...", "stage": 2 }
]
```

**Frontend visibility logic:**
```typescript
// In workspace state, track per-submodule run history
runHistory: Map<string, { totalRuns: number; failedRuns: number }>

// Resource visibility filter
function isResourceVisible(resource: Resource, history: RunHistory): boolean {
  switch (resource.stage) {
    case 0: return true;                           // always visible
    case 1: return history.totalRuns >= 1;         // after any run
    case 2: return history.failedRuns >= 1;        // after a failure
    case 3: return history.failedRuns >= 3;        // after repeated failure
    default: return true;
  }
}
```

**Migration:** Fully backward-compatible. All existing resources have no `stage` field → defaults apply based on `type`. The implicit pattern (doc=0, signature=1, hint=2) already matches the convention in every submodule of the http-server course.

---

#### 9.2.3 Submodule Goal (separate from Spec)

**Current:**
```yaml
- id: listen
  title: "Listener TCP y accept loop"
  spec: >-
    Implementa Server.Start: abre un listener TCP en Server.Addr con
    net.Listen("tcp", s.Addr), defer listener.Close(), y entra en un
    loop infinito llamando listener.Accept(). Por cada conexión
    aceptada, lanza una goroutine: go s.handleConnection(conn). Si
    Accept falla en una conexión individual, loggea con log.Printf y
    hace continue. Retorna error solo si el listener no puede abrirse.
```

**Problem:** The `spec` is implementation instructions. It reads like pseudocode. For the TaskBrief (section 5.2), users need a high-level "what" before the procedural "how."

**Proposed:**
```yaml
- id: listen
  title: "Listener TCP y accept loop"
  goal: >-                                                    # NEW
    Haz que el servidor escuche conexiones TCP entrantes y maneje
    cada una en una goroutine separada.
  spec: >-
    Implementa Server.Start: abre un listener TCP en Server.Addr con
    net.Listen("tcp", s.Addr), defer listener.Close(), ...
```

**Frontend usage:**
- **TaskBrief headline**: Shows `goal` — the 1-2 sentence "what you're building"
- **TaskBrief expandable detail**: Shows `spec` — the full implementation steps
- If `goal` is absent: TaskBrief shows first sentence of `spec` as headline, rest as detail

**Backend change:** Add `goal: str | None = None` to `Submodule` model. Pass through to API.

**Migration:** Fully backward-compatible. Missing `goal` = frontend derives headline from `spec`.

---

#### 9.2.4 Completion Messages (`on_pass` field)

**Current:** When all tests pass, the frontend shows generic "Todas las pruebas pasaron."

**Proposed:**
```yaml
- id: listen
  title: "Listener TCP y accept loop"
  goal: ...
  spec: ...
  on_pass: >-                                                 # NEW
    Tu servidor ya acepta conexiones TCP. Cada cliente se maneja
    en su propia goroutine — así funciona la concurrencia en Go.
```

**Frontend usage:** The SuccessOverlay (section 6.2) shows `on_pass` as the completion message instead of the generic text. This creates a teaching moment at the highest-engagement point — right after the user succeeds.

**Backend change:** Add `on_pass: str | None = None` to `Submodule` model.

**Migration:** Missing `on_pass` = frontend shows default message.

---

#### 9.2.5 Test-Scoped Hints (`hint_on_fail` field on tests)

**Current:** When a test fails, the user sees the raw error message and has to figure out what to do.

**Proposed:**
```yaml
tests:
  - description: "Content-Type header is text/plain"
    type: http
    request:
      method: GET
      path: /style.css
    expected:
      status: 200
      headers:
        Content-Type: text/css
    timeout_ms: 3000
    hint_on_fail: >-                                          # NEW
      Revisa getMimeType — debe mapear ".css" a "text/css".
      Asegúrate de llamar SetHeader("Content-Type", ...) antes
      de WriteHeader.
```

**Frontend usage:** When this specific test fails, the TestPanel shows the `hint_on_fail` text below the expected/actual diff — targeted guidance for that exact failure mode.

**Backend change:** Add `hint_on_fail: str | None = None` to `TestSpec` model. Include in `test_failed` SSE event payload.

**Why this matters:** Currently a user who gets `expected: text/css, actual: text/html` has to go back to the spec, re-read the resource, and reason about where they went wrong. A test-scoped hint short-circuits this dead end with precisely targeted advice.

**Migration:** Missing `hint_on_fail` = test failure shows expected/actual only, no hint.

---

### 9.3 Complete YAML Example (Before and After)

#### Before:
```yaml
- id: listen
  title: "Listener TCP y accept loop"
  spec: >-
    Implementa Server.Start: abre un listener TCP en Server.Addr...
  stubs:
    - path: server.go
  tests:
    - type: script
      file: tests/tcp_listen_test.sh
      timeout_ms: 5000
  resources:
    - title: "net.Listen y TCP accept loops"
      file: tcp/server_doc.md
      type: doc
      visible_to: [junior, mid, senior]
    - title: "Signature: Server.Start"
      file: tcp/listen_signature.md
      type: signature
      visible_to: [junior, mid, senior]
    - title: "Hint: listener, accept loop y goroutines"
      file: tcp/listen_hint.md
      type: hint
      visible_to: [junior]
```

#### After:
```yaml
- id: listen
  title: "Listener TCP y accept loop"
  goal: >-
    Haz que el servidor escuche conexiones TCP entrantes y maneje
    cada una en una goroutine separada.
  spec: >-
    Implementa Server.Start: abre un listener TCP en Server.Addr...
  on_pass: >-
    Tu servidor ya acepta conexiones TCP. Cada cliente se maneja
    en su propia goroutine — así funciona la concurrencia en Go.
  stubs:
    - path: server.go
  tests:
    - description: "TCP connection accepted on :8080"
      type: script
      file: tests/tcp_listen_test.sh
      timeout_ms: 5000
      hint_on_fail: >-
        Verifica que net.Listen use exactamente s.Addr como dirección
        y que el accept loop no termine tras la primera conexión.
  resources:
    - title: "net.Listen y TCP accept loops"
      file: tcp/server_doc.md
      type: doc
      visible_to: [junior, mid, senior]
      # stage: 0 (default for type=doc)

    - title: "Signature: Server.Start"
      file: tcp/listen_signature.md
      type: signature
      visible_to: [junior, mid, senior]
      # stage: 1 (default for type=signature)

    - title: "Hint: listener, accept loop y goroutines"
      file: tcp/listen_hint.md
      type: hint
      visible_to: [junior]
      # stage: 2 (default for type=hint)
```

**5 new optional fields. Zero existing fields changed. Every existing course.yaml works without modification.**

---

### 9.4 The "Movie Script" — How Staged Resources Create a Narrative

With these YAML changes, each submodule becomes a **3-act experience**:

```
┌─────────────────────────────────────────────────────────┐
│ ACT 1: "Understand the Problem"                        │
│ ─────────────────────────────────                       │
│ Trigger: Submodule activates                           │
│                                                         │
│ ┌─ TaskBrief shows GOAL (headline)                     │
│ ├─ TaskBrief shows SPEC (expandable detail)            │
│ ├─ Stage 0 resources appear (doc, spec)                │
│ └─ Stub files auto-open in editor                      │
│                                                         │
│ User reads, understands, starts coding.                │
├─────────────────────────────────────────────────────────┤
│ ACT 2: "Try and Learn"                                 │
│ ─────────────────────                                   │
│ Trigger: First test run (Ctrl+Enter)                   │
│                                                         │
│ ┌─ TestPanel shows structured results with DESCRIPTIONS│
│ ├─ Stage 1 resources unlock (signature)                │
│ │   └─ Toast: "New resource available: Signature..."   │
│ ├─ If tests fail: HINT_ON_FAIL shows in TestPanel      │
│ └─ User iterates: edit → run → read feedback           │
│                                                         │
│ Resources progressively disclosed, not dumped.          │
├─────────────────────────────────────────────────────────┤
│ ACT 3: "Get Unstuck"                                   │
│ ───────────────────                                     │
│ Trigger: Failed test run                               │
│                                                         │
│ ┌─ Stage 2 resources unlock (hint)                     │
│ │   └─ Toast: "Hint available — check Resources"       │
│ ├─ Hint provides step-by-step implementation guide     │
│ └─ User follows hint, passes tests                     │
│                                                         │
│ Safety net prevents frustration without spoiling.       │
├─────────────────────────────────────────────────────────┤
│ ACT 4: "Celebrate and Advance"                         │
│ ──────────────────────────────                          │
│ Trigger: All tests pass                                │
│                                                         │
│ ┌─ SuccessOverlay shows ON_PASS message                │
│ ├─ Teaching moment: explain what they just built        │
│ ├─ "Continue to next task →" button                    │
│ └─ Sidebar updates: submodule checkmark animates in    │
│                                                         │
│ User feels momentum, understands the concept, moves on.│
└─────────────────────────────────────────────────────────┘
```

This is what transforms Buildmancer from "a code editor with test output" into "a guided coding course." The YAML is the script, the workspace is the stage.

---

### 9.5 SSE Event Name Fix (Bug)

**This is a bug discovered during investigation, not a new feature.**

The Go runner emits:
- `test_done` with `{index, passed: true}` on success
- `test_failed` with `{index, error, expected?, actual?}` on failure
- `test_start` with `{index, type}` before each test
- `test_output` with `{index, line}` for intermediate output
- `test_timeout` with `{index, timeout}` on timeout

The frontend listens for:
- `test_pass` — **never emitted by the runner**
- `test_fail` — **never emitted by the runner**

Tests only work currently because the `run_complete` event has a `results` array fallback in some code paths and the generic `onmessage` handler catches some events.

**Fix:** Either:
(a) Rename frontend listeners to match runner: `test_done`, `test_failed`, `test_start`, `test_output`, `test_timeout`
(b) Add event name translation in the Python stream bridge

Option (a) is simpler and keeps the proxy transparent. The frontend should also parse the `expected`/`actual` fields that the runner already sends — this data is flowing through the wire and being silently dropped.

**Files affected:**
- `frontend/src/hooks/use-test-runner.ts` — rename event listeners
- No backend changes needed (runner + bridge already send correct events)

---

### 9.6 Backend Model Changes Summary

**`course_loader/models.py`:**

```python
STAGE_DEFAULTS = {"doc": 0, "spec": 0, "signature": 1, "hint": 2}

class Resource(BaseModel):
    title: str
    file: str
    type: str
    visible_to: list[str] = []
    stage: int | None = None          # NEW — defaults from STAGE_DEFAULTS[type]

    @property
    def effective_stage(self) -> int:
        if self.stage is not None:
            return self.stage
        return STAGE_DEFAULTS.get(self.type, 0)


class TestSpec(BaseModel):
    # ... existing fields ...
    description: str | None = None    # NEW — human-readable test name
    hint_on_fail: str | None = None   # NEW — targeted guidance on failure


class Submodule(BaseModel):
    # ... existing fields ...
    goal: str | None = None           # NEW — high-level intent
    on_pass: str | None = None        # NEW — completion message
```

**`routers/resources.py`:**
```python
# Add stage to response
result.append({
    "title": res.title,
    "type": res.type,
    "content": content,
    "stage": res.effective_stage,     # NEW
})
```

**`routers/run.py`:**
```python
# Pass description and hint_on_fail through to runner
for test in submodule.tests:
    spec = test.model_dump(exclude_none=True)
    # description and hint_on_fail are automatically included
    # by model_dump if present in the YAML
    ...
```

**Go runner changes (optional, for enriched test events):**
```go
// In RunRequest/TestSpec model, add:
Description string `json:"description,omitempty"`
HintOnFail  string `json:"hint_on_fail,omitempty"`

// In each dispatcher's test_start event:
w.Send("test_start", map[string]any{
    "index":       index,
    "type":        spec.Type,
    "description": spec.Description,  // NEW
})

// In each dispatcher's test_failed event:
w.Send("test_failed", map[string]any{
    "index":        index,
    "error":        "status code mismatch",
    "expected":     spec.Expected.Status,
    "actual":       resp.StatusCode,
    "hint_on_fail": spec.HintOnFail,  // NEW
})
```

---

### 9.7 Frontend Type Changes

```typescript
// lib/types.ts additions

export interface Resource {
  title: string;
  file: string;
  type: string;
  visible_to: string[];
}

export interface ResourceContent {
  title: string;
  type: string;
  content: string;
  stage: number;              // NEW — 0, 1, 2, or 3
}

export interface TestSpec {
  type: string;
  match?: string;
  timeout_ms: number;
  description?: string;       // NEW
  hint_on_fail?: string;      // NEW
}

export interface Submodule {
  id: string;
  full_id: string;
  title: string;
  goal?: string;              // NEW
  spec: string;
  on_pass?: string;           // NEW
  stubs: StubRef[];
  tests: TestSpec[];
  resources: Resource[];
}
```

---

### 9.8 Migration Path for Existing Courses

**All changes are additive — zero migration needed for existing YAML files.**

| New Field | Default When Absent | Behavior When Absent |
|-----------|-------------------|----------------------|
| `goal` | `None` | TaskBrief derives headline from first sentence of `spec` |
| `on_pass` | `None` | SuccessOverlay shows generic "Todas las pruebas pasaron" |
| `description` (test) | `None` | TestPanel generates label from `type`+`request.method`+`request.path` |
| `hint_on_fail` (test) | `None` | Test failure shows expected/actual without extra guidance |
| `stage` (resource) | Derived from `type` | doc/spec=0, signature=1, hint=2 (matches existing convention) |

The smart defaults for `stage` mean the http-server course already follows the movie-script pattern — it just wasn't explicitly declared. After the frontend implements staged visibility, the existing resources will automatically behave correctly without touching the YAML.

Course authors who want custom staging can add explicit `stage` values. Course authors who don't care get sensible defaults for free.

---

## 10. Interaction & Micro-interaction Design

### 9.1 Submodule Transition Flow

When the user activates a new submodule (click in module list, or "Continue" after success):

1. **TaskBrief** updates with new spec text (fade-crossfade, 150ms)
2. **Files** reload — stub files for the new submodule auto-open as tabs
3. **Editor** shows the first stub file with a brief fade-in (100ms)
4. **TestPanel** clears or shows cached results for this submodule
5. **Sidebar** updates: new submodule gets active indicator, previous stays checked
6. **ContextBar** breadcrumb updates to reflect new submodule

Total transition: ~200ms, feels instant but visually coherent.

### 9.2 Test Run Flow

1. User presses `Ctrl+Enter` or clicks Run button
2. **Run button** in icon rail: ring animation starts (pulsing border)
3. **TestPanel** opens (if closed) with slide-up animation
4. **Phase 1 — Build**: "Building..." with spinner. Build output streams.
5. **Phase 2 — Tests**: "Running tests..." Each test result appears with stagger animation (60ms each)
6. **Phase 3 — Complete**:
   - All passed: panel header turns green, success badge, SuccessOverlay appears
   - Some failed: panel header turns red, failed tests expanded with details
   - Build error: panel shows compile error with monospaced output
7. **Run button** ring animation stops

### 9.3 Save Flow

1. User types in editor
2. After 1.5s pause: autosave triggers
3. **Tab dot** appears (small colored dot before filename indicating unsaved → saving)
4. On save success: dot disappears (fade, 300ms)
5. On save failure: dot turns red, toast appears: "Could not save [file]. Retrying..."
6. After 3 retries: toast becomes persistent: "Save failed. Check connection."

### 9.4 Panel Toggle Animation

- Sidebar open/close: width animates from 0 ↔ sidebarWidth over 150ms ease-out
- Test panel open/close: height animates over 200ms ease-out
- TaskBrief collapse: height animates to single-line over 150ms

---

## 11. Keyboard & Accessibility

### 10.1 Keyboard Shortcuts

| Shortcut | Action | Current | Change |
|----------|--------|---------|--------|
| `Ctrl+Enter` | Run tests | Yes | Keep |
| `Ctrl+S` | Force save | Yes | Keep |
| `Escape` | Close active overlay/panel | Yes | Keep, but prioritize: success overlay → resource tab → test panel → sidebar |
| `Ctrl+1` | Toggle modules panel | No | **Add** |
| `Ctrl+2` | Toggle files panel | No | **Add** |
| `Ctrl+3` | Toggle resources panel | No | **Add** |
| `Ctrl+B` | Toggle sidebar | No | **Add** (VS Code convention) |
| `Ctrl+J` | Toggle test panel | No | **Add** (VS Code convention) |
| `Ctrl+K` | Command palette | No | **Add** (nice-to-have) |
| `Ctrl+W` | Close active tab | No | **Add** |
| `Ctrl+Tab` | Next tab | No | **Add** |
| `Ctrl+Shift+Tab` | Previous tab | No | **Add** |

### 10.2 Accessibility Improvements

| Element | Current | Change |
|---------|---------|--------|
| Icon rail buttons | `title` only | Add `aria-label`, `role="button"` |
| Module list items | No ARIA | Add `role="treeitem"`, `aria-expanded`, `aria-selected` |
| File tree items | No ARIA | Add `role="treeitem"`, `aria-selected` |
| Test results | No ARIA | Add `role="list"`, items as `role="listitem"`, pass/fail as `aria-label` |
| Tab bar | No ARIA | Add `role="tablist"`, tabs as `role="tab"`, `aria-selected` |
| TaskBrief | N/A (new) | Add `role="region"`, `aria-label="Current task"`, collapsible with `aria-expanded` |
| ContextBar | N/A (new) | Add `role="navigation"`, `aria-label="Breadcrumb"` |
| ResizeHandle | N/A (new) | Add `role="separator"`, `aria-orientation`, keyboard resize with arrow keys |

### 10.3 Focus Management

- On submodule change: focus moves to TaskBrief (so screen readers announce the new task)
- On test completion: focus moves to test panel header
- On success overlay: focus moves to "Continue" button
- On panel toggle: focus moves to panel content
- Escape key: focus returns to editor

---

## 12. Migration Strategy

### Phase A: Foundation + SSE Bug Fix (non-breaking)

1. **Fix SSE event name mismatch** — rename frontend listeners from `test_pass`/`test_fail` to `test_done`/`test_failed` to match Go runner (this is a bug, not a feature)
2. Parse `expected`/`actual` fields from `test_failed` events (already flowing, currently dropped)
3. Add `ContextBar` component above workspace
4. Add `TaskBrief` component between ContextBar and TabBar (uses `spec`, or `goal` if present)
5. Remove spec text from `ModuleList` (it's now in TaskBrief)
6. Add `sonner` toast library and integrate with autosave errors
7. Add `ErrorBoundary` around workspace
8. Add ARIA attributes to all interactive elements
9. Add keyboard shortcuts (Ctrl+1/2/3, Ctrl+B, Ctrl+J, Ctrl+W)

**Result:** Immediate UX improvement. SSE bug fix means test failures now show actual detail. Spec is visible, errors are surfaced.

### Phase B: Test Panel + Guided Script Backend

1. Redesign `TestOutput` → `TestPanel` with structured results (shows `description`, `expected`/`actual`)
2. Add resizable height with `ResizeHandle`
3. Add test result caching per submodule
4. Add "Re-run" button inline in test panel header
5. Add success state with "Continue to next task" CTA
6. Add `SuccessOverlay` for submodule completion (uses `on_pass` if present)
7. **Backend:** Add `description`, `hint_on_fail` to `TestSpec` model
8. **Backend:** Add `goal`, `on_pass` to `Submodule` model
9. **Backend:** Add `stage` to `Resource` model with smart defaults
10. **Backend:** Pass `description`/`hint_on_fail` through to runner SSE events
11. **Backend (Go runner):** Add `Description`/`HintOnFail` to TestSpec struct, include in `test_start`/`test_failed` events

**Result:** The feedback loop becomes the motivational engine. Backend supports guided scripting even before course YAML is updated.

### Phase C: Resource Staging + Tab Integration

1. Frontend: implement staged resource visibility (track run history per submodule)
2. Frontend: toast notification when new resources unlock ("New resource: Signature...")
3. Refactor `openFiles` → `openTabs` (support both file and resource types)
4. Modify `TabBar` to render file tabs and resource tabs differently
5. Resources open as read-only editor tabs with Markdown rendering
6. Add `rehype-highlight` for code block syntax highlighting
7. Remove slide-over and split-panel resource reader modes
8. Resources listed within sidebar under active submodule (with stage-based visibility)

**Result:** Resources integrate naturally and reveal progressively — the "movie script" is live.

### Phase D: Polish

1. Add resizable sidebar with `ResizeHandle`
2. Add file relevance indicators in FileTree (highlight stubs, dim non-relevant)
3. Add editor state preservation (cursor, scroll per file)
4. Add loading skeletons
5. Add submodule transition animations
6. Add CodeMirror search/replace extension
7. Add run button pulse animation for "never run" state
8. Persist layout preferences in localStorage

**Result:** The workspace feels polished and professional.

### Phase E: Course Content Enrichment

1. Add `goal` field to all submodules in http-server course YAML
2. Add `on_pass` completion messages to all submodules
3. Add `description` to all tests in http-server course YAML
4. Add `hint_on_fail` to tests with common failure patterns
5. Add explicit `stage` overrides where smart defaults don't fit
6. Command palette (Ctrl+K)
7. Tab drag-to-reorder
8. Editor minimap

---

## Appendix: Design Token Reference

All new components should use the existing token system. No new colors needed.

```
Background layers:  bg (body) → surface (panels) → surface-hover (interactive)
Text hierarchy:     text (primary) → text-muted (secondary) → text-dim (tertiary)
Accent:             primary (red, CTAs) → primary-hover (darker red) → primary-subtle (tinted bg)
Semantic:           success (teal) → error (red) → warning (orange)
Fonts:              sans (UI) → mono (code) → serif (marketing accents only)
```

## Appendix: File Impact Summary

### Frontend Files

| File | Change Type | Phase |
|------|-------------|-------|
| `components/workspace/context-bar.tsx` | **New** | A |
| `components/workspace/task-brief.tsx` | **New** | A |
| `components/workspace/error-boundary.tsx` | **New** | A |
| `components/workspace/toast-provider.tsx` | **New** | A |
| `components/workspace/success-overlay.tsx` | **New** | B |
| `components/workspace/test-panel.tsx` | **New** (replaces test-output.tsx) | B |
| `components/workspace/resize-handle.tsx` | **New** | B |
| `components/workspace/command-palette.tsx` | **New** | E |
| `components/workspace/workspace-provider.tsx` | **Modified** (state shape + run history) | A-C |
| `components/workspace/icon-rail.tsx` | **Modified** (remove logo, add ARIA) | A |
| `components/workspace/module-list.tsx` | **Modified** (remove spec, add indicators) | A |
| `components/workspace/file-tree.tsx` | **Modified** (stub highlighting) | D |
| `components/workspace/tab-bar.tsx` | **Modified** (tab types, indicators) | C |
| `components/workspace/editor.tsx` | **Modified** (state preservation, extensions) | D |
| `components/workspace/panel.tsx` | **Modified** (resizable, staged resources) | C-D |
| `components/workspace/resource-reader.tsx` | **Removed** (replaced by tab-based resources) | C |
| `components/workspace/test-output.tsx` | **Removed** (replaced by test-panel.tsx) | B |
| `app/(platform)/workspace/[courseId]/[lang]/page.tsx` | **Modified** (add ContextBar, ErrorBoundary) | A |
| `app/(platform)/workspace/[courseId]/[lang]/workspace-main.tsx` | **Modified** (add TaskBrief, new layout) | A |
| `hooks/use-autosave.ts` | **Modified** (toast on error, unsaved tracking) | A |
| `hooks/use-test-runner.ts` | **Modified** (fix event names, parse expected/actual, caching) | A-B |
| `hooks/use-resources.ts` | **Modified** (staged visibility, tab-based opening) | C |
| `lib/types.ts` | **Modified** (OpenTab, enriched test/submodule/resource types) | A-C |
| `app/globals.css` | **Modified** (new animations) | A-D |
| `package.json` | **Modified** (add `sonner`, `rehype-highlight`) | A, C |

### Backend Files (Python API)

| File | Change Type | Phase |
|------|-------------|-------|
| `backend/api/course_loader/models.py` | **Modified** (add `goal`, `on_pass`, `stage`, `description`, `hint_on_fail`) | B |
| `backend/api/routers/resources.py` | **Modified** (include `stage` in response) | B |
| `backend/api/routers/run.py` | **Modified** (pass `description`/`hint_on_fail` to runner) | B |

### Backend Files (Go Runner)

| File | Change Type | Phase |
|------|-------------|-------|
| `backend/runner/internal/models/request.go` | **Modified** (add `Description`, `HintOnFail` to TestSpec) | B |
| `backend/runner/internal/dispatch/http.go` | **Modified** (include description/hint in events) | B |
| `backend/runner/internal/dispatch/script.go` | **Modified** (include description/hint in events) | B |
| `backend/runner/internal/dispatch/unit.go` | **Modified** (include description/hint in events) | B |
| `backend/runner/internal/dispatch/stdout.go` | **Modified** (include description/hint in events) | B |
| `backend/runner/internal/dispatch/tcp.go` | **Modified** (include description/hint in events) | B |

### Course Content Files

| File | Change Type | Phase |
|------|-------------|-------|
| `_courses/http-server/go/course.yaml` | **Modified** (add goal, on_pass, description, hint_on_fail) | E |
| `_courses/*/go/course.yaml` | **Modified** (same enrichment for future courses) | E |
