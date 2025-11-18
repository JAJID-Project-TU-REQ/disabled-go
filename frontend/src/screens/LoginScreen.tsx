import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { getDynamicTopPadding, styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(nationalId.trim(), password);
    } catch (error) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={[styles.screen, styles.centered, styles.pad24, getDynamicTopPadding(insets.top)]}
    >
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>Disabled Go</Text>
        <FormField
          label="เลขบัตรประชาชน"
          autoCapitalize="none"
          keyboardType="numeric"
          value={nationalId}
          onChangeText={setNationalId}
          placeholder="1234567890123"
          maxLength={13}
        />
        <FormField
          label="รหัสผ่าน"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <PrimaryButton title="เข้าสู่ระบบ" onPress={handleLogin} loading={isLoading} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
          <Text style={[styles.link, styles.mt16]}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
