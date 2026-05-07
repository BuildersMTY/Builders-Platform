# Buildmancer Mock Data — Rescued Ideas

> **Purpose:** This document preserves every concept, data structure, and UX pattern found in the frontend v2 mock data before it is replaced with real APIs.
> **Sources:** `courses/data.ts`, `tracks/tracks-app.tsx`, `practice/practice-app.tsx`, `builds/builds-app.tsx`, `dashboard/dashboard-view.tsx`, `workspace-v2/data.ts`

---

## 1. Course Catalog Ideas

### 1.1 The Four Tracks

Courses are grouped into **tracks** — curated verticals that each represent a "trade." The mock catalog defines four tracks:

| Track | Subtitle | Courses |
|-------|----------|---------|
| **Systems** | How the machine actually works | HTTP Server, Unix Shell, TCP/IP, malloc, Containers |
| **Data** | Storage engines, indexes, query planners | SQLite clone, Log engine, Query planner, Redis clone |
| **Networking** | Protocols, packets, the fabric | DNS Resolver, BitTorrent, WebSockets |
| **Languages** | Interpreters, compilers, type systems | Lisp, Monkey interpreter, WASM VM |

### 1.2 Every Project Title & Concept

#### Systems Track
1. **HTTP Server from Scratch** (Go, 32h, intermediate) — Build a working HTTP/1.1 server: listener, request parsing, headers, routing, concurrency, graceful shutdown.
2. **Build a Unix Shell** (C, 40h, intermediate) — Fork/exec, pipes, redirection, signal handling, job control, process groups.
3. **TCP/IP from the wire up** (Rust, 58h, advanced) — Raw sockets, packet crafting, retransmission, congestion control.
4. **Write your own malloc** (C, 18h, intermediate) — Memory arenas, free lists, coalescing, alignment, sbrk/mmap.
5. **Containers without Docker** (Go, 24h, advanced) — Namespaces, cgroups, pivot_root, overlayfs, minimal container runtime.

#### Data Track
6. **SQLite, from B-tree up** (Rust, 60h, advanced) — B-trees, pager, WAL, SQL parser, query planner, indexes.
7. **Append-only log engine** (Go, 28h, intermediate) — Segmented logs, compaction, checksums, sequential I/O optimization.
8. **A toy query planner** (Python, 16h, beginner) — Parse SELECT, build a cost model, choose indexes, output a query plan.
9. **A Redis-compatible cache** (Go, 32h, intermediate) — RESP protocol, hash map, LRU eviction, RDB snapshots, TTLs.

#### Networking Track
10. **DNS Resolver in 200 lines** (Python, 9h, beginner) — UDP sockets, DNS wire format, root nameservers, CNAME chains, recursion.
11. **BitTorrent client** (Go, 40h, advanced) — .torrent parsing, peer wire protocol, piece selection, DHT.
12. **WebSockets, RFC 6455** (Rust, 22h, intermediate) — Handshake, frame parsing, masking, ping/pong, close codes.

#### Languages Track
13. **Write a Lisp in a weekend** (Python, 12h, beginner) — Lexer, parser, tree-walking evaluator, closures, quote, tiny macros.
14. **Tree-walking interpreter** (Go, 36h, intermediate) — Pratt parser, AST evaluation, environments, functions, error handling.
15. **A WASM VM** (Rust, 64h, advanced) — Decode WASM binary, stack machine, validation, execution, memory model.

### 1.3 Course Metadata Model

Each course carries:
- `id` — URL slug
- `title` — human name
- `lang` / `lang_label` — implementation language
- `hours` — estimated total time
- `level` — `beginner` | `intermediate` | `advanced`
- `builds` — how many users have shipped it (social proof)
- `enrolled` / `completed` — user state flags

**Idea:** `builds` count is powerful social proof. Should be a real metric computed from the `builds` table.

---

## 2. Track & Certificate System

### 2.1 Track Metadata (`TRACK_META`)

Each track has rich positioning copy:

| Track | Tagline | Cert Title | Required Courses |
|-------|---------|------------|------------------|
| Systems | How the machine actually works. | Systems Engineer | 4 |
| Data | Storage engines, indexes, query planners. | Data Engineer | 3 |
| Networking | Protocols, packets, the fabric. | Network Engineer | 3 |
| Languages | Interpreters, compilers, type systems. | Language Designer | 3 |

### 2.2 Skill Taxonomies per Track

