export interface Prize {
  id: number;
  name: string;
  tagline: string;
  color: string;
  textColor: string;
  accentColor: string;
  iconName: 'Smartphone' | 'Car' | 'Headphones' | 'Pizza' | 'Gift' | 'Coffee';
}

export type SubmissionStatus = 'Verified' | 'Underage';

export interface UserSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  prize: string;
  status: SubmissionStatus;
  timestamp: string;
  calculatedAge: number;
  flagReason?: string;
  riskScore: 'High' | 'Critical';
}

export interface Winner {
  id: string;
  name: string;
  initials: string;
  prize: string;
  department: string;
  timeAgo: string;
  avatarColor: string;
}

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  error: string | null;
}

export type AppRoute = '/' | '/login' | '/dashboard';
