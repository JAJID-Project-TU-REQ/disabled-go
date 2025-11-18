# Crow's Foot ERD Summary

## Entities และ Attributes

### 1. **USERS** (ผู้ใช้)
**Primary Key:** `id` (VARCHAR(36))

**Attributes:**
- `id` (PK) - VARCHAR(36) - รหัสผู้ใช้
- `role` - ENUM('volunteer', 'requester') - บทบาท (อาสาสมัคร/ผู้พิการ)
- `first_name` - VARCHAR(100) - ชื่อ
- `last_name` - VARCHAR(100) - นามสกุล
- `national_id` - VARCHAR(13) UNIQUE - เลขบัตรประชาชน (Unique)
- `phone` - VARCHAR(20) - เบอร์โทรศัพท์
- `email` - VARCHAR(255) - อีเมล (Optional)
- `password` - VARCHAR(255) - รหัสผ่าน (hashed)
- `skills` - TEXT (JSON array) - ทักษะ (สำหรับอาสาสมัคร)
- `biography` - TEXT - ประวัติส่วนตัว
- `disability_type` - VARCHAR(50) - ประเภทความพิการ (สำหรับผู้พิการ)
- `additional_needs` - TEXT (JSON array) - ความต้องการเพิ่มเติม (สำหรับผู้พิการ)
- `rating` - DECIMAL(3,2) DEFAULT 0.00 - คะแนนเฉลี่ย (สำหรับอาสาสมัคร)
- `completed_jobs` - INT DEFAULT 0 - จำนวนงานที่ทำเสร็จ (สำหรับอาสาสมัคร)
- `created_at` - TIMESTAMP - วันที่สร้าง

**Indexes:**
- `idx_national_id` (national_id)
- `idx_role` (role)

---

### 2. **JOBS** (งาน)
**Primary Key:** `id` (VARCHAR(36))

**Attributes:**
- `id` (PK) - VARCHAR(36) - รหัสงาน
- `title` - VARCHAR(255) - ชื่องาน
- `requester_id` (FK) - VARCHAR(36) - รหัสผู้พิการที่สร้างงาน
- `work_date` - DATE - วันที่ทำงาน (Optional)
- `start_time` - TIME - เวลาเริ่มงาน (Optional)
- `end_time` - TIME - เวลาสิ้นสุดงาน (Optional)
- `location` - VARCHAR(255) - สถานที่
- `distance_km` - DECIMAL(10,2) DEFAULT 0.00 - ระยะทาง (กิโลเมตร)
- `status` - ENUM('open', 'completed', 'cancelled') DEFAULT 'open' - สถานะงาน
- `accepted_volunteer_id` (FK) - VARCHAR(36) - รหัสอาสาสมัครที่รับงาน (Optional)
- `description` - TEXT - รายละเอียดงาน
- `meeting_point` - VARCHAR(255) - จุดนัดพบ
- `requirements` - TEXT (JSON array) - ความต้องการ/ทักษะที่ต้องการ
- `latitude` - DECIMAL(10,8) - ละติจูด
- `longitude` - DECIMAL(11,8) - ลองจิจูด
- `contact_name` - VARCHAR(255) - ชื่อผู้ติดต่อ
- `contact_number` - VARCHAR(20) - เบอร์โทรติดต่อ
- `requester_rating` - INT - คะแนนที่ผู้พิการให้กับอาสาสมัคร (1-5) (Optional)
- `requester_review` - TEXT - ความคิดเห็นที่ผู้พิการเขียน (Optional)
- `created_at` - TIMESTAMP - วันที่สร้าง
- `updated_at` - TIMESTAMP - วันที่อัปเดตล่าสุด

**Foreign Keys:**
- `requester_id` → `users(id)` ON DELETE CASCADE
- `accepted_volunteer_id` → `users(id)` ON DELETE SET NULL

**Indexes:**
- `idx_requester_id` (requester_id)
- `idx_status` (status)
- `idx_accepted_volunteer_id` (accepted_volunteer_id)

---

### 3. **APPLICATIONS** (ใบสมัครงาน)
**Primary Key:** `id` (VARCHAR(36))

