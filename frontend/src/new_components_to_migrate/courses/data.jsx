/* Courses dashboard data — Buildmancer */

const USER = {
  handle: "avery",
  display: "Avery",
  joined_days: 42,
  timezone: "PT",
  active_days: 9, // out of last 14
};

/* The course you're currently mid-build on — threads back to Workspace.html */
const ACTIVE = {
  course_id: "http-server",
  course_title: "HTTP Server from Scratch",
  lang: "go",
  lang_label: "Go",
  module_title: "HTTP parsing",
  sub_title: "Write the response",
  sub_id: "http/response",
  last_session_ago: "12 min",
  passed_today: 4,
  tests_pass: 4,
  tests_fail: 1,
  tests_total: 5,
  lines_today: 127,
  progress_pct: 0.48,
  progress_label: "6 / 12 submodules",
  // tiny ghost-preview of the file they're in
  file_preview_lines: [
    { text: "func (r *Response) Write(w io.Writer) error {", faint: false },
    { text: "\tbw := bufio.NewWriter(w)", faint: false },
    { text: "", faint: true },
    { text: "\t// 1. Status line", faint: true },
    { text: "\tfmt.Fprintf(bw, \"HTTP/1.1 %d %s\\r\\n\", …)", faint: false },
    { text: "\t…", faint: true },
  ],
};

/* Courses you're enrolled in (beyond the active one) */
const ENROLLED = [
  {
    id: "http-server",
    title: "HTTP Server from Scratch",
    lang: "go",
    lang_label: "Go",
    level: "intermediate",
    modules_total: 4,
    modules_done: 2,
    submodules_total: 12,
    submodules_done: 6,
    progress_pct: 0.48,
    next_task: "Write the response",
    next_module: "HTTP parsing",
    streak_mention: false,
    active: true,
    hours_spent: 14,
    total_hours: 32,
  },
  {
    id: "unix-shell",
    title: "Build a Unix Shell",
    lang: "c",
    lang_label: "C",
    level: "intermediate",
    modules_total: 5,
    modules_done: 3,
    submodules_total: 18,
    submodules_done: 11,
    progress_pct: 0.61,
    next_task: "Signal handling (SIGINT)",
    next_module: "Process control",
    hours_spent: 21,
    total_hours: 40,
  },
  {
    id: "sqlite-clone",
    title: "SQLite, from B-tree up",
    lang: "rust",
    lang_label: "Rust",
    level: "advanced",
    modules_total: 6,
    modules_done: 1,
    submodules_total: 24,
    submodules_done: 3,
    progress_pct: 0.12,
    next_task: "Parser: SELECT statement",
    next_module: "Tokenizer & parser",
    hours_spent: 6,
    total_hours: 60,
  },
  {
    id: "dns-resolver",
    title: "DNS Resolver in 200 lines",
    lang: "python",
    lang_label: "Python",
    level: "beginner",
    modules_total: 3,
    modules_done: 3,
    submodules_total: 9,
    submodules_done: 9,
    progress_pct: 1.0,
    next_task: null,
    next_module: null,
    completed: true,
    hours_spent: 9,
    total_hours: 9,
    completed_on: "Mar 14",
  },
];

