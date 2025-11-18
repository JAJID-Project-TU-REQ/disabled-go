import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { PrimaryButton } from '../components/PrimaryButton';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { JobDetail, UserProfile } from '../types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

// Map disability type เป็นภาษาไทย
const getDisabilityTypeLabel = (type?: string): string => {
  const map: Record<string, string> = {
    'physical': 'ผู้พิการทางร่างกาย',
    'visual': 'ผู้พิการทางสายตา',
    'hearing': 'ผู้พิการทางการได้ยิน',
    'intellectual': 'ผู้พิการทางสติปัญญา',
    'mental': 'ผู้พิการทางจิตใจ',
    'elderly': 'ผู้สูงวัย',
    'learning': 'ความพิการทางการเรียนรู้',
    'other': 'อื่นๆ',
  };
  return type ? (map[type] || type) : '';
};

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail>();
  const [loading, setLoading] = useState(true);
  const [acceptedVolunteer, setAcceptedVolunteer] = useState<UserProfile | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getJob(route.params.jobId, user?.role === 'volunteer' ? user.id : undefined);
      setJob(response);
      
      // โหลดข้อมูลผู้ดูแลถ้ามี
      if (response.acceptedVolunteerId) {
        try {
          const volunteer = await api.getUser(response.acceptedVolunteerId);
          setAcceptedVolunteer(volunteer);
        } catch {
          setAcceptedVolunteer(null);
        }
      } else {
        setAcceptedVolunteer(null);
      }
    } catch (error) {
      Alert.alert('โหลดงานไม่สำเร็จ', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [route.params.jobId, user?.id, user?.role]);

  useFocusEffect(
    useCallback(() => {
      loadJob();
    }, [loadJob])
  );

  const handleApply = async () => {
    if (!user) return;
    
    Alert.alert(
      'ยืนยันการสมัครงาน',
      'คุณต้องการสมัครงานนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            try {
              await api.applyToJob(route.params.jobId, {
                volunteerId: user.id,
              });
              Alert.alert('สมัครงานเสร็จสิ้น', 'คุณได้สมัครงานนี้เรียบร้อยแล้ว', [
                {
                  text: 'ตกลง',
                  onPress: () => {
                    // พากลับไปหน้า "ใบสมัครของฉัน" (MyJobs tab)
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MainTabs',
                            state: {
                              routes: [
                                { name: 'Explore' },
                                { name: 'MyJobs' },
                                { name: 'Profile' },
                              ],
                              index: 1, // MyJobs tab
                            },
                          },
                        ],
                      })
                    );
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('ไม่สามารถสมัครได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
            }
          },
        },
      ]
    );
  };

  const handleCancelApplication = async () => {
    if (!user) return;
    
    Alert.alert(
      'ยืนยันการยกเลิกสมัครงาน',
      'คุณต้องการยกเลิกการสมัครงานนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            try {
              await api.cancelApplication(route.params.jobId, user.id);
              Alert.alert('ยกเลิกสมัครงานเรียบร้อย', 'คุณได้ยกเลิกการสมัครงานนี้แล้ว', [
                {
                  text: 'ตกลง',
                  onPress: () => {
                    // พากลับไปหน้า "ใบสมัครของฉัน" (MyJobs tab)
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MainTabs',
                            state: {
                              routes: [
                                { name: 'Explore' },
                                { name: 'MyJobs' },
                                { name: 'Profile' },
                              ],
                              index: 1, // MyJobs tab
                            },
                          },
                        ],
                      })
                    );
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('ไม่สามารถยกเลิกได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
            }
          },
        },
      ]
    );
  };


  // Format วันที่
  const formatDate = (): string => {
    if (!job) return '';
    const dateStr = job.workDate;
    if (!dateStr) return '';
    
    try {
      let date: Date;
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
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
    if (!job) return '';
    if (job.startTime && job.endTime) {
      return `${job.startTime} - ${job.endTime}`;
    }
    if (job.startTime) {
      return `${job.startTime} - ?`;
    }
    if (job.endTime) {
      return `? - ${job.endTime}`;
    }
    return '';
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.pad20, styles.pb40, getDynamicTopPadding(insets.top), { paddingBottom: 200 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
      {/* ชื่องาน */}
      <Text style={styles.titleCenter}>{job.title}</Text>

      {/* หัวข้อ "รายละเอียด" */}
      <Text style={styles.sectionTitle}>รายละเอียด</Text>
      
      {/* วันที่ */}
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} style={styles.detailIcon} />
        <Text style={styles.detailText}>{formatDate()}</Text>
      </View>

      {/* เวลา */}
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={20} color={colors.muted} style={styles.detailIcon} />
        <Text style={styles.detailText}>{formatTimeRange()}</Text>
      </View>

      {/* ประเภทความพิการ (สำหรับอาสาสมัคร) */}
      {isVolunteer && job.requesterDisabilityType && (
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={20} color={colors.muted} style={styles.detailIcon} />
          <Text style={styles.detailText}>{getDisabilityTypeLabel(job.requesterDisabilityType)}</Text>
        </View>
      )}

      {/* สถานที่ */}
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={20} color={colors.muted} style={styles.detailIcon} />
        <Text style={styles.detailText}>{job.location}</Text>
      </View>

      {/* แผนที่ขนาดเล็ก */}
      <TouchableOpacity onPress={openMap} style={styles.mapContainer} activeOpacity={0.8}>
        <MapView
          style={styles.smallMap}
          initialRegion={{
            latitude: job.latitude,
            longitude: job.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: job.latitude,
              longitude: job.longitude,
            }}
          />
        </MapView>
      </TouchableOpacity>

      {/* หัวข้อ "รายละเอียดเพิ่มเติม" */}
      <Text style={styles.sectionTitle}>รายละเอียดเพิ่มเติม</Text>
      <Text style={styles.bodyText}>{job.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</Text>

      {/* ส่วนสำหรับ volunteer */}
      {isVolunteer && (
        <>
          {/* ปุ่มสมัครงาน - แสดงเฉพาะงานที่ยังไม่ได้สมัคร */}
          {!job.applicationStatus && (
            <PrimaryButton
              title="สมัครงาน"
              onPress={handleApply}
              style={{ marginTop: 24 }}
            />
          )}

          {/* ปุ่มยกเลิกสมัครงาน - แสดงเฉพาะงานที่มี status pending */}
          {job.applicationStatus === 'pending' && (
            <PrimaryButton
              title="ยกเลิกสมัครงาน"
              onPress={handleCancelApplication}
              variant="danger"
              style={{ marginTop: 24 }}
            />
          )}

          {/* สำหรับงานที่มี status accepted หรือ rejected - ไม่แสดงปุ่มอะไร */}
        </>
      )}

      {/* ส่วนสำหรับ requester (งานที่เสร็จสิ้นแล้ว) - ให้คะแนนผู้ดูแล */}
      {isRequester && job.status === 'completed' && acceptedVolunteer && (
        <>
          <Text style={styles.sectionTitle}>ให้คะแนนผู้ดูแล</Text>
          
          <View style={styles.ratingCard}>
            {/* ชื่อผู้ดูแล */}
            <Text style={styles.caregiverName}>
              {acceptedVolunteer.firstName} {acceptedVolunteer.lastName}
            </Text>

            {/* ถ้ายังไม่ได้ให้คะแนน - แสดง form */}
            {!job.requesterRating ? (
              <>
                {/* การให้คะแนน */}
                <View style={styles.ratingContainer}>
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    disabled={false}
                    size={36}
                  />
                </View>

                {/* ช่องแสดงความคิดเห็น */}
                <Text style={styles.formLabel}>ความคิดเห็น</Text>
                <TextInput
                  style={styles.reviewTextArea}
                  multiline
                  numberOfLines={4}
                  value={review}
                  onChangeText={setReview}
                  placeholder="เขียนความคิดเห็นเกี่ยวกับการทำงานของผู้ดูแล..."
                  placeholderTextColor={colors.muted}
                  editable={true}
                  textAlignVertical="top"
                  scrollEnabled={true}
                />

                {/* ปุ่มยืนยันการให้คะแนน */}
                <PrimaryButton
                  title="ยืนยันการให้คะแนน"
                  onPress={async () => {
                    if (rating === 0) {
                      Alert.alert('กรุณาให้คะแนน', 'กรุณาเลือกจำนวนดาวที่ต้องการให้คะแนน');
                      return;
                    }
                    
                    setSubmittingRating(true);
                    try {
                      await api.submitRating(job.id, {
                        rating,
                        review: review.trim(),
                      });
                      // Reset state
                      setRating(0);
                      setReview('');
                      // Reload job เพื่อแสดงข้อมูลที่อัปเดต
                      await loadJob();
                      Alert.alert('ให้คะแนนเรียบร้อย', 'ขอบคุณสำหรับการให้คะแนน');
                    } catch (error) {
                      Alert.alert('ไม่สามารถให้คะแนนได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
                    } finally {
                      setSubmittingRating(false);
                    }
                  }}
                  loading={submittingRating}
                  disabled={submittingRating}
                />
              </>
            ) : (
              /* ถ้าให้คะแนนแล้ว - แสดงข้อมูล (read-only) */
              <>
                {/* คะแนนที่ให้ไปแล้ว */}
                <View style={styles.ratingContainer}>
                  <StarRating
                    rating={job.requesterRating}
                    onRatingChange={() => {}}
                    disabled={true}
                    size={36}
                  />
                </View>

                {/* ความคิดเห็นที่เขียนไปแล้ว */}
                {job.requesterReview && (
                  <>
                    <Text style={styles.formLabel}>ความคิดเห็น</Text>
                    <Text style={styles.reviewText}>{job.requesterReview}</Text>
                  </>
                )}
              </>
            )}
          </View>
        </>
      )}

      {/* ส่วนสำหรับ requester (งานที่ยังดำเนินการอยู่) */}
      {isRequester && job.status !== 'completed' && (
        <>
          {/* หัวข้อ "รายละเอียดผู้ดูแล" */}
          <Text style={styles.sectionTitle}>รายละเอียดผู้ดูแล</Text>
          
          {/* กล่องแสดงรายละเอียดผู้ดูแล */}
          <View style={styles.caregiverCard}>
            {acceptedVolunteer ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile', { userId: acceptedVolunteer.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.caregiverName}>
                  {acceptedVolunteer.firstName} {acceptedVolunteer.lastName}
                </Text>
                <Text style={styles.caregiverRating}>
                  คะแนนรีวิว: {acceptedVolunteer.rating.toFixed(1)} ⭐
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('ApplicationsList', { jobId: job.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.caregiverPlaceholder}>ตรวจสอบผู้สมัครงาน</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ปุ่มตามสถานะงาน */}
          {acceptedVolunteer ? (
            /* ถ้ามีผู้ดูแลแล้ว - แสดงปุ่ม "เสร็จสิ้นงาน" เพียงปุ่มเดียว */
            <PrimaryButton
              title="เสร็จสิ้นงาน"
              onPress={async () => {
                Alert.alert(
                  'ยืนยันการเสร็จสิ้นงาน',
                  'คุณต้องการให้งานนี้เสร็จสิ้นหรือไม่? หลังจากเสร็จสิ้นแล้ว คุณจะสามารถให้คะแนนผู้ดูแลได้',
                  [
                    { text: 'ยกเลิก', style: 'cancel' },
                    {
                      text: 'ยืนยัน',
                      onPress: async () => {
                        try {
                          if (!job.acceptedVolunteerId) {
                            throw new Error('งานนี้ยังไม่มีผู้ดูแล');
                          }
                          await api.completeJobByRequester(job.id, job.acceptedVolunteerId);
                          Alert.alert('งานเสร็จสิ้นแล้ว', 'คุณสามารถให้คะแนนผู้ดูแลได้', [
                            {
                              text: 'ตกลง',
                              onPress: async () => {
                                // Reload job เพื่อแสดงส่วนให้คะแนน
                                await loadJob();
                              },
                            },
                          ]);
                        } catch (error) {
                          Alert.alert('ไม่สามารถเสร็จสิ้นงานได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
                        }
                      },
                    },
                  ]
                );
              }}
              variant="primary"
              style={styles.singleActionButton}
            />
          ) : (
            /* ถ้ายังไม่มีผู้ดูแล - แสดงปุ่ม "แก้ไขรายละเอียด" และ "ลบงาน" */
            <View style={styles.actionButtonsRow}>
              <PrimaryButton
                title="แก้ไขรายละเอียด"
                onPress={() => {
                  navigation.navigate('EditJob', { jobId: job.id });
                }}
                variant="secondary"
                style={styles.actionButton}
              />
              <PrimaryButton
                title="ลบงาน"
                onPress={async () => {
                  Alert.alert(
                    'ยืนยันการลบงาน',
                    'คุณต้องการลบงานนี้หรือไม่?',
                    [
                      { text: 'ยกเลิก', style: 'cancel' },
                      {
                        text: 'ลบ',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await api.deleteJob(job.id);
                            Alert.alert('ลบงานเสร็จสิ้นแล้ว', 'งานถูกลบเรียบร้อยแล้ว', [
                              {
                                text: 'ตกลง',
                                onPress: () => {
                                  // พากลับไปหน้างานของฉัน (Explore tab)
                                  navigation.dispatch(
                                    CommonActions.reset({
                                      index: 0,
                                      routes: [
                                        {
                                          name: 'MainTabs',
                                          state: {
                                            routes: [{ name: 'Explore' }],
                                            index: 0,
                                          },
                                        },
                                      ],
                                    })
                                  );
                                },
                              },
                            ]);
                          } catch (error) {
                            Alert.alert('ไม่สามารถลบงานได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
                          }
                        },
                      },
                    ]
                  );
                }}
                variant="danger"
                style={styles.actionButton}
              />
            </View>
          )}
        </>
      )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};
