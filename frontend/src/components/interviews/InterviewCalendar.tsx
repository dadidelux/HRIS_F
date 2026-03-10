import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Phone, Users, User } from 'lucide-react';
import { Interview } from '../../services/api';

interface Props {
  interviews: Interview[];
  readonly?: boolean;
  onSelectInterview: (interview: Interview) => void;
  onSelectDate?: (date: string) => void; // YYYY-MM-DD, called only when not readonly
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Phone:       { bg: '#3b82f6', text: '#fff' },
  Video:       { bg: '#8b5cf6', text: '#fff' },
  'In-Person': { bg: '#22c55e', text: '#fff' },
  Panel:       { bg: '#f97316', text: '#fff' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Phone:       <Phone size={10} />,
  Video:       <Video size={10} />,
  'In-Person': <User size={10} />,
  Panel:       <Users size={10} />,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const InterviewCalendar: React.FC<Props> = ({
  interviews,
  readonly = false,
  onSelectInterview,
  onSelectDate,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // Build a map: date string → Interview[]
  const interviewsByDate = new Map<string, Interview[]>();
  for (const iv of interviews) {
    const key = iv.interview_date;
    if (!interviewsByDate.has(key)) interviewsByDate.set(key, []);
    interviewsByDate.get(key)!.push(iv);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toYMD(today);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDayClick = (day: number) => {
    if (readonly) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayInterviews = interviewsByDate.get(dateStr) || [];
    if (dayInterviews.length === 0 && onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Calendar header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
        {DAYS.map(d => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`pad-${idx}`}
                className="min-h-[90px]"
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              />
            );
          }
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayInterviews = interviewsByDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isLastCol = (idx + 1) % 7 === 0;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className="min-h-[90px] p-1.5 transition-colors"
              style={{
                borderBottom: '1px solid var(--border-light)',
                borderRight: isLastCol ? 'none' : '1px solid var(--border-light)',
                cursor: !readonly && dayInterviews.length === 0 ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (!readonly && dayInterviews.length === 0) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-light)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              {/* Day number */}
              <div
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1"
                style={{
                  backgroundColor: isToday ? '#2563eb' : 'transparent',
                  color: isToday ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {day}
              </div>

              {/* Interview event chips */}
              <div className="space-y-0.5">
                {dayInterviews.slice(0, 3).map(iv => {
                  const tc = TYPE_COLORS[iv.interview_type] || { bg: '#6b7280', text: '#fff' };
                  return (
                    <button
                      key={iv.id}
                      onClick={e => { e.stopPropagation(); onSelectInterview(iv); }}
                      className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left text-xs font-medium truncate hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: tc.bg, color: tc.text }}
                      title={`${iv.interview_type} — ${iv.interview_time}`}
                    >
                      {TYPE_ICONS[iv.interview_type]}
                      <span className="truncate">{iv.interview_time}</span>
                    </button>
                  );
                })}
                {dayInterviews.length > 3 && (
                  <p className="text-xs pl-1" style={{ color: 'var(--text-muted)' }}>
                    +{dayInterviews.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-4 px-5 py-3 border-t"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.bg }} />
            {type}
          </div>
        ))}
        {!readonly && (
          <div className="ml-auto text-xs italic" style={{ color: 'var(--text-muted)' }}>
            Click an empty day to schedule
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCalendar;
