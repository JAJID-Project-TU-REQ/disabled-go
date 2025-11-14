import { Application, JobDetail, JobSummary, LoginResponse, UserProfile, VolunteerApplication } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

// Internal type for mock users (includes password that we don't expose)
type MockUser = UserProfile & { password: string };

// Mock data storage (in-memory)
let mockUsers: MockUser[] = [
  {
    id: 'user-1',
    role: 'volunteer',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    nationalId: '1234567890123',
    phone: '081-234-5678',
    skills: ['wheelchair_support', 'thai_language', 'first_aid'],
    biography: 'ฉันมีความสนใจในการช่วยเหลือผู้พิการและผู้สูงอายุ ฉันมีประสบการณ์ในการช่วยเหลือผู้ใช้รถเข็นและสามารถสื่อสารภาษาไทยได้ดี',
    interests: [],
    rating: 4.8,
    completedJobs: 12,
    createdAt: '2024-01-15T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-2',
    role: 'requester',
    firstName: 'สมหญิง',
    lastName: 'ต้องการความช่วยเหลือ',
    nationalId: '2345678901234',
    phone: '082-345-6789',
    skills: [],
    disabilityType: 'physical',
    additionalNeeds: ['wheelchair'],
    interests: [],
    biography: '',
    rating: 0,
    completedJobs: 0,
    createdAt: '2024-02-01T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-3',
    role: 'requester',
    firstName: 'ประเสริฐ',
    lastName: 'ต้องการความช่วยเหลือ',
    nationalId: '3456789012345',
    phone: '083-456-7890',
    skills: [],
    disabilityType: 'visual',
    additionalNeeds: ['glasses'],
    interests: [],
    biography: '',
    rating: 0,
    completedJobs: 0,
    createdAt: '2024-03-01T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-4',
    role: 'volunteer',
    firstName: 'นารา',
    lastName: 'ใจบุญ',
    nationalId: '4567890123456',
    phone: '084-567-8901',
    skills: ['visual_impairment_support', 'thai_language', 'transportation', 'shopping_assistance'],
    biography: 'ฉันมีความเชี่ยวชาญในการช่วยเหลือผู้พิการทางสายตา มีประสบการณ์มากกว่า 5 ปี ฉันสามารถช่วยในการเดินทางและซื้อของได้',
    interests: [],
    rating: 4.9,
    completedJobs: 25,
    createdAt: '2024-01-10T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-5',
    role: 'volunteer',
    firstName: 'วิชัย',
    lastName: 'ช่วยเหลือ',
    nationalId: '5678901234567',
    phone: '085-678-9012',
    skills: ['first_aid', 'elderly_care', 'hospital_visits', 'thai_language', 'english_language'],
    biography: 'ฉันเป็นพยาบาลที่เกษียณแล้ว มีประสบการณ์ในการดูแลผู้สูงอายุและผู้ป่วย ฉันสามารถช่วยในการไปโรงพยาบาลและปฐมพยาบาลได้',
    interests: [],
    rating: 5.0,
    completedJobs: 40,
    createdAt: '2023-12-01T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-6',
    role: 'volunteer',
    firstName: 'มาลี',
    lastName: 'รักการช่วยเหลือ',
    nationalId: '6789012345678',
    phone: '086-789-0123',
    skills: ['wheelchair_support', 'transportation', 'shopping_assistance', 'thai_language'],
    biography: 'ฉันเป็นนักกายภาพบำบัด มีความเชี่ยวชาญในการช่วยเหลือผู้ใช้รถเข็น ฉันสามารถช่วยในการเดินทางและกิจกรรมต่างๆ ได้',
    interests: [],
    rating: 4.7,
    completedJobs: 18,
    createdAt: '2024-02-15T10:00:00Z',
    password: 'password',
  },
  {
    id: 'user-7',
    role: 'volunteer',
    firstName: 'ธนพล',
    lastName: 'อาสา',
    nationalId: '7890123456789',
    phone: '087-890-1234',
    skills: ['hearing_impairment_support', 'thai_language', 'transportation', 'hospital_visits'],
    biography: 'ฉันมีความเข้าใจในความต้องการของผู้พิการทางการได้ยิน ฉันสามารถช่วยในการสื่อสารและเดินทางได้',
    interests: [],
    rating: 4.6,
    completedJobs: 15,
    createdAt: '2024-02-20T10:00:00Z',
    password: 'password',
  },
];

