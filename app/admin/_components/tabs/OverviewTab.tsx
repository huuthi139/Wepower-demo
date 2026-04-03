'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Recharts to avoid SSR issues
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });

interface DashboardData {
  overview: {
    total_users: number;
    new_users_today: number;
    new_users_week: number;
    total_courses: number;
    total_lessons: number;
    total_vip: number;
    total_premium: number;
    total_free: number;
  };
  top_courses: {
    course_id: string;
    title: string;
    student_count: number;
    lessons_count: number;
  }[];
  lesson_progress: {
    most_watched_lessons: {
      lesson_id: string;
      title: string;
      viewer_count: number;
    }[];
    total_watch_time_hours: number;
    avg_completion_rate: number;
  };
  recent_enrollments: {
    id: string;
    user_name: string;
    user_email: string;
    course_title: string;
    access_tier: string;
    created_at: string;
  }[];
  active_learners_today: number;
  users_by_day: { date: string; count: number }[];
  tier_distribution: { free: number; premium: number; vip: number };
  top_active_users: {
    user_id: string;
    name: string;
    email: string;
    lessons_completed: number;
    total_watch_seconds: number;
  }[];
}

const PIE_COLORS = ['#9333ea', '#00D4AA', '#eab308']; // purple for Free, teal for Premium, yellow for VIP

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function TierBadge({ tier }: { tier: string }) {
  const t = tier?.toLowerCase();
  const styles =
    t === 'vip' ? 'bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold border-gold/30' :
    t === 'premium' ? 'bg-teal/10 text-teal border-teal/20' :
    'bg-white/5 text-gray-400 border-white/10';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
      {tier?.toUpperCase() || 'FREE'}
    </span>
  );
}

// Skeleton loader
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
      <Skeleton className="w-10 h-10 rounded-lg mb-3" />
      <Skeleton className="w-16 h-7 mb-2" />
      <Skeleton className="w-20 h-4" />
    </div>
  );
}