Each track exposes 6 named skills — these are **not** course-level; they are track-level competencies a learner will develop:

- **Systems:** Manual memory management, Concurrency primitives, Syscalls & ABIs, Signal handling, File descriptors, Binary protocols
- **Data:** B-tree & LSM trees, Append-only logs, Query parsing, Cost-based planning, Transactions & MVCC, Indexes
- **Networking:** UDP & TCP sockets, Protocol state machines, Binary parsing, RFC comprehension, Retransmission & congestion, Encryption basics
- **Languages:** Lexing & parsing, AST walking, Bytecode VMs, Type checking, Garbage collection, JIT basics

**Idea:** These skills can be used for:
- Filtering courses/drills
- Resume/CV generation from completed tracks
- Job-matching ("Show me users with 3+ Systems skills")
- Drill-to-skill mapping (each drill tags which skills it exercises)

### 2.3 Certificate Mechanics

- Ship N courses in a track to earn the certificate.
- Progress shown as segmented bar: `shipped / required` with glow effects on completed segments.
- Certificate name = `cert_title` (e.g., "Systems Engineer").

**Idea:** Certificates should be shareable (social cards, LinkedIn). The mock has a "Share certificate" button in the build detail drawer.

### 2.4 Tiered Difficulty within a Track

Courses within a track are visually split into three tiers:
- **Foundations** (beginner)
- **Core** (intermediate)
- **Mastery** (advanced)

This creates a natural progression path even within a single track. The UI shows numbered steps with connector lines between courses.

---

## 3. Practice & Drills

### 3.1 The Daily Drill

- **Date-keyed:** `daily-2026-04-24` — one unique drill per day, same for all users.
- **Tied to a course:** The daily drill strengthens concepts from a specific course (e.g., "Parse a Content-Length header" → HTTP Server).
- **Metadata:** difficulty, estimated minutes, language, skills, player count, average solve time, user's best time.
- **Prompt preview:** Ghost code preview (faint comments + stub) to tease the problem without giving it away.

**Daily drill example:**
- Title: "Implement a token bucket rate limiter"
- Tagline: "Small, mean, and seen in every production API."
- Difficulty: medium, 18 min, Go
- Skills: concurrency, timers, sync.Mutex
- Players today: 1,842
- Average time: 14m 22s

### 3.2 Drill Categories

| Category | Count | Description |
|----------|-------|-------------|
| All drills | 247 | Complete archive |
| Strings & parsing | 52 | Text manipulation, format parsing |
| Concurrency | 38 | Locks, channels, race conditions |
| Bit twiddling | 29 | Low-level binary operations |
| Trees & graphs | 41 | Data structures, traversals |
| I/O & syscalls | 34 | File descriptors, networking basics |
| Numerics | 27 | Math, fixed-point, hashing |
| Protocol parsing | 26 | Wire formats, state machines |

### 3.3 Individual Drill Archive

Each drill has:
- `id`, `title`, `category`
- `lang` / `lang_label`
- `difficulty`: easy | medium | hard
- `minutes`: estimated time
- `done`: whether user has solved it
- `solved_pct`: global solve rate (0.18–0.89 in mock)
- `daily?`: whether it's today's featured drill

**Mock drill titles worth preserving:**
- Decode a UTF-8 code point (Rust, easy, 6m, 89% solve)
- Ring buffer with resize (C, medium, 12m, 61% solve)
- Parse an IPv4 address without regex (Go, easy, 8m, 82% solve)
- Token bucket rate limiter (Go, medium, 18m, 54% solve) — *daily*
- popcount without builtins (C, easy, 7m, 73% solve)
- Skip list insert (Rust, hard, 35m, 24% solve)
- select() over N file descriptors (C, medium, 22m, 41% solve)
- TCP retransmission timer (Go, hard, 40m, 18% solve)
- Varint encode/decode (Rust, medium, 15m, 58% solve)
- Fixed-point square root (C, medium, 20m, 37% solve)
- LRU cache (Go, medium, 20m, 68% solve)
- CRC32 without tables (Rust, hard, 28m, 29% solve)

### 3.4 Streak System

- **30-day visual calendar:** Horizontal bar of 30 squares, color-coded by intensity (0 = gray, 1 = light red, 2+ = bright red with glow).
- **Current streak:** Computed from trailing non-zero days.
- **Longest streak:** Best historical run.
- **Today indicator:** Border highlight + "TODAY" label below the square.

