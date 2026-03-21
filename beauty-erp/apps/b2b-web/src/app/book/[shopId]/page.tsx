import { Metadata } from 'next';
import { PublicBookingForm } from '@/components/book/public-booking-form';

type Props = { params: { shopId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/shops/public/${params.shopId}`);
    const { data: shop } = await res.json();
    return {
      title: `${shop?.name || '매장'} - 온라인 예약 | Beauty ERP`,
      description: `${shop?.name}에서 간편하게 온라인 예약하세요. 속눈썹, 네일, 왁싱 등 뷰티 서비스 예약`,
      openGraph: {
        title: `${shop?.name} - 온라인 예약`,
        description: `${shop?.name}에서 간편하게 온라인 예약하세요`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${shop?.name} - 온라인 예약`,
        description: `${shop?.name}에서 간편하게 온라인 예약하세요`,
      },
    };
  } catch {
    return { title: '온라인 예약 | Beauty ERP' };
  }
}

export default function PublicBookingPage({ params }: Props) {
  return <PublicBookingForm shopId={params.shopId} />;
}
