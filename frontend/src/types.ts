export type UserRole = 'volunteer' | 'requester';

export type UserProfile = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  nationalId: string; // เลขบัตรประชาชน
  phone: string;
  email?: string; // ไม่บังคับแล้ว
  address?: string; // ไม่บังคับแล้ว
  skills: string[]; // สำหรับอาสาสมัคร
  biography: string; // เกี่ยวกับคุณ (สำหรับอาสาสมัคร)
  disabilityType?: string; // ประเภทความพิการ (สำหรับผู้พิการ)
  additionalNeeds?: string[]; // ความต้องการเพิ่มเติม (สำหรับผู้พิการ)
  interests: string[]; // เก็บไว้สำหรับ backward compatibility
  rating: number;
  completedJobs: number;
  createdAt: string;
};

export type JobSummary = {
  id: string;
  title: string;
  requesterId: string;
  workDate?: string; // วันที่ทำงาน (YYYY-MM-DD)
  startTime?: string; // เวลาเริ่มงาน (ISO string หรือ HH:mm)
  endTime?: string; // เวลาเลิกงาน (ISO string หรือ HH:mm)
  location: string;
  distanceKm: number;
  status: string;
  acceptedVolunteerId?: string; // ID ของอาสาสมัครที่รับงาน (สำหรับผู้พิการ)
  acceptedVolunteerName?: string; // ชื่ออาสาสมัครที่รับงาน (สำหรับผู้พิการ)
  requesterDisabilityType?: string; // ประเภทความพิการของผู้ลงงาน (สำหรับอาสาสมัคร)
  applicationStatus?: string; // สถานะการสมัครงานของอาสาสมัคร (pending, accepted, rejected) - สำหรับอาสาสมัคร
};

export type JobDetail = JobSummary & {
  description: string;
  meetingPoint: string;
  requirements: string[];
  latitude: number;
  longitude: number;
  contactName: string;
  contactNumber: string;
  requesterRating?: number; // คะแนนที่ requester ให้กับ volunteer (1-5)
  requesterReview?: string; // ความคิดเห็นที่ requester เขียนเกี่ยวกับ volunteer
};

export type LoginResponse = {
  token: string;
  user: UserProfile;
};

export type Application = {
  id: string;
  jobId: string;
  volunteerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type VolunteerApplication = {
  application: Application;
  job: JobSummary;
};
