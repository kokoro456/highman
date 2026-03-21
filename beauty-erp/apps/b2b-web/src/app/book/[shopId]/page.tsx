import { PublicBookingForm } from '@/components/book/public-booking-form';

interface Props {
  params: { shopId: string };
}

export default function PublicBookingPage({ params }: Props) {
  return <PublicBookingForm shopId={params.shopId} />;
}
