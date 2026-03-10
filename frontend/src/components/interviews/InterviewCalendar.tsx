import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Phone, Users, User } from 'lucide-react';
import { Interview } from '../../services/api';

interface Props {
  interviews: Interview[];
  readonly?: boolean;
  onSelectInterview: (interview: Interview) => void;
  onSelectDate?: (date: string) => void; // YYYY-MM-DD, called only when not readonly
}

const TYPE_COLORS: Record<string, string> = {
  Phone:     'bg-blue-500 text-white',
  Video:     'bg-purple-500 text-white',
  'In-Person': 'bg-green-500 text-white',
  Panel:     'bg-orange-500 text-white',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Phone:     <Phone size={10} />,
  Video:     <Video size={10} />,
  'In-Person': <User size={10} />,
  Panel:     <Users size={10} />,
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
    const key = iv.interview_date; // already "YYYY-MM-DD" from backend
    if (!interviewsByDate.has(key)) interviewsByDate.set(key, []);
    interviewsByDate.get(key)!.push(iv);
  }

  // Calendar grid computation
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
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

  // Build grid cells: null = empty padding
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {MONTHS[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`pad-${idx}`} className="min-h-[90px] border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30" />;
          }
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayInterviews = interviewsByDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isLastCol = (idx + 1) % 7 === 0;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[90px] p-1.5 border-b border-r border-gray-100 dark:border-gray-700
                ${isLastCol ? 'border-r-0' : ''}
                ${!readonly && dayInterviews.length === 0 ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                transition-colors
              `}
            >
              {/* Day number */}
              <div className={`
                inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {day}
              </div>

              {/* Interview event chips */}
              <div className="space-y-0.5">
                {dayInterviews.slice(0, 3).map(iv => (
                  <button
                    key={iv.id}
                    onClick={e => { e.stopPropagation(); onSelectInterview(iv); }}
                    className={`
                      w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left text-xs font-medium truncate
                      ${TYPE_COLORS[iv.interview_type] || 'bg-gray-500 text-white'}
                      hover:opacity-80 transition-opacity
                    `}
                    title={`${iv.interview_type} — ${iv.interview_time}`}
                  >
                    {TYPE_ICONS[iv.interview_type]}
                    <span className="truncate">{iv.interview_time}</span>
                  </button>
                ))}
                {dayInterviews.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                    +{dayInterviews.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
        {Object.entries(TYPE_COLORS).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className={`w-3 h-3 rounded-sm ${cls}`} />
            {type}
          </div>
        ))}
        {!readonly && (
          <div className="ml-auto text-xs text-gray-400 dark:text-gray-500 italic">
            Click an empty day to schedule
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCalendar;
