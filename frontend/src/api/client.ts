import { Application, JobDetail, JobSummary, LoginResponse, UserProfile, VolunteerApplication } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://20682f7e5189.ngrok-free.app';

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      return [];
    }
  }
  return [];
};

const jobResponseToDetail = (data: any): JobDetail => {
  const requirements = toStringArray(data?.requirements);

  const job: JobDetail = {
    id: data?.id ?? '',
    title: data?.title ?? '',
    requesterId: data?.requesterId ?? '',
    workDate: data?.workDate || undefined,
    startTime: data?.startTime || undefined,
    endTime: data?.endTime || undefined,
    location: data?.location ?? '',
    distanceKm: toNumber(data?.distanceKm),
    status: data?.status ?? 'open',
    acceptedVolunteerId: data?.acceptedVolunteerId || undefined,
    acceptedVolunteerName: data?.acceptedVolunteerName || undefined,
    requesterDisabilityType: data?.requesterDisabilityType || undefined,
    applicationStatus: undefined,
    description: data?.description ?? '',
    meetingPoint: data?.meetingPoint ?? data?.location ?? '',
    requirements,
    latitude: toNumber(data?.latitude),
    longitude: toNumber(data?.longitude),
    contactName: data?.contactName ?? '',
    contactNumber: data?.contactNumber ?? '',
    requesterRating: typeof data?.requesterRating === 'number' ? data.requesterRating : undefined,
    requesterReview: data?.requesterReview || undefined,
  };

  return job;
};

const toISODateString = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  return new Date().toISOString();
};

const normalizeUserProfile = (data: any): UserProfile => ({
  id: data?.id ?? '',
  role: data?.role ?? 'volunteer',
  firstName: data?.firstName ?? '',
  lastName: data?.lastName ?? '',
  nationalId: data?.nationalId ?? '',
  phone: data?.phone ?? '',
  email: data?.email || undefined,
  address: data?.address || undefined,
  skills: toStringArray(data?.skills),
  biography: data?.biography ?? '',
  disabilityType: data?.disabilityType || undefined,
  additionalNeeds: toStringArray(data?.additionalNeeds),
  interests: toStringArray(data?.interests),
  rating: toNumber(data?.rating, 0),
  completedJobs: toNumber(data?.completedJobs, 0),
  createdAt: toISODateString(data?.createdAt),
});

const normalizeApplication = (data: any, fallbackJobId?: string): Application => ({
  id: data?.id ?? data?.applicationId ?? '',
  jobId: data?.jobId ?? fallbackJobId ?? '',
  volunteerId: data?.volunteerId ?? '',
  status: data?.status ?? 'pending',
  createdAt: toISODateString(data?.createdAt),
  updatedAt: toISODateString(data?.updatedAt),
});

const syncMockApplications = (applications: Application[]) => {
  if (applications.length === 0) {
    return;
  }
  const incomingIds = new Set(applications.map((app) => app.id));
  mockApplications = [
    ...applications,
    ...mockApplications.filter((existing) => !incomingIds.has(existing.id)),
  ];
};

const jobDetailToSummary = (detail: JobDetail): JobSummary => {
  const {
    description: _d,
    meetingPoint: _m,
    requirements: _r,
    latitude: _lat,
    longitude: _lng,
    contactName: _cn,
    contactNumber: _cnum,
    requesterRating: _rr,
    requesterReview: _rv,
    ...summary
  } = detail;
  return summary;
};

const syncMockJobs = (incoming: JobDetail[]) => {
  if (incoming.length === 0) {
    return;
  }
  const incomingIds = new Set(incoming.map((job) => job.id));
  mockJobs = [...incoming, ...mockJobs.filter((job) => !incomingIds.has(job.id))];
};

// Internal type for mock users (includes password that we don't expose)
type MockUser = UserProfile & { password: string };

