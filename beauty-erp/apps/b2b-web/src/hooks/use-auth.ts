import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  data: { accessToken: string; refreshToken: string };
  message: string;
}

export function useLogin() {
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (response) => {
      setTokens(response.data.accessToken, response.data.refreshToken);
      router.push('/');
    },
  });
}

export function useRegister() {
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; phone?: string }) =>
      api.post<AuthResponse>('/auth/register', data),
    onSuccess: (response) => {
      setTokens(response.data.accessToken, response.data.refreshToken);
      router.push('/');
    },
  });
}
