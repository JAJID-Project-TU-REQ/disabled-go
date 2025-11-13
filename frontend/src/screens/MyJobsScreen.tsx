import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { FormField } from '../components/FormField';
import { JobCard } from '../components/JobCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { JobSummary, VolunteerApplication } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

const defaultJobForm = {
  title: '',
  scheduledOn: '',
  location: '',
  meetingPoint: '',
  description: '',
  requirements: '',
  latitude: '',
  longitude: '',
};

export const MyJobsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [jobForm, setJobForm] = useState(defaultJobForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'volunteer') {
        const response = await api.getVolunteerApplications(user.id);
        setApplications(response.items);
      } else {
        const response = await api.getRequesterJobs(user.id);
        setJobs(response.jobs);
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

  const setField = (field: keyof typeof jobForm, value: string) => {
    setJobForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateJob = async () => {
    if (!user) return;
    if (!jobForm.title || !jobForm.description) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกหัวข้อและรายละเอียด');
      return;
    }

    const latitude = Number(jobForm.latitude || '0');
    const longitude = Number(jobForm.longitude || '0');

    setSubmitting(true);
    try {
      await api.createJob({
        requesterId: user.id,
        title: jobForm.title,
        description: jobForm.description,
        meetingPoint: jobForm.meetingPoint,
        scheduledOn: jobForm.scheduledOn,
        location: jobForm.location,
        requirements: jobForm.requirements
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        latitude: Number.isNaN(latitude) ? 0 : latitude,
        longitude: Number.isNaN(longitude) ? 0 : longitude,
      });
      Alert.alert('สร้างงานเรียบร้อย', 'อาสาสมัครสามารถเห็นงานของคุณแล้ว');
      setJobForm(defaultJobForm);
      await loadData();
    } catch (error) {
      Alert.alert('ไม่สามารถสร้างงานได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
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
    <KeyboardAvoidingView
      style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.pb64}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.heading}>สร้างงานใหม่</Text>
        <FormField label="หัวข้อ" value={jobForm.title} onChangeText={(text) => setField('title', text)} />
        <FormField
          label="วันที่นัดหมาย"
          value={jobForm.scheduledOn}
          onChangeText={(text) => setField('scheduledOn', text)}
          placeholder="2025-02-15"
        />
        <FormField
          label="สถานที่"
          value={jobForm.location}
          onChangeText={(text) => setField('location', text)}
          placeholder="โรงพยาบาล, เขต"
        />
        <FormField
          label="จุดนัดพบ"
          value={jobForm.meetingPoint}
          onChangeText={(text) => setField('meetingPoint', text)}
        />
        <FormField
          label="ความต้องการ"
          value={jobForm.requirements}
          onChangeText={(text) => setField('requirements', text)}
          placeholder="การช่วยเหลือผู้ใช้รถเข็น, ภาษาไทย"
          helperText="คั่นด้วยเครื่องหมายจุลภาค"
        />
        <Text style={styles.formLabel}>รายละเอียด</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={jobForm.description}
          onChangeText={(text) => setField('description', text)}
          placeholder="แชร์รายละเอียดให้อาสาสมัคร"
          placeholderTextColor={colors.muted}
        />
        <View style={styles.inlineFields}>
          <FormField
            label="ละติจูด"
            value={jobForm.latitude}
            onChangeText={(text) => setField('latitude', text)}
            keyboardType="decimal-pad"
            containerStyle={styles.inlineField}
          />
          <FormField
            label="ลองจิจูด"
            value={jobForm.longitude}
            onChangeText={(text) => setField('longitude', text)}
            keyboardType="decimal-pad"
            containerStyle={styles.inlineField}
          />
        </View>
        <PrimaryButton title="เผยแพร่งาน" onPress={handleCreateJob} loading={submitting} />

        <Text style={[styles.heading, styles.mt32]}>งานของคุณ</Text>
        {jobs.length === 0 ? (
          <Text style={styles.empty}>ยังไม่มีงาน สร้างงานใหม่ด้านบนเพื่อเริ่มต้น</Text>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
