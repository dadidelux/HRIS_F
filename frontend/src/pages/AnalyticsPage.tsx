import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, BarChart3, Percent } from 'lucide-react';
import { apiService, AnalyticsData, MonthlyCount, SkillDemand } from '../services/api';

// ─── Line Chart ───────────────────────────────────────────────────────────────
const LineChart: React.FC<{ data: MonthlyCount[] }> = ({ data }) => {
  const W = 520;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - (d.count / maxVal) * chartH,
    count: d.count,
    month: d.month,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  // Area fill path
  const areaPath = [
    `M ${points[0].x} ${PAD.top + chartH}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${PAD.top + chartH}`,
    'Z',
  ].join(' ');

  // Y-axis gridlines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y: PAD.top + chartH - pct * chartH,
    label: Math.round(pct * maxVal),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridLines.map((gl, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={gl.y}
            x2={PAD.left + chartW} y2={gl.y}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 2"
          />
          <text x={PAD.left - 4} y={gl.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
            {gl.label}
          </text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#lineGrad)" />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" />
          {p.count > 0 && (
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#6b7280">
              {p.count}
            </text>
          )}
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6b7280'];

const DonutChart: React.FC<{ data: SkillDemand[] }> = ({ data }) => {
  const SIZE = 140;
  const R = 52;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
        No skills data yet
      </div>
    );
  }

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const slice = { path, color: DONUT_COLORS[i % DONUT_COLORS.length], ...d };
    startAngle = endAngle;
    return slice;
  });

  // Inner hole
  const innerR = 32;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-36 h-36">
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} />
      ))}
      {/* Hole */}
      <circle cx={CX} cy={CY} r={innerR} fill="white" className="dark:fill-gray-800" />
      <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">
        {data.length}
      </text>
      <text x={CX} y={CY + 16} textAnchor="middle" fontSize="8" fill="#9ca3af">
        skills
      </text>
    </svg>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(CURRENT_YEAR);

  useEffect(() => {
    setLoading(true);
    apiService.getAnalytics(year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-600" />
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Recruitment performance insights
          </p>
        </div>
        {/* Year filter */}
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : !data ? (
        <div className="text-center text-gray-500 py-12">Failed to load analytics.</div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<TrendingUp size={20} className="text-blue-600" />}
              bg="bg-blue-50 dark:bg-blue-900/20"
              label="Total Applicants"
              value={data.total_applicants}
              suffix=""
            />
            <StatCard
              icon={<BarChart3 size={20} className="text-purple-600" />}
              bg="bg-purple-50 dark:bg-purple-900/20"
              label="For Interview"
              value={data.for_interview}
              suffix=""
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-green-600" />}
              bg="bg-green-50 dark:bg-green-900/20"
              label="Positions Filled"
              value={data.positions_filled}
              suffix=""
            />
            <StatCard
              icon={<Percent size={20} className="text-orange-600" />}
              bg="bg-orange-50 dark:bg-orange-900/20"
              label="Offer Rate"
              value={data.offer_rate}
              suffix="%"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line chart — takes 2 cols */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                Applicants per Month — {year}
              </h2>
              <LineChart data={data.applicants_per_month} />
            </div>

            {/* Donut chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                Skills Demand
              </h2>
              <div className="flex items-center gap-4">
                <DonutChart data={data.skills_demand} />
                <div className="flex flex-col gap-2 min-w-0">
                  {data.skills_demand.map((s, i) => (
                    <div key={s.skill} className="flex items-center gap-2 text-xs min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                      <span className="text-gray-600 dark:text-gray-300 truncate">{s.skill}</span>
                      <span className="ml-auto text-gray-400 font-medium pl-1">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Clock size={24} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time to Hire</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.avg_time_to_hire}
                  <span className="text-lg font-normal text-gray-500 ml-1">days</span>
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Percent size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Offer Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.offer_rate}
                  <span className="text-lg font-normal text-gray-500 ml-1">%</span>
                </p>
                <p className="text-xs text-gray-400">
                  {data.accepted_applicants} accepted / {data.total_applicants} total
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat card helper
const StatCard: React.FC<{
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
  suffix: string;
}> = ({ icon, bg, label, value, suffix }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4">
    <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}{suffix}
      </p>
    </div>
  </div>
);

export default AnalyticsPage;
