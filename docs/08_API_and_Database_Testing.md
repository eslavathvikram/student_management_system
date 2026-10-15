# 08 – Database & API Testing (Step 2)

## Automated DB test
```bash
cd backend && npm test
```
Expected:
```
PASS  INSERT record
PASS  SELECT record matches inserted data
PASS  UPDATE record
PASS  Duplicate student_id rejected (UNIQUE constraint)
PASS  DELETE record
Result: 5 passed, 0 failed
```

## Manual API tests (curl)
```bash
BASE=http://localhost:3000/api
curl -s $BASE/health
curl -s $BASE/students | head -c 400
curl -s -X POST $BASE/students -H 'Content-Type: application/json' -d \
 '{"student_id":"TST-001","name":"Demo Student","department":"CSE","email":"demo@example.com","phone":"9000000000","year":4,"semester":7,"cgpa":8.2,"attendance":90}'
curl -s -X PUT  $BASE/students/<ID> -H 'Content-Type: application/json' -d \
 '{"student_id":"TST-001","name":"Demo Student","department":"CSE","email":"demo@example.com","phone":"9000000000","year":4,"semester":7,"cgpa":8.9,"attendance":91}'
curl -s -X DELETE $BASE/students/<ID>
```
## Validation tests
| Test | Input | Expected |
|---|---|---|
| Duplicate ID | existing student_id | 409 "already exists" |
| Bad email | `abc` | 400 |
| Short phone | `123` | 400 |
| CGPA > 10 | `11` | 400 |
| Unknown id | `/students/99999` | 404 |

## Direct SQL check
```sql
SELECT COUNT(*) FROM students;
DESCRIBE students;
SHOW INDEX FROM students;
```
