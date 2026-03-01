export interface JobPosting {
  id: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
  datePosted: string;
  applicationDeadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface CreateJobPostingData {
  jobTitle: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  applicationDeadline: string;
}
