import type { Metadata } from "next";
import { Sora, Bodoni_Moda, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Buildmancer — Construye software real",
  description:
    "Plataforma de educación para desarrolladores. Construye proyectos reales, pasa pruebas automatizadas, llévalo a tu portafolio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${bodoniModa.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text min-h-screen">{children}</body>
    </html>
  );
}
