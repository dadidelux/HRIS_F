import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Building2, User, LayoutGrid, CalendarDays } from 'lucide-react';
import { apiService, Interview } from '../services/api';
import InterviewCalendar from '../components/interviews/InterviewCalendar';
import InterviewDetailsModal from '../components/interviews/InterviewDetailsModal';

interface MyInterview {
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
  Scheduled:   'bg-blue-100 text-blue-800',
  Completed:   'bg-gray-100 text-gray-800',
  Cancelled:   'bg-red-100 text-red-800',
  Rescheduled: 'bg-yellow-100 text-yellow-800',
};

type Tab = 'upcoming' | 'past' | 'calendar';

const MyInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<MyInterview[]>([]);
  const [calendarInterviews, setCalendarInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const [myData, allData] = await Promise.all([
        apiService.getMyInterviews(),
        apiService.getAllInterviews(),
      ]);
      setInterviews(myData);
      setCalendarInterviews(allData);
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

  const isUpcoming = (dateString: string) => new Date(dateString) >= new Date();

  const upcomingInterviews = interviews.filter(i => isUpcoming(i.interview_date) && i.status !== 'Cancelled');
  const pastInterviews = interviews.filter(i => !isUpcoming(i.interview_date) || i.status === 'Cancelled');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: <LayoutGrid size={15} /> },
    { key: 'past', label: 'Past', icon: <LayoutGrid size={15} /> },
    { key: 'calendar', label: 'Calendar', icon: <CalendarDays size={15} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Interviews</h1>
        <p className="text-gray-600 dark:text-gray-400">View and prepare for your upcoming interviews</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 pb-3 pt-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <InterviewCalendar
          interviews={calendarInterviews}
          readonly={true}
          onSelectInterview={(iv) => { setSelectedInterview(iv); setIsDetailsModalOpen(true); }}
        />
      )}

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <>
          {upcomingInterviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No upcoming interviews</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                When you're shortlisted for a position, your interview details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{interview.job_title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Building2 size={14} />
                        {interview.department}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[interview.status] || 'bg-gray-100 text-gray-800'}`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{formatDate(interview.interview_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={16} className="text-gray-400" />
                      <span>{interview.interview_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      {interview.interview_type === 'Video' ? (
                        <Video size={16} className="text-gray-400" />
                      ) : (
                        <MapPin size={16} className="text-gray-400" />
                      )}
                      <span>{interview.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <User size={16} className="text-gray-400" />
                      <span>{interview.interviewer_name || '—'}</span>
                    </div>
                  </div>
                  {interview.notes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">{interview.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Past Tab */}
      {activeTab === 'past' && (
        <>
          {pastInterviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No past interviews</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {pastInterviews.map((interview) => (
                <div key={interview.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{interview.job_title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{interview.department}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[interview.status] || 'bg-gray-100 text-gray-800'}`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(interview.interview_date)} at {interview.interview_time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Details Modal (read-only for candidates) */}
      {selectedInterview && (
        <InterviewDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          interview={selectedInterview}
          onReschedule={() => {}}
        />
      )}
    </div>
  );
};

export default MyInterviewsPage;
