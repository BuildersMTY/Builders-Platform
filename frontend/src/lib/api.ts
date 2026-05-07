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
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
  });
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
    credentials: "include",
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
