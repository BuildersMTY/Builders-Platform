"use client";

import Link from "next/link";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function SlotMachineNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue}</span>;
}

const freeFeatures = [
  "Un proyecto completo",
  "Editor y runner en navegador",
  "Sin tarjeta de credito",
];

const proFeatures = [
  { k: "Proyectos", v: "Todos, todos los niveles" },
  { k: "Lenguajes", v: "Go, Python, TypeScript y mas" },
  { k: "Evaluacion", v: "Pruebas automatizadas en vivo" },
  { k: "Portafolio", v: "Export a GitHub con historial real" },
  { k: "Acreditacion", v: "Certificado verificable en LinkedIn" },
];

const studentFeatures = [
  "Todo lo anterior",
  "Verificacion con correo .edu",
  "Descuento vitalicio mientras estudies",
];

export function PricingTiers() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section className="px-6 pb-24 relative overflow-hidden">
      <div className="flex justify-center mb-20">
        <div className="inline-flex items-center p-1 border border-border bg-surface rounded-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${
              billingCycle === "monthly" 
                ? "bg-text text-bg shadow-sm" 
                : "text-text-dim hover:text-text"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all relative ${
              billingCycle === "yearly" 
                ? "bg-text text-bg shadow-sm" 
                : "text-text-dim hover:text-text"
            }`}
          >
            Anual
            {billingCycle === "monthly" && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary text-[8px] font-bold text-bg rounded-sm animate-pulse">
                -17%
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 items-end">
        {/* FREE */}
        <motion.aside 
          whileHover={{ y: -5 }}
          className="flex flex-col border border-border bg-surface p-8 transition-shadow duration-300 hover:shadow-2xl rounded-sm"
        >
          <div className="mb-6">
            <h3 className="font-serif text-3xl italic leading-none text-text">
              Gratis
            </h3>
            <p className="mt-2 text-[12px] font-medium text-text-dim">
              Acceso a un proyecto completo
            </p>
          </div>
          <ul className="mb-10 flex-1 space-y-4 text-[13px] leading-relaxed text-text-muted">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 bg-border" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/courses"
            className="flex h-11 w-full items-center justify-center border border-border bg-transparent text-[11px] font-bold uppercase tracking-[0.1em] text-text-dim transition-colors hover:border-text hover:text-text rounded-sm"
          >
            Empezar
          </Link>
        </motion.aside>
 
        {/* BUILDMANCER — DISTILLED & SHARP */}
        <article className="relative z-10 flex flex-col border border-primary bg-bg p-8 shadow-[0_0_50px_-10px_rgba(255,0,0,0.1)] md:scale-105 rounded-sm">
          <div className="absolute -top-3 left-8 border border-primary bg-primary px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-bg rounded-sm">
            Más Popular
          </div>
          
          <div className="mb-8 border-b border-border/50 pb-8">
            <h3 className="font-serif text-5xl font-bold leading-none text-text tracking-tighter">
              BuildMancer
            </h3>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-bold leading-none text-text italic">
                $<SlotMachineNumber value={billingCycle === "monthly" ? 199 : 1990} />
              </span>
              <span className="text-[12px] font-medium text-text-dim uppercase tracking-tight">
                mxn / {billingCycle === "monthly" ? "mes" : "año"}
              </span>
            </div>
            {billingCycle === "yearly" && (
              <p className="mt-2 text-[11px] font-medium text-primary uppercase">
                Ahorras $398 MXN al año
              </p>
            )}
          </div>
 
          <ul className="mb-10 flex-1 space-y-5 text-[13px] text-text">
            {proFeatures.map((f, i) => (
              <li key={f.k} className="flex items-baseline gap-4">
                <span className="font-mono text-[9px] text-primary/50 font-bold">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="font-bold text-[11px] uppercase tracking-wider text-text">{f.k}:</strong>{" "}
                  <span className="text-text-muted">{f.v}</span>
                </span>
              </li>
            ))}
          </ul>
 
          <div className="space-y-4">
            <Link
              href="/courses"
              className="group relative flex h-14 w-full items-center justify-center rounded-sm border border-primary bg-primary/10 text-[14px] font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-bg"
            >
              <span>Suscribirme ahora</span>
            </Link>
            <p className="text-center text-[10px] font-medium text-text-dim">
              Acceso instantáneo · Cancela en un clic
            </p>
          </div>
        </article>
 
        {/* STUDENT */}
        <motion.aside 
          whileHover={{ y: -5 }}
          className="flex flex-col border border-border bg-surface p-8 transition-shadow duration-300 hover:shadow-2xl rounded-sm"
        >
          <div className="mb-6">
            <h3 className="font-serif text-3xl italic leading-none text-text">
              Estudiante
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-4xl leading-none text-text">
                $<SlotMachineNumber value={billingCycle === "monthly" ? 149 : 1490} />
              </span>
              <span className="text-[12px] font-medium text-text-dim uppercase">
                mxn / {billingCycle === "monthly" ? "mes" : "año"}
              </span>
            </div>
          </div>
          <ul className="mb-10 flex-1 space-y-4 text-[13px] leading-relaxed text-text-muted">
            {studentFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 bg-border" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/courses"
            className="flex h-11 w-full items-center justify-center border border-border bg-transparent text-[11px] font-bold uppercase tracking-[0.1em] text-text-dim transition-colors hover:border-text hover:text-text rounded-sm"
          >
            Verificar Estudiante
          </Link>
        </motion.aside>
      </div>
    </section>
  );
}

