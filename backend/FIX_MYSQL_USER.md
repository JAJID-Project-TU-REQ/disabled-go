# วิธีแก้ไข MySQL User Problem

## ปัญหา
- User `app_user` login ไม่ได้
- Root password ก็ไม่ถูกต้อง

## วิธีแก้ไข (ทำใน Terminal ของ container db-1)

### ขั้นตอนที่ 1: ลอง Login ด้วย Root (ไม่ใส่ password)
```bash
mysql -u root
```

### ขั้นตอนที่ 2: ถ้าได้ ให้สร้าง User ใหม่
```sql
-- ลบ user เก่า (ถ้ามี)
DROP USER IF EXISTS 'app_user'@'%';
DROP USER IF EXISTS 'app_user'@'localhost';

-- สร้าง user ใหม่
CREATE USER 'app_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'app_user'@'localhost' IDENTIFIED BY '1234';

-- ให้สิทธิ์
GRANT ALL PRIVILEGES ON disabled_go.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON disabled_go.* TO 'app_user'@'localhost';

-- บันทึกการเปลี่ยนแปลง
FLUSH PRIVILEGES;

-- ตรวจสอบ
SELECT User, Host FROM mysql.user WHERE User='app_user';

-- ออก
EXIT;
```

### ขั้นตอนที่ 3: ลอง Login อีกครั้ง
```bash
mysql -u app_user -p disabled_go
# password: 1234
```

