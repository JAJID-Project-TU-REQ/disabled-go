import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateJob'>;

const defaultJobForm = {
  title: '',
  workDate: null as Date | null,
  startTime: null as Date | null,
  endTime: null as Date | null,
  location: '',
  description: '',
  latitude: 0,
  longitude: 0,
};

export const CreateJobScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedLocation: locationFromContext, setSelectedLocation } = useLocation();
  const [jobForm, setJobForm] = useState(defaultJobForm);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const setField = <K extends keyof typeof jobForm>(field: K, value: typeof jobForm[K]) => {
    setJobForm((prev) => ({ ...prev, [field]: value }));
  };

  // รับข้อมูลตำแหน่งที่เลือกจาก LocationPicker ผ่าน Context
  useFocusEffect(
    useCallback(() => {
      if (locationFromContext) {
        setField('location', locationFromContext.address);
        setField('latitude', locationFromContext.latitude);
        setField('longitude', locationFromContext.longitude);
        // Clear context เพื่อไม่ให้ trigger ซ้ำ
        setSelectedLocation(null);
      }
    }, [locationFromContext, setSelectedLocation, setField])
  );

  const handleSelectLocation = () => {
    navigation.navigate('LocationPicker');
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleCreateJob = async () => {
    if (!user) return;
    
    if (!jobForm.title) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกหัวข้องาน');
      return;
    }
    
    if (!jobForm.workDate) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกวันที่เข้าทำงาน');
      return;
    }
    
    if (!jobForm.startTime || !jobForm.endTime) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกเวลาเข้าทำงานและเวลาเลิกงาน');
      return;
    }
    
    if (!jobForm.location) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกสถานที่');
      return;
    }

    // แปลงวันที่เป็น YYYY-MM-DD
    const workDateStr = jobForm.workDate.toISOString().split('T')[0];
    // แปลงเวลาเป็น HH:mm
    const startTimeStr = formatTime(jobForm.startTime);
    const endTimeStr = formatTime(jobForm.endTime);

    setSubmitting(true);
    try {
      await api.createJob({
        requesterId: user.id,
        title: jobForm.title,
        description: jobForm.description || '',
        meetingPoint: jobForm.location,
        workDate: workDateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        location: jobForm.location,
        requirements: [],
        latitude: jobForm.latitude,
        longitude: jobForm.longitude,
      });
      Alert.alert('สร้างงานเรียบร้อย', 'อาสาสมัครสามารถเห็นงานของคุณแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
      setJobForm(defaultJobForm);
    } catch (error) {
      Alert.alert('ไม่สามารถสร้างงานได้', error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, styles.padHorizontal16, getDynamicTopPadding(insets.top)]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.pb64}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.createJobHeading}>สร้างงานใหม่</Text>
        
        <FormField 
          label="หัวข้องาน" 
          value={jobForm.title} 
          onChangeText={(text) => setField('title', text)} 
          placeholder="ระบุหัวข้องาน"
        />
        
        <View style={styles.fieldContainer}>
          <Text style={styles.formLabel}>วันที่เข้าทำงาน</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.pickerButtonText, !jobForm.workDate && styles.placeholder]}>
              {jobForm.workDate ? formatDate(jobForm.workDate) : 'เลือกวันที่'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={jobForm.workDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setField('workDate', selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeField}>
            <Text style={styles.formLabel}>เวลาเริ่มงาน</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={[styles.pickerButtonText, !jobForm.startTime && styles.placeholder]}>
                {jobForm.startTime ? formatTime(jobForm.startTime) : 'เลือกเวลา'}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={jobForm.startTime || new Date()}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(Platform.OS === 'ios');
                  if (selectedTime) {
                    setField('startTime', selectedTime);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.timeField}>
            <Text style={styles.formLabel}>เวลาเลิกงาน</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={[styles.pickerButtonText, !jobForm.endTime && styles.placeholder]}>
                {jobForm.endTime ? formatTime(jobForm.endTime) : 'เลือกเวลา'}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={jobForm.endTime || new Date()}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(Platform.OS === 'ios');
                  if (selectedTime) {
                    setField('endTime', selectedTime);
                  }
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.formLabel}>สถานที่</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleSelectLocation}
          >
            <Text style={[styles.locationButtonText, !jobForm.location && styles.placeholder]}>
              {jobForm.location || 'เลือกตำแหน่งบนแผนที่'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.formLabel}>รายละเอียดเพิ่มเติม</Text>
          <TextInput
            style={styles.largeTextArea}
            multiline
            numberOfLines={6}
            value={jobForm.description}
            onChangeText={(text) => setField('description', text)}
            placeholder="ระบุรายละเอียดงานเพิ่มเติม..."
            placeholderTextColor={colors.muted}
          />
        </View>

        <PrimaryButton title="ลงงาน" onPress={handleCreateJob} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
