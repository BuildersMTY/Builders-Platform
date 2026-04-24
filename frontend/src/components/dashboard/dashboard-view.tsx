"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Trophy, 
  History, 
  Flame,
  Search,
  ChevronRight,
  FileCode2,
  Play,
  Zap,
  Check
} from 'lucide-react';
import Link from 'next/link';

// --- PIXEL PERFECT MOCK DATA ---
const USER = { handle: "avery", display: "Avery", joined_days: 42, timezone: "PT", active_days: 9 };

const ACTIVE = {
  course_id: "http-server",
  course_title: "HTTP Server from Scratch",
  lang: "go", lang_label: "Go",
  module_title: "HTTP parsing",
  sub_title: "Write the response",
  sub_id: "http/response",
  last_session_ago: "12 min",
  passed_today: 4, tests_pass: 4, tests_fail: 1, tests_total: 5,
  lines_today: 127,
  progress_pct: 0.48,
  progress_label: "6 / 12 submodules",
  file_preview_lines: [
    { text: "func (r *Response) Write(w io.Writer) error {", faint: false },
    { text: "\tbw := bufio.NewWriter(w)", faint: false },
    { text: "", faint: true },
    { text: "\t// 1. Status line", faint: true },
    { text: "\tfmt.Fprintf(bw, \"HTTP/1.1 %d %s\\r\\n\", …)", faint: false },
  ],
};

const ENROLLED = [
  {
    id: "http-server", title: "HTTP Server from Scratch", lang: "go", lang_label: "Go", level: "intermediate",
    submodules_total: 12, submodules_done: 6, progress_pct: 0.48,
    next_task: "Write the response", next_module: "HTTP parsing",
    active: true, hours_spent: 14, total_hours: 32,
  },
  {
    id: "unix-shell", title: "Build a Unix Shell", lang: "c", lang_label: "C", level: "intermediate",
    submodules_total: 18, submodules_done: 11, progress_pct: 0.61,
    next_task: "Signal handling (SIGINT)", next_module: "Process control",
    hours_spent: 21, total_hours: 40,
  },
  {
    id: "sqlite-clone", title: "SQLite, from B-tree up", lang: "rust", lang_label: "Rust", level: "advanced",
    submodules_total: 24, submodules_done: 3, progress_pct: 0.12,
    next_task: "Parser: SELECT statement", next_module: "Tokenizer & parser",
    hours_spent: 6, total_hours: 60,
  },
];

const ACTIVITY = [
  { when: "just now", kind: "test_fail",  text: "Test failed: Content-Type maps .css to text/css", course: "HTTP Server from Scratch" },
  { when: "12m",      kind: "test_pass",  text: "Passed: Content-Length header is present",     course: "HTTP Server from Scratch" },
  { when: "2h",       kind: "sub_done",   text: "Completed: Parse headers",                     course: "HTTP Server from Scratch" },
  { when: "yesterday",kind: "sub_done",   text: "Completed: Parse the request line",            course: "HTTP Server from Scratch" },
];

const MILESTONE = { track: "Systems", required: 4, completed: 1 };

// plausbile-looking heatmap
const ACTIVITY_HEATMAP = Array.from({ length: 182 }, (_, i) => {
  const isWeekend = i % 7 === 0 || i % 7 === 6;
  if (Math.random() < (isWeekend ? 0.7 : 0.4)) return 0;
  return Math.floor(Math.random() * 5);
});

// --- SUB-COMPONENTS ---

function LangBadge({ lang, label }: { lang: string, label: string }) {
  const colors: Record<string, string> = {
    go: "#00add8",
    rust: "#dea584",
    c: "#a8b9cc",
    python: "#3572A5",
  };
  return (
    <div className="flex items-center gap-1.5 rounded-[2px] border border-border bg-bg-deep px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[lang] || 'var(--color-text-dim)' }} />
      {label}
    </div>
  );
}

