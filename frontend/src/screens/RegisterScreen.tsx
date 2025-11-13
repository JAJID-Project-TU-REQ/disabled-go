import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from '../components/Dropdown';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { RegisterPayload, useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { UserRole } from '../types';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

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

const defaultPayload: RegisterPayload = {
  role: 'volunteer',
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
  password: '',
  skills: [],
  biography: '',
  disabilityType: '',
  additionalNeeds: [],
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const [payload, setPayload] = useState<RegisterPayload>(defaultPayload);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setField = <Key extends keyof RegisterPayload>(key: Key, value: RegisterPayload[Key]) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !payload.nationalId || !payload.password || !payload.phone) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (payload.password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    if (payload.role === 'volunteer') {
      if (payload.skills.length === 0) {
        Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกทักษะอย่างน้อย 1 รายการ');
        return;
      }
    } else if (payload.role === 'requester') {
      if (!payload.disabilityType) {
        Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกประเภทความพิการ');
        return;
      }
    }

    try {
      await register({
        ...payload,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: payload.nationalId.trim(),
      });
    } catch (error) {
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    // Reset form when changing role
    setPayload({
      ...defaultPayload,
      role: newRole,
    });
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
  };

  const renderRoleButton = (role: UserRole, label: string) => {
    const isActive = payload.role === role;
    return (
      <TouchableOpacity
        key={role}
        style={[styles.roleButton, isActive && styles.roleButtonActive]}
        onPress={() => handleRoleChange(role)}
      >
        <Text style={[styles.roleButtonText, isActive && styles.roleButtonTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headingPrimary}>สมัครสมาชิก Disabled Go</Text>
        <Text style={styles.subtitle}>สมัครสมาชิกในฐานะ</Text>
        <View style={styles.roleSwitcher}>
          {renderRoleButton('volunteer', 'อาสาสมัคร')}
          {renderRoleButton('requester', 'ผู้พิการ')}
        </View>

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
          value={payload.nationalId}
          onChangeText={(text) => setField('nationalId', text)}
          keyboardType="numeric"
          placeholder="1234567890123"
          maxLength={13}
        />
        <FormField
          label="รหัสผ่าน"
          value={payload.password}
          onChangeText={(text) => setField('password', text)}
          secureTextEntry
          placeholder="••••••••"
        />
        <FormField
          label="ยืนยันรหัสผ่าน"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          helperText={confirmPassword && payload.password !== confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : undefined}
          error={confirmPassword !== '' && payload.password !== confirmPassword}
        />
        <FormField
          label="เบอร์โทรศัพท์"
          value={payload.phone}
          onChangeText={(text) => setField('phone', text)}
          keyboardType="phone-pad"
          placeholder="081-234-5678"
        />

        {payload.role === 'volunteer' ? (
          <>
            <Dropdown
              label="ทักษะ"
              options={SKILL_OPTIONS}
              selectedValues={payload.skills}
              onSelectMultiple={(values) => setField('skills', values)}
              multiple
              placeholder="เลือกทักษะของคุณ"
            />
            <FormField
              label="เกี่ยวกับคุณ"
              value={payload.biography}
              onChangeText={(text) => setField('biography', text)}
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
              value={payload.disabilityType}
              onSelect={(value) => setField('disabilityType', value)}
              placeholder="เลือกประเภทความพิการ"
            />
            <Dropdown
              label="ความต้องการเพิ่มเติม"
              options={ADDITIONAL_NEEDS_OPTIONS}
              selectedValues={payload.additionalNeeds}
              onSelectMultiple={(values) => setField('additionalNeeds', values)}
              multiple
              placeholder="เลือกความต้องการเพิ่มเติม (ถ้ามี)"
            />
          </>
        )}

        <PrimaryButton title="สร้างบัญชี" onPress={handleRegister} loading={isLoading} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
          <Text style={[styles.link, styles.mt20]}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
