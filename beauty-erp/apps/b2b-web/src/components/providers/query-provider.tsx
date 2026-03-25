'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Keep Render free tier alive (pings API every 4 minutes)
function useKeepAlive() {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const ping = () => {
      fetch(`${apiUrl}/api/health`, { method: 'GET' }).catch(() => {});
    };

    // Ping immediately on app load to wake up sleeping server
    ping();

    // Then every 4 minutes
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useKeepAlive();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
