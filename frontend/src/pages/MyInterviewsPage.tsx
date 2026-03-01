import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Building2, User } from 'lucide-react';
import { apiService } from '../services/api';

interface Interview {
  id: string;
  job_title: string;
  department: string;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location: string;
  interviewer_name: string;
  status: string;
  notes?: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
};

const MyInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await apiService.getMyInterviews();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const upcomingInterviews = interviews.filter(i => isUpcoming(i.interview_date) && i.status !== 'cancelled');
  const pastInterviews = interviews.filter(i => !isUpcoming(i.interview_date) || i.status === 'cancelled');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="text-gray-600">View and prepare for your upcoming interviews</p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No interviews scheduled</h3>
          <p className="mt-2 text-gray-500">
            When you're shortlisted for a position, your interview details will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.job_title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Building2 size={14} />
                          {interview.department}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          statusColors[interview.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(interview.interview_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>{interview.interview_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {interview.interview_type === 'video' ? (
                          <Video size={16} className="text-gray-400" />
                        ) : (
                          <MapPin size={16} className="text-gray-400" />
                        )}
                        <span>
                          {interview.interview_type === 'video'
                            ? 'Video Call'
                            : interview.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} className="text-gray-400" />
                        <span>{interview.interviewer_name}</span>
                      </div>
                    </div>

                    {interview.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">{interview.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Interviews */}
          {pastInterviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Interviews</h2>
              <div className="space-y-4">
                {pastInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 opacity-75"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.job_title}
                        </h3>
                        <p className="text-sm text-gray-500">{interview.department}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          statusColors[interview.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {formatDate(interview.interview_date)} at {interview.interview_time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyInterviewsPage;
