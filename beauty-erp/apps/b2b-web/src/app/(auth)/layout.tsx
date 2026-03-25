import { ToastContainer } from '@/components/ui/toast';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6] px-4">
      {children}
      <ToastContainer />
    </div>
  );
}
