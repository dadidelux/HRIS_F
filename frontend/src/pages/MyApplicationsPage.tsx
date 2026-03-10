import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

interface Application {
  id: string;
  job_posting_id: string;
  job_title: string;
  department: string;
  location: string;
  status: string;
  recruitment_stage?: string | null;
  applied_at: string;
  updated_at: string;
}

// Stage inline style helpers (use CSS variables for dark/light compat)
const stageStyle = (stage: string): React.CSSProperties => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    'Initial Screening': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    'Teaching Demo':     { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' },
    'Interview':         { bg: '#fef9c3', text: '#92400e', border: '#fcd34d' },
    'Final Selection':   { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
    'Job Offer':         { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    'Onboarding':        { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' },
  };
  const c = map[stage];
  if (!c) return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };
  return { backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` };
};

const statusStyle = (status: string): React.CSSProperties => {
  switch (status.toLowerCase()) {
    case 'pending':    return { backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' };
    case 'in-process': return { backgroundColor: 'var(--status-inprocess-bg)', color: 'var(--status-inprocess-text)' };
    case 'accepted':   return { backgroundColor: 'var(--status-accepted-bg)', color: 'var(--status-accepted-text)' };
    case 'rejected':   return { backgroundColor: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)' };
    case 'withdrawn':  return { backgroundColor: 'var(--status-withdrawn-bg)', color: 'var(--status-withdrawn-text)' };
    default:           return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
  }
};

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await apiService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div
          className="rounded-lg p-12 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No applications yet</h3>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            Start browsing jobs and apply to positions that match your skills.
          </p>
          <a
            href="/jobs"
            className="mt-4 inline-block btn-primary px-6 py-2"
          >
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-lg p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{app.job_title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {app.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Applied {formatDate(app.applied_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                    style={statusStyle(app.status)}
                  >
                    {app.status}
                  </span>
                  {app.recruitment_stage && (
                    <span
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                      style={stageStyle(app.recruitment_stage)}
                    >
                      <ArrowRight size={11} />
                      {app.recruitment_stage}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Timeline (simplified) */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>Last updated: {formatDate(app.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