let mockJobs: JobDetail[] = [
  {
    id: 'job-1',
    title: 'ต้องการความช่วยเหลือไปโรงพยาบาล',
    requesterId: 'user-2',
    workDate: '2025-03-15',
    startTime: '09:00',
    endTime: '12:00',
    location: 'โรงพยาบาลจุฬาลงกรณ์',
    distanceKm: 2.5,
    status: 'open',
    acceptedVolunteerId: undefined, // ยังไม่มีคนรับ
    description: 'ต้องการอาสาสมัครช่วยพาไปโรงพยาบาลเพื่อนัดตรวจสุขภาพประจำปี',
    meetingPoint: 'หน้าประตูหลัก',
    requirements: ['Wheelchair handling', 'Thai language'],
    latitude: 13.7367,
    longitude: 100.5231,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-2',
    title: 'ช่วยพาไปซื้อของ',
    requesterId: 'user-2',
    workDate: '2025-03-20',
    startTime: '14:00',
    endTime: '17:00',
    location: 'เซ็นทรัลเวิลด์',
    distanceKm: 5.0,
    status: 'open',
    description: 'ต้องการความช่วยเหลือในการพาไปซื้อของที่ห้างสรรพสินค้า',
    meetingPoint: 'หน้าห้างสรรพสินค้า',
    requirements: ['Wheelchair handling', 'Thai language', 'Shopping assistance'],
    latitude: 13.7473,
    longitude: 100.5395,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-3',
    title: 'ช่วยเหลือในการเดินทางไปสถานที่สำคัญ',
    requesterId: 'user-2',
    workDate: '2025-03-25',
    startTime: '10:00',
    endTime: '16:00',
    location: 'วัดพระแก้ว',
    distanceKm: 8.0,
    status: 'open',
    description: 'ต้องการอาสาสมัครช่วยพาไปเที่ยวสถานที่สำคัญในกรุงเทพ',
    meetingPoint: 'หน้าวัด',
    requirements: ['Wheelchair handling', 'Thai language', 'Tour guide knowledge'],
    latitude: 13.7501,
    longitude: 100.4925,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-4',
    title: 'ช่วยพาไปธนาคารทำธุรกรรม',
    requesterId: 'user-2',
    workDate: '2025-02-10',
    startTime: '10:00',
    endTime: '11:30',
    location: 'ธนาคารกรุงเทพ สาขาสีลม',
    distanceKm: 3.5,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // มีคนรับแล้ว (สมชาย ใจดี)
    description: 'ต้องการความช่วยเหลือในการพาไปธนาคารเพื่อทำธุรกรรมทางการเงิน',
    meetingPoint: 'หน้าธนาคาร',
    requirements: ['Wheelchair handling', 'Thai language'],
    latitude: 13.7286,
    longitude: 100.5327,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-5',
    title: 'ต้องการความช่วยเหลือไปซื้อของที่ตลาด',
    requesterId: 'user-2',
    workDate: '2025-03-28',
    startTime: '08:00',
    endTime: '11:00',
    location: 'ตลาดนัดจตุจักร',
    distanceKm: 6.0,
    status: 'in_progress',
    acceptedVolunteerId: 'user-6', // มีผู้ดูแลถูกเลือกแล้ว (มาลี รักการช่วยเหลือ)
    description: 'ต้องการอาสาสมัครช่วยพาไปซื้อของที่ตลาดนัดจตุจักร ต้องการความช่วยเหลือในการขนของและช่วยเลือกซื้อ',
    meetingPoint: 'ประตูหลักตลาดนัดจตุจักร',
    requirements: ['Wheelchair handling', 'Thai language', 'Shopping assistance'],
    latitude: 13.7983,
    longitude: 100.5500,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-6',
    title: 'ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ',
    requesterId: 'user-2',
    workDate: '2025-04-05',
    startTime: '09:00',
    endTime: '13:00',
    location: 'โรงพยาบาลบำรุงราษฎร์',
    distanceKm: 4.5,
    status: 'open',
    acceptedVolunteerId: undefined, // ยังไม่มีคนรับ - มีผู้สมัครหลายคน
    description: 'ต้องการอาสาสมัครช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพประจำปี ต้องการความช่วยเหลือในการเดินทางและช่วยติดต่อกับแพทย์',
    meetingPoint: 'หน้าประตูหลักโรงพยาบาล',
    requirements: ['Wheelchair handling', 'Thai language', 'Hospital visits', 'First aid'],
    latitude: 13.7300,
    longitude: 100.5390,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-7',
    title: 'ช่วยพาไปซื้อของที่ซูเปอร์มาร์เก็ต',
    requesterId: 'user-3',
    workDate: '2025-04-10',
    startTime: '15:00',
    endTime: '17:00',
    location: 'บิ๊กซี สาขาสีลม',
    distanceKm: 3.0,
    status: 'open',
    acceptedVolunteerId: undefined, // ยังไม่มีคนรับ - ยังไม่มีผู้สมัคร
    description: 'ต้องการอาสาสมัครช่วยพาไปซื้อของที่ซูเปอร์มาร์เก็ต ต้องการความช่วยเหลือในการขนของและช่วยเลือกซื้อ',
    meetingPoint: 'หน้าประตูหลักซูเปอร์มาร์เก็ต',
    requirements: ['Wheelchair handling', 'Thai language', 'Shopping assistance'],
    latitude: 13.7286,
    longitude: 100.5327,
    contactName: 'ประเสริฐ ต้องการความช่วยเหลือ',
    contactNumber: '083-456-7890',
  },
];

