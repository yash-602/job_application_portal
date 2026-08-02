import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, VerifyEmailRequest, JobListing, JobApplication, UserProfile } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  verifyEmail: (data: VerifyEmailRequest) => api.post<AuthResponse>('/auth/verify-email', data),
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
  logout: () => api.post<AuthResponse>('/auth/logout'),
  whoami: () => api.get<string>('/test/whoami'),
};

// ==========================================
// MOCK DATA AND APIS (Synthetic Placeholders)
// ==========================================

const MOCK_JOBS: JobListing[] = [
  { id: '1', title: 'IT Director', department: 'Technology', location: 'Mumbai, IN', type: 'Full-time', description: 'Lead the IT department and drive technology strategy for logistics operations.', requirements: [], salary: '₹35L - ₹50L', status: 'Open', postedBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'IT Lead', department: 'Technology', location: 'Bangalore, IN', type: 'Full-time', description: 'Lead a team of engineers building next-gen warehouse management systems.', requirements: [], salary: '₹25L - ₹35L', status: 'Open', postedBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', title: 'HR Manager', department: 'Human Resources', location: 'Mumbai, IN', type: 'Full-time', description: 'Manage recruitment, employee relations, and HR operations across all offices.', requirements: [], salary: '₹15L - ₹22L', status: 'Open', postedBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', title: 'Senior Software Engineer', department: 'Technology', location: 'Bangalore, IN', type: 'Full-time', description: 'Design and build scalable microservices for our supply chain platform.', requirements: [], salary: '₹20L - ₹30L', status: 'Open', postedBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', title: 'Junior Software Engineer', department: 'Technology', location: 'Remote', type: 'Full-time', description: 'Work on frontend and backend features for our logistics dashboard.', requirements: [], salary: '₹8L - ₹14L', status: 'Open', postedBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let MOCK_APPLICATIONS: JobApplication[] = [];
let MOCK_PROFILE: UserProfile = { email: '', fullName: '', dateOfBirth: '', placeOfBirth: '', education: '', pastExperience: '', skills: [], linkedInUrl: '', profileComplete: false, role: 'applicant' };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const jobsAPI = {
  getOpenListings: async () => { await delay(300); return { data: MOCK_JOBS.filter(j => j.status === 'Open') }; },
  getById: async (id: string) => { await delay(300); return { data: MOCK_JOBS.find(j => j.id === id) as JobListing }; },
  apply: async (id: string) => { 
    await delay(500); 
    MOCK_APPLICATIONS.push({ id: Math.random().toString(), jobListingId: id, applicantId: 'me', applicantEmail: 'user@test.com', applicantName: MOCK_PROFILE.fullName || 'Test User', status: 'Under Review', appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { data: { message: 'Application submitted successfully', success: true } as AuthResponse }; 
  },
  getMyApplications: async () => { await delay(300); return { data: MOCK_APPLICATIONS }; },
};

export const profileAPI = {
  get: async () => { await delay(300); return { data: MOCK_PROFILE }; },
  update: async (data: Partial<UserProfile>) => { 
    await delay(500); 
    MOCK_PROFILE = { ...MOCK_PROFILE, ...data, profileComplete: !!(data.fullName && data.education) }; 
    return { data: { message: 'Profile updated', success: true } as AuthResponse }; 
  },
};

export const adminAPI = {
  getAllJobs: async () => { await delay(300); return { data: MOCK_JOBS }; },
  createJob: async (data: Partial<JobListing>) => {
    await delay(500);
    const newJob = { ...data, id: Math.random().toString(), status: 'Open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as JobListing;
    MOCK_JOBS.push(newJob);
    return { data: newJob };
  },
  updateJob: async (id: string, data: Partial<JobListing>) => {
    await delay(500);
    const idx = MOCK_JOBS.findIndex(j => j.id === id);
    if(idx >= 0) MOCK_JOBS[idx] = { ...MOCK_JOBS[idx], ...data, updatedAt: new Date().toISOString() };
    return { data: MOCK_JOBS[idx] };
  },
  getApplicants: async (jobId: string) => {
    await delay(300);
    return { data: MOCK_APPLICATIONS.filter(a => a.jobListingId === jobId) };
  },
  updateApplicationStatus: async (appId: string, status: string) => {
    await delay(300);
    const app = MOCK_APPLICATIONS.find(a => a.id === appId);
    if(app) { app.status = status; app.updatedAt = new Date().toISOString(); }
    return { data: app as JobApplication };
  },
  // Keep createAdmin hitting the backend since it should work with real DB
  createAdmin: (data: { email: string; password: string }) => api.post<AuthResponse>('/admin/users', data),
};

export default api;
