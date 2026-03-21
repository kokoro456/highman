export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 px-4">
      {children}
    </div>
  );
}
