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
