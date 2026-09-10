import { SubmissionStatus, UserSubmission } from '../types';
import { calculateAge } from './validation';

const STORAGE_KEY = 'phishing_demo_submissions';
const API_BASE = '/api';

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

function normalizeSubmission(submission: Partial<UserSubmission>): UserSubmission {
  const dob = submission.dob ?? '';
  const calculatedAge = calculateAge(dob);
  const status: SubmissionStatus = calculatedAge < 13 ? 'Underage' : 'Verified';

  return {
    id: submission.id ?? `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: submission.name ?? '',
    email: submission.email ?? '',
    phone: submission.phone ?? '',
    dob,
    prize:
      submission.email === 'aakrist.baral@student.edu' && submission.prize === 'Free Pizza Party'
        ? 'Free coffee'
        : LEGACY_PRIZE_NAMES[submission.prize ?? ''] || submission.prize || '',
    status,
    timestamp: submission.timestamp ?? new Date().toISOString(),
    calculatedAge,
    flagReason:
      status === 'Underage'
        ? `Student is underage (${calculatedAge} years old). Minor status flag.`
        : 'Legitimate-looking target data captured.',
    riskScore: 'Critical',
  };
}

async function fetchFromApi<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getSubmissions(): Promise<UserSubmission[]> {
  if (typeof window === 'undefined') return [];

  const remote = await fetchFromApi<UserSubmission[]>('/submissions');
  if (remote) {
    const normalized = remote.map(normalizeSubmission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    const submissions = (JSON.parse(raw) as UserSubmission[]).map(normalizeSubmission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    return submissions;
  } catch (error) {
    console.error('Failed to parse submissions from localStorage:', error);
    return [];
  }
}

export function saveSubmission(submission: Omit<UserSubmission, 'id' | 'timestamp'>): UserSubmission {
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = new Date().toISOString();
  const newSubmission: UserSubmission = {
    ...submission,
    id,
    timestamp,
  };

  if (typeof window !== 'undefined') {
    fetchFromApi<UserSubmission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(newSubmission),
    });

    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as UserSubmission[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, newSubmission]));
  }

  return newSubmission;
}

export async function deleteSubmission(id: string): Promise<UserSubmission[]> {
  const remote = await fetchFromApi<UserSubmission[]>('/submissions/' + id, {
    method: 'DELETE',
  });

  if (remote) {
    return remote;
  }

  const current = await getSubmissions();
  const filtered = current.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export async function clearAllSubmissions(): Promise<UserSubmission[]> {
  const remote = await fetchFromApi<UserSubmission[]>('/submissions', {
    method: 'DELETE',
  });

  if (remote) {
    localStorage.removeItem(STORAGE_KEY);
    return remote;
  }

  localStorage.removeItem(STORAGE_KEY);
  return [];
}

export async function resetToDemoData(): Promise<UserSubmission[]> {
  const remote = await fetchFromApi<UserSubmission[]>('/submissions/reset', {
    method: 'POST',
  });

  if (remote) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    return remote;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  return INITIAL_DEMO_DATA;
}


