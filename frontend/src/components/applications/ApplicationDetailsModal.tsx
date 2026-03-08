import React, { useState } from 'react';
import { X, Calendar, MapPin, Building2, FileText, User } from 'lucide-react';
import { Application, apiService } from '../../services/api';
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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

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
    try {
      await apiService.updateApplication(application.id, { status: newStatus });
      onStatusUpdate?.(application.id, newStatus);
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

  const canWithdraw = application.status === 'Pending' || application.status === 'In-Process';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Applicant Info (HR/Admin only) */}
          {isHrOrAdmin && application.applicant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={18} className="text-blue-600" />
                <h4 className="font-semibold text-blue-900">Applicant</h4>
              </div>
              <p className="text-blue-900 font-medium">{application.applicant.full_name}</p>
              <p className="text-blue-700 text-sm">{application.applicant.email}</p>
            </div>
          )}

          {/* Job Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {application.job_posting?.job_title}
            </h3>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Building2 size={18} />
                {application.job_posting?.department}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={18} />
                {application.job_posting?.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                Applied on {formatDate(application.applied_date)}
              </span>
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-gray-600" />
                <h4 className="font-semibold text-gray-900">Cover Letter</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Application Timeline</h4>
            <TimelineView timeline={application.timeline} />
          </div>

          {/* HR/Admin Status Update */}
          {isHrOrAdmin && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
              {statusError && (
                <p className="text-red-600 text-sm mb-2">{statusError}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {HR_ADMIN_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={application.status === status || updatingStatus !== null}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonStyle(status)}`}
                  >
                    {updatingStatus === status ? 'Updating...' : status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {canWithdraw && onWithdraw && !isHrOrAdmin && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to withdraw this application?')) {
                  onWithdraw(application.id);
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
