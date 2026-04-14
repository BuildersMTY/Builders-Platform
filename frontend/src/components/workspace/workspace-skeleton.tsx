"use client";

export function WorkspaceSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-fadeIn">
      {/* Context bar skeleton */}
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface px-4">
        <div className="h-4 w-4 rounded bg-surface-hover animate-pulse" />
        <div className="h-3 w-32 rounded bg-surface-hover animate-pulse" />
        <div className="flex-1" />
        <div className="h-3 w-12 rounded bg-surface-hover animate-pulse" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Icon rail skeleton */}
        <div className="flex h-full w-16 flex-col items-center gap-2 bg-surface border-r border-border px-1.5 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-surface-hover animate-pulse" />
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div className="h-full w-[240px] flex-shrink-0 border-r border-border bg-surface p-4">
          <div className="h-4 w-24 rounded bg-surface-hover animate-pulse" />
          <div className="mt-1.5 h-2 w-12 rounded bg-surface-hover animate-pulse" />
          <div className="mt-5 h-1.5 w-full rounded-full bg-surface-hover animate-pulse" />
          <div className="mt-4 flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded bg-surface-hover animate-pulse" />
                <div
                  className="h-3 rounded bg-surface-hover animate-pulse"
                  style={{ width: `${60 + Math.random() * 80}px` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main area skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Task brief skeleton */}
          <div className="border-b border-border bg-surface-alt px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded bg-surface-hover animate-pulse" />
              <div className="h-3.5 w-10 rounded bg-primary/20 animate-pulse" />
            </div>
            <div className="mt-2.5 ml-5 flex flex-col gap-1.5">
              <div className="h-3 w-full rounded bg-surface-hover animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-surface-hover animate-pulse" />
            </div>
          </div>

          {/* Tab bar skeleton */}
          <div className="flex h-10 items-center gap-2 border-b border-border bg-surface px-2">
            <div className="h-5 w-20 rounded bg-surface-hover animate-pulse" />
            <div className="h-5 w-16 rounded bg-surface-hover/50 animate-pulse" />
          </div>

          {/* Editor area skeleton */}
          <div className="flex-1 bg-bg p-4">
            <div className="flex flex-col gap-2.5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-6 rounded bg-surface/50 animate-pulse" />
                  <div
                    className="h-3 rounded bg-surface-hover/30 animate-pulse"
                    style={{
                      width: `${20 + Math.random() * 300}px`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
