import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Building2, ChevronRight } from 'lucide-react';
import { apiService, JobPosting } from '../services/api';

const BrowseJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiService.getJobPostings();
      // Only show active/open jobs to candidates
      const activeJobs = data.filter(job =>
        job.status.toLowerCase() === 'open' ||
        job.status.toLowerCase() === 'active'
      );
      setJobs(activeJobs);
      if (activeJobs.length > 0) {
        setSelectedJob(activeJobs[0]);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = async (jobId: string) => {
    try {
      await apiService.applyToJob(jobId);
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to apply');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600">Find your next opportunity</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, department, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No jobs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.job_title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {job.employment_type && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {job.employment_type}
                        </span>
                      )}
                      {job.salary_range && (
                        <span className="text-sm text-gray-500">{job.salary_range}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Job Details */}
          {selectedJob && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedJob.job_title}</h2>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {selectedJob.department}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {selectedJob.location}
                </span>
{selectedJob.employment_type && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {selectedJob.employment_type}
                  </span>
                )}
              </div>

              {selectedJob.salary_range && (
                <p className="mt-3 text-lg font-semibold text-green-600">
                  {selectedJob.salary_range}
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleApply(selectedJob.id)}
                className="mt-6 w-full btn-primary py-3"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;
