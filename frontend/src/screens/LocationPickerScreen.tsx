import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';
import { getDynamicTopPadding, styles as screenStyles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPicker'>;

export const LocationPickerScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { setSelectedLocation: setLocationContext } = useLocation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>('กำลังโหลด...');
  const [loading, setLoading] = useState(true);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตให้เข้าถึงตำแหน่งเพื่อใช้ฟีเจอร์นี้');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      const initialLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setSelectedLocation(initialLocation);
      
      // Reverse geocoding เพื่อหาที่อยู่
      await updateAddress(initialLocation.latitude, initialLocation.longitude);
      
      setLoading(false);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถดึงตำแหน่งปัจจุบันได้');
      setLoading(false);
    }
  };

  const updateAddress = async (latitude: number, longitude: number) => {
    setIsUpdatingAddress(true);
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressParts = [
          addr.street,
          addr.district,
          addr.subregion,
          addr.region,
        ].filter(Boolean);
        setAddress(addressParts.join(', ') || 'ไม่พบที่อยู่');
      } else {
        setAddress('ไม่พบที่อยู่');
      }
    } catch (error) {
      setAddress('ไม่สามารถดึงที่อยู่ได้');
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // เมื่อแผนที่เลื่อนเสร็จ (onRegionChangeComplete) ให้อัปเดตตำแหน่งและที่อยู่
  const handleRegionChangeComplete = async (region: Region) => {
    const centerLocation = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setSelectedLocation(centerLocation);
    await updateAddress(region.latitude, region.longitude);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // ส่งข้อมูลกลับผ่าน Context
      const locationData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: address || 'ไม่พบที่อยู่',
      };
      
      // เก็บข้อมูลใน Context
      setLocationContext(locationData);
      
      // goBack เพื่อกลับไปหน้าสร้างงาน (ไม่ซ้อนหน้าจอ)
      navigation.goBack();
    }
  };

  if (loading || !location) {
    return (
      <View style={[screenStyles.screen, screenStyles.centerContent, getDynamicTopPadding(insets.top)]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[screenStyles.bodyText, { marginTop: 16 }]}>กำลังโหลดแผนที่...</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={[screenStyles.screen, getDynamicTopPadding(insets.top)]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton={false}
        />
        {/* Marker ตรงกลางแผนที่แบบ Grab */}
        <View style={styles.centerMarkerContainer}>
          <View style={styles.centerMarker}>
            <View style={styles.markerPin} />
          </View>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>ที่อยู่</Text>
          {isUpdatingAddress ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.addressText}>กำลังค้นหาที่อยู่...</Text>
            </View>
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>ยกเลิก</Text>
          </TouchableOpacity>
          <PrimaryButton
            title="ยืนยัน"
            onPress={handleConfirm}
            disabled={!selectedLocation}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -15,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  centerMarker: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  markerPin: {
    width: 30,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    backgroundColor: colors.card,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 10,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: colors.text,
    minHeight: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
