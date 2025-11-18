import { Application, JobDetail, JobSummary, LoginResponse, UserProfile, VolunteerApplication } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://a69bdf7b69b2.ngrok-free.app/api';

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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nationalId,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      const data = await response.json();
      return {
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: payload.role,
          firstName: payload.firstName,
          lastName: payload.lastName,
          nationalId: payload.nationalId,
          phone: payload.phone,
          email: payload.email,
          password: payload.password,
          skills: payload.skills || [],
          biography: payload.biography || '',
          disabilityType: payload.disabilityType,
          additionalNeeds: payload.additionalNeeds || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'สมัครสมาชิกไม่สำเร็จ');
      }

      const user = await response.json();
      return user as UserProfile;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  },

  getUser: async (id: string): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่พบผู้ใช้');
    }
    const user = await response.json();
    return user as UserProfile;
  },

  getVolunteerReviews: async (volunteerId: string): Promise<Array<{ jobTitle: string; rating: number; review: string; requesterName: string; createdAt: string }>> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/${encodeURIComponent(volunteerId)}/reviews`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถดึงรีวิวได้');
    }
    const items = await response.json();
    return (items as any[]).map((it) => ({
      jobTitle: it.jobTitle,
      rating: it.rating ?? 0,
      review: it.review ?? '',
      requesterName: it.requesterName ?? '',
      createdAt: typeof it.createdAt === 'string' ? it.createdAt : new Date(it.createdAt).toISOString(),
    }));
  },

  updateUser: async (id: string, payload: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'อัปเดตผู้ใช้ไม่สำเร็จ');
    }
    const user = await response.json();
    return user as UserProfile;
  },

  getJobs: async (volunteerId?: string): Promise<{ jobs: JobSummary[] }> => {
    const url = volunteerId
      ? `${API_BASE_URL}/jobs?volunteerId=${encodeURIComponent(volunteerId)}`
      : `${API_BASE_URL}/jobs`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลงานได้');
    }
    const data = await response.json();
    const jobs: JobSummary[] = (data.jobs || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      requesterId: j.requesterId,
      workDate: j.workDate,
      startTime: j.startTime,
      endTime: j.endTime,
      location: j.location,
      distanceKm: j.distanceKm ?? 0,
      status: j.status,
      acceptedVolunteerId: j.acceptedVolunteerId,
      requesterDisabilityType: j.requesterDisabilityType,
      applicationStatus: j.applicationStatus,
    }));
    return { jobs };
  },

  getJob: async (id: string, volunteerId?: string): Promise<JobDetail> => {
    const url = volunteerId
      ? `${API_BASE_URL}/jobs/${encodeURIComponent(id)}?volunteerId=${encodeURIComponent(volunteerId)}`
      : `${API_BASE_URL}/jobs/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่พบงาน');
    }
    const j = await response.json();
    const job: JobDetail = {
      id: j.id,
      title: j.title,
      requesterId: j.requesterId,
      workDate: j.workDate,
      startTime: j.startTime,
      endTime: j.endTime,
      location: j.location,
      distanceKm: j.distanceKm ?? 0,
      status: j.status,
      acceptedVolunteerId: j.acceptedVolunteerId,
      description: j.description,
      meetingPoint: j.meetingPoint,
      requirements: j.requirements ?? [],
      latitude: j.latitude,
      longitude: j.longitude,
      contactName: j.contactName ?? '',
      contactNumber: j.contactNumber ?? '',
      requesterDisabilityType: j.requesterDisabilityType,
      applicationStatus: j.applicationStatus,
      requesterRating: j.requesterRating ?? undefined,
      requesterReview: j.requesterReview ?? undefined,
    };
    return job;
  },

  submitRating: async (jobId: string, payload: { rating: number; review: string }): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: payload.rating, review: payload.review }),
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'ไม่สามารถให้คะแนนได้');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: payload.requesterId,
        title: payload.title,
        location: payload.location,
        meetingPoint: payload.meetingPoint,
        description: payload.description,
        requirements: payload.requirements,
        latitude: payload.latitude,
        longitude: payload.longitude,
        workDate: payload.workDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถสร้างงานได้');
    }
    const j = await response.json();
    const job: JobDetail = {
      id: j.id,
      title: j.title,
      requesterId: j.requesterId,
      workDate: j.workDate,
      startTime: j.startTime,
      endTime: j.endTime,
      location: j.location,
      distanceKm: j.distanceKm ?? 0,
      status: j.status,
      description: j.description,
      meetingPoint: j.meetingPoint,
      requirements: j.requirements ?? [],
      latitude: j.latitude,
      longitude: j.longitude,
      contactName: j.contactName ?? '',
      contactNumber: j.contactNumber ?? '',
    };
    return job;
  },

  applyToJob: async (jobId: string, payload: { volunteerId: string }): Promise<{ id: string }> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId: payload.volunteerId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถสมัครงานนี้ได้');
    }
    return (await response.json()) as { id: string };
  },

  cancelApplication: async (jobId: string, volunteerId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถยกเลิกได้');
    }
  },

  completeJob: async (jobId: string, payload: { volunteerId: string; rating: number; comment: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถปิดงานได้');
    }
  },

  completeJobByRequester: async (jobId: string, volunteerId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId }),
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถเสร็จสิ้นงานได้');
    }
  },

  getProfile: async (id: string): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่พบผู้ใช้');
    }
    const user = await response.json();
    return user as UserProfile;
  },

  getVolunteerApplications: async (id: string): Promise<{ items: VolunteerApplication[] }> => {
    const response = await fetch(`${API_BASE_URL}/volunteers/${encodeURIComponent(id)}/applications`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถดึงใบสมัครได้');
    }
    const data = await response.json();
    const items: VolunteerApplication[] = (data.items || []).map((it: any) => ({
      application: {
        id: it.application.id,
        jobId: it.application.jobId,
        volunteerId: it.application.volunteerId,
        status: it.application.status,
        createdAt: it.application.createdAt,
        updatedAt: it.application.updatedAt,
      },
      job: {
        id: it.job.id,
        title: it.job.title,
        requesterId: it.job.requesterId,
        workDate: it.job.workDate,
        startTime: it.job.startTime,
        endTime: it.job.endTime,
        location: it.job.location,
        distanceKm: it.job.distanceKm ?? 0,
        status: it.job.status,
        acceptedVolunteerId: it.job.acceptedVolunteerId,
        requesterDisabilityType: it.job.requesterDisabilityType,
      },
    }));
    return { items };
  },

  getJobApplications: async (jobId: string): Promise<{ applications: Array<Application & { volunteer: UserProfile }> }> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถดึงรายชื่อผู้สมัครได้');
    }
    const data = await response.json();
    return {
      applications: (data.applications || []).map((a: any) => ({
        id: a.id,
        jobId: a.jobId,
        volunteerId: a.volunteerId,
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        volunteer: a.volunteer,
      })),
    };
  },

  acceptApplication: async (applicationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/accept`, {
      method: 'POST',
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถยืนยันผู้สมัครได้');
    }
  },

  deleteJob: async (jobId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ลบงานไม่สำเร็จ');
    }
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
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'อัปเดตงานไม่สำเร็จ');
    }
    const j = await response.json();
    const job: JobDetail = {
      id: j.id,
      title: j.title,
      requesterId: j.requesterId,
      workDate: j.workDate,
      startTime: j.startTime,
      endTime: j.endTime,
      location: j.location,
      distanceKm: j.distanceKm ?? 0,
      status: j.status,
      acceptedVolunteerId: j.acceptedVolunteerId,
      description: j.description,
      meetingPoint: j.meetingPoint,
      requirements: j.requirements ?? [],
      latitude: j.latitude,
      longitude: j.longitude,
      contactName: j.contactName ?? '',
      contactNumber: j.contactNumber ?? '',
    };
    return job;
  },

  getRequesterJobs: async (id: string): Promise<{ jobs: JobSummary[] }> => {
    const response = await fetch(`${API_BASE_URL}/requesters/${encodeURIComponent(id)}/jobs`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลงานได้');
    }
    const data = await response.json();
    const jobs: JobSummary[] = (data.jobs || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      requesterId: j.requesterId,
      workDate: j.workDate,
      startTime: j.startTime,
      endTime: j.endTime,
      location: j.location,
      distanceKm: j.distanceKm ?? 0,
      status: j.status,
      acceptedVolunteerId: j.acceptedVolunteerId,
      acceptedVolunteerName: j.acceptedVolunteerName,
      requesterDisabilityType: undefined,
    }));
    return { jobs };
  },
};

export { API_BASE_URL };
