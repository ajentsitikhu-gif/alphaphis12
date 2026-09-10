import { SubmissionStatus, UserSubmission } from '../types';
import { calculateAge } from './validation';

const STORAGE_KEY = 'phishing_demo_submissions';

const LEGACY_PRIZE_NAMES: Record<string, string> = {
  'iPhone 16 Pro': 'RS 500 for free',
  'Starbucks $50 Card': 'Free Dining',
  'Wireless Headphones': 'Free Dining',
};

// Initial educational seed data representing simulated campus phishing catches
const INITIAL_DEMO_DATA: UserSubmission[] = [
  {
    id: 'sub_demo_101',
    name: 'Gunaraj Adhikari',
    email: 'gunaraj.adhikari@university.edu',
    phone: '+977 9841234567',
    dob: '1973-04-12',
    prize: 'RS 500 for free',
    status: 'Verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    calculatedAge: 53,
    flagReason: 'Legitimate student format entered into fake giveaway portal.',
    riskScore: 'Critical',
  },
  {
    id: 'sub_demo_102',
    name: 'Khemmani Adhikari',
    email: 'khemmani.adhikari@university.edu',
    phone: '+977 9852345678',
    dob: '2008-11-20',
    prize: 'Free Dining',
    status: 'Verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    calculatedAge: 17,
    flagReason: 'Legitimate-looking target data captured.',
    riskScore: 'Critical',
  },
  {
    id: 'sub_demo_103',
    name: 'Archan Karki',
    email: 'archan.karki@student.edu',
    phone: '+977 9863456789',
    dob: '2009-08-05',
    prize: 'Free Dining',
    status: 'Verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    calculatedAge: 17,
    flagReason: 'Legitimate-looking target data captured.',
    riskScore: 'Critical',
  },
  {
    id: 'sub_demo_104',
    name: 'Aakrist Baral',
    email: 'aakrist.baral@student.edu',
    phone: '+977 9804567890',
    dob: '2010-09-15',
    prize: 'Free coffee',
    status: 'Underage',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    calculatedAge: 15,
    flagReason: 'Underage participant (15 years old). Minor data protection flag.',
    riskScore: 'Critical',
  },
];

export function getSubmissions(): UserSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial educational sample data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    const submissions = (JSON.parse(raw) as UserSubmission[]).map((submission) => {
      const calculatedAge = calculateAge(submission.dob);
      const status: SubmissionStatus = calculatedAge < 13 ? 'Underage' : 'Verified';

      return {
        ...submission,
        prize:
          submission.email === 'aakrist.baral@student.edu' && submission.prize === 'Free Pizza Party'
            ? 'Free coffee'
            : LEGACY_PRIZE_NAMES[submission.prize] || submission.prize,
        calculatedAge,
        status,
        flagReason:
          status === 'Underage'
            ? `Student is underage (${calculatedAge} years old). Minor status flag.`
            : 'Legitimate-looking target data captured.',
        riskScore: 'Critical' as const,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    return submissions;
  } catch (error) {
    console.error('Failed to parse submissions from localStorage:', error);
    return [];
  }
}

export function saveSubmission(submission: Omit<UserSubmission, 'id' | 'timestamp'>): UserSubmission {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const newSubmission: UserSubmission = {
    ...submission,
    id,
    timestamp,
  };

  const current = getSubmissions();
  current.push(newSubmission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return newSubmission;
}

export function deleteSubmission(id: string): UserSubmission[] {
  const current = getSubmissions();
  const filtered = current.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function clearAllSubmissions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function resetToDemoData(): UserSubmission[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  return INITIAL_DEMO_DATA;
}


