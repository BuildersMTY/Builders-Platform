"use client";

import { useEffect, useState } from "react";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { WorkspaceErrorBoundary } from "@/components/workspace/error-boundary";
import { ContextBar } from "@/components/workspace/context-bar";
import { IconRail } from "@/components/workspace/icon-rail";
import { Panel } from "@/components/workspace/panel";
import { WorkspaceMain } from "./workspace-main";
import { CommandPalette } from "@/components/workspace/command-palette";
import { Toaster } from "sonner";
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
      <WorkspaceErrorBoundary>
        <WorkspaceProvider>
          <div className="flex h-screen flex-col overflow-hidden">
            <ContextBar />
            <div className="flex flex-1 overflow-hidden">
              <IconRail />
              <Panel />
              <WorkspaceMain />
            </div>
          </div>
          <CommandPalette />
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#0c0a0a",
                border: "1px solid #2a2727",
                color: "#ffffff",
                fontSize: "12px",
                borderRadius: "9999px",
              },
            }}
          />
        </WorkspaceProvider>
      </WorkspaceErrorBoundary>
    </DesktopGuard>
  );
}
