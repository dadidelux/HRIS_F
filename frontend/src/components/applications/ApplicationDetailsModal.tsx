import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Building2, FileText, User, ArrowRight } from 'lucide-react';
import { Application, apiService, RECRUITMENT_STAGES, RecruitmentStage } from '../../services/api';
import TimelineView from './TimelineView';
import { useAuth } from '../../contexts/AuthContext';

interface ApplicationDetailsModalProps {
  application: Application;
  onClose: () => void;
  onWithdraw?: (id: string) => void;
  onStatusUpdate?: (id: string, newStatus: string) => void;
}

const HR_ADMIN_STATUSES = ['In-Process', 'Accepted', 'Rejected'] as const;

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose,
  onWithdraw,
  onStatusUpdate,
}) => {
  const { user } = useAuth();
  const [localApplication, setLocalApplication] = useState<Application>(application);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string>('');
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    setLocalApplication(application);
  }, [application]);

  const isHrOrAdmin = user?.role === 'hr' || user?.role === 'admin';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Manila',
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(newStatus);
    setStatusError(null);
    const note = statusNote.trim();
    try {
      await apiService.updateApplication(localApplication.id, {
        status: newStatus,
        note: note || undefined,
      });
      setLocalApplication((prev) => ({
        ...prev,
        status: newStatus as Application['status'],
        timeline: [
          ...prev.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status changed to ${newStatus}`,
          },
        ],
      }));
      setStatusNote('');
      onStatusUpdate?.(localApplication.id, newStatus);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const statusButtonStyle = (status: string) => {
    if (status === 'In-Process') return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (status === 'Accepted') return 'bg-green-600 hover:bg-green-700 text-white';
    if (status === 'Rejected') return 'bg-red-600 hover:bg-red-700 text-white';
    return 'bg-gray-600 hover:bg-gray-700 text-white';
  };

  const canWithdraw = localApplication.status === 'Pending' || localApplication.status === 'In-Process';

  const handleStageChange = async (stage: RecruitmentStage) => {
    setUpdatingStage(true);
    setStatusError(null);
    try {
      await apiService.updateApplication(localApplication.id, { recruitment_stage: stage });
      setLocalApplication(prev => ({ ...prev, recruitment_stage: stage }));
      onStatusUpdate?.(localApplication.id, localApplication.status);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update stage');
    } finally {
      setUpdatingStage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Application Details</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Applicant Info (HR/Admin only) */}
          {isHrOrAdmin && localApplication.user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={18} className="text-blue-600" />
                <h4 className="font-semibold text-blue-900">Applicant</h4>
              </div>
              <p className="text-blue-900 font-medium">{localApplication.user.full_name}</p>
              <p className="text-blue-700 text-sm">{localApplication.user.email}</p>
            </div>
          )}

          {/* Job Information */}
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {localApplication.job_posting?.job_title}
            </h3>
            <div className="flex flex-wrap gap-4" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-2">
                <Building2 size={18} />
                {localApplication.job_posting?.department}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={18} />
                {localApplication.job_posting?.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                Applied on {formatDate(localApplication.applied_date)}
              </span>
            </div>
          </div>

          {/* Cover Letter */}
          {localApplication.cover_letter && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} style={{ color: 'var(--text-muted)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cover Letter</h4>
              </div>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
              >
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {localApplication.cover_letter}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Application Timeline</h4>
            <TimelineView timeline={localApplication.timeline} />
          </div>

          {/* HR/Admin Status Update */}
          {isHrOrAdmin && (
            <div className="space-y-5">
              {/* Status buttons */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Update Status</h4>
                {statusError && (
                  <p className="text-red-600 text-sm mb-2">{statusError}</p>
                )}
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note for this status change (optional)..."
                  rows={2}
                  className="themed-input w-full mb-3 px-3 py-2 rounded-lg text-sm resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {HR_ADMIN_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={localApplication.status === status || updatingStatus !== null}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonStyle(status)}`}
                    >
                      {updatingStatus === status ? 'Updating...' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recruitment Stage */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <ArrowRight size={16} className="text-blue-600" />
                  Recruitment Stage
                  {localApplication.recruitment_stage && (
                    <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {localApplication.recruitment_stage}
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {RECRUITMENT_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      disabled={localApplication.recruitment_stage === stage || updatingStage}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                        localApplication.recruitment_stage === stage
                          ? 'bg-blue-600 border-blue-600 text-white opacity-80'
                          : ''
                      }`}
                      style={localApplication.recruitment_stage !== stage ? {
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                      } : { border: '1px solid transparent' }}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
          >
            Close
          </button>
          {canWithdraw && onWithdraw && !isHrOrAdmin && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to withdraw this application?')) {
                  onWithdraw(localApplication.id);
                }
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Withdraw Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