function Heatmap({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);
  const bucketBg = (v: number) => {
    if (v === 0) return "var(--color-border)";
    const alphas = [0, 0.2, 0.4, 0.65, 0.9];
    const b = v / max;
    const idx = Math.min(4, Math.floor(b * 4) + 1);
    return `rgba(255, 43, 43, ${alphas[idx]})`;
  };

  return (
    <div className="flex flex-col gap-3.5 border border-border-strong bg-surface-alt p-5">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">Activity</span>
          <span className="text-[12.5px] text-text-dim">
            <span className="text-text">{counts.reduce((a, b) => a + b, 0)}</span> commits across <span className="text-text">{counts.filter(c => c > 0).length}</span> days
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-text-faint">last 180 days</span>
      </div>
      <div className="flex flex-wrap gap-[3px]">
        {counts.map((c, i) => (
          <div 
            key={i} 
            className="h-[11px] w-[11px] border border-white/[0.02]" 
            style={{ 
              backgroundColor: bucketBg(c),
              boxShadow: c >= 3 ? "0 0 5px rgba(255,43,43,0.35)" : "none"
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 font-mono text-[9.5px] text-text-faint">
        <span>less</span>
        {[0, 1, 2, 3, 4].map(b => (
          <div key={b} className="h-[11px] w-[11px] border border-white/[0.02]" style={{ backgroundColor: `rgba(255, 43, 43, ${[0, 0.2, 0.4, 0.65, 0.9][b]})` }} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

function EnrolledCard({ course }: { course: typeof ENROLLED[0] }) {
  return (
    <Link 
      href="/workspace-v2"
      className="group relative flex flex-col gap-3 overflow-hidden border border-border-strong bg-surface p-5 transition-all hover:translate-y-[-1px] hover:border-border-bright"
    >
      {course.active && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 border border-primary/30 bg-primary-dim px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-primary">
          <span className="h-1 w-1 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary-glow)]" />
          active
        </div>
      )}
      <div className="flex items-center gap-2">
        <LangBadge lang={course.lang} label={course.lang_label} />
        <span className="font-mono text-[10.5px] tracking-[0.04em] text-text-faint">{course.level}</span>
      </div>
      <h3 className="max-w-[90%] font-serif text-[19px] font-normal leading-tight text-text italic">
        {course.title}
      </h3>
      <div className="mt-1">
        <div className="mb-1 flex items-center gap-1.5 text-[11.5px]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">next</span>
          <span className="text-text">{course.next_task}</span>
        </div>
        <div className="text-[11px] text-text-faint">in {course.next_module}</div>
      </div>
      <div className="mt-auto pt-2">
        <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] tracking-tight">
          <div className="h-[2px] flex-1 bg-border overflow-hidden relative mr-2.5">
            <div 
              className={`absolute inset-0 transition-all duration-500 ${course.active ? 'bg-gradient-to-r from-primary to-[#ff6b5b] shadow-[0_0_6px_var(--color-primary-glow)]' : 'bg-text-muted'}`}
              style={{ width: `${course.progress_pct * 100}%` }}
            />
          </div>
          <span className="text-text-muted">{Math.round(course.progress_pct * 100)}%</span>
        </div>
        <div className="flex gap-2.5 font-mono text-[10px] tracking-[0.04em] text-text-faint">
          <span>{course.submodules_done}/{course.submodules_total} tasks</span>
          <span>·</span>
          <span>{course.hours_spent}h / {course.total_hours}h</span>
        </div>
      </div>
    </Link>
  );
}

function ActivityStream({ items }: { items: typeof ACTIVITY }) {
  const kindConfig: Record<string, { dot: string, label: string }> = {
    test_pass: { dot: "var(--color-success)", label: "pass" },
    test_fail: { dot: "var(--color-error)",   label: "fail" },
    sub_done:  { dot: "var(--color-primary)", label: "done" },
    module:    { dot: "var(--color-info)",    label: "unlock" },
    resource:  { dot: "var(--color-text-muted)", label: "read" },
    build:     { dot: "var(--color-warning)", label: "ship" },
  };

  return (
    <div className="flex flex-col overflow-hidden border border-border-strong bg-surface-alt">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_5px_var(--color-success)]" />
        Activity — last 7 days
      </div>
      <div className="flex flex-col py-1.5 max-h-[260px] overflow-y-auto">
        {items.map((a, i) => {
          const cfg = kindConfig[a.kind] || kindConfig.sub_done;
          return (
            <div key={i} className="grid grid-cols-[52px_48px_1fr] items-baseline gap-2.5 px-4 py-1.5 text-[12px] border-b border-dashed border-border last:border-0">
              <span className="font-mono text-[10.5px] tracking-tight text-text-faint">{a.when}</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-tight" style={{ color: cfg.dot }}>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: cfg.dot }} />
                {cfg.label}
              </span>
              <span className="leading-relaxed text-text-muted">
                <span className="text-text">{a.text}</span>
                <span className="text-text-faint"> · {a.course}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN VIEW ---

export function DashboardView() {
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = ENROLLED.reduce((a, c) => a + c.submodules_total, 0);
    const done = ENROLLED.reduce((a, c) => a + c.submodules_done, 0);
    const hours = ENROLLED.reduce((a, c) => a + c.hours_spent, 0);
    return { total, done, hours };
  }, []);

  return (
    <div className="noise-bg relative min-h-screen bg-bg text-text selection:bg-primary-dim selection:text-text">
      {/* Ambient gradient drift */}
      <div className="animate-ambient pointer-events-none fixed -right-[200px] -top-[200px] z-0 h-[600px] w-[600px] bg-[radial-gradient(circle,var(--color-primary-dim)_0%,transparent_60%)]" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-border bg-surface/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <FileCode2 size={22} className="text-primary" />
              <span className="font-serif text-[20px] italic tracking-tight text-text">Buildmancer</span>
            </Link>
            <div className="hidden h-5 w-px bg-border md:block" />
            <div className="hidden gap-8 font-mono text-[11px] uppercase tracking-[0.16em] text-text-dim md:flex">
              <Link href="/dashboard" className="text-text">Dashboard</Link>
              <Link href="/courses" className="hover:text-text transition-colors">Catalog</Link>
              <Link href="/builds" className="hover:text-text transition-colors">Builds</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={13} />
              <input 
                type="text" 
                placeholder="search index" 
                className="w-56 rounded-none border border-border bg-bg-deep px-4 py-1.5 pl-9 font-mono text-[11px] focus:border-border-bright focus:outline-none transition-all placeholder:text-text-faint"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex h-8 w-8 items-center justify-center border border-border bg-surface-alt font-mono text-[10px] text-text-muted">
              AV
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-[1440px] px-9 py-10">
        {/* Page Header */}
        <div className="mb-6 flex items-baseline gap-5">
          <h1 className="font-serif text-[32px] font-normal tracking-tight">
            Welcome back, <span className="italic">{USER.display}</span>
          </h1>
          <span className="text-[13px] text-text-dim">
            You've built for {USER.active_days} of the last 14 days.
          </span>
          <div className="flex-1" />
          <div className="flex gap-4 font-mono text-[11px] text-text-dim">
            <span><span className="text-text">{stats.done}</span>/{stats.total} tasks done</span>
            <span className="text-text-faint">·</span>
            <span><span className="text-text">{stats.hours}h</span> invested</span>
          </div>
        </div>

        {/* Hero Row: Active Project */}
        <section className="mb-9">
          <Link 
            href="/workspace-v2"
            className="group flex flex-col md:grid md:grid-cols-[1.15fr_1fr] border border-border-strong bg-gradient-to-b from-surface-alt to-surface transition-all hover:border-border-bright"
          >
            <div className="flex flex-col gap-5 p-9 pb-7">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Continue building</span>
                <span className="font-mono text-[10px] text-text-dim">{ACTIVE.last_session_ago} ago</span>
              </div>
              <h2 className="font-serif text-[36px] font-normal leading-[1.08] tracking-tight text-text">
                <span className="italic">{ACTIVE.sub_title}.</span>
                <span className="text-text-muted"> Pick up where the wire-format headers meet the body.</span>
              </h2>
              <div className="flex items-center gap-3.5 text-[12.5px] text-text-dim">
                <LangBadge lang={ACTIVE.lang} label={ACTIVE.lang_label} />
                <span>{ACTIVE.course_title}</span>
                <span className="text-text-faint">·</span>
                <span>{ACTIVE.module_title}</span>
              </div>

              <div className="mt-auto flex items-center gap-5 pt-4">
                <div className="flex-1 max-w-[240px]">
                  <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-text-dim">course progress</span>
                    <span className="text-text">{ACTIVE.progress_label}</span>
                  </div>
                  <div className="h-[3px] bg-border overflow-hidden relative">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary to-[#ff6b5b] shadow-[0_0_8px_var(--color-primary-glow)]"
                      style={{ width: `${ACTIVE.progress_pct * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-1 border border-border bg-bg-deep px-3.5 py-2 font-mono text-[11px]">
                  <span className="text-success">✓{ACTIVE.tests_pass}</span>
                  <span className="text-text-faint">·</span>
                  <span className="text-error">✗{ACTIVE.tests_fail}</span>
                  <span className="ml-1 text-text-dim text-[10.5px]">of {ACTIVE.tests_total}</span>
                </div>
              </div>

              <div className="mt-1 flex items-center gap-2.5 bg-primary px-4 py-3 font-sans text-[13px] font-medium text-white transition-all group-hover:translate-x-0.5 shadow-[0_4px_24px_-8px_var(--color-primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)] self-start">
                <Play size={11} fill="white" strokeWidth={0} />
                Resume {ACTIVE.sub_id}
                <span className="ml-1 font-mono text-[11px] opacity-60">⌘↵</span>
              </div>
            </div>

            <div className="relative border-l border-border bg-bg-deep py-[22px] overflow-hidden">
               {/* File header */}
              <div className="mb-3.5 flex items-center gap-2 border-b border-border px-6 pb-3.5 font-mono text-[11px] text-text-dim">
                <Terminal size={11} />
                <span>http/response.go</span>
                <span className="text-text-faint">·</span>
                <span className="text-warning">● unsaved</span>
                <div className="flex-1" />
                <span className="text-text-faint">line 41</span>
              </div>
              <div className="px-6 font-mono text-[12px] leading-[1.85] text-text-muted">
                {ACTIVE.file_preview_lines.map((l, i) => (
                  <div key={i} className={`flex gap-3.5 ${l.faint ? 'text-text-faint' : ''}`}>
                    <span className="w-[18px] text-right text-text-faint">{39 + i}</span>
                    <span className="whitespace-pre">{l.text || " "}</span>
                  </div>
                ))}
                <div className="ml-[-2px] flex gap-3.5 border-l-2 border-primary bg-gradient-to-r from-primary-dim to-transparent text-text">
                  <span className="w-[18px] text-right text-primary pl-[2px]">45</span>
                  <span className="whitespace-pre">
                    <span className="text-info">for</span> k, v := <span className="text-info">range</span> r.Headers {'{'}
                    <span className="animate-caret mb-[-2px] ml-0.5 inline-block h-[14px] w-[7px] bg-primary" />
                  </span>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-deep to-transparent" />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-2 border border-error border-l-2 bg-surface px-[11px] py-1.5 text-[11px] animate-in slide-in-from-bottom-2 duration-400">
                <span className="h-1.5 w-1.5 rounded-full bg-error shadow-[0_0_6px_var(--color-error)]" />
                <span className="font-mono text-[10.5px] text-text-muted">1 failing</span>
                <span className="text-text">Content-Type maps .css → text/css</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Triple Column: Drill + Activity + Milestone */}
        <div className="mb-9 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr_1fr]">
          {/* Today's Drill */}
          <div className="flex flex-col gap-3.5 border border-border-strong bg-surface-alt p-5 pb-4">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-warning" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-warning">Today's drill</span>
            </div>
            <h3 className="font-serif text-[21px] font-normal leading-tight text-text">Parse a Content-Length header</h3>
            <div className="flex flex-wrap gap-1.5">
              {["strings.SplitN", "strconv.Atoi", "error wrapping"].map(s => (
                <span key={s} className="border border-border bg-surface-hover px-1.5 py-0.5 font-mono text-[10.5px] text-text-muted">{s}</span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="font-mono text-[11px] text-text-dim">~8 min · strengthens <span className="text-text-muted">HTTP Server</span></span>
              <button className="flex items-center gap-1.5 border border-border-strong bg-surface-hover px-3 py-1.5 font-sans text-[12px] text-text hover:bg-surface-active transition-colors">
                Start drill <ArrowRight size={11} />
              </button>
            </div>
          </div>

          <ActivityStream items={ACTIVITY} />

          {/* Milestone */}
          <div className="flex flex-col gap-3.5 border border-border-strong bg-surface-alt p-5 pb-4">
            <div className="flex items-center gap-2">
              <Trophy size={12} className="text-info" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-info">Milestone</span>
            </div>
            <h3 className="font-serif text-[21px] font-normal leading-tight text-text">
              <span className="italic">Systems</span> Certificate
            </h3>
            <p className="text-[12.5px] leading-relaxed text-text-muted">
              Ship 4 systems courses to earn the track certificate. 3 to go.
            </p>
            <div className="mt-auto flex gap-1">
              {[true, false, false, false].map((active, i) => (
                <div key={i} className="flex flex-1 flex-col gap-1">
                  <div className={`h-1 ${active ? 'bg-success' : i === 1 ? 'bg-primary shadow-[0_0_8px_var(--color-primary-glow)] animate-shimmer' : 'bg-border'}`} />
                  <span className={`font-mono text-[9.5px] tracking-wider ${active ? 'text-success' : i === 1 ? 'text-primary' : 'text-text-faint'}`}>
                    {active ? 'done' : i === 1 ? 'active' : 'locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <section className="mb-9">
          <div className="mb-4 flex items-baseline gap-4">
            <h2 className="font-serif text-[24px] font-normal italic tracking-tight text-text">Your courses</h2>
            <span className="text-[13px] text-text-dim">2 in progress · 1 shipped</span>
            <div className="flex-1" />
            <Link href="/courses" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-text-dim hover:text-text transition-colors">
              browse catalog <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {ENROLLED.map(c => <EnrolledCard key={c.id} course={c} />)}
            <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border p-5 text-center transition-colors hover:border-border-strong group cursor-pointer">
              <Zap size={20} className="text-text-faint group-hover:text-primary transition-colors" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-text-faint group-hover:text-text-dim transition-colors">New project</span>
            </div>
          </div>
        </section>

        {/* Final Heatmap Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
           <Heatmap counts={ACTIVITY_HEATMAP} />
           <div className="border border-border-strong bg-surface-alt p-5 flex flex-col justify-center gap-2">
             <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint">Contribution Streak</span>
             <div className="flex items-baseline gap-2">
               <span className="font-serif text-[42px] italic leading-none text-primary">9</span>
               <span className="text-[18px] text-text-dim">days in a row</span>
             </div>
             <p className="text-[12px] text-text-faint mt-1">Keep shipping code every day to build your craft and muscle memory.</p>
           </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex items-center gap-4 border-t border-border pt-6 font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-faint">
          <span>buildmancer / the trade of making machines do things</span>
          <div className="flex-1" />
          <span>v0.4.2</span>
          <span>·</span>
          <span>docs</span>
          <span>·</span>
          <span>changelog</span>
          <span>·</span>
          <span>keymap ⌘/</span>
        </footer>
      </main>
    </div>
  );
}
