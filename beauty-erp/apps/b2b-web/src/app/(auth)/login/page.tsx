import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: '로그인 | Beauty ERP',
  description: 'Beauty ERP에 로그인하세요. 뷰티 매장 관리 시스템',
};

export default function LoginPage() {
  return <LoginForm />;
}
