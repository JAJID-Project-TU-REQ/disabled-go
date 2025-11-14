import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { JobCard } from '../components/JobCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { JobSummary, VolunteerApplication } from '../types';
import { RootStackParamList } from '../navigation/types';
import { getDynamicTopPadding, styles } from './styles';

export const MyJobsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    return (
      <View style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}>
        <Text style={styles.heading}>ใบสมัครของฉัน</Text>
        <FlatList
          data={applications}
          keyExtractor={(item) => item.application.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>ยังไม่มีใบสมัคร</Text> : null}
          renderItem={({ item }) => (
            <View style={[styles.section, styles.mb12]}>
              <Text style={styles.cardTitle}>{item.job.title}</Text>
              <Text style={styles.metaCompact}>สถานะ: {item.application.status === 'pending' ? 'รอดำเนินการ' : item.application.status === 'completed' ? 'เสร็จสิ้น' : item.application.status}</Text>
              <Text style={styles.metaCompact}>ส่งเมื่อ {new Date(item.application.createdAt).toLocaleDateString('th-TH')}</Text>
              <PrimaryButton
                title="ดูรายละเอียด"
                onPress={() => navigation.navigate('JobDetail', { jobId: item.job.id })}
                variant="secondary"
              />
            </View>
          )}
        />
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
