# วิธีใช้ MySQL ใน Docker (ง่ายๆ)

## สิ่งที่ต้องรู้

1. **MySQL อยู่ใน container ชื่อ `db-1`** (ไม่ใช่ `backend`)
2. Container `backend` เป็น backend server (Go) - ไม่มี MySQL
3. Container `db-1` เป็น MySQL database

## วิธีเข้า MySQL (3 วิธี)

### วิธีที่ 1: ใช้ Docker Desktop (ง่ายที่สุด)

1. เปิด Docker Desktop
2. ไปที่แท็บ **Containers**
3. **หา container ชื่อ `db-1`** (ไม่ใช่ `backend`)
4. คลิกที่ `db-1`
5. คลิกแท็บ **"Exec"** หรือ **"Terminal"**
6. พิมพ์คำสั่ง:
   ```bash
   mysql -u app_user -p disabled_go
   ```
7. พิมพ์ password: `1234`

### วิธีที่ 2: ใช้ Command Line (Terminal/PowerShell)

เปิด Terminal หรือ PowerShell แล้วพิมพ์:

```bash
docker exec -it backend-db-1 mysql -u app_user -p1234 disabled_go
```

**หมายเหตุ:** `-p1234` คือ password (ไม่มีช่องว่างระหว่าง -p กับ password)

### วิธีที่ 3: เข้าไปใน Container ก่อน แล้วค่อยใช้ MySQL

```bash
# 1. เข้าไปใน container
docker exec -it backend-db-1 bash

# 2. อยู่ใน container แล้ว พิมพ์:
mysql -u app_user -p disabled_go

# 3. พิมพ์ password: 1234
```

## คำสั่ง MySQL ที่ใช้บ่อย

หลังจาก login เข้า MySQL แล้ว:

```sql
-- เช็คว่ามี tables อะไรบ้าง
SHOW TABLES;

-- ดูโครงสร้าง table
DESCRIBE users;

-- ดูข้อมูลใน table
SELECT * FROM users;

-- ออกจาก MySQL
EXIT;
```

## ถ้ายัง Login ไม่ได้

ลองวิธีนี้:

```bash
# ลองใช้ root user
docker exec -it backend-db-1 mysql -u root -p
# password: 1234

# หรือถ้าไม่ได้ ลองไม่ใส่ password
docker exec -it backend-db-1 mysql -u root
```

## สรุป

- ✅ **ถูกต้อง:** เข้า container `db-1` แล้วใช้ MySQL
- ❌ **ผิด:** เข้า container `backend` แล้วใช้ MySQL (container นี้ไม่มี MySQL)

