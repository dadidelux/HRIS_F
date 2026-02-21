import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { JobPosting } from '../../types';

interface DeleteConfirmModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Delete
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium mb-2">
                Are you sure you want to delete this job posting?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The job posting and all
                associated data will be permanently deleted from the system.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Job Title:</span> {job.jobTitle}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Department:</span>{' '}
              {job.department}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
