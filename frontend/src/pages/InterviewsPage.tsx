import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import InterviewCard from '../components/interviews/InterviewCard';
import InterviewDetailsModal from '../components/interviews/InterviewDetailsModal';
import RescheduleModal from '../components/interviews/RescheduleModal';
import { apiService, Interview, InterviewUpdate } from '../services/api';

const InterviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, [activeTab]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllInterviews(activeTab);
      setInterviews(data);
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interviews</h1>
        <p className="text-gray-600">Manage your interview schedule</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
            activeTab === 'upcoming'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading interviews...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && interviews.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab} interviews
          </h3>
          <p className="text-gray-600">
            {activeTab === 'upcoming'
              ? 'You have no scheduled interviews at the moment.'
              : 'You have not completed any interviews yet.'}
          </p>
        </div>
      )}

      {/* Interview Cards Grid */}
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
    </div>
  );
};

export default InterviewsPage;
