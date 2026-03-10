import React, { useState, useEffect } from 'react';
import { Calendar, LayoutGrid, CalendarDays, Plus } from 'lucide-react';
import InterviewCard from '../components/interviews/InterviewCard';
import InterviewDetailsModal from '../components/interviews/InterviewDetailsModal';
import RescheduleModal from '../components/interviews/RescheduleModal';
import InterviewCalendar from '../components/interviews/InterviewCalendar';
import ScheduleInterviewModal from '../components/interviews/ScheduleInterviewModal';
import { apiService, Interview, InterviewUpdate } from '../services/api';

type Tab = 'upcoming' | 'completed' | 'calendar';

const InterviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();

  useEffect(() => {
    loadInterviews();
  }, [activeTab]);

  // Always keep all interviews loaded for the calendar
  useEffect(() => {
    apiService.getAllInterviews().then(setAllInterviews).catch(() => {});
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      if (activeTab === 'calendar') {
        const data = await apiService.getAllInterviews();
        setInterviews(data);
        setAllInterviews(data);
      } else {
        const data = await apiService.getAllInterviews(activeTab);
        setInterviews(data);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailsModalOpen(true);
  };

  const handleReschedule = async (interviewId: string, data: InterviewUpdate) => {
    await apiService.updateInterview(interviewId, data);
    await loadInterviews();
    setIsRescheduleModalOpen(false);
    setIsDetailsModalOpen(false);
  };

  const openRescheduleModal = () => {
    setIsDetailsModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const handleDateClick = (date: string) => {
    setPrefillDate(date);
    setIsScheduleModalOpen(true);
  };

  const handleScheduled = () => {
    loadInterviews();
    apiService.getAllInterviews().then(setAllInterviews).catch(() => {});
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: <LayoutGrid size={15} /> },
    { key: 'completed', label: 'Completed', icon: <LayoutGrid size={15} /> },
    { key: 'calendar', label: 'Calendar', icon: <CalendarDays size={15} /> },
  ];

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Interviews</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your interview schedule</p>
        </div>
        <button
          onClick={() => { setPrefillDate(undefined); setIsScheduleModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Schedule Interview
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 pb-3 pt-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'text-blue-600 border-blue-600'
                : 'border-transparent'
            }`}
            style={activeTab !== tab.key ? { color: 'var(--text-muted)' } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <InterviewCalendar
          interviews={allInterviews}
          readonly={false}
          onSelectInterview={handleViewDetails}
          onSelectDate={handleDateClick}
        />
      )}

      {/* List Tabs */}
      {activeTab !== 'calendar' && (
        <>
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Loading interviews...</p>
            </div>
          )}

          {!loading && interviews.length === 0 && (
            <div
              className="text-center py-12 rounded-xl border-2 border-dashed"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No {activeTab} interviews
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'upcoming'
                  ? 'You have no scheduled interviews at the moment.'
                  : 'You have not completed any interviews yet.'}
              </p>
            </div>
          )}

          {!loading && interviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onView={handleViewDetails}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedInterview && (
        <>
          <InterviewDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            interview={selectedInterview}
            onReschedule={openRescheduleModal}
          />
          <RescheduleModal
            isOpen={isRescheduleModalOpen}
            onClose={() => setIsRescheduleModalOpen(false)}
            interview={selectedInterview}
            onReschedule={handleReschedule}
          />
        </>
      )}

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={handleScheduled}
        prefillDate={prefillDate}
      />
    </div>
  );
};

export default InterviewsPage;