### 3.5 Leaderboard

- Weekly leaderboard (not all-time — resets to encourage participation).
- Columns: rank, handle, drills solved this week, current streak.
- Top 3 get highlighted in primary color.
- "You" row highlighted with primary background + left border.

**Mock handles (fun, on-brand):**
- serial_clam, heap_underflow, segfault_sally, big_o_nothing, kern_el_panic

### 3.6 Badges / Achievements

- "Metronome" badge for 14-day streak.
- Progress bar showing progress toward next badge.
- Mock shows: 12/14 days, 2 to go.

---

## 4. Build Portfolio

### 4.1 What Is a Build?

A **Build** is a portfolio artifact auto-generated when a user completes a course. It immortalizes the shipped project with:
- Title, slug, course name, track
- Language
- Ship date + days-ago
- Lines of code
- Test count + pass rate
- Git-like short hash (e.g., `a3f91c2`)
- Hours spent
- Blurb / one-liner description
- **Grade:** A+, A, A-, B+
- **Code highlight:** Syntax-tinted snippet showcasing the best part
- **Skills demonstrated:** Tags extracted from the course
- README link
- `featured` flag (some builds span 2 columns in gallery view)

### 4.2 Build Portfolio Items (Mock)

1. **DNS Resolver in 200 lines** (Python, A, 247 LOC, 34 tests, 11h)
   - Blurb: "Walked the root nameservers, parsed DNS wire format by hand, handled CNAME chains. No dnspython."
   - Skills: UDP sockets, struct.pack/unpack, DNS wire format, recursion
   - Highlight: `parse_header()` with `struct.unpack("!HHHHHH", data[:12])`

2. **Markov chain name generator** (Go, A-, 312 LOC, 18 tests, 14h)
   - Blurb: "Trigram Markov chain trained on 12k Old Norse names. Generates plausible but fake Viking identities."
   - Skills: string algorithms, weighted sampling, maps, runes
   - Highlight: `Chain.Generate()` with rune sliding window

3. **FizzBuzz in assembly** (asm, A, 68 LOC, 5 tests, 4h)
   - Blurb: "x86-64 System V, direct syscalls, zero libc. Because sometimes you need to remind yourself that printf isn't free."
   - Skills: x86-64, syscalls, division, branching
   - Highlight: `_start:` loop with `div rbx`

4. **redis-lite** (Rust, A+, 1,842 LOC, 89 tests, 58h) — **featured**
   - Blurb: "A surprising amount of Redis fits in under 2k lines. RESP parser, hash map, LRU eviction, RDB dump/load."
   - Skills: RESP protocol, TCP servers, async I/O, binary formats
   - Highlight: `parse_resp()` match on RESP type prefixes

5. **A Lisp in a weekend** (Python, A, 421 LOC, 62 tests, 9h)
   - Blurb: "Lexer, parser, tree-walking evaluator. Tail-call optimized. Supports closures, quote, and tiny macros."
   - Skills: recursion, AST, closures, tail calls
   - Highlight: `eval()` dispatch on symbols, lists, quote, if, lambda

6. **LSM-tree key-value store** (Go, A, 2,104 LOC, 116 tests, 72h) — **featured**
   - Blurb: "Memtable + SSTables + bloom filters + leveled compaction. Wrote it once, then re-wrote it after reading the LevelDB paper properly."
   - Skills: B-trees, WAL, bloom filters, compaction
   - Highlight: `LSM.Put()` with WAL append + memtable flush threshold

### 4.3 Grading System

Mock grades: A+, A, A-, B+ (no lower grades shown — implies retry loop below B+)

**Grade computation (from v2 architecture plan, noted in CLAUDE.md):**
- 70% correctness (hidden tests)
- 20% efficiency (vs reference solution percentile)
- 10% craft (LOC + cyclomatic complexity)
- Letter grade A+ → C, <70 = retry

**Idea:** Grade should be computed server-side after hidden tests run. Reference solutions per-language benchmarked in CI → stored in `reference_metrics` table.

### 4.4 Portfolio Views

- **Gallery view:** Grid of cards, featured builds span 2 columns. Each card shows: lang badge, track, title, blurb, code preview, LOC/tests/hours, grade chip, ship date.
- **Timeline view:** Grouped by month/year, list format with horizontal rules between groups.
- **Detail drawer:** Slides in from right. Shows full metadata, expanded code highlight, skills, actions (Open in workspace, Read README, Share certificate). Closes with Escape key or backdrop click.

