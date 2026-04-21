"use client";

export function WorkspaceSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-fadeIn">
      {/* Context bar skeleton */}
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface px-4">
        <div className="h-4 w-4 bg-surface-hover animate-pulse" />
        <div className="h-3 w-32 bg-surface-hover animate-pulse" />
        <div className="flex-1" />
        <div className="h-3 w-12 bg-surface-hover animate-pulse" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Icon rail skeleton */}
        <div className="flex h-full w-14 flex-col items-center gap-0.5 bg-surface border-r border-border py-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-surface-hover/60 animate-pulse" />
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div className="h-full w-[240px] flex-shrink-0 border-r border-border bg-surface">
          <div className="flex h-7 items-center justify-between border-b border-border px-3">
            <div className="h-2 w-12 bg-surface-hover animate-pulse" />
            <div className="h-2 w-6 bg-surface-hover animate-pulse" />
          </div>
          <div className="border-b border-border px-3 py-2">
            <div className="h-3 w-32 bg-surface-hover animate-pulse" />
          </div>
          <div className="mt-1 flex flex-col gap-1 px-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="h-3 w-3 bg-surface-hover animate-pulse" />
                <div
                  className="h-2.5 bg-surface-hover animate-pulse"
                  style={{ width: `${60 + Math.random() * 80}px` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main area skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Task brief skeleton */}
          <div className="border-b border-border bg-surface-alt px-4 py-2">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 bg-surface-hover animate-pulse" />
              <div className="h-2.5 w-8 bg-surface-hover animate-pulse" />
              <div className="h-3 w-px bg-border" />
              <div className="h-3 w-40 bg-surface-hover animate-pulse" />
            </div>
            <div className="mt-2 ml-10 flex flex-col gap-1.5">
              <div className="h-2.5 w-full bg-surface-hover/60 animate-pulse" />
              <div className="h-2.5 w-3/4 bg-surface-hover/60 animate-pulse" />
            </div>
          </div>

          {/* Tab bar skeleton */}
          <div className="flex h-8 items-center border-b border-border bg-surface">
            <div className="flex h-full items-center gap-2 border-r border-border px-3">
              <div className="h-1 w-1 rounded-full bg-surface-hover" />
              <div className="h-2.5 w-20 bg-surface-hover animate-pulse" />
            </div>
            <div className="flex h-full items-center gap-2 border-r border-border px-3">
              <div className="h-1 w-1 rounded-full bg-surface-hover/70" />
              <div className="h-2.5 w-16 bg-surface-hover/50 animate-pulse" />
            </div>
          </div>

          {/* Editor area skeleton */}
          <div className="flex-1 bg-bg p-4">
            <div className="flex flex-col gap-2.5 font-mono">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2.5 w-6 bg-surface/50 animate-pulse" />
                  <div
                    className="h-2.5 bg-surface-hover/30 animate-pulse"
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
