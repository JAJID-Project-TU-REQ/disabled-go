import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from '../components/Dropdown';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { api } from '../api/client';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

// ตัวเลือกทักษะสำหรับอาสาสมัคร
const SKILL_OPTIONS = [
  { label: 'การช่วยเหลือผู้ใช้รถเข็น', value: 'wheelchair_support' },
  { label: 'ภาษาไทย', value: 'thai_language' },
  { label: 'ภาษาอังกฤษ', value: 'english_language' },
  { label: 'การปฐมพยาบาล', value: 'first_aid' },
  { label: 'การช่วยเหลือผู้สูงอายุ', value: 'elderly_care' },
  { label: 'การช่วยเหลือผู้พิการทางสายตา', value: 'visual_impairment_support' },
  { label: 'การช่วยเหลือผู้พิการทางการได้ยิน', value: 'hearing_impairment_support' },
  { label: 'การเดินทาง', value: 'transportation' },
  { label: 'การซื้อของ', value: 'shopping_assistance' },
  { label: 'การไปโรงพยาบาล', value: 'hospital_visits' },
];

// ตัวเลือกประเภทความพิการ
const DISABILITY_TYPE_OPTIONS = [
  { label: 'ผู้สูงวัย', value: 'elderly' },
  { label: 'ความพิการทางกาย', value: 'physical' },
  { label: 'ความพิการทางสายตา', value: 'visual' },
  { label: 'ความพิการทางการได้ยิน', value: 'hearing' },
  { label: 'ความพิการทางสติปัญญา', value: 'intellectual' },
  { label: 'ความพิการทางการเรียนรู้', value: 'learning' },
  { label: 'ความพิการทางจิตใจ', value: 'mental' },
  { label: 'อื่นๆ', value: 'other' },
];

// ตัวเลือกความต้องการเพิ่มเติม
const ADDITIONAL_NEEDS_OPTIONS = [
  { label: 'รถเข็น', value: 'wheelchair' },
  { label: 'ไม้เท้า', value: 'walking_stick' },
  { label: 'เครื่องช่วยฟัง', value: 'hearing_aid' },
  { label: 'แว่นตา', value: 'glasses' },
  { label: 'อุปกรณ์ช่วยเดิน', value: 'walking_aid' },
  { label: 'อื่นๆ', value: 'other' },
];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Volunteer fields
  const [skills, setSkills] = useState<string[]>([]);
  const [biography, setBiography] = useState('');
  
  // Requester fields
  const [disabilityType, setDisabilityType] = useState('');
  const [additionalNeeds, setAdditionalNeeds] = useState<string[]>([]);

  // Load user data
  useFocusEffect(
    useCallback(() => {
      if (user) {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setNationalId(user.nationalId);
        setPhone(user.phone);
        setEmail(user.email || '');
        setSkills(user.skills || []);
        setBiography(user.biography || '');
        setDisabilityType(user.disabilityType || '');
        setAdditionalNeeds(user.additionalNeeds || []);
        setLoading(false);
      }
    }, [user])
  );

  const handleUpdate = async () => {
    if (!user) return;

    // Validation
    if (!firstName.trim() || !lastName.trim() || !nationalId.trim() || !phone.trim()) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (user.role === 'volunteer') {
      if (skills.length === 0) {
        Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกทักษะอย่างน้อย 1 รายการ');
        return;
      }
    } else if (user.role === 'requester') {
      if (!disabilityType) {
        Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกประเภทความพิการ');
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: nationalId.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        skills: user.role === 'volunteer' ? skills : [],
        biography: user.role === 'volunteer' ? biography : '',
        disabilityType: user.role === 'requester' ? disabilityType : undefined,
        additionalNeeds: user.role === 'requester' ? additionalNeeds : [],
      });
      
      // Refresh user profile
      await refreshProfile();
      
      Alert.alert('แก้ไขโปรไฟล์เรียบร้อย', 'ข้อมูลโปรไฟล์ถูกอัปเดตแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('ไม่สามารถแก้ไขโปรไฟล์ได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={[styles.screen, styles.padHorizontal20, getDynamicTopPadding(insets.top)]}
    >
      <ScrollView
        contentContainerStyle={[styles.pt32, styles.pb64]}
        style={styles.fullWidth}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headingPrimary}>แก้ไขโปรไฟล์</Text>

        <FormField
          label="ชื่อจริง"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="ชื่อของคุณ"
        />
        <FormField
          label="นามสกุล"
          value={lastName}
          onChangeText={setLastName}
          placeholder="นามสกุลของคุณ"
        />
        <FormField
          label="เลขบัตรประชาชน"
          value={nationalId}
          onChangeText={setNationalId}
          keyboardType="numeric"
          placeholder="1234567890123"
          maxLength={13}
          editable={false}
        />
        <FormField
          label="เบอร์โทรศัพท์"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="081-234-5678"
        />
        <FormField
          label="อีเมล (ไม่บังคับ)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="example@email.com"
          autoCapitalize="none"
        />

        {user.role === 'volunteer' ? (
          <>
            <Dropdown
              label="ทักษะ"
              options={SKILL_OPTIONS}
              selectedValues={skills}
              onSelectMultiple={setSkills}
              multiple
              placeholder="เลือกทักษะของคุณ"
            />
            <FormField
              label="เกี่ยวกับคุณ"
              value={biography}
              onChangeText={setBiography}
              multiline
              numberOfLines={4}
              style={styles.textAreaSoft}
              placeholder="แนะนำตัวและบอกเกี่ยวกับคุณ..."
              helperText="ข้อมูลนี้จะแสดงในหน้าโปรไฟล์ของคุณ"
            />
          </>
        ) : (
          <>
            <Dropdown
              label="ประเภทความพิการ"
              options={DISABILITY_TYPE_OPTIONS}
              value={disabilityType}
              onSelect={setDisabilityType}
              placeholder="เลือกประเภทความพิการ"
            />
            <Dropdown
              label="ความต้องการเพิ่มเติม"
              options={ADDITIONAL_NEEDS_OPTIONS}
              selectedValues={additionalNeeds}
              onSelectMultiple={setAdditionalNeeds}
              multiple
              placeholder="เลือกความต้องการเพิ่มเติม (ถ้ามี)"
            />
          </>
        )}

        <PrimaryButton title="ยืนยัน" onPress={handleUpdate} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

