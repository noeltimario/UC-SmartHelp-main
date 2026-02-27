import express, { Request, Response } from 'express';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uc_smarthelp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- GOOGLE AUTH ROUTE ---
app.post('/api/google-auth', async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    // 1. Check if user exists (Typed as RowDataPacket[] to fix indexing error)
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user) {
      return res.json({ 
        userId: user.id, 
        role: user.role, 
        firstName: user.first_name, 
        fullName: user.full_name 
      });
    } else {
      // 2. New User: Insert (Typed as ResultSetHeader to fix .insertId error)
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO users (full_name, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, email, 'GOOGLE_USER', 'student', firstName, lastName]
      );

      return res.status(201).json({ 
        userId: result.insertId, 
        role: 'student', 
        firstName: firstName, 
        fullName: fullName 
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Google Auth Error:", errorMessage);
    res.status(500).json({ error: "Server error during Google authentication." });
  }
});

// --- REGISTER ROUTE ---
app.post('/api/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (full_name, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, 'student', firstName, lastName]
    );
    res.status(201).json({ message: "Registration successful!" });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Email already registered." });
    } else {
      res.status(500).json({ error: "Server error during registration." });
    }
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) return res.status(401).json({ error: "Account not found." });
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      res.json({ 
        userId: user.id, 
        role: user.role, 
        firstName: user.first_name, 
        fullName: user.full_name 
      });
    } else {
      res.status(401).json({ error: "Invalid password." });
    }
  } catch (error: unknown) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Ready! Backend: http://localhost:${PORT}`);
});