export interface AuthResponse {
  message: string;
  success: boolean;
  role?: string;
  profileComplete?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface User {
  email: string;
  role: string;
  profileComplete: boolean;
}

export interface UserProfile {
  email: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  education: string;
  pastExperience: string;
  skills: string[];
  linkedInUrl: string;
  profileComplete: boolean;
  role: string;
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary: string;
  status: string;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobListingId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}