**Attributes:**
- `id` (PK) - VARCHAR(36) - รหัสใบสมัคร
- `job_id` (FK) - VARCHAR(36) - รหัสงาน
- `volunteer_id` (FK) - VARCHAR(36) - รหัสอาสาสมัครที่สมัคร
- `status` - ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' - สถานะการสมัคร
- `created_at` - TIMESTAMP - วันที่สมัคร
- `updated_at` - TIMESTAMP - วันที่อัปเดตล่าสุด

**Foreign Keys:**
- `job_id` → `jobs(id)` ON DELETE CASCADE
- `volunteer_id` → `users(id)` ON DELETE CASCADE

**Unique Constraint:**
- `unique_job_volunteer` (job_id, volunteer_id) - อาสาสมัครแต่ละคนสมัครงานเดียวกันได้แค่ครั้งเดียว

**Indexes:**
- `idx_job_id` (job_id)
- `idx_volunteer_id` (volunteer_id)
- `idx_status` (status)

---

## Relationships (Crow's Foot Notation)

```
USERS ──┐
        │
        ├───< (1:N) ── JOBS (requester_id)
        │              [ผู้พิการ 1 คน สร้างงานได้หลายงาน]
        │
        ├───< (1:N) ── JOBS (accepted_volunteer_id)
        │              [อาสาสมัคร 1 คน รับงานได้หลายงาน] (Optional)
        │
        └───< (1:N) ── APPLICATIONS (volunteer_id)
                       [อาสาสมัคร 1 คน สมัครงานได้หลายงาน]

JOBS ────< (1:N) ──── APPLICATIONS (job_id)
                      [งาน 1 งาน มีใบสมัครได้หลายใบ]
```

### รายละเอียด Relationships:

1. **USERS (requester) → JOBS** (1:N)
   - ผู้พิการ 1 คน สร้างงานได้หลายงาน
   - Foreign Key: `jobs.requester_id` → `users.id`
   - ON DELETE CASCADE (ถ้าลบผู้ใช้ งานที่สร้างจะถูกลบด้วย)

2. **USERS (volunteer) → JOBS** (1:N, Optional)
   - อาสาสมัคร 1 คน รับงานได้หลายงาน
   - Foreign Key: `jobs.accepted_volunteer_id` → `users.id`
   - ON DELETE SET NULL (ถ้าลบอาสาสมัคร accepted_volunteer_id จะเป็น NULL)
   - Optional (งานอาจยังไม่มีคนรับ)

3. **USERS (volunteer) → APPLICATIONS** (1:N)
   - อาสาสมัคร 1 คน สมัครงานได้หลายงาน
   - Foreign Key: `applications.volunteer_id` → `users.id`
   - ON DELETE CASCADE (ถ้าลบอาสาสมัคร ใบสมัครจะถูกลบด้วย)

4. **JOBS → APPLICATIONS** (1:N)
   - งาน 1 งาน มีใบสมัครได้หลายใบ
   - Foreign Key: `applications.job_id` → `jobs.id`
   - ON DELETE CASCADE (ถ้าลบงาน ใบสมัครจะถูกลบด้วย)
   - Unique Constraint: อาสาสมัครแต่ละคนสมัครงานเดียวกันได้แค่ครั้งเดียว

---

## Business Rules

1. **Users** แบ่งเป็น 2 ประเภท:
   - `volunteer` (อาสาสมัคร): มี `skills`, `biography`, `rating`, `completed_jobs`
   - `requester` (ผู้พิการ): มี `disability_type`, `additional_needs`

2. **Jobs** สถานะ:
   - `open`: เปิดรับสมัคร
   - `completed`: เสร็จสิ้นแล้ว
   - `cancelled`: ยกเลิก

3. **Applications** สถานะ:
   - `pending`: รอดำเนินการ
   - `accepted`: ถูกยอมรับ (มีแค่ 1 คนต่องาน)
   - `rejected`: ถูกปฏิเสธ

4. **Rating System:**
   - `requester_rating` และ `requester_review` เก็บใน `jobs` table
   - `rating` (เฉลี่ย) ของ volunteer เก็บใน `users` table
   - Rating จะถูกคำนวณใหม่ทุกครั้งที่มีการให้คะแนน