### 4.5 Portfolio Stats Header

Aggregate stats across all builds:
- Shipped count + "across N tracks"
- Total lines of code
- Total tests passing
- Hours spent + "~Xh / build" average
- Average grade (computed from grade map: A+ = 4.3, A = 4.0, A- = 3.7, B+ = 3.3)

### 4.6 Filtering & Sorting

- Filter by track (pill buttons)
- Sort by: Most recent, Largest (LOC), Best graded
- Search by title, blurb, track, or language

---

## 5. Dashboard & Activity

### 5.1 Dashboard Layout Concepts

The dashboard prototype uses a rich multi-section layout:

**Hero Row:** Active project takeover — large card with course title, module, progress bar, test counters, and a **live file preview** showing the exact file the user was last editing (with unsaved indicator and failing test toast).

**Triple Column:**
- Today's drill (compact card with skills + start button)
- Activity stream (scrolling feed of last 7 days)
- Milestone tracker (certificate progress with animated active segment)

**Course Grid:** Enrolled course cards (4 columns) with:
- Lang badge + level
- Title (serif italic)
- Next task + module
- Progress bar (gradient for active, muted for inactive)
- Submodule count + hours spent / total
- "New project" placeholder card with dashed border

**Bottom Row:**
- Activity heatmap (180 days, GitHub-style)
- Streak callout ("9 days in a row" with motivational copy)

### 5.2 Activity Stream

Rich event log with typed entries:

| `kind` | Dot Color | Label | Example |
|--------|-----------|-------|---------|
| `test_pass` | success green | pass | "Passed: Content-Length header is present" |
| `test_fail` | error red | fail | "Test failed: Content-Type maps .css to text/css" |
| `sub_done` | primary red | done | "Completed: Parse headers" |
| `module` | info blue | unlock | "Module unlocked: Process control" |
| `resource` | muted gray | read | "Read: HTTP/1.1 response format" |
| `build` | warning orange | ship | "Shipped: DNS Resolver in 200 lines" |

Each entry: timestamp (`when`), kind badge, description text, course name.

**Idea:** The `when` field uses fuzzy time ("just now", "12m", "2h", "yesterday", "2d"). Should be computed client-side from ISO timestamps.

### 5.3 Activity Heatmap

- **182 days** (~6 months) of activity data.
- Each day = 11×11px square, arranged in a flex-wrap grid.
- Color intensity: 5 buckets from gray → bright red with glow at highest intensity.
- Legend: "less → more" with sample squares.
- Header shows: total commits across active days.
- Weekend/weekday pattern modeled in mock generation (weekends more active).
- Recent days boosted to show momentum.

**Idea:** The heatmap data should come from `user_activity_summary` (denormalized table updated synchronously after each commit, per v2 architecture).

### 5.4 User Stats

- `handle` — username (lowercase)
- `display` — display name
- `joined_days` — days since registration
- `timezone` — for scheduling daily drills
- `active_days` — days active out of last 14 (shown as "You've built for 9 of the last 14 days")

---

## 6. Workspace Session Model

### 6.1 Course Structure

Courses decompose into **modules** → **submodules**:

```
HTTP Server from Scratch
├── TCP foundations
│   ├── Listener & accept loop      [passed]
│   └── Connection handler          [passed]
├── HTTP parsing
│   ├── Parse the request line      [passed]
│   ├── Parse headers               [passed]
│   └── Write the response          [active] ← current
├── Routing & handlers
│   ├── ServeMux + path matching    [locked]
│   └── Middleware chain            [locked]
└── Concurrency & timeouts
    ├── Goroutine pool              [locked]
    ├── Read/write timeouts         [locked]
    └── Graceful shutdown           [locked]
```

Each submodule has:
- `id` / `full_id` (e.g., `http/response`)
- `title`
- `passed`: boolean
- `active`: boolean (exactly one at a time)
- `goal`: one-sentence learning objective
- `spec`: detailed implementation requirements
- `stubs`: files to create with line counts
- `tests`: test cases with status
- `resources`: unlockable hints/docs

### 6.2 Test Results with Byte Diffs

Tests have rich failure reporting:

