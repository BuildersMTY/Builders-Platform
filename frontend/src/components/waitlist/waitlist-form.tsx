"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          name: data.get("name"),
          profile: data.get("profile"),
          goal: data.get("goal"),
          company: data.get("company"),
          source: "launchpad",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "We could not save your signup.");
      }

      form.reset();
      setStatus("success");
      setMessage(payload?.message || "You are on the list. We will reach out when access opens.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="relative overflow-hidden border border-border bg-surface/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/50" />
      <div className="grid gap-3">
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-dim">
            Email
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 border border-border-strong bg-bg-deep px-4 text-[14px] text-text outline-none transition-colors placeholder:text-text-faint focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-dim">
            Name
          </span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Raul"
            className="h-12 border border-border-strong bg-bg-deep px-4 text-[14px] text-text outline-none transition-colors placeholder:text-text-faint focus:border-primary"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-dim">
              Profile
            </span>
            <select
              name="profile"
              defaultValue="builder"
              className="h-12 border border-border-strong bg-bg-deep px-4 text-[14px] text-text outline-none transition-colors focus:border-primary"
            >
              <option value="builder">Builder</option>
              <option value="student">Student</option>
              <option value="engineer">Engineer</option>
              <option value="founder">Founder</option>
              <option value="team">Team</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-dim">
              I want to build
            </span>
            <input
              name="goal"
              placeholder="servers, databases, systems..."
              className="h-12 border border-border-strong bg-bg-deep px-4 text-[14px] text-text outline-none transition-colors placeholder:text-text-faint focus:border-primary"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="mt-2 inline-flex h-12 items-center justify-center gap-3 border border-primary bg-primary px-5 text-[13px] font-bold text-bg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-surface-active disabled:text-text-dim"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving
            </>
          ) : status === "success" ? (
            <>
              <Check size={15} />
              Joined
            </>
          ) : (
            <>
              Join waitlist
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
      <p
        className={`mt-4 min-h-5 text-[12px] ${
          status === "error" ? "text-error" : "text-text-dim"
        }`}
        aria-live="polite"
      >
        {message || "No spam. Just early access, cohort invites, and important updates."}
      </p>
    </form>
  );
}
