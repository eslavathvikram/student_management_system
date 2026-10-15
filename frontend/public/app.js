const API = '/api/students';
const $ = id => document.getElementById(id);
const fields = ['student_id','name','department','email','phone','year','semester','cgpa','attendance'];
let editingId = null;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function loadHealth() {
  try {
    const r = await (await fetch('/api/health')).json();
    $('serverInfo').textContent = `● DB ${r.db} • host: ${r.host}`;
  } catch { $('serverInfo').textContent = '● server unreachable'; }
}

async function loadStudents() {
  const q = $('search').value.trim();
  const res = await fetch(API + (q ? `?q=${encodeURIComponent(q)}` : ''));
  const data = await res.json();
  $('rows').innerHTML = data.map(s => `
    <tr>
      <td>${esc(s.student_id)}</td><td>${esc(s.name)}</td><td>${esc(s.department)}</td>
      <td>${esc(s.email)}</td><td>${esc(s.phone)}</td><td>${esc(s.year)}</td>
      <td>${esc(s.semester)}</td><td>${esc(s.cgpa)}</td><td>${esc(s.attendance)}</td>
      <td>
        <button class="btn small" onclick="openEdit(${s.id})">Edit</button>
        <button class="btn small danger" onclick="removeStudent(${s.id})">Delete</button>
      </td>
    </tr>`).join('');
  $('empty').hidden = data.length > 0;
  $('statTotal').textContent = data.length;
  $('statDept').textContent = new Set(data.map(s => s.department)).size;
  const c = data.filter(s => s.cgpa !== null).map(s => Number(s.cgpa));
  $('statCgpa').textContent = c.length ? (c.reduce((a,b)=>a+b,0)/c.length).toFixed(2) : '–';
}

function showModal(title) { $('modalTitle').textContent = title; $('formError').hidden = true; $('modal').hidden = false; }
function hideModal() { $('modal').hidden = true; }

$('addBtn').onclick = () => { editingId = null; fields.forEach(f => $(f).value = ''); showModal('Add Student'); };
$('cancelBtn').onclick = hideModal;

window.openEdit = async id => {
  const s = await (await fetch(`${API}/${id}`)).json();
  editingId = id;
  fields.forEach(f => $(f).value = s[f] ?? '');
  showModal('Update Student');
};

$('saveBtn').onclick = async () => {
  const body = {}; fields.forEach(f => body[f] = $(f).value);
  const res = await fetch(editingId ? `${API}/${editingId}` : API, {
    method: editingId ? 'PUT' : 'POST',
    headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
  });
  const out = await res.json();
  if (!res.ok) { $('formError').textContent = out.error; $('formError').hidden = false; return; }
  hideModal(); loadStudents();
};

window.removeStudent = async id => {
  if (!confirm('Delete this student record?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadStudents();
};

let t; $('search').oninput = () => { clearTimeout(t); t = setTimeout(loadStudents, 250); };
loadHealth(); loadStudents();
