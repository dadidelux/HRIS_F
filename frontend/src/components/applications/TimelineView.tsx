import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { TimelineEvent } from '../../services/api';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Accepted':
      return <CheckCircle className="text-green-600" size={20} />;
    case 'Rejected':
      return <XCircle className="text-red-600" size={20} />;
    case 'In-Process':
      return <Clock className="text-blue-600" size={20} />;
    case 'Withdrawn':
      return <AlertCircle className="text-gray-600" size={20} />;
    default:
      return <Clock className="text-yellow-600" size={20} />;
  }
};

const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    });
  };

  // Sort timeline by timestamp (newest first)
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedTimeline.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              {getStatusIcon(event.status)}
            </div>
            {index < sortedTimeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-gray-900">{event.status}</h4>
              <span className="text-sm text-gray-500">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            {event.note && <p className="text-gray-600 text-sm">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
