import express, { Request, Response } from 'express';
import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'phishing.db');

mkdirSync(dbDir, { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT NOT NULL,
    prize TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Verified', 'Underage')),
    timestamp TEXT NOT NULL,
    calculatedAge INTEGER NOT NULL,
    flagReason TEXT,
    riskScore TEXT NOT NULL
  );
`);

const INITIAL_DEMO_DATA = [
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
] as const;

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO submissions (
        id, name, email, phone, dob, prize, status, timestamp, calculatedAge, flagReason, riskScore
      ) VALUES (
        @id, @name, @email, @phone, @dob, @prize, @status, @timestamp, @calculatedAge, @flagReason, @riskScore
      )
    `);

    for (const row of INITIAL_DEMO_DATA) {
      insert.run({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        dob: row.dob,
        prize: row.prize,
        status: row.status,
        timestamp: row.timestamp,
        calculatedAge: row.calculatedAge,
        flagReason: row.flagReason,
        riskScore: row.riskScore,
      });
    }
  }
}

function rowToSubmission(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    dob: row.dob,
    prize: row.prize,
    status: row.status,
    timestamp: row.timestamp,
    calculatedAge: row.calculatedAge,
    flagReason: row.flagReason ?? undefined,
    riskScore: row.riskScore,
  };
}

function getAllSubmissions() {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY datetime(timestamp) DESC').all();
  return rows.map(rowToSubmission);
}

seedIfEmpty();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/submissions', (_req: Request, res: Response) => {
  res.json(getAllSubmissions());
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const payload = req.body ?? {};
  const now = new Date().toISOString();
  const submission = {
    id: payload.id ?? `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: String(payload.name ?? '').trim(),
    email: String(payload.email ?? '').trim(),
    phone: String(payload.phone ?? '').trim(),
    dob: String(payload.dob ?? '').trim(),
    prize: String(payload.prize ?? '').trim(),
    status: payload.status === 'Underage' ? 'Underage' : 'Verified',
    timestamp: String(payload.timestamp ?? now),
    calculatedAge: Number(payload.calculatedAge ?? 0),
    flagReason: payload.flagReason ?? null,
    riskScore: payload.riskScore === 'High' ? 'High' : 'Critical',
  };

  db.prepare(`
    INSERT INTO submissions (
      id, name, email, phone, dob, prize, status, timestamp, calculatedAge, flagReason, riskScore
    ) VALUES (
      @id, @name, @email, @phone, @dob, @prize, @status, @timestamp, @calculatedAge, @flagReason, @riskScore
    )
  `).run(submission);

  res.status(201).json(submission);
});

app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id, submissions: getAllSubmissions() });
});

app.delete('/api/submissions', (_req: Request, res: Response) => {
  db.prepare('DELETE FROM submissions').run();
  res.json({ success: true, submissions: [] });
});

app.post('/api/submissions/reset', (_req: Request, res: Response) => {
  db.prepare('DELETE FROM submissions').run();
  const insert = db.prepare(`
    INSERT INTO submissions (
      id, name, email, phone, dob, prize, status, timestamp, calculatedAge, flagReason, riskScore
    ) VALUES (
      @id, @name, @email, @phone, @dob, @prize, @status, @timestamp, @calculatedAge, @flagReason, @riskScore
    )
  `);

  for (const row of INITIAL_DEMO_DATA) {
    insert.run({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      dob: row.dob,
      prize: row.prize,
      status: row.status,
      timestamp: row.timestamp,
      calculatedAge: row.calculatedAge,
      flagReason: row.flagReason,
      riskScore: row.riskScore,
    });
  }

  res.json(getAllSubmissions());
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/submissions`);
  console.log(`💾 Database: ${dbPath}`);
});
