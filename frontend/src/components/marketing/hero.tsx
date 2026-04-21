"use client";

import Link from "next/link";
import { EnvironmentFrame } from "./environment-frame";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function GlitchText({ text, className }: { text: string, className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false);
  const glyphs = "X#%/&<>[]{}*!$@";

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        animate={isGlitching ? { 
          x: [0, -2, 2, -1, 0],
          skewX: [0, 5, -5, 2, 0],
          filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
        } : {}}
      >
        {text}
      </motion.span>
      {isGlitching && (
        <span className="absolute inset-0 flex select-none items-center justify-center text-primary/50 mix-blend-screen opacity-70">
          {Array.from(text).map(() => glyphs[Math.floor(Math.random() * glyphs.length)]).join("")}
        </span>
      )}
    </div>
  );
}

function MagneticButton({ 
  children, 
  className, 
  href, 
  isExternal = false 
}: { 
  children: React.ReactNode, 
  className: string, 
  href: string,
  isExternal?: boolean
}) {
  // ... (keep magnetic logic)
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    mouseX.set((e.clientX - centerX) * 0.4);
    mouseY.set((e.clientY - centerY) * 0.4);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );

  if (isExternal) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Pulse Scanline Overlay — Overdrive subtle texture */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <motion.div 
          animate={{ 
            y: ["-100%", "200%"],
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-x-0 h-[20vh] bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] brightness-100 contrast-150" />
      </div>

      {/* Ambient Red Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 85% 35%, rgba(255,0,0,0.045) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-12 gap-x-6 gap-y-16 px-6 pt-16 pb-24 lg:pt-40 lg:pb-32">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.15,
              },
            },
          }}
          className="col-span-12 font-semibold tracking-tighter lg:col-span-11"
          style={{
            fontSize: "clamp(3rem, 1rem + 6.5vw, 7.5rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
          }}
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            <GlitchText text="Escribe código real." />
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="block pl-[0.4em] text-text-muted"
          >
            Mantente afilado.
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 block font-serif italic text-primary"
          >
            <GlitchText text="Domina la ingeniería." />
          </motion.span>
        </motion.h1>
 
        {/* Copy + CTA */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-1">
          <motion.p
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md text-[15px] text-text-muted"
            style={{ lineHeight: 1.7 }}
          >
            Mientras la IA escribe tus scripts en el trabajo, aquí construyes el conocimiento profundo que te diferencia. Servidores HTTP, motores de búsqueda y protocolos desde cero. Sin videos. Sin atajos. Solo tú y el código.
          </motion.p>
 
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-5"
          >
            <MagneticButton
              href="/courses"
              className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-sm border border-primary bg-primary/10 px-8 text-[13px] font-semibold text-primary transition-all hover:bg-primary hover:text-bg"
            >
              <div className="flex items-center gap-3">
                <span>Comenzar ahora</span>
                <motion.span 
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  →
                </motion.span>
              </div>
            </MagneticButton>
 
            <MagneticButton
              href="#como-funciona"
              className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-sm border border-border bg-surface px-6 text-[13px] font-medium text-text-muted transition-colors duration-200 hover:border-text-muted hover:text-text"
            >
              <span>Ver catálogo</span>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Environment Figure — Wireframe Reveal */}
        <motion.figure
          initial={{ opacity: 0, scale: 0.96, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 lg:col-span-8 lg:col-start-5 lg:row-start-3 lg:-mt-4 lg:-mr-[6%] relative"
        >
          {/* Wireframe Pulse Overlay */}
          <motion.div
            initial={{ opacity: 0.8, scale: 0.99 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            className="absolute inset-0 z-10 rounded-xl border-2 border-primary/40 pointer-events-none"
          />
          <EnvironmentFrame />
          <figcaption className="mt-5 flex items-baseline justify-between font-mono text-[11px] text-text-dim">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <span className="text-text-muted">Fig. 01</span>{" "}
              <span className="text-border">/</span> El entorno de trabajo —
              editor, módulos y pruebas en una sola superficie.
            </motion.span>
            <span className="hidden sm:inline">go · http-server · 05</span>
          </figcaption>
        </motion.figure>
      </div>

      <div className="mx-auto h-px max-w-[1200px] bg-border" />
    </section>
  );
}
