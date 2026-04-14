"use client";

import { useCallback, useRef, useEffect } from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

export function ResizeHandle({ direction, onResize, onResizeEnd }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastPos = useRef(0);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      document.body.style.cursor =
        direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      handleRef.current?.setAttribute("data-dragging", "true");
    },
    [direction]
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const current = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = current - lastPos.current;
      if (delta !== 0) {
        onResize(delta);
        lastPos.current = current;
      }
    }

    function handleMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handleRef.current?.removeAttribute("data-dragging");
      onResizeEnd?.();
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [direction, onResize, onResizeEnd]);

  const isHorizontal = direction === "horizontal";

  function handleKeyDown(e: React.KeyboardEvent) {
    const step = 10;
    let delta = 0;

    if (isHorizontal) {
      if (e.key === "ArrowRight") delta = step;
      else if (e.key === "ArrowLeft") delta = -step;
    } else {
      if (e.key === "ArrowUp") delta = -step;
      else if (e.key === "ArrowDown") delta = step;
    }

    if (delta !== 0) {
      e.preventDefault();
      onResize(delta);
      onResizeEnd?.();
    }
  }

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`group relative flex-shrink-0 ${
        isHorizontal
          ? "w-0 cursor-col-resize"
          : "h-0 cursor-row-resize"
      }`}
      role="separator"
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      aria-label={isHorizontal ? "Redimensionar panel lateral" : "Redimensionar panel de pruebas"}
    >
      {/* Invisible hit area (8px) */}
      <div
        className={`absolute z-10 ${
          isHorizontal
            ? "top-0 bottom-0 -left-1 w-2"
            : "left-0 right-0 -top-1 h-2"
        }`}
      />
      {/* Visible line */}
      <div
        className={`absolute transition-colors duration-100 ${
          isHorizontal
            ? "top-0 bottom-0 left-0 w-0.5 bg-text-dim/30 group-hover:bg-text-dim group-[[data-dragging]]:bg-primary/50"
            : "left-0 right-0 top-0 h-0.5 bg-text-dim/30 group-hover:bg-text-dim group-[[data-dragging]]:bg-primary/50"
        }`}
      />
      {/* Drag indicator dots (visible on hover) */}
      <div
        className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-20 ${
          isHorizontal
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[3px]"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row gap-[3px]"
        }`}
      >
        <span className="block w-0.5 h-0.5 rounded-full bg-text-dim" />
        <span className="block w-0.5 h-0.5 rounded-full bg-text-dim" />
        <span className="block w-0.5 h-0.5 rounded-full bg-text-dim" />
      </div>
    </div>
  );
}
