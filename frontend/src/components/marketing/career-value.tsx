import { GitBranch, Award, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ValueBlockProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function ValueBlock({ icon: Icon, title, description }: ValueBlockProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
        <Icon size={20} className="text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  );
}

export function CareerValue() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Directamente a tu CV</h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-text-muted">
          No es otro tutorial más. Es experiencia real que puedes demostrar.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ValueBlock icon={GitBranch} title="Tu proyecto, tus commits, tu perfil" description="Termina un curso y el repo aparece en tu GitHub. Con tu historial de commits real — no un template clonado." />
          <ValueBlock icon={Award} title="Certificación lista para LinkedIn" description="Verificable y profesional. Demuestra que construiste un servidor HTTP desde cero, no que viste un video de 4 horas." />
          <ValueBlock icon={Cpu} title="No son apps de juguete" description="Protocolos reales, arquitectura real. Entiende cómo funciona el software que usas todos los días." />
        </div>
      </div>
    </section>
  );
}
