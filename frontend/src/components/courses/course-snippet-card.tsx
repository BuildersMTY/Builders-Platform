"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CourseSnippetProps {
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  slug: string;
}

export function CourseSnippetCard({ title, difficulty, icon, slug }: CourseSnippetProps) {
  const diffColor = {
    beginner: "text-green-400 bg-green-400/10",
    intermediate: "text-orange-400 bg-orange-400/10",
    advanced: "text-primary bg-primary/10",
  }[difficulty];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex w-full max-w-[280px] flex-col border border-border/50 bg-surface/50 p-5 transition-all hover:border-primary/30 hover:shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center bg-bg font-mono text-xl">
          {icon}
        </div>
        <div className={`border border-current px-2 py-0.5 font-mono text-[9px] uppercase font-bold tracking-widest ${diffColor}`}>
          {difficulty}
        </div>
      </div>
      
      <h4 className="mb-2 font-serif text-lg leading-tight text-text">
        {title}
      </h4>
      
      <div className="mt-auto pt-4 border-t border-border/30">
        <Link 
          href={`/courses/${slug}`}
          className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-text-dim transition-colors group-hover:text-primary"
        >
          <span>View Spec</span>
          <span>→</span>
        </Link>
      </div>

      {/* Subtle Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
