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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Interview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Application */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Application <span className="text-red-500">*</span>
            </label>
            {loadingApps ? (
              <div className="text-sm text-gray-400">Loading applications...</div>
            ) : (
              <select
                value={form.application_id}
                onChange={e => handleChange('application_id', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.interview_date}
                onChange={e => handleChange('interview_date', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.interview_time}
                onChange={e => handleChange('interview_time', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTERVIEW_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('interview_type', type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.interview_type === type
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location / Video Link <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="e.g. Room 302 or https://meet.google.com/..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Interviewer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interviewer Name
            </label>
            <input
              type="text"
              value={form.interviewer_name}
              onChange={e => handleChange('interviewer_name', e.target.value)}
              placeholder="e.g. Dr. Santos"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional instructions or preparation notes..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
