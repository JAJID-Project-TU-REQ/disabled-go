import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobCard } from '../components/JobCard';
import { api } from '../api/client';
import { JobSummary } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

export const JobListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadJobs = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const response = await api.getJobs();
      setJobs(response.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดงานได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.getJobs();
      setJobs(response.jobs);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}>
      <Text style={styles.heading}>งานที่เปิดรับ</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.emptyLarge}>ยังไม่มีงานที่เปิดรับ</Text>}
      />
    </View>
  );
};
