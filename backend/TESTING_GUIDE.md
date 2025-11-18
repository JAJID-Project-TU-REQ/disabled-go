# Testing Guide

> 📖 **สำหรับคู่มือการ Testing แบบละเอียดด้วย Postman:** ดูที่ [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)

## วิธีการ Testing ที่แนะนำ

### 1. Manual Testing ด้วย Postman (แนะนำ)
**ใช้สำหรับ:** ทดสอบ API แบบ end-to-end

**เครื่องมือ:**
- **Postman** (GUI) - แนะนำ ⭐
- **curl** (Command line)
- **Thunder Client** (VS Code extension)
- **Frontend App** (ทดสอบผ่าน UI)

**ตัวอย่าง:**
```bash
# Health check
curl http://localhost:3000/ping

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"role":"volunteer","firstName":"Test","lastName":"User","nationalId":"1234567890123","phone":"081-234-5678","password":"password","skills":["wheelchair_support"]}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nationalId":"1234567890123","password":"password"}'
```

**ข้อดี:**
- ง่าย เร็ว
- เห็นผลลัพธ์ทันที
- ไม่ต้องเขียนโค้ด

**ข้อเสีย:**
- ต้องทำซ้ำทุกครั้ง
- ไม่สามารถ automate ได้
- อาจลืม test cases บางอัน

---

### 2. Integration Testing (API Testing)
**ใช้สำหรับ:** ทดสอบ API endpoints แบบ end-to-end

**เครื่องมือ:**
- `httptest` package (built-in Go)
- `testify` (assertion library)

**วิธีรัน:**
```bash
go test -v ./handlers -run TestIntegration
```

**ตัวอย่าง:**
```go
func TestAPI_RegisterAndLogin(t *testing.T) {
    // 1. Register user
    // 2. Login with registered credentials
    // 3. Verify token is returned
}
```

**ข้อดี:**
- ทดสอบ flow จริง
- ครอบคลุมหลาย components
- เหมือนใช้งานจริง

**ข้อเสีย:**
- ช้ากว่า unit tests
- ต้องมี database
- ต้อง cleanup ข้อมูล

---

### 4. Database Testing
**ใช้สำหรับ:** ทดสอบ database operations

**วิธีทำ:**
1. ใช้ test database แยก
2. ใช้ Docker test container
3. ใช้ in-memory database (SQLite)

**ตัวอย่าง setup test database:**
```go
func setupTestDB(t *testing.T) *sql.DB {
    // Connect to test database
    // Run migrations
    // Return DB connection
}

func teardownTestDB(t *testing.T, db *sql.DB) {
    // Clean up test data
    // Close connection
}
```

---

### 5. Frontend Testing
**ใช้สำหรับ:** ทดสอบ React Native components

**เครื่องมือ:**
- **Jest** (unit testing)
- **React Native Testing Library** (component testing)
- **Detox** (E2E testing)

**วิธีติดตั้ง:**
```bash
cd frontend
npm install --save-dev jest @testing-library/react-native
```

**ตัวอย่าง:**
```javascript
// LoginScreen.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

test('should show error when login fails', () => {
  const { getByText, getByPlaceholderText } = render(<LoginScreen />);
  
  fireEvent.changeText(getByPlaceholderText('เลขบัตรประชาชน'), '123');
  fireEvent.press(getByText('เข้าสู่ระบบ'));
  
  expect(getByText('Invalid credentials')).toBeTruthy();
});
```

---

## วิธีเริ่มต้น Testing

### 1. Setup Backend
```bash
cd backend
docker compose up -d
```

### 2. Import Postman Collection
- เปิด Postman
- File → Import
- เลือกไฟล์ `Disabled_Go_API.postman_collection.json`
- สร้าง Environment: `Local Development`

### 3. เริ่ม Testing
- เริ่มจาก "Health Check"
- ตามด้วย "Register" และ "Login"
- ทดสอบ endpoints อื่นๆ ตาม flow

---

## Best Practices

1. **ใช้ Environment Variables ใน Postman:**
   - เก็บ `base_url`, `api_url`
   - เก็บ IDs ที่ได้จาก responses (`user_id`, `job_id`, etc.)

2. **ใช้ Pre-request Scripts:**
   - Auto-generate IDs
   - Auto-set timestamps

3. **ใช้ Tests Tab ใน Postman:**
   - ตรวจสอบ response status
   - เก็บ IDs อัตโนมัติ:
   ```javascript
   if (pm.response.code === 201) {
       const jsonData = pm.response.json();
       pm.environment.set("user_id_volunteer", jsonData.id);
   }
   ```

4. **ทดสอบตาม Flow:**
   - Register → Login → Create Job → Apply → Accept → Complete → Rating

---

## Continuous Integration (CI) - (ถ้าต้องการในอนาคต)

**GitHub Actions example:**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
        with:
          go-version: '1.25'
      - run: go test -v ./...
      - run: go test -cover ./...
```

---

## สรุป

| วิธี | ใช้เมื่อ | ความเร็ว | ความครอบคลุม |
|------|---------|---------|-------------|
| **Postman Testing** ⭐ | ทดสอบ API end-to-end, Development | ปานกลาง | **สูงมาก** |
| curl Testing | ทดสอบเร็ว, Command line | เร็ว | ปานกลาง |
| Frontend Testing | ทดสอบ UI, User experience | ช้า | สูง |

**แนะนำ:** 
- ใช้ **Postman** สำหรับ testing API แบบ end-to-end (แนะนำ) ⭐
- ดูคู่มือแบบละเอียดที่ [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)
- Import Postman Collection จาก `Disabled_Go_API.postman_collection.json`