const withoutPassword = (user: MockUser): UserProfile => {
  const { password: _pw, ...rest } = user;
  return rest;
};

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
    requesterRating: 5, // มีการให้คะแนนแล้ว
    requesterReview: 'คุณสมชายช่วยเหลือได้ดีมาก ใจดีและมีความอดทนสูง ขอบคุณมากค่ะ', // มีการให้ความคิดเห็นแล้ว
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
  {
    id: 'job-8',
    title: 'ช่วยพาไปซื้อของที่ห้างสรรพสินค้า',
    requesterId: 'user-2',
    workDate: '2025-01-20',
    startTime: '14:00',
    endTime: '17:00',
    location: 'เซ็นทรัลเวิลด์',
    distanceKm: 5.0,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 4,
    requesterReview: 'คุณสมชายมีความเป็นมืออาชีพมาก ช่วยเหลือได้ดีมาก แต่อาจจะช้าไปนิดนึง แต่โดยรวมดีมากเลยค่ะ',
    description: 'ต้องการความช่วยเหลือในการพาไปซื้อของที่ห้างสรรพสินค้า',
    meetingPoint: 'หน้าห้างสรรพสินค้า',
    requirements: ['Wheelchair handling', 'Thai language', 'Shopping assistance'],
    latitude: 13.7473,
    longitude: 100.5395,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-9',
    title: 'ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ',
    requesterId: 'user-2',
    workDate: '2025-01-10',
    startTime: '09:00',
    endTime: '12:00',
    location: 'โรงพยาบาลจุฬาลงกรณ์',
    distanceKm: 2.5,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 5,
    requesterReview: 'ขอบคุณคุณสมชายมากเลยค่ะ ช่วยเหลือได้ดีมาก ใจดีและมีมนุษยสัมพันธ์ดีมาก อยากให้ช่วยอีกค่ะ',
    description: 'ต้องการอาสาสมัครช่วยพาไปโรงพยาบาลเพื่อนัดตรวจสุขภาพประจำปี',
    meetingPoint: 'หน้าประตูหลัก',
    requirements: ['Wheelchair handling', 'Thai language'],
    latitude: 13.7367,
    longitude: 100.5231,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-10',
    title: 'ช่วยพาไปเที่ยวสถานที่สำคัญ',
    requesterId: 'user-2',
    workDate: '2024-12-25',
    startTime: '10:00',
    endTime: '16:00',
    location: 'วัดพระแก้ว',
    distanceKm: 8.0,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 4,
    requesterReview: 'คุณสมชายช่วยเหลือได้ดีมาก ช่วยอธิบายสถานที่ต่างๆ ให้ฟังได้ดี แต่อาจจะเดินเร็วไปนิดนึงสำหรับผู้ใช้รถเข็น',
    description: 'ต้องการอาสาสมัครช่วยพาไปเที่ยวสถานที่สำคัญในกรุงเทพ',
    meetingPoint: 'หน้าวัด',
    requirements: ['Wheelchair handling', 'Thai language', 'Tour guide knowledge'],
    latitude: 13.7501,
    longitude: 100.4925,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-11',
    title: 'ช่วยพาไปซื้อของที่ตลาด',
    requesterId: 'user-2',
    workDate: '2024-11-15',
    startTime: '08:00',
    endTime: '11:00',
    location: 'ตลาดนัดจตุจักร',
    distanceKm: 6.0,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 5,
    requesterReview: 'คุณสมชายช่วยเหลือได้ดีมากเลยค่ะ ใจดีมาก รู้จักเลือกของให้ดี อยากให้ช่วยอีกค่ะ',
    description: 'ต้องการอาสาสมัครช่วยพาไปซื้อของที่ตลาดนัดจตุจักร',
    meetingPoint: 'ประตูหลักตลาดนัดจตุจักร',
    requirements: ['Wheelchair handling', 'Thai language', 'Shopping assistance'],
    latitude: 13.7983,
    longitude: 100.5500,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-12',
    title: 'ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ',
    requesterId: 'user-2',
    workDate: '2024-10-20',
    startTime: '09:00',
    endTime: '12:00',
    location: 'โรงพยาบาลจุฬาลงกรณ์',
    distanceKm: 2.5,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 5,
    requesterReview: 'ขอบคุณคุณสมชายมากค่ะ ช่วยเหลือได้ดีมาก ใจดีและมีความอดทนสูงมาก รู้จักช่วยเหลือดี',
    description: 'ต้องการอาสาสมัครช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ',
    meetingPoint: 'หน้าประตูหลัก',
    requirements: ['Wheelchair handling', 'Thai language'],
    latitude: 13.7367,
    longitude: 100.5231,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
  },
  {
    id: 'job-13',
    title: 'ช่วยพาไปธนาคารทำธุรกรรม',
    requesterId: 'user-2',
    workDate: '2024-09-10',
    startTime: '10:00',
    endTime: '11:30',
    location: 'ธนาคารกรุงเทพ สาขาสีลม',
    distanceKm: 3.5,
    status: 'completed',
    acceptedVolunteerId: 'user-1', // user-1 รับงานนี้
    requesterRating: 4,
    requesterReview: 'คุณสมชายช่วยเหลือได้ดี แต่อาจจะช้าไปนิดนึง แต่โดยรวมดีมากค่ะ',
    description: 'ต้องการความช่วยเหลือในการพาไปธนาคารเพื่อทำธุรกรรม',
    meetingPoint: 'หน้าธนาคาร',
    requirements: ['Wheelchair handling', 'Thai language'],
    latitude: 13.7286,
    longitude: 100.5327,
    contactName: 'สมหญิง ต้องการความช่วยเหลือ',
    contactNumber: '082-345-6789',
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
  // Applications for job-8 (ช่วยพาไปซื้อของที่ห้างสรรพสินค้า) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-10',
    jobId: 'job-8',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
  },
  // Applications for job-9 (ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-11',
    jobId: 'job-9',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T12:00:00Z',
  },
  // Applications for job-10 (ช่วยพาไปเที่ยวสถานที่สำคัญ) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-12',
    jobId: 'job-10',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T12:00:00Z',
  },
  // Applications for job-11 (ช่วยพาไปซื้อของที่ตลาด) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-13',
    jobId: 'job-11',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-10T12:00:00Z',
  },
  // Applications for job-12 (ช่วยพาไปโรงพยาบาลเพื่อตรวจสุขภาพ) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-14',
    jobId: 'job-12',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z',
  },
  // Applications for job-13 (ช่วยพาไปธนาคารทำธุรกรรม) - user-1 ถูกเลือกแล้ว
  {
    id: 'app-15',
    jobId: 'job-13',
    volunteerId: 'user-1',
    status: 'accepted', // ถูกเลือกเป็นผู้ดูแล
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-05T12:00:00Z',
  },
];

