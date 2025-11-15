import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { JobCard } from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { JobSummary, VolunteerApplication } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

export const MyJobsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Collapse/expand state สำหรับ volunteer
  const [acceptedExpanded, setAcceptedExpanded] = useState(true);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [rejectedExpanded, setRejectedExpanded] = useState(false); // เริ่มต้นย่อไว้

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'volunteer') {
        const response = await api.getVolunteerApplications(user.id);
        setApplications(response.items);
      } else {
        // สำหรับผู้พิการ: แสดงเฉพาะงานที่เสร็จแล้ว (completed/inactive)
        const response = await api.getRequesterJobs(user.id);
        const completedJobs = response.jobs.filter((job) => job.status === 'completed');
        setJobs(completedJobs);
      }
    } catch (error) {
      Alert.alert('ไม่สามารถโหลดข้อมูลได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!user) {
    return null;
  }

  if (user.role === 'volunteer') {
    // แปลง applications เป็น jobs พร้อม applicationStatus
    const jobsWithStatus: JobSummary[] = applications.map((app) => ({
      ...app.job,
      applicationStatus: app.application.status,
    }));

    // แบ่งตาม status
    const acceptedJobs = jobsWithStatus.filter((job) => job.applicationStatus === 'accepted');
    const pendingJobs = jobsWithStatus.filter((job) => job.applicationStatus === 'pending');
    const rejectedJobs = jobsWithStatus.filter((job) => job.applicationStatus === 'rejected');

    const renderSection = (
      title: string,
      jobs: JobSummary[],
      expanded: boolean,
      onToggle: () => void
    ) => (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          onPress={onToggle}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 4,
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.heading, { fontSize: 18, marginBottom: 0 }]}>{title}</Text>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
        {expanded && (
          <>
            {jobs.length === 0 ? (
              <Text style={[styles.empty, { marginTop: 8 }]}>ไม่พบงาน</Text>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                />
              ))
            )}
          </>
        )}
      </View>
    );

    return (
      <View style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}>
        <Text style={styles.heading}>ใบสมัครของฉัน</Text>
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {renderSection('ยืนยันแล้ว', acceptedJobs, acceptedExpanded, () =>
            setAcceptedExpanded(!acceptedExpanded)
          )}
          {renderSection('รอดำเนินการ', pendingJobs, pendingExpanded, () =>
            setPendingExpanded(!pendingExpanded)
          )}
          {renderSection('ไม่ผ่าน', rejectedJobs, rejectedExpanded, () =>
            setRejectedExpanded(!rejectedExpanded)
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}>
      <Text style={styles.heading}>ประวัติงาน</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>ยังไม่มีงานที่เสร็จแล้ว</Text> : null}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
      />
    </View>
  );
};
