import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { apiService, InterviewCreate } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  prefillDate?: string; // YYYY-MM-DD
}

interface AppOption {
  id: string;
  candidate_name: string;
  job_title: string;
}

const INTERVIEW_TYPES = ['Phone', 'Video', 'In-Person', 'Panel'];

const ScheduleInterviewModal: React.FC<Props> = ({ isOpen, onClose, onScheduled, prefillDate }) => {
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<InterviewCreate>({
    application_id: '',
    interview_date: prefillDate || '',
    interview_time: '09:00',
    location: '',
    interview_type: 'In-Person',
    notes: '',
    interviewer_name: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({ ...prev, interview_date: prefillDate || prev.interview_date }));
      setError('');
      setLoadingApps(true);
      apiService.getApplicationsForScheduling()
        .then(setApplications)
        .catch(() => setApplications([]))
        .finally(() => setLoadingApps(false));
    }
  }, [isOpen, prefillDate]);

  const handleChange = (field: keyof InterviewCreate, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.application_id || !form.interview_date || !form.interview_time || !form.location) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiService.createInterview(form);
      onScheduled();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const labelStyle: React.CSSProperties = { color: 'var(--text-secondary)' };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Schedule Interview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Application */}
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Application <span className="text-red-500">*</span>
            </label>
            {loadingApps ? (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading applications...</div>
            ) : (
              <select
                value={form.application_id}
                onChange={e => handleChange('application_id', e.target.value)}
                className="themed-select w-full rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">— Select an application —</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.candidate_name} — {app.job_title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.interview_date}
                onChange={e => handleChange('interview_date', e.target.value)}
                className="themed-input w-full rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.interview_time}
                onChange={e => handleChange('interview_time', e.target.value)}
                className="themed-input w-full rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Interview Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTERVIEW_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('interview_type', type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.interview_type === type
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : ''
                  }`}
                  style={form.interview_type !== type ? {
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                  } : { border: '1px solid transparent' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Location / Video Link <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="e.g. Room 302 or https://meet.google.com/..."
              className="themed-input w-full rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Interviewer Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Interviewer Name
            </label>
            <input
              type="text"
              value={form.interviewer_name}
              onChange={e => handleChange('interviewer_name', e.target.value)}
              placeholder="e.g. Dr. Santos"
              className="themed-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional instructions or preparation notes..."
              className="themed-input w-full rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
