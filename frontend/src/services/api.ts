const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface JobPosting {
  id: string;
  job_title: string;
  department: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Closed';
  date_posted: string;
  application_deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateJobPostingData {
  job_title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  application_deadline: string;
}

export interface UpdateJobPostingData {
  job_title?: string;
  department?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  application_deadline?: string;
  status?: 'Active' | 'Inactive' | 'Closed';
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile_picture?: string;
  is_active: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface DashboardStats {
  total_users: number;
  total_job_postings: number;
  active_job_postings: number;
  total_interviews: number;
  user: {
    full_name: string;
    email: string;
    role: string;
  };
}

export interface JobCategory {
  name: string;
  count: number;
  icon: string;
}

export interface Profile {
  id: string;
  user_id: string;
  bio?: string;
  skills: string[];
  phone?: string;
  address?: string;
  documents: DocumentInfo[];
  created_at: string;
  updated_at: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface ProfileUpdate {
  bio?: string;
  skills?: string[];
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_posting_id: string;
  status: 'Pending' | 'In-Process' | 'Accepted' | 'Rejected' | 'Withdrawn';
  applied_date: string;
  cover_letter?: string;
  documents: any[];
  timeline: TimelineEvent[];
  created_at: string;
  updated_at: string;
  job_posting?: {
    id: string;
    job_title: string;
    department: string;
    location: string;
    status: string;
  };
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

export interface ApplicationCreate {
  job_posting_id: string;
  cover_letter?: string;
}

export interface ApplicationUpdate {
  status?: string;
  cover_letter?: string;
}

export interface Interview {
  id: string;
  application_id: string;
  interview_date: string;
  interview_time: string;
  location: string;
  interview_type: 'Phone' | 'Video' | 'In-Person' | 'Panel';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
  interviewer_name?: string;
  created_at: string;
  updated_at: string;
  application?: {
    id: string;
    user_id: string;
    job_posting_id: string;
    status: string;
  };
}

export interface InterviewCreate {
  application_id: string;
  interview_date: string;
  interview_time: string;
  location: string;
  interview_type: string;
  notes?: string;
  interviewer_name?: string;
}

export interface InterviewUpdate {
  interview_date?: string;
  interview_time?: string;
  location?: string;
  interview_type?: string;
  status?: string;
  notes?: string;
  interviewer_name?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async register(email: string, password: string, full_name: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, full_name }),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getJobCategories(): Promise<JobCategory[]> {
    const response = await fetch(`${this.baseUrl}/dashboard/categories`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile methods
  async getMyProfile(): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/profile/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateMyProfile(data: ProfileUpdate): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/profile/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/profile/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/profile/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Applications methods
  async getAllApplications(statusFilter?: string): Promise<Application[]> {
    const url = statusFilter
      ? `${this.baseUrl}/applications/?status_filter=${statusFilter}`
      : `${this.baseUrl}/applications/`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getApplication(id: string): Promise<Application> {
    const response = await fetch(`${this.baseUrl}/applications/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createApplication(data: ApplicationCreate): Promise<Application> {
    const response = await fetch(`${this.baseUrl}/applications/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateApplication(id: string, data: ApplicationUpdate): Promise<Application> {
    const response = await fetch(`${this.baseUrl}/applications/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async withdrawApplication(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/applications/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Interviews methods
  async getAllInterviews(filterType?: string): Promise<Interview[]> {
    const url = filterType
      ? `${this.baseUrl}/interviews/?filter_type=${filterType}`
      : `${this.baseUrl}/interviews/`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getInterview(id: string): Promise<Interview> {
    const response = await fetch(`${this.baseUrl}/interviews/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createInterview(data: InterviewCreate): Promise<Interview> {
    const response = await fetch(`${this.baseUrl}/interviews/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateInterview(id: string, data: InterviewUpdate): Promise<Interview> {
    const response = await fetch(`${this.baseUrl}/interviews/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async cancelInterview(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/interviews/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Job Postings methods
  async getAllJobPostings(): Promise<JobPosting[]> {
    const response = await fetch(`${this.baseUrl}/job-postings/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getJobPosting(id: string): Promise<JobPosting> {
    const response = await fetch(`${this.baseUrl}/job-postings/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createJobPosting(data: CreateJobPostingData): Promise<JobPosting> {
    const response = await fetch(`${this.baseUrl}/job-postings/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateJobPosting(id: string, data: UpdateJobPostingData): Promise<JobPosting> {
    const response = await fetch(`${this.baseUrl}/job-postings/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteJobPosting(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/job-postings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
