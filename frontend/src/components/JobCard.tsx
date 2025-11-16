import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { JobSummary } from '../types';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

type Props = {
  job: JobSummary;
  onPress?: () => void;
};

// Map disability type เป็นภาษาไทย
const getDisabilityTypeLabel = (type?: string): string => {
  const map: Record<string, string> = {
    'physical': 'ผู้พิการทางร่างกาย',
    'visual': 'ผู้พิการทางสายตา',
    'hearing': 'ผู้พิการทางการได้ยิน',
    'intellectual': 'ผู้พิการทางสติปัญญา',
    'mental': 'ผู้พิการทางจิตใจ',
  };
  return type ? (map[type] || type) : '';
};

export const JobCard: React.FC<Props> = ({ job, onPress }) => {
  const { user } = useAuth();
  // Format วันที่
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) {
      return '';
    }
    try {
      // รองรับทั้ง YYYY-MM-DD และ ISO string
      let date: Date;
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Format YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateStr);
      }
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Format เวลา
  const formatTimeRange = (): string => {
    // ตรวจสอบว่ามี startTime และ endTime หรือไม่
    const startTime = job.startTime?.trim() || '';
    const endTime = job.endTime?.trim() || '';
    
    // ถ้ามีทั้ง startTime และ endTime แสดงทั้งคู่
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    
    // ถ้ามีแค่ startTime หรือ endTime ตัวเดียว
    if (startTime) {
      return `${startTime} - ?`;
    }
    if (endTime) {
      return `? - ${endTime}`;
    }
    
    // ถ้าไม่มี startTime และ endTime เลย
    return '';
  };

  // แปลง status เป็นภาษาไทย
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'open': 'เปิดรับ',
      'in_progress': 'กำลังดำเนินการ',
      'completed': 'เสร็จสิ้น',
      'cancelled': 'ยกเลิก',
    };
    return statusMap[status] || status;
  };

  // แปลง application status เป็นภาษาไทย (สำหรับอาสาสมัคร)
  const getApplicationStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'รอดำเนินการ',
      'accepted': 'ยืนยันแล้ว',
      'rejected': 'ไม่ผ่าน',
    };
    return statusMap[status] || status;
  };

  // กำหนดสี badge ตาม status
  const getStatusBadgeStyle = (status: string) => {
    if (status === 'open') {
      return styles.statusOpen;
    } else if (status === 'in_progress') {
      return styles.statusInProgress;
    } else if (status === 'completed') {
      return styles.statusCompleted;
    }
    return styles.statusDefault;
  };

  // กำหนดสี badge ตาม application status (สำหรับอาสาสมัคร)
  const getApplicationStatusBadgeStyle = (status: string) => {
    if (status === 'pending') {
      return styles.applicationPending;
    } else if (status === 'accepted') {
      return styles.applicationAccepted;
    } else if (status === 'rejected') {
      return styles.applicationRejected;
    }
    return styles.statusDefault;
  };

  // กำหนดว่าจะแสดง status อะไร
  const getDisplayStatus = () => {
    // สำหรับอาสาสมัคร: ถ้างานเสร็จแล้วแสดง "เสร็จสิ้น", ถ้ามี application status แสดง application status, ถ้าไม่มีแสดง job status
    if (user?.role === 'volunteer') {
      if (job.status === 'completed') {
        return {
          label: getStatusLabel('completed'),
          style: getStatusBadgeStyle('completed'),
        };
      }
      if (job.applicationStatus) {
        return {
          label: getApplicationStatusLabel(job.applicationStatus),
          style: getApplicationStatusBadgeStyle(job.applicationStatus),
        };
      }
      return {
        label: getStatusLabel(job.status),
        style: getStatusBadgeStyle(job.status),
      };
    }

    // สำหรับผู้พิการ: ถ้างานเสร็จแล้วแสดง "เสร็จสิ้น", ถ้ามี acceptedVolunteerId แล้ว ให้ถือว่า "กำลังดำเนินการ", ถ้าไม่มีใช้ job status
    if (user?.role === 'requester') {
      if (job.status === 'completed') {
        return {
          label: getStatusLabel('completed'),
          style: getStatusBadgeStyle('completed'),
        };
      }
      const derivedStatus = job.acceptedVolunteerId ? 'in_progress' : job.status;
      return {
        label: getStatusLabel(derivedStatus),
        style: getStatusBadgeStyle(derivedStatus),
      };
    }

    // กรณีอื่น ๆ ใช้ job status ตรง ๆ
    return {
      label: getStatusLabel(job.status),
      style: getStatusBadgeStyle(job.status),
    };
  };

  const displayStatus = getDisplayStatus();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityHint="View job details"
      accessibilityLabel={`Job ${job.title}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={[styles.badge, displayStatus.style]}>
          {displayStatus.label}
        </Text>
      </View>
      <Text style={styles.meta}>{job.location}</Text>
      <Text style={styles.meta}>{formatDate(job.workDate)}</Text>
      <Text style={styles.meta}>{formatTimeRange()}</Text>
      
      {/* แสดงข้อมูลตาม role */}
      {user?.role === 'volunteer' && job.requesterDisabilityType && (
        <Text style={styles.meta}>{getDisabilityTypeLabel(job.requesterDisabilityType)}</Text>
      )}
      
      {user?.role === 'requester' && (
        <Text style={styles.meta}>
          ผู้ดูแล: {job.acceptedVolunteerName || '-'}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  statusOpen: {
    backgroundColor: '#e1f5f2',
    color: colors.primary,
  },
  statusInProgress: {
    backgroundColor: '#fff4e6',
    color: '#f59e0b',
  },
  statusCompleted: {
    backgroundColor: '#e6f7e6',
    color: '#10b981',
  },
  statusDefault: {
    backgroundColor: '#f3f4f6',
    color: colors.muted,
  },
  // Application status styles (สำหรับอาสาสมัคร)
  applicationPending: {
    backgroundColor: '#fff4e6',
    color: '#f59e0b',
  },
  applicationAccepted: {
    backgroundColor: '#e6f7e6',
    color: '#10b981',
  },
  applicationRejected: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  meta: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
});
