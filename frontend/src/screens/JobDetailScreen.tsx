import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { JobDetail } from '../types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC<Props> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('พร้อมให้ความช่วยเหลือ!');
  const [volunteerId, setVolunteerId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const response = await api.getJob(route.params.jobId);
        setJob(response);
      } catch (error) {
        Alert.alert('โหลดงานไม่สำเร็จ', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [route.params.jobId]);

  const handleApply = async () => {
    if (!user) return;
    try {
      await api.applyToJob(route.params.jobId, {
        volunteerId: user.id,
        message,
      });
      Alert.alert('ส่งใบสมัครแล้ว', 'ผู้ขอความช่วยเหลือได้รับแจ้งเตือนแล้ว');
    } catch (error) {
      Alert.alert('ไม่สามารถสมัครได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleComplete = async () => {
    if (!volunteerId.trim()) {
      Alert.alert('ต้องระบุอาสาสมัคร', 'กรุณากรอกรหัสอาสาสมัครเพื่อบันทึกผลการให้ความช่วยเหลือ');
      return;
    }
    const ratingValue = Number(rating);
    if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      Alert.alert('คะแนนไม่ถูกต้อง', 'คะแนนต้องอยู่ระหว่าง 0 ถึง 5');
      return;
    }

    try {
      await api.completeJob(route.params.jobId, {
        volunteerId: volunteerId.trim(),
        rating: ratingValue,
        comment,
      });
      Alert.alert('ปิดงานแล้ว', 'บันทึกผลการให้ความช่วยเหลือเรียบร้อย');
    } catch (error) {
      Alert.alert('ไม่สามารถปิดงานได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const openMap = () => {
    if (!job) return;
    const { latitude, longitude } = job;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('ไม่สามารถเปิดแผนที่ได้');
    });
  };

  if (loading || !job) {
    return (
      <View style={[styles.screen, styles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isVolunteer = user?.role === 'volunteer';
  const isRequester = user?.role === 'requester';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.pad20, styles.pb40, getDynamicTopPadding(insets.top)]}
    >
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.meta}>{job.location}</Text>
      <Text style={styles.meta}>กำหนดการ: {job.scheduledOn}</Text>
      <View style={[styles.section, styles.mt24]}>
        <Text style={styles.sectionTitle}>รายละเอียด</Text>
        <Text style={styles.bodyText}>{job.description}</Text>
        <Text style={styles.bodyText}>จุดนัดพบ: {job.meetingPoint}</Text>
        <Text style={[styles.sectionTitle, styles.mt12]}>ความต้องการ</Text>
        {job.requirements.map((item) => (
          <Text key={item} style={styles.bullet}>• {item}</Text>
        ))}
      </View>
      <PrimaryButton title="เปิดแผนที่" onPress={openMap} variant="secondary" />

      {isVolunteer ? (
        <View style={[styles.section, styles.mt24]}>
          <Text style={styles.sectionTitle}>สมัครงาน</Text>
          <Text style={styles.bodyText}>แจ้งผู้ขอความช่วยเหลือว่าคุณสามารถช่วยได้อย่างไร</Text>
          <TextInput
            style={[styles.textArea, styles.mt12]}
            placeholder="ข้อความถึงผู้ขอความช่วยเหลือ"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
          <PrimaryButton title="ส่งใบสมัคร" onPress={handleApply} />
        </View>
      ) : null}

      {isRequester ? (
        <View style={[styles.section, styles.mt24]}>
          <Text style={styles.sectionTitle}>ปิดงาน</Text>
          <Text style={styles.bodyText}>
            กรอกรหัสอาสาสมัครและให้คะแนนหลังจากได้รับความช่วยเหลือแล้ว
          </Text>
          <FormField
            label="รหัสอาสาสมัคร"
            value={volunteerId}
            onChangeText={setVolunteerId}
            placeholder="user-1"
          />
          <FormField
            label="คะแนน (0-5)"
            value={rating}
            onChangeText={setRating}
            keyboardType="decimal-pad"
          />
          <FormField
            label="ความคิดเห็น"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          <PrimaryButton title="บันทึกผลการให้ความช่วยเหลือ" onPress={handleComplete} variant="secondary" />
        </View>
      ) : null}
    </ScrollView>
  );
};
