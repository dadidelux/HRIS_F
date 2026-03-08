import React, { useState, useEffect } from 'react';
import { Filter, FileText } from 'lucide-react';
import { apiService, Application } from '../services/api';
import ApplicationCard from '../components/applications/ApplicationCard';
import ApplicationDetailsModal from '../components/applications/ApplicationDetailsModal';

const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = ['All', 'Pending', 'In-Process', 'Accepted', 'Rejected', 'Withdrawn'];

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'All') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === statusFilter)
      );
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      await apiService.withdrawApplication(id);
      await fetchApplications();
      setSelectedApplication(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw application');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await fetchApplications();
    setSelectedApplication((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus as Application['status'] } : prev
    );
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track your job applications and their status
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter size={20} />
            <span className="font-medium">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
                {status === 'All' &&
                  ` (${applications.length})`}
                {status !== 'All' &&
                  ` (${applications.filter((app) => app.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onView={setSelectedApplication}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === 'All'
                ? 'No Applications Yet'
                : `No ${statusFilter} Applications`}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'All'
                ? 'Start by applying to job postings from the Job Postings page'
                : `You don't have any applications with status "${statusFilter}"`}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onWithdraw={handleWithdraw}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;
