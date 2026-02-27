import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'uc_smarthelp'
});

db.connect(err => {
  if (err) console.error('❌ Connection Error:', err.message);
  else console.log('✅ Connected to MySQL Database');
});

// --- FIX PARA SA MANUAL LOGIN ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Hinahanap ang user sa MySQL table mo
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      res.json(results[0]); // Ito ang JSON na hinihintay ng Frontend
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

// --- FIX PARA SA GOOGLE LOGIN ---
app.post('/api/google-auth', (req, res) => {
  const { email, firstName, lastName } = req.body;
  const query = "INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name)";
  db.query(query, [email, firstName, lastName], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ email, firstName, lastName, id: result.insertId });
  });
});

app.listen(3000, () => console.log('🚀 Server is awake on port 3000'));