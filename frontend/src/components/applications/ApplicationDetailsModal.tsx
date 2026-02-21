import React from 'react';
import { X, Calendar, MapPin, Building2, FileText } from 'lucide-react';
import { Application } from '../../services/api';
import TimelineView from './TimelineView';

interface ApplicationDetailsModalProps {
  application: Application;
  onClose: () => void;
  onWithdraw?: (id: string) => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose,
  onWithdraw,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {canWithdraw && onWithdraw && (
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
