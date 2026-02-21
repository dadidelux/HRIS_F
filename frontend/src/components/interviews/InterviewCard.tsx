import React from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Users, User } from 'lucide-react';
import { Interview } from '../../services/api';

interface InterviewCardProps {
  interview: Interview;
  onView: (interview: Interview) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Video':
      return Video;
    case 'Phone':
      return Phone;
    case 'Panel':
      return Users;
    case 'In-Person':
      return User;
    default:
      return Video;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Rescheduled':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onView }) => {
  const TypeIcon = getTypeIcon(interview.interview_type);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {interview.interview_type} Interview
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{formatDate(interview.interview_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>{formatTime(interview.interview_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span className="truncate">{interview.location}</span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            interview.status
          )}`}
        >
          {interview.status}
        </span>
      </div>

      {interview.interviewer_name && (
        <div className="mb-4 text-sm text-gray-600">
          Interviewer: <span className="font-medium">{interview.interviewer_name}</span>
        </div>
      )}

      <button
        onClick={() => onView(interview)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

export default InterviewCard;