let mockApplications: Application[] = [
  // Applications for job-1 (ต้องการความช่วยเหลือไปโรงพยาบาล) - มีผู้สมัครหลายคน
  {
    id: 'app-1',
    jobId: 'job-1',
    volunteerId: 'user-1',
    status: 'pending',
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2025-03-10T10:00:00Z',
  },
  {
    id: 'app-1b',
    jobId: 'job-1',
    volunteerId: 'user-4',
    status: 'pending',
    createdAt: '2025-03-10T11:30:00Z',
    updatedAt: '2025-03-10T11:30:00Z',
  },
  {
    id: 'app-1c',
    jobId: 'job-1',
    volunteerId: 'user-5',
    status: 'pending',
    createdAt: '2025-03-10T14:00:00Z',
    updatedAt: '2025-03-10T14:00:00Z',
  },
  // Applications for job-2 (ช่วยพาไปซื้อของ) - มีผู้สมัครหลายคน
  {
    id: 'app-2',
    jobId: 'job-2',
    volunteerId: 'user-1',
    status: 'pending',
    createdAt: '2025-03-11T10:00:00Z',
    updatedAt: '2025-03-11T10:00:00Z',
  },
  {
    id: 'app-2b',
    jobId: 'job-2',
    volunteerId: 'user-6',
    status: 'pending',
    createdAt: '2025-03-11T13:00:00Z',
    updatedAt: '2025-03-11T13:00:00Z',
  },
  {
    id: 'app-2c',
    jobId: 'job-2',
    volunteerId: 'user-4',
    status: 'pending',
    createdAt: '2025-03-11T15:30:00Z',
    updatedAt: '2025-03-11T15:30:00Z',
  },
  // Applications for job-3 (ช่วยเหลือในการเดินทางไปสถานที่สำคัญ) - มีผู้สมัครหลายคน
  {
    id: 'app-3a',
    jobId: 'job-3',
    volunteerId: 'user-1',
    status: 'pending',
    createdAt: '2025-03-20T09:00:00Z',
    updatedAt: '2025-03-20T09:00:00Z',
  },
  {
    id: 'app-3b',
    jobId: 'job-3',
    volunteerId: 'user-4',
    status: 'pending',
    createdAt: '2025-03-20T11:00:00Z',
    updatedAt: '2025-03-20T11:00:00Z',
  },
  {
    id: 'app-3c',
    jobId: 'job-3',
    volunteerId: 'user-6',
    status: 'pending',
    createdAt: '2025-03-20T14:30:00Z',
    updatedAt: '2025-03-20T14:30:00Z',
  },
  // Applications for job-4 (ช่วยพาไปธนาคารทำธุรกรรม) - มีผู้สมัครหลายคน (user-1 ถูกเลือกแล้ว)
  {
    id: 'app-4a',
    jobId: 'job-4',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2025-02-05T10:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'app-4b',
    jobId: 'job-4',
    volunteerId: 'user-4',
    status: 'rejected', // ถูกปฏิเสธเพราะ user-1 ถูกเลือกแล้ว
    createdAt: '2025-02-05T11:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'app-4c',
    jobId: 'job-4',
    volunteerId: 'user-5',
    status: 'rejected', // ถูกปฏิเสธเพราะ user-1 ถูกเลือกแล้ว
    createdAt: '2025-02-05T13:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  // Applications for job-5 (ต้องการความช่วยเหลือไปซื้อของที่ตลาด) - มีผู้สมัครหลายคน (user-6 ถูกเลือกแล้ว)
  {
    id: 'app-3',
    jobId: 'job-5',
    volunteerId: 'user-1',
    status: 'rejected', // ถูกปฏิเสธเพราะ user-6 ถูกเลือกแล้ว
    createdAt: '2025-03-20T08:00:00Z',
    updatedAt: '2025-03-20T12:00:00Z',
  },
  {
    id: 'app-4',
    jobId: 'job-5',
    volunteerId: 'user-4',
    status: 'rejected', // ถูกปฏิเสธเพราะ user-6 ถูกเลือกแล้ว
    createdAt: '2025-03-20T09:30:00Z',
    updatedAt: '2025-03-20T12:00:00Z',
  },
  {
    id: 'app-5',
    jobId: 'job-5',
    volunteerId: 'user-6',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2025-03-20T11:00:00Z',
    updatedAt: '2025-03-20T12:00:00Z',
  },
  // Applications for job-6 (ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ)
  {
    id: 'app-6',
    jobId: 'job-6',
    volunteerId: 'user-1',
    status: 'pending',
    createdAt: '2025-03-25T10:00:00Z',
    updatedAt: '2025-03-25T10:00:00Z',
  },
  {
    id: 'app-7',
    jobId: 'job-6',
    volunteerId: 'user-5',
    status: 'pending',
    createdAt: '2025-03-25T11:30:00Z',
    updatedAt: '2025-03-25T11:30:00Z',
  },
  {
    id: 'app-8',
    jobId: 'job-6',
    volunteerId: 'user-6',
    status: 'pending',
    createdAt: '2025-03-25T14:00:00Z',
    updatedAt: '2025-03-25T14:00:00Z',
  },
  {
    id: 'app-9',
    jobId: 'job-6',
    volunteerId: 'user-7',
    status: 'pending',
    createdAt: '2025-03-25T15:30:00Z',
    updatedAt: '2025-03-25T15:30:00Z',
  },
];

// Helper function to simulate API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  login: async (nationalId: string, password: string): Promise<LoginResponse> => {
    await delay();
    const user = mockUsers.find((u) => u.nationalId === nationalId);
    if (!user || user.password !== password) {
      throw new Error('เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
    }
    // Remove password before returning (don't expose password in response)
    const { password: _, ...userWithoutPassword } = user;
    return {
      token: `mock-token-${user.id}`,
      user: userWithoutPassword,
    };
  },

  register: async (payload: Partial<UserProfile> & { 
    role: UserProfile['role']; 
    password: string;
    nationalId: string;
    firstName: string;
    lastName: string;
    phone: string;
    skills?: string[];
    biography?: string;
    disabilityType?: string;
    additionalNeeds?: string[];
  }): Promise<UserProfile> => {
    await delay();
    
    // Check if nationalId already exists
    if (mockUsers.some((u) => u.nationalId === payload.nationalId)) {
      throw new Error('เลขบัตรประชาชนนี้ถูกใช้งานแล้ว');
    }
    
    const newUser: MockUser = {
      id: `user-${mockUsers.length + 1}`,
      role: payload.role,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      nationalId: payload.nationalId || '',
      phone: payload.phone || '',
      skills: payload.skills || [],
      biography: payload.biography || '',
      disabilityType: payload.disabilityType,
      additionalNeeds: payload.additionalNeeds || [],
      interests: [], // เก็บไว้สำหรับ backward compatibility
      rating: 0,
      completedJobs: 0,
      createdAt: new Date().toISOString(),
      password: payload.password || '',
    };
    mockUsers.push(newUser);
    
    // Remove password before returning (don't expose password in response)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  getUser: async (id: string): Promise<UserProfile> => {
    await delay();
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error('ไม่พบผู้ใช้');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUser: async (id: string, payload: Partial<UserProfile>): Promise<UserProfile> => {
    await delay();
    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error('ไม่พบผู้ใช้');
    }
    
    const user = mockUsers[userIndex];
    
    // Update user fields
    if (payload.firstName !== undefined) user.firstName = payload.firstName;
    if (payload.lastName !== undefined) user.lastName = payload.lastName;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.email !== undefined) user.email = payload.email;
    if (payload.address !== undefined) user.address = payload.address;
    
    if (user.role === 'volunteer') {
      if (payload.skills !== undefined) user.skills = payload.skills;
      if (payload.biography !== undefined) user.biography = payload.biography;
    } else if (user.role === 'requester') {
      if (payload.disabilityType !== undefined) user.disabilityType = payload.disabilityType;
      if (payload.additionalNeeds !== undefined) user.additionalNeeds = payload.additionalNeeds;
    }
    
    mockUsers[userIndex] = user;
    
    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getJobs: async (volunteerId?: string): Promise<{ jobs: JobSummary[] }> => {
    await delay();
    const jobs: JobSummary[] = mockJobs.map((job) => {
      const requester = mockUsers.find((u) => u.id === job.requesterId);
      const acceptedVolunteer = job.acceptedVolunteerId 
        ? mockUsers.find((u) => u.id === job.acceptedVolunteerId)
        : null;
      
      // เช็ค application status สำหรับอาสาสมัคร
      let applicationStatus: string | undefined;
      if (volunteerId) {
        const application = mockApplications.find(
          (a) => a.jobId === job.id && a.volunteerId === volunteerId
        );
        applicationStatus = application?.status;
      }
      
      return {
        id: job.id,
        title: job.title,
        requesterId: job.requesterId,
        workDate: job.workDate,
        startTime: job.startTime,
        endTime: job.endTime,
        location: job.location,
        distanceKm: job.distanceKm,
        status: job.status,
        acceptedVolunteerId: job.acceptedVolunteerId,
        requesterDisabilityType: requester?.disabilityType,
        applicationStatus,
      };
    });
    return { jobs };
  },

  getJob: async (id: string): Promise<JobDetail> => {
    await delay();
    const job = mockJobs.find((j) => j.id === id);
    if (!job) {
      throw new Error('ไม่พบงาน');
    }
    return { ...job };
  },

  submitRating: async (jobId: string, payload: { rating: number; review: string }): Promise<void> => {
    await delay();
    const job = mockJobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error('ไม่พบงาน');
    }
    
    if (!job.acceptedVolunteerId) {
      throw new Error('งานนี้ยังไม่มีผู้ดูแล');
    }

    // เก็บ rating และ review ใน job
    job.requesterRating = payload.rating;
    job.requesterReview = payload.review;

    // อัปเดต rating ของ volunteer
    const volunteer = mockUsers.find((u) => u.id === job.acceptedVolunteerId);
    if (volunteer) {
      // คำนวณ rating ใหม่ (เฉลี่ย)
      const totalRatings = volunteer.completedJobs;
      if (totalRatings > 0) {
        // ถ้ามี rating เก่า (จาก completeJob) ให้คำนวณใหม่
        const oldRating = volunteer.rating;
        const newTotal = oldRating * (totalRatings - 1) + payload.rating;
        volunteer.rating = newTotal / totalRatings;
      } else {
        volunteer.rating = payload.rating;
      }
    }
  },

  createJob: async (payload: {
    requesterId: string;
    title: string;
    location: string;
    meetingPoint: string;
    description: string;
    requirements: string[];
    latitude: number;
    longitude: number;
    workDate?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<JobDetail> => {
    await delay();
    const newJob: JobDetail = {
      id: `job-${mockJobs.length + 1}`,
      title: payload.title,
      requesterId: payload.requesterId,
      workDate: payload.workDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: payload.location,
      distanceKm: 0,
      status: 'open',
      description: payload.description,
      meetingPoint: payload.meetingPoint,
      requirements: payload.requirements,
      latitude: payload.latitude,
      longitude: payload.longitude,
      contactName: mockUsers.find((u) => u.id === payload.requesterId) ? `${mockUsers.find((u) => u.id === payload.requesterId)?.firstName || ''} ${mockUsers.find((u) => u.id === payload.requesterId)?.lastName || ''}`.trim() : '',
      contactNumber: mockUsers.find((u) => u.id === payload.requesterId)?.phone || '',
    };
    mockJobs.push(newJob);
    return { ...newJob };
  },

  applyToJob: async (jobId: string, payload: { volunteerId: string }): Promise<{ id: string }> => {
    await delay();
    const newApplication: Application = {
      id: `app-${mockApplications.length + 1}`,
      jobId,
      volunteerId: payload.volunteerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.push(newApplication);
    return { id: newApplication.id };
  },

  completeJob: async (jobId: string, payload: { volunteerId: string; rating: number; comment: string }): Promise<void> => {
    await delay();
    // Update job status
    const job = mockJobs.find((j) => j.id === jobId);
    if (job) {
      job.status = 'completed';
    }
    // Update application status
    const application = mockApplications.find((a) => a.jobId === jobId && a.volunteerId === payload.volunteerId);
    if (application) {
      application.status = 'completed';
      application.updatedAt = new Date().toISOString();
    }
    // Update volunteer stats
    const volunteer = mockUsers.find((u) => u.id === payload.volunteerId);
    if (volunteer) {
      volunteer.completedJobs += 1;
      // Simple rating update (average)
      volunteer.rating = (volunteer.rating * (volunteer.completedJobs - 1) + payload.rating) / volunteer.completedJobs;
    }
  },

  completeJobByRequester: async (jobId: string): Promise<void> => {
    await delay();
    const job = mockJobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error('ไม่พบงาน');
    }
    
    if (!job.acceptedVolunteerId) {
      throw new Error('งานนี้ยังไม่มีผู้ดูแล');
    }

    if (job.status === 'completed') {
      throw new Error('งานนี้เสร็จสิ้นแล้ว');
    }

    // เปลี่ยน status เป็น completed
    job.status = 'completed';

    // อัปเดต application status
    const application = mockApplications.find((a) => a.jobId === jobId && a.volunteerId === job.acceptedVolunteerId);
    if (application) {
      application.status = 'completed';
      application.updatedAt = new Date().toISOString();
    }

    // อัปเดต volunteer stats (เพิ่ม completedJobs แต่ยังไม่คำนวณ rating เพราะจะให้คะแนนทีหลัง)
    const volunteer = mockUsers.find((u) => u.id === job.acceptedVolunteerId);
    if (volunteer) {
      volunteer.completedJobs += 1;
    }
  },

  getProfile: async (id: string): Promise<UserProfile> => {
    await delay();
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error('ไม่พบผู้ใช้');
    }
    // Remove password before returning (don't expose password in response)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getVolunteerApplications: async (id: string): Promise<{ items: VolunteerApplication[] }> => {
    await delay();
    const userApplications = mockApplications.filter((a) => a.volunteerId === id);
    const items: VolunteerApplication[] = userApplications.map((app) => {
      const job = mockJobs.find((j) => j.id === app.jobId);
      if (!job) {
        throw new Error('ไม่พบงาน');
      }
      return {
        application: app,
        job: {
          id: job.id,
          title: job.title,
          requesterId: job.requesterId,
          location: job.location,
          distanceKm: job.distanceKm,
          status: job.status,
        },
      };
    });
    return { items };
  },

  getJobApplications: async (jobId: string): Promise<{ applications: Array<Application & { volunteer: UserProfile }> }> => {
    await delay();
    const applications = mockApplications.filter((a) => a.jobId === jobId && a.status === 'pending');
    const result = applications.map((app) => {
      const volunteer = mockUsers.find((u) => u.id === app.volunteerId);
      if (!volunteer) {
        throw new Error('ไม่พบอาสาสมัคร');
      }
      const { password: _, ...volunteerWithoutPassword } = volunteer;
      return {
        ...app,
        volunteer: volunteerWithoutPassword,
      };
    });
    return { applications: result };
  },

  acceptApplication: async (applicationId: string): Promise<void> => {
    await delay();
    const application = mockApplications.find((a) => a.id === applicationId);
    if (!application) {
      throw new Error('ไม่พบใบสมัคร');
    }
    
    // เปลี่ยน status ของ application เป็น accepted
    application.status = 'accepted';
    application.updatedAt = new Date().toISOString();
    
    // อัปเดต job ให้มี acceptedVolunteerId
    const job = mockJobs.find((j) => j.id === application.jobId);
    if (job) {
      job.acceptedVolunteerId = application.volunteerId;
      // เปลี่ยน status ของ job เป็น in_progress หรือ assigned
      if (job.status === 'open') {
        job.status = 'in_progress';
      }
    }
    
    // ปฏิเสธ application อื่นๆ ที่เหลือ
    const otherApplications = mockApplications.filter(
      (a) => a.jobId === application.jobId && a.id !== applicationId && a.status === 'pending'
    );
    otherApplications.forEach((app) => {
      app.status = 'rejected';
      app.updatedAt = new Date().toISOString();
    });
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await delay();
    const index = mockJobs.findIndex((j) => j.id === jobId);
    if (index === -1) {
      throw new Error('ไม่พบงาน');
    }
    mockJobs.splice(index, 1);
    // ลบ applications ที่เกี่ยวข้อง
    const relatedApps = mockApplications.filter((a) => a.jobId === jobId);
    relatedApps.forEach((app) => {
      const appIndex = mockApplications.findIndex((a) => a.id === app.id);
      if (appIndex !== -1) {
        mockApplications.splice(appIndex, 1);
      }
    });
  },

  updateJob: async (jobId: string, payload: {
    title?: string;
    workDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<JobDetail> => {
    await delay();
    const job = mockJobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error('ไม่พบงาน');
    }
    
    // อัปเดตข้อมูล
    if (payload.title !== undefined) job.title = payload.title;
    if (payload.workDate !== undefined) job.workDate = payload.workDate;
    if (payload.startTime !== undefined) job.startTime = payload.startTime;
    if (payload.endTime !== undefined) job.endTime = payload.endTime;
    if (payload.location !== undefined) job.location = payload.location;
    if (payload.description !== undefined) job.description = payload.description;
    if (payload.latitude !== undefined) job.latitude = payload.latitude;
    if (payload.longitude !== undefined) job.longitude = payload.longitude;
    
    
    return { ...job };
  },

  getRequesterJobs: async (id: string): Promise<{ jobs: JobSummary[] }> => {
    await delay();
    const requesterJobs = mockJobs.filter((j) => j.requesterId === id);
    const jobs: JobSummary[] = requesterJobs.map((job) => {
      const acceptedVolunteer = job.acceptedVolunteerId 
        ? mockUsers.find((u) => u.id === job.acceptedVolunteerId)
        : null;
      
      return {
        id: job.id,
        title: job.title,
        requesterId: job.requesterId,
        workDate: job.workDate,
        startTime: job.startTime,
        endTime: job.endTime,
        location: job.location,
        distanceKm: job.distanceKm,
        status: job.status,
        acceptedVolunteerId: job.acceptedVolunteerId,
        acceptedVolunteerName: acceptedVolunteer 
          ? `${acceptedVolunteer.firstName} ${acceptedVolunteer.lastName}`.trim()
          : undefined,
        requesterDisabilityType: undefined, // ไม่ต้องแสดงสำหรับ requester
      };
    });
    return { jobs };
  },
};

export { API_BASE_URL };
