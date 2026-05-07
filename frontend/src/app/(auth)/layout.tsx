export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md border-4 border-text bg-background p-8 shadow-[8px_8px_0px_rgba(var(--color-border-rgb),0.1)]">
        {children}
      </div>
    </div>
  );
}
