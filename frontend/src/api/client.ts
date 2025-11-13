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
];

let mockJobs: JobDetail[] = [
  {
    id: 'job-1',
    title: 'ต้องการความช่วยเหลือไปโรงพยาบาล',
    requesterId: 'user-2',
    scheduledOn: '2025-03-15T09:00:00Z',
    location: 'โรงพยาบาลจุฬาลงกรณ์',
    distanceKm: 2.5,
    tags: ['Medical', 'Transportation'],
    status: 'open',
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
    scheduledOn: '2025-03-20T14:00:00Z',
    location: 'เซ็นทรัลเวิลด์',
    distanceKm: 5.0,
    tags: ['Shopping', 'Transportation'],
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
    scheduledOn: '2025-03-25T10:00:00Z',
    location: 'วัดพระแก้ว',
    distanceKm: 8.0,
    tags: ['Tourism', 'Transportation'],
    status: 'open',
    description: 'ต้องการอาสาสมัครช่วยพาไปเที่ยวสถานที่สำคัญในกรุงเทพ',
    meetingPoint: 'หน้าวัด',
    requirements: ['Wheelchair handling', 'Thai language', 'Tour guide knowledge'],
    latitude: 13.7501,
    longitude: 100.4925,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
];

let mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    volunteerId: 'user-1',
    message: 'I can help you get to the hospital. I have experience with wheelchair handling.',
    status: 'pending',
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2025-03-10T10:00:00Z',
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

  getJobs: async (): Promise<{ jobs: JobSummary[] }> => {
    await delay();
    const jobs: JobSummary[] = mockJobs.map((job) => ({
      id: job.id,
      title: job.title,
      requesterId: job.requesterId,
      scheduledOn: job.scheduledOn,
      location: job.location,
      distanceKm: job.distanceKm,
      tags: job.tags,
      status: job.status,
    }));
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

  createJob: async (payload: {
    requesterId: string;
    title: string;
    scheduledOn: string;
    location: string;
    meetingPoint: string;
    description: string;
    requirements: string[];
    latitude: number;
    longitude: number;
  }): Promise<JobDetail> => {
    await delay();
    const newJob: JobDetail = {
      id: `job-${mockJobs.length + 1}`,
      title: payload.title,
      requesterId: payload.requesterId,
      scheduledOn: payload.scheduledOn,
      location: payload.location,
      distanceKm: 0,
      tags: [],
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

  applyToJob: async (jobId: string, payload: { volunteerId: string; message: string }): Promise<{ id: string }> => {
    await delay();
    const newApplication: Application = {
      id: `app-${mockApplications.length + 1}`,
      jobId,
      volunteerId: payload.volunteerId,
      message: payload.message,
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
          scheduledOn: job.scheduledOn,
          location: job.location,
          distanceKm: job.distanceKm,
          tags: job.tags,
          status: job.status,
        },
      };
    });
    return { items };
  },

  getRequesterJobs: async (id: string): Promise<{ jobs: JobSummary[] }> => {
    await delay();
    const requesterJobs = mockJobs.filter((j) => j.requesterId === id);
    const jobs: JobSummary[] = requesterJobs.map((job) => ({
      id: job.id,
      title: job.title,
      requesterId: job.requesterId,
      scheduledOn: job.scheduledOn,
      location: job.location,
      distanceKm: job.distanceKm,
      tags: job.tags,
      status: job.status,
    }));
    return { jobs };
  },
};

export { API_BASE_URL };
