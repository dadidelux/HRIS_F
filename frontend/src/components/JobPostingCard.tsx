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
  const statusStyle: React.CSSProperties =
    job.status === 'active'
      ? { backgroundColor: 'var(--status-accepted-bg)', color: 'var(--status-accepted-text)' }
      : { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' };

  return (
    <div
      className="rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {job.jobTitle}
          </h3>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium">Department:</span> {job.department}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium">Location:</span> {job.location}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={statusStyle}>
          {job.status}
        </span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Posted: {new Date(job.datePosted).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onView(job)}
            className="p-2 text-blue-600 rounded-lg transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-blue-600 rounded-lg transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(job)}
            className="p-2 text-red-600 rounded-lg transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--status-rejected-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
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