```
Test: Content-Type maps .css to text/css
Status: fail
Duration: 14ms
Expected: "text/css"
Actual:   "text/html"
Expected bytes: "HTTP/1.1 200 OK\r\nContent-Type: text/css\r\n..."
Actual bytes:   "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n..."
Hint: "Check getMimeType — it should map the '.css' extension..."
```

**Idea:** Byte-level diff is crucial for protocol/binary courses. The `expectedBytes` / `actualBytes` fields should support raw output display with hex mode toggle.

### 6.3 File Tree

Workspace shows a project file tree:
- File path, size in bytes
- `stub` flag — auto-generated starter file
- `modified` flag — user has edited it

Example tree for HTTP Server:
```
cmd/server/main.go    412 B
http/request.go      1240 B
http/headers.go       680 B
http/response.go     1850 B  [stub] [modified]
http/status.go        460 B  [stub]
http/mime.go          310 B
router/mux.go         900 B
server/server.go     1120 B
go.mod                 68 B
README.md             240 B
```

### 6.4 Resources (Unlockable Hints)

Resources unlock as the user progresses through a submodule:
- Stage 0: Available immediately (e.g., "HTTP/1.1 response format" doc)
- Stage 1: Available after first attempt (e.g., "bufio.Writer signature")
- Stage 2: Available after first failure (e.g., "Hint — status line formatting")

Types: `doc`, `signature`, `hint`

**Idea:** This is a pedagogy pattern — scaffolded help that appears when needed, not all at once. Prevents overwhelming beginners while preventing getting permanently stuck.

### 6.5 Live File Preview

The dashboard shows a **ghost preview** of the file the user is currently editing:
- Syntax-highlighted lines
- Faint vs. bold distinction for context vs. active code
- Line numbers
- "Unsaved" indicator
- Animated caret at cursor position
- Failing test toast overlay in bottom-right

---

## 7. Data Model Sketch

Based on the mock data structures, here is the entity-relationship sketch for the real backend:

### 7.1 Core Entities

```
User
  id, handle, display_name, timezone, created_at
  active_days_last_14 (denormalized, or computed)

Session / Auth
  token, user_id, expires_at, created_at

Track
  id, title, subtitle, tagline, blurb
  cert_title, cert_required_courses
  glyph_color, icon_name
  skills[] (array of strings)

Course
  id, title, track_id, language, level
  estimated_hours, description
  builds_count (denormalized)
  skills[] (array of strings)

Module
  id, course_id, title, sort_order

Submodule
  id, module_id, full_id, title, sort_order
  goal, spec (markdown)
  stubs[] → { path, lines }

Enrollment
  user_id, course_id, enrolled_at
  modules_done, submodules_done, submodules_total
  hours_spent, total_hours
  completed, completed_at
  active_submodule_id
  progress_pct (computed)

Build
  id, user_id, course_id, enrollment_id
  title, slug, track, language
  shipped_at, lines, tests, pass_rate
  hash (short git-like), duration_hours
  blurb, grade, featured
  readme_path
  highlight_code[] → { text, kind }
  skills[] (denormalized from course)

Drill
  id, title, category, language
  difficulty, minutes, solved_pct
  skills[], prompt_lines[]
  tied_course_id (optional)
  daily_date (optional, for date-keyed daily)

DrillAttempt
  user_id, drill_id, started_at, completed_at
  passed, time_spent_seconds

DrillCategory
  id, label, sort_order

ActivityEvent
  user_id, course_id, kind, text, created_at
  // test_pass, test_fail, sub_done, module, resource, build

UserActivitySummary
  user_id, date, events_count, drills_count, builds_count
  // denormalized daily rollup for heatmap

Badge / Achievement
  id, title, description, icon
  requirement_type, requirement_value

UserBadge
  user_id, badge_id, earned_at, progress

LeaderboardEntry
  period_start, period_end, user_id
  drills_solved, current_streak, rank
```

### 7.2 Key Relationships

- **Track → Course** (1:N)
- **Course → Module → Submodule** (1:N:N)
- **User → Enrollment → Course** (M:N via Enrollment)
- **User → Build → Course** (1:N:1 — a build belongs to one enrollment)
- **User → DrillAttempt → Drill** (M:N via DrillAttempt)
- **Course → Drill** (1:N, drills can strengthen specific courses)
- **Submodule → Resource** (1:N, staged unlock)
- **Submodule → Test** (1:N, tests with expected/actual bytes)

### 7.3 Denormalization Opportunities

