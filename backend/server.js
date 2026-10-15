require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// ---------- validation ----------
function validate(b) {
  const errors = [];
  if (!b.student_id || !/^[A-Za-z0-9\-]{3,20}$/.test(b.student_id)) errors.push('Student ID must be 3-20 letters/digits/hyphens');
  if (!b.name || b.name.trim().length < 2) errors.push('Name is required');
  if (!b.department || !b.department.trim()) errors.push('Department is required');
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.push('Valid email is required');
  if (!b.phone || !/^[0-9+\-\s]{10,15}$/.test(b.phone)) errors.push('Phone must be 10-15 digits');
  if (b.cgpa !== undefined && b.cgpa !== '' && b.cgpa !== null && (isNaN(b.cgpa) || b.cgpa < 0 || b.cgpa > 10)) errors.push('CGPA must be between 0 and 10');
  if (b.year && (b.year < 1 || b.year > 4)) errors.push('Year must be 1-4');
  if (b.semester && (b.semester < 1 || b.semester > 8)) errors.push('Semester must be 1-8');
  return errors;
}
const blank = v => (v === '' || v === undefined ? null : v);
const clean = b => [
  b.student_id.trim(), b.name.trim(), b.department.trim(), b.email.trim(), b.phone.trim(),
  blank(b.year), blank(b.semester), blank(b.cgpa), blank(b.attendance)
];

// ---------- health (useful for cloud checks) ----------
app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', db: 'connected', host: require('os').hostname() }); }
  catch (e) { res.status(500).json({ status: 'error', db: e.message }); }
});

// ---------- READ (list + search) ----------
app.get('/api/students', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let sql = 'SELECT * FROM students';
    const params = [];
    if (q) {
      sql += ' WHERE student_id LIKE ? OR name LIKE ? OR department LIKE ? OR email LIKE ?';
      params.push(...Array(4).fill(`%${q}%`));
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- READ (one) ----------
app.get('/api/students/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- CREATE ----------
app.post('/api/students', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  try {
    const [r] = await pool.query(
      `INSERT INTO students (student_id, name, department, email, phone, year, semester, cgpa, attendance)
       VALUES (?,?,?,?,?,?,?,?,?)`, clean(req.body));
    res.status(201).json({ id: r.insertId, message: 'Student added' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Student ID or email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// ---------- UPDATE ----------
app.put('/api/students/:id', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  try {
    const [r] = await pool.query(
      `UPDATE students SET student_id=?, name=?, department=?, email=?, phone=?, year=?, semester=?, cgpa=?, attendance=?
       WHERE id=?`, [...clean(req.body), req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Student ID or email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// ---------- DELETE ----------
app.delete('/api/students/:id', async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Student Management System running on port ${PORT}`));
