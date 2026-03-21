import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-zinc-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-[var(--sidebar-width)]">
        <Header />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
