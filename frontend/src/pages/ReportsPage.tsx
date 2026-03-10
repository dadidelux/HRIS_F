import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, ClipboardList, Users, Calendar, BarChart3, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface RecentReport {
  title: string;
  type: 'CSV';
  date: string;
  filename: string;
  blob?: string; // base64 for re-download
}

const REPORT_TYPES = [
  {
    id: 'applicant-list',
    label: 'Applicant List',
    description: 'All applicants with contact info and status',
    icon: ClipboardList,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted Candidates',
    description: 'Candidates currently In-Process or Accepted',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'interview-results',
    label: 'Interview Results',
    description: 'All scheduled and completed interviews',
    icon: Calendar,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'hiring-summary',
    label: 'Hiring Summary',
    description: 'Aggregate hiring statistics',
    icon: BarChart3,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
] as const;

type ReportId = typeof REPORT_TYPES[number]['id'];

const STORAGE_KEY = 'hris_recent_reports';

const loadRecentReports = (): RecentReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentReports = (reports: RecentReport[]) => {
  // Keep last 10, don't persist blob data to avoid quota issues
  const toSave = reports.slice(0, 10).map(({ blob: _b, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const fmt = (v: any) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const buildCsv = (headers: string[], rows: string[][]): string => {
  return [headers, ...rows].map(row => row.map(fmt).join(',')).join('\n');
};

const ReportsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReportId>('applicant-list');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [recentReports, setRecentReports] = useState<RecentReport[]>(loadRecentReports);

  useEffect(() => {
    saveRecentReports(recentReports);
  }, [recentReports]);

  const generateReport = async () => {
    setGenerating(true);
    setError('');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const fileDate = now.toISOString().slice(0, 10);

    try {
      let csv = '';
      let title = '';
      let filename = '';

      if (selectedType === 'applicant-list') {
        title = 'Applicant Masterlist';
        filename = `applicant_list_${fileDate}.csv`;
        const apps = await apiService.getAllApplications();
        csv = buildCsv(
          ['Full Name', 'Email', 'Job Title', 'Department', 'Location', 'Status', 'Recruitment Stage', 'Applied Date'],
          apps.map(a => [
            a.user?.full_name || '',
            a.user?.email || '',
            a.job_posting?.job_title || '',
            a.job_posting?.department || '',
            a.job_posting?.location || '',
            a.status,
            a.recruitment_stage || '',
            a.applied_date,
          ])
        );
      } else if (selectedType === 'shortlisted') {
        title = 'Shortlisted Candidates';
        filename = `shortlisted_${fileDate}.csv`;
        const apps = await apiService.getAllApplications();
        const filtered = apps.filter(a => a.status === 'In-Process' || a.status === 'Accepted');
        csv = buildCsv(
          ['Full Name', 'Email', 'Job Title', 'Department', 'Status', 'Recruitment Stage', 'Applied Date'],
          filtered.map(a => [
            a.user?.full_name || '',
            a.user?.email || '',
            a.job_posting?.job_title || '',
            a.job_posting?.department || '',
            a.status,
            a.recruitment_stage || '',
            a.applied_date,
          ])
        );
      } else if (selectedType === 'interview-results') {
        title = 'Interview Results';
        filename = `interview_results_${fileDate}.csv`;
        const interviews = await apiService.getAllInterviews();
        csv = buildCsv(
          ['Interview Date', 'Time', 'Type', 'Status', 'Location', 'Interviewer', 'Notes'],
          interviews.map(iv => [
            iv.interview_date,
            iv.interview_time,
            iv.interview_type,
            iv.status,
            iv.location,
            iv.interviewer_name || '',
            iv.notes || '',
          ])
        );
      } else if (selectedType === 'hiring-summary') {
        title = 'Hiring Summary';
        filename = `hiring_summary_${fileDate}.csv`;
        const [apps, analytics] = await Promise.all([
          apiService.getAllApplications(),
          apiService.getAnalytics(),
        ]);
        const pending = apps.filter(a => a.status === 'Pending').length;
        const inProcess = apps.filter(a => a.status === 'In-Process').length;
        const accepted = apps.filter(a => a.status === 'Accepted').length;
        const rejected = apps.filter(a => a.status === 'Rejected').length;
        const withdrawn = apps.filter(a => a.status === 'Withdrawn').length;
        csv = buildCsv(
          ['Metric', 'Value'],
          [
            ['Total Applicants', String(apps.length)],
            ['Pending', String(pending)],
            ['In-Process', String(inProcess)],
            ['Accepted / Hired', String(accepted)],
            ['Rejected', String(rejected)],
            ['Withdrawn', String(withdrawn)],
            ['Offer Rate (%)', String(analytics.offer_rate)],
            ['Avg. Time to Hire (days)', String(analytics.avg_time_to_hire)],
            ['For Interview', String(analytics.for_interview)],
            ['Positions Filled', String(analytics.positions_filled)],
            ['Report Generated', now.toISOString()],
          ]
        );
      }

      downloadCsv(csv, filename);

      const report: RecentReport = { title, type: 'CSV', date: dateStr, filename };
      setRecentReports(prev => [report, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Generate and download recruitment reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel — report type selector */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">
            Generate Report
          </h2>

          <div className="space-y-2 mb-6">
            {REPORT_TYPES.map(rt => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all
                    ${selectedType === rt.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`w-9 h-9 rounded-lg ${rt.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={rt.color} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${selectedType === rt.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {rt.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{rt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-red-600 text-xs mb-3 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2 border border-red-200 dark:border-red-800">
              {error}
            </p>
          )}

          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {generating
              ? <Loader2 size={16} className="animate-spin" />
              : <Plus size={16} />
            }
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>

        {/* Right panel — recent reports */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">
            Recent Reports
          </h2>

          {recentReports.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reports generated yet.</p>
              <p className="text-xs mt-1">Select a report type and click Generate.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Report Title
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentReports.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {r.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{r.date}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          /* Re-generate the report */
                          const prev = selectedType;
                          const match = REPORT_TYPES.find(rt => rt.label === r.title);
                          if (match) {
                            setSelectedType(match.id);
                            setTimeout(generateReport, 50);
                          }
                          setSelectedType(prev);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Re-download"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
