import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobCard } from '../components/JobCard';
import { api } from '../api/client';
import { JobSummary } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

export const JobListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadJobs = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      if (user?.role === 'requester') {
        // สำหรับผู้พิการ: แสดงงานที่ยังเปิดอยู่และกำลังดำเนินการ (status === 'open' || 'in_progress')
        const response = await api.getRequesterJobs(user.id);
        const activeJobs = response.jobs.filter((job) => job.status === 'open' || job.status === 'in_progress');
        setJobs(activeJobs);
      } else {
        // สำหรับอาสาสมัคร: แสดงเฉพาะงานที่ยังเปิดรับ (status === 'open' และยังไม่มี acceptedVolunteerId)
        // และยังไม่ได้สมัคร (applicationStatus ไม่มี หรือ undefined)
        const response = await api.getJobs(user?.id);
        const openJobs = response.jobs.filter(
          (job) => 
            job.status === 'open' && 
            !job.acceptedVolunteerId &&
            !job.applicationStatus // ยังไม่ได้สมัคร
        );
        setJobs(openJobs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดงานได้');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isRequester = user?.role === 'requester';

  return (
    <View style={[styles.screen, getDynamicTopPadding(insets.top)]}>
      <ScrollView
        style={styles.padHorizontal16}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {isRequester && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              marginBottom: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 56,
            }}
            onPress={() => navigation.navigate('CreateJob', {})}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>ลงงานเลย</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.heading}>{isRequester ? 'งานที่ลงไว้' : 'งานที่เปิดรับ'}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {jobs.length === 0 && !loading ? (
          <Text style={styles.emptyLarge}>
            {isRequester ? 'ยังไม่ได้ลงงาน' : 'ยังไม่มีงานที่เปิดรับ'}
          </Text>
        ) : (
          jobs.map((item) => (
            <JobCard
              key={item.id}
              job={item}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
