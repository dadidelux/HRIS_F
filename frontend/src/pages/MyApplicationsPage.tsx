import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

interface Application {
  id: string;
  job_posting_id: string;
  job_title: string;
  department: string;
  location: string;
  status: string;
  recruitment_stage?: string | null;
  applied_at: string;
  updated_at: string;
}

const STAGE_COLORS: Record<string, string> = {
  'Initial Screening': 'bg-blue-100 text-blue-800 border-blue-200',
  'Teaching Demo':     'bg-purple-100 text-purple-800 border-purple-200',
  'Interview':         'bg-amber-100 text-amber-800 border-amber-200',
  'Final Selection':   'bg-orange-100 text-orange-800 border-orange-200',
  'Job Offer':         'bg-green-100 text-green-800 border-green-200',
  'Onboarding':        'bg-teal-100 text-teal-800 border-teal-200',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-green-100 text-green-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await apiService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-2 text-gray-500">
            Start browsing jobs and apply to positions that match your skills.
          </p>
          <a
            href="/jobs"
            className="mt-4 inline-block btn-primary px-6 py-2"
          >
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.job_title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {app.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Applied {formatDate(app.applied_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      statusColors[app.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {app.status}
                  </span>
                  {app.recruitment_stage && (
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        STAGE_COLORS[app.recruitment_stage] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      <ArrowRight size={11} />
                      {app.recruitment_stage}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Timeline (simplified) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Last updated: {formatDate(app.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
