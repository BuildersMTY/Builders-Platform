export interface Stub {
  path: string;
  lines: number;
}

export interface Test {
  id: string;
  desc: string;
  status: "pass" | "fail" | "pending" | "running";
  dur?: number;
  expected?: string;
  actual?: string;
  expectedBytes?: string;
  actualBytes?: string;
  hint?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "doc" | "signature" | "hint";
  stage: number;
}

export interface Submodule {
  id: string;
  full_id: string;
  title: string;
  passed: boolean;
  active?: boolean;
  goal?: string;
  spec?: string;
  stubs?: Stub[];
  tests?: Test[];
  resources?: Resource[];
}

export interface Module {
  id: string;
  title: string;
  submodules: Submodule[];
}

export interface Course {
  title: string;
  language: string;
  lang_label: string;
  modules: Module[];
}

export interface FileEntry {
  path: string;
  size: number;
  stub?: boolean;
  modified?: boolean;
}

export interface Tab {
  id: string;
  type: "file" | "resource";
  modified?: boolean;
  label?: string;
  resource?: Resource;
}

export type TestPhase = "idle" | "building" | "running" | "done";

export interface TestResult {
  id: string;
  status: "pass" | "fail" | "pending" | "running";
  dur?: number;
}

export interface TestState {
  phase: TestPhase;
  results: TestResult[];
  buildMs: number;
  testMs: number;
  totalMs: number;
  buildLine?: string;
}

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  body?: string;
}

export interface Tweaks {
  accentHue: number;
  density: string;
  showMinimap: boolean;
  briefTone: string;
  testsState: "idle" | "running" | "failures" | "pass";
  showOverlay: boolean;
}
