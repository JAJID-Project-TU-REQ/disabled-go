# Testing Guide

> 📖 **สำหรับคู่มือการ Testing แบบละเอียดด้วย Postman:** ดูที่ [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)

## Quick Start

### 1. Setup Backend
```bash
cd backend
docker compose up -d
```

### 2. ตรวจสอบว่า server ทำงาน
```bash
curl http://localhost:3000/ping
```

ควรเห็น: `{"message":"pong"}`

### 3. วิธี Testing
- **Manual Testing ด้วย Postman:** ดู [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)
- **Unit Testing:** ดู [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## Test Endpoints (Quick Reference)

### 1. Health Check
```bash
curl http://localhost:3000/ping
```

Expected response:
```json
{"message":"pong"}
```

### 2. Register User (Volunteer)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "volunteer",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "nationalId": "1234567890123",
    "phone": "081-234-5678",
    "password": "password",
    "skills": ["wheelchair_support", "thai_language"],
    "biography": "ฉันมีความสนใจในการช่วยเหลือผู้พิการ"
  }'
```

### 3. Register User (Requester)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "requester",
    "firstName": "สมหญิง",
    "lastName": "ต้องการความช่วยเหลือ",
    "nationalId": "2345678901234",
    "phone": "082-345-6789",
    "password": "password",
    "disabilityType": "physical",
    "additionalNeeds": ["wheelchair"]
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nationalId": "1234567890123",
    "password": "password"
  }'
```

Expected response:
```json
{
  "token": "uuid-token-here",
  "user": {
    "id": "...",
    "role": "volunteer",
    "firstName": "สมชาย",
    ...
  }
}
```

### 5. Test Duplicate National ID
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "volunteer",
    "firstName": "Test",
    "lastName": "User",
    "nationalId": "1234567890123",
    "phone": "081-234-5678",
    "password": "password"
  }'
```

Expected response (409 Conflict):
```json
{"error":"เลขบัตรประชาชนนี้ถูกใช้งานแล้ว"}
```

## Frontend Testing

1. Start frontend:
```bash
cd frontend
npm start
```

2. Try to register a new user
3. Try to login with registered credentials
4. Try to register with duplicate national ID (should show error)

