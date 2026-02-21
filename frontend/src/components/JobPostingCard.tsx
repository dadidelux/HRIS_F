import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { JobPosting } from '../types';

interface JobPostingCardProps {
  job: JobPosting;
  onEdit: (job: JobPosting) => void;
  onDelete: (job: JobPosting) => void;
  onView: (job: JobPosting) => void;
}

const JobPostingCard: React.FC<JobPostingCardProps> = ({
  job,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {job.jobTitle}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Department:</span> {job.department}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {job.location}
            </p>
          </div>
        </div>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          {job.status}
        </span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Posted: {new Date(job.datePosted).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onView(job)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(job)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCard;
