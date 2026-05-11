"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { PlatformGuard } from "@/components/auth/platform-guard";
import { RouteTransition } from "@/components/navigation/route-transition";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PlatformGuard>
        <RouteTransition>{children}</RouteTransition>
      </PlatformGuard>
    </AuthProvider>
  );
}
