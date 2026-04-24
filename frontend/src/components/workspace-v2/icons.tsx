import React, { type CSSProperties, type ReactNode, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

type IconFn = (p?: IconProps) => React.ReactElement;

const I = (path: ReactNode, props: IconProps = {}): React.ReactElement => {
  const { size = 14, strokeWidth = 1.5, className = "", style = {}, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
};

export const Icon: Record<string, IconFn> = {
  Package: (p) => I(<><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>, p),
  Folder: (p) => I(<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>, p),
  Book: (p) => I(<><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></>, p),
  Play: (p) => I(<polygon points="6 3 20 12 6 21 6 3"/>, p),
  Home: (p) => I(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, p),
  Check: (p) => I(<polyline points="20 6 9 17 4 12"/>, p),
  CheckCircle: (p) => I(<><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 17 10"/></>, p),
  X: (p) => I(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>, p),
  XCircle: (p) => I(<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>, p),
  Circle: (p) => I(<circle cx="12" cy="12" r="10"/>, p),
  Lock: (p) => I(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>, p),
  Chevron: (p) => I(<polyline points="9 18 15 12 9 6"/>, p),
  ChevronDown: (p) => I(<polyline points="6 9 12 15 18 9"/>, p),
  File: (p) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>, p),
  Search: (p) => I(<><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, p),
  Keyboard: (p) => I(<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/></>, p),
  Command: (p) => I(<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>, p),
  Zap: (p) => I(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, p),
  Trophy: (p) => I(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M6 4v6a6 6 0 0 0 12 0V4H6z"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></>, p),
  Clock: (p) => I(<><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></>, p),
  Dot: (p) => I(<circle cx="12" cy="12" r="3"/>, p),
  Sparkle: (p) => I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>, p),
  ArrowRight: (p) => I(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>, p),
  ArrowLeft: (p) => I(<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>, p),
  Terminal: (p) => I(<><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>, p),
  Hint: (p) => I(<><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14a5 5 0 1 0-6.18 0 4.66 4.66 0 0 1 1.84 3h2.5a4.66 4.66 0 0 1 1.84-3z"/></>, p),
  Signature: (p) => I(<><path d="M3 17s3-7 8-7 8 7 8 7"/><circle cx="9" cy="9" r="2"/></>, p),
  Eye: (p) => I(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>, p),
  Binary: (p) => I(<><rect x="14" y="14" width="4" height="6"/><rect x="6" y="4" width="4" height="6"/><path d="M6 20h4M14 10h4M6 14h2v6M14 4h2v6"/></>, p),
  Braces: (p) => I(<><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></>, p),
  Layers: (p) => I(<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>, p),
  Plug: (p) => I(<><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></>, p),
  Globe: (p) => I(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, p),
  ExternalLink: (p) => I(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>, p),
  Share: (p) => I(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>, p),
  Constellation: (p) => I(<><circle cx="5" cy="5" r="1.5"/><circle cx="19" cy="7" r="1.5"/><circle cx="12" cy="12" r="2"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="17" r="1.5"/><path d="M5 5l7 7M19 7l-7 5M12 12l-6 6M12 12l6 5" strokeOpacity="0.5"/></>, p),
};

/* Extension color coding */
const EXT_COLOR: Record<string, string> = {
  go: "#5ec9d6",
  mod: "#5ec9d6",
  sum: "#5ec9d6",
  py: "#7aa7ff",
  js: "#ffcc66",
  ts: "#5b9eff",
  sh: "#6fd6b8",
  md: "#a6a19a",
};

export function extColor(name: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return EXT_COLOR[ext] || "#6b6660";
}
