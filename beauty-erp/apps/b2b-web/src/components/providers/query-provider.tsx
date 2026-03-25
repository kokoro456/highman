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
            staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetch on page navigation
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch when component remounts (page switch)
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
