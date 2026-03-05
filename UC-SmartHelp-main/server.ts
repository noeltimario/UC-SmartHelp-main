import express, { Request, Response } from 'express';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uc_smarthelp',
});

// Verify database connection
db.getConnection()
  .then(async (connection) => {
    try {
      // Auto-migration: Ensure necessary columns exist
      const [columns]: any = await connection.query("SHOW COLUMNS FROM tickets");
      const columnNames = columns.map((c: any) => c.Field);
      
      if (!columnNames.includes('subject')) {
        await connection.query("ALTER TABLE tickets ADD COLUMN subject VARCHAR(255) NOT NULL DEFAULT 'No Subject'");
      }
      if (!columnNames.includes('department')) {
        await connection.query("ALTER TABLE tickets ADD COLUMN department VARCHAR(100)");
      }
    } catch (err: any) {
      console.error('MIGRATION ERROR:', err.message);
    }
    connection.release();
  })
  .catch((err) => {
    console.error('FAILED TO CONNECT TO MYSQL:', err.message);
  });

const formatUserResponse = (user: any) => {
  const id = user.id ?? user.userId ?? user.user_id ?? user.ID;
  return {
    id: id,
    userId: id,
    user_id: id,
    role: user.role,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    fullName: `${user.first_name || user.firstName} ${user.last_name || user.lastName}`,
    email: user.email
  };
};

app.post('/api/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [existing] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    let user;
    if (existing.length > 0) {
      await db.query('UPDATE users SET first_name = ?, last_name = ?, password = ? WHERE email = ?', [firstName, lastName, hashedPassword, email]);
      const [updated] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
      user = updated[0];
    } else {
      await db.query<ResultSetHeader>('INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, hashedPassword, 'student']);
      const [inserted] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
      user = inserted[0];
    }
    res.status(201).json(formatUserResponse(user));
  } catch (error: any) {
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      res.json(formatUserResponse(user));
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Login error" });
  }
});

app.post('/api/update-profile', async (req: Request, res: Response) => {
  const { userId, firstName, lastName } = req.body;
  if (!userId || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    let pkName = '';
    // Determine PK column
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE user_id = ?', [userId]);
      if (rows.length > 0) pkName = 'user_id';
    } catch (e) {}
    
    if (!pkName) {
      try {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) pkName = 'id';
      } catch (e) {}
    }

    if (!pkName) return res.status(404).json({ error: "User not found" });

    await db.query(`UPDATE users SET first_name = ?, last_name = ? WHERE ${pkName} = ?`, [firstName, lastName, userId]);
    
    const [updated] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE ${pkName} = ?`, [userId]);
    res.json(formatUserResponse(updated[0]));
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/change-password', async (req: Request, res: Response) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    let user = null;
    let pkName = '';
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE user_id = ?', [userId]);
      if (rows.length > 0) { user = rows[0]; pkName = 'user_id'; }
    } catch (e) {}
    if (!user) {
      try {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) { user = rows[0]; pkName = 'id'; }
      } catch (e) {}
    }
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect old password" });
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE users SET password = ? WHERE ${pkName} = ?`, [hashedNewPassword, userId]);
    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/google-auth', async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows[0];
    if (!user) {
      await db.query<ResultSetHeader>('INSERT INTO users (first_name, last_name, email, role) VALUES (?, ?, ?, ?)', [firstName, lastName, email, 'student']);
      const [inserted] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
      user = inserted[0];
    }
    res.json(formatUserResponse(user));
  } catch (error: any) {
    res.status(500).json({ error: "Auth Error" });
  }
});

app.post('/api/tickets', async (req: Request, res: Response) => {
  const { subject, description, department, sender_id } = req.body;
  if (!subject || !description || !department || !sender_id) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    const userId = parseInt(sender_id.toString());
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid sender_id. Must be a number." });
    }
    // We use the auto-increment ticket_id from DB instead of generating a random number
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO tickets (subject, description, department, user_id, status) VALUES (?, ?, ?, ?, ?)', 
      [subject, description, department, userId, 'pending']
    );
    res.status(201).json({ message: "Success", ticketId: result.insertId });
  } catch (error: any) {
    console.error("TICKET CREATION ERROR:", error);
    res.status(500).json({ error: "Database Error", details: error.message });
  }
});

app.get('/api/tickets', async (req: Request, res: Response) => {
  const { user_id, role } = req.query;
  try {
    // Alias ticket_id as ticket_number and id to keep frontend happy
    let query = 'SELECT *, ticket_id AS ticket_number, ticket_id AS id FROM tickets';
    const params = [];
    if (role === 'student' && user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error("FETCH TICKETS ERROR:", error);
    res.status(500).json({ error: "Error fetching tickets", details: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend on port ${PORT}`));
