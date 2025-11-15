import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { PrimaryButton } from '../components/PrimaryButton';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { UserProfile } from '../types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type StackProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
type TabProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;
type Props = StackProps | TabProps;

const isStackProps = (props: Props): props is StackProps => {
  return 'params' in props.route && props.route.params !== undefined;
};

export const ProfileScreen: React.FC<Props> = (props) => {
  const route = isStackProps(props) ? props.route : { params: undefined };
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user: currentUser, refreshProfile, logout, isLoading } = useAuth();
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Array<{ jobTitle: string; rating: number; review: string; requesterName: string; createdAt: string }>>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showMoreReviews, setShowMoreReviews] = useState(false);

  // ถ้ามี userId ใน params แสดงว่าเป็นการดู profile ของคนอื่น
  const userId = route.params?.userId;
  const isViewingOther = !!userId;
  const user = isViewingOther ? viewingUser : currentUser;

  useEffect(() => {
    if (isViewingOther && userId) {
      loadUserProfile(userId);
    }
  }, [userId, isViewingOther]);

  useEffect(() => {
    if (user && user.role === 'volunteer') {
      loadReviews(user.id);
    }
  }, [user]);

  const loadUserProfile = async (id: string) => {
    setLoading(true);
    try {
      const profile = await api.getUser(id);
      setViewingUser(profile);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (volunteerId: string) => {
    setLoadingReviews(true);
    try {
      const reviewsData = await api.getVolunteerReviews(volunteerId);
      setReviews(reviewsData);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoadingReviews(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  // Map skill values to labels
  const getSkillLabel = (value: string) => {
    const skillMap: Record<string, string> = {
      wheelchair_support: 'การช่วยเหลือผู้ใช้รถเข็น',
      thai_language: 'ภาษาไทย',
      english_language: 'ภาษาอังกฤษ',
      first_aid: 'การปฐมพยาบาล',
      elderly_care: 'การช่วยเหลือผู้สูงอายุ',
      visual_impairment_support: 'การช่วยเหลือผู้พิการทางสายตา',
      hearing_impairment_support: 'การช่วยเหลือผู้พิการทางการได้ยิน',
      transportation: 'การเดินทาง',
      shopping_assistance: 'การซื้อของ',
      hospital_visits: 'การไปโรงพยาบาล',
    };
    return skillMap[value] || value;
  };

  // Map disability type values to labels
  const getDisabilityTypeLabel = (value?: string) => {
    if (!value) return '';
    const typeMap: Record<string, string> = {
      elderly: 'ผู้สูงวัย',
      physical: 'ความพิการทางกาย',
      visual: 'ความพิการทางสายตา',
      hearing: 'ความพิการทางการได้ยิน',
      intellectual: 'ความพิการทางสติปัญญา',
      learning: 'ความพิการทางการเรียนรู้',
      mental: 'ความพิการทางจิตใจ',
      other: 'อื่นๆ',
    };
    return typeMap[value] || value;
  };

  // Map additional needs values to labels
  const getAdditionalNeedLabel = (value: string) => {
    const needMap: Record<string, string> = {
      wheelchair: 'รถเข็น',
      walking_stick: 'ไม้เท้า',
      hearing_aid: 'เครื่องช่วยฟัง',
      glasses: 'แว่นตา',
      walking_aid: 'อุปกรณ์ช่วยเดิน',
      other: 'อื่นๆ',
    };
    return needMap[value] || value;
  };

  return (
    <ScrollView style={[styles.screen, getDynamicTopPadding(insets.top)]} contentContainerStyle={styles.pad20}>
      <View style={[styles.section, styles.pad20, styles.mb16]}>
        <Text style={styles.title}>{user.firstName} {user.lastName}</Text>
        <Text style={[styles.roleLabel, styles.mb12]}>
          {user.role === 'volunteer' ? 'อาสาสมัคร' : 'ผู้พิการ'}
        </Text>
        {user.email && <Text style={styles.metaCompact}>อีเมล: {user.email}</Text>}
        <Text style={styles.metaCompact}>เบอร์โทรศัพท์: {user.phone}</Text>

        {user.role === 'volunteer' ? (
          <>
            {!!user.skills?.length && (
              <>
                <Text style={styles.sectionTitle}>ทักษะ</Text>
                <Text style={styles.bodyText}>
                  {user.skills.map(getSkillLabel).join(', ')}
                </Text>
              </>
            )}
            
            <Text style={styles.sectionTitle}>เกี่ยวกับ</Text>
            <Text style={styles.bodyText}>{user.biography || 'ยังไม่มีข้อมูลเกี่ยวกับคุณ'}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>คะแนนรีวิวรวม : </Text>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>{user.rating.toFixed(1)}</Text>
            </View>
            
            {reviews.length > 0 && (
              <>
                {(showMoreReviews ? reviews.slice(0, 5) : reviews.slice(0, 2)).map((review, index) => {
                  const displayedReviews = showMoreReviews ? reviews.slice(0, 5) : reviews.slice(0, 2);
                  const isLastItem = index === displayedReviews.length - 1;
                  // แสดง border ถ้าไม่ใช่ item สุดท้าย หรือ ถ้าเป็น item สุดท้ายแต่มีปุ่มต่อไป (ดูเพิ่มเติม หรือ ดูทั้งหมด)
                  const shouldShowBorder = !isLastItem || (showMoreReviews && reviews.length > 5) || (!showMoreReviews && reviews.length > 2);
                  return (
                    <View key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: shouldShowBorder ? 1 : 0, borderBottomColor: colors.border }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.bodyText, { fontWeight: '600', flex: 1 }]}>{review.jobTitle}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                          <StarRating
                            rating={review.rating}
                            onRatingChange={() => {}}
                            disabled={true}
                            size={16}
                          />
                        </View>
                      </View>
                      <Text style={[styles.metaCompact, { marginBottom: 4 }]}>จาก: {review.requesterName}</Text>
                      <Text style={styles.bodyText}>{review.review}</Text>
                    </View>
                  );
                })}
                {reviews.length > 2 && !showMoreReviews && (
                  <PrimaryButton
                    title="ดูเพิ่มเติม"
                    onPress={() => setShowMoreReviews(true)}
                    variant="secondary"
                    style={{ marginTop: 8, marginBottom: 8 }}
                  />
                )}
                {reviews.length > 5 && showMoreReviews && (
                  <PrimaryButton
                    title="ดูทั้งหมด"
                    onPress={() => stackNavigation.navigate('Reviews', { volunteerId: user.id })}
                    variant="secondary"
                    style={{ marginTop: 8, marginBottom: 8 }}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {user.disabilityType && (
              <>
                <Text style={styles.sectionTitle}>ประเภทความพิการ</Text>
                <Text style={styles.bodyText}>{getDisabilityTypeLabel(user.disabilityType)}</Text>
              </>
            )}
            {user.additionalNeeds && user.additionalNeeds.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>ความต้องการเพิ่มเติม</Text>
                <Text style={styles.bodyText}>
                  {user.additionalNeeds.map(getAdditionalNeedLabel).join(', ')}
                </Text>
              </>
            )}
          </>
        )}
      </View>

      {!isViewingOther && (
        <>
          <PrimaryButton 
            title="แก้ไขโปรไฟล์" 
            onPress={() => {
              stackNavigation.navigate('EditProfile');
            }} 
            disabled={isLoading} 
            variant="secondary" 
          />
          <PrimaryButton title="ออกจากระบบ" onPress={logout} variant="danger" style={{ marginTop: 12 }} />
        </>
      )}
    </ScrollView>
  );
};
