export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">고객 상세</h1>
      <p className="mt-1 text-sm text-zinc-500">고객 ID: {params.id}</p>
    </div>
  );
}
