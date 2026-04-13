"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "¿Qué incluye el plan gratuito?",
    answer: "Un proyecto completo con acceso al editor, pruebas automatizadas y todo el entorno de desarrollo. Perfecto para probar la plataforma.",
  },
  {
    question: "¿Cómo funciona la verificación de estudiante?",
    answer: "Verificamos tu estatus de estudiante con tu correo institucional (.edu.mx o similar). Una vez verificado, obtienes el precio de estudiante automáticamente.",
  },
  {
    question: "¿Cómo funciona la exportación a GitHub?",
    answer: "Al completar un curso, generamos un repositorio presentable en tu cuenta de GitHub con tu historial de commits, README profesional y descripción del proyecto.",
  },
  {
    question: "¿Cómo funciona la certificación?",
    answer: "Al completar todos los submódulos de un curso, recibes una certificación verificable que puedes agregar directamente a tu perfil de LinkedIn.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer: "Sí. Sin contratos, sin preguntas. Cancelas y mantienes acceso hasta el final de tu periodo de facturación.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-10 divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-text-muted transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.question}
                <ChevronDown
                  size={16}
                  className={`ml-2 flex-shrink-0 text-text-dim transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <p className="pb-4 text-sm leading-relaxed text-text-muted">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
