import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getDynamicTopPadding, styles } from './styles';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile, logout, isLoading } = useAuth();

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
    <View style={[styles.screen, styles.pad20, getDynamicTopPadding(insets.top)]}>
      <View style={[styles.section, styles.pad20, styles.mb16]}>
        <Text style={styles.title}>{user.firstName} {user.lastName}</Text>
        <Text style={[styles.roleLabel, styles.mb12]}>
          {user.role === 'volunteer' ? 'อาสาสมัคร' : 'ผู้พิการ'}
        </Text>
        <Text style={styles.metaCompact}>เลขบัตรประชาชน: {user.nationalId}</Text>
        <Text style={styles.metaCompact}>เบอร์โทรศัพท์: {user.phone}</Text>
        {user.email && <Text style={styles.metaCompact}>อีเมล: {user.email}</Text>}
        {user.address && <Text style={styles.metaCompact}>ที่อยู่: {user.address}</Text>}
      </View>

      {user.role === 'volunteer' ? (
        <>
          <View style={[styles.section, styles.pad20, styles.mb16]}>
            <Text style={styles.sectionTitle}>เกี่ยวกับ</Text>
            <Text style={styles.bodyText}>{user.biography || 'ยังไม่มีข้อมูลเกี่ยวกับคุณ'}</Text>
          </View>
          <View style={[styles.section, styles.pad20, styles.mb16]}>
            <Text style={styles.sectionTitle}>ผลงาน</Text>
            <Text style={styles.bodyText}>งานที่ทำเสร็จ: {user.completedJobs}</Text>
            <Text style={styles.bodyText}>คะแนน: {user.rating.toFixed(1)}</Text>
            {!!user.skills?.length && (
              <Text style={styles.bodyText}>
                ทักษะ: {user.skills.map(getSkillLabel).join(', ')}
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          {user.disabilityType && (
            <View style={[styles.section, styles.pad20, styles.mb16]}>
              <Text style={styles.sectionTitle}>ประเภทความพิการ</Text>
              <Text style={styles.bodyText}>{getDisabilityTypeLabel(user.disabilityType)}</Text>
            </View>
          )}
          {user.additionalNeeds && user.additionalNeeds.length > 0 && (
            <View style={[styles.section, styles.pad20, styles.mb16]}>
              <Text style={styles.sectionTitle}>ความต้องการเพิ่มเติม</Text>
              <Text style={styles.bodyText}>
                {user.additionalNeeds.map(getAdditionalNeedLabel).join(', ')}
              </Text>
            </View>
          )}
        </>
      )}

      <PrimaryButton title="รีเฟรชโปรไฟล์" onPress={refreshProfile} disabled={isLoading} variant="secondary" />
      <PrimaryButton title="ออกจากระบบ" onPress={logout} variant="danger" />
    </View>
  );
};
