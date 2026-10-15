// Database test: insert -> read -> update -> duplicate check -> delete (screenshot output for Step 2).
const pool = require('./db');
(async () => {
  const sid = 'TEST-' + Date.now().toString().slice(-6);
  let pass = 0, fail = 0;
  const check = (name, ok) => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); ok ? pass++ : fail++; };
  try {
    const [ins] = await pool.query(
      `INSERT INTO students (student_id,name,department,email,phone,year,semester,cgpa,attendance) VALUES (?,?,?,?,?,?,?,?,?)`,
      [sid, 'Test User', 'CSE', sid.toLowerCase() + '@test.com', '9999999999', 4, 7, 7.5, 88]);
    check('INSERT record', ins.affectedRows === 1);
    const [r1] = await pool.query('SELECT * FROM students WHERE id=?', [ins.insertId]);
    check('SELECT record matches inserted data', r1.length === 1 && r1[0].name === 'Test User');
    const [up] = await pool.query('UPDATE students SET cgpa=? WHERE id=?', [8.1, ins.insertId]);
    const [r2] = await pool.query('SELECT cgpa FROM students WHERE id=?', [ins.insertId]);
    check('UPDATE record', up.affectedRows === 1 && Number(r2[0].cgpa) === 8.1);
    try { await pool.query(`INSERT INTO students (student_id,name,department,email,phone) VALUES (?,?,?,?,?)`, [sid, 'Dup', 'CSE', 'dup@test.com', '9999999999']); check('Duplicate student_id rejected', false); }
    catch (e) { check('Duplicate student_id rejected (UNIQUE constraint)', e.code === 'ER_DUP_ENTRY'); }
    const [del] = await pool.query('DELETE FROM students WHERE id=?', [ins.insertId]);
    const [r3] = await pool.query('SELECT * FROM students WHERE id=?', [ins.insertId]);
    check('DELETE record', del.affectedRows === 1 && r3.length === 0);
  } catch (e) { console.error('ERROR', e.message); fail++; }
  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  await pool.end(); process.exit(fail ? 1 : 0);
})();
