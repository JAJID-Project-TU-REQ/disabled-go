-- Create test users
-- Password for all users: "password"
-- Bcrypt hash of "password" (default cost): $2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q

-- Volunteers (อาสาสมัคร) - 3 คน
INSERT INTO users (id, role, first_name, last_name, national_id, phone, email, password, skills, biography, disability_type, additional_needs, rating, completed_jobs) 
VALUES 
(UUID(), 'volunteer', 'สมชาย', 'ใจดี', '1100123456789', '081-234-5678', 'somchai@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '["wheelchair_support","thai_language","first_aid"]', 'ฉันมีความสนใจในการช่วยเหลือผู้พิการและผู้สูงอายุ ฉันมีประสบการณ์ในการช่วยเหลือผู้ใช้รถเข็นและสามารถสื่อสารภาษาไทยได้ดี', NULL, NULL, 0.00, 0),
(UUID(), 'volunteer', 'นารา', 'ใจบุญ', '1100234567890', '082-345-6789', 'nara@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '["visual_impairment_support","thai_language","transportation","shopping_assistance"]', 'มีความเชี่ยวชาญในการช่วยเหลือผู้พิการทางสายตา มีประสบการณ์มากกว่า 5 ปี สามารถช่วยในการเดินทางและซื้อของได้', NULL, NULL, 0.00, 0),
(UUID(), 'volunteer', 'วิชัย', 'ช่วยเหลือ', '1100345678901', '083-456-7890', 'wichai@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '["first_aid","elderly_care","hospital_visits","thai_language","english_language"]', 'ฉันเป็นพยาบาลที่เกษียณแล้ว มีประสบการณ์ในการดูแลผู้สูงอายุและผู้ป่วย สามารถช่วยในการไปโรงพยาบาลและปฐมพยาบาลได้', NULL, NULL, 0.00, 0);

-- Requesters (ผู้พิการ) - 3 คน
INSERT INTO users (id, role, first_name, last_name, national_id, phone, email, password, skills, biography, disability_type, additional_needs, rating, completed_jobs) 
VALUES 
(UUID(), 'requester', 'สมหญิง', 'ต้องการความช่วยเหลือ', '1100456789012', '084-567-8901', 'somying@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '[]', '', 'physical', '["wheelchair"]', 0.00, 0),
(UUID(), 'requester', 'ประเสริฐ', 'ต้องการความช่วยเหลือ', '1100567890123', '085-678-9012', 'prasert@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '[]', '', 'visual', '["glasses"]', 0.00, 0),
(UUID(), 'requester', 'มาลี', 'ต้องการความช่วยเหลือ', '1100678901234', '086-789-0123', 'malee@example.com', '$2a$10$6UH0WAcbd7HGuC6DUYm02.KMh2gldGnL0b2yPtFhozcPOd7U/y34q', '[]', '', 'hearing', '["hearing_aid"]', 0.00, 0);

