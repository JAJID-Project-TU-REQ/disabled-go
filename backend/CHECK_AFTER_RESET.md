# วิธีตรวจสอบหลัง Reset Container

## 1. ตรวจสอบว่า Containers รันอยู่

```bash
docker compose ps
```

ควรเห็น:
- `backend-db-1` - Up (healthy)
- `backend-server-1` - Up

## 2. รอให้ MySQL พร้อม (ประมาณ 10-20 วินาที)

ตรวจสอบ logs:
```bash
docker compose logs db
```

ควรเห็น: `MySQL init process done. Ready for start up.`

## 3. ลอง Login เข้า MySQL

### วิธีที่ 1: ใช้ Docker Desktop
1. เปิด container `db-1`
2. เปิด Terminal
3. พิมพ์:
   ```bash
   mysql -u app_user -p disabled_go
   ```
4. Password: `1234`

### วิธีที่ 2: ใช้ Command Line
```bash
docker exec -it backend-db-1 mysql -u app_user -p1234 disabled_go
```

## 4. ตรวจสอบว่า Tables ถูกสร้างแล้ว

หลังจาก login เข้า MySQL แล้ว:
```sql
SHOW TABLES;
```

ควรเห็น:
- `users`
- `jobs`
- `applications`

## 5. ตรวจสอบ Backend Server

```bash
# เช็ค logs
docker compose logs server

# ทดสอบ ping
curl http://localhost:3000/ping
```

ควรได้: `{"message":"pong"}`

## 6. ถ้ายัง Login ไม่ได้

ลองใช้ root user:
```bash
docker exec -it backend-db-1 mysql -u root -p
# password: 1234
```

แล้วสร้าง user ใหม่:
```sql
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON disabled_go.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

