"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0.08 : 0.14;

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "clip",
        position: "relative",
        isolation: "isolate",
        background: "var(--bg)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{
            opacity: 0.96,
            y: prefersReducedMotion ? 0 : 3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: prefersReducedMotion ? 0 : -2,
          }}
          transition={{
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            minHeight: "100vh",
            willChange: "transform, opacity",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