Per the v2 architecture plan:
- `user_activity_summary` — single-row read per dashboard request
- `course.builds_count` — updated when a build is shipped
- `enrollment.progress_pct` — updated on each submodule completion
- `drill.solved_pct` — updated after each attempt

---

## 8. UI Patterns Worth Keeping

### 8.1 Visual System

- **Dark theme:** Background `#131111`, primary red `#ff0000`, white text
- **Typography hierarchy:**
  - Serif italic for headings (elegant, editorial)
  - Sans-serif for UI chrome
  - Monospace for data, stats, code, badges
- **Color-coded languages:** Go = teal, Rust = orange, Python = yellow, C = blue, asm = purple
- **LangBadge component:** Dot + label in a subtle bordered pill with glow
- **Ambient glow:** Fixed-position radial gradient that drifts (CSS animation) — adds atmosphere without distraction

### 8.2 Navigation Patterns

- **Sticky top nav:** Logo + 4 tabs (Courses, Tracks, Practice, Builds) + search + profile
- **Active tab indicator:** Thin primary-colored underline with glow shadow
- **Search bar:** Inline with ⌘K shortcut hint, dark input with border
- **Profile chip:** Initial in gradient square + display name + chevron

### 8.3 Progress & Status Indicators

- **Progress ring:** SVG circle with stroke-dashoffset animation (used in track course list)
- **Segmented progress bar:** Individual segments for certificate progress; completed segments glow
- **Linear progress bar:** Gradient from primary to lighter red with glow shadow; active courses get the gradient, inactive get muted gray
- **Status chips:** `active` badge with pulsing dot, `solved` badge with checkmark
- **Grade chip:** Square bordered box with color-coded border (success for A-range, warning for B+)

### 8.4 Layout Patterns

- **Two-column track layout:** Left sidebar (track list, sticky) + right detail panel
- **Three-column dashboard:** Equal-weight columns for drill, activity, milestone
- **Hero + grid:** Large active-project card above, course cards below in responsive grid
- **Gallery grid:** 2-column masonry-like grid for builds; featured items span 2 columns
- **Sticky sidebar + scrollable content:** Category sidebar stays pinned while drill list scrolls

### 8.5 Interaction Patterns

- **Hover lift:** Cards translate Y -1px or -2px on hover with border brightening
- **Drawer/sheet:** Build detail slides in from right with backdrop blur + fade
- **Keyboard support:** Escape to close drawers
- **Faint/ghost text:** Comments and boilerplate shown at reduced opacity to focus attention on active code
- **Code fade:** Gradient overlay at bottom of truncated code blocks
- **Animated caret:** Blinking block cursor in file preview to simulate live editing

### 8.6 Data Visualization Patterns

- **Activity heatmap:** Small squares in flex-wrap grid, 5 intensity levels, glow at peak
- **Streak calendar:** Horizontal bar of 30 days, today highlighted with border + label
- **Solve rate bar:** 2px horizontal bar under each drill card, color-coded by difficulty
- **Stats header:** Large serif italic number + small uppercase mono label + optional subtext

### 8.7 Microcopy & Voice

- **Editorial tone:** "Pick up where the wire-format headers meet the body."
- **Playful handles:** segfault_sally, heap_underflow
- **Action verbs:** Ship, build, sharpen, resume, continue
- **Time formatting:** Fuzzy relative time ("12m", "2h", "yesterday", "2d")
- **One-line blurbs:** Every build has a memorable one-liner (e.g., "Because sometimes you need to remind yourself that printf isn't free.")

### 8.8 Empty / Placeholder States

- **New project card:** Dashed border, lightning icon, "New project" — invites creation
- **No results:** Italic serif text in center of grid: "No drills match these filters."
- **No builds:** "No builds match these filters." with generous padding

---

## Appendix: Language Color Mapping

| Language | Hex | Usage |
|----------|-----|-------|
| Go | `#7ed5d0` | Teal — LangBadge, track glyph |
| Rust | `#ff9861` | Orange — LangBadge, track glyph |
| Python | `#f5d86a` | Yellow — LangBadge |
| C | `#9bb7ff` | Blue — LangBadge |
| asm | `#c9a4ff` | Purple — LangBadge |

Track glyph colors match the language colors of their flagship courses:
- Systems = Go teal
- Data = Rust orange
- Networking = Blue
- Languages = Purple

---

*End of rescued ideas. Build on these.*
