# คู่มือการ Testing ด้วย Postman - ตั้งแต่ Setup จนถึง Testing

## 📋 สารบัญ
1. [Prerequisites](#1-prerequisites)
2. [Setup Backend](#2-setup-backend)
3. [เปิด Backend Server](#3-เปิด-backend-server)
4. [Setup Postman](#4-setup-postman)
5. [API Endpoints ทั้งหมด](#5-api-endpoints-ทั้งหมด)
6. [Testing Flow แนะนำ](#6-testing-flow-แนะนำ)

---

## 1. Prerequisites

### สิ่งที่ต้องมี:
- ✅ Docker Desktop (สำหรับรัน database และ backend)
- ✅ Postman (สำหรับ testing API)
- ✅ Git (ถ้ายังไม่มีโค้ด)

### ตรวจสอบว่า Docker ทำงานอยู่:
```bash
docker --version
docker ps
```

---

## 2. Setup Backend

### 2.1 ตรวจสอบไฟล์ password
```bash
cd backend
cat db/password.txt
```

ถ้าไม่มีไฟล์ ให้สร้าง:
```bash
echo "1234" > db/password.txt
```

### 2.2 ตรวจสอบ Docker Compose
```bash
# ตรวจสอบว่า compose.yaml มีอยู่
ls compose.yaml
```

---

## 3. เปิด Backend Server

### 3.1 เปิด Docker Desktop
- เปิด Docker Desktop application
- รอจน Docker ทำงาน (ไอคอน Docker อยู่ที่ system tray)

### 3.2 รัน Backend ด้วย Docker Compose
```bash
cd backend
docker compose up -d
```

**คำอธิบาย:**
- `docker compose up` - รัน containers
- `-d` - รันในโหมด background (detached)

### 3.3 ตรวจสอบว่า containers ทำงานอยู่
```bash
docker ps
```

**ควรเห็น:**
```
CONTAINER ID   IMAGE            STATUS
xxxxx          backend-server   Up X seconds
xxxxx          mysql:8.0         Up X seconds (healthy)
```

### 3.4 ตรวจสอบ logs (ถ้าต้องการ)
```bash
# ดู logs ของ server
docker compose logs -f server

# ดู logs ของ database
docker compose logs -f db
```

### 3.5 ทดสอบว่า server ทำงาน
เปิด browser ไปที่: `http://localhost:3000/ping`

**ควรเห็น:**
```json
{"message":"pong"}
```

### 3.6 หยุด Backend (เมื่อเสร็จแล้ว)
```bash
docker compose down
```

---

## 4. Setup Postman

### 4.1 ติดตั้ง Postman
- ดาวน์โหลดจาก: https://www.postman.com/downloads/
- ติดตั้งตามปกติ

### 4.2 Import Collection และ Environment (แนะนำ - พร้อมใช้เลย!)

**วิธีที่ 1: Import ทั้ง Collection และ Environment (แนะนำ)**
1. เปิด Postman
2. คลิก **"Import"** (ซ้ายบน)
3. คลิก **"Upload Files"**
4. เลือกไฟล์ทั้ง 2 ไฟล์:
   - `Disabled_Go_API.postman_collection.json` (Collection)
   - `Local_Development.postman_environment.json` (Environment)
5. คลิก **"Import"**
6. เลือก Environment: `Local Development` (dropdown ด้านบนขวา)

**วิธีที่ 2: Import แยก**
1. Import Collection:
   - File → Import → เลือก `Disabled_Go_API.postman_collection.json`
2. Import Environment:
   - File → Import → เลือก `Local_Development.postman_environment.json`
3. เลือก Environment: `Local Development` (dropdown ด้านบนขวา)

**✅ พร้อมใช้งานแล้ว!** Collection มี:
- ✅ Requests ทั้งหมด 21 endpoints
- ✅ Request body ตัวอย่างพร้อมใช้
- ✅ Auto-save IDs ใน environment variables (ผ่าน Tests scripts)
- ✅ Variables: `base_url`, `api_url` (ตั้งค่าไว้แล้ว)

---

## 5. API Endpoints ทั้งหมด

### 🔐 Authentication Endpoints

#### 5.1 Health Check
**GET** `/ping`

**Description:** ตรวจสอบว่า server ทำงานอยู่

**Postman Setup:**
- Method: `GET`
- URL: `{{base_url}}/ping`
- Headers: ไม่ต้องใส่

**Expected Response:**
```json
{
  "message": "pong"
}
```

---

#### 5.2 Register User (Volunteer)
**POST** `/api/auth/register`

**Description:** สมัครสมาชิกเป็นอาสาสมัคร

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "role": "volunteer",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "nationalId": "1100123456789",
  "phone": "081-234-5678",
  "email": "somchai@example.com",
  "password": "password",
  "skills": ["wheelchair_support", "thai_language", "first_aid"],
  "biography": "ฉันมีความสนใจในการช่วยเหลือผู้พิการและผู้สูงอายุ"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "role": "volunteer",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "nationalId": "1100123456789",
  "phone": "081-234-5678",
  "email": "somchai@example.com",
  "skills": ["wheelchair_support", "thai_language", "first_aid"],
  "biography": "ฉันมีความสนใจในการช่วยเหลือผู้พิการและผู้สูงอายุ",
  "rating": 0,
  "completedJobs": 0,
  "createdAt": "2025-01-XX..."
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ใน environment variable `user_id_volunteer`

---

#### 5.3 Register User (Requester)
**POST** `/api/auth/register`

**Description:** สมัครสมาชิกเป็นผู้พิการ

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "role": "requester",
  "firstName": "สมหญิง",
  "lastName": "ต้องการความช่วยเหลือ",
  "nationalId": "1100456789012",
  "phone": "084-567-8901",
  "email": "somying@example.com",
  "password": "password",
  "disabilityType": "physical",
  "additionalNeeds": ["wheelchair"]
}
```

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "role": "requester",
  "firstName": "สมหญิง",
  "lastName": "ต้องการความช่วยเหลือ",
  "nationalId": "1100456789012",
  "phone": "084-567-8901",
  "email": "somying@example.com",
  "disabilityType": "physical",
  "additionalNeeds": ["wheelchair"],
  "rating": 0,
  "completedJobs": 0,
  "createdAt": "2025-01-XX..."
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ใน environment variable `user_id_requester`

---

#### 5.4 Login
**POST** `/api/auth/login`

**Description:** เข้าสู่ระบบ

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nationalId": "1100123456789",
  "password": "password"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "uuid-token-here",
  "user": {
    "id": "uuid-here",
    "role": "volunteer",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    ...
  }
}
```

---

### 👤 User Endpoints

#### 5.5 Get User Profile
**GET** `/api/users/:id`

**Description:** ดึงข้อมูลผู้ใช้

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/users/{{user_id_volunteer}}`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "role": "volunteer",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  ...
}
```

---

#### 5.6 Update User Profile
**PUT** `/api/users/:id`

**Description:** อัปเดตข้อมูลผู้ใช้

**Postman Setup:**
- Method: `PUT`
- URL: `{{api_url}}/users/{{user_id_volunteer}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดีมาก",
  "phone": "081-234-5678",
  "biography": "อัปเดตประวัติใหม่"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "firstName": "สมชาย",
  "lastName": "ใจดีมาก",
  ...
}
```

---

### 💼 Job Endpoints

#### 5.7 Get All Jobs
**GET** `/api/jobs`

**Description:** ดึงรายการงานทั้งหมด

**Query Parameters:**
- `volunteerId` (optional) - ถ้าส่งมา จะแสดง applicationStatus ด้วย

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/jobs`
- หรือ: `{{api_url}}/jobs?volunteerId={{user_id_volunteer}}`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "uuid-here",
      "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
      "requesterId": "uuid-here",
      "location": "โรงพยาบาลจุฬาลงกรณ์",
      "status": "open",
      "applicationStatus": "pending",
      ...
    }
  ]
}
```

---

#### 5.8 Get Job by ID
**GET** `/api/jobs/:id`

**Description:** ดึงรายละเอียดงาน

**Query Parameters:**
- `volunteerId` (optional) - ถ้าส่งมา จะแสดง applicationStatus ด้วย

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/jobs/{{job_id}}`
- หรือ: `{{api_url}}/jobs/{{job_id}}?volunteerId={{user_id_volunteer}}`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
  "description": "ต้องการอาสาสมัครช่วยพาไปโรงพยาบาล",
  "location": "โรงพยาบาลจุฬาลงกรณ์",
  "latitude": 13.7367,
  "longitude": 100.5231,
  "status": "open",
  ...
}
```

---

#### 5.9 Create Job
**POST** `/api/jobs`

**Description:** สร้างงานใหม่ (สำหรับผู้พิการ)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/jobs`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "requesterId": "{{user_id_requester}}",
  "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
  "location": "โรงพยาบาลจุฬาลงกรณ์",
  "meetingPoint": "หน้าประตูหลัก",
  "description": "ต้องการอาสาสมัครช่วยพาไปโรงพยาบาลเพื่อนัดตรวจสุขภาพประจำปี",
  "requirements": ["wheelchair_support", "thai_language"],
  "latitude": 13.7367,
  "longitude": 100.5231,
  "workDate": "2025-03-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
  "status": "open",
  ...
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ใน environment variable `job_id`

---

#### 5.10 Update Job
**PUT** `/api/jobs/:id`

**Description:** อัปเดตรายละเอียดงาน

**Postman Setup:**
- Method: `PUT`
- URL: `{{api_url}}/jobs/{{job_id}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "title": "อัปเดตชื่องาน",
  "description": "อัปเดตรายละเอียด",
  "workDate": "2025-03-20",
  "startTime": "10:00",
  "endTime": "13:00"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "title": "อัปเดตชื่องาน",
  ...
}
```

---

#### 5.11 Delete Job
**DELETE** `/api/jobs/:id`

**Description:** ลบงาน

**Postman Setup:**
- Method: `DELETE`
- URL: `{{api_url}}/jobs/{{job_id}}`
- Headers: ไม่ต้องใส่

**Expected Response (204 No Content):**
ไม่มี body

---

#### 5.12 Get Requester Jobs
**GET** `/api/requesters/:id/jobs`

**Description:** ดึงรายการงานของผู้พิการ

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/requesters/{{user_id_requester}}/jobs`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "uuid-here",
      "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
      "status": "open",
      "acceptedVolunteerName": "สมชาย ใจดี",
      ...
    }
  ]
}
```

---

### 📝 Application Endpoints

#### 5.13 Apply to Job
**POST** `/api/jobs/:id/apply`

**Description:** สมัครงาน (สำหรับอาสาสมัคร)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/jobs/{{job_id}}/apply`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "volunteerId": "{{user_id_volunteer}}"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "application-uuid-here"
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ใน environment variable `application_id`

---

#### 5.14 Cancel Application
**POST** `/api/jobs/:id/cancel`

**Description:** ยกเลิกการสมัครงาน

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/jobs/{{job_id}}/cancel`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "volunteerId": "{{user_id_volunteer}}"
}
```

**Expected Response (204 No Content):**
ไม่มี body

---

#### 5.15 Get Job Applications
**GET** `/api/jobs/:id/applications`

**Description:** ดึงรายการผู้สมัครงาน (สำหรับผู้พิการ)

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/jobs/{{job_id}}/applications`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "applications": [
    {
      "id": "uuid-here",
      "jobId": "uuid-here",
      "volunteerId": "uuid-here",
      "status": "pending",
      "volunteer": {
        "id": "uuid-here",
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "rating": 4.5,
        ...
      }
    }
  ]
}
```

---

#### 5.16 Accept Application
**POST** `/api/applications/:id/accept`

**Description:** ยอมรับผู้สมัคร (สำหรับผู้พิการ)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/applications/{{application_id}}/accept`
- Headers: ไม่ต้องใส่

**Expected Response (204 No Content):**
ไม่มี body

**Note:** เมื่อ accept แล้ว ผู้สมัครคนอื่นจะถูก reject อัตโนมัติ

---

#### 5.17 Reject Application
**POST** `/api/applications/:id/reject`

**Description:** ปฏิเสธผู้สมัคร (สำหรับผู้พิการ)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/applications/{{application_id}}/reject`
- Headers: ไม่ต้องใส่

**Expected Response (204 No Content):**
ไม่มี body

---

#### 5.18 Get Volunteer Applications
**GET** `/api/volunteers/:id/applications`

**Description:** ดึงรายการงานที่อาสาสมัครสมัครไป

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/volunteers/{{user_id_volunteer}}/applications`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "application": {
        "id": "uuid-here",
        "jobId": "uuid-here",
        "volunteerId": "uuid-here",
        "status": "pending",
        ...
      },
      "job": {
        "id": "uuid-here",
        "title": "ต้องการความช่วยเหลือไปโรงพยาบาล",
        "status": "open",
        ...
      }
    }
  ]
}
```

---

### ✅ Completion & Reviews Endpoints

#### 5.19 Complete Job
**POST** `/api/jobs/:id/complete`

**Description:** เสร็จสิ้นงาน (สำหรับอาสาสมัคร)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/jobs/{{job_id}}/complete`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "volunteerId": "{{user_id_volunteer}}"
}
```

**Expected Response (204 No Content):**
ไม่มี body

**Note:** ต้องเป็นงานที่มี status = "open" และมี acceptedVolunteerId

---

#### 5.20 Submit Rating
**POST** `/api/jobs/:id/rating`

**Description:** ให้คะแนนและรีวิวผู้ดูแล (สำหรับผู้พิการ)

**Postman Setup:**
- Method: `POST`
- URL: `{{api_url}}/jobs/{{job_id}}/rating`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "rating": 5,
  "review": "คุณสมชายช่วยเหลือได้ดีมาก ใจดีและมีความอดทนสูง ขอบคุณมากค่ะ"
}
```

**Expected Response (204 No Content):**
ไม่มี body

**Note:** 
- ต้องเป็นงานที่มี status = "completed"
- ต้องมี acceptedVolunteerId
- ให้คะแนนได้แค่ครั้งเดียว

---

#### 5.21 Get Volunteer Reviews
**GET** `/api/volunteers/:id/reviews`

**Description:** ดึงรีวิวของอาสาสมัคร

**Postman Setup:**
- Method: `GET`
- URL: `{{api_url}}/volunteers/{{user_id_volunteer}}/reviews`
- Headers: ไม่ต้องใส่

**Expected Response (200 OK):**
```json
[
  {
    "jobTitle": "ต้องการความช่วยเหลือไปโรงพยาบาล",
    "rating": 5,
    "review": "คุณสมชายช่วยเหลือได้ดีมาก ใจดีและมีความอดทนสูง",
    "requesterName": "สมหญิง ต้องการความช่วยเหลือ",
    "createdAt": "2025-01-XX..."
  }
]
```

---

## 6. Testing Flow แนะนำ

### Flow 1: สมัครสมาชิกและ Login
1. Register Volunteer (5.2) → เก็บ `user_id_volunteer`
2. Register Requester (5.3) → เก็บ `user_id_requester`
3. Login Volunteer (5.4)
4. Login Requester (5.4)

### Flow 2: สร้างงานและสมัครงาน
1. Create Job (5.9) → เก็บ `job_id`
2. Get All Jobs (5.7) → ตรวจสอบว่าเห็นงาน
3. Apply to Job (5.13) → เก็บ `application_id`
4. Get Job Applications (5.15) → ตรวจสอบว่ามีผู้สมัคร
5. Accept Application (5.16) → ยอมรับผู้สมัคร

### Flow 3: เสร็จสิ้นงานและให้คะแนน
1. Complete Job (5.19) → เสร็จสิ้นงาน
2. Submit Rating (5.20) → ให้คะแนน
3. Get Volunteer Reviews (5.21) → ตรวจสอบรีวิว

### Flow 4: อัปเดตข้อมูล
1. Get User Profile (5.5) → ดูข้อมูลปัจจุบัน
2. Update User Profile (5.6) → อัปเดตข้อมูล
3. Get User Profile (5.5) → ตรวจสอบว่าอัปเดตแล้ว

---

## 💡 Tips สำหรับ Postman

### 1. ใช้ Environment Variables
- เก็บ IDs ไว้ใน environment variables
- ใช้ `{{variable_name}}` ใน URL และ Body

### 2. ใช้ Pre-request Scripts
- Auto-generate IDs
- Auto-set timestamps

### 3. ใช้ Tests Tab
- ตรวจสอบ response status
- เก็บ IDs อัตโนมัติ:
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("user_id_volunteer", jsonData.id);
}
```

### 4. Export Collection
- Export collection เพื่อแชร์กับทีม
- File → Export → Collection v2.1

---

## 🐛 Troubleshooting

### Backend ไม่ทำงาน
```bash
# ตรวจสอบ containers
docker ps

# ดู logs
docker compose logs server

# Restart
docker compose restart
```

### Database connection error
```bash
# ตรวจสอบ database
docker compose logs db

# ตรวจสอบ password file
cat db/password.txt
```

### Port 3000 ถูกใช้งานแล้ว
```bash
# หา process ที่ใช้ port 3000
netstat -ano | findstr :3000

# หรือเปลี่ยน port ใน compose.yaml
```

---

## ✅ Checklist

- [ ] Docker Desktop ทำงานอยู่
- [ ] Backend server ทำงาน (ทดสอบ `/ping`)
- [ ] Postman ติดตั้งแล้ว
- [ ] Environment variables ตั้งค่าแล้ว
- [ ] ทดสอบ Register และ Login สำเร็จ
- [ ] ทดสอบ Create Job สำเร็จ
- [ ] ทดสอบ Apply to Job สำเร็จ
- [ ] ทดสอบ Accept Application สำเร็จ
- [ ] ทดสอบ Complete Job สำเร็จ
- [ ] ทดสอบ Submit Rating สำเร็จ

---

**Happy Testing! 🚀**