/* The full catalog, grouped by track */
const TRACKS = [
  {
    id: "systems",
    title: "Systems",
    subtitle: "How the machine actually works",
    courses: [
      { id: "http-server", title: "HTTP Server from Scratch", lang: "go", lang_label: "Go", hours: 32, level: "intermediate", enrolled: true, builds: 3842 },
      { id: "unix-shell", title: "Build a Unix Shell", lang: "c", lang_label: "C", hours: 40, level: "intermediate", enrolled: true, builds: 2156 },
      { id: "tcp-stack", title: "TCP/IP from the wire up", lang: "rust", lang_label: "Rust", hours: 58, level: "advanced", builds: 891 },
      { id: "malloc", title: "Write your own malloc", lang: "c", lang_label: "C", hours: 18, level: "intermediate", builds: 1204 },
      { id: "docker", title: "Containers without Docker", lang: "go", lang_label: "Go", hours: 24, level: "advanced", builds: 612 },
    ],
  },
  {
    id: "data",
    title: "Data",
    subtitle: "Storage engines, indexes, query planners",
    courses: [
      { id: "sqlite-clone", title: "SQLite, from B-tree up", lang: "rust", lang_label: "Rust", hours: 60, level: "advanced", enrolled: true, builds: 524 },
      { id: "log-engine", title: "Append-only log engine", lang: "go", lang_label: "Go", hours: 28, level: "intermediate", builds: 1188 },
      { id: "query-planner", title: "A toy query planner", lang: "python", lang_label: "Python", hours: 16, level: "beginner", builds: 944 },
      { id: "redis-clone", title: "A Redis-compatible cache", lang: "go", lang_label: "Go", hours: 32, level: "intermediate", builds: 2771 },
    ],
  },
  {
    id: "networking",
    title: "Networking",
    subtitle: "Protocols, packets, the fabric",
    courses: [
      { id: "dns-resolver", title: "DNS Resolver in 200 lines", lang: "python", lang_label: "Python", hours: 9, level: "beginner", enrolled: true, completed: true, builds: 4210 },
      { id: "torrent", title: "BitTorrent client", lang: "go", lang_label: "Go", hours: 40, level: "advanced", builds: 738 },
      { id: "websocket", title: "WebSockets, RFC 6455", lang: "rust", lang_label: "Rust", hours: 22, level: "intermediate", builds: 1402 },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    subtitle: "Interpreters, compilers, type systems",
    courses: [
      { id: "lisp", title: "Write a Lisp in a weekend", lang: "python", lang_label: "Python", hours: 12, level: "beginner", builds: 3998 },
      { id: "monkey", title: "Tree-walking interpreter", lang: "go", lang_label: "Go", hours: 36, level: "intermediate", builds: 1721 },
      { id: "wasm", title: "A WASM VM", lang: "rust", lang_label: "Rust", hours: 64, level: "advanced", builds: 342 },
    ],
  },
];

/* Today's recommended short practice — a single drill */
const TODAY_DRILL = {
  title: "Parse a Content-Length header",
  est_minutes: 8,
  skills: ["strings.SplitN", "strconv.Atoi", "error wrapping"],
  tied_to: "HTTP Server from Scratch",
};

/* Activity stream — last 7 days */
const ACTIVITY = [
  { when: "just now", kind: "test_fail",  text: "Test failed: Content-Type maps .css to text/css",     course: "HTTP Server from Scratch" },
  { when: "12m",      kind: "test_pass",  text: "Passed: Content-Length header is present",            course: "HTTP Server from Scratch" },
  { when: "14m",      kind: "test_pass",  text: "Passed: GET / returns 200 with status line",          course: "HTTP Server from Scratch" },
  { when: "2h",       kind: "sub_done",   text: "Completed: Parse headers",                            course: "HTTP Server from Scratch" },
  { when: "yesterday",kind: "sub_done",   text: "Completed: Parse the request line",                   course: "HTTP Server from Scratch" },
  { when: "yesterday",kind: "resource",   text: "Read: HTTP/1.1 response format",                       course: "HTTP Server from Scratch" },
  { when: "2d",       kind: "sub_done",   text: "Completed: Signal handling (setup)",                  course: "Build a Unix Shell" },
  { when: "3d",       kind: "module",     text: "Module unlocked: Process control",                    course: "Build a Unix Shell" },
  { when: "4d",       kind: "build",      text: "Shipped: DNS Resolver in 200 lines",                  course: "DNS Resolver in 200 lines" },
  { when: "6d",       kind: "sub_done",   text: "Completed: Query A record over UDP",                  course: "DNS Resolver in 200 lines" },
];

/* Builds shipped — certificate-like list */
const BUILDS = [
  { title: "DNS Resolver in 200 lines", lang: "python", shipped_on: "Mar 14", lines: 247, tests: 34, hash: "a3f91c2" },
  { title: "FizzBuzz in assembly",       lang: "asm",    shipped_on: "Feb 02", lines: 68,  tests: 5,  hash: "8e2d401" },
  { title: "Markov chain name generator", lang: "go",    shipped_on: "Jan 19", lines: 312, tests: 18, hash: "c11b7a9" },
];

/* Milestones toward a track certificate */
const MILESTONE = {
  track: "Systems",
  required: 4,
  completed: 1, // only DNS? no that's networking. systems: none complete yet
  next_course: "HTTP Server from Scratch",
};

/* Activity heatmap — ~180 days of "builds per day", newest last */
const ACTIVITY_HEATMAP = (() => {
  // Generate a plausible-looking ~6 month pattern
  const rand = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
  const r = rand(42);
  const days = 182;
  const arr = [];
  for (let i = 0; i < days; i++) {
    const day = (i + 6) % 7; // approx day-of-week
    const isWeekend = day === 0 || day === 6;
    const recency = i / days; // newer = more active
    const base = 0.25 + recency * 0.45;
    const v = r();
    if (v < (isWeekend ? 0.55 : 0.25)) { arr.push(0); continue; }
    const count = Math.round(1 + r() * 6 * base);
    arr.push(count);
  }
  // Boost last 2 weeks to show current momentum
  for (let i = days - 14; i < days; i++) {
    if (arr[i] === 0 && r() > 0.4) arr[i] = 1 + Math.round(r() * 3);
  }
  return arr;
})();

window.CoursesData = { USER, ACTIVE, ENROLLED, TRACKS, TODAY_DRILL, ACTIVITY, BUILDS, MILESTONE, ACTIVITY_HEATMAP };
