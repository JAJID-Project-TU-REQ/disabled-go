import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View, FlatList } from 'react-native';
import { JobCard } from '../components/JobCard';
import { api } from '../api/client';
import { JobSummary } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { styles } from './styles';

export const JobListScreen: React.FC = () => {
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
      setError(err instanceof Error ? err.message : 'Unable to fetch jobs');
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
      <View style={styles.jobListCenterContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.jobListContainer}>
      <Text style={styles.jobListHeader}>Available opportunities</Text>
      {error ? <Text style={styles.jobListErrorText}>{error}</Text> : null}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobListContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.jobListEmptyText}>No opportunities found yet.</Text>}
      />
    </View>
  );
};
