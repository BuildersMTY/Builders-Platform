"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { IconRail } from "@/components/workspace/icon-rail";
import { Panel } from "@/components/workspace/panel";
import { WorkspaceMain } from "./workspace-main";
import Image from "next/image";
import Link from "next/link";

function DesktopGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Image src="/builderslogo2.svg" alt="Buildmancer" width={48} height={48} />
        <p className="text-text-muted">
          Buildmancer funciona mejor en escritorio. Abre esta página en tu computadora para comenzar a construir.
        </p>
        <Link href="/courses" className="text-sm text-primary hover:underline">Volver a proyectos</Link>
      </div>
    );
  }

  return <>{children}</>;
}

export default function WorkspacePage() {
  return (
    <DesktopGuard>
      <WorkspaceProvider>
        <div className="flex h-screen overflow-hidden">
          <IconRail />
          <Panel />
          <WorkspaceMain />
        </div>
      </WorkspaceProvider>
    </DesktopGuard>
  );
}
