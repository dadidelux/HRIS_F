import React from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, Users, User, FileText } from 'lucide-react';
import { Interview } from '../../services/api';

interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview;
  onReschedule: () => void;
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

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  isOpen,
  onClose,
  interview,
  onReschedule,
}) => {
  if (!isOpen) return null;

  const TypeIcon = getTypeIcon(interview.interview_type);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const canReschedule = interview.status === 'Scheduled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Interview Type and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TypeIcon size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {interview.interview_type} Interview
                </h3>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                interview.status
              )}`}
            >
              {interview.status}
            </span>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(interview.interview_date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock size={20} className="text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{formatTime(interview.interview_time)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
              <MapPin size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 break-all">{interview.location}</p>
              </div>
            </div>
          </div>

          {/* Interviewer */}
          {interview.interviewer_name && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User size={18} className="text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Interviewer</p>
              </div>
              <p className="text-blue-800 ml-6">{interview.interviewer_name}</p>
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Notes</p>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap ml-6">{interview.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {canReschedule && (
              <button
                onClick={onReschedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reschedule Interview
              </button>
            )}
            <button
              onClick={onClose}
              className={`${
                canReschedule ? 'flex-1' : 'w-full'
              } px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailsModal;
