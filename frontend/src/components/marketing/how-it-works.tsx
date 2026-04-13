import { FolderSearch, Code2, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepProps {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

function Step({ icon: Icon, number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-subtle">
        <Icon size={28} className="text-primary" />
      </div>
      <span className="mt-4 text-sm font-medium text-text-dim">{number}</span>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-text-muted">{description}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Cómo funciona</h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          <Step icon={FolderSearch} number="01" title="Elige un proyecto" description="HTTP servers, DNS, Git — desafíos reales que los devs construyen en la industria." />
          <Step icon={Code2} number="02" title="Escribe código real" description="Submódulos guiados con pruebas automatizadas. Sin hand-holding — tú escribes cada línea." />
          <Step icon={Briefcase} number="03" title="Llévalo a tu portafolio" description="Proyecto terminado en tu GitHub con tu historial de commits. Certificación lista para LinkedIn." />
        </div>
      </div>
    </section>
  );
}
