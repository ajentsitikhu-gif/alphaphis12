import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

let submissions: Submission[] = [];

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
