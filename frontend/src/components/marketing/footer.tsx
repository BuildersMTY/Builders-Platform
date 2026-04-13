import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/builderslogo2.svg" alt="Buildmancer" width={24} height={24} />
          <span className="text-sm text-text-muted">
            Buildmancer © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex gap-6">
          <Link href="/pricing" className="text-sm text-text-muted hover:text-text transition-colors">
            Precios
          </Link>
          <Link href="/courses" className="text-sm text-text-muted hover:text-text transition-colors">
            Proyectos
          </Link>
        </div>
      </div>
    </footer>
  );
}
