import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ===== In-Memory Database =====
interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  prize: string;
  status: 'Verified' | 'Underage';
  timestamp: string;
  calculatedAge: number;
  flagReason?: string;
  riskScore?: string;
}

// Store submissions in memory
let submissions: Submission[] = [
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

// ===== API Routes =====

// GET /api/submissions - Get all submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  res.json(submissions);
});

// POST /api/submissions - Add a new submission
app.post('/api/submissions', (req: Request, res: Response) => {
  const newSubmission: Submission = {
    id: `sub_${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
  };

  submissions.push(newSubmission);
  res.status(201).json(newSubmission);
});

// DELETE /api/submissions/:id - Delete a submission
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  submissions = submissions.filter((sub) => sub.id !== id);
  res.json({ success: true, message: `Submission ${id} deleted` });
});

// DELETE /api/submissions - Clear all submissions
app.delete('/api/submissions', (req: Request, res: Response) => {
  submissions = [];
  res.json({ success: true, message: 'All submissions cleared' });
});

// POST /api/submissions/reset - Reset to demo data
app.post('/api/submissions/reset', (req: Request, res: Response) => {
  submissions = [
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
  res.json(submissions);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve React app for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ===== Start Server =====
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/submissions`);
});
