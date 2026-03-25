import { Metadata } from 'next';
import { HowToUseGuide } from '@/components/guide/how-to-use';

export const metadata: Metadata = {
  title: '사용 가이드 | Beauty ERP',
  description: 'Beauty ERP 사용 방법을 안내합니다. 매장 운영의 모든 것을 한 곳에서 관리하세요.',
};

export default function GuidePage() {
  return <HowToUseGuide />;
}