// Helper function to simulate API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  login: async (nationalId: string, password: string): Promise<LoginResponse> => {
    // Call real backend
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nationalId, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || data?.message || 'เข้าสู่ระบบล้มเหลว';
        throw new Error(msg);
      }

      // Expect { token, user }
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      return data as LoginResponse;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Network error');
    }
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
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || data?.message || 'สมัครสมาชิกล้มเหลว';
        throw new Error(msg);
      }

      // Backend returns { id, user } — prefer user, but accept direct user too
      const user: UserProfile = data.user ?? data;
      return user;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Network error');
    }
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

  getVolunteerReviews: async (volunteerId: string): Promise<Array<{ jobTitle: string; rating: number; review: string; requesterName: string; createdAt: string }>> => {
    await delay();
    // หา jobs ที่ volunteer นี้เป็น acceptedVolunteerId และมี requesterReview
    const reviewedJobs = mockJobs.filter(
      (job) => job.acceptedVolunteerId === volunteerId && job.requesterReview && job.status === 'completed'
    );
    
    return reviewedJobs.map((job) => {
      const requester = mockUsers.find((u) => u.id === job.requesterId);
      // หา application เพื่อดึง createdAt
      const application = mockApplications.find(
        (app) => app.jobId === job.id && app.volunteerId === volunteerId && app.status === 'accepted'
      );
      return {
        jobTitle: job.title,
        rating: job.requesterRating || 0,
        review: job.requesterReview || '',
        requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'ไม่ทราบชื่อ',
        createdAt: application?.updatedAt || new Date().toISOString(),
      };
    });
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
    const response = await fetch(`${API_BASE_URL}/api/jobs`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.error === 'string' ? body.error : 'ไม่สามารถโหลดงานได้';
      throw new Error(message);
    }
    const details: JobDetail[] = Array.isArray(body?.jobs)
      ? body.jobs.map(jobResponseToDetail)
      : [];
    syncMockJobs(details);
    let jobs: JobSummary[] = details.map(jobDetailToSummary);
    if (volunteerId) {
      jobs = jobs.map((job) => {
        const application = mockApplications.find(
          (a) => a.jobId === job.id && a.volunteerId === volunteerId
        );
        return { ...job, applicationStatus: application?.status };
      });
    }
    return { jobs };
  },

  getJob: async (id: string, volunteerId?: string): Promise<JobDetail> => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.error === 'string' ? body.error : 'ไม่พบงาน';
      throw new Error(message);
    }
    const job = jobResponseToDetail(body);
    syncMockJobs([job]);
    if (volunteerId) {
      const application = mockApplications.find(
        (a) => a.jobId === job.id && a.volunteerId === volunteerId
      );
      job.applicationStatus = application?.status;
    }
    return job;
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
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let body: any;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (error) {
        if (!response.ok) {
          throw new Error('ไม่สามารถสร้างงานได้');
        }
        throw error;
      }
    }

    if (!response.ok) {
      const errorMessage = typeof body?.error === 'string' ? body.error : 'ไม่สามารถสร้างงานได้';
      throw new Error(errorMessage);
    }

    const job = jobResponseToDetail(body);

    // keep legacy mock cache in sync so other mock endpoints can see the new job
    mockJobs = [job, ...mockJobs.filter((existing) => existing.id !== job.id)];
    return job;
  },

  applyToJob: async (jobId: string, payload: { volunteerId: string }): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error === 'string' ? body.error : 'ไม่สามารถสมัครงานได้';
    throw new Error(message);
  }
  const application = normalizeApplication(body, jobId);
  syncMockApplications([{ ...application }]);
  return { id: application.id };
  },

  cancelApplication: async (jobId: string, volunteerId: string): Promise<void> => {
    await delay();
    const applicationIndex = mockApplications.findIndex(
      (a) => a.jobId === jobId && a.volunteerId === volunteerId
    );
    
    if (applicationIndex === -1) {
      throw new Error('ไม่พบใบสมัคร');
    }
    
    const application = mockApplications[applicationIndex];
    if (application.status !== 'pending') {
      throw new Error('ไม่สามารถยกเลิกใบสมัครที่ได้รับการยืนยันหรือถูกปฏิเสธแล้ว');
    }
    
    // ลบ application
    mockApplications.splice(applicationIndex, 1);
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
      const requester = mockUsers.find((u) => u.id === job.requesterId);
      return {
        application: app,
        job: {
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
        },
      };
    });
    return { items };
  },

  getJobApplications: async (jobId: string): Promise<{ applications: Array<Application & { volunteer: UserProfile }> }> => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applications`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.error === 'string' ? body.error : 'ไม่สามารถโหลดผู้สมัครได้';
      throw new Error(message);
    }
    const applications = Array.isArray(body?.applications)
      ? body.applications.map((item: any) => {
        const application = normalizeApplication(item, jobId);
        const volunteerProfile = item?.volunteer
          ? normalizeUserProfile(item.volunteer)
          : (() => {
            const mockVolunteer = mockUsers.find((u) => u.id === application.volunteerId);
            return mockVolunteer ? withoutPassword(mockVolunteer) : undefined;
          })();
        return {
          ...application,
          volunteer: volunteerProfile ?? {
            id: application.volunteerId,
            role: 'volunteer',
            firstName: 'อาสาสมัคร',
            lastName: '',
            nationalId: '',
            phone: '',
            email: undefined,
            address: undefined,
            skills: [],
            biography: '',
            disabilityType: undefined,
            additionalNeeds: [],
            interests: [],
            rating: 0,
            completedJobs: 0,
            createdAt: new Date().toISOString(),
          },
        };
      })
      : [];
    const baseApplications = applications.map((item: Application & { volunteer: UserProfile }) => {
      const { volunteer: _volunteer, ...rest } = item;
      return rest as Application;
    });
    syncMockApplications(baseApplications);
    return { applications };
  },

  acceptApplication: async (applicationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.error === 'string' ? body.error : 'ไม่สามารถยืนยันได้';
      throw new Error(message);
    }
    const application = mockApplications.find((a) => a.id === applicationId);
    if (!application) {
      return;
    }
    const now = new Date().toISOString();
    application.status = 'accepted';
    application.updatedAt = now;
    mockApplications = mockApplications.map((app) => {
      if (app.jobId === application.jobId && app.id !== applicationId && app.status === 'pending') {
        return { ...app, status: 'rejected', updatedAt: now };
      }
      return app.id === applicationId ? application : app;
    });
    const job = mockJobs.find((j) => j.id === application.jobId);
    if (job) {
      job.acceptedVolunteerId = application.volunteerId;
      if (job.status === 'open') {
        job.status = 'in_progress';
      }
    }
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
    const response = await fetch(`${API_BASE_URL}/api/jobs?requesterId=${encodeURIComponent(id)}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.error === 'string' ? body.error : 'ไม่สามารถโหลดงานได้';
      throw new Error(message);
    }
    const details: JobDetail[] = Array.isArray(body?.jobs)
      ? body.jobs.map(jobResponseToDetail)
      : [];
    syncMockJobs(details);
    const jobs = details.map((detail) => {
      const summary = jobDetailToSummary(detail);
      const acceptedVolunteer = summary.acceptedVolunteerId
        ? mockUsers.find((u) => u.id === summary.acceptedVolunteerId)
        : null;
      return {
        ...summary,
        acceptedVolunteerName: acceptedVolunteer
          ? `${acceptedVolunteer.firstName} ${acceptedVolunteer.lastName}`.trim()
          : undefined,
      };
    });
    return { jobs };
  },
};

export { API_BASE_URL };
