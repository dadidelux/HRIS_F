import { useState, useEffect } from 'react';
import JobPostingCard from '../components/JobPostingCard';
import CreateJobModal from '../components/modals/CreateJobModal';
import ViewDetailsModal from '../components/modals/ViewDetailsModal';
import EditJobModal from '../components/modals/EditJobModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import { JobPosting, CreateJobPostingData } from '../types';
import { apiService } from '../services/api';
import { Plus, Loader2 } from 'lucide-react';

function JobPostingsPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getAllJobPostings();
      const convertedData = data.map(job => ({
        id: job.id,
        jobTitle: job.job_title,
        department: job.department,
        location: job.location,
        status: job.status,
        datePosted: job.date_posted,
        applicationDeadline: job.application_deadline,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
      }));
      setJobPostings(convertedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job postings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (data: CreateJobPostingData) => {
    try {
      const backendData = {
        job_title: data.jobTitle,
        department: data.department,
        location: data.location,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        application_deadline: data.applicationDeadline,
      };
      await apiService.createJobPosting(backendData);
      await fetchJobPostings();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create job posting');
    }
  };

  const handleEditJob = async (updatedJob: JobPosting) => {
    try {
      const backendData = {
        job_title: updatedJob.jobTitle,
        department: updatedJob.department,
        location: updatedJob.location,
        description: updatedJob.description,
        requirements: updatedJob.requirements,
        responsibilities: updatedJob.responsibilities,
        application_deadline: updatedJob.applicationDeadline,
      };
      await apiService.updateJobPosting(updatedJob.id, backendData);
      await fetchJobPostings();
      setIsEditModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update job posting');
    }
  };

  const handleDeleteJob = async () => {
    if (selectedJob) {
      try {
        await apiService.deleteJobPosting(selectedJob.id);
        await fetchJobPostings();
        setIsDeleteModalOpen(false);
        setSelectedJob(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete job posting');
      }
    }
  };

  const openViewModal = (job: JobPosting) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const openEditModal = (job: JobPosting) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b px-8 py-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Job Postings</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage and track all job postings
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Job Posting
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button onClick={fetchJobPostings} className="btn-primary">
              Retry
            </button>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              No job postings yet. Create your first posting!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPostings.map((job) => (
              <JobPostingCard
                key={job.id}
                job={job}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onView={openViewModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateJob}
      />

      <ViewDetailsModal
        job={selectedJob!}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedJob(null);
        }}
      />

      <EditJobModal
        job={selectedJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedJob(null);
        }}
        onSave={handleEditJob}
      />

      <DeleteConfirmModal
        job={selectedJob}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}

export default JobPostingsPage;
