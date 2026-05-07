"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { PlatformGuard } from "@/components/auth/platform-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PlatformGuard>{children}</PlatformGuard>
    </AuthProvider>
  );
}
