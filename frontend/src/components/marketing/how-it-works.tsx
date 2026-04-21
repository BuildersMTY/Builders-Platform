"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function TerminalPreview({ step }: { step: number }) {
  const isBooting = false; // Removed glitch boot

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A0A] p-7 shadow-2xl">
      {/* Terminal Header — Studio Aesthetic */}
      <div className="mb-6 flex items-center justify-between border-b border-border/30 pb-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-border/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-border/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-border/40" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
          {step === 0 ? "scanner_inst" : step === 1 ? "main.go" : "git_push"}
        </div>
        <div className="h-2.5 w-2.5 rounded-full bg-primary/20" />
      </div>

      {/* Terminal Content — Morphing based on step */}
      <div className="font-mono text-[13px] leading-relaxed">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-3 text-primary"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-dim">›</span>
                <span className="animate-pulse">scanning projects...</span>
              </div>
              <div className="pl-4 text-text-muted">
                <div>[01] http-server ........... OK</div>
                <div>[02] dns-resolver .......... OK</div>
                <div className="text-primary/70">
                  [03] git-clone ............. PENDING
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-green-500">package</span>
                <span className="text-text">main</span>
              </div>
              <div className="pl-4 border-l-2 border-primary/20">
                <span className="text-primary">func</span>{" "}
                <span className="text-blue-400">HandleConnection</span>(conn net.Conn) {"{"}
                <div className="pl-4 text-text-dim">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block"
                  >
                    // Implementing TCP handshake...
                  </motion.span>
                </div>
                <div className="pl-4">
                   <span className="h-4 w-1 bg-primary inline-block animate-pulse" />
                </div>
                {"}"}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, filter: "brightness(0)" }}
              animate={{ opacity: 1, filter: "brightness(1.5)" }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-text-dim">
                <span>$</span>
                <span className="text-text">git push origin main</span>
              </div>
              <div className="pl-4 text-text-muted">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-3 w-3 border border-primary border-t-transparent rounded-full"
                  />
                  <span>Pushing objects...</span>
                </div>
                <div className="text-green-500 mt-2 flex items-center gap-2">
                   <span className="font-bold">SYSTEM VERIFIED</span>
                </div>
                <div className="text-blue-400 text-[10px] mt-2 opacity-50">
                  build.mancer/deployments/success-9921
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl opacity-50" />
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  detail,
  index,
  activeStep 
}: { 
  number: string, 
  title: string, 
  description: string, 
  detail: string,
  index: number,
  activeStep: number
}) {
  const isActive = index === activeStep;
  const isPast = index < activeStep;
  
  return (
    <motion.div 
      initial={false}
      animate={{ 
        opacity: isActive ? 1 : (isPast ? 0.3 : 0.4),
        scale: isActive ? 1 : 0.98,
        y: isActive ? 0 : index < activeStep ? -20 : 20,
        filter: isActive ? "blur(0px)" : "blur(2px)",
        rotateX: isActive ? 0 : (isPast ? 2 : -2)
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group min-h-[220px] flex flex-col rounded-2xl border-2 transition-all duration-300 ${isActive ? "border-primary bg-surface shadow-[0_0_40px_-10px_rgba(255,0,0,0.15)]" : "border-border/70 bg-surface/50"}`}
    >
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <span className={`font-serif text-[42px] italic leading-none transition-colors duration-300 ${isActive ? "text-primary" : "text-text-dim"}`}>
          {number}
        </span>
        <div className="inline-flex border border-border bg-surface-alt px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          {detail}
        </div>
      </div>

      <div className="flex-1">
        <h3 className={`text-[19px] font-semibold tracking-tight transition-colors duration-300 ${isActive ? "text-text" : "text-text-muted"}`}>
          {title}
        </h3>
        <p className={`mt-3 text-[14px] leading-relaxed transition-colors duration-300 ${isActive ? "text-text-muted" : "text-text-dim"}`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (v < 0.33) setActiveStep(0);
      else if (v < 0.66) setActiveStep(1);
      else setActiveStep(2);
    });
  }, [scrollYProgress]);

  return (
    <section id="como-funciona" className="px-6 py-28 md:py-48">
      <div ref={containerRef} className="mx-auto max-w-[1100px]">
        {/* Section Head — Software Identity */}
        <div className="mb-24 flex flex-col items-center text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Entrenamiento de <span className="font-serif italic text-primary">alto impacto.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[16px] text-text-muted leading-relaxed">
            Un pipeline diseñado para que el razonamiento profundo sea tu ventaja competitiva frente a la automatización.
          </p>
        </div>

        {/* Hybrid Layout: Left (Sticky Steps) / Right (Morphing Terminal) */}
        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          
          {/* Left Column — The Steps */}
          <div className="space-y-8 lg:space-y-12">
            <StepCard
              index={0}
              activeStep={activeStep}
              number="01"
              title="Escoges un reto de ingeniería."
              description="Proyectos que te obligan a entender cómo funcionan las cosas por dentro — DNS, Git, o protocolos de red."
              detail="Challenge"
            />
            <StepCard
              index={1}
              activeStep={activeStep}
              number="02"
              title="Construyes sin muletas."
              description="Nada de Copilot. Nada de tutoriales masticados. Solo tú, el código y una especificación técnica rigurosa."
              detail="Workout"
            />
            <StepCard
              index={2}
              activeStep={activeStep}
              number="03"
              title="Forja tu reputación."
              description="Tu código vive en tu GitHub. Demuestra que sabes construir lo que otros solo saben pedirle a un prompt."
              detail="Proof"
            />
          </div>

          {/* Right Column — The Sticky Morphing Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-40 h-[450px]">
              <motion.div 
                className="h-full w-full"
                layout
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              >
                <TerminalPreview step={activeStep} />
                
                {/* Visual Connector Line */}
                <div className="absolute -left-12 top-1/2 h-[1px] w-12 -translate-y-1/2 bg-border" />
              </motion.div>
              
              {/* Technical Caption */}
              <div className="mt-6 flex items-center justify-between font-mono text-[10px] text-text-dim">
                <div className="flex gap-4">
                  <span>CPU: OK</span>
                  <span>MEMORY: STABLE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
                  LIVE PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
