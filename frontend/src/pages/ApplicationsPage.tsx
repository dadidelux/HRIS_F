import React, { useState, useEffect } from 'react';
import { Filter, FileText, Eye } from 'lucide-react';
import { apiService, Application } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ApplicationCard from '../components/applications/ApplicationCard';
import ApplicationDetailsModal from '../components/applications/ApplicationDetailsModal';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Pending':      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'In-Process':  return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Accepted':    return 'bg-green-100 text-green-700 border-green-200';
    case 'Rejected':    return 'bg-red-100 text-red-700 border-red-200';
    case 'Withdrawn':   return 'bg-gray-100 text-gray-700 border-gray-200';
    default:            return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const isHrOrAdmin = user?.role === 'hr' || user?.role === 'admin';

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isHrOrAdmin ? 'Applications' : 'My Applications'}
          </h1>
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isHrOrAdmin ? 'Applications' : 'My Applications'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isHrOrAdmin
            ? 'Review and manage all candidate applications'
            : 'Track your job applications and their status'}
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
                {status === 'All'
                  ? ` (${applications.length})`
                  : ` (${applications.filter((app) => app.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === 'All' ? 'No Applications Yet' : `No ${statusFilter} Applications`}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'All'
                ? isHrOrAdmin
                  ? 'No applications have been submitted yet'
                  : 'Start by applying to job postings from the Job Postings page'
                : `No applications with status "${statusFilter}"`}
            </p>
          </div>
        ) : isHrOrAdmin ? (
          /* HR/Admin Table View */
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">Applicant</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Job Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Applied</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {application.user?.full_name || '—'}
                      </p>
                      <p className="text-gray-500 text-xs">{application.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {application.job_posting?.job_title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {application.job_posting?.department || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(application.applied_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Candidate Card View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onView={setSelectedApplication}
              />
            ))}
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
