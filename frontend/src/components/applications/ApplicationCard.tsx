import React from 'react';
import { Calendar, MapPin, Building2, Eye, User } from 'lucide-react';
import { Application } from '../../services/api';

interface ApplicationCardProps {
  application: Application;
  onView: (application: Application) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'In-Process':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Accepted':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Withdrawn':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onView }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.job_posting?.job_title || 'Job Position'}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 size={16} />
              {application.job_posting?.department || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {application.job_posting?.location || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              Applied {formatDate(application.applied_date)}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            application.status
          )}`}
        >
          {application.status}
        </span>
      </div>

      {application.cover_letter && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {application.cover_letter}
          </p>
        </div>
      )}

      {application.applicant && (
        <div className="flex items-center gap-1 mb-3 text-sm text-gray-700">
          <User size={14} className="text-gray-500" />
          <span className="font-medium">{application.applicant.full_name}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{application.applicant.email}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {application.timeline.length} status update{application.timeline.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => onView(application)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
