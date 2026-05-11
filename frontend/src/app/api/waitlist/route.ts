import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistBody = {
  email?: unknown;
  name?: unknown;
  profile?: unknown;
  goal?: unknown;
  company?: unknown;
  source?: unknown;
};

function text(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, limit);
}

function waitlistPath() {
  return (
    process.env.WAITLIST_FILE ||
    path.join(process.cwd(), "data", "waitlist-signups.jsonl")
  );
}

async function emailAlreadyExists(filePath: string, email: string) {
  try {
    const contents = await readFile(filePath, "utf8");
    return contents
      .split("\n")
      .filter(Boolean)
      .some((line) => {
        try {
          const row = JSON.parse(line) as { email?: string };
          return row.email === email;
        } catch {
          return false;
        }
      });
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: WaitlistBody;

  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (text(body.company, 120)) {
    return NextResponse.json({ ok: true, message: "You are on the list." });
  }

  const email = text(body.email, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const filePath = waitlistPath();
  await mkdir(path.dirname(filePath), { recursive: true });

  if (await emailAlreadyExists(filePath, email)) {
    return NextResponse.json({
      ok: true,
      message: "You were already on the waitlist. We will reach out soon.",
    });
  }

  const entry = {
    email,
    name: text(body.name, 80),
    profile: text(body.profile, 40),
    goal: text(body.goal, 180),
    source: text(body.source, 40) || "launchpad",
    createdAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "",
  };

  await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");

  return NextResponse.json({
    ok: true,
    message: "You are on the list. We will reach out when access opens.",
  });
}