export function OverviewTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-6 py-2.5 bg-teal/20 text-teal border border-teal/30 rounded-lg hover:bg-teal/30 transition-colors font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { overview, top_courses, lesson_progress, recent_enrollments, active_learners_today, users_by_day, tier_distribution, top_active_users } = data;

  const pieData = [
    { name: 'Free', value: overview.total_free },
    { name: 'Premium', value: overview.total_premium },
    { name: 'VIP', value: overview.total_vip },
  ];

  const statCards = [
    { icon: '👥', value: overview.total_users, label: 'Học viên', sub: `+${overview.new_users_today} hôm nay`, gradient: 'from-teal/20 to-teal/5', border: 'border-teal/20', color: 'text-white' },
    { icon: '⭐', value: overview.total_vip, label: 'VIP', sub: `${overview.total_users ? Math.round(overview.total_vip / overview.total_users * 100) : 0}%`, gradient: 'from-gold/20 to-amber-500/5', border: 'border-gold/20', color: 'text-gold' },
    { icon: '💎', value: overview.total_premium, label: 'Premium', sub: `${overview.total_users ? Math.round(overview.total_premium / overview.total_users * 100) : 0}%`, gradient: 'from-teal/15 to-teal/5', border: 'border-teal/20', color: 'text-teal' },
    { icon: '📚', value: overview.total_courses, label: 'Khoá học', sub: 'đang hoạt động', gradient: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20', color: 'text-white' },
    { icon: '🎬', value: overview.total_lessons, label: 'Bài học', sub: `${active_learners_today} đang học hôm nay`, gradient: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', color: 'text-white' },
    { icon: '⏱', value: `${lesson_progress.total_watch_time_hours}h`, label: 'Tổng giờ xem', sub: `Hoàn thành TB: ${lesson_progress.avg_completion_rate}%`, gradient: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20', color: 'text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* ROW 1 — Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-5 hover:shadow-lg hover:shadow-teal/5 transition-all duration-300 group`}
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</div>
            <p className="text-sm text-gray-400">{card.label}</p>
            {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ROW 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart — User Growth */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Học viên mới 30 ngày</h3>
            <span className="text-xs text-gray-500">+{overview.new_users_week} tuần này</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={users_by_day}>
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => String(v).slice(5)}
                  stroke="#4b5563"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  labelFormatter={(v) => `Ngày ${v}`}
                  formatter={(value) => [`${value} người`, 'Đăng ký']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00D4AA"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#00D4AA', stroke: '#0A0F1C', strokeWidth: 2 }}
                  fill="url(#tealGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — Membership Distribution */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Phân bổ thành viên</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  formatter={(value, name) => [`${value} người`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-xs text-gray-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 — Top Courses & Most Watched Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Courses */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top 5 Khoá học</h3>
          {top_courses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_courses} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#00D4AA" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={140}
                    stroke="#4b5563"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => { const s = String(v); return s.length > 20 ? s.slice(0, 20) + '...' : s; }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    formatter={(value) => [`${value} học viên`, 'Số học viên']}
                  />
                  <Bar dataKey="student_count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top 10 Most Watched Lessons */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-lg font-bold text-white">Top 10 Bài học xem nhiều nhất</h3>
          </div>
          {lesson_progress.most_watched_lessons.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {lesson_progress.most_watched_lessons.map((lesson, i) => (
                <div key={lesson.lesson_id} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    i < 3 ? 'bg-teal/20 text-teal' : 'bg-white/10 text-gray-400'
                  }`}>{i + 1}</span>
                  <span className="text-sm text-gray-300 flex-1 truncate">{lesson.title}</span>
                  <span className="text-xs text-teal font-semibold whitespace-nowrap">{lesson.viewer_count} lượt</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 4 — Recent Enrollments */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold text-white">10 đăng ký khoá học gần đây</h3>
        </div>
        {recent_enrollments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Chưa có đăng ký mới</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khoá học</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tier</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recent_enrollments.map(enrollment => (
                  <tr key={enrollment.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-white">{enrollment.user_name}</td>
                    <td className="p-4 text-sm text-gray-400">{enrollment.user_email}</td>
                    <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate">{enrollment.course_title}</td>
                    <td className="p-4"><TierBadge tier={enrollment.access_tier} /></td>
                    <td className="p-4 text-xs text-gray-500">{formatTimeAgo(enrollment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROW 5 — Top Active Users */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold text-white">Top 10 Học viên học nhiều nhất</h3>
        </div>
        {top_active_users.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">#</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Bài đã học</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Giờ học</th>
                </tr>
              </thead>
              <tbody>
                {top_active_users.map((user, i) => (
                  <tr key={user.user_id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                        i < 3 ? 'bg-gold/20 text-gold' : 'bg-white/10 text-gray-400'
                      }`}>{i + 1}</span>
                    </td>
                    <td className="p-4 text-sm text-white font-medium">{user.name}</td>
                    <td className="p-4 text-sm text-gray-400">{user.email}</td>
                    <td className="p-4 text-sm text-teal font-semibold">{user.lessons_completed}</td>
                    <td className="p-4 text-sm text-gray-300">{Math.round(user.total_watch_seconds / 3600 * 10) / 10}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Access tier distribution mini stat */}
      <div className="grid grid-cols-3 gap-4">
        {(['free', 'premium', 'vip'] as const).map(tier => (
          <div key={tier} className={`rounded-xl p-4 text-center border ${
            tier === 'vip' ? 'bg-gold/10 border-gold/20' :
            tier === 'premium' ? 'bg-teal/10 border-teal/20' :
            'bg-white/[0.03] border-white/10'
          }`}>
            <div className={`text-xl font-bold ${
              tier === 'vip' ? 'text-gold' : tier === 'premium' ? 'text-teal' : 'text-gray-300'
            }`}>{tier_distribution[tier]}</div>
            <div className="text-xs text-gray-400 mt-1">Quyền truy cập {tier.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
