import React from 'react';
import { X } from 'lucide-react';
import { JobPosting } from '../../types';

interface ViewDetailsModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Position */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Job Position
            </label>
            <p className="text-gray-900">{job.jobTitle}</p>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Department
            </label>
            <p className="text-gray-900">{job.department}</p>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Location
            </label>
            <p className="text-gray-900">{job.location}</p>
          </div>

          {/* Job Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Job Description
            </label>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Requirements & Qualifications
            </label>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Responsibilities */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Responsibilities
            </label>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>

          {/* Application Deadline */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Application Deadline
            </label>
            <p className="text-gray-900">
              {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
