import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: '회원가입 | Beauty ERP',
  description: 'Beauty ERP에 가입하세요. 뷰티 매장을 위한 통합 관리 시스템',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
