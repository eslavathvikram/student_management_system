require('dotenv').config();
const path = require('path');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'sms_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_db',
  waitForConnections: true,
  connectionLimit: 10
};

function normalizeSqliteError(err) {
  if (!err || err.code !== 'SQLITE_CONSTRAINT') return err;
  const mapped = new Error(err.message);
  Object.assign(mapped, err, { code: 'ER_DUP_ENTRY' });
  return mapped;
}

function createSqliteDb() {
  const dbPath = path.join(__dirname, '..', 'database', 'student_db.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to create SQLite DB:', err.message);
      throw err;
    }
  });

  const initSql = `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      year INTEGER,
      semester INTEGER,
      cgpa REAL,
      attendance REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const seedSql = `
    INSERT OR IGNORE INTO students (student_id, name, department, email, phone, year, semester, cgpa, attendance)
    VALUES
      ('21261A0501','Aarav Sharma','CSE','aarav.sharma@example.com','9876543210',4,7,8.45,91.5),
      ('21261A0502','Priya Reddy','CSE','priya.reddy@example.com','9876543211',4,7,7.92,87.0),
      ('21261A0412','Rahul Verma','ECE','rahul.verma@example.com','9876543212',4,7,7.15,82.3),
      ('22261A1203','Sneha Patel','IT','sneha.patel@example.com','9876543213',3,5,8.80,94.2),
      ('22261A0305','Karthik Nair','EEE','karthik.nair@example.com','9876543214',3,5,6.95,78.9),
      ('23261A0601','Ananya Iyer','AI & DS','ananya.iyer@example.com','9876543215',2,3,9.10,96.0),
      ('23261A0107','Rohan Gupta','Civil','rohan.gupta@example.com','9876543216',2,3,7.40,85.5),
      ('24261A0210','Meera Joshi','Mechanical','meera.joshi@example.com','9876543217',1,1,8.05,90.0),
      ('24261A0511','Vikas Rao','CSE','vikas.rao@example.com','9876543218',1,1,7.65,88.8),
      ('22261A1218','Divya Menon','IT','divya.menon@example.com','9876543219',3,6,8.25,92.1);
  `;

  const query = (sqlText, params = []) => new Promise((resolve, reject) => {
    const normalized = sqlText.trim();
    const isSelect = /^SELECT\s+/i.test(normalized);

    if (isSelect) {
      db.all(sqlText, params, (err, rows) => {
        if (err) return reject(normalizeSqliteError(err));
        resolve([rows]);
      });
      return;
    }

    db.run(sqlText, params, function runCallback(err) {
      if (err) return reject(normalizeSqliteError(err));

      const response = {
        affectedRows: this.changes,
        insertId: this.lastID
      };

      resolve([response]);
    });
  });

  return {
    query,
    end: () => new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    }),
    init: () => new Promise((resolve, reject) => {
      db.exec(initSql, (err) => {
        if (err) return reject(err);
        db.exec(seedSql, (seedErr) => (seedErr ? reject(seedErr) : resolve()));
      });
    })
  };
}

let activePool = null;
const ready = (async () => {
  try {
    const pool = mysql.createPool(mysqlConfig);
    await pool.query('SELECT 1');
    activePool = pool;
    return pool;
  } catch (err) {
    const sqlitePool = createSqliteDb();
    await sqlitePool.init();
    activePool = sqlitePool;
    console.warn('MySQL connection unavailable. Using SQLite fallback for local development.');
    return sqlitePool;
  }
})();

const pool = {
  async query(...args) {
    await ready;
    return activePool.query(...args);
  },
  async end() {
    await ready;
    if (typeof activePool.end === 'function') {
      return activePool.end();
    }
    return Promise.resolve();
  }
};

module.exports = pool;
