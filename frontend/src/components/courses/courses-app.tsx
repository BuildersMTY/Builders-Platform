"use client";

/* Courses dashboard — main app */

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@/components/workspace-v2/icons";
import {
  USER,
  ACTIVE,
  ENROLLED,
  TRACKS,
  TODAY_DRILL,
  ACTIVITY,
  BUILDS,
  MILESTONE,
  ACTIVITY_HEATMAP,
} from "./data";
import { TopNav } from "./chrome";
import { ContinueHero, TodayDrillCard, MilestoneCard } from "./hero";
import {
  EnrolledCard,
  TrackRow,
  ActivityStream,
  BuildsList,
  ActivityHeatmap,
} from "./catalog";

const DEFAULT_TWEAKS = {
  density: "comfortable" as "comfortable" | "compact",
  heroImagery: "code",
  showActivityHeatmap: true,
  accentHue: 0,
};

export function CoursesApp() {
  const tw = DEFAULT_TWEAKS;
  const [query, setQuery] = useState("");

  // Accent hue shift — same trick as Workspace
  useEffect(() => {
    const root = document.documentElement;
    if (tw.accentHue !== 0) {
      root.style.setProperty("--primary", `hsl(${(360 + tw.accentHue) % 360}, 100%, 58%)`);
      root.style.setProperty("--primary-hover", `hsl(${(360 + tw.accentHue) % 360}, 100%, 65%)`);
      root.style.setProperty("--primary-dim", `hsla(${(360 + tw.accentHue) % 360}, 100%, 58%, 0.14)`);
      root.style.setProperty("--primary-glow", `hsla(${(360 + tw.accentHue) % 360}, 100%, 58%, 0.35)`);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-hover");
      root.style.removeProperty("--primary-dim");
      root.style.removeProperty("--primary-glow");
    }
  }, [tw.accentHue]);

  const filteredTracks = useMemo(() => {
    if (!query) return TRACKS;
    const q = query.toLowerCase();
    return TRACKS.map(t => ({
      ...t,
      courses: t.courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.lang.includes(q) ||
        c.lang_label.toLowerCase().includes(q) ||
        (c.level || "").includes(q)
      ),
    })).filter(t => t.courses.length > 0);
  }, [query]);

  // Stats across all enrolled
  const stats = useMemo(() => {
    const total = ENROLLED.reduce((a, c) => a + c.submodules_total, 0);
    const done = ENROLLED.reduce((a, c) => a + c.submodules_done, 0);
    const hours = ENROLLED.reduce((a, c) => a + c.hours_spent, 0);
    return { total, done, hours };
  }, []);

  const pad = tw.density === "compact" ? "20px 28px" : "28px 36px";
  const rowGap = tw.density === "compact" ? 28 : 36;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
    }}>
      <TopNav query={query} setQuery={setQuery} active="courses" />

      {/* Ambient gradient glow in the corner — subtle editorial flourish */}
      <div style={{
        position: "fixed", top: -200, right: -200,
        width: 600, height: 600,
        background: "radial-gradient(circle, var(--primary-dim) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0,
        animation: "ambient-drift 14s ease-in-out infinite",
      }} />

      <main style={{ padding: pad, maxWidth: 1440, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* ———— Page header ———— */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 24 }}>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            color: "var(--text)",
          }}>
            Welcome back, <span style={{ fontStyle: "italic" }}>{USER.display}</span>
          </h1>
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
            You've built for {USER.active_days} of the last 14 days.
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
            <span><span style={{ color: "var(--text)" }}>{stats.done}</span>/{stats.total} tasks done</span>
            <span style={{ color: "var(--text-faint)" }}>·</span>
            <span><span style={{ color: "var(--text)" }}>{stats.hours}h</span> invested</span>
          </div>
        </div>

        {/* ———— Row 1: Continue hero ———— */}
        <div style={{ marginBottom: rowGap }}>
          <ContinueHero active={ACTIVE} />
        </div>

        {/* ———— Row 2: Drill + Activity + Milestone ———— */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          gap: 16,
          marginBottom: rowGap,
        }}>
          <TodayDrillCard drill={TODAY_DRILL} />
          <ActivityStream items={ACTIVITY} />
          <MilestoneCard milestone={MILESTONE} />
        </div>

        {/* ———— Row 3: Your courses ———— */}
        <section style={{ marginBottom: rowGap }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 24,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}>
              Your courses
            </h2>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {ENROLLED.filter(c => !c.completed).length} in progress · {ENROLLED.filter(c => c.completed).length} shipped
            </span>
            <div style={{ flex: 1 }} />
            <a href="#catalog" style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--text-dim)", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
              letterSpacing: "0.04em",
            }}>
              browse catalog
              <Icon.ArrowRight size={10} />
            </a>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}>
            {ENROLLED.map(c => (
              <EnrolledCard key={c.id} course={c} isActive={c.active} />
            ))}
          </div>
        </section>

        {/* ———— Row 4: Activity heatmap (wide) + Builds ———— */}
        <section style={{ marginBottom: rowGap, display: "grid", gridTemplateColumns: tw.showActivityHeatmap ? "1.7fr 1fr" : "1fr", gap: 16 }}>
          {tw.showActivityHeatmap && <ActivityHeatmap counts={ACTIVITY_HEATMAP} />}
          <BuildsList builds={BUILDS} />
        </section>

        {/* ———— Row 5: Track catalog ———— */}
        <section id="catalog" style={{ marginBottom: rowGap }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}>
              Catalog
            </h2>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {TRACKS.reduce((a, t) => a + t.courses.length, 0)} courses · 4 tracks
            </span>
          </div>
          {filteredTracks.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
              No courses match "{query}".
            </div>
          ) : (
            filteredTracks.map(t => <TrackRow key={t.id} track={t} />)
          )}
        </section>

        {/* ———— Footer ———— */}
        <footer style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 16,
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--text-faint)",
          letterSpacing: "0.06em",
        }}>
          <span>buildmancer / the trade of making machines do things</span>
          <div style={{ flex: 1 }} />
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
