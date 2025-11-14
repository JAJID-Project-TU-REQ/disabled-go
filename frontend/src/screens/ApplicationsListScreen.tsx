import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { Application, UserProfile } from '../types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ApplicationsList'>;

type ApplicationWithVolunteer = Application & { volunteer: UserProfile };

export const ApplicationsListScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const [applications, setApplications] = useState<ApplicationWithVolunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.getJobApplications(jobId);
      setApplications(response.applications);
    } catch (error) {
      Alert.alert('ไม่สามารถโหลดข้อมูลได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (volunteerId: string) => {
    navigation.navigate('Profile', { userId: volunteerId });
  };

  const handleAccept = async (applicationId: string, volunteerName: string) => {
    Alert.alert(
      'ยืนยันการเลือกผู้ดูแล',
      `คุณต้องการเลือก ${volunteerName} เป็นผู้ดูแลงานนี้หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            try {
              await api.acceptApplication(applicationId);
              Alert.alert('ยืนยันเสร็จสิ้น', 'ได้เลือกผู้ดูแลเรียบร้อยแล้ว', [
                {
                  text: 'ตกลง',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('ไม่สามารถยืนยันได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
            }
          },
        },
      ]
    );
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
      <Text style={styles.heading}>ผู้สมัครงาน</Text>
      {applications.length === 0 ? (
        <Text style={styles.empty}>ยังไม่มีผู้สมัคร</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.section, styles.mb12]}>
              <Pressable onPress={() => handleViewProfile(item.volunteer.id)}>
                <Text style={styles.cardTitle}>
                  {item.volunteer.firstName} {item.volunteer.lastName}
                </Text>
                <Text style={styles.metaCompact}>
                  คะแนนรีวิว: {item.volunteer.rating.toFixed(1)} ⭐
                </Text>
              </Pressable>
              <PrimaryButton
                title="เลือกผู้ดูแล"
                onPress={() => handleAccept(item.id, `${item.volunteer.firstName} ${item.volunteer.lastName}`)}
                variant="secondary"
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

