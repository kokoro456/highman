export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          매장 운영 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Grid - Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '오늘 매출', value: '1,247,000', unit: '원', change: '+12.5%' },
          { label: '예약 건수', value: '23', unit: '건', change: '+3' },
          { label: '신규 고객', value: '7', unit: '명', change: '+2' },
          { label: '노쇼율', value: '4.2', unit: '%', change: '-1.3%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
          >
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
                {stat.value}
              </span>
              <span className="text-sm text-zinc-400">{stat.unit}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-brand-600">
              {stat.change} vs yesterday
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-700">오늘의 예약</h2>
          <p className="mt-4 text-sm text-zinc-400">예약 캘린더가 여기에 표시됩니다</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-700">최근 활동</h2>
          <p className="mt-4 text-sm text-zinc-400">최근 활동 내역이 여기에 표시됩니다</p>
        </div>
      </div>
    </div>
  );
}
